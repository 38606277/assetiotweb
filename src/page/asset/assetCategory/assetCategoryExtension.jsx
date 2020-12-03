import React, { useRef } from 'react';
import { Button, Space, Modal, message } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined, } from '@ant-design/icons';
import ProTable, { TableDropdown } from '@ant-design/pro-table';

import CreateFrom from './components/CreateFrom.jsx';

import '@ant-design/pro-form/dist/form.css';
import '@ant-design/pro-table/dist/table.css';
import '@ant-design/pro-layout/dist/layout.css';

import HttpService from '../../../util/HttpService.jsx';

const { confirm } = Modal;

//定义列
const columns = [
    {
        title: '资产扩展信息名称',
        dataIndex: 'attribute_name',
        valueType: 'text',
    },
    {
        title: '应用范围（分类）',
        dataIndex: 'name',
        valueType: 'text',
    },
    {
        title: '是否必填',
        dataIndex: 'is_required',
        initialValue: '1',
        filters: true,
        valueEnum: {
            1: {
                text: '是',
                status: 'Default',
            },
            0: {
                text: '否',
                status: 'Default',
            }
        },
        render: (text, record) => (
            <span>
                {record.is_required == 1 ? '是' : '否'}
            </span>
        )

    },
    {
        title: '操作',
        width: 180,
        key: 'option',
        valueType: 'option',
        render: (text, record) => [
            <a key="link" >修改</a>,
            <a key="link2" onClick={() => { onDeleteClickListener([record]) }}>删除</a>,
        ],
    },
];
//删除按钮事件
const onDeleteClickListener = (ref, selectedRows) => {

    if (selectedRows.length < 1) {
        message.error('请选择需要删除的内容');
        return;
    }
    console.log('onDeleteClickListener', selectedRows);

    confirm({
        title: '温馨提示',
        content: `您确定要删除及全部下级分类吗？`,
        okText: '确定',
        cancelText: '取消',
        okType: 'danger',
        onOk() {
            deleteByIds(ref, selectedRows);
        },
        onCancel() {

        },
    });

}
//删除
const deleteByIds = (ref, selectedRows) => {
    HttpService.post('reportServer/assetCategoryExtension/deleteByIds', JSON.stringify({ dataList: selectedRows }))
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
    let param = {
        keyword: ''
    }
    const result = await HttpService.post('reportServer/assetCategoryExtension/getByKeyword', JSON.stringify(param));
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data,
        success: result.resultCode == "1000"
    });
}

export default () => {
    console.log('绘制布局')
    const ref = useRef();
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
                    <a onClick={() => onDeleteClickListener(ref, selectedRows)}> 批量删除</a>
                </Space>
            )}
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                layout: 'vertical',
                defaultCollapsed: false,
            }}
            dateFormatter="string"
            toolBarRender={() => [
                <CreateFrom onFinish={() => {
                    ref.current.reload();
                }} />
            ]}
        />
    );
}