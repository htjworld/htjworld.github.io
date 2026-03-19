import { useMemo } from 'react';
import { useBox } from '@react-three/cannon';
import { AdBoard } from '../AdBoard';
import { getRandomAd } from '../../config/ads';

export const ShiningHallway = () => {
    // Long corridor with side rooms
    const segments = useMemo(() => {
        const items = [];
        const length = 20;
        
        // Main Hallway Walls
        for (let i = 0; i < length; i++) {
             // Left Wall
             items.push({
                 position: [-10, 5, i * 20 + 20],
                 size: [1, 10, 20],
                 ad: getRandomAd()
             });
             // Right Wall
             items.push({
                 position: [10, 5, i * 20 + 20],
                 size: [1, 10, 20],
                 ad: getRandomAd()
             });
        }
        return items;
    }, []);

    return (
        <group>
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[100, 1000]} />
                <meshStandardMaterial color="#7a2a2a" /> {/* Carpet Red */}
           </mesh>
           {segments.map((s, i) => <Wall key={i} {...s} />)}
        </group>
    )
}

const Wall = ({ position, size, ad }: any) => {
    const [ref] = useBox(() => ({ mass: 0, type: 'Static', position, args: size }));
    return (
        <group>
            <mesh ref={ref}>
                <boxGeometry args={size} />
                <meshStandardMaterial color="#d4b483" /> {/* Wallpaperish */}
            </mesh>
             {ad && (
                 <AdBoard 
                    ad={ad} 
                    position={[position[0] + (position[0] > 0 ? -0.6 : 0.6), position[1], position[2]]} 
                    rotation={[0, position[0] > 0 ? -Math.PI/2 : Math.PI/2, 0]}
                    width={8}
                />
            )}
        </group>
    )
}
