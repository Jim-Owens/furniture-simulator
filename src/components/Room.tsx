import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { useMemo } from 'react'
import { generateRoomPolygon, generateOuterWallPolygon } from '../utils/roomUtils'

const WALL_THICKNESS = 0.2

export default function Room() {
    const { roomSize } = useStore()
    const { height, polygon } = roomSize
    const selectFurniture = useStore((state) => state.selectFurniture)

    const handleBackgroundClick = (e: any) => {
        e.stopPropagation()
        selectFurniture(null)
    }

    const { floorShape, wallShape } = useMemo(() => {
        let polyVectors = generateRoomPolygon(polygon)

        // Ensure CCW winding order for consistent wall generation
        if (THREE.ShapeUtils.isClockWise(polyVectors)) {
            polyVectors = polyVectors.reverse()
        }

        // Floor Shape (Inner)
        const floorS = new THREE.Shape(polyVectors)

        // Wall Shape (Outer with Inner Hole)
        // 1. Generate outer polygon
        const outerPoly = generateOuterWallPolygon(polyVectors, WALL_THICKNESS)
        const outerS = new THREE.Shape(outerPoly)

        // 2. Add hole (inner polygon) to create hollow wall
        // Hole must be CW if outer is CCW.
        const holePath = new THREE.Path(polyVectors.slice().reverse())
        outerS.holes.push(holePath)

        return { floorShape: floorS, wallShape: outerS }
    }, [polygon])

    return (
        <group position={[0, height / 2, 0]}>
            {/* Floor */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -height / 2, 0]}
                receiveShadow
                onPointerDown={handleBackgroundClick}
            >
                <shapeGeometry args={[floorShape]} />
                <meshStandardMaterial color="#e0e0e0" />
            </mesh>

            {/* Walls */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -height / 2, 0]}
                receiveShadow
                castShadow
                onPointerDown={handleBackgroundClick}
            >
                <extrudeGeometry args={[wallShape, { depth: height, bevelEnabled: false }]} />
                <meshStandardMaterial
                    color="#d4d4d4"
                    transparent={roomSize.wallOpacity !== undefined && roomSize.wallOpacity < 1}
                    opacity={roomSize.wallOpacity ?? 1}
                />
            </mesh>
        </group>
    )
}
