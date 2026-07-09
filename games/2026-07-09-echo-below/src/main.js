import { MEDIA, preloadMedia } from './assets.js';
import { AudioSys } from './audio.js';
import { TAU, angleTo, choice, clamp, dist, formatTime, lerp, mulberry32, smooth, wrapAngle } from './util.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const mini = document.getElementById('mini');
const mctx = mini.getContext('2d');

const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const muteBtn = document.getElementById('muteBtn');
const restartBtn = document.getElementById('restartBtn');
const closeEndBtn = document.getElementById('closeEndBtn');
const pauseMenu = document.getElementById('pauseMenu');
const resumeBtn = document.getElementById('resumeBtn');
const pauseRestartBtn = document.getElementById('pauseRestartBtn');
const titleBtn = document.getElementById('titleBtn');
const pauseMuteBtn = document.getElementById('pauseMuteBtn');
const aiBtn = document.getElementById('aiBtn');
const returnBtn = document.getElementById('returnBtn');
const musicRange = document.getElementById('musicRange');
const musicValue = document.getElementById('musicValue');
const sfxRange = document.getElementById('sfxRange');
const sfxValue = document.getElementById('sfxValue');
const reduceMotionToggle = document.getElementById('reduceMotionToggle');
const contrastToggle = document.getElementById('contrastToggle');
const ending = document.getElementById('ending');
const endTitle = document.getElementById('endTitle');
const endText = document.getElementById('endText');
const progress = document.getElementById('progress');
const slotsEl = document.getElementById('slots');
const logEl = document.getElementById('log');
const toastEl = document.getElementById('toast');
const visionEl = document.getElementById('vision');
const visionVideo = visionEl.querySelector('video');
const systemsEl = document.getElementById('systems');

const meters = {
  hull: document.querySelector('#mHull .value'),
  hullBar: document.querySelector('#mHull .bar i'),
  hullBox: document.querySelector('#mHull'),
  oxy: document.querySelector('#mOxy .value'),
  oxyBar: document.querySelector('#mOxy .bar i'),
  oxyBox: document.querySelector('#mOxy'),
  heat: document.querySelector('#mHeat .value'),
  heatBar: document.querySelector('#mHeat .bar i'),
  heatBox: document.querySelector('#mHeat'),
  range: document.querySelector('#mDepth .value'),
  rangeBar: document.querySelector('#mDepth .bar i'),
  objective: document.getElementById('objectiveMain'),
  hint: document.getElementById('objectiveHint')
};

let W = 1;
let H = 1;
let DPR = 1;
let zoom = 1;
let media = null;
let audio = null;
let G = null;
let last = performance.now();
let running = false;
let muted = false;
let pauseMenuOpen = false;
const keys = new Set();
const just = new Set();
const CARGO_SLOTS = 8;
const CORE_GOAL = 5;
const CORE_COUNT = 7;
const SCAN_GOAL = 6;
const MAX_DECOYS = 3;
const NAV_ARRIVE = 24;
const NAV_INTERACT = 48;
const SAFE_START_RADIUS = 620;
const WORLD_RADIUS = 3000;
const SETTINGS_KEY = 'echo-below-settings-v2';

const settings = {
  musicVolume: 0.72,
  sfxVolume: 0.9,
  reduceMotion: false,
  highContrast: false
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const legacyVolume = Number.isFinite(saved.volume) ? clamp(saved.volume, 0, 1) : null;
    settings.musicVolume = Number.isFinite(saved.musicVolume) ? clamp(saved.musicVolume, 0, 1) : (legacyVolume ?? settings.musicVolume);
    settings.sfxVolume = Number.isFinite(saved.sfxVolume) ? clamp(saved.sfxVolume, 0, 1) : (legacyVolume ?? settings.sfxVolume);
    settings.reduceMotion = Boolean(saved.reduceMotion);
    settings.highContrast = Boolean(saved.highContrast);
    muted = Boolean(saved.muted);
  } catch {}
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, muted }));
  } catch {}
}

function syncSettingsControls() {
  musicRange.value = Math.round(settings.musicVolume * 100);
  musicValue.textContent = `${Math.round(settings.musicVolume * 100)}%`;
  sfxRange.value = Math.round(settings.sfxVolume * 100);
  sfxValue.textContent = `${Math.round(settings.sfxVolume * 100)}%`;
  reduceMotionToggle.checked = settings.reduceMotion;
  contrastToggle.checked = settings.highContrast;
}

function syncMuteButtons() {
  const label = muted ? '取消静音' : '静音';
  muteBtn.textContent = label;
  pauseMuteBtn.textContent = label;
}

function syncAiButton() {
  const on = Boolean(G?.ai?.enabled);
  aiBtn.classList.toggle('active', on);
  aiBtn.textContent = on ? 'AI巡航中' : 'AI巡航';
}

function applySettings() {
  document.body.classList.toggle('reduce-motion', settings.reduceMotion);
  document.body.classList.toggle('high-contrast', settings.highContrast);
  if (audio) {
    audio.setMusicVolume(settings.musicVolume);
    audio.setSfxVolume(settings.sfxVolume);
    audio.setMuted(muted);
  }
  syncSettingsControls();
  syncMuteButtons();
  syncAiButton();
}

loadSettings();

const SALVAGE_TYPES = [
  { key: 'pearl', name: '珍珠匣', sprite: 'pearl', value: 180, weight: 1 },
  { key: 'tablet', name: '青铜数据板', sprite: 'tablet', value: 230, weight: 1 },
  { key: 'crystal', name: '极光晶簇', sprite: 'crystal', value: 290, weight: 1 },
  { key: 'blackbox', name: '深海黑匣', sprite: 'blackbox', value: 420, weight: 2 },
  { key: 'crate', name: '封存货箱', sprite: 'crate', value: 340, weight: 2 },
  { key: 'anchor', name: '磁锚', sprite: 'anchor', value: 380, weight: 2 },
  { key: 'hatch', name: '古代舱门', sprite: 'hatch', value: 520, weight: 3 }
];

const SUPPLY_TYPES = [
  { kind: 'oxygen', name: '氧气罐', sprite: 'oxygen', chance: 0.30 },
  { kind: 'repair', name: '维修胶', sprite: 'repair', chance: 0.22 },
  { kind: 'battery', name: '电池组', sprite: 'battery', chance: 0.16 },
  { kind: 'coolant', name: '冷却剂', sprite: 'coolant', chance: 0.14 },
  { kind: 'silent', name: '静音线圈', sprite: 'silent', chance: 0.10 },
  { kind: 'decoy', name: '声呐诱饵', sprite: 'decoy', chance: 0.08 }
];

const STRUCTURE_TYPES = [
  { key: 'wreck', name: '残骸拱门', sprite: 'wreck', rad: 88, scan: 220 },
  { key: 'column', name: '石柱群', sprite: 'column', rad: 74, scan: 180 },
  { key: 'gate', name: '珊瑚门', sprite: 'gate', rad: 82, scan: 240 },
  { key: 'relay', name: '中继塔', sprite: 'relay', rad: 56, scan: 260 },
  { key: 'buoy', name: '声呐浮标', sprite: 'buoy', rad: 46, scan: 160 }
];

const HUNTER_SPRITES = ['predator', 'eel', 'crab', 'manta', 'jellyfish'];

function resize() {
  DPR = Math.min(1.5, window.devicePixelRatio || 1);
  W = Math.max(1, window.innerWidth);
  H = Math.max(1, window.innerHeight);
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  mini.width = Math.floor(224 * DPR);
  mini.height = Math.floor(224 * DPR);
  mini.style.width = '100%';
  mini.style.height = '100%';
  mctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  zoom = clamp(Math.min(W, H) / 760, 0.58, 1.08);
}

window.addEventListener('resize', resize);
resize();

for (let i = 0; i < CARGO_SLOTS; i++) {
  const d = document.createElement('div');
  d.className = 'slot';
  slotsEl.appendChild(d);
}

function log(msg) {
  if (!G) return;
  G.log.unshift(msg);
  G.log = G.log.slice(0, 7);
  if (G.ui) G.ui.panelAt = -99;
}

function toast(msg, ms = 1700) {
  const now = performance.now();
  if (toastEl.textContent === msg && toastEl.classList.contains('show') && now < (toastEl._until || 0) - 80) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  toastEl._until = now + ms;
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove('show'), ms);
}

function hidePauseMenu() {
  pauseMenuOpen = false;
  pauseMenu.classList.remove('show');
  pauseMenu.setAttribute('aria-hidden', 'true');
}

function openPauseMenu() {
  if (!G || !G.started || G.ended || visionEl.classList.contains('show')) return;
  pauseMenuOpen = true;
  G.paused = true;
  keys.clear();
  just.clear();
  pauseMenu.classList.add('show');
  pauseMenu.setAttribute('aria-hidden', 'false');
  syncSettingsControls();
  resumeBtn.focus();
}

function closePauseMenu() {
  if (!pauseMenuOpen) return;
  hidePauseMenu();
  if (!visionEl.classList.contains('show') && G && !G.ended) G.paused = false;
  last = performance.now();
}

function togglePauseMenu() {
  if (pauseMenuOpen) closePauseMenu();
  else openPauseMenu();
}

function terrainNoise(x, y) {
  return Math.sin(x * 0.004 + Math.sin(y * 0.002) * 1.7) + Math.sin((x + y) * 0.0017) * 0.7;
}

function weightedChoice(rng, list) {
  const total = list.reduce((sum, item) => sum + (item.chance || 1), 0);
  let roll = rng() * total;
  for (const item of list) {
    roll -= item.chance || 1;
    if (roll <= 0) return item;
  }
  return list[list.length - 1];
}

function ringPoint(rng, minR, maxR) {
  const a = rng() * TAU;
  const r = Math.sqrt(lerp(minR * minR, maxR * maxR, rng()));
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, r, a };
}

function placeInRing(rng, minR, maxR, occupied = [], minGap = 120) {
  let best = null;
  for (let tries = 0; tries < 90; tries++) {
    const p = ringPoint(rng, minR, maxR);
    let nearest = Infinity;
    for (const o of occupied) nearest = Math.min(nearest, dist(p.x, p.y, o.x, o.y) - (o.rad || 0));
    const score = nearest + rng() * 18;
    if (!best || score > best.score) best = { ...p, score };
    if (nearest >= minGap) {
      occupied.push({ x: p.x, y: p.y, rad: minGap * 0.42 });
      return p;
    }
  }
  occupied.push({ x: best.x, y: best.y, rad: minGap * 0.42 });
  return best;
}

function placeFromBands(rng, bands, occupied, minGap = 120) {
  const band = weightedChoice(rng, bands);
  return placeInRing(rng, band.min, band.max, occupied, minGap);
}

function pushClearOfHazards(items, hazards, margin = 52) {
  for (const item of items) {
    for (let pass = 0; pass < 4; pass++) {
      let moved = false;
      for (const h of hazards) {
        const d = dist(item.x, item.y, h.x, h.y);
        const minD = (h.rad || 40) + margin;
        if (d >= minD || d <= 0.001) continue;
        const nx = (item.x - h.x) / d;
        const ny = (item.y - h.y) / d;
        item.x += nx * (minD - d + 8);
        item.y += ny * (minD - d + 8);
        moved = true;
      }
      if (!moved) break;
    }
    const r = Math.hypot(item.x, item.y);
    if (r < SAFE_START_RADIUS) {
      const a = angleTo(0, 0, item.x || 1, item.y || 0);
      item.x = Math.cos(a) * SAFE_START_RADIUS;
      item.y = Math.sin(a) * SAFE_START_RADIUS;
    }
  }
}

function cargoWeight(p = G.player) {
  return p.cargo.reduce((sum, item) => sum + (item.weight || 1), 0);
}

function activeDecoy() {
  return G.decoys.find((d) => d.age < d.life);
}

function revealAround(x, y, radius = 560) {
  const reveal = (obj, seconds = 7) => {
    if (dist(x, y, obj.x, obj.y) < radius) obj.revealed = Math.max(obj.revealed || 0, seconds);
  };
  G.relics.forEach((r) => !r.taken && reveal(r, 8));
  G.supplies.forEach((s) => !s.taken && reveal(s, 7));
  G.vents.forEach((v) => reveal(v, 7));
  G.fauna.forEach((f) => reveal(f, 4.2));
  G.structures.forEach((s) => !s.scanned && reveal(s, 8));
  G.mines.forEach((m) => m.armed && reveal(m, 8));
  G.currents.forEach((c) => reveal(c, 8));
}

function applySupply(s) {
  const p = G.player;
  if (s.kind === 'oxygen') {
    p.oxygen = clamp(p.oxygen + 26, 0, 100);
    log('已回收氧气罐。');
  } else if (s.kind === 'repair') {
    p.hull = clamp(p.hull + 24, 0, 100);
    log('维修胶已封住外壳裂缝。');
  } else if (s.kind === 'battery') {
    p.oxygen = clamp(p.oxygen + 14, 0, 100);
    p.pingCd = Math.max(0, p.pingCd - 0.7);
    log('电池组已接入声呐电容。');
  } else if (s.kind === 'coolant') {
    p.coolantT = Math.max(p.coolantT, 22);
    p.heat = clamp(p.heat - 36, 0, 100);
    log('冷却剂已注入推进舱。');
  } else if (s.kind === 'silent') {
    p.silentT = Math.max(p.silentT, 30);
    p.heat = clamp(p.heat - 14, 0, 100);
    log('静音线圈展开，短时间降低噪声。');
  } else if (s.kind === 'decoy') {
    p.decoys = Math.min(MAX_DECOYS, p.decoys + 1);
    log('声呐诱饵已装填。');
  }
  toast(`拾取${s.name}。`, 1200);
}

function scanStructure(site) {
  const p = G.player;
  if (site.scanned) return;
  site.scanned = true;
  site.revealed = 10;
  p.scans += 1;
  p.scanValue += site.value;
  p.banked += site.value;
  revealAround(site.x, site.y, 720);
  if (site.subtype === 'relay') {
    p.heat = clamp(p.heat - 18, 0, 100);
    p.pingCd = 0;
  }
  if (site.subtype === 'buoy') p.decoys = Math.min(MAX_DECOYS, p.decoys + 1);
  log(`已扫描${site.name}：资料 +${site.value}。`);
  toast(`遗迹扫描 ${Math.min(p.scans, SCAN_GOAL)}/${SCAN_GOAL}。周边目标已标记。`, 1800);
  if (audio) audio.pickup(false);
}

function collectSupplyDirect(s) {
  if (!s || s.taken) return false;
  s.taken = true;
  applySupply(s);
  if (audio) audio.pickup(false);
  return true;
}

function collectRelicDirect(r) {
  const p = G.player;
  if (!r || r.taken) return false;
  if (p.cargo.length >= p.cargoMax) {
    toast('货舱已满。返回灯塔卸货。');
    return false;
  }
  r.taken = true;
  p.cargo.push(r);
  if (r.kind === 'core') {
    p.cores += 1;
    log(`信号核心 ${p.cores}/${CORE_GOAL} 已固定。`);
    toast(`核心 ${p.cores}/${CORE_GOAL} 已进货舱。准备好后返回灯塔。`, 2200);
    if (audio) audio.pickup(true);
    if (!G.visionPlayed) showVision();
  } else {
    log(`已回收${r.name}：+${r.value}。`);
    if (audio) audio.pickup(false);
  }
  return true;
}

function deployDecoy() {
  const p = G.player;
  if (G.ended || G.paused) return;
  if (p.decoys <= 0) {
    toast('没有可用诱饵。');
    return;
  }
  p.decoys -= 1;
  const lead = 112;
  const x = p.x + Math.cos(p.angle) * lead;
  const y = p.y + Math.sin(p.angle) * lead;
  G.decoys.push({ x, y, age: 0, life: 8.5, pulse: 0 });
  G.lastPing = { x, y, t: G.t };
  G.pulses.push({ x, y, age: 0, max: 420, hit: new Set() });
  p.heat = clamp(p.heat + 5, 0, 100);
  log('诱饵已投放，捕食者会优先追踪它。');
  toast('诱饵已投放。趁现在改道。', 1300);
  if (audio) audio.ping(34);
}

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  return {
    x: (sx - W / 2) / zoom + G.cam.x,
    y: (sy - H / 2) / zoom + G.cam.y
  };
}

function clearNavigation(silent = false) {
  if (!G || !G.nav) return;
  G.nav = null;
  if (!silent) toast('自动导航已取消。', 900);
}

function navLabel(nav) {
  if (nav.kind === 'dock') return '灯塔';
  if (nav.kind === 'structure') return nav.target?.name || '遗迹扫描点';
  if (nav.kind === 'supply') return nav.target?.name || '补给';
  if (nav.kind === 'relic') return nav.target?.kind === 'core' ? '信号核心' : (nav.target?.name || '货物');
  return '航点';
}

function navPosition(nav = G.nav) {
  if (!nav) return null;
  if (nav.path && nav.path.length) return nav.path[0];
  if (nav.target) return { x: nav.target.x, y: nav.target.y };
  return { x: nav.x, y: nav.y };
}

function navFinalPosition(nav = G.nav) {
  if (!nav) return null;
  if (nav.kind === 'dock') return { x: 0, y: 0 };
  if (nav.target) return { x: nav.target.x, y: nav.target.y };
  if (nav.path && nav.path.length) return nav.path[nav.path.length - 1];
  return { x: nav.x, y: nav.y };
}

function navTargetDone(nav = G.nav) {
  if (!nav) return true;
  if (nav.kind === 'relic') return !nav.target || nav.target.taken;
  if (nav.kind === 'supply') return !nav.target || nav.target.taken;
  if (nav.kind === 'structure') return !nav.target || nav.target.scanned;
  return false;
}

function routeHazards(includeThreats = false) {
  const hazards = G.obstacles.map((o) => ({ x: o.x, y: o.y, rad: o.rad, kind: 'reef', weight: 1 }));
  if (!includeThreats) return hazards;
  G.mines.forEach((m) => {
    if (m.armed) hazards.push({ x: m.x, y: m.y, rad: 118, kind: 'mine', weight: 1.65 });
  });
  G.fauna.forEach((f) => {
    hazards.push({ x: f.x, y: f.y, rad: f.size + 96, kind: 'fauna', weight: 1.45 });
  });
  G.fish.forEach((f) => {
    hazards.push({ x: f.x, y: f.y, rad: 42 + f.scale * 18, kind: 'fish', weight: 0.55 });
  });
  if (G.leviathan.active) hazards.push({ x: G.leviathan.x, y: G.leviathan.y, rad: 220, kind: 'leviathan', weight: 2.2 });
  return hazards;
}

function routePlanningHazards(includeMines = false) {
  const hazards = G.obstacles.map((o) => ({ x: o.x, y: o.y, rad: o.rad, kind: 'reef', weight: 1 }));
  if (includeMines) {
    G.mines.forEach((m) => {
      if (m.armed) hazards.push({ x: m.x, y: m.y, rad: 118, kind: 'mine', weight: 1.55 });
    });
  }
  return hazards;
}

function segmentHitFromList(hazards, ax, ay, bx, by, pad = 52) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1) return null;
  let best = null;
  for (const o of hazards) {
    const radius = o.rad + pad * (o.weight || 1);
    const t = clamp(((o.x - ax) * dx + (o.y - ay) * dy) / len2, 0, 1);
    if (t < 0.018 || t > 0.982) continue;
    const cx = ax + dx * t;
    const cy = ay + dy * t;
    const gap = dist(cx, cy, o.x, o.y);
    if (gap >= radius) continue;
    if (!best || t < best.t) best = { obstacle: o, t, gap, radius };
  }
  return best;
}

function segmentObstacleHit(ax, ay, bx, by, pad = 52, includeThreats = false) {
  return segmentHitFromList(routeHazards(includeThreats), ax, ay, bx, by, pad);
}

function waypointPenaltyFromList(hazards, x, y, pad = 46) {
  let penalty = 0;
  for (const o of hazards) {
    const gap = dist(x, y, o.x, o.y) - o.rad;
    if (gap < pad) penalty += (pad - gap) * 18 * (o.weight || 1);
  }
  return penalty;
}

function waypointPenalty(x, y, pad = 46, includeThreats = false) {
  return waypointPenaltyFromList(routeHazards(includeThreats), x, y, pad);
}

function corridorInfo(o, start, target) {
  const dx = target.x - start.x;
  const dy = target.y - start.y;
  const len2 = dx * dx + dy * dy || 1;
  const t = clamp(((o.x - start.x) * dx + (o.y - start.y) * dy) / len2, -0.2, 1.2);
  const cx = start.x + dx * clamp(t, 0, 1);
  const cy = start.y + dy * clamp(t, 0, 1);
  const gap = dist(cx, cy, o.x, o.y) - o.rad;
  return { t, gap, along: Math.abs(t - 0.5) };
}

function nodeIsClear(node, hazards, pad = 54) {
  for (const o of hazards) {
    const minD = o.rad + pad * (o.weight || 1);
    if (dist(node.x, node.y, o.x, o.y) < minD) return false;
  }
  return true;
}

function routeFallback(start, target, hazards, pad) {
  const hit = segmentHitFromList(hazards, start.x, start.y, target.x, target.y, pad);
  if (!hit) return [target];
  const o = hit.obstacle;
  const base = angleTo(o.x, o.y, target.x, target.y);
  let best = null;
  for (let ring = 0; ring < 4; ring++) {
    const radius = o.rad + 130 + (o.weight || 1) * 42 + ring * 64;
    for (let i = 0; i < 16; i++) {
      const a = base + (i / 16) * TAU;
      const wp = { x: o.x + Math.cos(a) * radius, y: o.y + Math.sin(a) * radius };
      if (!nodeIsClear(wp, hazards, 44)) continue;
      if (segmentHitFromList(hazards, start.x, start.y, wp.x, wp.y, pad)) continue;
      if (segmentHitFromList(hazards, wp.x, wp.y, target.x, target.y, pad)) continue;
      const cost = dist(start.x, start.y, wp.x, wp.y) + dist(wp.x, wp.y, target.x, target.y);
      if (!best || cost < best.cost) best = { wp, cost };
    }
  }
  return best ? [best.wp, target] : [target];
}

function pathClearFrom(start, path, hazards, pad) {
  let from = start;
  for (const to of path) {
    if (segmentHitFromList(hazards, from.x, from.y, to.x, to.y, pad)) return false;
    from = to;
  }
  return true;
}

function planRouteTo(tx, ty, options = {}) {
  const t0 = performance.now();
  const p = G.player;
  const start = { x: p.x, y: p.y };
  const target = { x: tx, y: ty };
  const includeThreats = Boolean(options.avoidThreats);
  const hazards = routePlanningHazards(includeThreats);
  const pad = includeThreats ? 58 : 52;

  const finishRoute = (route) => {
    if (G.perf) G.perf.lastRouteMs = performance.now() - t0;
    return route;
  };

  if (!segmentHitFromList(hazards, start.x, start.y, target.x, target.y, pad)) return finishRoute([target]);

  const relevant = hazards
    .map((o) => ({ o, info: corridorInfo(o, start, target) }))
    .filter(({ info, o }) => info.t > -0.12 && info.t < 1.12 && info.gap < 390 + (o.weight || 1) * 90)
    .sort((a, b) => (a.info.gap - b.info.gap) || (a.info.along - b.info.along))
    .slice(0, 10)
    .map(({ o }) => o);

  const nodes = [
    { x: start.x, y: start.y, fixed: true },
    { x: target.x, y: target.y, fixed: true }
  ];
  const seen = new Set();
  const addNode = (x, y) => {
    const key = `${Math.round(x / 12)},${Math.round(y / 12)}`;
    if (seen.has(key)) return;
    const node = { x, y };
    if (!nodeIsClear(node, hazards, 46)) return;
    seen.add(key);
    nodes.push(node);
  };

  for (const [index, o] of relevant.entries()) {
    const toStart = angleTo(o.x, o.y, start.x, start.y);
    const toTarget = angleTo(o.x, o.y, target.x, target.y);
    const angles = [
      toStart, toTarget,
      toStart + Math.PI / 2, toStart - Math.PI / 2,
      toTarget + Math.PI / 2, toTarget - Math.PI / 2,
      0, Math.PI
    ];
    const rings = index < 5 ? [0, 84] : [0];
    for (const extra of rings) {
      const radius = o.rad + 124 + (o.weight || 1) * 38 + extra;
      for (const a of angles) addNode(o.x + Math.cos(a) * radius, o.y + Math.sin(a) * radius);
    }
  }

  const n = nodes.length;
  const graph = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const d = dist(a.x, a.y, b.x, b.y);
      if (d > 1850 && i > 1 && j > 1) continue;
      if (segmentHitFromList(hazards, a.x, a.y, b.x, b.y, pad)) continue;
      const risk = (i <= 1 ? 0 : waypointPenaltyFromList(hazards, a.x, a.y, 54) * 0.04)
        + (j <= 1 ? 0 : waypointPenaltyFromList(hazards, b.x, b.y, 54) * 0.04);
      const cost = d + risk;
      graph[i].push([j, cost]);
      graph[j].push([i, cost]);
    }
  }

  const cost = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  const used = Array(n).fill(false);
  cost[0] = 0;
  for (let step = 0; step < n; step++) {
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!used[i] && (u === -1 || cost[i] < cost[u])) u = i;
    }
    if (u === -1 || !Number.isFinite(cost[u])) break;
    if (u === 1) break;
    used[u] = true;
    for (const [v, w] of graph[u]) {
      const next = cost[u] + w;
      if (next < cost[v]) {
        cost[v] = next;
        prev[v] = u;
      }
    }
  }

  if (prev[1] === -1) {
    const fallback = routeFallback(start, target, hazards, pad);
    if (pathClearFrom(start, fallback, hazards, pad)) return finishRoute(fallback);
    if (includeThreats) return finishRoute(planRouteTo(tx, ty, { avoidThreats: false }));
    return finishRoute(fallback);
  }
  const out = [];
  for (let at = 1; at !== 0 && at !== -1; at = prev[at]) out.push({ x: nodes[at].x, y: nodes[at].y });
  out.reverse();
  if (out.length && pathClearFrom(start, out, hazards, pad)) return finishRoute(out);
  if (includeThreats) return finishRoute(planRouteTo(tx, ty, { avoidThreats: false }));
  return finishRoute(out.length ? out : [target]);
}

function routeClearance(path = G.nav?.path || [], includeThreats = true) {
  const points = Array.isArray(path) ? path : [];
  let from = { x: G.player.x, y: G.player.y };
  const pad = includeThreats ? 58 : 52;
  for (let i = 0; i < points.length; i++) {
    const to = points[i];
    const hit = segmentObstacleHit(from.x, from.y, to.x, to.y, pad, includeThreats);
    if (hit) {
      return {
        clear: false,
        segment: i,
        from,
        to: { x: to.x, y: to.y },
        obstacle: {
          x: hit.obstacle.x,
          y: hit.obstacle.y,
          rad: hit.obstacle.rad,
          kind: hit.obstacle.kind,
          gap: hit.gap,
          radius: hit.radius
        }
      };
    }
    from = { x: to.x, y: to.y };
  }
  return { clear: true, segments: points.length };
}

function candidateAtWorld(x, y) {
  const slack = 28 / zoom;
  let best = null;
  const consider = (obj, kind, radius, label) => {
    const d = dist(x, y, obj.x, obj.y);
    if (d > radius + slack) return;
    const score = d / Math.max(1, radius + slack);
    if (!best || score < best.score) best = { kind, target: obj, x: obj.x, y: obj.y, label, score };
  };

  if (Math.hypot(x, y) < 108 + slack) {
    best = { kind: 'dock', x: 0, y: 0, label: '灯塔', score: 0 };
  }

  for (const site of G.structures) {
    if (site.scanned || !visible(site, 155)) continue;
    consider(site, 'structure', Math.max(54, site.rad * 0.78), site.name);
  }
  for (const r of G.relics) {
    if (r.taken || !visible(r, r.kind === 'core' ? 190 : 130)) continue;
    consider(r, 'relic', r.kind === 'core' ? 42 : 36 + (r.weight || 1) * 5, r.kind === 'core' ? '信号核心' : r.name);
  }
  for (const s of G.supplies) {
    if (s.taken || !visible(s, 125)) continue;
    consider(s, 'supply', 38, s.name);
  }
  return best;
}

function setNavigation(nav) {
  if (!G || !G.started || G.ended) return;
  const next = { ...nav };
  if (!next.path) {
    const target = next.kind === 'dock'
      ? { x: 0, y: 0 }
      : (next.target ? { x: next.target.x, y: next.target.y } : { x: next.x, y: next.y });
    next.path = planRouteTo(target.x, target.y, { avoidThreats: Boolean(next.kind === 'dock' || next.ai || next.avoidThreats) });
  }
  if (next.path) next.path = next.path.map((pt) => ({ x: pt.x, y: pt.y }));
  const pos = navPosition(next);
  if (!pos) return;
  keys.clear();
  just.clear();
  G.nav = { ...next, x: pos.x, y: pos.y, created: G.t };
  if (G.nav.target) G.nav.target.revealed = Math.max(G.nav.target.revealed || 0, 8);
  toast(G.nav.message || (G.nav.kind === 'point' ? '航点已标记，自动航行中。' : `自动导航至${navLabel(G.nav)}。`), 1200);
}

function startReturnHome() {
  if (!G || !G.started || G.ended || G.paused || pauseMenuOpen) return;
  if (G.ai?.enabled) setAiCruise(false, true);
  setNavigation({
    kind: 'dock',
    x: 0,
    y: 0,
    label: '灯塔',
    path: planRouteTo(0, 0, { avoidThreats: true }),
    avoidThreats: true,
    message: '返航路线已规划，自动绕开礁石返回灯塔。'
  });
}

function setAiCruise(on, silent = false) {
  if (!G) return;
  G.ai.enabled = Boolean(on);
  G.ai.mode = G.ai.enabled ? '评估航线' : '待命';
  G.ai.lastPlan = -99;
  if (!G.ai.enabled && G.nav?.ai) clearNavigation(true);
  syncAiButton();
  if (!silent) toast(G.ai.enabled ? 'AI巡航已开启。' : 'AI巡航已关闭。', 1200);
}

function markUserInput(disableAi = true) {
  if (!G || !G.started) return;
  G.ai.lastInput = G.t;
  if (disableAi && G.ai.enabled) setAiCruise(false, true);
}

function toggleAiCruise() {
  if (!G || !G.started || G.ended || G.paused || pauseMenuOpen) return;
  setAiCruise(!G.ai.enabled);
}

function targetPenalty(x, y) {
  let penalty = waypointPenalty(x, y, 70, true) * 0.35;
  for (const f of G.fauna) {
    const gap = dist(x, y, f.x, f.y);
    if (gap < 280) penalty += (280 - gap) * 2.2;
  }
  for (const m of G.mines) {
    if (!m.armed) continue;
    const gap = dist(x, y, m.x, m.y);
    if (gap < 220) penalty += (220 - gap) * 2.6;
  }
  return penalty;
}

function bestByScore(items, scoreFn) {
  let best = null;
  for (const item of items) {
    const score = scoreFn(item);
    if (!Number.isFinite(score)) continue;
    if (!best || score < best.score) best = { item, score };
  }
  return best?.item || null;
}

function bestSupply(kind) {
  const p = G.player;
  return bestByScore(G.supplies.filter((s) => !s.taken && (!kind || s.kind === kind)), (s) => (
    dist(p.x, p.y, s.x, s.y) + targetPenalty(s.x, s.y)
  ));
}

function bestRelic(predicate) {
  const p = G.player;
  return bestByScore(G.relics.filter((r) => !r.taken && predicate(r)), (r) => (
    dist(p.x, p.y, r.x, r.y) + targetPenalty(r.x, r.y) - (r.value || 0) * 0.55 + (r.weight || 1) * 52
  ));
}

function bestStructure() {
  const p = G.player;
  return bestByScore(G.structures.filter((s) => !s.scanned), (s) => (
    dist(p.x, p.y, s.x, s.y) + targetPenalty(s.x, s.y) - (s.value || 0) * 0.32
  ));
}

function aiNav(kind, target, priority, mode) {
  return {
    kind,
    target,
    x: target.x,
    y: target.y,
    ai: true,
    avoidThreats: true,
    aiPriority: priority,
    aiMode: mode,
    message: `AI巡航：${mode}。`
  };
}

function aiDock(priority, mode) {
  return {
    kind: 'dock',
    x: 0,
    y: 0,
    label: '灯塔',
    ai: true,
    avoidThreats: true,
    aiPriority: priority,
    aiMode: mode,
    message: `AI巡航：${mode}。`
  };
}

function chooseAiNav() {
  const p = G.player;
  const atBeacon = Math.hypot(p.x, p.y) < 92;
  if (atBeacon && p.dockCd <= 0 && (p.cargo.length || p.oxygen < 92 || p.hull < 82 || p.decoys < 1)) {
    dock();
    G.ai.mode = '灯塔补给';
    return null;
  }

  if (p.oxygen < 34) {
    const oxygen = bestSupply('oxygen');
    return oxygen ? aiNav('supply', oxygen, 120, '氧气不足，寻找氧气罐') : aiDock(118, '氧气不足，紧急返航');
  }
  if (p.hull < 54) {
    const repair = bestSupply('repair');
    return repair ? aiNav('supply', repair, 116, '船体受损，寻找维修胶') : aiDock(114, '船体受损，紧急返航');
  }
  if (p.cargo.length >= p.cargoMax) return aiDock(110, '货舱已满，返航入库');
  if (p.oxygen < 52) {
    const oxygen = bestSupply('oxygen');
    if (oxygen) return aiNav('supply', oxygen, 104, '氧气偏低，补充氧气');
  }
  if (p.hull < 76) {
    const repair = bestSupply('repair');
    if (repair) return aiNav('supply', repair, 102, '船体受损，优先维修');
  }

  const scanQuota = Math.min(SCAN_GOAL, Math.floor(p.cores * 1.15) + 1);
  if (p.scans < scanQuota) {
    const site = bestStructure();
    if (site) return aiNav('structure', site, 90, '扫描遗迹资料');
  }
  const core = p.cores < CORE_GOAL ? bestRelic((r) => r.kind === 'core') : null;
  if (core) return aiNav('relic', core, 92, '回收信号核心');
  const site = p.scans < SCAN_GOAL ? bestStructure() : null;
  if (site) return aiNav('structure', site, 88, '扫描遗迹资料');

  if (p.oxygen < 72) {
    const oxygen = bestSupply('oxygen');
    if (oxygen) return aiNav('supply', oxygen, 78, '顺路补充氧气');
  }
  if (p.hull < 90) {
    const repair = bestSupply('repair');
    if (repair) return aiNav('supply', repair, 76, '顺路修补船体');
  }

  const salvage = p.cargo.length < p.cargoMax ? bestRelic((r) => r.kind === 'relic') : null;
  if (salvage) return aiNav('relic', salvage, 62, `搜集${salvage.name}`);
  return aiDock(50, '没有更优目标，返航整备');
}

function sameAiNav(a, b) {
  if (!a || !b) return false;
  if (a.kind !== b.kind) return false;
  if (a.kind === 'dock') return true;
  return a.target && a.target === b.target;
}

function nearestPredatorDistance() {
  const p = G.player;
  let best = Infinity;
  for (const f of G.fauna) best = Math.min(best, dist(p.x, p.y, f.x, f.y));
  if (G.leviathan.active) best = Math.min(best, dist(p.x, p.y, G.leviathan.x, G.leviathan.y));
  return best;
}

function updateAiCruise() {
  if (!G.ended && !G.paused && !pauseMenuOpen && !G.ai.enabled && G.started && G.t - G.ai.lastInput >= 10) {
    setAiCruise(true, true);
    G.ai.mode = '10秒未操作，自动接管';
    toast('10秒未操作，AI巡航接管。', 1500);
  }
  if (!G.ai.enabled || G.ended || G.paused || pauseMenuOpen) return;
  const p = G.player;
  const threat = nearestPredatorDistance();
  if (threat < 210 && p.decoys > 0 && G.t - G.ai.lastDecoy > 7) {
    deployDecoy();
    G.ai.lastDecoy = G.t;
    G.ai.mode = '捕食者接近，投放诱饵';
  }

  if (G.t - G.ai.lastPlan < 0.55) return;
  G.ai.lastPlan = G.t;
  const desired = chooseAiNav();
  if (!desired) return;
  const current = G.nav?.ai ? G.nav : null;
  if (current && !navTargetDone(current) && sameAiNav(current, desired) && (desired.aiPriority || 0) <= (current.aiPriority || 0) + 8) {
    G.ai.mode = current.aiMode || desired.aiMode;
    return;
  }
  G.ai.mode = desired.aiMode || navLabel(desired);
  setNavigation(desired);
}

function handleCanvasPointer(e) {
  if (e.button === 2) {
    e.preventDefault();
    markUserInput();
    clearNavigation();
    return;
  }
  if (e.button !== 0 || !G || !G.started || G.ended || G.paused || pauseMenuOpen) return;
  e.preventDefault();
  markUserInput();
  const w = screenToWorld(e.clientX, e.clientY);
  const hit = candidateAtWorld(w.x, w.y);
  if (hit) setNavigation(hit);
  else setNavigation({ kind: 'point', x: w.x, y: w.y, label: '航点' });
}

canvas.addEventListener('pointerdown', handleCanvasPointer);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function interactWithNavigationTarget() {
  const nav = G.nav;
  if (!nav) return false;
  if (navTargetDone(nav)) {
    clearNavigation(true);
    return false;
  }
  const p = G.player;
  const pos = navPosition(nav);
  if (!pos) return false;
  const d = dist(p.x, p.y, pos.x, pos.y);
  if (nav.path && nav.path.length > 1) {
    if (d < NAV_ARRIVE + 12) {
      nav.path.shift();
      const next = navPosition(nav);
      if (next) {
        nav.x = next.x;
        nav.y = next.y;
      }
      return true;
    }
    return false;
  }
  if (nav.kind === 'point') {
    if (d < NAV_ARRIVE) {
      clearNavigation(true);
      toast('已抵达航点。', 900);
      return true;
    }
    return false;
  }
  if (nav.kind === 'dock') {
    if (d < 92) {
      dock();
      clearNavigation(true);
      return true;
    }
    return false;
  }
  if (nav.kind === 'supply' && d < 42) {
    if (collectSupplyDirect(nav.target)) clearNavigation(true);
    return true;
  }
  if (nav.kind === 'structure' && d < nav.target.rad * 0.65 + 30) {
    scanStructure(nav.target);
    clearNavigation(true);
    return true;
  }
  if (nav.kind === 'relic' && d < NAV_INTERACT) {
    if (collectRelicDirect(nav.target)) clearNavigation(true);
    return true;
  }
  return false;
}

function navigationSteer(p) {
  if (!G.nav) return null;
  let pos = navPosition();
  if (!pos) return null;
  if (G.nav.path?.length && segmentObstacleHit(p.x, p.y, pos.x, pos.y, 52, false) && G.t - (G.nav.replannedAt || -99) > 0.35) {
    const final = navFinalPosition();
    if (final) {
      const repaired = planRouteTo(final.x, final.y, { avoidThreats: Boolean(G.nav.avoidThreats || G.nav.ai) });
      if (repaired?.length) {
        G.nav.path = repaired.map((pt) => ({ x: pt.x, y: pt.y }));
        G.nav.replannedAt = G.t;
        pos = navPosition();
      }
    }
  }
  const d = dist(p.x, p.y, pos.x, pos.y);
  if (d < NAV_ARRIVE) return null;
  let sx = (pos.x - p.x) / d;
  let sy = (pos.y - p.y) / d;
  let ax = sx;
  let ay = sy;
  const avoidThreats = Boolean(G.nav?.avoidThreats || G.nav?.ai || G.ai?.enabled);
  for (const o of routeHazards(avoidThreats)) {
    const od = dist(p.x, p.y, o.x, o.y);
    const range = o.rad + 108 + (avoidThreats && o.kind !== 'reef' ? 54 : 0);
    if (od <= 0.001 || od > range) continue;
    const toward = ((o.x - p.x) * sx + (o.y - p.y) * sy) / od;
    if (toward < -0.15) continue;
    const force = (1 - od / range) * (0.95 + toward * 0.55) * (o.weight || 1);
    ax += ((p.x - o.x) / od) * force;
    ay += ((p.y - o.y) / od) * force;
  }
  const len = Math.hypot(ax, ay) || 1;
  return { x: ax / len, y: ay / len, distance: d };
}

function newGame(seed = Math.floor(Date.now() % 1000000)) {
  const rng = mulberry32(seed);
  const relics = [];
  const occupied = [];
  for (let i = 0; i < CORE_COUNT; i++) {
    const a = i * TAU / CORE_COUNT - 0.35 + (rng() - 0.5) * 0.36;
    const r = 1580 + (i / Math.max(1, CORE_COUNT - 1)) * 1180 + (rng() - 0.5) * 180;
    relics.push({
      id: `core-${i + 1}`,
      kind: 'core',
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      value: 900,
      weight: 1,
      revealed: 0,
      taken: false,
      pulse: rng() * TAU
    });
    occupied.push({ x: relics[relics.length - 1].x, y: relics[relics.length - 1].y, rad: 190 });
  }
  const relicBands = [
    { min: 860, max: 1500, chance: 0.28 },
    { min: 1500, max: 2250, chance: 0.46 },
    { min: 2250, max: WORLD_RADIUS, chance: 0.26 }
  ];
  for (let i = 0; i < 32; i++) {
    const pnt = placeFromBands(rng, relicBands, occupied, 170);
    const type = choice(rng, SALVAGE_TYPES);
    relics.push({
      id: `relic-${i}`,
      kind: 'relic',
      subtype: type.key,
      name: type.name,
      sprite: type.sprite,
      x: pnt.x,
      y: pnt.y,
      value: type.value + Math.floor(rng() * 90),
      weight: type.weight,
      revealed: 0,
      taken: false,
      pulse: rng() * TAU
    });
  }

  const supplies = [];
  const supplyBands = [
    { min: 720, max: 1400, chance: 0.40 },
    { min: 1400, max: 2260, chance: 0.43 },
    { min: 2260, max: WORLD_RADIUS, chance: 0.17 }
  ];
  for (let i = 0; i < 30; i++) {
    const pnt = placeFromBands(rng, supplyBands, occupied, 190);
    const type = weightedChoice(rng, SUPPLY_TYPES);
    supplies.push({
      kind: type.kind,
      name: type.name,
      sprite: type.sprite,
      x: pnt.x,
      y: pnt.y,
      revealed: 0,
      taken: false,
      spin: rng() * TAU
    });
  }

  const obstacles = [];
  for (let i = 0; i < 140; i++) {
    const a = rng() * TAU;
    const r = 380 + rng() * 2580;
    obstacles.push({
      x: Math.cos(a) * r + (rng() - 0.5) * 160,
      y: Math.sin(a) * r + (rng() - 0.5) * 160,
      rad: 28 + rng() * 72,
      jag: 0.45 + rng() * 0.9,
      seed: rng() * 1000,
      variant: Math.floor(rng() * 3),
      rot: rng() * TAU,
      scale: 0.85 + rng() * 0.55
    });
  }

  const vents = [];
  for (let i = 0; i < 26; i++) {
    const a = rng() * TAU;
    const r = 760 + rng() * 2140;
    vents.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      rad: 72 + rng() * 60,
      phase: rng() * TAU,
      variant: rng() < 0.55 ? 'brine' : 'crack',
      revealed: 0
    });
  }

  const decor = [];
  for (let i = 0; i < 260; i++) {
    const a = rng() * TAU;
    const r = 180 + rng() * 2820;
    decor.push({
      kind: 'kelp',
      x: Math.cos(a) * r + (rng() - 0.5) * 110,
      y: Math.sin(a) * r + (rng() - 0.5) * 110,
      variant: Math.floor(rng() * 3),
      scale: 0.55 + rng() * 1.15,
      rot: rng() * TAU,
      phase: rng() * TAU
    });
  }

  const fish = [];
  for (let i = 0; i < 72; i++) {
    const a = rng() * TAU;
    const r = 680 + rng() * 2240;
    fish.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      baseX: 0,
      baseY: 0,
      variant: Math.floor(rng() * 2),
      scale: 0.55 + rng() * 0.85,
      speed: 18 + rng() * 28,
      phase: rng() * TAU,
      dir: rng() < 0.5 ? -1 : 1
    });
    fish[i].baseX = fish[i].x;
    fish[i].baseY = fish[i].y;
  }

  const fauna = [];
  for (let i = 0; i < 28; i++) {
    const a = rng() * TAU;
    const r = 940 + rng() * 1980;
    const variant = Math.floor(rng() * HUNTER_SPRITES.length);
    fauna.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      vx: 0,
      vy: 0,
      size: 16 + rng() * 30,
      aggression: 0.2 + rng() * 1.05 + variant * 0.06,
      phase: rng() * TAU,
      variant,
      revealed: 0,
      biteCd: 0
    });
  }

  const structures = [];
  const structureBands = [
    { min: 920, max: 1580, chance: 0.30 },
    { min: 1580, max: 2380, chance: 0.46 },
    { min: 2380, max: WORLD_RADIUS, chance: 0.24 }
  ];
  for (let i = 0; i < 24; i++) {
    const pnt = placeFromBands(rng, structureBands, occupied, 250);
    const type = choice(rng, STRUCTURE_TYPES);
    structures.push({
      id: `site-${i}`,
      subtype: type.key,
      name: type.name,
      sprite: type.sprite,
      x: pnt.x + (rng() - 0.5) * 90,
      y: pnt.y + (rng() - 0.5) * 90,
      rad: type.rad,
      value: type.scan + Math.floor(rng() * 90),
      revealed: 0,
      scanned: false,
      rot: rng() * TAU,
      pulse: rng() * TAU
    });
  }

  const mines = [];
  for (let i = 0; i < 32; i++) {
    const a = rng() * TAU;
    const r = 980 + rng() * 1980;
    mines.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      spin: rng() * TAU,
      revealed: 0,
      armed: true,
      lastWarn: 0
    });
  }

  const currents = [];
  for (let i = 0; i < 16; i++) {
    const a = rng() * TAU;
    const r = 820 + rng() * 2100;
    currents.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      rad: 130 + rng() * 110,
      angle: rng() * TAU,
      strength: 46 + rng() * 42,
      phase: rng() * TAU,
      revealed: 0
    });
  }

  pushClearOfHazards(relics, obstacles, 86);
  pushClearOfHazards(supplies, obstacles, 76);
  pushClearOfHazards(structures, obstacles, 96);

  return {
    seed,
    rng,
    started: false,
    ended: false,
    endedWin: false,
    paused: false,
    t: 0,
    shake: 0,
    lastWarn: 0,
    visionPlayed: false,
    player: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      hull: 100,
      oxygen: 100,
      heat: 0,
      cargo: [],
      cargoMax: CARGO_SLOTS,
      banked: 0,
      cores: 0,
      scans: 0,
      scanValue: 0,
      decoys: 1,
      silentT: 0,
      coolantT: 0,
      pingCd: 0,
      dockCd: 0
    },
    cam: { x: 0, y: 0 },
    nav: null,
    ai: { enabled: false, mode: '待命', lastPlan: -99, lastDecoy: -99, lastInput: 0 },
    ui: { hudAt: -99, panelAt: -99, miniAt: -99, cargoSig: '', panelSig: '', logSig: '' },
    perf: { lastRouteMs: 0 },
    lastPing: { x: 0, y: 0, t: -99 },
    pulses: [],
    relics,
    supplies,
    vents,
    decor,
    fish,
    obstacles,
    fauna,
    structures,
    mines,
    currents,
    decoys: [],
    leviathan: { active: false, x: 0, y: 0, vx: 0, vy: 0, revealed: 0, biteCd: 0 },
    log: []
  };
}

function reset() {
  hidePauseMenu();
  G = newGame();
  log(`灯塔已上线。需要回收${CORE_GOAL}个信号核心并扫描${SCAN_GOAL}处遗迹。`);
  log('点击海域可自动航行；点击目标会自动拾取或扫描。');
  ending.classList.remove('show');
  overlay.classList.remove('hide');
  syncAiButton();
  updateUI(true);
}

reset();
applySettings();

async function boot() {
  media = await preloadMedia((done, total, label) => {
    progress.textContent = `正在装载 ${done}/${total}`;
  });
  audio = new AudioSys(media);
  applySettings();
  progress.textContent = '准备就绪';
}

boot();

function start() {
  hidePauseMenu();
  overlay.classList.add('hide');
  G.started = true;
  G.paused = false;
  G.ai.lastInput = G.t;
  running = true;
  if (audio) audio.init();
  toast('谨慎使用声呐。海沟会听见每一次回声。');
  last = performance.now();
}

function restartRun() {
  reset();
  start();
}

function returnToTitle() {
  reset();
  running = false;
  hidePauseMenu();
  overlay.classList.remove('hide');
}

startBtn.addEventListener('click', start);
muteBtn.addEventListener('click', () => toggleMute());
pauseMuteBtn.addEventListener('click', () => toggleMute());
aiBtn.addEventListener('click', () => {
  markUserInput(false);
  toggleAiCruise();
});
returnBtn.addEventListener('click', () => {
  markUserInput();
  startReturnHome();
});
resumeBtn.addEventListener('click', closePauseMenu);
pauseRestartBtn.addEventListener('click', restartRun);
titleBtn.addEventListener('click', returnToTitle);
restartBtn.addEventListener('click', restartRun);
closeEndBtn.addEventListener('click', () => {
  if (G?.ended && !G.endedWin) {
    returnToTitle();
    return;
  }
  ending.classList.remove('show');
  toast('按 R 重新开始，按 Esc 打开结算菜单。', 1700);
});
musicRange.addEventListener('input', () => {
  settings.musicVolume = clamp(Number(musicRange.value) / 100, 0, 1);
  musicValue.textContent = `${Math.round(settings.musicVolume * 100)}%`;
  if (audio) audio.setMusicVolume(settings.musicVolume);
  saveSettings();
});
sfxRange.addEventListener('input', () => {
  settings.sfxVolume = clamp(Number(sfxRange.value) / 100, 0, 1);
  sfxValue.textContent = `${Math.round(settings.sfxVolume * 100)}%`;
  if (audio) audio.setSfxVolume(settings.sfxVolume);
  saveSettings();
});
reduceMotionToggle.addEventListener('change', () => {
  settings.reduceMotion = reduceMotionToggle.checked;
  applySettings();
  saveSettings();
});
contrastToggle.addEventListener('change', () => {
  settings.highContrast = contrastToggle.checked;
  applySettings();
  saveSettings();
});

function toggleMute() {
  muted = !muted;
  if (audio) audio.setMuted(muted);
  syncMuteButtons();
  saveSettings();
  toast(muted ? '已静音。' : '声音已开启。');
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    e.preventDefault();
    markUserInput();
    if (G?.ended) {
      ending.classList.add('show');
      return;
    }
    togglePauseMenu();
    return;
  }
  if (pauseMenuOpen) return;
  if (e.code === 'KeyC') {
    markUserInput(false);
    toggleAiCruise();
    return;
  }
  markUserInput();
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (!keys.has(e.code)) just.add(e.code);
  keys.add(e.code);
  if (e.code === 'KeyM') toggleMute();
  if (e.code === 'KeyH') startReturnHome();
  if (e.code === 'KeyR' && G.ended) {
    reset();
    start();
  }
});

window.addEventListener('keyup', (e) => keys.delete(e.code));

function doPing() {
  const p = G.player;
  if (p.pingCd > 0 || G.paused || G.ended) return;
  p.pingCd = 1.05;
  p.heat = clamp(p.heat + 14, 0, 100);
  p.oxygen = clamp(p.oxygen - 0.55, 0, 100);
  G.lastPing = { x: p.x, y: p.y, t: G.t };
  G.pulses.push({ x: p.x, y: p.y, age: 0, max: 660 + p.heat * 3.4, hit: new Set() });
  if (audio) audio.ping(p.heat);
  G.shake = Math.max(G.shake, 2.4);
}

function tryCollect() {
  const p = G.player;
  if (G.ended) return;
  for (const s of G.supplies) {
    if (s.taken) continue;
    if (dist(p.x, p.y, s.x, s.y) < 42) {
      collectSupplyDirect(s);
      return;
    }
  }
  for (const site of G.structures) {
    if (site.scanned) continue;
    if (dist(p.x, p.y, site.x, site.y) < site.rad * 0.65 + 30) {
      scanStructure(site);
      return;
    }
  }
  for (const r of G.relics) {
    if (r.taken) continue;
    if (dist(p.x, p.y, r.x, r.y) < 46) {
      collectRelicDirect(r);
      return;
    }
  }
}

function dock() {
  const p = G.player;
  const d = Math.hypot(p.x, p.y);
  if (d > 92 || p.dockCd > 0) return;
  p.dockCd = 0.8;
  if (!p.cargo.length) {
    p.oxygen = 100;
    p.hull = Math.max(p.hull, 82);
    p.decoys = Math.max(p.decoys, 1);
    toast('灯塔已补满氧气，修补船体，并补充一个诱饵。');
    if (audio) audio.dock();
    return;
  }
  let value = 0;
  let cores = 0;
  for (const item of p.cargo) {
    value += item.value;
    if (item.kind === 'core') cores += 1;
  }
  p.banked += value;
  p.cargo.length = 0;
  log(`货物已入库：+${value}。`);
  if (audio) audio.dock();
  if (p.cores >= CORE_GOAL && p.scans >= SCAN_GOAL) {
    end(true);
  } else {
    const needCore = Math.max(0, CORE_GOAL - p.cores);
    const needScan = Math.max(0, SCAN_GOAL - p.scans);
    toast(`还缺 ${needCore} 个核心、${needScan} 处遗迹扫描。`);
  }
}

function showVision() {
  G.visionPlayed = true;
  if (!media || !media.videos.core) return;
  G.paused = true;
  visionVideo.src = media.videos.core;
  visionEl.classList.add('show');
  const done = () => {
    visionVideo.pause();
    visionEl.classList.remove('show');
    G.paused = false;
  };
  visionVideo.onended = done;
  visionVideo.onerror = done;
  visionVideo.currentTime = 0;
  visionVideo.play().catch(done);
  setTimeout(() => {
    if (visionEl.classList.contains('show')) done();
  }, 9200);
}

function damage(amount, why) {
  const p = G.player;
  p.hull = clamp(p.hull - amount, 0, 100);
  G.shake = Math.max(G.shake, amount * 0.32);
  if (audio) audio.hull(clamp(amount / 18, 0.25, 1.2));
  log(why);
  if (p.hull <= 0) end(false, '船体在深压下失效。');
}

function end(win, reason = '') {
  if (G.ended) return;
  G.ended = true;
  G.endedWin = win;
  G.paused = false;
  G.nav = null;
  running = false;
  keys.clear();
  just.clear();
  hidePauseMenu();
  endTitle.textContent = win ? '回收完成' : '潜航失败';
  const p = G.player;
  p.vx = 0;
  p.vy = 0;
  const loose = p.cargo.reduce((sum, item) => sum + item.value, 0);
  const score = p.banked + (win ? loose : 0);
  endText.innerHTML = win
    ? `核心与遗迹资料已送回灯塔。总价值：<b>${score}</b>。遗迹扫描：<b>${p.scans}</b>。潜航时间：<b>${formatTime(G.t)}</b>。`
    : `${reason || '海沟吞没了潜艇。'}<br>已入库价值：<b>${p.banked}</b>。遗失货物：<b>${loose}</b>。潜航时间：<b>${formatTime(G.t)}</b>。`;
  closeEndBtn.textContent = win ? '继续查看' : '返回标题';
  ending.classList.add('show');
}

function update(dt) {
  if (!G.started || G.ended || G.paused) return;
  const p = G.player;
  G.t += dt;
  p.pingCd = Math.max(0, p.pingCd - dt);
  p.dockCd = Math.max(0, p.dockCd - dt);
  p.silentT = Math.max(0, p.silentT - dt);
  p.coolantT = Math.max(0, p.coolantT - dt);
  if (keys.size) G.ai.lastInput = G.t;
  updateAiCruise();
  if (G.nav) {
    const navPos = navPosition();
    if (navPos) {
      G.nav.x = navPos.x;
      G.nav.y = navPos.y;
    }
  }
  for (const decoy of G.decoys) {
    decoy.age += dt;
    decoy.pulse += dt;
  }
  G.decoys = G.decoys.filter((d) => d.age < d.life);

  if (just.has('Space')) doPing();
  if (just.has('KeyQ')) deployDecoy();
  if (just.has('KeyE')) {
    if (Math.hypot(p.x, p.y) < 92) dock();
    else tryCollect();
  }
  interactWithNavigationTarget();

  let mx = 0;
  let my = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  const manualMoving = Boolean(mx || my);
  if (manualMoving && G.nav) clearNavigation(true);
  const steer = !manualMoving ? navigationSteer(p) : null;
  if (steer) {
    mx = steer.x;
    my = steer.y;
  }
  const moving = mx || my;
  if (moving) {
    const len = Math.hypot(mx, my) || 1;
    mx /= len; my /= len;
    const overdrive = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const weight = cargoWeight(p);
    const weightScale = clamp(1 - weight * 0.045, 0.66, 1);
    const quiet = p.silentT > 0 ? 0.48 : 1;
    const spd = (overdrive ? 260 : 156) * weightScale;
    p.vx = smooth(p.vx, mx * spd, dt, overdrive ? 3.6 : 2.8);
    p.vy = smooth(p.vy, my * spd, dt, overdrive ? 3.6 : 2.8);
    p.angle = lerp(p.angle, p.angle + wrapAngle(Math.atan2(my, mx) - p.angle), Math.min(1, dt * 8));
    if (overdrive) {
      p.heat = clamp(p.heat + dt * 5.2 * quiet, 0, 100);
      p.oxygen = clamp(p.oxygen - dt * (0.78 + weight * 0.05), 0, 100);
    }
  } else {
    p.vx = smooth(p.vx, 0, dt, 2.4);
    p.vy = smooth(p.vy, 0, dt, 2.4);
  }

  for (const c of G.currents) {
    c.revealed = Math.max(0, c.revealed - dt);
    const d = dist(p.x, p.y, c.x, c.y);
    if (d < c.rad) {
      const force = (1 - d / c.rad) * c.strength;
      const wobble = Math.sin(G.t * 1.4 + c.phase) * 0.22;
      p.vx += Math.cos(c.angle + wobble) * force * dt;
      p.vy += Math.sin(c.angle + wobble) * force * dt;
      c.revealed = Math.max(c.revealed, 3.5);
    }
  }

  p.x += p.vx * dt;
  p.y += p.vy * dt;

  for (const o of G.obstacles) {
    const d = dist(p.x, p.y, o.x, o.y);
    const minD = o.rad + 18;
    if (d < minD && d > 0.001) {
      const nx = (p.x - o.x) / d;
      const ny = (p.y - o.y) / d;
      const push = minD - d;
      p.x += nx * push;
      p.y += ny * push;
      const impact = Math.hypot(p.vx, p.vy);
      p.vx *= 0.44;
      p.vy *= 0.44;
      if (impact > 105 && G.t - (o.lastHit || 0) > 0.8) {
        o.lastHit = G.t;
        damage(Math.min(12, impact * 0.035), '船体擦过玄武岩脊。');
      }
    }
  }

  interactWithNavigationTarget();

  for (const m of G.mines) {
    m.revealed = Math.max(0, m.revealed - dt);
    m.spin += dt * 0.8;
    if (!m.armed) continue;
    const d = dist(p.x, p.y, m.x, m.y);
    if (d < 42) {
      m.armed = false;
      m.revealed = 8;
      p.heat = clamp(p.heat + 22, 0, 100);
      revealAround(m.x, m.y, 430);
      damage(32, '水雷近爆，外壳承受冲击波。');
    } else if (d < 122 && G.t - m.lastWarn > 1.4) {
      m.lastWarn = G.t;
      m.revealed = Math.max(m.revealed, 4);
      toast('水雷接近警告。', 700);
      if (audio) audio.warning();
    }
  }

  for (const v of G.vents) {
    v.revealed = Math.max(0, v.revealed - dt);
    const cycle = Math.sin(G.t * 1.7 + v.phase);
    const d = dist(p.x, p.y, v.x, v.y);
    if (d < v.rad && cycle > 0.35) {
      p.oxygen = clamp(p.oxygen - dt * 2.3, 0, 100);
      p.heat = clamp(p.heat + dt * 2.1, 0, 100);
      if (G.t - (v.last || 0) > 1.2) {
        v.last = G.t;
        log('热泉喷流污染了进气口。');
      }
    }
  }

  const weight = cargoWeight(p);
  p.oxygen = clamp(p.oxygen - dt * (0.24 + Math.hypot(p.vx, p.vy) / 960 + weight * 0.035), 0, 100);
  p.heat = clamp(p.heat - dt * (3.2 + (p.coolantT > 0 ? 2.4 : 0) - Math.min(2.2, weight * 0.18)), 0, 100);

  for (const pulse of G.pulses) {
    pulse.age += dt;
    const r = pulse.age * 620;
    const sweep = 34;
    const check = (obj) => {
      if (pulse.hit.has(obj)) return;
      const d = dist(pulse.x, pulse.y, obj.x, obj.y);
      if (d <= r && d >= r - sweep && d < pulse.max) {
        obj.revealed = Math.max(obj.revealed || 0, 7.2);
        pulse.hit.add(obj);
      }
    };
    G.relics.forEach((x) => !x.taken && check(x));
    G.supplies.forEach((x) => !x.taken && check(x));
    G.vents.forEach(check);
    G.fauna.forEach(check);
    G.structures.forEach((x) => !x.scanned && check(x));
    G.mines.forEach((x) => x.armed && check(x));
    G.currents.forEach(check);
    if (G.leviathan.active) check(G.leviathan);
  }
  G.pulses = G.pulses.filter((p0) => p0.age * 620 < p0.max + 80);

  G.relics.forEach((r) => { r.revealed = Math.max(0, r.revealed - dt); });
  G.supplies.forEach((s) => { s.revealed = Math.max(0, s.revealed - dt); });
  G.structures.forEach((s) => { s.revealed = Math.max(0, s.revealed - dt); });

  for (const f of G.fish) {
    const t = G.t * f.speed * 0.018 + f.phase;
    f.x = f.baseX + Math.cos(t) * 90 * f.dir + Math.sin(t * 0.31) * 24;
    f.y = f.baseY + Math.sin(t * 0.74) * 42;
  }

  for (const f of G.fauna) {
    f.revealed = Math.max(0, f.revealed - dt);
    f.biteCd = Math.max(0, f.biteCd - dt);
    const bait = activeDecoy();
    const toPlayer = dist(f.x, f.y, p.x, p.y);
    const pingAge = G.t - G.lastPing.t;
    const toPing = dist(f.x, f.y, G.lastPing.x, G.lastPing.y);
    let tx = f.x + Math.cos(G.t * 0.4 + f.phase) * 60;
    let ty = f.y + Math.sin(G.t * 0.37 + f.phase) * 60;
    let speed = 22;
    const noise = p.heat * (p.silentT > 0 ? 0.55 : 1);
    if (bait && dist(f.x, f.y, bait.x, bait.y) < 900) {
      tx = bait.x;
      ty = bait.y;
      speed = 86 + f.aggression * 32;
      f.revealed = Math.max(f.revealed, 2.5);
    } else if ((noise > 18 && toPlayer < 320 + noise * 4.4) || (pingAge < 7 && toPing < 620)) {
      const targetPlayer = noise > 46 || toPlayer < 180;
      tx = targetPlayer ? p.x : G.lastPing.x;
      ty = targetPlayer ? p.y : G.lastPing.y;
      speed = 52 + noise * 0.72 + f.aggression * 34;
      f.revealed = Math.max(f.revealed, noise > 50 ? 1.8 : 0);
    }
    const a = angleTo(f.x, f.y, tx, ty);
    f.vx = smooth(f.vx, Math.cos(a) * speed, dt, 1.8);
    f.vy = smooth(f.vy, Math.sin(a) * speed, dt, 1.8);
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    const hitD = dist(f.x, f.y, p.x, p.y);
    if (hitD < f.size + 20 && f.biteCd <= 0) {
      f.biteCd = 1.4;
      damage(7 + f.aggression * 6, '灯光外有什么东西撞了上来。');
      p.heat = clamp(p.heat + 4, 0, 100);
    }
  }

  updateLeviathan(dt);
  autoCollectHint();

  if (p.oxygen <= 0) end(false, '氧气储备耗尽。');
  if (p.heat > 72 && G.t - G.lastWarn > 8) {
    G.lastWarn = G.t;
    toast('大型接触体正沿着你的噪声逼近。', 2100);
    if (audio) audio.warning();
  }
  if ((p.oxygen < 20 || p.hull < 25) && G.t - G.lastWarn > 6) {
    G.lastWarn = G.t;
    if (audio) audio.warning();
  }

  G.cam.x = smooth(G.cam.x, p.x + p.vx * 0.45, dt, 2.4);
  G.cam.y = smooth(G.cam.y, p.y + p.vy * 0.45, dt, 2.4);
  G.shake = Math.max(0, G.shake - dt * 12);
}

function updateLeviathan(dt) {
  const p = G.player;
  const L = G.leviathan;
  if (!L.active && p.heat > (p.silentT > 0 ? 86 : 76)) {
    const a = angleTo(p.x, p.y, G.lastPing.x, G.lastPing.y) + Math.PI + (G.rng() - 0.5) * 1.2;
    L.x = p.x + Math.cos(a) * 760;
    L.y = p.y + Math.sin(a) * 760;
    L.vx = 0; L.vy = 0; L.active = true; L.revealed = 2.5;
    log('已捕获巨型接触体。');
    if (audio) audio.leviathan(1.1);
  }
  if (!L.active) return;
  L.revealed = Math.max(0, L.revealed - dt * 0.45);
  L.biteCd = Math.max(0, L.biteCd - dt);
  const bait = activeDecoy();
  const d = dist(L.x, L.y, p.x, p.y);
  const baitD = bait ? dist(L.x, L.y, bait.x, bait.y) : Infinity;
  const chaseDecoy = bait && baitD < 1100;
  const chase = chaseDecoy || p.heat > 42 || d < 430;
  const tx = chaseDecoy ? bait.x : (chase ? p.x : G.lastPing.x);
  const ty = chaseDecoy ? bait.y : (chase ? p.y : G.lastPing.y);
  const a = angleTo(L.x, L.y, tx, ty);
  const spd = chaseDecoy ? 128 : (chase ? 88 + p.heat * 0.55 : 34);
  L.vx = smooth(L.vx, Math.cos(a) * spd, dt, 1.2);
  L.vy = smooth(L.vy, Math.sin(a) * spd, dt, 1.2);
  L.x += L.vx * dt;
  L.y += L.vy * dt;
  if (chaseDecoy && baitD < 86) {
    bait.age = bait.life;
    L.revealed = 3;
    p.heat = clamp(p.heat - 18, 0, 100);
    log('巨型接触体吞掉了诱饵。噪声轮廓暂时下降。');
  }
  if (d < 88 && L.biteCd <= 0) {
    L.biteCd = 1.8;
    damage(26, '压力波扭曲了外层装甲。');
    p.heat = clamp(p.heat + 9, 0, 100);
  }
  if (d > 1300 && p.heat < 35) L.active = false;
  if (G.t - (L.lastAudio || 0) > 11 && (d < 850 || p.heat > 80)) {
    L.lastAudio = G.t;
    if (audio) audio.leviathan(clamp(1 - d / 1100, 0.35, 1.2));
  }
}

function autoCollectHint() {
  const p = G.player;
  if (G.t - (G.lastHintAt || -99) < 0.7) return;
  const hint = (msg) => {
    G.lastHintAt = G.t;
    toast(msg, 500);
  };
  if (Math.hypot(p.x, p.y) < 92) {
    if (p.cargo.length) hint('点击灯塔或按 E 入库货物。');
    return;
  }
  for (const r of G.relics) {
    if (!r.taken && dist(p.x, p.y, r.x, r.y) < 56) {
      hint(`点击目标可自动回收；也可按 E 回收${r.kind === 'core' ? '信号核心' : r.name}。`);
      return;
    }
  }
  for (const site of G.structures) {
    if (!site.scanned && dist(p.x, p.y, site.x, site.y) < site.rad * 0.65 + 36) {
      hint(`点击目标可自动扫描；也可按 E 扫描${site.name}。`);
      return;
    }
  }
  for (const s of G.supplies) {
    if (!s.taken && dist(p.x, p.y, s.x, s.y) < 52) {
      hint(`点击目标可自动拾取；也可按 E 拾取${s.name}。`);
      return;
    }
  }
}

function worldToScreen(x, y) {
  return [(x - G.cam.x) * zoom + W / 2, (y - G.cam.y) * zoom + H / 2];
}

function draw() {
  const p = G.player;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#021116');
  grad.addColorStop(0.48, '#02090d');
  grad.addColorStop(1, '#010407');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const shake = settings.reduceMotion ? G.shake * 0.22 : G.shake;
  const sx = (Math.random() - 0.5) * shake;
  const sy = (Math.random() - 0.5) * shake;
  ctx.save();
  ctx.translate(W / 2 + sx, H / 2 + sy);
  ctx.scale(zoom, zoom);
  ctx.translate(-G.cam.x, -G.cam.y);

  drawSeafloor();
  drawTerrain();
  drawCurrents();
  drawBeacon();
  drawVents();
  drawObstacles();
  drawDecor();
  drawStructures();
  drawRelics();
  drawSupplies();
  drawMines();
  drawFish();
  drawFauna();
  drawLeviathan();
  drawDecoys();
  drawPulses();
  drawNavigation();
  drawSub();
  ctx.restore();

  drawDarkness();
  drawScreenPing();
  if (!G.ui || G.t - G.ui.miniAt > 0.2) {
    drawMini();
    if (G.ui) G.ui.miniAt = G.t;
  }
}

function drawTerrain() {
  ctx.save();
  ctx.lineWidth = 1 / zoom;
  for (let i = -10; i <= 10; i++) {
    const y0 = Math.floor((G.cam.y / 160) + i) * 160;
    ctx.beginPath();
    for (let x = G.cam.x - W / zoom * 0.65; x <= G.cam.x + W / zoom * 0.65; x += 48) {
      const y = y0 + terrainNoise(x, y0) * 30 + Math.sin(G.t * 0.1 + x * 0.002) * 5;
      if (x === G.cam.x - W / zoom * 0.65) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(49,242,210,.07)' : 'rgba(134,170,168,.04)';
    ctx.stroke();
  }
  for (let i = 0; i < 80; i++) {
    const a = i * 12.9898;
    const x = ((Math.sin(a) * 43758.5453) % 1) * 4200 - 2100;
    const y = ((Math.sin(a * 1.93) * 24634.6345) % 1) * 4200 - 2100;
    const d = dist(x, y, G.cam.x, G.cam.y);
    if (d > 850) continue;
    ctx.fillStyle = `rgba(141,224,213,${0.025 + (1 - d / 850) * 0.055})`;
    ctx.fillRect(x, y, 2 / zoom, 2 / zoom);
  }
  ctx.restore();
}

function imageAsset(name) {
  return media?.images?.[name] || null;
}

function imageList(name) {
  const v = media?.images?.[name];
  if (!v) return [];
  media.imageListCache ||= {};
  if (!media.imageListCache[name]) {
    media.imageListCache[name] = Object.keys(v).sort((a, b) => Number(a) - Number(b)).map((k) => v[k]).filter(Boolean);
  }
  return media.imageListCache[name];
}

function cargoIconUrl(item) {
  if (!item) return '';
  if (item.kind === 'core') return MEDIA.art.core;
  if (item.sprite && MEDIA.art.atlas[item.sprite]) return MEDIA.art.atlas[item.sprite];
  if (item.sprite && MEDIA.art[item.sprite]) return MEDIA.art[item.sprite];
  return MEDIA.art.relic;
}

function cargoIconFallbackUrl(item) {
  return item?.kind === 'core' ? MEDIA.art.core : MEDIA.art.relic;
}

function drawCenteredImage(img, x, y, w, h, rot = 0, alpha = 1) {
  if (!img) return false;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= alpha;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  return true;
}

function drawSeafloor() {
  const img = imageAsset('seafloor');
  if (!img) return;
  const tile = 900;
  const minX = Math.floor((G.cam.x - W / zoom * 0.72) / tile) - 1;
  const maxX = Math.floor((G.cam.x + W / zoom * 0.72) / tile) + 1;
  const minY = Math.floor((G.cam.y - H / zoom * 0.72) / tile) - 1;
  const maxY = Math.floor((G.cam.y + H / zoom * 0.72) / tile) + 1;
  ctx.save();
  ctx.globalAlpha = 0.7;
  for (let gx = minX; gx <= maxX; gx++) {
    for (let gy = minY; gy <= maxY; gy++) {
      const flip = (gx + gy) & 1;
      ctx.save();
      ctx.translate(gx * tile + tile / 2, gy * tile + tile / 2);
      ctx.rotate(flip ? Math.PI : 0);
      ctx.drawImage(img, -tile / 2, -tile / 2, tile, tile);
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawBeacon() {
  ctx.save();
  ctx.translate(0, 0);
  const pulse = 1 + Math.sin(G.t * 2.2) * 0.04;
  ctx.strokeStyle = 'rgba(125,247,186,.55)';
  ctx.fillStyle = 'rgba(49,242,210,.06)';
  ctx.lineWidth = 2 / zoom;
  ctx.beginPath();
  ctx.arc(0, 0, 88 * pulse, 0, TAU);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI / 2 + G.t * 0.2);
    ctx.fillStyle = 'rgba(255,184,77,.38)';
    ctx.fillRect(32, -4, 44, 8);
    ctx.restore();
  }
  ctx.fillStyle = '#d9f6f3';
  ctx.font = `${12 / zoom}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('灯塔', 0, -108);
  ctx.restore();
}

function drawObstacles() {
  const rocks = imageList('rocks');
  for (const o of G.obstacles) {
    if (!onScreen(o.x, o.y, o.rad + 60)) continue;
    const rock = rocks[o.variant % Math.max(rocks.length, 1)];
    if (rock) {
      drawCenteredImage(rock, o.x, o.y, o.rad * 2.75 * o.scale, o.rad * 2.25 * o.scale, o.rot, 0.9);
      continue;
    }
    ctx.beginPath();
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU;
      const rr = o.rad * (0.78 + 0.22 * Math.sin(o.seed + i * 2.13));
      const x = o.x + Math.cos(a) * rr;
      const y = o.y + Math.sin(a) * rr * o.jag;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(9,23,25,.9)';
    ctx.strokeStyle = 'rgba(141,224,213,.11)';
    ctx.lineWidth = 1 / zoom;
    ctx.fill();
    ctx.stroke();
  }
}

function drawDecor() {
  const kelp = imageList('kelp');
  if (!kelp.length) return;
  for (const d of G.decor) {
    if (!onScreen(d.x, d.y, 90)) continue;
    const near = dist(G.player.x, G.player.y, d.x, d.y);
    if (near > 680 && Math.sin(d.phase) < 0.55) continue;
    const img = kelp[d.variant % kelp.length];
    const sway = Math.sin(G.t * 1.2 + d.phase) * 0.09;
    drawCenteredImage(img, d.x, d.y, 42 * d.scale, 86 * d.scale, d.rot + sway, clamp(1 - near / 1450, 0.28, 0.9));
  }
}

function drawCurrents() {
  const img = imageAsset('current');
  for (const c of G.currents) {
    if (!onScreen(c.x, c.y, c.rad + 80) || !visible(c, 140)) continue;
    const alpha = clamp(Math.max(c.revealed / 8, dist(G.player.x, G.player.y, c.x, c.y) < c.rad ? 0.32 : 0.08), 0.05, 0.62);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle);
    if (img) drawCenteredImage(img, 0, 0, c.rad * 1.18, c.rad * 1.18, 0, alpha * 0.9);
    ctx.strokeStyle = `rgba(49,242,210,${0.28 * alpha})`;
    ctx.lineWidth = 2 / zoom;
    for (let i = -2; i <= 2; i++) {
      const off = i * c.rad * 0.18;
      ctx.beginPath();
      for (let x = -c.rad * 0.54; x <= c.rad * 0.58; x += 18) {
        const y = off + Math.sin(x * 0.035 + G.t * 2.1 + c.phase) * 9;
        if (x === -c.rad * 0.54) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawVents() {
  for (const v of G.vents) {
    if (!onScreen(v.x, v.y, v.rad)) continue;
    const active = Math.sin(G.t * 1.7 + v.phase) > 0.35;
    const alpha = Math.max(v.revealed / 7, active ? 0.18 : 0.05);
    ctx.save();
    ctx.translate(v.x, v.y);
    const img = imageAsset(v.variant);
    if (img && (active || v.revealed > 0)) {
      drawCenteredImage(img, 0, 0, v.rad * 1.12, v.rad * 1.12, v.phase, clamp(alpha * 1.2, 0.12, 0.72));
    }
    const rg = ctx.createRadialGradient(0, 0, 8, 0, 0, v.rad);
    rg.addColorStop(0, `rgba(255,184,77,${0.18 * alpha})`);
    rg.addColorStop(1, 'rgba(255,184,77,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0, 0, v.rad, 0, TAU);
    ctx.fill();
    if (active || v.revealed > 0) {
      ctx.strokeStyle = `rgba(255,184,77,${0.28 * alpha})`;
      ctx.lineWidth = 1.5 / zoom;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, 16 + i * 18 + Math.sin(G.t * 4 + i) * 4, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function drawStructures() {
  for (const site of G.structures) {
    if (!onScreen(site.x, site.y, site.rad + 70) || (!visible(site, 140) && !site.scanned)) continue;
    const alpha = site.scanned ? 0.8 : clamp(Math.max(site.revealed / 8, 0.16), 0.12, 0.78);
    const img = imageAsset(site.sprite);
    if (img) {
      ctx.save();
      ctx.shadowBlur = site.scanned ? 24 : 12;
      ctx.shadowColor = site.scanned ? 'rgba(125,247,186,.5)' : 'rgba(49,242,210,.22)';
      drawCenteredImage(img, site.x, site.y, site.rad * 1.8, site.rad * 1.8, site.rot + Math.sin(G.t + site.pulse) * 0.025, alpha);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(site.x, site.y);
    ctx.strokeStyle = site.scanned ? `rgba(125,247,186,${0.58 * alpha})` : `rgba(49,242,210,${0.42 * alpha})`;
    ctx.lineWidth = 1.4 / zoom;
    ctx.setLineDash([7 / zoom, 7 / zoom]);
    ctx.beginPath();
    ctx.arc(0, 0, site.rad * (0.7 + Math.sin(G.t * 2 + site.pulse) * 0.04), 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

function drawMines() {
  const img = imageAsset('mine');
  for (const m of G.mines) {
    if (!onScreen(m.x, m.y, 70) || (!visible(m, 78) && m.armed)) continue;
    const alpha = m.armed ? clamp(Math.max(m.revealed / 8, 0.16), 0.12, 0.92) : 0.22;
    if (img) {
      ctx.save();
      ctx.shadowBlur = m.armed ? 16 : 3;
      ctx.shadowColor = 'rgba(255,77,95,.38)';
      drawCenteredImage(img, m.x, m.y, 48, 48, m.spin, alpha);
      ctx.restore();
    }
    if (m.armed && m.revealed > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(255,77,95,${0.34 * alpha})`;
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 42 + Math.sin(G.t * 5 + m.spin) * 3, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawDecoys() {
  const img = imageAsset('decoy');
  for (const d of G.decoys) {
    if (!onScreen(d.x, d.y, 80)) continue;
    const life = clamp(1 - d.age / d.life, 0, 1);
    if (img) drawCenteredImage(img, d.x, d.y, 42, 42, d.pulse * 1.8, 0.75 * life + 0.12);
    ctx.save();
    ctx.strokeStyle = `rgba(255,184,77,${0.52 * life})`;
    ctx.lineWidth = 1.6 / zoom;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 28 + (d.pulse * 42) % 80, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

function visible(obj, base = 150) {
  return obj.revealed > 0 || dist(G.player.x, G.player.y, obj.x, obj.y) < base;
}

function drawRelics() {
  for (const r of G.relics) {
    if (r.taken || !onScreen(r.x, r.y, 80) || !visible(r, r.kind === 'core' ? 180 : 120)) continue;
    const a = G.t + r.pulse;
    const isCore = r.kind === 'core';
    const img = imageAsset(isCore ? 'core' : (r.sprite || 'relic')) || imageAsset('relic');
    if (img) {
      ctx.save();
      ctx.shadowBlur = isCore ? 24 : 16;
      ctx.shadowColor = isCore ? 'rgba(255,184,77,.78)' : 'rgba(49,242,210,.65)';
      const size = isCore ? 54 : 36 + (r.weight || 1) * 9;
      drawCenteredImage(img, r.x, r.y, size, size, a * 0.34, 0.96);
      ctx.restore();
      continue;
    }
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(a * 0.7);
    const rad = isCore ? 22 : 15;
    ctx.shadowBlur = isCore ? 22 : 14;
    ctx.shadowColor = isCore ? 'rgba(255,184,77,.75)' : 'rgba(49,242,210,.65)';
    ctx.strokeStyle = isCore ? '#ffb84d' : '#31f2d2';
    ctx.fillStyle = isCore ? 'rgba(255,184,77,.13)' : 'rgba(49,242,210,.12)';
    ctx.lineWidth = 2 / zoom;
    ctx.beginPath();
    if (isCore) {
      for (let i = 0; i < 4; i++) {
        const aa = i * Math.PI / 2 + Math.PI / 4;
        const x = Math.cos(aa) * rad;
        const y = Math.sin(aa) * rad;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else {
      ctx.arc(0, 0, rad, 0, TAU);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawSupplies() {
  for (const s of G.supplies) {
    if (s.taken || !onScreen(s.x, s.y, 60) || !visible(s, 115)) continue;
    const img = imageAsset(s.sprite || s.kind);
    if (img) {
      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = s.kind === 'oxygen' ? 'rgba(125,247,186,.55)' : 'rgba(217,246,243,.45)';
      drawCenteredImage(img, s.x, s.y, 42, 42, s.spin + G.t * 0.35, 0.95);
      ctx.restore();
      continue;
    }
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.spin + G.t * 0.7);
    ctx.strokeStyle = s.kind === 'oxygen' ? '#7df7ba' : '#d9f6f3';
    ctx.fillStyle = s.kind === 'oxygen' ? 'rgba(125,247,186,.12)' : 'rgba(217,246,243,.1)';
    ctx.lineWidth = 1.5 / zoom;
    ctx.beginPath();
    ctx.rect(-12, -12, 24, 24);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    if (s.kind === 'repair') {
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
    }
    ctx.stroke();
    ctx.restore();
  }
}

function drawFish() {
  const fishArt = imageList('fish');
  if (!fishArt.length) return;
  for (const f of G.fish) {
    if (!onScreen(f.x, f.y, 80)) continue;
    const near = dist(G.player.x, G.player.y, f.x, f.y);
    if (near > 760 && Math.sin(f.phase) < 0.35) continue;
    const img = fishArt[f.variant % fishArt.length];
    const rot = f.dir > 0 ? 0 : Math.PI;
    drawCenteredImage(img, f.x, f.y, 42 * f.scale, 22 * f.scale, rot + Math.sin(G.t + f.phase) * 0.05, clamp(1 - near / 1200, 0.22, 0.72));
  }
}

function drawFauna() {
  for (const f of G.fauna) {
    if (!onScreen(f.x, f.y, 90) || !visible(f, 105)) continue;
    const a = Math.atan2(f.vy, f.vx) || (G.t + f.phase);
    const alpha = clamp(Math.max(f.revealed / 7, 0.18), 0.16, 1);
    const key = HUNTER_SPRITES[f.variant % HUNTER_SPRITES.length];
    const img = imageAsset(key) || imageAsset('predator');
    if (img) {
      const wide = key === 'manta' ? 4.1 : (key === 'crab' ? 2.4 : 3.2);
      const tall = key === 'jellyfish' ? 2.7 : (key === 'manta' ? 1.75 : 1.85);
      ctx.save();
      ctx.shadowBlur = 22;
      ctx.shadowColor = `rgba(255,77,95,${0.34 * alpha})`;
      drawCenteredImage(img, f.x, f.y, f.size * wide, f.size * tall, key === 'jellyfish' ? 0 : a, alpha);
      ctx.restore();
      continue;
    }
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(a);
    ctx.fillStyle = `rgba(255,77,95,${0.16 * alpha})`;
    ctx.strokeStyle = `rgba(255,77,95,${0.55 * alpha})`;
    ctx.lineWidth = 1.5 / zoom;
    ctx.beginPath();
    ctx.moveTo(f.size * 1.3, 0);
    ctx.quadraticCurveTo(-f.size * 0.8, -f.size * 0.74, -f.size * 1.2, 0);
    ctx.quadraticCurveTo(-f.size * 0.8, f.size * 0.74, f.size * 1.3, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawLeviathan() {
  const L = G.leviathan;
  if (!L.active || !onScreen(L.x, L.y, 260)) return;
  const d = dist(G.player.x, G.player.y, L.x, L.y);
  const alpha = clamp(Math.max(L.revealed / 3, 1 - d / 800), 0.04, 0.7);
  const leviathan = imageAsset('leviathan');
  if (leviathan) {
    drawCenteredImage(leviathan, L.x, L.y, 390, 150, Math.atan2(L.vy, L.vx), alpha);
    return;
  }
  ctx.save();
  ctx.translate(L.x, L.y);
  ctx.rotate(Math.atan2(L.vy, L.vx));
  ctx.strokeStyle = `rgba(255,77,95,${alpha})`;
  ctx.fillStyle = `rgba(30,3,8,${alpha * 0.42})`;
  ctx.lineWidth = 2 / zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, 185, 54, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(210, -22);
  ctx.lineTo(210, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPulses() {
  for (const p0 of G.pulses) {
    const r = p0.age * 620;
    const a = clamp(1 - r / (p0.max + 80), 0, 1);
    ctx.strokeStyle = `rgba(49,242,210,${0.55 * a})`;
    ctx.lineWidth = 2.3 / zoom;
    ctx.beginPath();
    ctx.arc(p0.x, p0.y, r, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(125,247,186,${0.16 * a})`;
    ctx.lineWidth = 16 / zoom;
    ctx.beginPath();
    ctx.arc(p0.x, p0.y, Math.max(0, r - 4), 0, TAU);
    ctx.stroke();
  }
}

function drawNavigation() {
  const nav = G.nav;
  if (!nav) return;
  const next = navPosition(nav);
  const final = navFinalPosition(nav);
  if (!next || !final || navTargetDone(nav)) return;
  const p = G.player;
  const alpha = 0.62 + Math.sin(G.t * 5.4) * 0.18;
  ctx.save();
  ctx.strokeStyle = `rgba(125,247,186,${alpha})`;
  ctx.fillStyle = `rgba(125,247,186,${0.08 + alpha * 0.08})`;
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([10 / zoom, 8 / zoom]);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  if (nav.path && nav.path.length) {
    for (const pt of nav.path) ctx.lineTo(pt.x, pt.y);
  } else {
    ctx.lineTo(final.x, final.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  const waypointD = dist(next.x, next.y, final.x, final.y);
  if (waypointD > 34) {
    ctx.strokeStyle = `rgba(49,242,210,${0.35 + alpha * 0.2})`;
    ctx.fillStyle = 'rgba(49,242,210,.08)';
    ctx.lineWidth = 1.2 / zoom;
    ctx.beginPath();
    ctx.arc(next.x, next.y, 17 + Math.sin(G.t * 4.2) * 2, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(125,247,186,${alpha})`;
  ctx.fillStyle = `rgba(125,247,186,${0.08 + alpha * 0.08})`;
  const ring = nav.kind === 'point' ? 28 : 42;
  ctx.beginPath();
  ctx.arc(final.x, final.y, ring + Math.sin(G.t * 4.2) * 4, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#eafffb';
  ctx.font = `${11 / zoom}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(navLabel(nav), final.x, final.y - ring - 12);
  ctx.restore();
}

function drawSub() {
  const p = G.player;
  const sub = imageAsset('sub');
  if (sub) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.shadowColor = 'rgba(49,242,210,.5)';
    ctx.shadowBlur = 22;
    ctx.drawImage(sub, -44, -28, 88, 56);
    ctx.strokeStyle = 'rgba(49,242,210,.38)';
    ctx.lineWidth = 2 / zoom;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(72, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.shadowColor = 'rgba(49,242,210,.45)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#d9f6f3';
  ctx.strokeStyle = '#031216';
  ctx.lineWidth = 2 / zoom;
  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.quadraticCurveTo(4, -16, -24, -11);
  ctx.lineTo(-31, 0);
  ctx.lineTo(-24, 11);
  ctx.quadraticCurveTo(4, 16, 26, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#31f2d2';
  ctx.fillRect(-5, -4, 11, 8);
  ctx.strokeStyle = 'rgba(49,242,210,.4)';
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(64, 0);
  ctx.stroke();
  ctx.restore();
}

function drawDarkness() {
  const [px, py] = worldToScreen(G.player.x, G.player.y);
  const r = 145 + Math.max(0, 70 - G.player.heat) * 0.35;
  const g = ctx.createRadialGradient(px, py, 35, px, py, Math.max(W, H) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(r / (Math.max(W, H) * 0.72), 'rgba(0,0,0,.12)');
  g.addColorStop(0.72, 'rgba(0,0,0,.68)');
  g.addColorStop(1, 'rgba(0,0,0,.91)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawScreenPing() {
  const p = G.player;
  if (p.heat < 6 || settings.reduceMotion) return;
  const alpha = clamp(p.heat / 100, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = `rgba(255,184,77,${0.05 * alpha})`;
  ctx.lineWidth = 1;
  const gap = 42;
  const off = (G.t * (12 + p.heat * 0.08)) % gap;
  for (let y = -gap; y < H + gap; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y + off);
    ctx.lineTo(W, y + off);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMini() {
  const size = 224;
  mctx.clearRect(0, 0, size, size);
  mctx.save();
  mctx.translate(size / 2, size / 2);
  mctx.fillStyle = 'rgba(3,12,15,.9)';
  mctx.fillRect(-size / 2, -size / 2, size, size);
  mctx.strokeStyle = 'rgba(141,224,213,.16)';
  mctx.beginPath();
  mctx.arc(0, 0, 103, 0, TAU);
  mctx.stroke();
  const scale = 0.046;
  const px = G.player.x;
  const py = G.player.y;
  mctx.fillStyle = 'rgba(125,247,186,.9)';
  mctx.beginPath();
  mctx.arc(-px * scale, -py * scale, 4, 0, TAU);
  mctx.fill();
  for (const r of G.relics) {
    if (r.taken || r.revealed <= 0) continue;
    const x = (r.x - px) * scale;
    const y = (r.y - py) * scale;
    if (Math.abs(x) > 104 || Math.abs(y) > 104) continue;
    mctx.fillStyle = r.kind === 'core' ? '#ffb84d' : '#31f2d2';
    mctx.fillRect(x - 2, y - 2, 4, 4);
  }
  for (const site of G.structures) {
    if (!site.scanned && site.revealed <= 0) continue;
    const x = (site.x - px) * scale;
    const y = (site.y - py) * scale;
    if (Math.abs(x) > 104 || Math.abs(y) > 104) continue;
    mctx.strokeStyle = site.scanned ? '#7df7ba' : '#d9f6f3';
    mctx.strokeRect(x - 3, y - 3, 6, 6);
  }
  for (const m of G.mines) {
    if (!m.armed || m.revealed <= 0) continue;
    const x = (m.x - px) * scale;
    const y = (m.y - py) * scale;
    if (Math.abs(x) > 104 || Math.abs(y) > 104) continue;
    mctx.strokeStyle = '#ff4d5f';
    mctx.beginPath();
    mctx.moveTo(x - 3, y - 3);
    mctx.lineTo(x + 3, y + 3);
    mctx.moveTo(x + 3, y - 3);
    mctx.lineTo(x - 3, y + 3);
    mctx.stroke();
  }
  for (const c of G.currents) {
    if (c.revealed <= 0) continue;
    const x = (c.x - px) * scale;
    const y = (c.y - py) * scale;
    if (Math.abs(x) > 104 || Math.abs(y) > 104) continue;
    mctx.strokeStyle = 'rgba(49,242,210,.62)';
    mctx.beginPath();
    mctx.arc(x, y, Math.max(3, c.rad * scale * 0.35), 0, TAU);
    mctx.stroke();
  }
  for (const d of G.decoys) {
    const x = (d.x - px) * scale;
    const y = (d.y - py) * scale;
    if (Math.abs(x) > 104 || Math.abs(y) > 104) continue;
    mctx.fillStyle = '#ffb84d';
    mctx.beginPath();
    mctx.arc(x, y, 3, 0, TAU);
    mctx.fill();
  }
  if (G.leviathan.active) {
    const x = (G.leviathan.x - px) * scale;
    const y = (G.leviathan.y - py) * scale;
    if (Math.abs(x) < 104 && Math.abs(y) < 104) {
      mctx.strokeStyle = '#ff4d5f';
      mctx.beginPath();
      mctx.arc(x, y, 8, 0, TAU);
      mctx.stroke();
    }
  }
  mctx.rotate(G.player.angle);
  mctx.fillStyle = '#d9f6f3';
  mctx.beginPath();
  mctx.moveTo(7, 0);
  mctx.lineTo(-6, 5);
  mctx.lineTo(-6, -5);
  mctx.closePath();
  mctx.fill();
  mctx.restore();
}

function onScreen(x, y, pad = 0) {
  const sx = (x - G.cam.x) * zoom + W / 2;
  const sy = (y - G.cam.y) * zoom + H / 2;
  return sx > -pad && sx < W + pad && sy > -pad && sy < H + pad;
}

function updateUI(force = false) {
  if (!G.ui) G.ui = { hudAt: -99, panelAt: -99, miniAt: -99, cargoSig: '', panelSig: '', logSig: '' };
  const now = G.t || 0;
  if (!force && now - G.ui.hudAt < 0.1) return;
  G.ui.hudAt = now;
  const p = G.player;
  const beaconRange = Math.floor(Math.hypot(p.x, p.y));
  meters.hull.textContent = Math.ceil(p.hull);
  meters.hullBar.style.width = `${p.hull}%`;
  meters.oxy.textContent = Math.ceil(p.oxygen);
  meters.oxyBar.style.width = `${p.oxygen}%`;
  meters.heat.textContent = Math.ceil(p.heat);
  meters.heatBar.style.width = `${p.heat}%`;
  meters.range.textContent = `${beaconRange}米`;
  meters.rangeBar.style.width = `${clamp(beaconRange / 1900 * 100, 0, 100)}%`;
  meters.hullBox.classList.toggle('danger', p.hull < 28);
  meters.oxyBox.classList.toggle('danger', p.oxygen < 24);
  meters.heatBox.classList.toggle('hot', p.heat >= 55 && p.heat < 78);
  meters.heatBox.classList.toggle('danger', p.heat >= 78);

  const missingCore = Math.max(0, CORE_GOAL - p.cores);
  const missingScan = Math.max(0, SCAN_GOAL - p.scans);
  if (p.cores >= CORE_GOAL && p.scans >= SCAN_GOAL) {
    meters.objective.textContent = '核心与遗迹资料已完成。返回灯塔。';
    meters.hint.textContent = p.cargo.length > 0 ? '可以先入库货物，也可以继续冒险打捞。' : '在灯塔按 E 上浮。';
  } else {
    meters.objective.textContent = `核心 ${p.cores}/${CORE_GOAL} · 遗迹 ${p.scans}/${SCAN_GOAL}`;
    meters.hint.textContent = missingCore === 0
      ? `还需扫描 ${missingScan} 处遗迹。靠近遗迹按 E。`
      : '点击海域自动航行；点击目标会自动拾取 / 扫描。';
  }
  if (G.nav) meters.hint.textContent = `自动航行：${navLabel(G.nav)}。点击别处可改道，WASD 可接管。`;
  if (G.ai.enabled) meters.hint.textContent = `AI巡航：${G.ai.mode}。WASD / 鼠标可接管，C 可关闭。`;

  const cargoSig = p.cargo.map((item) => `${item.id}:${item.kind}:${item.subtype || ''}`).join('|');
  if (force || cargoSig !== G.ui.cargoSig) {
    G.ui.cargoSig = cargoSig;
    [...slotsEl.children].forEach((slot, i) => {
      slot.className = 'slot';
      const item = p.cargo[i];
      if (item) {
        slot.classList.add('filled', item.kind);
        if ((item.weight || 1) > 1) slot.classList.add('heavy');
        if (['tablet', 'blackbox'].includes(item.subtype)) slot.classList.add('data');
        slot.title = item.kind === 'core' ? '信号核心' : `${item.name} +${item.value}`;
        slot.setAttribute('aria-label', slot.title);
        if (slot.dataset.itemId !== item.id) {
          slot.dataset.itemId = item.id;
          slot.replaceChildren();
          const icon = document.createElement('img');
          const fallbackSrc = cargoIconFallbackUrl(item);
          icon.src = cargoIconUrl(item);
          icon.alt = '';
          icon.setAttribute('aria-hidden', 'true');
          icon.onerror = () => {
            if (icon.dataset.fallbackUsed === '1' || icon.getAttribute('src') === fallbackSrc) {
              icon.hidden = true;
              return;
            }
            icon.dataset.fallbackUsed = '1';
            icon.src = fallbackSrc;
          };
          icon.loading = 'eager';
          slot.appendChild(icon);
        }
      } else {
        if (slot.dataset.itemId) {
          delete slot.dataset.itemId;
          slot.replaceChildren();
        }
        slot.removeAttribute('title');
        slot.removeAttribute('aria-label');
      }
    });
  }

  const panelSig = `${p.scanValue}|${cargoWeight(p)}|${p.decoys}|${G.ai.enabled ? G.ai.mode : '离线'}|${Math.ceil(p.silentT)}|${Math.ceil(p.coolantT)}`;
  const logSig = G.log.join('\n');
  if (force || now - G.ui.panelAt > 0.25 || panelSig !== G.ui.panelSig || logSig !== G.ui.logSig) {
    G.ui.panelAt = now;
    G.ui.panelSig = panelSig;
    G.ui.logSig = logSig;
    logEl.innerHTML = G.log.map((l) => `<div>${escapeHtml(l)}</div>`).join('');
    systemsEl.innerHTML = `
    <div class="row"><span>资料价值</span><b>${p.scanValue}</b></div>
    <div class="row"><span>货舱重量</span><b>${cargoWeight(p)}</b></div>
    <div class="row"><span>诱饵</span><b>${p.decoys}/${MAX_DECOYS}</b></div>
    <div class="row"><span>AI巡航</span><b>${G.ai.enabled ? G.ai.mode : '离线'}</b></div>
    <div class="row"><span>静音线圈</span><b>${p.silentT > 0 ? `${Math.ceil(p.silentT)}秒` : '离线'}</b></div>
    <div class="row"><span>冷却剂</span><b>${p.coolantT > 0 ? `${Math.ceil(p.coolantT)}秒` : '离线'}</b></div>
  `;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0);
  last = now;
  update(dt);
  draw();
  updateUI();
  just.clear();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.__ECHO = {
  get G() { return G; },
  get paused() { return pauseMenuOpen; },
  get settings() { return settings; },
  start,
  setAi(on) { setAiCruise(Boolean(on), true); return G.ai.enabled; },
  returnHome: startReturnHome,
  ping: doPing,
  pause: openPauseMenu,
  resume: closePauseMenu,
  deployDecoy,
  routeClearance(path = G.nav?.path, includeThreats = true) { return routeClearance(path, includeThreats); },
  worldStats() {
    const interactive = [
      ...G.relics.filter((x) => !x.taken),
      ...G.supplies.filter((x) => !x.taken),
      ...G.structures.filter((x) => !x.scanned)
    ];
    return {
      minInteractiveRange: Math.min(...interactive.map((x) => Math.hypot(x.x, x.y))),
      nearStartInteractive: interactive.filter((x) => Math.hypot(x.x, x.y) < SAFE_START_RADIUS).length,
      coreGoal: CORE_GOAL,
      scanGoal: SCAN_GOAL,
      coreCount: G.relics.filter((x) => x.kind === 'core').length
    };
  },
  revealAll() {
    revealAround(G.player.x, G.player.y, 9999);
    G.structures.forEach((s) => { if (!s.scanned) s.revealed = 8; });
    G.mines.forEach((m) => { if (m.armed) m.revealed = 8; });
    G.currents.forEach((c) => { c.revealed = 8; });
  },
  win() { G.player.cores = CORE_GOAL; G.player.scans = SCAN_GOAL; end(true); },
  fail(reason = '调试失败') { end(false, reason); },
  hurt(n = 20) { damage(n, '调试伤害'); },
  heat(n = 85) { G.player.heat = n; },
  screenForWorld(x, y) {
    const [sx, sy] = worldToScreen(x, y);
    return { x: sx, y: sy };
  },
  prepareMouseRelic() {
    const p = G.player;
    const r = G.relics.find((x) => x.kind === 'relic' && !x.taken);
    if (!r) return null;
    p.x = 126; p.y = 0; p.vx = 0; p.vy = 0; p.heat = 0; G.cam.x = p.x; G.cam.y = 0; G.nav = null;
    G.leviathan.active = false;
    [...G.relics, ...G.supplies, ...G.structures, ...G.fauna, ...G.mines, ...G.obstacles].forEach((obj) => {
      if (obj !== r && dist(210, 0, obj.x, obj.y) < 220) {
        obj.x += 620;
        obj.y += 620;
        obj.revealed = 0;
      }
    });
    r.x = 210; r.y = 0; r.revealed = 8;
    return this.screenForWorld(r.x, r.y);
  },
  prepareMouseStructure() {
    const p = G.player;
    p.x = 0; p.y = 0; p.vx = 0; p.vy = 0; G.cam.x = 0; G.cam.y = 0; G.nav = null;
    [...G.relics, ...G.supplies].forEach((obj) => {
      if (dist(220, 0, obj.x, obj.y) < 180) {
        obj.x += 620;
        obj.y += 620;
        obj.revealed = 0;
      }
    });
    const s = G.structures.find((x) => !x.scanned);
    if (!s) return null;
    s.x = 220; s.y = 0; s.revealed = 8;
    return this.screenForWorld(s.x, s.y);
  },
  prepareMousePoint(dx = 230, dy = 0) {
    const p = G.player;
    p.x = 0; p.y = 0; p.vx = 0; p.vy = 0; G.cam.x = 0; G.cam.y = 0; G.nav = null;
    [...G.relics, ...G.supplies, ...G.structures].forEach((obj) => {
      if (dist(dx, dy, obj.x, obj.y) < 150) {
        obj.x += 620;
        obj.y += 620;
        obj.revealed = 0;
      }
    });
    return this.screenForWorld(dx, dy);
  },
  prepareReturnRoute() {
    const p = G.player;
    p.x = 520; p.y = 0; p.vx = 0; p.vy = 0; p.heat = 0; G.cam.x = p.x; G.cam.y = 0; G.nav = null;
    G.obstacles.push(
      { x: 260, y: 0, rad: 86, jag: 0.8, seed: 777, variant: 1, rot: 0, scale: 1 },
      { x: 365, y: 118, rad: 72, jag: 0.8, seed: 778, variant: 2, rot: 0.4, scale: 1 },
      { x: 150, y: -118, rad: 70, jag: 0.8, seed: 779, variant: 0, rot: -0.2, scale: 1 }
    );
    return { x: p.x, y: p.y };
  },
  prepareRemotePickupGuard() {
    const p = G.player;
    const r = G.relics.find((x) => x.kind === 'relic' && !x.taken) || G.relics.find((x) => x.kind === 'relic');
    p.x = 520; p.y = 0; p.vx = 0; p.vy = 0; p.heat = 0; p.cargo.length = 0; G.cam.x = p.x; G.cam.y = 0; G.nav = null;
    r.x = 0; r.y = 0; r.taken = false; r.revealed = 8;
    [...G.relics, ...G.supplies, ...G.structures].forEach((obj) => {
      if (obj !== r && dist(0, 0, obj.x, obj.y) < 320) {
        obj.x += 760;
        obj.y += 760;
        obj.revealed = 0;
      }
    });
    G.nav = {
      kind: 'relic',
      target: r,
      x: 320,
      y: 220,
      avoidThreats: true,
      path: [{ x: 320, y: 220 }, { x: r.x, y: r.y }],
      message: '调试：远程拾取保护。',
      created: G.t
    };
    return { targetId: r.id, cargo: p.cargo.length, path: G.nav?.path || [] };
  },
  jumpToNextWaypoint() {
    const p = G.player;
    const pos = navPosition();
    if (!pos) return null;
    p.x = pos.x;
    p.y = pos.y;
    p.vx = 0;
    p.vy = 0;
    G.cam.x = p.x;
    G.cam.y = p.y;
    return { x: p.x, y: p.y, pathLength: G.nav?.path?.length || 0 };
  },
  prepareAutoIdle() {
    G.ai.enabled = false;
    G.ai.lastInput = G.t - 10.2;
    G.nav = null;
    syncAiButton();
  },
  prepareAiOxygen() {
    const p = G.player;
    p.x = 420; p.y = 0; p.vx = 0; p.vy = 0; p.oxygen = 24; p.hull = 100; p.cargo.length = 0; G.cam.x = p.x; G.cam.y = 0; G.nav = null;
    const s = G.supplies.find((x) => x.kind === 'oxygen' && !x.taken) || G.supplies[0];
    s.kind = 'oxygen'; s.name = '氧气罐'; s.sprite = 'oxygen'; s.x = 680; s.y = 0; s.revealed = 8; s.taken = false;
    [...G.relics, ...G.structures, ...G.fauna, ...G.mines, ...G.obstacles].forEach((obj) => {
      if (dist(680, 0, obj.x, obj.y) < 220) { obj.x += 680; obj.y += 680; }
    });
    return this.screenForWorld(s.x, s.y);
  },
  prepareAiFullCargo() {
    const p = G.player;
    p.x = 520; p.y = 0; p.vx = 0; p.vy = 0; p.oxygen = 100; p.hull = 100; G.cam.x = p.x; G.cam.y = 0; G.nav = null;
    p.cargo = Array.from({ length: p.cargoMax }, (_, i) => ({
      id: `debug-cargo-${i}`,
      kind: 'relic',
      subtype: 'crate',
      name: '测试货箱',
      sprite: 'crate',
      value: 100,
      weight: 1
    }));
    G.obstacles.push(
      { x: 260, y: 0, rad: 86, jag: 0.8, seed: 888, variant: 1, rot: 0, scale: 1 },
      { x: 365, y: 118, rad: 72, jag: 0.8, seed: 889, variant: 2, rot: 0.4, scale: 1 },
      { x: 150, y: -118, rad: 70, jag: 0.8, seed: 890, variant: 0, rot: -0.2, scale: 1 }
    );
    if (G.fish[0]) {
      G.fish[0].x = 300; G.fish[0].y = 0; G.fish[0].baseX = 300; G.fish[0].baseY = 0; G.fish[0].scale = 2.2;
    }
    return { x: p.x, y: p.y };
  },
  teleportToCore() {
    const r = G.relics.find((x) => x.kind === 'core' && !x.taken);
    if (r) { G.player.x = r.x - 22; G.player.y = r.y; G.cam.x = G.player.x; G.cam.y = G.player.y; r.revealed = 8; }
  },
  teleportToStructure() {
    const s = G.structures.find((x) => !x.scanned);
    if (s) { G.player.x = s.x - Math.max(28, s.rad * 0.35); G.player.y = s.y; G.cam.x = G.player.x; G.cam.y = G.player.y; s.revealed = 8; }
  },
  teleportToSupply(kind = '') {
    const s = G.supplies.find((x) => !x.taken && (!kind || x.kind === kind));
    if (s) { G.player.x = s.x - 18; G.player.y = s.y; G.cam.x = G.player.x; G.cam.y = G.player.y; s.revealed = 8; }
  },
  teleportHome() { G.player.x = 20; G.player.y = 10; G.cam.x = 0; G.cam.y = 0; },
  finishScans() { G.player.scans = SCAN_GOAL; },
  collect: tryCollect,
  dock,
  reset
};
