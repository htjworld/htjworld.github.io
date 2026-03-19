import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3, Euler } from 'three';
import { useSphere } from '@react-three/cannon';

const FLYING_SPEED = 60;
const GROUND_Y = 2;

export const PlayerController = () => {
  const { camera } = useThree();

  const [, api] = useSphere(() => ({
    mass: 1,
    position: [0, 5, 0],
    args: [1],
    fixedRotation: true,
    linearDamping: 0.95,
  }));

  const velocity = useRef([0, 0, 0]);
  const pos = useRef([0, 5, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);
  useEffect(() => api.position.subscribe((p) => (pos.current = p)), [api.position]);

  const keys = useRef({
    forward: false, backward: false,
    left: false, right: false,
    up: false, down: false,
    boost: false,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = keys.current;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') k.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') k.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') k.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') k.right = true;
      if (e.code === 'Space') k.up = true;
      if (e.code === 'ControlLeft' || e.code === 'KeyC') k.down = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') k.boost = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = keys.current;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') k.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') k.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') k.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') k.right = false;
      if (e.code === 'Space') k.up = false;
      if (e.code === 'ControlLeft' || e.code === 'KeyC') k.down = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') k.boost = false;
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame(() => {
    const { forward, backward, left, right, up, down, boost } = keys.current;
    const speed = boost ? FLYING_SPEED * 2 : FLYING_SPEED;

    const hDir = new Vector3();
    if (forward) hDir.z -= 1;
    if (backward) hDir.z += 1;
    if (left) hDir.x -= 1;
    if (right) hDir.x += 1;
    if (hDir.length() > 0) {
      hDir.normalize().multiplyScalar(speed);
      hDir.applyEuler(new Euler(0, camera.rotation.y, 0));
    }

    let vy = 0;
    if (up) vy = speed * 0.5;
    if (down) vy = -speed * 0.5;

    api.velocity.set(hDir.x, vy, hDir.z);
    camera.position.set(pos.current[0], pos.current[1] + 1, pos.current[2]);

    if (pos.current[1] < GROUND_Y - 1) {
      api.position.set(pos.current[0], GROUND_Y - 1, pos.current[2]);
    }
  });

  return <PointerLockControls />;
};
