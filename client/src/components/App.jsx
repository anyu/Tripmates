import React from 'react';
import { Route, Link, Redirect, Switch, BrowserRouter as Router } from 'react-router-dom';

import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile';
import CreateTrip from './CreateTrip';
import ContributeTrip from './ContributeTrip';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedInUser: '',
      currentTrip: ''
    }
    this.checkUser = this.checkUser.bind(this);
    this.updateCurrentTrip = this.updateCurrentTrip.bind(this);
  }

  checkUser(user) {
    this.setState({
      loggedInUser: user
    });
  }

  updateCurrentTrip(trip) {
    this.setState({
      currentTrip: trip
    });
  }

  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route exact path="/" render={(props) => (<Home loggedInUser={this.state.loggedInUser} {...props} />)} />
            <Route path="/signup" render={(props) => (<Signup checkUser={this.checkUser} loggedInUser={this.state.loggedInUser} {...props} />)} />
            <Route path="/login" render={(props) => (<Login checkUser={this.checkUser} loggedInUser={this.state.loggedInUser} {...props} />)} />
            <Route path="/profile" render={(props) => (<Profile loggedInUser={this.state.loggedInUser} updateCurrentTrip={this.updateCurrentTrip} currentTrip={this.state.currentTrip} {...props} />)} />
            <Route path="/createTrip" render={(props) => (!this.state.loggedInUser ?
                (<Redirect to="/login"/>) : (<CreateTrip loggedInUser={this.state.loggedInUser} {...props} />))} />
            <Route path="/contributeTrip" render={(props) => (!this.state.loggedInUser ?
              (<Redirect to="/login"/>) : (<ContributeTrip loggedInUser={this.state.loggedInUser} currentTrip={this.state.currentTrip} {...props} />))} />
          </Switch>
        </Router>
      </div>
  )}
}


export default App;
