import * as THREE from "three";
import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import { useObjectFocus, type FocusOptions } from "../hooks/useObjectFocus";

type InteractionSystemProps = {
  onMeshesChange: (meshes: THREE.Object3D[]) => void;
  controlsRef: React.RefObject<PointerLockControlsImpl | null>;
};

type SavedTransform = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
  parent: THREE.Object3D;
};

const pointer = new THREE.Vector2(0, 0);

const defaultHoldCorrection = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(1, 0, 0),
  -Math.PI / 2,
);

const focusSettings: Record<string, FocusOptions> = {
  Laptop_Model: {
    distance: 1.5,
    height: 0.15,
    offsetX: -0.9,
    offsetZ: 0,
    targetOffsetY: 0.05,
  },
  Gaming_Monitor: {
    distance: 2.5,
    height: 0.4,
    offsetX: 0.5,
    targetOffsetY: 0.1,
  },
  TV_Model: { distance: 4, height: 0.2 },
  Music_Player: { distance: 1.2, height: 1, offsetX: 0.15 },
  Laptop_Diary: { distance: 1.2, height: 0.15, rotationY: 0.1 },
  default: { distance: 2.2, height: 0.25 },
};

function getFocusSettings(object: THREE.Object3D): FocusOptions {
  return focusSettings[object.name] ?? focusSettings.default;
}

function findInteractable(object: THREE.Object3D): THREE.Object3D | null {
  let current: THREE.Object3D | null = object;

  while (current) {
    if (current.userData.interactable) return current;
    current = current.parent;
  }

  return null;
}

function findHoldable(object: THREE.Object3D): THREE.Object3D | null {
  let current: THREE.Object3D | null = object;

  while (current) {
    if (current.userData.holdable) return current;
    current = current.parent;
  }

  return null;
}

function getMeshes(target: THREE.Object3D | null): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];

  if (!target) return meshes;

  target.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      meshes.push(object as THREE.Mesh);
    }
  });

  return meshes;
}

function isWithinObject(
  object: THREE.Object3D,
  parent: THREE.Object3D,
): boolean {
  let current: THREE.Object3D | null = object;

  while (current) {
    if (current === parent) return true;
    current = current.parent;
  }

  return false;
}

export default function InteractionSystem({
  onMeshesChange,
  controlsRef,
}: InteractionSystemProps) {
  const { camera, scene, gl } = useThree();

  const raycaster = useRef(new THREE.Raycaster());
  const currentTarget = useRef<THREE.Object3D | null>(null);
  const heldTarget = useRef<THREE.Object3D | null>(null);
  const isReturning = useRef(false);
  const wasFocused = useRef(false);
  const original = useRef<SavedTransform | null>(null);

  const targetWorldPosition = useRef(new THREE.Vector3());
  const targetWorldQuaternion = useRef(new THREE.Quaternion());

  const speed = 5;
  const distanceFromCamera = 3;

  const { focusObject, exitFocus, focusedObject, isFocused, isAnimating } =
    useObjectFocus();

  const updatePointer = useCallback(
    (event: { clientX: number; clientY: number }) => {
      if (controlsRef.current?.isLocked) {
        pointer.set(0, 0);
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl, controlsRef],
  );

  const getHits = useCallback(() => {
    raycaster.current.setFromCamera(pointer, camera);
    return raycaster.current.intersectObjects(scene.children, true);
  }, [camera, scene]);

  // Keep the ray under the cursor, or at the center while pointer-locked.
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event);
    };

    const handleLockChange = () => {
      if (controlsRef.current?.isLocked) {
        pointer.set(0, 0);
      }
    };

    gl.domElement.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerlockchange", handleLockChange);

    return () => {
      gl.domElement.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerlockchange", handleLockChange);
    };
  }, [gl, updatePointer, controlsRef]);

  // Pick up holdable objects and return them on the next click.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const rect = gl.domElement.getBoundingClientRect();
      const insideCanvas =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!insideCanvas) return;

      updatePointer(event);

      if (heldTarget.current) {
        isReturning.current = true;
        return;
      }

      if (isReturning.current || isFocused.current) return;

      const hits = getHits();

      let target: THREE.Object3D | null = null;

      for (const hit of hits) {
        target = findHoldable(hit.object);
        if (target) break;
      }

      if (!target?.parent) return;

      original.current = {
        position: target.position.clone(),
        quaternion: target.quaternion.clone(),
        scale: target.scale.clone(),
        parent: target.parent,
      };

      heldTarget.current = target;
    };

    // Listen globally so pointer-lock clicks aren't missed by a canvas-only listener.
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [gl, updatePointer, getHits, isFocused, controlsRef]);

  // Focus interactables and exit focus when clicking elsewhere.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const eventTarget = event.target;

      if (
        eventTarget instanceof Element &&
        eventTarget.closest("[data-object-ui]")
      ) {
        return;
      }

      if (heldTarget.current || isReturning.current) return;

      const rect = gl.domElement.getBoundingClientRect();

      const insideCanvas =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      const active = focusedObject.current;

      if (!insideCanvas) {
        if (active) exitFocus();
        return;
      }

      updatePointer(event);

      const hits = getHits();
      let clickedTarget: THREE.Object3D | null = null;

      for (const hit of hits) {
        clickedTarget = findInteractable(hit.object);
        if (clickedTarget) break;
      }

      if (active) {
        if (clickedTarget && isWithinObject(clickedTarget, active)) {
          return;
        }

        if (clickedTarget && !clickedTarget.userData.holdable) {
          focusObject(clickedTarget, getFocusSettings(clickedTarget));
          controlsRef.current?.unlock();
          return;
        }

        exitFocus();
        return;
      }

      if (clickedTarget && !clickedTarget.userData.holdable) {
        focusObject(clickedTarget, getFocusSettings(clickedTarget));
        controlsRef.current?.unlock();
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [
    gl,
    updatePointer,
    getHits,
    focusObject,
    exitFocus,
    focusedObject,
    controlsRef,
  ]);

  useFrame((_, delta) => {
    // Update the outline selection.
    if (!heldTarget.current && !isReturning.current) {
      const hits = getHits();
      let nextTarget: THREE.Object3D | null = null;

      for (const hit of hits) {
        nextTarget = findInteractable(hit.object);
        if (nextTarget) break;
      }

      if (nextTarget !== currentTarget.current) {
        currentTarget.current = nextTarget;
        onMeshesChange(getMeshes(nextTarget));
      }
    }

    // Relock controls after focus has finished returning.
    if (isFocused.current) {
      wasFocused.current = true;
    } else if (wasFocused.current && !isAnimating.current) {
      controlsRef.current?.lock();
      wasFocused.current = false;
    }

    const target = heldTarget.current;
    if (!target) return;

    const saved = original.current;
    if (!saved) return;

    const alpha = 1 - Math.exp(-speed * delta);

    if (isReturning.current) {
      if (target.parent !== saved.parent) {
        saved.parent.attach(target);
      }

      target.position.lerp(saved.position, alpha);
      target.quaternion.slerp(saved.quaternion, alpha);
      target.scale.lerp(saved.scale, alpha);

      if (
        target.position.distanceTo(saved.position) < 0.005 &&
        target.quaternion.angleTo(saved.quaternion) < 0.005 &&
        target.scale.distanceTo(saved.scale) < 0.005
      ) {
        target.position.copy(saved.position);
        target.quaternion.copy(saved.quaternion);
        target.scale.copy(saved.scale);
        target.updateMatrixWorld(true);

        heldTarget.current = null;
        original.current = null;
        isReturning.current = false;
      }

      return;
    }

    // Keep the held object in front of the camera.
    camera.updateWorldMatrix(true, false);

    targetWorldPosition.current
      .set(0, 0, -distanceFromCamera)
      .applyMatrix4(camera.matrixWorld);

    camera.getWorldQuaternion(targetWorldQuaternion.current);

    const customRotation = target.userData.holdRotation as
      | [number, number, number]
      | undefined;

    if (customRotation) {
      const correction = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          customRotation[0],
          customRotation[1],
          customRotation[2],
          "XYZ",
        ),
      );

      targetWorldQuaternion.current.multiply(correction);
    } else {
      targetWorldQuaternion.current.multiply(defaultHoldCorrection);
    }

    if (target.parent) {
      target.parent.updateWorldMatrix(true, false);

      const localPosition = target.parent.worldToLocal(
        targetWorldPosition.current.clone(),
      );

      const parentWorldQuaternion = new THREE.Quaternion();
      target.parent.getWorldQuaternion(parentWorldQuaternion);

      const localQuaternion = parentWorldQuaternion
        .invert()
        .multiply(targetWorldQuaternion.current);

      target.position.lerp(localPosition, alpha);
      target.quaternion.slerp(localQuaternion, alpha);
      target.updateMatrixWorld(true);
    }
  });

  return null;
}
