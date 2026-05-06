/* ========================================
   Super Mario - Game Entry Point & Bootstrap
   ======================================== */

const Game = (() => {
    let initialized = false;
    let debugMode = false;
    let performanceStats = {
        frames: 0,
        updates: 0,
        particles: 0,
        entities: 0
    };

    async function boot() {
        console.log('[Mario] 游戏启动中...');

        UI.setLoadingProgress(10, '初始化引擎...');
        Engine.init();

        UI.setLoadingProgress(25, '初始化输入系统...');
        Input.init();

        UI.setLoadingProgress(40, '初始化音频系统...');
        Audio.init();

        UI.setLoadingProgress(55, '初始化UI系统...');
        UI.init();

        UI.setLoadingProgress(70, '预加载资源...');
        await preloadAssets();

        UI.setLoadingProgress(85, '准备就绪...');
        setupDebugTools();
        setupEventHandlers();
        setupCheatListener();
        setupCheatMenuHandlers();

        UI.setLoadingProgress(100, '完成！');

        await delay(400);

        UI.hideScreen('loading-screen');
        UI.showScreen('main-menu');
        Engine.setState('menu');

        Engine.startGameLoop();
        initialized = true;

        console.log('[Mario] 游戏启动完成');
    }

    async function preloadAssets() {
        await delay(200);
    }

    function setupEventHandlers() {
        Engine.on('playerDied', () => {
            console.log('[Mario] 玩家死亡, 剩余生命:', Engine.getLives());
        });

        Engine.on('gameOver', () => {
            console.log('[Mario] 游戏结束, 最终分数:', Engine.getScore());
            Audio.stopMusic();
        });

        Engine.on('levelComplete', (data) => {
            console.log('[Mario] 关卡完成!', data);
        });

        Engine.on('coinCollected', ({ coins }) => {
            if (coins % 10 === 0) {
                Engine.screenShake(1, 50);
            }
        });

        Engine.on('blockBroken', () => {
            performanceStats.updates++;
        });

        Engine.on('timerWarning', (time) => {
            if (time === 100) {
                Audio.play('warning');
            }
        });

        Engine.on('timeUp', () => {
            console.log('[Mario] 时间到!');
        });

        Engine.on('itemCollected', ({ type }) => {
            if (type === 'star') {
                performanceStats.updates++;
            }
        });

        let pendingPipe = null;

        Engine.on('pipeEnter', (pipe) => {
            pendingPipe = pipe;
        });

        Engine.on('pipeExit', () => {
            if (pendingPipe && pendingPipe.destination) {
                const dest = pendingPipe.destination;
                if (dest.level) {
                    Engine.setWorldId(dest.level);
                    const level = Levels.getLevel(dest.level);
                    Engine.loadLevel(level, true);
                    Audio.playMusic(level.theme || 'overworld');
                    Engine.setState('playing');
                }
            }
            pendingPipe = null;
        });

        Engine.on('stateChange', ({ from, to }) => {
            console.log(`[Mario] 状态变更: ${from} -> ${to}`);
        });

        Engine.on('keydown', ({ action }) => {
            if (action === 'editor' && Engine.getState() === 'playing') {
            }

            if (action === 'debug1' && debugMode) {
                Player.growToBig();
                UI.showToast('调试: 变大', 'success');
            }
            if (action === 'debug2' && debugMode) {
                Player.setFireMode(true);
                UI.showToast('调试: 火焰模式', 'success');
            }
            if (action === 'debug3' && debugMode) {
                Player.activateStarPower();
                UI.showToast('调试: 无敌星', 'success');
            }
        });

        Engine.on('frame', ({ fps }) => {
            performanceStats.frames++;
            performanceStats.particles = Particles.getCount();
            performanceStats.entities = Engine.getEntities().length;
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (Engine.getState() === 'playing') {
                    Engine.emit('pauseToggle');
                }
            }
        });

        window.addEventListener('beforeunload', () => {
            if (Engine.getState() === 'playing') {
                Engine.saveProgress();
            }
        });
    }

    let cheatsUnlocked = false;
    let cheatMenuOpen = false;
    const cheatKeyBuffer = [];
    const CHEAT_BUFFER_MAX = 30;

    const CHEAT_CODES = [
        { seq: 'mario',      action: 'unlock',  toast: '🔓 "MARIO" — 秘籍解锁！' },
        { seq: 'iddqd',      action: 'god',     toast: '💀 "IDDQD" — 上帝模式！' },
        { seq: 'power',      action: 'star',    toast: '⭐ "POWER" — 无敌星！' },
        { seq: 'big',        action: 'big',     toast: '🍄 "BIG" — 变大！' },
        { seq: 'tiny',       action: 'tiny',    toast: '🐜 "TINY" — 迷你模式！' },
        { seq: 'giant',      action: 'giant',   toast: '🏔 "GIANT" — 巨人模式！' },
        { seq: 'fire',       action: 'fire',    toast: '🔥 "FIRE" — 火焰模式！' },
        { seq: 'rich',       action: 'coins',   toast: '💰 "RICH" — 大富翁！' },
        { seq: 'life',       action: 'lives',   toast: '💚 "LIFE" — 生命+10！' },
    ];

    const KONAMI = ['up','up','down','down','left','right','left','right'];
    let konamiIdx = 0;

    function setupCheatListener() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Backquote') {
                e.preventDefault();
                if (cheatsUnlocked) toggleCheatMenu();
                return;
            }

            const konamiMap = {
                'ArrowUp': 'up', 'ArrowDown': 'down',
                'ArrowLeft': 'left', 'ArrowRight': 'right'
            };
            if (konamiMap[e.key] || konamiMap[e.code]) {
                const dir = konamiMap[e.key] || konamiMap[e.code];
                if (dir === KONAMI[konamiIdx]) {
                    konamiIdx++;
                    if (konamiIdx >= KONAMI.length) {
                        konamiIdx = 0;
                        unlockCheats();
                        UI.showToast('↑↑↓↓←→←→ — Konami Code 秘籍全开！', 'success');
                        Player.setGodMode(true);
                        Player.setInfiniteLives(true);
                        Player.growToBig();
                        Player.setFireMode(true);
                        Player.activateStarPower();
                    }
                } else {
                    konamiIdx = dir === KONAMI[0] ? 1 : 0;
                }
            }

            if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                cheatKeyBuffer.push(e.key.toLowerCase());
                if (cheatKeyBuffer.length > CHEAT_BUFFER_MAX) {
                    cheatKeyBuffer.splice(0, cheatKeyBuffer.length - CHEAT_BUFFER_MAX);
                }
                const typed = cheatKeyBuffer.join('');
                for (const code of CHEAT_CODES) {
                    if (typed.endsWith(code.seq)) {
                        executeCheatCode(code);
                        cheatKeyBuffer.length = 0;
                        break;
                    }
                }
            }
        });
    }

    function executeCheatCode(code) {
        UI.showToast(code.toast, 'success');
        switch (code.action) {
            case 'unlock': unlockCheats(); break;
            case 'god':
                unlockCheats();
                Player.setGodMode(true);
                syncCheatUI();
                break;
            case 'star': Player.activateStarPower(); break;
            case 'big': Player.growToBig(); break;
            case 'tiny':
                Player.setCheatScale(0.4);
                syncCheatUI();
                break;
            case 'giant':
                Player.setCheatScale(3.0);
                syncCheatUI();
                break;
            case 'fire':
                Player.growToBig();
                Player.setFireMode(true);
                break;
            case 'coins':
                Engine.setCoins(99);
                break;
            case 'lives':
                Engine.setLives(Engine.getLives() + 10);
                break;
        }
    }

    function unlockCheats() {
        if (cheatsUnlocked) return;
        cheatsUnlocked = true;
        const toast = document.getElementById('cheat-unlock-toast');
        if (toast) {
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 4000);
        }
    }

    function toggleCheatMenu() {
        cheatMenuOpen = !cheatMenuOpen;
        const el = document.getElementById('cheat-menu');
        if (!el) return;
        if (cheatMenuOpen) {
            syncCheatUI();
            el.classList.remove('hidden');
            el.style.display = 'flex';
            if (Engine.getState() === 'playing' && !Engine.isPaused()) {
                Engine.togglePause();
            }
        } else {
            el.classList.add('hidden');
            el.style.display = 'none';
            if (Engine.isPaused()) {
                Engine.togglePause();
            }
        }
    }

    function syncCheatUI() {
        const scaleSlider = document.getElementById('cheat-scale');
        const scaleVal = document.getElementById('cheat-scale-val');
        const speedSlider = document.getElementById('cheat-speed');
        const speedVal = document.getElementById('cheat-speed-val');
        const godToggle = document.getElementById('cheat-god');
        const livesToggle = document.getElementById('cheat-inf-lives');

        if (scaleSlider) scaleSlider.value = Player.getCheatScale();
        if (scaleVal) scaleVal.textContent = Player.getCheatScale().toFixed(1) + 'x';
        if (speedSlider) speedSlider.value = Engine.getGameSpeed();
        if (speedVal) speedVal.textContent = Engine.getGameSpeed().toFixed(1) + 'x';
        if (godToggle) {
            const thumb = godToggle.querySelector('.toggle-thumb');
            if (thumb) thumb.classList.toggle('active', Player.isGodMode());
        }
        if (livesToggle) {
            const thumb = livesToggle.querySelector('.toggle-thumb');
            if (thumb) thumb.classList.toggle('active', Player.hasInfiniteLives());
        }
    }

    function setupCheatMenuHandlers() {
        const scaleSlider = document.getElementById('cheat-scale');
        if (scaleSlider) {
            scaleSlider.addEventListener('input', () => {
                const v = parseFloat(scaleSlider.value);
                Player.setCheatScale(v);
                const valEl = document.getElementById('cheat-scale-val');
                if (valEl) valEl.textContent = v.toFixed(1) + 'x';
            });
        }

        const speedSlider = document.getElementById('cheat-speed');
        if (speedSlider) {
            speedSlider.addEventListener('input', () => {
                const v = parseFloat(speedSlider.value);
                Engine.setGameSpeed(v);
                const valEl = document.getElementById('cheat-speed-val');
                if (valEl) valEl.textContent = v.toFixed(1) + 'x';
            });
        }

        const godToggle = document.getElementById('cheat-god');
        if (godToggle) {
            godToggle.addEventListener('click', () => {
                Player.setGodMode(!Player.isGodMode());
                const thumb = godToggle.querySelector('.toggle-thumb');
                if (thumb) thumb.classList.toggle('active', Player.isGodMode());
                UI.showToast(Player.isGodMode() ? '上帝模式已开启' : '上帝模式已关闭', 'success');
            });
        }

        const livesToggle = document.getElementById('cheat-inf-lives');
        if (livesToggle) {
            livesToggle.addEventListener('click', () => {
                Player.setInfiniteLives(!Player.hasInfiniteLives());
                const thumb = livesToggle.querySelector('.toggle-thumb');
                if (thumb) thumb.classList.toggle('active', Player.hasInfiniteLives());
                UI.showToast(Player.hasInfiniteLives() ? '无限生命已开启' : '无限生命已关闭', 'success');
            });
        }

        document.querySelectorAll('.cheat-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const cheat = btn.dataset.cheat;
                applyCheatAction(cheat);
            });
        });

        document.querySelectorAll('[data-action="close-cheat"]').forEach(btn => {
            btn.addEventListener('click', () => toggleCheatMenu());
        });
    }

    function applyCheatAction(cheat) {
        switch (cheat) {
            case 'big':
                Player.growToBig();
                UI.showToast('🍄 变大！', 'success');
                break;
            case 'fire':
                Player.growToBig();
                Player.setFireMode(true);
                UI.showToast('🔥 火焰模式！', 'success');
                break;
            case 'star':
                Player.activateStarPower();
                UI.showToast('⭐ 无敌星！', 'success');
                break;
            case 'lives10':
                Engine.setLives(Engine.getLives() + 10);
                UI.showToast('💚 生命 +10！', 'success');
                break;
            case 'coins99':
                Engine.setCoins(99);
                UI.showToast('💰 金币 ×99！', 'success');
                break;
            case 'score':
                Engine.addScore(50000);
                UI.showToast('✨ +50000 分！', 'success');
                break;
            case 'skip':
                Engine.levelComplete();
                UI.showToast('⏩ 跳过关卡！', 'success');
                break;
            case 'tiny':
                Player.setCheatScale(0.4);
                syncCheatUI();
                UI.showToast('🐜 迷你模式！', 'success');
                break;
            case 'giant':
                Player.setCheatScale(3.0);
                syncCheatUI();
                UI.showToast('🏔 巨人模式！', 'success');
                break;
            case 'reset-scale':
                Player.setCheatScale(1.0);
                syncCheatUI();
                UI.showToast('↩ 恢复原始大小', 'success');
                break;
        }
    }

    function setupDebugTools() {
        window.MarioDebug = {
            toggleDebug() {
                debugMode = !debugMode;
                UI.showToast(debugMode ? '调试模式已开启' : '调试模式已关闭', 'success');
                return debugMode;
            },
            getStats() {
                return { ...performanceStats };
            },
            giveLife() {
                Engine.addLife();
            },
            setLevel(worldId) {
                const level = Levels.getLevel(worldId);
                Engine.loadLevel(level);
                Engine.setState('playing');
            },
            addScore(points) {
                Engine.addScore(points);
            },
            addCoins(count) {
                for (let i = 0; i < count; i++) Engine.addCoin();
            },
            god() {
                Player.activateStarPower();
            },
            big() {
                Player.growToBig();
            },
            fire() {
                Player.setFireMode(true);
            },
            kill() {
                Engine.killPlayer();
            },
            spawn(type, x, y) {
                const player = Player.getEntity();
                if (player) {
                    Items.spawn(type, x || player.x + 64, y || player.y - 32);
                }
            },
            spawnEnemy(type, x, y) {
                const player = Player.getEntity();
                if (player) {
                    const enemy = Enemies.create({
                        type: type || 'goomba',
                        x: Math.floor((x || player.x + 128) / Engine.TILE_SIZE),
                        y: Math.floor((y || player.y) / Engine.TILE_SIZE)
                    });
                    if (enemy) {
                        enemy.activated = true;
                        Engine.addEntity(enemy);
                    }
                }
            },
            completeLevel() {
                Engine.levelComplete();
            },
            shake() {
                Engine.screenShake(5, 500);
            },
            slowmo() {
                Engine.triggerSlowMotion(3000);
            },
            fireworks() {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        Particles.createFireworkBurst(
                            100 + Math.random() * (Engine.CANVAS_WIDTH - 200),
                            50 + Math.random() * (Engine.CANVAS_HEIGHT / 2),
                            `hsl(${Math.random() * 360}, 80%, 60%)`
                        );
                    }, i * 300);
                }
            },
            listLevels() {
                return Levels.getLevelList();
            },
            getCamera() {
                return Engine.getCamera();
            },
            getPlayer() {
                return Player.getEntity();
            },
            teleport(tileX, tileY) {
                const player = Player.getEntity();
                if (player) {
                    player.x = tileX * Engine.TILE_SIZE;
                    player.y = tileY * Engine.TILE_SIZE;
                }
            }
        };
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function isInitialized() { return initialized; }
    function isDebugMode() { return debugMode; }
    function getPerformanceStats() { return { ...performanceStats }; }

    document.addEventListener('DOMContentLoaded', () => {
        boot().catch(err => {
            console.error('[Mario] 启动失败:', err);
            UI.setLoadingProgress(100, '加载失败，请刷新页面');
        });
    });

    return {
        boot, isInitialized, isDebugMode, getPerformanceStats
    };
})();
