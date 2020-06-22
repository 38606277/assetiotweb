
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, message, Divider, Form, Pagination, Row, Col, Button, Card } from 'antd';
import 'antd/dist/antd.css';
import LocalStorge from '../../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();
import HttpService from '../../util/HttpService.jsx';
import { Line, StackedColumn, Column, RingProgress } from '@ant-design/charts';
import './css/index.css';
import echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import 'echarts/map/js/province/hebei.js';



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
    getGugarOption = () => {



        var option = {
            series: [
                {
                    type: 'pie',
                    radius: ['130%', '150%'],  // 放大图形
                    center: ['50%', '80%'],    // 往下移动  套住75%文字
                    label: {
                        show: false,
                    },
                    startAngle: 180,
                    hoverOffset: 0,  // 鼠标经过不变大
                    data: [
                        {
                            value: 100,
                            itemStyle: { // 颜色渐变#00c9e0->#005fc1
                                color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [
                                        { offset: 0, color: '#00c9e0' },
                                        { offset: 1, color: '#005fc1' }
                                    ]
                                }
                            }
                        },
                        { value: 100, itemStyle: { color: '#12274d' } }, // 颜色#12274d

                        { value: 200, itemStyle: { color: 'transparent' } }// 透明隐藏第三块区域
                    ]
                }
            ]
        };
        return option;
    };

    gethbmapOption = () => {

        var option = {
            title: {
                text: '',
                subtext: '',
                left: 'center'
            },
            series: [
                {
                    name: 'iphone3',
                    type: 'map',
                    mapType: '河北',
                    roam: false,
                    label: {
                        normal: {
                            show: true
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    data: []
                }
            ]
        };
        return option;
    }

    getMapOption = () => {

        var option = {

            toolbox: {
                feature: {
                    saveAsImage: {
                        show: true
                    }
                }
            },
            visualMap: {
                show: false,
                min: 0,
                max: 45000,
                left: 'left',
                top: 'bottom',
                text: ['高', '低'], // 文本，默认为数值文本
                calculable: true,
                inRange: {
                    color: ['lightskyblue', 'orangered']
                }
            },
            series: [{
                type: 'map',
                zoom: 1.2,
                mapType: '河北',
                roam: true,
                label: {
                    normal: {
                        show: true,
                        color: '#d8d8d8',
                        areaColor: '#142957',
                        borderColor: '#0692a4'
                    },
                    emphasis: {
                        textStyle: {
                            color: '#fff'
                        }
                    }
                },
                itemStyle: {

                    normal: {
                        borderColor: '#389BB7',
                        areaColor: 'white',
                    },
                    emphasis: {
                        areaColor: '#389BB7',
                        borderWidth: 0
                    }
                },
                animation: true,
                data: [{
                    name: '邯郸市',
                    value: 18
                }, {
                    name: '邢台市',
                    value: 22036
                }, {
                    name: '衡水市',
                    value: 39825
                }, {
                    name: '石家庄市',
                    value: 48405
                }, {
                    name: '保定市',
                    value: 15212
                }, {
                    name: '沧州市',
                    value: 26681
                }, {
                    name: '廊坊市',
                    value: 11161,
                }, {
                    name: '张家口市',
                    value: 20687
                }, {
                    name: '承德市',
                    value: 51488,
                }, {
                    name: '唐山市',
                    value: 23053
                }, {
                    name: '秦皇岛市',
                    value: 26504
                }]
                // animationDurationUpdate: 1000,
                // animationEasingUpdate: 'quinticInOut'
            }]
        };



        return option;
    }


    getOption = () => {
        let option = {
            // 控制提示
            tooltip: {
                // 非轴图形，使用item的意思是放到数据对应图形上触发提示
                trigger: 'item',
                // 格式化提示内容：
                // a 代表图表名称 b 代表数据名称 c 代表数据  d代表  当前数据/总数据的比例
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            // 控制图表
            series: [
                {
                    // 图表名称
                    name: '地区',
                    // 图表类型
                    type: 'pie',
                    // 南丁格尔玫瑰图 有两个圆  内圆半径10%  外圆半径70%
                    // 百分比基于  图表DOM容器的半径
                    radius: ['10%', '70%'],
                    // 图表中心位置 left 50%  top 50% 距离图表DOM容器
                    center: ['50%', '50%'],
                    // 半径模式，另外一种是 area 面积模式
                    roseType: 'radius',
                    // 数据集 value 数据的值 name 数据的名称
                    data: [
                        { value: 20, name: '云南' },
                        { value: 5, name: '北京' },
                        { value: 15, name: '山东' },
                        { value: 25, name: '河北' },
                        { value: 20, name: '江苏' },
                        { value: 35, name: '浙江' },
                        { value: 30, name: '四川' },
                        { value: 40, name: '湖北' }
                    ],
                    //文字调整
                    label: {
                        fontSize: 10
                    },
                    //引导线
                    labelLine: {
                        length: 8,
                        length2: 10
                    }
                }
            ],
            color: ['#006cff', '#60cda0', '#ed8884', '#ff9f7f', '#0096ff', '#9fe6b8', '#32c5e9', '#1d9dff']
        };
        return option;

    };
    getLineOption=()=>{
        var option = {
            // 给echarts图设置背景色
            //backgroundColor: '#FBFBFB',  // -----------> // 给echarts图设置背景色
            color: ['#7FFF00'],
            tooltip: {
                trigger: 'axis'
            },
           
            grid:{
                        x:40,
                        y:30,
                        x2:5,
                        y2:20
                        
                    },
            calculable: true,
    
    
            xAxis: [{
                 type: 'category',
            data: ['6:00-9:00', '10:00-12:00', '13:00-15:00', '16:00-20:00', '21:00-24:00'],
         axisLabel: {
                color: "#7FFF00" //刻度线标签颜色
                }
            }],
            yAxis: [{
    
                type: 'value',
                axisLabel: {
                color: "#7FFF00" //刻度线标签颜色
                }
            }],
            series: [{
                name: '人次',
                type: 'line',
                data: [800, 300, 500, 800, 300, 600],
                
            }]
        };
        
        
        return option;
    }


    getOption2 = () => {
        var item = {
            name: '',
            value: 1200,
            // 柱子颜色
            itemStyle: {
                color: '#254065'
            },
            // 鼠标经过柱子颜色
            emphasis: {
                itemStyle: {
                    color: '#254065'
                }
            },
            // 工具提示隐藏
            tooltip: {
                extraCssText: 'opacity:0'
            }
        };

        let option = {
            // 工具提示
            tooltip: {
                // 触发类型  经过轴触发axis  经过轴触发item
                trigger: 'item',
                // 轴触发提示才有效
                axisPointer: {
                    // 默认为直线，可选为：'line' 线效果 | 'shadow' 阴影效果       
                    type: 'shadow'
                }
            },
            // 图表边界控制
            grid: {
                // 距离 上右下左 的距离
                left: '0',
                right: '3%',
                bottom: '3%',
                top: '5%',
                // 大小是否包含文本【类似于boxsizing】
                containLabel: true,
                //显示边框
                show: true,
                //边框颜色
                borderColor: 'rgba(0, 240, 255, 0.3)'
            },
            // 控制x轴
            xAxis: [
                {
                    // 使用类目，必须有data属性
                    type: 'category',
                    // 使用 data 中的数据设为刻度文字
                    data: ['石家庄', '唐山', '雄安', '保定', '廊坊', '', '......', '', '张家口', '承德', '济南', '成都', '邢台'],
                    // 刻度设置
                    axisTick: {
                        // true意思：图形在刻度中间
                        // false意思：图形在刻度之间
                        alignWithLabel: false,
                        show: false
                    },
                    //文字
                    axisLabel: {
                        color: '#4c9bfd'
                    }
                }
            ],
            // 控制y轴
            yAxis: [
                {
                    // 使用数据的值设为刻度文字
                    type: 'value',
                    axisTick: {
                        // true意思：图形在刻度中间
                        // false意思：图形在刻度之间
                        alignWithLabel: false,
                        show: false
                    },
                    //文字
                    axisLabel: {
                        color: '#4c9bfd'
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(0, 240, 255, 0.3)'
                        }
                    },
                }
            ],
            // 控制x轴
            series: [

                {
                    // series配置
                    // 颜色
                    itemStyle: {
                        // 提供的工具函数生成渐变颜色
                        color: new echarts.graphic.LinearGradient(
                            // (x1,y2) 点到点 (x2,y2) 之间进行渐变
                            0, 0, 0, 1,
                            [
                                { offset: 0, color: '#00fffb' }, // 0 起始颜色
                                { offset: 1, color: '#0061ce' }  // 1 结束颜色
                            ]
                        )
                    },
                    // 图表数据名称
                    name: '用户统计',
                    // 图表类型
                    type: 'bar',
                    // 柱子宽度
                    barWidth: '60%',
                    // 数据
                    data: [2100, 1900, 1700, 1560, 1400, item, item, item, 900, 750, 600, 480, 240]
                }
            ]
        };
        return option;
    }


    render() {

        let option = {
            // 控制提示
            tooltip: {
                // 非轴图形，使用item的意思是放到数据对应图形上触发提示
                trigger: 'item',
                // 格式化提示内容：
                // a 代表图表名称 b 代表数据名称 c 代表数据  d代表  当前数据/总数据的比例
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            // 控制图表
            series: [
                {
                    // 图表名称
                    name: '地区',
                    // 图表类型
                    type: 'pie',
                    // 南丁格尔玫瑰图 有两个圆  内圆半径10%  外圆半径70%
                    // 百分比基于  图表DOM容器的半径
                    radius: ['10%', '70%'],
                    // 图表中心位置 left 50%  top 50% 距离图表DOM容器
                    center: ['50%', '50%'],
                    // 半径模式，另外一种是 area 面积模式
                    roseType: 'radius',
                    // 数据集 value 数据的值 name 数据的名称
                    data: [
                        { value: 20, name: '云南' },
                        { value: 5, name: '北京' },
                        { value: 15, name: '山东' },
                        { value: 25, name: '河北' },
                        { value: 20, name: '江苏' },
                        { value: 35, name: '浙江' },
                        { value: 30, name: '四川' },
                        { value: 40, name: '湖北' }
                    ],
                    //文字调整
                    label: {
                        fontSize: 10
                    },
                    //引导线
                    labelLine: {
                        length: 8,
                        length2: 10
                    }
                }
            ],
            color: ['#006cff', '#60cda0', '#ed8884', '#ff9f7f', '#0096ff', '#9fe6b8', '#32c5e9', '#1d9dff']
        };





        return (
            <div class="viewport" >
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
                                <a href="javascript:;" data-index="0" class="active">异常资产监控</a>
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
                                <ReactEcharts style={{ marginRight: '80px', float: 'right', width: '500px', height: '200px' }} option={this.getOption()} />
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
                            <ReactEcharts style={{ marginRight: '80px', float: 'right', width: '500px', height: '350px' }} option={this.getMapOption()} />
                            <div class="data">

                                <div class="item">
                                    <h4>320,11</h4>
                                    <span>
                                        <i class="icon-dot" style={{ color: '#ed3f35' }} ></i>
                               点位总数
                           </span>
                                </div>
                                <div class="item">
                                    <h4>418</h4>
                                    <span>
                                        <i class="icon-dot" style={{ color: '#eacf19' }}></i>
                               本月新增
                           </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="users panel">
                        <div class="inner">
                            <h3>全省资产总量统计</h3>
                            <div class="chart">
                                <ReactEcharts style={{ marginRight: '80px', float: 'right', width: '600px', height: '150px' }} option={this.getOption2()} />
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
                    {/* <ReactEcharts style={{width: '380px', height: '12px' }} option={this.getLineOption()} /> */}
                    </div>
                    <div class="wrap">
                        <div class="channel panel">
                            <div class="inner">
                                <h3>资产分布</h3>
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
                                <h3>一季度转资额</h3>
                                <div class="chart">
                                    <div class="box">
                                        {/* <ReactEcharts style={{ marginLeft:'10px', width: '120px', height: '3.5rem' }} option={this.getGugarOption()} />     */}
                                        <div class="label">75<small> %</small></div>
                                    </div>
                                    <div class="data">
                                        <div class="item">
                                            <h4>1,321</h4>
                                            <span>
                                                <i class="icon-dot" ></i>
                                        转资额(万元)
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
