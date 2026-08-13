"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useStage } from "./canvas-stage";
import { particleFragment, particleVertex } from "./shaders";

const COUNT = 5200;
const RADIUS = 2.05;

/** Even point distribution on a sphere (Fibonacci / golden-angle spiral). */
function buildGeometry() {
  const positions = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);
  const seeds = new Float32Array(COUNT);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;

    positions[i * 3] = Math.cos(theta) * r * RADIUS;
    positions[i * 3 + 1] = y * RADIUS;
    positions[i * 3 + 2] = Math.sin(theta) * r * RADIUS;

    scales[i] = 0.55 + Math.random() * 0.85;
    seeds[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), RADIUS * 1.6);
  return geometry;
}

function buildUniforms() {
  return {
    uTime: { value: 0 },
    uSize: { value: 12 },
    uAmp: { value: 0.34 },
    uPointer: { value: 0 },
    uOpacity: { value: 0.95 },
    uSoft: { value: 0.06 },
    uColorA: { value: new THREE.Color("#a78bfa") },
    uColorB: { value: new THREE.Color("#22d3ee") },
  };
}

/** Camera framing at the top of the page and once the hero has scrolled away. */
const CAM_TOP = { pos: new THREE.Vector3(0, 0, 6.4), fov: 45 };
const CAM_EXIT = { pos: new THREE.Vector3(2.3, 1.55, 8.4), fov: 37 };

// scratch vectors for the camera rig — rewritten from scratch every frame
const target = new THREE.Vector3();
const look = new THREE.Vector3();

export function HeroScene() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const spin = useRef(0);

  const { viewport } = useThree();
  const { palette, progress, animate, dark } = useStage();

  const geometry = useMemo(() => buildGeometry(), []);
  const uniforms = useMemo(() => buildUniforms(), []);

  // On wide screens the sphere sits to the right of the copy; on narrow ones
  // it centres behind it (where the mask keeps it faint enough to read over).
  const wide = viewport.width > 8.5;
  const offsetX = wide ? 1.85 : 0;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const mat = material.current;
    if (!mat) return;

    // colours live on the material instance, so a theme flip costs nothing
    mat.uniforms.uColorA.value.set(palette.a);
    mat.uniforms.uColorB.value.set(palette.b);
    // light mode trades the additive glow for solid, slightly larger points
    mat.uniforms.uSoft.value = dark ? 0.06 : 0.32;
    mat.uniforms.uSize.value = dark ? 12 : 14;

    if (!animate) {
      // one settled frame, then hold still for reduced-motion users
      mat.uniforms.uTime.value = 12;
      return;
    }

    mat.uniforms.uTime.value += dt;

    const px = state.pointer.x;
    const py = state.pointer.y;

    // scroll pushes the camera up and around the sphere as the hero leaves
    const p = progress.current;
    const eased = p * p * (3 - 2 * p);
    const camera = state.camera as THREE.PerspectiveCamera;

    target.lerpVectors(CAM_TOP.pos, CAM_EXIT.pos, eased);
    target.x += px * 0.28;
    target.y += py * 0.2;
    camera.position.lerp(target, 1 - Math.exp(-5 * dt));

    look.set(-eased * 0.7, -eased * 0.45, 0);
    camera.lookAt(look);

    const fov = THREE.MathUtils.lerp(CAM_TOP.fov, CAM_EXIT.fov, eased);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = THREE.MathUtils.damp(camera.fov, fov, 5, dt);
      camera.updateProjectionMatrix();
    }

    // pointer distance from centre gently inflates the shell
    mat.uniforms.uPointer.value = THREE.MathUtils.damp(
      mat.uniforms.uPointer.value,
      Math.min(Math.hypot(px, py), 1),
      2.5,
      dt,
    );

    spin.current += dt * 0.055;

    const g = group.current;
    if (g) {
      // constant drift plus a damped parallax tilt toward the cursor
      g.rotation.y =
        spin.current +
        THREE.MathUtils.damp(g.rotation.y - spin.current, px * 0.34, 3, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -py * 0.26, 3, dt);
      g.position.x = THREE.MathUtils.damp(g.position.x, offsetX + px * 0.22, 3, dt);
      g.position.y = THREE.MathUtils.damp(g.position.y, py * 0.16, 3, dt);
    }

    const c = core.current;
    if (c) {
      c.rotation.y -= dt * 0.11;
      c.rotation.z += dt * 0.04;
    }
  });

  // keep the sphere comfortably inside narrow viewports
  const scale = Math.min(1, viewport.width / 7.5);

  return (
    <group ref={group} scale={scale}>
      <points frustumCulled={false}>
        <primitive object={geometry} attach="geometry" />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={particleVertex}
          fragmentShader={particleFragment}
          transparent
          depthWrite={false}
          // Additive light can only brighten what's behind it, so on a near-white
          // page it adds nothing. Light mode paints the points normally instead.
          blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>

      {/* faint wireframe core, counter-rotating */}
      <mesh ref={core} scale={0.46}>
        <icosahedronGeometry args={[RADIUS, 1]} />
        <meshBasicMaterial
          color={palette.b}
          wireframe
          transparent
          opacity={dark ? 0.055 : 0.16}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
