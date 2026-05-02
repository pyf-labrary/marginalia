/* ========================================
   Super Mario - UI System
   ======================================== */

const UI = (() => {
    let currentScreen = 'loading';
    let menuIndex = 0;
    let menuButtons = [];
    let settingsState = {
        sfx: true,
        music: true,
        fps: false,
        touch: false
    };
    let fpsDisplay = null;
    let toastContainer = null;

    function init() {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.getElementById('game-container').appendChild(toastContainer);

        setupMenuButtons();
        setupSettingsToggles();
        setupKeyboardNavigation();

        Engine.on('stateChange', onStateChange);
        Engine.on('frame', onFrame);
        Engine.on('pauseToggle', () => {
            if (Engine.getState() === 'playing') {
                showScreen('pause-menu');
                Engine.togglePause();
                Audio.play('pause');
                Audio.pauseMusic();
            } else if (Engine.getState() === 'paused') {
                hideScreen('pause-menu');
                Engine.togglePause();
                Audio.resumeMusic();
            }
        });
    }

    function setupMenuButtons() {
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                handleMenuAction(action);
            });

            btn.addEventListener('mouseenter', () => {
                const parent = btn.closest('.menu-options');
                if (parent) {
                    parent.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });
    }

    function setupSettingsToggles() {
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const setting = toggle.dataset.setting;
                const thumb = toggle.querySelector('.toggle-thumb');
                const isActive = thumb.classList.toggle('active');
                settingsState[setting] = isActive;

                applySetting(setting, isActive);
                Audio.play('coin');
            });
        });
    }

    function setupKeyboardNavigation() {
        Engine.on('keydown', ({ action }) => {
            if (Engine.getState() === 'playing' || Engine.getState() === 'editor') return;

            const screen = getVisibleScreen();
            if (!screen) return;

            const buttons = screen.querySelectorAll('.menu-btn');
            if (buttons.length === 0) return;

            if (action === 'up') {
                menuIndex = (menuIndex - 1 + buttons.length) % buttons.length;
                updateMenuFocus(buttons);
                Audio.play('bump');
            } else if (action === 'down') {
                menuIndex = (menuIndex + 1) % buttons.length;
                updateMenuFocus(buttons);
                Audio.play('bump');
            } else if (action === 'confirm' || action === 'jump') {
                buttons[menuIndex].click();
            }
        });
    }

    function updateMenuFocus(buttons) {
        buttons.forEach((btn, i) => {
            btn.classList.toggle('active', i === menuIndex);
        });
    }

    function getVisibleScreen() {
        const screens = ['main-menu', 'pause-menu', 'settings-menu', 'game-over-screen', 'level-complete-screen'];
        for (const id of screens) {
            const el = document.getElementById(id);
            if (el && !el.classList.contains('hidden')) return el;
        }
        return null;
    }

    function handleMenuAction(action) {
        switch (action) {
            case 'start':
                startGame('1-1');
                break;
            case 'continue':
                const save = Engine.loadProgress();
                if (save) {
                    startGame(save.worldId, false, save.playerState);
                } else {
                    showToast('没有存档数据', 'warning');
                }
                break;
            case 'how-to-play':
                hideScreen('main-menu');
                showScreen('howto-screen');
                menuIndex = 0;
                break;
            case 'back-howto':
                hideScreen('howto-screen');
                showScreen('main-menu');
                menuIndex = 0;
                break;
            case 'bestiary':
                showBestiary();
                break;
            case 'back-bestiary':
                hideScreen('bestiary-screen');
                showScreen('main-menu');
                menuIndex = 0;
                break;
            case 'editor':
                startEditor();
                break;
            case 'settings':
                showScreen('settings-menu');
                hideScreen('main-menu');
                menuIndex = 0;
                break;
            case 'back':
                hideScreen('settings-menu');
                showScreen('main-menu');
                menuIndex = 0;
                break;
            case 'resume':
                hideScreen('pause-menu');
                Engine.togglePause();
                Audio.resumeMusic();
                break;
            case 'restart':
                hideScreen('pause-menu');
                if (Engine.isPaused()) Engine.togglePause();
                Engine.respawnPlayer();
                break;
            case 'quit':
                hideScreen('pause-menu');
                hideScreen('game-over-screen');
                if (Engine.isPaused()) Engine.togglePause();
                showScreen('main-menu');
                Engine.setState('menu');
                Audio.stopMusic();
                menuIndex = 0;
                break;
            case 'retry':
                hideScreen('game-over-screen');
                Engine.resetGame();
                startGame('1-1');
                break;
        }
    }

    let continueFromPrevLevel = false;

    function startGame(worldId, keepState, savedPlayerState) {
        hideScreen('main-menu');
        hideScreen('loading-screen');
        hideScreen('pause-menu');
        hideScreen('game-over-screen');
        hideScreen('level-complete-screen');
        hideScreen('settings-menu');
        menuIndex = 0;

        try {
            const level = Levels.getLevel(worldId);
            Engine.loadLevel(level, !!keepState);

            if (savedPlayerState) {
                Player.restoreSaveState(savedPlayerState);
            }

            Engine.setState('playing');

            const musicTrack = level.theme || 'overworld';
            Audio.playMusic(musicTrack);

            showHUD();
        } catch (e) {
            console.error('[Mario] 关卡加载失败:', e);
        }
    }

    function startEditor() {
        hideScreen('main-menu');
        hideScreen('loading-screen');

        const level = Levels.createEmptyLevel(100, 15);
        Levels.setTileRange(level, 0, 13, 99, 14, 1);
        Engine.loadLevel(level);
        Engine.setState('editor');

        if (typeof Editor !== 'undefined') {
            Editor.enable();
        }

        showHUD();
    }

    function showScreen(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('hidden');
            el.style.display = 'flex';
            menuIndex = 0;
        }
    }

    function hideScreen(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.style.display = 'none';
        }
    }

    function showHUD() {
        const hud = document.getElementById('hud');
        if (hud) hud.style.display = 'flex';
    }

    function hideHUD() {
        const hud = document.getElementById('hud');
        if (hud) hud.style.display = 'none';
    }

    function updateHUD(type, value) {
        switch (type) {
            case 'score':
                setText('hud-score', String(value).padStart(6, '0'));
                break;
            case 'coins':
                setText('hud-coins', `×${String(value).padStart(2, '0')}`);
                break;
            case 'world':
                setText('hud-world', value);
                break;
            case 'time':
                setText('hud-time', value);
                break;
            case 'lives':
                setText('hud-lives', `×${String(value).padStart(2, '0')}`);
                break;
        }
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function applySetting(setting, value) {
        switch (setting) {
            case 'sfx':
                Audio.setSfxEnabled(value);
                break;
            case 'music':
                Audio.setMusicEnabled(value);
                if (value && Engine.getState() === 'playing') {
                    const level = Engine.getCurrentLevel();
                    if (level) Audio.playMusic(level.theme || 'overworld');
                }
                break;
            case 'fps':
                toggleFPSDisplay(value);
                break;
            case 'touch':
                if (value) Input.enableTouch();
                else Input.disableTouch();
                break;
        }
    }

    function toggleFPSDisplay(show) {
        if (show && !fpsDisplay) {
            fpsDisplay = document.createElement('div');
            fpsDisplay.id = 'fps-counter';
            document.getElementById('game-container').appendChild(fpsDisplay);
        }
        if (fpsDisplay) {
            fpsDisplay.style.display = show ? 'block' : 'none';
        }
    }

    function onStateChange({ from, to }) {
        switch (to) {
            case 'gameOver':
                setTimeout(() => {
                    setText('final-score-value', String(Engine.getScore()).padStart(6, '0'));
                    showScreen('game-over-screen');
                    Audio.play('gameOver');
                }, 2000);
                break;

            case 'levelComplete':
                showLevelComplete();
                break;
        }
    }

    function showLevelComplete() {
        const level = Engine.getCurrentLevel();
        const timeRemaining = 400;
        const timeBonus = timeRemaining * 50;

        setText('stat-time', `×${timeRemaining}`);
        setText('stat-time-bonus', `+${timeBonus}`);
        setText('stat-coins', `×${Engine.getCoins()}`);

        showScreen('level-complete-screen');
        Audio.play('flagpole');

        setTimeout(() => {
            hideScreen('level-complete-screen');
            const nextLevel = Levels.getNextLevel(Engine.getWorldId());
            if (nextLevel) {
                Engine.setWorldId(nextLevel);
                Engine.saveProgress();
                startGame(nextLevel, true);
            } else {
                showVictoryScreen();
            }
        }, 4000);
    }

    function showVictoryScreen() {
        hideScreen('level-complete-screen');

        const overlay = document.getElementById('level-complete-screen');
        const h2 = overlay.querySelector('h2');
        if (h2) h2.textContent = '恭喜通关！';

        showScreen('level-complete-screen');

        Particles.createFireworkBurst(
            Engine.CANVAS_WIDTH / 2,
            Engine.CANVAS_HEIGHT / 3,
            '#ff6b6b'
        );

        setTimeout(() => {
            Particles.createFireworkBurst(
                Engine.CANVAS_WIDTH / 3,
                Engine.CANVAS_HEIGHT / 4,
                '#ffd700'
            );
        }, 500);

        setTimeout(() => {
            Particles.createFireworkBurst(
                Engine.CANVAS_WIDTH * 2 / 3,
                Engine.CANVAS_HEIGHT / 4,
                '#00ff88'
            );
        }, 1000);

        setTimeout(() => {
            hideScreen('level-complete-screen');
            showScreen('main-menu');
            Engine.setState('menu');
            Audio.stopMusic();
        }, 6000);
    }

    function onFrame({ fps }) {
        if (fpsDisplay && fpsDisplay.style.display !== 'none') {
            fpsDisplay.textContent = `FPS: ${fps}`;
        }
    }

    function showToast(message, type) {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type || ''}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 3000);
    }

    function showDialog(title, message, buttons) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'dialog';

        const h3 = document.createElement('h3');
        h3.textContent = title;
        dialog.appendChild(h3);

        if (message) {
            const p = document.createElement('p');
            p.textContent = message;
            dialog.appendChild(p);
        }

        const btnContainer = document.createElement('div');
        btnContainer.className = 'dialog-buttons';

        for (const btn of buttons) {
            const button = document.createElement('button');
            button.className = `dialog-btn ${btn.class || ''}`;
            button.textContent = btn.text;
            button.addEventListener('click', () => {
                overlay.remove();
                if (btn.callback) btn.callback();
            });
            btnContainer.appendChild(button);
        }

        dialog.appendChild(btnContainer);
        overlay.appendChild(dialog);
        document.getElementById('game-container').appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        return overlay;
    }

    function setLoadingProgress(percent, text) {
        const bar = document.getElementById('loading-bar');
        const label = document.getElementById('loading-text');
        if (bar) bar.style.width = percent + '%';
        if (label && text) label.textContent = text;
    }

    function getSettings() { return { ...settingsState }; }

    const BESTIARY_DATA = [
        { type: 'goomba', name: '栗子怪', desc: '最基础的敌人，踩一脚即可消灭' },
        { type: 'koopa', name: '慢慢龟', desc: '踩后缩入壳中，可以踢出消灭其他敌人' },
        { type: 'koopaRed', name: '红龟', desc: '比绿龟更聪明，不会走下悬崖' },
        { type: 'piranha', name: '食人花', desc: '从管道中伸出的危险植物' },
        { type: 'buzzyBeetle', name: '钢盔龟', desc: '火球无效！只能踩或用星星消灭' },
        { type: 'hammerBro', name: '锤子兄弟', desc: '会跳跃并投掷锤子的强敌' },
        { type: 'bulletBill', name: '炮弹', desc: '从炮台发射的高速飞行敌人' },
        { type: 'blooper', name: '乌贼', desc: '水中追踪你的烦人敌人' },
        { type: 'lakitu', name: '球盖姆', desc: '骑着云朵投掷刺猬的飞行敌人' },
        { type: 'spiny', name: '刺猬', desc: '身上有刺，不能踩！只能用星星或火球' }
    ];

    function getEncounteredEnemies() {
        try {
            return JSON.parse(localStorage.getItem('mario_bestiary') || '[]');
        } catch (e) { return []; }
    }

    function recordEnemy(type) {
        const encountered = getEncounteredEnemies();
        if (!encountered.includes(type)) {
            encountered.push(type);
            localStorage.setItem('mario_bestiary', JSON.stringify(encountered));
        }
    }

    function showBestiary() {
        hideScreen('main-menu');
        showScreen('bestiary-screen');
        menuIndex = 0;

        const grid = document.getElementById('bestiary-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const encountered = getEncounteredEnemies();

        for (const enemy of BESTIARY_DATA) {
            const unlocked = encountered.includes(enemy.type);
            const card = document.createElement('div');
            card.className = `bestiary-card ${unlocked ? 'unlocked' : 'locked'}`;

            const spriteContainer = document.createElement('div');
            spriteContainer.className = 'bestiary-sprite';

            const miniCanvas = document.createElement('canvas');
            miniCanvas.width = 32;
            miniCanvas.height = 32;
            const miniCtx = miniCanvas.getContext('2d');
            miniCtx.imageSmoothingEnabled = false;

            switch (enemy.type) {
                case 'goomba': Sprites.drawGoomba(miniCtx, 2, 2, 0, false); break;
                case 'koopa': Sprites.drawKoopa(miniCtx, 2, -8, 0, -1, 'green'); break;
                case 'koopaRed': Sprites.drawKoopa(miniCtx, 2, -8, 0, -1, 'red'); break;
                case 'piranha': Sprites.drawPiranha(miniCtx, 2, 0, 0); break;
                case 'hammerBro': Sprites.drawHammerBro(miniCtx, 2, -16, 0, -1); break;
                case 'bulletBill': Sprites.drawBulletBill(miniCtx, 2, 4, -1); break;
                case 'blooper': Sprites.drawBlooper(miniCtx, 2, 0, 0); break;
                default:
                    miniCtx.fillStyle = unlocked ? '#e52521' : '#666';
                    miniCtx.fillRect(4, 4, 24, 24);
            }

            spriteContainer.appendChild(miniCanvas);
            card.appendChild(spriteContainer);

            const name = document.createElement('div');
            name.className = 'bestiary-name';
            name.textContent = unlocked ? enemy.name : '???';
            card.appendChild(name);

            if (unlocked) {
                const desc = document.createElement('div');
                desc.className = 'bestiary-desc';
                desc.textContent = enemy.desc;
                card.appendChild(desc);
            }

            grid.appendChild(card);
        }
    }

    Engine.on('update', () => {
        const player = Player.getEntity();
        if (!player) return;

        const entities = Engine.getEntities();
        for (const e of entities) {
            if (e.active && e.isEnemy && e.activated) {
                const dx = Math.abs(e.x - player.x);
                if (dx < Engine.CANVAS_WIDTH) {
                    recordEnemy(e.type);
                }
            }
        }
    });

    return {
        init, showScreen, hideScreen, showHUD, hideHUD,
        updateHUD, handleMenuAction, startGame, startEditor,
        showToast, showDialog, setLoadingProgress,
        applySetting, getSettings, toggleFPSDisplay,
        showBestiary, recordEnemy
    };
})();
