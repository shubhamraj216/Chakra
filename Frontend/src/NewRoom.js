import React, { Component } from 'react';
import './styles/NewRoom.css';
class NewRoom extends Component {
  render() {
    return (
      <form class="col-6 NewRoom" onSubmit={this.props.handleSubmit}>
          <input
            class="NewRoom-input"
            type="text"
            name="newRoom"
            placeholder="Create New Room"
            value={this.props.value}
            onChange={this.props.handleChange}
          />
          <button class="NewRoom-button">Create Room</button>
      </form>
    );
  }
}

export default NewRoom;