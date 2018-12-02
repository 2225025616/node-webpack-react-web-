import React, { Component } from 'react'
import { Select, Card, Table, Col, Row, Button, Modal } from 'antd';

const { Option } = Select;

const dataSource = [{
  key: '1',
  toAddr: '0x1234',
  age: 32,
  num: '12',
  type: '兑换',
  time: '2017-07-19 14:48:38',
  status: '已确认'
}];
const columns = [
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
  }, {
    title: '数量',
    dataIndex: 'num',
    key: 'num',
  },  {
    title: '交易类型',
    dataIndex: 'type',
    key: 'type',
  },{
    title: '交易hash',
    dataIndex: 'hash',
    key: 'hash',
  },{
    title: '交易对象地址',
    dataIndex: 'toAddr',
    key: 'toAddr',
  }, {
    title: '交易状态',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: '交易关联hash',
    key: 'trHash',
    dataIndex: 'trHash'
  }
];
const rowSelectOption = {
  type: 'checkbox'
};
class BtsManage extends Component {

  constructor(props) {
    super(props);
  }

  filterGroup() {
    return (
      <div style={{'display': 'flex', 'justifyContent':'space-between', 'width': '100%'}}>
        <div>
          <span style={{'marginRight': '10px'}}>交易类型</span>
          <Select defaultValue="all">
            <Option value="all">全部</Option>
            <Option value="jack">Jack</Option>
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
      <Card className="card" title="BTS明细" extra={this.balance()}>
        {this.filterGroup()}
        <Table style={{'marginTop': '20px'}} dataSource={dataSource} columns={columns} rowSelection={rowSelectOption}/>
      </Card>
    );
  }
}

export default BtsManage
