import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Router from './Router';

class App extends Component {
  constructor() {
    super();
    this.state = {
      name: ""
    }
  }
  componentDidMount() {
    let name = "/";
    while (!name.search('/')) {
      name = prompt("Enter your handle");
    }
    this.setState({name: `${name}/${this.generateID()}`})
  }

  // Generator for USER ID
  generateID = () => {
    let s4 = function () {
      return Math.floor(Math.random() * 0x10000).toString(16);
    };
    return s4() + '-' + s4();
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" style={{ position: "absolute" }} />
          <Router id={this.state.name} />
        </header>
      </div>
    );
  }
}

export default App;
