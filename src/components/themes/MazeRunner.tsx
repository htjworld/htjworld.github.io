import { useMemo } from 'react';
import { useBox } from '@react-three/cannon';
import { AdBoard } from '../AdBoard';
import { getRandomAd } from '../../config/ads';

export const MazeRunner = () => {
    // Generate a simple grid maze or just dense blocks
    const walls = useMemo(() => {
        const items = [];
        const gridSize = 20;
        const spacing = 15;

        for (let x = -gridSize; x <= gridSize; x++) {
            for (let z = -gridSize; z <= gridSize; z++) {
                if (Math.abs(x) < 3 && Math.abs(z) < 3) continue; // Large lobby

                if (Math.random() > 0.6) continue;

                const height = 50; // VERY Tall walls
                items.push({
                    position: [x * spacing, height / 2, z * spacing] as [number, number, number],
                    size: [spacing, height, spacing] as [number, number, number],
                    ad: Math.random() > 0.7 ? getRandomAd() : null
                })
            }
        }
        return items;
    }, []);

    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#333" />
           </mesh>
           {walls.map((w, i) => <ConcreteWall key={i} {...w} />)}
        </group>
    )
}

const ConcreteWall = ({ position, size, ad }: any) => {
    const [ref] = useBox(() => ({ mass: 0, type: 'Static', position, args: size }));
    return (
        <group>
             <mesh ref={ref}>
                <boxGeometry args={size} />
                <meshStandardMaterial color="#555" />
            </mesh>
             {ad && (
                 <AdBoard 
                    ad={ad} 
                    position={[position[0], position[1], position[2] + size[2]/2 + 0.1]} 
                    width={size[0] * 0.8}
                />
            )}
        </group>
    )
}
