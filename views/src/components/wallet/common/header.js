import React, { Component } from 'react';
import { Icon, Button } from 'antd';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

class CrmHeader extends Component {

  constructor(props) {
    super(props);
    this.userName = ''
  }

  componentWillMount () {
    let userInfo = localStorage.getItem('userInfo')
    this.userName = JSON.parse(userInfo).userName
  }

  signOut = () => {
    localStorage.removeItem('userInfo')
    this.props.props.history.push('/login')
  }

  render() {
    return (
      <div className="crm-header">
        <div style={{'display':'flex'}}>
          <h1 style={{marginRight: '94px'}}>中信</h1>
          <Menu defaultSelectedKeys={this.props.activeKey} mode="horizontal"
          style={{'display':'flex','alignItems':'flex-end'}}>
            <Menu.Item key="0">
              <Link to="/">账户</Link>
            </Menu.Item>
            <Menu.Item key="1">
              <Link to="/shop">积分商城</Link>
            </Menu.Item>
          </Menu>
        </div>
        <div className="user">
          <Icon style={{fontSize: '16px',marginRight: '10px'}}type="user" />
          <span style={{fontSize: '16px',marginRight: '30px'}}>{this.userName}</span>
          <Icon onClick={()=>{this.signOut()}} style={{fontSize: '16px'}} style={{cursor: 'pointer'}} type="logout" />
        </div>
      </div>
    );
  }
}

export default CrmHeader
