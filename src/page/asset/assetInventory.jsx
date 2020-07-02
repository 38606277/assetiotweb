
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, message, Divider,DatePicker , Select,Icon, Form, Pagination, Row, Col, Button, Card } from 'antd';
import 'antd/dist/antd.css';
const FormItem = Form.Item;
const Option=Select.Option;
import LocalStorge from '../../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();
import HttpService from '../../util/HttpService.jsx';

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
            selected: true

        }
    };
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

        // 如果是搜索的话，需要传入搜索类型和搜索关键字
        if (this.state.listType === 'search') {
            param.keyword = this.state.searchKeyword;
        }

        param.pageNum = this.state.pageNum;
        param.perPage = this.state.perPage;
        let url = "reportServer/asset/getAssetInventory";
        HttpService.post(url, JSON.stringify(param)).then(response => {
            //message.success('加载成功');
            this.setState({
                dataList: response.data.list,
                total: response.data.total
            });
        }, errMsg => {
            localStorge.errorTips(errMsg);
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
        this.loadGatewayList();

    }
    // 搜索
    onSearch(searchKeyword) {
        let listType = searchKeyword === '' ? 'list' : 'search';
        this.setState({
            listType: listType,
            pageNum: 1,
            searchKeyword: searchKeyword
        }, () => {
            this.loadGatewayList();
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
                <Card title={<b>盘点管理</b>} extra={<span>
                    <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(true)}>查询</Button>
                    <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(false)}>重置</Button>
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
                                        {getFieldDecorator('iot_num', {
                                            rules: [{ required: true, message: '请输入物联网标签号!' }],
                                        })(
                                            <Select
                                                mode="multiple"
                                                style={{ width: '100%' }}
                                                placeholder="Please select"
                                               
                                            >
                                                <Option value="jack">石家庄</Option>
                                                <Option value="lucy">唐山</Option>
                                                <Option value="jack">保定</Option>
                                                <Option value="lucy">邯郸</Option>
                                            </Select>,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <FormItem {...formItemLayout} label="选择盘点时间">
                                        {getFieldDecorator('asset_id', {
                                            rules: [],
                                        })(
                                            <DatePicker  />
                                        )}
                                    </FormItem>
                                </Col>

                                
                            </Row>
                        </Form>
                    </Row>
                    <Row>
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
                    </Row>
                    <Table style={{ marginTop: '16px' }} dataSource={this.state.dataList} rowSelection={rowSelection} 
                     scroll={{ x: 1300 }}
                    rowKey={"gateWay_id"} pagination={false} >
                       
                        <Column
                            title="资产编号"
                            dataIndex="asset_num"
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
                            title="地址"
                            dataIndex="address"
                        />
                        <Column
                            title="接收时间"
                            dataIndex="receive_time"
                        />
                       
                        

                        <Column
                            title="动作"
                            render={(text, record) => (
                                <span>
                                    

                                </span>
                            )}
                        />
                    </Table>
                    <Pagination current={this.state.pageNum}
                        total={this.state.total}
                        onChange={(pageNum) => this.onPageNumChange(pageNum)} />

                </Card>
            </div>

        );
    }
}
export default Form.create()(assetInventory);
