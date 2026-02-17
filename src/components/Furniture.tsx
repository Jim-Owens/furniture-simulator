
import { useRef, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useStore } from '../store/useStore'
import type { Furniture as FurnitureType } from '../store/useStore'

import { TransformControls } from '@react-three/drei'
import { Group } from 'three'
import { FurnitureGeometry } from './FurnitureGeometry'
import { checkFurnitureRoomCollision } from '../utils/collision'


interface FurnitureProps {
    data: FurnitureType
}

export default function Furniture({ data }: FurnitureProps) {
    const { id, type, position, rotation, scale, color } = data
    const selectedId = useStore(state => state.selectedId)
    const selectFurniture = useStore(state => state.selectFurniture)
    const updateFurniture = useStore(state => state.updateFurniture)
    const roomSize = useStore(state => state.roomSize)
    const isSnapEnabled = useStore(state => state.isSnapEnabled)

    const isSelected = selectedId === id
    const groupRef = useRef<Group>(null!)
    const controlsRef = useRef<any>(null!)

    // Delay TransformControls rendering by one frame so groupRef is assigned
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const controls = useThree((state) => state.controls)

    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        if (controls) {
            (controls as any).enabled = !isDragging
        }
        return () => {
            if (controls) {
                (controls as any).enabled = true
            }
        }
    }, [controls, isDragging])

    const handlePointerDown = (e: any) => {
        e.stopPropagation()
        if (!isSelected) {
            selectFurniture(id)
        }
    }

    const handleTransformEnd = () => {
        if (groupRef.current) {
            const { position, rotation, scale } = groupRef.current
            updateFurniture(id, {
                position: [position.x, position.y, position.z],
                rotation: [rotation.x, rotation.y, rotation.z],
                scale: [scale.x, scale.y, scale.z]
            })
        }
    }

    // Snapping Logic
    const handleObjectChange = () => {
        if (!isSnapEnabled || !groupRef.current) return

        const target = groupRef.current
        const currentPos = target.position
        const currentRot = target.rotation.y

        const sX = scale[0]
        const sY = scale[1]
        const sZ = scale[2]

        const effectiveW = Math.abs(Math.cos(currentRot)) * sX + Math.abs(Math.sin(currentRot)) * sZ
        const effectiveD = Math.abs(Math.sin(currentRot)) * sX + Math.abs(Math.cos(currentRot)) * sZ
        const effectiveH = sY

        const halfW = effectiveW / 2
        const halfD = effectiveD / 2
        const halfH = effectiveH / 2

        const myLeft = currentPos.x - halfW
        const myRight = currentPos.x + halfW
        const myFront = currentPos.z - halfD
        const myBack = currentPos.z + halfD
        const myBottom = currentPos.y - halfH

        const SNAP_DIST = 0.2

        let newX = currentPos.x
        let newZ = currentPos.z
        let newY = currentPos.y

        let snappedX = false
        let snappedZ = false
        let snappedY = false

        if (Math.abs(myBottom) < SNAP_DIST) {
            newY = halfH
            snappedY = true
        }

        const roomHalfW = roomSize.width / 2
        const roomHalfD = roomSize.depth / 2

        if (Math.abs(myLeft - (-roomHalfW)) < SNAP_DIST) { newX = -roomHalfW + halfW; snappedX = true; }
        else if (Math.abs(myRight - roomHalfW) < SNAP_DIST) { newX = roomHalfW - halfW; snappedX = true; }

        if (Math.abs(myFront - (-roomHalfD)) < SNAP_DIST) { newZ = -roomHalfD + halfD; snappedZ = true; }
        else if (Math.abs(myBack - roomHalfD) < SNAP_DIST) { newZ = roomHalfD - halfD; snappedZ = true; }

        const allFurnitures = useStore.getState().furnitures
        for (const other of allFurnitures) {
            if (other.id === id) continue

            const oRot = other.rotation[1]
            const oSx = other.scale[0]
            const oSy = other.scale[1]
            const oSz = other.scale[2]

            const oW = Math.abs(Math.cos(oRot)) * oSx + Math.abs(Math.sin(oRot)) * oSz
            const oD = Math.abs(Math.sin(oRot)) * oSx + Math.abs(Math.cos(oRot)) * oSz
            const oH = oSy

            const oHalfW = oW / 2
            const oHalfD = oD / 2
            const oHalfH = oH / 2

            const oPos = other.position

            const oLeft = oPos[0] - oHalfW
            const oRight = oPos[0] + oHalfW
            const oFront = oPos[2] - oHalfD
            const oBack = oPos[2] + oHalfD
            const oTop = oPos[1] + oHalfH

            const isHorzOverlapping = (myRight > oLeft && myLeft < oRight) && (myBack > oFront && myFront < oBack)

            if (!snappedY && isHorzOverlapping) {
                if (Math.abs(myBottom - oTop) < SNAP_DIST) {
                    newY = oTop + halfH
                    snappedY = true
                }
            }

            const myMinY = currentPos.y - halfH
            const myMaxY = currentPos.y + halfH
            const oMinY = oPos[1] - oHalfH
            const oMaxY = oPos[1] + oHalfH

            const isVertOverlapping = (myMaxY > oMinY && myMinY < oMaxY)

            if (isVertOverlapping) {
                if (!snappedX) {
                    if (Math.abs(myLeft - oRight) < SNAP_DIST) { newX = oRight + halfW; snappedX = true }
                    else if (Math.abs(myRight - oLeft) < SNAP_DIST) { newX = oLeft - halfW; snappedX = true }
                    else if (Math.abs(myLeft - oLeft) < SNAP_DIST) { newX = oLeft + halfW; snappedX = true }
                    else if (Math.abs(myRight - oRight) < SNAP_DIST) { newX = oRight - halfW; snappedX = true }
                }
                if (!snappedZ) {
                    if (Math.abs(myFront - oBack) < SNAP_DIST) { newZ = oBack + halfD; snappedZ = true }
                    else if (Math.abs(myBack - oFront) < SNAP_DIST) { newZ = oFront - halfD; snappedZ = true }
                    else if (Math.abs(myFront - oFront) < SNAP_DIST) { newZ = oFront + halfD; snappedZ = true }
                    else if (Math.abs(myBack - oBack) < SNAP_DIST) { newZ = oBack - halfD; snappedZ = true }
                }
            }
        }

        if (!snappedY && newY < halfH) {
            newY = halfH
        }

        // Apply collision check to ALL furniture including window/door
        // so they stay inside the room and don't get lost in the wall.
        {
            const isColliding = checkFurnitureRoomCollision(
                { x: newX, z: newZ },
                currentRot,
                sX,
                sZ,
                roomSize.polygon
            )

            if (isColliding) {
                // Try to slide
                const isXOk = !checkFurnitureRoomCollision(
                    { x: newX, z: currentPos.z },
                    currentRot, sX, sZ, roomSize.polygon
                )
                const isZOk = !checkFurnitureRoomCollision(
                    { x: currentPos.x, z: newZ },
                    currentRot, sX, sZ, roomSize.polygon
                )

                if (isXOk) {
                    newZ = currentPos.z
                } else if (isZOk) {
                    newX = currentPos.x
                } else {
                    newX = currentPos.x
                    newZ = currentPos.z
                }
            }
        }

        target.position.set(newX, newY, newZ)
    }

    // Only show TransformControls after mount so groupRef is valid
    const showControls = isSelected && mounted && groupRef.current

    return (
        <>
            {showControls && (
                <TransformControls
                    ref={controlsRef}
                    object={groupRef}
                    mode="translate"
                    onMouseUp={handleTransformEnd}
                    onObjectChange={handleObjectChange}
                    onChange={(e: any) => setIsDragging(e.value)}
                    translationSnap={null}
                    showX={true}
                    showY={true}
                    showZ={true}
                    size={0.8}
                />
            )}
            <group
                ref={groupRef}
                position={position}
                rotation={rotation}
                scale={scale}
                onPointerDown={handlePointerDown}
            >
                <FurnitureGeometry type={type} color={color} isSelected={isSelected} />
            </group>
        </>
    )
}
