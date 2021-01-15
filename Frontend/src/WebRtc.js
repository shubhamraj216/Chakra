import React, { Component } from 'react';
import io from 'socket.io-client';
import { v1 as uuid } from 'uuid';
import Peers from './Peers';
import Query from './Query';
// import Request from './Request';
import Form from './Form';
import { Link } from 'react-router-dom';
import './styles/WebRtc.css';
import { mongoSearch, compare } from './MongoHelp';
var MongoClient = window.require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
let collection;


let config = {
  'iceServers': [
    {
      'url': 'stun:stun.l.google.com:19302'
    },
    {
      "urls": "turn:13.27.10.1:3000?transport=tcp",
      "username": "shubham",
      "credential": "thunderBeast"
    }
  ]
};
let socket = io('http://localhost:3000');
let myID;
let myRoom;
let opc = {};
let apc = {};
let offerChannel = {};
let sendChannel = {};

let defaultChannel = socket;
let privateChannel = socket;

let urls = ["https://google.com", "https://ebay.com",
  "https://amazon.com", "https://msn.com",
  "https://yahoo.com", "https://wikipedia.org"];


class WebRtc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: [],
      response: [],
      query: "",
      request: [],
      joining: true,
      now: new Date()
    }

    this.handleQuery = this.handleQuery.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  setDefaultChannel = () => {
    defaultChannel.on('ipaddr', function (ipaddr) {
      console.log('Server IP address is: ' + ipaddr);
    });

    defaultChannel.on('created', (room) => {
      console.log('Created room', room, '- my client ID is', myID);
      this.setUpDone();
    });

    defaultChannel.on('joined', (room) => {
      console.log('This peer has joined room', room, 'with client ID', myID);
      this.setUpDone();
    });

    defaultChannel.on('full', function (room) {
      alert('Room ' + room + ' is full. We will create a new room for you.');
      window.location.hash = '';
      window.location.reload();
    });

    defaultChannel.on('log', function (array) {
      console.log.apply(console, array);
    });

    defaultChannel.on('ready', (newParticipantID) => {
      console.log('Socket is ready');
      this.setState(prev => ({ active: [...prev.active, { active: newParticipantID, key: uuid() }] }));
    });

    // For creating offers and receiving answers(of offers sent).
    defaultChannel.on('message', (message) => {
      if (message.type === 'newparticipant') {
        console.log('Client received message for New Participation:', message);
        let partID = message.from;

        offerChannel[partID] = socket;

        offerChannel[partID].on('message', (msg) => {
          if (msg.dest === myID) {
            if (msg.type === 'answer') {
              console.log('Got Answer.')
              opc[msg.from].setRemoteDescription(new RTCSessionDescription(msg.snDescription), function () { }, this.logError);
            } else if (msg.type === 'candidate') {
              console.log('Got ICE Candidate from ' + msg.from);
              opc[msg.from].addIceCandidate(new RTCIceCandidate({
                candidate: msg.candidate,
                sdpMid: msg.id,
                sdpMLineIndex: msg.label,
              }));
            }
          }
        });
        this.createOffer(partID);
      } else if (message.type === 'bye') {
        this.ParticipationClose(message.from);
      }
    });
  }

  setPrivateChannel = () => {
    // For receiving offers or ice candidates
    privateChannel.on('message', (message) => {
      if (message.dest === myID) {
        console.log('Client received message(Offer or ICE candidate):', message);
        if (message.type === 'offer') {
          this.createAnswer(message, privateChannel, message.from);
        } else if (message.type === 'candidate') {
          apc[message.from].addIceCandidate(new RTCIceCandidate({
            candidate: message.candidate,
            sdpMid: message.id,
            sdpMLineIndex: message.label,
          }));
        }
      }
    })
  }

  joinRoom = (roomName) => {
    myRoom = roomName;
    myID = this.props.id;

    console.log('My Id: ' + myID);

    this.setDefaultChannel();

    if (roomName !== '') {
      socket.emit('create or join', { room: myRoom, id: myID });
    }

    this.setPrivateChannel();

    window.onbeforeunload = function () {
      if (navigator.userAgent.indexOf("Chrome") !== -1) {
        for (let key in sendChannel) {
          if (sendChannel.hasOwnProperty(key) && sendChannel[key].readyState === 'open') {
            sendChannel[key].send(`-${myID}`);
          }
        }
      } else {
        socket.emit('message', { type: 'bye', from: myID });
      }
      return null;
    }
  }

  // When someone in room says Bye
  ParticipationClose = (from) => {
    console.log('Bye Received from client: ' + from);

    if (opc.hasOwnProperty(from)) {
      if (opc[from] !== null) {
        opc[from].close();
        opc[from].onicecandidate = null;
        opc[from] = null;
      }

    }

    if (apc.hasOwnProperty(from)) {
      if (apc[from] !== null) {
        apc[from].close();
        apc[from].onicecandidate = null;
        apc[from] = null;
      }
    }

    if (sendChannel.hasOwnProperty(from)) {
      delete sendChannel[from];
    }

    let active = this.state.active.filter(peer => peer.active !== from);
    this.setState({ active: active });
  }

  // Create Offer
  createOffer = (partID) => {
    console.log('Creating an offer for: ' + partID);
    opc[partID] = new RTCPeerConnection(config);
    opc[partID].onicecandidate = (event) => {
      console.log('IceCandidate event:', event);
      if (event.candidate) {
        offerChannel[partID].emit('message', {
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate,
          from: myID,
          dest: partID
        });
      } else {
        console.log('End of candidates.');
      }
    };

    try {
      console.log('Creating Send Data Channel');
      sendChannel[partID] = opc[partID].createDataChannel('exchange', { reliable: false });
      this.onDataChannelCreated(sendChannel[partID], 'send');

      let LocalSession = (partID) => {
        return (sessionDescription) => {
          let channel = offerChannel[partID];

          console.log('Local Session Created: ', sessionDescription);
          opc[partID].setLocalDescription(sessionDescription, function () { }, this.logError);

          console.log('Sending Local Description: ', opc[partID].localDescription);
          channel.emit('message', { snDescription: sessionDescription, from: myID, dest: partID, type: 'offer' });
        }
      }
      opc[partID].createOffer(LocalSession(partID), this.logError);
    } catch (e) {
      console.log('createDataChannel failed with exception: ' + e);
    }
  }

  // Create Answer
  createAnswer = (msg, channel, to) => {
    console.log('Got offer. Sending answer to peer.');
    apc[to] = new RTCPeerConnection(config);
    apc[to].setRemoteDescription(new RTCSessionDescription(msg.snDescription), function () { }, this.logError);

    apc[to].ondatachannel = (event) => {
      console.log('onReceivedatachannel:', event.channel);
      sendChannel[to] = event.channel;
      this.onDataChannelCreated(sendChannel[to], 'receive');
    };

    let LocalSession = (channel) => {
      return (sessionDescription) => {
        console.log('Local Session Created: ', sessionDescription);
        apc[to].setLocalDescription(sessionDescription, function () { }, this.logError);
        console.log('Sending answer to ID: ', to);
        channel.emit('message', { snDescription: sessionDescription, from: myID, dest: to, type: 'answer' });
      }
    }
    apc[to].createAnswer(LocalSession(channel), this.logError);

    this.setState(prevState => ({ active: [...prevState.active, { active: to, key: uuid() }] }));
  }

  // Data Channel Setup
  onDataChannelCreated = (channel, type) => {
    console.log('onDataChannelCreated:' + channel + ' with ' + type + ' state');

    channel.onopen = this.ChannelStateChangeOpen(channel);
    channel.onclose = this.ChannelStateChangeClose(channel);

    channel.onmessage = this.receiveMessage();
  }

  ChannelStateChangeClose = (channel) => {
    return () => {
      console.log('Channel closed: ' + channel);
      delete sendChannel[channel];
    }
  }

  ChannelStateChangeOpen = (channel) => {
    return () => {
      console.log('Channel state: ' + channel.readyState);

      let open = this.checkOpen();
      this.enableDisable(open);
    }
  }

  // Check data channel open
  checkOpen = () => {
    let open = false;
    for (let channel in sendChannel) {
      if (sendChannel.hasOwnProperty(channel)) {
        open = (sendChannel[channel].readyState === 'open');
        if (open === true) {
          break;
        }
      }
    }
    return open;
  }

  enableDisable = (open) => {
    if (open) {
      console.log('CHANNEL opened!!!');
      this.setState({ joining: false })
    } else {
      console.log('CHANNEL closed!!!');
    }
  }

  // new joinee sends a message to peers for connection
  setUpDone = () => {
    console.log('Initial Setup Done ...');
    socket.emit('message', { type: 'newparticipant', from: myID }, myRoom);
  }

  receiveMessage = () => {
    let count = 0, currCount, str;
    return onmessage = (event) => {
      if (event.data.source === "react-devtools-content-script" || event.data.payload) return;
      console.log(event.data);
      if (event.data[0] === '-') {
        this.ParticipationClose(event.data.substr(1));
        return;
      }
      if (isNaN(event.data) === false) {
        count = parseInt(event.data);
        currCount = 0;
        str = "";
        console.log(`Expecting a total of ${count} characters.`);
        return;
      }
      if (count === 0) return;

      let data = event.data;
      str += data;
      currCount += str.length;
      console.log(`Received ${currCount} characters of data.`);

      if (currCount === count) {
        console.log(`Rendering Data`);
        console.log(str);
        this.renderMessage(str);
      }
    };
  }

  globalSend = async (query) => {
    this.setState({ now: new Date() / 1000 , response: []})
    let CHUNK_LEN = 4000;

    let resObj = {};
    resObj['sender'] = myID;
    resObj['type'] = 'request';
    if (query === "") {
      alert("Nothing to send");
      return;
    }
    resObj['query'] = query;
    resObj['data'] = query;

    let data = JSON.stringify(resObj);

    let len = data.length;
    let n = len / CHUNK_LEN | 0;

    if (!sendChannel) {
      alert('Connection has not been initiated. Get two peers in the same room first');
      this.logError('Connection has not been initiated. Get two peers in the same room first');
      return;
    }

    for (let key in sendChannel) {
      if (sendChannel.hasOwnProperty(key) && sendChannel[key].readyState === 'open') {
        console.log("Global: Sending a data of length: " + len);
        sendChannel[key].send(len);
      }
    }

    for (let key in sendChannel) {
      if (sendChannel.hasOwnProperty(key) && sendChannel[key].readyState === 'open') {
        for (let i = 0; i < n; i++) {
          let start = i * CHUNK_LEN,
            end = (i + 1) * CHUNK_LEN;
          console.log(start + ' - ' + (end - 1));
          sendChannel[key].send(data.substr(start, end));
        }
      }
    }

    for (let key in sendChannel) {
      if (sendChannel.hasOwnProperty(key) && sendChannel[key].readyState === 'open') {
        if (len % CHUNK_LEN) {
          console.log(n * CHUNK_LEN + ' - ' + len);
          sendChannel[key].send(data.substr(n * CHUNK_LEN));
        }
      }
    }
    this.setState({ query: query });
    console.log('Sent all Data!');
    this.renderMessage(data);
  }

  privateSend = async (target, query) => {
    let CHUNK_LEN = 4000;

    let resObj = {};
    resObj['sender'] = myID;
    resObj['type'] = 'response';
    resObj['query'] = query;

    resObj['data'] = await mongoSearch(collection, resObj);
    console.log(resObj);
    let data = JSON.stringify(resObj);

    let len = data.length;
    let n = len / CHUNK_LEN | 0;

    if (!sendChannel[target]) {
      alert('Connection has not been initiated, or target is not in room.');
      this.logError('Connection has not been initiated, or target is not in room.');
      return;
    }

    if (sendChannel[target].readyState === 'open') {
      console.log("Private: Sending a data of length: " + len);
      sendChannel[target].send(len);
    }

    if (sendChannel[target].readyState === 'open') {
      for (let i = 0; i < n; i++) {
        let start = i * CHUNK_LEN,
          end = (i + 1) * CHUNK_LEN;
        console.log(start + ' - ' + (end - 1));
        sendChannel[target].send(data.substr(start, end));
      }
    }

    if (sendChannel[target].readyState === 'open') {
      if (len % CHUNK_LEN) {
        console.log(n * CHUNK_LEN + ' - ' + len);
        sendChannel[target].send(data.substr(n * CHUNK_LEN));
      }
    }

    console.log('Sent all Data!');
    this.setState(prevState => ({ request: [...prevState.request, { from: target, query: query, key: uuid() }] }))
  }

  renderMessage = async (msg) => {
    let obj = JSON.parse(msg);
    let sender = obj.sender;
    let type = obj.type;
    let query = obj.query;
    let data = obj.data;

    let results = [];
    if (type === 'request') {
      if (sender === myID) {
        let tempResults = await mongoSearch(collection, obj);
        results = [...results, ...tempResults];
        let response = results.map(r => {
          if(r.key) return r;
          else return {...r, key: uuid()};
        });
        this.setState({ response: response });
      } else {
        this.privateSend(sender, query);
      }
    } else {
      results = [...results, ...data];
      results.sort(compare);
      let response = results.map(r => {
        if (r.key) return r;
        else return { ...r, key: uuid() };
      })

      this.setState({ response: response });
    }
  }


  logError = (err) => {
    if (!err) return;
    if (typeof err === 'string') {
      console.warn(err);
    } else {
      console.warn(err.toString(), err);
    }
  }

  randomx = () => {
    let idx = Math.floor(Math.random() * urls.length);
    return urls[idx];
  }

  async componentDidMount() {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    const database = client.db('mydb');
    collection = database.collection('dse');

    socket = io('http://localhost:3000');
    opc = {};
    apc = {};
    offerChannel = {};
    sendChannel = {};

    defaultChannel = socket;
    privateChannel = socket;

    let room = this.props.room;

    this.joinRoom(room);

    setTimeout(() => this.setState({ joining: false }), 1000);
  }

  handleQuery(query) {
    this.globalSend(query.query);
  }

  componentWillUnmount() {
    if (navigator.userAgent.indexOf("Chrome") !== -1) {
      for (let key in sendChannel) {
        if (sendChannel.hasOwnProperty(key) && sendChannel[key].readyState === 'open') {
          sendChannel[key].send(`-${myID}`);
        }
      }
    } else {
      socket.emit('message', { type: 'bye', from: myID });
    }
    socket.close();
  }

  handleClick() {
    socket.emit('message', { type: 'bye', from: myID });
    socket.close();
  }

  render() {
    if (this.state.joining) {
      return <div class="WebRtc-loading-parent">
        <div class="WebRtc-loading">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h2>Joining Room {this.props.room}</h2>
      </div>
    }
    return (
      <div class="WebRtc">
        <h1>Room: {this.props.room}</h1>
        <div class="row">
          <Query queries={this.state.response} query={this.state.query} now={this.state.now} />
          {/* <Request requests={this.state.request} /> */}
          <Peers peers={this.state.active} />
        </div>
        <div class="WebRtc-bottom">
          <Form search={this.handleQuery} class="WebRtc-form" />
          <Link to="/"><button onClick={this.handleClick} class="WebRtc-back">Exit Room</button></Link>
        </div>
      </div>
    );
  }
}
export default WebRtc;