import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { PlayerController } from './PlayerController';
import { City } from './City';
import { Particles } from './Particles';
import { ProfileBoard } from './ProfileBoard';
import { GuestBook } from './GuestBook';
import { useGameStore } from '../store/gameStore';

// Overview camera for the start/pause screen — shows all three towns from above
const StartCamera = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 350, 200);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
};

const WorldContent = () => {
  const { started } = useGameStore();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[200, 300, 100]}
        intensity={1.5}
      />
      <hemisphereLight args={['#ffffff', '#e2e8f0', 0.6]} />

      {/* Sky — blue with atmospheric haze */}
      <Sky
        distance={10000}
        sunPosition={[100, 100, 50]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={2}
        rayleigh={0.3}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Particles (always present, world-space snow/stars) */}
      <Particles />

      {/* City */}
      <Suspense fallback={null}>
        <City />
      </Suspense>

      {/* 소개 게시판 (왼쪽) + 방명록 (오른쪽) */}
      <Suspense fallback={null}>
        <ProfileBoard />
        <GuestBook />
      </Suspense>

      {/* Camera: overview before start, player controller after */}
      {!started && <StartCamera />}
      {started && (
        <Physics gravity={[0, 0, 0]}>
          <PlayerController />
        </Physics>
      )}
    </>
  );
};

export const Scene = () => {
  return (
    <Canvas
      camera={{ position: [0, 350, 200], fov: 75, near: 2.0, far: 3000 }}
      gl={{ antialias: true }}
    >
      <WorldContent />
    </Canvas>
  );
};
