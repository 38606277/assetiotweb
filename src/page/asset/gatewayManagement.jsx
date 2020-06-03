
import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Select, Row, Col, Table, Divider, Button, Card, Input, Tree, Dropdown, Badge, Menu, Icon, message, Modal, Radio, DatePicker } from 'antd';
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'

const FormItem = Form.Item;
const Option = Select.Option;
const { TreeNode } = Tree;


const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(

    class extends React.Component {

        componentDidMount() {
            // To disable submit button at the beginning.
            this.props.form.validateFields();
        }

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

        handleSubmit = e => {
            e.preventDefault();
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({
                        visible: false
                    });
                    console.log('Received values of form: ', values);
                }
            });
        };


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
                    type="primary"
                    htmlType="submit"
                >
                    <Form layout="vertical" onSubmit={this.handleSubmit}>
                        <FormItem {...formItemLayout} label="网关编号">
                            {getFieldDecorator('gatewayId', {
                                rules: [{ required: false, message: '请输入网关编号!' }],
                            })(
                                <Input type='text' name='gatewayId' placeholder='请输入网关编号' />
                            )}
                        </FormItem>

                        <FormItem {...formItemLayout} label="网关位置">
                            {getFieldDecorator('gatewayPostion', {
                                rules: [{ required: false, message: '请选择网关位置' }],
                            })(
                                <Input.Search type='text' name='gatewayPostion' placeholder='请选择网关位置' enterButton="选择" />
                            )}
                        </FormItem>

                        <FormItem {...formItemLayout} label="扫描间隔">
                            <Select name='scanTime' style={{ width: 200 }} placeholder="请选择扫描间隔">
                                <Option value='60' >1分钟</Option>
                                <Option value='180' >3分钟</Option>
                                <Option value='300' >5分钟</Option>
                                <Option value='600' >10分钟</Option>
                                <Option value='1800' >30分钟</Option>
                                <Option value='3600' >1小时</Option>
                                <Option value='7200' >2小时</Option>
                                <Option value='14400' >4小时</Option>
                                <Option value='18000' >5小时</Option>
                                <Option value='28800' >8小时</Option>
                                <Option value='36000' >10小时</Option>
                                <Option value='43200' >12小时</Option>
                            </Select>
                        </FormItem>
                        <div style={{ marginBottom: "10px" }}>注：网关经纬度，状态等信息自动获取</div>
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
            _name: this.props.match.params.name
        };
    }


    state = {
        visible: false,
    };

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
            { title: '网关编号', dataIndex: 'code', key: 'code' },
            { title: '网关地址', dataIndex: 'address', key: 'address' },
            { title: '经度', dataIndex: 'longitude', key: 'longitude' },
            { title: '纬度', dataIndex: 'latitude', key: 'latitude' },
            { title: '资产数量', dataIndex: 'count', key: 'count' },
            {
                title: '上次扫描时间', dataIndex: 'date', key: 'date', render: (text, record, index) => {

                    return (
                        <div>2020-05-13 05:22:12</div>
                    )
                }
            },
            {
                title: '网关状态',
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
            { title: '操作', key: 'operation', render: () => <a>编辑</a> },
        ];

        const data = [];
        //for (let i = 0; i < 9; ++i) {
        data.push({
            key: 1,
            code: 'WG000011',
            address: '故宫博物院',
            longitude: '116.397854',
            latitude: '39.711121',
            count: '9',
            state: '0'
        });
        data.push({
            key: 2,
            code: 'WG000012',
            address: '北京市东城区景山前街4号',
            longitude: '115.328150',
            latitude: '39.378381',
            count: '5',
            state: '0'
        });
        data.push({
            key: 3,
            code: 'WG00001' + 3,
            address: '前门',
            longitude: '116.397851',
            latitude: '39.911922',
            count: '11',
            state: '0'
        });
        data.push({
            key: 4,
            code: 'WG00001' + 4,
            address: '国家博物馆',
            longitude: '116.408854',
            latitude: '39.923191',
            count: '21',
            state: '0'
        });
        data.push({
            key: 5,
            code: 'WG00001' + 5,
            address: '人民大会堂',
            longitude: '116.412354',
            latitude: '39.801281',
            count: '4',
            state: '0'
        });

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

                    <Button href="#/authType/authTypeInfo/null" type="primary" icon="database" style={{ marginBottom: '10px' }}>新增网关</Button>

                    <Table columns={columns} dataSource={data} pagination={false} />

                </Card>

            </div >
        )
    }
}
export default Form.create()(TreeTest);

