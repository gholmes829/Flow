
import React, { useRef, useEffect, useCallback } from "react"
import ForceGraph3D from "react-force-graph-3d"
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

const BloomGraph = props => {
    const fgRef = useRef()

    const focusOn = (node) => {
        const distance = 60
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z)

        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          3000  // ms transition duration
        )
    }

    let idToNode = {}

    const handleClick = useCallback(node => {
        // Aim at node from outside it
        let targetSong
        props.songs.forEach(song => {
            if (node.id === song.uri) {
                targetSong = song
            } 
        })
        props.setSongSelection(targetSong)
        document.getElementById(node.id).scrollIntoView({ behavior: "auto", block: "center"})

        focusOn(node)
    }, [fgRef])

    const setFocusOn = props.setFocusOn

    // useEffect(() => {
    //     const bloomPass = new UnrealBloomPass()
    //     bloomPass.strength = 1
    //     bloomPass.radius = 1
    //     bloomPass.threshold = 0.075
    //     fgRef.current.postProcessingComposer().addPass(bloomPass)
    // }, [])

    useEffect(() => {
        setFocusOn(() => (id) => focusOn(idToNode[id]))
    }, [setFocusOn])

    return (
        <ForceGraph3D
            ref={fgRef}
            {...props}
            onNodeClick={handleClick}
            nodeVisibility = {(node) => {  // uses this as access point to update idToNode
                idToNode[node.id] = node
                if ("nodeVisibility" in props) {
                    return props.nodeVisibility(node)
                }
                else {
                    return true
                } 
            }}
        />
    )
}

export default BloomGraph