import { useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import { EffectComposer, Outline } from "@react-three/postprocessing";

import Room from "./Room";
import InteractionSystem from "./InteractionSystem";

export default function House() {
  const [meshesToOutline, setMeshesToOutline] = useState<THREE.Object3D[]>([]);
  const controlsRef = useRef<PointerLockControlsImpl | null>(null);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        shadows
        camera={{
          fov: 48,
          near: 0.1,
          far: 100,
          position: [2, 5, 0],
        }}
      >
        <PointerLockControls ref={controlsRef} />

        <ambientLight intensity={0.6} />

        <Room />

        <InteractionSystem
          controlsRef={controlsRef}
          onMeshesChange={setMeshesToOutline}
        />

        <EffectComposer autoClear={false}>
          <Outline
            selection={meshesToOutline}
            edgeStrength={50}
            visibleEdgeColor={0xffffff}
            hiddenEdgeColor={0x444444}
          />
        </EffectComposer>
      </Canvas>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: 24,
          fontWeight: 300,
          lineHeight: 1,
          textShadow: "0 0 3px black",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 10,
        }}
      >
        +
      </div>
    </div>
  );
}
