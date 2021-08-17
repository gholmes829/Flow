
import React, { useRef, useEffect, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

const BloomGraph = props => {
    const fgRef = useRef();

    const handleClick = useCallback(node => {
        // Aim at node from outside it
        console.log(node)
        const distance = 150;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          3000  // ms transition duration
        );
    }, [fgRef]);

    useEffect(() => {
        const bloomPass = new UnrealBloomPass()
        bloomPass.strength = 2;
        bloomPass.radius = 1;
        bloomPass.threshold = 0.1;
        fgRef.current.postProcessingComposer().addPass(bloomPass);
    }, []);

    return (
        <ForceGraph3D
            ref={fgRef}
            {...props}
            onNodeClick={handleClick}
        />
    )
}


export default BloomGraph