import * as THREE from 'three'

// Convert raw points to THREE.Vector2
export const generateRoomPolygon = (points: { x: number, y: number }[]): THREE.Vector2[] => {
    return points.map(p => new THREE.Vector2(p.x, p.y))
}

// Generate the outer wall shape by offsetting the inner polygon
export const generateOuterWallPolygon = (innerPoints: THREE.Vector2[], thickness: number): THREE.Vector2[] => {
    const offsetPoints: THREE.Vector2[] = []
    const pts = innerPoints
    const N = pts.length

    for (let i = 0; i < N; i++) {
        const pPrev = pts[(i - 1 + N) % N]
        const pCurr = pts[i]
        const pNext = pts[(i + 1) % N]

        // Vector 1 (Prev -> Curr)
        const v1 = new THREE.Vector2().subVectors(pCurr, pPrev).normalize()
        // Normal 1 (Rotate -90 deg: (y, -x))
        const n1 = new THREE.Vector2(v1.y, -v1.x)

        // Vector 2 (Curr -> Next)
        const v2 = new THREE.Vector2().subVectors(pNext, pCurr).normalize()
        const n2 = new THREE.Vector2(v2.y, -v2.x)

        // Intersection logic
        // Line 1 supports: A = pCurr + n1*T, dir = -v1 (away from corner along edge)
        // Line 2 supports: B = pCurr + n2*T, dir = v2 (away from corner along edge)

        // Wait, logic correction:
        // We want intersection of Line 1 (parallel to Edge 1) and Line 2 (parallel to Edge 2).
        // Line 1: P = (pCurr + n1*T) + t * (-v1)
        // Line 2: P = (pCurr + n2*T) + u * v2

        // Let A = pCurr + n1*T
        // Let B = pCurr + n2*T

        // A - t*v1 = B + u*v2
        // A - B = t*v1 + u*v2

        const T = thickness
        const A = pCurr.clone().add(n1.clone().multiplyScalar(T))
        const B = pCurr.clone().add(n2.clone().multiplyScalar(T))
        const D = new THREE.Vector2().subVectors(A, B)

        // Solve D = t*v1 + u*v2 for t and u using 2D determinant (cross product)
        const crossV1V2 = v1.x * v2.y - v1.y * v2.x

        if (Math.abs(crossV1V2) < 0.001) {
            // Parallel or Collinear
            offsetPoints.push(A)
        } else {
            // Cramer's rule or simple cross product
            // D x v2 = t * (v1 x v2)
            const crossDV2 = D.x * v2.y - D.y * v2.x
            const t = crossDV2 / crossV1V2

            // Intersection P = A - t * v1
            const P = A.clone().sub(v1.clone().multiplyScalar(t))

            // Check for sharp angles (P is too far)
            const limit = thickness * 5
            if (P.distanceToSquared(pCurr) > limit * limit) {
                // Bevel the sharp corner
                offsetPoints.push(A)
                offsetPoints.push(B)
            } else {
                offsetPoints.push(P)
            }
        }
    }

    return offsetPoints
}
