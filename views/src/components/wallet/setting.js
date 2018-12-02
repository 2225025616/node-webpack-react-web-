import React, { Component } from 'react'
import { Table, Card, DatePicker, Col, Row, Button, Modal, Input, notification, Icon } from 'antd';
import api from '../../api/wallet';

class Setting extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      ethAccount: '',
      btsAccount: '',
      newAddr: '',
      type: 'eth'
    }
  }

  componentWillMount() {
    let item = localStorage.getItem('userInfo')
    let userInfo = JSON.parse(item)
    this.setState({
      address: userInfo.public,
      btsAccount: userInfo.btsAccount
    })
    this.getBtsAccount()
  }

  showModal = (type) => {
    this.setState({
      visible: true,
      type
    })
  }

  handleOk = () => {
    this.relateBTS()
    this.setState({
      visible: false,
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }

  openNotificationWithIcon = (type, name) => {
    notification[type]({
      message: `${name}成功`,
      icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />
    });
  };

  getBtsAccount = () => {
    api.getBtsAccount().then(res => {
      this.setState({
        btsAccount: res.btsAccount
      })
    })
  }

  relateBTS = () => {
    api.relateBTS({btsAccount: this.state.newAddr}).then(res => {
      this.openNotificationWithIcon('success', '绑定')
      let userInfo = JSON.parse(localStorage.getItem('userInfo'))
      let newInfo = Object.assign({}, userInfo, {btsAccount: this.state.newAddr})
      localStorage.removeItem('userInfo')
      localStorage.setItem('userInfo', JSON.stringify(newInfo))
      this.setState({
        btsAccount: this.state.newAddr
      })
    })
  }

  changeWalletModal(type='绑定') {
    return (
      <div>
        <Modal title={`${type}钱包`} visible={this.state.visible} okText={`确认${type}`} cancelText="取消"
          onOk={() => this.handleOk()} onCancel={() => this.handleCancel()}>
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

  render() {
    return (
      <div>
        <Card className="card" title="钱包设置">
          <Card title="中信币钱包" className="card" extra={
            this.state.address? null:
            <Button type="primary" onClick={()=>this.showModal('eth')}>
              绑定钱包
            </Button>}
            >
            <p>钱包地址: <span style={{"fontWeight": 'bold'}}>{this.state.address}</span></p>
          </Card>
          <Card title="BTS钱包" className="card" extra={
            this.state.btsAccount?null:<Button type="primary" onClick={()=>this.showModal('bts')}>绑定承兑网关帐户</Button>}>
            <p>承兑网关账户: <span style={{"fontWeight": 'bold'}}>{this.state.btsAccount}</span></p>
          </Card>
        </Card>
        {this.changeWalletModal()}
      </div>
    );
  }
}

export default Setting
