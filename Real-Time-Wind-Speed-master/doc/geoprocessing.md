# 空間處理與分析

## 需求

將資料庫中所儲存的風速資料，抓取近90分鐘(**這個時間未定案**)最新一筆(如何確保API資訊不准時更新)，經過計算後獲得一份IDW圖層，並儲存回資料庫中，等待使用者進行請求時，再拿出來進行處理。

## 流程圖

待補

- - -

## 流程說明

### 1. 篩選出最新的風速資訊

於資料庫篩選出所有`測站名單`內`近90分鐘`的`最新一筆`風速監測數據

```sql
SELECT
    s.stationId,
    s.stationName,
    s.x,
    s.y,
    s.type,
    s.amsl,
    o.wind,
    MAX(o.time) AS time
FROM
    stations AS s
LEFT JOIN
    observation AS o
ON
    s.stationId = o.station_id AND
    o.time > CURRENT_TIMESTAMP - INTERVAL 60 MINUTE
GROUP BY stationId;
```

於時間計算的部份

```sql
o.time > CURRENT_TIMESTAMP - INTERVAL 60 MINUTE
```

等同於

```sql
o.time > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 60 MINUTE)
```

> 相關補充

* [LEFT JOIN 關鍵字 (SQL LEFT JOIN Keyword) - 左外部連接](https://www.fooish.com/sql/left-outer-join.html)
* [MariaDB - JOIN Syntax](https://mariadb.com/kb/en/library/join-syntax/)
* [MariaDB - MAX](https://mariadb.com/kb/en/library/max/)
* [MariaDB - DATE_SUB](https://mariadb.com/kb/en/library/date_sub/)
* [MariaDB - GROUP BY](https://mariadb.com/kb/en/library/group-by/)

- - -

### 2. 將風速資料處理成Geojson

座標系統: WGS84

> 相關補充

* [MariaDB - JSON Functions](https://mariadb.com/kb/en/library/json-functions/)
* [The GeoJSON Format](https://tools.ietf.org/html/rfc7946)
  
### 3. 於資料庫拿出z0圖層

事先透過QGIS將shp轉換為geojson匯入資料庫中

> 相關補充

* [MariaDB - JSON Functions](https://mariadb.com/kb/en/library/json-functions/)
* [ST_AsGeoJSON](https://mariadb.com/kb/en/library/geojson-st_asgeojson/)
* [ST_GeomFromGeoJSON](https://mariadb.com/kb/en/library/st_geomfromgeojson/)

### 4. 風速測站點位與z0圖層進行交集

會產生出一個新的圖層(geojson)，屬性資料包含風速及粗糙長度的資訊。

> 相關補充

* [Turf.js - intersect](https://turfjs.org/docs/#intersect)
* [Turf.js - tag](https://turfjs.org/docs/#tag)

### 5. 將風速高度計算到100公尺(power law)

### 6. 以IDW將點位進行內插

> 相關補充

* [Turf.js - interpolate](https://turfjs.org/docs/#interpolate)
* [Turf.js - squareGrid](https://turfjs.org/docs/#squareGrid)

> 相關補充

### 7. 將IDW成果儲存回資料庫中

以geojson進行

> 相關補充

* [ST_AsGeoJSON](https://mariadb.com/kb/en/library/geojson-st_asgeojson/)
* [ST_GeomFromGeoJSON](https://mariadb.com/kb/en/library/st_geomfromgeojson/)

- - -

### 使用者繪製目標範圍並返回行人高度風速資訊

* 使用openlayer (v4.6.5)進行地圖繪製功能的開發
* 將使用者所繪製的面資料準為geojson(有可能不需要轉換，待確認。)
* 透過`http post`將使用者所繪製的面資料傳給server進行處理。
* 將使用者的面資料與最新的IDW圖層進行`intersect`
* 計算高度`兩公尺`的z0
* 回傳結果給使用者

### 成果的網格資料

* 網格展示依照數值進行顏色設定(若`z0小於2`時顏色為`透明`並且`限制點擊`)

## 問題

* 圖層座標問題 (proj4)

    A: 統一以epsg:4326(wgs84)進行

* 展示座標問題 (proj4)

    A: 統一以epsg:3857(網路麥卡托投影, 900913)進行

* 建築、植被圖層何時會使用到？資料庫amsl？

    A: z0圖層會儲存於資料庫

* IDW製作好後要用什麼格式儲存回資料庫？geometry or geojson?

    A: 將geojson格式在資料庫中以geometry的格式儲存，透過ST_AsGeoJSON及ST_GeomFromGeoJSON進行輸入輸出。

* 兩階段的詳細處理過程均為何？

    A: 於上述以整理
