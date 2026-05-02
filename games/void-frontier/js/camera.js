// ============================================================
// camera.js - Camera system with smooth follow and zoom
// ============================================================
VF.Camera = {
    x: 0, y: 0,
    targetX: 0, targetY: 0,
    zoom: 1,
    targetZoom: 1,
    smoothing: 5,
    zoomSmoothing: 3,
    minZoom: 0.3,
    maxZoom: 2,
    bounds: null, // { x, y, w, h } or null for infinite

    init() {
        window.addEventListener('wheel', e => {
            this.targetZoom -= e.deltaY * 0.001;
            this.targetZoom = VF.Utils.clamp(this.targetZoom, this.minZoom, this.maxZoom);
        });
        console.log('[Camera] Initialized');
    },

    follow(target, dt) {
        this.targetX = target.x;
        this.targetY = target.y;
        this.x = VF.Utils.lerp(this.x, this.targetX, this.smoothing * dt);
        this.y = VF.Utils.lerp(this.y, this.targetY, this.smoothing * dt);
        this.zoom = VF.Utils.lerp(this.zoom, this.targetZoom, this.zoomSmoothing * dt);

        if (this.bounds) {
            this.x = VF.Utils.clamp(this.x, this.bounds.x, this.bounds.x + this.bounds.w);
            this.y = VF.Utils.clamp(this.y, this.bounds.y, this.bounds.y + this.bounds.h);
        }
    },

    setPosition(x, y) {
        this.x = this.targetX = x;
        this.y = this.targetY = y;
    },

    // Apply camera transform to context
    begin(ctx) {
        const shake = VF.Renderer.updateShake(VF.Engine.time.dt);
        ctx.save();
        ctx.translate(VF.Engine.width / 2 + shake.x, VF.Engine.height / 2 + shake.y);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x, -this.y);
    },

    end(ctx) {
        ctx.restore();
    },

    // Convert screen coords to world coords
    screenToWorld(sx, sy) {
        return {
            x: (sx - VF.Engine.width / 2) / this.zoom + this.x,
            y: (sy - VF.Engine.height / 2) / this.zoom + this.y
        };
    },

    // Convert world coords to screen coords
    worldToScreen(wx, wy) {
        return {
            x: (wx - this.x) * this.zoom + VF.Engine.width / 2,
            y: (wy - this.y) * this.zoom + VF.Engine.height / 2
        };
    },

    // Check if world position is visible on screen (with margin)
    isVisible(wx, wy, margin = 100) {
        const hw = VF.Engine.width / 2 / this.zoom + margin;
        const hh = VF.Engine.height / 2 / this.zoom + margin;
        return Math.abs(wx - this.x) < hw && Math.abs(wy - this.y) < hh;
    },

    // Get visible world bounds
    getViewBounds() {
        const hw = VF.Engine.width / 2 / this.zoom;
        const hh = VF.Engine.height / 2 / this.zoom;
        return { left: this.x - hw, right: this.x + hw, top: this.y - hh, bottom: this.y + hh };
    },

    // Cinematic camera modes
    _cinematicMode: false,
    _cinematicTarget: null,
    _cinematicDuration: 0,
    _cinematicElapsed: 0,
    _cinematicCallback: null,
    _originalPos: null,

    startCinematic(targetX, targetY, duration, callback) {
        this._cinematicMode = true;
        this._cinematicTarget = { x: targetX, y: targetY };
        this._cinematicDuration = duration;
        this._cinematicElapsed = 0;
        this._cinematicCallback = callback;
        this._originalPos = { x: this.x, y: this.y };
    },

    updateCinematic(dt) {
        if (!this._cinematicMode) return;
        this._cinematicElapsed += dt;
        const t = Math.min(this._cinematicElapsed / this._cinematicDuration, 1);

        if (t < 0.4) {
            // Pan to target
            const pt = VF.Utils.Ease.inOutCubic(t / 0.4);
            this.x = VF.Utils.lerp(this._originalPos.x, this._cinematicTarget.x, pt);
            this.y = VF.Utils.lerp(this._originalPos.y, this._cinematicTarget.y, pt);
        } else if (t < 0.6) {
            // Hold
            this.x = this._cinematicTarget.x;
            this.y = this._cinematicTarget.y;
        } else {
            // Pan back
            const pt = VF.Utils.Ease.inOutCubic((t - 0.6) / 0.4);
            this.x = VF.Utils.lerp(this._cinematicTarget.x, this._originalPos.x, pt);
            this.y = VF.Utils.lerp(this._cinematicTarget.y, this._originalPos.y, pt);
        }

        if (t >= 1) {
            this._cinematicMode = false;
            if (this._cinematicCallback) this._cinematicCallback();
        }
    },

    // Camera effects
    _zoomPulse: 0,
    _zoomPulseSpeed: 0,

    pulseZoom(amount = 0.1, speed = 5) {
        this._zoomPulse = amount;
        this._zoomPulseSpeed = speed;
    },

    updateEffects(dt) {
        if (this._zoomPulse > 0) {
            this._zoomPulse *= 0.95;
            if (this._zoomPulse < 0.001) this._zoomPulse = 0;
        }
        this.updateCinematic(dt);
    },

    // Get effective zoom including effects
    getEffectiveZoom() {
        return this.zoom + Math.sin(VF.Engine.time.elapsed * this._zoomPulseSpeed) * this._zoomPulse;
    },

    // Letterbox effect for cinematics
    renderLetterbox(ctx, amount = 0.1) {
        if (!this._cinematicMode) return;
        const w = VF.Engine.width;
        const h = VF.Engine.height;
        const barH = h * amount;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, barH);
        ctx.fillRect(0, h - barH, w, barH);
    },

    // Deadzone for smooth camera stop
    _deadzone: 2,

    // Get camera velocity for parallax calculations
    getVelocity() {
        return {
            x: this.targetX - this.x,
            y: this.targetY - this.y
        };
    },

    // Focus on a point temporarily then return
    peek(x, y, duration = 2) {
        this.startCinematic(x, y, duration, null);
    },

    // Reset camera to default state
    reset() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.zoom = 1;
        this.targetZoom = 1;
        this._cinematicMode = false;
        this._zoomPulse = 0;
    }
};
