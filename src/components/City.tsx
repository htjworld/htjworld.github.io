import { useMemo } from 'react';
import { AdBoard } from './AdBoard';
import { getRandomAd } from '../config/ads';

export const City = () => {
  const buildings = useMemo(() => {
    const items = [];
    const gridSize = 10;
    const spacing = 30;

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        if (Math.random() > 0.7) continue; // Random gaps

        const height = 10 + Math.random() * 40;
        const width = 10 + Math.random() * 10;
        const depth = 10 + Math.random() * 10;
        
        const hasAd = Math.random() > 0.5;
        const ad = hasAd ? getRandomAd() : null;

        items.push({
          position: [x * spacing, height / 2, z * spacing] as [number, number, number],
          size: [width, height, depth] as [number, number, number],
          color: Math.random() > 0.5 ? '#444' : '#666',
          ad
        });
      }
    }
    return items;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Buildings */}
      {buildings.map((b, i) => (
        <group key={i} position={b.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} />
          </mesh>
          
          {/* Ad on one side of the building if it exists */}
          {b.ad && (
            <AdBoard 
                ad={b.ad} 
                position={[0, 0, b.size[2] / 2 + 0.1]} 
                width={b.size[0] * 0.8}
            />
          )}
        </group>
      ))}
    </group>
  );
};
