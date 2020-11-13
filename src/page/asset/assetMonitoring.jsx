
import React from 'react';
import { Link } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Select,
    Row,
    Col,
    Table,
    Divider,
    Button,
    Card,
    Input,
    Tree,
    Dropdown,
    Badge,
    Menu,
    message,
    Modal,
    Radio,
} from 'antd';
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'

const FormItem = Form.Item;
const Option = Select.Option;
const { TreeNode } = Tree;


var posList = [
    'left', 'right', 'top', 'bottom',
    'inside',
    'insideTop', 'insideLeft', 'insideRight', 'insideBottom',
    'insideTopLeft', 'insideTopRight', 'insideBottomLeft', 'insideBottomRight'
];

app.configParameters = {
    rotate: {
        min: -90,
        max: 90
    },
    align: {
        options: {
            left: 'left',
            center: 'center',
            right: 'right'
        }
    },
    verticalAlign: {
        options: {
            top: 'top',
            middle: 'middle',
            bottom: 'bottom'
        }
    },
    position: {
        options: echarts.util.reduce(posList, function (map, pos) {
            map[pos] = pos;
            return map;
        }, {})
    },
    distance: {
        min: 0,
        max: 100
    }
};

app.config = {
    rotate: 90,
    align: 'left',
    verticalAlign: 'middle',
    position: 'insideBottom',
    distance: 15,
    onChange: function () {
        var labelOption = {
            normal: {
                rotate: app.config.rotate,
                align: app.config.align,
                verticalAlign: app.config.verticalAlign,
                position: app.config.position,
                distance: app.config.distance
            }
        };
        myChart.setOption({
            series: [{
                label: labelOption
            }, {
                label: labelOption
            }, {
                label: labelOption
            }, {
                label: labelOption
            }]
        });
    }
};


var labelOption = {
    show: true,
    position: app.config.position,
    distance: app.config.distance,
    align: app.config.align,
    verticalAlign: app.config.verticalAlign,
    rotate: app.config.rotate,
    formatter: '{c}  {name|{a}}',
    fontSize: 16,
    rich: {
        name: {
            textBorderColor: '#fff'
        }
    }
};



const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
    // eslint-disable-next-line
    class extends React.Component {
        getItemLayout = (props) => {
            return (
                <Input.Search style={{ marginBottom: '6px' }} addonBefore={props.code} type='text' name='name' placeholder='请输入物联网标签号' enterButton="扫描" />
            );
        }
        render() {
            const ItemLayout = this.getItemLayout;
            const { visible, onCancel, onCreate, form } = this.props;

            const data = [];
            for (let i = 0; i < 9; ++i) {
                data.push(<ItemLayout code={"303724G00056570" + i + " -> "} />);
            }
            return (
                <Modal
                    visible={visible}
                    title="绑定物联网标签"
                    okText="确认"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    {data}
                </Modal>
            );
        }
    },
);


class TreeTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [], // Check here to configure the default column
            loading: false,
            confirmDirty: false,
            _name: this.props.match.params.name
        };
    }

    start = () => {
        this.setState({ loading: true });
        // ajax request after empty completing
        setTimeout(() => {
            this.setState({
                selectedRowKeys: [],
                loading: false,
            });
        }, 1000);
    };



    showModal = () => {
        console.log('点击新增')
        this.setState({ visible: true });
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

            console.log('Received values of form: ', values);
            form.resetFields();
            this.setState({ visible: false });
        });
    };

    saveFormRef = formRef => {
        this.formRef = formRef;
    };
    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };




    getOption = () => {
        let option = {
            title: {
                text: '资产状态统计(实时)',
                subtext: '更新于（2020-05-15 09:22:11）',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                data: ['正常', '警告', '错误']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '状态数量',
                    type: 'bar',
                    barWidth: '50%',
                    data: [
                        { value: 869, name: '正常', itemStyle: { color: '#52c41a' } },
                        { value: 22, name: '警告', itemStyle: { color: '#faad14' } },
                        { value: 9, name: '错误', itemStyle: { color: '#f5222d' } },

                    ],
                }
            ]
        }
        return option;
    }




    getOption2 = () => {
        let option = {
            color: ['#52c41a', '#faad14', '#f5222d'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['正常', '警告', '错误']
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                feature: {
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            xAxis: [
                {
                    type: 'category',
                    axisTick: { show: false },
                    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: '正常',
                    type: 'bar',
                    barGap: 0,
                    //label: labelOption,
                    data: [871, 877, 873, 871, 872, 867, 869]
                },
                {
                    name: '警告',
                    type: 'bar',
                    //label: labelOption,
                    data: [99, 131, 164, 121, 101, 88, 97]
                },
                {
                    name: '错误',
                    type: 'bar',
                    //label: labelOption,
                    data: [31, 42, 21, 11, 24, 33, 49]
                },

            ]
        };
        return option;
    }


    render() {

        const { loading, selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;

        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };

        const columns = [
            { title: '资产标签', dataIndex: 'barCode', key: 'barCode' },
            { title: '物联网标签', dataIndex: 'electronicLabel', key: 'electronicLabel' },
            { title: '资产名称', dataIndex: 'assetFirstname', key: 'assetFirstname' },
            { title: '生产厂商', dataIndex: 'productor', key: 'productor' },
            { title: '规格型号', dataIndex: 'model', key: 'model' },
            // { title: '资产类别编号', dataIndex: 'typeCode', key: 'typeCode' },
            { title: '资产类别描述', dataIndex: 'typeName', key: 'typeName' },
            {
                title: '状态',
                key: 'state',
                render: (text, record, index) => {
                    let status = 'success'
                    let desc = '正常'
                    if (record.state % 6 == 0) {
                        status = 'success'
                        desc = '正常'
                    } else if (record.state % 6 == 1) {
                        status = 'warning'
                        desc = '警告'
                    } else if (record.state % 6 == 2) {
                        status = 'error'
                        desc = '错误'
                    }
                    return (
                        <span>
                            <Badge status={status} />
                            {desc}
                        </span>
                    )
                }
            },
            // { title: '状态更新时间', dataIndex: 'updateDate', key: 'updateDate' },
            //{ title: '操作', key: 'action', render: (text, record, index) => { return (<a>编辑</a>) } },

        ];
        const data = [];
        for (let i = 100; i < 1000; ++i) {
            data.push({
                key: i,
                "assetType": "预转资资产",
                "assetCode": "",
                "barCode": "303724G00056570" + i,
                "electronicLabel": "DZ300029102" + i,
                "newBarCode": "",
                "assetFirstname": "TD-LTE专用直放站",
                "assetLastname": "TD-LTE专用直放站",
                "productor": "华为",
                "model": "GSM900 LTE（F/A/D）",
                "amount": 1,
                "unit": "个",
                "appDomainCode": "01",
                "appDomainName": "营业用",
                "typeCode": "01.02-03-02-02.0000",
                "typeName": "TD-LTE专用直放站",
                "state": i,
                "updateDate": '2014-12-24 23:12:00',

            });
        }


        return (
            <div id="page-wrapper">
                <Card title="资产监控">

                    {/* <Button onClick={this.showModal} type="primary" icon="database">绑定物联网标签</Button> */}


                    <ReactEcharts style={{ marginRight: '80px', float: 'right', width: '700px', height: '280px' }} option={this.getOption2()} />
                    <ReactEcharts style={{ marginLeft: '80px', width: '400px', height: '280px' }} option={this.getOption()} />

                    <Input.Search
                        style={{ maxWidth: 300, marginBottom: '10px', float: "right" }}
                        placeholder="请输入资产标签号或物联网标签号..."
                        enterButton="查询"
                    />

                    <CollectionCreateForm
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                    />

                    <Table
                        bordered
                        className="components-table-demo-nested"
                        columns={columns}
                        dataSource={data}
                    />
                </Card>
            </div >
        )
    }
}
export default Form.create()(TreeTest);

