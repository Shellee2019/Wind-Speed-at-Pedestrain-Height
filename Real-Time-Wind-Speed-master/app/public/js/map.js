var map;
var view;
let searchBox;
let interval;

function initMap() {
    // ol.proj.fromLonLat(coordinate , opt_projection)
    // Target projection. The default is Web Mercator, i.e. 'EPSG:3857'.
    // In this case, it will change "EPSG:4326" to "EPSG:3857"  
    var center = ol.proj.fromLonLat([121.538, 25.018]);
    //TGOS map
    var projection = ol.proj.get('EPSG:3857');
    var projectionExtent = projection.getExtent();
    var size = ol.extent.getWidth(projectionExtent) / 256;
    var resolutions = new Array(20);
    var matrixIds = new Array(20);
    for (var z = 0; z < 20; ++z) {
        // generate resolutions and matrixIds arrays for this WMTS
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
    }
    var layers = [
        new ol.layer.Group({
            'title': '底圖',
            layers: [
                new ol.layer.Tile({
                    title: '開放街圖',
                    type: 'base',
                    visible: false,
                    source: new ol.source.OSM()
                }),
                new ol.layer.Tile({
                    title: '通用版電子地圖',
                    type: 'base',
                    visible: true,
                    source: new ol.source.WMTS({
                        url: 'https://maps.nlsc.gov.tw/S_Maps/wmts',
                        layer: 'EMAP',
                        matrixSet: 'EPSG:3857',
                        format: 'image/png',
                        projection: projection,
                        tileGrid: new ol.tilegrid.WMTS({
                            origin: ol.extent.getTopLeft(projectionExtent),
                            resolutions: resolutions,
                            matrixIds: matrixIds
                        }),
                        attributions: [
                            new ol.Attribution({
                                html: '© <a href="https://maps.nlsc.gov.tw/S09SOA/">國土測繪圖資服務雲</a> 提供'
                            })
                        ]
                    })
                }),
                new ol.layer.Tile({
                    title: '正射影像圖',
                    type: 'base',
                    visible: false,
                    source: new ol.source.WMTS({
                        url: 'https://maps.nlsc.gov.tw/S_Maps/wmts',
                        layer: 'PHOTO2',
                        matrixSet: 'EPSG:3857',
                        format: 'image/png',
                        projection: projection,
                        tileGrid: new ol.tilegrid.WMTS({
                            origin: ol.extent.getTopLeft(projectionExtent),
                            resolutions: resolutions,
                            matrixIds: matrixIds
                        }),
                        attributions: [
                            new ol.Attribution({
                                html: '© <a href="https://maps.nlsc.gov.tw/S09SOA/">國土測繪圖資服務雲</a> 提供'
                            })
                        ]
                    })
                })
            ]
        })
    ];

    view = new ol.View({
        center: center,
        zoom: 15
    });

    map = new ol.Map({
        interactions: ol.interaction.defaults().extend([
            new ol.interaction.DragRotateAndZoom()
        ]),
        layers: layers,
        target: 'map',
        view: view
    });
    var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: 'legend' // Optional label for button
    });
    map.addControl(layerSwitcher);

    searchBox = new SearchBox(50, 300);
    map.addLayer(searchBox.userCircle)
}

class SearchBox {
    constructor(minRadius, maxRadius) {
        // 網格大小
        this.minRadius = minRadius
        this.maxRadius = maxRadius

        // 地圖視窗中心位置
        this.center = null;

        this.selectedStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00BDFF',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 255, 247, 0.3)'
            })
        })

        // style of user circle
        this.userCircleStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(245, 163, 112, 0.1)'
            })
        })

        this.userCircleSource = new ol.source.Vector({
            features: []
        });

        this.windStyle = ol.style.Style({

        })

        // user circle
        this.userCircle = new ol.layer.Vector({
            source: this.userCircleSource,
            style: this.userCircleStyle
        });


        this.windSource = new ol.source.Vector({
            features: []
        })
        this.windResult = new ol.layer.Vector({
            source: this.windSource,
            style: this.windStyle
        })

        // 繪圖功能
        this.draw;
        // 編輯功能
        this.modify;
        // 吸附功能
        this.snap;
        // 選取功能
        this.select;
    }

    addInteractions() {
        // 繪製功能
        this.draw = new ol.interaction.Draw({
            source: this.userCircleSource,
            type: 'Circle',
        });
        map.addInteraction(this.draw);

        // 編輯功能
        this.modify = new ol.interaction.Modify({ source: this.userCircleSource });
        map.addInteraction(this.modify);

        // 吸附功能
        this.snap = new ol.interaction.Snap({ source: this.userCircleSource });
        map.addInteraction(this.snap);

        // 選取功能
        let _this = this;
        this.select = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove,
            style: function(feature) {
                let properties = feature.getProperties()
                document.getElementById("u2").innerHTML = Math.round(properties.u2 * 100) / 100 + "&nbsp;<span>ms<sup>-1</sup></span>"
                return _this.selectedStyle
            }
        })
    }

    create() {
        let _this = this;
        this.remove();
        this.addInteractions();
        this.listenModify()

        this.draw.on('drawstart', (evt) => {
            this.userCircle.getSource().clear();
        });
        this.draw.on('drawend', (evt) => {
            let radius = evt.feature.getGeometry().getRadius()
            if (radius > _this.maxRadius) {
                evt.feature.getGeometry().setRadius(_this.maxRadius)
            }
            if (radius < _this.minRadius) {
                evt.feature.getGeometry().setRadius(_this.minRadius)
            }
        })
    }

    remove() {
        // 清除圖層內容
        this.userCircle.getSource().clear();
        this.windResult.getSource().clear();
        map.removeInteraction(this.modify);
        map.removeInteraction(this.snap);
        map.removeInteraction(this.select);
        map.removeInteraction(this.draw);
    }

    listenModify() {
        let _this = this;
        this.userCircleSource.on("changefeature", (event) => {
            // circle radius
            let radius = event.feature.getGeometry().getRadius()
                // 讓半徑保持在指定範圍內
            if (radius > _this.maxRadius) {
                event.feature.getGeometry().setRadius(_this.maxRadius)
            }
            if (radius < _this.minRadius) {
                event.feature.getGeometry().setRadius(_this.minRadius)
            }
        })
    }

    search() {
        let circle;
        if (this.userCircle.getSource().getFeatures().length === 0) {

            console.log("請繪製搜尋範圍!!!")
            document.getElementById('search-alert').style.display = 'block'
            let searchAlert = document.getElementById("search-alert");
            searchAlert.style.opacity = 1;
            clearInterval(interval)
                // setTimeout(() => {
            interval = setInterval(() => {
                searchAlert.style.opacity -= (1 - searchAlert.style.opacity * 0.9) / 25;
                if (searchAlert.style.opacity == 0) {
                    searchAlert.style.display = "none";
                    clearInterval(interval)
                }
            }, 100);
            // }, 2000);
            return;
        }
        // 讀取搜尋範圍的features並轉換為geojson wgs84回傳
        this.userCircle.getSource().getFeatures().map(feature => {
            let type = feature.getGeometry().getType();
            if (type === "Circle") {
                circle = feature.getGeometry();
            }
        })

        let circle_polygon = new ol.Feature({
            type: 'Polygon',
            geometry: ol.geom.Polygon.fromCircle(circle, 100, 90)
        });

        let userPolygon = new ol.format.GeoJSON().writeFeatureObject(circle_polygon, { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" })
            // console.log(JSON.stringify(userPolygon))
            // api路徑
        let url = "./userRequest"
        let start_time = new Date().getTime();
        // 提出請求
        fetch(url, {
                body: JSON.stringify(userPolygon),
                headers: {
                    'user-agent': 'Mozilla/4.0 MDN Example',
                    'content-type': 'application/json'
                },
                method: 'POST'
            })
            .then(res => {
                return res.json()
            })
            .then(result => {
                // 若api執行結果為成功
                if (result.status) {
                    // console.log(JSON.stringify(result.data))
                    // 讀取api回傳結果geojson(wgs84, epgs:4326)轉換為features(epgs:3857座標)進行展示
                    let targetGrids = new ol.format.GeoJSON().readFeatures(result.data)
                        // console.log(targetGrids)
                        // 成功獲取資料後，清除搜尋範圍。
                    this.remove()

                    // 展示查詢結果

                    this.windSource = new ol.source.Vector({
                        features: new ol.format.GeoJSON().readFeatures(result.data, { featureProjection: "EPSG:3857" })
                    });
                    let _this = this;
                    // TODO: 將該圖層獨立為一個class或是全域變數
                    this.windResult = new ol.layer.Vector({
                        source: this.windSource,
                        style: function(feature) {
                            let u2 = Math.round(feature.getProperties().u2 * 100) / 100
                            return _this.setGridStyle(u2)
                        }
                    });
                    map.addLayer(this.windResult)
                    map.addInteraction(this.select);
                    let end_time = new Date().getTime();
                    console.log("運行時間 = " + ((end_time - start_time) / 1000) + "s ")

                    // zoom to layer
                    let windGridExtent = this.windResult.getSource().getExtent();
                    map.getView().fit(windGridExtent, map.getSize());
                }
            })
    }

    setGridStyle(u2, strokeWidth = 1) {
        let strokeColor = 'rgba(0, 0, 0, 0)';
        let fillColor = 'rgba(0, 0, 0, 0)';
        // 依照u2數值賦予對應的顏色
        let colorList = {
            level1: {
                strokeColor: 'rgba(66, 108, 142, 1)',
                fillColor: 'rgba(66, 108, 142, 0.5)'
            },
            level2: {
                strokeColor: 'rgba(93, 179, 204, 1)',
                fillColor: 'rgba(93, 179, 204, 0.5)'
            },
            level3: {
                strokeColor: 'rgba(59, 169, 26, 1)',
                fillColor: 'rgba(59, 169, 26, 0.5)'
            },
            level4: {
                strokeColor: 'rgba(151, 237, 70, 1)',
                fillColor: 'rgba(151, 237, 70, 0.5)'
            },
            level5: {
                strokeColor: 'rgba(242, 231, 43, 1)',
                fillColor: 'rgba(242, 231, 43, 0.5)'
            },
            level6: {
                strokeColor: 'rgba(246, 199, 100, 1)',
                fillColor: 'rgba(246, 199, 100, 0.5)'
            },
            level7: {
                strokeColor: 'rgba(242, 167, 32, 1)',
                fillColor: 'rgba(242, 167, 32, 0.5)'
            },
            level8: {
                strokeColor: 'rgba(247, 109, 27, 1)',
                fillColor: 'rgba(247, 109, 27, 0.5)'
            },
            level9: {
                strokeColor: 'rgba(247, 58, 64, 1)',
                fillColor: 'rgba(247, 58, 64, 0.5)'
            },
            level10: {
                strokeColor: 'rgba(244, 1, 26, 1)',
                fillColor: 'rgba(244, 1, 26, 0.5)'
            }
        }

        if (u2 >= 0 && u2 <= 0.5) {
            strokeColor = colorList.level1.strokeColor
            fillColor = colorList.level1.fillColor
        } else if (u2 > 0.5 && u2 <= 1) {
            strokeColor = colorList.level2.strokeColor
            fillColor = colorList.level2.fillColor
        } else if (u2 > 1 && u2 <= 1.5) {
            strokeColor = colorList.level3.strokeColor
            fillColor = colorList.level3.fillColor
        } else if (u2 > 1.5 && u2 <= 2) {
            strokeColor = colorList.level4.strokeColor
            fillColor = colorList.level4.fillColor
        } else if (u2 > 2 && u2 <= 2.5) {
            strokeColor = colorList.level5.strokeColor
            fillColor = colorList.level5.fillColor
        } else if (u2 > 2.5 && u2 <= 3) {
            strokeColor = colorList.level6.strokeColor
            fillColor = colorList.level6.fillColor
        } else if (u2 > 3 && u2 <= 3.5) {
            strokeColor = colorList.level7.strokeColor
            fillColor = colorList.level7.fillColor
        } else if (u2 > 3.5 && u2 <= 4) {
            strokeColor = colorList.level8.strokeColor
            fillColor = colorList.level8.fillColor
        } else if (u2 > 4 && u2 <= 4.5) {
            strokeColor = colorList.level9.strokeColor
            fillColor = colorList.level9.fillColor
        } else if (u2 > 4.5) {
            strokeColor = colorList.level10.strokeColor
            fillColor = colorList.level10.fillColor
        }

        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: strokeColor,
                width: strokeWidth
            }),
            fill: new ol.style.Fill({
                color: fillColor
            })
        })
    }
}