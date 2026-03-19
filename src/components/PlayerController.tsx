import { useRef, useEffect, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Vector3, Raycaster, Vector2, Group } from 'three';
import { buildingColliders } from '../store/buildings';
import { useGameStore } from '../store/gameStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_HEIGHT = 5;
const SPEED = 45;
const VERTICAL_SPEED = 22;
const BOOST_MULT = 3;
const DOUBLE_TAP_MS = 300;
const MOUSE_SENS = 0.002;

// 3rd-person camera offsets
const CAM_BACK = 18;       // units behind the plane
const CAM_UP = 6;          // units above the plane
const CAM_LERP = 0.1;      // follow smoothness (0=no follow, 1=instant)
const CAM_LOOK_AHEAD = 8;  // look target offset ahead of plane

// If the plane faces the wrong way, toggle this between 0 and Math.PI
const MODEL_YAW_OFFSET = 0;

// ─── Collision helper ─────────────────────────────────────────────────────────
function isColliding(pos: Vector3): boolean {
  for (const box of buildingColliders) {
    if (box.containsPoint(pos)) return true;
  }
  return false;
}

// ─── GLB plane model (cached by useGLTF) ─────────────────────────────────────
const PlaneModel = () => {
  const { scene } = useGLTF('/plane.glb');
  return <primitive object={scene} scale={[0.5, 0.5, 0.5]} />;
};
useGLTF.preload('/plane.glb');

// ─── PlayerController ─────────────────────────────────────────────────────────
export const PlayerController = () => {
  const { camera, scene } = useThree();
  const setFastMode = useGameStore((s) => s.setFastMode);

  // Plane world position (ref = no re-render)
  const planePos = useRef(new Vector3(0, 5, 700));
  // Smooth camera world position
  const camPos = useRef(new Vector3(0, 5 + CAM_UP, 700 + CAM_BACK));
  // Plane mesh group
  const planeRef = useRef<Group>(null);

  // Mouse-tracked heading
  const yaw = useRef(0);    // horizontal (radians), 0 = faces -Z
  const pitch = useRef(0);  // vertical (radians)

  // Input state
  const fwd = useRef(false);
  const bwd = useRef(false);
  const lft = useRef(false);
  const rgt = useRef(false);
  const up = useRef(false);
  const dn = useRef(false);
  const fastMode = useRef(false);
  const lastSpaceTap = useRef(0);

  // ── Initial camera placement ─────────────────────────────────────────────
  useEffect(() => {
    camera.position.copy(camPos.current);
    camera.lookAt(planePos.current);
  }, [camera]);

  // ── Mouse: accumulate yaw/pitch while pointer is locked ─────────────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      yaw.current -= e.movementX * MOUSE_SENS;
      pitch.current -= e.movementY * MOUSE_SENS;
      // Clamp pitch so the plane doesn't flip over
      pitch.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch.current));
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, []);

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    fwd.current = true; break;
        case 'KeyS': case 'ArrowDown':  bwd.current = true; break;
        case 'KeyA': case 'ArrowLeft':  lft.current = true; break;
        case 'KeyD': case 'ArrowRight': rgt.current = true; break;
        case 'ShiftLeft': case 'ShiftRight': dn.current = true; break;
        case 'Space': {
          e.preventDefault();
          up.current = true;
          const now = performance.now();
          if (now - lastSpaceTap.current < DOUBLE_TAP_MS) {
            fastMode.current = !fastMode.current;
            setFastMode(fastMode.current);
            lastSpaceTap.current = 0;
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

  // ── Click: raycast for billboard links ───────────────────────────────────
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

  // ── Frame loop ────────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const mult = fastMode.current ? BOOST_MULT : 1;
    const spd  = SPEED * mult;
    const vspd = VERTICAL_SPEED * mult;

    // Direction vectors from yaw (XZ plane only — WASD is always horizontal)
    const sinY = Math.sin(yaw.current);
    const cosY = Math.cos(yaw.current);
    const forward = new Vector3(-sinY, 0, -cosY); // faces -Z when yaw=0
    const right   = new Vector3( cosY, 0, -sinY);

    // ── Horizontal movement ──────────────────────────────────────────────
    if (fwd.current || bwd.current || lft.current || rgt.current) {
      const h = new Vector3();
      if (fwd.current) h.addScaledVector(forward,  spd * dt);
      if (bwd.current) h.addScaledVector(forward, -spd * dt);
      if (lft.current) h.addScaledVector(right,   -spd * dt);
      if (rgt.current) h.addScaledVector(right,    spd * dt);

      const next = planePos.current.clone();
      next.x += h.x;
      next.z += h.z;

      if (!isColliding(next)) {
        planePos.current.x = next.x;
        planePos.current.z = next.z;
      } else {
        // Axis-separated sliding
        const nx = planePos.current.clone(); nx.x += h.x;
        if (!isColliding(nx)) planePos.current.x = nx.x;
        const nz = planePos.current.clone(); nz.z += h.z;
        if (!isColliding(nz)) planePos.current.z = nz.z;
      }
    }

    // ── Vertical movement ─────────────────────────────────────────────────
    if (up.current || dn.current) {
      const vd = (up.current ? 1 : -1) * vspd * dt;
      const newY = Math.max(MIN_HEIGHT, planePos.current.y + vd);
      const test = new Vector3(planePos.current.x, newY, planePos.current.z);
      if (!isColliding(test)) planePos.current.y = newY;
    }

    // ── Plane mesh: position + rotation ──────────────────────────────────
    if (planeRef.current) {
      planeRef.current.position.copy(planePos.current);

      // Banking effect when turning left/right
      const bank = ((lft.current ? 1 : 0) - (rgt.current ? 1 : 0)) * 0.35;

      // YXZ order: yaw first, then pitch (nose tilt), then bank roll
      planeRef.current.rotation.order = 'YXZ';
      planeRef.current.rotation.y = yaw.current + MODEL_YAW_OFFSET;
      planeRef.current.rotation.x = -pitch.current * 0.6;
      planeRef.current.rotation.z = bank;
    }

    // ── 3rd-person camera ─────────────────────────────────────────────────
    // Target: behind and above the plane along the back direction
    const back = new Vector3(sinY, 0, cosY); // opposite of forward
    const targetCam = planePos.current.clone()
      .addScaledVector(back, CAM_BACK)
      .add(new Vector3(0, CAM_UP, 0));

    // Smooth lerp to target
    camPos.current.lerp(targetCam, CAM_LERP);
    camera.position.copy(camPos.current);

    // Look a bit ahead of the plane (natural 3rd-person feel)
    const lookTarget = planePos.current.clone().addScaledVector(forward, CAM_LOOK_AHEAD);
    camera.lookAt(lookTarget);
  });

  return (
    <group ref={planeRef}>
      <Suspense fallback={null}>
        <PlaneModel />
      </Suspense>
    </group>
  );
};
