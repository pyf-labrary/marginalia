// ============================================================
// warp.js - Warp/hyperspace travel system
// ============================================================
VF.Warp = {
    isWarping: false,
    warpTarget: null,
    warpProgress: 0,
    warpDuration: 3, // seconds
    warpCooldown: 0,
    warpCooldownMax: 10,
    warpRange: 3000,
    warpEnergyCost: 40,
    _chargeTime: 0,
    _charging: false,
    _chargeRequired: 1.5,
    _warpLines: [],
    _tunnelEffect: false,

    init() {
        this.isWarping = false;
        this.warpTarget = null;
        this.warpProgress = 0;
        this.warpCooldown = 0;
        this._charging = false;
        this._chargeTime = 0;
        console.log('[Warp] Initialized');
    },

    canWarp() {
        return !this.isWarping &&
               this.warpCooldown <= 0 &&
               VF.Player.energy >= this.warpEnergyCost &&
               !VF.Player.dead;
    },

    // Start charging warp to a target location
    startCharge(targetX, targetY) {
        if (!this.canWarp()) return false;

        const dist = VF.Vec2.dist(VF.Player, { x: targetX, y: targetY });
        if (dist > this.warpRange) {
            VF.HUD.notify('Target out of warp range!', '#f44');
            return false;
        }
        if (dist < 200) {
            VF.HUD.notify('Target too close for warp!', '#f44');
            return false;
        }

        this._charging = true;
        this._chargeTime = 0;
        this.warpTarget = { x: targetX, y: targetY };
        VF.HUD.notify('Warp drive charging...', '#a0f');
        if (VF.Particles) VF.Particles.emit('warpCharge', VF.Player.x, VF.Player.y, 20);
        return true;
    },

    cancelCharge() {
        this._charging = false;
        this._chargeTime = 0;
        this.warpTarget = null;
    },

    // Warp to nearest system
    warpToNearestSystem() {
        const systems = VF.Galaxy.getNearbySystems(VF.Player.x, VF.Player.y, this.warpRange);
        let nearest = null, nearestDist = Infinity;

        for (const sys of systems) {
            const dist = VF.Vec2.dist(VF.Player, sys);
            if (dist > 200 && dist < nearestDist) {
                nearestDist = dist;
                nearest = sys;
            }
        }

        if (nearest) {
            this.startCharge(nearest.x, nearest.y);
        } else {
            VF.HUD.notify('No systems in warp range!', '#f44');
        }
    },

    update(dt) {
        // Cooldown
        if (this.warpCooldown > 0) {
            this.warpCooldown -= dt;
        }

        // Charging
        if (this._charging) {
            this._chargeTime += dt;

            // Charge particles
            if (Math.random() < 0.5) {
                VF.Particles.emit('warpCharge', VF.Player.x, VF.Player.y, 2);
            }

            // Cancel if player moves too much or takes damage
            if (VF.Input.getMovement().x !== 0 || VF.Input.getMovement().y !== 0) {
                // Allow slight movement during charge
            }

            if (this._chargeTime >= this._chargeRequired) {
                this._initiateWarp();
            }
        }

        // Active warp
        if (this.isWarping) {
            this.warpProgress += dt / this.warpDuration;

            // Generate warp tunnel lines
            if (this._tunnelEffect) {
                this._updateWarpLines(dt);
            }

            if (this.warpProgress >= 1) {
                this._completeWarp();
            } else {
                // Interpolate position
                const t = VF.Utils.Ease.inOutCubic(this.warpProgress);
                VF.Player.x = VF.Utils.lerp(this._warpStart.x, this.warpTarget.x, t);
                VF.Player.y = VF.Utils.lerp(this._warpStart.y, this.warpTarget.y, t);
                VF.Player.vx = 0;
                VF.Player.vy = 0;
            }
        }

        // Warp key (F)
        if (VF.Input.justPressed('KeyF') && !this.isWarping) {
            if (this._charging) {
                this.cancelCharge();
                VF.HUD.notify('Warp cancelled', '#888');
            } else {
                this.warpToNearestSystem();
            }
        }
    },

    _initiateWarp() {
        this._charging = false;
        this.isWarping = true;
        this.warpProgress = 0;
        this._warpStart = { x: VF.Player.x, y: VF.Player.y };
        this._tunnelEffect = true;
        this._warpLines = [];

        VF.Player.energy -= this.warpEnergyCost;
        VF.Player.invulnTime = this.warpDuration + 1;

        // Generate warp lines
        for (let i = 0; i < 60; i++) {
            this._warpLines.push({
                x: VF.Utils.rand(-VF.Engine.width, VF.Engine.width),
                y: VF.Utils.rand(-VF.Engine.height, VF.Engine.height),
                length: VF.Utils.rand(50, 200),
                speed: VF.Utils.rand(500, 2000),
                color: VF.Utils.randPick(['#a0f', '#80f', '#c0f', '#60f', '#fff']),
                width: VF.Utils.rand(1, 3)
            });
        }

        VF.Renderer.flash('#a0f', 0.5);
        if (VF.Audio) VF.Audio.play('warp');
        VF.HUD.notify('WARP ENGAGED', '#a0f');

        // Clear nearby enemies
        VF.Enemies.clearAll();
    },

    _completeWarp() {
        this.isWarping = false;
        this._tunnelEffect = false;
        this.warpCooldown = this.warpCooldownMax;
        this.warpTarget = null;

        VF.Player.vx = 0;
        VF.Player.vy = 0;
        VF.Player.invulnTime = 2;

        VF.Camera.setPosition(VF.Player.x, VF.Player.y);
        VF.Galaxy.updateCurrentSector(VF.Player.x, VF.Player.y);
        VF.Galaxy.discoverNearby(VF.Player.x, VF.Player.y, 500);
        VF.Starfield.regenerateAround(VF.Player.x, VF.Player.y);

        VF.Renderer.flash('#fff', 0.8);
        VF.Renderer.shake(5);
        if (VF.Particles) VF.Particles.emit('shockwave', VF.Player.x, VF.Player.y, 1);
        VF.HUD.notify('Warp complete', '#0ff');
    },

    _updateWarpLines(dt) {
        const angle = this.warpTarget ?
            Math.atan2(this.warpTarget.y - this._warpStart.y, this.warpTarget.x - this._warpStart.x) : 0;

        for (const line of this._warpLines) {
            line.x -= Math.cos(angle) * line.speed * dt;
            line.y -= Math.sin(angle) * line.speed * dt;

            // Wrap
            if (line.x < -VF.Engine.width) line.x += VF.Engine.width * 2;
            if (line.x > VF.Engine.width) line.x -= VF.Engine.width * 2;
            if (line.y < -VF.Engine.height) line.y += VF.Engine.height * 2;
            if (line.y > VF.Engine.height) line.y -= VF.Engine.height * 2;
        }
    },

    render(ctx) {
        // Warp tunnel effect
        if (this._tunnelEffect && this.isWarping) {
            const cx = VF.Engine.width / 2;
            const cy = VF.Engine.height / 2;
            const progress = this.warpProgress;

            // Tunnel background
            ctx.save();
            ctx.globalAlpha = 0.3 * (1 - Math.abs(progress - 0.5) * 2);
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, VF.Engine.width / 2);
            gradient.addColorStop(0, '#000');
            gradient.addColorStop(0.5, '#204');
            gradient.addColorStop(1, '#000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, VF.Engine.width, VF.Engine.height);
            ctx.restore();

            // Warp lines
            const angle = this.warpTarget ?
                Math.atan2(this.warpTarget.y - this._warpStart.y, this.warpTarget.x - this._warpStart.x) : 0;

            for (const line of this._warpLines) {
                const sx = cx + line.x;
                const sy = cy + line.y;
                const ex = sx - Math.cos(angle) * line.length * (0.5 + progress);
                const ey = sy - Math.sin(angle) * line.length * (0.5 + progress);

                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.width;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
                ctx.restore();
            }
        }

        // Charge indicator
        if (this._charging) {
            const cx = VF.Engine.width / 2;
            const cy = VF.Engine.height / 2;
            const pct = this._chargeTime / this._chargeRequired;

            // Charge ring
            ctx.save();
            ctx.strokeStyle = '#a0f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
            ctx.stroke();
            ctx.restore();

            ctx.font = '12px Courier New';
            ctx.fillStyle = '#a0f';
            ctx.textAlign = 'center';
            ctx.fillText(`CHARGING ${Math.floor(pct * 100)}%`, cx, cy + 55);
        }

        // Cooldown indicator
        if (this.warpCooldown > 0 && !this.isWarping) {
            ctx.font = '10px Courier New';
            ctx.fillStyle = '#446';
            ctx.textAlign = 'center';
            ctx.fillText(`Warp: ${Math.ceil(this.warpCooldown)}s`, VF.Engine.width / 2, VF.Engine.height - 40);
        }

        // Warp range indicator when pressing F
        if (VF.Input.isDown('KeyF') && !this.isWarping && !this._charging) {
            const screen = VF.Camera.worldToScreen(VF.Player.x, VF.Player.y);
            const rangePixels = this.warpRange * VF.Camera.zoom;
            ctx.save();
            ctx.globalAlpha = 0.2;
            VF.Renderer.drawDashedCircle(ctx, screen.x, screen.y, rangePixels, '#a0f', 10, 10);
            ctx.restore();
        }
    }
};
