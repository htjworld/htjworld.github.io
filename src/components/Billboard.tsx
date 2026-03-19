import { useRef, useEffect, Suspense } from 'react';
import { Text, useTexture } from '@react-three/drei';
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
      {/* polygonOffset prevents z-fighting with the frame behind */}
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

  // Attach the link to the Text mesh after it mounts
  useEffect(() => {
    if (textRef.current) {
      textRef.current.userData.link = post.linkUrl;
    }
  }, [post.linkUrl]);

  return (
    <>
      {/* Background panel — carries the link for raycast hits on the panel area */}
      <mesh userData={{ link: post.linkUrl }}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#000d22"
          emissive="#001144"
          emissiveIntensity={0.6}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Title text (on top, also carries link) */}
      <Suspense fallback={null}>
        <Text
          ref={textRef}
          position={[0, 0, 0.06]}
          fontSize={Math.min(width * 0.1, 2.2)}
          color="white"
          maxWidth={width * 0.85}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          lineHeight={1.3}
          outlineWidth={0.05}
          outlineColor="#000033"
        >
          {post.title}
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
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[width + 0.8, height + 0.8, 0.2]} />
        <meshStandardMaterial color="#0a0a10" />
      </mesh>

      {/* Neon border glow */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[width + 0.4, height + 0.4, 0.08]} />
        <meshBasicMaterial color="#0044ff" />
      </mesh>

      {/* Content */}
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
