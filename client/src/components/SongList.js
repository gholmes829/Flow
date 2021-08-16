import React, {useEffect} from "react";
import "../App.css";

const SongList = (props) => {

    const setSelection = props.setSelection

    useEffect(() => {
        setSelection((u) => {
            let initialSong = u.playlist.songs[0]
            let initialButton = document.getElementById(initialSong.uri)
            initialButton.style.backgroundColor = "#8D8D8D"
            return {
            ...u,
            song: initialSong
            }
        })
    }, [setSelection])

    return (
        <>
        {props.songs.map(song =>
            <button
                id={song.uri}
                className="Selectable"
                key={song.uri}
                onClick = {() => {
                    if (props.selection.song !== "") {
                        let prevButton = document.getElementById(props.selection.song.uri)
                        prevButton.style = {}
                    }
                    let currButton = document.getElementById(song.uri)
                    currButton.style.backgroundColor = "#8D8D8D"
                    
                    props.setSelection({
                        ...props.selection,
                        song: song,
                        })
                    }
            }>
                {song.name + song.score + song.cluster}
            </button>)}
        </>
    )
}

export default SongList;