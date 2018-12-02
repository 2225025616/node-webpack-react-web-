import React, { Component } from 'react';
import { Icon } from 'antd';

class CrmHeader extends Component {

  render() {
    return (
      <div className="crm-header">
        <h1>中信CRM系统</h1>
        <div className="user">
          <Icon type="user" style={{fontSize: '16px',marginRight: '10px'}}/>
          <span style={{fontSize: '16px',marginRight: '30px'}}>Admin</span>
          <Icon style={{fontSize: '16px'}} type="logout" />
        </div>
      </div>
    );
  }
}

export default CrmHeader
