import React, { Component } from 'react';

class Peers extends Component {
  render() {
    let seeders = this.props.peers.map(peer => <li key={peer.key}>{peer.active.substr(0, peer.active.search('/'))}</li>);
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
