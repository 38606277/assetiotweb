
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, message, Divider, Form, Pagination, Row, Col, Button, Card } from 'antd';
import 'antd/dist/antd.css';
import LocalStorge from '../../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();
import HttpService from '../../util/HttpService.jsx';

import AssetService from '../../service/AssetService.jsx';
const _assetService = new AssetService();
const Search = Input.Search;

const { Column, ColumnGroup } = Table;




export default class assetList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNum: 1,
            perPage: 10,
            dataList: [],
            selectedRows: [],
            selectedRowKeys: [],
            selected: true,
            listType: 'list',
            searchKeyword: null
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

        // 如果是搜索的话，需要传入搜索类型和搜索关键字
        if (this.state.listType === 'search') {
            param.keyword = this.state.searchKeyword;
        }

        param.pageNum = this.state.pageNum;
        param.perPage = this.state.perPage;

        _assetService.getAssetList(param).then(response => {
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

            let asset_ids = this.state.selectedRowKeys.join(',');

            HttpService.post('reportServer/asset/DeleteAsset', JSON.stringify({ asset_ids: asset_ids }))
                .then(res => {
                    if (res.resultCode == "1000") {
                        message.success("删除成功！");
                        this.loadAssetList();
                        this.setState({ selectedRowKeys: [], selectedRows: [] });
                    }

                    else
                        message.error(res.message);

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
            this.loadAssetList();
        });
    }


    render() {

        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                console.log('selectedRowKeys changed: ', selectedRowKeys);
                this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
            },
        };

        return (
            <div id="page-wrapper">
                <Card title={<b>资产标签管理</b>} >
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
                            <Button href="#/asset/assetEdit/null" style={{ float: "right", marginRight: "10px" }} type="primary">导入资产</Button>
                            <Button href="#/asset/assetEdit/create/0" style={{ float: "right", marginRight: "10px" }} type="primary">新建资产</Button>

                        </Col>
                    </Row>
                    <Table dataSource={this.state.dataList} rowSelection={rowSelection} rowKey={"asset_id"} pagination={false} >
                        <Column
                            title="资产图片"
                            render={(text, record) => (
                                <span>
                                    <img style={{ width: '50px', height: '50px' }} src={`http://127.0.0.1/reportServer/uploadAssetImg/downloadAssetImg?fileName=${record.image}`} />
                                </span>
                            )}
                        />
                        <Column
                            title="资产ID"
                            dataIndex="asset_id"
                        />
                        <Column
                            title="物联网标签号"
                            dataIndex="iot_num"
                        />
                        <Column
                            title="资产编号"
                            dataIndex="asset_num"
                        />
                        <Column
                            title="资产名称"
                            dataIndex="asset_name"
                        />


                        <Column
                            title="动作"
                            render={(text, record) => (
                                <span>
                                    <a href={`#/asset/assetEdit/update/${record.asset_id}`}>编辑</a>
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
