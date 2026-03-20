import { memo, Suspense } from 'react';
import { Text } from '@react-three/drei';
import { useGuestbookStore } from '../store/guestbookStore';

// 오른쪽 방명록 게시판 — 플레이어 시작점 오른쪽 (x=+170, z=700)
// group rotation.y = -Math.PI/2 → 로컬 +Z 면이 월드 -X 방향(플레이어 쪽) 향함

const COLS = 4;
const ROWS = 5;
const NOTE_W = 17;
const NOTE_H = 13;
const GAP_X = 4;
const GAP_Y = 4;

// 포스트잇 20개 위치 (로컬 좌표, 코르크보드 기준)
const BOARD_INNER_W = COLS * NOTE_W + (COLS - 1) * GAP_X; // 80
const BOARD_INNER_H = ROWS * NOTE_H + (ROWS - 1) * GAP_Y; // 81
const BOARD_CENTER_Y = BOARD_INNER_H / 2 + 8;              // 48.5

function notePos(slot: number): [number, number, number] {
  const col = slot % COLS;
  const row = Math.floor(slot / COLS);
  const startX = -(BOARD_INNER_W / 2) + NOTE_W / 2;
  const startY = BOARD_CENTER_Y + BOARD_INNER_H / 2 - NOTE_H / 2;
  return [
    startX + col * (NOTE_W + GAP_X),
    startY - row * (NOTE_H + GAP_Y),
    0,
  ];
}

const PostIt = memo(({ slot }: { slot: number }) => {
  const entry = useGuestbookStore((s) => s.entries[slot]);
  const [px, py] = notePos(slot);
  const hasEntry = entry !== null;
  const color = hasEntry ? entry.color : '#2a2a3a';
  const z = 0.5;

  return (
    <group position={[px, py, z]}>
      {/* 포스트잇 배경 */}
      <mesh userData={{ guestbookSlot: slot }}>
        <boxGeometry args={[NOTE_W - 1, NOTE_H - 1, 0.4]} />
        <meshStandardMaterial
          color={color}
          emissive={hasEntry ? color : '#000000'}
          emissiveIntensity={hasEntry ? 0.08 : 0}
        />
      </mesh>

      {/* 핀 */}
      <mesh position={[0, (NOTE_H - 1) / 2 - 1.2, 0.5]}>
        <cylinderGeometry args={[0.6, 0.6, 0.4, 8]} />
        <meshBasicMaterial color={hasEntry ? '#cc3333' : '#444466'} />
      </mesh>

      {/* 내용 텍스트 */}
      {hasEntry && (
        <Suspense fallback={null}>
          <Text
            position={[0, -0.5, 0.4]}
            fontSize={1.5}
            color="#111111"
            maxWidth={NOTE_W - 4}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            lineHeight={1.4}
            userData={{ guestbookSlot: slot }}
          >
            {entry.name ? `${entry.name}\n${entry.message}` : entry.message}
          </Text>
        </Suspense>
      )}

      {/* 빈 슬롯 힌트 */}
      {!hasEntry && (
        <Suspense fallback={null}>
          <Text
            position={[0, 0, 0.4]}
            fontSize={1.4}
            color="#333355"
            anchorX="center"
            anchorY="middle"
          >
            +
          </Text>
        </Suspense>
      )}

      {/* 투명 히트 영역 */}
      <mesh position={[0, 0, 0.7]} userData={{ guestbookSlot: slot }}>
        <planeGeometry args={[NOTE_W - 1, NOTE_H - 1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
});
PostIt.displayName = 'PostIt';

export const GuestBook = memo(() => {
  const boardW = BOARD_INNER_W + 12;
  const boardH = BOARD_INNER_H + 18;
  const centerY = BOARD_CENTER_Y;

  return (
    <group position={[170, 0, 700]} rotation={[0, -Math.PI / 2, 0]}>
      {/* ── 코르크보드 프레임 ── */}
      <mesh position={[0, centerY, -1]}>
        <boxGeometry args={[boardW + 6, boardH + 6, 2.5]} />
        <meshStandardMaterial color="#3a2010" />
      </mesh>

      {/* ── 코르크 배경 ── */}
      <mesh position={[0, centerY, 0]}>
        <boxGeometry args={[boardW, boardH, 0.8]} />
        <meshStandardMaterial color="#8b6343" />
      </mesh>

      {/* ── 게시판 제목 ── */}
      <Suspense fallback={null}>
        <Text
          position={[0, centerY + boardH / 2 - 5, 0.7]}
          fontSize={3.5}
          color="#f5e6c8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          GUESTBOOK
        </Text>
      </Suspense>

      {/* ── 포스트잇 20개 ── */}
      {Array.from({ length: 20 }, (_, i) => (
        <PostIt key={i} slot={i} />
      ))}
    </group>
  );
});
GuestBook.displayName = 'GuestBook';
