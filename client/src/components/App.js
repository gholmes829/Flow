import React, { useState, useEffect } from "react"
import Header from "./Header"
import MusicColumn from "./MusicColumn"
import CommandColumn from "./CommandColumn"
import "../App.css"


// TODO: make new refresh interval that checks expiration and refreshes access token before expiration

const App = () => {
    // state variables
    const [user, setUser] = useState({
        name: "Guest",
        profilePic: "",
        playlists: [],
        loggedIn: false,
        accessToken: "",
        fetched: false,
    })

    const [state, setState] = useState({
        fetched: false,
        analyzed: false,
    })
    
    const [selection, setSelection] = useState({
        playlist: {
            name: "",
            songs: [],
        }
    })

    const [focusOn, setFocusOn] = useState(() => {})

    const [songSelection, setSongSelection] = useState("")

    useEffect(() => {
        const initializeUser = () => {
            if (window.location.hash.includes("success-")) {
                setUser((u) => ({
                    ...u,
                    fetched: true,
                }))
                let accessToken = window.location.hash.replace("#login-success-", "")
                window.location.hash = "#login-success"
                fetch("http://catchthatflow.com:9000/spotify/userData/" + accessToken)
                .then(res => res.json())
                .then(res => {
                    setUser((u) => ({
                        ...u,
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
    
    return (
        <div className="App">      
            <Header
                user = {user}
                setUser = {setUser}
                setSelection = {setSelection}
                setState = {setState}
                setSongSelection = {setSongSelection}
            />
        
            <div className="Columns">
                <MusicColumn
                    user = {user}
                    setUser = {setUser}
                    selection = {selection}
                    setSelection = {setSelection}
                    songSelection = {songSelection}
                    setSongSelection = {setSongSelection}
                    state = {state}
                    setState = {setState}
                    focusOn = {focusOn}
                />
                <CommandColumn
                    songs = {selection.playlist.songs}
                    setFocusOn = {setFocusOn}
                    setSongSelection = {setSongSelection}
                />
            </div>
        </div>
    )
}

export default App
