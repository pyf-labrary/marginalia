// main.js — conductor: input, cameras, gunnery, repair, warp transition, game loop
import * as THREE from 'three';
import { clamp, damp, rand } from './util.js';
import { World, getHeight, desertness, WORLD } from './world.js';
import { Effects } from './effects.js';
import { AudioSys } from './audio.js';
import { Hud } from './hud.js';
import { Truck } from './truck.js';
import { DinoManager, Dino, Ptero, SPECIES } from './dinos.js';
import { UfoManager } from './ufo.js';
import { City, CITY_HALF } from './city.js';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- boot
const renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd4e0);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 5000);

const audio = new AudioSys();
const effects = new Effects(scene);
const hud = new Hud();
const world = new World(scene, effects);
const truck = new Truck(scene, effects, audio);

const ctx = {
  scene, truck, effects, audio, hud, time: 0,
  onKill: (ent, weak) => onKill(ent, weak),
  onUfoDown: (ufo) => onUfoDown(ufo),
};
const dinoMgr = new DinoManager(ctx);
const ufoMgr = new UfoManager(ctx);
let city = null;

// title backdrop = generated key art
$('title').style.backgroundImage = "url('assets/keyart.jpg')";

hud.initMinimap(getHeight, desertness, WORLD);

// ---------------------------------------------------------------- preload gate
// everything heavy is fetched BEFORE the start button unlocks, so the warp
// video and BGM play back from memory with zero mid-game stutter
let warpUrl = 'assets/timewarp.mp4';
const startBtn = $('startBtn');
const START_LABEL = startBtn.textContent;
startBtn.disabled = true;
let preloadDone = 0;
const PRELOAD_TOTAL = 3;
function preloadTick() {
  preloadDone++;
  if (preloadDone >= PRELOAD_TOTAL) {
    startBtn.disabled = false;
    startBtn.textContent = START_LABEL;
  } else {
    startBtn.textContent = `资 源 装 载 中 ${preloadDone}/${PRELOAD_TOTAL}`;
  }
}
startBtn.textContent = `资 源 装 载 中 0/${PRELOAD_TOTAL}`;
const track = (p) => Promise.resolve(p).then(preloadTick, preloadTick);
track(new Promise((res, rej) => {
  const img = new Image();
  img.onload = res; img.onerror = rej;
  img.src = 'assets/keyart.jpg';
}));
track(audio.preload());
track(fetch('assets/timewarp.mp4')
  .then((r) => { if (!r.ok) throw 0; return r.blob(); })
  .then((b) => { warpUrl = URL.createObjectURL(b); }));
// network watchdog — never hold the player hostage
setTimeout(() => { startBtn.disabled = false; startBtn.textContent = START_LABEL; }, 25000);

// compass POIs
hud.addPoi('▲', world.sphinx.pos, '#ffd060', '狮身人面像');
for (const m of world.meteors) hud.addPoi('◆', m.pos, '#ff7a2a', '修复陨石');
const dynPois = new Map(); // ufo/mystery → poi rec

// ---------------------------------------------------------------- state
const S = {
  mode: 'title',          // title | play | warp | city
  firstPerson: false,
  camYaw: Math.PI * 0.25, camPitch: 0.12,
  fov: 70,
  timeScale: 1,
  score: 0, kills: 0, weakKills: 0, ufoKills: 0,
  shots: 0, hits: 0,
  startedAt: 0, survivedSec: 0,
  fireCd: 0, mouseDown: false,
  paused: false,
  mysteryCd: 30,
  portalCountdown: -1,
  warpT: 0,
  hintStage: 0,
};
S.cursor = hud.cursor;           // virtual cursor — the gun chases this, not screen center
const input = { fwd: false, back: false, left: false, right: false };

// ---------------------------------------------------------------- input
addEventListener('keydown', (e) => {
  if (e.repeat) return;
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': input.fwd = true; break;
    case 'KeyS': case 'ArrowDown': input.back = true; break;
    case 'KeyA': case 'ArrowLeft': input.left = true; break;
    case 'KeyD': case 'ArrowRight': input.right = true; break;
    case 'ShiftLeft': case 'ShiftRight': truck.boost = true; break;
    case 'KeyV': case 'KeyC':
      S.firstPerson = !S.firstPerson;
      audio.chime();
      break;
  }
});
addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': input.fwd = false; break;
    case 'KeyS': case 'ArrowDown': input.back = false; break;
    case 'KeyA': case 'ArrowLeft': input.left = false; break;
    case 'KeyD': case 'ArrowRight': input.right = false; break;
    case 'ShiftLeft': case 'ShiftRight': truck.boost = false; break;
  }
});
addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === renderer.domElement) {
    S.cursor.x = clamp(S.cursor.x + e.movementX, 8, innerWidth - 8);
    S.cursor.y = clamp(S.cursor.y + e.movementY, 8, innerHeight - 8);
  } else if (S.mode === 'play' || S.mode === 'city') {
    // no pointer lock (denied/unsupported) — follow the real cursor
    S.cursor.x = e.clientX; S.cursor.y = e.clientY;
  }
});

// pushing the cursor toward the screen edge swings the camera (dead zone in the middle)
function cursorSteer(rawDt) {
  const nx = (S.cursor.x / innerWidth) * 2 - 1;
  const ny = (S.cursor.y / innerHeight) * 2 - 1;
  const dzx = 0.26, dzy = 0.36;
  if (Math.abs(nx) > dzx) {
    const t = (Math.abs(nx) - dzx) / (1 - dzx);
    S.camYaw -= Math.sign(nx) * t * t * 3.4 * rawDt;
  }
  if (Math.abs(ny) > dzy) {
    const t = (Math.abs(ny) - dzy) / (1 - dzy);
    S.camPitch = clamp(S.camPitch - Math.sign(ny) * t * t * 1.7 * rawDt, -0.5, 0.62);
  }
}
addEventListener('mousedown', (e) => { if (e.button === 0) S.mouseDown = true; });
addEventListener('mouseup', (e) => { if (e.button === 0) S.mouseDown = false; });

$('startBtn').addEventListener('click', () => {
  audio.init();
  $('title').style.display = 'none';
  hud.show();
  S.mode = 'play';
  S.startedAt = performance.now();
  S.cursor.x = innerWidth / 2; S.cursor.y = innerHeight * 0.42;
  document.body.style.cursor = 'none';
  try { renderer.domElement.requestPointerLock(); } catch (e) {}
  hud.toast('侏罗纪 · 白昼', 'CRETACEOUS BADLANDS', '机枪弹药无限 · 头部要害一击必杀');
  setTimeout(() => hud.hint('罗盘上的 <b>▲</b> 是狮身人面像 —— 想回家就把它打醒'), 9000);
});
$('againBtn').addEventListener('click', () => location.reload());

document.addEventListener('pointerlockchange', () => {
  if (S.ended) return; // end screen owns the mouse now
  const locked = document.pointerLockElement === renderer.domElement;
  if (!locked && (S.mode === 'play' || S.mode === 'city')) {
    S.paused = true;
    $('pause').classList.add('on');
    document.body.style.cursor = '';
  } else {
    S.paused = false;
    $('pause').classList.remove('on');
    document.body.style.cursor = 'none';
  }
});
$('pause').addEventListener('click', () => { try { renderer.domElement.requestPointerLock(); } catch (e) {} });

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------------------------------------------------------------- gunnery
const ray = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _dir = new THREE.Vector3();
const _muzzle = new THREE.Vector3();
const _mdir = new THREE.Vector3();

function cursorRay() {
  _ndc.set((S.cursor.x / innerWidth) * 2 - 1, -(S.cursor.y / innerHeight) * 2 + 1);
  ray.setFromCamera(_ndc, camera);
  ray.far = 500;
  return ray;
}

// where is the cursor pointing in the world? (entity hit > ground > 250m out)
function computeAim(targets) {
  cursorRay();
  const hits = targets.length ? ray.intersectObjects(targets, true) : [];
  const ground = groundHit(ray.ray.origin, ray.ray.direction);
  if (hits.length && (!ground || hits[0].distance < ground.dist)) return { point: hits[0].point, hot: true };
  if (ground) return { point: ground.point, hot: false };
  return { point: ray.ray.origin.clone().addScaledVector(ray.ray.direction, 250), hot: false };
}

function groundHit(origin, dir, maxD = 400) {
  // cheap analytic ray-march against the height field
  const hf = S.mode === 'city' ? () => 0 : getHeight;
  const p = origin.clone();
  for (let d = 2; d < maxD; d += 2) {
    p.copy(origin).addScaledVector(dir, d);
    if (p.y <= hf(p.x, p.z)) return { dist: d, point: p.clone().setY(hf(p.x, p.z)) };
  }
  return null;
}

function resolveEntity(obj) {
  let o = obj;
  while (o) {
    if (o.userData && o.userData.entity) return o;
    o = o.parent;
  }
  return null;
}

function shoot() {
  S.shots++;
  audio.gunshot();
  truck.flashMuzzle();
  effects.addShake(0.05);
  S.cursor.y = Math.max(8, S.cursor.y - 2.5); // recoil nudges the cursor up

  cursorRay();
  _dir.copy(ray.ray.direction);
  const sp = 0.004 + Math.abs(truck.speed) * 0.0004;
  _dir.x += rand(-sp, sp); _dir.y += rand(-sp, sp); _dir.z += rand(-sp, sp);
  _dir.normalize();
  ray.set(camera.position, _dir);

  const targets = S.mode === 'city' ? [] :
    [...dinoMgr.hittables(), ...ufoMgr.hittables(), ...world.hittables];
  const hits = ray.intersectObjects(targets, true);
  const ground = groundHit(camera.position, _dir);

  let hitPoint = null;
  if (hits.length && (!ground || hits[0].distance < ground.dist)) {
    const h = hits[0];
    hitPoint = h.point;
    const entObj = resolveEntity(h.object);
    const kind = entObj?.userData.entity;
    const weak = !!h.object.userData.weak;
    S.hits++;
    hud.hitmarker(weak);
    if (kind === 'dino' || kind === 'ptero' || kind === 'alien') {
      const ref = h.object.userData.ref;
      audio.hitFlesh(weak);
      if (!weak) hud.popup(String(12), h.point, '');
      ref.takeDamage(12, weak, h.point);
    } else if (kind === 'ufo') {
      audio.metalHit();
      h.object.userData.ref.takeDamage(12, weak, h.point);
    } else if (kind === 'sphinx') {
      onSphinxHit(h.point);
    } else if (kind === 'mystery') {
      onMysteryHit(entObj, h.point);
    }
  } else if (ground) {
    hitPoint = ground.point;
    effects.dust(ground.point, 3, 0xa89878, 1);
  } else {
    hitPoint = camera.position.clone().addScaledVector(_dir, 400);
  }
  truck.getMuzzle(_muzzle, _mdir);
  effects.tracer(_muzzle, hitPoint);
}

function onKill(ent, weak) {
  let name = '目标', pts = 100, boss = false;
  if (ent instanceof Dino) { name = ent.spec.cn; pts = ent.spec.score; boss = ent.spec.boss; }
  else if (ent instanceof Ptero) { name = '翼龙'; pts = 120; }
  else { name = '外星人'; pts = 150; }
  if (weak) pts *= 2;
  S.score += pts; S.kills++;
  if (weak) S.weakKills++;
  hud.feed(`<em>${name}</em> 已击杀${weak ? ' · 要害一击 ×2' : ''} &nbsp;+${pts}`, weak);
  hud.popup(`+${pts}`, ent.pos.clone().add(new THREE.Vector3(0, 3, 0)), 'score');
  if (weak) {
    hud.popup('要害命中！', ent.pos.clone().add(new THREE.Vector3(0, 5, 0)), 'weak');
    S.timeScale = 0.22; // brief slow-mo savor
  }
  if (boss) {
    effects.addShake(0.6);
    hud.toast(name + ' 倒下了', weak ? 'ONE SHOT. ONE KILL.' : 'TARGET ELIMINATED', `+${pts} 分`);
  }
  audio.chime(true);
}

function onUfoDown() {
  S.score += 500; S.ufoKills++;
  hud.feed('<em>UFO</em> 已击落 &nbsp;+500', true);
  hud.toast('飞碟坠毁', 'UFO DOWN', '残骸附近可能不安全……');
}

function onSphinxHit(point) {
  const s = world.sphinx;
  effects.spark(point, 8, 0xd8c090);
  effects.debris(point, 5, 0xb89a6a);
  audio.metalHit();
  if (s.charged) return;
  s.hits++;
  hud.popup(`${s.hits} / ${s.need}`, point, 'score');
  if (s.hits === 1) {
    hud.toast('狮身人面像', 'THE SPHINX AWAKENS', '继续射击，唤醒时空之门');
  }
  if (s.hits >= s.need) {
    s.charged = true;
    S.portalCountdown = 3.2;
    audio.whoosh(3.2);
    hud.toast('时空之门已激活', 'TEMPORAL GATE UNLOCKED', '坐稳了——正在回到现代…');
    effects.flash(s.pos, 0x39d8c8, 300, 1.2, 300);
    effects.addShake(0.9);
  }
}

function onMysteryHit(obj, point) {
  const rec = obj.userData.mystery;
  if (!rec || rec.dead) return;
  S.score += rec.score;
  effects.explosion(point, 0.8, rec.kind === 'crystal' ? 0x44e8ff : 0xffc070);
  audio.chime(true);
  hud.feed(`神秘物体 <em>${rec.cn}</em> &nbsp;+${rec.score}`);
  hud.popup(`${rec.cn} +${rec.score}`, point, 'score');
  const poi = dynPois.get(rec);
  if (poi) { hud.removePoi(poi); dynPois.delete(rec); }
  world.killMystery(rec);
}

// ---------------------------------------------------------------- warp & city
function startWarp() {
  S.mode = 'warp';
  S.warpT = 0;
  document.exitPointerLock();
  const wrap = $('warpWrap'), vid = $('warpVid');
  $('whiteout').style.transition = 'opacity .9s';
  $('whiteout').style.opacity = 1;
  audio.whoosh(2.6);
  setTimeout(() => {
    wrap.classList.add('on');
    vid.src = warpUrl;
    vid.muted = true;
    const fallback = setTimeout(enterCity, 9000);
    vid.onended = () => { clearTimeout(fallback); enterCity(); };
    vid.onerror = () => { clearTimeout(fallback); enterCity(); };
    vid.play().catch(() => { clearTimeout(fallback); enterCity(); });
    setTimeout(() => { $('whiteout').style.opacity = 0; }, 600);
  }, 950);
}

let cityEntered = false;
function enterCity() {
  if (cityEntered) return;
  cityEntered = true;
  city = new City();
  // move the truck + effect pools into the night city
  city.scene.add(truck.group);
  effects.attach(city.scene);
  truck.getH = () => 0;
  truck.bounds = CITY_HALF;
  truck.pos.set(0, 0.1, -40);
  truck.heading = 0;
  truck.speed = 0;
  truck.hp = truck.maxHp;
  S.camYaw = 0; S.camPitch = 0.1;
  S.mode = 'city';
  $('whiteout').style.opacity = 1;
  setTimeout(() => {
    $('warpWrap').classList.remove('on');
    $('warpVid').src = '';
    $('whiteout').style.transition = 'opacity 1.6s';
    $('whiteout').style.opacity = 0;
    try { renderer.domElement.requestPointerLock(); } catch (e) {}
    audio.playBgm('city', 0.4);
    hud.toast('现代 · 午夜', 'PRESENT DAY, PRESENT TIME', '霓虹与车流取代了蕨叶与吼声');
    S.survivedSec = (performance.now() - S.startedAt) / 1000;
    setTimeout(showEnd, 7000);
  }, 400);
}

function showEnd() {
  S.ended = true;
  S.paused = false;
  $('pause').classList.remove('on');
  $('stScore').textContent = S.score;
  $('stKills').textContent = S.kills;
  $('stWeak').textContent = S.weakKills;
  $('stAcc').textContent = S.shots ? Math.round((S.hits / S.shots) * 100) + '%' : '--';
  $('stUfo').textContent = S.ufoKills;
  const m = Math.floor(S.survivedSec / 60), sec = Math.floor(S.survivedSec % 60);
  $('stTime').textContent = `${m}:${String(sec).padStart(2, '0')}`;
  $('end').classList.add('on');
  document.body.style.cursor = '';
  document.exitPointerLock();
}

// ---------------------------------------------------------------- camera
const _camTarget = new THREE.Vector3();
const _lookDir = new THREE.Vector3();
const _camPos = new THREE.Vector3();
function updateCamera(dt) {
  _lookDir.set(
    Math.sin(S.camYaw) * Math.cos(S.camPitch),
    Math.sin(S.camPitch),
    Math.cos(S.camYaw) * Math.cos(S.camPitch)
  );
  const hf = S.mode === 'city' ? () => 0 : getHeight;
  if (S.firstPerson) {
    truck.fpAnchor.getWorldPosition(_camPos);
    camera.position.lerp(_camPos, 1 - Math.exp(-30 * dt));
    _camTarget.copy(camera.position).addScaledVector(_lookDir, 50);
    camera.lookAt(_camTarget);
    S.fov = damp(S.fov, truck.boost ? 82 : 75, 5, dt);
  } else {
    _camTarget.copy(truck.pos).add(new THREE.Vector3(0, 3.1, 0));
    _camPos.copy(_camTarget).addScaledVector(_lookDir, -10.5);
    _camPos.y = Math.max(_camPos.y, hf(_camPos.x, _camPos.z) + 0.7);
    camera.position.lerp(_camPos, 1 - Math.exp(-12 * dt));
    _camTarget.addScaledVector(_lookDir, 18);
    camera.lookAt(_camTarget);
    S.fov = damp(S.fov, truck.boost ? 77 : 70, 5, dt);
  }
  // shake
  if (effects.shakeAmt > 0.002) {
    const a = effects.shakeAmt * effects.shakeAmt * 0.5;
    camera.position.x += rand(-a, a);
    camera.position.y += rand(-a, a);
    camera.rotation.z += rand(-a, a) * 0.06;
  }
  camera.fov = S.fov;
  camera.updateProjectionMatrix();
}

// ---------------------------------------------------------------- per-frame helpers
function syncDynamicPois() {
  // UFOs
  for (const u of ufoMgr.ufos) {
    if (u.state === 'fly' && !dynPois.has(u)) dynPois.set(u, hud.addPoi('✦', u.pos, '#7affec', 'UFO'));
    if (u.state !== 'fly' && dynPois.has(u)) { hud.removePoi(dynPois.get(u)); dynPois.delete(u); }
  }
  // mystery objects
  for (const rec of world.mystery) {
    if (!dynPois.has(rec)) dynPois.set(rec, hud.addPoi('?', rec.pos, '#e0c8ff', rec.cn));
  }
  for (const [key, poi] of dynPois) {
    const gone = (key.state && key.state !== 'fly' && !ufoMgr.ufos.includes(key))
      || (key.kind && (key.dead || !world.mystery.includes(key)));
    if (gone) { hud.removePoi(poi); dynPois.delete(key); }
  }
}

function collectBars() {
  const ents = [];
  const now = ctx.time;
  for (const d of dinoMgr.dinos) {
    if (d.dead || d.hp >= d.maxHp) continue;
    ents.push({
      key2: d, label: d.spec.cn, boss: !!d.spec.boss, hp: d.hp, maxHp: d.maxHp, dead: d.dead,
      sinceDamage: now - d.damagedAt, anchor: (v) => d.barAnchor(v),
    });
  }
  for (const u of ufoMgr.ufos) {
    if (u.state !== 'fly' || u.hp >= u.maxHp) continue;
    ents.push({
      key2: u, label: '飞碟', boss: true, hp: u.hp, maxHp: u.maxHp, dead: false,
      sinceDamage: 0, anchor: (v) => v.copy(u.pos).add(new THREE.Vector3(0, 7, 0)),
    });
  }
  for (const a of ufoMgr.aliens) {
    if (a.dead || a.hp >= 30) continue;
    ents.push({
      key2: a, label: '外星人', boss: false, hp: a.hp, maxHp: 30, dead: a.dead,
      sinceDamage: 0, anchor: (v) => v.copy(a.pos).add(new THREE.Vector3(0, 3.4, 0)),
    });
  }
  return ents;
}

// ---------------------------------------------------------------- loop
const clock = new THREE.Clock();
let repairWasOn = false;

function tick() {
  requestAnimationFrame(tick);
  const rawDt = Math.min(clock.getDelta(), 0.05);
  if (S.paused) return;

  S.timeScale = damp(S.timeScale, 1, 3.2, rawDt);
  const dt = rawDt * S.timeScale;
  ctx.time += dt;

  if (S.mode === 'title') {
    // idle orbit over the valley behind the title card
    const t = ctx.time * 0.05;
    camera.position.set(Math.cos(t) * 60, 38, Math.sin(t) * 60);
    camera.lookAt(0, 8, 0);
    world.update(dt, truck.pos, 0);
    dinoMgr.update(dt);
    effects.update(dt);
    renderer.render(scene, camera);
    return;
  }

  if (S.mode === 'play' || S.mode === 'warp') {
    truck.update(dt, S.mode === 'play' ? input : { fwd: false, back: false, left: false, right: false });
    world.update(dt, truck.pos, S.camYaw);
    dinoMgr.update(dt);
    ufoMgr.update(dt);
    effects.update(dt);

    // gun chases the cursor: aim at whatever sits under the crosshair
    const aimTargets = [...dinoMgr.hittables(), ...ufoMgr.hittables(), ...world.hittables];
    const aim = computeAim(aimTargets);
    truck.aimAt(aim.point);
    hud.setCross(S.cursor.x, S.cursor.y, aim.hot);

    if (S.mode === 'play') {
      // firing (pause overlay already guards the unlocked state)
      S.fireCd -= dt;
      if (S.mouseDown && S.fireCd <= 0) {
        S.fireCd = 0.105;
        shoot();
      }

      // meteor repair
      let repairing = false;
      for (const m of world.meteors) {
        if (truck.pos.distanceTo(m.pos) < 11 && truck.hp < truck.maxHp) {
          repairing = true;
          truck.hp = Math.min(truck.maxHp, truck.hp + 13 * dt);
          if (Math.random() < dt * 9) {
            effects.spark(truck.pos.clone().add(new THREE.Vector3(rand(-1.5, 1.5), rand(0.5, 2), rand(-1.5, 1.5))), 2, 0x6affd8);
            audio.repairTick();
          }
        }
      }
      if (repairing && !repairWasOn) hud.healFlash();
      truck.repairing = repairWasOn = repairing;

      // mystery spawn cadence
      S.mysteryCd -= dt;
      if (S.mysteryCd <= 0) {
        S.mysteryCd = rand(35, 60);
        const rec = world.spawnMystery(truck.pos);
        hud.toast('神秘信号', 'ANOMALY DETECTED', '罗盘出现了一个 ? 标记');
        audio.chime();
      }

      // staged hints
      if (S.hintStage === 0 && truck.hp < 55) {
        S.hintStage = 1;
        hud.hint('车体受损 —— 开往罗盘上的 <b>◆ 陨石</b>，靠近即可修复');
      }

      // portal countdown
      if (S.portalCountdown > 0) {
        S.portalCountdown -= dt;
        if (S.portalCountdown <= 0) startWarp();
      }
    }

    syncDynamicPois();
  } else if (S.mode === 'city') {
    truck.update(dt, input);
    city.update(dt, truck.pos);
    effects.update(dt);
    const aim = computeAim([]);
    truck.aimAt(aim.point);
    hud.setCross(S.cursor.x, S.cursor.y, false);
    // celebratory shots allowed, no targets
    S.fireCd -= dt;
    if (S.mouseDown && S.fireCd <= 0) {
      S.fireCd = 0.105;
      S.shots--; // don't count city plinking against accuracy
      shoot();
    }
  }

  if (S.mode === 'play' || S.mode === 'city') cursorSteer(rawDt);
  updateCamera(rawDt);

  // HUD
  hud.setHp(truck.hp, truck.maxHp, truck.repairing);
  hud.setScore(S.score, S.kills, S.shots ? Math.round((S.hits / Math.max(S.shots, 1)) * 100) + '%' : '--');
  hud.setSpeed(truck.speed * 3.6, (S.firstPerson ? '第一人称' : '第三人称') + ' · V 切换');
  hud.update(rawDt, camera, S.camYaw, S.mode === 'play' ? collectBars() : []);
  if (S.mode !== 'title') {
    hud.drawMinimap({
      pos: truck.pos, heading: truck.heading, camYaw: S.camYaw,
      dinos: dinoMgr.dinos, ufos: ufoMgr.ufos, aliens: ufoMgr.aliens,
      meteors: world.meteors, sphinx: world.sphinx.pos, pyramids: world.pyramids,
      mystery: world.mystery, city: S.mode === 'city',
    });
  }

  renderer.render(S.mode === 'city' ? city.scene : scene, camera);
}

tick();

// debug / test handle (harmless in production)
window.__JH = { S, world, truck, dinoMgr, ufoMgr, startWarp, enterCity, ctx, shoot, camera };
