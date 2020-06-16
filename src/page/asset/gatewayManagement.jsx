
import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Select, Row, Col, Table, Button, Card, Input, Tree, Badge, Pagination, Modal, Divider } from 'antd';
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'

import GatewayService from '../../service/GatewayService.jsx'
const _gatewayService = new GatewayService();

const FormItem = Form.Item;
const Option = Select.Option;
const { TreeNode } = Tree;

const { confirm } = Modal;


class TreeTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDirty: false,
            _name: this.props.match.params.name,
            visible: false,
            pageNum: 1,
            perPage: 6,
            dataList: []
        };
    }
    componentDidMount() {
        // To disable submit button at the beginning.
        this.loadGatewayList();
    }

    // 页数发生变化的时候
    onPageNumChange(pageNum) {
        this.setState({
            pageNum: pageNum
        }, () => {
            this.loadGatewayList();
        });
    }
    loadGatewayList() {
        let param = {};
        param.pageNum = this.state.pageNum;
        param.perPage = this.state.perPage;
        _gatewayService.getGatewayList(param).then(response => {
            this.setState({
                dataList: response.data.list,
                total: response.data.total
            });
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }


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

    showConfirm(gatewayId) {
        let _this = this;
        confirm({
            title: '温馨提示',
            content: '确认删除网关？',
            cancelText: '取消',
            okText: '确定',
            onOk() {
                _this.deleteGateway(gatewayId);
            },
            onCancel() { },
        });
    }

    deleteGateway(gatewayId) {
        let param = { gateway_id: gatewayId };
        _gatewayService.deleteGateway(param).then(response => {
            this.loadGatewayList();
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }


    render() {

        const columns = [
            { title: '网关编号', dataIndex: 'gateway_id', key: 'gateway_id' },
            { title: '网关地址', dataIndex: 'address', key: 'address' },
            { title: '经度', dataIndex: 'lng', key: 'lng' },
            { title: '纬度', dataIndex: 'rng', key: 'rng' },
            {
                title: '网关状态',
                key: 'state',
                render: (text, record, index) => {

                    // if (record.state % 3 == 0) {
                    //     status = 'success'
                    //     desc = '正常'
                    // } else if (record.state % 3 == 1) {
                    //     status = 'warning'
                    //     desc = '警告'
                    // } else if (record.state % 3 == 2) {
                    //     status = 'error'
                    //     desc = '错误'
                    // }
                    return (
                        <span>
                            <Badge status={status} />
                            {record.state}
                        </span>
                    )
                }
            },
            {
                title: '操作', key: 'operation', render: (text, record, index) => {
                    return (
                        <span>
                            <a onClick={() => this.showConfirm(record.gateway_id)}>删除</a>
                            <Divider type="vertical" />
                            <a href={`#/gatewayBindingAsset/${record.gateway_id}`}>关联资产</a>
                        </span>
                    )
                }
            },
        ];

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
                <Card title="网关管理">
                    <Form >
                        <Row>
                            <Col xs={24} sm={12}>
                                <FormItem {...formItemLayout} label="网关编号">
                                    {getFieldDecorator('name', {
                                        rules: [{ required: false, message: '请输入网关编号!' }],
                                    })(
                                        <Input type='text' name='name' placeholder='请输入网关编号' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={12}>
                                <FormItem {...formItemLayout} label='网关状态' >
                                    {getFieldDecorator('dbtype', {
                                        rules: [{ required: false, message: '请选择网关状态!', whitespace: true }],
                                    })(
                                        <Select name='dbtype' style={{ width: 200 }} placeholder="请选择网关状态">
                                            <Option value='正常' >正常</Option>
                                            <Option value='警告' >警告</Option>
                                            <Option value='错误' >错误</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={24} sm={12}>
                                <FormItem {...formItemLayout} label='网关地址' >
                                    {getFieldDecorator('driver', {
                                        rules: [{ required: false, message: '请输入网关地址!', whitespace: true }],
                                    })(
                                        <Input type='text' name='driver' placeholder='请输入网关地址' />
                                    )}
                                </FormItem>
                            </Col>

                            <Col xs={24} sm={12}>
                                <FormItem {...tailFormItemLayout} >
                                    <Button onClick={this.showModal} type="primary" icon="search">搜索</Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>

                    <Button href="#/addGateway/null" type="primary" icon="database" style={{ marginBottom: '10px' }}>新增网关</Button>

                    <Table columns={columns} dataSource={this.state.dataList} bordered pagination={false} />
                    <Pagination
                        style={{ marginTop: '10px' }}
                        current={this.state.pageNum}
                        total={this.state.total}
                        defaultPageSize={this.state.perPage}
                        onChange={(pageNum) => this.onPageNumChange(pageNum)} />
                </Card>

            </div >
        )
    }
}
export default Form.create()(TreeTest);

