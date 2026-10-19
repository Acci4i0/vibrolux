/**
 * Lavorazioni hero: a circular vibrator (after the VBC series Vibrolux works with) cut open toward the viewer,
 * rendered solid in a dark studio with three.js.
 *
 * The machine: the tub — steel shell with its polyurethane lining, a channel with a round bottom, the central
 * column and a bolted rim — on a ring of coil springs over the pedestal; inside the column the vertical motor
 * with its cooling fins and the two eccentric masses, top and bottom, turning. The media are the catalogue's
 * preforms (angle-cut triangles, cones, cylinders) rolling in the channel the way a vibrator moves them — up the
 * outer wall, inward across the surface, down by the column, out along the bottom — while the mass precesses
 * around the bowl; a few gears ride the flow. The media move on the GPU; units are metres.
 */
import * as THREE from 'three';

/* ───────── dimensions (metres, after a VBC 400: Ø 1340 mm, tub 480 mm) ───────── */

const CX = 0.42; // channel: centre radius
const CY = 0.2; // channel: height of the round bottom's centre
const CR = 0.23; // channel: radius of the steel's inner surface
const LIN = 0.016; // polyurethane lining
const SH = 0.016; // steel shell
const COL = CX - CR; // column radius
const TOP = 0.48; // rim
const FILL = 0.385; // free surface of the media
/** the channel inside the lining, where the media live */
const MR = CR - LIN;
/** the point the media orbit around, in (ρ, y) */
const C0: [number, number] = [CX, 0.215];

/** the quarter cut toward the viewer: centre and half-angle (radians) */
const CUT = { c: THREE.MathUtils.degToRad(20), half: THREE.MathUtils.degToRad(45) };
const PHI0 = CUT.c + CUT.half; // where the remaining 270° start
const PHIL = Math.PI * 2 - 2 * CUT.half;

/** flow: radians per second in the section, and around the bowl */
const ROLL = 0.36, PRECESS = 0.05;
/** the tub's gyratory motion, scaled down to be seen, not felt */
const SHAKE = 0.0016;

/* ───────── camera ───────── */

type Cam = { dist: number; el: number; az: number; fov: number; sx: number; sy: number; ty: number };
const LANDSCAPE: Cam = { dist: 4.0, el: 25, az: 40, fov: 30, sx: 0.44, sy: 0.02, ty: 0.0 };
const PORTRAIT: Cam = { dist: 5.0, el: 30, az: 40, fov: 40, sx: 0.04, sy: 0.22, ty: 0.0 };
const ORBIT = 9; // ± degrees of the slow drift

/* ───────── cross-sections: closed loops of smooth runs in (ρ, y), clockwise (material on the right) ───────── */

type P2 = [number, number];
type Section = P2[][];
const deg = Math.PI / 180;
const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n: number): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as P2;
  });

function tubSection(): Section {
  const ro = CR + SH;
  return [
    [[0, TOP + 0.02], [COL - 0.015, TOP + 0.02]], // column cap
    arc(COL - 0.015, TOP + 0.005, 0.015, 90 * deg, 0, 4),
    [[COL, TOP + 0.005], [COL, CY]], // column wall
    arc(CX, CY, CR, 180 * deg, 360 * deg, 48), // channel
    [[CX + CR, CY], [CX + CR, TOP]], // outer wall
    [[CX + CR, TOP], [CX + CR + 0.07, TOP]], // rim flange
    [[CX + CR + 0.07, TOP], [CX + CR + 0.07, TOP - 0.028]],
    [[CX + CR + 0.07, TOP - 0.028], [CX + ro, TOP - 0.028]],
    [[CX + ro, TOP - 0.028], [CX + ro, CY]], // outer skin
    arc(CX, CY, ro, 0, -180 * deg, 48), // round bottom, outside
    [[CX - ro, CY], [CX - ro, TOP + 0.005]], // column, inside
    [[CX - ro, TOP + 0.005], [0, TOP + 0.005]], // under the cap
    [[0, TOP + 0.005], [0, TOP + 0.02]],
  ];
}
function liningSection(): Section {
  const t = TOP - 0.035;
  return [
    [[COL, t], [COL + LIN, t]],
    [[COL + LIN, t], [COL + LIN, CY]],
    arc(CX, CY, MR, 180 * deg, 360 * deg, 48),
    [[CX + MR, CY], [CX + MR, t]],
    [[CX + MR, t], [CX + CR, t]],
    [[CX + CR, t], [CX + CR, CY]],
    arc(CX, CY, CR, 0, -180 * deg, 48),
    [[COL, CY], [COL, t]],
  ];
}
/** the mass of media just under the chips: it hides the gaps between them */
function coreSection(): Section {
  const r = MR - 0.012, f = FILL - 0.02;
  return [
    [[CX - r, f], [CX + r, f]],
    [[CX + r, f], [CX + r, CY]],
    arc(CX, CY, r, 0, -180 * deg, 40),
    [[CX - r, CY], [CX - r, f]],
  ];
}
const ring = (r0: number, r1: number, y0: number, y1: number): Section => [
  [[r0, y1], [r1, y1]],
  [[r1, y1], [r1, y0]],
  [[r1, y0], [r0, y0]],
  [[r0, y0], [r0, y1]],
];

/* ───────── geometry ───────── */

/** revolve a section over the remaining 270°: smooth along each run, hard edges where runs meet */
function revolve(sec: Section, segs: number): THREE.BufferGeometry {
  const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  for (const run of sec) {
    const n2 = run.map((_, i) => {
      const a = run[Math.max(i - 1, 0)], b = run[Math.min(i + 1, run.length - 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      return [-dy / l, dx / l]; // left of travel = outside
    });
    const base = pos.length / 3, m = run.length;
    for (let s = 0; s <= segs; s++) {
      const phi = PHI0 + (PHIL * s) / segs, c = Math.cos(phi), si = Math.sin(phi);
      run.forEach(([r, y], i) => {
        pos.push(r * c, y, r * si);
        nor.push(n2[i][0] * c, n2[i][1], n2[i][0] * si);
      });
    }
    for (let s = 0; s < segs; s++)
      for (let i = 0; i < m - 1; i++) {
        const a = base + s * m + i, b = a + m;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}
/** the flat face where the wedge cuts a section, at angle phi; facing -1 at the start of the 270°, +1 at the end */
function cutFace(sec: Section, phi: number, facing: 1 | -1): THREE.BufferGeometry {
  const loop: THREE.Vector2[] = [];
  for (const run of sec) for (let i = 0; i < run.length - 1; i++) loop.push(new THREE.Vector2(run[i][0], run[i][1]));
  const g = new THREE.ShapeGeometry(new THREE.Shape(loop));
  const p = g.attributes.position as THREE.BufferAttribute, c = Math.cos(phi), s = Math.sin(phi);
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * c, p.getY(i), p.getX(i) * s);
  // ShapeGeometry faces +z, which maps to (-sin φ, 0, cos φ)
  const n = [-s * facing, 0, c * facing];
  g.setAttribute('normal', new THREE.Float32BufferAttribute(Array.from({ length: p.count }, () => n).flat(), 3));
  if (facing < 0) {
    const ix = g.index!.array as Uint16Array | Uint32Array;
    for (let i = 0; i < ix.length; i += 3) [ix[i + 1], ix[i + 2]] = [ix[i + 2], ix[i + 1]];
  }
  return g;
}

class Helix extends THREE.Curve<THREE.Vector3> {
  constructor(private r: number, private h: number, private turns: number) {
    super();
  }
  getPoint(t: number, out = new THREE.Vector3()) {
    const a = t * this.turns * Math.PI * 2;
    return out.set(this.r * Math.cos(a), -this.h * t, this.r * Math.sin(a));
  }
}

function gearGeometry() {
  const teeth = 12, ro = 0.042, rr = 0.034, sh = new THREE.Shape();
  for (let i = 0; i <= teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2, r = i % 4 < 2 ? ro : rr;
    if (i === 0) sh.moveTo(r * Math.cos(a), r * Math.sin(a));
    else sh.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.013, 0, Math.PI * 2, true);
  sh.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.014, bevelEnabled: true, bevelSize: 0.0015, bevelThickness: 0.0015, bevelSegments: 1, curveSegments: 6 });
  g.translate(0, 0, -0.007);
  return g;
}
/** the catalogue's preforms, about 24 mm: angle-cut triangle, cone, cylinder */
function chipGeometries() {
  const tri = new THREE.Shape([new THREE.Vector2(0, 0.0145), new THREE.Vector2(-0.0125, -0.0072), new THREE.Vector2(0.0125, -0.0072)]);
  const prism = new THREE.ExtrudeGeometry(tri, { depth: 0.012, bevelEnabled: true, bevelSize: 0.0012, bevelThickness: 0.0012, bevelSegments: 1 });
  prism.translate(0, 0, -0.006);
  const pp = prism.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pp.count; i++) pp.setZ(i, pp.getZ(i) + pp.getY(i) * 0.35); // the angle cut
  prism.computeVertexNormals();
  return [prism, new THREE.ConeGeometry(0.011, 0.022, 10, 1), new THREE.CylinderGeometry(0.0055, 0.0055, 0.02, 10, 1)];
}

/* ───────── shaders: the flow, the build on arrival, the vibration ───────── */

const GLSL_COMMON = /* glsl */ `
uniform float uTime;
uniform float uIntro;
const float PHI0 = ${PHI0.toFixed(5)}, PHIL = ${PHIL.toFixed(5)}, CUTC = ${CUT.c.toFixed(5)}, CUTH = ${CUT.half.toFixed(5)};
vec3 shake(){ return ${SHAKE.toFixed(5)} * vec3(sin(uTime * 31.4), 0.35 * sin(uTime * 62.8 + 1.0), cos(uTime * 31.4)); }
// 0 to 1 along the remaining 270 degrees, from the first cut face (the wedge counts as the end)
float around(vec3 p){ return min(fract((atan(p.z, p.x) - PHI0) / PI2) * PI2 / PHIL, 1.0); }
float hash13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
// the eccentric masses turn about the motor's axis
mat2 spinR(){ float a = uTime * 1.6; return mat2(cos(a), sin(a), -sin(a), cos(a)); }
varying vec3 vRevealPos;
`;

const GLSL_FLOW = /* glsl */ `
attribute vec4 aFlow;   // theta0, phi0, orbit s, speed
attribute vec4 aSpin;   // tumbling axis, rate
const vec2 C0 = vec2(${C0[0].toFixed(4)}, ${C0[1].toFixed(4)});
const float CX = ${CX.toFixed(4)}, CY = ${CY.toFixed(4)}, MR = ${MR.toFixed(4)}, FILL = ${FILL.toFixed(4)};
// from C0 to the edge of the media's section along d: the U of the channel under the free surface
float edgeDist(vec2 d){
  float t = 1e3;
  if (d.y > 1e-4) t = min(t, (FILL - C0.y) / d.y);
  if (abs(d.x) > 1e-4) t = min(t, ((d.x > 0.0 ? CX + MR : CX - MR) - C0.x) / d.x);
  vec2 o = C0 - vec2(CX, CY);
  float b = dot(o, d), c = dot(o, o) - MR * MR;
  float tc = -b + sqrt(max(b * b - c, 0.0));
  if (C0.y + d.y * tc < CY) t = min(t, tc);
  return t;
}
mat3 rotAxis(vec3 a, float ang){
  float c = cos(ang), s = sin(ang), k = 1.0 - c;
  return mat3(c + a.x*a.x*k, a.y*a.x*k + a.z*s, a.z*a.x*k - a.y*s,
              a.x*a.y*k - a.z*s, c + a.y*a.y*k, a.z*a.y*k + a.x*s,
              a.x*a.z*k + a.y*s, a.y*a.z*k - a.x*s, c + a.z*a.z*k);
}
// the section turns counter-clockwise in (rho, y): up the outer wall, inward on top, down by the column
float fPhase(){ return aFlow.y + uTime * ${ROLL.toFixed(3)} * aFlow.w * (1.25 - 0.45 * aFlow.z); }
float fTheta(){ return aFlow.x + uTime * ${PRECESS.toFixed(3)} * aFlow.w; }
mat3 chipRot(){ return rotAxis(normalize(aSpin.xyz), aSpin.w * uTime + aFlow.y * 7.0); }
vec3 chipCentre(){
  float f = fPhase(), th = fTheta();
  vec2 d = vec2(cos(f), sin(f));
  vec2 q = C0 + aFlow.z * edgeDist(d) * d;
  return vec3(q.x * cos(th), q.y, q.x * sin(th)) + shake();
}
float chipScale(vec3 c){
  // none inside the cut; on arrival the mass follows the shell around, settling from the surface down
  float dth = abs(atan(sin(fTheta() - CUTC), cos(fTheta() - CUTC)));
  float key = around(c) * 0.75 + (FILL - c.y) * 0.6;
  return smoothstep(CUTH + 0.005, CUTH + 0.03, dth) * smoothstep(key, key + 0.12, uIntro * 1.4 - 0.2) * (0.8 + 0.4 * fract(aFlow.x * 13.7));
}
`;

/** the media's cut face: preforms packed tight, in (rho, y) on the face: two jittered layers of 26 mm cells */
const GLSL_PACKED = /* glsl */ `
float sdTri(vec2 p, float r){
  const float k = 1.7320508;
  p.x = abs(p.x) - r; p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}
vec2 h22(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }
// one layer of preforms: a cell each, jittered, turned, triangles or round ends; returns (distance, tone)
vec2 chipLayer(vec2 uv, float seed){
  vec2 id = floor(uv), h = h22(id + seed), g = h22(id * 1.7 + seed + 11.0);
  float a = h.x * 6.2831853;
  vec2 p = mat2(cos(a), sin(a), -sin(a), cos(a)) * (fract(uv) - 0.5 - (g - 0.5) * 0.34);
  float r = 0.3 + 0.12 * g.y;
  return vec2(h.y < 0.6 ? sdTri(p, r) : (h.y < 0.82 ? length(p) - r * 0.95 : max(abs(p.x) - r * 1.2, abs(p.y) - r * 0.55)), h.y);
}
vec3 packedChips(vec3 wp){
  vec2 uv = vec2(length(wp.xz), wp.y) / 0.026;
  vec2 l1 = chipLayer(uv, 0.0), l2 = chipLayer(uv * 1.13 + vec2(0.5, 0.37), 7.0);
  vec2 l = l1.x < l2.x ? l1 : l2;
  return mix(vec3(0.02), vec3(0.3 + 0.26 * l.y), 1.0 - smoothstep(0.0, 0.05, l.x));
}
`;

type Shader = { uniforms: Record<string, THREE.IUniform>; vertexShader: string; fragmentShader: string };

/**
 * Hooks every material into the shared clock: `flow` places a media chip, `spin` turns the eccentric masses,
 * `packed` draws the media's section as tightly packed preforms; everything else shakes with the tub and builds
 * in on arrival (a dissolve sweeping around the bowl).
 */
function patch(mat: THREE.Material, uni: Record<string, THREE.IUniform>, opts: { flow?: boolean; spin?: boolean; packed?: boolean } = {}) {
  const begin = opts.flow
    ? 'vec3 cc = chipCentre(); vec3 transformed = chipRot() * position * chipScale(cc) + cc; vRevealPos = cc;'
    : `vec3 transformed = vec3(position);
       ${opts.spin ? 'transformed.xz = spinR() * transformed.xz;' : ''}
       #ifdef USE_INSTANCING
         vec3 wp = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
       #else
         vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
       #endif
       float onTub = step(-0.3, wp.y); // the tub and what hangs from it shake, the pedestal stays put
       transformed += shake() * onTub;
       vRevealPos = wp;`;
  const normal = opts.flow
    ? 'vec3 objectNormal = chipRot() * vec3(normal);'
    : opts.spin
      ? 'vec3 objectNormal = vec3(normal); objectNormal.xz = spinR() * objectNormal.xz;'
      : '#include <beginnormal_vertex>';
  mat.onBeforeCompile = (sh: Shader) => {
    Object.assign(sh.uniforms, uni);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\n${GLSL_COMMON}\n${opts.flow ? GLSL_FLOW : ''}`)
      .replace('#include <beginnormal_vertex>', normal)
      .replace('#include <begin_vertex>', begin);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${GLSL_COMMON}\n${opts.packed ? GLSL_PACKED : ''}`)
      .replace('#include <color_fragment>', opts.packed ? '#include <color_fragment>\n diffuseColor.rgb = packedChips(vRevealPos);' : '#include <color_fragment>')
      .replace(
        '#include <clipping_planes_fragment>',
        opts.flow
          ? '#include <clipping_planes_fragment>'
          : `#include <clipping_planes_fragment>
             if (around(vRevealPos) - hash13(floor(vRevealPos * 260.0)) * 0.06 > uIntro * 1.1 - 0.08) discard;`,
      );
  };
  mat.customProgramCacheKey = () => `vbx-${opts.flow ? 'flow' : opts.spin ? 'spin' : opts.packed ? 'packed' : 'solid'}`;
}

/* ───────── the same flow on the CPU, for the gears ───────── */

function edgeDistJS(dx: number, dy: number) {
  let t = 1e3;
  if (dy > 1e-4) t = Math.min(t, (FILL - C0[1]) / dy);
  if (Math.abs(dx) > 1e-4) t = Math.min(t, ((dx > 0 ? CX + MR : CX - MR) - C0[0]) / dx);
  const ox = C0[0] - CX, oy = C0[1] - CY, b = ox * dx + oy * dy, c = ox * ox + oy * oy - MR * MR;
  const tc = -b + Math.sqrt(Math.max(b * b - c, 0));
  if (C0[1] + dy * tc < CY) t = Math.min(t, tc);
  return t;
}

/* ───────── the studio: softboxes in the dark, for the reflections ───────── */

function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x000000);
  const panel = (w: number, h: number, intensity: number, pos: THREE.Vector3) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide }));
    m.position.copy(pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(6, 2.4, 3.2, new THREE.Vector3(0, 6, 0.01)); // top box
  panel(0.7, 6, 5.0, new THREE.Vector3(-5, 2.2, 3)); // strip, left front
  panel(0.7, 6, 4.0, new THREE.Vector3(5, 2.5, -2)); // strip, right back
  panel(8, 1.2, 0.6, new THREE.Vector3(0, 0.5, -7)); // low horizon glow
  panel(9, 9, 1.1, new THREE.Vector3(2.6, -4.5, 2.2)); // a lit floor toward the camera: the sheen along the bowl's outer skin
  panel(0.5, 4, 6.0, new THREE.Vector3(-3.5, 0.5, -4.5)); // hard strip behind, for the edges
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(env, 0.02);
  pm.dispose();
  env.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return rt;
}

/* ───────── the scene ───────── */

/** draw(t, maxDpr, intro): the frame at t seconds, at no more than maxDpr device pixels per CSS pixel,
 *  with the build on arrival at `intro` (0 nothing → 1 complete) */
export type Scene = { draw: (t: number, maxDpr?: number, intro?: number) => void; dispose: () => void };

/** Sets the scene up on a canvas; null when WebGL is missing (the caller shows the photo instead). */
export function createVibratorScene(canvas: HTMLCanvasElement, opts: { chips: number; gears: number; shadows: boolean }): Scene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // the machine's shadows are drawn once (the media receive them but cast none): they cost nothing per frame
  renderer.shadowMap.enabled = opts.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 4.0, 7.0);
  const envRT = studioEnvironment(renderer);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 1.25;

  const uni = { uTime: { value: 0 }, uIntro: { value: 1 } };
  const own: { dispose(): void }[] = [envRT];
  const keep = <T extends { dispose(): void }>(x: T) => (own.push(x), x);

  // monochrome materials: dark satin steel, matte lining, light section faces, polished parts
  const mat = (p: THREE.MeshStandardMaterialParameters, o?: Parameters<typeof patch>[2]) => {
    const m = keep(new THREE.MeshStandardMaterial(p));
    patch(m, uni, o);
    return m;
  };
  const steel = mat({ color: 0x9a9da3, metalness: 1, roughness: 0.34, side: THREE.DoubleSide });
  const steelDark = mat({ color: 0x5a5d62, metalness: 1, roughness: 0.42, side: THREE.DoubleSide });
  const lining = mat({ color: 0x5c5a57, metalness: 0, roughness: 0.62, side: THREE.DoubleSide });
  const face = mat({ color: 0xb9b9b9, metalness: 0, roughness: 0.75 });
  const faceLining = mat({ color: 0x7d7b78, metalness: 0, roughness: 0.8 });
  const springMat = mat({ color: 0x8a8d92, metalness: 1, roughness: 0.3 });
  const bright = mat({ color: 0xc9cbcf, metalness: 1, roughness: 0.18 });
  const brightSpin = mat({ color: 0xc9cbcf, metalness: 1, roughness: 0.2 }, { spin: true });
  const coreMat = mat({ color: 0x1b1b1c, metalness: 0, roughness: 0.9 });
  const coreFace = mat({ color: 0xffffff, metalness: 0, roughness: 0.85 }, { packed: true });

  const add = (g: THREE.BufferGeometry, m: THREE.Material, cast = true) => {
    const mesh = new THREE.Mesh(keep(g), m);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  const addCut = (sec: Section, segs: number, body: THREE.Material, faces: THREE.Material) => {
    add(revolve(sec, segs), body);
    add(cutFace(sec, PHI0, -1), faces, false);
    add(cutFace(sec, PHI0 + PHIL, 1), faces, false);
  };

  // the tub, its lining, the mass of media; spring seat; pedestal (top flange, drum, foot)
  addCut(tubSection(), 160, steel, face);
  addCut(liningSection(), 160, lining, faceLining);
  addCut(coreSection(), 120, coreMat, coreFace);
  addCut(ring(0.3, 0.6, -0.085, -0.06), 120, steelDark, face);
  addCut(ring(0.28, 0.6, -0.36, -0.335), 120, steelDark, face);
  addCut(ring(0.47, 0.485, -0.66, -0.36), 120, steelDark, face);
  addCut(ring(0.47, 0.56, -0.68, -0.66), 120, steelDark, face);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  const inWedge = (a: number, pad: number) => Math.abs(Math.atan2(Math.sin(a - CUT.c), Math.cos(a - CUT.c))) < CUT.half + pad;
  const instanced = (g: THREE.BufferGeometry, m: THREE.Material, place: (i: number) => THREE.Matrix4 | null, n: number) => {
    const im = new THREE.InstancedMesh(keep(g), m, n);
    let k = 0;
    for (let i = 0; i < n; i++) {
      const x = place(i);
      if (x) im.setMatrixAt(k++, x);
    }
    im.count = k;
    im.castShadow = im.receiveShadow = true;
    scene.add(im);
    return im;
  };

  // bolts on the rim
  instanced(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 6), bright, (i) => {
    const a = (i / 48) * Math.PI * 2;
    return inWedge(a, 0.03) ? null : m4.makeTranslation(0.69 * Math.cos(a), TOP + 0.005, 0.69 * Math.sin(a));
  }, 48);
  // coil springs between the seat and the pedestal
  instanced(new THREE.TubeGeometry(new Helix(0.045, 0.25, 6), 160, 0.0085, 8, false), springMat, (i) => {
    const a = (i / 16) * Math.PI * 2 + 0.1;
    return m4.makeTranslation(0.5 * Math.cos(a), -0.085, 0.5 * Math.sin(a));
  }, 16);
  // the motor in the column: body with radial fins, flanges, shaft
  add(new THREE.CylinderGeometry(0.085, 0.085, 0.2, 48), steelDark).position.set(0, 0.31, 0);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 48), steel).position.set(0, 0.215, 0);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 48), steel).position.set(0, 0.41, 0);
  add(new THREE.CylinderGeometry(0.014, 0.014, 0.66, 16), bright).position.set(0, 0.13, 0);
  instanced(new THREE.BoxGeometry(0.03, 0.17, 0.004), steel, (i) => {
    const a = (i / 40) * Math.PI * 2;
    q.setFromAxisAngle(v.set(0, 1, 0), -a);
    return m4.compose(new THREE.Vector3(0.1 * Math.cos(a), 0.31, 0.1 * Math.sin(a)), q, one);
  }, 40);
  // the eccentric masses: half discs, under the cap and under the tub
  for (const y of [0.45, -0.17]) {
    const sh = new THREE.Shape();
    sh.absarc(0, 0, 0.13, -Math.PI / 2, Math.PI / 2, false);
    sh.lineTo(0, 0.02);
    sh.absarc(0, 0, 0.02, Math.PI / 2, -Math.PI / 2, true);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.035, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 1, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, y - 0.017, 0);
    add(g, brightSpin);
  }

  // media: three preform shapes, placed on the GPU
  const chipMeshes: THREE.InstancedMesh[] = [];
  {
    let seed = 1234567;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const shares = [0.6, 0.22, 0.18], tones = [0x9c9a97, 0x8a8886, 0xb0aeab];
    chipGeometries().forEach((g, gi) => {
      const n = Math.round(opts.chips * shares[gi]);
      const flow = new Float32Array(n * 4), spin = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
        // most chips ride the outer layers of the section, where they can be seen
        const s = rnd() < 0.55 ? 0.8 + rnd() * 0.2 : Math.sqrt(rnd()) * 0.8;
        flow.set([rnd() * Math.PI * 2, rnd() * Math.PI * 2, s, 0.85 + rnd() * 0.3], i * 4);
        const ax = v.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
        spin.set([ax.x, ax.y, ax.z, (0.4 + rnd() * 0.9) * (rnd() < 0.5 ? -1 : 1)], i * 4);
      }
      keep(g);
      g.setAttribute('aFlow', new THREE.InstancedBufferAttribute(flow, 4));
      g.setAttribute('aSpin', new THREE.InstancedBufferAttribute(spin, 4));
      const im = new THREE.InstancedMesh(g, mat({ color: tones[gi], metalness: 0, roughness: 0.68 }, { flow: true }), n);
      im.frustumCulled = false;
      im.receiveShadow = true;
      scene.add(im);
      chipMeshes.push(im);
    });
  }

  // the parts being finished: polished gears riding the flow, tumbling (placed on the CPU)
  const gears = (() => {
    const n = opts.gears;
    const im = new THREE.InstancedMesh(keep(gearGeometry()), bright, n);
    im.receiveShadow = true;
    im.frustumCulled = false;
    scene.add(im);
    let seed = 98765;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const parts = Array.from({ length: n }, () => ({
      th0: rnd() * Math.PI * 2, ph0: rnd() * Math.PI * 2, s: 0.86 + rnd() * 0.12, sp: 0.9 + rnd() * 0.2,
      ax: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), rate: 0.4 + rnd() * 0.6,
    }));
    const p = new THREE.Vector3(), sc = new THREE.Vector3();
    return (t: number, intro: number) => {
      parts.forEach((g, i) => {
        const f = g.ph0 + t * ROLL * g.sp * (1.25 - 0.45 * g.s), th = g.th0 + t * PRECESS * g.sp;
        const dx = Math.cos(f), dy = Math.sin(f), e = edgeDistJS(dx, dy) * g.s, rho = C0[0] + dx * e;
        p.set(rho * Math.cos(th), C0[1] + dy * e, rho * Math.sin(th));
        const dth = Math.abs(Math.atan2(Math.sin(th - CUT.c), Math.cos(th - CUT.c)));
        const k = THREE.MathUtils.smoothstep(dth, CUT.half + 0.02, CUT.half + 0.1) * THREE.MathUtils.smoothstep(intro, 0.85, 1);
        q.setFromAxisAngle(g.ax, g.rate * t + g.ph0);
        im.setMatrixAt(i, m4.compose(p, q, sc.setScalar(k)));
      });
      im.instanceMatrix.needsUpdate = true;
    };
  })();

  // lights: a key with soft shadows from the upper left, a rim from behind for the edges
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-0.6, 3.6, 2.8);
  key.castShadow = opts.shadows;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: 0.5, far: 8 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.01;
  key.shadow.radius = 3;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 3.2);
  rim.position.set(2.6, 1.6, -2.8);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 30);
  const camFor = (aspect: number): Cam => {
    const k = THREE.MathUtils.clamp((aspect - 0.6) / (1.3 - 0.6), 0, 1);
    return Object.fromEntries(Object.keys(LANDSCAPE).map((n) => [n, THREE.MathUtils.lerp(PORTRAIT[n as keyof Cam], LANDSCAPE[n as keyof Cam], k)])) as Cam;
  };
  const size = new THREE.Vector2();

  function draw(t: number, maxDpr = 2, intro = 1) {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    if (renderer.getPixelRatio() !== dpr) renderer.setPixelRatio(dpr);
    renderer.getSize(size);
    if (size.x !== w || size.y !== h) renderer.setSize(w, h, false);

    const c = camFor(w / h);
    const az = THREE.MathUtils.degToRad(c.az + ORBIT * Math.sin(t * 0.04));
    const el = THREE.MathUtils.degToRad(c.el + 1.5 * Math.sin(t * 0.031));
    camera.fov = c.fov;
    camera.aspect = w / h;
    camera.position.set(c.dist * Math.cos(el) * Math.cos(az), c.ty + c.dist * Math.sin(el), c.dist * Math.cos(el) * Math.sin(az));
    camera.lookAt(0, c.ty, 0);
    camera.setViewOffset(w, h, (-c.sx * w) / 2, (c.sy * h) / 2, w, h); // lens shift: place the machine without changing its perspective
    camera.updateProjectionMatrix();

    uni.uTime.value = t;
    uni.uIntro.value = intro;
    gears(t, intro);
    renderer.render(scene, camera);
  }

  function dispose() {
    own.forEach((o) => o.dispose());
    chipMeshes.forEach((m) => m.dispose());
    renderer.dispose();
  }

  return { draw, dispose };
}
