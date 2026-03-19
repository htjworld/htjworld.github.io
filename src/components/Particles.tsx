import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { InstancedMesh, Matrix4 } from 'three';

const COUNT = 300;
// Particles scatter in a large world-space cube around the player.
// They have ABSOLUTE world positions. Camera flies through them.
const HALF = 160; // half-extent of the wrapping cube (x/z)
const HALF_Y = 60; // half-extent in Y

// Spawn center (player start position)
const SPAWN_X = 0;
const SPAWN_Y = 5;
const SPAWN_Z = 700;

export const Particles = () => {
  const meshRef = useRef<InstancedMesh>(null);
  const { camera } = useThree();

  // Absolute world-space positions, initialized around player spawn
  const pts = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: SPAWN_X + (Math.random() - 0.5) * HALF * 2,
        y: SPAWN_Y + (Math.random() - 0.5) * HALF_Y * 2,
        z: SPAWN_Z + (Math.random() - 0.5) * HALF * 2,
      })),
    [],
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const m = new Matrix4();
    const cx = camera.position.x;
    const cy = camera.position.y;
    const cz = camera.position.z;

    for (let i = 0; i < COUNT; i++) {
      const p = pts[i];

      // Slow drift downward (snow/dust feel)
      p.y -= 0.04;

      // Wrap in X: if particle is more than HALF away from camera, teleport to opposite side
      if (p.x - cx > HALF) p.x -= HALF * 2;
      else if (p.x - cx < -HALF) p.x += HALF * 2;

      // Wrap in Y
      if (p.y - cy > HALF_Y) p.y -= HALF_Y * 2;
      else if (p.y - cy < -HALF_Y) p.y += HALF_Y * 2;

      // Wrap in Z
      if (p.z - cz > HALF) p.z -= HALF * 2;
      else if (p.z - cz < -HALF) p.z += HALF * 2;

      m.makeTranslation(p.x, p.y, p.z);
      meshRef.current.setMatrixAt(i, m);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[0.08, 4, 4]} />
      <meshBasicMaterial color="white" />
    </instancedMesh>
  );
};
