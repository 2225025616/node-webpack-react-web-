import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { Route, Switch, Redirect, browserHistory } from 'react-router-dom';

import Crm from './components/crm';
import Wallet from './components/wallet';
import Login from './components/login';
import Shop from './components/wallet/shop/shop';

class Routers extends Component {

  render() {
    return (
      <Switch history={browserHistory}>
         <Route exact path="/" render={(props)=>{
          if (localStorage.getItem('userInfo')) {
            return <Wallet {...props}/>
          } else {
            return <Redirect to="/login"/>
          }
        }}/>
        {/* <Route exact path="/" component={Wallet}/> */}

         <Route exact path="/login" component={Login}/>
        <Route exact path="/shop" render={(props)=>{
          if (localStorage.getItem('userInfo')) {
            return <Shop {...props}/>
          } else {
            return <Redirect to="/login"/>
          }
        }}/>
        <Route path="/admin" component={Crm}/>
      </Switch>
    );
  }
}

export default Routers
