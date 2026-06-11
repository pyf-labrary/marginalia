// truck.js — armed pickup: arcade physics, terrain conforming, turret with machine gun
import * as THREE from 'three';
import { clamp, damp, lerp, mat, rand } from './util.js';
import { getHeight, WORLD } from './world.js';

export class Truck {
  constructor(scene, effects, audio) {
    this.effects = effects;
    this.audio = audio;
    this.group = new THREE.Group();
    scene.add(this.group);

    this.heading = Math.PI * 0.25;
    this.speed = 0;
    this.maxSpeed = 27;
    this.getH = getHeight;        // swapped out in city mode
    this.bounds = WORLD * 0.95;
    this.hp = 100; this.maxHp = 100;
    this.repairing = false;
    this.boost = false;
    this.pos = this.group.position;
    this.pos.set(0, 2, 0);
    this._tilt = new THREE.Quaternion();
    this._wheelSpin = 0;

    this._build();
  }

  _build() {
    const body = mat(0x6b7045);          // olive drab
    const dark = mat(0x3c4030);
    const black = mat(0x1c1c1e);
    const metal = new THREE.MeshStandardMaterial({ color: 0x8d8d92, roughness: 0.5, metalness: 0.7 });
    const glass = new THREE.MeshPhongMaterial({ color: 0x18242c, shininess: 160, specular: 0x88bbcc });

    const g = this.model = new THREE.Group();
    // chassis + hood + bed (truck faces +Z)
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.65, 4.9), body);
    chassis.position.y = 0.95;
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.5, 1.5), body);
    hood.position.set(0, 1.45, 1.7);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.95, 1.45), body);
    cab.position.set(0, 1.95, 0.45);
    const wind = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.62, 0.06), glass);
    wind.position.set(0, 2.05, 1.18); wind.rotation.x = -0.32;
    const windB = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 0.06), glass);
    windB.position.set(0, 2.0, -0.27);
    // bed walls
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 2.1), dark);
    bedFloor.position.set(0, 1.34, -1.45);
    const bedL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 2.1), body);
    bedL.position.set(1.05, 1.62, -1.45);
    const bedR = bedL.clone(); bedR.position.x = -1.05;
    const bedBack = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 0.1), body);
    bedBack.position.set(0, 1.62, -2.45);
    // bull bar + lightbar
    const bull = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.12), metal);
    bull.position.set(0, 1.0, 2.52);
    const bull2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), metal);
    bull2.position.set(0.7, 0.95, 2.52);
    const bull3 = bull2.clone(); bull3.position.x = -0.7;
    const lightbar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 0.3), black);
    lightbar.position.set(0, 2.5, 0.75);
    const lampL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.26),
      new THREE.MeshBasicMaterial({ color: 0xffd060 }));
    lampL.position.set(0.45, 2.51, 0.75);
    const lampR = lampL.clone(); lampR.position.x = -0.45;
    // headlights
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.06), new THREE.MeshBasicMaterial({ color: 0xfff2c0 }));
    hl.position.set(0.7, 1.42, 2.46);
    const hr = hl.clone(); hr.position.x = -0.7;
    g.add(chassis, hood, cab, wind, windB, bedFloor, bedL, bedR, bedBack, bull, bull2, bull3, lightbar, lampL, lampR, hl, hr);

    // wheels
    const wGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.42, 12);
    wGeo.rotateZ(Math.PI / 2);
    const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.44, 8);
    hubGeo.rotateZ(Math.PI / 2);
    this.wheels = [];
    for (const [x, z] of [[1.05, 1.62], [-1.05, 1.62], [1.05, -1.55], [-1.05, -1.55]]) {
      const w = new THREE.Group();
      w.add(new THREE.Mesh(wGeo, black), new THREE.Mesh(hubGeo, mat(0x7a7a80)));
      w.position.set(x, 0.56, z);
      g.add(w);
      this.wheels.push(w);
    }

    // ===== turret =====
    const turret = this.turret = new THREE.Group();           // yaw
    turret.position.set(0, 1.45, -1.4);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, 0.5, 10), metal);
    pedestal.position.y = 0.22;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 8, 18), dark);
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.05;
    turret.add(pedestal, ring);

    const pitch = this.gunPitch = new THREE.Group();          // pitch
    pitch.position.y = 0.62;
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 1.1), dark);
    receiver.position.z = 0.2;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.5, 8), black);
    barrel.rotation.x = Math.PI / 2; barrel.position.z = 1.45;
    const brake = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.25, 8), metal);
    brake.rotation.x = Math.PI / 2; brake.position.z = 2.1;
    const ammo = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.4), mat(0x4f5a2e));
    ammo.position.set(-0.4, -0.05, 0.1);
    const grips = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.12), black);
    grips.position.set(0, -0.12, -0.45);
    // muzzle flash
    const flashTex = makeFlashTex();
    this.muzzleSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: flashTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.muzzleSprite.scale.setScalar(1.5);
    this.muzzleSprite.position.z = 2.35;
    this.muzzleLight = new THREE.PointLight(0xffc060, 0, 22);
    this.muzzleLight.position.z = 2.2;
    pitch.add(receiver, barrel, brake, ammo, grips, this.muzzleSprite, this.muzzleLight);
    turret.add(pitch);
    g.add(turret);

    // headlight beam (subtle by day, dramatic in the night city)
    const beam = new THREE.SpotLight(0xffeebb, 60, 70, 0.42, 0.45, 1.2);
    beam.position.set(0, 1.5, 2.4);
    beam.target.position.set(0, 0.5, 40);
    g.add(beam, beam.target);

    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.truck = true; } });
    this.group.add(g);

    // first-person anchor (behind the gun sights, gun body in frame)
    this.fpAnchor = new THREE.Object3D();
    this.fpAnchor.position.set(0, 0.42, -1.35);
    pitch.add(this.fpAnchor);
  }

  // aim turret toward a world point
  aimAt(point) {
    const local = this.group.worldToLocal(point.clone());
    local.sub(this.turret.position);
    const yaw = Math.atan2(local.x, local.z);
    const flat = Math.hypot(local.x, local.z);
    const pit = Math.atan2(local.y - 0.6, flat);
    this.turret.rotation.y = yaw;
    this.gunPitch.rotation.x = -clamp(pit, -0.55, 0.18) * 1; // sign: rotate barrel up = negative x
  }

  getMuzzle(outPos, outDir) {
    this.muzzleLight.getWorldPosition(outPos);
    outDir.set(0, 0, 1).applyQuaternion(this.gunPitch.getWorldQuaternion(new THREE.Quaternion()));
    return outPos;
  }

  flashMuzzle() {
    this.muzzleSprite.material.opacity = 1;
    this.muzzleSprite.material.rotation = rand(Math.PI * 2);
    this.muzzleSprite.scale.setScalar(rand(1.2, 1.9));
    this.muzzleLight.intensity = 26;
  }

  takeDamage(n) {
    if (this.hp <= 0) { this.hp = 0; return; }
    this.hp = Math.max(0, this.hp - n);
    this.effects.addShake(0.45);
    const flash = document.getElementById('dmgflash');
    flash.style.opacity = 1;
    setTimeout(() => { flash.style.opacity = 0; }, 120);
    this.audio.metalHit();
  }

  update(dt, input) {
    // ---- drive ----
    const accel = 15, drag = 0.55;
    const max = this.boost ? this.maxSpeed * 1.45 : this.maxSpeed;
    const crippled = this.hp <= 0 ? 0.3 : 1;
    if (input.fwd) this.speed += accel * dt;
    else if (input.back) this.speed -= accel * 0.8 * dt;
    else this.speed -= this.speed * drag * 2.2 * dt;
    this.speed -= this.speed * drag * dt * (this.boost ? 0.4 : 1);
    this.speed = clamp(this.speed, -max * 0.45 * crippled, max * crippled);

    const sgn = this.speed >= 0 ? 1 : -1;
    const steerPow = clamp(Math.abs(this.speed) / 6, 0, 1) * (1.45 - (Math.abs(this.speed) / max) * 0.7);
    if (input.left) this.heading += steerPow * sgn * dt * 1.6;
    if (input.right) this.heading -= steerPow * sgn * dt * 1.6;

    const fwd = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
    this.pos.addScaledVector(fwd, this.speed * dt);
    this.pos.x = clamp(this.pos.x, -this.bounds, this.bounds);
    this.pos.z = clamp(this.pos.z, -this.bounds, this.bounds);

    // ---- terrain conform ----
    const h = this.getH(this.pos.x, this.pos.z);
    this.pos.y = damp(this.pos.y, h + 0.1, 14, dt);
    const ah = 2.2;
    const hF = this.getH(this.pos.x + fwd.x * ah, this.pos.z + fwd.z * ah);
    const hB = this.getH(this.pos.x - fwd.x * ah, this.pos.z - fwd.z * ah);
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
    const hR = this.getH(this.pos.x + right.x * 1.3, this.pos.z + right.z * 1.3);
    const hL = this.getH(this.pos.x - right.x * 1.3, this.pos.z - right.z * 1.3);
    const pitch = Math.atan2(hB - hF, ah * 2);
    const roll = Math.atan2(hR - hL, 2.6);
    const e = new THREE.Euler(pitch, this.heading, roll, 'YXZ');
    this._tilt.slerp(new THREE.Quaternion().setFromEuler(e), 1 - Math.exp(-10 * dt));
    this.group.quaternion.copy(this._tilt);

    // wheels spin
    this._wheelSpin += (this.speed / 0.56) * dt;
    for (const w of this.wheels) w.rotation.x = this._wheelSpin;

    // dust when moving
    const sp = Math.abs(this.speed);
    if (sp > 4 && Math.random() < dt * sp * 1.4) {
      const back = this.pos.clone().addScaledVector(fwd, -2.4);
      back.y = h + 0.4;
      this.effects.dust(back, 2, 0xa39272, 2);
    }
    if (this.boost && sp > 3 && Math.random() < dt * 30) {
      const back = this.pos.clone().addScaledVector(fwd, -2.6);
      back.y = h + 1;
      this.effects.spark(back, 2, 0x6ac8ff);
    }
    // damage smoke from the hood
    if (this.hp < 40 && Math.random() < dt * (this.hp <= 0 ? 18 : 7)) {
      const hood = this.pos.clone().addScaledVector(fwd, 1.7);
      hood.y += 1.6;
      this.effects.smoke(hood, 1, this.hp <= 0 ? 0x222222 : 0x4a4a4a, 3);
    }

    // muzzle flash decay
    this.muzzleSprite.material.opacity = Math.max(0, this.muzzleSprite.material.opacity - dt * 14);
    this.muzzleLight.intensity = Math.max(0, this.muzzleLight.intensity - dt * 260);

    this.audio.setEngine(sp / this.maxSpeed, input.fwd);
  }
}

function makeFlashTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.translate(64, 64);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 60);
  g.addColorStop(0, 'rgba(255,255,230,1)');
  g.addColorStop(0.25, 'rgba(255,190,80,0.9)');
  g.addColorStop(1, 'rgba(255,120,20,0)');
  ctx.fillStyle = g;
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 60, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  return t;
}
