import React from 'react';
import './App.css';
import Home from './Components/Home.js'
import { Route, BrowserRouter, Redirect, Switch } from 'react-router-dom'
import LocalDisplay from './Components/LocalDisplay.js'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
        <Redirect exact from="/" to="/home" />
        <Route path='/local/:cid' exact component={LocalDisplay} />
        <Route path='/home' component={Home} />
        </Switch>
        </BrowserRouter>
    </div>
  );
}

export default App;
