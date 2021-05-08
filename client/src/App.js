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
			selectedPlaylist: [],
            playlistsLoaded: false,
            loggedIn: false,
		};
        
        this.token = '';
        this.selectedButton = '';

		// bound methods
		this.getSongsFromPlaylist = this.getSongsFromPlaylist.bind(this);
        this.logout = this.logout.bind(this);
	}

	// after components are mounted
	componentDidMount() {
        let hash = window.location.hash;
		if (hash.includes("success")) {
            this.token = hash.replace("#login-success-", "");
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
                selectedPlaylist: [],
                loggedIn: false,
            });
        })
        .catch(err => console.log(err));
        this.token = '';
        window.location.hash = "logged-out";
    }

	getUserData() {	
		// stores users profile name, profile picture, and playlists
		fetch("http://catchthatflow.com:9000/spotify/userData/" + this.token)
        .then(res => res.json())
        .then(res => {
            this.setState({
                username: res.username,
                profilePic: res.profilePic,
                playlists: res.playlists,
            })
            //this.generatePlaylistInterface()
            //console.log("Users playlists:");
            this.state.playlists.forEach(playlist => console.log(playlist));
        })
        .catch(err => console.log(err));
	}

	// get tracks from selected playlist
	getSongsFromPlaylist(id) {
		// just getting 1 playlist for testing
		return fetch("http://catchthatflow.com:9000/spotify/playlist/" + id + "/" + this.token)
		.then(res => res.json())
		.then(res => {
            console.log(res);
			let playlist = res["playlist"]
			playlist.forEach(song => console.log(song));
			this.setState({selectedPlaylist: playlist});
		})
	}

	// defines how component is rendered to screen
	// use react router instead of a href??
	// combine login and username logo??
	render() {
        let containerHeight = 0.3;
        
        return (
            <div className="App">
                <div className="Row">
                    <div className="Header">
                        <div className="Info" style={{"marginLeft": "4%"}}>Flow</div>
                        <div className="Info">{this.state.loggedIn ? <button style={{"padding": "10%"}} onClick={this.logout}>Logout</button> : <button style={{"padding": "20%"}} onClick={() => {window.location.href="http://catchthatflow.com:9000/spotify/login"}}>Login</button>}</div>
                        <div className="SubHeader">
                            <div className="Info">Username: {this.state.username}</div>
                            <div className="Info">{this.state.profilePic === "" ? <img className="ProfilePic" src="/assets/unknown.jpg" alt="Unknown Pic"></img>: <img className="ProfilePic" src={this.state.profilePic} alt="Profile Pic"></img>}</div>
                        </div>
                    </div>
                </div>
                
                <div className="Columns">
                    <div className="Column">
                    <div className="Text">My Music</div>
                        <div className="Items" id="Music" style={{height: containerHeight * window.screen.height}}>
                            {this.state.loggedIn ?
                                <>
                                    {this.state.selectedPlaylist.length > 0 ?
                                        <>
                                        {this.state.selectedPlaylist.map(song => <button id={song.uri} className="Selectable" key={song.uri} onClick = {() => {
                                            this.setState({selectedSong: song})
                                            if (this.selectedButton !== "") {
                                                this.selectedButton.style = {};
                                            }
                                            this.selectedButton = document.getElementById(song.uri)
                                            this.selectedButton.style.backgroundColor = "#8D8D8D";
                                        }}>{song.name}</button>)}
                                        </>
                                    :    <>{this.state.playlists.map(playlist => <button className="Selectable" key={playlist.id} onClick = {() => {
                                            this.getSongsFromPlaylist(playlist.id)
                                            .then(res => {
                                                let music = document.getElementById("Music")
                                                music.scrollTo(0, 0)
                                            })
                                            .catch(err => alert("Error 423 from excess API requests. Please wait and try again!"));
                                        }}>{playlist.name}</button>)}
                                        </>
                                    }
                                </>
                                : "Log in to view playlists..."
                             }
                        </div>
                        <div className="Navigator">
                            <button onClick={() => {
                                this.setState({selectedSong: "", selectedPlaylist: []})
                                let music = document.getElementById("Music")
                                music.scrollTo(0, 0)
                                }
                            }>Back</button>            
                        </div>
                        <div className="PlaySong">
                            <iframe title="Sample" src={this.state.selectedSong !== "" ? "https://open.spotify.com/embed/track/" + this.state.selectedSong.uri: ""} width="100%" height="80" frameBorder="0" style={{border: "solid black"}} allowtransparency="true" allow="encrypted-media"></iframe>
                        </div>
                    </div>
                    
                    <div className="Column">
                    <div className="Text">Songs</div>
                        <div className="Items" style={{height: containerHeight * window.screen.height}}>
                            HI
                        </div>
                    </div>
                    
                    <div className="Column">
                    <div className="Text">
                        Results
                    </div>
                        <div className="Items" style={{height: "85%"}}>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export default App;
