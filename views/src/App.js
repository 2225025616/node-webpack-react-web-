import React, { Component } from 'react';
import Routers from './router';
import { browserHistory } from 'react-router-dom'
class App extends Component {
  render() {
    return (
      <Routers history={browserHistory}/>
    )
  }
}

export default App;
