import { useRef, useEffect, Suspense } from 'react';
import { Text, useTexture, Billboard as DreiBoard } from '@react-three/drei';
import type { Mesh } from 'three';
import type { PostConfig } from '../config/posts';

interface BillboardProps {
  post: PostConfig;
  position: [number, number, number];
  width?: number;
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
    <mesh userData={{ link: post.linkUrl }}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
};

const TextBoard = ({
  post,
  width,
  height,
}: {
  post: PostConfig;
  width: number;
  height: number;
}) => {
  const textRef = useRef<Mesh>(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.userData.link = post.linkUrl;
    }
  }, [post.linkUrl]);

  const fontSize = Math.min(width * 0.18, 3.0);

  return (
    <>
      {/* 배경 패널 */}
      <mesh userData={{ link: post.linkUrl }}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#000d22"
          emissive="#002266"
          emissiveIntensity={1.2}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* 제목 텍스트 — 항상 카메라 방향 */}
      <DreiBoard follow lockX={false} lockY={false} lockZ={false}>
        <Suspense fallback={null}>
          <Text
            ref={textRef}
            position={[0, 0, 0.2]}
            fontSize={fontSize}
            color="#ffffff"
            maxWidth={width * 0.9}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            lineHeight={1.4}
            outlineWidth={fontSize * 0.12}
            outlineColor="#000000"
            outlineOpacity={1}
          >
            {post.title}
          </Text>
        </Suspense>
      </DreiBoard>
    </>
  );
};

export const Billboard = ({ post, position, width = 10 }: BillboardProps) => {
  const height = width * 0.55;

  return (
    <group position={position}>
      {/* 외곽 프레임 */}
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[width + 0.8, height + 0.8, 0.2]} />
        <meshStandardMaterial color="#0a0a10" />
      </mesh>

      {/* 네온 테두리 */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[width + 0.4, height + 0.4, 0.08]} />
        <meshBasicMaterial color="#0044ff" />
      </mesh>

      {/* 콘텐츠 */}
      {post.imageUrl ? (
        <Suspense fallback={<TextBoard post={{ ...post, imageUrl: undefined }} width={width} height={height} />}>
          <ImageBoard post={post} width={width} height={height} />
        </Suspense>
      ) : (
        <TextBoard post={post} width={width} height={height} />
      )}
    </group>
  );
};
