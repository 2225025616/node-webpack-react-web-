import React, { Component } from 'react'
import { Table, Card, DatePicker, Col, Row, Button, Modal, InputNumber, Select } from 'antd';
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
  },{
    title: '接收用户',
    dataIndex: 'toUserName',
    key: 'toUserName'
  }, {
    title: '交易流水号',
    dataIndex: 'transId',
    key: 'transId',
}];

class SendRecord extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // showModal: false,
      // amount: 0,
      dataSource: [],
      loading: true
    }
  }

  componentWillMount () {
    this.getTrans(0)
  }

  // transformModal() {
  //   return (
  //     <div>
  //       <Modal title={`发行Token`} visible={this.state.showModal} okText={`确认发行`} cancelText="取消"
  //         onOk={() => this.handleOk('transform')} onCancel={() => this.handleCancel('transform')}>
  //           <p>请输入发行Token的数量</p>
  //           <InputNumber placeholder="请输入发行Token数量" style={{width: '200px'}}
  //           onChange={(value)=>{this.amount = value}}/>
  //       </Modal>
  //     </div>
  //   )
  // }

  // showModal = (model) => {
  //   this.setState({
  //     showModal: true
  //   })
  // }

  // handleOk = (model) => {
  //   this.mintToken()
  //   this.setState({showModal: false})
  // }

  // handleCancel = (model) => {
  //   this.setState({
  //     showModal: false
  //   })
  // }

  // // 给用户发放代币
  // distribute = (amount, userId) => {
  //   api.distribute().then(res => {
  //     console.log(res)
  //   })
  // }

  // // 铸币
  // mintToken = () => {
  //   api.mintToken({amount: this.amount}).then(res => {
  //     console.log(res)

  //   })
  // }

  // 记录查询
  getTrans = (type) => {
    api.getOwnTrans({type: type}).then(res => {
      let data = res.data
      data.map((item,key) => {
        item.key = key;
        switch (item.type) {
          case 0: item.type = '系统发放'; break;
          case 1: item.type = '增发'; break;
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
          <span style={{'marginRight': '10px'}}>类型</span>
          <Select defaultValue="0" onChange={(value) => this.getTrans(value)} style={{'width': '150px'}}>
            <Option value="0">发放记录</Option>
            <Option value="1">增发记录</Option>
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
      <Card className="card" title="发放记录">
        {this.filterGroup()}
        <Table style={{'marginTop': '20px'}} loading={this.state.loading} dataSource={this.state.dataSource} columns={columns}/>
        {/* {this.transformModal()} */}
      </Card>
    );
  }
}

export default SendRecord
