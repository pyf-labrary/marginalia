// ============================================================
// powerups.js - Temporary power-ups and buff system
// ============================================================
VF.Powerups = {
    activeBuffs: [],

    BUFF_TYPES: {
        damage_boost:  { name: 'Damage Boost',   color: '#f80', duration: 20, icon: '⚔', desc: '+50% weapon damage' },
        speed_boost:   { name: 'Speed Boost',     color: '#0ff', duration: 15, icon: '»', desc: '+40% movement speed' },
        shield_regen:  { name: 'Shield Regen',    color: '#08f', duration: 25, icon: '◎', desc: 'Rapid shield regeneration' },
        invulnerable:  { name: 'Invulnerability', color: '#ff0', duration: 8,  icon: '☆', desc: 'Immune to damage' },
        energy_surge:  { name: 'Energy Surge',    color: '#ff0', duration: 20, icon: '⚡', desc: 'Unlimited energy' },
        magnet:        { name: 'Loot Magnet',     color: '#f0f', duration: 30, icon: '✦', desc: 'Increased pickup range' },
        rapid_fire:    { name: 'Rapid Fire',      color: '#f44', duration: 12, icon: '⁂', desc: '2x fire rate' },
        multi_shot:    { name: 'Multi Shot',      color: '#0f0', duration: 15, icon: '⁕', desc: 'Triple projectiles' }
    },

    init() {
        this.activeBuffs = [];
        console.log('[Powerups] Initialized');
    },

    addBuff(buffType) {
        const template = this.BUFF_TYPES[buffType];
        if (!template) return;

        // Check if already active - refresh duration
        const existing = this.activeBuffs.find(b => b.type === buffType);
        if (existing) {
            existing.remaining = template.duration;
            VF.HUD.notify(`${template.name} refreshed!`, template.color);
            return;
        }

        this.activeBuffs.push({
            type: buffType,
            name: template.name,
            color: template.color,
            icon: template.icon,
            remaining: template.duration,
            duration: template.duration
        });

        this._applyBuff(buffType, true);
        VF.HUD.notify(`${template.icon} ${template.name} activated!`, template.color);
        if (VF.Audio) VF.Audio.play('pickup');
    },

    removeBuff(buffType) {
        const idx = this.activeBuffs.findIndex(b => b.type === buffType);
        if (idx !== -1) {
            this._applyBuff(buffType, false);
            this.activeBuffs.splice(idx, 1);
        }
    },

    hasBuff(buffType) {
        return this.activeBuffs.some(b => b.type === buffType);
    },

    _applyBuff(buffType, activate) {
        const player = VF.Player;
        switch (buffType) {
            case 'speed_boost':
                player.speed += activate ? 100 : -100;
                break;
            case 'invulnerable':
                if (activate) player.invulnTime = 999;
                else player.invulnTime = 0;
                break;
            case 'magnet':
                VF.Loot.magnetRange = activate ? 400 : 150;
                break;
        }
    },

    // Get damage multiplier from active buffs
    getDamageMultiplier() {
        let mul = 1;
        if (this.hasBuff('damage_boost')) mul *= 1.5;
        if (VF.Player._weaponBoostTimer > 0) mul *= 1.5;
        return mul;
    },

    // Get fire rate multiplier
    getFireRateMultiplier() {
        return this.hasBuff('rapid_fire') ? 0.5 : 1;
    },

    update(dt) {
        // Update weapon boost timer
        if (VF.Player._weaponBoostTimer > 0) {
            VF.Player._weaponBoostTimer -= dt;
        }

        // Update active buffs
        for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
            const buff = this.activeBuffs[i];
            buff.remaining -= dt;

            // Apply continuous effects
            if (buff.type === 'shield_regen') {
                VF.Player.shield = Math.min(VF.Player.maxShield, VF.Player.shield + 10 * dt);
            }
            if (buff.type === 'energy_surge') {
                VF.Player.energy = VF.Player.maxEnergy;
            }

            // Warn when about to expire
            if (buff.remaining < 3 && buff.remaining > 2.9) {
                VF.HUD.notify(`${buff.name} expiring soon...`, '#888');
            }

            if (buff.remaining <= 0) {
                this._applyBuff(buff.type, false);
                this.activeBuffs.splice(i, 1);
                VF.HUD.notify(`${buff.name} expired`, '#666');
            }
        }
    },

    render(ctx) {
        if (this.activeBuffs.length === 0) return;

        // Render active buffs below HP bars
        const startX = 20;
        let bx = startX;
        const by = 100;

        for (const buff of this.activeBuffs) {
            const pct = buff.remaining / buff.duration;

            // Buff icon box
            ctx.fillStyle = 'rgba(0,20,40,0.7)';
            ctx.fillRect(bx, by, 32, 32);
            ctx.strokeStyle = buff.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, by, 32, 32);

            // Icon
            ctx.font = '16px Courier New';
            ctx.fillStyle = buff.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(buff.icon, bx + 16, by + 14);

            // Duration bar
            ctx.fillStyle = buff.color;
            ctx.fillRect(bx, by + 28, 32 * pct, 3);

            // Time remaining
            ctx.font = '8px Courier New';
            ctx.fillStyle = '#888';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`${Math.ceil(buff.remaining)}s`, bx + 16, by + 33);

            bx += 38;
        }
    },

    // Spawn a random powerup at location
    spawnRandom(x, y) {
        const types = Object.keys(this.BUFF_TYPES);
        const type = VF.Utils.randPick(types);
        const template = this.BUFF_TYPES[type];

        const powerup = {
            id: VF.Utils.uid(),
            type: 'powerup',
            buffType: type,
            x, y,
            radius: 15,
            color: template.color,
            icon: template.icon,
            name: template.name,
            dead: false,
            layer: 2,
            age: 0,
            lifetime: 20,

            update(dt) {
                this.age += dt;
                if (this.age > this.lifetime) { this.dead = true; return; }

                // Pickup check
                if (!VF.Player.dead) {
                    const dist = VF.Vec2.dist(this, VF.Player);
                    if (dist < 40) {
                        VF.Powerups.addBuff(this.buffType);
                        this.dead = true;
                    }
                }
            },

            render(ctx) {
                if (!VF.Camera.isVisible(this.x, this.y, 30)) return;
                VF.Camera.begin(ctx);

                const time = VF.Engine.time.elapsed;
                const pulse = 0.6 + Math.sin(time * 3) * 0.4;
                const bob = Math.sin(time * 2) * 5;

                // Rotating outer ring
                ctx.save();
                ctx.translate(this.x, this.y + bob);
                ctx.rotate(time * 2);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = pulse * 0.5;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2;
                    if (i === 0) ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
                    else ctx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.restore();

                // Inner glow
                ctx.save();
                ctx.globalAlpha = pulse * 0.3;
                VF.Renderer.drawCircle(ctx, this.x, this.y + bob, 12, this.color + '44', null);
                ctx.restore();

                // Icon
                ctx.save();
                ctx.globalAlpha = pulse;
                ctx.font = 'bold 18px Courier New';
                ctx.fillStyle = this.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 10;
                ctx.fillText(this.icon, this.x, this.y + bob);
                ctx.restore();

                VF.Camera.end(ctx);
            },

            onDestroy() {}
        };

        return VF.Engine.addEntity(powerup);
    }
};
