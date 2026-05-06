/* ========================================
   Super Mario - Audio System
   Web Audio API based sound engine
   ======================================== */

const Audio = (() => {
    let audioCtx = null;
    let masterGain = null;
    let sfxGain = null;
    let musicGain = null;
    let sfxEnabled = true;
    let musicEnabled = true;
    let masterVolume = 1.0;
    let currentMusic = null;
    let musicPlaying = false;

    const soundDefs = {
        jump: { type: 'square', notes: [{ freq: 400, dur: 0.05 }, { freq: 500, dur: 0.05 }, { freq: 600, dur: 0.1 }] },
        jumpBig: { type: 'square', notes: [{ freq: 350, dur: 0.06 }, { freq: 450, dur: 0.06 }, { freq: 580, dur: 0.12 }] },
        coin: { type: 'square', notes: [{ freq: 988, dur: 0.05 }, { freq: 1319, dur: 0.2 }] },
        stomp: { type: 'square', notes: [{ freq: 400, dur: 0.03 }, { freq: 500, dur: 0.03 }, { freq: 300, dur: 0.05 }] },
        bump: { type: 'triangle', notes: [{ freq: 200, dur: 0.05 }, { freq: 150, dur: 0.08 }] },
        breakBlock: { type: 'noise', dur: 0.15, filterFreq: 800 },
        powerUp: { type: 'square', notes: [
            { freq: 523, dur: 0.06 }, { freq: 659, dur: 0.06 }, { freq: 784, dur: 0.06 },
            { freq: 1047, dur: 0.06 }, { freq: 1319, dur: 0.06 }, { freq: 1568, dur: 0.12 }
        ]},
        powerDown: { type: 'square', notes: [
            { freq: 600, dur: 0.08 }, { freq: 500, dur: 0.08 }, { freq: 400, dur: 0.08 }, { freq: 300, dur: 0.15 }
        ]},
        oneUp: { type: 'square', notes: [
            { freq: 330, dur: 0.06 }, { freq: 392, dur: 0.06 }, { freq: 523, dur: 0.06 },
            { freq: 659, dur: 0.06 }, { freq: 784, dur: 0.06 }, { freq: 1047, dur: 0.15 }
        ]},
        fireball: { type: 'square', notes: [{ freq: 800, dur: 0.02 }, { freq: 400, dur: 0.05 }, { freq: 200, dur: 0.03 }] },
        kick: { type: 'noise', dur: 0.1, filterFreq: 600 },
        die: { type: 'square', notes: [
            { freq: 494, dur: 0.15 }, { freq: 0, dur: 0.1 },
            { freq: 494, dur: 0.1 }, { freq: 466, dur: 0.1 },
            { freq: 440, dur: 0.1 }, { freq: 392, dur: 0.15 },
            { freq: 330, dur: 0.15 }, { freq: 262, dur: 0.3 }
        ]},
        gameOver: { type: 'square', notes: [
            { freq: 392, dur: 0.2 }, { freq: 0, dur: 0.1 },
            { freq: 330, dur: 0.2 }, { freq: 262, dur: 0.2 },
            { freq: 0, dur: 0.1 }, { freq: 196, dur: 0.4 }
        ]},
        flagpole: { type: 'square', notes: [
            { freq: 330, dur: 0.1 }, { freq: 392, dur: 0.1 }, { freq: 494, dur: 0.1 },
            { freq: 659, dur: 0.1 }, { freq: 784, dur: 0.1 }, { freq: 1047, dur: 0.3 }
        ]},
        pipe: { type: 'square', notes: [
            { freq: 200, dur: 0.05 }, { freq: 180, dur: 0.05 }, { freq: 160, dur: 0.05 },
            { freq: 140, dur: 0.1 }
        ]},
        pause: { type: 'square', notes: [{ freq: 500, dur: 0.1 }] },
        warning: { type: 'square', notes: [{ freq: 440, dur: 0.1 }, { freq: 0, dur: 0.05 }, { freq: 440, dur: 0.1 }] },
        swim: { type: 'triangle', notes: [{ freq: 300, dur: 0.05 }, { freq: 400, dur: 0.08 }] },
        vine: { type: 'square', notes: [
            { freq: 262, dur: 0.08 }, { freq: 294, dur: 0.08 }, { freq: 330, dur: 0.08 },
            { freq: 349, dur: 0.08 }, { freq: 392, dur: 0.08 }, { freq: 440, dur: 0.2 }
        ]},
        star: { type: 'square', notes: [
            { freq: 784, dur: 0.05 }, { freq: 880, dur: 0.05 }, { freq: 988, dur: 0.05 },
            { freq: 1047, dur: 0.1 }
        ]}
    };

    const musicTracks = {
        overworld: {
            tempo: 200,
            notes: [
                'E5','E5','0','E5','0','C5','E5','0','G5','0','0','0','G4','0','0','0',
                'C5','0','0','G4','0','0','E4','0','0','A4','0','B4','0','Bb4','A4','0',
                'G4','E5','G5','A5','0','F5','G5','0','E5','0','C5','D5','B4','0','0','0',
                'C5','0','0','G4','0','0','E4','0','0','A4','0','B4','0','Bb4','A4','0',
                'G4','E5','G5','A5','0','F5','G5','0','E5','0','C5','D5','B4','0','0','0'
            ]
        },
        underground: {
            tempo: 220,
            notes: [
                'C3','C4','A2','A3','Bb2','Bb3','0','0',
                'C3','C4','A2','A3','Bb2','Bb3','0','0',
                'F2','F3','D2','D3','Eb2','Eb3','0','0',
                'F2','F3','D2','D3','Eb2','Eb3','0','0'
            ]
        },
        castle: {
            tempo: 240,
            notes: [
                'A3','A3','A3','0','A3','0','A3','Bb3','A3','0','0','0',
                'A3','A3','A3','0','A3','0','A3','Bb3','A3','0','0','0',
                'Bb3','Bb3','Bb3','0','Bb3','0','Bb3','C4','Bb3','0','0','0',
                'A3','A3','A3','0','A3','0','A3','Bb3','A3','0','0','0'
            ]
        },
        starPower: {
            tempo: 140,
            notes: [
                'C5','D5','E5','C5','D5','E5','F5','G5',
                'C5','D5','E5','C5','D5','E5','F5','G5',
                'A5','G5','F5','E5','D5','C5','D5','E5',
                'A5','G5','F5','E5','D5','C5','B4','C5'
            ]
        },
        victory: {
            tempo: 160,
            notes: [
                'C5','E5','G5','C6','0','G5','0','C6','0','0',
                'A4','C5','E5','A5','0','E5','0','A5','0','0',
                'Bb4','D5','F5','Bb5','0','F5','0','Bb5','0','0',
                'C5','E5','G5','C6','0','E5','G5','C6','E5','G5',
                'C6','0','0','G5','A5','B5','C6','0','0','0',
                'E5','0','E5','0','F5','G5','0','0',
                'C5','0','C5','0','D5','E5','0','0',
                'G5','A5','G5','F5','E5','D5','C5','0',
                'E5','F5','G5','A5','G5','F5','E5','0',
                'C6','0','G5','0','E5','0','C5','0','0','0','0','0'
            ]
        },
        night: {
            tempo: 180,
            notes: [
                'E4','0','G4','0','B4','0','E5','0','D5','0','B4','0','G4','0','0','0',
                'E4','0','A4','0','C5','0','E5','0','D5','0','C5','0','A4','0','0','0',
                'F4','0','A4','0','C5','0','F5','0','E5','0','C5','0','A4','0','0','0',
                'E4','0','G4','0','B4','0','E5','0','D5','0','B4','0','G4','0','0','0'
            ]
        }
    };

    const noteFreqs = {
        'C2': 65.41, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31,
        'G2': 98.00, 'A2': 110.0, 'Bb2': 116.54, 'B2': 123.47,
        'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61,
        'G3': 196.00, 'A3': 220.0, 'Bb3': 233.08, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.0, 'Bb4': 466.16, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46,
        'G5': 783.99, 'A5': 880.0, 'Bb5': 932.33, 'B5': 987.77,
        'C6': 1046.50
    };

    function ensureContext() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                masterGain = audioCtx.createGain();
                sfxGain = audioCtx.createGain();
                musicGain = audioCtx.createGain();
                sfxGain.connect(masterGain);
                musicGain.connect(masterGain);
                masterGain.connect(audioCtx.destination);
                masterGain.gain.value = masterVolume;
                sfxGain.gain.value = 1.0;
                musicGain.gain.value = 0.4;
            } catch (e) {
                return false;
            }
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx.state === 'running';
    }

    function init() {
        document.addEventListener('click', ensureContext, { once: false });
        document.addEventListener('keydown', ensureContext, { once: false });
        document.addEventListener('touchstart', ensureContext, { once: false });
    }

    function play(soundName) {
        if (!sfxEnabled) return;
        ensureContext();
        if (!audioCtx || audioCtx.state !== 'running') return;

        const def = soundDefs[soundName];
        if (!def) return;

        if (def.type === 'noise') {
            playNoise(def);
        } else {
            playSynthNotes(def);
        }
    }

    function playSynthNotes(def) {
        let time = audioCtx.currentTime;

        for (const note of def.notes) {
            if (note.freq === 0) {
                time += note.dur;
                continue;
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = def.type || 'square';
            osc.frequency.setValueAtTime(note.freq, time);

            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + note.dur);

            osc.connect(gain);
            gain.connect(sfxGain);

            osc.start(time);
            osc.stop(time + note.dur + 0.01);

            time += note.dur;
        }
    }

    function playNoise(def) {
        const bufferSize = audioCtx.sampleRate * def.dur;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = def.filterFreq || 1000;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + def.dur);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);

        source.start();
        source.stop(audioCtx.currentTime + def.dur + 0.01);
    }

    function playMusic(trackName) {
        if (!musicEnabled) return;
        ensureContext();
        if (!audioCtx) return;
        stopMusic();

        const track = musicTracks[trackName];
        if (!track) return;

        currentMusic = {
            track,
            name: trackName,
            noteIndex: 0,
            playing: true,
            intervalId: null
        };

        const beatDuration = 60 / track.tempo;

        currentMusic.intervalId = setInterval(() => {
            if (!currentMusic || !currentMusic.playing) return;

            const noteName = track.notes[currentMusic.noteIndex];
            if (noteName && noteName !== '0') {
                playMusicNote(noteName, beatDuration * 0.9);
            }

            currentMusic.noteIndex = (currentMusic.noteIndex + 1) % track.notes.length;
        }, beatDuration * 1000);

        musicPlaying = true;
    }

    function playMusicNote(noteName, duration) {
        if (!audioCtx || audioCtx.state !== 'running' || !musicEnabled) return;

        const freq = noteFreqs[noteName];
        if (!freq) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(musicGain);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration + 0.01);
    }

    function stopMusic() {
        if (currentMusic) {
            if (currentMusic.intervalId) {
                clearInterval(currentMusic.intervalId);
            }
            currentMusic.playing = false;
            currentMusic = null;
        }
        musicPlaying = false;
    }

    function pauseMusic() {
        if (currentMusic) {
            currentMusic.playing = false;
            if (currentMusic.intervalId) {
                clearInterval(currentMusic.intervalId);
                currentMusic.intervalId = null;
            }
        }
    }

    function resumeMusic() {
        if (currentMusic && currentMusic.track) {
            const track = currentMusic.track;
            const beatDuration = 60 / track.tempo;
            currentMusic.playing = true;

            currentMusic.intervalId = setInterval(() => {
                if (!currentMusic || !currentMusic.playing) return;
                const noteName = track.notes[currentMusic.noteIndex];
                if (noteName && noteName !== '0') {
                    playMusicNote(noteName, beatDuration * 0.9);
                }
                currentMusic.noteIndex = (currentMusic.noteIndex + 1) % track.notes.length;
            }, beatDuration * 1000);
        }
    }

    function setSfxEnabled(enabled) {
        sfxEnabled = enabled;
    }

    function setMusicEnabled(enabled) {
        musicEnabled = enabled;
        if (!enabled) {
            stopMusic();
        }
    }

    function setMasterVolume(vol) {
        masterVolume = Math.max(0, Math.min(1, vol));
        if (masterGain) masterGain.gain.value = masterVolume;
    }

    function setSfxVolume(vol) {
        if (sfxGain) sfxGain.gain.value = Math.max(0, Math.min(1, vol));
    }

    function setMusicVolume(vol) {
        if (musicGain) musicGain.gain.value = Math.max(0, Math.min(1, vol));
    }

    function isSfxEnabled() { return sfxEnabled; }
    function isMusicEnabled() { return musicEnabled; }
    function isMusicPlaying() { return musicPlaying; }
    function getCurrentTrack() { return currentMusic ? currentMusic.name : null; }

    return {
        init, play, playMusic, stopMusic, pauseMusic, resumeMusic,
        setSfxEnabled, setMusicEnabled, isSfxEnabled, isMusicEnabled,
        setMasterVolume, setSfxVolume, setMusicVolume,
        isMusicPlaying, getCurrentTrack
    };
})();
