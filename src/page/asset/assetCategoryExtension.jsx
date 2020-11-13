import React from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Tree, message, Icon, Table, Divider, Modal, TreeSelect, Cascader } from 'antd';
import LocalStorge from '../../util/LogcalStorge.jsx';
import HttpService from '../../util/HttpService.jsx';

const localStorge = new LocalStorge();
const FormItem = Form.Item;
const { TreeNode } = Tree;
const { Column, ColumnGroup } = Table;
const Search = Input.Search;
const { confirm } = Modal;

const CreateAssetCategoryExtension = Form.create({ name: 'create_asset_category_extension_form_in_modal' })(
    // eslint-disable-next-line
    class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                treeData: [],
                checkedKeys: [],
                selectedKeys: []
            };
        }

        componentDidMount() {
            this.getAllChildrenRecursionByCode()
        }

        getAllChildrenRecursionByCode() {
            HttpService.post('reportServer/assetCategory/getAllChildrenRecursionByCode', JSON.stringify({ parent_code: '0' }))
                .then(res => {
                    if (res.resultCode == "1000") {
                        this.setState({
                            treeData: [
                                {
                                    "path": "",
                                    "unit": "",
                                    "code": "0",
                                    "level": 1,
                                    "children": res.data,
                                    "name": "所有资产分类（全局）",
                                    "parent_code": "-1",
                                    "id": 0,
                                    "life": ""
                                }
                            ],
                        });
                    }
                    else {
                        message.error(res.message);
                    }
                });
        }



        onCheck = checkedKeys => {
            console.log('onCheck', checkedKeys);
            this.props.form.setFieldsValue({
                parent_code_list: checkedKeys
            });
            this.setState({ checkedKeys });
        };

        onSelect = (selectedKeys, info) => {
            console.log('onSelect', info);
            this.setState({ selectedKeys });
        };

        renderTreeNodes = data =>
            data.map(item => {
                if (item.children) {
                    return (
                        <TreeNode style={{ width: "100%" }} title={
                            <div class="father" style={{ width: "100%" }}>
                                {item.name}
                            </div>
                        } key={item.code} dataRef={item}>
                            {this.renderTreeNodes(item.children)}
                        </TreeNode>
                    );
                }
                return (<TreeNode style={{ width: "100%" }} key={item.code} title={<div class="father" style={{ width: "100%" }}>
                    {item.name}
                </div>} isLeaf={true} dataRef={item} />);
            });


        handleSelectChange = value => {
            console.log(value);
            this.props.form.setFieldsValue({
                is_required: value
            });
        };

        checkTree = (rule, value, callback) => {
            const { getFieldValue } = this.props.form
            if (getFieldValue('parent_code_list') && 0 < getFieldValue('parent_code_list').length) {
                callback()
            } else {
                callback('请选择应用范围(分类)')
            }
        }

        render() {
            const formItemLayout = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 8 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 12 },
                },
            };
            const { visible, onCancel, onCreate, onEdit, form, edit } = this.props;
            const { getFieldDecorator } = form;

            return (
                <Modal
                    visible={visible}
                    title={edit ? '编辑分类' : '新增分类'}
                    okText="保存"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={edit ? onEdit : onCreate}
                >
                    <FormItem label="" style={{ display: "none" }}>
                        {getFieldDecorator('id', {
                            rules: [{ required: false, message: '' }],
                        })(
                            <Input type='text' name='id' />
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="扩展信息名称">
                        {getFieldDecorator('attribute_name', {
                            rules: [{ required: true, message: '请输入扩展信息名称' }],
                        })(
                            <Input type='text' name='attribute_name' />
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="应用范围(分类)">
                        {getFieldDecorator('parent_code_list', {
                            rules: [{ type: 'array', required: true, message: '请选择应用范围(分类)', validator: this.checkTree }],
                        })(
                            <Tree
                                style={{ height: '260px', borderStyle: 'solid', overflow: 'auto' }}
                                checkable
                                defaultExpandAll={true}
                                autoExpandParent={true}
                                onCheck={this.onCheck}
                                checkedKeys={this.state.checkedKeys}
                                onSelect={this.onSelect}
                                selectedKeys={this.state.selectedKeys}
                            >
                                {this.renderTreeNodes(this.state.treeData)}
                            </Tree>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="是否必填"  >
                        {getFieldDecorator('is_required', {
                            rules: [{ required: true, message: '请选择是否必填' }],
                        })(
                            <Select
                                defaultValue="0"
                                style={{ width: '100%' }}
                                placeholder="请选择是否必填"
                                onChange={this.handleSelectChange}
                            >
                                <Option value="0">否</Option>
                                <Option value="1">是</Option>
                            </Select>
                        )}
                    </FormItem>
                </Modal >
            );
        }
    },
);





class assetCategoryExtensionManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            treeData: [],
            dataList: [],
            selectedRows: [],
            selectedRowKeys: [],
            visible: false
        };
    }

    componentDidMount() {
        this.getByKeyword('');
    }


    getByKeyword(keyword) {

        let param = {
            keyword: keyword
        }

        HttpService.post('reportServer/assetCategoryExtension/getByKeyword', JSON.stringify(param))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.setState({
                        dataList: res.data,
                    });
                }
                else {
                    message.error(res.message);
                }
            });
    }

    onAddClickListener() {
        this.showModal();
    }

    onDeleteClickListener() {

        if (this.state.selectedRows.length < 1) {
            message.error('请选择需要删除的内容');
            return;
        }

        let _this = this;
        confirm({
            title: '温馨提示',
            content: `您确定要删除及全部下级分类吗？`,
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                _this.deleteByIds();
            },
            onCancel() {

            },
        });

    }

    deleteByIds() {


        HttpService.post('reportServer/assetCategoryExtension/deleteByIds', JSON.stringify({ dataList: this.state.selectedRows }))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.getByKeyword('');
                    this.setState({ selectedRowKeys: [], selectedRows: [] });
                } else {
                    message.error(res.message);
                }
            });
    }


    showModal = () => {
        this.setState({ visible: true, edit: false });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    handleCreate = () => {
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            console.log('handleCreate', values)
            HttpService.post('reportServer/assetCategoryExtension/add', JSON.stringify(values))
                .then(res => {
                    if (res.resultCode == "1000") {
                        form.resetFields();
                        this.setState({ visible: false });
                        this.getAllChildrenRecursionByCode();
                        this.getByKeyword('');
                    } else {
                        message.error(res.message);
                    }
                });
        });
    };

    onEditClickListener = (categoryExtension) => {
        const { form } = this.formRef.props;
        form.setFieldsValue(categoryExtension)
        this.setState({ visible: true, edit: true });
        console.log('onEditClickListener', categoryExtension)

    }

    handleEdit = () => {
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            HttpService.post('reportServer/assetCategoryExtension/updateById', JSON.stringify(values))
                .then(res => {
                    if (res.resultCode == "1000") {
                        form.resetFields();
                        this.setState({ visible: false });
                        this.getByKeyword('');
                    } else {
                        message.error(res.message);
                    }
                });
        });
    }

    saveFormRef = formRef => {
        this.formRef = formRef;
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

                <Card title="资产分类" style={{ height: '100%' }}>

                    <div>
                        <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onAddClickListener()}>新增</Button>
                        <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onEditClickListener()}>修改</Button>
                        <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onDeleteClickListener()}>删除</Button>

                        <Search
                            placeholder="搜索分类名称编号"
                            onSearch={value => this.getByKeyword(value)}
                            style={{ width: '200px', float: 'right' }}
                        />
                    </div>

                    <div style={{ marginTop: '16px' }}>

                        <Col xs={24} sm={18}>

                            <Table bordered
                                dataSource={this.state.dataList}
                                rowKey={"id"}
                                pagination
                                rowSelection={rowSelection}
                            >
                                <Column
                                    title="资产扩展信息名称"
                                    dataIndex="attribute_name"
                                />

                                <Column
                                    title="应用范围（分类）"
                                    dataIndex="name"
                                />

                                <Column
                                    title="是否必填"
                                    render={(text, record) => (
                                        <div >
                                            {record.is_required == 1 ? '是' : '否'}
                                        </div>
                                    )}
                                />
                            </Table>
                        </Col>
                    </div>
                </Card>

                <CreateAssetCategoryExtension
                    wrappedComponentRef={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    onEdit={this.handleEdit}
                    treeData={this.state.treeData}
                    edit={this.state.edit}
                />

            </div>
        )
    }


}
export default assetCategoryExtensionManager;



