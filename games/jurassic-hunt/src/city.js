// city.js — the modern night city you warp back to after shooting the Sphinx
import * as THREE from 'three';
import { rand, pick, canvasTex, mat } from './util.js';

export const CITY_HALF = 380;

export class City {
  constructor() {
    const scene = this.scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a16);
    scene.fog = new THREE.FogExp2(0x0a1224, 0.0035);
    this.t = 0;

    scene.add(new THREE.AmbientLight(0x36405c, 2.0));
    const moon = new THREE.DirectionalLight(0x8aa4d8, 0.9);
    moon.position.set(-120, 220, 80);
    scene.add(moon);

    // stars
    const starGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const a = rand(Math.PI * 2), e = rand(0.08, 1.2), r = 1500;
      sp[i * 3] = Math.cos(a) * Math.cos(e) * r;
      sp[i * 3 + 1] = Math.sin(e) * r;
      sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 2.2, sizeAttenuation: false, fog: false })));

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

    // asphalt + road grid
    const roadTex = canvasTex(1024, 1024, (ctx) => {
      ctx.fillStyle = '#14161c'; ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#1e2027';
      for (let i = 0; i <= 8; i++) { ctx.fillRect(i * 128 - 22, 0, 44, 1024); ctx.fillRect(0, i * 128 - 22, 1024, 44); }
      ctx.strokeStyle = 'rgba(240,220,140,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([18, 22]);
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath(); ctx.moveTo(i * 128, 0); ctx.lineTo(i * 128, 1024); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * 128); ctx.lineTo(1024, i * 128); ctx.stroke();
      }
    });
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(6, 6);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(CITY_HALF * 2.6, CITY_HALF * 2.6), new THREE.MeshLambertMaterial({ map: roadTex }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // buildings — instanced, emissive window texture
    const winTex = canvasTex(128, 256, (ctx) => {
      ctx.fillStyle = '#0a0d14'; ctx.fillRect(0, 0, 128, 256);
      for (let y = 6; y < 250; y += 14) {
        for (let x = 6; x < 122; x += 12) {
          if (Math.random() < 0.5) continue;
          ctx.fillStyle = Math.random() < 0.75 ? `rgba(255,${200 + (Math.random() * 40) | 0},140,${0.5 + Math.random() * 0.5})`
            : `rgba(150,210,255,${0.5 + Math.random() * 0.5})`;
          ctx.fillRect(x, y, 7, 9);
        }
      }
    });
    const bGeo = new THREE.BoxGeometry(1, 1, 1);
    bGeo.translate(0, 0.5, 0);
    const bMat = new THREE.MeshLambertMaterial({ color: 0x222630, emissive: 0xffffff, emissiveMap: winTex, emissiveIntensity: 0.9 });
    const buildings = new THREE.InstancedMesh(bGeo, bMat, 500);
    const dummy = new THREE.Object3D();
    let bi = 0;
    for (let i = 0; i < 500; i++) {
      const gx = Math.round(rand(-CITY_HALF, CITY_HALF) / 41) * 41 + 20.5;
      const gz = Math.round(rand(-CITY_HALF, CITY_HALF) / 41) * 41 + 20.5;
      if (Math.hypot(gx, gz) < 60) continue;          // open plaza at spawn
      const h = rand(18, 130) * (Math.random() < 0.12 ? 1.8 : 1);
      dummy.position.set(gx + rand(-4, 4), 0, gz + rand(-4, 4));
      dummy.scale.set(rand(14, 26), h, rand(14, 26));
      dummy.rotation.y = 0;
      dummy.updateMatrix();
      buildings.setMatrixAt(bi++, dummy.matrix);
    }
    buildings.count = bi;
    scene.add(buildings);

    // neon billboards
    this.neons = [];
    const neonColors = [0xff2a6a, 0x29d8ff, 0xffe14d, 0x7a5bff, 0x39ffa0];
    for (let i = 0; i < 26; i++) {
      const c = pick(neonColors);
      const n = new THREE.Mesh(new THREE.PlaneGeometry(rand(8, 18), rand(4, 9)),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, side: THREE.DoubleSide, fog: false }));
      const a = rand(Math.PI * 2), d = rand(70, CITY_HALF);
      n.position.set(Math.cos(a) * d, rand(14, 70), Math.sin(a) * d);
      n.rotation.y = rand(Math.PI * 2);
      scene.add(n);
      this.neons.push({ m: n, ph: rand(10), c });
    }

    // street lights near the plaza
    for (const [x, z] of [[28, 28], [-28, 28], [28, -28], [-28, -28], [0, 60], [60, 0]]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7, 6), mat(0x33363e));
      pole.position.set(x, 3.5, z);
      const lampM = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));
      lampM.position.set(x, 7, z);
      scene.add(pole, lampM);
    }
    const plazaLight = new THREE.PointLight(0xffd9a0, 60, 140);
    plazaLight.position.set(0, 22, 0);
    scene.add(plazaLight);
  }

  getHeight() { return 0; }

  update(dt) {
    this.t += dt;
    for (const n of this.neons) {
      const flick = Math.sin(this.t * 3 + n.ph) > -0.85 ? 1 : 0.15; // occasional neon stutter
      n.m.material.opacity = (0.65 + Math.sin(this.t * 2 + n.ph) * 0.2) * flick;
    }
  }
}
