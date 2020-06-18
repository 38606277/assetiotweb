import React, { Component } from 'react';
import { Card, Row, Col, Icon, Skeleton, Avatar, Input, Button, Popover } from 'antd';
import { List, Typography } from 'antd';
import AMapLoader from '@amap/amap-jsapi-loader';
import './assetmap.css';
import gg from './../../asset/gg.png';
import bikepng from '../../asset/bike.jpg';
import { Resizable, ResizableBox } from 'react-resizable';
import "babel-polyfill";
import GatewayService from '../../service/GatewayService.jsx'
import AssetService from '../../service/AssetService.jsx'
import LocalStorge from '../../util/LogcalStorge.jsx';
import { addTraces } from 'plotly.js';

const localStorge = new LocalStorge();
const _gatewayService = new GatewayService();
const _assetService = new AssetService();


const url = window.getServerUrl();



class assetmap extends Component {

    constructor(props) {
        super(props);
        this.state = {
            map: null,
            AMap: null,
            panelDisplay: 'none',
            address: '',
            addressImg: '',
            assetList: [
            ],
            dataList: [],
            collapsed: false,
            listType: 'list',
            searchKeyword: null,
            cluster: null,
            markers: []
        }
    }

    componentDidMount() {
        this.init();
    }

    loadGatewayList() {
        let param = {};

        // 如果是搜索的话，需要传入搜索类型和搜索关键字
        if (this.state.listType === 'search') {
            param.keyword = this.state.searchKeyword;
        }

        _gatewayService.getGatewayListAll(param).then(response => {
            this.setState({
                dataList: response.data,
            });
            this.initMapData(this.state.map, this.state.AMap);
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }

    getAddr = (gateway, e) => {
        if (this.state.panelDisplay == 'none') {
            this.setState(
                {
                    panelDisplay: 'block',
                }
            )
        }

        //获取网关下的资产数据

        let param = { gateway_id: gateway.gateway_id };
        _assetService.getEamAssetListByGatewayId(param).then(response => {

            this.setState({
                address: gateway.address,
                addressImg: gateway.addressImg,
                assetList: response.data
            })
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }
    // 搜索
    onSearch(searchKeyword) {
        let listType = searchKeyword === '' ? 'list' : 'search';
        this.setState({
            listType: listType,
            searchKeyword: searchKeyword
        }, () => {
            this.loadGatewayList();
        });
    }

    togglePanel = () => {
        if (this.state.panelDisplay != 'none') {
            this.setState(
                {
                    panelDisplay: 'none',
                }
            )
        } else {
            this.setState(
                {
                    panelDisplay: 'block',
                }
            )

        }
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        }, function () {
            this.props.callbackParent(this.state.collapsed);
        });

    }

    //编辑字段对应值
    onValueChange(e) {
        let name = e.target.name,
            value = e.target.value.trim();
        this.setState({ [name]: value });
        this.props.form.setFieldsValue({ [name]: value });
    }

    initMapData = (map, AMap) => {
        console.log('initMapData')
        map.clearMap();
        this.state.markers = [];
        let _this = this;
        for (var i = 0; i < this.state.dataList.length; i++) {
            // 创建一个 Marker 实例：
            let gatewayItem = this.state.dataList[i];
            let marker = new AMap.Marker({
                position: new AMap.LngLat(gatewayItem.lng, gatewayItem.rng),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: gatewayItem.address
            });


            // let infoWindow = new AMap.InfoWindow({
            //     isCustom: true,  //使用自定义窗体
            //     content: _this.createInfoWindow(gatewayItem),
            //     offset: new AMap.Pixel(16, -45)
            // });

            //鼠标点击marker弹出自定义的信息窗体
            // AMap.event.addListener(marker, 'click', function () {
            //     console.log(`点击标注物${marker.getPosition()}`)
            //     //infoWindow.open(map, marker.getPosition());

            // });


            marker.on('click', function (e) {
                console.log(gatewayItem)
                _this.getAddr(gatewayItem, e);
            });


            // 将创建的点标记添加到已有的地图实例：
            //map.add(marker);
            this.state.markers.push(marker);
        }
        if (this.state.cluster) {
            this.state.cluster.setMap(null);
        }
        new AMap.MarkerClusterer(map, this.state.markers, { gridSize: 80 });

    }

    createInfoWindow(gatewayItem) {

        return (<div>1111111</div>)
    }


    closeInfoWindow() {
        map.clearInfoWindow();
    }


    init = () => {

        //初始化地图
        AMapLoader.load({
            "key": "38109451268a4a1356c4a3320f251ace",   // 申请好的Web端开发者Key，首次调用 load 时必填
            // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            "plugins": ['AMap.MarkerClusterer']  //插件列表
        }).then((AMap) => {
            this.state.AMap = AMap;
            this.state.map = new AMap.Map('mapContainer', {
                center: [116.404, 39.915],
                zoom: 7,
                resizeEnable: true,
            });
            this.loadGatewayList();
            //this.initMapData(map, AMap);

        }).catch(e => {
            console.log(e);
        })
    }

    render() {
        return (
            <div className="address" style={{ height: '800px', width: '100%' }}>

                <Card bodyStyle={{ padding: '0px' }} style={{ float: "left", width: "100%", padding: '0px' }}>
                    <div id="mapContainer" style={{ height: '650px' }}></div>
                </Card>
                <Card
                    bodyStyle={{ padding: '0px', fontSize: '12px' }}
                    headStyle={{ textAlign: 'center', backgroundColor: '#3385FF', color: '#FFF' }}
                    style={{ fontSize: '12px', position: "absolute", top: "10px", left: "10px", padding: '0px', width: "280px" }}>

                    <Row>
                        <Col span={24}>
                            <Input name='searchContent' onChange={(e) => this.onValueChange(e)} addonAfter={
                                <span>
                                    <Button style={{ width: '40px', border: '0px', borderRadius: '0px' }} onClick={this.togglePanel} icon="thunderbolt" />
                                    <Button type="primary" style={{ width: '40px', border: '0px', borderRadius: '0px' }} icon="search" onClick={() => this.onSearch(this.state.searchContent)} />
                                </span>
                            }></Input>
                        </Col>
                    </Row>
                    <Card style={{ display: this.state.panelDisplay }} bodyStyle={{ padding: '5px', fontSize: '12px' }} >

                        <Row>
                            <Col span={24}><img src={url + this.state.addressImg} style={{ height: '100px', width: '100%' }} /></Col>
                        </Row>
                        <Row style={{ height: '40px', marginTop: '10px', marginLeft: '10px' }}>
                            <Col span={24} ><Icon type='bank' style={{ marginRight: '8px' }} />{this.state.address}</Col>
                        </Row>
                        <Row style={{ height: '40px', marginLeft: '30px', color: '#0e89f5' }}>
                            <Col span={8}><Icon type='setting' style={{ marginRight: '8px' }} />详细</Col>
                            <Col span={8}><Icon type='tag' style={{ marginRight: '8px' }} />分离</Col>
                            <Col span={8}><Icon type='pushpin' style={{ marginRight: '8px' }} />新增</Col>
                        </Row>

                        <List

                            bodyStyle={{ padding: '5px', fontSize: '14px' }}
                            style={{ padding: '5px' }}
                            dataSource={this.state.assetList}
                            renderItem={item => (
                                <List.Item

                                    actions={[]}
                                >
                                    <List.Item.Meta style={{ fontSize: '12px' }}
                                        avatar={
                                            <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                                        }
                                        title={<a href="">{item.asset_name}</a>}
                                        description={item.asset_num}
                                    />

                                </List.Item>
                            )}
                        />
                    </Card>
                </Card>

            </div>
        )
    }
}
export default assetmap;