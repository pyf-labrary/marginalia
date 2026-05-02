/* ========================================
   Super Mario - Particle Effects System
   ======================================== */

const Particles = (() => {
    let particles = [];
    let scorePopups = [];
    const MAX_PARTICLES = 500;

    function createParticle(options) {
        if (particles.length >= MAX_PARTICLES) {
            particles.shift();
        }

        const particle = {
            x: options.x || 0,
            y: options.y || 0,
            vx: options.vx || 0,
            vy: options.vy || 0,
            ax: options.ax || 0,
            ay: options.ay || 0.2,
            size: options.size || 4,
            sizeDecay: options.sizeDecay || 0,
            color: options.color || '#fff',
            alpha: options.alpha || 1,
            alphaDecay: options.alphaDecay || 0.02,
            life: options.life || 60,
            maxLife: options.life || 60,
            rotation: options.rotation || 0,
            rotationSpeed: options.rotationSpeed || 0,
            shape: options.shape || 'square',
            gravity: options.gravity !== undefined ? options.gravity : true,
            active: true
        };

        particles.push(particle);
        return particle;
    }

    function update(step) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            p.vx += p.ax;
            p.vy += p.ay;

            if (!p.gravity) p.vy += 0;

            p.x += p.vx;
            p.y += p.vy;

            p.alpha -= p.alphaDecay;
            p.size -= p.sizeDecay;
            p.rotation += p.rotationSpeed;
            p.life--;

            if (p.life <= 0 || p.alpha <= 0 || p.size <= 0) {
                particles.splice(i, 1);
            }
        }

        for (let i = scorePopups.length - 1; i >= 0; i--) {
            const popup = scorePopups[i];
            popup.y -= popup.vy;
            popup.life--;
            popup.alpha -= 0.015;

            if (popup.life <= 0 || popup.alpha <= 0) {
                scorePopups.splice(i, 1);
            }
        }
    }

    function render(ctx, camera) {
        for (const p of particles) {
            const x = p.x - camera.x;
            const y = p.y - camera.y;

            if (x < -50 || x > Engine.CANVAS_WIDTH + 50 ||
                y < -50 || y > Engine.CANVAS_HEIGHT + 50) continue;

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.translate(x, y);
            ctx.rotate(p.rotation);

            ctx.fillStyle = p.color;

            switch (p.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    break;
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size / 2);
                    ctx.lineTo(-p.size / 2, p.size / 2);
                    ctx.lineTo(p.size / 2, p.size / 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'star':
                    drawStarShape(ctx, 0, 0, p.size / 2);
                    break;
                case 'line':
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-p.size / 2, 0);
                    ctx.lineTo(p.size / 2, 0);
                    ctx.stroke();
                    break;
            }

            ctx.restore();
        }

        for (const popup of scorePopups) {
            const x = popup.x - camera.x;
            const y = popup.y - camera.y;

            ctx.save();
            ctx.globalAlpha = Math.max(0, popup.alpha);
            ctx.fillStyle = popup.color || '#fff';
            ctx.font = `bold ${popup.fontSize || 14}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.lineWidth = 3;
            ctx.strokeText(popup.text, x, y);
            ctx.fillText(popup.text, x, y);

            ctx.restore();
        }
    }

    function drawStarShape(ctx, cx, cy, r) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 72 - 90) * Math.PI / 180;
            const innerAngle = ((i * 72 + 36) - 90) * Math.PI / 180;
            const outerX = cx + Math.cos(outerAngle) * r;
            const outerY = cy + Math.sin(outerAngle) * r;
            const innerX = cx + Math.cos(innerAngle) * (r * 0.4);
            const innerY = cy + Math.sin(innerAngle) * (r * 0.4);
            if (i === 0) ctx.moveTo(outerX, outerY);
            else ctx.lineTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
    }

    function createScorePopup(x, y, score) {
        scorePopups.push({
            x, y,
            text: typeof score === 'string' ? score : score.toString(),
            vy: 1.2,
            life: 60,
            alpha: 1,
            color: typeof score === 'string' ? '#43b047' : '#fff',
            fontSize: typeof score === 'string' ? 16 : 14
        });
    }

    function createBlockBreak(x, y) {
        const colors = ['#c86800', '#a85800', '#884800', '#faa005'];
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i / 8) + Math.random() * 0.5;
            const speed = 3 + Math.random() * 4;
            createParticle({
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4,
                size: 6 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 40 + Math.random() * 20,
                alphaDecay: 0.02,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                shape: 'square',
                ay: 0.4
            });
        }
    }

    function createBlockBump(x, y) {
        for (let i = 0; i < 4; i++) {
            createParticle({
                x: x + 8 + Math.random() * 16,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 2,
                size: 3,
                color: '#faa005',
                life: 15,
                alphaDecay: 0.06,
                shape: 'circle',
                ay: 0.1
            });
        }
    }

    function createCoinBounce(x, y) {
        for (let i = 0; i < 6; i++) {
            createParticle({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 3,
                vy: -4 - Math.random() * 3,
                size: 3,
                color: '#ffd700',
                life: 25,
                alphaDecay: 0.04,
                shape: 'circle',
                ay: 0.15
            });
        }
    }

    function createCoinCollect(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i / 8);
            createParticle({
                x, y,
                vx: Math.cos(angle) * 2.5,
                vy: Math.sin(angle) * 2.5,
                size: 3,
                color: i % 2 === 0 ? '#ffd700' : '#ffec80',
                life: 20,
                alphaDecay: 0.05,
                shape: 'star',
                gravity: false,
                ay: 0
            });
        }
    }

    function createJumpDust(x, y) {
        for (let i = 0; i < 5; i++) {
            createParticle({
                x: x + (Math.random() - 0.5) * 16,
                y: y - 2,
                vx: (Math.random() - 0.5) * 3,
                vy: -0.5 - Math.random(),
                size: 3 + Math.random() * 3,
                color: 'rgba(200, 200, 200, 0.6)',
                life: 15,
                alphaDecay: 0.06,
                shape: 'circle',
                gravity: false,
                ay: 0,
                sizeDecay: 0.15
            });
        }
    }

    function createLandDust(x, y) {
        for (let i = 0; i < 4; i++) {
            const dir = i < 2 ? -1 : 1;
            createParticle({
                x: x + dir * (4 + Math.random() * 8),
                y: y - 2,
                vx: dir * (1 + Math.random() * 2),
                vy: -0.3 - Math.random() * 0.5,
                size: 3 + Math.random() * 2,
                color: 'rgba(180, 180, 180, 0.5)',
                life: 12,
                alphaDecay: 0.08,
                shape: 'circle',
                gravity: false,
                ay: 0,
                sizeDecay: 0.2
            });
        }
    }

    function createEnemyDefeat(x, y) {
        const colors = ['#fff', '#ffd700', '#ff6b6b', '#ffa500'];
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i / 12) + Math.random() * 0.3;
            const speed = 2 + Math.random() * 3;
            createParticle({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 4 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 30,
                alphaDecay: 0.03,
                shape: Math.random() > 0.5 ? 'star' : 'circle',
                ay: 0.2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }

    function createPowerUpEffect(x, y) {
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i / 16);
            const speed = 1.5 + Math.random() * 2;
            createParticle({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4,
                color: i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#fff' : '#ff6b6b',
                life: 30,
                alphaDecay: 0.03,
                shape: 'star',
                gravity: false,
                ay: 0,
                sizeDecay: 0.08
            });
        }
    }

    function createStarEffect(x, y) {
        for (let i = 0; i < 24; i++) {
            const angle = (Math.PI * 2 * i / 24);
            const speed = 2 + Math.random() * 4;
            const colors = ['#ffd700', '#fff', '#ff69b4', '#00ffff', '#ff6b6b', '#7cfc00'];
            createParticle({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 40,
                alphaDecay: 0.025,
                shape: 'star',
                gravity: false,
                ay: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                sizeDecay: 0.05
            });
        }
    }

    function createSmallExplosion(x, y) {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i / 6);
            createParticle({
                x, y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                size: 3,
                color: i % 2 === 0 ? '#faa005' : '#fcd848',
                life: 15,
                alphaDecay: 0.06,
                shape: 'circle',
                gravity: false,
                ay: 0
            });
        }
    }

    function createFireworkBurst(x, y, color) {
        const baseColor = color || '#ffd700';
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i / 30) + Math.random() * 0.2;
            const speed = 3 + Math.random() * 5;
            createParticle({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                color: baseColor,
                life: 50 + Math.random() * 20,
                alphaDecay: 0.02,
                shape: 'circle',
                ay: 0.1,
                sizeDecay: 0.04
            });
        }
    }

    function createTrailEffect(x, y, color) {
        createParticle({
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: 2 + Math.random() * 3,
            color: color || '#fff',
            life: 10,
            alphaDecay: 0.1,
            shape: 'circle',
            gravity: false,
            ay: 0,
            sizeDecay: 0.2
        });
    }

    function createWaterSplash(x, y) {
        for (let i = 0; i < 8; i++) {
            createParticle({
                x: x + (Math.random() - 0.5) * 20,
                y,
                vx: (Math.random() - 0.5) * 4,
                vy: -3 - Math.random() * 5,
                size: 3 + Math.random() * 3,
                color: 'rgba(100, 180, 255, 0.7)',
                life: 25,
                alphaDecay: 0.04,
                shape: 'circle',
                ay: 0.3
            });
        }
    }

    function createLavaParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            createParticle({
                x: x + (Math.random() - 0.5) * 30,
                y,
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 3,
                size: 4 + Math.random() * 4,
                color: Math.random() > 0.5 ? '#ff4500' : '#ffa500',
                life: 30,
                alphaDecay: 0.03,
                shape: 'circle',
                ay: 0.15
            });
        }
    }

    function clearAll() {
        particles = [];
        scorePopups = [];
    }

    function getCount() {
        return particles.length;
    }

    return {
        createParticle, update, render, clearAll, getCount,
        createScorePopup, createBlockBreak, createBlockBump,
        createCoinBounce, createCoinCollect,
        createJumpDust, createLandDust,
        createEnemyDefeat, createPowerUpEffect, createStarEffect,
        createSmallExplosion, createFireworkBurst,
        createTrailEffect, createWaterSplash, createLavaParticles
    };
})();
