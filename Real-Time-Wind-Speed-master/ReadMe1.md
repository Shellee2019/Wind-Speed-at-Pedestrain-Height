
# Wind Speed at Pedestrian Height in Real Time

## 1. Introduction
* **The visualization for wind speed at pedestrian height with high spatial resolution 10 meter offers users to look up the real time wind speed on the street scale. Using polygons wind data which are from interpolating points wind data could provide people the wind information of areas with no observations. Based on the real time wind speed, everyone could estimate the concentrations of air pollutants with the contributions of atmospheric diffusion conditions.**

## 2. Diagram Frame
#### ![Diagram Frame](./doc/images/workflow.png)
#### create with draw.io

## 3. Getting Started
#### Step 3-1. download (clone) the project
`git clone https://github.com/Shellee2019/Wind-Speed-at-Pedestrain-Height.git`
#### Step 3-2. change the current working directory to 'app' folder
`cd Real-Time-Wind-Speed/app/`
#### Step 3-3. install all used package
`npm install`

## 4. Development Tool
* **Web Server:**  Nodejs Express
* **Database:**  MariaDB
* **Map Frame:**  [OpenLayers v4.6.5](https://github.com/openlayers/openlayers/releases/tag/v4.6.5)

## 5. Analysis
* **spatial analysis:** Turf.js Modules
* **scheduled jobs:** [node-schedule](https://www.npmjs.com/package/node-schedule)

## 6. Data Source
* [自動氣象站-氣象觀測資料](https://opendata.cwb.gov.tw/dataset/observation/O-A0001-001)
* [局屬氣象站-現在天氣觀測報告](https://opendata.cwb.gov.tw/dataset/observation/O-A0003-001)
* 環保署
  * 監測數據
    * https://opendata.epa.gov.tw/api/v1/AQI?%24skip=0&%24top=1000&%24format=json  
  (環保署網頁的來源需要註冊會員，否則每日僅能透過api調用50次。)
    * https://opendata.epa.gov.tw/ws/Data/AQI/?$format=json
  * 站點資訊
    * [空氣品質監測站位置圖](https://opendata.epa.gov.tw/Data/GeoDetails/ATM00477/)
* [校園測站](http://weather.tp.edu.tw/Ajax/jsonp/LastAllEffect.ashx?fbclid=IwAR0pCF_Rb6LUE4KhLU6mQUXQGOS_dX-le9sAJ0xZo6e7EG-YiG7sSLBY2Ik)

## 7. Web GIS Result

### 7-1. UI (User Interface)

#### ![UI](./doc/images/demo0.jpg)

### 7-2. Search
* **Users could draw (click the "繪製" button) the range where they would like to know the information of wind speed.**
* **The radias of the circle is from 50 meters to 300 meters.**

#### ![Search](./doc/images/demo1.jpg)

### 7-3. Result
* **After clicking the button: "查詢", users could find the information of wind speed in this range.**
* **The color bar on the buttom shows the wind speed.**

#### ![Result](./doc/images/demo2.jpg)

## 8. Reference

* [Nodejs](https://nodejs.org/en/)
* [Express/Node introduction](https://developer.mozilla.org/zh-TW/docs/Learn/Server-side/Express_Nodejs/Introduction)
* [Turf.js](https://turfjs.org/)
* [Leaflet](https://leafletjs.com/)
* [The GeoJSON Specification (RFC 7946)](https://tools.ietf.org/html/rfc7946)
* [HERE XYZ: GeoJSON Visualizer](http://geojson.tools/)
* [氣象局測站清單](https://e-service.cwb.gov.tw/wdps/obs/state.htm)
* [中央氣象局自動氣象站觀測資料彙整](http://farmer.iyard.org/cwb/cwb.htm)
