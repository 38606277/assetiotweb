
import React from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Pagination, Card } from 'antd';
import 'antd/dist/antd.css';
import LocalStorge from '../../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();

import AssetService from '../../service/AssetService.jsx';
const _assetService = new AssetService();


const EditableContext = React.createContext();

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'number') {
            return <InputNumber />;
        }
        return <Input />;
    };

    renderCell = ({ getFieldDecorator }) => {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: true,
                                    message: `Please Input ${title}!`,
                                },
                            ],
                            initialValue: record[dataIndex],
                        })(this.getInput())}
                    </Form.Item>
                ) : (
                        children
                    )}
            </td>
        );
    };

    render() {
        return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
    }
}

class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNum: 1,
            perPage: 6,
            dataList: [],
            editingKey: ''
        };
        this.columns = [
            {
                title: '资产编号',
                dataIndex: 'asset_num',
                width: '15%',
                editable: true,
            },
            {
                title: '物联网标签号',
                dataIndex: 'asset_id',
                width: '15%',
                editable: true,
            },
            {
                title: '资产名称',
                dataIndex: 'asset_name',
                editable: true,
            },
            {
                title: '操作',
                dataIndex: 'operation',
                width: '15%',
                render: (text, record) => {
                    const { editingKey } = this.state;
                    const editable = this.isEditing(record);
                    return editable ? (
                        <span>
                            <EditableContext.Consumer>
                                {form => (
                                    <a
                                        onClick={() => this.save(form, record.asset_id)}
                                        style={{ marginRight: 8 }}
                                    >
                                        保存
                                    </a>
                                )}
                            </EditableContext.Consumer>
                            <Popconfirm title="确定取消?" onConfirm={() => this.cancel(record.asset_id)}>
                                <a>取消</a>
                            </Popconfirm>
                        </span>
                    ) : (
                            <a disabled={editingKey !== ''} onClick={() => this.edit(record.asset_id)}>
                                编辑
                            </a>
                        );
                },
            },
        ];
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
        _assetService.getAssetList(param).then(response => {
            this.setState({
                dataList: response.data.list,
                total: response.data.total
            });
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }

    isEditing = record => record.asset_id === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.dataList];
            _assetService.bindEamTag(row).then(response => {
                const index = newData.findIndex(item => key === item.asset_id);
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({ dataList: newData, editingKey: '' });
            }, errMsg => {
                localStorge.errorTips(errMsg);
            });


            // const index = newData.findIndex(item => key === item.asset_id);
            // if (index > -1) {
            //     const item = newData[index];
            //     newData.splice(index, 1, {
            //         ...item,
            //         ...row,
            //     });
            //     this.setState({ dataList: newData, editingKey: '' });
            // } else {
            //     newData.push(row);
            //     this.setState({ dataList: newData, editingKey: '' });
            // }
        });
    }

    edit(key) {
        this.setState({ editingKey: key });
    }

    render() {
        const components = {
            body: {
                cell: EditableCell,
            },
        };

        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: col.dataIndex === 'age' ? 'number' : 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            };
        });

        return (
            <div id="page-wrapper">
                <Card title="资产标签管理">
                    <Input.Search
                        style={{ maxWidth: 300, marginBottom: '10px', float: "right" }}
                        placeholder="请输入资产标签号或物联网标签号..."
                        enterButton="查询"
                    />

                    <EditableContext.Provider value={this.props.form}>
                        <Table
                            components={components}
                            bordered
                            dataSource={this.state.dataList}
                            columns={columns}
                            rowClassName="editable-row"
                            pagination={{
                                onChange: this.cancel,
                            }}
                        />
                    </EditableContext.Provider>

                </Card>
            </div>

        );
    }
}
export default Form.create()(EditableTable);
