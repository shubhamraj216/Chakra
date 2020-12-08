import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import WebRtc from './WebRtc';
import Home from './Home';
import { v1 as uuid } from 'uuid';

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
    let rooms = x.data.map(room => ({ room: room, key: uuid() }));
    this.setState({ rooms: rooms });
  }
  render() {
    let joinRoom = routerProps => {
      let room = routerProps.match.params.roomName;
      return <WebRtc roomExist={true} room={room} {...routerProps} id={this.props.id} />
    }

    return (
      <div>
        <Switch>
          <Route exact path='/' render={() => <Home style={{ height: "100vh", zIndex: "10", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }} rooms={this.state.rooms} />} />
          <Route exact path='/:roomName' render={joinRoom} />
          <Redirect to='/' />
        </Switch>
      </div>
    );
  }
}

export default Router;