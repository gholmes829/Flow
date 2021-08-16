import React, {useEffect} from "react";
import "../App.css";

const SongList = (props) => {

    const setSongSelection = props.setSongSelection

    useEffect(() => {
        console.log("Setting initial selection!")
        setSongSelection((u) => {
            let initialSong = props.selection.playlist.songs[0]
            let initialButton = document.getElementById(initialSong.uri)
            initialButton.style.backgroundColor = "#8D8D8D"
            return initialSong
        })
    }, [setSongSelection])

    return (
        <>
        {props.songs.map(song =>
            <button
                id={song.uri}
                className="Selectable"
                key={song.uri}
                onClick = {() => {
                    console.log("Click!")
                    props.setSongSelection(song)
                    if (props.songSelection !== "") {
                        let prevButton = document.getElementById(props.songSelection.uri)
                        prevButton.style = {}
                    }
                    let currButton = document.getElementById(song.uri)
                    currButton.style.backgroundColor = "#8D8D8D"
                    
                    
                }
            }>
                {song.name}
            </button>)}
        </>
    )
}

export default SongList;