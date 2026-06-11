// hud.js — all DOM overlays: hull bar, score, kill feed, toasts, compass, popups, entity bars
import * as THREE from 'three';
import { toScreen, clamp } from './util.js';

const $ = (id) => document.getElementById(id);

export class Hud {
  constructor() {
    this.el = {
      hud: $('hud'), hpFill: $('hpFill'), hpBar: $('hpBar'), hpVal: $('hpVal'),
      repairTip: $('repairTip'), scoreNum: $('scoreNum'), killNum: $('killNum'),
      accNum: $('accNum'), feed: $('feed'), toast: $('toast'), hint: $('hint'),
      speedNum: $('speedNum'), camMode: $('camMode'), compassTape: $('compassTape'),
      compass: $('compass'), hitmark: $('hitmark'), popups: $('popups'), bars: $('bars'),
      healflash: $('healflash'), cross: $('cross'), minimap: $('minimap'),
    };
    this.cursor = { x: innerWidth / 2, y: innerHeight / 2 };
    this.mapCtx = this.el.minimap.getContext('2d');
    this.pops = [];
    this.entBars = new Map();
    this.toastT = 0;
    this.hintT = 0;
    this._hm = 0;
    this._sv = { x: 0, y: 0, behind: false };
    this._v3 = new THREE.Vector3();
    this._buildCompass();
    this.pois = []; // {icon, getPos | fixed pos, color}
  }

  show() { this.el.hud.style.display = 'block'; }

  _buildCompass() {
    // tape: N E S W repeated, positioned by yaw in update
    const tape = this.el.compassTape;
    let html = '';
    const names = ['北 N', '东 E', '南 S', '西 W'];
    for (let r = -1; r <= 1; r++) {
      for (let i = 0; i < 4; i++) {
        html += `<b data-a="${r * 360 + i * 90}">${names[i]}</b>`;
      }
    }
    tape.innerHTML = html;
    this.tapeMarks = [...tape.querySelectorAll('b')];
  }

  addPoi(icon, pos, color = '#ffb84d', title = '') {
    const el = document.createElement('div');
    el.className = 'poi';
    el.textContent = icon;
    el.style.color = color;
    el.title = title;
    this.el.compass.appendChild(el);
    const rec = { el, pos };
    this.pois.push(rec);
    return rec;
  }
  removePoi(rec) {
    rec.el.remove();
    this.pois = this.pois.filter((p) => p !== rec);
  }

  setHp(hp, maxHp, repairing) {
    const r = clamp(hp / maxHp, 0, 1);
    this.el.hpFill.style.transform = `scaleX(${r})`;
    this.el.hpVal.textContent = Math.round(hp);
    this.el.hpBar.classList.toggle('low', r < 0.3);
    this.el.repairTip.classList.toggle('on', repairing);
  }

  setScore(score, kills, acc) {
    if (this._lastScore !== score) {
      this.el.scoreNum.textContent = score;
      this.el.scoreNum.classList.remove('bump');
      void this.el.scoreNum.offsetWidth;
      this.el.scoreNum.classList.add('bump');
      this._lastScore = score;
    }
    this.el.killNum.textContent = kills;
    this.el.accNum.textContent = acc;
  }

  setSpeed(kmh, mode) {
    this.el.speedNum.innerHTML = `${Math.abs(Math.round(kmh))}<small> KM/H</small>`;
    this.el.camMode.textContent = mode;
  }

  // crosshair follows the virtual cursor; .hot when hovering a target
  setCross(x, y, hot) {
    this.el.cross.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    this.el.cross.classList.toggle('hot', !!hot);
  }

  hitmarker(weak) {
    const h = this.el.hitmark;
    h.style.left = `${this.cursor.x}px`;
    h.style.top = `${this.cursor.y}px`;
    h.classList.toggle('weak', weak);
    h.style.transition = 'none';
    h.style.opacity = 1;
    h.style.transform = `translate(-50%,-50%) rotate(45deg) scale(${weak ? 1.5 : 1})`;
    clearTimeout(this._hm);
    this._hm = setTimeout(() => {
      h.style.transition = 'opacity .25s, transform .25s';
      h.style.opacity = 0;
      h.style.transform = 'translate(-50%,-50%) rotate(45deg) scale(0.7)';
    }, 60);
  }

  feed(text, weak = false) {
    const d = document.createElement('div');
    d.className = 'feedItem' + (weak ? ' weak' : '');
    d.innerHTML = text;
    this.el.feed.appendChild(d);
    requestAnimationFrame(() => d.classList.add('in'));
    setTimeout(() => { d.classList.remove('in'); setTimeout(() => d.remove(), 400); }, 4200);
    while (this.el.feed.children.length > 5) this.el.feed.firstChild.remove();
  }

  toast(cn, en, sub = '') {
    const t = this.el.toast;
    t.querySelector('.cn').textContent = cn;
    t.querySelector('.en').textContent = en;
    t.querySelector('.sub').textContent = sub;
    t.style.opacity = 1;
    this.toastT = 3.4;
  }

  hint(html, dur = 6) {
    this.el.hint.innerHTML = html;
    this.el.hint.style.opacity = 1;
    this.hintT = dur;
  }

  // world-space floating text
  popup(text, worldPos, cls = '') {
    const d = document.createElement('div');
    d.className = 'pop ' + cls;
    d.textContent = text;
    this.el.popups.appendChild(d);
    this.pops.push({ el: d, pos: worldPos.clone(), life: 1.1, rise: 0 });
  }

  // entity health bars
  ensureBar(key, label, boss) {
    if (this.entBars.has(key)) return this.entBars.get(key);
    const d = document.createElement('div');
    d.className = 'ebar' + (boss ? ' boss' : '');
    d.innerHTML = `<span>${label}</span><i></i>`;
    this.el.bars.appendChild(d);
    const rec = { el: d, fill: d.querySelector('i'), used: true };
    this.entBars.set(key, rec);
    return rec;
  }

  // ---- radar minimap ----
  // pre-render the whole 2km world once (terrain wash blitted under live blips)
  initMinimap(getHeight, desertness, worldHalf) {
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const g = c.getContext('2d');
    const img = g.createImageData(N, N);
    for (let py = 0; py < N; py++) {
      for (let px = 0; px < N; px++) {
        const wx = (px / (N - 1)) * 2 * worldHalf - worldHalf;
        const wz = (py / (N - 1)) * 2 * worldHalf - worldHalf;
        const h = getHeight(wx, wz);
        const d = desertness(wx, wz);
        let r, gg, b;
        if (h < -6) { r = 36; gg = 84; b = 88; }                 // lake
        else { r = 74; gg = 96; b = 52; }                        // grass
        if (h > 55) { const k = Math.min(1, (h - 55) / 70); r += k * 60; gg += k * 40; b += k * 50; } // rock
        r = r * (1 - d) + 190 * d; gg = gg * (1 - d) + 160 * d; b = b * (1 - d) + 105 * d;           // desert
        const i = (py * N + px) * 4;
        img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    this.worldMap = c;
    this.worldHalf = worldHalf;
  }

  drawMinimap(s) {
    // s: {pos, heading, camYaw, range, dinos, ufos, aliens, meteors, sphinx, pyramids, mystery, city}
    const c = this.mapCtx, W = 200, R = 96, range = s.range || 260;
    const k = R / range; // px per metre
    c.clearRect(0, 0, W, W);
    c.save();
    c.beginPath(); c.arc(100, 100, R, 0, 7); c.clip();
    // terrain wash
    if (this.worldMap && !s.city) {
      const mapScale = this.worldMap.width / (this.worldHalf * 2);
      const srcW = range * 2 * mapScale;
      const sx = (s.pos.x + this.worldHalf) * mapScale - srcW / 2;
      const sy = (s.pos.z + this.worldHalf) * mapScale - srcW / 2;
      c.globalAlpha = 0.8;
      c.imageSmoothingEnabled = true;
      c.drawImage(this.worldMap, sx, sy, srcW, srcW, 100 - R, 100 - R, R * 2, R * 2);
      c.globalAlpha = 1;
    } else if (s.city) {
      c.fillStyle = 'rgba(18,22,34,0.9)'; c.fillRect(0, 0, W, W);
    }
    // rings + cross
    c.strokeStyle = 'rgba(255,184,77,0.22)'; c.lineWidth = 1;
    for (const rr of [R * 0.45, R * 0.9]) { c.beginPath(); c.arc(100, 100, rr, 0, 7); c.stroke(); }
    c.beginPath(); c.moveTo(100, 100 - R); c.lineTo(100, 100 + R); c.moveTo(100 - R, 100); c.lineTo(100 + R, 100); c.stroke();

    const blip = (wp, color, size = 3, clampEdge = false, shape = 'dot') => {
      let dx = (wp.x - s.pos.x) * k, dy = (wp.z - s.pos.z) * k;
      const r = Math.hypot(dx, dy);
      if (r > R - 6) {
        if (!clampEdge) return;
        dx *= (R - 6) / r; dy *= (R - 6) / r;
      }
      const x = 100 + dx, y = 100 + dy;
      c.fillStyle = color;
      if (shape === 'dot') { c.beginPath(); c.arc(x, y, size, 0, 7); c.fill(); }
      else if (shape === 'tri') {
        c.beginPath(); c.moveTo(x, y - size); c.lineTo(x + size, y + size); c.lineTo(x - size, y + size); c.closePath(); c.fill();
      } else if (shape === 'diamond') {
        c.beginPath(); c.moveTo(x, y - size); c.lineTo(x + size, y); c.lineTo(x, y + size); c.lineTo(x - size, y); c.closePath(); c.fill();
      }
    };

    if (!s.city) {
      for (const p of s.pyramids) blip(p, 'rgba(232,200,140,0.9)', 4, false, 'tri');
      blip(s.sphinx, '#ffd060', 5, true, 'tri');
      for (const m of s.meteors) blip(m.pos, '#ff7a2a', 4, true, 'diamond');
      for (const rec of s.mystery) blip(rec.pos, '#e0c8ff', 4, true, 'diamond');
      for (const d of s.dinos) if (!d.dead) blip(d.pos, d.spec.boss ? '#ff3b24' : 'rgba(255,90,60,0.95)', d.spec.boss ? 4.5 : 3);
      for (const u of s.ufos) if (u.state === 'fly') blip(u.pos, '#7affec', 4.5, true);
      for (const a of s.aliens) if (!a.dead) blip(a.pos, '#52ff7a', 3);
    }

    // view cone (camera yaw) — north-up, screen angle of world dir (sin,cos)→(x,down z)
    const coneA = Math.PI - s.camYaw;
    c.save();
    c.translate(100, 100); c.rotate(coneA);
    const grad = c.createLinearGradient(0, 0, 0, -R);
    grad.addColorStop(0, 'rgba(255,184,77,0.28)'); grad.addColorStop(1, 'rgba(255,184,77,0)');
    c.fillStyle = grad;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-R * 0.42, -R); c.lineTo(R * 0.42, -R); c.closePath(); c.fill();
    c.restore();
    // truck arrow (heading)
    c.save();
    c.translate(100, 100); c.rotate(Math.PI - s.heading);
    c.fillStyle = '#f2e8d5';
    c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, -7); c.lineTo(5, 6); c.lineTo(0, 3); c.lineTo(-5, 6); c.closePath();
    c.fill(); c.stroke();
    c.restore();
    c.restore();
  }

  healFlash() {
    this.el.healflash.style.opacity = 1;
    clearTimeout(this._hf);
    this._hf = setTimeout(() => { this.el.healflash.style.opacity = 0; }, 300);
  }

  update(dt, camera, camYaw, entities) {
    // toast / hint fade
    if (this.toastT > 0) { this.toastT -= dt; if (this.toastT <= 0) this.el.toast.style.opacity = 0; }
    if (this.hintT > 0) { this.hintT -= dt; if (this.hintT <= 0) this.el.hint.style.opacity = 0; }

    // popups
    for (let i = this.pops.length - 1; i >= 0; i--) {
      const p = this.pops[i];
      p.life -= dt;
      p.rise += dt * 42;
      if (p.life <= 0) { p.el.remove(); this.pops.splice(i, 1); continue; }
      toScreen(p.pos, camera, this._sv);
      if (this._sv.behind) { p.el.style.opacity = 0; continue; }
      p.el.style.opacity = Math.min(1, p.life * 2);
      p.el.style.transform = `translate(-50%,-50%) translate(${this._sv.x}px,${this._sv.y - p.rise}px)`;
    }

    // compass tape: yaw degrees, 420px shows ~140°  => 3px per degree
    let deg = -camYaw * 180 / Math.PI;
    deg = ((deg % 360) + 360) % 360;
    for (const b of this.tapeMarks) {
      let d = parseFloat(b.dataset.a) - deg;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      b.style.left = `${210 + d * 3 - 12}px`;
      b.style.opacity = Math.abs(d) < 70 ? 1 : 0;
    }
    for (const poi of this.pois) {
      const dx = poi.pos.x - camera.position.x, dz = poi.pos.z - camera.position.z;
      const bearing = ((Math.atan2(dx, -dz) * 180 / Math.PI) % 360 + 360) % 360;
      let rel = bearing - deg;
      while (rel > 180) rel -= 360;
      while (rel < -180) rel += 360;
      poi.el.style.left = `${210 + rel * 3}px`;
      poi.el.style.opacity = Math.abs(rel) < 68 ? 1 : 0;
    }

    // entity health bars
    for (const rec of this.entBars.values()) rec.used = false;
    for (const e of entities) {
      if (e.dead || e.hp >= e.maxHp || e.hp <= 0) continue;
      // only when recently damaged
      if (e.sinceDamage > 6) continue;
      const rec = this.ensureBar(e.key2 || e, e.label, e.boss);
      rec.used = true;
      e.anchor(this._v3);
      toScreen(this._v3, camera, this._sv);
      if (this._sv.behind) { rec.el.style.display = 'none'; continue; }
      rec.el.style.display = 'block';
      rec.el.style.transform = `translate(-50%,-50%) translate(${this._sv.x}px,${this._sv.y}px)`;
      rec.fill.style.transform = `scaleX(${clamp(e.hp / e.maxHp, 0, 1)})`;
    }
    for (const [k, rec] of this.entBars) {
      if (!rec.used) { rec.el.remove(); this.entBars.delete(k); }
    }
  }
}
