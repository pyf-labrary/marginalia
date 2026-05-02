// ============================================================
// renderer.js - Drawing helpers, shape rendering, effects
// ============================================================
VF.Renderer = {
    // Draw a ship shape from polygon points
    drawPolygon(ctx, x, y, points, angle, scale, strokeColor, fillColor, lineWidth = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
        if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth; ctx.stroke(); }
        ctx.restore();
    },

    // Draw circle with optional glow
    drawCircle(ctx, x, y, r, fillColor, strokeColor, lineWidth = 1) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
        if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth; ctx.stroke(); }
    },

    // Draw glowing circle
    drawGlow(ctx, x, y, r, color, intensity = 1) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, color.replace(')', `,${0.5 * intensity})`).replace('rgb', 'rgba'));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    },

    // Draw line with glow effect
    drawGlowLine(ctx, x1, y1, x2, y2, color, width = 2, glowWidth = 8) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = glowWidth;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    },

    // Draw text with optional glow
    drawText(ctx, text, x, y, font, color, align = 'left', baseline = 'top', glow = false) {
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
        }
        ctx.fillText(text, x, y);
        ctx.restore();
    },

    // Draw progress bar
    drawBar(ctx, x, y, w, h, value, maxValue, bgColor, fillColor, borderColor) {
        const pct = VF.Utils.clamp(value / maxValue, 0, 1);
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, w * pct, h);
        if (borderColor) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
        }
    },

    // Draw dashed circle
    drawDashedCircle(ctx, x, y, r, color, dashLen = 5, gapLen = 5) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([dashLen, gapLen]);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    },

    // Screen shake effect
    _shakeAmount: 0,
    _shakeDecay: 0.9,
    _shakeOffset: { x: 0, y: 0 },

    shake(amount) {
        this._shakeAmount = Math.max(this._shakeAmount, amount);
    },

    updateShake(dt) {
        if (this._shakeAmount > 0.5) {
            this._shakeOffset.x = (Math.random() - 0.5) * this._shakeAmount * 2;
            this._shakeOffset.y = (Math.random() - 0.5) * this._shakeAmount * 2;
            this._shakeAmount *= this._shakeDecay;
        } else {
            this._shakeAmount = 0;
            this._shakeOffset.x = 0;
            this._shakeOffset.y = 0;
        }
        return this._shakeOffset;
    },

    // Flash overlay effect
    _flashAlpha: 0,
    _flashColor: '#fff',
    _flashDecay: 3,

    flash(color = '#fff', intensity = 0.5) {
        this._flashColor = color;
        this._flashAlpha = intensity;
    },

    renderFlash(ctx, w, h, dt) {
        if (this._flashAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = this._flashAlpha;
            ctx.fillStyle = this._flashColor;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
            this._flashAlpha -= dt * this._flashDecay;
        }
    },

    // Draw a sci-fi panel/box
    drawPanel(ctx, x, y, w, h, bgColor = 'rgba(0,20,40,0.8)', borderColor = '#0ff', cornerSize = 8) {
        ctx.save();
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        // Rounded rect
        ctx.beginPath();
        ctx.moveTo(x + cornerSize, y);
        ctx.lineTo(x + w - cornerSize, y);
        ctx.lineTo(x + w, y + cornerSize);
        ctx.lineTo(x + w, y + h - cornerSize);
        ctx.lineTo(x + w - cornerSize, y + h);
        ctx.lineTo(x + cornerSize, y + h);
        ctx.lineTo(x, y + h - cornerSize);
        ctx.lineTo(x, y + cornerSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Corner accents
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        const cs = cornerSize;
        // Top-left
        ctx.beginPath(); ctx.moveTo(x, y + cs + 4); ctx.lineTo(x, y + cs); ctx.lineTo(x + cs, y); ctx.lineTo(x + cs + 4, y); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(x + w - cs - 4, y); ctx.lineTo(x + w - cs, y); ctx.lineTo(x + w, y + cs); ctx.lineTo(x + w, y + cs + 4); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(x + w, y + h - cs - 4); ctx.lineTo(x + w, y + h - cs); ctx.lineTo(x + w - cs, y + h); ctx.lineTo(x + w - cs - 4, y + h); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(x + cs + 4, y + h); ctx.lineTo(x + cs, y + h); ctx.lineTo(x, y + h - cs); ctx.lineTo(x, y + h - cs - 4); ctx.stroke();
        ctx.restore();
    },

    // Draw a ring/orbit
    drawOrbit(ctx, x, y, r, color, alpha = 0.3) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    },

    // Draw a radar sweep effect
    drawRadarSweep(ctx, x, y, r, angle, color = '#0f0', sweepAngle = 0.5) {
        ctx.save();
        const gradient = ctx.createConicGradient(angle - sweepAngle, x, y);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(sweepAngle / (Math.PI * 2), color + '44');
        gradient.addColorStop(sweepAngle / (Math.PI * 2) + 0.001, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    // Draw a lightning bolt between two points
    drawLightning(ctx, x1, y1, x2, y2, color = '#0ff', segments = 8, jitter = 20) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(x1, y1);

        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter;
            const my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter;
            ctx.lineTo(mx, my);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Thinner bright core
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.restore();
    },

    // Draw a hexagonal grid pattern
    drawHexGrid(ctx, x, y, w, h, cellSize, color = '#0ff', alpha = 0.1) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;

        const sqrt3 = Math.sqrt(3);
        const cols = Math.ceil(w / (cellSize * 1.5)) + 1;
        const rows = Math.ceil(h / (cellSize * sqrt3)) + 1;

        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                const cx = x + col * cellSize * 1.5;
                const cy = y + row * cellSize * sqrt3 + (col % 2 ? cellSize * sqrt3 / 2 : 0);

                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i + Math.PI / 6;
                    const hx = cx + cellSize * Math.cos(angle);
                    const hy = cy + cellSize * Math.sin(angle);
                    if (i === 0) ctx.moveTo(hx, hy);
                    else ctx.lineTo(hx, hy);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
        ctx.restore();
    },

    // Draw a scanning line effect
    drawScanLine(ctx, x, y, w, h, progress, color = '#0ff') {
        const lineY = y + h * progress;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.lineTo(x + w, lineY);
        ctx.stroke();

        // Fade trail
        const gradient = ctx.createLinearGradient(x, lineY - 30, x, lineY);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, color + '22');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, lineY - 30, w, 30);
        ctx.restore();
    },

    // Draw a targeting reticle
    drawReticle(ctx, x, y, size, color = '#f44', rotation = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;

        // Corner brackets
        const s = size;
        const g = s * 0.3; // gap
        // Top-left
        ctx.beginPath(); ctx.moveTo(-s, -s + g); ctx.lineTo(-s, -s); ctx.lineTo(-s + g, -s); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(s - g, -s); ctx.lineTo(s, -s); ctx.lineTo(s, -s + g); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(s, s - g); ctx.lineTo(s, s); ctx.lineTo(s - g, s); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(-s + g, s); ctx.lineTo(-s, s); ctx.lineTo(-s, s - g); ctx.stroke();

        // Center cross
        const c = s * 0.15;
        ctx.beginPath();
        ctx.moveTo(-c, 0); ctx.lineTo(c, 0);
        ctx.moveTo(0, -c); ctx.lineTo(0, c);
        ctx.stroke();

        ctx.restore();
    },

    // Draw a waveform visualization
    drawWaveform(ctx, x, y, w, h, frequency, amplitude, color = '#0ff', time = 0) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        for (let i = 0; i <= w; i++) {
            const t = i / w;
            const wave = Math.sin(t * frequency + time) * amplitude;
            const py = y + h / 2 + wave * h / 2;
            if (i === 0) ctx.moveTo(x + i, py);
            else ctx.lineTo(x + i, py);
        }
        ctx.stroke();
        ctx.restore();
    },

    // Draw a shield bubble effect
    drawShieldBubble(ctx, x, y, radius, hp, maxHp, color = '#08f') {
        const pct = hp / maxHp;
        const segments = 24;
        const time = VF.Engine ? VF.Engine.time.elapsed : 0;

        ctx.save();
        ctx.globalAlpha = pct * 0.3;

        // Outer ring with gaps
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        for (let i = 0; i < segments; i++) {
            if (Math.random() > pct) continue; // gaps when damaged
            const a1 = (i / segments) * Math.PI * 2;
            const a2 = ((i + 0.8) / segments) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, a1 + time * 0.5, a2 + time * 0.5);
            ctx.stroke();
        }

        // Inner glow
        const gradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, color + '11');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
};
