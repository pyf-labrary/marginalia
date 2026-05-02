/**
 * replay.js - 游戏回放系统
 */

class ReplayRecorder {
    constructor() {
        this.frames = [];
        this.metadata = null;
        this.isRecording = false;
        this.startTime = 0;
    }

    start(gameInfo) {
        this.frames = [];
        this.isRecording = true;
        this.startTime = Date.now();
        this.metadata = {
            startTime: this.startTime,
            players: gameInfo.players || [],
            difficulty: gameInfo.difficulty || 'normal',
            version: '2.0.0'
        };
        this._addFrame('game_start', { info: gameInfo });
    }

    stop() {
        if (!this.isRecording) return null;
        this.isRecording = false;
        this.metadata.endTime = Date.now();
        this.metadata.duration = this.metadata.endTime - this.metadata.startTime;
        this.metadata.frameCount = this.frames.length;
        return this.getReplayData();
    }

    recordDeal(hands, landlordCards) {
        this._addFrame('deal', {
            hands: hands.map(h => h.map(c => ({ rank: c.rank, suit: c.suit }))),
            landlordCards: landlordCards.map(c => ({ rank: c.rank, suit: c.suit }))
        });
    }

    recordBid(playerIndex, bid) {
        this._addFrame('bid', { player: playerIndex, bid });
    }

    recordPlay(playerIndex, cards, cardType) {
        this._addFrame('play', {
            player: playerIndex,
            cards: cards.map(c => ({ rank: c.rank, suit: c.suit })),
            type: cardType
        });
    }

    recordPass(playerIndex) {
        this._addFrame('pass', { player: playerIndex });
    }

    recordGameEnd(result) {
        this._addFrame('game_end', {
            winner: result.winner,
            score: result.score,
            spring: result.spring
        });
    }

    _addFrame(type, data) {
        if (!this.isRecording) return;
        this.frames.push({
            type,
            data,
            timestamp: Date.now() - this.startTime
        });
    }

    getReplayData() {
        return {
            metadata: this.metadata,
            frames: this.frames
        };
    }
}

class ReplayPlayer {
    constructor(renderer) {
        this.renderer = renderer;
        this.replay = null;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.speed = 1;
        this._timer = null;
        this._onFrameCallback = null;
        this._onEndCallback = null;
    }

    load(replayData) {
        this.replay = replayData;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.isPaused = false;
    }

    play(onFrame, onEnd) {
        if (!this.replay || this.replay.frames.length === 0) return;
        this._onFrameCallback = onFrame;
        this._onEndCallback = onEnd;
        this.isPlaying = true;
        this.isPaused = false;
        this._scheduleNextFrame();
    }

    pause() {
        this.isPaused = true;
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    resume() {
        if (!this.isPlaying) return;
        this.isPaused = false;
        this._scheduleNextFrame();
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    seekTo(frameIndex) {
        if (!this.replay) return;
        this.currentFrame = Math.max(0, Math.min(frameIndex, this.replay.frames.length - 1));
    }

    setSpeed(speed) {
        this.speed = Math.max(0.25, Math.min(4, speed));
    }

    _scheduleNextFrame() {
        if (!this.isPlaying || this.isPaused) return;
        if (this.currentFrame >= this.replay.frames.length) {
            this.isPlaying = false;
            if (this._onEndCallback) this._onEndCallback();
            return;
        }

        const frame = this.replay.frames[this.currentFrame];
        let delay;

        if (this.currentFrame === 0) {
            delay = 0;
        } else {
            const prevFrame = this.replay.frames[this.currentFrame - 1];
            delay = (frame.timestamp - prevFrame.timestamp) / this.speed;
            delay = Math.min(delay, 3000);
            delay = Math.max(delay, 100);
        }

        this._timer = setTimeout(() => {
            this._processFrame(frame);
            this.currentFrame++;
            this._scheduleNextFrame();
        }, delay);
    }

    _processFrame(frame) {
        if (this._onFrameCallback) {
            this._onFrameCallback(frame);
        }
    }

    get progress() {
        if (!this.replay || this.replay.frames.length === 0) return 0;
        return this.currentFrame / this.replay.frames.length;
    }

    get totalFrames() {
        return this.replay ? this.replay.frames.length : 0;
    }
}

class ReplayStorage {
    constructor(maxReplays = 20) {
        this.maxReplays = maxReplays;
        this.replays = [];
        this._load();
    }

    save(replayData, label) {
        const entry = {
            id: 'replay_' + Date.now(),
            label: label || this._generateLabel(replayData),
            date: Date.now(),
            data: replayData,
            size: JSON.stringify(replayData).length
        };

        this.replays.unshift(entry);
        if (this.replays.length > this.maxReplays) {
            this.replays = this.replays.slice(0, this.maxReplays);
        }

        this._save();
        return entry.id;
    }

    get(id) {
        const entry = this.replays.find(r => r.id === id);
        return entry ? entry.data : null;
    }

    getList() {
        return this.replays.map(r => ({
            id: r.id,
            label: r.label,
            date: r.date,
            frameCount: r.data.frames.length,
            duration: r.data.metadata.duration
        }));
    }

    remove(id) {
        this.replays = this.replays.filter(r => r.id !== id);
        this._save();
    }

    clear() {
        this.replays = [];
        this._save();
    }

    _generateLabel(replayData) {
        const m = replayData.metadata;
        const d = new Date(m.startTime);
        return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    }

    _save() {
        try {
            localStorage.setItem('doudizhu_replays', JSON.stringify(this.replays));
        } catch (e) {
            if (this.replays.length > 5) {
                this.replays = this.replays.slice(0, 5);
                try {
                    localStorage.setItem('doudizhu_replays', JSON.stringify(this.replays));
                } catch (e2) { /* give up */ }
            }
        }
    }

    _load() {
        try {
            const data = localStorage.getItem('doudizhu_replays');
            if (data) {
                this.replays = JSON.parse(data);
            }
        } catch (e) {
            this.replays = [];
        }
    }
}

class ReplayUI {
    constructor(replayPlayer) {
        this.player = replayPlayer;
        this.panel = null;
    }

    createPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.panel = document.createElement('div');
        this.panel.className = 'replay-panel';
        this.panel.innerHTML = `
            <div class="replay-controls">
                <button class="replay-btn" id="replay-prev" title="上一帧">⏮</button>
                <button class="replay-btn" id="replay-play" title="播放/暂停">▶</button>
                <button class="replay-btn" id="replay-next" title="下一帧">⏭</button>
                <button class="replay-btn" id="replay-stop" title="停止">⏹</button>
                <div class="replay-speed">
                    <button class="replay-speed-btn" data-speed="0.5">0.5x</button>
                    <button class="replay-speed-btn active" data-speed="1">1x</button>
                    <button class="replay-speed-btn" data-speed="2">2x</button>
                </div>
            </div>
            <div class="replay-progress">
                <div class="replay-progress-bar">
                    <div class="replay-progress-fill" id="replay-progress-fill"></div>
                </div>
                <span class="replay-frame-info" id="replay-frame-info">0 / 0</span>
            </div>
        `;

        container.appendChild(this.panel);
        this._bindEvents();
    }

    _bindEvents() {
        const playBtn = document.getElementById('replay-play');
        const stopBtn = document.getElementById('replay-stop');
        const prevBtn = document.getElementById('replay-prev');
        const nextBtn = document.getElementById('replay-next');

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (this.player.isPaused) {
                    this.player.resume();
                    playBtn.textContent = '⏸';
                } else if (this.player.isPlaying) {
                    this.player.pause();
                    playBtn.textContent = '▶';
                } else {
                    this.player.play(
                        (frame) => this._onFrame(frame),
                        () => this._onEnd()
                    );
                    playBtn.textContent = '⏸';
                }
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.player.stop();
                if (playBtn) playBtn.textContent = '▶';
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.player.currentFrame > 0) {
                    this.player.seekTo(this.player.currentFrame - 1);
                    this._updateProgress();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.player.currentFrame < this.player.totalFrames - 1) {
                    this.player.seekTo(this.player.currentFrame + 1);
                    this._updateProgress();
                }
            });
        }

        const speedBtns = this.panel.querySelectorAll('.replay-speed-btn');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.player.setSpeed(parseFloat(btn.dataset.speed));
            });
        });
    }

    _onFrame(frame) {
        this._updateProgress();
    }

    _onEnd() {
        const playBtn = document.getElementById('replay-play');
        if (playBtn) playBtn.textContent = '▶';
    }

    _updateProgress() {
        const fill = document.getElementById('replay-progress-fill');
        const info = document.getElementById('replay-frame-info');
        if (fill) {
            fill.style.width = `${this.player.progress * 100}%`;
        }
        if (info) {
            info.textContent = `${this.player.currentFrame} / ${this.player.totalFrames}`;
        }
    }

    show() {
        if (this.panel) this.panel.style.display = 'block';
    }

    hide() {
        if (this.panel) this.panel.style.display = 'none';
    }

    destroy() {
        if (this.panel && this.panel.parentNode) {
            this.panel.remove();
        }
    }
}

class ReplayListUI {
    constructor(replayStorage) {
        this.storage = replayStorage;
        this.onSelect = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const list = this.storage.getList();
        if (list.length === 0) {
            container.innerHTML = '<div class="replay-empty">暂无回放记录</div>';
            return;
        }

        const ul = document.createElement('div');
        ul.className = 'replay-list';

        for (const item of list) {
            const el = document.createElement('div');
            el.className = 'replay-list-item';

            const date = new Date(item.date);
            const dateStr = date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            const durationSec = Math.floor((item.duration || 0) / 1000);
            const durationStr = `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`;

            el.innerHTML = `
                <div class="replay-list-info">
                    <span class="replay-list-label">${item.label}</span>
                    <span class="replay-list-meta">${dateStr} · ${item.frameCount}帧 · ${durationStr}</span>
                </div>
                <div class="replay-list-actions">
                    <button class="replay-list-play" data-id="${item.id}" title="播放">▶</button>
                    <button class="replay-list-delete" data-id="${item.id}" title="删除">🗑</button>
                </div>
            `;
            ul.appendChild(el);
        }

        container.appendChild(ul);

        ul.querySelectorAll('.replay-list-play').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (this.onSelect) this.onSelect(id);
            });
        });

        ul.querySelectorAll('.replay-list-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.storage.remove(id);
                this.render(containerId);
            });
        });
    }
}
