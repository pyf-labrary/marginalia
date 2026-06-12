// world.js — Jurassic valley: terrain, sky, vegetation, monuments, meteors, mystery objects
import * as THREE from 'three';
import { fbm, rand, pick, clamp, lerp, mat, canvasTex } from './util.js';

export const WORLD = 1000;           // half-size
export const DESERT = new THREE.Vector2(600, -600);
export const LAKE = new THREE.Vector2(-350, 250);

const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export function getHeight(x, z) {
  let h = fbm(x * 0.0016 + 7.3, z * 0.0016 + 2.1, 4) * 34 - 8;
  h += fbm(x * 0.008, z * 0.008, 3) * 4 - 2;                       // detail
  // rim hills — pushed out and kept low so the valley reads open, not boxed in
  const edge = smoothstep(760, 1000, Math.max(Math.abs(x), Math.abs(z)));
  h += edge * 85 + fbm(x * 0.003, z * 0.003, 3) * edge * 50;
  const dd = Math.hypot(x - DESERT.x, z - DESERT.y);
  const df = smoothstep(170, 330, dd);                              // 0 inside the desert basin
  const desertH = 3 + fbm(x * 0.006, z * 0.006, 2) * 5;            // low dunes
  h = lerp(desertH, h, df);
  const lf = 1 - smoothstep(40, 170, Math.hypot(x - LAKE.x, z - LAKE.y));
  h -= lf * 26;                                                     // lake bowl
  const sf = 1 - smoothstep(18, 70, Math.hypot(x, z));
  h = lerp(h, 2, sf);                                               // flat spawn pad
  return h;
}
export const desertness = (x, z) => 1 - clamp(smoothstep(170, 330, Math.hypot(x - DESERT.x, z - DESERT.y)), 0, 1);
// water sits a fixed margin above the bowl floor, so the lake always reads as water
export const WATER_Y = getHeight(LAKE.x, LAKE.y) + 9;

export class World {
  constructor(scene, effects) {
    this.scene = scene;
    this.effects = effects;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.meteors = [];
    this.mystery = [];
    this.mysteryTimer = 20;
    this.hittables = [];   // shootable world objects (sphinx, mystery, nests)
    this.sphinx = null;
    this.events = [];      // world → main notifications (eruption, bomb impacts)
    this.t = 0;

    this._lights();
    this._terrain();
    this._water();
    this._sky();
    this._vegetation();
    this._monuments();
    this._meteors();
    this._nests();
    this._skeletons();
  }

  _lights() {
    const hemi = new THREE.HemisphereLight(0xcfe2f4, 0x5e5c3a, 0.95);
    this.group.add(hemi);
    const sun = this.sun = new THREE.DirectionalLight(0xffe6b8, 3.2);
    sun.position.set(180, 260, 120);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const S = 170;
    Object.assign(sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 10, far: 800 });
    sun.shadow.bias = -0.0004;
    this.group.add(sun, sun.target);
    this.scene.fog = new THREE.FogExp2(0xe2d8bc, 0.0014);
  }

  _terrain() {
    const seg = 240;
    const geo = new THREE.PlaneGeometry(WORLD * 2, WORLD * 2, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cGrass = new THREE.Color(0x6e9046), cGrass2 = new THREE.Color(0x587a36),
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
    this.water.position.set(LAKE.x, WATER_Y, LAKE.y);
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
          vec3 horizon = vec3(1.00, 0.86, 0.66);
          vec3 zenith  = vec3(0.38, 0.62, 0.88);
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

    // distant volcano + smoke source — ragged rock, not a perfect cone
    const vx = -240, vz = -930;
    const volGeo = new THREE.ConeGeometry(260, 330, 11, 8);
    {
      const p = volGeo.attributes.position;
      const cols = new Float32Array(p.count * 3);
      const cLow = new THREE.Color(0x5a4c40), cHigh = new THREE.Color(0x2e2622), cc = new THREE.Color();
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const n = fbm(x * 0.01 + 3.3, (y + z) * 0.01, 3) - 0.5;
        if (y < 160) p.setXYZ(i, x + n * 60, y + n * 24, z + n * 60);
        const t = clamp((y + 165) / 330, 0, 1);
        cc.copy(cLow).lerp(cHigh, t).offsetHSL(0, 0, n * 0.1);
        cols[i * 3] = cc.r; cols[i * 3 + 1] = cc.g; cols[i * 3 + 2] = cc.b;
      }
      volGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      volGeo.computeVertexNormals();
    }
    const vol = new THREE.Mesh(volGeo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    vol.position.set(vx, getHeight(vx, vz) + 100, vz);
    this.group.add(vol);
    const shoulder = new THREE.Mesh(volGeo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    shoulder.scale.setScalar(0.45);
    shoulder.position.set(vx + 230, getHeight(vx + 230, vz + 60) + 40, vz + 60);
    shoulder.rotation.y = 2.1;
    this.group.add(shoulder);
    this.volcanoTip = new THREE.Vector3(vx, vol.position.y + 165, vz);

    // crater glow + eruption machinery
    const craterGlow = new THREE.Mesh(new THREE.CircleGeometry(46, 12),
      new THREE.MeshBasicMaterial({ color: 0xff5a18, transparent: true, opacity: 0.12, fog: false }));
    craterGlow.rotation.x = -Math.PI / 2;
    craterGlow.position.copy(this.volcanoTip).add(new THREE.Vector3(0, -12, 0));
    this.group.add(craterGlow);
    const craterLight = new THREE.PointLight(0xff6a20, 0, 900, 1.2);
    craterLight.position.copy(this.volcanoTip).add(new THREE.Vector3(0, 30, 0));
    this.group.add(craterLight);
    this.eruption = { t: rand(45, 75), active: 0, craterGlow, craterLight, bombs: [] };
    const bombGeo = new THREE.IcosahedronGeometry(2.4, 0);
    const bombMat = new THREE.MeshBasicMaterial({ color: 0xffa040, fog: false });
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(bombGeo, bombMat);
      m.visible = false;
      this.group.add(m);
      this.eruption.bombs.push({ mesh: m, vel: new THREE.Vector3(), live: false });
    }
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
    // weathered sandstone — strata bands + grain speckle + hairline cracks
    const sandTex = canvasTex(256, 256, (ctx) => {
      ctx.fillStyle = '#c9a86d'; ctx.fillRect(0, 0, 256, 256);
      let y = 0;
      while (y < 256) {
        const bh = 5 + Math.random() * 14;
        const l = -10 + Math.random() * 20;
        ctx.fillStyle = `rgb(${201 + l | 0},${168 + l | 0},${109 + l * 0.8 | 0})`;
        ctx.fillRect(0, y, 256, bh);
        y += bh;
      }
      for (let i = 0; i < 1400; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? 'rgba(90,70,40,0.16)' : 'rgba(250,235,200,0.14)';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.6, 1.6);
      }
      ctx.strokeStyle = 'rgba(80,60,35,0.35)'; ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        let cx = Math.random() * 256, cy = Math.random() * 256;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        for (let s = 0; s < 5; s++) { cx += -8 + Math.random() * 16; cy += 8 + Math.random() * 14; ctx.lineTo(cx, cy); }
        ctx.stroke();
      }
    });
    sandTex.wrapS = sandTex.wrapT = THREE.RepeatWrapping;
    const stoneM = new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.94, metalness: 0 });
    // barely-darker accent — real sphinx is monochrome stone, contrast comes from light
    const stoneDarkM = stoneM.clone(); stoneDarkM.color.set(0xe2d4b8);
    const sand = mat(0xcdab72);

    // wind-worn surface: jitter vertices with low-freq noise
    const erode = (geo, amt = 0.2, freq = 0.5) => {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), yy = p.getY(i), z = p.getZ(i);
        const n = fbm(x * freq + 31.7, (yy + z) * freq + 9.2, 3) - 0.5;
        p.setXYZ(i, x + n * amt, yy + n * amt * 0.6, z + n * amt);
      }
      geo.computeVertexNormals();
      return geo;
    };
    // capsule lying along the X axis
    const xCapsule = (r, len, segs = 12) => {
      const geo = new THREE.CapsuleGeometry(r, len, 6, segs);
      geo.rotateZ(Math.PI / 2);
      return geo;
    };

    // pyramids
    const pyrSpecs = [[640, -560, 95], [540, -660, 62], [690, -670, 44]];
    this.pyramids = pyrSpecs.map(([x, z]) => ({ x, z }));
    for (const [x, z, h] of pyrSpecs) {
      const geo = new THREE.ConeGeometry(h * 0.86, h, 4, 6);
      erode(geo, h * 0.02, 0.06);
      const p = new THREE.Mesh(geo, stoneM);
      p.position.set(x, getHeight(x, z) + h / 2 - 2, z);
      p.rotation.y = Math.PI / 4;
      p.castShadow = true;
      this.group.add(p);
    }

    // ===== Sphinx — the time portal (sculpted, weathered) =====
    const g = new THREE.Group();

    // two-tier plinth
    const step = new THREE.Mesh(new THREE.BoxGeometry(64, 1.6, 28), stoneDarkM);
    step.position.y = 0.8;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(58, 3.2, 23), stoneM);
    plinth.position.y = 2.6;
    g.add(step, plinth);
    const TOP = 4.2; // plinth top surface

    // lion body — smooth capsule, slightly slab-sided
    const body = new THREE.Mesh(erode(xCapsule(6, 20), 0.45, 0.18), stoneM);
    body.position.set(-2, TOP + 7.2, 0);
    body.scale.set(1, 1.02, 0.85);
    // rump + shoulder masses
    const haunch = new THREE.Mesh(erode(new THREE.SphereGeometry(6.4, 14, 12), 0.4, 0.2), stoneM);
    haunch.position.set(-14, TOP + 6.6, 0);
    haunch.scale.set(1.2, 1.05, 0.95);
    const chest = new THREE.Mesh(erode(new THREE.SphereGeometry(5.6, 14, 12), 0.4, 0.2), stoneM);
    chest.position.set(10.5, TOP + 8.2, 0);
    chest.scale.set(0.85, 1.15, 0.8);
    g.add(body, haunch, chest);

    // folded rear legs along the flanks
    for (const side of [1, -1]) {
      const rear = new THREE.Mesh(erode(xCapsule(2.0, 9), 0.3, 0.3), stoneDarkM);
      rear.position.set(-11, TOP + 2.1, side * 5.4);
      g.add(rear);
    }
    // outstretched forelegs + paws with carved toes
    for (const side of [1, -1]) {
      const leg = new THREE.Mesh(erode(xCapsule(1.7, 13), 0.25, 0.3), stoneM);
      leg.position.set(17.5, TOP + 1.9, side * 3.8);
      g.add(leg);
      const paw = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.6, 3.4), stoneM);
      paw.position.set(25.5, TOP + 1.3, side * 3.8);
      g.add(paw);
      for (let tt = -1; tt <= 1; tt++) {
        const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 2.4, 8), stoneM);
        toe.rotation.z = Math.PI / 2;
        toe.position.set(27.2, TOP + 0.8, side * 3.8 + tt * 1.15);
        g.add(toe);
      }
    }
    // tail curled around the right haunch
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-19, TOP + 5.5, 1.5),
      new THREE.Vector3(-20.5, TOP + 3.2, 4.5),
      new THREE.Vector3(-16, TOP + 1.6, 6.8),
      new THREE.Vector3(-10, TOP + 1.2, 7.2),
    ]);
    const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 16, 0.7, 7), stoneDarkM);
    g.add(tail);

    // neck + head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.1, 5.5, 12), stoneM);
    neck.position.set(13.5, TOP + 13.2, 0);
    g.add(neck);
    const head = new THREE.Group();
    head.position.set(14, TOP + 18.2, 0);
    head.scale.setScalar(1.18);
    const skull = new THREE.Mesh(erode(new THREE.SphereGeometry(3.1, 16, 14), 0.18, 0.5), stoneM);
    skull.scale.set(1.0, 1.12, 0.92);
    // facial relief — brow, eroded nose, lips/chin
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 3.6), stoneDarkM);
    brow.position.set(2.55, 0.95, 0);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.9, 0.95), stoneM);
    nose.position.set(2.75, -0.1, 0);
    nose.rotation.z = -0.08;
    const lips = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 1.7), stoneDarkM);
    lips.position.set(2.7, -1.35, 0);
    const chin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 1.2), stoneM);
    chin.position.set(2.45, -2.1, 0);
    head.add(skull, brow, nose, lips, chin);
    // nemes headdress — swept-back hood + hanging lappets + brow band + uraeus
    const hoodGeo = new THREE.CylinderGeometry(1.9, 3.2, 4.4, 4, 1);
    hoodGeo.rotateY(Math.PI / 4);
    const hood = new THREE.Mesh(hoodGeo, stoneM);
    hood.scale.set(1, 1, 1.25);
    hood.position.set(-0.8, 1.0, 0);
    hood.rotation.z = 0.18;
    for (const side of [1, -1]) {
      const lapGeo = new THREE.CylinderGeometry(0.6, 1.1, 4.8, 4, 1);
      lapGeo.rotateY(Math.PI / 4);
      const lap = new THREE.Mesh(lapGeo, stoneM);
      lap.position.set(0.9, -1.7, side * 2.2);
      lap.rotation.x = side * -0.14;
      lap.scale.set(1.0, 1, 0.5);
      head.add(lap);
    }
    const band = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.28, 6, 18), stoneM);
    band.rotation.x = Math.PI / 2;
    band.position.set(0.1, 1.9, 0);
    band.scale.set(1.05, 0.95, 1);
    const uraeus = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.3, 6), stoneDarkM);
    uraeus.position.set(2.6, 2.6, 0);
    uraeus.rotation.z = -0.35;
    head.add(hood, band, uraeus);
    // glowing eyes (activate as portal charges)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x39d8c8, transparent: true, opacity: 0 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), eyeMat);
    eyeL.position.set(2.55, 0.45, 1.05);
    const eyeR = eyeL.clone(); eyeR.position.z = -1.05;
    head.add(eyeL, eyeR);
    g.add(head);

    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.entity = 'sphinx'; } });
    // clear of the pyramid silhouettes, gazing at the valley center
    // (model faces local +X, which rotation.y maps to world (cosθ, -sinθ))
    const sx = 510, sz = -510;
    g.position.set(sx, getHeight(sx, sz) - 0.5, sz);
    g.rotation.y = Math.atan2(sz, -sx);
    this.group.add(g);
    this.sphinx = {
      group: g, eyeMat, hits: 0, need: 12, charged: false,
      pos: new THREE.Vector3(sx, getHeight(sx, sz) + 10, sz),   // torso center — keeps aim rays on the body
    };
    this.hittables.push(g);

    // ruins dressing — NOT hittable: sand drifts burying the base, an avenue of broken columns
    const dress = new THREE.Group();
    dress.position.copy(g.position);
    dress.rotation.y = g.rotation.y;
    for (let i = 0; i < 6; i++) {
      const drift = new THREE.Mesh(new THREE.SphereGeometry(rand(6, 13), 10, 7), sand);
      drift.scale.y = 0.16;
      drift.position.set(rand(-30, 32), 0.3, pick([-1, 1]) * rand(9, 16));
      dress.add(drift);
    }
    for (const side of [1, -1]) {
      for (let i = 0; i < 4; i++) {
        const ch = rand(2.5, 8.5);
        const colGeo = new THREE.CylinderGeometry(1.15, 1.3, ch, 9);
        erode(colGeo, 0.18, 0.6);
        const col = new THREE.Mesh(colGeo, stoneM);
        col.position.set(36 + i * 9, ch / 2, side * 9.5);
        col.rotation.y = rand(7);
        col.castShadow = true;
        dress.add(col);
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1, 3.4), stoneDarkM);
        base.position.set(36 + i * 9, 0.5, side * 9.5);
        dress.add(base);
      }
    }
    // one fallen column, half sunk
    const fallen = new THREE.Mesh(erode(new THREE.CylinderGeometry(1.2, 1.2, 9, 9), 0.18, 0.6), stoneDarkM);
    fallen.rotation.set(Math.PI / 2, 0, 0.5);
    fallen.position.set(48, 0.6, 2);
    dress.add(fallen);
    this.group.add(dress);

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

  // ---- dinosaur nests: shoot an egg for points… and maybe an angry answer ----
  _nests() {
    this.nests = [];
    const twigM = mat(0x6a4e2e);
    const eggM = mat(0xe8dcc4);
    const eggM2 = mat(0xd8c8a8);
    let placed = 0, guard = 0;
    while (placed < 7 && guard++ < 300) {
      const x = rand(-WORLD * 0.8, WORLD * 0.8), z = rand(-WORLD * 0.8, WORLD * 0.8);
      const h = getHeight(x, z);
      if (h < 0 || h > 55 || Math.hypot(x, z) < 90) continue;
      if (desertness(x, z) > 0.55) continue;
      const grp = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.6, 7, 14), twigM);
      ring.rotation.x = -Math.PI / 2;
      ring.scale.y = 1; ring.scale.z = 1;
      ring.position.y = 0.35;
      const pad = new THREE.Mesh(new THREE.CircleGeometry(2.3, 12), mat(0x55402a));
      pad.rotation.x = -Math.PI / 2;
      pad.position.y = 0.18;
      grp.add(ring, pad);
      const rec = { grp, eggs: [], pos: new THREE.Vector3(x, h, z) };
      const n = 3 + (Math.random() < 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const egg = new THREE.Mesh(new THREE.SphereGeometry(0.62, 9, 8), Math.random() < 0.5 ? eggM : eggM2);
        egg.scale.y = 1.35;
        const a = rand(Math.PI * 2), d = rand(0, 1.3);
        egg.position.set(Math.cos(a) * d, 0.85, Math.sin(a) * d);
        egg.rotation.set(rand(-0.25, 0.25), 0, rand(-0.25, 0.25));
        egg.userData.entity = 'egg';
        egg.userData.eggOf = rec;
        egg.castShadow = true;
        grp.add(egg);
        rec.eggs.push(egg);
      }
      grp.position.set(x, h, z);
      this.group.add(grp);
      this.hittables.push(grp);
      this.nests.push(rec);
      placed++;
    }
  }

  shootEgg(eggMesh) {
    const rec = eggMesh.userData.eggOf;
    if (!rec || !rec.eggs.includes(eggMesh)) return null;
    rec.eggs = rec.eggs.filter((e) => e !== eggMesh);
    rec.grp.remove(eggMesh);
    if (!rec.eggs.length) {
      this.hittables = this.hittables.filter((h) => h !== rec.grp);
      this.nests = this.nests.filter((n) => n !== rec);
    }
    return { score: 150, ambush: Math.random() < 0.35, pos: rec.pos };
  }

  // ---- bleached megafauna skeletons (scenery landmarks) ----
  _skeletons() {
    const boneM = mat(0xddd5c0);
    const sites = [[300, -260, 0.8], [-180, -420, 2.4], [120, 430, 4.0]];
    for (const [x, z, ry] of sites) {
      const y = getHeight(x, z);
      if (y < -2) continue;
      const grp = new THREE.Group();
      // spine lying on the ground
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.5, 24, 6), boneM);
      spine.rotation.x = Math.PI / 2;
      spine.position.y = 1.1;
      grp.add(spine);
      // ribcage arcs, tallest mid-chest
      for (let i = 0; i < 7; i++) {
        const t = i / 6;
        const r = 3.6 * Math.sin(Math.PI * (0.25 + t * 0.6));
        const rib = new THREE.Mesh(new THREE.TorusGeometry(r, 0.22, 6, 10, Math.PI), boneM);
        rib.position.set(0, 1.0, -9 + t * 15);
        rib.rotation.z = rand(-0.12, 0.12);
        grp.add(rib);
      }
      // skull block + snout
      const skull = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 3.4), boneM);
      skull.position.set(rand(-0.6, 0.6), 1.0, 13.4);
      skull.rotation.y = rand(-0.5, 0.5);
      const snout = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 2.4), boneM);
      snout.position.set(skull.position.x, 0.8, 15.6);
      grp.add(skull, snout);
      grp.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      grp.position.set(x, y - 0.4, z);     // half-sunk into the soil
      grp.rotation.y = ry;
      grp.rotation.z = rand(-0.06, 0.06);
      this.group.add(grp);
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
    // volcano smoke + eruption cycle
    const er = this.eruption;
    if (Math.random() < dt * (er.active > 0 ? 30 : 6)) {
      this.effects.smoke(this.volcanoTip, er.active > 0 ? 60 : 26, er.active > 0 ? 0x3a3230 : 0x6a5a55, er.active > 0 ? 18 : 9);
    }
    if (er.active <= 0) {
      er.t -= dt;
      er.craterGlow.material.opacity = 0.1 + Math.sin(this.t * 1.7) * 0.05;
      er.craterLight.intensity = Math.max(0, er.craterLight.intensity - dt * 120);
      if (er.t <= 0) {
        er.active = 9;
        this.events.push({ type: 'erupt' });
      }
    } else {
      er.active -= dt;
      er.craterGlow.material.opacity = 0.5 + Math.sin(this.t * 11) * 0.3;
      er.craterLight.intensity = 260 + Math.sin(this.t * 9) * 120;
      if (Math.random() < dt * 1.6) {
        const b = er.bombs.find((x) => !x.live);
        if (b) {
          b.live = true;
          b.mesh.visible = true;
          b.mesh.position.copy(this.volcanoTip);
          const a = rand(Math.PI * 2);
          b.vel.set(Math.cos(a) * rand(10, 34), rand(40, 62), Math.sin(a) * rand(10, 34));
        }
        this.effects.spark(this.volcanoTip, 14, 0xff8030);
        this.effects.addShake(0.12);
      }
      if (er.active <= 0) er.t = rand(70, 110);
    }
    for (const b of er.bombs) {
      if (!b.live) continue;
      b.vel.y -= 26 * dt;
      b.mesh.position.addScaledVector(b.vel, dt);
      b.mesh.rotation.x += dt * 6; b.mesh.rotation.y += dt * 4;
      if (Math.random() < dt * 18) this.effects.smoke(b.mesh.position, 1, 0x4a3a32, 2);
      const gy = getHeight(b.mesh.position.x, b.mesh.position.z);
      if (b.mesh.position.y <= gy) {
        b.live = false;
        b.mesh.visible = false;
        b.mesh.position.y = gy;
        this.effects.explosion(b.mesh.position, 1.4, 0xff7a20);
        this.events.push({ type: 'bomb', nearTruck: b.mesh.position.distanceTo(truckPos) < 16 });
      }
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
