const mariadb = require('mariadb');
const fs = require('fs');
const moment = require('moment')
const turf = require("@turf/turf")

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
            .then((rows) => {
                console.log(rows);
                return conn.query(`
                select 
                    s.stationId,
                    s.stationName,
                    s.x,
                    s.y,
                    s.type,
                    s.amsl,
                    s.a,
                    s.z0,
                    o.wind,
                    MAX(o.time) as time
                from stations as s LEFT JOIN observations as o ON 
                    s.stationId = o.station_id and
                    o.time > CURRENT_TIMESTAMP - INTERVAL 60 MINUTE
                group by stationId;
                `);
            })
            .then((res) => {
                // 宣告一個featureCollection
                let stations = {
                    "type": "FeatureCollection",
                    "features": []
                }

                // for寫法
                for (let i = 0; i < res.length; i++) {
                    let station = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                res[i].x,
                                res[i].y
                            ]
                        },
                        "properties": {
                            "stationId": res[i].stationId,
                            "stationName": res[i].stationName,
                            "type": res[i].type,
                            "amsl": res[i].amsl,
                            "a": res[i].a,
                            "z0": res[i].z0,
                            "wind": res[i].wind,
                            "u100": res[i].wind * Math.pow(100 / res[i].amsl, res[i].a),
                            "time": moment(res[i].time).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss')
                        }
                    }
                    stations.features.push(station)
                }
                var options = { gridType: 'square', property: 'u100', units: 'meters' };
                // let start_time = new Date().getTime();
                var idw = turf.interpolate(stations, 50, options);
                // 這一份idw圖層所生產的時間
                // let end_time = new Date().getTime();
                // console.log("運行時間 = " + ((end_time - start_time) / 1000) + "s ")
                let time = moment().utc().format('YYYY-MM-DD HH:mm:ss');

                let total = idw.features.length
                let max = total // 所有數量
                let amount = Math.floor(max / 10) // 每一次執行的數量
                let start = 0; // 開始的位置
                let end = amount; // 結束的位置

                // 第一次呼叫進行第一次匯入的動作，傳入連線物件、資料及初始值設定
                importData(conn, idw.features, time, start, end, amount, max)
                conn.end();
            })
            .catch(err => {
                console.log(err);
                conn.end();
            })
    });


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
let importData = function(conn, grids, time, start, end, amount, max) {
        if (end > max) {
            console.log("執行完畢!")
            return;
        }
        console.log(`開始 = ${start}`)
        console.log(`結束 = ${end}`)
        console.log(`每次運行 = ${amount}`)
        console.log(`終點 = ${max}`)
        let allData = []
        for (let i = start; i < end; i++) {
            let data = [i, grids[i].properties.u100, JSON.stringify(grids[i].geometry), time]
            allData.push(data)
        }
        conn.batch("insert into idw(gid, u100, grid, time) values(?, ?, ST_GeomFromGeoJSON(?), ?)", allData)
            .then(res => {
                console.log(`下一次起點 = ${end}`)
                console.log(`下一次終點 = ${end + amount}`)
                return importData(conn, grids, time, end, end + amount, amount, max)
            })
    }
    // let importData = function (conn, grids, time, start, end, amount, max) {
    //     // count用來紀錄該批次運行的總數
    //     let count = 0;
    //     console.log(`開始 = ${start}`)
    //     console.log(`結束 = ${end}`)
    //     console.log(`每次運行 = ${amount}`)
    //     console.log(`終點 = ${max}`)


//     for (let i = start; i < end; i++) {
//         if (i == max) {
//             console.log("執行完畢!")
//             break;
//         }
//         conn.query(`insert into idw (gid, u100, grid, time)
//         values (?, ?, ST_GeomFromGeoJSON(?), ?);`,
//             [i, grids[i].properties.u100, JSON.stringify(grids[i].geometry), time])
//             .then(rows => {
//                 if (rows.affectedRows === 1) {
//                     // console.log(`成功新增一筆網格中心點`)
//                     count++;
//                     if (count == amount) {
//                         // 這一批所有資料運行完畢，進行下一批資料的匯入。
//                         // 更新"下一次的起始位置"為"該次的結束位置"
//                         // 更新"下一次的結束位置"為"該次結束位置"加上"每批次執行總數"
//                         console.log(`下一次起點 = ${end}`)
//                         console.log(`下一次終點 = ${end + amount}`)
//                         return importData(conn, grids, time, end, end + amount, amount, max)
//                     }
//                 }
//             })
//             .catch(err => {
//                 console.log(err)
//                 conn.end()
//             })
//     }
// }