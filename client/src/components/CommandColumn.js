import React, { useState, useEffect } from "react";
import ForceGraph2D from 'react-force-graph-2d';
import "../App.css";

const CommandColumn = React.memo(props => {
    const [colDims, setColDims] = useState("")
    console.log("Rendering...")
    // consider connecting other songs by genre or other
    // when initial song gets selected, set it to dark color
    // might be a bug with song selection and color
    // clicking on song resets graph

    let idToCluster = {}

    let graphData = (() => {
        if (props.songs.length && props.songs[0].score !== "") {
            let clusters = {}
            props.songs.forEach((song) => {
                if (!(song.cluster in clusters)) {
                    clusters[song.cluster] = [song.uri]
                }
                else {
                    clusters[song.cluster].push(song.uri)
                }
                idToCluster[song.uri] = song.cluster
            })

            // array of objects with id, name, and val
            let nodes = props.songs.map((song) => ({
                "id": song.uri,
                "name": song.name,
                "val": 1 + (9 * song.score / 100)
            }))

            // list of objects with source and target (ids)
            let links = []

            let linkIds = new Set()

            Object.keys(clusters).forEach((cluster_i) => {
                let URIs = clusters[cluster_i]
                URIs.forEach(uri => {
                    URIs.forEach(nestedUri => {
                        if (URIs.indexOf(nestedUri) === URIs.indexOf(uri) + 1 || (Math.random() > 0.975 && uri !== nestedUri)) {
                            links.push({
                                "source": uri,
                                "target": nestedUri
                            })
                            linkIds.add(uri+nestedUri)
                        }
                    })
                })
            })

            return {
                "nodes": nodes,
                "links": links
            }
        }
        else {
            return {}
        }
    })()

    useEffect(() => {
        console.log("Setting col dims!")
        let dims = document.getElementById("CmdItems").getBoundingClientRect()
        setColDims(() => ({
            width: dims.width,
            height: dims.height
        }))
    }, [])

    return (
        <>
        <div className="Column" style={{"width": "63.5%"}}>
            <div className="Text">Analysis Results (Big = Good)</div>
            <div className="Items" id = {"CmdItems"} style={{"height": "100%", "overflowY": "hidden"}}>
                {props.songs.length && props.songs[0].score !== "" ?
                    <ForceGraph2D
                        graphData={graphData}
                        width = {colDims.width}
                        height = {colDims.height}
                        backgroundColor = {"dark"}
                        nodeAutoColorBy = {d => {
                            return idToCluster[d.id] + 90
                        }}
                        d3VelocityDecay = {0.9}
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
})

export default CommandColumn;