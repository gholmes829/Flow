import React, { Component } from "react";
import "./App.css";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "Default",
			profilePic: '',
			playlists: [],
			selectedPlaylistId: '',
			selectedPlaylist: []
		};
		
		// bound methods
		this.getPlaylistData = this.getPlaylistData.bind(this);
	}

	// after components are mounted
	componentDidMount() {
		if (window.location.hash.includes("success")) {
			this.getUserData();
		}
	}

	// get initial user data
	getUserData() {		
		fetch("http://catchthatflow.com:9000/spotify/userData")
			.then(res => res.json())
			.then(res =>
				this.setState({
					username: res.username,
					profilePic: res.profilePic,
					playlists: res.playlists,
				})
			)
			.catch(err => console.log(err));
	}

	// get tracks from selected playlist
	getPlaylistData() {
		
		var id = this.state.playlists[0].id;
		console.log("ID: " + id);
		fetch("http://catchthatflow.com:9000/spotify/playlist/" + id)
			.then(res => res.json())
			.then(res => this.setState({selectedPlaylist: res}))
			.catch(err => console.log(err));
	}

	// defines how component is rendered to screen
	render() {
			return (
				<div className="App">
					<header className="App-header">
						<h1 className="App-title">Welcome to React</h1>
					</header>
			<button onClick={this.getPlaylistData}>{this.state.username}</button>
			<a href="http://catchthatflow.com:9000/spotify/login">Login</a>
				</div>
			);
		}
	}

export default App;
