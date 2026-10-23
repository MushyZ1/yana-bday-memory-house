import * as THREE from "three";
import { useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";

import { held } from "../scene/heldObject";

// The laptop / monitor / TV screens are real HTML laid on top of the 3D canvas,
// so the 3D room can never draw in front of them: a picture you hold up would
// always end up *under* a screen behind it.
//
// This hook fixes that the simple way. While you hold something that is in
// front of the screen and overlaps it on your display, the screen fades out
// (the model's own screen shows through instead). When the held thing moves
// away or goes back, the screen fades back in. The fade itself is a CSS
// transition: give the <Html> style a `transition: "opacity ..."`.

// A corner this close to the camera (or behind it) can't be projected safely,
// so that counts as "in the way".
const MIN_DEPTH = 0.05;

// Shared scratch objects, so nothing is allocated every frame.
const heldBox = new THREE.Box3();
const ownerBox = new THREE.Box3();
const heldCenter = new THREE.Vector3();
const corner = new THREE.Vector3();
const viewPoint = new THREE.Vector3();

// How far in front of the camera a world position is (bigger = further away).
function depthOf(world: THREE.Vector3, camera: THREE.Camera) {
  return -viewPoint.copy(world).applyMatrix4(camera.matrixWorldInverse).z;
}

// True if `object` is nearer to you than the screen's owner AND its outline on
// your display overlaps the screen's outline.
function isInFrontOfScreen(
  object: THREE.Object3D,
  ownerCenter: THREE.Vector3,
  screen: HTMLElement,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
): boolean {
  camera.updateMatrixWorld();
  object.updateWorldMatrix(true, true);

  heldBox.setFromObject(object);
  if (heldBox.isEmpty()) return false;

  // Something held behind the screen should not make the screen disappear.
  heldBox.getCenter(heldCenter);
  if (depthOf(heldCenter, camera) >= depthOf(ownerCenter, camera)) {
    return false;
  }

  // Where the screen is on your display. (This is the real, already
  // 3D-transformed HTML element, so it matches what you see.)
  const screenRect = screen.getBoundingClientRect();
  if (screenRect.width === 0 || screenRect.height === 0) return false;

  // Where the held object is on your display: the box around its 8 corners.
  const view = canvas.getBoundingClientRect();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const x of [heldBox.min.x, heldBox.max.x]) {
    for (const y of [heldBox.min.y, heldBox.max.y]) {
      for (const z of [heldBox.min.z, heldBox.max.z]) {
        corner.set(x, y, z);

        if (depthOf(corner, camera) < MIN_DEPTH) return true;

        corner.project(camera);

        const px = view.left + (corner.x * 0.5 + 0.5) * view.width;
        const py = view.top + (-corner.y * 0.5 + 0.5) * view.height;

        minX = Math.min(minX, px);
        maxX = Math.max(maxX, px);
        minY = Math.min(minY, py);
        maxY = Math.max(maxY, py);
      }
    }
  }

  return (
    maxX >= screenRect.left &&
    minX <= screenRect.right &&
    maxY >= screenRect.top &&
    minY <= screenRect.bottom
  );
}

// `screenRef`: the screen's HTML element (pass it as `ref` to drei's <Html>).
// `owner`: the 3D object the screen sits on (the laptop, monitor or TV model).
export function useScreenFade(
  screenRef: RefObject<HTMLDivElement | null>,
  owner: THREE.Object3D,
) {
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);

  // The owner never moves, so its centre is measured once, the first time it
  // is needed.
  const ownerCenter = useRef<THREE.Vector3 | null>(null);

  useFrame(() => {
    const screen = screenRef.current;
    if (!screen) return;

    let covered = false;
    const object = held.object;

    // Nothing is measured unless you are actually holding something.
    if (object) {
      if (!ownerCenter.current) {
        owner.updateWorldMatrix(true, true);
        ownerBox.setFromObject(owner);

        if (!ownerBox.isEmpty()) {
          ownerCenter.current = ownerBox.getCenter(new THREE.Vector3());
        }
      }

      if (ownerCenter.current) {
        covered = isInFrontOfScreen(
          object,
          ownerCenter.current,
          screen,
          camera,
          canvas,
        );
      }
    }

    const wanted = covered ? "0" : "1";
    if (screen.style.opacity !== wanted) screen.style.opacity = wanted;
  });
}
