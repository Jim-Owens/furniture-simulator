
export interface Point {
    x: number
    y: number
}

// Ray casting algorithm to check if point is in polygon
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y
        const xj = polygon[j].x, yj = polygon[j].y

        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }
    return inside
}

// Check intersection between two line segments (p1-p2 and p3-p4)
export function doSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y)
    if (det === 0) return false

    const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det
    const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det

    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
}

// Check furniture collision against room walls
// Returns TRUE if colliding (invalid position)
export function checkFurnitureRoomCollision(
    newPos: { x: number, z: number },
    rotationY: number,
    width: number,
    depth: number,
    roomPoints: { x: number, y: number }[]
): boolean {
    // Map Room Point (x, y) to World (x, z)
    // Room Y+ is Back, which corresponds to World Z-
    // We map Room Y to World -Z.
    const polygon = roomPoints.map(p => ({ x: p.x, y: -p.y }))

    // Furniture corners in world X/Z (mapped to x/y)
    const cos = Math.cos(rotationY)
    const sin = Math.sin(rotationY)
    const halfW = width / 2
    const halfD = depth / 2

    // Relative corners (x, z)
    const relCorners = [
        { x: -halfW, z: -halfD },
        { x: halfW, z: -halfD },
        { x: halfW, z: halfD },
        { x: -halfW, z: halfD }
    ]

    // Transform to world and map Z to Y
    const corners = relCorners.map(p => {
        // Rotate (around Y axis)
        const rx = p.x * cos - p.z * sin
        const rz = p.x * sin + p.z * cos
        // Translate
        return {
            x: newPos.x + rx,
            y: newPos.z + rz
        }
    })

    // Check 1: Inside Polygon?
    // If ANY corner is OUTSIDE, it's a collision (with the void/wall boundary)
    for (const c of corners) {
        if (!isPointInPolygon(c, polygon)) return true
    }

    // Check 2: Edges Intersection
    const n = polygon.length
    for (let i = 0; i < n; i++) {
        const w1 = polygon[i]
        const w2 = polygon[(i + 1) % n]

        for (let j = 0; j < 4; j++) {
            const f1 = corners[j]
            const f2 = corners[(j + 1) % 4]
            if (doSegmentsIntersect(f1, f2, w1, w2)) return true
        }
    }

    return false
}
