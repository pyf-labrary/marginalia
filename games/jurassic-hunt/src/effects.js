// effects.js — pooled particles, tracers, explosions, shockwaves, camera shake
import * as THREE from 'three';
import { rand } from './util.js';

class PSys {
  constructor(scene, N, { size = 1, gravity = 0, drag = 0, additive = false, opacity = 1 }) {
    this.N = N; this.gravity = gravity; this.drag = drag;
    this.pos = new Float32Array(N * 3);
    this.col = new Float32Array(N * 3);
    this.vel = new Float32Array(N * 3);
    this.life = new Float32Array(N);
    this.maxLife = new Float32Array(N);
    this.base = new Float32Array(N * 3);
    this.cursor = 0;
    this.pos.fill(99999);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    const m = new THREE.PointsMaterial({
      size, vertexColors: true, transparent: true, opacity,
      depthWrite: false, sizeAttenuation: true,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(geo, m);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this._c = new THREE.Color();
  }
  spawn(p, v, life, color) {
    const i = this.cursor; this.cursor = (this.cursor + 1) % this.N;
    this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
    this.vel[i * 3] = v.x; this.vel[i * 3 + 1] = v.y; this.vel[i * 3 + 2] = v.z;
    this.life[i] = this.maxLife[i] = life;
    this._c.set(color);
    this.base[i * 3] = this._c.r; this.base[i * 3 + 1] = this._c.g; this.base[i * 3 + 2] = this._c.b;
  }
  update(dt) {
    const { pos, vel, life, maxLife, col, base } = this;
    for (let i = 0; i < this.N; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      if (life[i] <= 0) { pos[i * 3 + 1] = 99999; continue; }
      vel[i * 3 + 1] -= this.gravity * dt;
      if (this.drag) {
        const d = Math.max(0, 1 - this.drag * dt);
        vel[i * 3] *= d; vel[i * 3 + 1] *= d; vel[i * 3 + 2] *= d;
      }
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      const f = life[i] / maxLife[i];
      col[i * 3] = base[i * 3] * f; col[i * 3 + 1] = base[i * 3 + 1] * f; col[i * 3 + 2] = base[i * 3 + 2] * f;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
}

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.shakeAmt = 0;
    this.sysSpark = new PSys(scene, 600, { size: 0.55, gravity: 14, drag: 1.2, additive: true });
    this.sysBlood = new PSys(scene, 500, { size: 0.7, gravity: 22, drag: 0.6 });
    this.sysDust = new PSys(scene, 600, { size: 2.4, gravity: -0.4, drag: 1.6, opacity: 0.45 });
    this.sysSmoke = new PSys(scene, 300, { size: 14, gravity: -2.2, drag: 0.5, opacity: 0.35 });
    this.sysDebris = new PSys(scene, 300, { size: 1.0, gravity: 26, drag: 0.4 });

    // tracer pool — thin additive cylinders
    this.tracers = [];
    const tGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 4, 1, true);
    tGeo.translate(0, 0.5, 0); tGeo.rotateX(Math.PI / 2); // align +Z, origin at start
    for (let i = 0; i < 36; i++) {
      const m = new THREE.Mesh(tGeo, new THREE.MeshBasicMaterial({
        color: 0xffcf7a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      m.visible = false;
      scene.add(m);
      this.tracers.push({ mesh: m, life: 0 });
    }
    this._tc = 0;

    // shockwave rings
    this.rings = [];
    const rGeo = new THREE.RingGeometry(0.8, 1, 36);
    rGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({
        color: 0xffc070, transparent: true, opacity: 0, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      m.visible = false;
      scene.add(m);
      this.rings.push({ mesh: m, life: 0, max: 1 });
    }

    // flash lights pool
    this.flashes = [];
    for (let i = 0; i < 6; i++) {
      const l = new THREE.PointLight(0xffa540, 0, 90);
      scene.add(l);
      this.flashes.push({ light: l, life: 0, max: 1 });
    }
    this._v = new THREE.Vector3();
  }

  addShake(a) { this.shakeAmt = Math.min(1.6, this.shakeAmt + a); }

  // move every pooled object into another scene (used for the city transition)
  attach(scene) {
    this.scene = scene;
    for (const s of [this.sysSpark, this.sysBlood, this.sysDust, this.sysSmoke, this.sysDebris]) scene.add(s.points);
    for (const t of this.tracers) scene.add(t.mesh);
    for (const r of this.rings) scene.add(r.mesh);
    for (const f of this.flashes) scene.add(f.light);
  }

  spark(pos, n = 6, color = 0xffd080) {
    for (let i = 0; i < n; i++) {
      this._v.set(rand(-1, 1), rand(0.2, 1.4), rand(-1, 1)).normalize().multiplyScalar(rand(4, 14));
      this.sysSpark.spawn(pos, this._v, rand(0.25, 0.7), color);
    }
  }
  blood(pos, n = 10, color = 0x8f1410) {
    for (let i = 0; i < n; i++) {
      this._v.set(rand(-1, 1), rand(0.3, 1.5), rand(-1, 1)).normalize().multiplyScalar(rand(3, 10));
      this.sysBlood.spawn(pos, this._v, rand(0.3, 0.8), Math.random() < 0.4 ? 0xc23018 : color);
    }
  }
  dust(pos, n = 4, color = 0x9a8a6a, spread = 1.5) {
    for (let i = 0; i < n; i++) {
      this._v.set(rand(-spread, spread), rand(0.5, 2), rand(-spread, spread));
      this.sysDust.spawn(pos, this._v, rand(0.6, 1.6), color);
    }
  }
  smoke(pos, n = 3, color = 0x555555, vy = 4) {
    for (let i = 0; i < n; i++) {
      this._v.set(rand(-1.5, 1.5), rand(vy * 0.6, vy), rand(-1.5, 1.5));
      this.sysSmoke.spawn(pos, this._v, rand(2, 4.5), color);
    }
  }
  debris(pos, n = 8, color = 0x6a6a72) {
    for (let i = 0; i < n; i++) {
      this._v.set(rand(-1, 1), rand(0.6, 1.6), rand(-1, 1)).normalize().multiplyScalar(rand(6, 18));
      this.sysDebris.spawn(pos, this._v, rand(0.5, 1.4), color);
    }
  }

  tracer(from, to) {
    const t = this.tracers[this._tc]; this._tc = (this._tc + 1) % this.tracers.length;
    const m = t.mesh;
    m.position.copy(from);
    m.lookAt(to);
    m.scale.set(1, 1, from.distanceTo(to));
    m.material.opacity = 0.85;
    m.visible = true;
    t.life = 0.07;
  }

  shockwave(pos, maxR = 16, color = 0xffc070) {
    const r = this.rings.find((x) => x.life <= 0);
    if (!r) return;
    r.mesh.position.copy(pos).add(new THREE.Vector3(0, 0.5, 0));
    r.mesh.material.color.set(color);
    r.mesh.visible = true;
    r.life = r.max = 0.55;
    r.maxR = maxR;
  }

  flash(pos, color = 0xffa540, intensity = 80, dur = 0.18, dist = 90) {
    const f = this.flashes.find((x) => x.life <= 0);
    if (!f) return;
    f.light.position.copy(pos);
    f.light.color.set(color);
    f.light.distance = dist;
    f.baseI = intensity;
    f.life = f.max = dur;
  }

  explosion(pos, scale = 1, color = 0xff8030) {
    this.spark(pos, 30 * scale, 0xffd080);
    this.debris(pos, 16 * scale, 0x52483c);
    this.smoke(pos, 10 * scale, 0x3c3a38, 7);
    this.shockwave(pos, 14 * scale, color);
    this.flash(pos, color, 160 * scale, 0.25, 70 * scale);
    this.addShake(0.5 * scale);
  }

  update(dt) {
    this.sysSpark.update(dt); this.sysBlood.update(dt); this.sysDust.update(dt);
    this.sysSmoke.update(dt); this.sysDebris.update(dt);
    for (const t of this.tracers) {
      if (t.life > 0) {
        t.life -= dt;
        t.mesh.material.opacity = Math.max(0, t.life / 0.07) * 0.85;
        if (t.life <= 0) t.mesh.visible = false;
      }
    }
    for (const r of this.rings) {
      if (r.life > 0) {
        r.life -= dt;
        const f = 1 - r.life / r.max;
        r.mesh.scale.setScalar(1 + f * r.maxR);
        r.mesh.material.opacity = (1 - f) * 0.7;
        if (r.life <= 0) r.mesh.visible = false;
      }
    }
    for (const f of this.flashes) {
      if (f.life > 0) {
        f.life -= dt;
        f.light.intensity = Math.max(0, f.life / f.max) * f.baseI;
      } else f.light.intensity = 0;
    }
    this.shakeAmt = Math.max(0, this.shakeAmt - dt * 2.6);
  }
}
