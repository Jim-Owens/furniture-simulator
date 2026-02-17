import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { FURNITURE_DEFAULTS } from '../constants/furniture'
import type { FurnitureType } from '../constants/furniture'

export type CornerType = 'normal' | 'cutout' | 'chamfer'

// Simple 2D point for the polygon
export interface RoomPoint {
    id: string // unique id for dragging reliability
    x: number
    y: number
}

export interface RoomConfig {
    width: number // Keep for bounding box display
    depth: number // Keep for bounding box display
    height: number
    wallOpacity: number
    polygon: RoomPoint[]
}

export interface Furniture {
    id: string
    type: FurnitureType
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
    color: string
}

interface StoreState {
    roomSize: RoomConfig
    furnitures: Furniture[]
    selectedId: string | null
    version: number
    cameraKick: number

    // Editor State
    isPolygonEditorOpen: boolean
    setPolygonEditorOpen: (isOpen: boolean) => void

    setRoomSize: (size: Partial<RoomConfig>) => void
    updatePolygon: (points: RoomPoint[]) => void

    addFurniture: (type: FurnitureType) => void
    updateFurniture: (id: string, updates: Partial<Furniture>) => void
    removeFurniture: (id: string) => void
    selectFurniture: (id: string | null) => void
    toggleSnap: () => void
    resetRoom: () => void
    isSnapEnabled: boolean
}

// Initial Rectangle: 5m x 5m centered
const INITIAL_POLYGON: RoomPoint[] = [
    { id: '1', x: 2.5, y: 2.5 },   // Back Right
    { id: '2', x: -2.5, y: 2.5 },  // Back Left
    { id: '3', x: -2.5, y: -2.5 }, // Front Left
    { id: '4', x: 2.5, y: -2.5 },  // Front Right
]

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            roomSize: { width: 5, depth: 5, height: 2.5, wallOpacity: 1, polygon: INITIAL_POLYGON },
            furnitures: [],
            selectedId: null,
            isSnapEnabled: true,
            version: 0,
            cameraKick: 0,
            isPolygonEditorOpen: false,

            setPolygonEditorOpen: (isOpen) => set({ isPolygonEditorOpen: isOpen, selectedId: null }), // Deselect furniture when editing room

            setRoomSize: (size) => set((state) => ({
                roomSize: { ...state.roomSize, ...size }
            })),

            updatePolygon: (points) => set((state) => {
                // Recalculate Width/Depth based on bounding box
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
                points.forEach(p => {
                    if (p.x < minX) minX = p.x
                    if (p.x > maxX) maxX = p.x
                    if (p.y < minY) minY = p.y
                    if (p.y > maxY) maxY = p.y
                })
                return {
                    roomSize: {
                        ...state.roomSize,
                        polygon: points,
                        width: Math.abs(maxX - minX),
                        depth: Math.abs(maxY - minY)
                    }
                }
            }),


            addFurniture: (type) => set((state) => {
                const defaultData = FURNITURE_DEFAULTS[type]
                const existing = state.furnitures

                // Target: Center (0, 0)
                const targetX = 0
                const targetZ = 0

                // Dimensions
                const myW = defaultData.defaultSize[0]
                const myH = defaultData.defaultSize[1]
                const myD = defaultData.defaultSize[2]

                // Default Y: Sitting on floor
                let bestY = myH / 2

                // Check for overlaps in X/Z plane and stack if needed
                // We want to find the highest surface at (0,0) that we overlap with.

                // Simple margin to avoid z-fighting if sizes are exact
                const margin = 0.05

                for (const f of existing) {
                    const fW = f.scale[0]
                    const fH = f.scale[1]
                    const fD = f.scale[2]

                    // Check horizontal overlap
                    const isOverlapping = (
                        targetX + myW / 2 - margin > f.position[0] - fW / 2 &&
                        targetX - myW / 2 + margin < f.position[0] + fW / 2 &&
                        targetZ + myD / 2 - margin > f.position[2] - fD / 2 &&
                        targetZ - myD / 2 + margin < f.position[2] + fD / 2
                    )

                    if (isOverlapping) {
                        // Calculate the Y level we need to be at to sit on top of this object
                        const topY = f.position[1] + fH / 2
                        const newY = topY + myH / 2

                        if (newY > bestY) {
                            bestY = newY
                        }
                    }
                }

                const newFurniture: Furniture = {
                    id: uuidv4(),
                    type,
                    position: [targetX, bestY, targetZ],
                    rotation: [0, 0, 0],
                    scale: defaultData.defaultSize,
                    color: defaultData.defaultColor,
                }
                return {
                    furnitures: [...state.furnitures, newFurniture],
                    selectedId: newFurniture.id,
                    cameraKick: state.cameraKick + 1
                }
            }),

            updateFurniture: (id, updates) => set((state) => ({
                furnitures: state.furnitures.map((f) =>
                    f.id === id ? { ...f, ...updates } : f
                )
            })),

            removeFurniture: (id) => set((state) => ({
                furnitures: state.furnitures.filter((f) => f.id !== id),
                selectedId: state.selectedId === id ? null : state.selectedId,
                version: state.version + 1
            })),

            selectFurniture: (id) => set({ selectedId: id }),

            toggleSnap: () => set((state) => ({ isSnapEnabled: !state.isSnapEnabled })),

            resetRoom: () => set({
                roomSize: { width: 5, depth: 5, height: 2.5, wallOpacity: 1, polygon: INITIAL_POLYGON },
                furnitures: [],
                selectedId: null,
                isSnapEnabled: true,
                version: 0
            }),
        }),
        {
            name: 'furniture-simulator-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
