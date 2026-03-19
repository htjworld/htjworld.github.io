import { useMemo, memo, Suspense } from 'react';
import { Text } from '@react-three/drei';
import { Billboard } from './Billboard';
import { registerBuilding, buildingColliders } from '../store/buildings';
import { getPostsByTown } from '../config/posts';
import type { Town } from '../config/posts';

// ─── Seeded PRNG ────────────────────────────────────────────────────────────
function makePRNG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    return (s >>> 0) / 4294967296;
  };
}

// ─── City geometry constants ─────────────────────────────────────────────────
const GRID = 7;
const SPACING = 42;
const DENSITY = 0.68;

const ZONES: {
  id: Town;
  label: string;
  cx: number;
  cz: number;
  seed: number;
  colors: [string, string];
  labelColor: string;
}[] = [
  { id: 'ai',  label: 'AI TOWN',  cx: -430, cz: 0, seed: 42,  colors: ['#0d2a4a', '#1a3a5c'], labelColor: '#44aaff' },
  { id: 'web', label: 'WEB TOWN', cx: 0,    cz: 0, seed: 137, colors: ['#1e1035', '#2c1a4a'], labelColor: '#aa44ff' },
  { id: 'htj', label: 'HTJ TOWN', cx: 430,  cz: 0, seed: 271, colors: ['#0d2a1a', '#1a3a2a'], labelColor: '#44ff88' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type BuildingDatum = {
  x: number; y: number; z: number;
  w: number; h: number; d: number;
  color: string;
  post?: ReturnType<typeof getPostsByTown>[number];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// Simple low-poly tree
const Tree = ({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) => (
  <group position={[x, 0, z]} scale={[scale, scale, scale]}>
    {/* Trunk */}
    <mesh position={[0, 1, 0]}>
      <cylinderGeometry args={[0.4, 0.5, 2, 6]} />
      <meshStandardMaterial color="#3a2010" />
    </mesh>
    {/* Canopy bottom */}
    <mesh position={[0, 4, 0]}>
      <coneGeometry args={[3, 6, 7]} />
      <meshStandardMaterial color="#1a4a1a" />
    </mesh>
    {/* Canopy top */}
    <mesh position={[0, 7.5, 0]}>
      <coneGeometry args={[2, 5, 7]} />
      <meshStandardMaterial color="#236623" />
    </mesh>
  </group>
);

// Road segment (flat, horizontal)
const Road = ({
  x, z, w, d, color = '#14141f',
}: { x: number; z: number; w: number; d: number; color?: string }) => (
  <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[w, d]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

// Lane markings on main road
const LaneMarkings = () => {
  const marks = [];
  for (let x = -580; x <= 580; x += 40) {
    marks.push(
      <mesh key={x} position={[x, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 1.5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>,
    );
  }
  return <>{marks}</>;
};

// ─── AI TOWN decoration ───────────────────────────────────────────────────────
const AIDecoration = ({ cx, cz }: { cx: number; cz: number }) => {
  // Robot pillars at zone corners
  const corners = [
    [cx - 130, cz - 130], [cx + 130, cz - 130],
    [cx - 130, cz + 130], [cx + 130, cz + 130],
  ] as [number, number][];

  return (
    <group>
      {corners.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Body */}
          <mesh position={[0, 20, 0]}>
            <boxGeometry args={[6, 40, 6]} />
            <meshStandardMaterial color="#112233" emissive="#001133" emissiveIntensity={0.4} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 42, 0]}>
            <boxGeometry args={[7, 8, 7]} />
            <meshStandardMaterial color="#0a1a2a" emissive="#002244" emissiveIntensity={0.5} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-1.5, 43, 3.6]}>
            <boxGeometry args={[1.5, 1.5, 0.3]} />
            <meshBasicMaterial color="#00ccff" />
          </mesh>
          <mesh position={[1.5, 43, 3.6]}>
            <boxGeometry args={[1.5, 1.5, 0.3]} />
            <meshBasicMaterial color="#00ccff" />
          </mesh>
          {/* Shoulders */}
          <mesh position={[0, 32, 0]}>
            <boxGeometry args={[12, 3, 6]} />
            <meshStandardMaterial color="#0d1a2a" emissive="#001133" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Central "brain" sphere */}
      <mesh position={[cx, 55, cz]}>
        <sphereGeometry args={[12, 12, 12]} />
        <meshStandardMaterial
          color="#001122"
          emissive="#0033aa"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>

      {/* Neural connection lines — thin boxes */}
      {[[cx - 80, cz - 80], [cx + 80, cz + 80], [cx - 80, cz + 80], [cx + 80, cz - 80]].map(
        ([x, z], i) => (
          <group key={i}>
            <mesh position={[(cx + x) / 2, 45, (cz + z) / 2]}>
              <boxGeometry args={[1, 1, Math.sqrt((cx - x) ** 2 + (cz - z) ** 2)]} />
              <meshBasicMaterial color="#0044aa" transparent opacity={0.4} />
            </mesh>
          </group>
        ),
      )}
    </group>
  );
};

// ─── WEB TOWN decoration ──────────────────────────────────────────────────────
const WebDecoration = ({ cx, cz }: { cx: number; cz: number }) => {
  // Antenna / cell towers
  const towers = [
    [cx - 100, cz + 80], [cx + 100, cz - 80],
  ] as [number, number][];

  // Network nodes (spheres)
  const nodes = [
    [cx - 50, 30, cz - 50], [cx + 50, 40, cz - 50],
    [cx - 50, 35, cz + 50], [cx + 50, 25, cz + 50],
    [cx, 50, cz - 80], [cx, 45, cz + 80],
  ] as [number, number, number][];

  return (
    <group>
      {towers.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Tower shaft */}
          <mesh position={[0, 35, 0]}>
            <cylinderGeometry args={[1, 2, 70, 8]} />
            <meshStandardMaterial color="#1a1a33" />
          </mesh>
          {/* Horizontal arms */}
          {[20, 35, 50].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[16, 1, 1]} />
              <meshStandardMaterial color="#222244" />
            </mesh>
          ))}
          {/* Tip light */}
          <mesh position={[0, 72, 0]}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
        </group>
      ))}

      {/* Network nodes */}
      {nodes.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[4, 12, 12]} />
          <meshStandardMaterial
            color="#110022"
            emissive="#5500cc"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* Connection lines between nodes (thin boxes) */}
      {nodes.slice(0, -1).map(([x1, y1, z1], i) => {
        const [x2, y2, z2] = nodes[i + 1];
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, mz = (z1 + z2) / 2;
        const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
        return (
          <mesh key={i} position={[mx, my, mz]}>
            <boxGeometry args={[0.6, 0.6, len]} />
            <meshBasicMaterial color="#6600ff" transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── HTJ TOWN decoration ──────────────────────────────────────────────────────
const HTJDecoration = ({ cx, cz }: { cx: number; cz: number }) => {
  // Red carpet — entrance from west side
  const carpetZ = cz;

  // Gold decorative columns
  const columns = [
    [cx - 60, carpetZ - 20], [cx - 60, carpetZ + 20],
    [cx,      carpetZ - 20], [cx,      carpetZ + 20],
    [cx + 60, carpetZ - 20], [cx + 60, carpetZ + 20],
  ] as [number, number][];

  return (
    <group>
      {/* Red carpet */}
      <mesh position={[cx - 140, 0.03, carpetZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 18]} />
        <meshStandardMaterial color="#880000" emissive="#440000" emissiveIntensity={0.3} />
      </mesh>

      {/* Gold edge trim */}
      <mesh position={[cx - 140, 0.04, carpetZ - 9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 1]} />
        <meshBasicMaterial color="#aa8800" />
      </mesh>
      <mesh position={[cx - 140, 0.04, carpetZ + 9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 1]} />
        <meshBasicMaterial color="#aa8800" />
      </mesh>

      {/* Gold columns */}
      {columns.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 20, 0]}>
            <cylinderGeometry args={[1.2, 1.8, 40, 8]} />
            <meshStandardMaterial color="#443300" emissive="#aa7700" emissiveIntensity={0.2} />
          </mesh>
          {/* Capital */}
          <mesh position={[0, 41, 0]}>
            <cylinderGeometry args={[3, 1.2, 3, 8]} />
            <meshStandardMaterial color="#886600" emissive="#cc9900" emissiveIntensity={0.3} />
          </mesh>
          {/* Gold sphere top */}
          <mesh position={[0, 44, 0]}>
            <sphereGeometry args={[2.5, 10, 10]} />
            <meshBasicMaterial color="#ffcc00" />
          </mesh>
        </group>
      ))}

      {/* Name text above zone */}
      <Suspense fallback={null}>
        <Text
          position={[cx, 75, cz]}
          fontSize={10}
          color="#ffdd44"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.3}
          outlineColor="#332200"
        >
          HAN TAEJIN
        </Text>
      </Suspense>

      {/* Star decorations */}
      {[-80, -40, 0, 40, 80].map((dx, i) => (
        <mesh key={i} position={[cx + dx, 3, carpetZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[4, 5]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>
      ))}
    </group>
  );
};

// ─── Individual building (memoized to prevent re-render jitter) ──────────────
const BuildingMesh = memo(({ b }: { b: BuildingDatum }) => (
  <group>
    <mesh position={[b.x, b.y, b.z]} castShadow receiveShadow>
      <boxGeometry args={[b.w, b.h, b.d]} />
      <meshStandardMaterial color={b.color} />
    </mesh>

    {/* Window grid overlay on front face */}
    <mesh position={[b.x, b.y, b.z + b.d / 2 + 0.02]}>
      <planeGeometry args={[b.w * 0.85, b.h * 0.9]} />
      <meshBasicMaterial color="#000a1a" transparent opacity={0.65} />
    </mesh>

    {b.post && (
      <Billboard
        post={b.post}
        position={[b.x, b.h * 0.45, b.z + b.d / 2 + 0.4]}
        width={Math.min(b.w * 0.85, 12)}
      />
    )}
  </group>
));
BuildingMesh.displayName = 'BuildingMesh';

// ─── Main City component ──────────────────────────────────────────────────────
export const City = memo(() => {
  // Generate all buildings once with a seeded PRNG
  const buildings = useMemo<BuildingDatum[]>(() => {
    buildingColliders.length = 0;
    const items: BuildingDatum[] = [];

    for (const zone of ZONES) {
      const rand = makePRNG(zone.seed);
      const posts = getPostsByTown(zone.id);
      let postIdx = 0;

      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          if (rand() > DENSITY) continue;

          const w = 12 + rand() * 14;
          const h = 25 + rand() * 70;
          const d = 12 + rand() * 14;
          const x = zone.cx + (col - GRID / 2) * SPACING + (rand() - 0.5) * 10;
          const z = zone.cz + (row - GRID / 2) * SPACING + (rand() - 0.5) * 10;
          const y = h / 2;

          registerBuilding(x, y, z, w, h, d);

          const post = postIdx < posts.length ? posts[postIdx++] : undefined;
          const color = rand() > 0.5 ? zone.colors[0] : zone.colors[1];
          items.push({ x, y, z, w, h, d, color, post });
        }
      }
    }
    return items;
  }, []);

  // Scatter trees (seeded, outside building grid)
  const trees = useMemo(() => {
    const rand = makePRNG(9999);
    const list: { x: number; z: number; scale: number }[] = [];
    // Trees in gaps between zones and at periphery
    const regions = [
      { cx: -215, cz: 0, r: 50 }, // between AI and WEB
      { cx:  215, cz: 0, r: 50 }, // between WEB and HTJ
      { cx: -430, cz: 180, r: 60 }, { cx: -430, cz: -180, r: 60 },
      { cx:    0, cz: 180, r: 60 }, { cx:    0, cz: -180, r: 60 },
      { cx:  430, cz: 180, r: 60 }, { cx:  430, cz: -180, r: 60 },
    ];
    for (const { cx, cz, r } of regions) {
      const count = 8 + Math.floor(rand() * 6);
      for (let i = 0; i < count; i++) {
        const angle = rand() * Math.PI * 2;
        const dist = 15 + rand() * r;
        list.push({
          x: cx + Math.cos(angle) * dist,
          z: cz + Math.sin(angle) * dist,
          scale: 0.7 + rand() * 0.6,
        });
      }
    }
    return list;
  }, []);

  return (
    <group>
      {/* ── Ground ─────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[3000, 3000]} />
        <meshStandardMaterial color="#6b4c2a" />
      </mesh>

      {/* ── Roads ──────────────────────────────────────────────────── */}
      {/* Main east-west highway */}
      <Road x={0} z={0} w={1300} d={22} color="#121220" />

      {/* Cross-road per zone (N-S direction) */}
      {ZONES.map((zone) => (
        <Road key={zone.id} x={zone.cx} z={0} w={22} d={340} color="#121220" />
      ))}

      {/* Lane markings */}
      <LaneMarkings />

      {/* ── Trees ──────────────────────────────────────────────────── */}
      {trees.map((t, i) => (
        <Tree key={i} x={t.x} z={t.z} scale={t.scale} />
      ))}

      {/* ── Zone labels ────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        {ZONES.map((zone) => (
          <Text
            key={zone.id}
            position={[zone.cx, 95, zone.cz]}
            fontSize={20}
            color={zone.labelColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.6}
            outlineColor="#000011"
          >
            {zone.label}
          </Text>
        ))}
      </Suspense>

      {/* ── Zone-specific decorations ───────────────────────────────── */}
      <AIDecoration  cx={ZONES[0].cx} cz={ZONES[0].cz} />
      <WebDecoration cx={ZONES[1].cx} cz={ZONES[1].cz} />
      <HTJDecoration cx={ZONES[2].cx} cz={ZONES[2].cz} />

      {/* ── Buildings ──────────────────────────────────────────────── */}
      {buildings.map((b, i) => (
        <BuildingMesh key={i} b={b} />
      ))}
    </group>
  );
});
City.displayName = 'City';
