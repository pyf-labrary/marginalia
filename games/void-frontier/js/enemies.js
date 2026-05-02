// ============================================================
// enemies.js - Enemy types, spawning, formations
// ============================================================
VF.Enemies = {
    spawnTimer: 0,
    spawnInterval: 3,
    maxEnemies: 25,
    waveNumber: 0,
    difficulty: 1,

    TYPES: {
        scout: {
            name: 'Scout', hp: 30, speed: 220, radius: 12, damage: 8,
            weapon: 'enemyBasic', fireRate: 1.5, xp: 15, credits: 10,
            color: '#f44', shape: [
                { x: 14, y: 0 }, { x: -8, y: -10 }, { x: -4, y: 0 }, { x: -8, y: 10 }
            ],
            ai: 'chase', aggroRange: 500, fleeHpPct: 0.2
        },
        fighter: {
            name: 'Fighter', hp: 60, speed: 180, radius: 16, damage: 12,
            weapon: 'enemyBasic', fireRate: 1, xp: 25, credits: 20,
            color: '#f80', shape: [
                { x: 16, y: 0 }, { x: -6, y: -14 }, { x: -10, y: -8 },
                { x: -10, y: 8 }, { x: -6, y: 14 }
            ],
            ai: 'strafe', aggroRange: 600, fleeHpPct: 0.15
        },
        bomber: {
            name: 'Bomber', hp: 100, speed: 120, radius: 20, damage: 20,
            weapon: 'enemyHeavy', fireRate: 0.5, xp: 40, credits: 35,
            color: '#f0f', shape: [
                { x: 12, y: 0 }, { x: 4, y: -18 }, { x: -14, y: -14 },
                { x: -14, y: 14 }, { x: 4, y: 18 }
            ],
            ai: 'approach', aggroRange: 700, fleeHpPct: 0.1
        },
        interceptor: {
            name: 'Interceptor', hp: 40, speed: 300, radius: 10, damage: 10,
            weapon: 'enemyBasic', fireRate: 2, xp: 30, credits: 25,
            color: '#ff0', shape: [
                { x: 16, y: 0 }, { x: -4, y: -8 }, { x: -12, y: -4 },
                { x: -12, y: 4 }, { x: -4, y: 8 }
            ],
            ai: 'flank', aggroRange: 800, fleeHpPct: 0.3
        },
        destroyer: {
            name: 'Destroyer', hp: 200, speed: 80, radius: 28, damage: 25,
            weapon: 'enemyHeavy', fireRate: 0.8, xp: 60, credits: 50,
            color: '#a0f', shape: [
                { x: 20, y: 0 }, { x: 8, y: -20 }, { x: -16, y: -22 },
                { x: -20, y: 0 }, { x: -16, y: 22 }, { x: 8, y: 20 }
            ],
            ai: 'approach', aggroRange: 600, fleeHpPct: 0
        },
        drone: {
            name: 'Drone', hp: 15, speed: 250, radius: 8, damage: 5,
            weapon: 'enemyBasic', fireRate: 2, xp: 8, credits: 5,
            color: '#4f4', shape: [
                { x: 8, y: 0 }, { x: -4, y: -8 }, { x: -4, y: 8 }
            ],
            ai: 'swarm', aggroRange: 400, fleeHpPct: 0
        }
    },

    init() {
        this.spawnTimer = 2;
        this.waveNumber = 0;
        this.difficulty = 1;
        console.log('[Enemies] Initialized');
    },

    createEnemy(typeName, x, y) {
        const template = this.TYPES[typeName];
        if (!template) return null;

        const diffMul = 1 + (this.difficulty - 1) * 0.15;
        const enemy = {
            id: VF.Utils.uid(),
            type: 'enemy',
            enemyType: typeName,
            x, y,
            vx: 0, vy: 0,
            angle: Math.random() * Math.PI * 2,
            hp: template.hp * diffMul,
            maxHp: template.hp * diffMul,
            speed: template.speed,
            radius: template.radius,
            damage: template.damage * diffMul,
            weapon: template.weapon,
            fireRate: template.fireRate,
            fireCooldown: Math.random() * template.fireRate,
            color: template.color,
            shape: template.shape,
            ai: template.ai,
            aggroRange: template.aggroRange,
            fleeHpPct: template.fleeHpPct,
            xpReward: template.xp,
            creditReward: template.credits,
            dead: false,
            layer: 5,
            stunTime: 0,
            _aiState: 'idle',
            _aiTimer: 0,
            _strafeDir: Math.random() > 0.5 ? 1 : -1,
            _flankAngle: VF.Utils.rand(-Math.PI, Math.PI),
            _formationOffset: VF.Vec2.zero(),

            update(dt) {
                if (this.dead) return;
                if (this.stunTime > 0) { this.stunTime -= dt; return; }
                VF.EnemyAI.update(this, dt);
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.fireCooldown -= dt;
            },

            takeDamage(amount) {
                this.hp -= amount;
                if (this.hp <= 0) {
                    this.hp = 0;
                    this.die();
                }
            },

            die() {
                this.dead = true;
                VF.Player.kills++;
                VF.Player.addXP(this.xpReward);
                VF.Player.credits += this.creditReward;
                if (VF.Particles) {
                    VF.Particles.emit('explosion', this.x, this.y, 20);
                }
                if (VF.Loot) VF.Loot.dropFromEnemy(this);
                if (VF.Audio) VF.Audio.play('explosion_small');
                VF.Engine.emit('enemyKilled', this);
            },

            render(ctx) {
                if (this.dead) return;
                if (!VF.Camera.isVisible(this.x, this.y, this.radius + 20)) return;

                VF.Camera.begin(ctx);

                // Ship body
                VF.Renderer.drawPolygon(ctx, this.x, this.y, this.shape, this.angle, 1,
                    this.color, 'rgba(40,0,0,0.6)', 1.5);

                // HP bar (only if damaged)
                if (this.hp < this.maxHp) {
                    const barW = this.radius * 2;
                    const barH = 3;
                    const barX = this.x - barW / 2;
                    const barY = this.y - this.radius - 10;
                    VF.Renderer.drawBar(ctx, barX, barY, barW, barH,
                        this.hp, this.maxHp, '#300', '#f44', '#f44');
                }

                VF.Camera.end(ctx);
            },

            onDestroy() {}
        };

        return VF.Engine.addEntity(enemy);
    },

    update(dt) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnInterval;
            this._trySpawn();
        }

        // Increase difficulty over time
        this.difficulty = 1 + VF.Engine.time.elapsed / 120; // +1 every 2 minutes
        this.spawnInterval = Math.max(1, 3 - this.difficulty * 0.2);
    },

    _trySpawn() {
        const currentEnemies = VF.Engine.getEntitiesByType('enemy');
        if (currentEnemies.length >= this.maxEnemies) return;

        const player = VF.Player;
        if (player.dead) return;

        // Spawn at random position around player
        const angle = Math.random() * Math.PI * 2;
        const dist = VF.Utils.rand(600, 1200);
        const x = player.x + Math.cos(angle) * dist;
        const y = player.y + Math.sin(angle) * dist;

        // Choose enemy type based on difficulty
        const types = this._getSpawnableTypes();
        const typeName = VF.Utils.randPick(types);

        // Sometimes spawn formations
        if (Math.random() < 0.3 && currentEnemies.length < this.maxEnemies - 3) {
            this._spawnFormation(typeName, x, y);
        } else {
            this.createEnemy(typeName, x, y);
        }
    },

    _getSpawnableTypes() {
        const types = ['scout', 'drone'];
        if (this.difficulty >= 1.5) types.push('fighter', 'fighter');
        if (this.difficulty >= 2) types.push('interceptor');
        if (this.difficulty >= 3) types.push('bomber');
        if (this.difficulty >= 4) types.push('destroyer');
        return types;
    },

    _spawnFormation(typeName, cx, cy) {
        const formations = ['line', 'v', 'circle'];
        const formation = VF.Utils.randPick(formations);
        const count = VF.Utils.randInt(3, 5);
        const spacing = 60;

        for (let i = 0; i < count; i++) {
            let ox = 0, oy = 0;
            switch (formation) {
                case 'line':
                    ox = (i - count / 2) * spacing;
                    break;
                case 'v':
                    ox = Math.abs(i - count / 2) * spacing;
                    oy = (i - count / 2) * spacing * 0.6;
                    break;
                case 'circle':
                    const a = (i / count) * Math.PI * 2;
                    ox = Math.cos(a) * spacing;
                    oy = Math.sin(a) * spacing;
                    break;
            }
            const enemy = this.createEnemy(typeName, cx + ox, cy + oy);
            if (enemy) {
                enemy._formationOffset = { x: ox, y: oy };
            }
        }
    },

    clearAll() {
        const enemies = VF.Engine.getEntitiesByType('enemy');
        for (const e of enemies) e.dead = true;
    },

    // Wave system for arena-style combat
    _waveActive: false,
    _waveEnemies: 0,
    _waveReward: 0,

    startWave(waveNum) {
        this._waveActive = true;
        this.waveNumber = waveNum;
        const count = 5 + waveNum * 3;
        this._waveEnemies = count;
        this._waveReward = waveNum * 50;

        VF.HUD.notify(`⚔ WAVE ${waveNum} - ${count} enemies incoming!`, '#f44');
        if (VF.Audio) VF.Audio.play('alert');

        // Spawn wave enemies
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (!this._waveActive) return;
                const angle = Math.random() * Math.PI * 2;
                const dist = VF.Utils.rand(600, 1000);
                const types = this._getSpawnableTypes();
                this.createEnemy(VF.Utils.randPick(types),
                    VF.Player.x + Math.cos(angle) * dist,
                    VF.Player.y + Math.sin(angle) * dist);
            }, i * 500);
        }
    },

    checkWaveComplete() {
        if (!this._waveActive) return;
        const enemies = VF.Engine.getEntitiesByType('enemy');
        if (enemies.length === 0) {
            this._waveActive = false;
            VF.Player.credits += this._waveReward;
            VF.HUD.notify(`Wave ${this.waveNumber} complete! +${this._waveReward}⬡`, '#0f0');
            if (VF.Audio) VF.Audio.play('upgrade');
        }
    },

    // Elite enemy variants
    createElite(typeName, x, y) {
        const enemy = this.createEnemy(typeName, x, y);
        if (!enemy) return null;

        // Elite modifications
        enemy.hp *= 2.5;
        enemy.maxHp *= 2.5;
        enemy.speed *= 1.2;
        enemy.xpReward *= 3;
        enemy.creditReward *= 3;
        enemy._isElite = true;

        // Visual indicator
        const origRender = enemy.render.bind(enemy);
        enemy.render = function(ctx) {
            origRender(ctx);
            if (this.dead) return;
            if (!VF.Camera.isVisible(this.x, this.y, this.radius + 20)) return;
            VF.Camera.begin(ctx);
            // Elite crown/star indicator
            ctx.save();
            ctx.font = '12px Courier New';
            ctx.fillStyle = '#ff0';
            ctx.textAlign = 'center';
            ctx.fillText('★', this.x, this.y - this.radius - 15);
            ctx.restore();
            VF.Camera.end(ctx);
        };

        return enemy;
    },

    // Get enemy count by type
    getCountByType(typeName) {
        return VF.Engine.getEntitiesByType('enemy').filter(e => e.enemyType === typeName).length;
    },

    // Spawn a patrol group that follows a path
    spawnPatrol(path, typeName, count) {
        for (let i = 0; i < count; i++) {
            const pathIdx = i % path.length;
            const enemy = this.createEnemy(typeName, path[pathIdx].x, path[pathIdx].y);
            if (enemy) {
                enemy._patrolPath = path;
                enemy._patrolIndex = pathIdx;
                enemy.ai = 'patrol';
            }
        }
    }
};
