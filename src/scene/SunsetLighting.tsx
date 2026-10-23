import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { magic } from "./magic";

type SunsetLightingProps = {
  onSunChange: (sun: THREE.Mesh | null) => void;
};

// ============================================
// MAGIC COLORS
// While our favourite song plays (see MagicMoment), the lights ease from their
// normal sunset colors toward these richer, golden ones.
// ============================================

const SUN_COLOR = new THREE.Color("#ffad59");
const SUN_COLOR_MAGIC = new THREE.Color("#ffcf6b");

const AMBIENT_COLOR = new THREE.Color("#ffc080");
const AMBIENT_COLOR_MAGIC = new THREE.Color("#ffdc90");

const BEAM_COLOR = new THREE.Color("#ffbd70");
const BEAM_COLOR_MAGIC = new THREE.Color("#ffd884");

const DUST_COLOR = new THREE.Color("#ffe0a3");
const DUST_COLOR_MAGIC = new THREE.Color("#fff1b8");

// ============================================
// TWEAK ME
// Every number you are likely to want to change is in this block.
// ============================================

// --- Sun and where its light goes ---

// Where the sun is, just outside the window. The window is on the west wall
// (x = -10) and spans z 1.2 to 6.2, with the bar between the panes near z 3.7.
// Keep z away from 3.7 or the bar cuts the sun in half.
const SUN_POSITION: [number, number, number] = [-11, 7, 2.5];

// A point the light travels toward (it is below the floor on purpose).
const SUN_TARGET: [number, number, number] = [-2, -4, 2];

const SUN_INTENSITY = 5; // light strength. Lower = moodier, higher = brighter
const AMBIENT_INTENSITY = 1.5; // flat light everywhere

// Soft cool light from above and warm bounce from below. The cool/warm
// contrast against the orange sun is what gives the room depth.
const FILL_SKY = "#7f93c4";
const FILL_GROUND = "#3b2416";
const FILL_INTENSITY = 0.5;

// The visible sun: a small hot core with a big soft halo around it.
const SUN_SCALE = 0.15; // size of the core (also drives the god rays)
const SUN_GLOW_SIZE = 10; // size of the halo
const SUN_GLOW_OPACITY = 0.55;

// --- Shadows ---

const SHADOW_MAP_SIZE = 2048; // 4096 = sharper but heavier on weak laptops
const SHADOW_AREA = 22; // half-width of the area that gets shadows (covers the room)
const SHADOW_BIAS = -0.0003; // more negative = fixes striped shadows
const SHADOW_NORMAL_BIAS = 0.04; // raise if you see striped "acne", lower if shadows float

// --- The sunbeam ---

const BEAM_RADIUS = 2.4; // width where it comes through the window
const BEAM_END_RADIUS = 3.0; // width where it reaches the floor (it spreads slightly)
const BEAM_OPACITY = 0.14; // strength of the wide, faint beam
const BEAM_CORE_OPACITY = 0.08; // strength of the narrower, brighter middle
const BEAM_CORE_RATIO = 0.55; // how wide the bright middle is compared to the beam
const BEAM_SOFTNESS = 1.6; // higher = softer, more fog-like edges
const BEAM_FLOOR_FADE = 2.8; // how far above the floor the beam fades out

// --- The room (measured from the 3D model) ---

const WINDOW_X = -10; // the plane of the window
const FLOOR_Y = 0;

// --- Dust ---

const PARTICLE_COUNT = 800;

// The box the dust floats in. It covers the beam (window to floor) so the
// dust sits where the light is. Widen it to put dust further into the room.
const DUST_MIN: [number, number, number] = [-10, 0.1, -1];
const DUST_MAX: [number, number, number] = [2, 7.6, 7.5];

const DUST_OUTSIDE_BEAM = 0.1; // how visible dust is outside the light (0 = invisible)

// ============================================
// DERIVED VALUES (not meant to be edited)
// ============================================

const SUN_VEC = new THREE.Vector3(...SUN_POSITION);
const BEAM_DIR = new THREE.Vector3(...SUN_TARGET).sub(SUN_VEC).normalize();

// How far along the light's path the window and the floor are.
const T_WINDOW = (WINDOW_X - SUN_VEC.x) / BEAM_DIR.x;
const T_FLOOR = (FLOOR_Y - SUN_VEC.y) / BEAM_DIR.y;

// A soft round glow, drawn once.
function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.15, "rgba(255,240,210,0.6)");
  g.addColorStop(0.4, "rgba(255,200,130,0.18)");
  g.addColorStop(1, "rgba(255,180,100,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
const sunGlowTexture = makeGlowTexture();

// A small seeded random number generator. Unlike Math.random() it gives the
// same numbers every time, so the dust starts in the same places on every
// load and React's "pure render" lint rule is happy.
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function SunsetLighting({ onSunChange }: SunsetLightingProps) {
  const sunTarget = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(...SUN_TARGET);
    return target;
  }, []);

  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const glowRef = useRef<THREE.Sprite>(null);

  // Keeps our own reference to the sun ball AND tells House about it.
  // (useCallback keeps this the same function between renders, so React
  // doesn't keep detaching and re-attaching the ref.)
  const setSunMesh = useCallback(
    (mesh: THREE.Mesh | null) => {
      sunMeshRef.current = mesh;
      onSunChange(mesh);
    },
    [onSunChange],
  );

  // The shadow box has to be set from code: changing the numbers on the
  // shadow camera does nothing until its projection is recalculated.
  useEffect(() => {
    const light = sunLightRef.current;
    if (!light) return;

    const camera = light.shadow.camera;
    camera.left = -SHADOW_AREA;
    camera.right = SHADOW_AREA;
    camera.top = SHADOW_AREA;
    camera.bottom = -SHADOW_AREA;
    camera.near = 0.5;
    camera.far = 45;
    camera.updateProjectionMatrix();
  }, []);

  // Our favourite song: richer gold light, a gentle shimmer, a bigger sun.
  // At magic.amount = 0 everything below equals the normal sunset values.
  useFrame((state) => {
    const amount = magic.amount;
    const t = state.clock.elapsedTime;

    const sunLight = sunLightRef.current;
    if (sunLight) {
      sunLight.color.copy(SUN_COLOR).lerp(SUN_COLOR_MAGIC, amount);
      sunLight.intensity =
        SUN_INTENSITY + amount * (2 + 0.6 * Math.sin(t * 1.4));
    }

    const ambient = ambientRef.current;
    if (ambient) {
      ambient.color.copy(AMBIENT_COLOR).lerp(AMBIENT_COLOR_MAGIC, amount);
      ambient.intensity =
        AMBIENT_INTENSITY + amount * (0.3 + 0.05 * Math.sin(t * 1.1));
    }

    // A bigger sun makes the god rays stronger too.
    sunMeshRef.current?.scale.setScalar(SUN_SCALE * (1 + 0.6 * amount));

    const glow = glowRef.current;
    if (glow) {
      const size = SUN_GLOW_SIZE * (1 + 0.5 * amount);
      glow.scale.set(size, size, 1);
      glow.material.opacity = SUN_GLOW_OPACITY * (1 + 0.5 * amount);
    }
  });

  return (
    <>
      {/* Warm directional sunlight */}
      <directionalLight
        ref={sunLightRef}
        color="#ffad59"
        intensity={SUN_INTENSITY}
        position={SUN_POSITION}
        target={sunTarget}
        castShadow
        shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
        shadow-bias={SHADOW_BIAS}
        shadow-normalBias={SHADOW_NORMAL_BIAS}
      />

      <primitive object={sunTarget} />

      {/* Flat warm light everywhere */}
      <ambientLight
        ref={ambientRef}
        color="#ffc080"
        intensity={AMBIENT_INTENSITY}
      />

      {/* Cool sky light from above, warm bounce from below */}
      <hemisphereLight
        color={FILL_SKY}
        groundColor={FILL_GROUND}
        intensity={FILL_INTENSITY}
      />

      {/* Bright sun source for GodRays: a small hot core */}
      <mesh ref={setSunMesh} position={SUN_POSITION} scale={SUN_SCALE}>
        <sphereGeometry args={[1, 32, 32]} />

        <meshBasicMaterial color="#ffe9c4" toneMapped={false} />
      </mesh>

      {/* Soft halo around the sun, so it doesn't look like a hard white disc */}
      <sprite
        ref={glowRef}
        position={SUN_POSITION}
        scale={[SUN_GLOW_SIZE, SUN_GLOW_SIZE, 1]}
      >
        <spriteMaterial
          map={sunGlowTexture}
          color="#ffd9a0"
          opacity={SUN_GLOW_OPACITY}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      {/* Soft volumetric-looking sunlight: a wide faint shaft with a brighter core */}
      <SunBeam
        radius={BEAM_RADIUS}
        endRadius={BEAM_END_RADIUS}
        opacity={BEAM_OPACITY}
      />
      <SunBeam
        radius={BEAM_RADIUS * BEAM_CORE_RATIO}
        endRadius={BEAM_END_RADIUS * BEAM_CORE_RATIO}
        opacity={BEAM_CORE_OPACITY}
      />

      {/* Dust particles */}
      <DustParticles />
    </>
  );
}

// ============================================
// SOFT SUNBEAM
//
// A shaft of light from the window to the floor. Two things make it look soft:
//  1. Fresnel-style fade: the shaft is see-through where you look at its
//     edges and strongest where you look straight through its middle.
//  2. It fades out near the floor instead of being cut off by it.
// ============================================

type SunBeamProps = {
  radius: number;
  endRadius: number;
  opacity: number;
};

function SunBeam({ radius, endRadius, opacity }: SunBeamProps) {
  const { position, quaternion, length } = useMemo(() => {
    // From the window pane to just past the floor.
    const start = SUN_VEC.clone().addScaledVector(BEAM_DIR, T_WINDOW);
    const end = SUN_VEC.clone().addScaledVector(BEAM_DIR, T_FLOOR + 0.4);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      BEAM_DIR,
    );

    return {
      position: new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5),
      quaternion,
      length: start.distanceTo(end),
    };
  }, []);

  // Created once. If this object were rebuilt on every render, the GPU
  // program would be given brand new uniforms each time the page re-renders.
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#ffbd70") },
      uOpacity: { value: opacity },
      uLength: { value: length },
      uFloorY: { value: FLOOR_Y },
      uFloorFade: { value: BEAM_FLOOR_FADE },
      uSoftness: { value: BEAM_SOFTNESS },
    }),
    [length, opacity],
  );

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Our favourite song: the beam glows brighter and more golden.
  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    const amount = magic.amount;
    const t = state.clock.elapsedTime;

    material.uniforms.uColor.value
      .copy(BEAM_COLOR)
      .lerp(BEAM_COLOR_MAGIC, amount);
    material.uniforms.uOpacity.value =
      opacity * (1 + amount * (0.8 + 0.2 * Math.sin(t * 1.3)));
  });

  return (
    <mesh position={position} quaternion={quaternion} frustumCulled={false}>
      {/* radiusTop is the floor end, radiusBottom is the window end */}
      <cylinderGeometry args={[endRadius, radius, length, 48, 1, true]} />

      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uLength;

          varying vec3 vNormalView;
          varying vec3 vViewPos;
          varying float vAxial;
          varying float vWorldY;

          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);

            vViewPos = mv.xyz;
            vNormalView = normalize(normalMatrix * normal);

            // 0 at the window end of the beam, 1 at the floor end
            vAxial = (position.y + uLength * 0.5) / uLength;

            vWorldY = (modelMatrix * vec4(position, 1.0)).y;

            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uFloorY;
          uniform float uFloorFade;
          uniform float uSoftness;

          varying vec3 vNormalView;
          varying vec3 vViewPos;
          varying float vAxial;
          varying float vWorldY;

          void main() {
            // 1 when looking straight at the shaft's surface, 0 at its edge
            float facing = abs(dot(normalize(vNormalView), normalize(-vViewPos)));
            float soft = pow(facing, uSoftness);

            // The light gathers just after the window pane
            float fadeIn = smoothstep(0.0, 0.2, vAxial);

            // Fade out toward the floor instead of getting cut off by it
            float floorFade = smoothstep(uFloorY, uFloorY + uFloorFade, vWorldY);

            gl_FragColor = vec4(uColor, soft * fadeIn * floorFade * uOpacity);
          }
        `}
      />
    </mesh>
  );
}

// ============================================
// FLOATING DUST
//
// The dust floats in a box around the beam, and glows only where the beam is.
// The shader works out how far each speck is from the beam's centre line.
// ============================================

function DustParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const particleData = useMemo(() => {
    const random = seededRandom(1234);

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Spread through the dust box
      for (let axis = 0; axis < 3; axis++) {
        positions[i3 + axis] =
          DUST_MIN[axis] + random() * (DUST_MAX[axis] - DUST_MIN[axis]);
      }

      // Individual drifting velocities
      velocities[i3] = (random() - 0.5) * 0.3;
      velocities[i3 + 1] = (random() - 0.5) * 0.08;
      velocities[i3 + 2] = (random() - 0.5) * 0.3;

      phases[i] = random() * Math.PI * 2;

      sizes[i] = 1.5 + random() * 2.5;
    }

    return { positions, velocities, phases, sizes };
  }, []);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#ffe0a3") },
      uOpacity: { value: 0.9 },
      uSize: { value: 2.5 },
      uTime: { value: 0 },
      uMagic: { value: 0 },
      uOutside: { value: DUST_OUTSIDE_BEAM },
      uBeamOrigin: { value: SUN_VEC.clone() },
      uBeamDir: { value: BEAM_DIR.clone() },
      uBeamRadius: { value: BEAM_RADIUS },
      uBeamT0: { value: T_WINDOW },
      uBeamT1: { value: T_FLOOR },
    }),
    [],
  );

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const attribute = pointsRef.current.geometry.attributes.position;
    const array = attribute.array as Float32Array;

    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const phase = particleData.phases[i];

      // Different movement for each particle
      const driftX = Math.sin(time * 0.65 + phase) * 0.12;
      const driftY = Math.sin(time * 0.8 + phase * 1.3) * 0.04;
      const driftZ = Math.cos(time * 0.55 + phase * 1.7) * 0.12;

      array[i3] += (particleData.velocities[i3] + driftX) * dt;
      array[i3 + 1] += (particleData.velocities[i3 + 1] + driftY) * dt;
      array[i3 + 2] += (particleData.velocities[i3 + 2] + driftZ) * dt;

      // Leave one side of the box, come back in on the other
      for (let axis = 0; axis < 3; axis++) {
        const min = DUST_MIN[axis];
        const max = DUST_MAX[axis];

        if (array[i3 + axis] > max) array[i3 + axis] = min;
        if (array[i3 + axis] < min) array[i3 + axis] = max;
      }
    }

    attribute.needsUpdate = true;

    // Our favourite song: the dust turns golden, brighter and bigger, and
    // each speck twinkles. At magic.amount = 0 these are the normal values.
    const material = materialRef.current;

    if (material) {
      const amount = magic.amount;
      const u = material.uniforms;

      u.uTime.value = time;
      u.uMagic.value = amount;
      u.uColor.value.copy(DUST_COLOR).lerp(DUST_COLOR_MAGIC, amount);
      u.uOpacity.value = 0.9 + 0.1 * amount;
      u.uSize.value = 2.5 + 1.1 * amount;
      // During the song, dust sparkles a little everywhere, not just in the beam.
      u.uOutside.value = DUST_OUTSIDE_BEAM + 0.3 * amount;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.positions, 3]}
        />

        <bufferAttribute
          attach="attributes-size"
          args={[particleData.sizes, 1]}
        />

        <bufferAttribute
          attach="attributes-phase"
          args={[particleData.phases, 1]}
        />
      </bufferGeometry>

      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uSize;
          uniform vec3 uBeamOrigin;
          uniform vec3 uBeamDir;
          uniform float uBeamRadius;
          uniform float uBeamT0;
          uniform float uBeamT1;

          attribute float size;
          attribute float phase;

          varying float vAlpha;
          varying float vPhase;
          varying float vLight;

          void main() {
            vPhase = phase;

            // How far along the beam is this speck, and how far from its
            // centre line? (The dust is never moved or rotated, so
            // "position" is already a position in the room.)
            vec3 fromSun = position - uBeamOrigin;
            float along = dot(fromSun, uBeamDir);
            float away = length(fromSun - uBeamDir * along);

            float inside = 1.0 - smoothstep(uBeamRadius * 0.45, uBeamRadius, away);
            float ends =
              smoothstep(uBeamT0, uBeamT0 + 1.5, along) *
              (1.0 - smoothstep(uBeamT1 - 1.5, uBeamT1, along));

            // 1 = fully in the light, 0 = in the shade
            vLight = inside * ends;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            // Perspective-correct point size, a little bigger in the light
            gl_PointSize = clamp(
              uSize * size * (1.0 + 0.5 * vLight) * (300.0 / -mvPosition.z),
              1.0,
              12.0
            );

            // Natural particle brightness variation
            vAlpha = 0.5 + 0.5 * size / 4.0;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uTime;
          uniform float uMagic;
          uniform float uOutside;

          varying float vAlpha;
          varying float vPhase;
          varying float vLight;

          void main() {
            vec2 uv = gl_PointCoord - vec2(0.5);
            float dist = length(uv);

            // Round, soft glowing particles
            float alpha = 1.0 - smoothstep(0.12, 0.5, dist);

            if (alpha < 0.02) discard;

            // Twinkle: during our song every speck pulses on its own rhythm.
            float twinkle = mix(
              1.0,
              0.4 + 0.6 * sin(uTime * 2.6 + vPhase * 6.2831),
              uMagic
            );

            // Bright in the light, dim in the shade
            float lit = mix(uOutside, 1.0, vLight);

            gl_FragColor = vec4(
              uColor,
              alpha * uOpacity * vAlpha * twinkle * lit
            );
          }
        `}
      />
    </points>
  );
}
