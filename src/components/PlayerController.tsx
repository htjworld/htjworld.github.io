import { useRef, useEffect, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Vector3, Raycaster, Vector2, Group } from 'three';
import { buildingColliders } from '../store/buildings';
import { useGameStore } from '../store/gameStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_HEIGHT = 5;
const MAX_SPEED  = 70;   // horizontal (units/s) — was 45
const MAX_VSPEED = 35;   // vertical   (units/s) — was 22
const BOOST_MULT = 3;
const DOUBLE_TAP_MS = 300;
const MOUSE_SENS = 0.002;
const ACCEL_LERP = 0.12; // lerp factor per frame → smooth acceleration/decel

const CAM_BACK       = 12;
const CAM_UP         =  5;
const CAM_LERP       = 0.1;
const CAM_LOOK_AHEAD =  8;

const MODEL_YAW_OFFSET = Math.PI;

// ─── Collision helper ─────────────────────────────────────────────────────────
function isColliding(pos: Vector3): boolean {
  for (const box of buildingColliders) {
    if (box.containsPoint(pos)) return true;
  }
  return false;
}

// ─── GLB plane model ──────────────────────────────────────────────────────────
const PlaneModel = () => {
  const { scene } = useGLTF('/plane.glb');
  return <primitive object={scene} scale={[0.5, 0.5, 0.5]} />;
};
useGLTF.preload('/plane.glb');

// ─── PlayerController ─────────────────────────────────────────────────────────
export const PlayerController = () => {
  const { camera, scene } = useThree();
  const setFastMode = useGameStore((s) => s.setFastMode);
  const setOpenGuestbookSlot = useGameStore((s) => s.setOpenGuestbookSlot);
  const openGuestbookSlot = useGameStore((s) => s.openGuestbookSlot);

  // Physics body (kinematic position — we drive it, rapier tracks it)
  const rbRef = useRef<RapierRigidBody>(null);
  // Visual mesh group
  const planeGroupRef = useRef<Group>(null);

  // World-space plane position (synced from rbRef each frame)
  const planePos = useRef(new Vector3(0, 5, 700));
  // Smooth camera world position
  const camPos   = useRef(new Vector3(0, 5 + CAM_UP, 700 + CAM_BACK));
  // Smooth velocity (units/s) — lerped toward target each frame
  const vel = useRef(new Vector3());

  const yaw   = useRef(0); // horizontal heading (rad), 0 = faces -Z
  const pitch = useRef(0); // vertical tilt (rad)

  const fwd = useRef(false);
  const bwd = useRef(false);
  const lft = useRef(false);
  const rgt = useRef(false);
  const up  = useRef(false);
  const dn  = useRef(false);
  const fastMode    = useRef(false);
  const lastSpaceTap = useRef(0);

  // 방명록 UI 닫힐 때 눌린 키 전부 리셋 (비행기 멈춤)
  useEffect(() => {
    if (openGuestbookSlot === null) {
      fwd.current = false;
      bwd.current = false;
      lft.current = false;
      rgt.current = false;
      up.current  = false;
      dn.current  = false;
    }
  }, [openGuestbookSlot]);

  // Initial camera placement
  useEffect(() => {
    camera.position.copy(camPos.current);
    camera.lookAt(planePos.current);
  }, [camera]);

  // Mouse → yaw / pitch
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      yaw.current   -= e.movementX * MOUSE_SENS;
      pitch.current -= e.movementY * MOUSE_SENS;
      pitch.current  = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch.current));
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 방명록 UI 열려있으면 비행기 조작 차단
      if (useGameStore.getState().openGuestbookSlot !== null) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    fwd.current = true; break;
        case 'KeyS': case 'ArrowDown':  bwd.current = true; break;
        case 'KeyA': case 'ArrowLeft':  lft.current = true; break;
        case 'KeyD': case 'ArrowRight': rgt.current = true; break;
        case 'ShiftLeft': case 'ShiftRight': dn.current = true; break;
        case 'Space': {
          e.preventDefault();
          up.current = true;
          if (!e.repeat) {
            const now = performance.now();
            if (now - lastSpaceTap.current < DOUBLE_TAP_MS) {
              fastMode.current = !fastMode.current;
              setFastMode(fastMode.current);
              lastSpaceTap.current = 0;
            } else {
              lastSpaceTap.current = now;
            }
          }
          break;
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (useGameStore.getState().openGuestbookSlot !== null) return;
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

  // Click → billboard / guestbook raycast
  useEffect(() => {
    const onClick = () => {
      if (!document.pointerLockElement) return;
      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(0, 0), camera);
      raycaster.far = 300;
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const h of hits) {
        if (h.object.userData.link) {
          window.open(h.object.userData.link as string, '_blank');
          break;
        }
        if (h.object.userData.guestbookSlot !== undefined) {
          document.exitPointerLock();
          setOpenGuestbookSlot(h.object.userData.guestbookSlot as number);
          break;
        }
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [camera, scene, setOpenGuestbookSlot]);

  useFrame((_, delta) => {
    if (!rbRef.current) return;
    const dt   = Math.min(delta, 0.05);
    const mult = fastMode.current ? BOOST_MULT : 1;
    const spd  = MAX_SPEED  * mult;
    const vspd = MAX_VSPEED * mult;

    // Sync position from physics body
    const t = rbRef.current.translation();
    planePos.current.set(t.x, t.y, t.z);

    // Direction from yaw + pitch (full 3D)
    const sinY    = Math.sin(yaw.current);
    const cosY    = Math.cos(yaw.current);
    const sinP    = Math.sin(pitch.current);
    const cosP    = Math.cos(pitch.current);
    const forward = new Vector3(-sinY * cosP, sinP, -cosY * cosP);
    const right   = new Vector3( cosY,        0,    -sinY);

    // Build target velocity from input
    const targetVel = new Vector3();
    if (fwd.current) targetVel.addScaledVector(forward,  spd);
    if (bwd.current) targetVel.addScaledVector(forward, -spd);
    if (lft.current) targetVel.addScaledVector(right,   -spd);
    if (rgt.current) targetVel.addScaledVector(right,    spd);
    if (up.current)  targetVel.y =  vspd;
    if (dn.current)  targetVel.y = -vspd;

    // Smooth acceleration / deceleration
    vel.current.lerp(targetVel, ACCEL_LERP);

    // Predict next position
    const next = planePos.current.clone().addScaledVector(vel.current, dt);

    // ── Height clamp ──────────────────────────────────────────────────────
    if (next.y < MIN_HEIGHT) {
      next.y = MIN_HEIGHT;
      if (vel.current.y < 0) vel.current.y = 0;
    }

    // ── AABB horizontal collision with axis-separated sliding ─────────────
    const fullNext = new Vector3(next.x, next.y, next.z);
    if (isColliding(fullNext)) {
      // Try X-only move
      const tryX = new Vector3(next.x, next.y, planePos.current.z);
      if (!isColliding(tryX)) {
        next.z = planePos.current.z;
        vel.current.z = 0;
      } else {
        // Try Z-only move
        const tryZ = new Vector3(planePos.current.x, next.y, next.z);
        if (!isColliding(tryZ)) {
          next.x = planePos.current.x;
          vel.current.x = 0;
        } else {
          // Fully blocked
          next.x = planePos.current.x;
          next.z = planePos.current.z;
          vel.current.x = 0;
          vel.current.z = 0;
        }
      }
    }

    // Drive the physics body to the resolved position
    rbRef.current.setTranslation({ x: next.x, y: next.y, z: next.z }, true);
    planePos.current.copy(next);

    // ── Plane mesh visual rotation ────────────────────────────────────────
    if (planeGroupRef.current) {
      const bank = ((lft.current ? 1 : 0) - (rgt.current ? 1 : 0)) * 0.35;
      planeGroupRef.current.rotation.order = 'YXZ';
      planeGroupRef.current.rotation.y = yaw.current + MODEL_YAW_OFFSET;
      planeGroupRef.current.rotation.x = -pitch.current;
      planeGroupRef.current.rotation.z = bank;
    }

    // ── 3rd-person camera (pitch 반영) ────────────────────────────────────
    const back = new Vector3(sinY * cosP, -sinP, cosY * cosP);
    const targetCam = planePos.current.clone()
      .addScaledVector(back, CAM_BACK)
      .add(new Vector3(0, CAM_UP, 0));

    camPos.current.lerp(targetCam, CAM_LERP);
    camera.position.copy(camPos.current);

    const lookTarget = planePos.current.clone().addScaledVector(forward, CAM_LOOK_AHEAD);
    camera.lookAt(lookTarget);
  });

  return (
    <RigidBody
      ref={rbRef}
      type="kinematicPosition"
      colliders={false}
      position={[0, 5, 700]}
    >
      <group ref={planeGroupRef}>
        <Suspense fallback={null}>
          <PlaneModel />
        </Suspense>
      </group>
    </RigidBody>
  );
};
