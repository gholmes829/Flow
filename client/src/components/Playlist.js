import React from "react";
import "../App.css";

const Playlist = (props) => {

    const getSongsFromPlaylist = (playlistID) => {
		return fetch("http://catchthatflow.com:9000/spotify/playlist/" + playlistID + "/" + props.user.accessToken)
		.then(res => res.json())
		.then(res => res["playlist"])
        .catch(err => console.log(err))
	}

    
    const updatePlaylistSelection = (playlistID, playlistName) => {
        getSongsFromPlaylist(playlistID)
        .then(playlistSongs => {
            if (playlistSongs) {
                let moddedSongs = playlistSongs.map(song => ({
                    ...song,
                    score: "",
                    cluster: "",
                }))

                analyzePlaylist(moddedSongs, playlistName)
            }
            else {
                alert("Error from excess API requests. Please wait a moment and try again!");
            }
        })
        
    }

    const analyzePlaylist = (songs, playlistName) => {
        props.setState({
            ...props.state,
            analyzed: true,
        })

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

export default Playlist;