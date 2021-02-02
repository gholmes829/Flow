import React, { Component } from "react";
import logo from './logo.svg';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);
        	this.state = { };
    	}

	connectToSpotify() {
		console.log("Requesting login!");
		fetch("http://catchthatflow.com:9000/spotify/login")
			.then(res => res.text())
			.then(res => console.log(JSON.parse(res)))
			.catch(err => err);
	}

	render() {
			return (
				<div className="App">
					<header className="App-header">
						<img src={logo} className="App-logo" alt="logo" />
						<h1 className="App-title">Welcome to React</h1>
					</header>
			<a href="http://catchthatflow.com:9000/spotify/login">Login For Sure</a>
			<button onClick={this.connectToSpotify}>Login</button>
				</div>
			);
		}
	}

export default App;
