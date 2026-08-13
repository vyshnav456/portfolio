"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useStage } from "./canvas-stage";

/**
 * One scene, three formations, driven by scroll:
 *
 *   containers  →  service mesh  →  CI/CD pipeline
 *
 * Each formation has to read at a glance, so they deliberately don't share a
 * silhouette: the containers are axis-aligned stacks, the mesh is a sparse
 * shell of wired nodes, and the pipeline is flat packets streaming through
 * gates. Units only tumble while they're in flight between the three; at rest
 * they sit square, which is what makes a stack look like a stack.
 */

const RACKS = 4;
const RACK_COLS = 3;
const RACK_ROWS = 5;
const RACK_DEPTH = 2;
const PER_RACK = RACK_COLS * RACK_ROWS * RACK_DEPTH; // 30
const COUNT = RACKS * PER_RACK; // 120
const NODES = 40; // instances that double as service-mesh nodes
const LANES = 4;
const PIPE_SPAN = 6.6; // half-length of the pipeline along x
const PIPE_DEPTH = 2.2; // how far the lanes weave through z
const GATES = [-5.4, -2.7, 0, 2.7, 5.4]; // pipeline stage rings
const REFERENCE_ASPECT = 16 / 9; // the framing the camera keyframes were set for

/** Smootherstep — flatter at both ends than smoothstep, so morphs settle. */
function ss(x: number) {
  const c = Math.min(Math.max(x, 0), 1);
  return c * c * c * (c * (c * 6 - 15) + 10);
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function buildFormations() {
  const cluster = new Float32Array(COUNT * 3);
  const mesh = new Float32Array(COUNT * 3);
  const pipe = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  const delay = new Float32Array(COUNT);

  const random = rng(20260812);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    seed[i] = random();
    // staggering the morph makes the formation assemble in waves
    delay[i] = random() * 0.34;

    /* ---- containers: four square stacks, laid out two by two ----------- */
    const rack = Math.floor(i / PER_RACK);
    const within = i % PER_RACK;
    const col = within % RACK_COLS;
    const row = Math.floor(within / RACK_COLS) % RACK_ROWS;
    const layer = Math.floor(within / (RACK_COLS * RACK_ROWS));
    cluster[i3] =
      (rack % 2 === 0 ? -1 : 1) * 3.9 + (col - (RACK_COLS - 1) / 2) * 1.05;
    cluster[i3 + 1] = (row - (RACK_ROWS - 1) / 2) * 1.05;
    cluster[i3 + 2] =
      (rack < 2 ? -1 : 1) * 3 + (layer - (RACK_DEPTH - 1) / 2) * 1.05;

    /* ---- service mesh: nodes on a shell, packets held inside ----------- */
    if (i < NODES) {
      const y = 1 - (i / (NODES - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      mesh[i3] = Math.cos(theta) * r * 4.3;
      mesh[i3 + 1] = y * 4.3;
      mesh[i3 + 2] = Math.sin(theta) * r * 4.3;
    } else {
      const radius = 1.1 + random() * 1.5;
      const phi = Math.acos(2 * random() - 1);
      const theta = random() * Math.PI * 2;
      mesh[i3] = Math.sin(phi) * Math.cos(theta) * radius;
      mesh[i3 + 1] = Math.cos(phi) * radius;
      mesh[i3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
    }

    /* ---- pipeline: four lanes streaming through the stage gates -------- */
    const lane = i % LANES;
    const k = Math.floor(i / LANES);
    const t = k / (COUNT / LANES - 1);
    pipe[i3] = -PIPE_SPAN + t * PIPE_SPAN * 2;
    pipe[i3 + 1] =
      (lane - (LANES - 1) / 2) * 1.5 + Math.sin(t * Math.PI * 3) * 0.3;
    pipe[i3 + 2] = Math.cos(t * Math.PI * 2 + lane * 1.6) * PIPE_DEPTH;
  }

  /* ---- mesh edges: every node wired to its two nearest neighbours ----- */
  const pairs = new Set<number>();
  for (let a = 0; a < NODES; a++) {
    const best = [
      { i: -1, d: Infinity },
      { i: -1, d: Infinity },
    ];
    for (let b = 0; b < NODES; b++) {
      if (a === b) continue;
      const dx = mesh[a * 3] - mesh[b * 3];
      const dy = mesh[a * 3 + 1] - mesh[b * 3 + 1];
      const dz = mesh[a * 3 + 2] - mesh[b * 3 + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < best[0].d) {
        best[1] = best[0];
        best[0] = { i: b, d };
      } else if (d < best[1].d) {
        best[1] = { i: b, d };
      }
    }
    for (const { i: b } of best) {
      if (b < 0) continue;
      pairs.add(Math.min(a, b) * NODES + Math.max(a, b));
    }
  }

  const edges = new Uint16Array(pairs.size * 2);
  let e = 0;
  for (const key of pairs) {
    edges[e++] = Math.floor(key / NODES);
    edges[e++] = key % NODES;
  }

  return { cluster, mesh, pipe, seed, delay, edges };
}

/** Camera framing for each formation — position, target, and field of view. */
const CAM = [
  { pos: new THREE.Vector3(11, 7, 12), look: new THREE.Vector3(0, -1.8, 0), fov: 36 },
  { pos: new THREE.Vector3(-1, 1.2, 14.6), look: new THREE.Vector3(0, 0, 0), fov: 40 },
  { pos: new THREE.Vector3(-7, 2.2, 16), look: new THREE.Vector3(-0.5, -1.4, 0), fov: 38 },
];

/** Roll applied to the pipeline shot on portrait viewports (see the frame loop). */
const PORTRAIT_ROLL = THREE.MathUtils.degToRad(60);

/* The formation data, the scratch objects the frame loop writes through, and
   the two resources shared by every frame. They live outside the component on
   purpose: the scene mounts once per page, and this keeps the render pass free
   of anything React would have to treat as mutable state. */
const form = buildFormations();
const dummy = new THREE.Object3D();
const nodePos = new Float32Array(NODES * 3);
const camPos = new THREE.Vector3().copy(CAM[0].pos);
const camLook = new THREE.Vector3().copy(CAM[0].look);

const linkGeometry = (() => {
  const geometry = new THREE.BufferGeometry();
  const attribute = new THREE.BufferAttribute(
    new Float32Array(form.edges.length * 3),
    3,
  );
  attribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
  return geometry;
})();

/** Every gate ring shares one material, so a single write fades them all. */
const gateMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

export function DevOpsScene() {
  const solid = useRef<THREE.InstancedMesh>(null);
  const wire = useRef<THREE.InstancedMesh>(null);
  const links = useRef<THREE.LineSegments>(null);
  const linkMaterial = useRef<THREE.LineBasicMaterial>(null);
  const gates = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const pulseMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const root = useRef<THREE.Group>(null);

  const { palette, progress, animate, dark } = useStage();

  const clock = useRef(0);

  // two colours carry the whole scene: nodes read as services, the rest as the
  // work moving between them. A third lands on a handful, for punctuation.
  useEffect(() => {
    const tint = new THREE.Color();
    for (const mesh of [solid.current, wire.current]) {
      if (!mesh) continue;
      for (let i = 0; i < COUNT; i++) {
        const role =
          i < NODES ? palette.a : i % 6 === 0 ? palette.c : palette.b;
        mesh.setColorAt(i, tint.set(role));
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [palette]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (animate) clock.current += dt;
    const t = clock.current;
    const p = progress.current;

    // the two morph windows, with a settled beat between them
    const m1 = ss((p - 0.14) / 0.3);
    const m2 = ss((p - 0.56) / 0.3);

    /* ------------------------------------------------------------ camera */
    const camera = state.camera as THREE.PerspectiveCamera;

    camPos.lerpVectors(CAM[0].pos, CAM[1].pos, m1);
    camPos.lerp(CAM[2].pos, m2);
    camLook.lerpVectors(CAM[0].look, CAM[1].look, m1);
    camLook.lerp(CAM[2].look, m2);

    // Narrow viewports have to dolly back to keep a formation in frame. The
    // pipeline is the wide one, and dollying alone would shrink it to a band
    // across the middle of a phone — so it also rolls, laying the road out
    // diagonally where a tall viewport has the room for it.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const fit = THREE.MathUtils.clamp(REFERENCE_ASPECT / aspect, 1, 4);
    const portrait = THREE.MathUtils.clamp((fit - 1) / 1.6, 0, 1);
    // the stacks and the mesh are compact enough that a phone can hold them
    // closer than the correction implies; the pipeline is the one that can't
    const near = THREE.MathUtils.lerp(0.85, 0.68, portrait);
    const dolly = THREE.MathUtils.lerp(near, THREE.MathUtils.lerp(1, 0.6, portrait), m2);
    camPos.multiplyScalar(1 + (fit - 1) * dolly);

    if (animate) {
      // a slow orbit keeps the framing alive while a formation sits settled
      const drift = Math.sin(t * 0.13) * 0.07;
      const x = camPos.x * Math.cos(drift) - camPos.z * Math.sin(drift);
      const z = camPos.x * Math.sin(drift) + camPos.z * Math.cos(drift);
      camPos.set(x, camPos.y + Math.sin(t * 0.19) * 0.22, z);
    }

    // damping is what turns a scroll jump into a camera move
    const k = animate ? 1 - Math.exp(-3.4 * dt) : 1;
    camera.position.lerp(camPos, k);
    // roll rides in on the same weight as the pipeline, so it reads as part of
    // the same move rather than a separate correction
    const roll = PORTRAIT_ROLL * portrait * m2;
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(camLook);

    const fov = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(CAM[0].fov, CAM[1].fov, m1),
      CAM[2].fov,
      m2,
    );
    if (Math.abs(camera.fov - fov) > 0.02) {
      camera.fov = THREE.MathUtils.damp(camera.fov, fov, 4, dt);
      camera.updateProjectionMatrix();
    }

    /* ------------------------------------------------------------- units */
    const solidMesh = solid.current;
    const wireMesh = wire.current;
    if (!solidMesh || !wireMesh) return;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const s = form.seed[i];
      const d = form.delay[i];
      const l1 = ss((m1 - d) / 0.66);
      const l2 = ss((m2 - d) / 0.66);
      const node = i < NODES;

      let x = form.cluster[i3] + (form.mesh[i3] - form.cluster[i3]) * l1;
      let y =
        form.cluster[i3 + 1] + (form.mesh[i3 + 1] - form.cluster[i3 + 1]) * l1;
      let z =
        form.cluster[i3 + 2] + (form.mesh[i3 + 2] - form.cluster[i3 + 2]) * l1;

      x += (form.pipe[i3] - x) * l2;
      y += (form.pipe[i3 + 1] - y) * l2;
      z += (form.pipe[i3 + 2] - z) * l2;

      // bow the flight path so units travel on an arc, not a straight line
      const arc =
        Math.sin(l1 * Math.PI) * (0.6 + s * 1.2) +
        Math.sin(l2 * Math.PI) * (0.5 + s * 1);
      y += s > 0.5 ? arc : -arc;

      // idle life: the stacks breathe, the mesh drifts, the pipeline streams
      y += Math.sin(t * 0.6 + s * 6.28) * 0.05 * (1 - m1);
      y += Math.cos(t * 0.5 + s * 5.1) * 0.11 * m1 * (1 - m2);
      x += Math.sin(t * 1.15 + s * 6.28) * 0.45 * m2;

      // one size per formation, so each reads on its own terms: crates, then
      // a few large nodes over small packets, then flat packets in the lanes
      const vary = 0.86 + s * 0.28;
      let size = 0.6 * vary;
      size += ((node ? 0.52 : 0.24) * vary - size) * l1;
      size += ((node ? 0.2 : 0.17) * vary - size) * l2;
      // packets streak along the flow once they reach the pipeline
      dummy.scale.set(size * (1 + 1.5 * l2), size * (1 - 0.25 * l2), size * (1 - 0.25 * l2));

      // Square at rest, tumbling only in transit. This is what lets the stacks
      // read as stacks instead of as a cloud of loose boxes.
      const spin = (l1 * (1 - l1) + l2 * (1 - l2)) * 7;
      dummy.rotation.set(spin * (0.7 + s), spin * (1.1 + s * 0.6), spin * s * 0.4);

      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      solidMesh.setMatrixAt(i, dummy.matrix);
      wireMesh.setMatrixAt(i, dummy.matrix);

      if (node) {
        nodePos[i3] = x;
        nodePos[i3 + 1] = y;
        nodePos[i3 + 2] = z;
      }
    }

    solidMesh.instanceMatrix.needsUpdate = true;
    wireMesh.instanceMatrix.needsUpdate = true;

    /* -------------------------------------------------------- mesh links */
    const linkOpacity = 0.7 * m1 * (1 - m2);
    if (links.current) links.current.visible = linkOpacity > 0.01;
    if (linkMaterial.current) linkMaterial.current.opacity = linkOpacity;

    if (linkOpacity > 0.01) {
      const attribute = linkGeometry.attributes.position as THREE.BufferAttribute;
      const array = attribute.array as Float32Array;
      for (let e = 0; e < form.edges.length; e++) {
        const n = form.edges[e] * 3;
        array[e * 3] = nodePos[n];
        array[e * 3 + 1] = nodePos[n + 1];
        array[e * 3 + 2] = nodePos[n + 2];
      }
      attribute.needsUpdate = true;
    }

    /* ---------------------------------------------------- pipeline props */
    if (gates.current) {
      gates.current.visible = m2 > 0.01;
      gates.current.rotation.x = t * 0.2;
    }
    gateMaterial.opacity = 0.42 * m2;

    if (pulse.current && pulseMaterial.current) {
      pulse.current.visible = m2 > 0.02;
      // a build artefact running the length of the pipeline, on repeat
      const travel = (t % 5.5) / 5.5;
      pulse.current.position.set(-PIPE_SPAN + travel * PIPE_SPAN * 2, 0, 0);
      const flare = 1 + Math.sin(travel * Math.PI * 10) * 0.15;
      pulse.current.scale.setScalar(flare);
      pulseMaterial.current.opacity =
        m2 * 0.85 * Math.sin(Math.min(travel, 1) * Math.PI);
    }

    /* --------------------------------------------------------- the whole */
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.09) * 0.06 * (1 - m2);
    }
  });

  return (
    <group ref={root}>
      {/* solid bodies, kept faint — the wireframe carries the detail */}
      <instancedMesh
        ref={solid}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0.12} depthWrite={false} />
      </instancedMesh>

      <instancedMesh
        ref={wire}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          wireframe
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      </instancedMesh>

      {/* service-to-service links, live only while the mesh is formed */}
      <lineSegments ref={links} geometry={linkGeometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={linkMaterial}
          color={palette.b}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>

      {/* pipeline stage gates */}
      <group ref={gates} visible={false}>
        {GATES.map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[3.4, 0.03, 6, 64]} />
            <primitive object={gateMaterial} attach="material" color={palette.a} />
          </mesh>
        ))}
      </group>

      {/* the build artefact travelling the pipeline */}
      <mesh ref={pulse} visible={false}>
        <sphereGeometry args={[0.34, 20, 20]} />
        <meshBasicMaterial
          ref={pulseMaterial}
          color={palette.c}
          transparent
          opacity={0}
          depthWrite={false}
          blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
}
