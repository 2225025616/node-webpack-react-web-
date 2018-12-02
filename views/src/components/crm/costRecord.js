import React, { Component } from 'react'
import { Table, Card, DatePicker, Button, Modal, Select } from 'antd';
import api from '../../api/crm';
import { formatDate, explorer } from '../../api/data';

const Option = Select.Option;

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
  }, {
    title: '交易类型',
    dataIndex: 'type',
    key: 'type',
  }, {
    title: '交易hash',
    dataIndex: 'transHash',
    render: text => <a href={`${explorer}${text}`} target='_blank'>{text}</a>
  }, {
    title: '交易流水号',
    dataIndex: 'transId',
    key: 'transId',
}];

class CostRecord extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      loading: true
    }
  }

  componentWillMount () {
    this.getTrans(3)
  }

  getTrans = (type) => {
    api.getOwnTrans({type: type}).then(res => {
      let data = res.data
      data.map((item,key) => {
        item.key = key;
        switch (item.type) {
          case 3: item.type = '消费'; break;
          case 4: item.type = '兑换BTS'; break;
          default: item.type = '-'; break;
        }
        return item;
      })
      this.setState({dataSource: data, loading: false})
    })
  }

  filterGroup() {
    return (
      <div style={{'display': 'flex', 'justifyContent':'space-between', 'width': '100%'}}>
        <div>
          <span style={{'marginRight': '10px'}}>交易类型</span>
          <Select defaultValue="3" onChange={(value) => this.getTrans(value)} style={{'width': '150px'}}>
            <Option value="3">消费</Option>
            <Option value="4">兑换BTS</Option>
          </Select>
        </div>
        <div>
          <Button style={{'marginRight': '10px'}}>全部</Button>
          <Button style={{'marginRight': '10px'}}>最近七天</Button>
          <Button>最近三十天</Button>
          <DatePicker style={{'marginLeft': '20px'}}/>
        </div>
      </div>
    )
  }

  render() {
    return (
      <Card title="消费记录" className="card">
        {this.filterGroup()}
        <Table style={{'marginTop': '20px'}} dataSource={this.state.dataSource} columns={columns}
        loading={this.state.loading}/>
      </Card>
    );
  }
}

export default CostRecord
