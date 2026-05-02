// ============================================================
// particles.js - Particle effects, explosions, visual FX
// ============================================================
VF.Particles = {
    particles: [],
    maxParticles: 2000,

    PRESETS: {
        explosion: {
            count: 1, lifetime: [0.4, 1.0], speed: [80, 300],
            size: [2, 6], sizeEnd: 0, color: '#f80', colorEnd: '#400',
            gravity: 0, drag: 2, spread: Math.PI * 2,
            fadeOut: true, glow: true
        },
        sparks: {
            count: 1, lifetime: [0.2, 0.5], speed: [100, 400],
            size: [1, 3], sizeEnd: 0, color: '#ff0', colorEnd: '#f80',
            gravity: 0, drag: 3, spread: Math.PI * 2,
            fadeOut: true, glow: false
        },
        hit: {
            count: 1, lifetime: [0.1, 0.3], speed: [50, 200],
            size: [1, 3], sizeEnd: 0, color: '#fff', colorEnd: '#0ff',
            gravity: 0, drag: 4, spread: Math.PI,
            fadeOut: true, glow: true
        },
        shockwave: {
            count: 1, lifetime: [0.5, 0.5], speed: [0, 0],
            size: [5, 5], sizeEnd: 200, color: '#fff', colorEnd: '#000',
            gravity: 0, drag: 0, spread: 0,
            fadeOut: true, glow: true, ring: true
        },
        levelUp: {
            count: 1, lifetime: [0.8, 1.5], speed: [50, 150],
            size: [2, 5], sizeEnd: 0, color: '#0ff', colorEnd: '#08f',
            gravity: -30, drag: 1, spread: Math.PI * 2,
            fadeOut: true, glow: true
        },
        smoke: {
            count: 1, lifetime: [0.5, 1.5], speed: [10, 40],
            size: [4, 10], sizeEnd: 20, color: '#444', colorEnd: '#111',
            gravity: -10, drag: 1, spread: Math.PI * 2,
            fadeOut: true, glow: false
        },
        trail: {
            count: 1, lifetime: [0.1, 0.3], speed: [0, 10],
            size: [2, 4], sizeEnd: 0, color: '#0ff', colorEnd: '#004',
            gravity: 0, drag: 0, spread: Math.PI * 0.3,
            fadeOut: true, glow: true
        },
        mineSparkle: {
            count: 1, lifetime: [0.3, 0.8], speed: [20, 80],
            size: [1, 3], sizeEnd: 0, color: '#ff0', colorEnd: '#840',
            gravity: -20, drag: 2, spread: Math.PI * 2,
            fadeOut: true, glow: true
        },
        warpCharge: {
            count: 1, lifetime: [0.3, 0.6], speed: [100, 300],
            size: [1, 3], sizeEnd: 0, color: '#a0f', colorEnd: '#408',
            gravity: 0, drag: 5, spread: Math.PI * 2,
            fadeOut: true, glow: true, inward: true
        },
        heal: {
            count: 1, lifetime: [0.5, 1.0], speed: [20, 60],
            size: [2, 4], sizeEnd: 0, color: '#0f0', colorEnd: '#040',
            gravity: -40, drag: 1, spread: Math.PI * 2,
            fadeOut: true, glow: true
        },
        shield_hit: {
            count: 1, lifetime: [0.2, 0.4], speed: [30, 80],
            size: [2, 4], sizeEnd: 0, color: '#0af', colorEnd: '#024',
            gravity: 0, drag: 3, spread: Math.PI * 0.5,
            fadeOut: true, glow: true
        }
    },

    init() {
        this.particles = [];
        console.log('[Particles] Initialized');
    },

    emit(presetName, x, y, count, angle) {
        const preset = this.PRESETS[presetName];
        if (!preset) return;

        const actualCount = count || preset.count;
        for (let i = 0; i < actualCount; i++) {
            if (this.particles.length >= this.maxParticles) {
                // Remove oldest
                this.particles.shift();
            }

            const lifetime = VF.Utils.rand(preset.lifetime[0], preset.lifetime[1]);
            const speed = VF.Utils.rand(preset.speed[0], preset.speed[1]);
            const size = VF.Utils.rand(preset.size[0], preset.size[1]);
            const dir = (angle || 0) + (Math.random() - 0.5) * preset.spread;

            let vx = Math.cos(dir) * speed;
            let vy = Math.sin(dir) * speed;

            // Inward particles move towards center
            if (preset.inward) {
                const dist = VF.Utils.rand(50, 150);
                const px = x + Math.cos(dir) * dist;
                const py = y + Math.sin(dir) * dist;
                vx = (x - px) / lifetime;
                vy = (y - py) / lifetime;
                x = px; y = py;
            }

            this.particles.push({
                x: preset.inward ? x + Math.cos(dir) * VF.Utils.rand(50, 150) : x,
                y: preset.inward ? y + Math.sin(dir) * VF.Utils.rand(50, 150) : y,
                vx, vy,
                size, sizeEnd: preset.sizeEnd,
                lifetime, age: 0,
                color: preset.color,
                colorEnd: preset.colorEnd,
                gravity: preset.gravity,
                drag: preset.drag,
                fadeOut: preset.fadeOut,
                glow: preset.glow,
                ring: preset.ring
            });
        }
    },

    // Emit continuous trail behind a moving object
    emitTrail(x, y, angle, preset = 'trail') {
        this.emit(preset, x, y, 1, angle + Math.PI);
    },

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += dt;

            if (p.age >= p.lifetime) {
                this.particles.splice(i, 1);
                continue;
            }

            // Physics
            p.vy += (p.gravity || 0) * dt;
            p.vx *= (1 - (p.drag || 0) * dt);
            p.vy *= (1 - (p.drag || 0) * dt);
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }
    },

    render(ctx) {
        if (this.particles.length === 0) return;

        VF.Camera.begin(ctx);

        for (const p of this.particles) {
            if (!VF.Camera.isVisible(p.x, p.y, 50)) continue;

            const t = p.age / p.lifetime;
            const alpha = p.fadeOut ? 1 - t : 1;
            const size = VF.Utils.lerp(p.size, p.sizeEnd, t);

            if (size <= 0 || alpha <= 0) continue;

            ctx.save();
            ctx.globalAlpha = alpha;

            if (p.ring) {
                // Shockwave ring
                ctx.strokeStyle = p.color;
                ctx.lineWidth = Math.max(1, (1 - t) * 4);
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                if (p.glow) {
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = size * 2;
                }

                // Interpolate color
                ctx.fillStyle = p.color;

                if (size > 3) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
                }
            }

            ctx.restore();
        }

        VF.Camera.end(ctx);
    },

    clear() {
        this.particles = [];
    },

    getCount() {
        return this.particles.length;
    },

    // Advanced particle emitter with continuous emission
    createEmitter(presetName, x, y, options = {}) {
        const preset = this.PRESETS[presetName];
        if (!preset) return null;

        return {
            preset: presetName,
            x, y,
            rate: options.rate || 10, // particles per second
            active: true,
            _timer: 0,
            duration: options.duration || Infinity,
            _elapsed: 0,
            followTarget: options.followTarget || null,
            angle: options.angle || 0,
            spread: options.spread || preset.spread,

            update(dt) {
                if (!this.active) return;
                this._elapsed += dt;
                if (this._elapsed >= this.duration) {
                    this.active = false;
                    return;
                }

                if (this.followTarget) {
                    this.x = this.followTarget.x;
                    this.y = this.followTarget.y;
                }

                this._timer += dt;
                const interval = 1 / this.rate;
                while (this._timer >= interval) {
                    this._timer -= interval;
                    VF.Particles.emit(this.preset, this.x, this.y, 1, this.angle);
                }
            },

            stop() { this.active = false; },
            start() { this.active = true; this._elapsed = 0; }
        };
    },

    // Particle text effect - spawn particles that form text
    emitText(text, x, y, color = '#0ff', size = 20) {
        const ctx = VF.Engine.ctx;
        ctx.save();
        ctx.font = `${size}px Courier New`;
        const metrics = ctx.measureText(text);
        ctx.restore();

        const textWidth = metrics.width;
        const startX = x - textWidth / 2;

        // Create particles along text path
        for (let i = 0; i < text.length; i++) {
            const charX = startX + (i / text.length) * textWidth;
            for (let j = 0; j < 3; j++) {
                this.particles.push({
                    x: charX + VF.Utils.rand(-5, 5),
                    y: y + VF.Utils.rand(-size/2, size/2),
                    vx: VF.Utils.rand(-20, 20),
                    vy: VF.Utils.rand(-40, -10),
                    size: VF.Utils.rand(1, 3),
                    sizeEnd: 0,
                    lifetime: VF.Utils.rand(0.5, 1.5),
                    age: 0,
                    color: color,
                    colorEnd: '#000',
                    gravity: -20,
                    drag: 1,
                    fadeOut: true,
                    glow: true,
                    ring: false
                });
            }
        }
    },

    // Firework effect
    emitFirework(x, y, color) {
        const colors = color ? [color] : ['#f44', '#ff0', '#0f0', '#0ff', '#f0f', '#fff'];
        const c = VF.Utils.randPick(colors);
        const count = VF.Utils.randInt(30, 60);

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + VF.Utils.rand(-0.1, 0.1);
            const speed = VF.Utils.rand(100, 300);
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: VF.Utils.rand(1, 3),
                sizeEnd: 0,
                lifetime: VF.Utils.rand(0.5, 1.5),
                age: 0,
                color: c,
                colorEnd: '#000',
                gravity: 50,
                drag: 2,
                fadeOut: true,
                glow: true,
                ring: false
            });
        }
    },

    // Beam effect between two points
    emitBeam(x1, y1, x2, y2, color = '#0ff', width = 3) {
        const dist = VF.Vec2.dist({ x: x1, y: y1 }, { x: x2, y: y2 });
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const count = Math.floor(dist / 10);

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const px = VF.Utils.lerp(x1, x2, t) + VF.Utils.rand(-width, width);
            const py = VF.Utils.lerp(y1, y2, t) + VF.Utils.rand(-width, width);

            this.particles.push({
                x: px, y: py,
                vx: VF.Utils.rand(-10, 10),
                vy: VF.Utils.rand(-10, 10),
                size: VF.Utils.rand(1, width),
                sizeEnd: 0,
                lifetime: VF.Utils.rand(0.1, 0.3),
                age: 0,
                color: color,
                colorEnd: '#000',
                gravity: 0,
                drag: 5,
                fadeOut: true,
                glow: true,
                ring: false
            });
        }
    },

    // Vortex/spiral effect
    emitVortex(x, y, radius, color = '#a0f', count = 30) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = radius * (0.3 + Math.random() * 0.7);
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;

            // Tangential velocity for spiral motion
            const tangent = angle + Math.PI / 2;
            const speed = 50 + Math.random() * 100;

            this.particles.push({
                x: px, y: py,
                vx: Math.cos(tangent) * speed + (x - px) * 0.5,
                vy: Math.sin(tangent) * speed + (y - py) * 0.5,
                size: VF.Utils.rand(1, 3),
                sizeEnd: 0,
                lifetime: VF.Utils.rand(0.5, 1.5),
                age: 0,
                color: color,
                colorEnd: '#000',
                gravity: 0,
                drag: 2,
                fadeOut: true,
                glow: true,
                ring: false
            });
        }
    }
};
