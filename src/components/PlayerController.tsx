import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3 } from 'three';

const FLYING_SPEED = 60;
const GROUND_Y = 2;

export const PlayerController = () => {
  const { camera } = useThree();

  const keys = useRef({
    forward: false, backward: false,
    left: false, right: false,
    up: false, down: false,
    boost: false,
  });

  useEffect(() => {
    const resetKeys = () => {
      const k = keys.current;
      k.forward = k.backward = k.left = k.right = k.up = k.down = k.boost = false;
    };

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
    document.addEventListener('pointerlockchange', resetKeys);
    window.addEventListener('blur', resetKeys);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', resetKeys);
      window.removeEventListener('blur', resetKeys);
    };
  }, []);

  useFrame((_, delta) => {
    const { forward, backward, left, right, up, down, boost } = keys.current;
    const speed = boost ? FLYING_SPEED * 2 : FLYING_SPEED;

    const lookDir = new Vector3();
    camera.getWorldDirection(lookDir);

    const rightDir = new Vector3();
    rightDir.crossVectors(lookDir, new Vector3(0, 1, 0)).normalize();

    const move = new Vector3();
    if (forward) move.addScaledVector(lookDir, speed * delta);
    if (backward) move.addScaledVector(lookDir, -speed * delta);
    if (left) move.addScaledVector(rightDir, -speed * delta);
    if (right) move.addScaledVector(rightDir, speed * delta);
    if (up) move.y += speed * 0.5 * delta;
    if (down) move.y -= speed * 0.5 * delta;

    camera.position.add(move);

    if (camera.position.y < GROUND_Y) camera.position.y = GROUND_Y;
  });

  return <PointerLockControls />;
};
