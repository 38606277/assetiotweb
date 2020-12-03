import React, { useRef, useState } from 'react';
import { Button, Space, Modal, message, Row } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable, { TableDropdown } from '@ant-design/pro-table';

import CreateForm from './components/CreateForm.jsx';
import UpdateForm from './components/UpdateForm.jsx';

import '@ant-design/pro-form/dist/form.css';
import '@ant-design/pro-table/dist/table.css';
import '@ant-design/pro-layout/dist/layout.css';

import HttpService from '../../../util/HttpService.jsx';

const { confirm } = Modal;

//删除按钮事件
const onDeleteClickListener = (ref, selectedRowKeys) => {

    if (selectedRowKeys.length < 1) {
        message.error('请选择需要删除的内容');
        return;
    }
    console.log('onDeleteClickListener', selectedRowKeys);

    confirm({
        title: '温馨提示',
        content: `您确定要删除吗？`,
        okText: '确定',
        cancelText: '取消',
        okType: 'danger',
        onOk() {
            deleteByIds(ref, selectedRowKeys);
        },
        onCancel() {

        },
    });

}
//删除
const deleteByIds = (ref, selectedRowKeys) => {
    if (selectedRowKeys.length < 1) {
        message.error('请选择需要删除的内容');
        return;
    }

    HttpService.post('reportServer/storage/deleteStorage', JSON.stringify({ ids: selectedRowKeys.toString() }))
        .then(res => {
            if (res.resultCode == "1000") {
                //刷新
                // 清空选中项
                ref.current.clearSelected();
                ref.current.reload();

            } else {
                message.error(res.message);
            }
        });
}

//获取数据
const fetchData = async (params, sort, filter) => {
    console.log('getByKeyword', params, sort, filter);
    // current: 1, pageSize: 20
    let requestParam = {
        pageNum: params.current,
        perPage: params.pageSize,
        ...params
    }
    const result = await HttpService.post('reportServer/storage/listStorageByPage', JSON.stringify(requestParam));
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == "1000"
    });
}

export default () => {

    console.log('绘制布局')
    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const [initData, setInitData] = useState({});


    //定义列
    const columns = [
        {
            title: '仓库编号',
            dataIndex: 'num',
            valueType: 'text',
        },
        {
            title: '仓库名称',
            dataIndex: 'name',
            valueType: 'text',
        },
        {
            title: '租赁时间',
            hideInSearch: true,
            dataIndex: 'time',
            valueType: 'date',
        },
        {
            title: '仓库类型',
            dataIndex: 'type',
            valueType: 'select',
            filters: true,
            fieldProps: {
                options: [
                    {
                        value: '成品仓库',
                        label: '成品仓库',
                    },
                    {
                        value: '半成品仓库',
                        label: '半成品仓库',
                    },
                    {
                        value: '原料仓库',
                        label: '原料仓库',
                    },
                ],
            }
        },
        {
            title: '所属部门',
            dataIndex: 'department',
            valueType: 'select',
            filters: true,
            fieldProps: {
                options: [
                    {
                        value: '仓库部门',
                        label: '仓库部门',
                    },
                    {
                        value: '仓库管理部',
                        label: '仓库管理部',
                    },
                    {
                        value: '公司总部',
                        label: '公司总部',
                    },
                ],
            },
        },
        {
            title: '是否禁用',
            dataIndex: 'is_disable',
            valueType: 'text',
            hideInSearch: true,
            render: (text, record) => {
                return record.is_disable == 0 ? ('否') : ('是');
            }
        },
        {
            title: '是否默认',
            dataIndex: 'is_default',
            valueType: 'text',
            hideInSearch: true,
            render: (text, record) => {
                return record.is_default == 0 ? ('否') : ('是');
            }
        },
        {
            title: '地址',
            dataIndex: 'address',
            valueType: 'text',
            hideInSearch: true,
        },
        {
            title: '面积',
            dataIndex: 'area',
            valueType: 'text',
            hideInSearch: true,
        },
        {
            title: '联系人',
            dataIndex: 'contacts_name',
            valueType: 'text',
            hideInSearch: true,
        },
        {
            title: '电话',
            dataIndex: 'contacts_tel',
            valueType: 'text',
            hideInSearch: true,
        },
        {
            title: '操作',
            width: 180,
            key: 'option',
            valueType: 'option',
            render: (text, record) => [
                <a key="link3" onClick={() => {
                    setVisible(true);
                    setInitData(record);
                }} >编辑</a>,
                <a key="link4" onClick={() => onDeleteClickListener(ref, [record.id])} >删除</a>,
            ]
        },
    ];

    return (
        <ProTable
            actionRef={ref}
            columns={columns}
            request={fetchData}
            rowKey="id"
            rowSelection={{
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // 注释该行则默认不显示下拉选项
                //selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            }}
            tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
                <Space size={24}>
                    <span>
                        已选 {selectedRowKeys.length} 项
                    <a
                            style={{
                                marginLeft: 8,
                            }}
                            onClick={onCleanSelected}
                        >
                            取消选择
                    </a>
                    </span>
                </Space>
            )}
            tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
                <Space size={16}>
                    <a onClick={() => onDeleteClickListener(ref, selectedRowKeys)}> 批量删除</a>
                </Space>
            )}
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                defaultCollapsed: true
            }}
            dateFormatter="string"
            headerTitle="仓库列表"
            toolBarRender={() => [
                <CreateForm onFinish={() => {
                    ref.current.reload();
                }} />,
                <UpdateForm visible={visible} initData={initData} onVisibleChange={(visbile) => {
                    if (visbile == false) {
                        setVisible(visbile)
                    }
                }
                } onFinish={() => {
                    ref.current.reload();
                }} />

            ]}
        />


    );
}