import React, { Component } from 'react';

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = { query: "" }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(evt) {
    this.setState({
      [evt.target.name]: evt.target.value
    })
  }

  handleSubmit(evt) {
    evt.preventDefault();
    if(this.state.query === '') {
      alert('Provide Some Input First');
      return;
    }
    this.props.search(this.state);
    this.setState({ query: "" });
  }
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="query">Search Query: </label>
          <input type='text'
            id='query'
            name='query'
            value={this.state.query}
            onChange={this.handleChange}
          />
          <button>Search!</button>
        </form>
      </div>
    );
  }
}

export default Form;