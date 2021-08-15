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
                props.setSelection({
                    ...props.selection,
                    playlist: {
                        name: playlistName,
                        songs: playlistSongs.map(song => ({
                            ...song,
                            score: "",
                            cluster: "",
                        }))
                    }
                })
            }
            else {
                alert("Error 423 from excess API requests. Please wait a moment and try again!");
            }
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