import React from "react";
import SongList from "./SongList"
import Playlist from "./Playlist"
import "../App.css";

const MusicColumn = (props) => {

	const analyzePlaylist = (songs) => {
        fetch("http://catchthatflow.com:9000/spotify/analyzePlaylist", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({songs: songs}),
            method: "POST"
        })
        .then(res => res.json())
        .then(res => {
            props.setSelection({
                ...props.selection,
                playlist: {
                    ...props.selection.playlist,
                    songs: props.selection.playlist.songs.map((song, i) => ({
                        ...song,
                        score: res.song_scores[i].score,
                        cluster: res.song_scores[i].cluster
                    }))
                }
            })
        })
    }


    return (

        <>
        <div className="Column">
            
            <div className="Text">{props.selection.playlist.name ? "Playlist: \"" + props.selection.playlist.name + "\"" : "Music"}</div>
            
            <div className="Items" id="Music" style={{height: 0.325 * window.screen.height}}>
                {props.user.loggedIn ?
                    <>
                        {props.selection.playlist.songs.length > 0 ?
                            <SongList
                                selection = {props.selection}
                                setSelection = {props.setSelection}
                            />
                        :    
                            <Playlist
                                user = {props.user}
                                selection = {props.selection}
                                setSelection = {props.setSelection}
                            />
                        }
                    </>
                    :
                    <>
                        <br></br>Log in to view playlists...
                    </>
                    }
            </div>

            <div className="Controls">
                {props.selection.playlist.songs.length === 0 ? 
                <>
                    <button className="Unactive">Analyze Playlist</button> 
                    <button className="Unactive">Back</button>   
                </> 
                :
                <> 
                    <button
                        className="Control"
                        onClick={() => analyzePlaylist(props.selection.playlist.songs)}
                    >
                        Analyze Playlist
                    </button> 
                    <button
                        className="Control"
                        onClick={() => {
                            props.setSelection({button: "", song: "", playlist: {songs: [], name: ""}})
                            let music = document.getElementById("Music")
                            music.scrollTo(0, 0)
                        }}
                    >
                        Back
                    </button> 
                </>
                }
            </div>

            <div className="FrameContainer">
                <iframe
                    title="Sample"
                    src={ 
                        (() => {
                            if (props.selection.song) {
                                return "https://open.spotify.com/embed/track/" + props.selection.song.uri
                            }
                            else if (props.selection.playlist.songs.length) {
                                return "https://open.spotify.com/embed/track/" + props.selection.playlist.songs[0].uri 
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

export default MusicColumn;