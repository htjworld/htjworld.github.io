import { useState } from 'react';
import { useTexture } from '@react-three/drei';
import { Vector3, Euler } from 'three';
import type { AdConfig } from '../config/ads';

interface AdBoardProps {
  ad: AdConfig;
  position: [number, number, number] | Vector3;
  rotation?: [number, number, number] | Euler;
  width?: number;
}

export const AdBoard = ({ ad, position, rotation = [0, 0, 0], width = 5 }: AdBoardProps) => {
  const texture = useTexture(ad.imageUrl);
  const height = width / ad.ratio;
  const [hovered, setHover] = useState(false);

  return (
    <group position={position} rotation={rotation}>
      {/* Frame/Backboard — position 0.05 forward so back face clears building surface */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[width + 0.5, height + 0.5, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Ad Surface */}
      <mesh
        position={[0, 0, 0.2]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onClick={() => window.open(ad.linkUrl, '_blank')}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} color={hovered ? '#ddd' : 'white'} />
      </mesh>
    </group>
  );
};
