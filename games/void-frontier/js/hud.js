// ============================================================
// hud.js - Heads-up display: health, shield, energy, info bars
// ============================================================
VF.HUD = {
    notifications: [],
    _notifTimer: 0,
    damageIndicators: [],
    showCoords: true,

    init() {
        this.notifications = [];
        this.damageIndicators = [];
        // Listen for events
        VF.Engine.on('resourceGained', (type, amount) => {
            const res = VF.Resources.TYPES[type];
            if (res) this.notify(`+${amount} ${res.name}`, res.color);
        });
        VF.Engine.on('systemDiscovered', sys => {
            this.notify(`Discovered: ${sys.name}`, '#0ff');
        });
        VF.Engine.on('upgradePurchased', (key, level) => {
            this.notify(`Upgrade: Level ${level}`, '#0f0');
        });
        console.log('[HUD] Initialized');
    },

    notify(text, color = '#0ff', duration = 3) {
        this.notifications.push({ text, color, duration, age: 0 });
        if (this.notifications.length > 8) this.notifications.shift();
    },

    addDamageNumber(x, y, amount, color = '#f44') {
        this.damageIndicators.push({
            x, y, amount: Math.floor(amount),
            color, age: 0, lifetime: 0.8,
            vy: -60
        });
    },

    update(dt) {
        // Update notifications
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].age += dt;
            if (this.notifications[i].age >= this.notifications[i].duration) {
                this.notifications.splice(i, 1);
            }
        }
        // Update damage indicators
        for (let i = this.damageIndicators.length - 1; i >= 0; i--) {
            const d = this.damageIndicators[i];
            d.age += dt;
            d.y += d.vy * dt;
            if (d.age >= d.lifetime) {
                this.damageIndicators.splice(i, 1);
            }
        }
    },

    render(ctx) {
        const w = VF.Engine.width;
        const h = VF.Engine.height;
        const p = VF.Player;

        if (VF.Engine.state !== 'playing') return;

        // === Top-left: HP, Shield, Energy bars ===
        const barX = 20, barW = 200, barH = 12, gap = 6;
        let barY = 20;

        // HP
        ctx.font = '10px Courier New';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'left';
        ctx.fillText('HULL', barX, barY - 2);
        ctx.fillText(`${Math.floor(p.hp)}/${p.maxHp}`, barX + barW + 8, barY + 9);
        VF.Renderer.drawBar(ctx, barX, barY, barW, barH, p.hp, p.maxHp, '#200', '#0c0', '#0c0');
        barY += barH + gap;

        // Shield
        ctx.fillStyle = '#888';
        ctx.fillText('SHIELD', barX, barY - 2);
        ctx.fillText(`${Math.floor(p.shield)}/${p.maxShield}`, barX + barW + 8, barY + 9);
        VF.Renderer.drawBar(ctx, barX, barY, barW, barH, p.shield, p.maxShield, '#002', '#08f', '#08f');
        barY += barH + gap;

        // Energy
        ctx.fillStyle = '#888';
        ctx.fillText('ENERGY', barX, barY - 2);
        ctx.fillText(`${Math.floor(p.energy)}/${p.maxEnergy}`, barX + barW + 8, barY + 9);
        VF.Renderer.drawBar(ctx, barX, barY, barW, barH, p.energy, p.maxEnergy, '#110', '#ff0', '#ff0');
        barY += barH + gap;

        // XP bar
        ctx.fillStyle = '#888';
        ctx.fillText(`LVL ${p.level}`, barX, barY - 2);
        ctx.fillText(`${p.xp}/${p.xpToNext}`, barX + barW + 8, barY + 9);
        VF.Renderer.drawBar(ctx, barX, barY, barW, barH * 0.6, p.xp, p.xpToNext, '#101', '#a0f', '#a0f');

        // === Top-right: Credits, Kills, Time ===
        ctx.textAlign = 'right';
        ctx.font = '14px Courier New';
        ctx.fillStyle = '#ff0';
        ctx.fillText(`⬡ ${VF.Utils.formatNum(p.credits)}`, w - 20, 30);
        ctx.fillStyle = '#f44';
        ctx.fillText(`☠ ${p.kills}`, w - 20, 50);
        ctx.fillStyle = '#888';
        ctx.font = '11px Courier New';
        ctx.fillText(VF.Utils.formatTime(VF.Engine.time.elapsed), w - 20, 68);

        // === Bottom-left: Weapon indicator ===
        ctx.textAlign = 'left';
        ctx.font = '12px Courier New';
        const wep = VF.Weapons.TYPES[p.equipment.weapon];
        if (wep) {
            ctx.fillStyle = wep.color;
            ctx.fillText(`▸ ${wep.name}`, 20, h - 40);
        }
        const sec = VF.Weapons.TYPES[p.equipment.secondary];
        if (sec) {
            ctx.fillStyle = '#888';
            ctx.fillText(`▹ ${sec.name}`, 20, h - 22);
        }

        // Weapon hotkeys
        ctx.font = '10px Courier New';
        const weapons = ['laser', 'plasma', 'railgun', 'scatter'];
        let wx = 20;
        for (let i = 0; i < weapons.length; i++) {
            const unlocked = VF.Upgrades.unlockedWeapons.includes(weapons[i]);
            const active = p.equipment.weapon === weapons[i];
            ctx.fillStyle = active ? '#0ff' : unlocked ? '#446' : '#222';
            ctx.fillText(`[${i + 1}]`, wx, h - 55);
            wx += 35;
        }

        // === Bottom-center: Speed indicator ===
        const speed = Math.floor(Math.sqrt(p.vx * p.vx + p.vy * p.vy));
        ctx.textAlign = 'center';
        ctx.font = '11px Courier New';
        ctx.fillStyle = p.boosting ? '#4af' : '#666';
        ctx.fillText(`${speed} m/s${p.boosting ? ' [BOOST]' : ''}`, w / 2, h - 20);

        // === Coordinates ===
        if (this.showCoords) {
            ctx.textAlign = 'right';
            ctx.font = '10px Courier New';
            ctx.fillStyle = '#444';
            ctx.fillText(`X:${Math.floor(p.x)} Y:${Math.floor(p.y)}`, w - 20, h - 20);
            ctx.fillText(`Sector: ${VF.Galaxy.currentSector.x},${VF.Galaxy.currentSector.y}`, w - 20, h - 34);
        }

        // === FPS ===
        ctx.textAlign = 'right';
        ctx.font = '10px Courier New';
        ctx.fillStyle = '#333';
        ctx.fillText(`FPS: ${VF.Engine.time.fps} | P: ${VF.Particles.getCount()}`, w - 20, 86);

        // === Notifications ===
        ctx.textAlign = 'left';
        let ny = h / 2 - this.notifications.length * 12;
        for (const notif of this.notifications) {
            const alpha = notif.age < 0.3 ? notif.age / 0.3 :
                          notif.age > notif.duration - 0.5 ? (notif.duration - notif.age) / 0.5 : 1;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = '13px Courier New';
            ctx.fillStyle = notif.color;
            ctx.fillText(notif.text, w / 2 - 100, ny);
            ctx.restore();
            ny += 22;
        }

        // === Damage indicators (world space) ===
        VF.Camera.begin(ctx);
        for (const d of this.damageIndicators) {
            const alpha = 1 - d.age / d.lifetime;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 14px Courier New';
            ctx.fillStyle = d.color;
            ctx.textAlign = 'center';
            ctx.fillText(`-${d.amount}`, d.x, d.y);
            ctx.restore();
        }
        VF.Camera.end(ctx);

        // === Crosshair ===
        const mx = VF.Input.mouse.x, my = VF.Input.mouse.y;
        ctx.save();
        ctx.strokeStyle = 'rgba(0,255,255,0.5)';
        ctx.lineWidth = 1;
        const cs = 12;
        ctx.beginPath();
        ctx.moveTo(mx - cs, my); ctx.lineTo(mx - cs / 3, my);
        ctx.moveTo(mx + cs / 3, my); ctx.lineTo(mx + cs, my);
        ctx.moveTo(mx, my - cs); ctx.lineTo(mx, my - cs / 3);
        ctx.moveTo(mx, my + cs / 3); ctx.lineTo(mx, my + cs);
        ctx.stroke();
        // Center dot
        ctx.fillStyle = 'rgba(0,255,255,0.8)';
        ctx.fillRect(mx - 1, my - 1, 2, 2);
        ctx.restore();

        // === Combo indicator ===
        if (p.combatStats && p.combatStats._comboCount > 1) {
            ctx.save();
            ctx.font = 'bold 20px Courier New';
            ctx.fillStyle = '#ff0';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ff0';
            ctx.shadowBlur = 10;
            ctx.fillText(`${p.combatStats._comboCount}x COMBO`, w / 2, h / 2 - 60);
            ctx.restore();
        }

        // === Danger indicator (low HP warning) ===
        if (p.hp < p.maxHp * 0.25 && !p.dead) {
            const dangerPulse = Math.sin(VF.Engine.time.elapsed * 6) * 0.5 + 0.5;
            ctx.save();
            ctx.globalAlpha = dangerPulse * 0.15;
            ctx.fillStyle = '#f00';
            ctx.fillRect(0, 0, w, h);
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = dangerPulse;
            ctx.font = '12px Courier New';
            ctx.fillStyle = '#f44';
            ctx.textAlign = 'center';
            ctx.fillText('⚠ HULL CRITICAL ⚠', w / 2, 60);
            ctx.restore();
        }

        // === Enemy proximity warning ===
        const nearbyEnemies = VF.Engine.getEntitiesByType('enemy');
        let closestEnemy = null, closestDist = Infinity;
        for (const e of nearbyEnemies) {
            const d = VF.Vec2.dist(e, p);
            if (d < closestDist) { closestDist = d; closestEnemy = e; }
        }

        // Off-screen enemy indicators
        for (const e of nearbyEnemies) {
            if (e.dead) continue;
            const screen = VF.Camera.worldToScreen(e.x, e.y);
            if (screen.x < 0 || screen.x > w || screen.y < 0 || screen.y > h) {
                const angle = Math.atan2(screen.y - h/2, screen.x - w/2);
                const edgeX = VF.Utils.clamp(screen.x, 20, w - 20);
                const edgeY = VF.Utils.clamp(screen.y, 20, h - 20);

                ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = e.isBoss ? '#f00' : '#f44';
                ctx.beginPath();
                ctx.translate(edgeX, edgeY);
                ctx.rotate(angle);
                ctx.moveTo(6, 0);
                ctx.lineTo(-3, -4);
                ctx.lineTo(-3, 4);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        // === Target info (closest enemy) ===
        if (closestEnemy && closestDist < 600) {
            const targetScreen = VF.Camera.worldToScreen(closestEnemy.x, closestEnemy.y);
            if (targetScreen.x > 0 && targetScreen.x < w && targetScreen.y > 0 && targetScreen.y < h) {
                // Targeting reticle
                const time = VF.Engine.time.elapsed;
                VF.Renderer.drawReticle(ctx, targetScreen.x, targetScreen.y,
                    closestEnemy.radius * VF.Camera.zoom + 10,
                    closestEnemy.isBoss ? '#f00' : '#f44', time * 2);

                // Target info
                ctx.font = '9px Courier New';
                ctx.fillStyle = '#f88';
                ctx.textAlign = 'center';
                const name = closestEnemy.isBoss ? closestEnemy.name : (VF.Enemies.TYPES[closestEnemy.enemyType]?.name || 'Unknown');
                ctx.fillText(name, targetScreen.x, targetScreen.y + closestEnemy.radius * VF.Camera.zoom + 20);
                ctx.fillText(`${Math.floor(closestEnemy.hp)}/${Math.floor(closestEnemy.maxHp)}`,
                    targetScreen.x, targetScreen.y + closestEnemy.radius * VF.Camera.zoom + 32);
            }
        }
    }
};
