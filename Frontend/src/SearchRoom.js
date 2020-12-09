import React, { Component } from 'react';
import './styles/SearchRoom.css';

class SearchRoom extends Component {
  render() {
    return (
      <form class="col-6 SearchRoom">
        <input 
          class ="SearchRoom-input"
          type="text"
          name="searchRoom"
          placeholder="Search Room"
          value={this.props.value}
          onChange={this.props.handleChange}
        />
      </form>
    );
  }
}

export default SearchRoom;