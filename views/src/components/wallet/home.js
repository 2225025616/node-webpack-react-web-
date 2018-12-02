import React, { Component } from 'react'
import { Table, Card, Col, Row, Button, Modal, Input, InputNumber, Spin, notification, Icon } from 'antd';
import api from '../../api/wallet';
import crmApi from '../../api/crm';
import { getTransType, getSymbol, formatDate } from '../../api/data';

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
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    render: text => <span>{getTransType(text)}</span>
  }
];

class Setting extends Component {

  constructor(props) {
    super(props);
    this.state = {
      createModal: false,
      transformModal: false,
      dataSource: [],
      relateBTS: false,
      newAddr: '',
      showSpin: false
    }
    this.ethAccount = {};
    this.btsAccount = {};
    this.percent = '1.1';
    this.exchangeAmount = 0;
  }

  componentWillMount () {
    this.getUserInfo()
    this.getTicker()
  }

  // 获取中信币/bts 兑换比例
  getTicker = () => {
    crmApi.getTicker().then(res => {
      this.percent = res.latest
    })
  }

  createEthAccountModal() {
    return (
      <div>
        <Modal title="创建钱包" visible={this.state.createModal}
          onOk={() => this.handleOk('create')} onCancel={() => this.handleCancel('create')}>
          <p>您的钱包地址</p>
          <p>{this.ethAccount.address}</p>
          <p>您的钱包私钥</p>
          <p>{this.ethAccount.private}</p>
          <p style={{color: 'red'}}>我们不会存储您的私钥。为了确保您的钱包安全及不会丢失，请立即备份私钥</p>
        </Modal>
      </div>
    )
  }

  transformModal(coinName='中信币') {
    return (
      <div>
        <Modal title={`兑换${coinName}`} visible={this.state.transformModal} okText={`确认兑换`} cancelText="取消"
          onOk={() => this.handleOk('transform')} onCancel={() => this.handleCancel('transform')}>
          <p>当前中信币/BTS比例: {this.percent}</p>
            <p>请输入你想兑换的数量</p>
            <InputNumber placeholder="请输入你想兑换的数量" style={{width: '200px'}}
            onChange={(value)=>{this.exchangeAmount = value}}/>
          <div>
          </div>
        </Modal>
      </div>
    )
  }

  showModal = (model) => {
    if (model === 'create') {
      this.setState({
        createModal: true
      })
    } else {
      this.setState({
        transformModal: true
      })
    }
  }

  handleOk = (model) => {
    if (model === 'create') {
      this.getUserInfo()
      this.setState({
        createModal: false
      })
    } else if (model === 'relate') {
      this.relateBTS()
      this.setState({
        relateBTS: false
      })
    } else {
      this.exchangeBTS(this.exchangeAmount)
      this.setState({
        transformModal: false
      })
    }
  }

  relateBTS = () => {
    api.getBtsInfo({name: this.state.newAddr}).then(res => {
      let btsInfo = JSON.stringify(res.info)
      if (btsInfo !== 'null' && btsInfo.length > 10) {
        api.relateBTS({btsAccount: this.state.newAddr}).then(res => {
          this.openNotificationWithIcon('success', '绑定成功')
          this.setState({
            showSpin: true
          })

          let timeOut = setInterval(()=>{
            api.getBtsAccount().then(res => {
              if (res.btsAccount) {
                this.setState({
                  btsAccount: res.btsAccount,
                  showSpin: false
                })
                clearInterval(timeOut)
              }
            })
          }, 3000)
        })
      } else {
        this.openNotificationWithIcon('error', 'BTS账户不存在，请先创建BTS账户')
      }
    })
  }

  openNotificationWithIcon = (type, name) => {
    notification[type]({
      message: `${name}`,
      icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />
    });
  };

  handleCancel = (model) => {
    if (model === 'create') {
      this.setState({
        createModal: false
      })
    } else if (model === 'relate') {
      this.setState({
        relateBTS: false
      })
    } else {
      this.setState({
        transformModal: false
      })
    }
  }

  getEthAccount = () => {
    api.generateAndSave({isUpdate: true}).then(res => {
      this.ethAccount = res
      this.showModal('create');
    })
  }

  isEthAddr = (addr) => {
    if (typeof(addr) === 'string' && addr.length === 42 && addr.startsWith('0x')) {
      return true
    }
    return false
  }

  changeWalletModal(type='绑定') {
    return (
      <div>
        <Modal title={`${type}钱包`} visible={this.state.relateBTS} okText={`确认${type}`} cancelText="取消"
          onOk={() => this.handleOk('relate')} onCancel={() => this.handleCancel('relate')}>
          <p>{this.state.type==='eth'?'钱包地址':'钱包账户'}</p>
          <Input onInput={(e)=>{this.setState({newAddr: e.target.value})}}/>
          <Row>
          <p style={{marginTop: '10px'}}>短信验证码</p>
          <div className="ant-search-input-wrapper">
            <div style={{display:'flex',position: "releative"}}>
              <Input placeholder="请输入短信验证码"/>
              <Button type="primary">发送验证码</Button>
            </div>
          </div>
          </Row>
        </Modal>
      </div>
    )
  }

  getBtsAccount = () => {
    api.getBtsAccount().then(res => {
      this.setState({
        btsAccount: res.btsAccount
      })
    })
  }

  exchangeBTS = (amount) => {
    api.exchangeBTS({quantity: amount}).then(res => {
      this.openNotificationWithIcon('success', '兑换成功')
    })
  }

  getEthBalance = (address) => {
    api.getETHBalance({address}).then(res => {
      this.setState({balance: res})
    }).catch(err => {
      console.log(err)
    })
  }

  getRecord = (userId) => {
    crmApi.getOwnTrans({userId}).then(res => {
      let data = res.data.map((item,key) => {
        item.key = key
        return item
      })
      this.setState({dataSource: data})
    })
  }

  getUserInfo = () => {
    api.getUser().then(res => {
      this.setState({
        address: res.public,
        btsAccount: res.btsAccount
      })
      if (this.isEthAddr(res.public)) {
        this.getEthBalance(res.public)
        this.getRecord(res.userId)
        this.getBtsAccount()
      }
    })
  }

  render() {
    return (
      <div>
        

        <Card className="card" title="钱包账户">
          <Card title="中信币钱包" className="card" extra={this.isEthAddr(this.state.address) && <Button type="primary"
          onClick={() => this.showModal('transform')}>兑换中信币</Button>}>
            {this.isEthAddr(this.state.address) ?
              <Row>
                <p>钱包余额: <span style={{"fontWeight": 'bold'}}>{this.state.balance}</span></p>
                <p>钱包地址: <span style={{"fontWeight": 'bold', 'letterSpacing': '1px', 'color':'#000'}}>{this.state.address}</span></p>
              </Row>:
              <Button type="primary" onClick={() => this.getEthAccount()}>创建账户</Button>
              }

          </Card>
          {this.isEthAddr(this.state.address) && <Card title="承兑网关" className="card">
            {(this.state.btsAccount || this.state.showSpin) ?
            <Row>
              
              <p>承兑网关账户: {this.state.showSpin ?
                <Spin/> :
                <span style={{"fontWeight": 'bold', 'letterSpacing': '1px', 'color':'#000'}}>
                  <img src={require('../../images/bts.jpeg')} style={{"width":'30px'}}/> {this.state.btsAccount}
                </span>}
              </p>
            </Row>:
            <Button type="primary" onClick={() => {this.setState({relateBTS: true})}}>绑定账户</Button>
            }
          </Card>
          }
        </Card>
        <Card className="card" title="账户记录">
          <Table dataSource={this.state.dataSource} columns={columns}/>
        </Card>
        {this.createEthAccountModal()}
        {this.transformModal()}
        {this.changeWalletModal()}
      </div>
    );
  }
}

export default Setting
