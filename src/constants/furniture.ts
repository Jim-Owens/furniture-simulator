export type FurnitureType =
    | 'chair'
    | 'work_chair'
    | 'table'
    | 'low_table'
    | 'bed'
    | 'tv'
    | 'tv_stand_low'
    | 'desk'
    | 'pc'
    | 'monitor'
    | 'shelf'
    | 'desk_rack'
    | 'storage_box'
    | 'sofa'
    | 'rug'
    | 'original'
    | 'window'
    | 'door'

export interface FurnitureConfig {
    type: FurnitureType
    label: string
    defaultSize: [number, number, number] // width, height, depth (meters)
    defaultColor: string
}

export const FURNITURE_DEFAULTS: Record<FurnitureType, FurnitureConfig> = {
    chair: {
        type: 'chair',
        label: '椅子',
        defaultSize: [0.45, 0.9, 0.45],
        defaultColor: '#A0522D',
    },
    work_chair: {
        type: 'work_chair',
        label: 'ワークチェア',
        defaultSize: [0.65, 1.1, 0.65],
        defaultColor: '#333333',
    },
    table: {
        type: 'table',
        label: 'ダイニングテーブル',
        defaultSize: [1.5, 0.75, 0.9],
        defaultColor: '#8B4513',
    },
    low_table: {
        type: 'low_table',
        label: 'ローテーブル',
        defaultSize: [1.2, 0.35, 0.6],
        defaultColor: '#DEB887',
    },
    bed: {
        type: 'bed',
        label: 'ベッド',
        defaultSize: [1.2, 0.5, 2.0],
        defaultColor: '#F5F5DC',
    },
    tv: {
        type: 'tv',
        label: 'テレビ',
        defaultSize: [1.2, 1.0, 0.4],
        defaultColor: '#2F4F4F',
    },
    tv_stand_low: {
        type: 'tv_stand_low',
        label: 'ローボード',
        defaultSize: [1.5, 0.4, 0.45],
        defaultColor: '#654321',
    },
    desk: {
        type: 'desk',
        label: 'ワークデスク',
        defaultSize: [1.2, 0.72, 0.6],
        defaultColor: '#DEB887',
    },
    pc: {
        type: 'pc',
        label: 'デスクトップPC',
        defaultSize: [0.2, 0.45, 0.45],
        defaultColor: '#111111',
    },
    monitor: {
        type: 'monitor',
        label: 'モニター',
        defaultSize: [0.6, 0.4, 0.15],
        defaultColor: '#222222',
    },
    shelf: {
        type: 'shelf',
        label: '本棚',
        defaultSize: [0.8, 1.8, 0.3],
        defaultColor: '#CD853F',
    },
    desk_rack: {
        type: 'desk_rack',
        label: 'デスクラック',
        defaultSize: [0.6, 0.4, 0.25], // Slightly deeper
        defaultColor: '#FFFFFF',
    },
    storage_box: {
        type: 'storage_box',
        label: '収納ボックス',
        defaultSize: [0.4, 0.3, 0.5],
        defaultColor: '#DDDDDD',
    },
    sofa: {
        type: 'sofa',
        label: 'ソファ',
        defaultSize: [2.0, 0.8, 0.85],
        defaultColor: '#708090',
    },
    rug: {
        type: 'rug',
        label: 'ラグ',
        defaultSize: [2.0, 0.02, 1.5],
        defaultColor: '#D3D3D3',
    },
    original: {
        type: 'original',
        label: 'オリジナルの家具',
        defaultSize: [0.3, 0.3, 0.3],
        defaultColor: '#aaaaaa',
    },
    window: {
        type: 'window',
        label: '窓',
        defaultSize: [1.2, 1.2, 0.05],
        defaultColor: '#87CEEB',
    },
    door: {
        type: 'door',
        label: 'ドア',
        defaultSize: [0.8, 2.0, 0.05],
        defaultColor: '#8B4513',
    },
}
