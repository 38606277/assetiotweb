
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, message, Divider, DatePicker, Select, Icon, Form, Pagination, Row, Col, Button, Card } from 'antd';
import 'antd/dist/antd.css';
const FormItem = Form.Item;
const Option = Select.Option;
import LocalStorge from '../../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();
import HttpService from '../../util/HttpService.jsx';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import AssetService from '../../service/AssetService.jsx';
const _assetService = new AssetService();



import GatewayService from '../../service/GatewayService.jsx'
const _gatewayService = new GatewayService();
const Search = Input.Search;

const { Column, ColumnGroup } = Table;




class assetInventory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNum: 1,
            perPage: 10,
            dataList: [],
            selectedRows: [],
            selectedRowKeys: [],
            selected: true,
            cityCode: '',
            receiveTime: '',
            cityList: []

        }
    };
    componentDidMount() {
        // To disable submit button at the beginning.

        //取得城市列表
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

        // 如果是搜索的话，需要传入搜索类型和搜索关键字
        // if (this.state.listType === 'search') {
        param.cityCode = this.state.cityCode == '' ? '' : this.state.cityCode.join(",");
        param.receiveTime = this.state.receiveTime;
        // }

        param.pageNum = this.state.pageNum;
        param.perPage = this.state.perPage;
        let url = "reportServer/asset/getAssetInventory";
        HttpService.post(url, JSON.stringify(param))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.setState({
                        dataList: res.data.list,
                        total: res.data.total
                    });
                }
                else {
                    message.error(res.message);
                }

            });



    }

    onDelButtonClick() {
        if (confirm('确认删除吗？')) {

            HttpService.post('reportServer/gateway/DeleteGateway', JSON.stringify({ gatewayLines: this.state.selectedRows }))
                .then(res => {
                    if (res.resultCode == "1000") {
                        message.success("删除成功！");
                        this.loadGatewayList();
                        this.setState({ selectedRowKeys: [], selectedRows: [] });
                    }
                    else {
                        message.error(res.message);
                    }

                });
        }
    }
    refreshClick = () => {
        this.props.form.setFieldsValue({ receiveTime: '', cityCode: [] });
        this.setState({
            listType: 'list',
            pageNum: 1,
            receiveTime: '',
            cityCode: ''
        }, () => {
            this.loadGatewayList();
        });

    }
    // 搜索
    onSearchClick() {
        this.setState({
            pageNum: 1,
        }, () => {
            this.loadGatewayList();
        });
    }
    selectChange(value) {
        this.setState({
            cityCode: value
        }, () => {

        });
        this.props.form.setFieldsValue({ cityCode: value });
    }
    //选中日期设置值
    onChangeDate(date, dateString) {
        console.log(date, dateString);
        this.setState({
            receiveTime: dateString
        }, () => {

        });
        this.props.form.setFieldsValue({ receiveTime: dateString });
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


        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                console.log('selectedRowKeys changed: ', selectedRowKeys);
                console.log('selectedRows changed: ', selectedRows);
                this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
            },
        };

        return (
            <div id="page-wrapper">
                <Card title={<b>资产盘点</b>} extra={<span>
                    <Button style={{ marginLeft: '10px' }} type="primary" onClick={() => this.onSearchClick()}>查询</Button>
                    <Button style={{ marginLeft: '10px' }} onClick={() => this.refreshClick()}>重置</Button>
                    <Button href="#/asset/assetList" style={{ marginLeft: '10px' }}>导出</Button>
                </span>} >
                    <Row>
                        <Form >
                            <FormItem style={{ display: 'none' }}>
                                {getFieldDecorator('asset_id')(
                                    <Input type='text' />
                                )}
                            </FormItem>
                            <Row>
                                <Col xs={24} sm={12}>
                                    <FormItem {...formItemLayout} label="选择盘点单位">
                                        {getFieldDecorator('cityCode', {
                                            rules: [{ required: true, message: '请输入物联网标签号!' }],
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
                                        )}
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FormItem {...formItemLayout} label="选择盘点时间">
                                        {getFieldDecorator('receiveTime', {
                                            rules: [],
                                        })(
                                            <DatePicker format={'YYYY-MM-DD'} name='receiveTime'
                                                onChange={(date, dateString) => this.onChangeDate(date, dateString)} locale={locale} />
                                        )}
                                    </FormItem>
                                </Col>


                            </Row>
                        </Form>
                    </Row>
                    {/* <Row>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Button type="primary" htmlType="submit">
                                查询
                            </Button>
                            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                                清除
                             </Button>
                            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                <Icon type={this.state.expand ? 'up' : 'down'} />
                            </a>
                        </Col>
                    </Row> */}
                    <Table style={{ marginTop: '16px' }} dataSource={this.state.dataList} rowSelection={rowSelection}
                        scroll={{ x: 1300 }}
                        rowKey={"gateWay_id"} pagination={false} >

                        <Column
                            title="资产标签号"
                            dataIndex="asset_tag"
                        />
                        <Column
                            title="资产名称"
                            dataIndex="asset_name"
                        />
                        <Column
                            title="物联网编号"
                            dataIndex="iot_num"

                        />
                        <Column
                            title="网关编号"
                            dataIndex="gateway_id"

                        />
                        <Column
                            title="最后接收时间"
                            dataIndex="receive_time"
                        />
                        <Column
                            title="综资基站编号"
                            dataIndex="base_station_code"

                        />
                        <Column
                            title="综资基站名称"
                            dataIndex="base_station_name"

                        />
                        <Column
                            title="地址"
                            dataIndex="address"
                        />
                        




                    </Table>
                    <Pagination current={this.state.pageNum}
                        total={this.state.total}
                        defaultPageSize={this.state.perPage}
                        onChange={(pageNum) => this.onPageNumChange(pageNum)} />

                </Card>
            </div>

        );
    }
}
export default Form.create()(assetInventory);
