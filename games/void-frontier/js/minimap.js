// ============================================================
// minimap.js - Minimap showing nearby entities and systems
// ============================================================
VF.Minimap = {
    size: 160,
    range: 2000,
    x: 0, y: 0,
    expanded: false,

    init() {
        console.log('[Minimap] Initialized');
    },

    render(ctx) {
        if (VF.Engine.state !== 'playing') return;

        const w = VF.Engine.width;
        const size = this.expanded ? 280 : this.size;
        const range = this.expanded ? 5000 : this.range;
        this.x = w - size - 15;
        this.y = VF.Engine.height - size - 15;

        // Background
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'rgba(0,10,20,0.85)';
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x + size / 2, this.y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Clip to circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x + size / 2, this.y + size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.clip();

        const cx = this.x + size / 2;
        const cy = this.y + size / 2;
        const scale = size / (range * 2);
        const px = VF.Player.x;
        const py = VF.Player.y;

        // Grid lines
        ctx.strokeStyle = 'rgba(0,255,255,0.08)';
        ctx.lineWidth = 0.5;
        const gridStep = 500 * scale;
        for (let gx = -5; gx <= 5; gx++) {
            const lx = cx + (gx * 500 - (px % 500)) * scale;
            ctx.beginPath(); ctx.moveTo(lx, this.y); ctx.lineTo(lx, this.y + size); ctx.stroke();
        }
        for (let gy = -5; gy <= 5; gy++) {
            const ly = cy + (gy * 500 - (py % 500)) * scale;
            ctx.beginPath(); ctx.moveTo(this.x, ly); ctx.lineTo(this.x + size, ly); ctx.stroke();
        }

        // Star systems
        const systems = VF.Galaxy.getNearbySystems(px, py, range);
        for (const sys of systems) {
            const sx = cx + (sys.x - px) * scale;
            const sy = cy + (sys.y - py) * scale;
            ctx.fillStyle = sys.star.color;
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Stations
        const sector = VF.Galaxy.sectors[`${VF.Galaxy.currentSector.x},${VF.Galaxy.currentSector.y}`];
        if (sector) {
            for (const station of sector.stations) {
                const sx = cx + (station.x - px) * scale;
                const sy = cy + (station.y - py) * scale;
                ctx.fillStyle = '#0ff';
                ctx.fillRect(sx - 2, sy - 2, 4, 4);
            }
        }

        // Enemies
        const enemies = VF.Engine.getEntitiesByType('enemy');
        for (const e of enemies) {
            const dist = VF.Vec2.dist(e, VF.Player);
            if (dist > range) continue;
            const ex = cx + (e.x - px) * scale;
            const ey = cy + (e.y - py) * scale;
            ctx.fillStyle = '#f44';
            ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
        }

        // Asteroids
        const asteroids = VF.Engine.getEntitiesByType('asteroid');
        for (const a of asteroids) {
            const dist = VF.Vec2.dist(a, VF.Player);
            if (dist > range) continue;
            const ax = cx + (a.x - px) * scale;
            const ay = cy + (a.y - py) * scale;
            ctx.fillStyle = '#664';
            ctx.fillRect(ax - 1, ay - 1, 2, 2);
        }

        // Loot
        if (VF.Loot) {
            const loots = VF.Engine.getEntitiesByType('loot');
            for (const l of loots) {
                const dist = VF.Vec2.dist(l, VF.Player);
                if (dist > range) continue;
                const lx = cx + (l.x - px) * scale;
                const ly = cy + (l.y - py) * scale;
                ctx.fillStyle = '#ff0';
                ctx.fillRect(lx - 1, ly - 1, 2, 2);
            }
        }

        // Player (center, with direction indicator)
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Direction line
        const dirLen = 10;
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(VF.Player.angle) * dirLen, cy + Math.sin(VF.Player.angle) * dirLen);
        ctx.stroke();

        ctx.restore();

        // Range label
        ctx.font = '9px Courier New';
        ctx.fillStyle = '#446';
        ctx.textAlign = 'center';
        ctx.fillText(`${range}m`, this.x + size / 2, this.y + size + 12);

        // Toggle hint
        ctx.fillText('[M] Map', this.x + size / 2, this.y - 5);
    },

    toggle() {
        this.expanded = !this.expanded;
    },

    // Check if click is on minimap
    isClickOnMap(mx, my) {
        const size = this.expanded ? 280 : this.size;
        const cx = this.x + size / 2;
        const cy = this.y + size / 2;
        const dx = mx - cx, dy = my - cy;
        return dx * dx + dy * dy <= (size / 2) * (size / 2);
    },

    // Minimap ping system - mark locations
    _pings: [],

    addPing(worldX, worldY, color = '#ff0', duration = 5) {
        this._pings.push({
            x: worldX, y: worldY,
            color, duration, age: 0,
            pulsePhase: 0
        });
    },

    updatePings(dt) {
        for (let i = this._pings.length - 1; i >= 0; i--) {
            this._pings[i].age += dt;
            this._pings[i].pulsePhase += dt * 4;
            if (this._pings[i].age >= this._pings[i].duration) {
                this._pings.splice(i, 1);
            }
        }
    },

    renderPings(ctx) {
        const size = this.expanded ? 280 : this.size;
        const range = this.expanded ? 5000 : this.range;
        const cx = this.x + size / 2;
        const cy = this.y + size / 2;
        const scale = size / (range * 2);
        const px = VF.Player.x;
        const py = VF.Player.y;

        for (const ping of this._pings) {
            const sx = cx + (ping.x - px) * scale;
            const sy = cy + (ping.y - py) * scale;
            const alpha = 1 - ping.age / ping.duration;
            const pulseR = 3 + Math.sin(ping.pulsePhase) * 2;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = ping.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(sx, sy, pulseR + 4, 0, Math.PI * 2);
            ctx.globalAlpha = alpha * 0.3;
            ctx.stroke();
            ctx.restore();
        }
    },

    // Minimap zoom levels
    _zoomLevel: 0,
    _zoomLevels: [2000, 4000, 8000, 15000],

    cycleZoom() {
        this._zoomLevel = (this._zoomLevel + 1) % this._zoomLevels.length;
        this.range = this._zoomLevels[this._zoomLevel];
        VF.HUD.notify(`Map range: ${this.range}m`, '#088');
    },

    // Get world position from minimap click
    getWorldPosFromClick(mx, my) {
        const size = this.expanded ? 280 : this.size;
        const range = this.expanded ? 5000 : this.range;
        const cx = this.x + size / 2;
        const cy = this.y + size / 2;
        const scale = size / (range * 2);

        const worldX = VF.Player.x + (mx - cx) / scale;
        const worldY = VF.Player.y + (my - cy) / scale;
        return { x: worldX, y: worldY };
    }
};
