import React, { useState, useEffect } from "react";
import ForceGraph2D from 'react-force-graph-2d';
import "../App.css";

const CommandColumn = (props) => {
    const [colDims, setColDims] = useState("")

    // have nodes of same cluster have same color
    // have value/ size be based on score (might need to scale)
    // have nodes of same cluster be connect
    // consider connecting other songs by genre or other
    // note: set scrollable to false to prevent scrollbar thing
    // when initial song gets selected, set it to dark color
    // might be a bug with song selection and color
    // clicking on song resets graph

    let graphData = {
        "nodes": [ 
            { 
                "id": "id1",
                "name": "name1",
                "val": 1 
            },
            { 
                "id": "id2",
                "name": "name2",
                "val": 10 
            }
        ],
        "links": [
            {
                "source": "id1",
                "target": "id2"
            }
        ]
    }

    useEffect(() => {
        let dims = document.getElementById("CmdItems").getBoundingClientRect()
        console.log(dims)
        setColDims(() => ({
            width: dims.width,
            height: dims.height
        }))
    }, [])
    
    return (
        <>
        <div className="Column" style={{"width": "63.5%"}}>
            <div className="Text">Analysis Results</div>
            <div className="Items" id = {"CmdItems"} style={{"height": "100%", "overflowY": "hidden"}}>
                {props.selection.playlist.songs.length && props.selection.playlist.songs[0].score ?
                    <ForceGraph2D
                        graphData={graphData}
                        width = {colDims.width}
                        height = {0.99 * colDims.height}
                        backgroundColor = {"dark"}
                        linkDirectionalParticles = {1}
                    />
                    :
                    <>
                        <br></br>Log in, select playlist, and press "Analyze Playlist"
                    </>
                }
            </div>
        </div>
        </>
    )
}

export default CommandColumn;