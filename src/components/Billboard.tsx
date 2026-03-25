import { Suspense } from 'react';
import { Text, useTexture } from '@react-three/drei';
import type { PostConfig } from '../config/posts';

interface BillboardProps {
  post: PostConfig;
  position: [number, number, number];
  width?: number;
}

// 제목에서 로고용 2~3글자 추출
function getLogoText(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length >= 2) {
    // 두 단어 이상: 각 단어 첫 글자 (최대 3개)
    return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
  }
  // 한 단어: 앞 2글자
  return title.slice(0, 2).toUpperCase();
}

const ImageBoard = ({
  post,
  width,
  height,
}: {
  post: PostConfig;
  width: number;
  height: number;
}) => {
  const texture = useTexture(post.imageUrl!);
  return (
    <mesh userData={{ link: post.linkUrl, postTitle: post.title }}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

const LogoBoard = ({
  post,
  width,
  height,
}: {
  post: PostConfig;
  width: number;
  height: number;
}) => {
  const logo = getLogoText(post.title);

  return (
    <>
      {/* Background panel */}
      <mesh userData={{ link: post.linkUrl, postTitle: post.title }}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#000d22"
          emissive="#001144"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Logo text — 크고 굵게, 멀리서도 보이도록 */}
      <Suspense fallback={null}>
        <Text
          position={[0, 0, 0.06]}
          fontSize={Math.min(width * 0.38, height * 0.6)}
          color="#4488ff"
          anchorX="center"
          anchorY="middle"
          fontWeight={900}
          outlineWidth={0.04}
          outlineColor="#001133"
          userData={{ link: post.linkUrl, postTitle: post.title }}
        >
          {logo}
        </Text>
      </Suspense>
    </>
  );
};

export const Billboard = ({ post, position, width = 10 }: BillboardProps) => {
  const height = width * 0.55;

  return (
    <group position={position}>
      {/* Outer dark frame */}
      <mesh position={[0, 0, -0.15]} userData={{ link: post.linkUrl, postTitle: post.title }}>
        <boxGeometry args={[width + 0.8, height + 0.8, 0.2]} />
        <meshStandardMaterial color="#0a0a10" />
      </mesh>

      {/* Neon border glow */}
      <mesh position={[0, 0, -0.08]} userData={{ link: post.linkUrl, postTitle: post.title }}>
        <boxGeometry args={[width + 0.4, height + 0.4, 0.08]} />
        <meshBasicMaterial color="#0044ff" />
      </mesh>

      {/* Content */}
      {post.imageUrl ? (
        <Suspense fallback={<LogoBoard post={post} width={width} height={height} />}>
          <ImageBoard post={post} width={width} height={height} />
        </Suspense>
      ) : (
        <LogoBoard post={post} width={width} height={height} />
      )}
    </group>
  );
};
