/** Layered WebAudio SFX + soft pad BGM through a master compressor bus. */
export class AudioSys {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicVol = 0.55;
    this.sfxVol = 0.85;
    this.muted = false;
    this._pad = null;
    this._started = false;
  }

  async init() {
    if (this._started) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createDynamicsCompressor();
    this.master.threshold.value = -18;
    this.master.knee.value = 18;
    this.master.ratio.value = 4;
    this.master.attack.value = 0.003;
    this.master.release.value = 0.18;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain.connect(this.master);
    this.sfxGain.connect(this.master);
    this._applyVol();
    this._started = true;
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.startPad();
  }

  _applyVol() {
    if (!this.musicGain) return;
    const m = this.muted ? 0 : this.musicVol;
    const s = this.muted ? 0 : this.sfxVol;
    this.musicGain.gain.setTargetAtTime(m, this.ctx.currentTime, 0.05);
    this.sfxGain.gain.setTargetAtTime(s, this.ctx.currentTime, 0.03);
  }

  setMusic(v) {
    this.musicVol = v;
    this._applyVol();
  }

  setSfx(v) {
    this.sfxVol = v;
    this._applyVol();
  }

  setMuted(m) {
    this.muted = m;
    this._applyVol();
  }

  startPad() {
    if (!this.ctx || this._pad) return;
    const t0 = this.ctx.currentTime;
    const freqs = [110, 164.81, 220, 329.63];
    const nodes = [];
    for (const f of freqs) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const ftr = this.ctx.createBiquadFilter();
      o.type = 'sine';
      o.frequency.value = f;
      ftr.type = 'lowpass';
      ftr.frequency.value = 900;
      g.gain.value = 0.04;
      o.connect(ftr);
      ftr.connect(g);
      g.connect(this.musicGain);
      o.start(t0);
      // slow tremolo
      const lfo = this.ctx.createOscillator();
      const lg = this.ctx.createGain();
      lfo.frequency.value = 0.08 + Math.random() * 0.06;
      lg.gain.value = 0.015;
      lfo.connect(lg);
      lg.connect(g.gain);
      lfo.start(t0);
      nodes.push(o, lfo);
    }
    this._pad = nodes;
  }

  _env(g, t, a, d, s, r, peak = 0.25) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * s), t + a + d);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d + r);
  }

  _tone(freq, dur, type = 'sine', peak = 0.2, detune = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.02);
    o.detune.value = detune;
    o.connect(g);
    g.connect(this.sfxGain);
    this._env(g, t, 0.01, dur * 0.3, 0.35, dur * 0.55, peak);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  _noise(dur, peak = 0.12, filterFreq = 1200) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const n = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = filterFreq;
    f.Q.value = 0.7;
    const g = this.ctx.createGain();
    n.connect(f);
    f.connect(g);
    g.connect(this.sfxGain);
    this._env(g, t, 0.005, dur * 0.2, 0.2, dur * 0.7, peak);
    n.start(t);
    n.stop(t + dur + 0.02);
  }

  pickup() {
    this._tone(660, 0.12, 'triangle', 0.18);
    this._tone(990, 0.18, 'sine', 0.12, 8);
  }

  shrine() {
    this._tone(220, 0.4, 'sine', 0.2);
    this._tone(330, 0.5, 'triangle', 0.14);
    this._tone(440, 0.6, 'sine', 0.1);
  }

  hit() {
    this._noise(0.18, 0.2, 400);
    this._tone(90, 0.2, 'sawtooth', 0.12);
  }

  lanternOn() {
    this._tone(392, 0.15, 'sine', 0.12);
    this._tone(523, 0.22, 'triangle', 0.08);
  }

  lanternOff() {
    this._tone(300, 0.12, 'sine', 0.08);
  }

  win() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this._tone(f, 0.35, 'triangle', 0.16), i * 120);
    });
  }

  lose() {
    this._tone(180, 0.4, 'sawtooth', 0.14);
    this._tone(120, 0.5, 'sine', 0.12);
  }

  step() {
    this._noise(0.04, 0.04, 800);
  }

  ui() {
    this._tone(520, 0.06, 'sine', 0.08);
  }
}
