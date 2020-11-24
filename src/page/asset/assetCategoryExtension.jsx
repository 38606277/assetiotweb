import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    Tree,
    message,
    Table,
    Modal

} from 'antd';

import HttpService from '../../util/HttpService.jsx';
const { TreeNode } = Tree;
const { Column, ColumnGroup } = Table;
const Search = Input.Search;
const { confirm } = Modal;

const CreateAssetCategoryExtension = ({ visible, initData, onActionCallBack, edit }) => {
    console.log("CreateAssetCategoryExtension", '初始化')
    //初始化state
    const [treeData, setTreeData] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [form] = Form.useForm();//获取form 在布局进行绑定

    form.resetFields();
    form.setFieldsValue(initData);

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

    const onCheck = checkedKeys => {
        console.log('onCheck', checkedKeys);
        form.setFieldsValue({
            parent_code_list: checkedKeys
        });
        console.log("setCheckedKeys")
        setCheckedKeys(checkedKeys)
    };

    //对应 componentDidMount 
    useEffect(() => {
        console.log('useEffect')
        getAllChildrenRecursionByCode();
    }, [])


    const getAllChildrenRecursionByCode = () => {
        HttpService.post('reportServer/assetCategory/getAllChildrenRecursionByCode', JSON.stringify({ parent_code: '0' }))
            .then(res => {
                if (res.resultCode == "1000") {
                    setTreeData([
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
                    ])
                }
                else {
                    message.error(res.message);
                }
            });
    }





    const renderTreeNodes = data => {
        return data.map(item => {
            if (item.children) {
                return (
                    <TreeNode style={{ width: "100%" }} title={
                        <div class="father" style={{ width: "100%" }}>
                            {item.name}
                        </div>
                    } key={item.code} dataRef={item}>
                        {renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (<TreeNode style={{ width: "100%" }} key={item.code} title={<div class="father" style={{ width: "100%" }}>
                {item.name}
            </div>} isLeaf={true} dataRef={item} />);
        });
    }

    const handleSelectChange = value => {
        console.log(value);
        form.setFieldsValue({
            is_required: value
        });
    };

    const checkTree = (rule, value, callback) => {
        const { getFieldValue } = form;
        if (getFieldValue('parent_code_list') && 0 < getFieldValue('parent_code_list').length) {
            callback()
        } else {
            callback('请选择应用范围(分类)')
        }
    }


    //点击确定
    const onOkListener = () => {
        //edit ? onEdit : onCreate
        console.log('okListener')
        form.submit();
    }

    const onCancelListener = () => {
        onActionCallBack('cancel', {});
    }

    const onFinish = (values) => {
        console.log('onFinish:', values);
        onActionCallBack(edit ? 'edit' : 'create', values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    return (
        <Modal
            visible={visible}
            title={edit ? '编辑' : '新增'}
            okText="保存"
            cancelText="取消"
            onCancel={onCancelListener}
            onOk={onOkListener}
        >
            <Form form={form}
                name="assetCategoryExtensionDialog"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}  >
                <Form.Item label="" name="id" style={{ display: "none" }}
                    rules={[{ required: false, message: '' }]}
                >
                    <Input type='text' name='id' />
                </Form.Item>

                <Form.Item {...formItemLayout} label="扩展信息名称" name="attribute_name"
                    rules={[{ required: true, message: '请输入扩展信息名称' }]}>
                    <Input type='text' name='attribute_name' />
                </Form.Item>

                <Form.Item {...formItemLayout} label="应用范围(分类)" name="parent_code_list"
                    rules={[{ type: 'array', required: true, message: '请选择应用范围(分类)', validator: checkTree }]}>
                    <Tree
                        style={{ height: '260px', borderStyle: 'solid', overflow: 'auto' }}
                        checkable
                        defaultExpandAll={true}
                        autoExpandParent={true}
                        onCheck={onCheck}
                        checkedKeys={checkedKeys}
                    >
                        {renderTreeNodes(treeData)}
                    </Tree>
                </Form.Item>

                <Form.Item {...formItemLayout} label="是否必填" name="is_required"
                    rules={[{ required: true, message: '请选择是否必填' }]}>
                    <Select
                        defaultValue="0"
                        style={{ width: '100%' }}
                        placeholder="请选择是否必填"
                        onChange={handleSelectChange}
                    >
                        <Option value="0">否</Option>
                        <Option value="1">是</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal >
    );
};



const assetCategoryExtensionManager = () => {

    const [dataList, setDataList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [visible, setVisible] = useState(false);
    const [edit, setEdit] = useState(false);
    //对话框数据
    const [initData, setInitData] = useState({});

    //对应 componentDidMount 
    useEffect(() => {
        getByKeyword('');
    }, [])


    const getByKeyword = (keyword) => {
        let param = {
            keyword: keyword
        }
        HttpService.post('reportServer/assetCategoryExtension/getByKeyword', JSON.stringify(param))
            .then(res => {
                if (res.resultCode == "1000") {
                    setDataList(res.data)
                }
                else {
                    message.error(res.message);
                }
            });
    }

    const onAddClickListener = () => {
        showModal();
    }

    const onDeleteClickListener = () => {

        if (selectedRows.length < 1) {
            message.error('请选择需要删除的内容');
            return;
        }

        confirm({
            title: '温馨提示',
            content: `您确定要删除及全部下级分类吗？`,
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                deleteByIds();
            },
            onCancel() {

            },
        });

    }

    const deleteByIds = () => {
        HttpService.post('reportServer/assetCategoryExtension/deleteByIds', JSON.stringify({ dataList: selectedRows }))
            .then(res => {
                if (res.resultCode == "1000") {
                    getByKeyword('');
                    setSelectedRowKeys([])
                    setSelectedRows([])
                } else {
                    message.error(res.message);
                }
            });
    }


    const showModal = () => {
        setVisible(true)
        setEdit(false)
    };



    const handleCreate = (values) => {
        HttpService.post('reportServer/assetCategoryExtension/add', JSON.stringify(values))
            .then(res => {
                if (res.resultCode == "1000") {
                    setVisible(false)
                    getAllChildrenRecursionByCode();
                    getByKeyword('');
                } else {
                    message.error(res.message);
                }
            });
    };

    const onEditClickListener = () => {
        //获取勾选的内容 判断是否只有一条
        if (selectedRows.length < 1) {
            message.error('请选择需要修改的内容');
            return;
        }

        if (1 < selectedRows.length) {
            message.error('请选择单条数据修改');
            return;
        }
        setInitData(selectedRows[0]);
        setVisible(true);
        setEdit(true);
    }

    const handleEdit = (values) => {
        HttpService.post('reportServer/assetCategoryExtension/updateById', JSON.stringify(values))
            .then(res => {
                if (res.resultCode == "1000") {
                    setVisible(false)
                    getByKeyword('');
                } else {
                    message.error(res.message);
                }
            });
    }

    const rowSelection = {
        selectedRowKeys: selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
        }
    };

    const onActionCallBack = (action, values) => {
        console.log('onActionCallBack : ', action)
        if (action == 'create') {
            handleCreate(values)
        } else if (action == 'edit') {
            handleEdit(values)
        } else {
            setVisible(false)
        }
    }

    return (
        <div id="page-wrapper">

            <Card title="资产分类" style={{ height: '100%' }}>

                <div>
                    <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => onAddClickListener()}>新增</Button>
                    <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => onEditClickListener()}>修改</Button>
                    <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => onDeleteClickListener()}>删除</Button>

                    <Search
                        placeholder="搜索分类名称编号"
                        onSearch={value => getByKeyword(value)}
                        style={{ width: '200px', float: 'right' }}
                    />
                </div>

                <div style={{ marginTop: '16px' }}>
                    <Table bordered
                        dataSource={dataList}
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

                </div>
            </Card>

            <CreateAssetCategoryExtension
                visible={visible}
                onActionCallBack={onActionCallBack}
                edit={edit}
                initData={initData}
            />

        </div>
    )
}
export default assetCategoryExtensionManager;



