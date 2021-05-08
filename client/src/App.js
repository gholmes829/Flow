import React, { Component } from "react";
import "./App.css";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "Guest",
			profilePic: '',
			playlists: [],
			selectedSong: '',
			selectedPlaylist: [],
            playlistsLoaded: false,
            selectedPlaylistName: "",
            loggedIn: false,
		};
        
        this.token = '';
        this.selectedButton = '';

		// bound methods
		this.getSongsFromPlaylist = this.getSongsFromPlaylist.bind(this);
        this.changeUser = this.changeUser.bind(this);
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
    
    changeUser() {
        this.setState({
            username: "Guest",
            profilePic: '',
            playlists: [],
            selectedSong: '',
            selectedPlaylist: [],
            selectedPlaylistName: "",
            loggedIn: false,
        });
        this.token = '';
        window.location.href="http://catchthatflow.com:9000/spotify/login"
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
            //this.state.playlists.forEach(playlist => console.log(playlist));
        })
        .catch(err => console.log(err));
	}

	// get tracks from selected playlist
	getSongsFromPlaylist(id, name) {
		// just getting 1 playlist for testing
		fetch("http://catchthatflow.com:9000/spotify/playlist/" + id + "/" + this.token)
		.then(res => res.json())
		.then(res => {
            //console.log(res);
			let playlist = res["playlist"];
            if (playlist) {
                this.setState({selectedPlaylist: playlist});
                let music = document.getElementById("Music")
                music.scrollTo(0, 0);
                //console.log("Setting playlist name:" + playlist.name);
                this.setState({selectedPlaylistName: name});
            }
            else {
                alert("Error 423 from excess API requests. Please wait and try again!");
            }
		})
	}

	// defines how component is rendered to screen
	// use react router instead of a href??
	// combine login and username logo??
	render() {
        let containerHeight = 0.35;
        let iframeURL = "https://open.spotify.com/embed/track/";
        
        return (
            <div className="App">      
                <div className="Row">
                    <div className="Title">Flow</div>
                </div>
            
                <div className="Columns">
                
                    <div className="Column">
                    <div className="Text">{this.state.selectedPlaylistName !== "" ? "Playlist: " + this.state.selectedPlaylistName : "Music"}</div>
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
                                            this.getSongsFromPlaylist(playlist.id, playlist.name);
                                        }}>{playlist.name}</button>)}
                                        </>
                                    }
                                </>
                                : <><br></br>Log in to view playlists...</>
                             }
                        </div>
                        <div className="Navigator">
                            <button onClick={() => {
                                this.setState({selectedSong: "", selectedPlaylist: []})
                                let music = document.getElementById("Music")
                                music.scrollTo(0, 0)
                                this.setState({selectedPlaylistName: ""});
                                }
                            }>Back</button>            
                        </div>
                        <div className="FrameContainer">
                            <iframe title="Sample" src={this.state.selectedSong !== "" ? iframeURL + this.state.selectedSong.uri : ""} width="100%" height="80" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                        </div>
                    </div>
                    
                    <div className="Column">
                        <div className="Text">User</div>
                        <div className="Header">
                            <div className="Info"><button style={{"padding": "4%"}} onClick={this.changeUser}>{!this.state.loggedIn ? "Login" : "Change User"}</button></div>
                            <div className="Info">{this.state.username}</div>
                            <div className="Info">

                            {this.state.profilePic === ""
                                ? <img className="ProfilePic" src="/assets/unknown.jpg" alt="Unknown Pic"></img>
                                : <img className="ProfilePic" src={this.state.profilePic} alt="Profile Pic"></img>}</div>
                        </div>
                        <div className="Items" style={{height: "100%"}}>
                        </div>
                    </div>
                    
                    <div className="Column">
                        <div className="Text">Analysis</div>
                        <div className="Items" style={{height: "100%"}}></div>
                    </div>

                </div>
            </div>
        );
    }
}

export default App;
