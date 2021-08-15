import React, { useState, useEffect } from "react";
import Header from "./Header"
import MusicColumn from "./MusicColumn";
import CommandColumn from "./CommandColumn";
import "../App.css";


// TODO: make new refresh interval that checks expiration and refreshes when it gets close

const App = () => {
    // state variables
    const [user, setUser] = useState({
        name: "Guest",
        profilePic: "",
        playlists: [],
        loggedIn: false,
        accessToken: ""
    })
    
    const [selection, setSelection] = useState({
        song: "",
        playlist: {
            name: "",
            songs: [],
        }
    })

    useEffect(() => {
        const initializeUser = () => {
            if (window.location.hash.includes("success-")) {
                let accessToken = window.location.hash.replace("#login-success-", "")
                window.location.hash = "#login-success"
                fetch("http://catchthatflow.com:9000/spotify/userData/" + accessToken)
                .then(res => res.json())
                .then(res => {
                    setUser(() => ({
                        name: res.username,
                        profilePic: res.profilePic,
                        playlists: res.playlists,
                        loggedIn: true,
                        accessToken: accessToken,
                    }))
                })
                .catch(err => console.log("Error: " + err));
            }
            else {
                window.location.hash = "#sign-in";
            }
        }

        initializeUser()
    }, [])
    
    //maybe move these to a better place
    

	// use (external) react router instead of a href??
	// combine login and username logo??

    return (
        <div className="App">      
            <Header
                user = {user}
                setUser = {setUser}
            />
        
            <div className="Columns">
                <MusicColumn
                    user = {user}
                    selection = {selection}
                    setSelection = {setSelection}
                />

                <CommandColumn
                    user = {user}
                    selection = {selection}
                    setSelection = {setSelection}
                />

            </div>
        </div>
    );
}

export default App;
