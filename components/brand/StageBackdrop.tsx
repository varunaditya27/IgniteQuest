"use client";
import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

export function StageBackdrop({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 4, 6]} intensity={40} color="#e8b84b" />
        <Sparkles
          count={80 * intensity}
          scale={[14, 8, 6]}
          size={3}
          speed={0.25}
          color="#ffd97a"
          opacity={0.7}
        />
        <Sparkles
          count={40 * intensity}
          scale={[16, 10, 8]}
          size={1.5}
          speed={0.1}
          color="#a688ff"
          opacity={0.35}
        />
      </Canvas>
    </div>
  );
}
