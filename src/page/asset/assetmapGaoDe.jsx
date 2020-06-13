import React, { Component } from 'react';
import { Card, Row, Col, Icon, Skeleton, Avatar, Input, Button } from 'antd';
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
            address: '北京市东城区景山前街4号',
            addressImg: 'report/upload/20190320/165211/jz1.jpg',
            assetList: [
            ],
            dataList: [],
            collapsed: false,
        }
    }

    componentDidMount() {
        this.init();
    }

    loadGatewayList() {
        let param = {};

        _gatewayService.getGatewayListAll(param).then(response => {
            this.setState({
                dataList: response.data,
            });
            this.initMapData(this.map, this.AMap);
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





    initMapData = (map, AMap) => {
        map.clearMap();
        let _this = this;
        for (var i = 0; i < this.state.dataList.length; i++) {
            // 创建一个 Marker 实例：
            let gatewayItem = this.state.dataList[i];
            var marker = new AMap.Marker({
                position: new AMap.LngLat(gatewayItem.lng, gatewayItem.rng),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: gatewayItem.address
            });

            marker.on('click', function (e) {
                console.log(gatewayItem)
                _this.getAddr(gatewayItem, e);
            });
            // 将创建的点标记添加到已有的地图实例：
            map.add(marker);
        }
    }

    init = () => {

        //初始化地图
        AMapLoader.load({
            "key": "38109451268a4a1356c4a3320f251ace",   // 申请好的Web端开发者Key，首次调用 load 时必填
            "version": "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            "plugins": []  //插件列表
        }).then((AMap) => {
            this.AMap = AMap;
            this.map = new AMap.Map('mapContainer', {
                center: [116.404, 39.915],
                zoom: 13
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
                            <Input addonAfter={
                                <span>
                                    <Button style={{ width: '40px', border: '0px', borderRadius: '0px' }} onClick={this.togglePanel} icon="thunderbolt" />
                                    <Button type="primary" style={{ width: '40px', border: '0px', borderRadius: '0px' }} icon="search" />
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