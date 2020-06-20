
import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Select, Row, Col, Table, Divider, Button, Card, Input, Tree, Dropdown, Badge, Menu, Icon, message, Modal, Radio, Pagination } from 'antd';
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'

import HttpService from '../../util/HttpService.jsx';
import GatewayService from '../../service/GatewayService.jsx'
import AssetService from '../../service/AssetService.jsx';
import AreaService from '../../service/AreaService.jsx'
const _gatewayService = new GatewayService();
const _areaService = new AreaService();
const _assetService = new AssetService();

const { Column, ColumnGroup } = Table;
const { TreeNode } = Tree;

class TreeTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDirty: false,
            _name: this.props.match.params.name,
            treeData: [],
            selectedKeys: [],
            total: 0,
            pageNum: 1,
            perPage: 10,
            assetList: [],
            gatewayData: {
                address_id: '',
                rng: '',
                address: '暂无',
                lng: '',
                gateway_id: '暂无',
            }
        };
    }
    componentDidMount() {
        this.loadAreaData('13');
    }

    loadAreaData(code) {
        let param = {
            parentCode: code,
            maxLevel: 3
        }
        _areaService.getGatewayArea(param).then(response => {
            this.setState({
                treeData: response,
            });
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }

    onLoadData = treeNode =>
        new Promise(resolve => {
            if (treeNode.props.children) {
                resolve();
                return;
            }
            let maxLevel = 3
            console.log(treeNode);
            if (treeNode.props.dataRef.level < maxLevel) { //小于则查询地点
                let param = {
                    parentCode: treeNode.props.dataRef.value,
                    maxLevel: maxLevel
                }
                _areaService.getGatewayArea(param).then(response => {
                    treeNode.props.dataRef.children = response;
                    this.setState({
                        treeData: [...this.state.treeData],
                    });
                    resolve();
                }, errMsg => {
                    localStorge.errorTips(errMsg);
                });
            } else {

                let param = {
                    address_id: treeNode.props.dataRef.value,
                }
                _gatewayService.treeGatewayByAddressId(param).then(response => {
                    treeNode.props.dataRef.children = response;
                    this.setState({
                        treeData: [...this.state.treeData],
                    });
                    resolve();
                }, errMsg => {
                    localStorge.errorTips(errMsg);
                });


            }
        });

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children) {
                return (
                    <TreeNode title={item.label} key={item.value} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.value} title={item.label} {...item} dataRef={item} />;
        });

    onSelect = (selectedKeys, info) => {

        if (info.selectedNodes[0].props.dataRef.isGateway) { //点击的是否为网关 
            this.state.gateway_id = info.selectedNodes[0].props.dataRef.value;
            this.setState({ gateway_id: info.selectedNodes[0].props.dataRef.value });

            HttpService.post("reportServer/gateway/getGatewayById", JSON.stringify({ gateway_id: info.selectedNodes[0].props.dataRef.value }))
                .then(res => {
                    if (res.resultCode == "1000") {
                        this.setState({
                            gatewayData: res.data
                        });
                    }
                    else
                        message.error(res.message);

                });

            this.loadAssetList();
        }

    };


    // 页数发生变化的时候
    onPageNumChange(pageNum) {
        this.setState({
            pageNum: pageNum
        }, () => {
            this.loadAssetList();
        });
    }
    loadAssetList() {
        let param = {};
        param.pageNum = this.state.pageNum;
        param.perPage = this.state.perPage;
        param.gateway_id = this.state.gateway_id;
        _assetService.listEamAssetPageByGatewayId(param).then(response => {
            this.setState({
                assetList: response.data.list,
                total: response.data.total
            });
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }


    handleCreate = () => {
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            console.log('Received values of form: ', values);
            form.resetFields();
            this.setState({ visible: false });
        });
    };



    saveFormRef = formRef => {
        this.formRef = formRef;
    };
    getOption = () => {
        let option = {
            title: {
                text: '资产状态',
                x: 'center'
            },
            tooltip: {
                trigger: 'item',
                //提示框浮层内容格式器，支持字符串模板和回调函数形式。
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                top: 20,
                right: 5,
                data: ['正常', '警告', '错误']
            },
            series: [
                {
                    name: '资产数量',
                    type: 'pie',
                    data: [
                        { value: this.state.assetList.length, name: '正常', itemStyle: { color: '#52c41a' } },
                        { value: 0, name: '警告', itemStyle: { color: '#faad14' } },
                        { value: 0, name: '错误', itemStyle: { color: '#f5222d' } },
                    ],
                }
            ]
        }
        return option;
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };





        return (
            <div id="page-wrapper">
                <Row>
                    <Col xs={24} sm={4}>
                        <div class="ant-card-head"><div class="ant-card-head-wrapper"><div class="ant-card-head-title">设备位置</div></div></div>
                        <Tree loadData={this.onLoadData} onSelect={this.onSelect}>{this.renderTreeNodes(this.state.treeData)}</Tree>
                    </Col>
                    <Col xs={24} sm={20}>
                        <Card title="网关信息">

                            <div style={{ marginBottom: '40px', height: '240px' }}>

                                <ReactEcharts style={{ float: 'right', width: '400px', height: '240px', marginRight: '100px' }} option={this.getOption()} />
                                <h1 style={{ marginBottom: '40px' }}>{this.state.gatewayData.gateway_id}</h1>
                                <h3>{this.state.gatewayData.address} <img style={{ width: '15px', height: '24px' }} src={require("./../../asset/map.png")} /></h3>

                            </div>

                            {/* <Button onClick={this.showModal} type="primary" icon="database" style={{ marginBottom: '10px' }}>新增</Button> */}

                            <Table dataSource={this.state.assetList} rowKey={"asset_id"} pagination={false} >
                                <Column
                                    title="资产ID"
                                    dataIndex="asset_id"
                                />
                                <Column
                                    title="物联网标签号"
                                    dataIndex="iot_num"
                                />
                                <Column
                                    title="资产编号"
                                    dataIndex="asset_num"
                                />
                                <Column
                                    title="资产名称"
                                    dataIndex="asset_name"
                                />
                                {/* <Column
                                    title="动作"
                                    render={(text, record) => (
                                        <span>
                                            <a href={`#/asset/assetEdit/update/${record.asset_id}`}>编辑</a>
                                        </span>
                                    )}
                                /> */}
                            </Table>
                            <Pagination current={this.state.pageNum}
                                total={this.state.total}
                                onChange={(pageNum) => this.onPageNumChange(pageNum)} />

                        </Card>
                    </Col>
                </Row>
            </div >
        )
    }
}
export default Form.create()(TreeTest);

