// ============================================================
// audio.js - Procedural audio system using Web Audio API
// ============================================================
VF.Audio = {
    ctx: null,
    masterGain: null,
    sfxGain: null,
    musicGain: null,
    enabled: true,
    sfxVolume: 0.5,
    musicVolume: 0.3,
    _musicOsc: null,
    _musicPlaying: false,
    _lastPlayTime: {},
    _minInterval: 0.05, // minimum time between same sound

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);

            console.log('[Audio] Initialized');
        } catch (e) {
            console.warn('[Audio] Web Audio not available');
            this.enabled = false;
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play(soundName) {
        if (!this.enabled || !this.ctx) return;

        // Throttle same sounds
        const now = this.ctx.currentTime;
        if (this._lastPlayTime[soundName] && now - this._lastPlayTime[soundName] < this._minInterval) return;
        this._lastPlayTime[soundName] = now;

        switch (soundName) {
            case 'laser': this._playLaser(); break;
            case 'plasma': this._playPlasma(); break;
            case 'railgun': this._playRailgun(); break;
            case 'scatter': this._playScatter(); break;
            case 'missile': this._playMissile(); break;
            case 'enemy_shot': this._playEnemyShot(); break;
            case 'explosion_small': this._playExplosion(0.3, 0.2); break;
            case 'explosion_large': this._playExplosion(0.6, 0.5); break;
            case 'hit': this._playHit(); break;
            case 'pickup': this._playPickup(); break;
            case 'upgrade': this._playUpgrade(); break;
            case 'warp': this._playWarp(); break;
            case 'shield_down': this._playShieldDown(); break;
            case 'menu_click': this._playMenuClick(); break;
            case 'alert': this._playAlert(); break;
        }
    },

    _createOsc(type, freq, duration, volume = 0.3) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
        return { osc, gain };
    },

    _createNoise(duration, volume = 0.1) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        source.connect(gain);
        gain.connect(this.sfxGain);
        source.start();
        return { source, gain };
    },

    _playLaser() {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.1);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.1);
    },

    _playPlasma() {
        const t = this.ctx.currentTime;
        this._createOsc('sawtooth', 200, 0.2, 0.15);
        this._createOsc('sine', 150, 0.25, 0.1);
        this._createNoise(0.1, 0.05);
    },

    _playRailgun() {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(2000, t + 0.05);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.3);
        this._createNoise(0.15, 0.1);
    },

    _playScatter() {
        for (let i = 0; i < 3; i++) {
            const delay = i * 0.02;
            setTimeout(() => {
                this._createOsc('square', 600 + Math.random() * 400, 0.08, 0.08);
            }, delay * 1000);
        }
    },

    _playMissile() {
        const t = this.ctx.currentTime;
        this._createOsc('sawtooth', 80, 0.4, 0.1);
        this._createNoise(0.3, 0.08);
    },

    _playEnemyShot() {
        this._createOsc('square', 300 + Math.random() * 200, 0.1, 0.08);
    },

    _playExplosion(volume, duration) {
        const t = this.ctx.currentTime;
        this._createNoise(duration, volume * 0.5);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + duration);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + duration);
    },

    _playHit() {
        this._createNoise(0.05, 0.1);
        this._createOsc('square', 200, 0.05, 0.08);
    },

    _playPickup() {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.15);
    },

    _playUpgrade() {
        const t = this.ctx.currentTime;
        [400, 500, 600, 800].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.12, t + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.15);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 0.15);
        });
    },

    _playWarp() {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(50, t);
        osc.frequency.exponentialRampToValueAtTime(2000, t + 0.8);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 1);
        this._createNoise(0.8, 0.1);
    },

    _playShieldDown() {
        this._createOsc('sine', 600, 0.3, 0.15);
        this._createOsc('sine', 400, 0.3, 0.1);
    },

    _playMenuClick() {
        this._createOsc('sine', 600, 0.05, 0.1);
    },

    _playAlert() {
        const t = this.ctx.currentTime;
        [0, 0.2, 0.4].forEach(delay => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.1, t + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + delay);
            osc.stop(t + delay + 0.1);
        });
    },

    // Ambient space music - generative
    startMusic() {
        if (!this.enabled || !this.ctx || this._musicPlaying) return;
        this._musicPlaying = true;
        this._playAmbientChord();
    },

    _playAmbientChord() {
        if (!this._musicPlaying) return;
        const t = this.ctx.currentTime;
        const chords = [
            [65.41, 82.41, 98.00],  // C2, E2, G2
            [73.42, 92.50, 110.0],  // D2, F#2, A2
            [55.00, 69.30, 82.41],  // A1, C#2, E2
            [61.74, 77.78, 92.50],  // B1, D#2, F#2
        ];
        const chord = VF.Utils.randPick(chords);
        const duration = VF.Utils.rand(4, 8);

        for (const freq of chord) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.04, t + 1);
            gain.gain.linearRampToValueAtTime(0.04, t + duration - 1);
            gain.gain.linearRampToValueAtTime(0, t + duration);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(t);
            osc.stop(t + duration);
        }

        // Schedule next chord
        setTimeout(() => this._playAmbientChord(), duration * 1000 * 0.8);
    },

    stopMusic() {
        this._musicPlaying = false;
    },

    setSFXVolume(v) {
        this.sfxVolume = v;
        if (this.sfxGain) this.sfxGain.gain.value = v;
    },

    setMusicVolume(v) {
        this.musicVolume = v;
        if (this.musicGain) this.musicGain.gain.value = v;
    }
};
