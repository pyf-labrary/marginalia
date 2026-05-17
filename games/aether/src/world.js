// Procedural world: floating islands, crystal spires, monoliths, starlight motes.

import * as THREE from 'three';
import { CrystalShader, GlowShader } from './shaders.js';

// Deterministic-ish RNG
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const PALETTE = {
  islandBase:  new THREE.Color('#3a2a55'),
  islandRim:   new THREE.Color('#9b6cff'),
  revive:      new THREE.Color('#7df9ff'),
  crystalA:    new THREE.Color('#b48aff'),
  crystalB:    new THREE.Color('#5b3e9e'),
  monolithA:   new THREE.Color('#1b1230'),
  monolithB:   new THREE.Color('#3a2562'),
  spirit:      new THREE.Color('#ffb060'),
  mote:        new THREE.Color('#ffd58a'),
};

export function buildWorld(scene, seed = 1337) {
  const rng = mulberry32(seed);
  const group = new THREE.Group();
  scene.add(group);

  const islands = [];
  const monoliths = [];
  const motes = [];

  // ── ISLANDS ──────────────────────────────────────────────────────────────
  // Scatter ~32 islands in a torus-shell distribution around origin so the
  // player has clear navigation lanes between them.
  const islandCount = 34;
  for (let i = 0; i < islandCount; i++) {
    const ang = rng() * Math.PI * 2;
    const radius = 50 + rng() * 180;
    const yJitter = (rng() - 0.5) * 90;
    const pos = new THREE.Vector3(Math.cos(ang) * radius, yJitter, Math.sin(ang) * radius);

    const size = 6 + rng() * 14;
    const island = makeIsland(size, rng);
    island.position.copy(pos);
    island.userData.baseY = pos.y;
    island.userData.bobPhase = rng() * Math.PI * 2;
    island.userData.bobAmp = 0.3 + rng() * 0.6;
    group.add(island);
    islands.push(island);
  }

  // ── MONOLITHS ────────────────────────────────────────────────────────────
  // Pick 8 islands far apart, plant a monolith on each.
  const candidates = islands.slice().sort((a, b) => a.position.length() - b.position.length());
  const monoIslands = [];
  for (const cand of candidates) {
    if (monoIslands.length >= 8) break;
    let ok = true;
    for (const m of monoIslands) {
      if (m.position.distanceTo(cand.position) < 55) { ok = false; break; }
    }
    if (ok) monoIslands.push(cand);
  }
  for (const isl of monoIslands) {
    const m = makeMonolith(rng);
    m.position.copy(isl.position);
    m.position.y += isl.userData.topY + 0.5;
    m.userData.baseY = m.position.y;
    m.userData.islandRef = isl;
    group.add(m);
    monoliths.push(m);
  }

  // ── STARLIGHT MOTES ──────────────────────────────────────────────────────
  // Drifting collectible motes scattered between islands.
  const moteCount = 220;
  for (let i = 0; i < moteCount; i++) {
    const ang = rng() * Math.PI * 2;
    const r = 40 + rng() * 200;
    const y = (rng() - 0.5) * 110;
    const m = makeMote();
    m.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
    m.userData.bobPhase = rng() * Math.PI * 2;
    m.userData.bobAmp = 0.4 + rng() * 0.6;
    m.userData.driftAxis = new THREE.Vector3(rng()-.5, rng()-.5, rng()-.5).normalize();
    m.userData.collected = false;
    group.add(m);
    motes.push(m);
  }

  // ── DUST PARTICLES ───────────────────────────────────────────────────────
  // Ambient floating dust to give scale.
  const dust = makeDust(2200, rng);
  group.add(dust);

  return { group, islands, monoliths, motes, dust };
}

// ───────────────────────────────────────────────────────────────────────────

function makeIsland(size, rng) {
  const g = new THREE.Group();

  // Bottom: distorted icosahedron, tapered downward into a tail.
  const baseGeo = new THREE.IcosahedronGeometry(size, 2);
  const pos = baseGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const n = (Math.sin(x*0.5) + Math.cos(z*0.6) + Math.sin(y*0.4)) * 0.18;
    const taper = y < 0 ? (1 + y/size * 1.4) : 1;
    pos.setXYZ(i,
      x * (1 + n) * Math.max(taper, 0.1),
      y * (y < 0 ? 1.6 : 1) + n * size * 0.4,
      z * (1 + n) * Math.max(taper, 0.1)
    );
  }
  baseGeo.computeVertexNormals();

  const baseMat = new THREE.ShaderMaterial({
    uniforms: {
      baseColor:    { value: PALETTE.islandBase.clone() },
      rimColor:     { value: PALETTE.islandRim.clone() },
      rimPower:     { value: 2.4 },
      revive:       { value: 0 },
      reviveColor:  { value: PALETTE.revive.clone() },
    },
    vertexShader: CrystalShader.vertexShader,
    fragmentShader: CrystalShader.fragmentShader,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  g.add(base);
  g.userData.baseMat = baseMat;

  // Find top y for placing crystals/monolith
  let topY = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > topY) topY = y;
  }
  g.userData.topY = topY;

  // Add 1-4 crystal spires on top.
  const spires = 1 + Math.floor(rng() * 4);
  for (let s = 0; s < spires; s++) {
    const h = size * (0.5 + rng() * 1.2);
    const w = size * (0.08 + rng() * 0.14);
    const cg = new THREE.ConeGeometry(w, h, 5 + Math.floor(rng()*3), 1);
    const cm = new THREE.MeshStandardMaterial({
      color: PALETTE.crystalA.clone().lerp(PALETTE.crystalB, rng()),
      emissive: PALETTE.crystalA.clone().multiplyScalar(0.05),
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
      flatShading: true,
    });
    const c = new THREE.Mesh(cg, cm);
    const ang = rng() * Math.PI * 2;
    const r = size * 0.35 * rng();
    c.position.set(Math.cos(ang) * r, topY + h/2 - size * 0.15, Math.sin(ang) * r);
    c.rotation.set((rng()-.5)*0.3, rng()*Math.PI*2, (rng()-.5)*0.3);
    g.add(c);
  }

  return g;
}

function makeMonolith(rng) {
  const g = new THREE.Group();

  const h = 14 + rng() * 6;
  const w = 1.6;
  const shape = new THREE.Shape();
  // Tapered rectangle profile
  shape.moveTo(-w, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w * 0.55, h);
  shape.lineTo(-w * 0.55, h);
  shape.closePath();
  const ext = new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 2 });
  ext.translate(0, 0, -0.6);

  const mat = new THREE.MeshStandardMaterial({
    color: PALETTE.monolithA,
    emissive: PALETTE.monolithB,
    emissiveIntensity: 0.05,
    roughness: 0.5,
    metalness: 0.3,
    flatShading: true,
  });
  const m = new THREE.Mesh(ext, mat);
  m.rotation.y = rng() * Math.PI * 2;
  g.add(m);
  g.userData.mat = mat;
  g.userData.height = h;

  // Inner glyph plane — a quad with shader glow that lights up on revive.
  const glyphGeo = new THREE.PlaneGeometry(w * 0.7, h * 0.55);
  const glyphMat = new THREE.ShaderMaterial({
    uniforms: {
      color:     { value: PALETTE.revive.clone() },
      intensity: { value: 0 },
      softness:  { value: 2.6 },
    },
    vertexShader: GlowShader.vertexShader,
    fragmentShader: GlowShader.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glyph = new THREE.Mesh(glyphGeo, glyphMat);
  glyph.position.set(0, h * 0.55, 0.62);
  g.add(glyph);
  // mirror on back
  const glyph2 = glyph.clone();
  glyph2.position.z = -0.62;
  glyph2.rotation.y = Math.PI;
  // share material reference — both update together via uniforms
  glyph2.material = glyphMat;
  g.add(glyph2);
  g.userData.glyphMat = glyphMat;

  // Upward beam — faint violet always-on (so player can spot from afar),
  // brightens to bright cyan when revived.
  const beamGeo = new THREE.CylinderGeometry(0.4, 1.8, 220, 12, 1, true);
  beamGeo.translate(0, 110, 0);
  const beamMat = new THREE.ShaderMaterial({
    uniforms: {
      colorIdle:  { value: new THREE.Color('#7a5cc4') },
      colorActive:{ value: PALETTE.revive.clone() },
      idleIntensity: { value: 0.22 },
      intensity:  { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      varying vec2 vUv;
      uniform vec3 colorIdle;
      uniform vec3 colorActive;
      uniform float idleIntensity;
      uniform float intensity;
      void main(){
        // Fade from base to tip
        float vertical = smoothstep(0.0, 1.0, 1.0 - vUv.y);
        // mix idle/active
        vec3 c = mix(colorIdle * idleIntensity, colorActive * 1.5, intensity);
        float a = vertical * (idleIntensity * 0.55 + intensity * 0.7);
        gl_FragColor = vec4(c * vertical, a);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = h;
  g.add(beam);
  g.userData.beamMat = beamMat;

  // State
  g.userData.revived = false;
  g.userData.reviveProgress = 0;

  return g;
}

function makeMote() {
  const g = new THREE.Group();

  // Bright tiny core
  const coreGeo = new THREE.IcosahedronGeometry(0.18, 0);
  const coreMat = new THREE.MeshBasicMaterial({ color: PALETTE.mote });
  const core = new THREE.Mesh(coreGeo, coreMat);
  g.add(core);

  // Halo sprite (billboarded plane)
  const haloGeo = new THREE.PlaneGeometry(1.4, 1.4);
  const haloMat = new THREE.ShaderMaterial({
    uniforms: {
      color:     { value: PALETTE.mote.clone() },
      intensity: { value: 1.4 },
      softness:  { value: 2.8 },
    },
    vertexShader: GlowShader.vertexShader,
    fragmentShader: GlowShader.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  g.add(halo);
  g.userData.halo = halo;
  g.userData.haloMat = haloMat;
  g.userData.core = core;

  return g;
}

function makeDust(count, rng) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const ang = rng() * Math.PI * 2;
    const r = 30 + rng() * 240;
    const y = (rng() - 0.5) * 160;
    positions[i*3]   = Math.cos(ang) * r;
    positions[i*3+1] = y;
    positions[i*3+2] = Math.sin(ang) * r;
    // soft warm or cool dust
    const warm = rng() > 0.55;
    if (warm) { colors[i*3] = 1.0; colors[i*3+1] = 0.82; colors[i*3+2] = 0.62; }
    else      { colors[i*3] = 0.7; colors[i*3+1] = 0.78; colors[i*3+2] = 1.0;  }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.5,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

export { PALETTE };
