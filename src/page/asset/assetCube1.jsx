import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Input, message, Divider, Upload, DatePicker, Select, Icon, Form, Pagination, Row, Col, Button, Card } from 'antd';
import 'antd/dist/antd.css';
const FormItem = Form.Item;
const Option = Select.Option;



import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import HttpService from '../../util/HttpService.jsx';

// see documentation for supported input formats
const data = [['attribute', 'attribute2'], ['value1', 'value2']];
class assetCube1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            assetCube: []


        }

    }
    componentDidMount() {

        let url = "reportServer/area/getCityByProvince";
        HttpService.post(url, JSON.stringify({ parentCode: '13' }))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.setState({ cityList: res.data });
                }
                else {
                    message.error(res.message);
                }

            });

        let url = "reportServer/assetquery/getAssetCube1";
        HttpService.post(url, JSON.stringify({}))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.setState({
                        assetCube: res.data,
                    });
                }
                else {
                    message.error(res.message);
                }

            });

    }





    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            },
        };
        const formItemLayout1 = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };

        return (
            <div>
                <Card title={<b>资产效益分析</b>}  extra={<span>
                    <Button style={{ marginLeft: '10px' }} type="primary" onClick={() => this.onSearchClick()}>查询</Button>
                    <Button style={{ marginLeft: '10px' }} onClick={() => this.refreshClick()}>重置</Button>
                    <Button onClick={() => this.excel()} style={{ marginLeft: '10px' }}>导出</Button>
                </span>} >
                    <Row>
                        <Form >
                            <FormItem style={{ display: 'none' }}>
                                {getFieldDecorator('asset_id')(
                                    <Input type='text' />
                                )}
                            </FormItem>
                            <Row>
                                <Col xs={24} sm={8}>
                                    <FormItem {...formItemLayout} label="选择地市">
                                        {getFieldDecorator('cityCode', {
                                            rules: [{ required: true, message: '选择地市!' }],
                                        })(
                                            <Select
                                                mode="multiple"
                                                style={{ width: '100%' }}
                                                placeholder="Please select"
                                                onChange={(value) => this.selectChange(value)}
                                            >

                                                {this.state.cityList.map(city => (
                                                    <Option value={city.code}>{city.name}</Option>
                                                ))}


                                            </Select>,



                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <FormItem {...formItemLayout} label="选择盘点时间">
                                        {getFieldDecorator('receiveTime', {
                                            rules: [],
                                        })(
                                            <DatePicker format={'YYYY-MM-DD'} name='receiveTime'
                                                onChange={(date, dateString) => this.onChangeDate(date, dateString)} />
                                        )}
                                    </FormItem>
                                </Col>


                            </Row>
                        </Form>
                    </Row>

                </Card>
                <PivotTableUI
                    data={this.state.assetCube}
                    onChange={s => this.setState(s)}
                    {...this.state}
                />
            </div>
        );
    }
}
export default Form.create()(assetCube1);
