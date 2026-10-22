import { useCallback, useMemo, useRef } from "react";
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
// SUN SETTINGS
// ============================================

// Position of the sun outside your window
const SUN_POSITION: [number, number, number] = [-11, 7, 4];

// Point where the sunlight enters the room
const SUN_TARGET: [number, number, number] = [-2, -4, 2];

// ============================================
// DUST SETTINGS
// ============================================

const PARTICLE_COUNT = 500;

const ROOM_WIDTH = 12;
const ROOM_HEIGHT = 6;
const ROOM_DEPTH = 12;

export default function SunsetLighting({ onSunChange }: SunsetLightingProps) {
  const sunTarget = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(...SUN_TARGET);
    return target;
  }, []);

  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);

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

  // Our favourite song: richer gold light, a gentle shimmer, a bigger sun.
  // At magic.amount = 0 everything below equals the normal sunset values.
  useFrame((state) => {
    const amount = magic.amount;
    const t = state.clock.elapsedTime;

    const sunLight = sunLightRef.current;
    if (sunLight) {
      sunLight.color.copy(SUN_COLOR).lerp(SUN_COLOR_MAGIC, amount);
      sunLight.intensity = 8 + amount * (2 + 0.6 * Math.sin(t * 1.4));
    }

    const ambient = ambientRef.current;
    if (ambient) {
      ambient.color.copy(AMBIENT_COLOR).lerp(AMBIENT_COLOR_MAGIC, amount);
      ambient.intensity = 0.5 + amount * (0.3 + 0.05 * Math.sin(t * 1.1));
    }

    // A bigger, brighter sun ball makes the god rays stronger too.
    sunMeshRef.current?.scale.setScalar(0.35 * (1 + 0.6 * amount));
  });

  return (
    <>
      {/* Warm directional sunlight */}
      <directionalLight
        ref={sunLightRef}
        color="#ffad59"
        intensity={8}
        position={SUN_POSITION}
        target={sunTarget}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      <primitive object={sunTarget} />

      {/* Warm sunset ambience */}
      <ambientLight ref={ambientRef} color="#ffc080" intensity={0.5} />

      {/* Bright sun source for GodRays */}
      <mesh ref={setSunMesh} position={SUN_POSITION} scale={0.35}>
        <sphereGeometry args={[1, 32, 32]} />

        <meshBasicMaterial color="#fff3d5" toneMapped={false} />
      </mesh>

      {/* Soft volumetric-looking sunlight */}
      <SunBeam />

      {/* Dust particles */}
      <DustParticles />
    </>
  );
}

// ============================================
// SOFT SUNBEAM
// No solid cone material or hard edges
// ============================================

function SunBeam() {
  const { position, quaternion, length } = useMemo(() => {
    const source = new THREE.Vector3(...SUN_POSITION);
    const destination = new THREE.Vector3(...SUN_TARGET);

    const direction = new THREE.Vector3()
      .subVectors(destination, source)
      .normalize();

    const length = source.distanceTo(destination);

    const position = new THREE.Vector3()
      .addVectors(source, destination)
      .multiplyScalar(0.5);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction,
    );

    return { position, quaternion, length };
  }, []);

  // Created once. If this object were rebuilt on every render, the GPU
  // program would be given brand new uniforms each time the page re-renders.
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#ffbd70") },
      uOpacity: { value: 0.13 },
      uLength: { value: length },
    }),
    [length],
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
      0.13 + amount * (0.11 + 0.025 * Math.sin(t * 1.3));
  });

  return (
    <mesh position={position} quaternion={quaternion} frustumCulled={false}>
      <cylinderGeometry args={[0.01, 2.4, length, 64, 1, true]} />

      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vLocalPosition;
          varying float vRadius;

          uniform float uLength;

          void main() {
            vLocalPosition = position;

            float radiusAtY =
              2.4 * (0.5 - position.y / uLength);

            vRadius = radiusAtY > 0.001
              ? length(position.xz) / radiusAtY
              : 0.0;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uLength;

          varying vec3 vLocalPosition;
          varying float vRadius;

          void main() {
            // Fade beam around its outside edge
            float edgeFade =
              1.0 - smoothstep(0.45, 1.0, vRadius);

            // Fade beam at its ends
            float startFade =
              smoothstep(-uLength * 0.5,
                          -uLength * 0.35,
                          vLocalPosition.y);

            float endFade =
                1.0 - smoothstep(
                  uLength * 0.25,
                  uLength * 0.5,
                  vLocalPosition.y
                );

            float alpha =
                edgeFade *
                startFade *
                endFade *
                uOpacity;

            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  );
}

// ============================================
// FLOATING DUST
// ============================================

function DustParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    const phases = new Float32Array(PARTICLE_COUNT);

    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Distribute throughout the room
      positions[i3] = (Math.random() - 0.5) * ROOM_WIDTH;

      positions[i3 + 1] = 0.1 + Math.random() * ROOM_HEIGHT;

      positions[i3 + 2] = (Math.random() - 0.5) * ROOM_DEPTH;

      // Individual drifting velocities
      velocities[i3] = (Math.random() - 0.5) * 0.3;

      velocities[i3 + 1] = (Math.random() - 0.5) * 0.08;

      velocities[i3 + 2] = (Math.random() - 0.5) * 0.3;

      phases[i] = Math.random() * Math.PI * 2;

      // Larger, more visible particles
      sizes[i] = 1.5 + Math.random() * 2.5;
    }

    return {
      positions,
      velocities,
      phases,
      sizes,
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#ffe0a3") },
      uOpacity: { value: 0.65 },
      uSize: { value: 2.5 },
      uTime: { value: 0 },
      uMagic: { value: 0 },
    }),
    [],
  );

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;

    const attribute = geometry.attributes.position;

    const array = attribute.array as Float32Array;

    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    const halfWidth = ROOM_WIDTH / 2;
    const halfDepth = ROOM_DEPTH / 2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const x = i3;
      const y = i3 + 1;
      const z = i3 + 2;

      const phase = particleData.phases[i];

      // Different movement for each particle
      const driftX = Math.sin(time * 0.65 + phase) * 0.12;

      const driftY = Math.sin(time * 0.8 + phase * 1.3) * 0.04;

      const driftZ = Math.cos(time * 0.55 + phase * 1.7) * 0.12;

      array[x] += (particleData.velocities[x] + driftX) * dt;

      array[y] += (particleData.velocities[y] + driftY) * dt;

      array[z] += (particleData.velocities[z] + driftZ) * dt;

      // Wrap horizontally
      if (array[x] > halfWidth) {
        array[x] = -halfWidth;
      }

      if (array[x] < -halfWidth) {
        array[x] = halfWidth;
      }

      if (array[z] > halfDepth) {
        array[z] = -halfDepth;
      }

      if (array[z] < -halfDepth) {
        array[z] = halfDepth;
      }

      // Wrap vertically
      if (array[y] > ROOM_HEIGHT) {
        array[y] = 0.1;
      }

      if (array[y] < 0.1) {
        array[y] = ROOM_HEIGHT;
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
      u.uOpacity.value = 0.65 + 0.35 * amount;
      u.uSize.value = 2.5 + 1.1 * amount;
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

          attribute float size;
          attribute float phase;

          varying float vAlpha;
          varying float vPhase;

          void main() {
            vPhase = phase;

            vec4 mvPosition =
              modelViewMatrix *
              vec4(position, 1.0);

            gl_Position =
              projectionMatrix * mvPosition;

            // Perspective-correct point size
            gl_PointSize = clamp(
              uSize * size * (300.0 / -mvPosition.z),
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

          varying float vAlpha;
          varying float vPhase;

          void main() {
            vec2 uv =
              gl_PointCoord - vec2(0.5);

            float dist = length(uv);

            // Round, soft glowing particles
            float alpha =
              1.0 - smoothstep(0.12, 0.5, dist);

            if (alpha < 0.02) discard;

            // Twinkle: during our song every speck pulses on its own rhythm.
            float twinkle = mix(
              1.0,
              0.4 + 0.6 * sin(uTime * 2.6 + vPhase * 6.2831),
              uMagic
            );

            gl_FragColor = vec4(
              uColor,
              alpha * uOpacity * vAlpha * twinkle
            );
          }
        `}
      />
    </points>
  );
}
