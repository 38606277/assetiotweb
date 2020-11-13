import React from 'react';
import { Form, Icon as LegacyIcon } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    Tree,
    message,
    Table,
    Divider,
    Modal,
    TreeSelect,
} from 'antd';
import LocalStorge from '../../util/LogcalStorge.jsx';
import HttpService from '../../util/HttpService.jsx';
import "./assetCategory.css"
const localStorge = new LocalStorge();
const FormItem = Form.Item;
const { TreeNode } = Tree;
const { Column, ColumnGroup } = Table;
const Search = Input.Search;
const { confirm } = Modal;

const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
    // eslint-disable-next-line
    class extends React.Component {

        onSelectChange = value => {
            this.props.form.setFieldsValue({ parent_code: value == undefined ? '0' : value })
        }

        parseJson(treeData) {
            let i = 0;
            for (i in treeData) {
                let item = treeData[i];
                item["title"] = item.name;
                item["value"] = item.code;
                this.parseJson(item.children);
            }
            return treeData;
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
            const { visible, onCancel, onCreate, onEdit, form, edit, treeData } = this.props;
            const { getFieldDecorator } = form;
            let mTreeData = [{
                title: '无上级（一级）',
                value: '0'
            }]
            if (typeof treeData != 'undefined') {
                mTreeData = mTreeData.concat(this.parseJson(treeData));
            }
            console.log('form', form);
            console.log('render', mTreeData)




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


                    <FormItem {...formItemLayout} label="" style={{ display: "none" }}>
                        {getFieldDecorator('old_code', {
                            rules: [{ required: false, message: '' }],
                        })(
                            <Input type='text' name='old_code' />
                        )}
                    </FormItem>


                    <FormItem {...formItemLayout} label="分类编号">
                        {getFieldDecorator('code', {
                            rules: [{ required: true, message: '请输入分类编号' }],
                        })(
                            <Input type='text' name='code' />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="分类名称">
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: '请输入分类名称' }],
                        })(
                            <Input type='text' name='name' />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="上级分类">
                        {getFieldDecorator('parent_code', {
                            rules: [{ required: true, message: '请选择上级分类' }],
                        })(
                            <TreeSelect
                                allowClear="true"
                                style={{ width: '100%' }}
                                dropdownStyle={{ maxHeight: 260, overflow: 'auto' }}
                                treeData={mTreeData}
                                placeholder="请选择上级分类"
                                treeDefaultExpandAll
                                onChange={this.onSelectChange}
                            />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="预计使用期限">
                        {getFieldDecorator('life', {
                            rules: [{ required: false, message: '请输入预计使用期限' }],
                        })(
                            <Input type='text' name='life' />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="单位">
                        {getFieldDecorator('unit', {
                            rules: [{ required: false, message: '请输入单位' }],
                        })(
                            <Input type='text' name='unit' />
                        )}
                    </FormItem>
                </Modal>
            );
        }
    },
);


class AssetCategoryManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            treeData: [],
            dataList: [],
            visible: false
        };
    }

    componentDidMount() {
        this.getAllChildrenRecursionByCode();
        this.getByKeyword('');
    }

    getAllChildrenRecursionByCode() {
        HttpService.post('reportServer/assetCategory/getAllChildrenRecursionByCode', JSON.stringify({ parent_code: '0' }))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.setState({
                        treeData: res.data,
                    });
                }
                else {
                    message.error(res.message);
                }
            });
    }

    onTreeSelect = (selectedKeys, info) => {

        if (info.selected) {
            let param = {
                code: selectedKeys[0]
            }
            HttpService.post('reportServer/assetCategory/getAllChildrenListByCode', JSON.stringify(param))
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
    }


    getByKeyword(keyword) {

        let param = {
            keyword: keyword
        }

        HttpService.post('reportServer/assetCategory/getByKeyword', JSON.stringify(param))
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

    onDeleteClickListener(category) {
        let _this = this;
        confirm({
            title: '温馨提示',
            content: `您确定要删除${category.name}及全部下级分类吗？`,
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                _this.deleteByCode(category);
            },
            onCancel() {

            },
        });

    }

    deleteByCode(category) {
        HttpService.post('reportServer/assetCategory/deleteByCode', JSON.stringify(category))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.getAllChildrenRecursionByCode();
                    this.getByKeyword('');
                } else {
                    message.error(res.message);
                }
            });
    }

    renderTreeNodes = data =>
        data.map(item => {
            if (item.children) {
                return (
                    <TreeNode style={{ width: "100%" }} title={
                        <div class="father" style={{ width: "100%" }}>
                            {item.name}

                            <span class="element" >
                                <LegacyIcon color="#1890ff"></LegacyIcon>
                            </span>
                            <span class="element" >
                                <DeleteOutlined
                                    color="#1890ff"
                                    onClick={() => {
                                        this.onDeleteClickListener(item);
                                    }}></DeleteOutlined>
                            </span>
                            <span class="element">
                                <EditOutlined color="#1890ff"></EditOutlined>
                            </span>
                        </div>

                    } key={item.code} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode style={{ width: "100%" }} key={item.code} title={<div class="father" style={{ width: "100%" }}>
                    {item.name}
                    <span class="element" >
                        <LegacyIcon color="#1890ff"></LegacyIcon>
                    </span>
                    <span class="element" >
                        <DeleteOutlined
                            color="#1890ff"
                            onClick={() => {
                                this.onDeleteClickListener(item);
                            }}></DeleteOutlined>
                    </span>
                    <span class="element">
                        <EditOutlined
                            color="#1890ff"
                            onClick={() => {
                                this.onEditClickListener(item);
                            }}></EditOutlined>
                    </span>
                </div>} isLeaf={true} dataRef={item} />
            );
        });



    onAddClickListener = () => {
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
            HttpService.post('reportServer/assetCategory/add', JSON.stringify(values))
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

    onEditClickListener = (category) => {
        const { form } = this.formRef.props;
        category.old_code = category.code;
        form.setFieldsValue(category)
        this.setState({ visible: true, edit: true });
        console.log('onEditClickListener', category)
    }

    handleEdit = () => {
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            HttpService.post('reportServer/assetCategory/updateById', JSON.stringify(values))
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
    }

    saveFormRef = formRef => {
        this.formRef = formRef;
    };


    render() {
        return (
            <div id="page-wrapper">

                <Card title="资产分类" style={{ height: '100%' }}>

                    <div>
                        <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onAddClickListener()}>新增分类</Button>
                        <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onImportClickListener()}>批量导入</Button>

                        <Search
                            placeholder="搜索分类名称编号"
                            onSearch={value => this.getByKeyword(value)}
                            style={{ width: '200px', float: 'right' }}
                        />
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <Col xs={24} sm={6}>
                            <Tree
                                defaultExpandAll={true}
                                autoExpandParent={true}
                                style={{ width: "100%" }}
                                showLine={true}
                                onSelect={this.onTreeSelect}
                            >
                                {this.renderTreeNodes(this.state.treeData)}
                            </Tree>
                        </Col>


                        <Col xs={24} sm={18}>

                            <Table bordered dataSource={this.state.dataList} rowKey={"code"} pagination={false} >
                                <Column
                                    title="分类编号"
                                    dataIndex="code"
                                />
                                <Column
                                    title="分类名称"
                                    dataIndex="name"
                                />

                                <Column
                                    title="上级分类"
                                    dataIndex="parent_code"
                                />
                                <Column
                                    title="预计使用年限（月）"
                                    dataIndex="life"
                                />
                                <Column
                                    title="计量单位"
                                    dataIndex="unit"
                                />
                                <Column
                                    title="操作"
                                    render={(text, record) => (
                                        <div > <span style={{ color: "#1890ff" }} onClick={() => {
                                            this.onEditClickListener(record);
                                        }}>
                                            编辑
                                        </span>
                                            <Divider type="vertical"></Divider>
                                            <span style={{ color: "#1890ff" }} onClick={() => {
                                                this.onDeleteClickListener(record);
                                            }}>
                                                删除
                                        </span>
                                        </div>
                                    )}
                                />
                            </Table>
                        </Col>
                    </div>
                </Card>

                <CollectionCreateForm
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
export default AssetCategoryManager;



