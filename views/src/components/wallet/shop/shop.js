import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import WalletHeader from '../common/header';
import WalletNav from '../common/nav';
import api from '../../../api/wallet';
import gameApi from '../../../api/guessGame';

import { Layout, Card, Col, Row, Icon, InputNumber, Alert, notification,
  Select, Menu, Button, Tooltip, Progress, Modal } from 'antd';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const top = [
  {name: '行情智能提醒', amount: '100'},
  {name: '智能投顾服务（1次）', amount: '150'},
  {name: '南方现金增利100元', amount: '200'},
  {name: '中国移动话费50元', amount: '100'},
  {name: '公新锐现金抵扣券100元', amount: '99'},
  {name: '中国移动话费100元', amount: '1100'},
  {name: '中国移动流量1G', amount: '99'}
];
const hot = [
  {name: '行情智能提醒', amount: '100', rmb: '100'},
  {name: '智能投顾服务（1次）', amount: '150', rmb: '100'},
  {name: '南方现金增利100元', amount: '200', rmb: '100'},
  {name: '中国移动话费50元', amount: '100', rmb: '50'}
];
const active = [
  'ETH 5月5日是涨是跌？',
  '沪深300指数5月1日是涨是跌？',
  'BTC 4月28日是涨是跌？'
]
class Shop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      modalType: 'consume',
      modalName: '',
      modalValue: '',
      consumeAmount: 0,
      award: false,
      approve: false,
      contractBlance: ''
    },
    this.gameInfo = {}
  }

  componentWillMount () {
    this.latestGame()
    this.getApprove()
    this.getContractBalance()
  }

  showModal = (name, value, type='consume') => {
    this.setState({
      visible: true,
      modalName: name,
      modalValue: value,
      modalType: type
    })
  }

  handleOk = (name) => {
    if (name === '兑换') {
      this.consumeToken(name)
    } else if (name === '竞猜') {
      this.guessGame()
    }
    this.setState({
      visible: false,
      modalName: '',
      modalValue: '',
      consumeAmount: 0
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      modalName: '',
      modalValue: '',
      consumeAmount: 0
    });
  }

  consumeTokenModal() {
    let type = this.state.modalType
    return (
      <div>{
        type == 'consume'?
        <Modal title={`确认订单`} visible={this.state.visible} okText={`提交订单`} cancelText="取消"
          onOk={() => this.handleOk('兑换')} onCancel={() => this.handleCancel('transform')}>
            <p>商品名称：{this.state.modalName}</p>
            <p>商品金额：{this.state.modalValue}中信币</p>
        </Modal>:
        <Modal title={`竞猜订单`} visible={this.state.visible} okText={`提交订单`} cancelText="取消"
          onOk={() => this.handleOk('竞猜')} onCancel={() => this.handleCancel('transform')}>
            <p>竞猜项目：{this.state.modalName}</p>
            <p>竞猜结果：{this.state.modalValue===1? '涨':'跌'}</p>
            <div>
              <span>竞猜金额：</span>
              <InputNumber min={0} style={{width: '150px'}} onChange={(value)=>{this.setState({consumeAmount: value})}}/>
            </div>
            {/* <p style={{marginTop: '20px'}}>猜对返还：{this.state.consumeAmount * 2}</p> */}
        </Modal>}
      </div>
    )
  }

  // 下注
  guessGame = () => {
    let amount = this.state.consumeAmount ? this.state.consumeAmount : this.state.modalValue
    let gameValue = this.state.modalValue
    let gameId = this.gameInfo.id
    gameApi.guessGame({gameValue, amount, gameId}).then(res => {
      this.openNotificationWithIcon('success', '竞猜成功')
    })
  }

  // 获取最新的游戏
  latestGame = () => {
    gameApi.latestGame().then(res => {
      this.gameInfo = res.data.result[0]
      if (this.gameInfo.result) {
        this.isGuessSuccess({gameId: this.gameInfo.id})
      }
    })
  }

  // 领取奖励
  getCandy = () => {
    gameApi.getCandy({gameId: this.gameInfo.id}).then(res => {
      this.openNotificationWithIcon('success', '领取成功')
      this.setState({award: false})
    })
  }

  // 查询中奖
  isGuessSuccess = ({gameId}) => {
    gameApi.isGuessSuccess({gameId}).then(res => {
      console.log(res)
      if (res) {
        this.setState({award: true})
      }
    })
  }

  // 授权
  approveGame = () => {
    gameApi.approveGame({value: this.gameInfo.amount}).then(res => {
      this.openNotificationWithIcon('success', '授权成功')
      this.setState({approve: true})
    }).catch(err => {
      console.log(err)
    })
  }

  // 授权
  getApprove = () => {
    gameApi.getApprove().then(res => {
      if (res.amount) {
        this.setState({approve: true})
      } else {
        this.setState({approve: false})
      }
    }).catch(err => {
      console.log(err)
    })
  }

  consumeToken = (name) => {
    let amount = this.state.consumeAmount ? this.state.consumeAmount : this.state.modalValue
    api.consumeToken(amount).then(res => {
      this.openNotificationWithIcon('success', `${name}成功`)
    })
  }

  getContractBalance = () => {
    api.getContractBalance().then(res => {
      console.log(res)
      this.setState({contractBlance: res})
    })
  }

  openNotificationWithIcon = (type, name) => {
    notification[type]({
      message: `${name}`,
      icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />
    });
  };

  render() {
    return (
      <Layout className="crm-home">
        <Header className="crm-header">
          <WalletHeader props={this.props} activeKey={['1']}></WalletHeader>
        </Header>
        {this.state.award && <Card className="card">
          <span style={{fontWeight: 'bold', fontSize: '18px'}}>竞猜成功，领取奖励！</span>
          <Button type="primary" onClick={()=>{this.getCandy()}}>点击领取</Button>
        </Card>}
        <Layout>
          <Content className="content">
            <Card title="热门兑换" className="card">
              <div style={{display:'flex',justifyContent:'space-between'}}>
                {hot.map((item,key) => (
                  <div key={key}>
                    <img/>
                    <h3>{item.name}</h3>
                    <p>{item.amount}中信币</p>
                    <p>市场价 ¥{item.rmb}</p>
                    <Button onClick={()=>{this.showModal(item.name,item.amount)}} type="primary">我要兑换</Button>
                  </div>
                ))}
              </div>
            </Card>
            <Card title={'竞猜活动 奖池余额('+this.state.contractBlance+')'} className="card">
              {this.state.approve?
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <Card title="本期活动" style={{width:'350px'}} bordered={false}>
                  <p>{this.gameInfo.gameName || '竞猜游戏'}</p>
                  <Tooltip title="3 done / 7 to do">
                    <Progress percent={100} successPercent={30} showInfo={false} status="exception"/>
                  </Tooltip>
                  {this.gameInfo.result?
                    <p>本期结果: {this.gameInfo.result===1?'涨':'跌'}</p>:
                    <div style={{marginTop:'30px',display:'flex',justifyContent:'space-between'}}>
                      <Button onClick={()=>{this.showModal(this.gameInfo.gameName || '竞猜游戏',1,'guess')}} type="danger" ghost>猜涨</Button>
                      <Button onClick={()=>{this.showModal(this.gameInfo.gameName || '竞猜游戏',2,'guess')}} type="primary">猜跌</Button>
                    </div>
                  }
                </Card>
                <Card title="往期活动" bordered={false} style={{paddingLeft:'20px',borderLeft:'solid 1px #ededed'}}>
                  <div style={{display:'flex',flexDirection:'column'}}>
                    {active.map((item,key) => (
                      <a key={key} href='#' style={{display:'inline-block',margin:'10px 0'}}>{item}</a>
                    ))}
                  </div>
                </Card>
              </div>:
              <div>
                <p>需要授权才能参与区块链竞猜活动</p>
                <Button type="primary" onClick={()=>{this.approveGame()}}>点击授权</Button>
              </div>
              }
            </Card>
          </Content>
          <Sider width='500px' className="shop-nav">
            <Card title="兑换Top">
              <div style={{display:'flex', flexDirection:'column', justifyContent:'space-around'}}>
                {top.map((item,key) => (
                  <div key={key} style={{display:'flex',justifyContent:'space-between', marginBottom:'20px'}}>
                    <aside>{key+1}</aside>
                    <span>{item.name}</span>
                    <span>{item.amount} 中信币</span>
                  </div>
                ))}
              </div>
              </Card>
          </Sider>
        </Layout>
        {this.consumeTokenModal()}
      </Layout>
    );
  }
}

export default Shop
