import React, { Component } from 'react';

class Query extends Component {
  render() {
    let res = this.props.queries.map(query => 
      <ul key={query.key}>
        <li>{query.query}</li>
        {query.datas.map(data => 
          <li key={data.key}>{data.sender.substr(0, data.sender.search('/'))}: {data.text}</li>
        )}
      </ul>
    )
    return (
      <div>
        {res}
      </div>
    );
  }
}

export default Query;