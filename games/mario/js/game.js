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
