// ============================================================
// bosses.js - Boss enemies and special encounters
// ============================================================
VF.Bosses = {
    activeBoss: null,
    bossTimer: 0,
    bossInterval: 180, // seconds between boss spawns
    bossesDefeated: 0,

    TYPES: {
        dreadnought: {
            name: 'Void Dreadnought',
            hp: 800, speed: 60, radius: 50, color: '#f00',
            phases: 3, weapon: 'bossBeam',
            xpReward: 200, creditReward: 500,
            shape: [
                { x: 40, y: 0 }, { x: 20, y: -30 }, { x: -10, y: -40 },
                { x: -35, y: -25 }, { x: -40, y: 0 }, { x: -35, y: 25 },
                { x: -10, y: 40 }, { x: 20, y: 30 }
            ]
        },
        hiveMother: {
            name: 'Hive Mother',
            hp: 600, speed: 40, radius: 45, color: '#0f0',
            phases: 2, weapon: 'enemyHeavy',
            xpReward: 180, creditReward: 400,
            shape: [
                { x: 30, y: 0 }, { x: 15, y: -35 }, { x: -20, y: -30 },
                { x: -35, y: 0 }, { x: -20, y: 30 }, { x: 15, y: 35 }
            ]
        },
        crystalTitan: {
            name: 'Crystal Titan',
            hp: 1000, speed: 30, radius: 55, color: '#f0f',
            phases: 3, weapon: 'enemyHeavy',
            xpReward: 250, creditReward: 600,
            shape: [
                { x: 45, y: 0 }, { x: 20, y: -40 }, { x: -15, y: -35 },
                { x: -40, y: -15 }, { x: -40, y: 15 }, { x: -15, y: 35 }, { x: 20, y: 40 }
            ]
        },
        voidWraith: {
            name: 'Void Wraith',
            hp: 500, speed: 120, radius: 35, color: '#a0f',
            phases: 2, weapon: 'bossBeam',
            xpReward: 220, creditReward: 450,
            shape: [
                { x: 30, y: 0 }, { x: 10, y: -25 }, { x: -25, y: -20 },
                { x: -15, y: 0 }, { x: -25, y: 20 }, { x: 10, y: 25 }
            ]
        }
    },

    init() {
        this.activeBoss = null;
        this.bossTimer = this.bossInterval * 0.5; // First boss comes sooner
        this.bossesDefeated = 0;
        console.log('[Bosses] Initialized');
    },

    update(dt) {
        if (this.activeBoss) {
            this._updateBoss(this.activeBoss, dt);
            return;
        }

        this.bossTimer -= dt;
        if (this.bossTimer <= 0) {
            this.bossTimer = this.bossInterval;
            this.spawnBoss();
        }

        // Warning before boss
        if (this.bossTimer < 10 && this.bossTimer > 9.9) {
            VF.HUD.notify('⚠ WARNING: Hostile signature detected!', '#f00');
            if (VF.Audio) VF.Audio.play('alert');
        }
    },

    spawnBoss() {
        const typeKeys = Object.keys(this.TYPES);
        const typeKey = typeKeys[this.bossesDefeated % typeKeys.length];
        const template = this.TYPES[typeKey];
        const difficulty = 1 + this.bossesDefeated * 0.3;

        const angle = Math.random() * Math.PI * 2;
        const dist = 800;
        const x = VF.Player.x + Math.cos(angle) * dist;
        const y = VF.Player.y + Math.sin(angle) * dist;

        const boss = {
            id: VF.Utils.uid(),
            type: 'enemy',
            isBoss: true,
            enemyType: typeKey,
            name: template.name,
            x, y,
            vx: 0, vy: 0,
            angle: Math.atan2(VF.Player.y - y, VF.Player.x - x),
            hp: template.hp * difficulty,
            maxHp: template.hp * difficulty,
            speed: template.speed,
            radius: template.radius,
            color: template.color,
            shape: template.shape,
            weapon: template.weapon,
            phases: template.phases,
            currentPhase: 1,
            xpReward: template.xpReward,
            creditReward: template.creditReward,
            dead: false,
            layer: 6,
            fireCooldown: 0,
            _attackTimer: 0,
            _patternTimer: 0,
            _pattern: 'approach',
            _spawnTimer: 0,
            _beamAngle: 0,
            _shieldActive: false,
            _shieldHp: 200 * difficulty,

            update(dt) { /* handled by Bosses.update */ },

            takeDamage(amount) {
                if (this._shieldActive && this._shieldHp > 0) {
                    this._shieldHp -= amount;
                    if (this._shieldHp <= 0) {
                        this._shieldActive = false;
                        VF.HUD.notify('Boss shield down!', '#0ff');
                    }
                    if (VF.Particles) VF.Particles.emit('shield_hit', this.x, this.y, 5);
                    return;
                }
                this.hp -= amount;
                // Phase transitions
                const phasePct = 1 - (this.currentPhase / this.phases);
                if (this.hp / this.maxHp < phasePct && this.currentPhase < this.phases) {
                    this.currentPhase++;
                    VF.HUD.notify(`${this.name} enters Phase ${this.currentPhase}!`, '#f00');
                    VF.Renderer.shake(15);
                    VF.Renderer.flash('#f00', 0.3);
                    if (VF.Particles) VF.Particles.emit('shockwave', this.x, this.y, 1);
                    this._shieldActive = true;
                    this._shieldHp = 150;
                }
                if (this.hp <= 0) this.die();
            },

            die() {
                this.dead = true;
                VF.Player.kills++;
                VF.Player.addXP(this.xpReward);
                VF.Player.credits += this.creditReward;
                VF.Bosses.bossesDefeated++;
                VF.Bosses.activeBoss = null;

                if (VF.Particles) {
                    VF.Particles.emit('explosion', this.x, this.y, 80);
                    VF.Particles.emit('shockwave', this.x, this.y, 1);
                    // Multiple delayed explosions
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => {
                            if (VF.Particles) {
                                VF.Particles.emit('explosion',
                                    this.x + VF.Utils.rand(-40, 40),
                                    this.y + VF.Utils.rand(-40, 40), 30);
                            }
                        }, i * 200);
                    }
                }
                VF.Renderer.shake(25);
                VF.Renderer.flash('#fff', 1);
                if (VF.Audio) VF.Audio.play('explosion_large');
                if (VF.Loot) VF.Loot.dropBossLoot(this);
                VF.HUD.notify(`${this.name} DESTROYED! +${this.creditReward}⬡`, '#ff0');
                VF.Engine.emit('bossDefeated', this);
            },

            render(ctx) {
                if (this.dead) return;
                VF.Camera.begin(ctx);

                // Shield
                if (this._shieldActive) {
                    const pulse = 0.5 + Math.sin(VF.Engine.time.elapsed * 4) * 0.2;
                    ctx.save();
                    ctx.globalAlpha = pulse;
                    VF.Renderer.drawCircle(ctx, this.x, this.y, this.radius + 15,
                        'rgba(100,200,255,0.1)', 'rgba(100,200,255,0.5)', 2);
                    ctx.restore();
                }

                // Body
                VF.Renderer.drawPolygon(ctx, this.x, this.y, this.shape, this.angle, 1,
                    this.color, 'rgba(60,0,0,0.7)', 2);

                // Inner glow
                const glowPulse = 0.5 + Math.sin(VF.Engine.time.elapsed * 2) * 0.3;
                ctx.save();
                ctx.globalAlpha = glowPulse;
                VF.Renderer.drawCircle(ctx, this.x, this.y, this.radius * 0.4, this.color + '44', null);
                ctx.restore();

                // HP bar
                const barW = this.radius * 3;
                const barH = 6;
                VF.Renderer.drawBar(ctx, this.x - barW / 2, this.y - this.radius - 20,
                    barW, barH, this.hp, this.maxHp, '#200', '#f00', '#f00');

                // Phase indicators
                for (let i = 0; i < this.phases; i++) {
                    const px = this.x - barW / 2 + (i / this.phases) * barW;
                    ctx.fillStyle = i < this.currentPhase ? '#ff0' : '#440';
                    ctx.fillRect(px, this.y - this.radius - 26, 6, 4);
                }

                // Name
                ctx.font = '11px Courier New';
                ctx.fillStyle = '#f44';
                ctx.textAlign = 'center';
                ctx.fillText(this.name, this.x, this.y - this.radius - 30);

                VF.Camera.end(ctx);
            },

            onDestroy() {}
        };

        this.activeBoss = boss;
        VF.Engine.addEntity(boss);
        VF.HUD.notify(`⚠ ${template.name} has appeared!`, '#f00');
        VF.Renderer.shake(10);
        if (VF.Audio) VF.Audio.play('alert');
    },

    _updateBoss(boss, dt) {
        if (boss.dead) { this.activeBoss = null; return; }

        const player = VF.Player;
        if (player.dead) return;

        const dist = VF.Vec2.dist(boss, player);
        const toPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);

        boss._attackTimer += dt;
        boss._patternTimer += dt;

        // Rotate towards player
        boss.angle = VF.MathUtils.rotateTowards(boss.angle, toPlayer, 1.5 * dt);

        // Pattern switching
        if (boss._patternTimer > 5) {
            boss._patternTimer = 0;
            const patterns = ['approach', 'circle', 'charge', 'spawn'];
            if (boss.currentPhase >= 2) patterns.push('beam');
            boss._pattern = VF.Utils.randPick(patterns);
        }

        // Execute pattern
        switch (boss._pattern) {
            case 'approach':
                if (dist > 300) {
                    boss.vx += Math.cos(toPlayer) * boss.speed * 2 * dt;
                    boss.vy += Math.sin(toPlayer) * boss.speed * 2 * dt;
                }
                if (boss._attackTimer > 0.3) {
                    boss._attackTimer = 0;
                    VF.Weapons.fire(boss, boss.weapon);
                }
                break;

            case 'circle':
                const perpAngle = toPlayer + Math.PI / 2;
                boss.vx += Math.cos(perpAngle) * boss.speed * 2 * dt;
                boss.vy += Math.sin(perpAngle) * boss.speed * 2 * dt;
                if (boss._attackTimer > 0.2) {
                    boss._attackTimer = 0;
                    VF.Weapons.fire(boss, 'enemyBasic');
                }
                break;

            case 'charge':
                boss.vx += Math.cos(toPlayer) * boss.speed * 5 * dt;
                boss.vy += Math.sin(toPlayer) * boss.speed * 5 * dt;
                if (dist < boss.radius + player.radius + 20) {
                    player.takeDamage(30);
                    VF.Renderer.shake(15);
                    boss._pattern = 'approach';
                }
                break;

            case 'spawn':
                boss._spawnTimer += dt;
                if (boss._spawnTimer > 1.5) {
                    boss._spawnTimer = 0;
                    const spawnAngle = Math.random() * Math.PI * 2;
                    VF.Enemies.createEnemy('drone',
                        boss.x + Math.cos(spawnAngle) * 60,
                        boss.y + Math.sin(spawnAngle) * 60);
                }
                boss.vx *= 0.95;
                boss.vy *= 0.95;
                break;

            case 'beam':
                boss._beamAngle += 1.5 * dt;
                if (boss._attackTimer > 0.05) {
                    boss._attackTimer = 0;
                    const beamDir = toPlayer + Math.sin(boss._beamAngle) * 0.5;
                    const tempAngle = boss.angle;
                    boss.angle = beamDir;
                    VF.Weapons.fire(boss, 'bossBeam');
                    boss.angle = tempAngle;
                }
                boss.vx *= 0.95;
                boss.vy *= 0.95;
                break;
        }

        // Clamp speed
        const spd = Math.sqrt(boss.vx * boss.vx + boss.vy * boss.vy);
        const maxSpd = boss.speed * (boss._pattern === 'charge' ? 3 : 1);
        if (spd > maxSpd) {
            boss.vx = (boss.vx / spd) * maxSpd;
            boss.vy = (boss.vy / spd) * maxSpd;
        }
        boss.vx *= 0.98;
        boss.vy *= 0.98;

        boss.x += boss.vx * dt;
        boss.y += boss.vy * dt;
    },

    // Render boss health bar at top of screen
    renderBossBar(ctx) {
        if (!this.activeBoss || this.activeBoss.dead) return;

        const boss = this.activeBoss;
        const w = VF.Engine.width;
        const barW = 400, barH = 12;
        const x = (w - barW) / 2;
        const y = 15;

        // Name
        ctx.font = '14px Courier New';
        ctx.fillStyle = '#f44';
        ctx.textAlign = 'center';
        ctx.fillText(`⚠ ${boss.name} ⚠`, w / 2, y - 2);

        // HP bar
        VF.Renderer.drawBar(ctx, x, y + 2, barW, barH, boss.hp, boss.maxHp, '#200', '#f00', '#f44');

        // Phase text
        ctx.font = '10px Courier New';
        ctx.fillStyle = '#f88';
        ctx.fillText(`Phase ${boss.currentPhase}/${boss.phases}`, w / 2, y + barH + 14);
    }
};
