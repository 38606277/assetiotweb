
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, message, Divider, Form, Pagination, Row, Col, Button, Card, Modal } from 'antd';
import 'antd/dist/antd.css';
import LocalStorge from '../../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();
import HttpService from '../../util/HttpService.jsx';

import AssetService from '../../service/AssetService.jsx';
const _assetService = new AssetService();



import GatewayService from '../../service/GatewayService.jsx'
import FormItem from 'antd/lib/form/FormItem';
const _gatewayService = new GatewayService();
const Search = Input.Search;
const TextArea = Input.TextArea;
const { Column, ColumnGroup } = Table;


const HandleDialog = Form.create({ name: 'form_in_modal' })(
    // eslint-disable-next-line
    class extends React.Component {
        render() {
            const { alarmModel, visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = this.props.form;

            return (
                <Modal
                    visible={visible}
                    title={`${alarmModel.alarm_num} 警告处理`}
                    okText="确认"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={onCreate}
                >

                    {alarmModel.status == 1 ?
                        (<TextArea style={{ color: 'black' }} rows={4} placeholder="请输入处理备注" value={alarmModel.remark} disabled />)
                        : (
                            <FormItem label='备注'>
                                {getFieldDecorator('remark', {
                                    rules: [{ required: true, message: '请输入处理备注!' }],
                                })(
                                    <TextArea rows={4} placeholder="请输入处理备注" />
                                )}

                            </FormItem>

                        )}
                </Modal>
            );
        }
    },
);



export default class assetAlarmList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNum: 1,
            perPage: 10,
            dataList: [],
            selectedRows: [],
            selectedRowKeys: [],
            selected: true,
            alarmModel: {}
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
        HttpService.post('reportServer/alarm/listEamAlarm', JSON.stringify(param))
            .then(res => {
                this.setState({
                    dataList: res.data.list,
                    total: res.data.total
                });

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


    handleCancel = () => {
        this.setState({ visible: false });
    };

    handleCreate = () => {
        if (this.state.alarmModel.status == 1) {
            this.setState({ visible: false });
            return
        }

        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            console.log('Received values of form: ', values);
            console.log('alarmModel', this.state.alarmModel);

            let params = {}
            params.alarm_id = this.state.alarmModel.alarm_id;
            params.remark = values.remark;
            params.status = 1;

            HttpService.post('reportServer/alarm/updateAlarmStatus', JSON.stringify(params))
                .then(res => {
                    if (res.resultCode == "1000") {
                        message.success("处理成功！");
                        form.resetFields();
                        this.setState({ visible: false });
                        this.loadGatewayList();
                    }
                    else {
                        message.error(res.message);
                    }

                });



        });
    };

    saveFormRef = formRef => {
        this.formRef = formRef;
    };

    showModal = (alarmModel) => {
        console.log('点击处理', alarmModel)
        this.setState({ alarmModel: alarmModel, visible: true });
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
                <Card title={<b>资产报警</b>} >

                    <HandleDialog
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        alarmModel={this.state.alarmModel}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                    />

                    <Row>
                        <Col xs={24} sm={12}>
                            <Search
                                style={{ maxWidth: 300, marginBottom: '10px' }}
                                placeholder="请输入..."
                                enterButton="查询"
                                onSearch={value => this.onSearch(value)}
                            />
                        </Col>
                    </Row>
                    <Table bordered dataSource={this.state.dataList} rowSelection={rowSelection} rowKey={"gateWay_id"} pagination={false} >
                        <Column
                            title="报警编号"
                            dataIndex="alarm_num"
                        />
                        <Column
                            title="资产编号"
                            dataIndex="asset_num"
                        />

                        <Column
                            title="物联网编号"
                            dataIndex="iot_num"
                        />
                        <Column
                            title="资产名称"
                            dataIndex="asset_name"
                        />
                        <Column
                            title="报警类型"
                            dataIndex="alarm_type"
                            render={(text, record) => (
                                <span style={{ color: 'orange' }}>
                                    {record.alarm_type}
                                </span>
                            )}
                        />
                        <Column
                            title="报警时间"
                            dataIndex="alarm_time"
                        />
                        <Column
                            title="状态"
                            dataIndex="status"
                            render={(text, record) => (
                                <span style={record.status == 1 ? { color: 'green' } : { color: 'red' }}>
                                    {record.status == 1 ? '已处理' : '未处理'}
                                </span>
                            )}
                        />
                        <Column
                            title="操作"
                            render={(text, record) => (
                                <span>
                                    {
                                        record.status == 1 ?
                                            (
                                                <a onClick={() => this.showModal(record)}>查看详情</a>
                                            ) : (
                                                <a onClick={() => this.showModal(record)}>查看详情</a>
                                            )
                                    }

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
