import * as THREE from "three";
import { useCallback, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export type FocusOptions = {
  distance?: number;
  height?: number;
  offsetX?: number;
  offsetZ?: number;

  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;

  targetOffsetX?: number;
  targetOffsetY?: number;
  targetOffsetZ?: number;
};

export function useObjectFocus() {
  const { camera } = useThree();

  const focusedObject = useRef<THREE.Object3D | null>(null);
  const isFocused = useRef(false);
  const isAnimating = useRef(false);
  const hasReturnPose = useRef(false);

  const returnPosition = useRef(new THREE.Vector3());
  const returnQuaternion = useRef(new THREE.Quaternion());

  const fromPosition = useRef(new THREE.Vector3());
  const toPosition = useRef(new THREE.Vector3());
  const fromQuaternion = useRef(new THREE.Quaternion());
  const toQuaternion = useRef(new THREE.Quaternion());

  const elapsed = useRef(0);
  const duration = 0.8;

  const animateTo = useCallback(
    (position: THREE.Vector3, quaternion: THREE.Quaternion) => {
      camera.updateMatrixWorld(true);

      camera.getWorldPosition(fromPosition.current);
      camera.getWorldQuaternion(fromQuaternion.current);

      toPosition.current.copy(position);
      toQuaternion.current.copy(quaternion);

      elapsed.current = 0;
      isAnimating.current = true;
    },
    [camera],
  );

  const focusObject = useCallback(
    (object: THREE.Object3D, options: FocusOptions = {}) => {
      if (isFocused.current && focusedObject.current === object) {
        return;
      }

      camera.updateMatrixWorld(true);

      // Save the original pose only once when entering focus mode.
      if (!isFocused.current || !hasReturnPose.current) {
        camera.getWorldPosition(returnPosition.current);
        camera.getWorldQuaternion(returnQuaternion.current);
        hasReturnPose.current = true;
      }

      object.updateWorldMatrix(true, true);

      const bounds = new THREE.Box3().setFromObject(object);
      const center = new THREE.Vector3();

      if (!bounds.isEmpty()) {
        bounds.getCenter(center);
      } else {
        object.getWorldPosition(center);
      }

      const cameraPosition = new THREE.Vector3();
      camera.getWorldPosition(cameraPosition);

      // Determine the approach direction from the current camera.
      const direction = cameraPosition.sub(center);
      direction.y = 0;

      if (direction.lengthSq() < 0.001) {
        direction.set(0, 0, 1);
      }

      direction.normalize();

      const destination = center
        .clone()
        .addScaledVector(direction, options.distance ?? 2.2);

      // Position offsets use world coordinates.
      destination.y += options.height ?? 0.25;
      destination.x += options.offsetX ?? 0;
      destination.z += options.offsetZ ?? 0;

      // Look at an adjustable point in the object's local coordinates.
      const localTargetOffset = new THREE.Vector3(
        options.targetOffsetX ?? 0,
        options.targetOffsetY ?? 0,
        options.targetOffsetZ ?? 0,
      );

      const localCenter = object.worldToLocal(center.clone());
      localCenter.add(localTargetOffset);

      const target = object.localToWorld(localCenter);

      const lookMatrix = new THREE.Matrix4().lookAt(
        destination,
        target,
        camera.up,
      );

      const destinationQuaternion =
        new THREE.Quaternion().setFromRotationMatrix(lookMatrix);

      // Optional additional rotation, in radians.
      const extraRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          options.rotationX ?? 0,
          options.rotationY ?? 0,
          options.rotationZ ?? 0,
          "XYZ",
        ),
      );

      destinationQuaternion.multiply(extraRotation);

      focusedObject.current = object;
      isFocused.current = true;

      animateTo(destination, destinationQuaternion);
    },
    [camera, animateTo],
  );

  const exitFocus = useCallback(() => {
    if (!isFocused.current || !hasReturnPose.current) {
      return;
    }

    isFocused.current = false;
    focusedObject.current = null;

    animateTo(returnPosition.current, returnQuaternion.current);
  }, [animateTo]);

  useFrame((_, delta) => {
    if (!isAnimating.current) return;

    elapsed.current += delta;

    const t = Math.min(elapsed.current / duration, 1);
    const eased = t * t * (3 - 2 * t);

    // Assumes the camera is not parented beneath a transformed object.
    camera.position.lerpVectors(
      fromPosition.current,
      toPosition.current,
      eased,
    );

    camera.quaternion.slerpQuaternions(
      fromQuaternion.current,
      toQuaternion.current,
      eased,
    );

    camera.updateMatrixWorld(true);

    if (t >= 1) {
      isAnimating.current = false;

      if (!isFocused.current) {
        hasReturnPose.current = false;
      }
    }
  });

  return {
    focusObject,
    exitFocus,
    focusedObject,
    isFocused,
    isAnimating,
  };
}
