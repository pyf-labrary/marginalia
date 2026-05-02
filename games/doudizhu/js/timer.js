/**
 * timer.js - 回合计时器系统，含可视化倒计时
 */

class TurnTimer {
    constructor(duration = TIMER_DURATION) {
        this.duration = duration;
        this.remaining = duration;
        this.isRunning = false;
        this._intervalId = null;
        this._startTime = 0;
        this.onTick = null;
        this.onWarning = null;
        this.onTimeout = null;
        this.warningThreshold = TIMER_WARNING_THRESHOLD;
        this._warningTriggered = false;
    }

    start(duration = null) {
        if (duration !== null) this.duration = duration;
        this.remaining = this.duration;
        this.isRunning = true;
        this._startTime = Date.now();
        this._warningTriggered = false;

        this._intervalId = setInterval(() => this._tick(), 100);
    }

    stop() {
        this.isRunning = false;
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    pause() {
        this.isRunning = false;
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    resume() {
        if (this.remaining > 0) {
            this.isRunning = true;
            this._startTime = Date.now() - (this.duration - this.remaining) * 1000;
            this._intervalId = setInterval(() => this._tick(), 100);
        }
    }

    reset() {
        this.stop();
        this.remaining = this.duration;
        this._warningTriggered = false;
    }

    get progress() {
        return this.remaining / this.duration;
    }

    get isWarning() {
        return this.remaining <= this.warningThreshold;
    }

    get displayTime() {
        return Math.ceil(this.remaining);
    }

    _tick() {
        const elapsed = (Date.now() - this._startTime) / 1000;
        this.remaining = Math.max(0, this.duration - elapsed);

        if (this.onTick) {
            this.onTick(this.remaining, this.progress);
        }

        if (this.remaining <= this.warningThreshold && !this._warningTriggered) {
            this._warningTriggered = true;
            if (this.onWarning) this.onWarning();
        }

        if (this.remaining <= 0) {
            this.stop();
            if (this.onTimeout) this.onTimeout();
        }
    }
}

class TimerDisplay {
    constructor() {
        this.container = null;
        this.ring = null;
        this.text = null;
        this._visible = false;
        this._create();
    }

    _create() {
        this.container = document.createElement('div');
        this.container.className = 'timer-display hidden';
        this.container.id = 'turn-timer';

        this.container.innerHTML = `
            <svg class="timer-svg" viewBox="0 0 100 100">
                <circle class="timer-track"
                    cx="50" cy="50" r="45"
                    fill="none" stroke-width="4" />
                <circle class="timer-progress"
                    cx="50" cy="50" r="45"
                    fill="none" stroke-width="4"
                    stroke-dasharray="283"
                    stroke-dashoffset="0"
                    stroke-linecap="round" />
            </svg>
            <div class="timer-text">30</div>
        `;

        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.appendChild(this.container);
        }

        this.ring = this.container.querySelector('.timer-progress');
        this.text = this.container.querySelector('.timer-text');
    }

    show(position = 'bottom') {
        this._visible = true;
        this.container.classList.remove('hidden');

        this.container.className = `timer-display timer-${position}`;
        this.container.classList.add('anim-scale-in');
    }

    hide() {
        this._visible = false;
        this.container.classList.add('hidden');
    }

    update(remaining, progress) {
        if (!this._visible) return;

        const circumference = 2 * Math.PI * 45;
        const offset = circumference * (1 - progress);
        if (this.ring) {
            this.ring.style.strokeDashoffset = offset;
        }

        if (this.text) {
            this.text.textContent = Math.ceil(remaining);
        }

        if (remaining <= TIMER_WARNING_THRESHOLD) {
            this.container.classList.add('timer-warning');
            if (remaining <= 5) {
                this.container.classList.add('timer-critical');
            }
        } else {
            this.container.classList.remove('timer-warning', 'timer-critical');
        }
    }

    reset() {
        if (this.ring) {
            this.ring.style.strokeDashoffset = '0';
        }
        if (this.text) {
            this.text.textContent = '';
        }
        this.container.classList.remove('timer-warning', 'timer-critical');
    }
}

class TimerController {
    constructor(soundManager) {
        this.timer = new TurnTimer();
        this.display = new TimerDisplay();
        this.sound = soundManager;
        this.enabled = false;
        this.autoPlayOnTimeout = true;

        this._onTimeoutCallback = null;
        this._countdownSoundInterval = null;

        this.timer.onTick = (remaining, progress) => {
            this.display.update(remaining, progress);
        };

        this.timer.onWarning = () => {
            if (this.sound) {
                this._startCountdownSound();
            }
        };

        this.timer.onTimeout = () => {
            this._stopCountdownSound();
            if (this._onTimeoutCallback) {
                this._onTimeoutCallback();
            }
        };
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setOnTimeout(callback) {
        this._onTimeoutCallback = callback;
    }

    startTurn(position, duration = TIMER_DURATION) {
        if (!this.enabled) return;

        this.timer.reset();
        this.display.reset();

        let displayPos;
        switch (position) {
            case PLAYER_POSITION.BOTTOM: displayPos = 'bottom'; break;
            case PLAYER_POSITION.LEFT: displayPos = 'left'; break;
            case PLAYER_POSITION.RIGHT: displayPos = 'right'; break;
            default: displayPos = 'bottom';
        }

        this.display.show(displayPos);
        this.timer.start(duration);
    }

    stopTurn() {
        this.timer.stop();
        this.display.hide();
        this._stopCountdownSound();
    }

    pauseTurn() {
        this.timer.pause();
        this._stopCountdownSound();
    }

    resumeTurn() {
        this.timer.resume();
        if (this.timer.isWarning) {
            this._startCountdownSound();
        }
    }

    _startCountdownSound() {
        if (this._countdownSoundInterval) return;
        this._countdownSoundInterval = setInterval(() => {
            if (this.sound && this.timer.remaining > 0) {
                this.sound.play('countdown');
            }
        }, 1000);
    }

    _stopCountdownSound() {
        if (this._countdownSoundInterval) {
            clearInterval(this._countdownSoundInterval);
            this._countdownSoundInterval = null;
        }
    }

    destroy() {
        this.timer.stop();
        this.display.hide();
        this._stopCountdownSound();
    }
}

class GameClock {
    constructor() {
        this.startTime = 0;
        this.pauseTime = 0;
        this.totalPauseTime = 0;
        this._isPaused = false;
        this._isRunning = false;
        this._displayEl = null;
        this._intervalId = null;
    }

    start() {
        this.startTime = Date.now();
        this.pauseTime = 0;
        this.totalPauseTime = 0;
        this._isPaused = false;
        this._isRunning = true;
        this._startDisplay();
    }

    pause() {
        if (!this._isRunning || this._isPaused) return;
        this._isPaused = true;
        this.pauseTime = Date.now();
        this._stopDisplay();
    }

    resume() {
        if (!this._isPaused) return;
        this.totalPauseTime += Date.now() - this.pauseTime;
        this._isPaused = false;
        this.pauseTime = 0;
        this._startDisplay();
    }

    stop() {
        this._isRunning = false;
        this._isPaused = false;
        this._stopDisplay();
    }

    get elapsed() {
        if (!this._isRunning) return 0;
        const now = this._isPaused ? this.pauseTime : Date.now();
        return now - this.startTime - this.totalPauseTime;
    }

    get elapsedSeconds() {
        return Math.floor(this.elapsed / 1000);
    }

    get displayText() {
        const total = this.elapsedSeconds;
        const mins = Math.floor(total / 60);
        const secs = total % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    createDisplay(containerId = 'game-screen') {
        const container = document.getElementById(containerId);
        if (!container || this._displayEl) return;

        this._displayEl = document.createElement('div');
        this._displayEl.className = 'game-clock';
        this._displayEl.id = 'game-clock';
        this._displayEl.innerHTML = `
            <span class="clock-icon">⏱</span>
            <span class="clock-time" id="clock-time">00:00</span>
        `;
        container.appendChild(this._displayEl);
    }

    _startDisplay() {
        if (this._intervalId) return;
        this._intervalId = setInterval(() => this._updateDisplay(), 1000);
    }

    _stopDisplay() {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    _updateDisplay() {
        const timeEl = document.getElementById('clock-time');
        if (timeEl) {
            timeEl.textContent = this.displayText;
        }
    }

    show() {
        if (this._displayEl) this._displayEl.style.display = '';
    }

    hide() {
        if (this._displayEl) this._displayEl.style.display = 'none';
    }

    destroy() {
        this.stop();
        if (this._displayEl && this._displayEl.parentNode) {
            this._displayEl.remove();
        }
    }
}

class ActionHistory {
    constructor() {
        this.actions = [];
        this._container = null;
        this._visible = false;
        this._maxActions = 20;
    }

    createDisplay(containerId = 'game-screen') {
        const container = document.getElementById(containerId);
        if (!container || this._container) return;

        this._container = document.createElement('div');
        this._container.className = 'action-history-panel hidden';
        this._container.id = 'action-history';
        this._container.innerHTML = `
            <div class="action-history-header">
                <span>出牌记录</span>
                <button class="action-history-toggle" id="action-history-toggle">×</button>
            </div>
            <div class="action-history-list" id="action-history-list"></div>
        `;
        container.appendChild(this._container);

        const toggleBtn = this._container.querySelector('#action-history-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleVisibility());
        }
    }

    addAction(playerName, actionText, isPass = false) {
        this.actions.unshift({ playerName, actionText, isPass, time: Date.now() });
        if (this.actions.length > this._maxActions) {
            this.actions.pop();
        }
        this._render();
    }

    clear() {
        this.actions = [];
        this._render();
    }

    toggleVisibility() {
        this._visible = !this._visible;
        if (this._container) {
            if (this._visible) {
                this._container.classList.remove('hidden');
            } else {
                this._container.classList.add('hidden');
            }
        }
    }

    show() {
        this._visible = true;
        if (this._container) this._container.classList.remove('hidden');
    }

    hide() {
        this._visible = false;
        if (this._container) this._container.classList.add('hidden');
    }

    _render() {
        const list = document.getElementById('action-history-list');
        if (!list) return;

        list.innerHTML = '';
        for (const action of this.actions) {
            const item = document.createElement('div');
            item.className = `action-history-item ${action.isPass ? 'pass' : ''}`;
            item.innerHTML = `
                <span class="action-player">${action.playerName}</span>
                <span class="action-text">${action.actionText}</span>
            `;
            list.appendChild(item);
        }
    }

    destroy() {
        if (this._container && this._container.parentNode) {
            this._container.remove();
        }
    }
}

