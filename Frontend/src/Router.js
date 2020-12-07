import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import WebRtc from './WebRtc';
import Home from './Home';

class Router extends Component {
  constructor() {
    super();
    this.state = {
      rooms: []
    }
  }
  async componentDidMount() {
    let x = await axios('/getRooms');
    console.log(x.data);
    this.setState({ rooms: x.data });
  }
  render() {
    let joinRoom = routerProps => {
      let room = routerProps.match.params.roomName;
      return <WebRtc roomExist={true} room={room} {...routerProps} />
    }


    return (
      <div>
        <Switch>
          <Route exact path='/' render={() => <Home rooms={this.state.rooms} />} />
          <Route exact path='/:roomName' render={joinRoom} />
          <Redirect to='/' />
        </Switch>
      </div>
    );
  }
}

export default Router;