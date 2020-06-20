
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, message, Divider, Form, Pagination, Row, Col, Button, Card } from 'antd';
import 'antd/dist/antd.css';
import LocalStorge from '../../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();
import HttpService from '../../util/HttpService.jsx';
import { Line, StackedColumn,Column,RingProgress } from '@ant-design/charts';





  const RingProgress_config = {
    width: 100,
    height: 100,
    percent: 0.8,
    color: ['#30BF78', '#E8EDF3'],
  };





  const data = [
    {
      action: '浏览网站',
      pv: 50000,
    },
    {
      action: '放入购物车',
      pv: 35000,
    },
    {
      action: '生成订单',
      pv: 25000,
    },
    {
      action: '支付订单',
      pv: 15000,
    },
    {
      action: '完成交易',
      pv: 8500,
    },
  ];
  const config = {
    title: {
      visible: true,
      text: '基础柱状图-转化率组件',
    },
    description: {
      visible: true,
      text: '基础柱状图的图形之间添加转化率标签图形\uFF0C用户希望关注从左到右的数据变化比例',
    },
    forceFit: true,
    data,
    padding: 'auto',
    xField: 'action',
    yField: 'pv',
    conversionTag: { visible: true },
  };
  
  const data1 = [
    {
        year: '1991',
        value: 3,
        type: 'Lon',
    },
    {
        year: '1992',
        value: 4,
        type: 'Lon',
    },
    {
        year: '1993',
        value: 3.5,
        type: 'Lon',
    },
    {
        year: '1994',
        value: 5,
        type: 'Lon',
    },
    {
        year: '1995',
        value: 4.9,
        type: 'Lon',
    },
    {
        year: '1996',
        value: 6,
        type: 'Lon',
    },
    {
        year: '1997',
        value: 7,
        type: 'Lon',
    },
    {
        year: '1998',
        value: 9,
        type: 'Lon',
    },
    {
        year: '1999',
        value: 13,
        type: 'Lon',
    },
    {
        year: '1991',
        value: 3,
        type: 'Bor',
    },
    {
        year: '1992',
        value: 4,
        type: 'Bor',
    },
    {
        year: '1993',
        value: 3.5,
        type: 'Bor',
    },
    {
        year: '1994',
        value: 5,
        type: 'Bor',
    },
    {
        year: '1995',
        value: 4.9,
        type: 'Bor',
    },
    {
        year: '1996',
        value: 6,
        type: 'Bor',
    },
    {
        year: '1997',
        value: 7,
        type: 'Bor',
    },
    {
        year: '1998',
        value: 9,
        type: 'Bor',
    },
    {
        year: '1999',
        value: 13,
        type: 'Bor',
    },
];
const config1 = {
    title: {
        visible: true,
        text: '堆叠柱状图',
    },
    forceFit: true,
    data1,
    padding: 'auto',
    xField: 'year',
    yField: 'value',
    yAxis: { min: 0 },
    color: ['#ae331b', '#1a6179'],
    stackField: 'type',
};




export default class dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNum: 1,
            perPage: 10,
            dataList: [],
            selectedRows: [],
            selectedRowKeys: [],
            selected: true
        };
    }
    componentDidMount() {

    };



    render() {

        



        const data = [
            { year: '1991', value: 3 },
            { year: '1992', value: 4 },
            { year: '1993', value: 3.5 },
            { year: '1994', value: 5 },
            { year: '1995', value: 4.9 },
            { year: '1996', value: 6 },
            { year: '1997', value: 7 },
            { year: '1998', value: 9 },
            { year: '1999', value: 13 },
        ];
        const config = {
            data,
            title: {
                visible: true,
                text: '带数据点的折线图',
            },
            xField: 'year',
            yField: 'value',
            point: {
                visible: true,
                size: 5,
                shape: 'diamond',
                style: {
                    fill: 'white',
                    stroke: '#2593fc',
                    lineWidth: 2,
                },
            },
        };

        return (
            <div id="page-wrapper">
                <Row>
                    <Col span={8}>
                        <Row style={{}}>
                            <Col span={8}><RingProgress  {...RingProgress_config}/></Col>
                            <Col span={8}><RingProgress  {...RingProgress_config}/></Col>
                            <Col span={8}><RingProgress  {...RingProgress_config}/></Col>

                        </Row>
                        <Row>
                           <Column {...config} /> 
                        </Row>
                        <StackedColumn {...config1} />
                    </Col>
                    <Col span={8}>
                        <Line {...config} />
                    </Col>
                    <Col span={8}>
                        <Column {...config} />
                    </Col>
                </Row>
                <Row>

                </Row>
            </div>
        );
    }
}
