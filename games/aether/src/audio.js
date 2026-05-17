// Generative ambient audio for AETHER.
// Lush evolving drone in C minor pentatonic, with chimes and bell tones
// triggered by gameplay events. No external samples — pure Web Audio.

export class AetherAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.padGain = null;
    this.reverb = null;
    this.droneOscs = [];
    this.intensity = 0;       // 0..1 — grows with revivals
    this.targetIntensity = 0;
    this.started = false;
  }

  async start() {
    if (this.started) return;
    this.started = true;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.ctx = ctx;

    // Master bus
    this.master = ctx.createGain();
    this.master.gain.value = 0.0;
    this.master.connect(ctx.destination);

    // Synthetic reverb via impulse response (procedurally generated)
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._makeIR(3.4, 2.6);
    const revGain = ctx.createGain();
    revGain.gain.value = 0.6;
    this.reverb.connect(revGain).connect(this.master);

    // Pad bus
    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.0;
    const padFilt = ctx.createBiquadFilter();
    padFilt.type = 'lowpass';
    padFilt.frequency.value = 900;
    padFilt.Q.value = 0.7;
    this.padGain.connect(padFilt);
    padFilt.connect(this.master);
    padFilt.connect(this.reverb);
    this._padFilter = padFilt;

    // Layered drone — C2, G2, Eb3, Bb3 (C minor 7 vibe)
    const droneFreqs = [65.41, 98.00, 155.56, 233.08];
    for (const f of droneFreqs) {
      const o1 = ctx.createOscillator(); o1.type = 'sine';     o1.frequency.value = f;
      const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f * 1.005;
      const o3 = ctx.createOscillator(); o3.type = 'sawtooth'; o3.frequency.value = f * 0.5;

      const g = ctx.createGain(); g.gain.value = 0.12;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06 + Math.random() * 0.05;
      const lfoG = ctx.createGain(); lfoG.gain.value = 0.05;
      lfo.connect(lfoG).connect(g.gain);
      lfo.start();

      [o1, o2, o3].forEach(o => {
        const og = ctx.createGain();
        og.gain.value = o.type === 'sawtooth' ? 0.18 : 0.5;
        o.connect(og).connect(g);
        o.start();
      });
      g.connect(this.padGain);
      this.droneOscs.push({ g, base: 0.12 });
    }

    // Smooth fade-in of master
    const now = ctx.currentTime;
    this.master.gain.setValueAtTime(0.0, now);
    this.master.gain.linearRampToValueAtTime(0.55, now + 2.5);
    this.padGain.gain.linearRampToValueAtTime(0.35, now + 4);

    // Continuous tick loop for evolving texture
    this._tick();
  }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  setIntensity(v) { this.targetIntensity = Math.max(0, Math.min(1, v)); }

  // Soft chime when collecting a starlight mote — pentatonic note.
  chime(pitchIndex = 0) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    // C minor pentatonic in two octaves
    const scale = [523.25, 622.25, 698.46, 783.99, 932.33, 1046.50, 1244.51, 1396.91];
    const f = scale[pitchIndex % scale.length] * (Math.random() < 0.3 ? 2 : 1);
    const now = ctx.currentTime;

    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    // crystal partial
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = f * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0;
    g2.gain.setValueAtTime(0, now);
    g2.gain.linearRampToValueAtTime(0.06, now + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

    o.connect(g).connect(this.master);
    g.connect(this.reverb);
    o2.connect(g2).connect(this.master);
    g2.connect(this.reverb);
    o.start(now); o.stop(now + 1.7);
    o2.start(now); o2.stop(now + 1.1);
  }

  // Deep bell when reviving a monolith — major chord overtones.
  bell(rootHz = 196.00) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const partials = [1, 2, 3, 4.2, 5.4, 6.8];
    const gains    = [1, 0.55, 0.38, 0.22, 0.15, 0.09];
    for (let i = 0; i < partials.length; i++) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = rootHz * partials[i];
      const g = ctx.createGain();
      const peak = 0.35 * gains[i];
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.015 + i*0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 4.5 + Math.random()*0.5);
      o.connect(g).connect(this.master);
      g.connect(this.reverb);
      o.start(now); o.stop(now + 5.0);
    }
  }

  // Big sustained chord at finale.
  finale() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    // C major-ish swell — relief after the C minor drone
    const freqs = [130.81, 196.00, 261.63, 329.63, 392.00, 523.25];
    for (const f of freqs) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.16, now + 1.5);
      g.gain.linearRampToValueAtTime(0.10, now + 8);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 16);
      const det = ctx.createOscillator();
      det.type = 'triangle';
      det.frequency.value = f * 2.005;
      const dg = ctx.createGain();
      dg.gain.setValueAtTime(0, now);
      dg.gain.linearRampToValueAtTime(0.05, now + 2);
      dg.gain.exponentialRampToValueAtTime(0.0001, now + 14);
      o.connect(g).connect(this.master);
      det.connect(dg).connect(this.master);
      g.connect(this.reverb);
      dg.connect(this.reverb);
      o.start(now); o.stop(now + 16);
      det.start(now); det.stop(now + 14);
    }
  }

  _tick = () => {
    if (!this.ctx) return;
    // Lerp intensity towards target — drives pad volume + filter
    this.intensity += (this.targetIntensity - this.intensity) * 0.04;
    if (this._padFilter) {
      const target = 700 + this.intensity * 2600;
      this._padFilter.frequency.value += (target - this._padFilter.frequency.value) * 0.05;
    }
    if (this.padGain) {
      const target = 0.35 + this.intensity * 0.35;
      this.padGain.gain.value += (target - this.padGain.gain.value) * 0.02;
    }
    setTimeout(this._tick, 100);
  };

  _makeIR(durationSec, decay) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * durationSec);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }
    return buf;
  }
}
