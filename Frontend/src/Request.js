import React, { Component } from 'react';
class Request extends Component {
  render() {
    let requests = this.props.requests.map(request => (<li key={request.key}>{`${request.from.substr(0, request.from.search('/'))}: ${request.query}`}</li>));
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