// ─────────────────────────────────────────────────────────────
//  墨線 INKLINE — 一笔画出的竞速
//  sketch → bloom → papercut, 三境轮转
// ─────────────────────────────────────────────────────────────
import * as THREE from '../lib/three.module.js';

// ── constants ────────────────────────────────────────────────
const PAPER = 0xf2ecdf;
const INK   = 0x21201c;
const UP    = new THREE.Vector3(0, 1, 0);

const PALETTES = [
  { // 第一章 · 青绿山水
    name: '青绿山水', sky: 0xd8e9e0, inkTint: 0x2c4a44,
    road: 0x9db8a6, dash: 0xf2ecdf, gate: 0xc84b31,
    tree: 0x3f7d63, tree2: 0x5b8a72, mountain: 0x86a895, cloud: 0xfdfaf1,
    drop: 0x2f6f6b, car: 0xc84b31, sun: 0xc84b31,
  },
  { // 第二章 · 绛紫暮色
    name: '绛紫暮色', sky: 0xf0d3ab, inkTint: 0x4a3550,
    road: 0xc7a17e, dash: 0xf6ead0, gate: 0x3d4a78,
    tree: 0x8d4a63, tree2: 0xb06c50, mountain: 0x9a7a8e, cloud: 0xfbe8c8,
    drop: 0x8d4a63, car: 0x3d4a78, sun: 0xd97f4e,
  },
  { // 第三章 · 靛蓝夜行
    name: '靛蓝夜行', sky: 0xb9c6d6, inkTint: 0x2c3a55,
    road: 0x8a9bb0, dash: 0xf0f2ec, gate: 0xd9a441,
    tree: 0x3d5a78, tree2: 0x52739c, mountain: 0x70839c, cloud: 0xeef2f5,
    drop: 0x3d5a78, car: 0xd9a441, sun: 0xe8c87a,
  },
  { // 第四章 · 雪青寒林
    name: '雪青寒林', sky: 0xdfe3ee, inkTint: 0x44506e,
    road: 0xb8c0d4, dash: 0xf6f7f2, gate: 0x8a79c9,
    tree: 0x9aa8c8, tree2: 0xc3cde0, mountain: 0xaab6cf, cloud: 0xffffff,
    drop: 0x6d7fb5, car: 0x8a79c9, sun: 0xd8e0f5,   // 冷月
  },
  { // 第五章 · 赤霞流金
    name: '赤霞流金', sky: 0xefb27a, inkTint: 0x6e3226,
    road: 0xd9a06b, dash: 0xfbeed2, gate: 0xd9a441,
    tree: 0xb4452f, tree2: 0xd97f4e, mountain: 0xc77b54, cloud: 0xfbe3c0,
    drop: 0xc84b31, car: 0xd9a441, sun: 0xe04e2f,   // 烈日
  },
  { // 第六章 · 墨荷新雨
    name: '墨荷新雨', sky: 0xcfe6e4, inkTint: 0x2e4a3c,
    road: 0xa8c0b4, dash: 0xf4f7ee, gate: 0xd58a9f,
    tree: 0x4a8a6a, tree2: 0x7ab08a, mountain: 0x7fa8a0, cloud: 0xf6fbf4,
    drop: 0x4a8a78, car: 0xd58a9f, sun: 0xf0d8a8,
  },
];
const CHAPTER_NUM = ['一','二','三','四','五','六','七','八','九'];

const ROAD_W       = 14;     // full width
const LANE_LIMIT   = 5.4;
const MAX_HP       = 3;
const SEG_LEN      = 55;     // metres per control segment
const SAMPLES_SEG  = 22;
const GEN_AHEAD    = 470;
const PRUNE_BEHIND = 130;

const BLOOM_DIST = 620;      // metres of bloom before papercut queues
const FLAT_DIST  = 620;      // metres of papercut before next chapter queues

// ── tiny tween engine (runs on real time) ───────────────────
const tweens = [];
function tween(o) { tweens.push(Object.assign({ t: -(o.delay || 0), dur: 0.5 }, o)); }
function stepTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    tw.t += dt;
    if (tw.t < 0) continue;
    const k = Math.min(tw.t / tw.dur, 1);
    tw.update(tw.ease ? tw.ease(k) : k);
    if (k >= 1) { tweens.splice(i, 1); tw.done && tw.done(); }
  }
}
const easeOut  = k => 1 - Math.pow(1 - k, 3);
const easeInOut = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const smooth   = k => k * k * (3 - 2 * k);

// ── audio ────────────────────────────────────────────────────
const AudioEngine = {
  ctx: null, master: null, musicGains: {}, buffers: {}, muted: false,
  engineOsc: null, engineGain: null, engineFilter: null,

  async init() {
    if (this.ctx) return;
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 22; comp.ratio.value = 5;
    comp.connect(ctx.destination);
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    this.master.connect(comp);
    this.bus = comp;
    this.startEngineHum();
    this.loadMusic(); // async, fire and forget
  },

  async loadMusic() {
    const names = ['sketch', 'bloom', 'flat'];
    await Promise.all(names.map(async n => {
      try {
        const res = await fetch(`audio/${n}.mp3`);
        if (!res.ok) return;
        this.buffers[n] = await this.ctx.decodeAudioData(await res.arrayBuffer());
      } catch (e) { /* offline / missing: synth-only */ }
    }));
    for (const n of names) {
      if (!this.buffers[n]) continue;
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[n]; src.loop = true;
      const g = this.ctx.createGain(); g.gain.value = 0;
      src.connect(g); g.connect(this.master);
      src.start();
      this.musicGains[n] = g;
    }
    this.setPhaseMusic('sketch');
  },

  setPhaseMusic(name) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const [n, g] of Object.entries(this.musicGains)) {
      g.gain.cancelScheduledValues(t);
      g.gain.setTargetAtTime(n === name ? 0.62 : 0, t, 1.4);
    }
  },

  startEngineHum() {
    const ctx = this.ctx;
    const osc1 = ctx.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.value = 52;
    const osc2 = ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.value = 52.8;
    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 320; filt.Q.value = 1.4;
    const g = ctx.createGain(); g.gain.value = 0;
    osc1.connect(filt); osc2.connect(filt); filt.connect(g); g.connect(this.master);
    osc1.start(); osc2.start();
    this.engineOsc = [osc1, osc2]; this.engineGain = g; this.engineFilter = filt;
  },

  setEngine(speed, boost) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const f = 40 + speed * 1.6 + (boost ? 22 : 0);
    this.engineOsc[0].frequency.setTargetAtTime(f, t, 0.12);
    this.engineOsc[1].frequency.setTargetAtTime(f * 1.012, t, 0.12);
    this.engineFilter.frequency.setTargetAtTime(260 + speed * 22, t, 0.15);
    this.engineGain.gain.setTargetAtTime(speed > 1 ? 0.028 + speed * 0.0009 : 0, t, 0.2);
  },

  blip(freq, dur = 0.18, type = 'triangle', vol = 0.22) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  },

  chime(n = 0) { // ascending pentatonic for combos
    const penta = [523.25, 587.33, 659.25, 783.99, 880.0];
    const f = penta[n % 5] * Math.pow(2, Math.floor(n / 5));
    this.blip(f, 0.5, 'sine', 0.2);
    this.blip(f * 2, 0.25, 'sine', 0.07);
  },

  pickup() { this.blip(1244, 0.14, 'sine', 0.16); this.blip(1864, 0.2, 'sine', 0.08); },
  heal() { this.blip(659.25, 0.16, 'sine', 0.2); this.blip(987.77, 0.22, 'sine', 0.14); this.blip(1318.5, 0.34, 'sine', 0.1); },
  power(kind) {
    if (kind === 'speed') {                       // zippy upward sweep
      this.blip(523, 0.1, 'sawtooth', 0.13); this.blip(1046, 0.16, 'sawtooth', 0.1);
      this.noiseBurst(0.3, 1800, 0.18, 'bandpass');
    } else if (kind === 'shield') {               // bright protective chord
      this.blip(392, 0.55, 'sine', 0.15); this.blip(587.33, 0.55, 'sine', 0.1); this.blip(784, 0.55, 'sine', 0.07);
    } else if (kind === 'magnet') {               // wobbly pull
      this.blip(440, 0.16, 'triangle', 0.15); this.blip(660, 0.22, 'triangle', 0.1); this.blip(880, 0.3, 'triangle', 0.06);
    } else this.pickup();
  },

  noiseBurst(dur, freq, vol = 0.5, type = 'lowpass') {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = type; filt.frequency.value = freq;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(filt); filt.connect(g); g.connect(this.master);
    src.start();
  },

  splat() { this.noiseBurst(0.4, 420, 0.6); this.blip(90, 0.3, 'square', 0.18); },
  whoosh() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 1.4);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.Q.value = 2.2;
    filt.frequency.setValueAtTime(180, t);
    filt.frequency.exponentialRampToValueAtTime(2400, t + 0.8);
    filt.frequency.exponentialRampToValueAtTime(300, t + 1.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    src.connect(filt); filt.connect(g); g.connect(this.master);
    src.start();
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.1);
    return this.muted;
  },
};

// ── track: procedurally extended catmull-rom spline ──────────
function catmull(p0, p1, p2, p3, t, out) {
  const t2 = t * t, t3 = t2 * t;
  out.set(
    0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
  );
  return out;
}

class Track {
  constructor(onSlice) {
    this.ctrl = [];
    this.samples = [];        // {p, t, r, len}
    this.heading = 0;
    this.curv = 0;
    this.idx = 0;
    this.totalLen = 0;
    this.onSlice = onSlice;
    // seed straight points so the spline has context
    for (let i = 0; i < 4; i++) this.addCtrl(true);
  }

  addCtrl(straight = false) {
    const i = this.idx++;
    if (!straight) {
      // smoothed wandering curvature
      this.curv += (Math.random() - 0.5) * 0.34;
      this.curv *= 0.82;
      this.curv = THREE.MathUtils.clamp(this.curv, -0.46, 0.46);
      this.heading += this.curv;
    }
    const y = 3.2 * Math.sin(i * 0.23) + 2.2 * Math.sin(i * 0.41 + 1.7);
    const prev = this.ctrl.length ? this.ctrl[this.ctrl.length - 1] : new THREE.Vector3(0, 0, -SEG_LEN);
    const p = new THREE.Vector3(
      prev.x + Math.sin(this.heading) * SEG_LEN,
      y,
      prev.z + Math.cos(this.heading) * SEG_LEN,
    );
    this.ctrl.push(p);
    const n = this.ctrl.length;
    if (n >= 4) this.sampleSegment(n - 4); // segment between ctrl[n-3] and ctrl[n-2]
  }

  sampleSegment(i0) {
    const [a, b, c, d] = [this.ctrl[i0], this.ctrl[i0 + 1], this.ctrl[i0 + 2], this.ctrl[i0 + 3]];
    const slice = [];
    if (this.samples.length) slice.push(this.samples[this.samples.length - 1]); // stitch chunks seamlessly
    const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
    for (let j = (this.samples.length ? 1 : 0); j <= SAMPLES_SEG; j++) {
      const t = j / SAMPLES_SEG;
      const p = catmull(a, b, c, d, t, new THREE.Vector3());
      catmull(a, b, c, d, Math.min(t + 0.01, 1), tmp);
      catmull(a, b, c, d, Math.max(t - 0.01, 0), tmp2);
      const tan = tmp.sub(tmp2).normalize();
      const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
      const prev = this.samples[this.samples.length - 1];
      const len = prev ? prev.len + p.distanceTo(prev.p) : 0;
      const s = { p, t: tan.clone(), r: right, len };
      this.samples.push(s);
      slice.push(s);
    }
    this.totalLen = this.samples[this.samples.length - 1].len;
    if (slice.length > 1) this.onSlice(slice, i0);
  }

  ensure(s) { while (this.totalLen < s + GEN_AHEAD) this.addCtrl(); }

  // binary search samples by arc length
  pose(s, outP, outT, outR) {
    const arr = this.samples;
    let lo = 0, hi = arr.length - 1;
    s = THREE.MathUtils.clamp(s, 0, this.totalLen - 0.001);
    while (lo < hi) { const mid = (lo + hi) >> 1; (arr[mid].len < s) ? lo = mid + 1 : hi = mid; }
    const b = arr[Math.max(lo, 1)], a = arr[Math.max(lo, 1) - 1];
    const k = (s - a.len) / Math.max(b.len - a.len, 1e-6);
    outP.lerpVectors(a.p, b.p, k);
    outT.lerpVectors(a.t, b.t, k).normalize();
    outR.lerpVectors(a.r, b.r, k).normalize();
  }
}

// ── game ─────────────────────────────────────────────────────
const G = {
  scene: null, camera: null, renderer: null,
  track: null, chunks: [], paintables: [],
  gates: [], drops: [], rocks: [], powers: [], gateHead: 0, dropHead: 0, rockHead: 0, powerHead: 0,
  car: null, carParts: null, aura: null,
  s: 0, x: 0, xv: 0, speed: 0, baseSpeed: 24, boost01: 0, streaks: [],
  hp: 3, invuln: 0, combo: 0, maxCombo: 0, dropsGot: 0,
  surgeT: 0, surge01: 0, shieldT: 0, magnetT: 0, boonsGot: 0,
  meter: 0, chapter: 0, phase: 'sketch', pending: null,
  phaseStartS: 0, flat01: 0, color01: 0,
  wave: null, drain: false,
  shake: 0, timeScale: 1, running: false, over: false, paused: false,
  inkMat: null, dashMat: null, sun: null,
  paletteIdx: 0,
};

// ── power-ups (boons) — colour-coded ink tokens ──────────────
const POWER = {
  heal:   { color: 0xc84b31, glyph: '朱', name: '回 血', emblem: 'plus'  },
  speed:  { color: 0x7b52c9, glyph: '疾', name: '疾 行', emblem: 'cone'  },  // 紫 — 与金身金色区分
  shield: { color: 0xe8c87a, glyph: '金', name: '金 身', emblem: 'halo'  },
  magnet: { color: 0x2f6f6b, glyph: '吸', name: '墨 引', emblem: 'poles' },
};
const SURGE_DUR  = 4.5;
const SHIELD_DUR = 5.5;
const MAGNET_DUR = 6.5;
const PAL = () => PALETTES[G.paletteIdx % PALETTES.length];

// shared geometries
const GEO = {};
function buildGeos() {
  GEO.trunk = new THREE.CylinderGeometry(0.16, 0.24, 1.6, 5);
  GEO.pine1 = new THREE.ConeGeometry(1.5, 2.6, 6);
  GEO.pine2 = new THREE.ConeGeometry(1.0, 1.9, 6);
  GEO.blob  = new THREE.IcosahedronGeometry(1.5, 0);
  GEO.rock  = new THREE.IcosahedronGeometry(1, 0);
  GEO.post  = new THREE.CylinderGeometry(0.22, 0.28, 5.4, 6);
  GEO.beam  = new THREE.BoxGeometry(14.4, 0.5, 0.6);
  GEO.beam2 = new THREE.BoxGeometry(12.4, 0.34, 0.5);
  GEO.drop  = new THREE.IcosahedronGeometry(0.45, 0);
  GEO.cloudPuff = new THREE.SphereGeometry(1, 7, 5);
  GEO.ring  = new THREE.RingGeometry(0.6, 0.72, 28);
  // power-up token bits
  GEO.pCore  = new THREE.IcosahedronGeometry(0.52, 0);
  GEO.pArm   = new THREE.BoxGeometry(1.04, 0.26, 0.26);   // plus arm (heal)
  GEO.pCone  = new THREE.ConeGeometry(0.42, 0.95, 5);     // arrowhead (speed)
  GEO.pBar   = new THREE.BoxGeometry(0.26, 0.92, 0.26);   // magnet pole
  GEO.pHalo  = new THREE.TorusGeometry(0.78, 0.1, 7, 26); // shield ring
  for (const k of Object.keys(GEO)) GEO[k + 'E'] = new THREE.EdgesGeometry(GEO[k], 18);
  GEO.cloudPuffE = new THREE.EdgesGeometry(GEO.cloudPuff, 38); // clouds: silhouette only
  // mountains get per-instance random size, so build a few variants
  GEO.mountains = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.ConeGeometry(26 + i * 9, 20 + i * 8, 5);
    GEO.mountains.push({ solid: g, edge: new THREE.EdgesGeometry(g, 18) });
  }
}

// a paintable = one visual object that can soak with colour
function makePaintable(group, pos, mats, opts = {}) {
  const p = { pos, mats, painted: false, max: opts.max ?? 0.95, group, flatten: opts.flatten !== false };
  G.paintables.push(p);
  if (G.color01 > 0.5 && !G.drain) paint(p, true); // born into a coloured world
  if (G.flat01 > 0.5 && p.flatten && group) group.scale.y = 0.12;
  return p;
}
function paint(p, instant = false) {
  if (p.painted) return; p.painted = true;
  if (instant) { p.mats.forEach(m => m.opacity = p.max); return; }
  const from = p.mats.map(m => m.opacity);
  tween({ dur: 0.45 + Math.random() * 0.45, ease: easeOut,
    update: k => p.mats.forEach((m, i) => m.opacity = THREE.MathUtils.lerp(from[i], p.max, k)) });
}
function unpaint(p) {
  if (!p.painted) return; p.painted = false;
  const from = p.mats.map(m => m.opacity);
  tween({ dur: 0.5 + Math.random() * 0.4,
    update: k => p.mats.forEach((m, i) => m.opacity = THREE.MathUtils.lerp(from[i], 0, k)) });
}

function solidMat(color, opacity = 0) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, fog: true });
}
function inkLines(geoE, mat) { return new THREE.LineSegments(geoE, mat || G.inkMat); }

// generic sketched object: edges always, solid soaks in
function sketchMesh(geoSolid, geoEdge, color, opts = {}) {
  const grp = new THREE.Group();
  const mat = solidMat(color);
  const mesh = new THREE.Mesh(geoSolid, mat);
  grp.add(mesh, inkLines(geoEdge));
  grp.userData.mats = [mat];
  return grp;
}

// ── world building per track slice ──────────────────────────
function onSlice(slice, segIndex) {
  const group = new THREE.Group();
  const chunk = { group, until: slice[slice.length - 1].len, paint: [], dispose: [] };

  buildRoad(slice, group, chunk);
  if (segIndex > 1) populate(slice, segIndex, group, chunk);

  G.scene.add(group);
  G.chunks.push(chunk);
}

function buildRoad(slice, group, chunk) {
  const n = slice.length;
  const posSolid = new Float32Array(n * 2 * 3);
  const edgeL = [], edgeR = [], dashes = [], ticks = [];
  for (let i = 0; i < n; i++) {
    const { p, r } = slice[i];
    const lx = p.x - r.x * ROAD_W / 2, lz = p.z - r.z * ROAD_W / 2;
    const rx = p.x + r.x * ROAD_W / 2, rz = p.z + r.z * ROAD_W / 2;
    posSolid.set([lx, p.y, lz, rx, p.y, rz], i * 6);
    edgeL.push(lx, p.y + 0.02, lz); edgeR.push(rx, p.y + 0.02, rz);
    if (i % 3 === 1) { // centre dashes
      const q = slice[i], q2 = slice[Math.min(i + 1, n - 1)];
      dashes.push(q.p.x, q.p.y + 0.02, q.p.z, q2.p.x, q2.p.y + 0.02, q2.p.z);
    }
    if (i % 5 === 2) { // hatch ticks outside edges — pen texture
      ticks.push(rx, p.y + 0.02, rz, rx + r.x * 0.9, p.y + 0.02, rz + r.z * 0.9);
      ticks.push(lx, p.y + 0.02, lz, lx - r.x * 0.9, p.y + 0.02, lz - r.z * 0.9);
    }
  }
  // solid ribbon
  const idx = [];
  for (let i = 0; i < n - 1; i++) {
    const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
    idx.push(a, b, c, b, d, c);
  }
  const gSolid = new THREE.BufferGeometry();
  gSolid.setAttribute('position', new THREE.BufferAttribute(posSolid, 3));
  gSolid.setIndex(idx);
  const mat = solidMat(PAL().road, 0);
  const ribbon = new THREE.Mesh(gSolid, mat);
  group.add(ribbon);
  chunk.dispose.push(gSolid);

  const mkLines = (arr, material, pairs = false) => {
    const g = new THREE.BufferGeometry();
    if (!pairs) { // polyline → segment pairs
      const seg = [];
      for (let i = 0; i + 5 < arr.length; i += 3) seg.push(arr[i], arr[i + 1], arr[i + 2], arr[i + 3], arr[i + 4], arr[i + 5]);
      g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    } else {
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    }
    chunk.dispose.push(g);
    const l = new THREE.LineSegments(g, material);
    group.add(l);
    return l;
  };
  mkLines(edgeL, G.inkMat); mkLines(edgeR, G.inkMat);
  mkLines(dashes, G.dashMat, true); mkLines(ticks, G.dashMat, true);

  const mid = slice[Math.floor(n / 2)];
  const pnt = makePaintable(null, mid.p.clone(), [mat], { max: 0.55 });
  chunk.paint.push(pnt);
}

const _p = new THREE.Vector3(), _t = new THREE.Vector3(), _r = new THREE.Vector3();
function placeAt(s, lateral, group, obj, yaw = 0) {
  G.track.pose(s, _p, _t, _r);
  obj.position.copy(_p).addScaledVector(_r, lateral);
  obj.rotation.y = Math.atan2(_t.x, _t.z) + yaw;
  group.add(obj);
}

// a floating boon token — colour-coded core + an emblem that reads its effect
function makePower(kind) {
  const conf = POWER[kind];
  const grp = new THREE.Group();
  const cream = 0xf6efdf;
  const coreMat = new THREE.MeshBasicMaterial({ color: conf.color, transparent: true, opacity: 0.94 });
  grp.add(new THREE.Mesh(GEO.pCore, coreMat), inkLines(GEO.pCoreE));
  const mats = [coreMat];
  const addPart = (geo, edgeGeo, color, set) => {
    const mm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.96 });
    const mesh = new THREE.Mesh(geo, mm); set(mesh);
    const e = inkLines(edgeGeo); e.position.copy(mesh.position); e.rotation.copy(mesh.rotation);
    grp.add(mesh, e); mats.push(mm);
  };
  if (conf.emblem === 'plus') {            // 回血 — cross
    addPart(GEO.pArm, GEO.pArmE, cream, m => {});
    addPart(GEO.pArm, GEO.pArmE, cream, m => { m.rotation.z = Math.PI / 2; });
  } else if (conf.emblem === 'cone') {     // 疾行 — forward arrowhead
    addPart(GEO.pCone, GEO.pConeE, cream, m => { m.rotation.x = Math.PI / 2; m.position.z = 0.2; });
  } else if (conf.emblem === 'halo') {     // 金身 — protective ring
    addPart(GEO.pHalo, GEO.pHaloE, cream, m => { m.rotation.x = Math.PI / 2.4; });
  } else if (conf.emblem === 'poles') {    // 墨引 — two magnet poles
    addPart(GEO.pBar, GEO.pBarE, cream, m => { m.position.x = -0.3; });
    addPart(GEO.pBar, GEO.pBarE, cream, m => { m.position.x = 0.3; });
  }
  grp.userData.mats = mats;
  return grp;
}

// glowing ring under the car while a timed boon is active
function buildAura() {
  const geo = new THREE.RingGeometry(2.0, 2.5, 44);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = -Math.PI / 2;
  ring.renderOrder = 2;
  G.scene.add(ring);
  G.aura = { ring, mat };
}

function populate(slice, segIndex, group, chunk) {
  const s0 = slice[0].len, s1 = slice[slice.length - 1].len;
  const pal = PAL();
  const rng = Math.random;

  // trees & blobs near road
  const nTrees = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < nTrees; i++) {
    const s = s0 + rng() * (s1 - s0);
    const side = rng() < 0.5 ? -1 : 1;
    const lat = side * (8 + rng() * 26);
    let tree;
    if (rng() < 0.55) {
      tree = new THREE.Group();
      const m1 = solidMat(pal.tree), m2 = solidMat(pal.tree2), mt = solidMat(0x6b5a44);
      const c1 = new THREE.Mesh(GEO.pine1, m1); c1.position.y = 2.6;
      const c2 = new THREE.Mesh(GEO.pine2, m2); c2.position.y = 4.1;
      const tr = new THREE.Mesh(GEO.trunk, mt); tr.position.y = 0.8;
      const e1 = inkLines(GEO.pine1E); e1.position.y = 2.6;
      const e2 = inkLines(GEO.pine2E); e2.position.y = 4.1;
      const e3 = inkLines(GEO.trunkE); e3.position.y = 0.8;
      tree.add(c1, c2, tr, e1, e2, e3);
      tree.userData.mats = [m1, m2, mt];
    } else {
      tree = new THREE.Group();
      const m1 = solidMat(pal.tree2), mt = solidMat(0x6b5a44);
      const b = new THREE.Mesh(GEO.blob, m1); b.position.y = 2.6;
      b.rotation.set(rng() * 3, rng() * 3, 0);
      const eb = inkLines(GEO.blobE); eb.position.copy(b.position); eb.rotation.copy(b.rotation);
      const tr = new THREE.Mesh(GEO.trunk, mt); tr.position.y = 0.8;
      const et = inkLines(GEO.trunkE); et.position.y = 0.8;
      tree.add(b, eb, tr, et);
      tree.userData.mats = [m1, mt];
    }
    const sc = 0.8 + rng() * 0.9;
    tree.scale.setScalar(sc);
    placeAt(s, lat, group, tree, rng() * 6.28);
    chunk.paint.push(makePaintable(tree, tree.position.clone(), tree.userData.mats));
  }

  // distant mountains
  if (rng() < 0.6) {
    const mv = GEO.mountains[Math.floor(rng() * GEO.mountains.length)];
    const m = new THREE.Group();
    const mm = solidMat(pal.mountain);
    const mesh = new THREE.Mesh(mv.solid, mm);
    const edge = new THREE.LineSegments(mv.edge, G.inkMat);
    mesh.position.y = edge.position.y = 9;
    m.add(mesh, edge);
    const side = rng() < 0.5 ? -1 : 1;
    placeAt(s0 + rng() * (s1 - s0), side * (95 + rng() * 110), group, m, rng() * 6.28);
    chunk.paint.push(makePaintable(m, m.position.clone(), [mm], { max: 0.8 }));
  }

  // clouds
  if (rng() < 0.5) {
    const cl = new THREE.Group();
    const mats = [];
    for (let i = 0; i < 3; i++) {
      const mm = solidMat(pal.cloud);
      const puff = new THREE.Mesh(GEO.cloudPuff, mm);
      const e = inkLines(GEO.cloudPuffE);
      const sx = 1.6 + rng() * 1.6;
      puff.scale.set(sx, sx * 0.36, sx * 0.8); e.scale.copy(puff.scale);
      puff.position.set(i * 2.4 - 2.4, (i === 1 ? 0.5 : 0), 0); e.position.copy(puff.position);
      cl.add(puff, e); mats.push(mm);
    }
    cl.scale.setScalar(2.2 + rng() * 2);
    placeAt(s0 + rng() * (s1 - s0), (rng() - 0.5) * 160, group, cl);
    cl.position.y += 26 + rng() * 18;
    chunk.paint.push(makePaintable(cl, cl.position.clone(), mats, { max: 0.9, flatten: false }));
  }

  // ink-blot obstacles — stay ink forever (墨渍不染)
  if (segIndex > 4 && rng() < 0.85) {
    const nRocks = rng() < 0.3 ? 2 : 1;
    for (let i = 0; i < nRocks; i++) {
      const rock = new THREE.Group();
      const mm = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.88 });
      const mesh = new THREE.Mesh(GEO.rock, mm);
      const edge = inkLines(GEO.rockE);
      mesh.scale.set(1 + rng() * 0.5, 0.7 + rng() * 0.5, 1 + rng() * 0.5);
      edge.scale.copy(mesh.scale);
      mesh.position.y = edge.position.y = 0.55;
      rock.add(mesh, edge);
      const s = s0 + (0.25 + 0.5 * rng()) * (s1 - s0) + i * 14;
      const lat = (rng() * 2 - 1) * 4.6;
      placeAt(s, lat, group, rock, rng() * 6.28);
      G.rocks.push({ s, x: lat, obj: rock });
    }
  }

  // gates 鸟居 — every ~3 segments
  if (segIndex % 3 === 0) {
    const gate = new THREE.Group();
    const gm = [solidMat(pal.gate), solidMat(pal.gate), solidMat(pal.gate), solidMat(pal.gate)];
    const pL = new THREE.Mesh(GEO.post, gm[0]); pL.position.set(-6.4, 2.7, 0);
    const pR = new THREE.Mesh(GEO.post, gm[1]); pR.position.set(6.4, 2.7, 0);
    const b1 = new THREE.Mesh(GEO.beam, gm[2]); b1.position.y = 5.5; b1.rotation.z = 0.012;
    const b2 = new THREE.Mesh(GEO.beam2, gm[3]); b2.position.y = 4.6;
    const eL = inkLines(GEO.postE); eL.position.copy(pL.position);
    const eR = inkLines(GEO.postE); eR.position.copy(pR.position);
    const e1 = inkLines(GEO.beamE); e1.position.copy(b1.position); e1.rotation.copy(b1.rotation);
    const e2 = inkLines(GEO.beam2E); e2.position.copy(b2.position);
    gate.add(pL, pR, b1, b2, eL, eR, e1, e2);
    const s = s0 + (s1 - s0) * 0.5;
    placeAt(s, 0, group, gate);
    chunk.paint.push(makePaintable(gate, gate.position.clone(), gm));
    G.gates.push({ s, obj: gate, passed: false });
  }

  // ink drops — gentle arcs of 3
  if (rng() < 0.75) {
    const baseS = s0 + rng() * (s1 - s0) * 0.6;
    const baseX = (rng() * 2 - 1) * 3.8;
    for (let i = 0; i < 3; i++) {
      const drop = new THREE.Group();
      const mm = new THREE.MeshBasicMaterial({ color: pal.drop, transparent: true, opacity: 0.85 });
      const mesh = new THREE.Mesh(GEO.drop, mm);
      mesh.scale.set(1, 1.3, 1);
      const edge = inkLines(GEO.dropE); edge.scale.copy(mesh.scale);
      drop.add(mesh, edge);
      const s = baseS + i * 7;
      const lat = baseX + Math.sin(i * 0.9) * 0.8;
      placeAt(s, lat, group, drop);
      drop.position.y += 1.2;
      G.drops.push({ s, x: lat, obj: drop, taken: false, spin: rng() * 6.28 });
    }
  }

  // boons — occasional power-ups, weighted toward minor ones
  if (segIndex > 5) {
    const roll = rng();
    let kind = null;
    if      (roll < 0.05) kind = 'shield';
    else if (roll < 0.16) kind = 'speed';
    else if (roll < 0.23) kind = 'magnet';
    else if (roll < 0.31) kind = 'heal';
    if (kind) {
      const tok = makePower(kind);
      const s = s0 + (0.3 + 0.4 * rng()) * (s1 - s0);
      const lat = (rng() * 2 - 1) * (LANE_LIMIT * 0.62);
      placeAt(s, lat, group, tok, rng() * 6.28);
      tok.position.y += 1.4;
      G.powers.push({ s, x: lat, obj: tok, taken: false, spin: rng() * 6.28, kind });
    }
  }
}

function pruneChunks() {
  while (G.chunks.length && G.chunks[0].until < G.s - PRUNE_BEHIND) {
    const c = G.chunks.shift();
    G.scene.remove(c.group);
    c.dispose.forEach(g => g.dispose());
    c.group.traverse(o => { if (o.material && o.material.transparent) o.material.dispose?.(); });
    for (const p of c.paint) { const i = G.paintables.indexOf(p); if (i >= 0) G.paintables.splice(i, 1); }
  }
  // prune entity arrays
  const cut = G.s - 30;
  while (G.gateHead < G.gates.length && G.gates[G.gateHead].s < cut) G.gateHead++;
  while (G.dropHead < G.drops.length && G.drops[G.dropHead].s < cut) G.dropHead++;
  while (G.rockHead < G.rocks.length && G.rocks[G.rockHead].s < cut) G.rockHead++;
  while (G.powerHead < G.powers.length && G.powers[G.powerHead].s < cut) G.powerHead++;
  if (G.gateHead > 400) { G.gates.splice(0, G.gateHead); G.gateHead = 0; }
  if (G.dropHead > 800) { G.drops.splice(0, G.dropHead); G.dropHead = 0; }
  if (G.rockHead > 800) { G.rocks.splice(0, G.rockHead); G.rockHead = 0; }
  if (G.powerHead > 400) { G.powers.splice(0, G.powerHead); G.powerHead = 0; }
}

// ── car ──────────────────────────────────────────────────────
function buildCar() {
  const car = new THREE.Group();
  const body = new THREE.Group(); // tilts/banks inside car group

  const pal = PAL();
  const hullGeo = new THREE.BoxGeometry(1.9, 0.62, 4.0);
  // wedge: pinch the front-top
  const pa = hullGeo.attributes.position;
  for (let i = 0; i < pa.count; i++) {
    if (pa.getY(i) > 0 && pa.getZ(i) > 0) { pa.setY(i, 0.06); pa.setX(i, pa.getX(i) * 0.8); }
  }
  hullGeo.computeVertexNormals();
  const hullE = new THREE.EdgesGeometry(hullGeo, 12);
  const cabGeo = new THREE.BoxGeometry(1.3, 0.5, 1.5);
  const cabE = new THREE.EdgesGeometry(cabGeo, 12);
  const whGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 9);
  const whE = new THREE.EdgesGeometry(whGeo, 25);

  const mBody = solidMat(pal.car), mCab = solidMat(0x35332c), mWh = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.85 });
  const hull = new THREE.Mesh(hullGeo, mBody); hull.position.y = 0.62;
  const cab = new THREE.Mesh(cabGeo, mCab); cab.position.set(0, 1.05, -0.5);
  body.add(hull, cab, inkLines(hullE).translateY(0.62), (() => { const e = inkLines(cabE); e.position.copy(cab.position); return e; })());
  const wheels = [];
  for (const [wx, wz] of [[-1, 1.25], [1, 1.25], [-1, -1.35], [1, -1.35]]) {
    const w = new THREE.Mesh(whGeo, mWh);
    w.rotation.z = Math.PI / 2; w.position.set(wx * 0.95, 0.42, wz);
    const e = inkLines(whE); e.rotation.z = Math.PI / 2; e.position.copy(w.position);
    body.add(w, e); wheels.push(w, e);
  }
  car.add(body);
  G.scene.add(car);
  G.car = car;
  G.carParts = { body, mats: [mBody, mCab], wheels, paint: { pos: new THREE.Vector3(), mats: [mBody, mCab], painted: false, max: 0.95 } };
}

// ── boost wind: ink streak lines whipping past the car ──────
function buildStreaks() {
  for (let i = 0; i < 26; i++) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const m = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 });
    const l = new THREE.Line(g, m);
    l.frustumCulled = false;
    G.scene.add(l);
    G.streaks.push({ g, m,
      ds: 8 + Math.random() * 50,
      lat: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 11),
      h: 0.6 + Math.random() * 4 });
  }
}
const _wp = new THREE.Vector3(), _wt = new THREE.Vector3(), _wr = new THREE.Vector3();
function updateStreaks(dt) {
  const b = G.boost01;
  for (const s of G.streaks) {
    if (b < 0.04) { s.m.opacity = 0; continue; }
    s.ds -= G.speed * 1.5 * dt;               // streaks overtake the world backwards
    if (s.ds < -8) {
      s.ds = 16 + Math.random() * 46;
      s.lat = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 11);
      s.h = 0.6 + Math.random() * 4;
    }
    G.track.pose(G.s + s.ds, _wp, _wt, _wr);
    const len = 1.5 + 7 * b;
    const a = s.g.attributes.position.array;
    a[0] = _wp.x + _wr.x * s.lat; a[1] = _wp.y + s.h; a[2] = _wp.z + _wr.z * s.lat;
    a[3] = a[0] + _wt.x * len; a[4] = a[1] + _wt.y * len; a[5] = a[2] + _wt.z * len;
    s.g.attributes.position.needsUpdate = true;
    s.m.opacity = b * (0.16 + 0.3 * Math.random());   // flicker = hand-drawn wind
  }
}

// ── sun: a hand-drawn circle in the sky ──────────────────────
function buildSun() {
  const grp = new THREE.Group();
  const geo = new THREE.CircleGeometry(26, 40);
  const mat = solidMat(PAL().sun, 0);
  const disc = new THREE.Mesh(geo, mat);
  const ringG = new THREE.EdgesGeometry(geo);
  const ring = new THREE.LineSegments(ringG, G.inkMat);
  grp.add(disc, ring);
  grp.userData.mat = mat;
  G.scene.add(grp);
  G.sun = grp;
}

// ── phase transitions ────────────────────────────────────────
const HUD = {};
function toast(main, sub) {
  HUD.toastMain.textContent = main; HUD.toastSub.textContent = sub;
  HUD.toast.classList.remove('show'); void HUD.toast.offsetWidth;
  HUD.toast.classList.add('show');
}
function powerToast(glyph, name, color) {
  const el = HUD.boon;
  if (!el) return;
  el.innerHTML = `<b>${glyph}</b><span>${name}</span>`;
  el.style.color = `#${color.toString(16).padStart(6, '0')}`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}
function setPhaseLabel() {
  HUD.chNum.textContent = `第${CHAPTER_NUM[G.chapter % 9]}章`;
  HUD.chPhase.textContent = { sketch: '素描', bloom: '晕染', flat: '剪纸' }[G.phase];
  HUD.meterLabel.textContent = { sketch: '墨 色 将 染', bloom: '行 至 剪 纸', flat: '行 至 新 章' }[G.phase];
}

function queueTransition(kind, mainTxt, subTxt) {
  G.pending = kind;
  toast(mainTxt, subTxt);
  AudioEngine.blip(660, 0.4, 'sine', 0.12);
}

function slowMo() {
  tween({ dur: 0.5, update: k => G.timeScale = THREE.MathUtils.lerp(1, 0.42, k) });
  tween({ delay: 1.5, dur: 1.0, ease: smooth, update: k => G.timeScale = THREE.MathUtils.lerp(0.42, 1, k) });
}

function startWave(drain) {
  G.drain = drain;
  G.wave = { origin: G.car.position.clone(), r: 0 };
  // car soaks first / drains first
  const cp = G.carParts.paint;
  cp.painted = drain;
  drain ? unpaint(cp) : paint(cp);
}

function triggerBloom() {
  G.phase = 'bloom'; G.pending = null; G.phaseStartS = G.s;
  startWave(false);
  tween({ dur: 2.4, ease: smooth, update: k => G.color01 = k });
  document.getElementById('splash').classList.remove('bloom');
  void document.getElementById('splash').offsetWidth;
  document.getElementById('splash').classList.add('bloom');
  AudioEngine.whoosh();
  AudioEngine.setPhaseMusic('bloom');
  slowMo();
  toast('晕 染', '色入山河');
  setPhaseLabel();
  // ink lines soften into tinted ink
  const from = G.inkMat.color.clone(), to = new THREE.Color(PAL().inkTint);
  tween({ dur: 2.5, update: k => G.inkMat.color.lerpColors(from, to, k) });
}

function triggerFlat() {
  G.phase = 'flat'; G.pending = null; G.phaseStartS = G.s;
  AudioEngine.whoosh();
  AudioEngine.setPhaseMusic('flat');
  slowMo();
  toast('剪 纸', '天地为平面');
  setPhaseLabel();
  tween({ dur: 2.8, ease: easeInOut, update: k => G.flat01 = k });
  // flatten the world like paper cut-outs
  for (const p of G.paintables) {
    if (p.group && p.flatten) {
      const sy = p.group.scale.y;
      tween({ delay: Math.random() * 0.8, dur: 0.7, ease: easeInOut,
        update: k => p.group.scale.y = THREE.MathUtils.lerp(sy, 0.12, k) });
    }
  }
  const by = G.carParts.body.scale.y;
  tween({ dur: 1.4, ease: easeInOut, update: k => G.carParts.body.scale.y = THREE.MathUtils.lerp(by, 0.4, k) });
}

function triggerChapter() {
  G.pending = null; G.phaseStartS = G.s;
  G.chapter++; G.paletteIdx++;
  // reaching a chapter unlocks starting from it (cap: the six title stamps)
  const prevMax = +(localStorage.getItem('inkline-max-ch') || 0);
  if (G.chapter > prevMax) localStorage.setItem('inkline-max-ch', String(Math.min(G.chapter, 5)));
  G.baseSpeed += 3.5;
  G.meter = 0;
  G.phase = 'sketch';
  startWave(true);             // colour drains away
  AudioEngine.whoosh();
  AudioEngine.setPhaseMusic('sketch');
  slowMo();
  toast(`第${CHAPTER_NUM[G.chapter % 9]}章`, '复归素描 · 笔速渐疾');
  setPhaseLabel();
  tween({ dur: 2.2, ease: smooth, update: k => G.color01 = 1 - k });
  tween({ dur: 2.6, ease: easeInOut, update: k => G.flat01 = 1 - k });
  for (const p of G.paintables) {
    if (p.group && p.flatten) {
      const sy = p.group.scale.y;
      tween({ delay: Math.random() * 0.6, dur: 0.8, ease: easeInOut,
        update: k => p.group.scale.y = THREE.MathUtils.lerp(sy, 1, k) });
    }
  }
  const by = G.carParts.body.scale.y;
  tween({ dur: 1.6, ease: easeInOut, update: k => G.carParts.body.scale.y = THREE.MathUtils.lerp(by, 1, k) });
  const from = G.inkMat.color.clone(), to = new THREE.Color(INK);
  tween({ dur: 2.2, update: k => G.inkMat.color.lerpColors(from, to, k) });
}

function updatePhase(dt) {
  // queue transitions; they fire at the next gate → feels deliberate
  if (!G.pending) {
    if (G.phase === 'sketch' && G.meter >= 1) queueTransition('bloom', '色 将 染', '于下一道门');
    else if (G.phase === 'bloom' && G.s - G.phaseStartS > BLOOM_DIST) queueTransition('flat', '纸 将 折', '于下一道门');
    else if (G.phase === 'flat' && G.s - G.phaseStartS > FLAT_DIST) queueTransition('chapter', '章 将 启', '于下一道门');
  }
  // wave propagation
  if (G.wave) {
    G.wave.r += 95 * dt; // ~95 m/s soak front
    for (const p of G.paintables) {
      if (p.pos.distanceTo(G.wave.origin) < G.wave.r) G.drain ? unpaint(p) : paint(p);
    }
    if (G.wave.r > 900) G.wave = null;
  }
  // meter progress for bloom/flat phases is distance-driven
  if (G.phase === 'bloom') G.meter = Math.min((G.s - G.phaseStartS) / BLOOM_DIST, 1);
  if (G.phase === 'flat') G.meter = Math.min((G.s - G.phaseStartS) / FLAT_DIST, 1);
}

// ── ripple effect on pickups/gates ───────────────────────────
function ripple(pos, color = INK, size = 1) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  const m = new THREE.Mesh(GEO.ring, mat);
  m.position.copy(pos); m.position.y += 0.06;
  m.rotation.x = -Math.PI / 2;
  G.scene.add(m);
  tween({ dur: 0.7, ease: easeOut, update: k => {
    m.scale.setScalar(1 + k * 7 * size); mat.opacity = 0.8 * (1 - k);
  }, done: () => { G.scene.remove(m); mat.dispose(); } });
}

// ── gameplay events ──────────────────────────────────────────
function onGate(g) {
  const inside = Math.abs(G.x) < 5.0;
  if (inside) {
    G.combo++; G.maxCombo = Math.max(G.maxCombo, G.combo);
    if (G.phase === 'sketch') G.meter = Math.min(G.meter + 0.16, 1);
    AudioEngine.chime(G.combo - 1);
    ripple(g.obj.position, PAL().gate, 1.6);
    if (G.combo >= 2) {
      HUD.combo.textContent = `連 ×${G.combo}`;
      HUD.combo.classList.remove('pop'); void HUD.combo.offsetWidth;
      HUD.combo.classList.add('pop');
    }
  } else {
    G.combo = 0;
  }
  // a queued transition fires as we cross any gate
  if (G.pending === 'bloom') triggerBloom();
  else if (G.pending === 'flat') triggerFlat();
  else if (G.pending === 'chapter') triggerChapter();
}

function onPickup(d) {
  d.taken = true;
  d.obj.visible = false;
  G.dropsGot++;
  if (G.phase === 'sketch') G.meter = Math.min(G.meter + 0.09, 1);
  AudioEngine.pickup();
  ripple(d.obj.position, PAL().drop, 0.8);
}

function onPower(p) {
  p.taken = true;
  p.obj.visible = false;
  G.boonsGot++;
  const conf = POWER[p.kind];
  if (p.kind === 'heal') {
    if (G.hp < MAX_HP) {
      G.hp++;
      const hearts = document.querySelectorAll('.hp-drop');
      hearts.forEach((el, i) => el.classList.toggle('lost', i >= G.hp));
      const restored = hearts[G.hp - 1];
      if (restored) { restored.classList.remove('healed'); void restored.offsetWidth; restored.classList.add('healed'); }
      AudioEngine.heal();
      powerToast(conf.glyph, conf.name, conf.color);
    } else {                                   // already full → ink bonus instead
      G.meter = Math.min(G.meter + 0.14, 1);
      AudioEngine.pickup();
      powerToast(conf.glyph, '墨 满', conf.color);
    }
  } else {
    if (p.kind === 'speed')  G.surgeT  = SURGE_DUR;
    if (p.kind === 'shield') G.shieldT = SHIELD_DUR;
    if (p.kind === 'magnet') G.magnetT = MAGNET_DUR;
    AudioEngine.power(p.kind);
    powerToast(conf.glyph, conf.name, conf.color);
  }
  ripple(p.obj.position, conf.color, 1.4);
}

function onHit(rock) {
  if (G.invuln > 0) return;
  if (G.shieldT > 0) {                          // 金身 deflects the ink-blot, no damage
    if (!rock.deflected) {
      rock.deflected = true;
      AudioEngine.blip(540, 0.12, 'square', 0.13);
      ripple(rock.obj.position, POWER.shield.color, 1.9);
    }
    return;
  }
  G.invuln = 1.6;
  G.hp--;
  G.combo = 0;
  G.meter = Math.max(G.meter - 0.12, 0);
  G.shake = 1;
  G.speed *= 0.45;
  AudioEngine.splat();
  const hf = document.getElementById('hitflash');
  hf.classList.remove('hit'); void hf.offsetWidth; hf.classList.add('hit');
  ripple(rock.obj.position, INK, 2.2);
  document.querySelectorAll('.hp-drop').forEach((el, i) => el.classList.toggle('lost', i >= G.hp));
  if (G.hp <= 0) gameOver();
}

function gameOver() {
  G.over = true; G.running = false;
  AudioEngine.setEngine(0, false);
  AudioEngine.setPhaseMusic('sketch');
  document.getElementById('ov-dist').textContent = Math.floor(G.s);
  document.getElementById('ov-combo').textContent = G.maxCombo;
  document.getElementById('ov-drops').textContent = G.dropsGot;
  document.getElementById('ov-ch').textContent = CHAPTER_NUM[G.chapter % 9];
  document.getElementById('hud').classList.remove('on');
  setTimeout(() => document.getElementById('over').classList.remove('hidden'), 600);
}

// ── input ────────────────────────────────────────────────────
const Input = { left: false, right: false, boost: false, dragX: null, dragActive: false };
window.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') Input.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') Input.right = true;
  if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'ShiftLeft') Input.boost = true;
});
window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') Input.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') Input.right = false;
  if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'ShiftLeft') Input.boost = false;
});
window.addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  Input.dragActive = true; Input.dragX = e.clientX;
});
window.addEventListener('pointermove', e => {
  if (!Input.dragActive) return;
  const dx = e.clientX - Input.dragX;
  Input.dragX = e.clientX;
  G.xv += dx * 0.012;
});
window.addEventListener('pointerup', () => { Input.dragActive = false; });

// ── HUD refs ─────────────────────────────────────────────────
function bindHUD() {
  HUD.dist = document.getElementById('dist');
  HUD.meterFill = document.getElementById('meter-fill');
  HUD.meterLabel = document.getElementById('meter-label');
  HUD.combo = document.getElementById('combo');
  HUD.boon = document.getElementById('boon');
  HUD.toast = document.getElementById('phase-toast');
  HUD.toastMain = document.getElementById('toast-main');
  HUD.toastSub = document.getElementById('toast-sub');
  HUD.chNum = document.getElementById('ch-num');
  HUD.chPhase = document.getElementById('ch-phase');
}

// ── setup three ──────────────────────────────────────────────
function setup() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  document.getElementById('stage').appendChild(renderer.domElement);
  G.renderer = renderer;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);
  scene.fog = new THREE.FogExp2(PAPER, 0.0075);
  G.scene = scene;

  G.camera = new THREE.PerspectiveCamera(64, innerWidth / innerHeight, 0.1, 1400);

  G.inkMat = new THREE.LineBasicMaterial({ color: INK });
  G.dashMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.4 });

  buildGeos();
  G.track = new Track(onSlice);
  G.track.ensure(0);
  buildCar();
  buildAura();
  buildSun();
  buildStreaks();
  bindHUD();

  window.addEventListener('resize', () => {
    G.camera.aspect = innerWidth / innerHeight;
    G.camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

// ── per-frame update ─────────────────────────────────────────
const camP = new THREE.Vector3(), camL = new THREE.Vector3(), camU = new THREE.Vector3();
const eyeA = new THREE.Vector3(), lookA = new THREE.Vector3();
const eyeB = new THREE.Vector3(), lookB = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _bx = new THREE.Vector3(), _by = new THREE.Vector3();
let lastHudDist = -1;

function update(dt, rdt) {
  const pal = PAL();

  // boon timers
  if (G.surgeT  > 0) G.surgeT  -= dt;
  if (G.shieldT > 0) G.shieldT -= dt;
  if (G.magnetT > 0) G.magnetT -= dt;
  // 疾行浪涌平滑淡入淡出 — 拾取/结束都走 surge01 缓动，避免画面瞬变
  G.surge01 += ((G.surgeT > 0 ? 1 : 0) - G.surge01) * Math.min(dt * 3, 1);

  // speed & motion — boost eases in/out instead of snapping
  G.boost01 += ((Input.boost ? 1 : 0) - G.boost01) * Math.min(dt * 3.2, 1);
  G.boost01 = Math.max(G.boost01, 0.9 * G.surge01);    // 疾行 平滑融入 boost 视觉/风线
  const target = (G.baseSpeed + Math.min(G.s * 0.004, 9)) * (1 + 0.34 * G.boost01) * (1 + 0.5 * G.surge01) * (G.phase === 'flat' ? 0.88 : 1);
  G.speed += (target - G.speed) * Math.min(dt * 1.4, 1);
  G.s += G.speed * dt;
  G.track.ensure(G.s);

  // steering
  const steer = (Input.right ? 1 : 0) - (Input.left ? 1 : 0);
  G.xv += steer * 34 * dt;
  G.xv *= Math.pow(0.0018, dt);     // damping
  G.x += G.xv * dt * 2.6;
  if (Math.abs(G.x) > LANE_LIMIT) { G.x = Math.sign(G.x) * LANE_LIMIT; G.xv *= -0.25; }

  // car pose
  G.track.pose(G.s, _p, _t, _r);
  G.car.position.copy(_p).addScaledVector(_r, G.x);
  _bx.copy(_r).negate();                       // proper right-handed basis: X×Y=Z
  _by.crossVectors(_t, _bx).normalize();
  _m.makeBasis(_bx, _by, _t).setPosition(0, 0, 0);
  G.car.quaternion.setFromRotationMatrix(_m);
  const bank = THREE.MathUtils.clamp(-G.xv * 0.05, -0.3, 0.3);
  G.carParts.body.rotation.z = bank;
  G.carParts.body.rotation.y = THREE.MathUtils.clamp(-G.xv * 0.04, -0.22, 0.22); // nose into the drift
  G.carParts.body.position.y = Math.sin(performance.now() * 0.012) * 0.02;
  G.carParts.paint.pos.copy(G.car.position);
  if (G.invuln > 0) {
    G.invuln -= dt;
    G.car.visible = (Math.floor(performance.now() / 90) % 2) === 0;
  } else G.car.visible = true;

  // boon aura ring under the car (steady halo, distinct from hit blink)
  if (G.aura) {
    const au = G.aura;
    let ac = null, ao = 0;
    if      (G.shieldT > 0)     { ac = POWER.shield.color; ao = 0.55; }
    else if (G.surge01 > 0.02)  { ac = POWER.speed.color;  ao = 0.45 * G.surge01; }
    else if (G.magnetT > 0)     { ac = POWER.magnet.color; ao = 0.42; }
    if (ac !== null) {
      const now = performance.now();
      au.ring.visible = true;
      au.mat.color.set(ac);
      au.mat.opacity = ao * (0.72 + 0.28 * Math.sin(now * 0.011));
      au.ring.position.copy(G.car.position); au.ring.position.y = _p.y + 0.06;
      au.ring.scale.setScalar(1 + 0.07 * Math.sin(now * 0.008));
    } else au.ring.visible = false;
  }

  // collisions / pickups / gates
  for (let i = G.gateHead; i < G.gates.length; i++) {
    const g = G.gates[i];
    if (g.s > G.s + 4) break;
    if (!g.passed && G.s >= g.s) { g.passed = true; onGate(g); }
  }
  const magnet = G.magnetT > 0;
  const carPos = G.car.position;
  for (let i = G.dropHead; i < G.drops.length; i++) {
    const d = G.drops[i];
    if (d.s > G.s + 60) break;
    if (d.taken) continue;
    d.spin += dt * 2.4;
    d.obj.rotation.y = d.spin;
    // 墨引：在吸力半径内的墨滴各自朝车体真实位置加速飞来（越近越快），自然汇聚而非整列横移
    let pulled = false;
    if (magnet && d.s > G.s - 5 && d.s < G.s + 26) {
      const dist = d.obj.position.distanceTo(carPos);
      if (dist < 18) {
        if (dist < 1.5) { onPickup(d); continue; }
        const k = Math.min(dt * (3.5 + 55 / Math.max(dist, 1.2)), 1);
        d.obj.position.lerp(carPos, k);
        pulled = true;
      }
    }
    if (!pulled) {
      d.obj.position.y += Math.sin(d.spin * 1.7) * 0.004;
      if (Math.abs(d.s - G.s) < 2.4 && Math.abs(d.x - G.x) < 1.9) onPickup(d);
    }
  }
  for (let i = G.powerHead; i < G.powers.length; i++) {
    const p = G.powers[i];
    if (p.s > G.s + 40) break;
    if (p.taken) continue;
    p.spin += dt * 1.7;
    p.obj.rotation.y = p.spin;
    p.obj.position.y += Math.sin(p.spin * 1.4) * 0.006;
    if (Math.abs(p.s - G.s) < 2.6 && Math.abs(p.x - G.x) < 2.3) onPower(p);
  }
  for (let i = G.rockHead; i < G.rocks.length; i++) {
    const r = G.rocks[i];
    if (r.s > G.s + 8) break;
    if (Math.abs(r.s - G.s) < 2.1 && Math.abs(r.x - G.x) < 1.55) onHit(r);
  }

  updatePhase(dt);
  pruneChunks();

  // wheels roll
  for (const w of G.carParts.wheels) w.rotateY(G.speed * dt * 0.9);

  updateStreaks(dt);

  // ── camera: blend 3D chase ↔ 2D top-down ──
  const f = smooth(G.flat01);
  // chase rig
  eyeA.copy(_p).addScaledVector(_t, -9.2).addScaledVector(UP, 4.4).addScaledVector(_r, G.x * 0.45);
  lookA.copy(_p).addScaledVector(_t, 7).addScaledVector(UP, 1.5).addScaledVector(_r, G.x * 0.3);
  // top-down rig — pulled closer & framed tighter so lateral steering reads
  // as quick as the 3D chase (was a far 190m zoom that made turns feel sluggish)
  eyeB.copy(G.car.position).addScaledVector(_t, 13).setY(_p.y + 96);
  lookB.copy(G.car.position).addScaledVector(_t, 13.01).setY(_p.y);
  camP.lerpVectors(eyeA, eyeB, f);
  camL.lerpVectors(lookA, lookB, f);
  camU.copy(UP).multiplyScalar(1 - f).addScaledVector(_t, f).normalize();
  // shake + boost rumble
  if (G.shake > 0.001) {
    G.shake *= Math.pow(0.001, rdt);
    camP.x += (Math.random() - 0.5) * G.shake * 0.9;
    camP.y += (Math.random() - 0.5) * G.shake * 0.9;
  }
  camP.x += (Math.random() - 0.5) * 0.085 * G.boost01;
  camP.y += (Math.random() - 0.5) * 0.06 * G.boost01;
  G.camera.position.copy(camP);
  G.camera.up.copy(camU);
  G.camera.lookAt(camL);
  G.camera.fov = THREE.MathUtils.lerp(64, 22, f) + G.boost01 * 5 + 4 * G.surge01;
  G.camera.updateProjectionMatrix();

  // atmosphere follows colour
  const bg = new THREE.Color(PAPER).lerp(new THREE.Color(pal.sky), G.color01 * (1 - f * 0.55));
  G.scene.background.copy(bg);
  G.scene.fog.color.copy(bg);
  G.scene.fog.density = THREE.MathUtils.lerp(0.0075 - G.color01 * 0.002, 0.00045, f);

  // sun hangs on the horizon ahead
  if (G.sun) {
    G.sun.position.copy(_p).addScaledVector(_t, 600).addScaledVector(_r, -160);
    G.sun.position.y = _p.y + 150;
    G.sun.lookAt(G.camera.position);
    G.sun.userData.mat.opacity = G.color01 * 0.85;
    G.sun.visible = f < 0.85;
  }

  // audio
  AudioEngine.setEngine(G.speed, G.boost01 > 0.5);

  // HUD
  const dist = Math.floor(G.s);
  if (dist !== lastHudDist) { HUD.dist.textContent = dist; lastHudDist = dist; }
  HUD.meterFill.style.width = `${G.meter * 100}%`;
}

// ── chapter select: wipe and regrow the world in that palette ─
function applyChapter(c) {
  G.chapter = c; G.paletteIdx = c; G.baseSpeed = 24 + 3.5 * c;
  for (const ch of G.chunks) {
    G.scene.remove(ch.group);
    ch.dispose.forEach(g => g.dispose());
  }
  G.chunks = []; G.paintables = [];
  G.gates = []; G.drops = []; G.rocks = []; G.powers = [];
  G.gateHead = G.dropHead = G.rockHead = G.powerHead = 0;
  G.surgeT = G.surge01 = G.shieldT = G.magnetT = 0;
  if (G.aura) G.aura.ring.visible = false;
  G.s = 0; G.x = 0; G.xv = 0; G.speed = 0; G.meter = 0;
  G.phase = 'sketch'; G.pending = null; G.wave = null; G.drain = false;
  G.color01 = 0; G.flat01 = 0;
  G.track = new Track(onSlice);
  G.track.ensure(0);
  G.carParts.mats[0].color.set(PAL().car);
  G.carParts.mats.forEach(m => m.opacity = 0);
  G.carParts.paint.painted = false;
  G.carParts.body.scale.y = 1;
  if (G.sun) G.sun.userData.mat.color.set(PAL().sun);
  G.inkMat.color.set(INK);
  setPhaseLabel();
}

// ── pause ────────────────────────────────────────────────────
function setPaused(p) {
  if (G.over || (!G.running && p)) return;
  if (G.paused === p) return;
  G.paused = p;
  document.getElementById('pause').classList.toggle('hidden', !p);
  if (AudioEngine.ctx) p ? AudioEngine.ctx.suspend() : AudioEngine.ctx.resume();
}

// ── main loop ────────────────────────────────────────────────
let lastT = 0;
function loop(t) {
  requestAnimationFrame(loop);
  const rdt = Math.min((t - lastT) / 1000, 0.05) || 0.016;
  lastT = t;
  if (!G.paused) {
    stepTweens(rdt);
    if (G.running) update(rdt * G.timeScale, rdt);
  }
  G.renderer.render(G.scene, G.camera);
}

// ── boot ─────────────────────────────────────────────────────
let chosenChapter = Math.min(+(sessionStorage.getItem('inkline-ch') || 0), 5);

function start() {
  document.getElementById('title').classList.add('hidden');
  document.getElementById('hud').classList.add('on');
  AudioEngine.init();
  sessionStorage.setItem('inkline-ch', String(chosenChapter));
  G.running = true;
  setPhaseLabel();
  toast('素 描', chosenChapter > 0 ? `自第${CHAPTER_NUM[chosenChapter]}章落笔` : '第一笔落纸');
}

setup();
requestAnimationFrame(loop);
window.__G = G; // debug handle

// chapter stamps on the title screen
{
  const maxCh = Math.min(+(localStorage.getItem('inkline-max-ch') || 0), 5);
  if (chosenChapter > maxCh) chosenChapter = 0;
  if (chosenChapter > 0) applyChapter(chosenChapter);
  document.querySelectorAll('.chap').forEach(b => {
    const c = +b.dataset.ch;
    if (c > maxCh) b.classList.add('locked');
    b.classList.toggle('sel', c === chosenChapter);
    b.addEventListener('click', () => {
      chosenChapter = c;
      document.querySelectorAll('.chap').forEach(x => x.classList.toggle('sel', +x.dataset.ch === c));
      applyChapter(c);
    });
  });
}

document.getElementById('start').addEventListener('click', start);
const doRestart = () => {
  sessionStorage.setItem('inkline-restart', '1');
  sessionStorage.setItem('inkline-ch', String(chosenChapter));
  location.reload();
};
document.getElementById('restart').addEventListener('click', doRestart);
document.getElementById('pause-restart').addEventListener('click', doRestart);
const doMenu = () => {
  sessionStorage.removeItem('inkline-restart');
  sessionStorage.setItem('inkline-ch', String(chosenChapter));
  location.reload();
};
document.getElementById('over-menu').addEventListener('click', doMenu);
document.getElementById('pause-menu').addEventListener('click', doMenu);
document.getElementById('resume').addEventListener('click', () => setPaused(false));
window.addEventListener('keydown', e => {
  if (e.code === 'Escape' || e.code === 'KeyP') setPaused(!G.paused);
});
document.getElementById('mute').addEventListener('click', e => {
  const muted = AudioEngine.toggleMute();
  e.target.textContent = muted ? '音 · 关' : '音 · 开';
});
if (sessionStorage.getItem('inkline-restart')) {
  sessionStorage.removeItem('inkline-restart');
  start();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (G.running && !G.paused) setPaused(true);          // tab away → auto pause
    else if (AudioEngine.ctx) AudioEngine.ctx.suspend();
  } else if (!G.paused && AudioEngine.ctx) AudioEngine.ctx.resume();
});
// after a restart-reload the context starts suspended until a gesture
for (const ev of ['pointerdown', 'keydown']) {
  window.addEventListener(ev, () => {
    if (!G.paused && AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') AudioEngine.ctx.resume();
  });
}
