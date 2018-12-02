import React, { Component } from 'react'
import { Menu } from 'antd';

 const lists = [
    {name: '总览', link: 'home'},
    {name: '发放/发行', link: 'send'},
    {name: '发放记录', link: 'sendRecord'},
    {name: '消费记录', link: 'costRecord'},
    {name: '创建竞猜合约', link: 'guessGame'}
  ]
class CrmNav extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Menu className="crm-nav" defaultSelectedKeys={['0']}>
        {lists.map((item,key) => (
          <Menu.Item key={key}>
            <div onClick={() => {this.props.handlePage(item.link)}}>{item.name}</div>
          </Menu.Item>
        ))}
      </Menu>
    );
  }
}

export default CrmNav
