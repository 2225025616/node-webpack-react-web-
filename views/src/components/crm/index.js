import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CrmHeader from './common/header';
import CrmNav from './common/nav';
import OverView from './overView';
import SendRecord from './sendRecord';
import CostRecord from './costRecord';
import GuessGame from './guessGame';
import Send from './send';

import { Layout, Card, Col, Row, Icon, DatePicker } from 'antd';

const { Header, Sider, Content } = Layout;

class Crm extends Component {
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
      case 'home': return <OverView/>;
      case 'send': return <Send/>;
      case 'sendRecord': return <SendRecord/>;
      case 'costRecord': return <CostRecord/>;
      case 'guessGame': return <GuessGame/>;
      default: return <OverView/>;
    }
  }

  render() {
    return (
      <Layout className="crm-home">
        <Header className="crm-header">
          <CrmHeader></CrmHeader>
        </Header>
        <Layout>
        <Sider>
          <CrmNav handlePage={(page) => this.handlePage(page)}></CrmNav>
        </Sider>
        <Content className="content">
          {this.switchPages()}
        </Content>
        </Layout>
      </Layout>
    );
  }
}

export default Crm
