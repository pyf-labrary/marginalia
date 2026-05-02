// ============================================================
// nebula.js - Procedural nebula clouds and space fog
// ============================================================
VF.Nebula = {
    clouds: [],
    _canvas: null,
    _ctx: null,
    _generated: false,

    init() {
        // Generate nebula clouds as offscreen canvases for performance
        this.clouds = [];
        this._generateClouds(8);
        console.log('[Nebula] Initialized');
    },

    _generateClouds(count) {
        const palettes = [
            ['rgba(0,100,200,', 'rgba(50,0,150,', 'rgba(0,150,100,'],
            ['rgba(150,0,50,', 'rgba(200,50,0,', 'rgba(100,0,100,'],
            ['rgba(0,80,120,', 'rgba(0,40,80,', 'rgba(20,60,100,'],
            ['rgba(80,0,120,', 'rgba(120,0,80,', 'rgba(40,0,60,']
        ];

        for (let i = 0; i < count; i++) {
            const size = VF.Utils.randInt(300, 800);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            const palette = VF.Utils.randPick(palettes);
            const layers = VF.Utils.randInt(3, 6);

            for (let l = 0; l < layers; l++) {
                const cx = size / 2 + VF.Utils.rand(-size * 0.2, size * 0.2);
                const cy = size / 2 + VF.Utils.rand(-size * 0.2, size * 0.2);
                const r = VF.Utils.rand(size * 0.2, size * 0.45);
                const colorBase = VF.Utils.randPick(palette);
                const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                gradient.addColorStop(0, colorBase + '0.08)');
                gradient.addColorStop(0.4, colorBase + '0.04)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, size, size);
            }

            // Add some bright spots
            const spots = VF.Utils.randInt(2, 5);
            for (let s = 0; s < spots; s++) {
                const sx = VF.Utils.rand(size * 0.2, size * 0.8);
                const sy = VF.Utils.rand(size * 0.2, size * 0.8);
                const sr = VF.Utils.rand(5, 20);
                const colorBase = VF.Utils.randPick(palette);
                const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
                gradient.addColorStop(0, colorBase + '0.15)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
            }

            this.clouds.push({
                canvas,
                x: VF.Utils.rand(-5000, 5000),
                y: VF.Utils.rand(-5000, 5000),
                size,
                parallax: VF.Utils.rand(0.05, 0.2),
                rotation: VF.Utils.rand(0, Math.PI * 2),
                rotSpeed: VF.Utils.rand(-0.01, 0.01),
                alpha: VF.Utils.rand(0.4, 0.9),
                pulseSpeed: VF.Utils.rand(0.2, 0.8),
                pulseAmount: VF.Utils.rand(0.05, 0.15)
            });
        }
        this._generated = true;
    },

    update(dt) {
        for (const cloud of this.clouds) {
            cloud.rotation += cloud.rotSpeed * dt;
        }
    },

    render(ctx) {
        if (!this._generated) return;
        const cam = VF.Camera;
        const w = VF.Engine.width;
        const h = VF.Engine.height;
        const time = VF.Engine.time.elapsed;

        for (const cloud of this.clouds) {
            const px = cloud.x - cam.x * cloud.parallax;
            const py = cloud.y - cam.y * cloud.parallax;

            // Wrap
            const wx = ((px + 5000) % 10000) - 5000 + w / 2;
            const wy = ((py + 5000) % 10000) - 5000 + h / 2;

            // Cull
            if (wx + cloud.size < -200 || wx - cloud.size > w + 200 ||
                wy + cloud.size < -200 || wy - cloud.size > h + 200) continue;

            const pulse = 1 + Math.sin(time * cloud.pulseSpeed) * cloud.pulseAmount;

            ctx.save();
            ctx.globalAlpha = cloud.alpha * pulse;
            ctx.translate(wx, wy);
            ctx.rotate(cloud.rotation);
            ctx.drawImage(cloud.canvas, -cloud.size / 2, -cloud.size / 2, cloud.size, cloud.size);
            ctx.restore();
        }
    },

    // Regenerate nebula for a new sector
    regenerateForSector(sectorX, sectorY) {
        const rng = VF.Utils.seededRNG(sectorX * 7919 + sectorY * 104729);
        for (const cloud of this.clouds) {
            cloud.x = (rng() - 0.5) * 10000;
            cloud.y = (rng() - 0.5) * 10000;
            cloud.alpha = 0.3 + rng() * 0.6;
        }
    },

    // Dynamic nebula color based on sector
    getSectorColor(sectorX, sectorY) {
        const rng = VF.Utils.seededRNG(sectorX * 31 + sectorY * 97);
        const hue = rng() * 360;
        return `hsl(${hue}, 60%, 30%)`;
    },

    // Nebula density affects gameplay
    getDensityAt(x, y) {
        let density = 0;
        for (const cloud of this.clouds) {
            const dist = VF.Vec2.dist({ x, y }, cloud);
            if (dist < cloud.size) {
                density += (1 - dist / cloud.size) * cloud.alpha;
            }
        }
        return Math.min(1, density);
    },

    // Create a specific nebula effect at a location
    createLocalNebula(x, y, size, color, duration) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, color + '33');
        gradient.addColorStop(0.5, color + '11');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const cloud = {
            canvas, x, y, size,
            parallax: 0.01,
            rotation: 0,
            rotSpeed: VF.Utils.rand(-0.02, 0.02),
            alpha: 0.8,
            pulseSpeed: 1,
            pulseAmount: 0.1,
            _lifetime: duration,
            _age: 0,
            _temporary: true
        };
        this.clouds.push(cloud);
        return cloud;
    },

    // Remove expired temporary nebulae
    cleanupTemporary(dt) {
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            const cloud = this.clouds[i];
            if (cloud._temporary) {
                cloud._age += dt;
                if (cloud._age >= cloud._lifetime) {
                    this.clouds.splice(i, 1);
                }
            }
        }
    }
};
