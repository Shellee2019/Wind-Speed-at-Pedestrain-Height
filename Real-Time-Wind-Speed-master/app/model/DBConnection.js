const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  connectionLimit: 5
});

/**
  getConnection() 會回傳一個Promise的物件，來顯示這一次的連線成功或是失敗。

  非同步函數的執行，我們可以確保事前的先後順序，
  以此範例進行介紹，若資料庫連線成功，才進行動作A，動作A若成功才進行動作B，
  每一個動作均有可能成功或是失敗，因此透過then和catch進行處理。
*/
pool.getConnection()
  .then(conn => {
    // 若資料庫連線成功要做的事情放這邊
    // 我們想做的動作是，選擇要使用的資料庫(use wind;)。
    conn.query("use wind;")
      .then((rows) => {
        // rows: 該次query的回傳rows
        console.log(rows) // { affectedRows: 0, insertId: 0, warningStatus: 0 }

        // 選擇我們要使用的資料庫成功後，我們想做的動作是，執行某個query。
        conn.query("select * from observation;")
          .then(rows => {
            console.log(rows);
          })
          .catch(err => {
            console.log("執行的query錯誤")
            console.log(err)
          })
      })
      .catch((err) => {
        console.log("選擇資料庫錯誤")
        console.log(err)
      })
  })
  .catch(err => {
    console.log("資料庫連線錯誤")
    console.log(err)
  })

/**
 * 將資料庫query寫成function以重複使用，回傳一個promise。
 */


// class Database {
//   constructor(config) {
//     this.pool = mariadb.createPool(config)
//   }

//   query(sql, values) {
//     return new Promise((resolve, reject) => {
//       this.pool.getConnection()
//         .then(connection => {
//           connection.query(sql, values)
//             .then(rows => {
//               resolve(rows)
//             })
//             .catch(error => {
//               // Database query fail
//               reject(error)
//             }) 
//           })
//           .catch(error => {
//             // Failed to connect to database
//             reject(error)
//         })
//     })
//   }
// }

// module.exports = Database;