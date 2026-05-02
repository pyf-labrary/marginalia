// ============================================================
// loot.js - Loot drops from enemies and asteroids
// ============================================================
VF.Loot = {
    TYPES: {
        credits:    { name: 'Credits',      color: '#ff0', icon: '⬡', pickupSound: 'pickup' },
        health:     { name: 'Health Pack',   color: '#0f0', icon: '+', pickupSound: 'pickup' },
        energy:     { name: 'Energy Cell',   color: '#ff0', icon: '⚡', pickupSound: 'pickup' },
        shield:     { name: 'Shield Charge', color: '#08f', icon: '◎', pickupSound: 'pickup' },
        resource:   { name: 'Resource',      color: '#f8f', icon: '◆', pickupSound: 'pickup' },
        weapon_mod: { name: 'Weapon Mod',    color: '#f80', icon: '★', pickupSound: 'upgrade' },
        rare_drop:  { name: 'Rare Item',     color: '#a0f', icon: '✦', pickupSound: 'upgrade' },
        xp_orb:     { name: 'XP Orb',        color: '#0ff', icon: '●', pickupSound: 'pickup' }
    },

    pickupRange: 50,
    magnetRange: 150,
    magnetSpeed: 400,

    init() {
        console.log('[Loot] Initialized');
    },

    createDrop(x, y, lootType, value = 1) {
        const template = this.TYPES[lootType];
        if (!template) return;

        const angle = Math.random() * Math.PI * 2;
        const speed = VF.Utils.rand(30, 80);

        const loot = {
            id: VF.Utils.uid(),
            type: 'loot',
            lootType,
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 8,
            color: template.color,
            icon: template.icon,
            value,
            dead: false,
            layer: 2,
            age: 0,
            lifetime: 30, // disappear after 30s
            _bobPhase: Math.random() * Math.PI * 2,

            update(dt) {
                this.age += dt;
                if (this.age > this.lifetime) { this.dead = true; return; }

                // Friction
                this.vx *= 0.97;
                this.vy *= 0.97;

                // Magnet towards player
                const player = VF.Player;
                if (!player.dead) {
                    const dist = VF.Vec2.dist(this, player);
                    if (dist < VF.Loot.magnetRange) {
                        const angle = Math.atan2(player.y - this.y, player.x - this.x);
                        const force = (1 - dist / VF.Loot.magnetRange) * VF.Loot.magnetSpeed;
                        this.vx += Math.cos(angle) * force * dt;
                        this.vy += Math.sin(angle) * force * dt;
                    }

                    // Pickup
                    if (dist < VF.Loot.pickupRange) {
                        VF.Loot.pickup(this);
                        this.dead = true;
                        return;
                    }
                }

                this.x += this.vx * dt;
                this.y += this.vy * dt;
            },

            render(ctx) {
                if (!VF.Camera.isVisible(this.x, this.y, 20)) return;

                VF.Camera.begin(ctx);

                const bob = Math.sin(VF.Engine.time.elapsed * 3 + this._bobPhase) * 3;
                const pulse = 0.7 + Math.sin(VF.Engine.time.elapsed * 4 + this._bobPhase) * 0.3;

                // Glow
                ctx.save();
                ctx.globalAlpha = pulse * 0.3;
                VF.Renderer.drawCircle(ctx, this.x, this.y + bob, 12, this.color + '22', null);
                ctx.restore();

                // Icon
                ctx.save();
                ctx.globalAlpha = pulse;
                ctx.font = 'bold 14px Courier New';
                ctx.fillStyle = this.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 8;
                ctx.fillText(this.icon, this.x, this.y + bob);
                ctx.restore();

                // Fade warning when about to expire
                if (this.age > this.lifetime - 5) {
                    const fadeAlpha = (this.lifetime - this.age) / 5;
                    ctx.globalAlpha = fadeAlpha;
                }

                VF.Camera.end(ctx);
            },

            onDestroy() {}
        };

        return VF.Engine.addEntity(loot);
    },

    pickup(lootEntity) {
        const player = VF.Player;
        const type = lootEntity.lootType;
        const value = lootEntity.value;

        switch (type) {
            case 'credits':
                player.credits += value;
                VF.HUD.notify(`+${value}⬡`, '#ff0');
                break;
            case 'health':
                player.heal(value);
                VF.HUD.notify(`+${value} HP`, '#0f0');
                if (VF.Particles) VF.Particles.emit('heal', player.x, player.y, 8);
                break;
            case 'energy':
                player.energy = Math.min(player.maxEnergy, player.energy + value);
                VF.HUD.notify(`+${value} Energy`, '#ff0');
                break;
            case 'shield':
                player.shield = Math.min(player.maxShield, player.shield + value);
                VF.HUD.notify(`+${value} Shield`, '#08f');
                break;
            case 'resource':
                const resTypes = ['iron', 'silicon', 'titanium', 'crystal'];
                const resType = VF.Utils.randPick(resTypes);
                VF.Resources.add(resType, value);
                break;
            case 'weapon_mod':
                // Temporary weapon boost
                player._weaponBoostTimer = (player._weaponBoostTimer || 0) + 15;
                VF.HUD.notify('Weapon Boost! +50% damage for 15s', '#f80');
                break;
            case 'rare_drop':
                const rareRes = ['exotic', 'darkMatter', 'plasma'];
                VF.Resources.add(VF.Utils.randPick(rareRes), value);
                VF.HUD.notify('Rare resource found!', '#a0f');
                break;
            case 'xp_orb':
                player.addXP(value);
                break;
        }

        const template = this.TYPES[type];
        if (template.pickupSound && VF.Audio) VF.Audio.play(template.pickupSound);
        if (VF.Particles) VF.Particles.emit('mineSparkle', lootEntity.x, lootEntity.y, 5);
    },

    dropFromEnemy(enemy) {
        const drops = [];
        // Always drop some credits
        drops.push({ type: 'credits', value: enemy.creditReward || 10 });

        // Random drops
        if (Math.random() < 0.4) drops.push({ type: 'health', value: 15 });
        if (Math.random() < 0.3) drops.push({ type: 'energy', value: 20 });
        if (Math.random() < 0.2) drops.push({ type: 'resource', value: VF.Utils.randInt(1, 3) });
        if (Math.random() < 0.05) drops.push({ type: 'weapon_mod', value: 1 });
        if (Math.random() < 0.02) drops.push({ type: 'rare_drop', value: 1 });
        drops.push({ type: 'xp_orb', value: enemy.xpReward || 10 });

        for (const drop of drops) {
            this.createDrop(
                enemy.x + VF.Utils.rand(-20, 20),
                enemy.y + VF.Utils.rand(-20, 20),
                drop.type, drop.value
            );
        }
    },

    dropFromAsteroid(asteroid) {
        if (Math.random() < 0.3) this.createDrop(asteroid.x, asteroid.y, 'resource', VF.Utils.randInt(1, 3));
        if (Math.random() < 0.1) this.createDrop(asteroid.x, asteroid.y, 'credits', VF.Utils.randInt(5, 20));
        if (Math.random() < 0.03) this.createDrop(asteroid.x, asteroid.y, 'rare_drop', 1);
    },

    dropBossLoot(boss) {
        // Boss drops lots of loot
        for (let i = 0; i < 5; i++) {
            this.createDrop(boss.x + VF.Utils.rand(-40, 40), boss.y + VF.Utils.rand(-40, 40),
                'credits', VF.Utils.randInt(50, 100));
        }
        for (let i = 0; i < 3; i++) {
            this.createDrop(boss.x + VF.Utils.rand(-40, 40), boss.y + VF.Utils.rand(-40, 40),
                'resource', VF.Utils.randInt(3, 8));
        }
        this.createDrop(boss.x, boss.y, 'rare_drop', VF.Utils.randInt(2, 5));
        this.createDrop(boss.x, boss.y, 'weapon_mod', 1);
        this.createDrop(boss.x, boss.y, 'health', 50);
        this.createDrop(boss.x, boss.y, 'shield', 50);
    }
};
