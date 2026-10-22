import * as THREE from "three";
import { useEffect, useRef } from "react";
import { addAfterEffect, useFrame, useThree } from "@react-three/fiber";
import { Bloom } from "@react-three/postprocessing";
import type { BloomEffect } from "postprocessing";

import { selectIsMagic, useStore } from "../state/store";
import { magic } from "./magic";

// ============================================
// MAGIC SETTINGS (tweak these to taste)
// ============================================

// How quickly the magic fades in and out (bigger = faster).
const FADE_SPEED = 0.9;

// Camera sway while looking around, at full magic. Angles are in radians
// (0.005 is about a third of a degree), the bob is in room units.
const SWAY_PITCH = 0.0045;
const SWAY_YAW = 0.0045;
const SWAY_ROLL = 0.008;
const BOB_Y = 0.035;
const BOB_X = 0.02;

// While you're looking at a screen (laptop, monitor, TV, diary) the sway is
// turned down to this fraction, so it's still easy to read.
const CALM_AT_SCREENS = 0.2;

// The sway is added very early in each frame (a negative number runs before
// the normal frame work), so that the laptop / monitor / TV screens, which
// follow the camera, stay lined up with the 3D room while it sways.
const SWAY_PRIORITY = -100;

// Glow strength of the Bloom effect at full magic.
const BLOOM_INTENSITY = 0.55;
const BLOOM_THRESHOLD = 0.95;

// ============================================
// The conductor: watches the music, eases the magic in and out, and gently
// sways the camera.
// ============================================

export default function MagicMoment() {
  const camera = useThree((state) => state.camera);

  // The camera pose before the sway was added (so it can be put back exactly),
  // and the pose right after the sway was added (so we can tell if something
  // else, like a camera flight, has moved the camera since).
  const saved = useRef({
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    swayedPosition: new THREE.Vector3(),
    swayedQuaternion: new THREE.Quaternion(),
    applied: false,
  });

  const swayRotation = useRef(new THREE.Quaternion());
  const swayEuler = useRef(new THREE.Euler());

  // 1 while looking around freely, CALM_AT_SCREENS while at a screen.
  const looseness = useRef(1);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Ease the shared magic value toward on (1) or off (0).
    const target = selectIsMagic(useStore.getState()) ? 1 : 0;

    magic.amount += (target - magic.amount) * (1 - Math.exp(-FADE_SPEED * dt));

    // Snap to the ends so we stop doing any work once it has fully faded out.
    if (magic.amount < 0.002 && target === 0) magic.amount = 0;
    if (magic.amount > 0.998 && target === 1) magic.amount = 1;

    const visible = magic.amount > 0;
    if (visible !== useStore.getState().magicVisible) {
      useStore.setState({ magicVisible: visible });
    }

    if (!visible) return;

    // The mouse cursor is captured while looking around freely. At a screen it
    // is released, and there the sway is turned down.
    const looking = document.pointerLockElement !== null;
    const wantedLooseness = looking ? 1 : CALM_AT_SCREENS;
    looseness.current +=
      (wantedLooseness - looseness.current) * (1 - Math.exp(-4 * dt));

    const strength = magic.amount * looseness.current;

    // Remember the real camera pose, then add the sway on top. It is removed
    // again right after the frame is drawn (see the effect below), so it never
    // interferes with looking around, focusing, or holding things.
    saved.current.position.copy(camera.position);
    saved.current.quaternion.copy(camera.quaternion);
    saved.current.applied = true;

    swayEuler.current.set(
      Math.sin(t * 0.7 + 1) * SWAY_PITCH * strength,
      Math.sin(t * 0.5 + 2) * SWAY_YAW * strength,
      Math.sin(t * 0.9) * SWAY_ROLL * strength,
      "YXZ",
    );
    swayRotation.current.setFromEuler(swayEuler.current);
    camera.quaternion.multiply(swayRotation.current);

    camera.position.y += Math.sin(t * 0.6) * BOB_Y * strength;
    camera.position.x += Math.cos(t * 0.45) * BOB_X * strength;

    camera.updateMatrixWorld(true);

    saved.current.swayedPosition.copy(camera.position);
    saved.current.swayedQuaternion.copy(camera.quaternion);
  }, SWAY_PRIORITY);

  // Runs after the whole frame has been drawn: put the camera back exactly as
  // it was before the sway.
  useEffect(() => {
    return addAfterEffect(() => {
      const pose = saved.current;
      if (!pose.applied) return;
      pose.applied = false;

      // If a camera flight (or anything else) moved the camera this frame, the
      // sway is already gone and the camera is where it should be: leave it.
      if (
        !camera.position.equals(pose.swayedPosition) ||
        !camera.quaternion.equals(pose.swayedQuaternion)
      ) {
        return;
      }

      camera.position.copy(pose.position);
      camera.quaternion.copy(pose.quaternion);
      camera.updateMatrixWorld(true);
    });
  }, [camera]);

  return null;
}

// ============================================
// The shiny glow. It lives inside the EffectComposer, and House only mounts it
// while there is magic to show, so it costs nothing the rest of the time.
// ============================================

export function MagicBloom() {
  const bloomRef = useRef<BloomEffect>(null);

  useFrame(() => {
    if (bloomRef.current) {
      bloomRef.current.intensity = magic.amount * BLOOM_INTENSITY;
    }
  });

  return (
    <Bloom
      ref={bloomRef}
      mipmapBlur
      intensity={0}
      luminanceThreshold={BLOOM_THRESHOLD}
      luminanceSmoothing={0.3}
    />
  );
}
