import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import WalletHeader from './common/header';
import WalletNav from './common/nav';
import Home from './home';
import Setting from './setting';
import BtsManage from './bts';
import ZxManage from './zxCoin';
import Transform from './transform';

import { Layout, Card, Col, Row, Icon, DatePicker } from 'antd';

const { Header, Sider, Content } = Layout;

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'home'
    }
  }

  handlePage = (page) => {
    this.setState({page: page});
  }

  switchPages = () => {
    switch (this.state.page) {
      case 'home': return <Home handlePage={(page) => this.handlePage(page)}/>;
      case 'setting': return <Setting/>;
      case 'zxManage': return <ZxManage/>;
      case 'btsManage': return <BtsManage/>;
      case 'transform': return <Transform/>;
      default: return <Home/>;
    }
  }

  render() {
    return (
      <Layout className="crm-home">
        <Header className="crm-header">
          <WalletHeader props={this.props} activeKey={['0']}></WalletHeader>
        </Header>
        <Layout>
        <Sider>
          <WalletNav handlePage={(page) => this.handlePage(page)}></WalletNav>
        </Sider>
        <Content className="content">
          {this.switchPages()}
        </Content>
        </Layout>
      </Layout>
    );
  }
}

export default Wallet
