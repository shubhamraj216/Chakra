import React, { Component } from 'react';

class Peers extends Component {
  render() {
    let seeders = this.props.peers.map(peer => <li>{peer}</li>);
    return (
      <div>
        <ul>
          {seeders}
        </ul>
      </div>
    );
  }
}

export default Peers;
