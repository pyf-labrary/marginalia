// Game Audio - Simple Web Audio API sound effects
window.GameAudio = {
  ctx: null,
  enabled: true,

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  _ok() {
    return this.ctx && this.enabled;
  },

  _osc(freq, type, duration, gainVal) {
    if (!this._ok()) return null;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gainVal || 0.3, t);
    g.gain.linearRampToValueAtTime(0, t + duration);
    g.connect(this.ctx.destination);
    const o = this.ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.connect(g);
    o.start(t);
    o.stop(t + duration);
    return { o, g, t };
  },

  _noise(duration, gainVal) {
    if (!this._ok()) return null;
    const t = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gainVal || 0.2, t);
    g.gain.linearRampToValueAtTime(0, t + duration);
    g.connect(this.ctx.destination);
    src.connect(g);
    src.start(t);
    src.stop(t + duration);
    return { src, g, t };
  },

  // Short 800Hz blip, 50ms
  playClick() {
    this._osc(800, 'square', 0.05, 0.15);
  },

  // Low thud 100Hz + noise, 200ms
  playStamp() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.linearRampToValueAtTime(0, t + 0.2);
    g.connect(this.ctx.destination);
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(100, t);
    o.frequency.linearRampToValueAtTime(50, t + 0.2);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.2);
    this._noise(0.15, 0.15);
  },

  // Ascending two-tone chime 523Hz -> 659Hz, 200ms
  playCorrect() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.linearRampToValueAtTime(0, t + 0.2);
    g.connect(this.ctx.destination);
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(523, t);
    o.frequency.setValueAtTime(659, t + 0.1);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.2);
  },

  // Descending buzz 300Hz -> 100Hz, 300ms
  playWrong() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.linearRampToValueAtTime(0, t + 0.3);
    g.connect(this.ctx.destination);
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, t);
    o.frequency.linearRampToValueAtTime(100, t + 0.3);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.3);
  },

  // Alternating 440/480Hz ring, 500ms
  playPhone() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.connect(this.ctx.destination);
    const o1 = this.ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(440, t);
    o1.connect(g);
    const o2 = this.ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(480, t);
    o2.connect(g);
    // Modulate gain for ring effect
    for (let i = 0; i < 5; i++) {
      g.gain.setValueAtTime(0.2, t + i * 0.1);
      g.gain.setValueAtTime(0.05, t + i * 0.1 + 0.05);
    }
    g.gain.linearRampToValueAtTime(0, t + 0.5);
    o1.start(t);
    o1.stop(t + 0.5);
    o2.start(t);
    o2.stop(t + 0.5);
  },

  // Low sweep 200 -> 80Hz, 300ms
  playDoor() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.linearRampToValueAtTime(0, t + 0.3);
    g.connect(this.ctx.destination);
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(200, t);
    o.frequency.linearRampToValueAtTime(80, t + 0.3);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.3);
  },

  // White noise burst, 100ms
  playPaper() {
    this._noise(0.1, 0.2);
  },

  // Very short 1000Hz click, 20ms
  playTick() {
    this._osc(1000, 'square', 0.02, 0.1);
  },

  // Ascending tone based on combo level
  playCombo(n) {
    if (!this._ok()) return;
    const baseFreq = 400 + Math.min(n, 10) * 60;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.linearRampToValueAtTime(0, t + 0.15);
    g.connect(this.ctx.destination);
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(baseFreq, t);
    o.frequency.linearRampToValueAtTime(baseFreq * 1.3, t + 0.15);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.15);
  },

  // Happy ascending arpeggio
  playLevelComplete() {
    if (!this._ok()) return;
    const notes = [523, 659, 784, 1047];
    const t = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      const g = this.ctx.createGain();
      const start = t + i * 0.12;
      g.gain.setValueAtTime(0.2, start);
      g.gain.linearRampToValueAtTime(0, start + 0.15);
      g.connect(this.ctx.destination);
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, start);
      o.connect(g);
      o.start(start);
      o.stop(start + 0.15);
    });
  },

  // Sad descending tones
  playGameOver() {
    if (!this._ok()) return;
    const notes = [440, 370, 311, 261];
    const t = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      const g = this.ctx.createGain();
      const start = t + i * 0.25;
      g.gain.setValueAtTime(0.25, start);
      g.gain.linearRampToValueAtTime(0, start + 0.3);
      g.connect(this.ctx.destination);
      const o = this.ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, start);
      o.connect(g);
      o.start(start);
      o.stop(start + 0.3);
    });
  }
};
