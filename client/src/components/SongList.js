import React from "react"
import "../App.css"

const SongList = (props) => {
    return (
        <>
        {props.songs.map(song =>
            <button
                id={song.uri}
                className="Selectable"
                key={song.uri}
                style = {(() => {
                    if (song.uri === props.songSelection.uri) {
                        return {backgroundColor: "#8D8D8D"}
                    }
                    else {
                        return {}
                    }
                })()}
                onClick = {() => {
                    props.setSongSelection(song)
                    props.focusOn(song.uri)
                }
            }>
                {"\"" + song.name + "\" - " + song.artists.join(", ") // "\" (" + Math.round(100 * song.score) / 100 + "% match, clusterID = " + song.cluster + ")"}
                                        }
            </button>)}
        </>
    )
}

export default SongList