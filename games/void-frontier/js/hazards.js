// ============================================================
// hazards.js - Environmental hazards: radiation, mines, storms
// ============================================================
VF.Hazards = {
    zones: [],
    mines: [],
    maxMines: 30,
    _spawnTimer: 0,

    ZONE_TYPES: {
        radiation: {
            name: 'Radiation Zone', color: '#0f0', damagePerSec: 5,
            warningText: '⚠ RADIATION DETECTED', radius: [200, 500]
        },
        emp: {
            name: 'EMP Field', color: '#44f', damagePerSec: 0,
            warningText: '⚠ EMP INTERFERENCE', radius: [150, 400],
            effect: 'drain_energy'
        },
        gravity_well: {
            name: 'Gravity Well', color: '#f80', damagePerSec: 0,
            warningText: '⚠ GRAVITATIONAL ANOMALY', radius: [200, 600],
            effect: 'pull'
        },
        plasma_storm: {
            name: 'Plasma Storm', color: '#f0f', damagePerSec: 8,
            warningText: '⚠ PLASMA STORM', radius: [300, 700]
        },
        dark_zone: {
            name: 'Dark Zone', color: '#222', damagePerSec: 0,
            warningText: '⚠ SENSOR BLACKOUT', radius: [400, 800],
            effect: 'blind'
        }
    },

    init() {
        this.zones = [];
        this.mines = [];
        this._spawnTimer = 0;
        this._generateInitialZones();
        console.log('[Hazards] Initialized');
    },

    _generateInitialZones() {
        const types = Object.keys(this.ZONE_TYPES);
        for (let i = 0; i < 5; i++) {
            const type = VF.Utils.randPick(types);
            const template = this.ZONE_TYPES[type];
            this.zones.push({
                id: VF.Utils.uid(),
                type,
                x: VF.Utils.rand(-3000, 3000),
                y: VF.Utils.rand(-3000, 3000),
                radius: VF.Utils.rand(template.radius[0], template.radius[1]),
                damagePerSec: template.damagePerSec,
                effect: template.effect,
                color: template.color,
                name: template.name,
                warningText: template.warningText,
                _warned: false,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    },

    createMine(x, y) {
        if (this.mines.length >= this.maxMines) return;
        this.mines.push({
            id: VF.Utils.uid(),
            x, y,
            radius: 8,
            triggerRadius: 80,
            explosionRadius: 120,
            damage: 40,
            armed: true,
            _blinkTimer: 0,
            _blinkOn: true
        });
    },

    update(dt) {
        const player = VF.Player;
        if (player.dead) return;

        // Check hazard zones
        for (const zone of this.zones) {
            const dist = VF.Vec2.dist(player, zone);
            if (dist < zone.radius) {
                // Player is in hazard zone
                if (!zone._warned) {
                    zone._warned = true;
                    VF.HUD.notify(zone.warningText, zone.color);
                }

                // Apply damage
                if (zone.damagePerSec > 0) {
                    player.takeDamage(zone.damagePerSec * dt);
                }

                // Apply effects
                if (zone.effect === 'drain_energy') {
                    player.energy = Math.max(0, player.energy - 20 * dt);
                } else if (zone.effect === 'pull') {
                    const pullForce = 150 * (1 - dist / zone.radius);
                    const angle = Math.atan2(zone.y - player.y, zone.x - player.x);
                    player.vx += Math.cos(angle) * pullForce * dt;
                    player.vy += Math.sin(angle) * pullForce * dt;
                }

                // Particles
                if (Math.random() < 0.3) {
                    VF.Particles.emit('sparks', player.x + VF.Utils.rand(-20, 20),
                        player.y + VF.Utils.rand(-20, 20), 1);
                }
            } else {
                if (dist > zone.radius + 100) zone._warned = false;
            }
        }

        // Update mines
        for (let i = this.mines.length - 1; i >= 0; i--) {
            const mine = this.mines[i];
            mine._blinkTimer += dt;
            if (mine._blinkTimer > 0.5) {
                mine._blinkTimer = 0;
                mine._blinkOn = !mine._blinkOn;
            }

            if (!mine.armed) continue;

            const dist = VF.Vec2.dist(player, mine);
            if (dist < mine.triggerRadius) {
                this._detonateMine(mine, i);
            }

            // Also check enemies
            const enemies = VF.Engine.getEntitiesByType('enemy');
            for (const enemy of enemies) {
                if (VF.Vec2.dist(enemy, mine) < mine.triggerRadius) {
                    this._detonateMine(mine, i);
                    break;
                }
            }
        }

        // Spawn mines occasionally
        this._spawnTimer -= dt;
        if (this._spawnTimer <= 0) {
            this._spawnTimer = VF.Utils.rand(10, 20);
            if (this.mines.length < 15) {
                const angle = Math.random() * Math.PI * 2;
                const dist = VF.Utils.rand(400, 1000);
                this.createMine(
                    player.x + Math.cos(angle) * dist,
                    player.y + Math.sin(angle) * dist
                );
            }
        }
    },

    _detonateMine(mine, index) {
        mine.armed = false;
        this.mines.splice(index, 1);

        // Explosion
        if (VF.Particles) {
            VF.Particles.emit('explosion', mine.x, mine.y, 30);
            VF.Particles.emit('shockwave', mine.x, mine.y, 1);
        }
        VF.Renderer.shake(8);
        if (VF.Audio) VF.Audio.play('explosion_small');

        // Damage nearby entities
        const player = VF.Player;
        const distToPlayer = VF.Vec2.dist(player, mine);
        if (distToPlayer < mine.explosionRadius) {
            const falloff = 1 - distToPlayer / mine.explosionRadius;
            player.takeDamage(mine.damage * falloff);
        }

        const enemies = VF.Engine.getEntitiesByType('enemy');
        for (const enemy of enemies) {
            const dist = VF.Vec2.dist(enemy, mine);
            if (dist < mine.explosionRadius) {
                const falloff = 1 - dist / mine.explosionRadius;
                enemy.takeDamage(mine.damage * falloff);
            }
        }
    },

    render(ctx) {
        const cam = VF.Camera;
        const time = VF.Engine.time.elapsed;

        cam.begin(ctx);

        // Render hazard zones
        for (const zone of this.zones) {
            if (!cam.isVisible(zone.x, zone.y, zone.radius)) continue;

            const pulse = 0.3 + Math.sin(time * 1.5 + zone.pulsePhase) * 0.1;

            // Zone area
            ctx.save();
            ctx.globalAlpha = pulse * 0.15;
            const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
            gradient.addColorStop(0, zone.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(zone.x - zone.radius, zone.y - zone.radius, zone.radius * 2, zone.radius * 2);
            ctx.restore();

            // Border
            ctx.save();
            ctx.globalAlpha = pulse * 0.4;
            VF.Renderer.drawDashedCircle(ctx, zone.x, zone.y, zone.radius, zone.color, 8, 8);
            ctx.restore();

            // Label
            if (cam.zoom > 0.4) {
                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.font = '10px Courier New';
                ctx.fillStyle = zone.color;
                ctx.textAlign = 'center';
                ctx.fillText(zone.name, zone.x, zone.y);
                ctx.restore();
            }
        }

        // Render mines
        for (const mine of this.mines) {
            if (!cam.isVisible(mine.x, mine.y, 20)) continue;

            // Mine body
            ctx.save();
            ctx.translate(mine.x, mine.y);

            // Spiky shape
            ctx.fillStyle = '#444';
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const r = i % 2 === 0 ? mine.radius : mine.radius * 1.6;
                if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Blinking light
            if (mine._blinkOn) {
                ctx.fillStyle = '#f00';
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Trigger radius indicator
            ctx.globalAlpha = 0.1;
            VF.Renderer.drawDashedCircle(ctx, 0, 0, mine.triggerRadius, '#f44', 4, 8);

            ctx.restore();
        }

        cam.end(ctx);
    },

    // Generate new zones when entering a new sector
    regenerateForSector(sx, sy) {
        this.zones = [];
        const rng = VF.Utils.seededRNG(sx * 31337 + sy * 65537);
        const types = Object.keys(this.ZONE_TYPES);
        const count = Math.floor(rng() * 4) + 2;

        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(rng() * types.length)];
            const template = this.ZONE_TYPES[type];
            this.zones.push({
                id: VF.Utils.uid(),
                type,
                x: sx * VF.Galaxy.sectorSize + (rng() - 0.5) * VF.Galaxy.sectorSize,
                y: sy * VF.Galaxy.sectorSize + (rng() - 0.5) * VF.Galaxy.sectorSize,
                radius: template.radius[0] + rng() * (template.radius[1] - template.radius[0]),
                damagePerSec: template.damagePerSec,
                effect: template.effect,
                color: template.color,
                name: template.name,
                warningText: template.warningText,
                _warned: false,
                pulsePhase: rng() * Math.PI * 2
            });
        }
    }
};
