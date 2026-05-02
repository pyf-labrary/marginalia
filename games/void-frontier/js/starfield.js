// ============================================================
// starfield.js - Multi-layer parallax starfield background
// ============================================================
VF.Starfield = {
    layers: [],
    _initialized: false,

    init(layerCount = 4) {
        this.layers = [];
        for (let l = 0; l < layerCount; l++) {
            const depth = 0.1 + (l / layerCount) * 0.6;
            const stars = [];
            const count = 200 - l * 30;
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: VF.Utils.rand(-3000, 3000),
                    y: VF.Utils.rand(-3000, 3000),
                    size: VF.Utils.rand(0.5, 2.5 - l * 0.3),
                    brightness: VF.Utils.rand(0.3, 1),
                    twinkleSpeed: VF.Utils.rand(1, 4),
                    twinkleOffset: VF.Utils.rand(0, Math.PI * 2),
                    color: this._randomStarColor()
                });
            }
            this.layers.push({ stars, depth, parallax: depth });
        }
        this._initialized = true;
        console.log('[Starfield] Initialized with', layerCount, 'layers');
    },

    _randomStarColor() {
        const colors = [
            '#ffffff', '#ffffff', '#ffffff', // white (most common)
            '#aaccff', '#aaccff', // blue-white
            '#ffddaa', // yellow
            '#ffaa88', // orange
            '#aaaaff', // blue
            '#ffaaaa', // red
            '#aaffcc'  // green tint
        ];
        return VF.Utils.randPick(colors);
    },

    update(dt) {
        // Stars twinkle - handled in render
    },

    render(ctx) {
        if (!this._initialized) return;
        const cam = VF.Camera;
        const w = VF.Engine.width;
        const h = VF.Engine.height;
        const time = VF.Engine.time.elapsed;

        for (const layer of this.layers) {
            const px = cam.x * layer.parallax;
            const py = cam.y * layer.parallax;

            for (const star of layer.stars) {
                // Wrap stars around viewport
                let sx = ((star.x - px) % 3000 + 4500) % 3000 - 1500 + w / 2;
                let sy = ((star.y - py) % 3000 + 4500) % 3000 - 1500 + h / 2;

                if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;

                // Twinkle effect
                const twinkle = 0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
                const alpha = star.brightness * twinkle;

                ctx.globalAlpha = alpha;
                ctx.fillStyle = star.color;

                if (star.size > 1.5) {
                    // Larger stars get a cross/glow effect
                    const s = star.size;
                    ctx.fillRect(sx - s / 2, sy - 0.5, s, 1);
                    ctx.fillRect(sx - 0.5, sy - s / 2, 1, s);
                    // Soft glow
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.beginPath();
                    ctx.arc(sx, sy, s * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(sx, sy, star.size, star.size);
                }
            }
        }
        ctx.globalAlpha = 1;
    },

    // Generate stars around a specific world position (for infinite scrolling feel)
    regenerateAround(worldX, worldY) {
        for (const layer of this.layers) {
            for (const star of layer.stars) {
                star.x = worldX + VF.Utils.rand(-3000, 3000);
                star.y = worldY + VF.Utils.rand(-3000, 3000);
            }
        }
    },

    // Shooting star / meteor effect
    _shootingStars: [],
    _shootingStarTimer: 0,

    updateShootingStars(dt) {
        this._shootingStarTimer -= dt;
        if (this._shootingStarTimer <= 0) {
            this._shootingStarTimer = VF.Utils.rand(5, 15);
            this._createShootingStar();
        }

        for (let i = this._shootingStars.length - 1; i >= 0; i--) {
            const s = this._shootingStars[i];
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.age += dt;
            s.trail.push({ x: s.x, y: s.y });
            if (s.trail.length > 20) s.trail.shift();
            if (s.age > s.lifetime) this._shootingStars.splice(i, 1);
        }
    },

    _createShootingStar() {
        const w = VF.Engine.width;
        const h = VF.Engine.height;
        const angle = VF.Utils.rand(0.3, 0.8);
        const speed = VF.Utils.rand(800, 1500);

        this._shootingStars.push({
            x: VF.Utils.rand(-100, w),
            y: -50,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            age: 0,
            lifetime: VF.Utils.rand(0.5, 1.5),
            trail: [],
            brightness: VF.Utils.rand(0.5, 1)
        });
    },

    renderShootingStars(ctx) {
        for (const s of this._shootingStars) {
            if (s.trail.length < 2) continue;
            const alpha = (1 - s.age / s.lifetime) * s.brightness;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(s.trail[0].x, s.trail[0].y);
            for (let i = 1; i < s.trail.length; i++) {
                ctx.globalAlpha = alpha * (i / s.trail.length);
                ctx.lineTo(s.trail[i].x, s.trail[i].y);
            }
            ctx.stroke();

            // Bright head
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },

    // Constellation patterns (decorative)
    _constellations: [],

    generateConstellations() {
        this._constellations = [];
        const count = VF.Utils.randInt(3, 6);
        for (let c = 0; c < count; c++) {
            const cx = VF.Utils.rand(100, VF.Engine.width - 100);
            const cy = VF.Utils.rand(100, VF.Engine.height - 100);
            const stars = [];
            const numStars = VF.Utils.randInt(4, 8);
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: cx + VF.Utils.rand(-80, 80),
                    y: cy + VF.Utils.rand(-80, 80)
                });
            }
            // Connect nearby stars
            const lines = [];
            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < stars.length; j++) {
                    const dist = VF.Vec2.dist(stars[i], stars[j]);
                    if (dist < 100 && Math.random() < 0.6) {
                        lines.push([i, j]);
                    }
                }
            }
            this._constellations.push({ stars, lines });
        }
    },

    renderConstellations(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = '#88aaff';
        ctx.lineWidth = 0.5;

        for (const con of this._constellations) {
            for (const [i, j] of con.lines) {
                ctx.beginPath();
                ctx.moveTo(con.stars[i].x, con.stars[i].y);
                ctx.lineTo(con.stars[j].x, con.stars[j].y);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
};
