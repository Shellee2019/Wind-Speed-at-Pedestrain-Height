const fs = require("fs")
const mariadb = require('mariadb');

// 讀取檔案 (該份geojson檔案過大，因此不上傳github。)
const rawdata = fs.readFileSync("../data/AMSL/AMSL150_size10_Z0_WGS84_z02.geojson")
const z0 = JSON.parse(rawdata)

// 資料庫連線設定
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    timezone: 'utc',
    connectionLimit: 10
});

pool.getConnection()
    .then(conn => {
        conn.query("use wind;")
            .then(async rows => {
                let grids = z0.features;
                let total = grids.length
                let max = total                     // 所有數量
                let amount = Math.floor(max / 10)   // 每一次執行的數量
                let start = 0;                      // 開始的位置
                let end = amount;                   // 結束的位置

                // 第一次呼叫進行第一次匯入的動作，傳入連線物件、資料及初始值設定
                importData(conn, grids, start, end, amount, max)

                // // 簡易測試少筆資料輸入至資料庫
                // let grids = z0.features;
                // for(let i = 0; i < 100; i++) {
                //     conn.query(`
                //     insert into z0 (value, grid) value(?, ST_GeomFromGeoJSON(?));`,
                //     [grids[i].properties.z0, JSON.stringify(grids[i].geometry)])
                //     .then(rows => {
                //         if (rows.affectedRows === 1) {
                //             console.log("成功新增一筆網格")
                //         }
                //     })
                //     .catch(err => {
                //         // query失敗
                //         console.log(err)
                //         conn.end()
                //     })
                // }
                conn.end();
            })
            .catch(err => {
                // 選擇資料庫失敗
                console.log(err)
                conn.end()
            })
    })
    .catch(err => {
        // 資料庫連線失敗
        console.log(err)
        conn.end()
    })


/**
 * 由於單次運行140多萬筆的數據新增至資料庫，會超出nodejs的記憶體限制。
 * 因此利用Promise非同步的機制，於每次query成功後，判斷當前執行的數量，
 * 每當此批次的數量全部完成後，將會以遞迴(recursive)的方式持續進行，直到執行總數到達數據的總筆數。
 * 
 * @param {object} conn 資料庫連線物件
 * @param {object} grids 網格資料(geojson)
 * @param {int} start 迴圈起始位置
 * @param {int} end 迴圈停止位置
 * @param {int} amount 每批次執行次數
 * @param {int} max 執行的總數
 */
let importData = function (conn, grids, start, end, amount, max) {
    // count用來紀錄該批次運行的總數
    let count = 0;
    console.log(`開始 = ${start}`)
    console.log(`結束 = ${end}`)
    console.log(`每次運行 = ${amount}`)
    console.log(`終點 = ${max}`)

    // start為該批次起始位置，end為該批次結束的位置
    for (let i = start; i < end; i++) {
        // 判斷是否所有數據均完成匯入資料庫的動作 (位置 = max - 1)
        if (i == max) {
            console.log("執行完畢!")
            break;
        }
        // 將z0及geometry匯入資料庫
        conn.query(`
            insert into SurfaceRoughness (value, grid) value(?, ST_GeomFromGeoJSON(?));`,
            [grids[i].properties.a_unstable, JSON.stringify(grids[i].geometry)])
            .then(rows => {
                if (rows.affectedRows === 1) {
                    // 成功新增一筆網格, count加1。
                    count++;
                    if (count == amount) {
                        // 這一批所有資料運行完畢，進行下一批資料的匯入。
                        // 更新"下一次的起始位置"為"該次的結束位置"
                        // 更新"下一次的結束位置"為"該次結束位置"加上"每批次執行總數"
                        console.log(`下一次起點 = ${end}`)
                        console.log(`下一次終點 = ${end + amount}`)
                        return importData(conn, grids, end, end+amount, amount, max)
                    }
                }
            })
            .catch(err => {
                // query失敗
                console.log(err)
                conn.end()
            })
    }
}