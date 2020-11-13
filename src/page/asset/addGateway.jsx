import React from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, Button, Card, Row, Col, Cascader } from 'antd';
import LocalStorge from '../../util/LogcalStorge.jsx';
import TextArea from 'antd/lib/input/TextArea';
const localStorge = new LocalStorge();
const FormItem = Form.Item;
const Option = Select.Option;

import GatewayService from '../../service/GatewayService.jsx'
import AreaService from '../../service/AreaService.jsx'
const _gatewayService = new GatewayService();
const _areaService = new AreaService();

class AuthTypeInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDirty: false,
            authtype_id: this.props.match.params.name,
            options: []
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleConfirmBlur = this.handleConfirmBlur.bind(this);
    }

    //初始化加载调用方法
    componentDidMount() {
        //初始化地址信息
        this.loadAreaData('CHN');

    }

    loadAreaData(code) {
        let param = {
            parentCode: code,
            maxLevel: 3
        }
        _areaService.getArea(param).then(response => {
            if (response.resultCode == "1000") {
                this.setState({
                    options: response.data,
                });
            }
            else {
                message.error(response.message);
            }

        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }


    //提交
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.address_id = values.address_array[2];
                _gatewayService.addGateway(values).then(response => {
                    alert("保存成功");
                    window.location.href = "#/gatewayManagement";
                }, errMsg => {
                    this.setState({});
                    localStorge.errorTips(errMsg);
                });
            }
        });
    }

    handleConfirmBlur(e) {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }

    onChange = (value, selectedOptions) => {
        console.log(value, selectedOptions);
    };


    loadData = selectedOptions => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;

        let param = {
            parentCode: targetOption.value,
            maxLevel: 3
        }
        _areaService.getArea(param).then(response => {


            if (response.resultCode == "1000") {
                targetOption.loading = false;
                targetOption.children = response.data;
                this.setState({
                    options: [...this.state.options],
                });
            }
            else {
                message.error(response.message);
            }


        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    };

    handleSelectChange = value => {
        console.log(value);
        this.props.form.setFieldsValue({
            scanInterval: value,
        });
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

        return (
            <div id="page-wrapper">
                <Card title={this.state.authtype_id == 'null' ? '新增网关' : '编辑网关'}>
                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col xs={24} sm={12}>
                                <FormItem {...formItemLayout} label="网关编号">
                                    {getFieldDecorator('gateway_id', {
                                        rules: [{ required: true, message: '请输入网关编号!' }],
                                    })(
                                        <Input type='text' name='gateway_id' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={12}>
                                <FormItem {...formItemLayout} label='网关位置' >
                                    {getFieldDecorator('address_array', {
                                        rules: [
                                            { type: 'array', required: true, message: '请选择网关位置' },
                                        ],
                                    })(<Cascader
                                        options={this.state.options}
                                        loadData={this.loadData}
                                        onChange={this.onChange}
                                        changeOnSelect
                                    />)}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={24} sm={12}>
                                <FormItem {...formItemLayout} label='扫描间隔' >
                                    {getFieldDecorator('scanInterval', {
                                        rules: [{ required: true, message: '请输入扫描间隔!', whitespace: true }],
                                    })(
                                        <Select name='scanInterval' style={{ width: 200 }} placeholder="请选择扫描间隔" onChange={this.handleSelectChange}>
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
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit" style={{ marginLeft: '30px' }}>保存</Button>
                            <Button href="#/gatewayManagement" type="primary" style={{ marginLeft: '30px' }}>返回</Button>
                        </FormItem>
                    </Form>
                </Card>
            </div>
        );
    }
}
export default Form.create()(AuthTypeInfo);