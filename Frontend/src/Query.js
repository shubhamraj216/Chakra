import React, { Component } from 'react';
import './styles/Query.css'
class Query extends Component {
  render() {
    let res = this.props.queries.reverse().map(query =>
      <ul key={query.key} >
        <li class='Query-child'>{query.query}</li>
        {query.datas.map(data =>
          <li class='Query-child' key={data.key}>{data.sender.substr(0, data.sender.search('/'))}: {data.text}</li>
        )}
        <hr />
      </ul>
    )
    return (
      <div class='Query col-6 scroll'>
        <h3 className='mt-3'>Queries</h3>
        {res}
      </div>
    )
  }
}

export default Query;