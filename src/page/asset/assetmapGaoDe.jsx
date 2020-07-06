import React, { Component } from 'react';
import { Card, Row, Col, Icon, Skeleton, Avatar, Input, Button, Popover, Progress, Tag, Modal, Form } from 'antd';
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



class assetampGaoDe extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lng: this.props.match.params.lng ? this.props.match.params.lng : 114.5220818442,
            lat: this.props.match.params.lat ? this.props.match.params.lat : 38.0489583146,
            actoinZoom: this.props.match.params.lng ? true : false,
            map: null,
            AMap: null,
            panelDisplay: 'none',
            gateway_id: '',
            address: '',
            addressImg: '',
            assetList: [
            ],
            dataList: [],
            collapsed: false,
            listType: 'list',
            searchKeyword: null,
            cluster: null,
            markers: [],
            showDetailFromList: false
        }
    }

    componentDidMount() {
        this.init();
    }

    loadGatewayList() {
        let param = {};
        let _this = this;

        // 如果是搜索的话，需要传入搜索类型和搜索关键字
        let isSearch = this.state.listType === 'search'
        if (isSearch) {
            param.keyword = this.state.searchKeyword;
        }

        _gatewayService.listEamGatewayByMap(param).then(response => {
            if (response.resultCode == '1000') {
                _this.setState({
                    dataList: response.data,
                    showDetail: false
                });

                //搜索后定位至第一个
                if (0 < response.data.length) {
                    let AMap = this.state.AMap;
                    this.state.map.setZoom(10) // [3,19]
                    this.state.map.panTo(new AMap.LngLat(response.data[0].lng, response.data[0].rng));
                }


                _this.initMapData(_this.state.map, _this.state.AMap);

                if (isSearch && _this.state.panelDisplay == 'none') {
                    _this.setState(
                        {
                            panelDisplay: 'block',
                        }
                    )
                }
            } else {
                localStorge.errorTips(response.message);
            }


        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }

    onGatewayItemClick = (gateway) => {
        this.setState({
            showDetailFromList: true
        })
        this.getAddr(gateway);
        let AMap = this.state.AMap;
        this.state.map.setZoom(13) // [3,19]
        this.state.map.panTo(new AMap.LngLat(gateway.lng, gateway.rng));

    }

    getAddr = (gateway) => {
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
                gateway_id: gateway.gateway_id,
                address: gateway.address,
                addressImg: gateway.image,
                assetList: response.data,
                showDetail: true,
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
        console.log("onValueChange", e.target);
        let name = e.target.name,
            value = e.target.value.trim();
        this.setState({ [name]: value });
        //this.props.form.setFieldsValue({ [name]: value });
    }

    initMapData = (map, AMap) => {
        console.log('initMapData')
        map.clearMap();
        this.state.markers = [];
        let _this = this;
        for (var i = 0; i < this.state.dataList.length; i++) {
            // 创建一个 Marker 实例
            let gatewayItem = this.state.dataList[i];
            let marker = new AMap.Marker({
                position: new AMap.LngLat(gatewayItem.lng, gatewayItem.rng),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: gatewayItem.address
            });

            marker.on('click', function (e) {
                console.log(gatewayItem)
                _this.setState({
                    showDetailFromList: false
                })
                _this.getAddr(gatewayItem);
            });


            // 将创建的点标记添加到已有的地图实例：
            //map.add(marker);

            this.state.markers.push(marker);

            if (this.state.cluster) {
                this.state.cluster.setMap(null);
            }
            if (this.state.listType === 'search') {
                this.state.cluster = new AMap.MarkerClusterer(map, this.state.markers, { gridSize: 60, maxZoom: 10 });
            } else {
                this.state.cluster = new AMap.MarkerClusterer(map, this.state.markers, { gridSize: 60, maxZoom: 18 });
            }


        }
    }

    zoomend = () => {
        console.log('zoomend 当前等级', this.state.map.getZoom())
    }

    init = () => {
        console.log("初始位置：", this.state.lng, this.state.lat)
        //初始化地图
        AMapLoader.load({
            "key": "034f37e988d8a97079766539387a6a0b",   // 申请好的Web端开发者Key，首次调用 load 时必填
            // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            "plugins": ['AMap.MarkerClusterer']  //插件列表
        }).then((AMap) => {
            this.state.AMap = AMap;
            this.state.map = new AMap.Map('mapContainer', {
                center: [this.state.lng, this.state.lat],
                zoom: this.state.actoinZoom ? 12 : 7,// [3,19]
                resizeEnable: true,
            });

            this.loadGatewayList();
            //this.initMapData(map, AMap);
            this.state.map.on('zoomend', this.zoomend);


        }).catch(e => {
            console.log(e);
        })
    }

    handlePreviewCancel = () => this.setState({ previewVisible: false });

    handlePreview = imageName => {
        this.setState({
            previewImage: `${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=${imageName}`,
            previewVisible: true,
        });
    };

    render() {
        return (
            <div className="address" style={{ height: '800px', width: '100%' }}>
                <Card bodyStyle={{ padding: '0px' }} style={{ float: "left", width: "100%", padding: '0px' }}>
                    <div id="mapContainer" style={{ height: '800px' }}></div>
                </Card>

                <Card
                    bodyStyle={{ padding: '0px', fontSize: '12px' }}
                    headStyle={{ textAlign: 'center', backgroundColor: '#3385FF', color: '#FFF' }}
                    style={{ fontSize: '12px', position: "absolute", top: "10px", left: "10px", padding: '0px', width: "320px" }}>

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

                        {
                            this.state.showDetail ?
                                (
                                    <div>

                                        {this.state.showDetailFromList ? (<Row>
                                            <div style={{ color: '#0e89f5' }} onClick={() => {
                                                this.setState({
                                                    showDetail: false
                                                })
                                            }}> 返回</div>
                                        </Row>
                                        ) : (<span />)
                                        }


                                        <Row>
                                            <Col span={24}><img onClick={() => {
                                                window.location.href = `#/asset/gatewayEdit/update/${this.state.gateway_id}`
                                            }} src={`${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=${this.state.addressImg}`} style={{ height: '100px', width: '100%' }} /></Col>
                                        </Row>
                                        <Row style={{ height: '40px', marginTop: '10px', marginLeft: '10px' }}>
                                            <Col span={24} ><Icon type='bank' style={{ marginRight: '8px' }} />

                                                <a href={`#/asset/assetEdit/update/${this.state.gateway_id}`}>
                                                    {this.state.address}
                                                </a>

                                            </Col>
                                        </Row>
                                        <Row style={{ height: '40px', marginLeft: '30px', color: '#0e89f5' }}>
                                            <Col span={8}><Icon type='setting' style={{ marginRight: '8px' }} />详细</Col>
                                            <Col span={8}><Icon type='tag' style={{ marginRight: '8px' }} />分离</Col>
                                            <Col span={8}><Icon type='pushpin' style={{ marginRight: '8px' }} onClick={() => this.props.history.push('/asset/assetEdit/create/0')} />新增</Col>
                                        </Row>

                                        <div style={{ height: '350px', overflow: 'auto' }} ref={(ref) => this.scrollParentRef = ref} >
                                            <List
                                                bodyStyle={{ padding: '5px', fontSize: '14px', backgroundColor: '#ffffcc' }}
                                                style={{ padding: '5px' }}
                                                dataSource={this.state.assetList}
                                                renderItem={item => (
                                                    <List.Item

                                                        actions={[]}
                                                    >
                                                        <List.Item.Meta style={{ fontSize: '12px' }}
                                                            avatar={
                                                                <Avatar onClick={() => this.handlePreview(item.image)} src={`${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=${item.image}`} />
                                                            }
                                                            title={
                                                                <div>
                                                                    <a href={`#/asset/assetEdit/update/${item.asset_id}`}>
                                                                        {item.asset_name}
                                                                    </a>

                                                                    <Tag style={{ float: 'right' }} color={item.tag_id == null ? 'gray' : 'green'}>{item.tag_id == null ? '未关联' : '正常'}</Tag>
                                                                    <img src={require("./../../asset/wifi.png")}></img>
                                                                </div>
                                                            }
                                                            description={<div>
                                                                {item.asset_tag}<br />
                                                                {item.iot_num}<br />
                                                                {item.electricity != null &&
                                                                    (<div>电压：{item.electricity}V<br /></div>)
                                                                }

                                                                {item.receive_time != null &&
                                                                    (<div> 更新于：{item.receive_time}<br /></div>)
                                                                }
                                                            </div>

                                                            }
                                                        />

                                                    </List.Item>
                                                )}
                                            />
                                        </div>
                                    </div>

                                ) : (
                                    <div style={{ height: '350px', overflow: 'auto' }} ref={(ref) => this.scrollParentRef = ref} >
                                        <List
                                            bodyStyle={{ padding: '5px', fontSize: '14px', backgroundColor: '#ffffcc' }}
                                            style={{ padding: '5px' }}
                                            dataSource={this.state.dataList}
                                            renderItem={item => (
                                                <List.Item
                                                    onClick={() => this.onGatewayItemClick(item)}
                                                    actions={[]}
                                                    extra={
                                                        <img
                                                            width={80}
                                                            alt="image"
                                                            src={`${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=${item.image}`}
                                                            onClick={() => this.handlePreview(item.image)}
                                                        />
                                                    }
                                                >
                                                    <List.Item.Meta style={{ fontSize: '12px' }}

                                                        title={
                                                            <div style={{ color: '#3385ff' }}>
                                                                {item.gateway_id}
                                                            </div>
                                                        }
                                                        description={<div>

                                                            关联资产：{item.assetCount}<br />

                                                            {item.address}
                                                        </div>
                                                        }
                                                    />

                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                )


                        }
                    </Card>
                </Card>


                <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handlePreviewCancel}>
                    <img alt="图片" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>

            </div >
        )
    }
}
export default Form.create()(assetampGaoDe);
