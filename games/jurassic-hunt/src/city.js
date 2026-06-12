// city.js — the modern night city you warp back to after shooting the Sphinx.
// Rain-slicked downtown: tiered towers, neon shopfronts, traffic, searchlights —
// continuity with the warp video's rainy street.
import * as THREE from 'three';
import { rand, pick, canvasTex, mat, clamp } from './util.js';

export const CITY_HALF = 380;
const BLOCK = 41;            // road grid pitch — ground texture, buildings and traffic all share it

export class City {
  constructor() {
    const scene = this.scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1226);
    scene.fog = new THREE.FogExp2(0x141d3a, 0.0019);
    this.t = 0;

    scene.add(new THREE.HemisphereLight(0x46588e, 0x181a26, 2.4));
    scene.add(new THREE.AmbientLight(0x4a5680, 1.2));
    const moon = new THREE.DirectionalLight(0xa6bce8, 1.5);
    moon.position.set(-120, 220, 80);
    scene.add(moon);

    this._sky(scene);
    this._ground(scene);
    this._buildings(scene);
    this._neon(scene);
    this._lamps(scene);
    this._traffic(scene);
    this._rain(scene);
    this._searchlights(scene);
    this._plaza(scene);
  }

  // ---------------------------------------------------------------- sky & backdrop
  _sky(scene) {
    // stars
    const starGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const a = rand(Math.PI * 2), e = rand(0.12, 1.2), r = 1500;
      sp[i * 3] = Math.cos(a) * Math.cos(e) * r;
      sp[i * 3 + 1] = Math.sin(e) * r;
      sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 2.0, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));

    // moon disc
    const moonSp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: canvasTex(128, 128, (ctx) => {
        const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 62);
        g.addColorStop(0, 'rgba(235,240,255,1)'); g.addColorStop(0.5, 'rgba(220,228,255,0.9)'); g.addColorStop(1, 'rgba(220,228,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
      }), fog: false, transparent: true,
    }));
    moonSp.position.set(-500, 600, 300);
    moonSp.scale.setScalar(160);
    scene.add(moonSp);

    // distant skyline silhouette + sodium light dome on the horizon
    const skyTex = canvasTex(2048, 256, (ctx) => {
      const glow = ctx.createLinearGradient(0, 256, 0, 90);
      glow.addColorStop(0, 'rgba(255,140,70,0.30)');
      glow.addColorStop(0.5, 'rgba(150,80,140,0.14)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, 2048, 256);
      let x = 0;
      while (x < 2048) {
        const w = 18 + Math.random() * 46;
        const h = 40 + Math.random() * 130;
        ctx.fillStyle = `rgba(${8 + Math.random() * 8 | 0},${12 + Math.random() * 8 | 0},${24 + Math.random() * 10 | 0},0.96)`;
        ctx.fillRect(x, 256 - h, w, h);
        for (let wy = 256 - h + 5; wy < 248; wy += 9) {
          for (let wx = x + 3; wx < x + w - 4; wx += 7) {
            if (Math.random() < 0.24) {
              ctx.fillStyle = Math.random() < 0.7 ? 'rgba(255,214,150,0.8)' : 'rgba(150,210,255,0.8)';
              ctx.fillRect(wx, wy, 2.4, 3.4);
            }
          }
        }
        x += w + Math.random() * 16;
      }
    });
    skyTex.wrapS = THREE.RepeatWrapping;
    const skyline = new THREE.Mesh(
      new THREE.CylinderGeometry(680, 680, 230, 48, 1, true),
      new THREE.MeshBasicMaterial({ map: skyTex, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false }),
    );
    skyline.position.y = 100;
    scene.add(skyline);
  }

  // ---------------------------------------------------------------- ground
  _ground(scene) {
    // one block tile: roads run along the tile edges so the texture matches the BLOCK grid
    const roadTex = canvasTex(256, 256, (ctx) => {
      ctx.fillStyle = '#13161f'; ctx.fillRect(0, 0, 256, 256);                  // asphalt
      ctx.fillStyle = '#1c202b'; ctx.fillRect(40, 40, 176, 176);                // sidewalk apron
      ctx.fillStyle = '#161a23'; ctx.fillRect(52, 52, 152, 152);                // lot interior
      ctx.strokeStyle = 'rgba(120,130,150,0.25)'; ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, 176, 176);                                        // curb line
      // centre dashes on both road axes (tile edges = road centrelines; wrap covers the far edge)
      ctx.fillStyle = 'rgba(235,205,120,0.65)';
      for (let d = 8; d < 256; d += 32) { ctx.fillRect(d, 0, 14, 3); ctx.fillRect(0, d, 3, 14); }
      // lane edge lines
      ctx.fillStyle = 'rgba(200,205,220,0.22)';
      for (const e of [37, 217]) { ctx.fillRect(0, e, 256, 2); ctx.fillRect(e, 0, 2, 256); }
      // grime
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.1})`;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 5, 2 + Math.random() * 5);
      }
    });
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
    const TILES = 26;
    roadTex.repeat.set(TILES, TILES);
    // phong + high shininess = wet street glinting under lamps and moon
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(BLOCK * TILES, BLOCK * TILES),
      new THREE.MeshPhongMaterial({ map: roadTex, shininess: 110, specular: 0x4a5a74 }),
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
  }

  // ---------------------------------------------------------------- buildings
  _winTex(rows, cols, warmth, litRatio) {
    return canvasTex(128, 256, (ctx) => {
      ctx.fillStyle = '#0a0d14'; ctx.fillRect(0, 0, 128, 256);
      const rh = 256 / rows, cw = 128 / cols;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > litRatio) continue;
          const warm = Math.random() < warmth;
          ctx.fillStyle = warm
            ? `rgba(255,${198 + (Math.random() * 44) | 0},142,${0.45 + Math.random() * 0.55})`
            : `rgba(152,${198 + (Math.random() * 30) | 0},255,${0.4 + Math.random() * 0.5})`;
          ctx.fillRect(c * cw + cw * 0.18, r * rh + rh * 0.22, cw * 0.62, rh * 0.5);
        }
      }
    });
  }

  _buildings(scene) {
    const bGeo = new THREE.BoxGeometry(1, 1, 1);
    bGeo.translate(0, 0.5, 0);
    const buckets = [
      { mat: new THREE.MeshLambertMaterial({ color: 0x39435c, emissive: 0xffffff, emissiveMap: this._winTex(46, 9, 0.55, 0.58), emissiveIntensity: 1.3 }), list: [] },  // towers
      { mat: new THREE.MeshLambertMaterial({ color: 0x343c50, emissive: 0xffffff, emissiveMap: this._winTex(26, 7, 0.72, 0.64), emissiveIntensity: 1.35 }), list: [] }, // mid-rise
      { mat: new THREE.MeshLambertMaterial({ color: 0x303a4a, emissive: 0xffffff, emissiveMap: this._winTex(12, 5, 0.8, 0.68), emissiveIntensity: 1.4 }), list: [] },  // low blocks
    ];
    this.signSpots = [];   // candidate wall faces for neon signs
    this.roofSpots = [];   // tall roofs for beacons/searchlights
    const storeList = []; // street-level glowing shopfronts
    const K = Math.floor(CITY_HALF / BLOCK);
    for (let gx = -K; gx <= K; gx++) {
      for (let gz = -K; gz <= K; gz++) {
        const cx = gx * BLOCK + BLOCK / 2, cz = gz * BLOCK + BLOCK / 2;
        if (Math.hypot(cx, cz) < 64) continue;             // open plaza at spawn
        if (Math.random() < 0.18) continue;                // vacant lots
        const d = Math.hypot(cx, cz);
        const downtown = Math.exp(-((d / 190) ** 2));
        const h = rand(15, 34) + downtown * rand(60, 160);
        const w = rand(15, 24), dep = rand(15, 24);
        const x = cx + rand(-3, 3), z = cz + rand(-3, 3);
        const bucket = h > 85 ? 0 : h > 40 ? 1 : 2;
        buckets[bucket].list.push({ x, z, w, dep, h });
        if (h > 110) this.roofSpots.push({ x, z, h });
        if (d < 250) storeList.push({ x, z, w, dep });
        if (bucket !== 0 && d < 260 && Math.random() < 0.7) {
          // face the sign toward the nearest road axis
          const toward = Math.abs(cx) < Math.abs(cz) ? (cz > 0 ? 'z-' : 'z+') : (cx > 0 ? 'x-' : 'x+');
          this.signSpots.push({ x, z, w, dep, h, toward });
        }
      }
    }
    const dummy = new THREE.Object3D();
    const tint = new THREE.Color();
    for (const b of buckets) {
      const im = new THREE.InstancedMesh(bGeo, b.mat, Math.max(1, b.list.length));
      b.list.forEach((s, i) => {
        dummy.position.set(s.x, 0, s.z);
        dummy.scale.set(s.w, s.h, s.dep);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
        tint.setHSL(0.6 + rand(-0.04, 0.04), rand(0.05, 0.18), rand(0.5, 0.72));
        im.setColorAt(i, tint);
      });
      im.count = b.list.length;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      scene.add(im);
    }
    // glowing street-level storefronts — this is what makes the streets feel alive
    if (storeList.length) {
      const storeTex = canvasTex(256, 64, (ctx) => {
        ctx.fillStyle = '#06080e'; ctx.fillRect(0, 0, 256, 64);
        const colors = ['#ff2a6a', '#29d8ff', '#ffe14d', '#7a5bff', '#39ffa0', '#ff7a2a', '#ffffff'];
        let x = 2;
        while (x < 246) {
          const w = 14 + Math.random() * 30;
          ctx.fillStyle = `rgba(255,228,180,${0.3 + Math.random() * 0.5})`;
          ctx.fillRect(x, 26, w, 36);                       // lit shop window
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = colors[(Math.random() * colors.length) | 0];
          ctx.fillRect(x, 6, w, 14);                        // neon sign band
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#0a0a12';
          for (let m = x + 3; m < x + w - 3; m += 6) ctx.fillRect(m, 9, 3, 8);
          x += w + 6;
        }
      });
      const sMat = new THREE.MeshLambertMaterial({ color: 0x141824, emissive: 0xffffff, emissiveMap: storeTex, emissiveIntensity: 1.7 });
      const sm = new THREE.InstancedMesh(bGeo, sMat, storeList.length);
      storeList.forEach((s, i) => {
        dummy.position.set(s.x, 0, s.z);
        dummy.scale.set(s.w + 0.5, 5.2, s.dep + 0.5);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        sm.setMatrixAt(i, dummy.matrix);
      });
      scene.add(sm);
    }

    // tiered crowns + antennas on the towers
    const crowns = buckets[0].list.filter(() => Math.random() < 0.7);
    if (crowns.length) {
      const cm = new THREE.InstancedMesh(bGeo, buckets[0].mat, crowns.length);
      crowns.forEach((s, i) => {
        dummy.position.set(s.x, s.h - 1, s.z);
        dummy.scale.set(s.w * 0.62, s.h * 0.18, s.dep * 0.62);
        dummy.updateMatrix();
        cm.setMatrixAt(i, dummy.matrix);
      });
      scene.add(cm);
    }
    const antGeo = new THREE.CylinderGeometry(0.18, 0.3, 1, 5);
    antGeo.translate(0, 0.5, 0);
    const ants = new THREE.InstancedMesh(antGeo, mat(0x3a3e48), Math.max(1, this.roofSpots.length));
    this.beacons = [];
    const beaconTex = canvasTex(32, 32, (ctx) => {
      const g = ctx.createRadialGradient(16, 16, 1, 16, 16, 15);
      g.addColorStop(0, 'rgba(255,70,60,1)'); g.addColorStop(1, 'rgba(255,70,60,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32);
    });
    this.roofSpots.forEach((s, i) => {
      const ah = rand(8, 16);
      dummy.position.set(s.x, s.h + (Math.random() < 0.7 ? s.h * 0.18 : 0) - 1, s.z);
      dummy.scale.set(1, ah, 1);
      dummy.updateMatrix();
      ants.setMatrixAt(i, dummy.matrix);
      const bsp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: beaconTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      }));
      bsp.position.set(s.x, s.h + s.h * 0.18 + ah - 1.5, s.z);
      bsp.scale.setScalar(4);
      scene.add(bsp);
      this.beacons.push({ m: bsp, ph: rand(7) });
    });
    ants.count = this.roofSpots.length;
    scene.add(ants);
  }

  // ---------------------------------------------------------------- neon signs
  _neon(scene) {
    this.neons = [];
    const words = ['拉面', '酒店', '电玩', '夜市', 'KTV', '便利店', '烧肉', '网吧', '药房', '茶餐厅', '麻辣烫', '银行'];
    const colors = [0xff2a6a, 0x29d8ff, 0xffe14d, 0x7a5bff, 0x39ffa0, 0xff7a2a];
    const spots = this.signSpots.sort(() => Math.random() - 0.5).slice(0, 56);
    const groundGlowTex = canvasTex(64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    });
    for (const s of spots) {
      const word = pick(words);
      const c = pick(colors);
      const css = '#' + c.toString(16).padStart(6, '0');
      const vertical = word.length <= 3 && Math.random() < 0.7;
      const tw = vertical ? 96 : 256, th = vertical ? 256 : 96;
      const tex = canvasTex(tw, th, (ctx) => {
        ctx.fillStyle = 'rgba(8,8,14,0.92)'; ctx.fillRect(0, 0, tw, th);
        ctx.strokeStyle = css; ctx.lineWidth = 5; ctx.strokeRect(5, 5, tw - 10, th - 10);
        ctx.fillStyle = css;
        ctx.shadowColor = css; ctx.shadowBlur = 18;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (vertical) {
          ctx.font = 'bold 64px "Noto Sans CJK SC", sans-serif';
          const step = (th - 40) / word.length;
          [...word].forEach((ch, i) => ctx.fillText(ch, tw / 2, 24 + step * (i + 0.5)));
        } else {
          ctx.font = 'bold 58px "Noto Sans CJK SC", sans-serif';
          ctx.fillText(word, tw / 2, th / 2);
        }
      });
      const sw = vertical ? rand(4.2, 5.6) : rand(11, 16);
      const sh = vertical ? sw * (th / tw) : sw * (th / tw);
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(sw, sh),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: true }),
      );
      const off = 0.35;
      const y = clamp(rand(7, s.h * 0.6), 6, 40);
      if (s.toward === 'x+') { sign.position.set(s.x + s.w / 2 + off, y, s.z); sign.rotation.y = Math.PI / 2; }
      if (s.toward === 'x-') { sign.position.set(s.x - s.w / 2 - off, y, s.z); sign.rotation.y = -Math.PI / 2; }
      if (s.toward === 'z+') { sign.position.set(s.x, y, s.z + s.dep / 2 + off); }
      if (s.toward === 'z-') { sign.position.set(s.x, y, s.z - s.dep / 2 - off); sign.rotation.y = Math.PI; }
      scene.add(sign);
      // wet-street reflection fake: tinted glow pooled on the ground beneath
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(sw * 2.4, sh * 2.2),
        new THREE.MeshBasicMaterial({
          map: groundGlowTex, color: c, transparent: true, opacity: 0.35,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }),
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.set(sign.position.x, 0.08, sign.position.z);
      scene.add(glow);
      this.neons.push({ m: sign, g: glow, ph: rand(10), baseO: 0.35 });
    }
  }

  // ---------------------------------------------------------------- street lamps
  _lamps(scene) {
    this.lampPos = [];
    const poleGeo = new THREE.CylinderGeometry(0.13, 0.18, 8, 6);
    const armGeo = new THREE.BoxGeometry(0.14, 0.14, 2.2);
    const headGeo = new THREE.SphereGeometry(0.5, 8, 6);
    const poleMat = mat(0x3a3e48);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
    const glowTex = canvasTex(64, 64, (ctx) => {
      const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      g.addColorStop(0, 'rgba(255,220,160,0.95)'); g.addColorStop(0.4, 'rgba(255,200,120,0.35)'); g.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    });
    const addLamp = (x, z, ry) => {
      const grp = new THREE.Group();
      const pole = new THREE.Mesh(poleGeo, poleMat); pole.position.y = 4;
      const arm = new THREE.Mesh(armGeo, poleMat); arm.position.set(0, 7.9, 1.0);
      const head = new THREE.Mesh(headGeo, headMat); head.position.set(0, 7.7, 2.0);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9,
      }));
      halo.scale.setScalar(7);
      halo.position.copy(head.position);
      grp.add(pole, arm, head, halo);
      grp.position.set(x, 0, z);
      grp.rotation.y = ry;
      scene.add(grp);
      const wp = new THREE.Vector3(x, 7.5, z).add(new THREE.Vector3(Math.sin(ry) * 2, 0, Math.cos(ry) * 2));
      this.lampPos.push(wp);
    };
    for (let d = -185; d <= 185; d += 37) {
      if (Math.abs(d) < 12) continue;
      addLamp(d, 7.5, Math.PI);
      addLamp(d, -7.5, 0);
      addLamp(7.5, d, -Math.PI / 2);
      addLamp(-7.5, d, Math.PI / 2);
    }
    for (const [x, z] of [[28, 28], [-28, 28], [28, -28], [-28, -28]]) addLamp(x, z, Math.atan2(-x, -z));

    // fake volumetric cones + warm pools under every lamp — streets read lit even
    // where the cycled real lights aren't parked
    const dummy = new THREE.Object3D();
    const coneGeo = new THREE.CylinderGeometry(0.35, 3.6, 7.4, 10, 1, true);
    coneGeo.translate(0, 3.75, 0);
    const cones = new THREE.InstancedMesh(coneGeo, new THREE.MeshBasicMaterial({
      color: 0xffd9a0, transparent: true, opacity: 0.075, blending: THREE.AdditiveBlending,
      depthWrite: false, side: THREE.DoubleSide,
    }), this.lampPos.length);
    const poolGeo = new THREE.PlaneGeometry(12, 12);
    poolGeo.rotateX(-Math.PI / 2);
    const pools = new THREE.InstancedMesh(poolGeo, new THREE.MeshBasicMaterial({
      map: glowTex, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false,
    }), this.lampPos.length);
    this.lampPos.forEach((p, i) => {
      dummy.position.set(p.x, 0.12, p.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      cones.setMatrixAt(i, dummy.matrix);
      dummy.position.y = 0.07;
      dummy.updateMatrix();
      pools.setMatrixAt(i, dummy.matrix);
    });
    scene.add(cones, pools);

    // pool of real lights cycled onto the lamps nearest the truck
    this.lightPool = [];
    for (let i = 0; i < 4; i++) {
      const l = new THREE.PointLight(0xffd9a0, 55, 50, 1.6);
      scene.add(l);
      this.lightPool.push(l);
    }
    this._poolCd = 0;
    const plazaLight = new THREE.PointLight(0xffd9a0, 80, 160);
    plazaLight.position.set(0, 24, 0);
    scene.add(plazaLight);
  }

  // ---------------------------------------------------------------- traffic
  _traffic(scene) {
    this.cars = [];
    const lines = [];
    for (const k of [-4, -3, -2, -1, 1, 2, 3, 4]) {
      lines.push({ axis: 'x', line: k * BLOCK });   // cars travel along X at z = line
      lines.push({ axis: 'z', line: k * BLOCK });   // cars travel along Z at x = line
    }
    for (const ln of lines) {
      const n = 2 + (Math.random() < 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        this.cars.push({
          ...ln, dir,
          lane: dir * 3.1,
          t: rand(-CITY_HALF, CITY_HALF),
          speed: rand(13, 24),
        });
      }
    }
    const carGeo = new THREE.BoxGeometry(2.0, 1.5, 4.6);
    carGeo.translate(0, 0.78, 0);
    const carMat = new THREE.MeshLambertMaterial({ color: 0x9aa0ad });
    this.carMesh = new THREE.InstancedMesh(carGeo, carMat, this.cars.length);
    const tint = new THREE.Color();
    for (let i = 0; i < this.cars.length; i++) {
      tint.setHSL(rand(0, 1), rand(0, 0.25), rand(0.12, 0.45));
      this.carMesh.setColorAt(i, tint);
    }
    scene.add(this.carMesh);
    // head/tail light points
    const mkPts = (color, size) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.cars.length * 2 * 3), 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        color, size, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      }));
      pts.frustumCulled = false;
      scene.add(pts);
      return pts;
    };
    this.headPts = mkPts(0xfff4d0, 1.6);
    this.tailPts = mkPts(0xff3022, 1.3);
    this._carDummy = new THREE.Object3D();
  }

  // ---------------------------------------------------------------- rain
  _rain(scene) {
    const N = this.rainN = 900;
    this.rainPos = new Float32Array(N * 3);
    this.rainVel = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      this.rainPos[i * 3] = rand(-90, 90);
      this.rainPos[i * 3 + 1] = rand(0, 70);
      this.rainPos[i * 3 + 2] = rand(-90, 90);
      this.rainVel[i] = rand(42, 60);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.rainPos, 3));
    this.rain = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x8fa6c8, size: 0.5, transparent: true, opacity: 0.45, depthWrite: false,
    }));
    this.rain.frustumCulled = false;
    scene.add(this.rain);
  }

  // ---------------------------------------------------------------- searchlights
  _searchlights(scene) {
    this.beams = [];
    const spots = this.roofSpots.slice(0, 3);
    for (const s of spots) {
      const geo = new THREE.CylinderGeometry(0.6, 13, 150, 12, 1, true);
      geo.translate(0, 75, 0);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color: 0xbcd4ff, transparent: true, opacity: 0.055, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      }));
      m.position.set(s.x, s.h + s.h * 0.18, s.z);
      scene.add(m);
      this.beams.push({ m, ph: rand(7), v: rand(0.25, 0.45) * pick([1, -1]) });
    }
  }

  // ---------------------------------------------------------------- plaza centerpiece
  _plaza(scene) {
    // glass spire — a modern echo of the portal's teal
    const grp = new THREE.Group();
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 4.2, 46, 4, 1),
      new THREE.MeshPhongMaterial({ color: 0x10202c, emissive: 0x0a3a3c, shininess: 180, specular: 0x88ffee, transparent: true, opacity: 0.92 }),
    );
    spire.rotation.y = Math.PI / 4;
    spire.position.y = 23;
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(spire.geometry),
      new THREE.LineBasicMaterial({ color: 0x39d8c8, transparent: true, opacity: 0.8 }),
    );
    edges.rotation.y = Math.PI / 4;
    edges.position.y = 23;
    const halo = new THREE.PointLight(0x39d8c8, 60, 90);
    halo.position.y = 30;
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(7, 8.5, 1.6, 8), mat(0x2a2f3a));
    pedestal.position.y = 0.8;
    grp.add(spire, edges, halo, pedestal);
    grp.position.set(0, 0, 30);
    scene.add(grp);
    this.spire = { grp, edges };
  }

  getHeight() { return 0; }

  update(dt, truckPos) {
    this.t += dt;
    // park the real-light pool on the 4 lamps nearest the truck
    this._poolCd -= dt;
    if (truckPos && this._poolCd <= 0) {
      this._poolCd = 0.5;
      const near = this.lampPos
        .map((p) => ({ p, d: (p.x - truckPos.x) ** 2 + (p.z - truckPos.z) ** 2 }))
        .sort((a, b) => a.d - b.d)
        .slice(0, this.lightPool.length);
      near.forEach((n, i) => this.lightPool[i].position.copy(n.p));
    }
    // neon flicker + matching ground pool
    for (const n of this.neons) {
      const flick = Math.sin(this.t * 3 + n.ph) > -0.85 ? 1 : 0.15;
      const o = (0.75 + Math.sin(this.t * 2 + n.ph) * 0.2) * flick;
      n.m.material.opacity = o;
      n.g.material.opacity = n.baseO * o;
    }
    // beacons pulse
    for (const b of this.beacons) b.m.material.opacity = 0.4 + Math.sin(this.t * 2.2 + b.ph) * 0.4;
    // searchlight sweep
    for (const b of this.beams) {
      b.m.rotation.x = 0.42 + Math.sin(this.t * b.v + b.ph) * 0.18;
      b.m.rotation.z = Math.cos(this.t * b.v * 0.8 + b.ph) * 0.3;
    }
    // traffic
    const d = this._carDummy;
    const hp = this.headPts.geometry.attributes.position.array;
    const tp = this.tailPts.geometry.attributes.position.array;
    for (let i = 0; i < this.cars.length; i++) {
      const c = this.cars[i];
      c.t += c.dir * c.speed * dt;
      if (c.t > CITY_HALF) c.t = -CITY_HALF;
      if (c.t < -CITY_HALF) c.t = CITY_HALF;
      let x, z, ry;
      if (c.axis === 'x') { x = c.t; z = c.line + c.lane; ry = c.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
      else { x = c.line - c.lane; z = c.t; ry = c.dir > 0 ? 0 : Math.PI; }
      d.position.set(x, 0, z);
      d.rotation.set(0, ry, 0);
      d.updateMatrix();
      this.carMesh.setMatrixAt(i, d.matrix);
      // lights: front pair + rear pair
      const fx = Math.sin(ry), fz = Math.cos(ry);
      const rxs = Math.cos(ry), rzs = -Math.sin(ry);
      for (const [arr, sgn, yy] of [[hp, 1, 0.85], [tp, -1, 0.95]]) {
        arr[i * 6] = x + fx * 2.35 * sgn + rxs * 0.7;
        arr[i * 6 + 1] = yy;
        arr[i * 6 + 2] = z + fz * 2.35 * sgn + rzs * 0.7;
        arr[i * 6 + 3] = x + fx * 2.35 * sgn - rxs * 0.7;
        arr[i * 6 + 4] = yy;
        arr[i * 6 + 5] = z + fz * 2.35 * sgn - rzs * 0.7;
      }
    }
    this.carMesh.instanceMatrix.needsUpdate = true;
    this.headPts.geometry.attributes.position.needsUpdate = true;
    this.tailPts.geometry.attributes.position.needsUpdate = true;
    // rain falls around the truck
    if (truckPos) {
      const rp = this.rainPos;
      for (let i = 0; i < this.rainN; i++) {
        rp[i * 3 + 1] -= this.rainVel[i] * dt;
        if (rp[i * 3 + 1] < 0) {
          rp[i * 3] = truckPos.x + rand(-90, 90);
          rp[i * 3 + 1] = rand(45, 70);
          rp[i * 3 + 2] = truckPos.z + rand(-90, 90);
        }
      }
      this.rain.geometry.attributes.position.needsUpdate = true;
    }
    // spire breathing
    if (this.spire) this.spire.edges.material.opacity = 0.55 + Math.sin(this.t * 1.6) * 0.3;
  }
}
