/**
 * GLSL for the hero particle field.
 *
 * The 3D simplex noise below is Ashima Arts / Stefan Gustavson's reference
 * implementation (MIT licence) — the standard `snoise` used across WebGL work.
 */

const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uAmp;
uniform float uPointer;

attribute float aScale;
attribute float aSeed;

varying float vNoise;
varying float vDepth;

${simplexNoise}

void main() {
  vec3 dir = normalize(position);

  // two octaves of drifting noise displace the shell in and out
  float n1 = snoise(position * 0.85 + vec3(0.0, 0.0, uTime * 0.14));
  float n2 = snoise(position * 2.10 - vec3(uTime * 0.09, 0.0, 0.0));
  float n  = n1 * 0.62 + n2 * 0.28;

  // pointer proximity pushes the shell outward slightly
  vec3 pos = position + dir * (n * uAmp + uPointer * 0.06);

  // gentle per-point shimmer so the field never looks frozen
  pos += dir * sin(uTime * 0.9 + aSeed * 6.2831) * 0.012;

  vNoise = n;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vDepth = -mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * aScale * (1.0 / max(vDepth, 0.001));
}
`;

export const particleFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
uniform float uSoft;

varying float vNoise;
varying float vDepth;

void main() {
  // Round point sprites. uSoft sets where the edge starts falling off: a wide
  // feather glows nicely when the points are blended additively over a dark
  // page, but on a light one it just fades to nothing, so light mode pulls the
  // edge in and draws something closer to a solid disc.
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, uSoft, d);

  // fade the far side of the sphere so the volume reads as 3D
  float depthFade = smoothstep(9.5, 4.2, vDepth);

  vec3 color = mix(uColorA, uColorB, smoothstep(-0.7, 0.8, vNoise));

  gl_FragColor = vec4(color, alpha * uOpacity * depthFade);

  #include <colorspace_fragment>
}
`;
