const mariadb = require('mariadb')
const moment = require('moment')
const turf = require('@turf/turf')

// 將function進行輸出，提供其他檔案進行引入使用。
module.exports.getTargetGrids = function (targetPolygon) {
    const pool = mariadb.createPool({
        host: 'localhost',
        user: 'root',
        password: '12345678',
        timezone: 'utc',
        connectionLimit: 10
    });
    let targetGrids;

    // 我們自行定義一個promise，提供API調用此function時，確定資料庫搜尋及相關計算確實完成。(非同步執行)
    // resolve => 成功後要回傳的內容
    // reject => 失敗後要回傳的內容
    return new Promise((resolve, reject) => {
        pool.getConnection()
            .then(conn => {
                conn.query("use wind")
                    .then(rows => {
                        conn.query(`
                        select
                            AVG(u100) as u100,
                            SurfaceRoughness.value as value,
                            ST_AsGeojson(SurfaceRoughness.geometry) as geometry,
                            time
                        from 
                        (
                            select
                                gid,
                                u100,
                                time,
                                grid as geometry
                            from
                                idw
                            where
                                time = (select time from idw order by time desc limit 1) and
                                ST_INTERSECTS(ST_GEOMFROMGEOJSON(?), grid)
                        ) as idw,
                        (
                            select
                                id,
                                value,
                                grid as geometry
                            from
                                SurfaceRoughness
                            where
                                ST_INTERSECTS(ST_GEOMFROMGEOJSON(?), grid)
                        ) as SurfaceRoughness
                        where
                            ST_INTERSECTS(idw.geometry, SurfaceRoughness.geometry)
                        group by SurfaceRoughness.id;
                        `, [JSON.stringify(targetPolygon), JSON.stringify(targetPolygon)])
                            .then(res => {
                                // 將所有的網格(feature)都放入FeatureCollection中
                                targetGrids = {
                                    "type": "FeatureCollection",
                                    "features": []
                                }
                                // 迴圈讀出從資料庫篩選出來的所有資料
                                for (let i = 0; i < res.length; i++) {
                                    // json出來需要parse
                                    // time欄位轉為東八區以做展示
                                    let grid = {
                                        "type": "Feature",
                                        "geometry": JSON.parse(res[i].geometry),
                                        "properties": {
                                            "u2": res[i].u100 * Math.pow(0.02, res[i].value),
                                            // "SurfaceRoughness": res[i].value,
                                            "time": moment(res[i].time).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss')
                                        }
                                    }
                                    // 將feature加入features
                                    targetGrids.features.push(grid)
                                }

                                resolve(targetGrids)
                                conn.release();
                                conn.end();
                                pool.end()
                            })
                            .catch(err => {
                                console.log("query select錯誤")
                                console.log(err);
                                conn.release();
                                conn.end();
                                reject(err)
                            })
                    })
                    .catch(err => {
                        console.log("選擇資料庫錯誤")
                        console.log(err);
                        conn.release();
                        conn.end();
                        reject(err)
                    })
            })
            .catch(err => {
                console.log("資料庫連線錯誤")
                reject(err)
            })
    })
};