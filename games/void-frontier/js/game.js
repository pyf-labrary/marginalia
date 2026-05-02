// ============================================================
// game.js - Main game integration, initialization, game loop
// ============================================================
VF.Game = {
    _loadProgress: 0,
    _loadSteps: 20,
    _introShown: false,

    // ==================== INITIALIZATION ====================
    async boot() {
        console.log('=== VOID FRONTIER ===');
        console.log('Booting game systems...');

        const loadingFill = document.getElementById('loadingFill');
        const loadingText = document.getElementById('loadingText');

        const step = (name, fn) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    loadingText.textContent = name;
                    fn();
                    this._loadProgress++;
                    loadingFill.style.width = (this._loadProgress / this._loadSteps * 100) + '%';
                    resolve();
                }, 50);
            });
        };

        await step('Initializing engine...', () => VF.Engine.init());
        await step('Setting up input...', () => VF.Input.init());
        await step('Initializing camera...', () => VF.Camera.init());
        await step('Loading audio system...', () => VF.Audio.init());
        await step('Generating starfield...', () => VF.Starfield.init());
        await step('Creating nebulae...', () => VF.Nebula.init());
        await step('Generating galaxy...', () => VF.Galaxy.init(Date.now()));
        await step('Initializing player...', () => VF.Player.init());
        await step('Loading weapons...', () => VF.Weapons.init());
        await step('Setting up enemies...', () => VF.Enemies.init());
        await step('Initializing particles...', () => VF.Particles.init());
        await step('Loading resources...', () => VF.Resources.init());
        await step('Setting up upgrades...', () => VF.Upgrades.init());
        await step('Loading missions...', () => VF.Missions.init());
        await step('Initializing trading...', () => VF.Trading.init());
        await step('Loading bosses...', () => VF.Bosses.init());
        await step('Setting up asteroids...', () => VF.Asteroids.init());
        await step('Loading hazards...', () => VF.Hazards.init());
        await step('Initializing loot...', () => VF.Loot.init());
        await step('Loading powerups...', () => VF.Powerups.init());

        // Additional init
        VF.Warp.init();
        VF.Dialog.init();
        VF.Diplomacy.init();
        VF.HUD.init();
        VF.Minimap.init();
        VF.UIMenus.init();
        VF.SaveSystem.init();

        // Register systems with engine
        VF.Engine.addSystem({ update: dt => this.gameUpdate(dt), render: ctx => this.gameRender(ctx) });

        // Setup event handlers
        this._setupEvents();
        this._setupMenuButtons();

        // Start engine
        VF.Engine.start();

        // Hide loading, show menu
        await new Promise(r => setTimeout(r, 500));
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            this.showMainMenu();
        }, 1000);

        console.log('=== BOOT COMPLETE ===');
    },

    // ==================== MENU MANAGEMENT ====================
    showMainMenu() {
        VF.Engine.setState('menu');
        const menu = document.getElementById('mainMenu');
        menu.style.display = 'flex';

        // Show/hide continue button
        const btnContinue = document.getElementById('btnContinue');
        btnContinue.style.display = VF.SaveSystem.hasSave ? 'block' : 'none';

        // Show save info
        if (VF.SaveSystem.hasSave) {
            const info = VF.SaveSystem.getSaveInfo();
            if (info) {
                btnContinue.textContent = `Continue (Lv.${info.level} ${info.playTime})`;
            }
        }
    },

    hideMainMenu() {
        document.getElementById('mainMenu').style.display = 'none';
    },

    showDeathScreen() {
        VF.Engine.setState('dead');
        const screen = document.getElementById('deathScreen');
        screen.style.display = 'flex';
        document.getElementById('deathStats').innerHTML =
            `Time Survived: ${VF.Utils.formatTime(VF.Engine.time.elapsed)}<br>` +
            `Enemies Destroyed: ${VF.Player.kills}<br>` +
            `Level Reached: ${VF.Player.level}<br>` +
            `Credits Earned: ${VF.Utils.formatNum(VF.Player.credits)}`;
    },

    hideDeathScreen() {
        document.getElementById('deathScreen').style.display = 'none';
    },

    newGame() {
        this.hideMainMenu();
        VF.Engine.clearEntities();
        VF.Weapons.clear();
        VF.Particles.clear();

        // Reset all systems
        VF.Player.init();
        VF.Galaxy.init(Date.now());
        VF.Resources.init();
        VF.Upgrades.init();
        VF.Enemies.init();
        VF.Bosses.init();
        VF.Missions.init();
        VF.Warp.init();
        VF.Diplomacy.init();
        VF.Hazards.init();

        VF.Camera.setPosition(0, 0);
        VF.Camera.targetZoom = 1;
        VF.Engine.time.elapsed = 0;

        VF.Engine.setState('playing');
        VF.Audio.resume();
        VF.Audio.startMusic();

        // Show intro dialog
        if (!this._introShown) {
            this._introShown = true;
            setTimeout(() => VF.Dialog.start('intro'), 1000);
        }

        // Create initial asteroid field
        VF.Asteroids.createField(300, -200, 15, 400);
    },

    continueGame() {
        this.hideMainMenu();
        VF.Engine.clearEntities();
        VF.Weapons.clear();
        VF.Particles.clear();

        if (VF.SaveSystem.load()) {
            VF.Engine.setState('playing');
            VF.Audio.resume();
            VF.Audio.startMusic();
        } else {
            this.newGame();
        }
    },

    // ==================== GAME UPDATE ====================
    gameUpdate(dt) {
        if (VF.Engine.state !== 'playing') return;

        // Don't update gameplay during dialogs or trading
        const inDialog = VF.Dialog.active;
        const inTrade = VF.Trading.docked;
        const inMenu = VF.UIMenus.isOpen();

        // Always update these
        VF.Starfield.update(dt);
        VF.Nebula.update(dt);
        VF.Particles.update(dt);
        VF.HUD.update(dt);
        VF.Dialog.update(dt);
        VF.Powerups.update(dt);

        if (!inDialog && !inTrade && !inMenu) {
            // Core gameplay updates
            VF.Player.update(dt);
            VF.Camera.follow(VF.Player, dt);
            VF.Input.updateWorldMouse(VF.Camera);

            if (!VF.Warp.isWarping) {
                VF.Weapons.update(dt);
                VF.Enemies.update(dt);
                VF.Bosses.update(dt);
                VF.Asteroids.update(dt);
                VF.Hazards.update(dt);
                VF.Diplomacy.update(dt);
            }

            VF.Warp.update(dt);
            VF.Missions.update(dt);
            VF.Trading.update(dt);
            VF.SaveSystem.update(dt);

            // Galaxy discovery
            VF.Galaxy.updateCurrentSector(VF.Player.x, VF.Player.y);
            VF.Galaxy.discoverNearby(VF.Player.x, VF.Player.y, 300);

            // Random powerup spawns
            if (Math.random() < 0.0005) {
                const angle = Math.random() * Math.PI * 2;
                const dist = VF.Utils.rand(300, 800);
                VF.Powerups.spawnRandom(
                    VF.Player.x + Math.cos(angle) * dist,
                    VF.Player.y + Math.sin(angle) * dist
                );
            }
        }

        // Handle keyboard shortcuts
        this._handleKeys();

        // End frame input
        VF.Input.endFrame();
    },

    // ==================== GAME RENDER ====================
    gameRender(ctx) {
        const w = VF.Engine.width;
        const h = VF.Engine.height;

        // Background layers (screen space)
        VF.Starfield.render(ctx);
        VF.Nebula.render(ctx);

        // World space rendering
        VF.Galaxy.render(ctx);
        VF.Hazards.render(ctx);
        VF.Weapons.render(ctx);
        VF.Particles.render(ctx);
        VF.Player.render(ctx);

        // Warp effects (overlay)
        VF.Warp.render(ctx);

        // Screen flash
        VF.Renderer.renderFlash(ctx, w, h, VF.Engine.time.dt);

        // UI layers (screen space)
        if (VF.Engine.state === 'playing') {
            VF.HUD.render(ctx);
            VF.Minimap.render(ctx);
            VF.Missions.render(ctx);
            VF.Bosses.renderBossBar(ctx);
            VF.Powerups.render(ctx);

            // Menus on top
            VF.Trading.render(ctx);
            VF.UIMenus.render(ctx);
            VF.Dialog.render(ctx);

            // Controls hint (first 30 seconds)
            if (VF.Engine.time.elapsed < 30) {
                this._renderControlsHint(ctx, w, h);
            }
        }
    },

    _renderControlsHint(ctx, w, h) {
        const alpha = Math.max(0, 1 - VF.Engine.time.elapsed / 30);
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.font = '10px Courier New';
        ctx.fillStyle = '#446';
        ctx.textAlign = 'center';
        const hints = [
            'WASD: Move | Mouse: Aim | Click: Fire | Right-Click: Secondary',
            'Shift: Boost | 1-4: Weapons | E: Interact | F: Warp',
            'U: Upgrades | I: Inventory | G: Galaxy Map | M: Minimap | Esc: Pause'
        ];
        for (let i = 0; i < hints.length; i++) {
            ctx.fillText(hints[i], w / 2, h - 80 + i * 14);
        }
        ctx.restore();
    },

    // ==================== INPUT HANDLING ====================
    _handleKeys() {
        const input = VF.Input;

        // Pause
        if (input.justPressed('Escape')) {
            if (VF.Dialog.active) {
                VF.Dialog.close();
            } else if (VF.Trading.docked) {
                VF.Trading.undock();
            } else if (VF.UIMenus.isOpen()) {
                VF.UIMenus.close();
            } else if (VF.Engine.state === 'playing') {
                VF.Engine.pause();
                document.getElementById('pauseOverlay').style.display = 'flex';
            }
        }

        // Menu shortcuts
        if (input.justPressed('KeyU')) VF.UIMenus.toggle('upgrade');
        if (input.justPressed('KeyI')) VF.UIMenus.toggle('inventory');
        if (input.justPressed('KeyG')) VF.UIMenus.toggle('galaxy');
        if (input.justPressed('KeyM')) VF.Minimap.toggle();

        // Quick save
        if (input.justPressed('F5')) VF.SaveSystem.save();

        // Dock/undock
        if (input.justPressed('KeyE') && VF.Trading.docked) {
            VF.Trading.undock();
        }

        // Handle clicks
        if (input.mouse.clicked) {
            if (VF.Trading.docked) {
                VF.Trading.handleClick(input.mouse.x, input.mouse.y);
            } else if (VF.UIMenus.isOpen()) {
                VF.UIMenus.handleClick(input.mouse.x, input.mouse.y);
            }
        }

        // Scroll for menus
        // (handled by camera zoom in camera.js, menus handle separately)
    },

    // ==================== EVENT SETUP ====================
    _setupEvents() {
        VF.Engine.on('playerDeath', () => {
            setTimeout(() => this.showDeathScreen(), 1500);
        });

        VF.Engine.on('dialogAction', action => {
            if (action === 'start_game') {
                // Dialog intro complete
            } else if (action === 'open_trade') {
                // Already docked, just close dialog
            }
        });

        VF.Engine.on('sectorChange', (sx, sy) => {
            VF.Nebula.regenerateForSector(sx, sy);
            VF.Hazards.regenerateForSector(sx, sy);
            VF.HUD.notify(`Entering Sector ${sx},${sy}`, '#088');
        });
    },

    _setupMenuButtons() {
        // Main menu
        document.getElementById('btnNewGame').addEventListener('click', () => {
            VF.Audio.resume();
            VF.Audio.play('menu_click');
            this.newGame();
        });

        document.getElementById('btnContinue').addEventListener('click', () => {
            VF.Audio.resume();
            VF.Audio.play('menu_click');
            this.continueGame();
        });

        document.getElementById('btnSettings').addEventListener('click', () => {
            VF.Audio.play('menu_click');
            VF.HUD.notify('Settings: Use mouse wheel to zoom, F5 to save', '#088');
        });

        document.getElementById('btnCredits').addEventListener('click', () => {
            VF.Audio.play('menu_click');
            VF.HUD.notify('Void Frontier - A Procedural Space Exploration Game', '#0ff');
        });

        // Death screen
        document.getElementById('btnRespawn').addEventListener('click', () => {
            VF.Audio.play('menu_click');
            this.hideDeathScreen();
            VF.Player.respawn();
            VF.Camera.setPosition(VF.Player.x, VF.Player.y);
            VF.Engine.setState('playing');
        });

        document.getElementById('btnDeathMenu').addEventListener('click', () => {
            VF.Audio.play('menu_click');
            this.hideDeathScreen();
            this.showMainMenu();
        });

        // Pause
        document.getElementById('btnResume').addEventListener('click', () => {
            VF.Audio.play('menu_click');
            document.getElementById('pauseOverlay').style.display = 'none';
            VF.Engine.resume();
        });

        document.getElementById('btnPauseMenu').addEventListener('click', () => {
            VF.Audio.play('menu_click');
            document.getElementById('pauseOverlay').style.display = 'none';
            VF.SaveSystem.save();
            this.showMainMenu();
        });
    }
};

// ==================== BOOT ====================
window.addEventListener('load', () => {
    VF.Game.boot().catch(err => {
        console.error('Boot failed:', err);
        document.getElementById('loadingText').textContent = 'Error: ' + err.message;
    });
});

// ==================== TUTORIAL SYSTEM ====================
VF.Tutorial = {
    steps: [
        { trigger: 'start', text: 'Use WASD to move your ship through space.', shown: false },
        { trigger: 'move', text: 'Move your mouse to aim. Click to fire weapons.', shown: false, condition: () => Math.sqrt(VF.Player.vx**2 + VF.Player.vy**2) > 50 },
        { trigger: 'fire', text: 'Hold SHIFT to boost. Watch your energy bar!', shown: false, condition: () => VF.Player.damageDealt > 0 },
        { trigger: 'kill', text: 'Collect loot drops from destroyed enemies.', shown: false, condition: () => VF.Player.kills > 0 },
        { trigger: 'loot', text: 'Press [E] near stations to dock and trade.', shown: false, condition: () => VF.Player.kills > 3 },
        { trigger: 'dock', text: 'Press [U] for upgrades, [I] for inventory.', shown: false, condition: () => VF.Player.kills > 5 },
        { trigger: 'upgrade', text: 'Press [F] to warp to nearby star systems.', shown: false, condition: () => VF.Player.level > 1 },
        { trigger: 'warp', text: 'Explore the galaxy! Discover new systems and factions.', shown: false, condition: () => VF.Bosses.bossesDefeated > 0 }
    ],
    currentStep: 0,
    _checkTimer: 0,

    init() {
        this.currentStep = 0;
        this._checkTimer = 0;
    },

    update(dt) {
        if (this.currentStep >= this.steps.length) return;
        this._checkTimer += dt;
        if (this._checkTimer < 1) return;
        this._checkTimer = 0;

        const step = this.steps[this.currentStep];
        if (step.shown) {
            // Check if condition for next step is met
            if (this.currentStep + 1 < this.steps.length) {
                const next = this.steps[this.currentStep + 1];
                if (next.condition && next.condition()) {
                    this.currentStep++;
                    this._showStep(this.currentStep);
                }
            }
        } else {
            if (!step.condition || step.condition()) {
                this._showStep(this.currentStep);
            }
        }
    },

    _showStep(index) {
        const step = this.steps[index];
        if (step.shown) return;
        step.shown = true;
        VF.HUD.notify(`💡 ${step.text}`, '#0ff', 6);
    }
};

// ==================== WEATHER SYSTEM ====================
VF.Weather = {
    current: 'clear',
    _timer: 0,
    _duration: 0,
    intensity: 0,

    TYPES: {
        clear: { name: 'Clear', color: null, effect: null, probability: 0.5 },
        ion_storm: { name: 'Ion Storm', color: '#44f', effect: 'energy_drain', probability: 0.15,
            desc: 'Electromagnetic interference drains energy' },
        solar_flare: { name: 'Solar Flare', color: '#ff4', effect: 'damage', probability: 0.1,
            desc: 'Intense radiation damages unshielded ships' },
        void_fog: { name: 'Void Fog', color: '#446', effect: 'visibility', probability: 0.15,
            desc: 'Dense space fog reduces visibility' },
        meteor_shower: { name: 'Meteor Shower', color: '#f80', effect: 'meteors', probability: 0.1,
            desc: 'Incoming meteor fragments' }
    },

    init() {
        this.current = 'clear';
        this._timer = VF.Utils.rand(30, 60);
        this._duration = 0;
        this.intensity = 0;
    },

    update(dt) {
        this._timer -= dt;

        if (this._duration > 0) {
            this._duration -= dt;
            this.intensity = Math.min(1, this.intensity + dt * 0.5);

            // Apply weather effects
            this._applyEffects(dt);

            if (this._duration <= 0) {
                this.current = 'clear';
                this.intensity = 0;
                VF.HUD.notify('Weather clearing...', '#088');
            }
        } else {
            this.intensity = Math.max(0, this.intensity - dt * 0.3);
        }

        if (this._timer <= 0) {
            this._timer = VF.Utils.rand(45, 90);
            this._triggerWeather();
        }
    },

    _triggerWeather() {
        const roll = Math.random();
        let cumulative = 0;
        for (const [key, type] of Object.entries(this.TYPES)) {
            cumulative += type.probability;
            if (roll <= cumulative) {
                if (key !== 'clear') {
                    this.current = key;
                    this._duration = VF.Utils.rand(15, 40);
                    VF.HUD.notify(`⚠ ${type.name}: ${type.desc}`, type.color);
                }
                break;
            }
        }
    },

    _applyEffects(dt) {
        const type = this.TYPES[this.current];
        if (!type || !type.effect) return;

        switch (type.effect) {
            case 'energy_drain':
                VF.Player.energy = Math.max(0, VF.Player.energy - 5 * this.intensity * dt);
                break;
            case 'damage':
                if (Math.random() < 0.1 * this.intensity) {
                    VF.Player.takeDamage(2 * this.intensity);
                }
                break;
            case 'meteors':
                if (Math.random() < 0.05 * this.intensity) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = VF.Utils.rand(200, 600);
                    VF.Asteroids.createAsteroid('small',
                        VF.Player.x + Math.cos(angle) * dist,
                        VF.Player.y + Math.sin(angle) * dist);
                }
                break;
        }
    },

    render(ctx) {
        if (this.current === 'clear' || this.intensity <= 0) return;
        const type = this.TYPES[this.current];
        if (!type || !type.color) return;

        const w = VF.Engine.width;
        const h = VF.Engine.height;

        ctx.save();
        ctx.globalAlpha = this.intensity * 0.15;
        ctx.fillStyle = type.color;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // Weather-specific visual effects
        if (this.current === 'void_fog') {
            // Fog particles
            ctx.save();
            ctx.globalAlpha = this.intensity * 0.3;
            for (let i = 0; i < 20; i++) {
                const fx = (Math.sin(VF.Engine.time.elapsed * 0.3 + i * 7) * 0.5 + 0.5) * w;
                const fy = (Math.cos(VF.Engine.time.elapsed * 0.2 + i * 11) * 0.5 + 0.5) * h;
                const fr = 100 + Math.sin(i * 3) * 50;
                const gradient = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
                gradient.addColorStop(0, 'rgba(40,40,60,0.3)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
            }
            ctx.restore();
        }

        if (this.current === 'ion_storm') {
            // Random lightning flashes
            if (Math.random() < 0.02 * this.intensity) {
                const x1 = Math.random() * w;
                const y1 = 0;
                const x2 = x1 + VF.Utils.rand(-200, 200);
                const y2 = VF.Utils.rand(h * 0.3, h);
                VF.Renderer.drawLightning(ctx, x1, y1, x2, y2, '#44f', 6, 30);
            }
        }

        // Weather indicator
        ctx.font = '10px Courier New';
        ctx.fillStyle = type.color;
        ctx.textAlign = 'left';
        ctx.fillText(`☁ ${type.name}`, 20, VF.Engine.height - 60);
    }
};

// ==================== SCORING SYSTEM ====================
VF.Score = {
    current: 0,
    multiplier: 1,
    _multiplierTimer: 0,
    highScore: 0,

    init() {
        this.current = 0;
        this.multiplier = 1;
        this._multiplierTimer = 0;
        try {
            this.highScore = parseInt(localStorage.getItem('vf_highscore') || '0');
        } catch(e) { this.highScore = 0; }
    },

    add(points) {
        const actual = Math.floor(points * this.multiplier);
        this.current += actual;
        if (this.current > this.highScore) {
            this.highScore = this.current;
            try { localStorage.setItem('vf_highscore', this.highScore.toString()); } catch(e) {}
        }
    },

    addMultiplier(amount) {
        this.multiplier = Math.min(10, this.multiplier + amount);
        this._multiplierTimer = 5;
    },

    update(dt) {
        if (this._multiplierTimer > 0) {
            this._multiplierTimer -= dt;
            if (this._multiplierTimer <= 0) {
                this.multiplier = Math.max(1, this.multiplier - 0.5);
                this._multiplierTimer = 3;
            }
        }
    },

    render(ctx) {
        if (VF.Engine.state !== 'playing') return;
        const w = VF.Engine.width;

        ctx.font = '14px Courier New';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`SCORE: ${VF.Utils.formatNum(this.current)}`, w / 2, 20);

        if (this.multiplier > 1) {
            ctx.font = '11px Courier New';
            ctx.fillStyle = '#ff0';
            ctx.fillText(`x${this.multiplier.toFixed(1)}`, w / 2, 36);
        }

        ctx.font = '9px Courier New';
        ctx.fillStyle = '#444';
        ctx.fillText(`HI: ${VF.Utils.formatNum(this.highScore)}`, w / 2, 50);
    }
};
