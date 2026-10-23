import { useRef, useState } from "react";
import * as THREE from "three";

import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";

import { EffectComposer, Outline, GodRays } from "@react-three/postprocessing";

import Room from "./Room";
import InteractionSystem from "./InteractionSystem";
import SunsetLighting from "./SunsetLighting";
import MagicMoment, { MagicBloom } from "./MagicMoment";
import { useStore } from "../state/store";

export default function House() {
  const [meshesToOutline, setMeshesToOutline] = useState<THREE.Object3D[]>([]);

  // True while our song's "magic" is showing (see MagicMoment).
  const magicVisible = useStore((state) => state.magicVisible);

  const [sun, setSun] = useState<THREE.Mesh | null>(null);

  const controlsRef = useRef<PointerLockControlsImpl | null>(null);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
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

        {/* Sunset lighting, sunbeam and dust */}
        <SunsetLighting onSunChange={setSun} />

        <Room />

        <InteractionSystem
          controlsRef={controlsRef}
          onMeshesChange={setMeshesToOutline}
        />

        {/* Our song: golden magic and a gentle camera sway */}
        <MagicMoment />

        <EffectComposer autoClear={false}>
          <Outline
            selection={meshesToOutline}
            edgeStrength={50}
            visibleEdgeColor={0xffffff}
            hiddenEdgeColor={0xff0000}
          />

          {sun && (
            <GodRays
              sun={sun}
              samples={80}
              density={0.96}
              decay={0.94}
              weight={0.8}
              exposure={0.65}
              clampMax={1}
              blur
            />
          )}

          {/* Shiny glow, only while the magic is showing */}
          {magicVisible && <MagicBloom />}
        </EffectComposer>
      </Canvas>

      {/* Crosshair */}
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
