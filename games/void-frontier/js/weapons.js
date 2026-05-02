// ============================================================
// weapons.js - Weapon types, projectiles, firing mechanics
// ============================================================
VF.Weapons = {
    projectiles: [],
    _spatialHash: null,

    TYPES: {
        laser: {
            name: 'Laser', damage: 12, speed: 800, cooldown: 0.12,
            energyCost: 3, color: '#0ff', size: 3, lifetime: 1.2,
            sound: 'laser', piercing: false, spread: 0.03
        },
        plasma: {
            name: 'Plasma Bolt', damage: 25, speed: 500, cooldown: 0.35,
            energyCost: 8, color: '#f0f', size: 5, lifetime: 1.5,
            sound: 'plasma', piercing: false, spread: 0.05, explosive: true, explosionRadius: 40
        },
        railgun: {
            name: 'Railgun', damage: 60, speed: 1500, cooldown: 0.8,
            energyCost: 20, color: '#ff0', size: 2, lifetime: 0.8,
            sound: 'railgun', piercing: true, spread: 0, trail: true
        },
        scatter: {
            name: 'Scatter Shot', damage: 8, speed: 700, cooldown: 0.3,
            energyCost: 10, color: '#0f0', size: 2, lifetime: 0.6,
            sound: 'scatter', piercing: false, spread: 0.15, count: 5
        },
        missile: {
            name: 'Missile', damage: 45, speed: 350, cooldown: 1.2,
            energyCost: 15, color: '#f80', size: 4, lifetime: 3,
            sound: 'missile', homing: true, turnRate: 3, explosive: true, explosionRadius: 60
        },
        enemyBasic: {
            name: 'Enemy Shot', damage: 8, speed: 400, cooldown: 0.5,
            energyCost: 0, color: '#f44', size: 3, lifetime: 2,
            sound: 'enemy_shot', piercing: false, spread: 0.05
        },
        enemyHeavy: {
            name: 'Heavy Shot', damage: 20, speed: 300, cooldown: 1,
            energyCost: 0, color: '#f80', size: 5, lifetime: 2.5,
            sound: 'enemy_shot', piercing: false, spread: 0.08, explosive: true, explosionRadius: 30
        },
        bossBeam: {
            name: 'Boss Beam', damage: 2, speed: 1200, cooldown: 0.03,
            energyCost: 0, color: '#f0f', size: 2, lifetime: 0.5,
            sound: null, piercing: true, spread: 0.02
        }
    },

    init() {
        this.projectiles = [];
        this._spatialHash = VF.Collision.createSpatialHash(100);
        console.log('[Weapons] Initialized');
    },

    fire(owner, weaponType) {
        const wep = this.TYPES[weaponType];
        if (!wep) return;

        // Check energy
        if (owner === VF.Player && VF.Player.energy < wep.energyCost) return;

        // Set cooldown
        if (owner === VF.Player) {
            VF.Player.fireCooldown = wep.cooldown;
            VF.Player.energy -= wep.energyCost;
        }

        const count = wep.count || 1;
        for (let i = 0; i < count; i++) {
            const spreadAngle = (Math.random() - 0.5) * wep.spread * 2;
            let angle = owner.angle + spreadAngle;

            // For scatter, spread evenly
            if (count > 1) {
                angle = owner.angle + (i / (count - 1) - 0.5) * wep.spread * 4;
            }

            const cos = Math.cos(angle), sin = Math.sin(angle);
            const spawnDist = owner.radius + 5;

            const proj = {
                x: owner.x + cos * spawnDist,
                y: owner.y + sin * spawnDist,
                vx: cos * wep.speed + (owner.vx || 0) * 0.3,
                vy: sin * wep.speed + (owner.vy || 0) * 0.3,
                angle,
                damage: wep.damage,
                speed: wep.speed,
                color: wep.color,
                size: wep.size,
                lifetime: wep.lifetime,
                age: 0,
                owner: owner === VF.Player ? 'player' : 'enemy',
                ownerId: owner.id,
                piercing: wep.piercing,
                homing: wep.homing,
                turnRate: wep.turnRate || 0,
                explosive: wep.explosive,
                explosionRadius: wep.explosionRadius || 0,
                trail: wep.trail,
                dead: false,
                _trailPoints: []
            };
            this.projectiles.push(proj);
        }

        if (wep.sound && VF.Audio) VF.Audio.play(wep.sound);
    },

    update(dt) {
        this._spatialHash.clear();

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.age += dt;

            if (p.age >= p.lifetime || p.dead) {
                if (p.explosive && !p.dead) {
                    this._explode(p);
                }
                this.projectiles.splice(i, 1);
                continue;
            }

            // Homing behavior
            if (p.homing && p.owner === 'player') {
                const target = this._findNearestEnemy(p.x, p.y, 400);
                if (target) {
                    const desired = Math.atan2(target.y - p.y, target.x - p.x);
                    p.angle = VF.MathUtils.rotateTowards(p.angle, desired, p.turnRate * dt);
                    p.vx = Math.cos(p.angle) * p.speed;
                    p.vy = Math.sin(p.angle) * p.speed;
                }
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Trail
            if (p.trail) {
                p._trailPoints.push({ x: p.x, y: p.y, age: 0 });
                if (p._trailPoints.length > 20) p._trailPoints.shift();
                for (const tp of p._trailPoints) tp.age += dt;
            }

            this._spatialHash.insert(p, p.x, p.y, p.size);
        }

        // Collision detection
        this._checkCollisions();
    },

    _findNearestEnemy(x, y, range) {
        const enemies = VF.Engine.getEntitiesByType('enemy');
        let nearest = null, nearestDist = range * range;
        for (const e of enemies) {
            const d = VF.Vec2.distSq({ x, y }, e);
            if (d < nearestDist) { nearestDist = d; nearest = e; }
        }
        return nearest;
    },

    _checkCollisions() {
        const player = VF.Player;

        for (const p of this.projectiles) {
            if (p.dead) continue;

            if (p.owner === 'player') {
                // Check against enemies
                const enemies = VF.Engine.getEntitiesByType('enemy');
                for (const enemy of enemies) {
                    if (VF.Collision.circleCircle(p.x, p.y, p.size, enemy.x, enemy.y, enemy.radius)) {
                        enemy.takeDamage(p.damage);
                        player.damageDealt += p.damage;
                        if (VF.Particles) VF.Particles.emit('hit', p.x, p.y, 4);
                        if (!p.piercing) { p.dead = true; break; }
                    }
                }
                // Check against asteroids
                const asteroids = VF.Engine.getEntitiesByType('asteroid');
                for (const ast of asteroids) {
                    if (VF.Collision.circleCircle(p.x, p.y, p.size, ast.x, ast.y, ast.radius)) {
                        if (ast.takeDamage) ast.takeDamage(p.damage);
                        if (VF.Particles) VF.Particles.emit('sparks', p.x, p.y, 3);
                        if (!p.piercing) { p.dead = true; break; }
                    }
                }
            } else {
                // Enemy projectile vs player
                if (!player.dead && VF.Collision.circleCircle(p.x, p.y, p.size, player.x, player.y, player.radius)) {
                    player.takeDamage(p.damage, p);
                    if (VF.Particles) VF.Particles.emit('hit', p.x, p.y, 4);
                    if (!p.piercing) p.dead = true;
                }
            }
        }
    },

    _explode(p) {
        if (VF.Particles) {
            VF.Particles.emit('explosion', p.x, p.y, 15);
        }
        VF.Renderer.shake(5);

        // Area damage
        const targets = p.owner === 'player' ? VF.Engine.getEntitiesByType('enemy') : [VF.Player];
        for (const t of targets) {
            if (t.dead) continue;
            const dist = VF.Vec2.dist(p, t);
            if (dist < p.explosionRadius) {
                const falloff = 1 - dist / p.explosionRadius;
                const dmg = p.damage * 0.5 * falloff;
                if (t.takeDamage) t.takeDamage(dmg);
            }
        }
    },

    render(ctx) {
        VF.Camera.begin(ctx);

        for (const p of this.projectiles) {
            if (!VF.Camera.isVisible(p.x, p.y, 50)) continue;

            // Trail
            if (p.trail && p._trailPoints.length > 1) {
                ctx.save();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size * 0.5;
                ctx.beginPath();
                ctx.moveTo(p._trailPoints[0].x, p._trailPoints[0].y);
                for (let i = 1; i < p._trailPoints.length; i++) {
                    ctx.globalAlpha = 1 - p._trailPoints[i].age * 3;
                    ctx.lineTo(p._trailPoints[i].x, p._trailPoints[i].y);
                }
                ctx.stroke();
                ctx.restore();
            }

            // Projectile body
            ctx.save();
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = p.color;
            ctx.beginPath();

            if (p.homing) {
                // Missile shape
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillRect(-p.size * 2, -p.size / 2, p.size * 4, p.size);
                ctx.restore();
            } else {
                // Elongated bullet
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillRect(-p.size * 1.5, -p.size / 2, p.size * 3, p.size);
                ctx.restore();
            }
            ctx.restore();
        }

        VF.Camera.end(ctx);
    },

    clear() {
        this.projectiles = [];
    }
};
