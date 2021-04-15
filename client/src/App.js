import React, { Component } from "react";
import "./App.css";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "Default",
			profilePic: '',
			playlists: [],
			selectedSong: '',
			selectedSongId: '',
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
		// stores users profile name, profile picture, and playlists
		fetch("http://catchthatflow.com:9000/spotify/userData")
			.then(res => res.json())
			.then(res => {
				this.setState({
					username: res.username,
					profilePic: res.profilePic,
					playlists: res.playlists,
				})
			console.log("Users playlists:");
				this.state.playlists.forEach((playlist) => {console.log("Playlist: " + playlist)});
			console.log("Selected playlist (not really): " + this.state.playlists);
			})
			.catch(err => console.log(err));
	}

	// get tracks from selected playlist
	getPlaylistData() {
		// just getting 1 song
		let id = this.state.playlists[0].id;
		fetch("http://catchthatflow.com:9000/spotify/playlist/" + id)
			.then(res => res.json())
			.then(res => this.setState({selectedPlaylist: res}))
			.then(res => console.log(this.state.selectedPlaylist))
			.catch(err => console.log(err));
	}

	// defines how component is rendered to screen
	render() {
			return (
				<div className="App">
					<a href="http://catchthatflow.com:9000/spotify/login">Login</a>
					<button onClick={this.getPlaylistData}>{this.state.username}</button>
				</div>
			);
		}
	}

export default App;
