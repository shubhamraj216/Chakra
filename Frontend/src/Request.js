import React, { Component } from 'react';

class Request extends Component {
  render() {
    let requests = this.props.requests.map(request => (<li>{`${request.from}: ${request.query}`}</li>));
    return (
      <div>
        <ul>
          {requests}
        </ul>
      </div >
    );
  }
}

export default Request;