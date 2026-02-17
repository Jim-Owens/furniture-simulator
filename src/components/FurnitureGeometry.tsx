import type { FurnitureType } from '../constants/furniture'

export const FurnitureGeometry = ({ type, color, isSelected }: { type: FurnitureType, color: string, isSelected: boolean }) => {
    const meshColor = isSelected ? '#FFD700' : color

    switch (type) {
        case 'chair':
        case 'work_chair':
            return (
                <group>
                    <mesh position={[0, -0.1, 0]}>
                        <boxGeometry args={[1, 0.1, 1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[0, 0.25, -0.45]}>
                        <boxGeometry args={[1, 0.5, 0.1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[0.4, -0.3, 0.4]}>
                        <boxGeometry args={[0.1, 0.4, 0.1]} />
                        <meshStandardMaterial color="#555" />
                    </mesh>
                    <mesh position={[-0.4, -0.3, 0.4]}>
                        <boxGeometry args={[0.1, 0.4, 0.1]} />
                        <meshStandardMaterial color="#555" />
                    </mesh>
                    <mesh position={[0.4, -0.3, -0.4]}>
                        <boxGeometry args={[0.1, 0.4, 0.1]} />
                        <meshStandardMaterial color="#555" />
                    </mesh>
                    <mesh position={[-0.4, -0.3, -0.4]}>
                        <boxGeometry args={[0.1, 0.4, 0.1]} />
                        <meshStandardMaterial color="#555" />
                    </mesh>
                </group>
            )

        case 'table':
        case 'low_table':
        case 'desk':
            return (
                <group>
                    <mesh position={[0, 0.45, 0]}>
                        <boxGeometry args={[1, 0.1, 1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[0.4, -0.05, 0.4]}>
                        <boxGeometry args={[0.1, 0.9, 0.1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[-0.4, -0.05, 0.4]}>
                        <boxGeometry args={[0.1, 0.9, 0.1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[0.4, -0.05, -0.4]}>
                        <boxGeometry args={[0.1, 0.9, 0.1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[-0.4, -0.05, -0.4]}>
                        <boxGeometry args={[0.1, 0.9, 0.1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                </group>
            )

        case 'bed':
            return (
                <group>
                    <mesh position={[0.4, -0.35, 0.4]}>
                        <boxGeometry args={[0.1, 0.3, 0.1]} />
                        <meshStandardMaterial color="#594334" />
                    </mesh>
                    <mesh position={[-0.4, -0.35, 0.4]}>
                        <boxGeometry args={[0.1, 0.3, 0.1]} />
                        <meshStandardMaterial color="#594334" />
                    </mesh>
                    <mesh position={[0.4, -0.35, -0.4]}>
                        <boxGeometry args={[0.1, 0.3, 0.1]} />
                        <meshStandardMaterial color="#594334" />
                    </mesh>
                    <mesh position={[-0.4, -0.35, -0.4]}>
                        <boxGeometry args={[0.1, 0.3, 0.1]} />
                        <meshStandardMaterial color="#594334" />
                    </mesh>
                    <mesh position={[0, -0.1, 0]}>
                        <boxGeometry args={[1, 0.2, 1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[0, 0.25, -0.45]}>
                        <boxGeometry args={[1, 0.5, 0.1]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[0, 0.05, -0.3]} rotation={[0.1, 0, 0]}>
                        <boxGeometry args={[0.6, 0.1, 0.25]} />
                        <meshStandardMaterial color="#FFF" />
                    </mesh>
                </group>
            )

        case 'tv':
        case 'monitor':
            return (
                <group>
                    <mesh position={[0, 0.1, 0]}>
                        <boxGeometry args={[1, 0.8, 0.05]} />
                        <meshStandardMaterial color={isSelected ? '#FFD700' : '#111'} />
                    </mesh>
                    <mesh position={[0, -0.4, 0]}>
                        <boxGeometry args={[0.3, 0.2, 0.3]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            )

        case 'sofa':
            return (
                <group>
                    <mesh position={[0, -0.1, 0]}>
                        <boxGeometry args={[1, 0.4, 1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[0, 0.25, -0.35]}>
                        <boxGeometry args={[1, 0.5, 0.3]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[0.42, 0.1, 0]}>
                        <boxGeometry args={[0.15, 0.4, 1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[-0.42, 0.1, 0]}>
                        <boxGeometry args={[0.15, 0.4, 1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                </group>
            )

        case 'pc':
            return (
                <group>
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color={isSelected ? '#FFD700' : '#111'} />
                    </mesh>
                    <mesh position={[0, 0.3, 0.51]}>
                        <boxGeometry args={[0.05, 0.8, 0.01]} />
                        <meshBasicMaterial color="#00ff00" />
                    </mesh>
                </group>
            )

        case 'desk_rack':
            return (
                <group>
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[1, 0.05, 1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[0.45, 0, 0.45]}>
                        <cylinderGeometry args={[0.02, 0.02, 1]} />
                        <meshStandardMaterial color="#ddd" />
                    </mesh>
                    <mesh position={[-0.45, 0, 0.45]}>
                        <cylinderGeometry args={[0.02, 0.02, 1]} />
                        <meshStandardMaterial color="#ddd" />
                    </mesh>
                    <mesh position={[0.45, 0, -0.45]}>
                        <cylinderGeometry args={[0.02, 0.02, 1]} />
                        <meshStandardMaterial color="#ddd" />
                    </mesh>
                    <mesh position={[-0.45, 0, -0.45]}>
                        <cylinderGeometry args={[0.02, 0.02, 1]} />
                        <meshStandardMaterial color="#ddd" />
                    </mesh>
                </group>
            )

        case 'shelf':
        case 'storage_box':
        case 'tv_stand_low':
        case 'original':
            return (
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={meshColor} />
                </mesh>
            )

        case 'rug':
            return (
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={meshColor} />
                </mesh>
            )

        case 'window':
            return (
                <group>
                    {/* Frame Top */}
                    <mesh position={[0, 0.475, 0]}>
                        <boxGeometry args={[1, 0.05, 0.1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    {/* Frame Bottom */}
                    <mesh position={[0, -0.475, 0]}>
                        <boxGeometry args={[1, 0.05, 0.1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    {/* Frame Left */}
                    <mesh position={[-0.475, 0, 0]}>
                        <boxGeometry args={[0.05, 1, 0.1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    {/* Frame Right */}
                    <mesh position={[0.475, 0, 0]}>
                        <boxGeometry args={[0.05, 1, 0.1]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    {/* Glass */}
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[0.9, 0.9, 0.02]} />
                        <meshStandardMaterial
                            color="#e0f7fa"
                            transparent={true}
                            opacity={0.3}
                            roughness={0}
                            metalness={0.5}
                        />
                    </mesh>
                    {/* Cross bars */}
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[0.03, 1, 0.03]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[1, 0.03, 0.03]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                </group>
            )

        case 'door':
            return (
                <group>
                    {/* Frame */}
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[1, 1, 0.2]} />
                        <meshStandardMaterial color={meshColor} />
                    </mesh>
                    {/* Panel Indentation (Design) */}
                    <mesh position={[0, 0, 0.05]}>
                        <boxGeometry args={[0.8, 0.8, 0.15]} />
                        <meshStandardMaterial color={meshColor} />
                        {/* Slightly darker via lighting */}
                    </mesh>
                    {/* Knob */}
                    <mesh position={[0.35, 0, 0.12]}>
                        <sphereGeometry args={[0.05, 16, 16]} />
                        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>
            )

        default:
            return (
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={meshColor} />
                </mesh>
            )
    }
}
