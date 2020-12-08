import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Home extends Component {
  render() {
    let rooms = this.props.rooms.map(room => <li key={room.key}><Link to={`/${room.room}`}>{room.room}</Link></li>)
    return (
      <ul> {rooms} </ul>

    );
  }
}

export default Home;