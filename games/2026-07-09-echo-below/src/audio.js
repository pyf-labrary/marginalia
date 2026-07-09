import { clamp } from './util.js';

export class AudioSys {
  constructor(media = {}) {
    this.media = media;
    this.ctx = null;
    this.muted = false;
    this.musicVolume = 0.72;
    this.sfxVolume = 0.9;
    this.samples = {};
  }

  async init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -20;
    this.comp.ratio.value = 5;
    this.comp.attack.value = 0.004;
    this.comp.release.value = 0.18;
    this.master.connect(this.comp).connect(ctx.destination);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.sfxGain();
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.0;
    this.sfxBus.connect(this.master);
    this.musicBus.connect(this.master);

    await this.decodeSamples();
    await this.startMusic();
  }

  async decodeSamples() {
    if (!this.ctx || !this.media.sfxBytes) return;
    await Promise.all(Object.entries(this.media.sfxBytes).map(async ([key, buf]) => {
      try { this.samples[key] = await this.ctx.decodeAudioData(buf.slice(0)); } catch {}
    }));
  }

  async startMusic() {
    if (!this.ctx || !this.media.musicBytes) return;
    try {
      const buf = await this.ctx.decodeAudioData(this.media.musicBytes.slice(0));
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.loopStart = Math.min(0.05, buf.duration * 0.05);
      src.loopEnd = Math.max(src.loopStart + 1, buf.duration - 0.08);
      src.connect(this.musicBus);
      src.start();
      const t = this.ctx.currentTime;
      this.musicBus.gain.cancelScheduledValues(t);
      this.musicBus.gain.setValueAtTime(0, t);
      this.musicBus.gain.linearRampToValueAtTime(this.musicGain(), t + 2.8);
      this.music = src;
    } catch {}
  }

  musicGain() {
    return this.musicVolume * 0.26;
  }

  sfxGain() {
    return this.sfxVolume * 0.92;
  }

  setMuted(v) {
    this.muted = v;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v ? 0 : 1, this.ctx.currentTime, 0.04);
    }
  }

  setVolume(v) {
    this.setMusicVolume(v);
    this.setSfxVolume(v);
  }

  setMusicVolume(v) {
    this.musicVolume = clamp(v, 0, 1);
    if (this.musicBus && this.ctx) {
      this.musicBus.gain.setTargetAtTime(this.musicGain(), this.ctx.currentTime, 0.06);
    }
  }

  setSfxVolume(v) {
    this.sfxVolume = clamp(v, 0, 1);
    if (this.sfxBus && this.ctx) {
      this.sfxBus.gain.setTargetAtTime(this.sfxGain(), this.ctx.currentTime, 0.035);
    }
  }

  playSample(key, gain = 1, rate = 1) {
    if (!this.ctx || !this.samples[key]) return false;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.samples[key];
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(g).connect(this.sfxBus);
    src.start(t);
    return true;
  }

  envelope(g, t, a, peak, d, end = 0.0001) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(end, t + a + d);
  }

  osc(type, freq, dur, gain, dest = this.sfxBus) {
    if (!this.ctx) return null;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = this.ctx.createGain();
    this.envelope(g, t, 0.006, gain, dur);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + dur + 0.08);
    return o;
  }

  noise(dur) {
    const ctx = this.ctx;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  ping(heat = 0) {
    if (!this.ctx) return;
    if (this.playSample('ping', 0.88, 0.95 + Math.random() * 0.08)) return;
    const t = this.ctx.currentTime;
    [740, 1480].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t + i * 0.025);
      o.frequency.exponentialRampToValueAtTime(f * 0.72, t + 0.36);
      const g = this.ctx.createGain();
      this.envelope(g, t + i * 0.025, 0.002, 0.22 + heat * 0.002, 0.5);
      const d = this.ctx.createDelay();
      d.delayTime.value = 0.13 + i * 0.04;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.26;
      d.connect(fb).connect(d);
      o.connect(g).connect(this.sfxBus);
      g.connect(d).connect(this.sfxBus);
      o.start(t + i * 0.025);
      o.stop(t + 0.58);
    });
  }

  pickup(core = false) {
    if (!this.ctx) return;
    if (this.playSample('pickup', core ? 1 : 0.7, core ? 0.9 : 1)) return;
    const base = core ? 220 : 520;
    [0, 4, 7, 12].forEach((step, i) => this.osc('sine', base * Math.pow(2, step / 12), 0.35, 0.13, this.sfxBus));
  }

  dock() {
    if (!this.ctx) return;
    if (this.playSample('dock', 0.85)) return;
    [262, 392, 524].forEach((f, i) => setTimeout(() => this.osc('triangle', f, 0.42, 0.14), i * 70));
  }

  warning() {
    if (!this.ctx) return;
    if (this.playSample('warning', 0.8)) return;
    this.osc('square', 360, 0.11, 0.16);
    setTimeout(() => this.osc('square', 270, 0.12, 0.14), 150);
  }

  hull(strength = 1) {
    if (!this.ctx) return;
    if (this.playSample('hull', clamp(strength, 0.25, 1.2), 0.92 + Math.random() * 0.12)) return;
    const t = this.ctx.currentTime;
    const n = this.noise(0.32);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 170 + Math.random() * 120;
    bp.Q.value = 0.65;
    const g = this.ctx.createGain();
    this.envelope(g, t, 0.002, 0.5 * strength, 0.28);
    n.connect(bp).connect(g).connect(this.sfxBus);
    n.start(t);
    this.osc('triangle', 70, 0.34, 0.28 * strength);
  }

  leviathan(intensity = 1) {
    if (!this.ctx) return;
    if (this.playSample('leviathan', clamp(0.35 + intensity * 0.45, 0.3, 1), 0.75)) return;
    const t = this.ctx.currentTime;
    [42, 61, 93].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.72, t + 1.7);
      const g = this.ctx.createGain();
      this.envelope(g, t + i * 0.04, 0.18, 0.11 * intensity, 1.7);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 420;
      o.connect(lp).connect(g).connect(this.sfxBus);
      o.start(t);
      o.stop(t + 1.9);
    });
  }
}
