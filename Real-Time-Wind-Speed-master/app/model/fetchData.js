/**
 * 從API獲取風速資料，並且儲存至資料庫(mariadb)。
 * 不使用class的方式，以易懂的方式進行即可。
 * 有時間再優化程式碼，先能動就好。
 */
const fetch = require('node-fetch') // npm install node-fetch --save
const mariadb = require('mariadb')  // npm install mariadb --save
const moment = require('moment')    // npm install moment --save
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    connectionLimit: 5
});
module.exports = class Data {
    CWB_A() {
        // 自動測站(1 hour)
        let url = "https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0001-001?Authorization=CWB-0E3058B7-781A-4FF7-9D71-8E2A71965DCD&downloadType=WEB&format=JSON";

        fetch(url)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                let stations_value = []; // 宣告一個放置最後所有測站數據的空間
                let location = data.cwbopendata.location;   // 所有測站資資訊

                // 僅需要儲存「時間」、「測站id」跟「風速」到資料庫中
                location.map(function (element) {
                    // 轉換時間格式及時區
                    let time = moment(element.time.obsTime).utc().format('YYYY-MM-DD HH:mm:ss');
                    let stationId = element.stationId;
                    let wind = parseFloat(element.weatherElement[2].elementValue.value);
                    // 個別測站資訊
                    let value = {
                        time: time,
                        stationId: stationId,
                        wind: wind
                    };
                    // 將個別測站資訊加到所有測站數據的空間中
                    stations_value.push(value)
                })

                // 建立資料庫連線
                pool.getConnection()
                    .then(conn => {
                        conn.query("use wind;")
                            .then((rows) => {
                                for (let i = 0; i < stations_value.length; i++) {
                                    conn.query(`
                                        insert into observations (time, station_id, wind)
                                        select ?,?,? where 
                                        (select not exists 
                                            (select * from observations o where 
                                                o.time='${stations_value[i].time}' and 
                                                o.station_id='${stations_value[i].stationId}')) = 1;`
                                        , [stations_value[i].time, stations_value[i].stationId, stations_value[i].wind])
                                        .then(rows => {
                                            if (rows.affectedRows === 1) {
                                                console.log(`自動測站 - ${stations_value[i].stationId} - ${stations_value[i].time} - 成功新增`)
                                            }
                                            else if (rows.affectedRows === 0) {
                                                console.log(`自動測站 - ${stations_value[i].stationId} - ${stations_value[i].time} - 資料已存在`)
                                            }
                                            conn.end()
                                        })
                                        .catch(err => {
                                            console.log(err)
                                            conn.destroy()
                                        })
                                }
                            })
                            .catch((err) => {
                                console.log("選擇資料庫錯誤")
                                console.log(err)
                                conn.destroy()
                            })
                    })
                    .catch(err => {
                        console.log("資料庫連線錯誤")
                        console.log(err)
                        conn.destroy()
                    })
            })
    }
    CWB_M() {
        // 局屬測站(10 minute)
        let url = "https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0003-001?Authorization=CWB-0E3058B7-781A-4FF7-9D71-8E2A71965DCD&downloadType=WEB&format=JSON";

        fetch(url)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                let stations_value = []; // 宣告一個放置最後所有測站數據的空間
                let location = data.cwbopendata.location;   // 所有測站資資訊

                // 僅需要儲存「時間」、「測站id」跟「風速」到資料庫中
                location.map(function (element) {
                    // 轉換時間格式及時區
                    let time = moment(element.time.obsTime).utc().format('YYYY-MM-DD HH:mm:ss');
                    let stationId = element.stationId;
                    let wind = parseFloat(element.weatherElement[2].elementValue.value);
                    // 個別測站資訊
                    let value = {
                        time: time,
                        stationId: stationId,
                        wind: wind
                    };
                    // 將個別測站資訊加到所有測站數據的空間中
                    stations_value.push(value)
                })

                // 建立資料庫連線
                pool.getConnection()
                    .then(conn => {
                        conn.query("use wind;")
                            .then((rows) => {
                                for (let i = 0; i < stations_value.length; i++) {
                                    conn.query(`
                        insert into observations (time, station_id, wind)
                        select ?,?,? where 
                        (select not exists 
                            (select * from observations o where 
                                o.time='${stations_value[i].time}' and 
                                o.station_id='${stations_value[i].stationId}')) = 1;`
                                        , [stations_value[i].time, stations_value[i].stationId, stations_value[i].wind])
                                        .then(rows => {
                                            if (rows.affectedRows === 1) {
                                                console.log(`局屬測站 - ${stations_value[i].stationId} - ${stations_value[i].time} - 成功新增`)
                                            }
                                            else if (rows.affectedRows === 0) {
                                                console.log(`局屬測站 - ${stations_value[i].stationId} - ${stations_value[i].time} - 資料已存在`)
                                            }
                                            conn.end()
                                        })
                                        .catch(err => {
                                            console.log(err)
                                            conn.destroy()
                                        })
                                }
                            })
                            .catch((err) => {
                                console.log("選擇資料庫錯誤")
                                console.log(err)
                                conn.destroy()
                            })
                    })
                    .catch(err => {
                        console.log("資料庫連線錯誤")
                        console.log(err)
                        conn.destroy()
                    })
            })
    }
    TP_edu() {
        // 校園測站(5 min)
        let url = "http://weather.tp.edu.tw/Ajax/jsonp/LastAllEffect.ashx?fbclid=IwAR0pCF_Rb6LUE4KhLU6mQUXQGOS_dX-le9sAJ0xZo6e7EG-YiG7sSLBY2Ik";
        fetch(url)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                if (data.ok) {
                    let stations = data.result;
                    let stations_value = [];
                    stations.map(function (element) {
                        let time = moment(element.StartTime).utc().format('YYYY-MM-DD HH:mm:ss');
                        let stationId = element.Id;
                        let wind = element.Wind;
                        // 個別測站資訊
                        let value = {
                            time: time,
                            stationId: stationId,
                            wind: wind
                        };
                        // 將個別測站資訊加到所有測站數據的空間中
                        stations_value.push(value)
                    })

                    // 建立資料庫連線
                    pool.getConnection()
                        .then(conn => {
                            conn.query("use wind;")
                                .then((rows) => {
                                    for (let i = 0; i < stations_value.length; i++) {
                                        conn.query(`
                                    insert into observations (time, station_id, wind)
                                    select ?,?,? where 
                                    (select not exists 
                                        (select * from observations o where 
                                                    o.time='${stations_value[i].time}' and 
                                                    o.station_id='${stations_value[i].stationId}')) = 1;`
                                            , [stations_value[i].time, stations_value[i].stationId, stations_value[i].wind])
                                            .then(rows => {
                                                if (rows.affectedRows === 1) {
                                                    console.log(`校園測站 - ${stations_value[i].stationId} - ${stations_value[i].time} - 成功新增`)
                                                }
                                                else if (rows.affectedRows === 0) {
                                                    console.log(`校園測站 - ${stations_value[i].stationId} - ${stations_value[i].time} - 資料已存在`)
                                                }
                                                conn.end()
                                            })
                                            .catch(err => {
                                                console.log(err)
                                                conn.destroy()
                                            })
                                    }
                                })
                                .catch((err) => {
                                    console.log("選擇資料庫錯誤")
                                    console.log(err)
                                    conn.destroy()
                                })
                        })
                        .catch(err => {
                            console.log("資料庫連線錯誤")
                            console.log(err)
                            conn.destroy()
                        })
                }
                else {
                    console.log("api return false");
                    console.log(data.msg)
                }
            })
    }

    EPA() {
        // 環保署測站(1 hour)
        let url = "http://opendata.epa.gov.tw/webapi/Data/REWIQA/?$orderby=SiteName&$skip=0&$top=1000&format=json";

        fetch(url)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                let stations = data;
                let stations_value = [];
                stations.map(function (element) {
                    let time = moment(element.PublishTime).utc().format('YYYY-MM-DD HH:mm:ss');
                    let stationId = element.SiteId;
                    let wind = (element.WindSpeed == '') ? null : parseFloat(element.WindSpeed);

                    // 個別測站資訊
                    let value = {
                        time: time,
                        stationId: stationId,
                        wind: wind
                    };
                    // 將個別測站資訊加到所有測站數據的空間中
                    stations_value.push(value)
                })

                // 建立資料庫連線
                pool.getConnection()
                    .then(conn => {
                        conn.query("use wind;")
                            .then((rows) => {
                                for (let i = 0; i < stations_value.length; i++) {
                                    conn.query(`
                                    insert into observations (time, station_id, wind)
                                        select ?,?,? where 
                                            (select not exists 
                                                (select * from observations o where 
                                                    o.time='${stations_value[i].time}' and 
                                                    o.station_id='${stations_value[i].stationId}')) = 1;`
                                        , [stations_value[i].time, stations_value[i].stationId, stations_value[i].wind])
                                        .then(rows => {
                                            if (rows.affectedRows === 1) {
                                                console.log(`環保署測站 - ${stations_value[i].stationId} - ${stations_value[i].time} - 成功新增`)
                                            }
                                            else if (rows.affectedRows === 0) {
                                                console.log(`環保署測站 - ${stations_value[i].stationId} - ${stations_value[i].time} - 資料已存在`)
                                            }
                                            conn.end()
                                        })
                                        .catch(err => {
                                            console.log(err)
                                            conn.destroy()
                                        })
                                }
                            })
                            .catch((err) => {
                                console.log("選擇資料庫錯誤")
                                console.log(err)
                                conn.destroy()
                            })
                    })
                    .catch(err => {
                        console.log("資料庫連線錯誤")
                        console.log(err)
                        conn.destroy()
                    })
            })
    }
}