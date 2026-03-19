import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3, Raycaster, Vector2 } from 'three';
import { buildingColliders } from '../store/buildings';
import { useGameStore } from '../store/gameStore';

const MIN_HEIGHT = 5;
const SPEED = 45;
const VERTICAL_SPEED = 22;
const BOOST_MULT = 3;
const DOUBLE_TAP_MS = 300;

function isColliding(pos: Vector3): boolean {
  for (const box of buildingColliders) {
    if (box.containsPoint(pos)) return true;
  }
  return false;
}

export const PlayerController = () => {
  const { camera, scene } = useThree();
  const setFastMode = useGameStore((s) => s.setFastMode);

  const fwd = useRef(false);
  const bwd = useRef(false);
  const lft = useRef(false);
  const rgt = useRef(false);
  const up = useRef(false);
  const dn = useRef(false);
  const fastMode = useRef(false);
  const lastSpaceTap = useRef(0);

  // Reset camera to fly position when this component mounts (game starts)
  useEffect(() => {
    // Home position: ground level center, all three towns visible in the distance
    camera.position.set(0, 5, 700);
    camera.rotation.order = 'YXZ';
    camera.rotation.set(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    fwd.current = true; break;
        case 'KeyS': case 'ArrowDown':  bwd.current = true; break;
        case 'KeyA': case 'ArrowLeft':  lft.current = true; break;
        case 'KeyD': case 'ArrowRight': rgt.current = true; break;
        case 'ShiftLeft': case 'ShiftRight':
          dn.current = true;
          break;
        case 'Space': {
          e.preventDefault();
          up.current = true;
          const now = performance.now();
          if (now - lastSpaceTap.current < DOUBLE_TAP_MS) {
            fastMode.current = !fastMode.current;
            setFastMode(fastMode.current);
            lastSpaceTap.current = 0; // reset so triple-tap doesn't re-toggle
          } else {
            lastSpaceTap.current = now;
          }
          break;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    fwd.current = false; break;
        case 'KeyS': case 'ArrowDown':  bwd.current = false; break;
        case 'KeyA': case 'ArrowLeft':  lft.current = false; break;
        case 'KeyD': case 'ArrowRight': rgt.current = false; break;
        case 'ShiftLeft': case 'ShiftRight': dn.current = false; break;
        case 'Space': up.current = false; break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [setFastMode]);

  // Click: raycast to find billboard under crosshair
  useEffect(() => {
    const onClick = () => {
      if (!document.pointerLockElement) return;
      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(0, 0), camera);
      raycaster.far = 200;
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const h of hits) {
        if (h.object.userData.link) {
          window.open(h.object.userData.link as string, '_blank');
          break;
        }
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [camera, scene]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const mult = fastMode.current ? BOOST_MULT : 1;
    const spd = SPEED * mult;
    const vspd = VERTICAL_SPEED * mult;

    // --- Horizontal movement: camera-relative (use actual world direction) ---
    const anyH = fwd.current || bwd.current || lft.current || rgt.current;
    if (anyH) {
      const cameraFwd = new Vector3();
      camera.getWorldDirection(cameraFwd);
      cameraFwd.y = 0;
      if (cameraFwd.lengthSq() > 0.001) cameraFwd.normalize();
      const cameraRight = new Vector3(-cameraFwd.z, 0, cameraFwd.x);

      const h = new Vector3();
      if (fwd.current) h.addScaledVector(cameraFwd,   spd * dt);
      if (bwd.current) h.addScaledVector(cameraFwd,  -spd * dt);
      if (lft.current) h.addScaledVector(cameraRight, -spd * dt);
      if (rgt.current) h.addScaledVector(cameraRight,  spd * dt);

      const next = camera.position.clone();
      next.x += h.x;
      next.z += h.z;

      if (!isColliding(next)) {
        camera.position.x = next.x;
        camera.position.z = next.z;
      } else {
        // Axis-separated sliding
        const nx = camera.position.clone();
        nx.x += h.x;
        if (!isColliding(nx)) camera.position.x = nx.x;

        const nz = camera.position.clone();
        nz.z += h.z;
        if (!isColliding(nz)) camera.position.z = nz.z;
      }
    }

    // --- Vertical movement ---
    if (up.current || dn.current) {
      const vd = (up.current ? 1 : -1) * vspd * dt;
      const newY = Math.max(MIN_HEIGHT, camera.position.y + vd);
      const testPos = new Vector3(camera.position.x, newY, camera.position.z);
      if (!isColliding(testPos)) {
        camera.position.y = newY;
      }
    }
  });

  return <PointerLockControls />;
};
