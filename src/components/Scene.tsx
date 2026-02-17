import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import Room from './Room'
import Furniture from './Furniture'
import { useStore } from '../store/useStore'
import type { Furniture as FurnitureData } from '../store/useStore'

// SceneContent receives furnitures via props from the DOM-side React tree
function SceneContent({ furnitures }: { furnitures: FurnitureData[] }) {
    return (
        <group>
            <Room />
            <gridHelper args={[20, 20, 0x666666, 0x444444]} position={[0, 0, 0]} />
            {furnitures.map((item) => (
                <Furniture key={item.id} data={item} />
            ))}
        </group>
    )
}

// Separate component to handle camera logic
function CameraController({ cameraKick }: { cameraKick: number }) {
    const lastKickRef = useRef(0)
    const controlsRef = useRef<any>(null)

    useEffect(() => {
        if (cameraKick > lastKickRef.current && controlsRef.current) {
            const currentAzimuth = controlsRef.current.getAzimuthalAngle()
            controlsRef.current.setAzimuthalAngle(currentAzimuth + 0.15)
            controlsRef.current.update()
            lastKickRef.current = cameraKick
        }
    }, [cameraKick])

    return <OrbitControls ref={controlsRef} makeDefault enableDamping={true} dampingFactor={0.05} />
}

export default function Scene() {
    // Read store from DOM React tree (this is reliable)
    const furnitures = useStore((state) => state.furnitures)
    const cameraKick = useStore((state) => state.cameraKick)
    const selectFurniture = useStore((state) => state.selectFurniture)



    return (
        <div className="w-full h-screen bg-gray-900">
            <Canvas shadows frameloop="always" onPointerMissed={() => selectFurniture(null)}>
                <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />

                <CameraController cameraKick={cameraKick} />

                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <Environment preset="city" />

                <SceneContent furnitures={furnitures} />
            </Canvas>
        </div>
    )
}
