import React, { Component } from 'react';

class Query extends Component {
  render() {
    let res = this.props.queries.map(query => {
      return <div>
        <li>{query.query}</li>
        {query.datas.map(data => {
          return <li>{data}</li>
        })}
      </div>
    })
    return (
      <div>
        {res}
      </div>
    );
  }
}

export default Query;