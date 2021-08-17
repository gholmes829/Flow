import React, { useState, useEffect } from "react";
import ForceGraph3D from 'react-force-graph-3d';
import BloomGraph from './BloomGraph';
import "../App.css";

const CommandColumn = React.memo(props => {
    const [colDims, setColDims] = useState("")
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
                "name": "\"" + song.name + "\" (" + Math.round(100 * song.score) / 100 + "% relative match)",
                "val": 1 + (19 * song.score / 100)
            }))

            // list of objects with source and target (ids)
            let links = []

            Object.keys(clusters).forEach((cluster_i) => {
                let URIs = clusters[cluster_i]
                let linkIds = {}
                URIs.forEach(uri => {linkIds[uri] = 0})
                URIs.forEach(uri => {
                    let uriIndex = URIs.indexOf(uri)
                    let chances = 5
                    let successRate = 0.05

                    if (uriIndex !== (URIs.length - 1)) {
                        links.push({
                            "source": uri,
                            "target": URIs[uriIndex + 1]
                        })
                    }

                    
                    ([...Array(chances).keys()]).forEach(i => {
                        if (Math.random() < successRate) {
                            let randIndex = Math.round((URIs.length - 1) * Math.random())
                            let randUri = URIs[randIndex]
                            if (randUri !== uri) {
                                links.push({
                                    "source": uri,
                                    "target": randUri
                                })
                            }
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
        let dims = document.getElementById("CmdItems").getBoundingClientRect()
        setColDims(() => ({
            width: dims.width,
            height: dims.height
        }))
    }, [])

    let colorSeed = 100 * Math.random()

    return (
        <>
        <div className="Column" style={{"width": "63.5%"}}>
            <div className="Text">Analysis Results</div>
            <div className="Items" id = {"CmdItems"} style={{"height": "100%", "overflowY": "hidden"}}>
                {props.songs.length && props.songs[0].score !== "" ?
                    <BloomGraph
                        graphData={graphData}
                        width = {colDims.width}
                        height = {colDims.height}
                        nodeAutoColorBy = {d => {
                            return idToCluster[d.id] + colorSeed
                        }}
                        showNavInfo = {false}
                        d3VelocityDecay = {0.6}
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