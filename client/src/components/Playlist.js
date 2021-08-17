import React from "react"
import "../App.css"

const Playlist = (props) => {    
    const updatePlaylistSelection = (playlistID, playlistName) => {
        props.setState({
            ...props.state,
            fetched: true,
        })
        fetch("http://catchthatflow.com:9000/spotify/playlist/" + playlistID + "/" + props.user.accessToken)
        .then(res => res.json())
		.then(res => res["playlist"])
        .then(playlistSongs => {
            if (playlistSongs) {
                let moddedSongs = playlistSongs.map(song => ({
                    ...song,
                    score: "",
                    cluster: "",
                }))
                props.setSongSelection(playlistSongs[0])
                analyzePlaylist(moddedSongs, playlistName)
            }
            else {
                alert("Error from excess API requests. Please wait a moment and try again!");
            }
        })
        .catch(err => console.log("Error: " + err))
        
    }

    const analyzePlaylist = (songs, playlistName) => {
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
                playlist: {
                    name: playlistName,
                    songs: songs.map((song, i) => ({
                        ...song,
                        score: res.song_scores[i].score,
                        cluster: res.song_scores[i].cluster
                    }))
                }
            })
            props.setState({
                ...props.state,
                analyzed: true,
            })
        })
    }

    return (
        <>
        {props.user.playlists.map(playlist =>
            <button
                className="Selectable"
                key={playlist.id}
                onClick = {() => {
                        updatePlaylistSelection(playlist.id, playlist.name);
                    }
            }>
                {playlist.name}
            </button>)}
        </>
    )
}

export default Playlist