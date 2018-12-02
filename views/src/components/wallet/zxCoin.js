import React, { Component } from 'react';
import { Select, Card, Table, Col, Row, Button, Modal } from 'antd';
import crmApi from '../../api/crm';
import { getTransType, getSymbol, formatDate, explorer } from '../../api/data';

const { Option } = Select;

const columns = [
  {
    title: '时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: text => <span>{formatDate(text)}</span>
  }, {
    title: '数量',
    dataIndex: 'amount',
    key: 'amount',
    render: (text,record) => <span>{getSymbol({type:record.type, value:text})}</span>
  }, {
    title: '交易类型',
    dataIndex: 'type',
    key: 'type',
    render: text => <span>{getTransType(text)}</span>
  }, {
    title: '交易hash',
    dataIndex: 'transHash',
    key: 'transHash',
    render: text => <a href={`${explorer}${text}`} target='_blank'>{text}</a>
  },{
    title: '接收用户',
    dataIndex: 'toUserName',
    key: 'toUserName'
  }, {
    title: '交易流水号',
    dataIndex: 'transId',
    key: 'transId',
}];

const rowSelectOption = {
  type: 'checkbox'
};
class ZxManage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      userId: null
    }
  }

  componentWillMount() {
    let item = localStorage.getItem('userInfo')
    let userInfo = JSON.parse(item)
    this.setState({userId: userInfo.userId})
    this.getRecord(userInfo.userId)
  }

  getRecord = (userId, type=null) => {
    crmApi.getOwnTrans({userId, type}).then(res => {
      let data = res.data.map((item,key) => {
        item.key = key
        return item
      })
      this.setState({dataSource: data})
    })
  }

  filterGroup() {
    return (
      <div style={{'display': 'flex', 'justifyContent':'space-between', 'width': '100%'}}>
        <div>
          <span style={{'marginRight': '10px'}}>交易类型</span>
          <Select defaultValue="all" style={{'width': '150px'}} onChange={(value)=>{this.getRecord(this.state.userId, value)}}>
            <Option value="all">全部</Option>
            <Option value="0">系统发放</Option>
            <Option value="2">转账</Option>
            <Option value="3">消费</Option>
            <Option value="4">兑换BTS</Option>
            <Option value="5">参与竞猜</Option>
            <Option value="6">竞猜奖励</Option>
          </Select>
        </div>
        <div>
          <Button style={{'marginRight': '10px'}}>全部</Button>
          <Button style={{'marginRight': '10px'}}>最近七天</Button>
          <Button>最近三十天</Button>
        </div>
      </div>
    )
  }

  balance() {
    return (
      <div>
        <span style={{'display':'inline-block', 'marginRight': '20px'}}>收入:3000</span>
        <span>支出:1200</span>
      </div>
    )
  }

  render() {
    return (
      <Card className="card" title="中信积分明细" extra={this.balance()}>
        {this.filterGroup()}
        <Table style={{'marginTop': '20px'}} dataSource={this.state.dataSource} columns={columns}/>
      </Card>
    );
  }
}

export default ZxManage
