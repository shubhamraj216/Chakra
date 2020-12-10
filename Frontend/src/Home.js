import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { v1 as uuid } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRedo } from '@fortawesome/free-solid-svg-icons'
import NewRoom from './NewRoom';
import SearchRoom from './SearchRoom';
import './styles/Home.css';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      rooms: [],
      newRoom: "",
      searchRoom: "",
      fetching: true,
      clicked: false
    }
    this.handleNewRoomChange = this.handleNewRoomChange.bind(this);
    this.handleNewRoomSubmit = this.handleNewRoomSubmit.bind(this);

    this.handleSearchRoomChange = this.handleSearchRoomChange.bind(this);

    this.handleClick = this.handleClick.bind(this);
  }

  handleNewRoomChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value })
  }

  handleNewRoomSubmit(evt) {
    evt.preventDefault();
    if (this.state.newRoom === '') {
      alert('RoomName Should Not Be Empty');
      return;
    }
    let present = this.state.rooms.find(room => room.room.toLowerCase() === this.state.newRoom.toLowerCase());
    if (present) {
      alert('Room already present');
      this.setState({ newRoom: "" });
      return;
    }

    let link = `/${this.state.newRoom}`;
    this.setState({ newRoom: "" });
    this.props.history.push(link);
  }

  handleSearchRoomChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  handleClick() {
    this.setState(st => ({ clicked: !st.clicked, fetching: !st.fetching }));
  }

  async componentDidMount() {
    let getRooms = await axios('/getRooms');
    let rooms = getRooms.data.map(room => ({ room: room, key: uuid() }));
    setTimeout(() => this.setState({ rooms: rooms, fetching: false }), 1000);
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.clicked !== this.state.clicked) {
      let getRooms = await axios('/getRooms');
      let rooms = getRooms.data.map(room => ({ room: room, key: uuid() }));
      setTimeout(() => this.setState({ rooms: rooms, fetching: false }), 500);
    }
  }

  render() {
    if (this.state.fetching) {
      return <div class="Home-Box-parent">
        <div class="Home-Box">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h2>Getting Rooms...</h2>
      </div>
    }

    let searchRooms = this.state.rooms.filter(room => room.room.toLowerCase().includes(this.state.searchRoom.toLowerCase()));
    let rooms = searchRooms.map(room =>
      <Link key={room.key}
        class="Home-room col-md-4 col-sm-6 sol-xs-12"
        to={`/${room.room}`}
      >
        {room.room}
      </Link>
    )
    return (
      <div class="Home row">
        <NewRoom value={this.state.newRoom}
          handleChange={this.handleNewRoomChange}
          handleSubmit={this.handleNewRoomSubmit}
        />
        <SearchRoom value={this.state.searchRoom}
          handleChange={this.handleSearchRoomChange}
        />
        <button onClick={this.handleClick} class="row-3 Home-refresh"><FontAwesomeIcon className='Home-fa' icon={faRedo} />Refresh List</button>
        {rooms}
      </div>
    );
  }
}

export default Home;