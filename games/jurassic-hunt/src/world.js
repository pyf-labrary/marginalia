// world.js — Jurassic valley: terrain, sky, vegetation, monuments, meteors, mystery objects
import * as THREE from 'three';
import { fbm, rand, pick, clamp, lerp, mat, canvasTex } from './util.js';

export const WORLD = 1000;           // half-size
export const DESERT = new THREE.Vector2(600, -600);
const LAKE = new THREE.Vector2(-350, 250);

const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export function getHeight(x, z) {
  let h = fbm(x * 0.0016 + 7.3, z * 0.0016 + 2.1, 4) * 34 - 8;
  h += fbm(x * 0.008, z * 0.008, 3) * 4 - 2;                       // detail
  const edge = smoothstep(680, 980, Math.max(Math.abs(x), Math.abs(z)));
  h += edge * 150 + fbm(x * 0.003, z * 0.003, 3) * edge * 80;      // rim mountains
  const dd = Math.hypot(x - DESERT.x, z - DESERT.y);
  const df = smoothstep(170, 330, dd);                              // 0 inside the desert basin
  const desertH = 3 + fbm(x * 0.006, z * 0.006, 2) * 5;            // low dunes
  h = lerp(desertH, h, df);
  const lf = 1 - smoothstep(40, 170, Math.hypot(x - LAKE.x, z - LAKE.y));
  h -= lf * 17;                                                     // lake bowl
  const sf = 1 - smoothstep(18, 70, Math.hypot(x, z));
  h = lerp(h, 2, sf);                                               // flat spawn pad
  return h;
}
export const desertness = (x, z) => 1 - clamp(smoothstep(170, 330, Math.hypot(x - DESERT.x, z - DESERT.y)), 0, 1);

export class World {
  constructor(scene, effects) {
    this.scene = scene;
    this.effects = effects;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.meteors = [];
    this.mystery = [];
    this.mysteryTimer = 20;
    this.hittables = [];   // shootable world objects (sphinx, mystery)
    this.sphinx = null;
    this.t = 0;

    this._lights();
    this._terrain();
    this._water();
    this._sky();
    this._vegetation();
    this._monuments();
    this._meteors();
  }

  _lights() {
    const hemi = new THREE.HemisphereLight(0xbed8f0, 0x4a4a26, 0.55);
    this.group.add(hemi);
    const sun = this.sun = new THREE.DirectionalLight(0xffd9a0, 2.8);
    sun.position.set(180, 260, 120);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const S = 170;
    Object.assign(sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 10, far: 800 });
    sun.shadow.bias = -0.0004;
    this.group.add(sun, sun.target);
    this.scene.fog = new THREE.FogExp2(0xd4c5a0, 0.0022);
  }

  _terrain() {
    const seg = 240;
    const geo = new THREE.PlaneGeometry(WORLD * 2, WORLD * 2, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cGrass = new THREE.Color(0x5e7d3a), cGrass2 = new THREE.Color(0x49682e),
      cDirt = new THREE.Color(0x7a6648), cSand = new THREE.Color(0xd8b97e),
      cRock = new THREE.Color(0x8a8276), cSnow = new THREE.Color(0xcfc8bd);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = getHeight(x, z);
      pos.setY(i, h);
      const d = desertness(x, z);
      const n = fbm(x * 0.01 + 40, z * 0.01, 3);
      c.copy(n > 0.55 ? cGrass2 : cGrass);
      if (n < 0.38) c.lerp(cDirt, 0.7);
      if (h > 60) c.lerp(cRock, smoothstep(60, 110, h));
      if (h > 130) c.lerp(cSnow, smoothstep(130, 190, h));
      c.lerp(cSand, d);
      if (h < -4) c.lerp(cDirt, 0.6); // lake bed
      c.offsetHSL(0, 0, (fbm(x * 0.05, z * 0.05, 2) - 0.5) * 0.06);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const m = new THREE.MeshLambertMaterial({ vertexColors: true });
    const mesh = new THREE.Mesh(geo, m);
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  _water() {
    const geo = new THREE.CircleGeometry(170, 40);
    geo.rotateX(-Math.PI / 2);
    this.water = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      color: 0x2e6e72, transparent: true, opacity: 0.82, shininess: 140,
      specular: 0x99ddff, emissive: 0x0a2a2e,
    }));
    this.water.position.set(LAKE.x, -7.5, LAKE.y);
    this.group.add(this.water);
  }

  _sky() {
    const geo = new THREE.SphereGeometry(2400, 24, 14);
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { sunDir: { value: new THREE.Vector3(0.5, 0.6, 0.35).normalize() } },
      vertexShader: `varying vec3 vW; void main(){ vW=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `
        varying vec3 vW; uniform vec3 sunDir;
        void main(){
          float h = clamp(vW.y, -0.05, 1.0);
          vec3 horizon = vec3(1.00, 0.78, 0.52);
          vec3 zenith  = vec3(0.28, 0.52, 0.80);
          vec3 col = mix(horizon, zenith, pow(h, 0.62));
          float s = max(dot(vW, sunDir), 0.0);
          col += vec3(1.0, 0.75, 0.45) * pow(s, 220.0) * 1.4;   // sun disc
          col += vec3(1.0, 0.62, 0.30) * pow(s, 7.0) * 0.28;    // glow
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.group.add(new THREE.Mesh(geo, m));

    // clouds — soft sprite blobs
    const tex = canvasTex(256, 128, (ctx) => {
      for (let i = 0; i < 9; i++) {
        const x = 40 + Math.random() * 176, y = 45 + Math.random() * 38, r = 22 + Math.random() * 30;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(255,252,246,0.85)'); g.addColorStop(1, 'rgba(255,252,246,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
    });
    this.clouds = [];
    for (let i = 0; i < 22; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: rand(0.5, 0.9), fog: false, depthWrite: false }));
      sp.position.set(rand(-1800, 1800), rand(260, 520), rand(-1800, 1800));
      sp.scale.set(rand(260, 520), rand(90, 170), 1);
      sp.userData.v = rand(2, 6);
      this.group.add(sp); this.clouds.push(sp);
    }

    // distant volcano + smoke source
    const vx = -240, vz = -930;
    const vol = new THREE.Mesh(new THREE.ConeGeometry(260, 330, 7), mat(0x4a3f3a));
    vol.position.set(vx, getHeight(vx, vz) + 100, vz);
    this.group.add(vol);
    this.volcanoTip = new THREE.Vector3(vx, vol.position.y + 165, vz);
  }

  _vegetation() {
    const dummy = new THREE.Object3D();
    const place = (count, fn, test) => {
      const list = [];
      let guard = 0;
      while (list.length < count && guard++ < count * 40) {
        const x = rand(-WORLD * 0.92, WORLD * 0.92), z = rand(-WORLD * 0.92, WORLD * 0.92);
        const h = getHeight(x, z);
        if (h < -3 || h > 75) continue;
        if (Math.hypot(x, z) < 45) continue;
        if (!test(x, z, h)) continue;
        list.push([x, h, z]);
      }
      fn(list);
      return list;
    };
    const jungle = (x, z) => desertness(x, z) < 0.25;
    const desert = (x, z) => desertness(x, z) > 0.7;

    // --- giant ferns (crossed alpha planes) ---
    const fernTex = canvasTex(256, 256, (ctx) => {
      ctx.translate(128, 250);
      for (let f = 0; f < 9; f++) {
        const a = -Math.PI / 2 + (f - 4) * 0.32;
        ctx.save(); ctx.rotate(a);
        const grad = ctx.createLinearGradient(0, 0, 0, -210);
        grad.addColorStop(0, '#2c4a1e'); grad.addColorStop(1, '#5d8f37');
        ctx.strokeStyle = grad; ctx.lineWidth = 5; ctx.beginPath();
        ctx.moveTo(0, 0); ctx.quadraticCurveTo(14, -110, 4, -200); ctx.stroke();
        for (let l = 1; l < 14; l++) {
          const t = l / 14, y = -t * 195, w = 30 * (1 - t * 0.8);
          ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(8 * t, y); ctx.lineTo(8 * t - w, y - 9); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(8 * t, y); ctx.lineTo(8 * t + w, y - 9); ctx.stroke();
        }
        ctx.restore();
      }
    });
    const fernGeo = new THREE.PlaneGeometry(7, 7);
    fernGeo.translate(0, 3.2, 0);
    const fernMat = new THREE.MeshLambertMaterial({ map: fernTex, alphaTest: 0.45, side: THREE.DoubleSide });
    const ferns = new THREE.InstancedMesh(fernGeo, fernMat, 1300);
    let fi = 0;
    place(650, (list) => {
      for (const [x, y, z] of list) {
        const s = rand(0.5, 1.6), ry = rand(Math.PI * 2);
        for (const a of [0, Math.PI / 2]) {
          dummy.position.set(x, y - 0.2, z);
          dummy.rotation.set(0, ry + a, 0);
          dummy.scale.setScalar(s);
          dummy.updateMatrix();
          ferns.setMatrixAt(fi++, dummy.matrix);
        }
      }
    }, jungle);
    ferns.count = fi;
    this.group.add(ferns);

    // --- araucaria trees (trunk + stacked cones) ---
    const N_TREE = 260;
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.9, 14, 6);
    trunkGeo.translate(0, 7, 0);
    const trunks = new THREE.InstancedMesh(trunkGeo, mat(0x5a4632), N_TREE);
    const canGeo = new THREE.ConeGeometry(5, 13, 7);
    canGeo.translate(0, 17, 0);
    const cans = new THREE.InstancedMesh(canGeo, mat(0x3d5c26), N_TREE);
    const can2Geo = new THREE.ConeGeometry(3.4, 9, 7);
    can2Geo.translate(0, 23, 0);
    const cans2 = new THREE.InstancedMesh(can2Geo, mat(0x4a6e2e), N_TREE);
    let ti = 0;
    place(N_TREE, (list) => {
      for (const [x, y, z] of list) {
        dummy.position.set(x, y - 0.5, z);
        dummy.rotation.set(rand(-0.05, 0.05), rand(Math.PI * 2), rand(-0.05, 0.05));
        dummy.scale.setScalar(rand(0.6, 1.45));
        dummy.updateMatrix();
        trunks.setMatrixAt(ti, dummy.matrix);
        cans.setMatrixAt(ti, dummy.matrix);
        cans2.setMatrixAt(ti, dummy.matrix);
        ti++;
      }
    }, jungle);
    trunks.count = cans.count = cans2.count = ti;
    trunks.castShadow = cans.castShadow = true;
    this.group.add(trunks, cans, cans2);

    // --- rocks ---
    const rockGeo = new THREE.DodecahedronGeometry(1.6, 0);
    const rocks = new THREE.InstancedMesh(rockGeo, mat(0x8a7f6e), 160);
    let ri = 0;
    place(160, (list) => {
      for (const [x, y, z] of list) {
        dummy.position.set(x, y + 0.2, z);
        dummy.rotation.set(rand(7), rand(7), rand(7));
        dummy.scale.set(rand(0.5, 3), rand(0.4, 2), rand(0.5, 3));
        dummy.updateMatrix();
        rocks.setMatrixAt(ri++, dummy.matrix);
      }
    }, () => true);
    rocks.count = ri;
    this.group.add(rocks);

    // --- desert dead trees ---
    const deadGeo = new THREE.CylinderGeometry(0.18, 0.5, 9, 5);
    deadGeo.translate(0, 4.5, 0);
    const deads = new THREE.InstancedMesh(deadGeo, mat(0x9a8468), 40);
    let di = 0;
    place(40, (list) => {
      for (const [x, y, z] of list) {
        dummy.position.set(x, y, z);
        dummy.rotation.set(rand(-0.3, 0.3), rand(7), rand(-0.3, 0.3));
        dummy.scale.setScalar(rand(0.6, 1.4));
        dummy.updateMatrix();
        deads.setMatrixAt(di++, dummy.matrix);
      }
    }, desert);
    deads.count = di;
    this.group.add(deads);
  }

  _monuments() {
    const sand = mat(0xcdab72);
    const sandDark = mat(0xb08f5c);
    // pyramids
    const pyrSpecs = [[640, -560, 95], [540, -660, 62], [690, -670, 44]];
    for (const [x, z, h] of pyrSpecs) {
      const p = new THREE.Mesh(new THREE.ConeGeometry(h * 0.86, h, 4), sand);
      p.position.set(x, getHeight(x, z) + h / 2 - 2, z);
      p.rotation.y = Math.PI / 4;
      p.castShadow = true;
      this.group.add(p);
    }

    // ===== Sphinx — the time portal =====
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(34, 9, 12), sandDark);
    body.position.y = 7.5;
    const chest = new THREE.Mesh(new THREE.BoxGeometry(10, 13, 12), sandDark);
    chest.position.set(13, 9, 0);
    const paws = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 4), sand);
    paws.position.set(23, 4, 3.6);
    const paws2 = paws.clone(); paws2.position.z = -3.6;
    const haunch = new THREE.Mesh(new THREE.BoxGeometry(11, 11, 13), sandDark);
    haunch.position.set(-13, 8, 0);
    // head + nemes
    const head = new THREE.Mesh(new THREE.BoxGeometry(7, 8, 6), sand);
    head.position.set(15.5, 19.5, 0);
    const nemes = new THREE.Mesh(new THREE.BoxGeometry(6, 7.4, 10.5), sandDark);
    nemes.position.set(13.5, 19.2, 0);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 7), sand);
    crown.position.set(14, 24.2, 0);
    // glowing eyes (activate as portal charges)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x39d8c8, transparent: true, opacity: 0 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), eyeMat);
    eyeL.position.set(19.1, 20.5, 1.6);
    const eyeR = eyeL.clone(); eyeR.position.z = -1.6;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(44, 3, 18), sand);
    plinth.position.y = 1.5;
    g.add(body, chest, paws, paws2, haunch, head, nemes, crown, eyeL, eyeR, plinth);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.entity = 'sphinx'; } });
    const sx = 600, sz = -610;
    g.position.set(sx, getHeight(sx, sz) - 0.5, sz);
    g.rotation.y = -2.3; // gaze toward valley center
    this.group.add(g);
    this.sphinx = {
      group: g, eyeMat, hits: 0, need: 12, charged: false,
      pos: new THREE.Vector3(sx, getHeight(sx, sz) + 9, sz),   // torso center — keeps aim rays on the body
    };
    this.hittables.push(g);

    // portal light above sphinx (hidden until charged)
    this.portalLight = new THREE.PointLight(0x39d8c8, 0, 220);
    this.portalLight.position.copy(this.sphinx.pos).add(new THREE.Vector3(0, 18, 0));
    this.group.add(this.portalLight);
  }

  _meteors() {
    const spots = [[140, 200], [-260, -180], [420, 60], [-120, 480]];
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x3a3430, roughness: 0.8, metalness: 0.3,
      emissive: 0xff5a18, emissiveIntensity: 0.65,
    });
    for (const [x, z] of spots) {
      const y = getHeight(x, z);
      const grp = new THREE.Group();
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(4.2, 1), rockMat.clone());
      rock.position.y = 2.6;
      rock.rotation.set(rand(7), rand(7), rand(7));
      const rim = new THREE.Mesh(new THREE.TorusGeometry(8.5, 2.4, 8, 22), mat(0x5c4a38));
      rim.rotation.x = -Math.PI / 2;
      rim.position.y = 0.2;
      rim.scale.y = 0.5;
      const light = new THREE.PointLight(0xff7a2a, 14, 60);
      light.position.y = 6;
      grp.add(rock, rim, light);
      grp.position.set(x, y, z);
      this.group.add(grp);
      this.meteors.push({ group: grp, rock, light, pos: new THREE.Vector3(x, y, z) });
    }
  }

  // ---- mystery objects ----
  spawnMystery(nearPos) {
    const defs = [
      {
        kind: 'monolith', cn: '黑色方碑', en: 'THE MONOLITH', score: 300,
        build: () => new THREE.Mesh(new THREE.BoxGeometry(1.2, 10.8, 4.8),
          new THREE.MeshStandardMaterial({ color: 0x05050a, roughness: 0.15, metalness: 0.9 })),
      },
      {
        kind: 'amber', cn: '巨型琥珀', en: 'ANCIENT AMBER', score: 250,
        build: () => new THREE.Mesh(new THREE.IcosahedronGeometry(3, 0),
          new THREE.MeshPhongMaterial({ color: 0xe8920a, transparent: true, opacity: 0.78, emissive: 0x7a4a00, shininess: 180 })),
      },
      {
        kind: 'crystal', cn: '远古晶簇', en: 'PRIMAL CRYSTAL', score: 250,
        build: () => {
          const grp = new THREE.Group();
          for (let i = 0; i < 5; i++) {
            const c = new THREE.Mesh(new THREE.OctahedronGeometry(rand(0.8, 2.2), 0),
              new THREE.MeshPhongMaterial({ color: 0x44e8ff, emissive: 0x0a6a88, transparent: true, opacity: 0.9 }));
            c.position.set(rand(-2, 2), rand(0.5, 2.5), rand(-2, 2));
            c.scale.y = rand(1.5, 3);
            c.rotation.set(rand(-0.4, 0.4), rand(7), rand(-0.4, 0.4));
            grp.add(c);
          }
          return grp;
        },
      },
      {
        kind: 'moai', cn: '不属于此地的石像', en: 'DISPLACED IDOL', score: 300,
        build: () => {
          const grp = new THREE.Group();
          const headM = mat(0x7d7a70);
          const h = new THREE.Mesh(new THREE.BoxGeometry(3.4, 7, 3), headM);
          h.position.y = 3.5;
          const nose = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.4, 0.8), headM);
          nose.position.set(1.9, 3.6, 0);
          const brow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 3.2), headM);
          brow.position.set(1.6, 5.9, 0);
          grp.add(h, nose, brow);
          return grp;
        },
      },
    ];
    const def = pick(defs);
    const a = rand(Math.PI * 2), d = rand(70, 140);
    const x = clamp(nearPos.x + Math.cos(a) * d, -WORLD * 0.9, WORLD * 0.9);
    const z = clamp(nearPos.z + Math.sin(a) * d, -WORLD * 0.9, WORLD * 0.9);
    const obj = def.build();
    obj.position.set(x, getHeight(x, z) + (def.kind === 'monolith' ? 5.4 : 0), z);
    if (def.kind === 'monolith') obj.rotation.y = rand(7);
    obj.traverse((o) => { if (o.isMesh) o.userData.entity = 'mystery'; });
    obj.userData.entity = 'mystery';
    this.group.add(obj);
    const rec = { ...def, obj, life: 75, pos: obj.position.clone(), dead: false };
    obj.userData.mystery = rec;
    this.mystery.push(rec);
    this.hittables.push(obj);
    return rec;
  }

  killMystery(rec) {
    if (rec.dead) return;
    rec.dead = true;
    this.group.remove(rec.obj);
    this.hittables = this.hittables.filter((h) => h !== rec.obj);
    this.mystery = this.mystery.filter((m) => m !== rec);
  }

  update(dt, truckPos, camYaw) {
    this.t += dt;
    // sun + shadow box follow the truck
    this.sun.position.set(truckPos.x + 180, 260, truckPos.z + 120);
    this.sun.target.position.copy(truckPos);
    // clouds drift
    for (const c of this.clouds) {
      c.position.x += c.userData.v * dt;
      if (c.position.x > 1900) c.position.x = -1900;
    }
    // volcano smoke
    if (Math.random() < dt * 6) {
      this.effects.smoke(this.volcanoTip, 26, 0x6a5a55, 9);
    }
    // meteor pulse
    for (const m of this.meteors) {
      const p = 0.55 + Math.sin(this.t * 2.4 + m.pos.x) * 0.35;
      m.rock.material.emissiveIntensity = p;
      m.light.intensity = 10 + p * 10;
      m.rock.rotation.y += dt * 0.2;
      if (Math.random() < dt * 2) this.effects.spark(m.pos.clone().add(new THREE.Vector3(rand(-3, 3), rand(2, 6), rand(-3, 3))), 1, 0xffa040);
    }
    // sphinx eye charge pulse
    const s = this.sphinx;
    if (s.hits > 0 && !s.charged) {
      s.eyeMat.opacity = (s.hits / s.need) * (0.7 + Math.sin(this.t * 6) * 0.3);
    }
    if (s.charged) {
      s.eyeMat.opacity = 1;
      this.portalLight.intensity = 60 + Math.sin(this.t * 9) * 30;
      if (Math.random() < dt * 14) this.effects.spark(s.pos.clone().add(new THREE.Vector3(rand(-14, 14), rand(-8, 12), rand(-7, 7))), 2, 0x39d8c8);
    }
    // mystery lifecycle
    for (const rec of [...this.mystery]) {
      rec.life -= dt;
      if (rec.kind === 'crystal' || rec.kind === 'amber') rec.obj.rotation.y += dt * 0.5;
      if (rec.life < 0) this.killMystery(rec);
    }
    // water shimmer
    this.water.material.opacity = 0.78 + Math.sin(this.t * 1.3) * 0.05;
  }
}
