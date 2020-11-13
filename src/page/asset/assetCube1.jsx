import React from 'react';
import ReactDOM from 'react-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Table,
    Spin,
    Input,
    message,
    Divider,
    Upload,
    DatePicker,
    Select,
    Pagination,
    Row,
    Col,
    Button,
    Card,
} from 'antd';
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
            assetCube: [],
            cityList: [],
            loading: false



        }

    }
    componentDidMount() {
        // 查询地市
        let url = "reportServer/assetquery/getCityCode";
        HttpService.post(url, JSON.stringify({ parentCode: '13' }))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.setState({ cityList: res.data });
                }
                else {
                    message.error(res.message);
                }

            });

       

    }

    selectChange(value) {
        this.setState({
            cityCode: value
        }, () => {

        });
        this.props.form.setFieldsValue({ cityCode: value });
    }
    // 搜索
    onSearchClick() {
            this.loadAssetCube1();
    }

    loadAssetCube1() {
        let param = {};
        param.cityCode = this.state.cityCode == '' ? '' : this.state.cityCode.join(",");
        // }
       
        let url1 = "reportServer/assetquery/getAssetCube1";
        this.setState({loading:true});
        HttpService.post(url1, JSON.stringify(param))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.setState({
                        assetCube: res.data,
                        loading:false
                    });
                }
                else {
                    message.error(res.message);
                    this.setState({
                        loading:false
                    });
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
                <Card title={<b>资产效益分析</b>} bodyStyle={{padding:'0px'}} extra={<span>
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
                                            rules: [],
                                        })(
                                            <Select
                                                mode="multiple"
                                                style={{ width: '100%' }}
                                                placeholder="Please select"
                                                onChange={(value) => this.selectChange(value)}
                                            >

                                                {this.state.cityList.map(city => (
                                                    <Option value={city.city_code}>{city.city_code}</Option>
                                                ))}


                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                


                            </Row>
                        </Form>
                    </Row>

                </Card>
                <Spin spinning={this.state.loading} delay={500}>
                    <PivotTableUI
                        data={this.state.assetCube}
                        onChange={s => this.setState(s)}
                        {...this.state}
                    />
                  </Spin>
            </div>
        );
    }
}
export default Form.create()(assetCube1);
