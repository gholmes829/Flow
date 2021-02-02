import React, { Component } from "react";
import logo from './logo.svg';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);
        	this.state = { };
    	}

	getPlaylist() {
		console.log("Requesting playlist!");
		fetch("http://catchthatflow.com:9000/spotify/playlist")
			.then(res => res.text())
			.then(res => console.log(res))
			.catch(err => err);
	}

	render() {
			return (
				<div className="App">
					<header className="App-header">
						<img src={logo} className="App-logo" alt="logo" />
						<h1 className="App-title">Welcome to React</h1>
					</header>
			<a href="http://catchthatflow.com:9000/spotify/login">Login</a>
			<button onClick={this.getPlaylist}>Playlist</button>
				</div>
			);
		}
	}

export default App;
