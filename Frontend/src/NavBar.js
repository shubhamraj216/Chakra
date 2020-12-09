import React, { Component } from 'react';
import logo from './logo.svg';
import './styles/NavBar.css';

class NavBar extends Component {
  render() {
    return (
      <nav class="navbar navbar-expand-lg navbar-dark justify-content-between NavBar" >
        <img src={logo} alt='logo' className="NavBar-img" />
        <h3>CHAKRA</h3>
        <span className="navbar-text">
          Welcome {this.props.name.substr(0, this.props.name.search('/'))}
        </span>
      </nav>
    );
  }
}

export default NavBar;
