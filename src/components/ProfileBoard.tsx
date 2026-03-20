import { memo, Suspense } from 'react';
import { Text, useTexture, RoundedBox } from '@react-three/drei';

// 왼쪽 소개 게시판 — 플레이어 시작점 왼쪽 (x=-170, z=700)
// group rotation.y = Math.PI/2 → 로컬 +Z 면이 월드 +X 방향(플레이어 쪽) 향함

const ICON_SIZE = 9;    // 흰 배경 정사각형 크기 (모두 동일)
const IMG_SIZE  = 7;    // 실제 이미지 크기 (여백용)

const CARDS = [
  {
    key: 'velog',
    iconPath: '/velog-logo.png',
    label: '기술블로그',
    bgColor: '#0a1a11',
    link: 'https://velog.io/@htjworld',
    x: -17,
  },
  {
    key: 'github',
    iconPath: '/github-logo.svg',
    label: 'GitHub',
    bgColor: '#0d1117',
    link: 'https://github.com/htjworld',
    x: 0,
  },
  {
    key: 'email',
    iconPath: '/gmail-logo.svg',
    label: 'Email',
    bgColor: '#1a0d0d',
    link: 'mailto:itjhan01@gmail.com',
    x: 17,
  },
] as const;

// 아이콘 카드 (텍스처 로딩 분리 — Suspense 경계 활용)
const IconCard = ({ card, centerY }: { card: typeof CARDS[number]; centerY: number }) => {
  const texture = useTexture(card.iconPath);

  return (
    <group position={[card.x, centerY - 4, 0.4]}>
      {/* 카드 어두운 배경 */}
      <mesh userData={{ link: card.link }}>
        <boxGeometry args={[13, 18, 0.5]} />
        <meshStandardMaterial color={card.bgColor} />
      </mesh>

      {/* 흰색 둥근 네모 배경 (아이콘 영역) */}
      <RoundedBox
        args={[ICON_SIZE, ICON_SIZE, 0.5]}
        radius={0.9}
        smoothness={4}
        position={[0, 3, 0.5]}
        userData={{ link: card.link }}
      >
        <meshBasicMaterial color="#ffffff" />
      </RoundedBox>

      {/* 실제 아이콘 이미지 — 모두 동일 크기 */}
      <mesh position={[0, 3, 1.0]} userData={{ link: card.link }}>
        <planeGeometry args={[IMG_SIZE, IMG_SIZE]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.05} />
      </mesh>

      {/* 레이블 */}
      <Suspense fallback={null}>
        <Text
          position={[0, -4.5, 0.5]}
          fontSize={1.6}
          color="#aabbcc"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          {card.label}
        </Text>
      </Suspense>

      {/* 투명 히트 영역 전체 커버 */}
      <mesh position={[0, 0, 1.2]} userData={{ link: card.link }}>
        <planeGeometry args={[13, 18]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};

export const ProfileBoard = memo(() => {
  const boardW = 58;
  const boardH = 46;
  const centerY = boardH / 2;

  return (
    <group position={[-170, 0, 700]} rotation={[0, Math.PI / 2, 0]}>
      {/* ── 나무 프레임 ── */}
      <mesh position={[0, centerY, -0.8]}>
        <boxGeometry args={[boardW + 6, boardH + 6, 2]} />
        <meshStandardMaterial color="#3a1f0a" />
      </mesh>

      {/* ── 안쪽 배경 ── */}
      <mesh position={[0, centerY, 0]}>
        <boxGeometry args={[boardW, boardH, 0.6]} />
        <meshStandardMaterial color="#111122" />
      </mesh>

      {/* ── 상단 이름 & 직함 ── */}
      <Suspense fallback={null}>
        <Text
          position={[0, centerY + 16, 0.5]}
          fontSize={3.2}
          color="#ddeeff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          HAN TAEJIN
        </Text>
        <Text
          position={[0, centerY + 11, 0.5]}
          fontSize={1.7}
          color="#5577aa"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          BACKEND DEVELOPER
        </Text>
        <Text
          position={[0, centerY + 7.5, 0.5]}
          fontSize={0.8}
          color="#223355"
          anchorX="center"
          anchorY="middle"
        >
          {'─'.repeat(30)}
        </Text>
      </Suspense>

      {/* ── 아이콘 카드 3개 ── */}
      {CARDS.map((card) => (
        <Suspense key={card.key} fallback={null}>
          <IconCard card={card} centerY={centerY} />
        </Suspense>
      ))}
    </group>
  );
});
ProfileBoard.displayName = 'ProfileBoard';
