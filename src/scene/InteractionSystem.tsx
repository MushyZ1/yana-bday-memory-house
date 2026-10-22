import * as THREE from "three";
import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";

import { useObjectFocus, type FocusOptions } from "../hooks/useObjectFocus";
import { useStore } from "../state/store";

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

type CameraPose = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
};

type CameraMove = {
  from: CameraPose;
  to: CameraPose;
  elapsed: number;
  duration: number;
  returning: boolean;
};

const pointer = new THREE.Vector2();

const defaultHoldCorrection = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(1, 0, 0),
  -Math.PI / 2,
);

const pressActions: Record<string, () => void> = {
  Music_Player: () => useStore.getState().pressPlayer(),
  Laptop_Diary: () => useStore.getState().openDiary(),
};

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
  TV_Model: {
    distance: 4,
    height: 0.2,
  },
  default: {
    distance: 2.2,
    height: 0.25,
  },
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

function snapshotCamera(camera: THREE.Camera): CameraPose {
  return {
    position: camera.position.clone(),
    quaternion: camera.quaternion.clone(),
  };
}

export default function InteractionSystem({
  onMeshesChange,
  controlsRef,
}: InteractionSystemProps) {
  const { camera, scene, gl } = useThree();

  const raycaster = useRef(new THREE.Raycaster());
  const currentTarget = useRef<THREE.Object3D | null>(null);
  const heldTarget = useRef<THREE.Object3D | null>(null);
  const original = useRef<SavedTransform | null>(null);

  const isReturning = useRef(false);
  const wasFocused = useRef(false);

  const cameraMove = useRef<CameraMove | null>(null);
  const savedCameraPose = useRef<CameraPose | null>(null);
  const tvMode = useRef(false);

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

  const animateCameraTo = useCallback(
    (destination: CameraPose, duration: number, returning: boolean) => {
      cameraMove.current = {
        from: snapshotCamera(camera),
        to: {
          position: destination.position.clone(),
          quaternion: destination.quaternion.clone(),
        },
        elapsed: 0,
        duration,
        returning,
      };
    },
    [camera],
  );

  const openTV = useCallback(
    (tv: THREE.Object3D) => {
      if (tvMode.current) return;

      camera.updateMatrixWorld(true);

      savedCameraPose.current = snapshotCamera(camera);
      tvMode.current = true;

      const bounds = new THREE.Box3().setFromObject(tv);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());

      const currentCameraPosition = camera.getWorldPosition(
        new THREE.Vector3(),
      );

      const direction = currentCameraPosition.sub(center);
      direction.y = 0;

      if (direction.lengthSq() < 0.001) {
        direction.set(0, 0, 1);
      }

      direction.normalize();

      // Approach the TV from the side the player is currently on.
      const distance = Math.max(2.5, Math.min(5, size.z + 2.5));
      const destination = center
        .clone()
        .add(direction.multiplyScalar(distance));

      destination.y = center.y + Math.max(0.1, size.y * 0.08);

      const targetCamera = camera.clone();
      targetCamera.position.copy(destination);
      targetCamera.up.set(0, 1, 0);
      targetCamera.lookAt(center);
      targetCamera.updateMatrixWorld(true);

      animateCameraTo(
        {
          position: destination,
          quaternion: targetCamera.quaternion,
        },
        0.9,
        false,
      );

      controlsRef.current?.unlock();

      useStore.getState().openTV();
    },
    [camera, controlsRef, animateCameraTo],
  );

  const closeTV = useCallback(() => {
    if (!tvMode.current) return;

    tvMode.current = false;

    useStore.getState().closeTV();
    useStore.getState().setVideoPlaying(false);

    const saved = savedCameraPose.current;

    if (saved) {
      animateCameraTo(saved, 0.75, true);
    } else if (!isFocused.current) {
      controlsRef.current?.lock();
    }
  }, [animateCameraTo, controlsRef, isFocused]);

  // Pointer tracking.
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event);
    };

    const handleLockChange = () => {
      if (controlsRef.current?.isLocked) pointer.set(0, 0);
    };

    gl.domElement.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerlockchange", handleLockChange);

    return () => {
      gl.domElement.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerlockchange", handleLockChange);
    };
  }, [gl, updatePointer, controlsRef]);

  // Unlock controls while diary or TV is open.
  useEffect(() => {
    const unsubscribe = useStore.subscribe((state, previous) => {
      if (
        state.diaryOpen === previous.diaryOpen &&
        state.tvOpen === previous.tvOpen
      ) {
        return;
      }

      if (state.diaryOpen || state.tvOpen) {
        controlsRef.current?.unlock();
      } else if (!isFocused.current && !tvMode.current) {
        // The camera animation will relock controls when it finishes.
        if (!cameraMove.current) controlsRef.current?.lock();
      }
    });

    return unsubscribe;
  }, [controlsRef, isFocused]);

  // If TV is closed by its own UI button, also restore the camera.
  useEffect(() => {
    const unsubscribe = useStore.subscribe((state, previous) => {
      if (!previous.tvOpen || state.tvOpen || !tvMode.current) return;

      tvMode.current = false;
      useStore.getState().setVideoPlaying(false);

      const saved = savedCameraPose.current;

      if (saved) {
        animateCameraTo(saved, 0.75, true);
      }
    });

    return unsubscribe;
  }, [animateCameraTo]);

  // Holdable-object pickup and return.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const state = useStore.getState();
      if (state.diaryOpen || state.tvOpen || tvMode.current) return;

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

      let target: THREE.Object3D | null = null;

      for (const hit of getHits()) {
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

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [gl, updatePointer, getHits, isFocused]);

  // Click handling for TV, other interactables, and outside clicks.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const eventTarget = event.target;

      const isObjectUI =
        eventTarget instanceof Element &&
        Boolean(eventTarget.closest("[data-object-ui]"));

      const state = useStore.getState();

      // While the TV is open, any click outside its HTML screen closes it.
      if (tvMode.current || state.tvOpen) {
        if (isObjectUI) return;
        closeTV();
        return;
      }

      if (isObjectUI || state.diaryOpen) return;
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

      let clickedTarget: THREE.Object3D | null = null;

      for (const hit of getHits()) {
        clickedTarget = findInteractable(hit.object);
        if (clickedTarget) break;
      }

      if (!clickedTarget) {
        if (active) exitFocus();
        return;
      }

      if (clickedTarget.name === "TV_Model") {
        openTV(clickedTarget);
        return;
      }

      const press = pressActions[clickedTarget.name];

      if (press) {
        press();
        return;
      }

      if (active) {
        if (isWithinObject(clickedTarget, active)) return;

        if (!clickedTarget.userData.holdable) {
          focusObject(clickedTarget, getFocusSettings(clickedTarget));
          controlsRef.current?.unlock();
          return;
        }

        exitFocus();
        return;
      }

      if (!clickedTarget.userData.holdable) {
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
    openTV,
    closeTV,
  ]);

  useFrame((_, delta) => {
    // Smooth camera animation to/from the TV.
    const move = cameraMove.current;

    if (move) {
      move.elapsed += delta;

      const t = Math.min(move.elapsed / move.duration, 1);
      const eased = t * t * (3 - 2 * t);

      camera.position.lerpVectors(move.from.position, move.to.position, eased);
      camera.quaternion.slerpQuaternions(
        move.from.quaternion,
        move.to.quaternion,
        eased,
      );

      camera.updateMatrixWorld(true);

      if (t >= 1) {
        camera.position.copy(move.to.position);
        camera.quaternion.copy(move.to.quaternion);
        camera.updateMatrixWorld(true);
        cameraMove.current = null;

        if (move.returning && !isFocused.current) {
          const state = useStore.getState();

          if (!state.tvOpen && !state.diaryOpen) {
            controlsRef.current?.lock();
          }
        }
      }
    }

    // Outline selection.
    if (!heldTarget.current && !isReturning.current && !tvMode.current) {
      let nextTarget: THREE.Object3D | null = null;

      for (const hit of getHits()) {
        nextTarget = findInteractable(hit.object);
        if (nextTarget) break;
      }

      if (nextTarget !== currentTarget.current) {
        currentTarget.current = nextTarget;
        onMeshesChange(getMeshes(nextTarget));
      }
    }

    // Relock controls after the normal object-focus animation returns.
    if (isFocused.current) {
      wasFocused.current = true;
    } else if (wasFocused.current && !isAnimating.current) {
      const state = useStore.getState();

      if (!state.diaryOpen && !state.tvOpen && !tvMode.current) {
        if (!cameraMove.current) controlsRef.current?.lock();
      }

      wasFocused.current = false;
    }

    // Holdable-object movement.
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
