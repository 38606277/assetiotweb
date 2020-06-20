
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, message, Divider, Form, Pagination, Row, Col, Button, Card } from 'antd';
import 'antd/dist/antd.css';
import LocalStorge from '../../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();
import HttpService from '../../util/HttpService.jsx';
import { Line, StackedColumn, Column, RingProgress } from '@ant-design/charts';
import './css/index.css';






const RingProgress_config = {
    width: 100,
    height: 100,
    percent: 0.8,
    color: ['#30BF78', '#E8EDF3'],
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







        return (
            <div  class="viewport" >
                <div class="column">
                    <div class="overview panel">
                        <div class="inner">
                            <div class="item">
                                <h4>2,190</h4>
                                <span>
                                    <i class="icon-dot" style={{ color: '#006cff' }}></i>
                            资产总数
                        </span>
                            </div>
                            <div class="item">
                                <h4>190</h4>
                                <span>
                                    <i class="icon-dot" style={{ color: '#6acca3' }}></i>
                            本月新增
                        </span>
                            </div>
                            <div class="item">
                                <h4>3,001</h4>
                                <span>
                                    <i class="icon-dot"></i>
                            运营设备
                        </span>
                            </div>
                            <div class="item">
                                <h4>108</h4>
                                <span>
                                    <i class="icon-dot" ></i>
                            异常设备
                        </span>
                            </div>
                        </div>
                    </div>
                    <div class="monitor panel">
                        <div class="inner">
                            <div class="tabs">
                                <a href="javascript:;" data-index="0" class="active">故障设备监控</a>
                                <a href="javascript:;" data-index="1">异常设备监控</a>
                            </div>
                            <div class="content" style={{ display: 'block' }}>
                                <div class="head">
                                    <span class="col">故障时间</span>
                                    <span class="col">设备地址</span>
                                    <span class="col">异常代码</span>
                                </div>
                                <div class="marquee-view">
                                    <div class="marquee">

                                        <div class="row">
                                            <span class="col">20190710</span>
                                            <span class="col">北京市昌平区建材城西路金燕龙写字楼</span>
                                            <span class="col">1000010</span>
                                            <span class="icon-dot"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="content">
                                <div class="head">
                                    <span class="col">异常时间</span>
                                    <span class="col">设备地址</span>
                                    <span class="col">异常代码</span>
                                </div>
                                <div class="marquee-view">
                                    <div class="marquee">

                                        <div class="row">
                                            <span class="col">20190710</span>
                                            <span class="col">北京市昌平区建材城西路金燕龙写字楼</span>
                                            <span class="col">1000002</span>
                                            <span class="icon-dot"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="point panel">
                        <div class="inner">
                            <h3>点位分布统计</h3>
                            <div class="chart">
                                <div class="pie"></div>
                                <div class="data">
                                    <div class="item">
                                        <h4>320,11</h4>
                                        <span>
                                            <i class="icon-dot" ></i>
                                    点位总数
                                </span>
                                    </div>
                                    <div class="item">
                                        <h4>418</h4>
                                        <span>
                                            <i class="icon-dot" ></i>
                                    本月新增
                                </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="map">
                        <h3>
                            <span class="icon-cube"></span>
                    设备数据统计
                </h3>
                        <div class="chart">
                            <div class="geo"></div>
                        </div>
                    </div>
                    <div class="users panel">
                        <div class="inner">
                            <h3>全省资产总量统计</h3>
                            <div class="chart">
                                <div class="bar"></div>
                                <div class="data">
                                    <div class="item">
                                        <h4>120,899</h4>
                                        <span>
                                            <i class="icon-dot" style={{ color: '#ed3f35' }}></i>
                                    用户总量
                                </span>
                                    </div>
                                    <div class="item">
                                        <h4>248</h4>
                                        <span>
                                            <i class="icon-dot" style={{ color: '#eacf19' }}></i>
                                    本月新增
                                </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="order panel">
                        <div class="inner">
                            <div class="filter">
                                <a href="javascript:;" data-key="day365" class="active">365天</a>
                                <a href="javascript:;" data-key="day90">90天</a>
                                <a href="javascript:;" data-key="day30">30天</a>
                                <a href="javascript:;" data-key="day1">24小时</a>
                            </div>
                            <div class="data">
                                <div class="item">
                                    <h4>20,301,987</h4>
                                    <span>
                                        <i class="icon-dot" style={{ color: '#ed3f35' }}></i>
                                订单量
                            </span>
                                </div>
                                <div class="item">
                                    <h4>99834</h4>
                                    <span>
                                        <i class="icon-dot" style={{ color: '#eacf19' }}></i>
                                销售额(万元)
                            </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="sales panel">

                    </div>
                    <div class="wrap">
                        <div class="channel panel">
                            <div class="inner">
                                <h3>渠道分布</h3>
                                <div class="data">
                                    <div class="item">
                                        <h4>39 <small>%</small></h4>
                                        <span>
                                            <i class="icon-plane"></i>
                                    机场
                                </span>
                                    </div>
                                    <div class="item">
                                        <h4>28 <small>%</small></h4>
                                        <span>
                                            <i class="icon-bag"></i>
                                    商场
                                </span>
                                    </div>
                                </div>
                                <div class="data">
                                    <div class="item">
                                        <h4>20 <small>%</small></h4>
                                        <span>
                                            <i class="icon-train"></i>
                                    地铁
                                </span>
                                    </div>
                                    <div class="item">
                                        <h4>13 <small>%</small></h4>
                                        <span>
                                            <i class="icon-bus"></i>
                                    火车站
                                </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="quarter panel">
                            <div class="inner">
                                <h3>一季度销售进度</h3>
                                <div class="chart">
                                    <div class="box">
                                        <div class="gauge"></div>
                                        <div class="label">75<small> %</small></div>
                                    </div>
                                    <div class="data">
                                        <div class="item">
                                            <h4>1,321</h4>
                                            <span>
                                                <i class="icon-dot" ></i>
                                        销售额(万元)
                                    </span>
                                        </div>
                                        <div class="item">
                                            <h4>150%</h4>
                                            <span>
                                                <i class="icon-dot" ></i>
                                        同比增长
                                    </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="top panel">
                        <div class="inner">
                            <div class="all">

                            </div>
                            <div class="province">

                            </div>
                        </div>
                    </div>
                </div>
            </div>


        );
    }
}
