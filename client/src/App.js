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
			selectedPlaylist: [],
            playlistsLoaded: false,
            loggedIn: false,
		};

		// bound methods
		this.getSongsFromPlaylist = this.getSongsFromPlaylist.bind(this);
        this.logout = this.logout.bind(this);
	}

	// after components are mounted
	componentDidMount() {
		if (window.location.hash.includes("success")) {
			this.getUserData();
            this.setState({loggedIn: true})
		}
	}
    
    logout() {
        fetch("http://catchthatflow.com:9000/spotify/logout")
        .then(res => {
            this.setState({
                username: "Default",
                profilePic: '',
                playlists: [],
                selectedSong: '',
                selectedSongId: '',
                selectedPlaylistId: '',
                selectedPlaylist: [],
                loggedIn: false,
            });
        })
        .catch(err => console.log(err));
    }

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
            this.getSongsFromPlaylist();
            //this.generatePlaylistInterface()
            //console.log("Users playlists:");
            //this.state.playlists.forEach(playlist => console.log(playlist));
        })
        .catch(err => console.log(err));
	}

	// get tracks from selected playlist
	getSongsFromPlaylist(id) {
		// just getting 1 playlist for testing
		fetch("http://catchthatflow.com:9000/spotify/playlist/" + id)
		.then(res => res.json())
		.then(res => {
			let playlist = res["playlist"]
			playlist.forEach(song => console.log(song));
			this.setState({selectedPlaylist: playlist});
		})
		.catch(err => console.log(err));
	}

	// defines how component is rendered to screen
	// use react router instead of a href??
	// combine login and username logo??
	render() {
        return (
            <div className="App">
                <div className="Title">
                    <div className="TitleWord">Flow</div>
                </div>
                
                <div className="Columns">
                    
                    <div className="Column">

                        <div className="Text">Username: {this.state.username}</div>
                        <div className="ImgContainer">
                            {this.state.profilePic === "" ? <img className="ProfilePic" src="/assets/unknown.jpg" alt="Unknown Pic"></img>: <img className="ProfilePic" src={this.state.profilePic} alt="Profile Pic"></img>}
                        </div>
                        {this.state.loggedIn ? <button className="ToggleLog" onClick={this.logout}>Logout</button> : <button onClick={() => {window.location.href="http://catchthatflow.com:9000/spotify/login"}}>Login</button>}

                    </div>
                        
                    <div className="Column">
                    <div className="Text">Playlists</div>
                        <div className="Playlists">
                            {this.state.loggedIn ?
                                <div className="Items" id="Items">
                                    {this.state.playlists.map(playlist => <button className="Selectable" key={playlist.id} onClick = {() => {this.getSongsFromPlaylist(playlist.id)}}>{playlist.name}</button>)}
                                  </div>
                                : <div className="Text">{"Log in to view playlists..."}</div>
                             }
                        </div>
                        <div className="PlaySong">
                            {this.state.selectedSong !== "" ? 
                            <iframe id = "playButton" src={"https://open.spotify.com/embed/track/" + this.state.selectedSong.uri} width="300" height="80" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                            : "No Song To Play"}
                        </div>
                    </div>
                    
                    <div className="Column">
                    <div className="Text">Songs</div>
                        <div className="Playlists">
                            {this.state.selectedPlaylist.length > 0 ? 
                                <div className="Items">
                                    {this.state.selectedPlaylist.map(song => <button className="Selectable" key={song.uri} onClick = {() => {this.setState({selectedSong: song})}}>{song.name}</button>)}
                                </div>
                                : "No songs to play"
                            }
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export default App;
