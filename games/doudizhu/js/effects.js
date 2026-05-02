/**
 * effects.js - 高级视觉特效系统
 * 包含粒子系统、拖尾效果、发光效果、屏幕特效
 */

class Particle {
    constructor(x, y, config = {}) {
        this.x = x;
        this.y = y;
        this.vx = config.vx || (Math.random() - 0.5) * 4;
        this.vy = config.vy || (Math.random() - 0.5) * 4;
        this.life = config.life || 1.0;
        this.decay = config.decay || 0.02;
        this.size = config.size || 4;
        this.color = config.color || '#ffd54f';
        this.gravity = config.gravity || 0;
        this.friction = config.friction || 0.99;
        this.shape = config.shape || 'circle';
        this.rotation = config.rotation || 0;
        this.rotationSpeed = config.rotationSpeed || 0;
        this.opacity = 1;
        this.scale = 1;
        this.shrink = config.shrink || false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.life -= this.decay;
        this.opacity = Math.max(0, this.life);
        this.rotation += this.rotationSpeed;

        if (this.shrink) {
            this.scale = Math.max(0, this.life);
        }
    }

    get isDead() {
        return this.life <= 0;
    }

    render(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        switch (this.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                break;
            case 'square':
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                break;
            case 'star':
                this._drawStar(ctx, this.size);
                break;
            case 'heart':
                this._drawHeart(ctx, this.size);
                break;
            case 'diamond':
                this._drawDiamond(ctx, this.size);
                break;
            case 'ring':
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                break;
        }

        ctx.restore();
    }

    _drawStar(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    _drawHeart(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.5);
        ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.3);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    _drawDiamond(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.6, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.6, 0);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this._animationFrame = null;
        this._running = false;
        this._createCanvas();
    }

    _createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        if (this._running) return;
        this._running = true;
        this._animate();
    }

    stop() {
        this._running = false;
        if (this._animationFrame) {
            cancelAnimationFrame(this._animationFrame);
            this._animationFrame = null;
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    addParticle(particle) {
        this.particles.push(particle);
        if (!this._running) this.start();
    }

    addParticles(particles) {
        this.particles.push(...particles);
        if (!this._running) this.start();
    }

    _animate() {
        if (!this._running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => !p.isDead);

        for (const particle of this.particles) {
            particle.update();
            particle.render(this.ctx);
        }

        if (this.particles.length === 0) {
            this._running = false;
            return;
        }

        this._animationFrame = requestAnimationFrame(() => this._animate());
    }

    destroy() {
        this.stop();
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

class EffectsManager {
    constructor() {
        this.particleSystem = new ParticleSystem();
        this._screenFlashEl = null;
    }

    explosionEffect(x, y, options = {}) {
        const count = options.count || 30;
        const colors = options.colors || ['#ff5722', '#ff9800', '#ffc107', '#f44336', '#ff6f00'];
        const speed = options.speed || 6;
        const size = options.size || 5;

        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
            const velocity = speed * (0.5 + Math.random() * 0.5);

            particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 0.8 + Math.random() * 0.4,
                decay: 0.015 + Math.random() * 0.01,
                size: size * (0.5 + Math.random()),
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.1,
                friction: 0.97,
                shape: Math.random() > 0.5 ? 'circle' : 'star',
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                shrink: true
            }));
        }

        this.particleSystem.addParticles(particles);
    }

    fireworkEffect(x, y) {
        const colors = [
            ['#ff6b6b', '#ff8e8e', '#ffb5b5'],
            ['#ffd93d', '#ffe066', '#fff5b5'],
            ['#6bcb77', '#8ed99a', '#b5e8bd'],
            ['#4d96ff', '#75adff', '#a5caff']
        ];

        const colorSet = colors[Math.floor(Math.random() * colors.length)];

        const trailParticles = [];
        for (let i = 0; i < 5; i++) {
            trailParticles.push(new Particle(x, y + 100 + i * 20, {
                vx: 0,
                vy: -3,
                life: 0.3,
                decay: 0.06,
                size: 3,
                color: '#ffd54f',
                shape: 'circle'
            }));
        }
        this.particleSystem.addParticles(trailParticles);

        setTimeout(() => {
            this.explosionEffect(x, y, {
                count: 40,
                colors: colorSet,
                speed: 5,
                size: 4
            });
        }, 300);
    }

    confettiEffect(duration = 4000) {
        const colors = [
            '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
            '#ff8c94', '#a8e6cf', '#ffd3b6', '#c9b1ff',
            '#ff9ff3', '#feca57', '#ff6348', '#70a1ff'
        ];

        const interval = 50;
        const endTime = Date.now() + duration;

        const spawnConfetti = () => {
            if (Date.now() > endTime) return;

            for (let i = 0; i < 3; i++) {
                const x = Math.random() * window.innerWidth;
                this.particleSystem.addParticle(new Particle(x, -10, {
                    vx: (Math.random() - 0.5) * 3,
                    vy: 2 + Math.random() * 3,
                    life: 1.5,
                    decay: 0.008,
                    size: 4 + Math.random() * 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    gravity: 0.05,
                    friction: 0.99,
                    shape: Math.random() > 0.5 ? 'square' : 'diamond',
                    rotationSpeed: (Math.random() - 0.5) * 0.15,
                    shrink: false
                }));
            }

            setTimeout(spawnConfetti, interval);
        };

        spawnConfetti();
    }

    sparkleEffect(x, y, count = 8) {
        const particles = [];
        const colors = ['#ffd54f', '#fff176', '#fff9c4'];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 0.6,
                decay: 0.03,
                size: 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: 'star',
                rotationSpeed: 0.1,
                shrink: true
            }));
        }

        this.particleSystem.addParticles(particles);
    }

    trailEffect(x, y, color = '#4fc3f7') {
        for (let i = 0; i < 3; i++) {
            this.particleSystem.addParticle(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                life: 0.4,
                decay: 0.03,
                size: 2 + Math.random() * 2,
                color,
                shape: 'circle',
                shrink: true
            }));
        }
    }

    burstEffect(x, y, options = {}) {
        const count = options.count || 15;
        const color = options.color || '#4fc3f7';
        const particles = [];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.3,
                decay: 0.02,
                size: 2 + Math.random() * 3,
                color,
                shape: 'circle',
                friction: 0.96,
                shrink: true
            }));
        }

        this.particleSystem.addParticles(particles);
    }

    screenFlash(color = 'rgba(255, 255, 255, 0.3)', duration = 300) {
        if (!this._screenFlashEl) {
            this._screenFlashEl = document.createElement('div');
            this._screenFlashEl.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9998;
                opacity: 0;
                transition: opacity ${duration / 2}ms ease;
            `;
            document.body.appendChild(this._screenFlashEl);
        }

        this._screenFlashEl.style.backgroundColor = color;
        this._screenFlashEl.style.opacity = '1';

        setTimeout(() => {
            this._screenFlashEl.style.opacity = '0';
        }, duration / 2);
    }

    shakeScreen(intensity = 5, duration = 400) {
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen) return;

        const startTime = Date.now();
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                gameScreen.style.transform = '';
                return;
            }

            const progress = elapsed / duration;
            const currentIntensity = intensity * (1 - progress);
            const x = (Math.random() - 0.5) * 2 * currentIntensity;
            const y = (Math.random() - 0.5) * 2 * currentIntensity;
            gameScreen.style.transform = `translate(${x}px, ${y}px)`;

            requestAnimationFrame(shake);
        };
        shake();
    }

    bombEffect(x, y) {
        this.screenFlash('rgba(255, 87, 34, 0.4)', 400);
        this.shakeScreen(8, 500);

        this.explosionEffect(x || window.innerWidth / 2, y || window.innerHeight / 2, {
            count: 50,
            colors: ['#ff5722', '#ff9800', '#ffc107', '#f44336', '#ff6f00', '#fff'],
            speed: 8,
            size: 6
        });

        setTimeout(() => {
            this.explosionEffect(
                (x || window.innerWidth / 2) + (Math.random() - 0.5) * 60,
                (y || window.innerHeight / 2) + (Math.random() - 0.5) * 60,
                {
                    count: 20,
                    colors: ['#ff9800', '#ffc107', '#fff176'],
                    speed: 4,
                    size: 3
                }
            );
        }, 150);
    }

    rocketEffect() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        this.screenFlash('rgba(255, 0, 0, 0.3)', 500);
        this.shakeScreen(10, 600);

        const trailInterval = setInterval(() => {
            for (let i = 0; i < 5; i++) {
                this.particleSystem.addParticle(new Particle(
                    cx + (Math.random() - 0.5) * 40,
                    cy + 50 + Math.random() * 30,
                    {
                        vx: (Math.random() - 0.5) * 2,
                        vy: 2 + Math.random() * 2,
                        life: 0.5,
                        decay: 0.025,
                        size: 3 + Math.random() * 3,
                        color: Math.random() > 0.5 ? '#ff5722' : '#ffc107',
                        shape: 'circle',
                        shrink: true
                    }
                ));
            }
        }, 30);

        setTimeout(() => clearInterval(trailInterval), 600);

        setTimeout(() => {
            this.explosionEffect(cx, cy - 30, {
                count: 60,
                colors: ['#e91e63', '#f44336', '#ff5722', '#ff9800', '#ffc107', '#fff'],
                speed: 10,
                size: 7
            });
        }, 400);

        setTimeout(() => {
            this.fireworkEffect(cx - 80, cy - 60);
            this.fireworkEffect(cx + 80, cy - 40);
        }, 700);
    }

    winCelebration() {
        this.confettiEffect(5000);

        setTimeout(() => this.fireworkEffect(window.innerWidth * 0.3, window.innerHeight * 0.3), 500);
        setTimeout(() => this.fireworkEffect(window.innerWidth * 0.7, window.innerHeight * 0.4), 1000);
        setTimeout(() => this.fireworkEffect(window.innerWidth * 0.5, window.innerHeight * 0.25), 1500);
        setTimeout(() => this.fireworkEffect(window.innerWidth * 0.2, window.innerHeight * 0.5), 2000);
        setTimeout(() => this.fireworkEffect(window.innerWidth * 0.8, window.innerHeight * 0.35), 2500);
    }

    loseSadness() {
        this.screenFlash('rgba(0, 0, 0, 0.4)', 600);

        const cx = window.innerWidth / 2;
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.particleSystem.addParticle(new Particle(
                    cx + (Math.random() - 0.5) * 200,
                    50,
                    {
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: 1 + Math.random() * 2,
                        life: 2,
                        decay: 0.005,
                        size: 2,
                        color: 'rgba(144, 164, 174, 0.6)',
                        shape: 'circle',
                        gravity: 0.02,
                        shrink: false
                    }
                ));
            }, i * 100);
        }
    }

    springEffect() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        const petalColors = ['#f8bbd0', '#f48fb1', '#ec407a', '#fff', '#fce4ec'];

        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                this.particleSystem.addParticle(new Particle(
                    Math.random() * window.innerWidth,
                    -20,
                    {
                        vx: (Math.random() - 0.5) * 2,
                        vy: 1 + Math.random() * 2,
                        life: 2,
                        decay: 0.006,
                        size: 4 + Math.random() * 4,
                        color: petalColors[Math.floor(Math.random() * petalColors.length)],
                        shape: 'heart',
                        gravity: 0.02,
                        friction: 0.995,
                        rotationSpeed: (Math.random() - 0.5) * 0.05
                    }
                ));
            }, i * 80);
        }

        this.confettiEffect(3000);
    }

    cardPlayEffect(x, y) {
        this.burstEffect(x, y, {
            count: 8,
            color: '#4fc3f7'
        });
    }

    bigPlayEffect(x, y) {
        this.sparkleEffect(x, y, 12);
        this.burstEffect(x, y, {
            count: 15,
            color: '#ffd54f'
        });
    }

    destroy() {
        this.particleSystem.destroy();
        if (this._screenFlashEl && this._screenFlashEl.parentNode) {
            this._screenFlashEl.parentNode.removeChild(this._screenFlashEl);
        }
    }
}

class GlowEffect {
    constructor() {
        this._glowElements = new Map();
    }

    addGlow(element, color = '#4fc3f7', intensity = 10) {
        if (!element) return;

        const id = element.id || Math.random().toString(36).substr(2);
        element.style.boxShadow = `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}`;
        element.style.transition = 'box-shadow 0.3s ease';
        this._glowElements.set(id, { element, color, intensity });
    }

    removeGlow(element) {
        if (!element) return;
        element.style.boxShadow = '';
        const id = element.id || '';
        this._glowElements.delete(id);
    }

    pulseGlow(element, color = '#4fc3f7', duration = 2000) {
        if (!element) return;

        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            const intensity = 5 + Math.sin(progress * Math.PI * 2) * 10;

            element.style.boxShadow = `0 0 ${intensity}px ${color}`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.boxShadow = '';
            }
        };

        requestAnimationFrame(animate);
    }

    clearAll() {
        for (const [_, data] of this._glowElements) {
            data.element.style.boxShadow = '';
        }
        this._glowElements.clear();
    }
}

class RippleEffect {
    static create(event) {
        const target = event.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            pointer-events: none;
            transform: scale(0);
            animation: rippleExpand 0.6s ease-out forwards;
            width: ${rect.width * 2}px;
            height: ${rect.width * 2}px;
            left: ${x - rect.width}px;
            top: ${y - rect.width}px;
        `;

        target.style.position = 'relative';
        target.style.overflow = 'hidden';
        target.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) ripple.remove();
        }, 600);
    }
}

class TextEffect {
    static floatingText(x, y, text, options = {}) {
        const el = document.createElement('div');
        el.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-size: ${options.fontSize || 20}px;
            font-weight: 800;
            color: ${options.color || '#ffd54f'};
            pointer-events: none;
            z-index: 20000;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            white-space: nowrap;
            transform: translateX(-50%);
        `;
        el.textContent = text;
        document.body.appendChild(el);

        const startTime = Date.now();
        const duration = options.duration || 1500;
        const riseHeight = options.riseHeight || 60;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                el.remove();
                return;
            }

            const yOffset = -riseHeight * progress;
            const opacity = 1 - Math.pow(progress, 2);
            const scale = 1 + 0.3 * Math.sin(progress * Math.PI);

            el.style.transform = `translateX(-50%) translateY(${yOffset}px) scale(${scale})`;
            el.style.opacity = opacity;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    static bounceText(x, y, text, options = {}) {
        const el = document.createElement('div');
        el.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-size: ${options.fontSize || 32}px;
            font-weight: 800;
            color: ${options.color || '#ffd54f'};
            pointer-events: none;
            z-index: 20000;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            white-space: nowrap;
            transform: translate(-50%, -50%) scale(0);
        `;
        el.textContent = text;
        document.body.appendChild(el);

        const startTime = Date.now();
        const duration = options.duration || 2000;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                el.remove();
                return;
            }

            let scale, opacity;
            if (progress < 0.15) {
                scale = progress / 0.15 * 1.3;
                opacity = 1;
            } else if (progress < 0.25) {
                scale = 1.3 - (progress - 0.15) / 0.1 * 0.3;
                opacity = 1;
            } else if (progress < 0.7) {
                scale = 1;
                opacity = 1;
            } else {
                scale = 1;
                opacity = 1 - (progress - 0.7) / 0.3;
            }

            el.style.transform = `translate(-50%, -50%) scale(${scale})`;
            el.style.opacity = opacity;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}

class MotionTrail {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.points = [];
        this.maxPoints = 30;
        this.color = '#4fc3f7';
        this.width = 3;
    }

    addPoint(x, y) {
        this.points.push({ x, y, life: 1 });
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }

    update() {
        this.points = this.points.filter(p => {
            p.life -= 0.03;
            return p.life > 0;
        });
    }

    render() {
        if (this.points.length < 2) return;

        for (let i = 1; i < this.points.length; i++) {
            const p0 = this.points[i - 1];
            const p1 = this.points[i];
            const alpha = p1.life * 0.5;
            const width = this.width * p1.life;

            this.ctx.beginPath();
            this.ctx.moveTo(p0.x, p0.y);
            this.ctx.lineTo(p1.x, p1.y);
            this.ctx.strokeStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.ctx.lineWidth = width;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
    }

    clear() {
        this.points = [];
    }
}

class NumberAnimator {
    static animate(element, from, to, duration = 1000, prefix = '', suffix = '') {
        const start = Date.now();
        const diff = to - from;

        const update = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + diff * eased);

            element.textContent = `${prefix}${current}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }
}

class TypewriterEffect {
    static async type(element, text, speed = 50) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await sleep(speed);
        }
    }

    static async typeAndDelete(element, text, typeSpeed = 50, displayTime = 2000, deleteSpeed = 30) {
        await TypewriterEffect.type(element, text, typeSpeed);
        await sleep(displayTime);

        for (let i = text.length; i >= 0; i--) {
            element.textContent = text.substring(0, i);
            await sleep(deleteSpeed);
        }
    }
}
