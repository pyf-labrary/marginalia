// ============================================================
// engine.js - Core game engine: loop, entity management, state
// ============================================================
VF.Engine = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    running: false,
    paused: false,
    state: 'loading', // loading, menu, playing, paused, dead
    time: { now: 0, dt: 0, elapsed: 0, frame: 0, fps: 0, _fpsTimer: 0, _fpsCount: 0 },
    entities: [],
    systems: [],
    _rafId: null,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        VF.Utils.applyMixin(this, VF.Utils.EventEmitter);
        console.log('[Engine] Initialized');
    },

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.emit && this.emit('resize', this.width, this.height);
    },

    start() {
        if (this.running) return;
        this.running = true;
        this.time.now = performance.now();
        this._loop(performance.now());
        console.log('[Engine] Started');
    },

    stop() {
        this.running = false;
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = null;
    },

    _loop(timestamp) {
        if (!this.running) return;
        this._rafId = requestAnimationFrame(t => this._loop(t));

        const dt = Math.min((timestamp - this.time.now) / 1000, 0.05); // cap at 50ms
        this.time.now = timestamp;
        this.time.dt = dt;
        this.time.frame++;

        // FPS counter
        this.time._fpsCount++;
        this.time._fpsTimer += dt;
        if (this.time._fpsTimer >= 1) {
            this.time.fps = this.time._fpsCount;
            this.time._fpsCount = 0;
            this.time._fpsTimer -= 1;
        }

        if (this.state === 'playing' && !this.paused) {
            this.time.elapsed += dt;
            this.update(dt);
        }

        this.render();
    },

    update(dt) {
        // Update all registered systems
        for (const sys of this.systems) {
            if (sys.update) sys.update(dt);
        }
        // Update entities
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const e = this.entities[i];
            if (e.dead) {
                this.entities.splice(i, 1);
                if (e.onDestroy) e.onDestroy();
                continue;
            }
            if (e.update) e.update(dt);
        }
        this.emit('update', dt);
    },

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Render all systems
        for (const sys of this.systems) {
            if (sys.render) sys.render(ctx);
        }
        // Render entities sorted by layer
        const sorted = this.entities.filter(e => e.render).sort((a, b) => (a.layer || 0) - (b.layer || 0));
        for (const e of sorted) {
            e.render(ctx);
        }
        this.emit('render', ctx);
    },

    addEntity(entity) {
        entity.id = entity.id || VF.Utils.uid();
        this.entities.push(entity);
        return entity;
    },

    removeEntity(entity) {
        entity.dead = true;
    },

    getEntitiesByType(type) {
        return this.entities.filter(e => e.type === type && !e.dead);
    },

    addSystem(system) {
        this.systems.push(system);
        if (system.init) system.init();
        return system;
    },

    clearEntities() {
        for (const e of this.entities) {
            if (e.onDestroy) e.onDestroy();
        }
        this.entities = [];
    },

    setState(newState) {
        const old = this.state;
        this.state = newState;
        this.emit('stateChange', newState, old);
        console.log(`[Engine] State: ${old} -> ${newState}`);
    },

    pause() {
        this.paused = true;
        this.setState('paused');
    },

    resume() {
        this.paused = false;
        this.setState('playing');
    },

    // Performance monitoring
    _perfStats: { updateTime: 0, renderTime: 0, entityCount: 0 },

    getPerfStats() {
        this._perfStats.entityCount = this.entities.length;
        return this._perfStats;
    },

    // Tween system for smooth animations
    _tweens: [],

    tween(target, props, duration, easing = 'outQuad', onComplete = null) {
        const tween = {
            target,
            startProps: {},
            endProps: props,
            duration,
            elapsed: 0,
            easing: VF.Utils.Ease[easing] || VF.Utils.Ease.linear,
            onComplete,
            done: false
        };
        for (const key of Object.keys(props)) {
            tween.startProps[key] = target[key];
        }
        this._tweens.push(tween);
        return tween;
    },

    updateTweens(dt) {
        for (let i = this._tweens.length - 1; i >= 0; i--) {
            const tw = this._tweens[i];
            tw.elapsed += dt;
            const t = Math.min(tw.elapsed / tw.duration, 1);
            const eased = tw.easing(t);

            for (const [key, endVal] of Object.entries(tw.endProps)) {
                tw.target[key] = tw.startProps[key] + (endVal - tw.startProps[key]) * eased;
            }

            if (t >= 1) {
                tw.done = true;
                if (tw.onComplete) tw.onComplete();
                this._tweens.splice(i, 1);
            }
        }
    },

    // Delayed action queue
    _delayedActions: [],

    delay(seconds, callback) {
        this._delayedActions.push({ remaining: seconds, callback });
    },

    updateDelayed(dt) {
        for (let i = this._delayedActions.length - 1; i >= 0; i--) {
            this._delayedActions[i].remaining -= dt;
            if (this._delayedActions[i].remaining <= 0) {
                this._delayedActions[i].callback();
                this._delayedActions.splice(i, 1);
            }
        }
    },

    // Achievement tracking
    achievements: {
        first_kill: { name: 'First Blood', desc: 'Destroy your first enemy', unlocked: false },
        kill_100: { name: 'Centurion', desc: 'Destroy 100 enemies', unlocked: false },
        kill_500: { name: 'Destroyer', desc: 'Destroy 500 enemies', unlocked: false },
        boss_slayer: { name: 'Boss Slayer', desc: 'Defeat a boss', unlocked: false },
        explorer: { name: 'Explorer', desc: 'Discover 10 star systems', unlocked: false },
        rich: { name: 'Wealthy', desc: 'Accumulate 10000 credits', unlocked: false },
        survivor: { name: 'Survivor', desc: 'Survive for 10 minutes', unlocked: false },
        max_level: { name: 'Veteran', desc: 'Reach level 10', unlocked: false },
        warp_master: { name: 'Warp Master', desc: 'Use warp drive 10 times', unlocked: false },
        diplomat: { name: 'Diplomat', desc: 'Become allied with a faction', unlocked: false }
    },

    _warpCount: 0,
    _discoveredCount: 0,

    checkAchievements() {
        const a = this.achievements;
        const p = VF.Player;

        if (!a.first_kill.unlocked && p.kills >= 1) this.unlockAchievement('first_kill');
        if (!a.kill_100.unlocked && p.kills >= 100) this.unlockAchievement('kill_100');
        if (!a.kill_500.unlocked && p.kills >= 500) this.unlockAchievement('kill_500');
        if (!a.boss_slayer.unlocked && VF.Bosses.bossesDefeated >= 1) this.unlockAchievement('boss_slayer');
        if (!a.rich.unlocked && p.credits >= 10000) this.unlockAchievement('rich');
        if (!a.survivor.unlocked && this.time.elapsed >= 600) this.unlockAchievement('survivor');
        if (!a.max_level.unlocked && p.level >= 10) this.unlockAchievement('max_level');
    },

    unlockAchievement(key) {
        if (this.achievements[key].unlocked) return;
        this.achievements[key].unlocked = true;
        VF.HUD.notify(`🏆 Achievement: ${this.achievements[key].name}`, '#ff0');
        if (VF.Audio) VF.Audio.play('upgrade');
        if (VF.Particles) VF.Particles.emit('levelUp', VF.Player.x, VF.Player.y, 25);
    }
};
