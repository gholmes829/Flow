import React, {useState} from "react"
import ReactLoading from "react-loading"
import SongList from "./SongList"
import Playlist from "./Playlist"
import "../App.css"

const MusicColumn = (props) => {
    const [removedSongs, setRemovedSongs] = useState([])
    const [saving, setSaving] = useState(false)

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
        setSaving(true)
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
            setSaving(false)
            //alert("Playlist saved successfully!")
        })
        .catch(err => console.log("Error: " + err))
    }

    let itemsHeight = "100%" // 0.325 * window.screen.height

    return (
        <>
        <div className="Column">
            <div className="Text" style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis"
            }}>
                {(() => {
                    let name = props.selection.playlist.name
                    let shown
                    if (name.length <= 12) {
                        shown = name
                    }
                    else {
                        shown = name.substring(0, 12) + "..."
                    }

                    return props.selection.playlist.name ? shown + " (Copy)" : "My Playlists"
                })()}
            </div>
            
                {(() => {
                    if (props.user.loggedIn && props.state.analyzed) {
                        return (
                            <div className="Items" id="Music" style={{height: itemsHeight}}>
                            <SongList
                                selection = {props.selection}
                                setSelection = {props.setSelection}
                                songSelection = {props.songSelection}
                                setSongSelection = {props.setSongSelection}
                                songs = {props.selection.playlist.songs.filter(song => !removedSongs.includes(song.uri))}
                                focusOn = {props.focusOn}
                            />
                            </div>
                        )
                    }
                    else if ((props.user.fetched && !props.user.loggedIn) || (props.user.loggedIn && props.state.fetched && !props.state.analyzed)) {

                        return (
                            <div className="Items" id="Music" style={{
                                    overflowY: "hidden",
                                    height: itemsHeight,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                <div style={{
                                    width: "50%",
                                    margin: "auto",
                                    marginTop: "10%",
                                    height: "50%",
                                }}>
                                    <ReactLoading type={"spin"} height={"100%"} width={"100%"} />
                                </div>
                            </div>
                        )
                    }
                    else if (props.user.loggedIn && !props.state.fetched) {
                        return (
                            <div className="Items" id="Music" style={{height: itemsHeight}}>
                            <Playlist
                                user = {props.user}
                                selection = {props.selection}
                                setSelection = {props.setSelection}
                                setSongSelection = {props.setSongSelection}
                                setState = {props.setState}
                                state = {props.state}
                            />
                            </div>
                        )
                    }
                    else if (!props.user.loggedIn) {
                        return (
                            <div className="Items" id="Music" style={{height: itemsHeight}}>
                            <><br></br>Log in and select playlist...</>
                            </div>
                        )
                    }
                })()}
            
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
                    {saving ?
                        <button className="Unactive">Saving...</button> 
                        :
                        <button
                            className="Control"
                            onClick={() => saveCopy()}
                        >Save Copy</button>
                    }                  
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
                {(props.state.fetched && !props.state.analyzed) ?
                    <div style={{
                        margin: "auto",
                        width: "22.5%",
                        overflow: "hidden"
                    }}>
                        <ReactLoading type={"cylon"} height={"80px"} width={"80px"} />
                    </div>
                    :
                    <iframe
                        title="Sample"
                        src={ 
                            (() => {
                                if (props.songSelection && props.state.analyzed) {
                                    return "https://open.spotify.com/embed/track/" + props.songSelection.uri
                                }
                                else {
                                    return ""
                                }
                            })()
                        }
                        width="100%"
                        height="80px"
                        frameBorder="0"
                        allowtransparency="true"
                        allow="encrypted-media">
                    </iframe>
                }
            </div>
        </div>
    </>
    )
}

export default MusicColumn