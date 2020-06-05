
import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Select, Row, Col, Table, Divider, Button, Card, Input, Tree, Dropdown, Badge, Menu, Icon, message, Modal, Radio } from 'antd';
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'

import GatewayService from '../../service/GatewayService.jsx'
import AreaService from '../../service/AreaService.jsx'
const _gatewayService = new GatewayService();
const _areaService = new AreaService();

const FormItem = Form.Item;
const Option = Select.Option;
const { TreeNode } = Tree;

const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
    // eslint-disable-next-line
    class extends React.Component {

        addGateway() {
            let param = {
                gatewayNumber: '1319100003'
            }

            _gatewayService.addGateway(JSON.stringify(param)).then((response) => {
                console.log(response.data)
            }, (errMsg) => {
                console.log(errMsg)
            });


        }

        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;

            const formItemLayout2 = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 4 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 16 },
                },
            };

            const formItemLayout = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 4 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 20 },
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
                <Modal
                    visible={visible}
                    title="新增网关"
                    okText="确认"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={() => this.addGateway()}
                >
                    <Form layout="vertical">
                        <FormItem {...formItemLayout} label="网关编号">
                            {getFieldDecorator('name', {
                                rules: [{ required: false, message: '请输入网关编号!' }],
                            })(
                                <Input type='text' name='name' placeholder='请输入网关编号' />
                            )}
                        </FormItem>

                        <FormItem {...formItemLayout} label="网关地址">
                            {getFieldDecorator('address', {
                                rules: [{ required: false, message: '请输入网关地址!' }],
                            })(
                                <Input type='text' name='address' placeholder='请输入网关地址' />
                            )}
                        </FormItem>

                        <div style={{ marginBottom: "10px" }}>注：经纬度，状态等信息自动获取</div>


                        <FormItem {...formItemLayout} label="标签号">
                            {getFieldDecorator('code', {
                                rules: [{ required: false, message: '请输资产标签号或物联网标签号!' }],
                            })(
                                <Input.Search type='text' name='code' placeholder='请输资产标签号或物联网标签号' enterButton="添加" />
                            )}
                        </FormItem>


                    </Form>
                </Modal>
            );
        }
    },
);

class TreeTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDirty: false,
            _name: this.props.match.params.name,
            treeData: [

            ]
        };
    }
    componentDidMount() {
        this.loadAreaData('CHN');
    }

    loadAreaData(code) {
        let param = {
            parentCode: code,
            maxLevel: 3
        }
        _areaService.getArea(param).then(response => {
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

            console.log(treeNode);
            let param = {
                parentCode: treeNode.props.dataRef.value,
                maxLevel: 3
            }
            _areaService.getArea(param).then(response => {
                treeNode.props.dataRef.children = response;
                this.setState({
                    treeData: [...this.state.treeData],
                });
                resolve();
            }, errMsg => {
                localStorge.errorTips(errMsg);
            });


            // setTimeout(() => {
            //     treeNode.props.dataRef.children = [
            //         { label: 'Child Node', value: `${treeNode.props.eventKey}-0` },
            //         { label: 'Child Node', value: `${treeNode.props.eventKey}-1` },
            //     ];
            //     this.setState({
            //         treeData: [...this.state.treeData],
            //     });
            //     resolve();
            // }, 1000);
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


    showModal = () => {
        console.log('点击新增')
        this.setState({ visible: true });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

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
                        { value: 3, name: '正常', itemStyle: { color: '#52c41a' } },
                        { value: 3, name: '警告', itemStyle: { color: '#faad14' } },
                        { value: 3, name: '错误', itemStyle: { color: '#f5222d' } },

                    ],
                }
            ]
        }
        return option;
    }


    render() {

        const columns = [
            { title: '资产标签', dataIndex: 'barCode', key: 'barCode' },
            { title: '物联网标签', dataIndex: 'electronicLabel', key: 'electronicLabel' },
            { title: '资产名称', dataIndex: 'assetFirstname', key: 'assetFirstname' },
            { title: '生产厂商', dataIndex: 'productor', key: 'productor' },
            { title: '规格型号', dataIndex: 'model', key: 'model' },
            // { title: '资产类别编号', dataIndex: 'typeCode', key: 'typeCode' },
            { title: '资产类别描述', dataIndex: 'typeName', key: 'typeName' },
            {
                title: '状态',
                key: 'state',
                render: (text, record, index) => {
                    let status = 'success'
                    let desc = '正常'
                    if (record.state % 3 == 0) {
                        status = 'success'
                        desc = '正常'
                    } else if (record.state % 3 == 1) {
                        status = 'warning'
                        desc = '警告'
                    } else if (record.state % 3 == 2) {
                        status = 'error'
                        desc = '错误'
                    }
                    return (
                        <span>
                            <Badge status={status} />
                            {desc}
                        </span>
                    )
                }
            },
            // { title: '状态更新时间', dataIndex: 'updateDate', key: 'updateDate' },

        ];
        const data = [];
        for (let i = 0; i < 9; ++i) {
            data.push({
                key: i,
                "assetType": "预转资资产",
                "assetCode": "",
                "barCode": "303724G00056570" + i,
                "electronicLabel": "DZ300029102" + i,
                "newBarCode": "",
                "assetFirstname": "TD-LTE专用直放站",
                "assetLastname": "TD-LTE专用直放站",
                "productor": "华为",
                "model": "GSM900 LTE（F/A/D）",
                "amount": 1,
                "unit": "个",
                "appDomainCode": "01",
                "appDomainName": "营业用",
                "typeCode": "01.02-03-02-02.0000",
                "typeName": "TD-LTE专用直放站",
                "state": i,
                "updateDate": '2014-12-24 23:12:00',

            });
        }

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
                        <Tree loadData={this.onLoadData}>{this.renderTreeNodes(this.state.treeData)}</Tree>
                    </Col>
                    <Col xs={24} sm={20}>
                        <Card title="裕华路1号仓库设备信息">

                            <div style={{ marginBottom: '40px', height: '240px' }}>

                                <ReactEcharts style={{ float: 'right', width: '400px', height: '240px', marginRight: '100px' }} option={this.getOption()} />
                                <h1 style={{ marginBottom: '40px' }}>WG000014</h1>
                                <h3>河北省石家庄长安区裕华路 <img style={{ width: '15px', height: '24px' }} src={require("./../../asset/map.png")} /></h3>

                            </div>

                            <Button onClick={this.showModal} type="primary" icon="database" style={{ marginBottom: '10px' }}>新增</Button>

                            <CollectionCreateForm
                                wrappedComponentRef={this.saveFormRef}
                                visible={this.state.visible}
                                onCancel={this.handleCancel}
                                onCreate={this.handleCreate}
                            />
                            <Table columns={columns} dataSource={data} pagination={false} />

                        </Card>
                    </Col>
                </Row>
            </div >
        )
    }
}
export default Form.create()(TreeTest);

