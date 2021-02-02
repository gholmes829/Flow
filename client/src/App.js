import React, { Component } from "react";
import logo from './logo.svg';
import './App.css';

class App extends Component {
	constructor(props) {
		console.log("Constructing");
		super(props);
        	this.state = {
			username: "Default",
			profilePic: '',
			playlists: [],
			selectedPlaylist: '',
		};
	this.getPlaylistData = this.getPlaylistData.bind(this);
    	}

	componentDidMount() {
		console.log("Components mounted");
		if (window.location.hash.includes("access_token")) {
			this.getUserData();
			window.location.hash = "login-success";
		}
	}

	getUserData() {
		console.log("Requesting user data");		
		fetch("http://catchthatflow.com:9000/spotify/userData")
			.then(res => res.json())
			.then(res =>
				this.setState({
					username: res.username,
					profilePic: res.profilePic,
					playlists: res.playlists,
				})
			)
			.then(res => console.log(this.state))
			.catch(err => console.log(err));

		//this.setState({...this.state, selectedPlaylist: this.state.playlists[0].id});
	}

	getPlaylistData() {
		var id = this.state.playlists[0].id;
		console.log("Selected playlist: " + id);
		console.log("Requesting playlist tracks data");
		fetch("http://catchthatflow.com:9000/spotify/playlist/" + id)
			.then(res => res.json())
			.then(res => console.log(res))
			.catch(err => console.log(err));
	}

	render() {
			return (
				<div className="App">
					<header className="App-header">
						<img src={logo} className="App-logo" alt="logo" />
						<h1 className="App-title">Welcome to React</h1>
					</header>
			<button onClick={this.getPlaylistData}>{this.state.username}</button>
			<a href="http://catchthatflow.com:9000/spotify/login">Login</a>
				</div>
			);
		}
	}

export default App;
