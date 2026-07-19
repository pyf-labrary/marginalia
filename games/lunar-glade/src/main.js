import { preloadMedia } from './assets.js';
import { AudioSys } from './audio.js';
import {
  TAU,
  angleTo,
  clamp,
  dist,
  formatTime,
  lerp,
  mulberry32,
  wrapAngle
} from './util.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const overlay = document.getElementById('overlay');
const ending = document.getElementById('ending');
const pauseMenu = document.getElementById('pauseMenu');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const closeEndBtn = document.getElementById('closeEndBtn');
const resumeBtn = document.getElementById('resumeBtn');
const pauseRestartBtn = document.getElementById('pauseRestartBtn');
const titleBtn = document.getElementById('titleBtn');
const muteBtn = document.getElementById('muteBtn');
const pauseMuteBtn = document.getElementById('pauseMuteBtn');
const musicRange = document.getElementById('musicRange');
const sfxRange = document.getElementById('sfxRange');
const musicValue = document.getElementById('musicValue');
const sfxValue = document.getElementById('sfxValue');
const progressEl = document.getElementById('progress');
const toastEl = document.getElementById('toast');
const logEl = document.getElementById('log');
const endTitle = document.getElementById('endTitle');
const endText = document.getElementById('endText');

const meters = {
  hp: document.querySelector('#mHp .value'),
  hpBar: document.querySelector('#mHp .bar i'),
  blossoms: document.querySelector('#mBlossom .value'),
  shrines: document.querySelector('#mShrine .value'),
  time: document.querySelector('#mTime .value'),
  objective: document.getElementById('objectiveMain'),
  hint: document.getElementById('objectiveHint'),
  lantern: document.getElementById('lanternState')
};

const WORLD = 3200;
const TILE = 64;
const SHRINE_GOAL = 5;
const BLOSSOM_COST = 3;
const MAX_HP = 5;
const SETTINGS_KEY = 'lunar-glade-settings-v1';

let W = 1;
let H = 1;
let DPR = 1;
let media = null;
let audio = null;
let G = null;
let last = performance.now();
let running = false;
let muted = false;
let pauseMenuOpen = false;
const keys = new Set();
const just = new Set();

const settings = {
  musicVolume: 0.55,
  sfxVolume: 0.85
};

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    if (Number.isFinite(s.musicVolume)) settings.musicVolume = clamp(s.musicVolume, 0, 1);
    if (Number.isFinite(s.sfxVolume)) settings.sfxVolume = clamp(s.sfxVolume, 0, 1);
    muted = Boolean(s.muted);
  } catch {}
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, muted }));
  } catch {}
}

function toast(msg, ms = 2200) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove('show'), ms);
}

function log(msg) {
  const d = document.createElement('div');
  d.textContent = msg;
  logEl.prepend(d);
  while (logEl.children.length > 8) logEl.lastChild.remove();
}

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = (W * DPR) | 0;
  canvas.height = (H * DPR) | 0;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

function createGame(seed = (Math.random() * 1e9) | 0) {
  const rng = mulberry32(seed);
  const player = {
    x: WORLD * 0.5,
    y: WORLD * 0.5 + 40,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    speed: 0,
    hp: MAX_HP,
    maxHp: MAX_HP,
    blossoms: 0,
    lantern: true,
    invuln: 0,
    anim: 0,
    moving: false,
    radius: 18
  };

  // path mask: center plaza + 5 radial arms to shrines
  const pathCells = new Set();
  const markPath = (x, y) => pathCells.add(`${x | 0},${y | 0}`);
  const cx = (WORLD / TILE / 2) | 0;
  const cy = (WORLD / TILE / 2) | 0;
  for (let r = -4; r <= 4; r++) {
    for (let c = -4; c <= 4; c++) {
      if (r * r + c * c <= 20) markPath(cx + c, cy + r);
    }
  }

  const shrines = [];
  for (let i = 0; i < SHRINE_GOAL; i++) {
    const a = (i / SHRINE_GOAL) * TAU - Math.PI / 2 + 0.15;
    const rad = 900 + rng() * 180;
    const sx = WORLD * 0.5 + Math.cos(a) * rad;
    const sy = WORLD * 0.5 + Math.sin(a) * rad;
    shrines.push({
      x: sx,
      y: sy,
      lit: false,
      progress: 0,
      radius: 42
    });
    // path from center to shrine
    const steps = 40;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = WORLD * 0.5 + (sx - WORLD * 0.5) * t;
      const py = WORLD * 0.5 + (sy - WORLD * 0.5) * t;
      const tx = (px / TILE) | 0;
      const ty = (py / TILE) | 0;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) markPath(tx + ox, ty + oy);
      }
    }
  }

  const trees = [];
  for (let i = 0; i < 90; i++) {
    let x;
    let y;
    let ok = false;
    for (let tries = 0; tries < 30 && !ok; tries++) {
      x = 120 + rng() * (WORLD - 240);
      y = 120 + rng() * (WORLD - 240);
      const d0 = dist(x, y, WORLD * 0.5, WORLD * 0.5);
      if (d0 < 220) continue;
      if (shrines.some((s) => dist(x, y, s.x, s.y) < 140)) continue;
      if (trees.some((t) => dist(x, y, t.x, t.y) < 90)) continue;
      ok = true;
    }
    if (ok) trees.push({ x, y, s: 0.7 + rng() * 0.55, r: 28 });
  }

  const blossoms = [];
  for (let i = 0; i < 42; i++) {
    let x;
    let y;
    let ok = false;
    for (let tries = 0; tries < 40 && !ok; tries++) {
      x = 100 + rng() * (WORLD - 200);
      y = 100 + rng() * (WORLD - 200);
      if (dist(x, y, WORLD * 0.5, WORLD * 0.5) < 160) continue;
      if (trees.some((t) => dist(x, y, t.x, t.y) < 50)) continue;
      ok = true;
    }
    if (ok) {
      blossoms.push({
        x,
        y,
        taken: false,
        bob: rng() * TAU,
        r: 16
      });
    }
  }

  const moths = [];
  for (let i = 0; i < 10; i++) {
    const a = rng() * TAU;
    const rad = 500 + rng() * 1000;
    moths.push({
      x: WORLD * 0.5 + Math.cos(a) * rad,
      y: WORLD * 0.5 + Math.sin(a) * rad,
      angle: rng() * TAU,
      speed: 55 + rng() * 40,
      patrolA: a,
      patrolR: rad,
      phase: rng() * TAU,
      alert: 0,
      r: 20
    });
  }

  return {
    seed,
    player,
    pathCells,
    shrines,
    trees,
    blossoms,
    moths,
    particles: [],
    floats: [],
    cam: { x: player.x, y: player.y, shake: 0 },
    time: 0,
    score: 0,
    ended: false,
    won: false,
    logs: [],
    gateOpen: false,
    stepAcc: 0
  };
}

function isPath(g, wx, wy) {
  const tx = (wx / TILE) | 0;
  const ty = (wy / TILE) | 0;
  return g.pathCells.has(`${tx},${ty}`);
}

function solidAt(g, x, y, r = 14) {
  if (x < 40 || y < 40 || x > WORLD - 40 || y > WORLD - 40) return true;
  for (const t of g.trees) {
    if (dist(x, y, t.x, t.y) < t.r + r) return true;
  }
  return false;
}

function spawnParticles(g, x, y, color, n = 10, speed = 80) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const s = speed * (0.3 + Math.random());
    g.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 0.4 + Math.random() * 0.5,
      age: 0,
      color,
      size: 2 + Math.random() * 3
    });
  }
}

function floatText(g, x, y, text, color = '#ffe9a8') {
  g.floats.push({ x, y, text, color, age: 0, life: 1.1 });
}

function damagePlayer(g, amount) {
  const p = g.player;
  if (p.invuln > 0 || g.ended) return;
  p.hp -= amount;
  p.invuln = 1.1;
  G.cam.shake = 10;
  audio?.hit();
  spawnParticles(g, p.x, p.y, 'rgba(255,80,120,0.9)', 14, 120);
  log('被影蛾击中了！');
  if (p.hp <= 0) {
    p.hp = 0;
    endGame(false);
  }
}

function endGame(won) {
  if (!G || G.ended) return;
  G.ended = true;
  G.won = won;
  running = false;
  pauseMenuOpen = false;
  pauseMenu.classList.add('hide');
  if (won) {
    audio?.win();
    endTitle.textContent = '月门已开';
    endText.textContent = `五座月祠重燃。你收集了 ${G.player.blossoms} 朵余下的月华，用时 ${formatTime(G.time)}。林隙再度明亮。`;
  } else {
    audio?.lose();
    endTitle.textContent = '灯火熄灭';
    endText.textContent = `影蛾吞没了你的灯火。已点亮 ${G.shrines.filter((s) => s.lit).length}/${SHRINE_GOAL} 座月祠。再试一次，灯使。`;
  }
  ending.classList.remove('hide');
}

function update(dt) {
  if (!G || G.ended) return;
  const p = G.player;
  G.time += dt;
  if (p.invuln > 0) p.invuln -= dt;

  // input
  let ix = 0;
  let iy = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) iy -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) iy += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
  if (ix || iy) {
    const len = Math.hypot(ix, iy) || 1;
    ix /= len;
    iy /= len;
  }

  if (just.has('Space')) {
    p.lantern = !p.lantern;
    if (p.lantern) {
      audio?.lanternOn();
      toast('提灯点亮 · 影蛾会被吸引');
    } else {
      audio?.lanternOff();
      toast('提灯熄灭 · 更安全，但无法点灯');
    }
  }

  const base = p.lantern ? 168 : 198;
  const targetSp = (ix || iy) ? base : 0;
  p.speed = lerp(p.speed, targetSp, 1 - Math.exp(-dt * 10));
  p.vx = ix * p.speed;
  p.vy = iy * p.speed;
  p.moving = p.speed > 12;
  if (p.moving) {
    p.angle = angleTo(0, 0, p.vx, p.vy);
    p.anim += dt * (p.lantern ? 9 : 11);
    G.stepAcc += dt;
    if (G.stepAcc > 0.28) {
      G.stepAcc = 0;
      if (Math.random() < 0.5) audio?.step();
    }
  }

  let nx = p.x + p.vx * dt;
  let ny = p.y + p.vy * dt;
  if (!solidAt(G, nx, p.y, p.radius)) p.x = nx;
  if (!solidAt(G, p.x, ny, p.radius)) p.y = ny;
  p.x = clamp(p.x, 48, WORLD - 48);
  p.y = clamp(p.y, 48, WORLD - 48);

  // blossoms
  for (const b of G.blossoms) {
    if (b.taken) continue;
    b.bob += dt * 2.4;
    if (dist(p.x, p.y, b.x, b.y) < 28) {
      b.taken = true;
      p.blossoms += 1;
      G.score += 10;
      audio?.pickup();
      spawnParticles(G, b.x, b.y, 'rgba(255,190,220,0.95)', 12, 90);
      floatText(G, b.x, b.y - 20, '+1 月华', '#ffd0e8');
      log('拾取月华 +1');
    }
  }

  // shrines
  for (const s of G.shrines) {
    const d = dist(p.x, p.y, s.x, s.y);
    if (s.lit) continue;
    if (d < 58 && p.lantern && p.blossoms >= BLOSSOM_COST) {
      s.progress += dt * 0.55;
      if (s.progress >= 1) {
        s.lit = true;
        s.progress = 1;
        p.blossoms -= BLOSSOM_COST;
        G.score += 100;
        audio?.shrine();
        G.cam.shake = 8;
        spawnParticles(G, s.x, s.y - 30, 'rgba(255,220,140,0.95)', 28, 140);
        floatText(G, s.x, s.y - 50, '月祠重燃', '#ffe7a0');
        log(`月祠点亮！（${G.shrines.filter((x) => x.lit).length}/${SHRINE_GOAL}）`);
        toast(`月祠点亮 ${G.shrines.filter((x) => x.lit).length}/${SHRINE_GOAL}`);
      }
    } else if (!s.lit) {
      s.progress = Math.max(0, s.progress - dt * 0.25);
    }
  }
  const litCount = G.shrines.filter((s) => s.lit).length;
  G.gateOpen = litCount >= SHRINE_GOAL;
  if (G.gateOpen && dist(p.x, p.y, WORLD * 0.5, WORLD * 0.5) < 70) {
    G.score += 250;
    endGame(true);
    return;
  }

  // moths AI
  for (const m of G.moths) {
    m.phase += dt;
    const toP = dist(m.x, m.y, p.x, p.y);
    const detect = p.lantern ? 320 : 140;
    if (toP < detect) {
      m.alert = Math.min(1, m.alert + dt * 1.4);
    } else {
      m.alert = Math.max(0, m.alert - dt * 0.5);
    }
    let tx;
    let ty;
    let spd = m.speed;
    if (m.alert > 0.25) {
      tx = p.x;
      ty = p.y;
      spd *= p.lantern ? 1.25 : 0.85;
    } else {
      m.patrolA += dt * 0.25;
      tx = WORLD * 0.5 + Math.cos(m.patrolA) * m.patrolR + Math.cos(m.phase * 0.7) * 40;
      ty = WORLD * 0.5 + Math.sin(m.patrolA) * m.patrolR + Math.sin(m.phase * 0.9) * 40;
      spd *= 0.55;
    }
    const ang = angleTo(m.x, m.y, tx, ty);
    m.angle = m.angle + wrapAngle(ang - m.angle) * Math.min(1, dt * 4);
    const mx = m.x + Math.cos(m.angle) * spd * dt;
    const my = m.y + Math.sin(m.angle) * spd * dt;
    if (!solidAt(G, mx, m.y, m.r * 0.6)) m.x = mx;
    if (!solidAt(G, m.x, my, m.r * 0.6)) m.y = my;
    m.x = clamp(m.x, 60, WORLD - 60);
    m.y = clamp(m.y, 60, WORLD - 60);

    if (dist(m.x, m.y, p.x, p.y) < p.radius + m.r * 0.7) {
      damagePlayer(G, 1);
      // knockback
      const ka = angleTo(m.x, m.y, p.x, p.y);
      p.x += Math.cos(ka) * 36;
      p.y += Math.sin(ka) * 36;
    }
  }

  // particles / floats
  for (let i = G.particles.length - 1; i >= 0; i--) {
    const pt = G.particles[i];
    pt.age += dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vx *= 0.96;
    pt.vy *= 0.96;
    if (pt.age >= pt.life) G.particles.splice(i, 1);
  }
  for (let i = G.floats.length - 1; i >= 0; i--) {
    const f = G.floats[i];
    f.age += dt;
    f.y -= 28 * dt;
    if (f.age >= f.life) G.floats.splice(i, 1);
  }

  // camera
  G.cam.x = lerp(G.cam.x, p.x, 1 - Math.exp(-dt * 6));
  G.cam.y = lerp(G.cam.y, p.y, 1 - Math.exp(-dt * 6));
  G.cam.shake = Math.max(0, G.cam.shake - dt * 28);

  updateHud();
  just.clear();
}

function updateHud() {
  if (!G) return;
  const p = G.player;
  const lit = G.shrines.filter((s) => s.lit).length;
  meters.hp.textContent = `${p.hp}/${p.maxHp}`;
  meters.hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  meters.blossoms.textContent = String(p.blossoms);
  meters.shrines.textContent = `${lit}/${SHRINE_GOAL}`;
  meters.time.textContent = formatTime(G.time);
  meters.lantern.textContent = p.lantern ? '提灯 · 开' : '提灯 · 关';
  meters.lantern.classList.toggle('on', p.lantern);
  if (G.gateOpen) {
    meters.objective.textContent = '返回中央月门';
    meters.hint.textContent = '五祠皆燃 · 踏入月门完成归航';
  } else {
    meters.objective.textContent = `点亮月祠 ${lit}/${SHRINE_GOAL}`;
    meters.hint.textContent = `提灯靠近月祠，消耗 ${BLOSSOM_COST} 月华点燃 · Space 切换提灯`;
  }
}

function draw() {
  if (!media) return;
  ctx.clearRect(0, 0, W, H);

  // night sky backdrop
  const sky = ctx.createRadialGradient(W * 0.5, H * 0.35, 40, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
  sky.addColorStop(0, '#1a2744');
  sky.addColorStop(0.45, '#0c1428');
  sky.addColorStop(1, '#05070f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  if (!G) return;

  const shakeX = G.cam.shake ? (Math.random() - 0.5) * G.cam.shake : 0;
  const shakeY = G.cam.shake ? (Math.random() - 0.5) * G.cam.shake : 0;
  const camX = G.cam.x - W / 2 + shakeX;
  const camY = G.cam.y - H / 2 + shakeY;

  ctx.save();
  ctx.translate(-camX, -camY);

  // ground tiles
  const t0x = Math.floor(camX / TILE) - 1;
  const t0y = Math.floor(camY / TILE) - 1;
  const t1x = Math.ceil((camX + W) / TILE) + 1;
  const t1y = Math.ceil((camY + H) / TILE) + 1;
  for (let ty = t0y; ty <= t1y; ty++) {
    for (let tx = t0x; tx <= t1x; tx++) {
      if (tx < 0 || ty < 0 || tx >= WORLD / TILE || ty >= WORLD / TILE) continue;
      const img = G.pathCells.has(`${tx},${ty}`) && media.path ? media.path : media.grass;
      if (img) {
        ctx.drawImage(img, tx * TILE, ty * TILE, TILE + 0.5, TILE + 0.5);
      } else {
        ctx.fillStyle = G.pathCells.has(`${tx},${ty}`) ? '#6a7590' : '#1e3a2f';
        ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
      }
    }
  }

  // ambient vignette of night over tiles
  // moon gate
  const gx = WORLD * 0.5;
  const gy = WORLD * 0.5;
  const gatePulse = 0.5 + 0.5 * Math.sin(G.time * 2);
  ctx.save();
  const gg = ctx.createRadialGradient(gx, gy, 10, gx, gy, G.gateOpen ? 110 : 70);
  gg.addColorStop(0, G.gateOpen ? `rgba(255,240,200,${0.45 + gatePulse * 0.2})` : 'rgba(180,200,255,0.18)');
  gg.addColorStop(1, 'rgba(180,200,255,0)');
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(gx, gy, G.gateOpen ? 110 : 70, 0, TAU);
  ctx.fill();
  if (media.iconMoon) {
    const s = G.gateOpen ? 72 : 52;
    ctx.globalAlpha = 0.85 + gatePulse * 0.15;
    ctx.drawImage(media.iconMoon, gx - s / 2, gy - s / 2, s, s);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // blossoms (below tall props)
  for (const b of G.blossoms) {
    if (b.taken) continue;
    if (b.x < camX - 40 || b.y < camY - 40 || b.x > camX + W + 40 || b.y > camY + H + 40) continue;
    const by = b.y + Math.sin(b.bob) * 3;
    if (media.moonblossom) {
      const s = 36;
      ctx.drawImage(media.moonblossom, b.x - s / 2, by - s / 2, s, s);
    } else {
      ctx.fillStyle = '#f0a0c8';
      ctx.beginPath();
      ctx.arc(b.x, by, 8, 0, TAU);
      ctx.fill();
    }
  }

  // shrines
  for (const s of G.shrines) {
    if (s.x < camX - 80 || s.y < camY - 80 || s.x > camX + W + 80 || s.y > camY + H + 80) continue;
    const img = s.lit ? media.shrineLit : media.shrine;
    const sSize = 88;
    if (img) {
      ctx.drawImage(img, s.x - sSize / 2, s.y - sSize * 0.72, sSize, sSize);
    } else {
      ctx.fillStyle = s.lit ? '#e8c070' : '#7a8498';
      ctx.fillRect(s.x - 22, s.y - 30, 44, 50);
    }
    if (!s.lit && s.progress > 0) {
      ctx.strokeStyle = 'rgba(255,220,150,0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(s.x, s.y - 10, 34, -Math.PI / 2, -Math.PI / 2 + s.progress * TAU);
      ctx.stroke();
    }
    if (s.lit) {
      const lg = ctx.createRadialGradient(s.x, s.y - 28, 4, s.x, s.y - 28, 90);
      lg.addColorStop(0, 'rgba(255,220,140,0.35)');
      lg.addColorStop(1, 'rgba(255,220,140,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(s.x, s.y - 28, 90, 0, TAU);
      ctx.fill();
    }
  }

  // trees (depth sort with player/moths later - draw far trees first)
  const drawables = [];
  for (const t of G.trees) {
    if (t.x < camX - 60 || t.y < camY - 120 || t.x > camX + W + 60 || t.y > camY + H + 40) continue;
    drawables.push({ y: t.y, kind: 'tree', t });
  }
  for (const m of G.moths) {
    if (m.x < camX - 50 || m.y < camY - 50 || m.x > camX + W + 50 || m.y > camY + H + 50) continue;
    drawables.push({ y: m.y, kind: 'moth', m });
  }
  drawables.push({ y: G.player.y, kind: 'player' });
  drawables.sort((a, b) => a.y - b.y);

  for (const d of drawables) {
    if (d.kind === 'tree') {
      const t = d.t;
      const h = 120 * t.s;
      const w = 70 * t.s;
      if (media.tree) {
        ctx.drawImage(media.tree, t.x - w / 2, t.y - h + 10, w, h);
      } else {
        ctx.fillStyle = '#3a5a6a';
        ctx.beginPath();
        ctx.moveTo(t.x, t.y - h);
        ctx.lineTo(t.x + w / 2, t.y);
        ctx.lineTo(t.x - w / 2, t.y);
        ctx.fill();
      }
    } else if (d.kind === 'moth') {
      drawMoth(d.m);
    } else {
      drawPlayer(G.player);
    }
  }

  // particles
  for (const pt of G.particles) {
    const a = 1 - pt.age / pt.life;
    ctx.globalAlpha = a;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size * a, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // floats
  ctx.font = '600 14px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (const f of G.floats) {
    ctx.globalAlpha = 1 - f.age / f.life;
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  // lantern light overlay around player
  if (G.player.lantern) {
    const px = G.player.x;
    const py = G.player.y;
    const lg = ctx.createRadialGradient(px, py, 20, px, py, 210);
    lg.addColorStop(0, 'rgba(255,220,150,0.16)');
    lg.addColorStop(0.45, 'rgba(255,200,120,0.06)');
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(px, py, 210, 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  // soft night veil — radial falloff from lantern / lit shrines
  {
    const sx = G.player.x - camX;
    const sy = G.player.y - camY;
    ctx.save();
    if (G.player.lantern) {
      const maxR = Math.hypot(Math.max(sx, W - sx), Math.max(sy, H - sy)) + 40;
      const veil = ctx.createRadialGradient(sx, sy, 70, sx, sy, maxR);
      veil.addColorStop(0, 'rgba(3,6,14,0)');
      veil.addColorStop(0.22, 'rgba(3,6,14,0.12)');
      veil.addColorStop(0.48, 'rgba(3,6,14,0.38)');
      veil.addColorStop(1, 'rgba(3,6,14,0.62)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, W, H);
      const warm = ctx.createRadialGradient(sx, sy, 8, sx, sy, 160);
      warm.addColorStop(0, 'rgba(255,220,150,0.1)');
      warm.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = 'rgba(3,6,14,0.36)';
      ctx.fillRect(0, 0, W, H);
    }
    // lit shrines punch soft local warmth (drawn additive-ish via light fill)
    ctx.globalCompositeOperation = 'lighter';
    for (const s of G.shrines) {
      if (!s.lit) continue;
      const ssx = s.x - camX;
      const ssy = s.y - camY - 20;
      if (ssx < -160 || ssy < -160 || ssx > W + 160 || ssy > H + 160) continue;
      const sg = ctx.createRadialGradient(ssx, ssy, 6, ssx, ssy, 130);
      sg.addColorStop(0, 'rgba(255,210,130,0.16)');
      sg.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(ssx, ssy, 130, 0, TAU);
      ctx.fill();
    }
    if (G.gateOpen) {
      const gx = WORLD * 0.5 - camX;
      const gy = WORLD * 0.5 - camY;
      const gg = ctx.createRadialGradient(gx, gy, 8, gx, gy, 110);
      gg.addColorStop(0, 'rgba(255,240,200,0.14)');
      gg.addColorStop(1, 'rgba(255,230,180,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(gx, gy, 110, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // minimap
  drawMinimap();
}

function drawPlayer(p) {
  const frames = media.walk;
  let img = media.hero;
  if (frames && frames.length && p.moving) {
    img = frames[(p.anim | 0) % frames.length] || img;
  }
  const flash = p.invuln > 0 && Math.sin(p.invuln * 40) > 0;
  if (flash) ctx.globalAlpha = 0.45;
  const s = 56;
  ctx.save();
  ctx.translate(p.x, p.y);
  // soft shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 16, 7, 0, 0, TAU);
  ctx.fill();
  if (img) {
    // face movement direction roughly by flip
    const flip = Math.cos(p.angle) < 0;
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -s / 2, -s + 8, s, s);
  } else {
    ctx.fillStyle = '#d8e4f0';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  if (p.lantern) {
    const lg = ctx.createRadialGradient(p.x + 10, p.y - 8, 2, p.x + 10, p.y - 8, 36);
    lg.addColorStop(0, 'rgba(255,230,160,0.55)');
    lg.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(p.x + 10, p.y - 8, 36, 0, TAU);
    ctx.fill();
  }
}

function drawMoth(m) {
  const s = 44;
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.angle + Math.sin(m.phase * 8) * 0.08);
  if (media.moth) {
    ctx.drawImage(media.moth, -s / 2, -s / 2, s, s);
  } else {
    ctx.fillStyle = '#6a4cff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 10, 0, 0, TAU);
    ctx.fill();
  }
  if (m.alert > 0.3) {
    ctx.strokeStyle = `rgba(180,120,255,${0.3 + m.alert * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 22 + m.alert * 8, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMinimap() {
  const size = 148;
  const pad = 18;
  const x = W - size - pad;
  const y = H - size - pad - 8;
  ctx.save();
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = 'rgba(4,10,18,0.72)';
  ctx.strokeStyle = 'rgba(170,210,230,0.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 10);
  ctx.fill();
  ctx.stroke();

  const scale = size / WORLD;
  const px = (wx) => x + wx * scale;
  const py = (wy) => y + wy * scale;

  // paths
  ctx.fillStyle = 'rgba(150,170,200,0.35)';
  for (const key of G.pathCells) {
    const [tx, ty] = key.split(',').map(Number);
    ctx.fillRect(px(tx * TILE), py(ty * TILE), Math.max(1, TILE * scale), Math.max(1, TILE * scale));
  }

  for (const s of G.shrines) {
    ctx.fillStyle = s.lit ? '#ffd27a' : '#7a8aa0';
    ctx.beginPath();
    ctx.arc(px(s.x), py(s.y), 3.2, 0, TAU);
    ctx.fill();
  }

  ctx.fillStyle = '#f0a0c8';
  for (const b of G.blossoms) {
    if (b.taken) continue;
    ctx.fillRect(px(b.x), py(b.y), 2, 2);
  }

  ctx.fillStyle = '#a78bfa';
  for (const m of G.moths) {
    ctx.beginPath();
    ctx.arc(px(m.x), py(m.y), 2, 0, TAU);
    ctx.fill();
  }

  // player
  ctx.fillStyle = '#fff6d0';
  ctx.beginPath();
  ctx.arc(px(G.player.x), py(G.player.y), 3.5, 0, TAU);
  ctx.fill();

  // gate
  ctx.strokeStyle = G.gateOpen ? 'rgba(255,230,160,0.9)' : 'rgba(180,200,255,0.5)';
  ctx.beginPath();
  ctx.arc(px(WORLD * 0.5), py(WORLD * 0.5), 5, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.05);
  last = now;
  if (running && !pauseMenuOpen) update(dt);
  draw();
  requestAnimationFrame(frame);
}

async function startRun() {
  await audio?.init();
  G = createGame();
  ending.classList.add('hide');
  overlay.classList.add('hide');
  pauseMenu.classList.add('hide');
  pauseMenuOpen = false;
  running = true;
  log('进入月白林隙');
  toast('收集月华，提灯点亮五座月祠，再返回中央月门');
  updateHud();
}

function returnTitle() {
  running = false;
  G = null;
  ending.classList.add('hide');
  pauseMenu.classList.add('hide');
  pauseMenuOpen = false;
  overlay.classList.remove('hide');
}

function togglePause() {
  if (!running || !G || G.ended) return;
  pauseMenuOpen = !pauseMenuOpen;
  pauseMenu.classList.toggle('hide', !pauseMenuOpen);
  if (pauseMenuOpen) audio?.ui();
}

function bind() {
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
    just.add(e.code);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.code === 'Escape') {
      if (ending && !ending.classList.contains('hide')) return;
      if (overlay && !overlay.classList.contains('hide')) return;
      togglePause();
    }
    if (e.code === 'KeyM') {
      muted = !muted;
      audio?.setMuted(muted);
      saveSettings();
      muteBtn.textContent = muted ? '取消静音' : '静音';
      pauseMuteBtn.textContent = muted ? '取消静音' : '静音';
    }
    if (e.code === 'KeyR' && G?.ended) startRun();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));

  startBtn.addEventListener('click', () => startRun());
  restartBtn.addEventListener('click', () => startRun());
  closeEndBtn.addEventListener('click', () => returnTitle());
  resumeBtn.addEventListener('click', () => togglePause());
  pauseRestartBtn.addEventListener('click', () => startRun());
  titleBtn.addEventListener('click', () => returnTitle());
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    audio?.setMuted(muted);
    saveSettings();
    muteBtn.textContent = muted ? '取消静音' : '静音';
    pauseMuteBtn.textContent = muted ? '取消静音' : '静音';
  });
  pauseMuteBtn.addEventListener('click', () => muteBtn.click());

  musicRange.addEventListener('input', () => {
    settings.musicVolume = Number(musicRange.value) / 100;
    musicValue.textContent = `${musicRange.value}%`;
    audio?.setMusic(settings.musicVolume);
    saveSettings();
  });
  sfxRange.addEventListener('input', () => {
    settings.sfxVolume = Number(sfxRange.value) / 100;
    sfxValue.textContent = `${sfxRange.value}%`;
    audio?.setSfx(settings.sfxVolume);
    saveSettings();
  });
}

async function boot() {
  loadSettings();
  musicRange.value = String((settings.musicVolume * 100) | 0);
  sfxRange.value = String((settings.sfxVolume * 100) | 0);
  musicValue.textContent = `${musicRange.value}%`;
  sfxValue.textContent = `${sfxRange.value}%`;
  muteBtn.textContent = muted ? '取消静音' : '静音';
  pauseMuteBtn.textContent = muted ? '取消静音' : '静音';

  resize();
  bind();
  audio = new AudioSys();
  audio.musicVol = settings.musicVolume;
  audio.sfxVol = settings.sfxVolume;
  audio.muted = muted;

  progressEl.textContent = '装载资源…';
  media = await preloadMedia((done, total) => {
    progressEl.textContent = `装载资源 ${done}/${total}`;
  });
  if (media.keyart) {
    const url = `url("${media.keyart.src}")`;
    document.documentElement.style.setProperty('--keyart', url);
    const hero = document.querySelector('.hero');
    if (hero) hero.style.setProperty('--keyart', url);
  }
  progressEl.textContent = '就绪';
  startBtn.disabled = false;
  startBtn.textContent = '进入林隙';

  // expose debug
  window.__LUNAR = {
    get G() {
      return G;
    },
    startRun,
    endGame,
    toast
  };

  last = performance.now();
  requestAnimationFrame(frame);
}

boot();
