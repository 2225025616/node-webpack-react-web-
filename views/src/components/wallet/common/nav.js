import React, { Component } from 'react'
import { Menu } from 'antd';

 const lists = [
    {name: '首页', link: 'home'},
    {name: '中信积分明细', link: 'zxManage'},
    // {name: 'BTS明细', link: 'btsManage'},
    // {name: '钱包设置', link: 'setting'},
    {name: '转账', link: 'transform'}
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
