import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { PlayerController } from './PlayerController';
import { ThemeManager } from './themes/ThemeManager';

export const Scene = () => {
  return (
    <>
      <Canvas camera={{ position: [0, 5, 10], fov: 75 }} shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[100, 100, 50]} intensity={1} castShadow />

        <Sky sunPosition={[100, 20, 100]} />
        <Stars />

        <Physics gravity={[0, -9.8, 0]}>
          <ThemeManager />
          <PlayerController />
        </Physics>
      </Canvas>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '10px',
        height: '10px',
        backgroundColor: 'white',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        mixBlendMode: 'difference',
      }} />
    </>
  );
};
