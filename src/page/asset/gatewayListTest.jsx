
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, message, Form, Pagination, Row, Col, Button, Card, Modal, Divider } from 'antd';
import 'antd/dist/antd.css';
import LocalStorge from '../../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();
import HttpService from '../../util/HttpService.jsx';

import AssetService from '../../service/AssetService.jsx';
const _assetService = new AssetService();



import GatewayService from '../../service/GatewayService.jsx'
const _gatewayService = new GatewayService();
const Search = Input.Search;

const { Column, ColumnGroup } = Table;




export default class gatewayListTest extends React.Component {
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
        HttpService.post('reportServer/test/gateway/listEamGateway', JSON.stringify(param)).then(response => {
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

            HttpService.post('reportServer/test/gateway/DeleteGateway', JSON.stringify({ gatewayLines: this.state.selectedRows }))
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
    handlePreviewCancel = () => this.setState({ previewVisible: false });

    handlePreview = imageName => {
        this.setState({
            previewImage: `${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=thumbnail_${imageName}`,
            previewVisible: true,
        });
    };

    render() {

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
                <Card title={<b>网关管理</b>} >
                    <Row>
                        <Col xs={24} sm={12}>
                            <Search
                                style={{ maxWidth: 300, marginBottom: '10px' }}
                                placeholder="请输入..."
                                enterButton="查询"
                                onSearch={value => this.onSearch(value)}
                            />
                        </Col>
                        <Col xs={24} sm={12}>
                            <Button disabled={this.state.selectedRowKeys.length > 0 ? false : true} onClick={() => this.onDelButtonClick()} style={{ float: "right", marginRight: "10px" }}  >删除</Button>
                            <Button href="#/asset/gateWayEditTest/create/0" style={{ float: "right", marginRight: "10px" }} type="primary">新建网关</Button>
                        </Col>
                    </Row>
                    <Table dataSource={this.state.dataList} rowSelection={rowSelection} rowKey={"gateWay_id"} pagination={false} >

                        <Column
                            title="网关编号"
                            dataIndex="gateway_id"
                        />

                        <Column
                            title="动作"
                            render={(text, record) => (
                                <span>
                                    <a href={`#/asset/gatewayEditTest/update/${record.gateway_id}`}>查看</a>
                                </span>
                            )}
                        />
                    </Table>
                    <Pagination current={this.state.pageNum}
                        total={this.state.total}
                        defaultPageSize={this.state.perPage}
                        onChange={(pageNum) => this.onPageNumChange(pageNum)} />

                </Card>
                <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handlePreviewCancel}>
                    <img alt="图片" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>
            </div>

        );
    }
}
