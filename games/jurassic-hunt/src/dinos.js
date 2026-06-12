// dinos.js — procedural dinosaur rigs, per-species AI, pterosaurs, population manager
import * as THREE from 'three';
import { rand, pick, clamp, lerp, damp, mat } from './util.js';
import { getHeight, desertness, WORLD, LAKE, WATER_Y } from './world.js';

// ---------------------------------------------------------------- species table
// hp scales with body size; a weak-point (head) hit is ALWAYS a one-shot kill.
export const SPECIES = {
  gallimimus: {
    cn: '似鸡龙', en: 'GALLIMIMUS', plan: 'biped', scale: 0.85, hp: 25, speed: 15,
    score: 80, behavior: 'flee', color: 0xb89a62, color2: 0x8a6f42, roar: 0.4,
  },
  raptor: {
    cn: '迅猛龙', en: 'VELOCIRAPTOR', plan: 'biped', scale: 1.15, hp: 60, speed: 13,
    score: 150, behavior: 'hunter', aggroR: 70, atkR: 4.5, dmg: 7, color: 0x5e6e4a, color2: 0x39452c, roar: 0.8,
  },
  dilophosaurus: {
    cn: '双冠龙', en: 'DILOPHOSAURUS', plan: 'biped', scale: 1.35, hp: 85, speed: 12.5,
    score: 200, behavior: 'hunter', aggroR: 62, atkR: 5, dmg: 9, color: 0x7a8a4e, color2: 0x4e5c30, roar: 1.0, crest: true,
  },
  spinosaurus: {
    cn: '棘龙', en: 'SPINOSAURUS', plan: 'biped', scale: 3.0, hp: 500, speed: 10.5,
    score: 700, behavior: 'hunter', aggroR: 95, atkR: 7.5, dmg: 16, color: 0x5e6a52, color2: 0x3c4836,
    roar: 2.6, boss: true, sail: true, longSnout: true, nearLake: true,
  },
  triceratops: {
    cn: '三角龙', en: 'TRICERATOPS', plan: 'quad', scale: 2.4, hp: 180, speed: 9.5,
    score: 260, behavior: 'defender', atkR: 6, dmg: 14, color: 0x8a7a5a, color2: 0x6a5a40, roar: 1.6,
  },
  stegosaurus: {
    cn: '剑龙', en: 'STEGOSAURUS', plan: 'quad', scale: 2.6, hp: 220, speed: 5,
    score: 300, behavior: 'defender', atkR: 7, dmg: 11, color: 0x77704c, color2: 0x4f4a30, roar: 1.8, plates: true,
  },
  trex: {
    cn: '霸王龙', en: 'T-REX', plan: 'biped', scale: 3.2, hp: 420, speed: 11.5,
    score: 600, behavior: 'hunter', aggroR: 100, atkR: 7.5, dmg: 18, color: 0x6e5a44, color2: 0x4a3c2c, roar: 3, boss: true,
  },
  brachiosaurus: {
    cn: '腕龙', en: 'BRACHIOSAURUS', plan: 'quad', scale: 4.6, hp: 650, speed: 3.2,
    score: 800, behavior: 'flee', color: 0x7a8060, color2: 0x585e44, roar: 2.4, longNeck: true, boss: true,
  },
};

// ---------------------------------------------------------------- rig builders
function tagWeak(o) { o.traverse((m) => { if (m.isMesh) m.userData.weak = true; }); }

function buildBiped(s) {
  const g = new THREE.Group();
  const skin = mat(s.color), skin2 = mat(s.color2);
  const parts = {};

  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), skin);
  body.scale.set(0.85, 0.95, 1.7);
  body.position.y = 1.9;
  g.add(body); parts.body = body;

  // neck + head (weak)
  const neck = new THREE.Group(); neck.position.set(0, 2.3, 1.3); g.add(neck);
  const neckM = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 1.1, 8), skin);
  neckM.rotation.x = -0.7; neckM.position.set(0, 0.35, 0.25);
  neck.add(neckM);
  const head = new THREE.Group(); head.position.set(0, 0.85, 0.65); neck.add(head);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 1.25), skin);
  skull.position.z = 0.3;
  const snout = new THREE.Mesh(new THREE.BoxGeometry(s.longSnout ? 0.38 : 0.45, s.longSnout ? 0.34 : 0.4, s.longSnout ? 1.4 : 0.8), skin2);
  snout.position.set(0, -0.08, s.longSnout ? 1.45 : 1.15);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, s.longSnout ? 1.3 : 0.75), skin2);
  jaw.position.set(0, -0.34, s.longSnout ? 1.3 : 1.0);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffcc20 }));
  eyeL.position.set(0.28, 0.12, 0.6);
  const eyeR = eyeL.clone(); eyeR.position.x = -0.28;
  head.add(skull, snout, jaw, eyeL, eyeR);
  if (s.crest) {
    // dilophosaurus: twin半月骨冠 + 受激时张开的颈伞
    const crestM = mat(0xb04a30);
    for (const side of [0.16, -0.16]) {
      const cr = new THREE.Mesh(new THREE.CircleGeometry(0.5, 10, 0, Math.PI), crestM);
      cr.material.side = THREE.DoubleSide;
      cr.position.set(side, 0.38, 0.55);
      cr.rotation.y = Math.PI / 2;
      head.add(cr);
    }
    const frill = new THREE.Mesh(new THREE.CircleGeometry(1.0, 12, 0, Math.PI),
      new THREE.MeshLambertMaterial({ color: 0xd87a2a, side: THREE.DoubleSide, flatShading: true }));
    frill.position.set(0, 0.1, -0.1);
    frill.rotation.y = Math.PI / 2;
    frill.scale.set(0.01, 0.01, 1);
    head.add(frill);
    parts.frill = frill;
  }
  tagWeak(head);
  parts.neck = neck; parts.head = head; parts.jaw = jaw;

  if (s.sail) {
    // spinosaurus: dorsal sail — half-disc membrane + spine rays
    const sail = new THREE.Mesh(new THREE.CircleGeometry(1, 14, 0, Math.PI),
      new THREE.MeshLambertMaterial({ color: s.color2, side: THREE.DoubleSide, flatShading: true }));
    sail.position.set(0, 2.55, -0.1);
    sail.rotation.y = Math.PI / 2;
    sail.scale.set(2.1, 1.5, 1);
    g.add(sail);
    for (let i = 0; i < 5; i++) {
      const t = (i / 4) * Math.PI * 0.8 + Math.PI * 0.1;
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.8, 5), mat(s.color));
      sp.position.set(0, 2.55 + Math.sin(t) * 1.45, -0.1 + Math.cos(t) * 2.0);
      sp.rotation.x = -Math.cos(t) * 0.8;
      g.add(sp);
    }
  }

  // tail chain
  parts.tail = [];
  let par = g, tz = -1.5, ty = 2.1, tr = 0.42;
  for (let i = 0; i < 3; i++) {
    const seg = new THREE.Group();
    seg.position.set(0, i === 0 ? ty : 0, i === 0 ? tz : -1.05);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(tr * 0.65, tr, 1.3, 7), i % 2 ? skin2 : skin);
    m.rotation.x = Math.PI / 2 + 0.08; m.position.z = -0.55;
    seg.add(m); par.add(seg); par = seg;
    parts.tail.push(seg); tr *= 0.62;
  }

  // legs (thigh + shin)
  parts.legs = [];
  for (const side of [1, -1]) {
    const hip = new THREE.Group(); hip.position.set(side * 0.55, 1.9, -0.45); g.add(hip);
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 1.1, 7), skin);
    thigh.position.y = -0.5; hip.add(thigh);
    const knee = new THREE.Group(); knee.position.y = -1.0; hip.add(knee);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 1.0, 6), skin2);
    shin.position.y = -0.45; knee.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.7), skin2);
    foot.position.set(0, -0.95, 0.15); knee.add(foot);
    parts.legs.push({ hip, knee, phase: side > 0 ? 0 : Math.PI });
  }
  // tiny arms
  for (const side of [1, -1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.6, 5), skin2);
    arm.position.set(side * 0.6, 1.75, 1.0);
    arm.rotation.x = 0.9;
    g.add(arm);
  }
  return { g, parts, hipH: 2.05 };
}

function buildQuad(s) {
  const g = new THREE.Group();
  const skin = mat(s.color), skin2 = mat(s.color2);
  const parts = {};

  const body = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 8), skin);
  body.scale.set(1, 1, 1.9);
  body.position.y = 2.0;
  g.add(body); parts.body = body;

  // neck + head
  const neck = new THREE.Group();
  neck.position.set(0, s.longNeck ? 2.6 : 2.2, 2.0);
  g.add(neck);
  if (s.longNeck) {
    // one smooth tapered column, vertices sheared into a forward arc — no visible joints
    const L = 6.2;
    const nGeo = new THREE.CylinderGeometry(0.3, 0.78, L, 10, 16);
    nGeo.translate(0, L / 2, 0);
    const npos = nGeo.attributes.position;
    for (let i = 0; i < npos.count; i++) {
      const t = npos.getY(i) / L;
      npos.setZ(i, npos.getZ(i) + t * t * 2.2);
    }
    nGeo.computeVertexNormals();
    const neckMesh = new THREE.Mesh(nGeo, skin);
    neck.add(neckMesh);
  }
  const head = new THREE.Group();
  if (s.longNeck) { head.position.set(0, 6.35, 2.5); neck.add(head); }
  else { head.position.set(0, 0.35, 0.95); neck.add(head); }
  const skull = new THREE.Mesh(new THREE.BoxGeometry(s.longNeck ? 0.55 : 0.95, s.longNeck ? 0.55 : 0.85, 1.15), skin);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(s.longNeck ? 0.4 : 0.6, 0.45, 0.8), skin2);
  snout.position.set(0, -0.12, 0.85);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffcc20 }));
  eyeL.position.set(0.32, 0.18, 0.42);
  const eyeR = eyeL.clone(); eyeR.position.x = -0.32;
  head.add(skull, snout, eyeL, eyeR);

  if (s === SPECIES.triceratops) {
    const frill = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.9, 0.22, 8, 1, false, 0, Math.PI), skin2);
    frill.rotation.set(Math.PI / 2, 0, 0); frill.position.set(0, 0.45, -0.35);
    head.add(frill);
    const hornGeo = new THREE.ConeGeometry(0.12, 1.1, 6);
    for (const side of [0.4, -0.4]) {
      const horn = new THREE.Mesh(hornGeo, mat(0xe8dcc0));
      horn.position.set(side, 0.5, 0.55); horn.rotation.x = 1.1;
      head.add(horn);
    }
    const noseHorn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.55, 6), mat(0xe8dcc0));
    noseHorn.position.set(0, 0.22, 1.05); noseHorn.rotation.x = 1.2;
    head.add(noseHorn);
  }
  tagWeak(head);
  parts.neck = neck; parts.head = head;

  // stego plates
  if (s.plates) {
    const plateGeo = new THREE.CylinderGeometry(0.55, 0.18, 0.1, 5);
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const p = new THREE.Mesh(plateGeo, mat(0xb05a30));
      p.rotation.z = Math.PI / 2; p.rotation.y = Math.PI / 2;
      p.position.set((i % 2 ? 0.18 : -0.18), 3.0 - Math.abs(t - 0.45) * 1.4, 1.6 - t * 3.6);
      p.scale.setScalar(1 - Math.abs(t - 0.45) * 0.8);
      g.add(p);
    }
  }

  // tail
  parts.tail = [];
  let par = g, tr = 0.55;
  for (let i = 0; i < 3; i++) {
    const seg = new THREE.Group();
    seg.position.set(0, i === 0 ? 2.0 : 0, i === 0 ? -2.0 : -1.3);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(tr * 0.6, tr, 1.6, 7), i % 2 ? skin2 : skin);
    m.rotation.x = Math.PI / 2 + 0.06; m.position.z = -0.7;
    seg.add(m); par.add(seg); par = seg;
    parts.tail.push(seg); tr *= 0.6;
  }
  if (s.plates) { // thagomizer spikes
    for (const side of [0.2, -0.2]) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.9, 5), mat(0xe8dcc0));
      spike.position.set(side, 0.15, -1.1); spike.rotation.x = -0.9;
      parts.tail[2].add(spike);
    }
  }

  // 4 legs
  parts.legs = [];
  for (const [sx, sz, ph] of [[0.8, 1.3, 0], [-0.8, 1.3, Math.PI], [0.8, -1.3, Math.PI], [-0.8, -1.3, 0]]) {
    const hip = new THREE.Group(); hip.position.set(sx, 1.6, sz); g.add(hip);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 1.7, 7), skin2);
    leg.position.y = -0.8; hip.add(leg);
    parts.legs.push({ hip, phase: ph });
  }
  return { g, parts, hipH: 1.65 };
}

// ---------------------------------------------------------------- dinosaur entity
let DID = 0;
export class Dino {
  constructor(key, pos, ctx) {
    this.id = ++DID;
    this.key = key;
    this.spec = SPECIES[key];
    this.ctx = ctx;
    const built = this.spec.plan === 'biped' ? buildBiped(this.spec) : buildQuad(this.spec);
    this.group = built.g;
    this.parts = built.parts;
    this.group.scale.setScalar(this.spec.scale);
    this.group.position.copy(pos);
    this.group.position.y = getHeight(pos.x, pos.z);
    this.heading = rand(Math.PI * 2);
    this.hp = this.maxHp = this.spec.hp;
    this.state = 'wander';
    this.stateT = rand(2, 5);
    this.atkCd = 0;
    this.dead = false;
    this.deathT = 0;
    this.gait = rand(100);
    this.curSpeed = 0;
    this.damagedAt = -10;
    this.group.traverse((o) => {
      if (o.isMesh) { o.userData.entity = 'dino'; o.userData.ref = this; o.castShadow = this.spec.scale > 1.5; }
    });
    ctx.scene.add(this.group);
  }

  get pos() { return this.group.position; }

  takeDamage(amount, weak, hitPos) {
    if (this.dead) return;
    this.damagedAt = this.ctx.time;
    this.ctx.effects.blood(hitPos, weak ? 22 : 9);
    if (weak) { this.die(true); return; }
    this.hp -= amount;
    // provoke
    if (this.spec.behavior === 'flee') this.state = 'flee';
    else { if (this.state !== 'attack') this.state = 'aggro'; }
    if (this.hp <= 0) this.die(false);
    else if (Math.random() < 0.25) this.ctx.audio.roar(this.spec.roar * 0.7);
  }

  die(weak) {
    if (this.dead) return;
    this.dead = true;
    this.deathT = 0;
    this.hp = 0;
    this.ctx.audio.roar(this.spec.roar);
    this.ctx.effects.dust(this.pos.clone().add(new THREE.Vector3(0, 1, 0)), 14, 0x8a7a5e, 3);
    this.ctx.onKill(this, weak);
  }

  update(dt) {
    const { truck, effects, audio } = this.ctx;
    const tp = truck.pos;

    if (this.dead) {
      this.deathT += dt;
      // topple sideways with a small bounce, then sink
      const k = Math.min(1, this.deathT / 0.7);
      this.group.rotation.z = (Math.PI / 2) * (k - Math.sin(k * Math.PI) * 0.12) * (this.id % 2 ? 1 : -1);
      if (this.deathT > 4.5) this.group.position.y -= dt * 1.2 * this.spec.scale;
      return this.deathT > 7; // true = remove
    }

    const dist = this.pos.distanceTo(tp);
    this.stateT -= dt;
    this.atkCd -= dt;

    // ---- state machine ----
    const b = this.spec.behavior;
    if (b === 'hunter' && this.state === 'wander' && dist < this.spec.aggroR) {
      this.state = 'aggro';
      audio.roar(this.spec.roar);
      effects.addShake(this.spec.boss ? 0.4 : 0.12);
    }
    if (this.state === 'flee' && this.stateT < -8) { this.state = 'wander'; this.stateT = rand(2, 5); }

    let targetSpeed = 0, targetHeading = this.heading;
    if (this.state === 'wander') {
      if (this.stateT <= 0) {
        this.stateT = rand(2.5, 6);
        this.wanderTurn = rand(-1, 1);
        this.grazing = Math.random() < 0.4;
      }
      targetSpeed = this.grazing ? 0 : this.spec.speed * 0.3;
      targetHeading = this.heading + (this.wanderTurn || 0) * dt;
    } else if (this.state === 'flee') {
      targetHeading = Math.atan2(this.pos.x - tp.x, this.pos.z - tp.z);
      targetSpeed = this.spec.speed;
    } else if (this.state === 'aggro') {
      targetHeading = Math.atan2(tp.x - this.pos.x, tp.z - this.pos.z);
      targetSpeed = this.spec.speed;
      if (dist < this.spec.atkR * this.spec.scale && this.atkCd <= 0) {
        this.state = 'attack'; this.attackT = 0;
      }
      if (dist > (this.spec.aggroR || 60) * 2.2) { this.state = 'wander'; }
    } else if (this.state === 'attack') {
      this.attackT += dt;
      targetSpeed = 0;
      targetHeading = Math.atan2(tp.x - this.pos.x, tp.z - this.pos.z);
      // lunge anim: head dips at t=0.25
      const lungeK = Math.sin(clamp(this.attackT / 0.5, 0, 1) * Math.PI);
      this.parts.neck.rotation.x = lungeK * 0.7;
      if (this.attackT > 0.22 && !this.hitDone) {
        this.hitDone = true;
        if (this.pos.distanceTo(tp) < this.spec.atkR * this.spec.scale + 2.5) {
          truck.takeDamage(this.spec.dmg);
          effects.spark(tp.clone().add(new THREE.Vector3(0, 1.5, 0)), 8, 0xffaa50);
        }
      }
      if (this.attackT > 0.8) {
        this.state = 'aggro'; this.atkCd = rand(1.4, 2.2); this.hitDone = false;
        this.parts.neck.rotation.x = 0;
      }
    }

    // turn + move
    let dh = targetHeading - this.heading;
    while (dh > Math.PI) dh -= Math.PI * 2;
    while (dh < -Math.PI) dh += Math.PI * 2;
    this.heading += clamp(dh, -dt * 2.2, dt * 2.2);
    this.curSpeed = damp(this.curSpeed, targetSpeed, 3, dt);
    const fwd = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
    this.pos.addScaledVector(fwd, this.curSpeed * dt);
    this.pos.x = clamp(this.pos.x, -WORLD * 0.92, WORLD * 0.92);
    this.pos.z = clamp(this.pos.z, -WORLD * 0.92, WORLD * 0.92);
    this.pos.y = damp(this.pos.y, getHeight(this.pos.x, this.pos.z), 10, dt);
    this.group.rotation.y = this.heading;

    // ---- gait animation ----
    this.gait += dt * (1.5 + (this.curSpeed / this.spec.scale) * 1.9);
    const swing = clamp(this.curSpeed / this.spec.speed, 0.12, 1) * 0.65;
    for (const leg of this.parts.legs) {
      leg.hip.rotation.x = Math.sin(this.gait + leg.phase) * swing;
      if (leg.knee) leg.knee.rotation.x = Math.max(0, Math.sin(this.gait + leg.phase + 1.2)) * swing * 0.9;
    }
    let amp = 0.12;
    for (const seg of this.parts.tail) {
      seg.rotation.y = Math.sin(this.gait * 0.6 + seg.position.z) * amp;
      amp += 0.1;
    }
    // body bob + neck look
    this.parts.body.position.y += Math.sin(this.gait * 2) * 0.012;
    if (this.state === 'aggro' || this.state === 'attack') {
      // head tracks the truck
      const local = this.group.worldToLocal(tp.clone());
      this.parts.neck.rotation.y = clamp(Math.atan2(local.x, local.z) * 0.4, -0.5, 0.5);
    } else {
      this.parts.neck.rotation.y *= 0.95;
      if (this.grazing && this.spec.plan === 'quad' && !this.spec.longNeck) {
        this.parts.neck.rotation.x = damp(this.parts.neck.rotation.x, 0.5, 2, dt);
      } else if (this.state !== 'attack') {
        this.parts.neck.rotation.x = damp(this.parts.neck.rotation.x, 0, 2, dt);
      }
    }
    // dilophosaurus frill flares while hunting
    if (this.parts.frill) {
      const want = (this.state === 'aggro' || this.state === 'attack') ? 1 : 0.01;
      const k = damp(this.parts.frill.scale.x, want, 7, dt);
      this.parts.frill.scale.set(k, k, 1);
    }
    // big footsteps shake when boss is near
    if (this.spec.boss && this.curSpeed > 2 && dist < 60) {
      const step = Math.sin(this.gait);
      if (step > 0.97 && !this._stepped) {
        this._stepped = true;
        effects.addShake(0.14 * (1 - dist / 60));
        effects.dust(this.pos.clone(), 3, 0x8a7a5e, 2);
      } else if (step < 0.5) this._stepped = false;
    }
    return false;
  }

  // anchor for the HTML health bar
  barAnchor(v) {
    v.copy(this.pos);
    v.y += (this.spec.longNeck ? 7.5 : this.spec.plan === 'biped' ? 3.6 : 3.4) * this.spec.scale;
    return v;
  }
}

// ---------------------------------------------------------------- pterosaurs
export class Ptero {
  constructor(ctx) {
    this.ctx = ctx;
    const g = this.group = new THREE.Group();
    const skin = mat(0x9a6a52), skin2 = mat(0x6e4a38);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), skin);
    body.scale.set(0.7, 0.6, 1.6);
    const head = new THREE.Group(); head.position.set(0, 0.15, 0.95);
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.5), skin);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.9, 5), skin2);
    beak.rotation.x = Math.PI / 2; beak.position.z = 0.65;
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.7, 4), skin2);
    crest.rotation.x = -Math.PI / 2 - 0.5; crest.position.set(0, 0.18, -0.2);
    head.add(skull, beak, crest);
    tagWeak(head);
    this.wings = [];
    for (const side of [1, -1]) {
      const wing = new THREE.Group(); wing.position.set(side * 0.3, 0.1, 0);
      const memb = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.1), new THREE.MeshLambertMaterial({
        color: 0x8a5a44, side: THREE.DoubleSide,
      }));
      memb.position.x = side * 1.3;
      memb.rotation.x = -0.1;
      wing.add(memb);
      g.add(wing);
      this.wings.push({ wing, side });
    }
    g.add(body, head);
    g.scale.setScalar(rand(1.6, 2.6));
    g.traverse((o) => { if (o.isMesh) { o.userData.entity = 'ptero'; o.userData.ref = this; } });
    this.center = new THREE.Vector3(rand(-600, 600), 0, rand(-600, 600));
    this.radius = rand(60, 200);
    this.angle = rand(Math.PI * 2);
    this.angV = rand(0.06, 0.16) * (Math.random() < 0.5 ? 1 : -1);
    this.alt = rand(40, 110);
    this.flap = rand(10);
    this.hp = 30;
    this.dead = false;
    this.deathT = 0;
    this.vy = 0;
    ctx.scene.add(g);
    this._place(0);
  }
  get pos() { return this.group.position; }
  _place(dt) {
    this.angle += this.angV * dt;
    const x = this.center.x + Math.cos(this.angle) * this.radius;
    const z = this.center.z + Math.sin(this.angle) * this.radius;
    const y = this.alt + Math.sin(this.angle * 3) * 8 + getHeight(x, z) * 0.3;
    this.group.position.set(x, Math.max(y, getHeight(x, z) + 20), z);
    // yaw from circular velocity (model faces +Z): v = (-sinA, cosA) * angV * r
    const yaw = Math.atan2(-Math.sin(this.angle) * this.angV, Math.cos(this.angle) * this.angV);
    this.group.rotation.set(0, yaw, this.angV > 0 ? -0.25 : 0.25);
  }
  takeDamage(amount, weak, hitPos) {
    if (this.dead) return;
    this.ctx.effects.blood(hitPos, 8);
    this.hp -= weak ? 999 : amount;
    if (this.hp <= 0) {
      this.dead = true;
      this.ctx.audio.roar(0.5);
      this.ctx.onKill(this, weak);
    }
  }
  update(dt) {
    if (this.dead) {
      this.deathT += dt;
      this.vy -= 22 * dt;
      this.group.position.y += this.vy * dt;
      this.group.rotation.z += dt * 5;
      this.group.rotation.x += dt * 2;
      const gh = getHeight(this.pos.x, this.pos.z);
      if (this.pos.y <= gh + 0.5) {
        this.group.position.y = gh + 0.5;
        if (!this._landed) {
          this._landed = true;
          this.ctx.effects.dust(this.pos.clone(), 10, 0x8a7a5e, 2);
        }
      }
      return this.deathT > 6;
    }
    this._place(dt);
    this.flap += dt * 5;
    const f = Math.sin(this.flap) * 0.55;
    for (const w of this.wings) w.wing.rotation.z = f * w.side;
    return false;
  }
}

// ---------------------------------------------------------------- plesiosaur (lake ambient)
export class Plesio {
  constructor(ctx) {
    this.ctx = ctx;
    this.spec = { cn: '蛇颈龙', en: 'PLESIOSAUR', score: 400, boss: true, roar: 1.4 };
    const g = this.group = new THREE.Group();
    const skin = mat(0x46666e), skin2 = mat(0x2e464c);
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 10), skin);
    body.scale.set(1.25, 0.75, 2.1);
    body.position.y = 0.2;
    g.add(body);
    // S-curved neck of chained segments, head on top (weak)
    this.neckSegs = [];
    let par = g;
    const segSpecs = [
      { len: 1.6, r: 0.46, rx: -0.85 },
      { len: 1.5, r: 0.36, rx: 0.32 },
      { len: 1.4, r: 0.28, rx: 0.38 },
    ];
    let pz = 2.6, py = 0.5;
    for (const ss of segSpecs) {
      const seg = new THREE.Group();
      if (par === g) seg.position.set(0, py, pz);
      else seg.position.set(0, segSpecs[0].len * 0.92, 0);
      seg.rotation.x = ss.rx;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(ss.r * 0.8, ss.r, ss.len, 8), skin);
      m.position.y = ss.len / 2;
      seg.add(m);
      par.add(seg);
      par = seg;
      this.neckSegs.push(seg);
    }
    const head = new THREE.Group();
    head.position.set(0, segSpecs[2].len, 0);
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 1.0), skin);
    skull.position.z = 0.2;
    const beak = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.3, 0.6), skin2);
    beak.position.set(0, -0.05, 0.85);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffcc20 }));
    eyeL.position.set(0.22, 0.12, 0.35);
    const eyeR = eyeL.clone(); eyeR.position.x = -0.22;
    head.add(skull, beak, eyeL, eyeR);
    tagWeak(head);
    par.add(head);
    this.head = head;
    // four flippers
    this.flippers = [];
    for (const [sx, sz, ph] of [[1.5, 1.2, 0], [-1.5, 1.2, Math.PI], [1.4, -1.4, Math.PI], [-1.4, -1.4, 0]]) {
      const f = new THREE.Mesh(new THREE.CircleGeometry(1.05, 8), new THREE.MeshLambertMaterial({
        color: 0x3a565e, side: THREE.DoubleSide, flatShading: true,
      }));
      f.scale.set(1.5, 0.5, 1);
      f.position.set(sx, 0, sz);
      f.rotation.z = sx > 0 ? -0.3 : 0.3;
      g.add(f);
      this.flippers.push({ f, ph, sx });
    }
    // short tail
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.6, 8), skin);
    tail.rotation.x = Math.PI / 2 + 0.25;
    tail.position.set(0, 0.2, -3.6);
    g.add(tail);

    g.scale.setScalar(2.2);
    g.traverse((o) => { if (o.isMesh) { o.userData.entity = 'dino'; o.userData.ref = this; } });

    this.hp = this.maxHp = 220;
    this.dead = false;
    this.removed = false;
    this.deathT = 0;
    this.damagedAt = -10;
    this.submerged = false;
    this.depth = 0;             // 0 = surfaced, 1 = fully under
    this.state = 'cruise';
    this.stateT = rand(7, 12);
    this.heading = rand(Math.PI * 2);
    this.target = this._pickTarget();
    this.gait = rand(10);
    this.group.position.set(LAKE.x + rand(-40, 40), WATER_Y, LAKE.y + rand(-40, 40));
    ctx.scene.add(g);
  }

  get pos() { return this.group.position; }

  _pickTarget() {
    const a = rand(Math.PI * 2), d = rand(20, 95);
    return new THREE.Vector3(LAKE.x + Math.cos(a) * d, WATER_Y, LAKE.y + Math.sin(a) * d);
  }

  _splash(n = 14) {
    const p = this.pos.clone().setY(WATER_Y + 0.4);
    this.ctx.effects.dust(p, n, 0xbfe4ec, 3.5);
    this.ctx.effects.shockwave(p, 10, 0x7fd8e8);
  }

  takeDamage(amount, weak, hitPos) {
    if (this.dead) return;
    this.damagedAt = this.ctx.time;
    this.ctx.effects.blood(hitPos, weak ? 20 : 8);
    if (weak) { this.die(true); return; }
    this.hp -= amount;
    if (this.hp <= 0) { this.die(false); return; }
    // wounded — crash-dive away from shore
    if (this.state !== 'dive' && Math.random() < 0.3) { this.state = 'dive'; this.stateT = rand(5, 8); this._splash(20); this.ctx.audio.roar(1.2); }
  }

  die(weak) {
    if (this.dead) return;
    this.dead = true;
    this.hp = 0;
    this.deathT = 0;
    this._splash(26);
    this.ctx.audio.roar(this.spec.roar);
    this.ctx.onKill(this, weak);
  }

  update(dt) {
    if (this.removed) return false;
    if (this.dead) {
      this.deathT += dt;
      this.group.rotation.z = damp(this.group.rotation.z, Math.PI * 0.9, 1.2, dt);  // belly-up roll
      this.group.position.y = damp(this.group.position.y, WATER_Y - 9, 0.35, dt);   // slow sink
      if (Math.random() < dt * 4) this._splash(3);
      if (this.deathT > 7) { this.removed = true; this.ctx.scene.remove(this.group); }
      return false;
    }
    this.stateT -= dt;
    if (this.stateT <= 0) {
      if (this.state === 'cruise') { this.state = 'dive'; this.stateT = rand(6, 10); this._splash(18); }
      else { this.state = 'cruise'; this.stateT = rand(8, 14); this.target = this._pickTarget(); this._splash(18); this.ctx.audio.roar(0.8); }
    }
    const wantDepth = this.state === 'dive' ? 1 : 0;
    this.depth = damp(this.depth, wantDepth, 1.8, dt);
    this.submerged = this.depth > 0.6;
    if (!this._announced && !this.submerged && this.pos.distanceTo(this.ctx.truck.pos) < 240) {
      this._announced = true;
      this.ctx.hud.toast('蛇颈龙', 'PLESIOSAUR', '湖面之下有巨影游弋');
    }

    // swim toward target, stay inside the lake disc
    const tgt = this.target;
    const want = Math.atan2(tgt.x - this.pos.x, tgt.z - this.pos.z);
    let dh = want - this.heading;
    while (dh > Math.PI) dh -= Math.PI * 2;
    while (dh < -Math.PI) dh += Math.PI * 2;
    this.heading += clamp(dh, -dt, dt);
    const speed = this.state === 'dive' ? 7 : 3.4;
    this.pos.x += Math.sin(this.heading) * speed * dt;
    this.pos.z += Math.cos(this.heading) * speed * dt;
    if (this.pos.distanceTo(tgt) < 8) this.target = this._pickTarget();
    this.group.rotation.y = this.heading;
    this.pos.y = WATER_Y - 0.6 - this.depth * 7 + Math.sin(this.gait * 0.7) * 0.18;

    // neck sways, flippers row
    this.gait += dt * 2.2;
    this.neckSegs[1].rotation.z = Math.sin(this.gait * 0.5) * 0.12;
    this.neckSegs[2].rotation.x = 0.38 + Math.sin(this.gait * 0.4) * 0.14;
    this.head.rotation.y = Math.sin(this.gait * 0.3) * 0.4;
    for (const fl of this.flippers) {
      fl.f.rotation.z = (fl.sx > 0 ? -0.3 : 0.3) + Math.sin(this.gait * 1.6 + fl.ph) * 0.45 * (fl.sx > 0 ? 1 : -1);
    }
    // bow wave while surfaced and moving
    if (!this.submerged && Math.random() < dt * 6) {
      this.ctx.effects.dust(this.pos.clone().setY(WATER_Y + 0.3), 1, 0xa8d4dc, 2);
    }
    return false;
  }

  barAnchor(v) {
    v.copy(this.pos);
    v.y = WATER_Y + 8;
    return v;
  }
}

// ---------------------------------------------------------------- manager
export class DinoManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.dinos = [];
    this.pteros = [];
    this.targets = { gallimimus: 3, raptor: 3, dilophosaurus: 2, triceratops: 2, stegosaurus: 1, trex: 1, spinosaurus: 1, brachiosaurus: 1 };
    this.seen = new Set();
    this.spawnCd = 0;
    for (let i = 0; i < 8; i++) this.pteros.push(new Ptero(ctx));
    this.plesio = new Plesio(ctx);
    this.plesioCd = 0;
    // initial herd around the spawn, slightly further out
    this.populate(true);
  }

  // raptors burst from cover when a nest is destroyed
  spawnAmbush(key, pos, n = 2) {
    for (let i = 0; i < n; i++) {
      const a = rand(Math.PI * 2), d = rand(14, 26);
      const p = new THREE.Vector3(
        clamp(pos.x + Math.cos(a) * d, -WORLD * 0.9, WORLD * 0.9), 0,
        clamp(pos.z + Math.sin(a) * d, -WORLD * 0.9, WORLD * 0.9));
      const dino = new Dino(key, p, this.ctx);
      dino.state = 'aggro';
      this.dinos.push(dino);
    }
  }

  populate(initial = false) {
    const counts = {};
    for (const d of this.dinos) counts[d.key] = (counts[d.key] || 0) + 1;
    for (const key of Object.keys(this.targets)) {
      while ((counts[key] || 0) < this.targets[key]) {
        counts[key] = (counts[key] || 0) + 1;
        const tp = this.ctx.truck.pos;
        const a = rand(Math.PI * 2);
        const d = initial ? rand(60, 200) : rand(130, 240);
        let x, z;
        if (SPECIES[key].nearLake) {
          // spinosaurus territory hugs the lake shore
          x = clamp(LAKE.x + Math.cos(a) * rand(70, 140), -WORLD * 0.9, WORLD * 0.9);
          z = clamp(LAKE.y + Math.sin(a) * rand(70, 140), -WORLD * 0.9, WORLD * 0.9);
        } else {
          x = clamp(tp.x + Math.cos(a) * d, -WORLD * 0.9, WORLD * 0.9);
          z = clamp(tp.z + Math.sin(a) * d, -WORLD * 0.9, WORLD * 0.9);
        }
        // herbivores avoid deep desert
        if (desertness(x, z) > 0.6 && Math.random() < 0.7) continue;
        const dino = new Dino(key, new THREE.Vector3(x, 0, z), this.ctx);
        this.dinos.push(dino);
        if (!this.seen.has(key)) {
          this.seen.add(key);
          if (!initial) this.ctx.hud.toast(SPECIES[key].cn, SPECIES[key].en, '新物种出现在区域内');
        }
      }
    }
  }

  hittables() {
    const arr = [];
    for (const d of this.dinos) if (!d.dead) arr.push(d.group);
    for (const p of this.pteros) if (!p.dead) arr.push(p.group);
    if (this.plesio && !this.plesio.dead && !this.plesio.submerged) arr.push(this.plesio.group);
    return arr;
  }

  update(dt) {
    const tp = this.ctx.truck.pos;
    for (let i = this.dinos.length - 1; i >= 0; i--) {
      const d = this.dinos[i];
      const remove = d.update(dt) || (!d.dead && d.pos.distanceTo(tp) > 420);
      if (remove) {
        this.ctx.scene.remove(d.group);
        this.dinos.splice(i, 1);
      }
    }
    for (let i = this.pteros.length - 1; i >= 0; i--) {
      const p = this.pteros[i];
      if (p.update(dt)) {
        this.ctx.scene.remove(p.group);
        this.pteros.splice(i, 1);
      }
    }
    while (this.pteros.length < 8) this.pteros.push(new Ptero(this.ctx));
    if (this.plesio) {
      this.plesio.update(dt);
      if (this.plesio.removed) {
        this.plesioCd -= dt;
        if (this.plesioCd <= 0) this.plesio = new Plesio(this.ctx);
      } else this.plesioCd = 45;
    }
    this.spawnCd -= dt;
    if (this.spawnCd <= 0) { this.spawnCd = 4; this.populate(); }
  }
}
