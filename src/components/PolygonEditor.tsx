import React, { useState, useRef, useEffect } from 'react'
import { useStore, type RoomPoint } from '../store/useStore'
import { v4 as uuidv4 } from 'uuid'

const PIXELS_PER_METER = 100
const VISUAL_GRID_SIZE = 0.5 // meters (Visual Grid)
const SNAP_SIZE = 0.05 // meters (Snap resolution)

export default function PolygonEditor() {
    const { roomSize, updatePolygon, setPolygonEditorOpen } = useStore()
    const [points, setPoints] = useState<RoomPoint[]>(roomSize.polygon)
    const [dragId, setDragId] = useState<string | null>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    // Sync from store when opening
    useEffect(() => {
        setPoints(roomSize.polygon)
    }, [roomSize.polygon])

    const screenToWorld = (sx: number, sy: number) => {
        if (!svgRef.current) return { x: 0, y: 0 }
        const rect = svgRef.current.getBoundingClientRect()
        const cx = rect.width / 2
        const cy = rect.height / 2

        // Screen (px) -> World (m)
        // X: (sx - cx) / SCALE
        // Y: -(sy - cy) / SCALE  (Flip Y because SVG Y+ is Down, World Y+ is Back/Up)
        const x = (sx - rect.left - cx) / PIXELS_PER_METER
        const y = -(sy - rect.top - cy) / PIXELS_PER_METER
        return { x, y }
    }

    const worldToScreen = (wx: number, wy: number) => {
        // World (m) -> Screen (px) relative to center
        // This is for relative coordinates in SVG group centered at screen center
        return {
            x: wx * PIXELS_PER_METER,
            y: -wy * PIXELS_PER_METER
        }
    }

    const handlePointerDown = (id: string, e: React.PointerEvent) => {
        e.stopPropagation()
        setDragId(id);

        // Capture pointer
        (e.target as any).setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragId) return

        const { x, y } = screenToWorld(e.clientX, e.clientY)

        // Snap logic
        let nx = x
        let ny = y

        if (e.shiftKey) {
            // Ortho snap logic could go here
        } else {
            // Grid snap
            nx = Math.round(x / SNAP_SIZE) * SNAP_SIZE
            ny = Math.round(y / SNAP_SIZE) * SNAP_SIZE
        }

        setPoints(prev => prev.map(p =>
            p.id === dragId ? { ...p, x: nx, y: ny } : p
        ))
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        if (dragId) {
            setDragId(null)
            updatePolygon(points); // Commit to store
            (e.target as any).releasePointerCapture(e.pointerId)
        }
    }

    const addVertexOnEdge = (index: number) => {
        const p1 = points[index]
        const p2 = points[(index + 1) % points.length]

        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2

        const newPoint: RoomPoint = {
            id: uuidv4(),
            x: midX,
            y: midY
        }

        const newPoints = [...points]
        newPoints.splice(index + 1, 0, newPoint)
        setPoints(newPoints)
        updatePolygon(newPoints)

        // Auto start dragging could be tricky with React state updates, 
        // but user can just click midpoint then drag it.
    }

    const handleVertexRemove = (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (points.length <= 3) {
            alert('頂点は最低3つ必要です')
            return
        }
        const newPoints = points.filter(p => p.id !== id)
        setPoints(newPoints)
        updatePolygon(newPoints)
    }

    const editEdgeLength = (index: number) => {
        const p1 = points[index]
        const p2 = points[(index + 1) % points.length]

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const currentLen = Math.sqrt(dx * dx + dy * dy)

        const input = prompt('辺の長さを入力 (cm)\n(※終点の頂点が移動します)', Math.round(currentLen * 100).toString())
        if (input === null) return

        const newLenCm = parseFloat(input)
        if (isNaN(newLenCm) || newLenCm <= 0) return

        const newLen = newLenCm / 100 // cm -> m

        if (currentLen === 0) return

        const ndx = dx / currentLen
        const ndy = dy / currentLen

        const newP2 = {
            ...p2,
            x: p1.x + ndx * newLen,
            y: p1.y + ndy * newLen
        }

        const newPoints = [...points]
        newPoints[(index + 1) % points.length] = newP2

        setPoints(newPoints)
        updatePolygon(newPoints)
    }

    // Generate path d
    const pathD = points.map((p, i) => {
        const s = worldToScreen(p.x, p.y)
        return `${i === 0 ? 'M' : 'L'} ${s.x} ${s.y}`
    }).join(' ') + ' Z'

    // Generate edge info (midpoints and lengths)
    const edgeInfos = points.map((p1, i) => {
        const p2 = points[(i + 1) % points.length]
        const wx = (p1.x + p2.x) / 2
        const wy = (p1.y + p2.y) / 2
        const s = worldToScreen(wx, wy)
        const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
        return { x: s.x, y: s.y, index: i, length: len }
    })

    return (
        <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col">
            {/* Header */}
            <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shadow-lg z-10">
                <h2 className="text-white font-bold text-lg">部屋の形状編集</h2>
                <div className="flex items-center gap-4">
                    <div className="text-gray-400 text-sm">
                        頂点ドラッグ:移動，辺の中点クリック:頂点追加，頂点右クリック:削除，数値クリック:長さ設定
                    </div>
                    <button
                        onClick={() => {
                            updatePolygon(points);
                            setPolygonEditorOpen(false)
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition"
                    >
                        完了
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-[#1a1a2e] cursor-crosshair">
                {/* Grid Background (Standard CSS) */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`,
                        backgroundSize: `${PIXELS_PER_METER * VISUAL_GRID_SIZE}px ${PIXELS_PER_METER * VISUAL_GRID_SIZE}px`,
                        backgroundPosition: 'center center' // Grid centered
                    }}
                />

                <svg
                    ref={svgRef}
                    className="w-full h-full"
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    // Prevent touch scroll
                    style={{ touchAction: 'none' }}
                >
                    <g transform={`translate(${window.innerWidth / 2}, ${(window.innerHeight - 56) / 2})`}>
                        {/* Axes */}
                        <line x1="-10000" y1="0" x2="10000" y2="0" stroke="#444" strokeWidth="2" />
                        <line x1="0" y1="-10000" x2="0" y2="10000" stroke="#444" strokeWidth="2" />

                        {/* Polygon Fill */}
                        <path d={pathD} fill="rgba(79, 70, 229, 0.2)" stroke="none" />

                        {/* Polygon Stroke */}
                        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" />

                        {/* Edge Split Handles & Length Labels */}
                        {edgeInfos.map((info) => (
                            <g
                                key={`edge-${info.index}`}
                                transform={`translate(${info.x}, ${info.y})`}
                            >
                                {/* Split Handle */}
                                <g
                                    onClick={() => addVertexOnEdge(info.index)}
                                    className="cursor-pointer group hover:scale-150 transition-transform duration-200"
                                >
                                    <circle r="6" fill="rgba(255, 255, 255, 0.5)" className="group-hover:fill-yellow-400" />
                                    <text y="1" textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#333" className="pointer-events-none">+</text>
                                </g>

                                {/* Length Label */}
                                <g
                                    transform="translate(0, -15)"
                                    onClick={() => editEdgeLength(info.index)}
                                    className="cursor-pointer hover:scale-110 transition-transform"
                                >
                                    <rect x="-20" y="-8" width="40" height="16" rx="4" fill="rgba(0,0,0,0.6)" />
                                    <text
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="10"
                                        fill="white"
                                        fontWeight="bold"
                                    >
                                        {Math.round(info.length * 100)}cm
                                    </text>
                                </g>
                            </g>
                        ))}

                        {/* Vertex Handles */}
                        {points.map((p) => {
                            const s = worldToScreen(p.x, p.y)
                            return (
                                <circle
                                    key={p.id}
                                    cx={s.x}
                                    cy={s.y}
                                    r="8"
                                    fill={dragId === p.id ? '#fbbf24' : 'white'}
                                    stroke={dragId === p.id ? '#b45309' : '#6366f1'}
                                    strokeWidth="2"
                                    className="cursor-move hover:stroke-yellow-400"
                                    onPointerDown={(e) => handlePointerDown(p.id, e)}
                                    onContextMenu={(e) => handleVertexRemove(e, p.id)}
                                />
                            )
                        })}


                    </g>
                </svg>

                {/* Labels: Dimensions could go here */}
            </div>
        </div>
    )
}
