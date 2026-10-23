import { useEffect } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { createPortal } from "@react-three/fiber";
import * as THREE from "three";

import LaptopGallery from "../components/LaptopGallery";
import GamingScreen from "../components/GamingScreen";
import TVScreen from "../components/TVScreen";

import { useStore } from "../state/store";
import {
  holdableNames,
  interactableNames,
  STICKY_HOLD_DISTANCE,
  STICKY_NOTE_PATTERN,
} from "../data/interactables";

type HoldRotation = [number, number, number];

const holdRotationCorrections: Record<string, HoldRotation> = {
  Photo_1: [0, -Math.PI / 2, 0],
  Photo_2: [0, -Math.PI / 2, 0],
  Photo_4: [-Math.PI / 2, 0, -Math.PI / 2],
  Photo_7: [Math.PI / 2, Math.PI, Math.PI / 2],
  Photo_8: [Math.PI / 2, Math.PI, Math.PI / 2],
  Photo_9: [0, 0, 0],
  Photo_10: [-0.3, 0, 0],

  ...Object.fromEntries(
    Array.from({ length: 38 }, (_, i) => [
      `Polaroid_Portrait${String(i + 1).padStart(3, "0")}`,
      [Math.PI / 2, 0, 0] as HoldRotation,
    ]),
  ),

  ...Object.fromEntries(
    Array.from({ length: 18 }, (_, i) => [
      `Polaroid_Landscape${String(i + 1).padStart(3, "0")}`,
      [Math.PI / 2, 0, 0] as HoldRotation,
    ]),
  ),
};

function LaptopScreenPortal({ laptop }: { laptop: THREE.Object3D }) {
  return createPortal(
    <Html
      transform
      position={[-0.009, 0.15, -0.276]}
      rotation={[Math.PI / 2, 0, 0]}
      distanceFactor={2}
      style={{
        width: "1310px",
        height: "750px",
        overflow: "hidden",
        pointerEvents: "auto",
      }}
    >
      <div data-object-ui style={{ width: "100%", height: "100%" }}>
        <LaptopGallery />
      </div>
    </Html>,
    laptop,
  );
}

const MONITOR_SCREEN = {
  position: [-0.55, 0, 7] as [number, number, number],
  rotation: [Math.PI / 2, Math.PI, 0] as [number, number, number],
  distanceFactor: 2,
};

function MonitorScreenPortal({ monitor }: { monitor: THREE.Object3D }) {
  return createPortal(
    <Html
      transform
      position={MONITOR_SCREEN.position}
      rotation={MONITOR_SCREEN.rotation}
      distanceFactor={MONITOR_SCREEN.distanceFactor}
      style={{
        width: "4350px",
        height: "2620px",
        overflow: "hidden",
        pointerEvents: "auto",
      }}
    >
      <div data-object-ui style={{ width: "100%", height: "100%" }}>
        <GamingScreen />
      </div>
    </Html>,
    monitor,
  );
}

// Where the TV's glass is, in the TV model's own units (measured from the
// model's "TVScreen" mesh: it spans x -22.4..22.4 and z 9.8..43.9, and its
// front surface is at y -0.57; the TV faces -y). The video sits right on it so
// it stays lined up from every angle. If it ever looks off, nudge these.
//   - y: depth. Smaller = further out of the TV.
//   - z: height. x: left/right.
//   - width/height: in pixels; one pixel = distanceFactor / 400 model units.
//     (2800 x 2100 at distanceFactor 6 = 42 x 31.5 units, a hair inside the
//     glass so the edges hide behind the TV's frame.)
const TV_SCREEN = {
  position: [0, -0.6, 26.84] as [number, number, number],
  rotation: [Math.PI / 2, 0, 0] as [number, number, number],
  distanceFactor: 6,
  width: 2800,
  height: 2100,
};

function TVVideoScreenPortal({
  tv,
  isOpen,
  onClose,
}: {
  tv: THREE.Object3D;
  isOpen: boolean;
  onClose: () => void;
}) {
  return createPortal(
    <Html
      transform
      position={TV_SCREEN.position}
      rotation={TV_SCREEN.rotation}
      distanceFactor={TV_SCREEN.distanceFactor}
      style={{
        width: `${TV_SCREEN.width}px`,
        height: `${TV_SCREEN.height}px`,
        overflow: "hidden",
        // Clicks only reach the screen while the TV is open. When it's closed,
        // clicks go through to the 3D room (so you can click the TV again).
        pointerEvents: isOpen ? "auto" : "none",
        // Always shown, even when you step away: the TV keeps the last frame
        // (paused), just like the laptop keeps its window.
        display: "block",
        background: "#000",
      }}
    >
      <div
        data-object-ui
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TVScreen isOpen={isOpen} onClose={onClose} />
      </div>
    </Html>,
    tv,
  );
}

export default function Room() {
  const { scene } = useGLTF("/models/yana-bday-room-textures.glb");

  const tvOpen = useStore((state) => state.tvOpen);
  const closeTV = useStore((state) => state.closeTV);

  useEffect(() => {
    // The sticky notes hang on the wall in three different orientations, so one
    // shared rotation can't hold them all upright. Instead, each note is held
    // the way it hangs on the wall: the same angle you'd see it at when
    // looking straight at it, so it faces you and reads the right way up.
    scene.updateMatrixWorld(true);
    const wallRotation = new THREE.Quaternion();

    scene.traverse((object) => {
      if (interactableNames.has(object.name)) {
        object.userData.interactable = true;
      }

      if (holdableNames.has(object.name)) {
        object.userData.holdable = true;
      }

      const correction = holdRotationCorrections[object.name];

      if (correction) {
        object.userData.holdRotation = correction;
      }

      if (STICKY_NOTE_PATTERN.test(object.name)) {
        object.getWorldQuaternion(wallRotation);
        const euler = new THREE.Euler().setFromQuaternion(wallRotation, "XYZ");

        object.userData.holdRotation = [euler.x, euler.y, euler.z];
        object.userData.holdDistance = STICKY_HOLD_DISTANCE;
      }
    });
  }, [scene]);

  const laptop = scene.getObjectByName("Laptop_Model");
  const monitor = scene.getObjectByName("Gaming_Monitor");
  const tv = scene.getObjectByName("TV_Model");

  useEffect(() => {
    if (!laptop) {
      console.warn('Could not find "Laptop_Model" in the GLB model.');
    }

    if (!monitor) {
      console.warn('Could not find "Gaming_Monitor" in the GLB model.');
    }

    if (!tv) {
      console.warn('Could not find "TV_Model" in the GLB model.');
    }
  }, [laptop, monitor, tv]);

  return (
    <>
      <primitive object={scene} scale={1} position={[0, 0, 0]} />

      {laptop && <LaptopScreenPortal laptop={laptop} />}

      {monitor && <MonitorScreenPortal monitor={monitor} />}

      {/* Keep the TV mounted so its video and timestamp survive closing. */}
      {tv && <TVVideoScreenPortal tv={tv} isOpen={tvOpen} onClose={closeTV} />}
    </>
  );
}

useGLTF.preload("/models/yana-bday-room-textures.glb");
