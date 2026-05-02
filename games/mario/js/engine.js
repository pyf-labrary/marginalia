/* ========================================
   Super Mario - Game Engine Core
   ======================================== */

const Engine = (() => {
    const TILE_SIZE = 32;
    const GRAVITY = 0.6;
    const MAX_FALL_SPEED = 12;
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 480;

    let canvas, ctx;
    let gameState = 'loading';
    let lastTime = 0;
    let deltaTime = 0;
    let accumulator = 0;
    const FIXED_STEP = 1000 / 60;
    let fps = 0;
    let frameCount = 0;
    let fpsTimer = 0;
    let gameSpeed = 1.0;
    let paused = false;
    let camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let currentLevel = null;
    let entities = [];
    let projectiles = [];
    let decorations = [];
    let levelTimer = 400;
    let timerInterval = null;
    let score = 0;
    let coins = 0;
    let lives = 5;
    let worldId = '1-1';
    let comboCount = 0;
    let comboTimer = 0;
    let shakeAmount = 0;
    let shakeTimer = 0;
    let slowMotion = false;
    let slowMotionTimer = 0;
    let transitionCallback = null;
    let freezeFrames = 0;

    const gameEvents = {};

    function on(event, callback) {
        if (!gameEvents[event]) gameEvents[event] = [];
        gameEvents[event].push(callback);
    }

    function emit(event, data) {
        if (gameEvents[event]) {
            gameEvents[event].forEach(cb => cb(data));
        }
    }

    function off(event, callback) {
        if (gameEvents[event]) {
            gameEvents[event] = gameEvents[event].filter(cb => cb !== callback);
        }
    }

    function init() {
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        ctx.imageSmoothingEnabled = false;

        window.addEventListener('resize', handleResize);
        handleResize();

        emit('engineReady');
    }

    function handleResize() {
        const container = document.getElementById('game-container');
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const scaleX = containerW / CANVAS_WIDTH;
        const scaleY = containerH / CANVAS_HEIGHT;
        const scale = Math.min(scaleX, scaleY);

        canvas.style.width = (CANVAS_WIDTH * scale) + 'px';
        canvas.style.height = (CANVAS_HEIGHT * scale) + 'px';

        emit('resize', { width: containerW, height: containerH, scale });
    }

    function startGameLoop() {
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function gameLoop(timestamp) {
        deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (deltaTime > 100) deltaTime = 100;

        frameCount++;
        fpsTimer += deltaTime;
        if (fpsTimer >= 1000) {
            fps = frameCount;
            frameCount = 0;
            fpsTimer = 0;
        }

        if (freezeFrames > 0) {
            freezeFrames--;
            requestAnimationFrame(gameLoop);
            return;
        }

        const effectiveDelta = slowMotion ? deltaTime * 0.3 : deltaTime * gameSpeed;
        accumulator += effectiveDelta;

        while (accumulator >= FIXED_STEP) {
            if (!paused && gameState === 'playing') {
                fixedUpdate(FIXED_STEP);
            }
            accumulator -= FIXED_STEP;
        }

        const alpha = accumulator / FIXED_STEP;

        if (gameState === 'playing' || gameState === 'editor' || gameState === 'levelComplete') {
            render(alpha);
        } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }

        if (comboTimer > 0) {
            comboTimer -= deltaTime;
            if (comboTimer <= 0) comboCount = 0;
        }

        if (slowMotionTimer > 0) {
            slowMotionTimer -= deltaTime;
            if (slowMotionTimer <= 0) slowMotion = false;
        }

        if (shakeTimer > 0) {
            shakeTimer -= deltaTime;
            if (shakeTimer <= 0) shakeAmount = 0;
        }

        emit('frame', { deltaTime, fps, alpha });

        requestAnimationFrame(gameLoop);
    }

    function fixedUpdate(dt) {
        const step = dt / 1000;

        if (Player) Player.update(step);

        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];
            if (entity.active) {
                entity.update(step);
                if (entity.x < camera.x - TILE_SIZE * 8 ||
                    entity.y > (currentLevel ? currentLevel.height * TILE_SIZE + TILE_SIZE * 4 : CANVAS_HEIGHT + TILE_SIZE * 4)) {
                    entity.active = false;
                }
            }
        }

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            if (proj.active) {
                proj.update(step);
            } else {
                projectiles.splice(i, 1);
            }
        }

        entities = entities.filter(e => e.active);

        if (typeof Particles !== 'undefined') Particles.update(step);
        if (typeof Items !== 'undefined') Items.update(step);

        updateCamera(step);
        updateTimer(dt);

        emit('update', { step });
    }

    function render(alpha) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.save();

        if (shakeAmount > 0) {
            const sx = (Math.random() - 0.5) * shakeAmount * 2;
            const sy = (Math.random() - 0.5) * shakeAmount * 2;
            ctx.translate(sx, sy);
        }

        if (currentLevel && typeof Renderer !== 'undefined') {
            Renderer.renderBackground(ctx, camera, currentLevel);
            Renderer.renderTiles(ctx, camera, currentLevel);
        }

        if (typeof Items !== 'undefined') Items.render(ctx, camera);

        for (const entity of entities) {
            if (entity.active && entity.render) {
                entity.render(ctx, camera, alpha);
            }
        }

        for (const proj of projectiles) {
            if (proj.active && proj.render) {
                proj.render(ctx, camera);
            }
        }

        if (typeof Player !== 'undefined') Player.render(ctx, camera, alpha);

        if (typeof Particles !== 'undefined') Particles.render(ctx, camera);

        if (currentLevel && typeof Renderer !== 'undefined') {
            Renderer.renderForeground(ctx, camera, currentLevel);
        }

        ctx.restore();

        emit('render', { ctx, camera, alpha });
    }

    function updateCamera(step) {
        if (!Player || !Player.getEntity()) return;

        const playerEntity = Player.getEntity();
        const targetX = playerEntity.x - CANVAS_WIDTH / 3;
        const targetY = 0;

        const smoothFactor = 0.08;
        camera.x += (targetX - camera.x) * smoothFactor;
        camera.y += (targetY - camera.y) * smoothFactor;

        camera.x = Math.max(0, camera.x);
        if (currentLevel) {
            const maxX = currentLevel.width * TILE_SIZE - CANVAS_WIDTH;
            camera.x = Math.min(camera.x, maxX);
        }
        camera.y = Math.max(0, camera.y);

        camera.targetX = targetX;
        camera.targetY = targetY;
    }

    function updateTimer(dt) {
        if (gameState !== 'playing' || levelTimer <= 0) return;

        if (!timerInterval) {
            timerInterval = 0;
        }
        timerInterval += dt;

        if (timerInterval >= 400) {
            timerInterval -= 400;
            levelTimer--;

            if (levelTimer <= 100 && levelTimer > 0) {
                emit('timerWarning', levelTimer);
            }

            if (levelTimer <= 0) {
                emit('timeUp');
                killPlayer();
            }

            UI.updateHUD('time', levelTimer);
        }
    }

    function setState(newState) {
        const oldState = gameState;
        gameState = newState;
        emit('stateChange', { from: oldState, to: newState });
    }

    function getState() {
        return gameState;
    }

    function loadLevel(levelData, keepPlayerState) {
        currentLevel = levelData;
        entities = [];
        projectiles = [];
        decorations = [];
        levelTimer = levelData.timeLimit || 400;
        timerInterval = null;
        camera.x = 0;
        camera.y = 0;

        if (levelData.enemies) {
            levelData.enemies.forEach(enemyData => {
                const enemy = Enemies.create(enemyData);
                if (enemy) entities.push(enemy);
            });
        }

        if (levelData.items) {
            Items.loadLevelItems(levelData.items);
        }

        if (keepPlayerState) {
            Player.spawnKeepState(levelData.spawnX || 3, levelData.spawnY || 10);
        } else {
            Player.spawn(levelData.spawnX || 3, levelData.spawnY || 10);
        }

        worldId = levelData.worldId || '1-1';
        UI.updateHUD('world', worldId);
        UI.updateHUD('time', levelTimer);

        emit('levelLoaded', levelData);
    }

    function addEntity(entity) {
        entities.push(entity);
    }

    function removeEntity(entity) {
        entity.active = false;
    }

    function addProjectile(proj) {
        projectiles.push(proj);
    }

    function getEntities() {
        return entities;
    }

    function getEntitiesInRange(x, y, range) {
        return entities.filter(e => {
            if (!e.active) return false;
            const dx = e.x + e.width / 2 - x;
            const dy = e.y + e.height / 2 - y;
            return Math.sqrt(dx * dx + dy * dy) <= range;
        });
    }

    function addScore(points, x, y) {
        const multiplier = Math.min(comboCount + 1, 8);
        const finalPoints = points * multiplier;
        score += finalPoints;
        comboCount++;
        comboTimer = 2000;

        UI.updateHUD('score', score);

        if (x !== undefined && y !== undefined) {
            Particles.createScorePopup(x, y, finalPoints);
        }

        if (score >= 10000 && (score - finalPoints) < 10000) {
            addLife();
        }

        emit('scoreChanged', { score, points: finalPoints, combo: comboCount });
    }

    function addCoin(x, y) {
        coins++;
        addScore(200, x, y);
        UI.updateHUD('coins', coins);

        if (coins >= 100) {
            coins -= 100;
            addLife();
        }

        Audio.play('coin');
        emit('coinCollected', { coins, x, y });
    }

    function addLife() {
        lives++;
        UI.updateHUD('lives', lives);
        Audio.play('oneUp');
        emit('lifeGained', lives);
    }

    function killPlayer() {
        lives--;
        UI.updateHUD('lives', lives);

        emit('playerDied');
        Player.die();
    }

    function respawnPlayer() {
        if (currentLevel) {
            Player.spawn(currentLevel.spawnX || 3, currentLevel.spawnY || 10);
            camera.x = 0;
            levelTimer = currentLevel.timeLimit || 400;
            timerInterval = null;

            entities = [];
            if (currentLevel.enemies) {
                currentLevel.enemies.forEach(enemyData => {
                    const enemy = Enemies.create(enemyData);
                    if (enemy) entities.push(enemy);
                });
            }
            Items.loadLevelItems(currentLevel.items || []);
            setState('playing');

            const musicTrack = currentLevel.theme || 'overworld';
            Audio.playMusic(musicTrack);
        }
    }

    function levelComplete() {
        setState('levelComplete');
        const timeBonus = levelTimer * 50;
        addScore(timeBonus);

        emit('levelComplete', {
            timeRemaining: levelTimer,
            timeBonus,
            coins,
            score
        });
    }

    function screenShake(amount, duration) {
        shakeAmount = amount;
        shakeTimer = duration;
    }

    function freeze(frames) {
        freezeFrames = frames;
    }

    function triggerSlowMotion(duration) {
        slowMotion = true;
        slowMotionTimer = duration;
    }

    function transition(type, callback) {
        const overlay = document.getElementById('transition-overlay');
        if (!overlay) {
            if (callback) callback();
            return;
        }

        overlay.className = '';
        overlay.style.display = 'block';

        if (type === 'circleWipe') {
            overlay.classList.add('circle-wipe');
            setTimeout(() => {
                if (callback) callback();
                overlay.classList.remove('circle-wipe');
                overlay.classList.add('circle-open');
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.className = '';
                }, 1000);
            }, 800);
        } else {
            overlay.style.display = 'none';
            if (callback) callback();
        }
    }

    function resetGame() {
        score = 0;
        coins = 0;
        lives = 5;
        comboCount = 0;
        comboTimer = 0;
        worldId = '1-1';
        UI.updateHUD('score', score);
        UI.updateHUD('coins', coins);
        UI.updateHUD('lives', lives);
        UI.updateHUD('world', worldId);
    }

    function togglePause() {
        paused = !paused;
        if (paused) {
            setState('paused');
            saveProgress();
            emit('paused');
        } else {
            setState('playing');
            emit('resumed');
        }
        return paused;
    }

    function saveProgress() {
        const data = {
            score, coins, lives, worldId,
            playerState: Player.getSaveState(),
            timestamp: Date.now()
        };
        try {
            localStorage.setItem('mario_save', JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    }

    function loadProgress() {
        try {
            const data = JSON.parse(localStorage.getItem('mario_save'));
            if (data) {
                score = data.score || 0;
                coins = data.coins || 0;
                lives = data.lives || 3;
                worldId = data.worldId || '1-1';
                UI.updateHUD('score', score);
                UI.updateHUD('coins', coins);
                UI.updateHUD('lives', lives);
                UI.updateHUD('world', worldId);
                return data;
            }
        } catch (e) {}
        return null;
    }

    function hasSaveData() {
        return localStorage.getItem('mario_save') !== null;
    }

    function getCamera() { return camera; }
    function getScore() { return score; }
    function getCoins() { return coins; }
    function getLives() { return lives; }
    function getFPS() { return fps; }
    function getCurrentLevel() { return currentLevel; }
    function getWorldId() { return worldId; }
    function setWorldId(id) { worldId = id; UI.updateHUD('world', id); }
    function isPaused() { return paused; }
    function getCanvas() { return canvas; }
    function getContext() { return ctx; }
    function getProjectiles() { return projectiles; }
    function getDeltaTime() { return deltaTime; }
    function getGameSpeed() { return gameSpeed; }
    function setGameSpeed(speed) { gameSpeed = speed; }

    return {
        TILE_SIZE, GRAVITY, MAX_FALL_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT, FIXED_STEP,
        init, startGameLoop, setState, getState,
        loadLevel, addEntity, removeEntity, addProjectile,
        getEntities, getEntitiesInRange, getProjectiles,
        addScore, addCoin, addLife, killPlayer, respawnPlayer, levelComplete,
        screenShake, freeze, triggerSlowMotion, transition,
        resetGame, togglePause, saveProgress, loadProgress, hasSaveData,
        getCamera, getScore, getCoins, getLives, getFPS,
        getCurrentLevel, getWorldId, setWorldId, isPaused,
        getCanvas, getContext, getDeltaTime, getGameSpeed, setGameSpeed,
        on, emit, off, handleResize
    };
})();
