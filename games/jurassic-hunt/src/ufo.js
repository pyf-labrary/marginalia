// ufo.js — random UFO encounters: shoot it down, survivors crawl out and fight back
import * as THREE from 'three';
import { rand, clamp, damp, mat } from './util.js';
import { getHeight, WORLD } from './world.js';

let UID = 0;

class Ufo {
  constructor(ctx) {
    this.ctx = ctx;
    this.id = ++UID;
    const g = this.group = new THREE.Group();
    const hull = new THREE.MeshStandardMaterial({ color: 0x9aa4b2, roughness: 0.25, metalness: 0.95 });
    const disc = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 8), hull);
    disc.scale.set(1, 0.22, 1);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.7, 10, 28), hull);
    rim.rotation.x = Math.PI / 2;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshPhongMaterial({ color: 0x68e8d8, transparent: true, opacity: 0.55, shininess: 200, emissive: 0x0a4a44 }));
    dome.position.y = 1.1;
    this.glowRing = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.28, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x7affec }));
    this.glowRing.rotation.x = Math.PI / 2;
    this.glowRing.position.y = -1.15;
    this.light = new THREE.PointLight(0x7affec, 30, 80);
    this.light.position.y = -3;
    // little lights around the rim
    this.beads = [];
    for (let i = 0; i < 8; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffe070 }));
      const a = (i / 8) * Math.PI * 2;
      b.position.set(Math.cos(a) * 5.6, -0.2, Math.sin(a) * 5.6);
      this.beads.push(b);
      g.add(b);
    }
    g.add(disc, rim, dome, this.glowRing, this.light);
    g.traverse((o) => { if (o.isMesh) { o.userData.entity = 'ufo'; o.userData.ref = this; } });

    const tp = ctx.truck.pos;
    const a = rand(Math.PI * 2);
    g.position.set(tp.x + Math.cos(a) * 180, 130, tp.z + Math.sin(a) * 180);
    this.alt = rand(46, 64);
    this.orbitR = rand(55, 110);
    this.orbitA = rand(Math.PI * 2);
    this.orbitV = rand(0.12, 0.22) * (Math.random() < 0.5 ? 1 : -1);
    this.hp = this.maxHp = 120;
    this.state = 'fly'; // fly -> falling -> wreck
    this.t = 0;
    this.spin = 0;
    ctx.scene.add(g);
    ctx.audio.ufoHum(this.id, true);
  }
  get pos() { return this.group.position; }

  takeDamage(amount, weak, hitPos) {
    if (this.state !== 'fly') return;
    this.hp -= amount * (weak ? 2 : 1);
    this.ctx.effects.spark(hitPos, 6, 0x9adfff);
    if (this.hp <= 0) {
      this.state = 'falling';
      this.vel = new THREE.Vector3(rand(-6, 6), -2, rand(-6, 6));
      this.ctx.audio.ufoHum(this.id, false);
      this.ctx.audio.explosion(0.6);
      this.ctx.onUfoDown(this);
    }
  }

  update(dt) {
    this.t += dt;
    const { truck, effects } = this.ctx;
    if (this.state === 'fly') {
      this.orbitA += this.orbitV * dt;
      const tp = truck.pos;
      const tx = tp.x + Math.cos(this.orbitA) * this.orbitR;
      const tz = tp.z + Math.sin(this.orbitA) * this.orbitR;
      const ty = getHeight(tx, tz) + this.alt + Math.sin(this.t * 1.4) * 4;
      this.group.position.x = damp(this.group.position.x, tx, 1.2, dt);
      this.group.position.z = damp(this.group.position.z, tz, 1.2, dt);
      this.group.position.y = damp(this.group.position.y, ty, 1.5, dt);
      this.group.rotation.y += dt * 1.4;
      this.group.rotation.z = Math.sin(this.t * 0.9) * 0.07;
      this.glowRing.material.color.setHSL(0.46 + Math.sin(this.t * 5) * 0.04, 1, 0.65 + Math.sin(this.t * 7) * 0.15);
      this.light.intensity = 24 + Math.sin(this.t * 7) * 10;
    } else if (this.state === 'falling') {
      this.vel.y -= 14 * dt;
      this.group.position.addScaledVector(this.vel, dt);
      this.group.rotation.y += dt * 7;
      this.group.rotation.z += dt * 1.7;
      effects.smoke(this.pos.clone(), 3, 0x303030, 3);
      effects.spark(this.pos.clone(), 2, 0xffaa50);
      const gh = getHeight(this.pos.x, this.pos.z);
      if (this.pos.y <= gh + 2) {
        this.state = 'wreck';
        this.group.position.y = gh + 1.2;
        this.group.rotation.set(rand(-0.5, 0.5), rand(7), 0.5 + rand(0.3));
        effects.explosion(this.pos.clone(), 2.2, 0x7affec);
        this.ctx.audio.explosion(1.4);
        this.light.intensity = 0;
        this.glowRing.material.color.set(0x223330);
        for (const b of this.beads) b.material.color.set(0x333333);
        this.wreckT = 0;
        this.spawned = false;
      }
    } else if (this.state === 'wreck') {
      this.wreckT += dt;
      if (Math.random() < dt * 8) effects.smoke(this.pos.clone().add(new THREE.Vector3(rand(-3, 3), 1, rand(-3, 3))), 1, 0x2c2c2c, 4);
      if (!this.spawned && this.wreckT > 1.2) {
        this.spawned = true;
        this.ctx.spawnAliens(this.pos.clone(), 3);
      }
      return this.wreckT > 40; // remove wreck eventually
    }
    return false;
  }
}

class Alien {
  constructor(ctx, pos) {
    this.ctx = ctx;
    const g = this.group = new THREE.Group();
    const skin = mat(0xb8c4c2);
    const suit = mat(0x44505e);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.1, 8), suit);
    body.position.y = 1.15;
    const head = new THREE.Group(); head.position.y = 2.05;
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), skin);
    skull.scale.set(1, 1.25, 0.95);
    const eyeGeo = new THREE.SphereGeometry(0.13, 8, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a12 });
    const eL = new THREE.Mesh(eyeGeo, eyeMat); eL.position.set(0.18, 0.05, 0.32); eL.scale.set(1, 1.6, 0.6); eL.rotation.z = -0.4;
    const eR = eL.clone(); eR.position.x = -0.18; eR.rotation.z = 0.4;
    head.add(skull, eL, eR);
    head.traverse((o) => { if (o.isMesh) o.userData.weak = true; });
    this.legs = [];
    for (const side of [1, -1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.85, 6), skin);
      leg.position.set(side * 0.18, 0.42, 0);
      g.add(leg);
      this.legs.push({ leg, phase: side > 0 ? 0 : Math.PI });
    }
    this.armR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.8, 6), skin);
    this.armR.position.set(-0.45, 1.5, 0);
    this.armR.rotation.z = 0.5;
    const armL = this.armR.clone(); armL.position.x = 0.45; armL.rotation.z = -0.5;
    g.add(body, head, this.armR, armL);
    g.scale.setScalar(1.25);
    g.traverse((o) => { if (o.isMesh) { o.userData.entity = 'alien'; o.userData.ref = this; o.castShadow = true; } });
    g.position.copy(pos);
    g.position.x += rand(-4, 4); g.position.z += rand(-4, 4);
    g.position.y = getHeight(g.position.x, g.position.z);
    this.hp = 30;
    this.dead = false;
    this.deathT = 0;
    this.fireCd = rand(1.5, 3);
    this.gait = rand(10);
    ctx.scene.add(g);
  }
  get pos() { return this.group.position; }

  takeDamage(amount, weak, hitPos) {
    if (this.dead) return;
    this.ctx.effects.blood(hitPos, 8, 0x3aa86a); // green blood
    this.hp -= weak ? 999 : amount;
    if (this.hp <= 0) {
      this.dead = true;
      this.ctx.onKill(this, weak);
    }
  }

  update(dt) {
    const { truck, effects, audio } = this.ctx;
    if (this.dead) {
      this.deathT += dt;
      this.group.rotation.x = Math.min(Math.PI / 2, this.deathT * 4) * -1;
      if (this.deathT > 3) this.group.position.y -= dt;
      return this.deathT > 5;
    }
    const tp = truck.pos;
    const d = this.pos.distanceTo(tp);
    const dir = Math.atan2(tp.x - this.pos.x, tp.z - this.pos.z);
    this.group.rotation.y = dir;
    if (d > 26) {
      const fwd = new THREE.Vector3(Math.sin(dir), 0, Math.cos(dir));
      this.pos.addScaledVector(fwd, 4.2 * dt);
      this.pos.y = getHeight(this.pos.x, this.pos.z);
      this.gait += dt * 9;
      for (const l of this.legs) l.leg.rotation.x = Math.sin(this.gait + l.phase) * 0.6;
      this.armR.rotation.x = 0;
    } else {
      // stop, aim, fire green bolts
      for (const l of this.legs) l.leg.rotation.x *= 0.9;
      this.armR.rotation.x = -1.4; // raised arm
      this.fireCd -= dt;
      if (this.fireCd <= 0) {
        this.fireCd = rand(1.6, 2.8);
        const from = this.pos.clone().add(new THREE.Vector3(0, 2, 0));
        const to = tp.clone().add(new THREE.Vector3(rand(-1.5, 1.5), 1.2, rand(-1.5, 1.5)));
        this.ctx.fireBolt(from, to);
        audio.laser();
      }
    }
    return false;
  }
}

export class UfoManager {
  constructor(ctx) {
    this.ctx = ctx;
    ctx.spawnAliens = (pos, n) => this.spawnAliens(pos, n);
    ctx.fireBolt = (from, to) => this.fireBolt(from, to);
    this.ufos = [];
    this.aliens = [];
    this.bolts = [];
    this.nextUfo = rand(25, 40);
    this.firstUfo = true;
    // bolt pool
    this.boltGeo = new THREE.SphereGeometry(0.28, 8, 6);
    this.boltMat = new THREE.MeshBasicMaterial({ color: 0x52ff7a, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.95 });
  }

  spawnAliens(pos, n) {
    for (let i = 0; i < n; i++) this.aliens.push(new Alien(this.ctx, pos));
    this.ctx.hud.toast('外星来客', 'HOSTILE VISITORS', '飞碟幸存者正在接近你的皮卡！');
  }

  fireBolt(from, to) {
    const m = new THREE.Mesh(this.boltGeo, this.boltMat);
    m.position.copy(from);
    const vel = to.clone().sub(from).normalize().multiplyScalar(38);
    this.ctx.scene.add(m);
    this.bolts.push({ m, vel, life: 4 });
  }

  hittables() {
    const arr = [];
    for (const u of this.ufos) if (u.state === 'fly') arr.push(u.group);
    for (const a of this.aliens) if (!a.dead) arr.push(a.group);
    return arr;
  }

  update(dt) {
    const { truck, effects } = this.ctx;
    this.nextUfo -= dt;
    if (this.nextUfo <= 0 && this.ufos.filter((u) => u.state === 'fly').length < 1) {
      this.nextUfo = rand(45, 85);
      this.ufos.push(new Ufo(this.ctx));
      this.ctx.hud.toast('不明飞行物', 'UNIDENTIFIED FLYING OBJECT', this.firstUfo ? '击落它！但小心里面的东西…' : '又一架飞碟进入空域');
      this.firstUfo = false;
    }
    for (let i = this.ufos.length - 1; i >= 0; i--) {
      if (this.ufos[i].update(dt)) {
        this.ctx.scene.remove(this.ufos[i].group);
        this.ufos.splice(i, 1);
      }
    }
    for (let i = this.aliens.length - 1; i >= 0; i--) {
      if (this.aliens[i].update(dt)) {
        this.ctx.scene.remove(this.aliens[i].group);
        this.aliens.splice(i, 1);
      }
    }
    // bolts
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.life -= dt;
      b.m.position.addScaledVector(b.vel, dt);
      let hit = false;
      if (b.m.position.distanceTo(truck.pos.clone().add(new THREE.Vector3(0, 1.4, 0))) < 2.6) {
        truck.takeDamage(6);
        effects.spark(b.m.position.clone(), 10, 0x52ff7a);
        hit = true;
      } else if (b.m.position.y < getHeight(b.m.position.x, b.m.position.z)) {
        effects.spark(b.m.position.clone(), 5, 0x52ff7a);
        hit = true;
      }
      if (hit || b.life <= 0) {
        this.ctx.scene.remove(b.m);
        this.bolts.splice(i, 1);
      }
    }
  }
}
