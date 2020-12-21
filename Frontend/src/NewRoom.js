import React, { Component } from 'react';
import './styles/NewRoom.css';
class NewRoom extends Component {
  render() {
    return (
      <form class="col-lg-5 col-xs-12 NewRoom" onSubmit={this.props.handleSubmit}>
        <input
          class="NewRoom-input"
          type="text"
          name="newRoom"
          placeholder="Create New Room"
          value={this.props.value}
          onChange={this.props.handleChange}
        />
        <button class="NewRoom-button">Create</button>
      </form>
    );
  }
}

export default NewRoom;