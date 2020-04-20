/**
    main.js 呼叫所有於Server端運行的功能

    1. 定期排程獲取四個不同來源API的風速資料，並儲存至資料庫中。
    2. 定期排程去資料庫中撈取出近10分鐘所有測站的最新一筆監測資料，並計算成IDW儲存回資料庫。
*/

// TODO: 建立log檔案儲存API調用及儲存資訊

const schedule = require('node-schedule');    // npm install node-schedule --save
const Data = require('./fetchData.js')

// data是一個物件，從Data類別製作出來的，new是一個動詞。
let data = new Data();
// 個別依照需求以不同的排程進行呼叫
 
// 每5分鐘更新一次校園測站
// ..., 51, 56, 1, 6, 11, 16, 21, ...
var minute_5 = schedule.scheduleJob('1-59/5 * * * *', function(){
    // 每5分鐘更新一次
    data.TP_edu()
    console.log(new Date() + " 校園測站更新完畢")
});

// 每10分鐘更新一次局屬測站
// 1, 11, 21, 31, 41, 51, 1, ...
var minute_10 = schedule.scheduleJob('1-59/10 * * * *', function(){
    // 每10分鐘更新一次
    data.CWB_M()
    console.log(new Date() + " 局屬測站更新完畢")
});

// 從5分開始每25分鐘更新一次自動測站跟epa測站
// 5, 30, 55, 5, ...
var minute_25 = schedule.scheduleJob('5-59/25 * * * *', function(){
    // 每一小時更新一次
    data.CWB_A()
    console.log(new Date() + " 自動測站更新完畢")
    data.EPA()
    console.log(new Date() + " 環保署測站更新完畢")
});

data.EPA()
data.CWB_M()
data.TP_edu()
data.CWB_A()

