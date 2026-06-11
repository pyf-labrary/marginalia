// audio.js — WebAudio master bus + fully procedural SFX + Lyria BGM loops
import { rand, clamp } from './util.js';

export class AudioSys {
  constructor() {
    this.ctx = null;
    this.bgm = { src: null, gain: null, buf: {} };
    this.engine = null;
    this.ufoHums = new Map();
  }

  // network-fetch the BGM bytes up front (no AudioContext needed yet)
  preload() {
    this.raw = {};
    const urls = { jurassic: 'assets/bgm_jurassic.mp3', city: 'assets/bgm_city.mp3' };
    return Promise.all(Object.entries(urls).map(([k, u]) =>
      fetch(u).then((r) => r.ok ? r.arrayBuffer() : null).then((b) => { if (b) this.raw[k] = b; }).catch(() => {})
    ));
  }

  // must be called from a user gesture
  init() {
    if (this.ctx) return;
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -18; this.comp.ratio.value = 6; this.comp.attack.value = 0.004;
    this.master.connect(this.comp).connect(ctx.destination);
    this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = 1.0; this.sfxBus.connect(this.master);
    this.bgmBus = ctx.createGain(); this.bgmBus.gain.value = 0.0; this.bgmBus.connect(this.master);
    this._loadBgm('jurassic', 'assets/bgm_jurassic.mp3').then(() => this.playBgm('jurassic'));
    this._loadBgm('city', 'assets/bgm_city.mp3');
    this._startEngine();
  }

  async _loadBgm(key, url) {
    try {
      const bytes = (this.raw && this.raw[key]) || await fetch(url).then((r) => r.ok ? r.arrayBuffer() : null);
      if (!bytes) return;
      this.bgm.buf[key] = await this.ctx.decodeAudioData(bytes);
    } catch (e) { /* bgm optional */ }
  }

  playBgm(key, vol = 0.34) {
    const buf = this.bgm.buf[key];
    if (!buf || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.bgm.src) {
      const old = this.bgm.src, og = this.bgm.gain;
      og.gain.linearRampToValueAtTime(0, t + 1.4);
      setTimeout(() => { try { old.stop(); } catch (e) {} }, 1600);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    // trim loop edges a touch to avoid Lyria's tail click
    src.loopStart = 0.05; src.loopEnd = buf.duration - 0.1;
    const g = this.ctx.createGain(); g.gain.value = 0;
    src.connect(g).connect(this.bgmBus);
    src.start();
    g.gain.linearRampToValueAtTime(1, t + 2.0);
    this.bgmBus.gain.setValueAtTime(vol, t);
    this.bgm.src = src; this.bgm.gain = g;
  }

  // ---------- tiny synth helpers ----------
  _noise(dur) {
    const n = this.ctx.sampleRate * dur, buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    return src;
  }
  _env(g, t, a, peak, dec, end = 0.0001) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(end, t + a + dec);
  }

  gunshot() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // crack
    const n = this._noise(0.09);
    const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = rand(1600, 2400); bp.Q.value = 0.7;
    const g = this.ctx.createGain(); this._env(g, t, 0.001, 0.5, 0.07);
    n.connect(bp).connect(g).connect(this.sfxBus); n.start(t);
    // body thump
    const o = this.ctx.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(rand(150, 190), t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.08);
    const g2 = this.ctx.createGain(); this._env(g2, t, 0.001, 0.55, 0.09);
    o.connect(g2).connect(this.sfxBus); o.start(t); o.stop(t + 0.12);
  }

  hitFlesh(weak = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(weak ? 220 : 140, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    const g = this.ctx.createGain(); this._env(g, t, 0.002, weak ? 0.8 : 0.4, 0.13);
    o.connect(g).connect(this.sfxBus); o.start(t); o.stop(t + 0.18);
    if (weak) { // bell ding on weakpoint
      const b = this.ctx.createOscillator(); b.type = 'sine'; b.frequency.value = 1318;
      const bg = this.ctx.createGain(); this._env(bg, t + 0.02, 0.002, 0.25, 0.5);
      b.connect(bg).connect(this.sfxBus); b.start(t); b.stop(t + 0.6);
    }
  }

  metalHit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'square'; o.frequency.value = rand(700, 1100);
    const g = this.ctx.createGain(); this._env(g, t, 0.001, 0.22, 0.18);
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 500;
    o.connect(f).connect(g).connect(this.sfxBus); o.start(t); o.stop(t + 0.25);
  }

  explosion(big = 1) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const n = this._noise(1.2);
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(120, t + 1.0);
    const g = this.ctx.createGain(); this._env(g, t, 0.004, 0.9 * big, 1.1);
    n.connect(lp).connect(g).connect(this.sfxBus); n.start(t);
    const o = this.ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(28, t + 0.9);
    const g2 = this.ctx.createGain(); this._env(g2, t, 0.004, 0.8 * big, 1.0);
    o.connect(g2).connect(this.sfxBus); o.start(t); o.stop(t + 1.1);
  }

  roar(size = 1) { // size 0.3 small .. 3 trex
    if (!this.ctx) return;
    const t = this.ctx.currentTime, dur = 0.5 + size * 0.35;
    const base = clamp(220 / size, 40, 320);
    for (const det of [1, 1.5, 0.5]) {
      const o = this.ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(base * det * 1.4, t);
      o.frequency.exponentialRampToValueAtTime(base * det * 0.6, t + dur);
      const g = this.ctx.createGain(); this._env(g, t, 0.05, 0.16, dur);
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
      o.connect(lp).connect(g).connect(this.sfxBus); o.start(t); o.stop(t + dur + 0.1);
    }
    const n = this._noise(dur);
    const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = base * 3; bp.Q.value = 0.6;
    const ng = this.ctx.createGain(); this._env(ng, t, 0.05, 0.22, dur);
    n.connect(bp).connect(ng).connect(this.sfxBus); n.start(t);
  }

  laser() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(1400, t); o.frequency.exponentialRampToValueAtTime(220, t + 0.22);
    const g = this.ctx.createGain(); this._env(g, t, 0.002, 0.25, 0.22);
    o.connect(g).connect(this.sfxBus); o.start(t); o.stop(t + 0.3);
  }

  repairTick() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sine';
    o.frequency.value = 880 + rand(0, 440);
    const g = this.ctx.createGain(); this._env(g, t, 0.002, 0.1, 0.18);
    o.connect(g).connect(this.sfxBus); o.start(t); o.stop(t + 0.25);
  }

  chime(score = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const freqs = score ? [659, 880, 1318] : [523, 659];
    freqs.forEach((f, i) => {
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = this.ctx.createGain(); this._env(g, t + i * 0.07, 0.005, 0.18, 0.4);
      o.connect(g).connect(this.sfxBus); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.5);
    });
  }

  whoosh(dur = 2.2) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const n = this._noise(dur);
    const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(180, t);
    bp.frequency.exponentialRampToValueAtTime(2800, t + dur * 0.7);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.7, t + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp).connect(g).connect(this.sfxBus); n.start(t);
  }

  ufoHum(id, on) {
    if (!this.ctx) return;
    if (on && !this.ufoHums.has(id)) {
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 84;
      const trem = this.ctx.createOscillator(); trem.frequency.value = 7;
      const tg = this.ctx.createGain(); tg.gain.value = 0.04;
      const g = this.ctx.createGain(); g.gain.value = 0.07;
      trem.connect(tg).connect(g.gain);
      o.connect(g).connect(this.sfxBus); o.start(); trem.start();
      this.ufoHums.set(id, { o, trem, g });
    } else if (!on && this.ufoHums.has(id)) {
      const h = this.ufoHums.get(id); this.ufoHums.delete(id);
      h.g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
      setTimeout(() => { try { h.o.stop(); h.trem.stop(); } catch (e) {} }, 500);
    }
  }

  _startEngine() {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 42;
    const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = 21;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240;
    const g = ctx.createGain(); g.gain.value = 0.0;
    o.connect(lp); o2.connect(lp); lp.connect(g).connect(this.sfxBus);
    o.start(); o2.start();
    this.engine = { o, o2, g, lp };
  }
  setEngine(speedRatio, throttle) {
    if (!this.engine) return;
    const e = this.engine, t = this.ctx.currentTime;
    const rpm = 38 + speedRatio * 95 + (throttle ? 14 : 0);
    e.o.frequency.setTargetAtTime(rpm, t, 0.08);
    e.o2.frequency.setTargetAtTime(rpm / 2, t, 0.08);
    e.g.gain.setTargetAtTime(0.035 + speedRatio * 0.05, t, 0.1);
    e.lp.frequency.setTargetAtTime(200 + speedRatio * 500, t, 0.1);
  }
}
