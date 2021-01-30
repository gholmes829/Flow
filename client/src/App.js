import React, { Component } from "react";
import logo from "./logo.svg";
import { SpotifyWebApi } from './spotify-web-api.js';
import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { };
	var spotifyAPI = new SpotifyWebApi();
	window.addEventListener('DOMContentLoaded', (event) => {
		var url = window.location.hash;
		var loggedIn = (url !== '');
		var split = url.split('&');
		var accessToken = loggedIn ? split[0].substr(1).split('=')[1]: '';
		var refreshToken = loggedIn ?  split[1].split('=')[1]: '';
		if (loggedIn) {
			spotifyAPI.setAccessToken(accessToken);
			spotifyAPI.getUserPlaylists()
			.then(
			function(data) {
				console.log(data);
			},
			function(err) {
				console.log(err);
			}
			);
		}
	});
    }

    //callAPI() {
    //    fetch("http://catchthatflow.com:9000")
    //        .then(res => res.text())
    //        .then(res => this.setState({ apiResponse: res }))
    //        .catch(err => err);
    //}

    //componentDidMount() {
    //    this.callAPI();
    //}

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                </header>
		<a href="http://catchthatflow.com:9000/login">Login</a>
                <p className="App-intro">{this.state.apiResponse}</p>
            </div>
        );
    }
}

export default App;
