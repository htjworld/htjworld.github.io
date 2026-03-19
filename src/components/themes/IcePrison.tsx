import { useMemo } from 'react';
import { useBox } from '@react-three/cannon';
import { AdBoard } from '../AdBoard';
import { getRandomAd } from '../../config/ads';

export const IcePrison = () => {
  const walls = useMemo(() => {
    const items = [];
    const count = 50;
    
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        
        // Clear lobby
        if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;

        const width = 5 + Math.random() * 10;
        const height = 20 + Math.random() * 20; // Tall
        const depth = 5 + Math.random() * 10;
        
        const hasAd = Math.random() > 0.4;

        items.push({
            position: [x, height/2, z] as [number, number, number],
            size: [width, height, depth] as [number, number, number],
            ad: hasAd ? getRandomAd() : null
        })
    }
    return items;
  }, []);

  return (
      <group>
           <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#88ccff" roughness={0} metalness={0.8} />
           </mesh>

           {walls.map((w, i) => (
               <IceWall key={i} {...w} />
           ))}
      </group>
  )
}

const IceWall = ({ position, size, ad }: any) => {
    const [ref] = useBox(() => ({ mass: 0, type: 'Static', position, args: size }));
    
    return (
        <group>
            <mesh ref={ref}>
                <boxGeometry args={size} />
                <meshStandardMaterial color="#aaddff" transparent opacity={0.8} roughness={0.1} />
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
