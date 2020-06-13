
import React from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Pagination, Card, Row, Col, Button } from 'antd';
import 'antd/dist/antd.css';
import LocalStorge from '../../util/LogcalStorge.jsx';
import AssetService from '../../service/AssetService.jsx';
import GatewayService from '../../service/GatewayService.jsx'
const Search = Input.Search;
const localStorge = new LocalStorge();
const _assetService = new AssetService();
const _gatewayService = new GatewayService();


class GatewayBindingAsset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gateway_id: this.props.match.params.name,
            pageNum: 1,
            perPage: 6,
            dataList: [],
            editingKey: '',
            selectedRowKeys: [],
            selectedRows: []

        };
        this.columns = [
            {
                title: '资产编号',
                dataIndex: 'asset_num',
                width: '15%',
            },
            {
                title: '网关编号',
                dataIndex: 'gateway_id',
                width: '15%',
            },
            {
                title: '资产名称',
                dataIndex: 'asset_name',
            }
        ];
        // rowSelection object indicates the need for row selection
        this.rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.state.selectedRowKeys = selectedRowKeys;
                this.state.selectedRows = selectedRows;
            }
        };

    }
    componentDidMount() {
        // To disable submit button at the beginning.
        this.loadAssetList();
    }

    // 页数发生变化的时候
    onPageNumChange(pageNum) {
        this.setState({
            pageNum: pageNum
        }, () => {
            this.loadAssetList();
        });
    }
    loadAssetList() {
        let param = {};
        param.pageNum = this.state.pageNum;
        param.perPage = this.state.perPage;
        _assetService.getBindingAssetList(param).then(response => {
            this.setState({
                dataList: response.data.list,
                total: response.data.total
            });
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }

    bindAssetList() {
        let param = {};
        param.data = this.state.selectedRows;
        param.gateway_id = this.state.gateway_id;
        _gatewayService.bindAssetList(param).then(response => {
            alert("关联成功");
            window.location.href = "#/gatewayManagement";
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }

    render() {

        return (
            <div id="page-wrapper">
                <Card title={`${this.state.gateway_id}网关关联资产`}>
                    <Row>
                        <Col xs={24} sm={12}>
                            <Search
                                style={{ maxWidth: 300, marginBottom: '10px' }}
                                placeholder="请输入..."
                                enterButton="查询"
                            />
                        </Col>
                        <Col xs={24} sm={12}>
                            <Button onClick={() => this.bindAssetList()} style={{ float: "right", marginRight: "30px" }} type="primary">保存</Button>
                        </Col>
                    </Row>
                    <Table rowSelection={this.rowSelection} columns={this.columns} dataSource={this.state.dataList} />

                </Card>
            </div>
        );
    }
}
export default Form.create()(GatewayBindingAsset);
