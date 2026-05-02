// ============================================================
// asteroids.js - Asteroid fields, mining, destructible rocks
// ============================================================
VF.Asteroids = {
    spawnRange: 1500,
    maxAsteroids: 40,
    _spawnTimer: 0,

    TYPES: {
        small:  { minSize: 10, maxSize: 20, hp: 20,  speed: 30,  resources: 1, color: '#886' },
        medium: { minSize: 25, maxSize: 40, hp: 60,  speed: 15,  resources: 3, color: '#997' },
        large:  { minSize: 45, maxSize: 65, hp: 120, speed: 8,   resources: 6, color: '#aa8' },
        crystal:{ minSize: 15, maxSize: 30, hp: 40,  speed: 20,  resources: 2, color: '#f8f' },
        ice:    { minSize: 20, maxSize: 35, hp: 30,  speed: 25,  resources: 2, color: '#8ef' },
        metal:  { minSize: 20, maxSize: 45, hp: 80,  speed: 12,  resources: 4, color: '#bbb' }
    },

    init() {
        this._spawnTimer = 0;
        console.log('[Asteroids] Initialized');
    },

    createAsteroid(typeName, x, y) {
        const template = this.TYPES[typeName] || this.TYPES.medium;
        const size = VF.Utils.rand(template.minSize, template.maxSize);
        const angle = Math.random() * Math.PI * 2;
        const speed = VF.Utils.rand(template.speed * 0.5, template.speed * 1.5);

        // Generate random polygon shape
        const vertices = [];
        const numVerts = VF.Utils.randInt(6, 10);
        for (let i = 0; i < numVerts; i++) {
            const a = (i / numVerts) * Math.PI * 2;
            const r = size * (0.7 + Math.random() * 0.3);
            vertices.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }

        const asteroid = {
            id: VF.Utils.uid(),
            type: 'asteroid',
            asteroidType: typeName,
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: VF.Utils.rand(-1, 1),
            radius: size,
            hp: template.hp,
            maxHp: template.hp,
            color: template.color,
            vertices,
            resourceCount: template.resources,
            dead: false,
            layer: 3,
            _hitFlash: 0,

            update(dt) {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.angle += this.rotSpeed * dt;
                if (this._hitFlash > 0) this._hitFlash -= dt;

                // Remove if too far from player
                const dist = VF.Vec2.dist(this, VF.Player);
                if (dist > 3000) this.dead = true;

                // Collision with player
                if (!VF.Player.dead && VF.Collision.circleCircle(
                    this.x, this.y, this.radius, VF.Player.x, VF.Player.y, VF.Player.radius)) {
                    const speed = Math.sqrt(VF.Player.vx * VF.Player.vx + VF.Player.vy * VF.Player.vy);
                    const damage = Math.max(5, speed * 0.05);
                    VF.Player.takeDamage(damage);
                    // Bounce
                    const nx = VF.Player.x - this.x;
                    const ny = VF.Player.y - this.y;
                    const len = Math.sqrt(nx * nx + ny * ny) || 1;
                    VF.Player.vx += (nx / len) * 100;
                    VF.Player.vy += (ny / len) * 100;
                    if (VF.Particles) VF.Particles.emit('sparks', this.x, this.y, 5);
                }
            },

            takeDamage(amount) {
                this.hp -= amount;
                this._hitFlash = 0.1;
                if (VF.Particles) VF.Particles.emit('mineSparkle', this.x, this.y, 3);
                if (this.hp <= 0) this.die();
            },

            die() {
                this.dead = true;
                if (VF.Particles) VF.Particles.emit('explosion', this.x, this.y, 15);

                // Drop resources
                const drops = VF.Resources.generateDrop(this.asteroidType, this.resourceCount);
                for (const drop of drops) {
                    VF.Resources.add(drop.type, drop.amount);
                }

                // Split large asteroids
                if (this.radius > 30) {
                    const count = VF.Utils.randInt(2, 3);
                    for (let i = 0; i < count; i++) {
                        const a = Math.random() * Math.PI * 2;
                        VF.Asteroids.createAsteroid('small',
                            this.x + Math.cos(a) * 20,
                            this.y + Math.sin(a) * 20);
                    }
                }

                if (VF.Loot && Math.random() < 0.15) {
                    VF.Loot.dropFromAsteroid(this);
                }
            },

            render(ctx) {
                if (!VF.Camera.isVisible(this.x, this.y, this.radius + 10)) return;

                VF.Camera.begin(ctx);

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                // Body
                ctx.beginPath();
                ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
                for (let i = 1; i < this.vertices.length; i++) {
                    ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
                }
                ctx.closePath();

                const fillColor = this._hitFlash > 0 ? '#fff' : this.color + '88';
                ctx.fillStyle = fillColor;
                ctx.fill();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Surface detail lines
                ctx.strokeStyle = this.color + '44';
                ctx.lineWidth = 0.5;
                for (let i = 0; i < 3; i++) {
                    const v1 = this.vertices[i % this.vertices.length];
                    const v2 = this.vertices[(i + 3) % this.vertices.length];
                    ctx.beginPath();
                    ctx.moveTo(v1.x * 0.5, v1.y * 0.5);
                    ctx.lineTo(v2.x * 0.5, v2.y * 0.5);
                    ctx.stroke();
                }

                ctx.restore();

                // Mining indicator when close
                const dist = VF.Vec2.dist(this, VF.Player);
                if (dist < 200) {
                    const barW = this.radius * 1.5;
                    VF.Renderer.drawBar(ctx, this.x - barW / 2, this.y - this.radius - 8,
                        barW, 3, this.hp, this.maxHp, '#220', '#ff0', '#ff0');
                }

                VF.Camera.end(ctx);
            },

            onDestroy() {}
        };

        return VF.Engine.addEntity(asteroid);
    },

    update(dt) {
        this._spawnTimer -= dt;
        if (this._spawnTimer <= 0) {
            this._spawnTimer = 2;
            this._trySpawn();
        }
    },

    _trySpawn() {
        const current = VF.Engine.getEntitiesByType('asteroid');
        if (current.length >= this.maxAsteroids) return;

        const angle = Math.random() * Math.PI * 2;
        const dist = VF.Utils.rand(800, this.spawnRange);
        const x = VF.Player.x + Math.cos(angle) * dist;
        const y = VF.Player.y + Math.sin(angle) * dist;

        const types = ['small', 'small', 'medium', 'medium', 'large', 'crystal', 'ice', 'metal'];
        this.createAsteroid(VF.Utils.randPick(types), x, y);
    },

    // Create an asteroid field at a location
    createField(cx, cy, count = 20, radius = 500) {
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const d = Math.random() * radius;
            const types = ['small', 'medium', 'large', 'crystal', 'ice', 'metal'];
            this.createAsteroid(VF.Utils.randPick(types), cx + Math.cos(a) * d, cy + Math.sin(a) * d);
        }
    }
};
