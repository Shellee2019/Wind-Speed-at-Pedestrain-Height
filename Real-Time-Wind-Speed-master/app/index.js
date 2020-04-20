var express = require('express');
const userRequest = require('./model/userRequest')
var app = express();

// 需要use express.json，讓API能夠回傳JSON格式。
app.use(express.json());
// read static file from a directory named 'public'
app.use(express.static('public'));

app.post('/userRequest', async function (req, res) {
  // getTargetGrids此功能的回傳值，設計成有status及data兩個欄位，status用來判斷處理過程中是否正確(有時候雖然API沒有錯誤回傳resolve，但內容未必是妳所需要的。)
  // data則放置計算完的面資料(geojson格式)
  let result = {
    status: false,
    data: null
  }
  // 使用async await的方式(相關介紹:https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise)
  // 用以等待資料庫及相關計算處理，處理完才會往下一行程式碼執行，避免資料庫搜尋未執行完成，就回傳空的資料給使用者。
  try {
    // 使用者可以提出 HTTP POST的請求，在body中入polygon這個參數，傳入他所繪製的面資料。
    result.data = await userRequest.getTargetGrids(req.body)
    result.status = true
  }
  catch(error) {
    console.log(error)
  }

  // API回傳結果給使用者
  res.send(result)
})

app.listen(1227, function () {
  console.log('Listening on port 1227...');
});