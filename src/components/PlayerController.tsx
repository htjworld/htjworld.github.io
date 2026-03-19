import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3 } from 'three';

const SPEED = 40.0; // Doubled from 20.0
const BOOST_MULTIPLIER = 3.0; // Increased from 2.5

export const PlayerController = () => {
  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const moveUp = useRef(false);
  const moveDown = useRef(false);
  const isBoosting = useRef(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = true;
          break;
        case 'Space':
          moveUp.current = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
           isBoosting.current = true;
           break;
        case 'ControlLeft':
        case 'KeyC':
            moveDown.current = true;
            break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = false;
          break;
        case 'Space':
          moveUp.current = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
           isBoosting.current = false;
           break;
        case 'ControlLeft':
        case 'KeyC':
            moveDown.current = false;
            break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const actualSpeed = isBoosting.current ? SPEED * BOOST_MULTIPLIER : SPEED;
    const velocity = new Vector3();

    if (moveForward.current) velocity.z -= 1;
    if (moveBackward.current) velocity.z += 1;
    if (moveLeft.current) velocity.x -= 1;
    if (moveRight.current) velocity.x += 1;
    if (moveUp.current) velocity.y += 1;
    if (moveDown.current) velocity.y -= 1;
    
    velocity.normalize().multiplyScalar(actualSpeed * delta);

    // Apply rotation to velocity (except vertical for a simple flying feel, or full 6DOF?)
    // For simple flying where W is always "forward direction of camera":
    velocity.applyEuler(camera.rotation);

    camera.position.add(velocity);
  });

  return <PointerLockControls />;
};
