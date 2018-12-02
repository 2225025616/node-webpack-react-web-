import React, { Component } from 'react'
import { Layout, Card, Col, Row, Icon, DatePicker } from 'antd';
import echarts from 'echarts';
import api from '../../api/crm';
const BigNumber = require('bignumber.js');

const overView = [
  {name: '已发行总量', value: '132,580,360', field: 'all'},
  {name: '今日发行', value: '80,360'},
  {name: '昨日发行', value: '70,360'},
  {name: 'ZXT/Gate', value: '1.01', field: 'ticker'}
];

const lineAndBarOptions = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
        type: 'cross',
        crossStyle: {
            color: '#999'
        }
    }
  },
  legend: {
    data:['新增发行', '累计发行']
  },
  xAxis: [
    {
      type: 'category',
      data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
      axisPointer: {
        type: 'shadow'
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '发行量',
      min: 0,
      max: 250,
      interval: 50,
      axisLabel: {
          formatter: '{value}'
      }
    },
    {
      type: 'value',
      name: '',
      min: 0,
      max: 25,
      interval: 5,
      axisLabel: {
          formatter: ''
      }
    }
  ],
  series: [
      {
          name:'新增发行',
          type:'bar',
          data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
      },
      {
          name:'累计发行',
          type:'line',
          yAxisIndex: 1,
          data:[2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
      }
  ]
};
const pieOptions = {
    title : {
        x:'center'
    },
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        data: ['直接访问','邮件营销']
    },
    series : [
        {
            name: '访问来源',
            type: 'pie',
            radius : '55%',
            center: ['50%', '60%'],
            data:[
                {value:335, name:'主账户持有量'},
                {value:310, name:'非主账户持有量'}
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};
const pieDoughnutOptions = {
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    series: [
        {
            name:'访问来源',
            type:'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        fontSize: '30',
                        fontWeight: 'bold'
                    }
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data:[
                {value:335, name:'直接访问'},
                {value:310, name:'邮件营销'},
                {value:234, name:'联盟广告'},
                {value:135, name:'视频广告'},
                {value:1548, name:'搜索引擎'}
            ]
        }
    ]
};
const buyBar = {
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar'
    }]
};
const sellBar = {
  xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
      type: 'value'
  },
  series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
  }]
};
const echartLists = [
  {id: 'line-and-bar' , options: lineAndBarOptions},
  {id: 'pie' , options: pieOptions},
  {id: 'pie-doughnut' , options: pieDoughnutOptions},
  {id: 'buy-bar' , options: buyBar},
  {id: 'sell-bar' , options: sellBar}
]


class OverView extends Component {

  constructor(props) {
    super(props);
    this.totalCoin = ''
    this.state = {
      overView: []
    }
  }
  componentDidMount () {
    echartLists.map(item => {
      let myChart = echarts.init(document.getElementById(item.id));
      myChart.setOption(item.options);
    })
    this.getTicker()
    this.getTotalSupply()
  }

  getTotalSupply = () => {
    api.getTotalSupply().then(res => {
      overView.map(item => {
        if (item.field === 'all') {
          item.value = (res.total || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
        }
      })
      this.setState({overView: overView})
    })
  }

  getTicker = () => {
    api.getTicker().then(res => {
      overView.map(item => {
        if (item.field === 'ticker') {
          item.value = res.latest
        }
      })
      this.setState({overView: overView})
    })
  }

  render() {
    return (
      <div>
        <Card className="card" title="总览">
          <Row gutter={16}>
          {this.state.overView.map((item,key) => (
            <Col span={6} key={key}>
              <Card className="data">
                <Row style={{display:'flex', flexDirection:'row'}}>
                    <Col>
                        <Icon type="bank" style={{fontSize: '24px',marginRight: '10px'}}/>
                    </Col>
                    <Col>
                    <div style={{display:'flex', flexDirection:'column'}}>
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                    </div>
                    </Col>
                </Row>
              </Card>
            </Col>
          ))}
          </Row>
        </Card>
        <Card className="card" title="数据统计">
          <Card title="发放统计" extra={<DatePicker/>}>
            <div id="line-and-bar" style={{width: '800px', height: '400px'}}></div>
          </Card>
          <Row gutter={32}>
            <Col span={12}>
              <Card className="card" title="主账户持有量">
                <div id="pie" style={{width: '300px', height: '300px'}}></div>
              </Card>
            </Col>
            <Col span={12}>
              <Card className="card" title="发放分析" >
                <div id="pie-doughnut" style={{width: '300px', height: '300px'}}></div>
              </Card>
            </Col>
          </Row>
          <Card className="card" title="主账户持有量" extra={<DatePicker />}>
            <Row gutter={48}>
              <Col span={12}>
                <div id="buy-bar" style={{width: '400px', height: '400px'}}></div>
              </Col>
              <Col span={12}>
                <div id="sell-bar" style={{width: '400px', height: '400px'}}></div>
              </Col>
            </Row>
          </Card>
        </Card>
      </div>
    );
  }
}

export default OverView
