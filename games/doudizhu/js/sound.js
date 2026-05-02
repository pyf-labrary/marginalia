/**
 * sound.js - 增强音效系统
 * 包含合成音效库、语音提示、背景音乐生成器
 */

class SynthEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.compressor = null;
        this._initialized = false;
        this._volume = 0.5;
    }

    init() {
        if (this._initialized) return true;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -24;
            this.compressor.knee.value = 30;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0.003;
            this.compressor.release.value = 0.25;

            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.audioContext.destination);
            this.masterGain.gain.value = this._volume;
            this._initialized = true;
            return true;
        } catch (e) {
            console.warn('AudioContext not supported');
            return false;
        }
    }

    get currentTime() {
        return this.audioContext ? this.audioContext.currentTime : 0;
    }

    setVolume(vol) {
        this._volume = clamp(vol, 0, 1);
        if (this.masterGain) {
            this.masterGain.gain.value = this._volume;
        }
    }

    createOscillator(type, freq, startTime, duration) {
        if (!this.audioContext) return null;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(this.masterGain);
        return { osc, gain, startTime, duration };
    }

    playNote(type, freq, duration, volume = 0.1, startDelay = 0) {
        if (!this._initialized) return;
        const now = this.currentTime + startDelay;
        const node = this.createOscillator(type, freq, now, duration);
        if (!node) return;

        node.gain.gain.setValueAtTime(volume, now);
        node.gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        node.osc.start(now);
        node.osc.stop(now + duration);
    }

    playChord(type, frequencies, duration, volume = 0.08, startDelay = 0) {
        for (const freq of frequencies) {
            this.playNote(type, freq, duration, volume / frequencies.length, startDelay);
        }
    }

    playArpeggio(type, frequencies, noteDuration, interval, volume = 0.1) {
        frequencies.forEach((freq, i) => {
            this.playNote(type, freq, noteDuration, volume, i * interval);
        });
    }

    playNoise(duration, volume = 0.05, startDelay = 0) {
        if (!this._initialized || !this.audioContext) return;
        const now = this.currentTime + startDelay;
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + duration);
    }

    playPercussion(freq, duration, volume = 0.1, startDelay = 0) {
        if (!this._initialized || !this.audioContext) return;
        const now = this.currentTime + startDelay;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);

        this.playNoise(duration * 0.3, volume * 0.3, startDelay);
    }

    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this._initialized = false;
    }
}

class EnhancedSoundManager {
    constructor() {
        this.synth = new SynthEngine();
        this.enabled = true;
        this.musicEnabled = false;
        this._soundEffects = {};
        this._initSoundEffects();
    }

    init() {
        return this.synth.init();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setVolume(vol) {
        this.synth.setVolume(vol);
    }

    _initSoundEffects() {
        this._soundEffects = {
            cardSelect: () => this._playCardSelect(),
            cardDeselect: () => this._playCardDeselect(),
            cardDeal: () => this._playCardDeal(),
            cardPlay: () => this._playCardPlay(),
            cardPass: () => this._playCardPass(),
            bomb: () => this._playBomb(),
            rocket: () => this._playRocket(),
            straight: () => this._playStraight(),
            plane: () => this._playPlane(),
            pair: () => this._playPair(),
            triple: () => this._playTriple(),
            bidCall: () => this._playBidCall(),
            bidPass: () => this._playBidPass(),
            win: () => this._playWin(),
            lose: () => this._playLose(),
            spring: () => this._playSpring(),
            click: () => this._playClick(),
            error: () => this._playError(),
            warning: () => this._playWarning(),
            notification: () => this._playNotification(),
            turnStart: () => this._playTurnStart(),
            gameStart: () => this._playGameStart(),
            countdown: () => this._playCountdown(),
            lastCard: () => this._playLastCard(),
            lastTwoCards: () => this._playLastTwoCards()
        };
    }

    play(effectName) {
        if (!this.enabled) return;
        const effect = this._soundEffects[effectName];
        if (effect) {
            try { effect(); } catch (e) { /* silent */ }
        }
    }

    playForCardType(cardType) {
        if (!this.enabled) return;
        switch (cardType) {
            case CARD_TYPE.SINGLE:
                this.play('cardPlay');
                break;
            case CARD_TYPE.PAIR:
                this.play('pair');
                break;
            case CARD_TYPE.TRIPLE:
            case CARD_TYPE.TRIPLE_WITH_SINGLE:
            case CARD_TYPE.TRIPLE_WITH_PAIR:
                this.play('triple');
                break;
            case CARD_TYPE.STRAIGHT:
                this.play('straight');
                break;
            case CARD_TYPE.STRAIGHT_PAIR:
                this.play('straight');
                break;
            case CARD_TYPE.PLANE:
            case CARD_TYPE.PLANE_WITH_SINGLES:
            case CARD_TYPE.PLANE_WITH_PAIRS:
                this.play('plane');
                break;
            case CARD_TYPE.BOMB:
                this.play('bomb');
                break;
            case CARD_TYPE.ROCKET:
                this.play('rocket');
                break;
            default:
                this.play('cardPlay');
        }
    }

    _playClick() {
        this.synth.playNote('sine', 880, 0.08, 0.06);
    }

    _playCardSelect() {
        this.synth.playNote('sine', 660, 0.1, 0.08);
        this.synth.playNote('sine', 880, 0.08, 0.05, 0.05);
    }

    _playCardDeselect() {
        this.synth.playNote('sine', 880, 0.08, 0.06);
        this.synth.playNote('sine', 660, 0.1, 0.04, 0.04);
    }

    _playCardDeal() {
        this.synth.playNote('triangle', 400 + Math.random() * 200, 0.06, 0.04);
        this.synth.playNoise(0.03, 0.02);
    }

    _playCardPlay() {
        this.synth.playNote('sine', 523, 0.12, 0.1);
        this.synth.playNoise(0.05, 0.03);
    }

    _playCardPass() {
        this.synth.playNote('triangle', 330, 0.2, 0.06);
        this.synth.playNote('triangle', 262, 0.15, 0.05, 0.1);
    }

    _playPair() {
        this.synth.playNote('sine', 523, 0.12, 0.1);
        this.synth.playNote('sine', 659, 0.12, 0.08, 0.06);
    }

    _playTriple() {
        this.synth.playNote('sine', 523, 0.12, 0.1);
        this.synth.playNote('sine', 659, 0.1, 0.08, 0.06);
        this.synth.playNote('sine', 784, 0.1, 0.08, 0.12);
    }

    _playStraight() {
        const notes = [523, 587, 659, 698, 784];
        this.synth.playArpeggio('sine', notes, 0.1, 0.06, 0.08);
    }

    _playPlane() {
        const notes = [523, 659, 784, 1047, 1319];
        this.synth.playArpeggio('sine', notes, 0.12, 0.08, 0.1);
        this.synth.playNoise(0.1, 0.02, 0.3);
    }

    _playBomb() {
        this.synth.playPercussion(200, 0.4, 0.15);
        this.synth.playPercussion(100, 0.5, 0.12, 0.1);
        this.synth.playNoise(0.3, 0.08, 0.05);

        this.synth.playNote('sawtooth', 80, 0.5, 0.1);
        this.synth.playNote('sawtooth', 60, 0.4, 0.08, 0.15);

        const rumbleNotes = [50, 60, 55, 65, 45];
        rumbleNotes.forEach((freq, i) => {
            this.synth.playNote('sawtooth', freq, 0.15, 0.05, 0.2 + i * 0.06);
        });
    }

    _playRocket() {
        this.synth.playNote('sawtooth', 200, 0.8, 0.1);

        for (let i = 0; i < 8; i++) {
            const freq = 200 + i * 100;
            this.synth.playNote('sawtooth', freq, 0.15, 0.06, i * 0.08);
        }

        this.synth.playNoise(0.5, 0.1, 0.2);
        this.synth.playPercussion(300, 0.3, 0.15, 0.5);
        this.synth.playPercussion(150, 0.4, 0.12, 0.6);

        this.synth.playChord('sine', [1047, 1319, 1568], 0.5, 0.1, 0.7);
    }

    _playBidCall() {
        this.synth.playNote('sine', 660, 0.15, 0.1);
        this.synth.playNote('sine', 880, 0.15, 0.1, 0.08);
    }

    _playBidPass() {
        this.synth.playNote('triangle', 440, 0.15, 0.06);
        this.synth.playNote('triangle', 349, 0.2, 0.05, 0.08);
    }

    _playWin() {
        const melody = [523, 659, 784, 1047];
        this.synth.playArpeggio('sine', melody, 0.25, 0.12, 0.12);

        this.synth.playChord('sine', [1047, 1319, 1568], 0.6, 0.1, 0.6);

        const celebration = [1568, 1760, 2093, 1760, 1568, 2093];
        celebration.forEach((freq, i) => {
            this.synth.playNote('sine', freq, 0.15, 0.06, 0.9 + i * 0.1);
        });
    }

    _playLose() {
        const melody = [440, 392, 349, 262];
        this.synth.playArpeggio('triangle', melody, 0.3, 0.15, 0.08);

        this.synth.playChord('triangle', [262, 311, 392], 0.8, 0.06, 0.6);
    }

    _playSpring() {
        this._playWin();
        setTimeout(() => {
            const fanfare = [1047, 1319, 1568, 2093, 1568, 2093];
            this.synth.playArpeggio('sine', fanfare, 0.2, 0.1, 0.1);
        }, 1200);
    }

    _playError() {
        this.synth.playNote('square', 200, 0.15, 0.08);
        this.synth.playNote('square', 180, 0.15, 0.06, 0.08);
    }

    _playWarning() {
        this.synth.playNote('sine', 880, 0.1, 0.08);
        this.synth.playNote('sine', 880, 0.1, 0.08, 0.15);
        this.synth.playNote('sine', 880, 0.1, 0.08, 0.3);
    }

    _playNotification() {
        this.synth.playNote('sine', 784, 0.15, 0.08);
        this.synth.playNote('sine', 988, 0.2, 0.08, 0.08);
    }

    _playTurnStart() {
        this.synth.playNote('sine', 523, 0.1, 0.06);
    }

    _playGameStart() {
        const notes = [262, 330, 392, 523];
        this.synth.playArpeggio('sine', notes, 0.2, 0.1, 0.1);
        this.synth.playPercussion(200, 0.2, 0.08, 0.4);
    }

    _playCountdown() {
        this.synth.playNote('sine', 1000, 0.08, 0.1);
    }

    _playLastCard() {
        this.synth.playNote('sine', 1200, 0.15, 0.1);
        this.synth.playNote('sine', 1400, 0.15, 0.1, 0.1);
        this.synth.playNote('sine', 1600, 0.2, 0.1, 0.2);
    }

    _playLastTwoCards() {
        this.synth.playNote('sine', 1000, 0.12, 0.08);
        this.synth.playNote('sine', 1200, 0.15, 0.08, 0.08);
    }

    destroy() {
        this.synth.destroy();
    }
}

class BGMGenerator {
    constructor(synthEngine) {
        this.synth = synthEngine;
        this._playing = false;
        this._intervalId = null;
        this._beatIndex = 0;
        this._bpm = 120;
    }

    get isPlaying() {
        return this._playing;
    }

    start(style = 'default') {
        if (this._playing) this.stop();
        this._playing = true;
        this._beatIndex = 0;

        const patterns = this._getPattern(style);
        const beatInterval = 60000 / this._bpm;

        this._intervalId = setInterval(() => {
            if (!this._playing) return;
            this._playBeat(patterns);
            this._beatIndex = (this._beatIndex + 1) % patterns.length;
        }, beatInterval);
    }

    stop() {
        this._playing = false;
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    setBPM(bpm) {
        this._bpm = clamp(bpm, 60, 200);
        if (this._playing) {
            this.stop();
            this.start();
        }
    }

    _playBeat(patterns) {
        const beat = patterns[this._beatIndex];
        if (!beat) return;

        if (beat.bass) {
            this.synth.playNote('sine', beat.bass, 0.15, 0.03);
        }
        if (beat.melody) {
            this.synth.playNote('triangle', beat.melody, 0.12, 0.02, 0.02);
        }
        if (beat.perc) {
            this.synth.playPercussion(beat.perc, 0.08, 0.02);
        }
    }

    _getPattern(style) {
        const patterns = {
            default: [
                { bass: 131, perc: 200 },
                { melody: 330 },
                { bass: 165, perc: 150 },
                { melody: 392 },
                { bass: 131, perc: 200 },
                { melody: 440 },
                { bass: 175, perc: 150 },
                { melody: 392 },
            ],
            tense: [
                { bass: 110, perc: 250 },
                { perc: 150 },
                { bass: 131, melody: 440, perc: 200 },
                { perc: 150 },
                { bass: 110, perc: 250 },
                { melody: 523, perc: 150 },
                { bass: 147, perc: 200 },
                { melody: 440, perc: 150 },
            ],
            victory: [
                { bass: 262, melody: 523, perc: 200 },
                { melody: 659 },
                { bass: 330, melody: 784, perc: 200 },
                { melody: 659 },
                { bass: 392, melody: 784, perc: 200 },
                { melody: 1047 },
                { bass: 330, melody: 784, perc: 200 },
                { melody: 659 },
            ]
        };
        return patterns[style] || patterns.default;
    }
}
