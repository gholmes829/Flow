import React, { useState, useEffect } from "react"
import BloomGraph from './BloomGraph'
import "../App.css"

const CommandColumn = props => {
    const [colDims, setColDims] = useState("")
    // when initial song gets selected, set it to dark color
    // might be a bug with song selection and color

    let idToCluster = {}
    let colorSeed = 100 * Math.random()
    
    let graphData = (() => {
        if (props.songs.length && props.songs[0].score !== "") {
            let clusters = {}
            let maxSizeRatio = 30
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
                "name": "\"" + song.name + "\" (" + Math.round(100 * song.score) / 100 + "% match)",
                "val": 1 + (maxSizeRatio * song.score / 100)
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
                        d3VelocityDecay = {0.55}
                        songs = {props.songs}
                        setFocusOn = {props.setFocusOn}
                        //songSelection = {props.songSelection}
                        setSongSelection = {props.setSongSelection}
                    />
                    :
                    <div style={{"width": "90%", "margin": "auto", "fontSize": "small"}}>
                        <br></br>
                        <h2>Notes:</h2>
                        <p>
                            1) Analysis will show clustering and cohesion of songs in playlist.<br></br><br></br>
                            2) Songs in large clusters with high scores are a good fit!<br></br><br></br>
                            3) Song scores are all relative to the playlist, so every playlist has a "perfectly good" and "perfectly bad" fitting song.<br></br><br></br>
                            4) Algorithm is randomly initialized so analysis results for a given playlist may change.<br></br><br></br>
                            5) Links between nodes within a given cluster are randomly generated and thus have no meaning.
                        </p>
                    </div>
                }
            </div>
        </div>
        </>
    )
}

export default React.memo(CommandColumn)