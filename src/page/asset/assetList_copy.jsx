
import React from 'react';
import { Link } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Select,
    Row,
    Col,
    Table,
    Divider,
    Button,
    Card,
    Input,
    Tree,
    Dropdown,
    Badge,
    Menu,
    message,
    Modal,
    Radio,
} from 'antd';
import { DatabaseOutlined, MinusCircleTwoTone, PlusCircleTwoTone, SearchOutlined } from '@ant-design/icons';
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

const FormItem = Form.Item;
const Option = Select.Option;
const { TreeNode } = Tree;

const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
    // eslint-disable-next-line
    class extends React.Component {
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
                    onOk={onCreate}
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


                        <FormItem {...formItemLayout2} label="标签号">
                            {getFieldDecorator('code', {
                                rules: [{ required: false, message: '请输资产标签号或电子标签号!' }],
                            })(
                                <div>
                                    <Input type='text' name='code' style={{ width: '80%' }} placeholder='请输资产标签号或电子标签号' />
                                    <Button type="primary">添加</Button>
                                </div>
                            )}
                        </FormItem>


                    </Form>
                </Modal>
            );
        }
    },
);



const expandedRowRender = () => {
    const columns = [
        { title: '资产标签', dataIndex: 'barCode', key: 'barCode' },
        { title: '电子标签', dataIndex: 'electronicLabel', key: 'electronicLabel' },
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
        { title: '状态更新时间', dataIndex: 'updateDate', key: 'updateDate' },

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
    return <Table columns={columns} dataSource={data} pagination={false} />;
}


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

        const columns = [
            { title: '网关编号', dataIndex: 'code', key: 'code' },
            { title: '网关地址', dataIndex: 'address', key: 'address' },
            { title: '经度', dataIndex: 'longitude', key: 'longitude' },
            { title: '纬度', dataIndex: 'latitude', key: 'latitude' },
            { title: '资产数量', dataIndex: 'count', key: 'count' },
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
        // }

        const city = [
            { name: '北京市', district: [{ name: "东城区", addressList: [{ name: '天安门' }, { name: '王府井' }] }, { name: "海定区" }] },
        ];


        return (
            <div id="page-wrapper">
                <Row>
                    <Col xs={24} sm={4}>
                        <div class="ant-card-head"><div class="ant-card-head-wrapper"><div class="ant-card-head-title">设备位置</div></div></div>
                        <Tree
                        >
                            <TreeNode title="河北省" key="0-0">
                                <TreeNode title="东城区" key="0-0-0" >
                                    <TreeNode title="王府井" key="0-0-0-0" />
                                    <TreeNode title="天安门" key="0-0-0-1" />
                                </TreeNode>
                                <TreeNode title="海定区" key="0-0-1">
                                    <TreeNode title={<span style={{ color: '#1890ff' }}>sss</span>} key="0-0-1-0" />
                                </TreeNode>
                            </TreeNode>
                        </Tree>
                    </Col>
                    <Col xs={24} sm={20}>
                        <Card title="设备管理">
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
                                            <Button onClick={this.showModal} type="primary" icon={<SearchOutlined />}>搜索</Button>
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>

                            <Button onClick={this.showModal} type="primary" icon={<DatabaseOutlined />} style={{ marginBottom: '10px' }}>新增</Button>

                            <CollectionCreateForm
                                wrappedComponentRef={this.saveFormRef}
                                visible={this.state.visible}
                                onCancel={this.handleCancel}
                                onCreate={this.handleCreate}
                            />

                            <Table
                                className="components-table-demo-nested"
                                columns={columns}
                                expandedRowRender={expandedRowRender}
                                dataSource={data}
                            />
                        </Card>
                    </Col>
                </Row>
            </div >
        );
    }
}
export default Form.create()(TreeTest);

