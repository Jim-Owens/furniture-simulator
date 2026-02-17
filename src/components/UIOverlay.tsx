import React, { useRef } from 'react'
import { useStore } from '../store/useStore'
import { FURNITURE_DEFAULTS } from '../constants/furniture'
import type { FurnitureType } from '../constants/furniture'

export default function UIOverlay() {
    const {
        roomSize, setRoomSize,
        addFurniture,
        selectedId, furnitures, updateFurniture, removeFurniture,
        setPolygonEditorOpen // Get the editor opener
    } = useStore()

    // Local state for the "Add Furniture" selection
    const [selectedAddType, setSelectedAddType] = React.useState<FurnitureType | null>(null)
    const [showList, setShowList] = React.useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const selectedFurniture = furnitures.find(f => f.id === selectedId)
    const selectedConfig = selectedFurniture ? FURNITURE_DEFAULTS[selectedFurniture.type] : null

    const rotate = (deg: number) => {
        if (!selectedFurniture) return
        const currentRot = selectedFurniture.rotation[1]
        const newRot = currentRot + (deg * Math.PI / 180)
        updateFurniture(selectedFurniture.id, {
            rotation: [0, newRot, 0]
        })
    }

    const getCurrentSize = (axis: 0 | 1 | 2) => { // 0:w, 1:h, 2:d
        if (!selectedFurniture) return 0
        return Math.round(selectedFurniture.scale[axis] * 100)
    }

    const updateSize = (axis: 0 | 1 | 2, cmVal: number) => {
        if (!selectedFurniture) return
        const newScale = [...selectedFurniture.scale]
        newScale[axis] = cmVal / 100
        updateFurniture(selectedFurniture.id, { scale: [newScale[0], newScale[1], newScale[2]] })
    }

    const handleSave = () => {
        const data = {
            roomSize,
            furnitures,
            timestamp: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `layout-${new Date().getTime()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Modal State
    const [modal, setModal] = React.useState<{
        isOpen: boolean
        message: string
        onConfirm: () => void
    }>({ isOpen: false, message: '', onConfirm: () => { } })

    const showConfirm = (message: string, onConfirm: () => void) => {
        setModal({ isOpen: true, message, onConfirm })
    }

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }))
    }

    const handleConfirmAction = () => {
        modal.onConfirm()
        closeModal()
    }

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Reset input immediately so same file can be selected again if cancelled
        e.target.value = ''

        const reader = new FileReader()
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string)
                if (data.roomSize && data.furnitures) {
                    showConfirm('レイアウトを読み込みますか？現在の配置は失われます。', () => {
                        useStore.setState({
                            roomSize: data.roomSize,
                            furnitures: data.furnitures,
                            selectedId: null
                        })
                    })
                }
            } catch (err) {
                console.error('Failed to parse layout file', err)
                alert('Invalid file format: Please upload a valid JSON layout file.')
            }
        }
        reader.readAsText(file)
    }

    const handleReset = () => {
        showConfirm('部屋をリセットしますか？配置データは消去されます。', () => {
            useStore.getState().resetRoom()
        })
    }

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
            {/* Modal */}
            {modal.isOpen && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-auto z-50">
                    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl max-w-sm w-full border border-gray-600">
                        <h3 className="text-lg font-bold mb-4">確認</h3>
                        <p className="text-gray-300 mb-6">{modal.message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 transition font-bold"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left Panel: Main Controls */}
            <div className="absolute top-4 left-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto pointer-events-auto">
                <div className="bg-gray-800/90 backdrop-blur text-white p-4 rounded-lg shadow-lg space-y-6">

                    <div>
                        <h2 className="text-lg font-bold mb-3 border-b border-gray-600 pb-1">部屋のサイズ (cm)</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">幅 (概算)</label>
                                <input
                                    type="number"
                                    value={Math.round(roomSize.width * 100)}
                                    readOnly
                                    title="部屋の形状エディタで頂点を編集してください"
                                    className="w-20 bg-gray-700/50 text-gray-500 rounded px-2 py-1 text-sm cursor-not-allowed"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">奥行 (概算)</label>
                                <input
                                    type="number"
                                    value={Math.round(roomSize.depth * 100)}
                                    readOnly
                                    title="部屋の形状エディタで頂点を編集してください"
                                    className="w-20 bg-gray-700/50 text-gray-500 rounded px-2 py-1 text-sm cursor-not-allowed"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">高さ</label>
                                <input
                                    type="number"
                                    value={Math.round(roomSize.height * 100)}
                                    onChange={(e) => setRoomSize({ height: Number(e.target.value) / 100 })}
                                    className="w-20 bg-gray-700 rounded px-2 py-1 text-sm"
                                />
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                <label className="text-sm text-gray-300">壁の不透明度</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={(roomSize.wallOpacity ?? 1) * 100}
                                        onChange={(e) => setRoomSize({ wallOpacity: Number(e.target.value) / 100 })}
                                        className="w-16 accent-indigo-500 h-2 bg-gray-700 rounded-lg appearance-none"
                                    />
                                    <span className="text-xs text-gray-400 w-8 text-right font-mono">
                                        {Math.round((roomSize.wallOpacity ?? 1) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setPolygonEditorOpen(true)}
                            className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-bold transition flex items-center justify-center gap-2 shadow-lg ring-1 ring-white/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            形状を編集する (2D)
                        </button>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold mb-3 border-b border-gray-600 pb-1">家具を追加</h2>

                        {/* Type Selection Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-3 max-h-40 overflow-y-auto pr-1">
                            {Object.values(FURNITURE_DEFAULTS).map((item) => (
                                <button
                                    key={item.type}
                                    onClick={() => setSelectedAddType(item.type)}
                                    className={`text-xs py-2 rounded capitalize transition truncate px-1 border 
                                        ${selectedAddType === item.type
                                            ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-300 ring-opacity-50'
                                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                                    title={item.label}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={() => selectedAddType && addFurniture(selectedAddType)}
                            disabled={!selectedAddType}
                            className={`w-full py-2 rounded font-bold transition flex items-center justify-center gap-2
                                ${selectedAddType
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                        >
                            <span>＋ 追加</span>
                            {selectedAddType && <span className="text-xs font-normal opacity-75">({FURNITURE_DEFAULTS[selectedAddType].label})</span>}
                        </button>
                    </div>

                    {selectedFurniture && selectedConfig && (
                        <div>
                            <h2 className="text-lg font-bold mb-3 border-b border-gray-600 pb-1 truncate">
                                {selectedConfig.label}
                            </h2>

                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">色</label>
                                    <input
                                        type="color"
                                        value={selectedFurniture.color}
                                        onChange={(e) => selectedFurniture && updateFurniture(selectedFurniture.id, { color: e.target.value })}
                                        className="w-full h-8 cursor-pointer rounded"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">サイズ (WxHxD cm)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="number"
                                            value={getCurrentSize(0)}
                                            onChange={(e) => updateSize(0, Number(e.target.value))}
                                            className="bg-gray-700 rounded px-1 py-1 text-xs w-full"
                                            title="Width"
                                        />
                                        <input
                                            type="number"
                                            value={getCurrentSize(1)}
                                            onChange={(e) => updateSize(1, Number(e.target.value))}
                                            className="bg-gray-700 rounded px-1 py-1 text-xs w-full"
                                            title="Height"
                                        />
                                        <input
                                            type="number"
                                            value={getCurrentSize(2)}
                                            onChange={(e) => updateSize(2, Number(e.target.value))}
                                            className="bg-gray-700 rounded px-1 py-1 text-xs w-full"
                                            title="Depth"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">位置 (X, Z cm)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            value={Math.round(selectedFurniture.position[0] * 100)}
                                            onChange={(e) => selectedFurniture && updateFurniture(selectedFurniture.id, {
                                                position: [Number(e.target.value) / 100, selectedFurniture.position[1], selectedFurniture.position[2]]
                                            })}
                                            className="bg-gray-700 rounded px-1 py-1 text-xs w-full"
                                            title="Position X"
                                        />
                                        <input
                                            type="number"
                                            value={Math.round(selectedFurniture.position[2] * 100)}
                                            onChange={(e) => selectedFurniture && updateFurniture(selectedFurniture.id, {
                                                position: [selectedFurniture.position[0], selectedFurniture.position[1], Number(e.target.value) / 100]
                                            })}
                                            className="bg-gray-700 rounded px-1 py-1 text-xs w-full"
                                            title="Position Z"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">回転 (度)</label>
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={() => rotate(-90)} className="flex-1 bg-gray-600 hover:bg-gray-500 py-1 rounded text-xs">-90°</button>
                                        <button onClick={() => rotate(-45)} className="flex-1 bg-gray-600 hover:bg-gray-500 py-1 rounded text-xs">-45°</button>
                                        <button onClick={() => rotate(45)} className="flex-1 bg-gray-600 hover:bg-gray-500 py-1 rounded text-xs">+45°</button>
                                        <button onClick={() => rotate(90)} className="flex-1 bg-gray-600 hover:bg-gray-500 py-1 rounded text-xs">+90°</button>
                                    </div>
                                    <input
                                        type="number"
                                        value={Math.round((selectedFurniture.rotation[1] * 180 / Math.PI) || 0)}
                                        onChange={(e) => selectedFurniture && updateFurniture(selectedFurniture.id, {
                                            rotation: [0, Number(e.target.value) * Math.PI / 180, 0]
                                        })}
                                        className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => selectedFurniture && removeFurniture(selectedFurniture.id)}
                                className="w-full bg-red-600 hover:bg-red-500 text-sm py-2 rounded transition"
                            >
                                削除
                            </button>
                        </div>
                    )}

                    {/* Furniture List (Rescue) */}
                    <div className="pt-2 border-t border-gray-700">
                        <button
                            onClick={() => setShowList(!showList)}
                            className="w-full py-1 text-xs text-gray-400 hover:text-white flex justify-between items-center"
                        >
                            <span>配置中の家具一覧 ({furnitures.length})</span>
                            <span>{showList ? '▼' : '▶'}</span>
                        </button>

                        {showList && (
                            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
                                {furnitures.map(f => (
                                    <div
                                        key={f.id}
                                        onClick={() => useStore.getState().selectFurniture(f.id)}
                                        className={`text-xs px-2 py-1 rounded cursor-pointer flex justify-between items-center group transition
                                            ${f.id === selectedId ? 'bg-indigo-600/30 text-white border border-indigo-500/50' : 'hover:bg-gray-700 text-gray-300 border border-transparent'}
                                        `}
                                    >
                                        <span className="truncate flex-1">
                                            {FURNITURE_DEFAULTS[f.type]?.label || f.type}
                                        </span>
                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFurniture(f.id);
                                            }}
                                            className={`ml-2 text-gray-500 hover:text-red-400 p-0.5 rounded
                                                ${f.id === selectedId ? 'opacity-100 text-red-300' : 'opacity-0 group-hover:opacity-100'}
                                            `}
                                            title="削除"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {furnitures.length === 0 && (
                                    <div className="text-xs text-gray-500 text-center py-2">家具はありません</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-700 space-y-2">
                        <button
                            onClick={useStore.getState().toggleSnap}
                            className={`w-full py-1 rounded transition ${useStore.getState().isSnapEnabled ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-400'}`}
                        >
                            自動吸着: {useStore.getState().isSnapEnabled ? 'ON' : 'OFF'}
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-green-700 hover:bg-green-600 text-white py-1 rounded transition"
                            >
                                保存 (JSON)
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 bg-orange-700 hover:bg-orange-600 text-white py-1 rounded transition"
                            >
                                読込 (JSON)
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleLoad}
                                accept=".json"
                                className="hidden"
                            />
                        </div>

                        <button
                            onClick={handleReset}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 rounded transition"
                        >
                            部屋リセット
                        </button>
                    </div>
                </div>
            </div>

            {/* Controls Help - Top Right */}
            <div className="absolute top-4 right-4 pointer-events-none">
                <div className="bg-gray-800/80 backdrop-blur text-white p-3 rounded-lg shadow-lg pointer-events-auto text-xs space-y-1">
                    <h3 className="font-bold border-b border-gray-600 pb-1 mb-1">操作方法</h3>
                    <ul className="list-disc pl-4 space-y-1 text-gray-300">
                        <li>クリック(家具): 選択 / 解除</li>
                        <li>ドラッグ(家具): 移動</li>
                        <li>ctrl+ドラッグ: 視点移動</li>
                        <li>スクロール: ズーム</li>
                        <li>ドラッグ(背景): 視点回転</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
