
import React, { useRef, useEffect, useCallback } from "react"
import ForceGraph3D from "react-force-graph-3d"
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

const BloomGraph = props => {
    const fgRef = useRef()

    const focusOn = (node) => {
        const distance = 150
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z)

        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          3000  // ms transition duration
        )
    }

    const handleClick = useCallback(node => {
        // Aim at node from outside it
        let targetSong
        props.songs.forEach(song => {
            if (node.id === song.uri) {
                targetSong = song
            } 
        })
        props.setSongSelection(targetSong)
        focusOn(node)
    }, [fgRef])
    /*
    useEffect(() => {
        if (props.graphData.nodes) {
            let targetNode
            console.log("Effect!!!")
            console.log(props.graphData.nodes)
            props.graphData.nodes.forEach(node => {
                if (node.id === props.songSelection.uri) {
                    targetNode = node
                    console.log("Found node: ")
                    console.log(targetNode)
                    setTimeout(() => focusOn(targetNode), 1000)
                }
            })
        }
        
    }, [props.songSelection])
    */

    const distance = 500

    useEffect(() => {
        const bloomPass = new UnrealBloomPass()
        bloomPass.strength = 2
        bloomPass.radius = 1
        bloomPass.threshold = 0.075
        fgRef.current.postProcessingComposer().addPass(bloomPass)
    }, [])

    return (
        <ForceGraph3D
            ref={fgRef}
            {...props}
            onNodeClick={handleClick}
        />
    )
}

export default BloomGraph