import React from 'react';
import { BarChartOutlined, LineChartOutlined, ProfileOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Card,
    Button,
    Table,
    Input,
    Select,
    List,
    Avatar,
    FormItem,
    Row,
    Col,
    Divider,
    Dropdown,
    Menu,
} from 'antd';

import HttpService from '../../util/HttpService.jsx';


const { Column, ColumnGroup } = Table;
const Search = Input.Search;

export default class reportBuilder extends React.Component {
    constructor(props) {
        super(props);
    }
    state = {
        in: [
            { name: '公司' },
            { name: '部门' }
        ],
        out: [
            { name: '公司' },
            { name: '部门' },
            { name: '日期' },
            { name: '工资' },

        ],

    };
    componentDidMount() {

    }

    render() {

        return (
            <div>
                <Card bodyStyle={{ padding: "0px" }}>
                    <Button style={{ marginRight: "10px" }} type="primary">新增行</Button>
                    <Button style={{ marginRight: "10px" }} type="primary">保存</Button>


                    <Button icon={<ProfileOutlined />} draggable="true" onDragStart={(event) => this.drag(event, 1)} />
                    <Button icon={<BarChartOutlined />} draggable="true" onDragStart={(event) => this.drag(event, 2)} />
                    <Button icon={<LineChartOutlined />} draggable="true" onDragStart={(event) => this.drag(event, 3)} />

                    <Select setValue={this.form} style={{ minWidth: '300px' }}>
                        <Option kye="1" value="1">一行一列</Option>
                        <Option key="2" value="2">一行二列</Option>
                    </Select>
                </Card>
                <Card bodyStyle={{ padding: "0px" }}>


                    <Card style={{ float: 'left', width: '15%' }} bodyStyle={{ padding: "0px" }}>
                        <List
                            header={"报表查询条件"}
                            style={{ padding: '5px' }}
                            dataSource={this.state.in}
                            renderItem={item => (
                                <List.Item

                                    actions={[]}
                                >
                                    <List.Item.Meta style={{ fontSize: '12px' }}
                                        avatar={
                                            <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                                        }
                                        title={<a href="">{item.name}</a>}
                                    />

                                </List.Item>


                            )}
                        />

                        <List
                            header={"报表查询结果"}
                            style={{ padding: '5px' }}
                            dataSource={this.state.out}
                            renderItem={item => (
                                <List.Item

                                    actions={[]}
                                >
                                    <List.Item.Meta style={{ fontSize: '12px' }}
                                        avatar={
                                            <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                                        }
                                        title={<a href="">{item.name}</a>}
                                    />

                                </List.Item>


                            )}
                        />

                    </Card>
                    <Card style={{ float: 'left', width: '85%' }} bodyStyle={{ padding: "0px" }}>


                        <Card title="查询条件" bodyStyle={{ padding: "0px", height: '100px' }}>
                        </Card>
                        <Card title="查询结果" bodyStyle={{ padding: "0px" }}>
                            <Table>
                                <Column
                                    title="报表ID"
                                    dataIndex="rpt_id"
                                />
                                <Column
                                    title="报表名称"
                                    dataIndex="rpt_name"
                                />
                                <Column
                                    title="报表类别"
                                    dataIndex="rpt_class"
                                />
                                <Column
                                    title="创建人"
                                    dataIndex="create_by"
                                />
                                <Column
                                    title="创建时间"
                                    dataIndex="create_time"
                                />
                                <Column
                                    title="修改人"
                                    dataIndex="update_by"
                                />
                                <Column
                                    title="修改时是"
                                    dataIndex="update_time"
                                />

                                <Column
                                    title="动作"
                                    render={(text, record) => (
                                        <span>
                                            <a onClick={() => {
                                                if (record.qry_type == 'sql') {
                                                    window.location.href = "#/query/SqlCreator/update/" + record.qry_id;
                                                } else if (record.qry_type == 'procedure') {
                                                    window.location.href = "#/query/ProcedureCreator/update/" + record.qry_id;
                                                } else if (record.qry_type == 'http') {
                                                    window.location.href = "#/query/HttpCreator/update/" + record.qry_id;
                                                }
                                            }}>编辑模板</a>
                                            <Divider type="vertical" />
                                            <a href={`#/query/CreateTemplate`}>模板</a>
                                        </span>
                                    )}
                                />
                            </Table>
                        </Card>
                    </Card>
                </Card>
            </div>
        );
    }
}
