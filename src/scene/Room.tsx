import { Html, useGLTF } from "@react-three/drei";
import { createPortal } from "@react-three/fiber";
import * as THREE from "three";
import LaptopGallery from "../components/LaptopGallery";

const interactableNames = new Set<string>([
  "Gaming_Monitor",
  "Laptop_Model",
  "Music_Player",
  "TV_Model",
  "Laptop_Diary",
  "Polaroid_Landscape",
  "Polaroid_Portrait",
  ...Array.from({ length: 11 }, (_, i) => `Photo_${i + 1}`),
  ...Array.from(
    { length: 38 },
    (_, i) => `Polaroid_Portrait${String(i + 1).padStart(3, "0")}`,
  ),
  ...Array.from(
    { length: 18 },
    (_, i) => `Polaroid_Landscape${String(i + 1).padStart(3, "0")}`,
  ),
  ...Array.from({ length: 12 }, (_, i) => `Sticky_Var_${i + 1}`),
]);

const holdableNames = new Set<string>([
  "Polaroid_Landscape",
  "Polaroid_Portrait",
  ...Array.from({ length: 11 }, (_, i) => `Photo_${i + 1}`),
  ...Array.from(
    { length: 38 },
    (_, i) => `Polaroid_Portrait${String(i + 1).padStart(3, "0")}`,
  ),
  ...Array.from(
    { length: 18 },
    (_, i) => `Polaroid_Landscape${String(i + 1).padStart(3, "0")}`,
  ),
]);

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

function LaptopScreen({ laptop }: { laptop: THREE.Object3D }) {
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
      <LaptopGallery />
    </Html>,
    laptop,
  );
}

export default function Room() {
  const { scene } = useGLTF("/models/yana-bday-room-textures.glb");

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
  });

  const laptop = scene.getObjectByName("Laptop_Model");

  if (!laptop) {
    console.warn('Could not find "Laptop_Model" in the GLB model.');
  }

  return (
    <>
      <primitive object={scene} scale={1} position={[0, 0, 0]} />

      {laptop && <LaptopScreen laptop={laptop} />}
    </>
  );
}

useGLTF.preload("/models/yana-bday-room-textures.glb");
