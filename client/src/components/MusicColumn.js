import React, {useState} from "react"
import SongList from "./SongList"
import Playlist from "./Playlist"
import "../App.css"

const MusicColumn = (props) => {
    const [removedSongs, setRemovedSongs] = useState([])

    const removeSong = (song) => {
        if (!removedSongs.includes(song.uri)) {
            setRemovedSongs((u) => {
                let newSelection = props.selection.playlist.songs
                .filter(tempSong => (!removedSongs.includes(tempSong.uri) && (tempSong.uri !== song.uri)))[0]
                props.setSongSelection(newSelection)
                return [...removedSongs, song.uri]})
        }
    }

    const saveCopy = () => { 
        let newSongURIs = props.selection.playlist.songs
        .filter((song) => !removedSongs.includes(song.uri))
        .map(song => "spotify:track:" + song.uri)
        
        fetch("http://catchthatflow.com:9000/spotify/createPlaylist/" + props.selection.playlist.name + " (Flow Copy)/" + props.user.accessToken, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({data: newSongURIs}),
            method: "POST"
        })
        .then(res => {
            alert("Playlist saved successfully!")
        })
        .catch(err => console.log("Error: " + err))
    }

    return (
        <>
        <div className="Column">
            <div className="Text">{props.selection.playlist.name ? props.selection.playlist.name + " (Copy)" : "My Playlists"}</div>
            <div className="Items" id="Music" style={{height: 0.325 * window.screen.height}}>
                {(() => {
                    if (props.user.loggedIn && props.state.analyzed) {
                        return (
                            <SongList
                                selection = {props.selection}
                                setSelection = {props.setSelection}
                                songSelection = {props.songSelection}
                                setSongSelection = {props.setSongSelection}
                                songs = {props.selection.playlist.songs.filter(song => !removedSongs.includes(song.uri))}
                            />
                        )
                    }
                    else if (props.user.loggedIn && props.state.fetched && !props.state.analyzed) {
                        return <><br></br>Loading!!!</>
                    }
                    else if (props.user.loggedIn && !props.state.fetched) {
                        return (
                            <Playlist
                                user = {props.user}
                                selection = {props.selection}
                                setSelection = {props.setSelection}
                                setSongSelection = {props.setSongSelection}
                                setState = {props.setState}
                                state = {props.state}
                            />
                        )
                    }
                    else if (!props.user.loggedIn) {
                        return (
                            <><br></br>Log in and select playlist...</>
                        )
                    }
                })()}
            </div>
            <div className="Controls">
                {!props.state.analyzed ? 
                <>
                    <button className="Unactive">Remove Song</button> 
                    <button className="Unactive">Save a Copy</button> 
                    <button className="Unactive">Back</button>   
                </> 
                :
                <> 
                    <button
                        className="Control"
                        onClick={() => removeSong(props.songSelection)}
                    >Remove Song</button>
                    <button
                        className="Control"
                        onClick={() => saveCopy()}
                    >Save Copy</button>                    
                    <button
                        className="Control"
                        onClick={() => {
                            props.setState({
                                ...props.state,
                                fetcned: false,
                                analyzed: false,
                            })
                            props.setSelection({playlist: {songs: [], name: ""}})
                            props.setSongSelection("")
                            let music = document.getElementById("Music")
                            music.scrollTo(0, 0)
                            setRemovedSongs([])
                            // update playlists
                            fetch("http://catchthatflow.com:9000/spotify/userData/" + props.user.accessToken)
                            .then(res => res.json())
                            .then(res => {
                                props.setUser(() => ({
                                    ...props.user,
                                    playlists: res.playlists
                                }))
                            })
                            .catch(err => console.log("Error: " + err));
                        }}
                    >Back</button> 
                </>
                }
            </div>
            <div className="FrameContainer">
                <iframe
                    title="Sample"
                    src={ 
                        (() => {
                            if (props.songSelection) {
                                return "https://open.spotify.com/embed/track/" + props.songSelection.uri
                            }
                            else {
                                return ""
                            }
                        })()
                    }
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allowtransparency="true"
                    allow="encrypted-media">
                </iframe>
            </div>
        </div>
    </>
    )
}

export default MusicColumn