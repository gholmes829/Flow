import React, { useState, useEffect } from "react";
import Header from "./Header"
import Column from "./Column";
import "../App.css";


// TODO: make new refresh interval that checks expiration and refreshes when it gets close

const App = () => {
    // state variables
    const [userObject, setUserObject] = useState({
        username: "Guest",
        profilePic: "",
        playlists: [],
        selectedSong: "",
        selectedPlaylist: [],
        selectedPlaylistName: "",
        loggedIn: false,
    })
    
    const [token, setToken] = useState("")
    const [selectedButton, setSelectedButton] = useState("")

    const changeUser = () => {
        setUserObject({
            username: "Guest",
            profilePic: "",
            playlists: [],
            selectedSong: "",
            selectedPlaylist: [],
            selectedPlaylistName: "",
            loggedIn: false,
        });

        if (token !== "") {
            console.log("Setting token up top!")
            setToken("")
        }
        window.location.href="http://catchthatflow.com:9000/spotify/login"  // consider useHistory hook
    }

	// get tracks from selected playlist
	const getSongsFromPlaylist = (id, name) => {
		fetch("http://catchthatflow.com:9000/spotify/playlist/" + id + "/" + token)
		.then(res => res.json())
		.then(res => {
            //console.log(res);
			let playlist = res["playlist"];
            if (playlist) {
                console.log("Setting selected playlist...")
                setUserObject({...userObject, selectedPlaylist: playlist, selectedPlaylistName: name});
                let music = document.getElementById("Music")
                music.scrollTo(0, 0);
                console.log("Done setting selected playlist...")
            }
            else {
                alert("Error 423 from excess API requests. Please wait and try again!");
                console.log(res);
            }
		})
	}
    
    useEffect(() => {
        const updateToken = () => {
            let hash = window.location.hash;
            if (hash.includes("success-")) {
                setToken(hash.replace("#login-success-", ""));
                window.location.hash = "#login-success";
            }
            else {
                window.location.hash = "#sign-in";
            }
        }

        updateToken()
    }, [])

    useEffect(() => {
        const fetchUserData = () => {
            console.log("Getting user data")
            // stores users profile name, profile picture, and playlists
            fetch("http://catchthatflow.com:9000/spotify/userData/" + token)
            .then(res => res.json())
            .then(res => {
                setUserObject({
                    selectedSong: "",
                    selectedPlaylist: [],
                    selectedPlaylistName: "",
                    username: res.username,
                    profilePic: res.profilePic,
                    playlists: res.playlists,
                    loggedIn: true,
                })
            })
            .catch(err => console.log(err));
        }

        if (token !== "") {
            fetchUserData()
        }
    }, [token])
    
    //maybe move these to a better place
    let containerHeight = 0.325;
    let iframeURL = "https://open.spotify.com/embed/track/";

	// defines how component is rendered to screen
	// use react router instead of a href??
	// combine login and username logo??

    return (
        <div className="App">      
            <Header/>
        
            <div className="Columns">
                <Column elements = {[
                    <div className="Text">{userObject.selectedPlaylistName !== "" ? "Playlist: " + userObject.selectedPlaylistName : "Music"}</div>,

                    <div className="Items" id="Music" style={{height: containerHeight * window.screen.height}}>
                        {userObject.loggedIn ?
                            <>
                                {userObject.selectedPlaylist.length > 0 ?
                                    <>
                                    {userObject.selectedPlaylist.map(song => <button id={song.uri} className="Selectable" key={song.uri} onClick = {() => {
                                        setUserObject({...userObject, selectedSong: song})
                                        if (selectedButton !== "") {
                                            setSelectedButton({...selectedButton, style: {}})
                                        }
                                        setSelectedButton(document.getElementById(song.uri))
                                        setSelectedButton({...selectedButton, style: {...selectedButton.style, backgroundColor: "#8D8D8D"}})
                                    }}>{song.name}</button>)}
                                    </>
                                :    <>{userObject.playlists.map(playlist => <button className="Selectable" key={playlist.id} onClick = {() => {
                                        getSongsFromPlaylist(playlist.id, playlist.name);
                                    }}>{playlist.name}</button>)}
                                    </>
                                }
                            </>
                            : <><br></br>Log in to view playlists...</>
                            }
                    </div>,
                    
                    <div className="Controls">
                    
                                
                    
                        {userObject.selectedPlaylist.length === 0 ? 
                        <>
                        
                        <button className="Unactive"
                        >Optimize</button> 
                        <button className="Unactive"
                        >Back</button>   
                        
                        </>
                        
                        : <> 
                        <button className="Control" onClick={() => {
                                // do stuff
                            }
                        }>Optimize</button> 
                        
                        <button className="Control" onClick={() => {
                            setUserObject({...userObject, selectedSong: "", selectedPlaylist: []})
                            let music = document.getElementById("Music")
                            music.scrollTo(0, 0)
                            setUserObject({...userObject, selectedPlaylistName: ""});
                            }
                        }>Back</button> 
                        </>
                        }
                    </div>,

                    <div className="FrameContainer">
                        <iframe title="Sample" src={userObject.selectedSong !== "" ? iframeURL + userObject.selectedSong.uri : ""} width="100%" height="80" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                    </div>
                ]}/>
                
                <Column elements = {[
                    <div className="Text">User</div>,
                    <div className="Header">
                        <div className="Info"><button style={{"padding": "4%", "margin": "5%"}} onClick={changeUser}>{!userObject.loggedIn ? "Login" : "Change User"}</button></div>
                        <div className="Info">{userObject.username}</div>
                        <div className="Info">

                        {userObject.profilePic === ""
                            ? <img className="ProfilePic" src="/assets/unknown.jpg" alt="Unknown Pic"></img>
                            : <img className="ProfilePic" src={userObject.profilePic} alt="Profile Pic"></img>}</div>
                    </div>,
                    <div className="Items" style={{height: "100%"}}></div>
                ]}/>
                
                <Column elements = {[ 
                    <div className="Text">Results</div>,
	                <div className="Items" style={{height: "100%"}}></div>
                ]}/>


            </div>
        </div>
    );
}

export default App;
