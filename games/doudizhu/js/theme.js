/**
 * theme.js - 主题系统，支持多套视觉主题
 */

class Theme {
    constructor(id, name, config) {
        this.id = id;
        this.name = name;
        this.config = config;
    }

    get cssVariables() {
        return this.config.variables || {};
    }

    get backgroundStyle() {
        return this.config.background || '';
    }

    get cardBackStyle() {
        return this.config.cardBack || {};
    }

    get particleColors() {
        return this.config.particleColors || ['#ffd54f', '#ff9800', '#4fc3f7'];
    }
}

class ThemeManager {
    constructor() {
        this.themes = {};
        this.currentThemeId = 'dark-blue';
        this._registerBuiltinThemes();
        this._load();
    }

    _registerBuiltinThemes() {
        this.register(new Theme('dark-blue', '深蓝经典', {
            variables: {
                '--bg-primary': '#0a1628',
                '--bg-secondary': '#132238',
                '--bg-card': '#1a2d47',
                '--bg-panel': '#0d1f36',
                '--color-primary': '#4fc3f7',
                '--color-primary-dark': '#0288d1',
                '--color-secondary': '#81c784',
                '--color-accent': '#ffb74d',
                '--color-danger': '#e57373',
                '--color-gold': '#ffd54f',
                '--text-primary': '#e8eaf6',
                '--text-secondary': '#90a4ae',
                '--text-muted': '#546e7a',
                '--border-color': 'rgba(79, 195, 247, 0.2)'
            },
            background: 'radial-gradient(ellipse at center, #132a40 0%, #0a1628 70%)',
            cardBack: {
                gradient: 'linear-gradient(135deg, #1565c0, #0d47a1)',
                border: 'rgba(255, 255, 255, 0.15)'
            },
            particleColors: ['#4fc3f7', '#81c784', '#ffd54f', '#ff9800']
        }));

        this.register(new Theme('dark-green', '翡翠之夜', {
            variables: {
                '--bg-primary': '#0a1f0a',
                '--bg-secondary': '#132813',
                '--bg-card': '#1a3d1a',
                '--bg-panel': '#0d2a0d',
                '--color-primary': '#66bb6a',
                '--color-primary-dark': '#2e7d32',
                '--color-secondary': '#aed581',
                '--color-accent': '#ffd54f',
                '--color-danger': '#ef5350',
                '--color-gold': '#ffd54f',
                '--text-primary': '#e8f5e9',
                '--text-secondary': '#a5d6a7',
                '--text-muted': '#4caf50',
                '--border-color': 'rgba(102, 187, 106, 0.2)'
            },
            background: 'radial-gradient(ellipse at center, #1b4332 0%, #0a1f0a 70%)',
            cardBack: {
                gradient: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                border: 'rgba(255, 255, 255, 0.12)'
            },
            particleColors: ['#66bb6a', '#aed581', '#ffd54f', '#fff176']
        }));

        this.register(new Theme('dark-red', '烈焰之心', {
            variables: {
                '--bg-primary': '#1a0a0a',
                '--bg-secondary': '#2d1313',
                '--bg-card': '#3d1a1a',
                '--bg-panel': '#250d0d',
                '--color-primary': '#ef5350',
                '--color-primary-dark': '#c62828',
                '--color-secondary': '#ff8a80',
                '--color-accent': '#ffd54f',
                '--color-danger': '#ff5252',
                '--color-gold': '#ffd54f',
                '--text-primary': '#ffebee',
                '--text-secondary': '#ef9a9a',
                '--text-muted': '#e57373',
                '--border-color': 'rgba(239, 83, 80, 0.2)'
            },
            background: 'radial-gradient(ellipse at center, #3d1a1a 0%, #1a0a0a 70%)',
            cardBack: {
                gradient: 'linear-gradient(135deg, #c62828, #b71c1c)',
                border: 'rgba(255, 255, 255, 0.1)'
            },
            particleColors: ['#ef5350', '#ff8a80', '#ffd54f', '#ff9800']
        }));

        this.register(new Theme('dark-purple', '星夜紫', {
            variables: {
                '--bg-primary': '#12061f',
                '--bg-secondary': '#1a0d2e',
                '--bg-card': '#261545',
                '--bg-panel': '#150a28',
                '--color-primary': '#b388ff',
                '--color-primary-dark': '#7c4dff',
                '--color-secondary': '#ea80fc',
                '--color-accent': '#ffd54f',
                '--color-danger': '#ff5252',
                '--color-gold': '#ffd54f',
                '--text-primary': '#ede7f6',
                '--text-secondary': '#ce93d8',
                '--text-muted': '#9575cd',
                '--border-color': 'rgba(179, 136, 255, 0.2)'
            },
            background: 'radial-gradient(ellipse at center, #1a0d2e 0%, #12061f 70%)',
            cardBack: {
                gradient: 'linear-gradient(135deg, #7c4dff, #651fff)',
                border: 'rgba(255, 255, 255, 0.12)'
            },
            particleColors: ['#b388ff', '#ea80fc', '#ffd54f', '#ff80ab']
        }));

        this.register(new Theme('dark-gold', '黄金殿堂', {
            variables: {
                '--bg-primary': '#1a1400',
                '--bg-secondary': '#2d2400',
                '--bg-card': '#3d3200',
                '--bg-panel': '#251c00',
                '--color-primary': '#ffd54f',
                '--color-primary-dark': '#f9a825',
                '--color-secondary': '#ffee58',
                '--color-accent': '#ff8f00',
                '--color-danger': '#ff5252',
                '--color-gold': '#ffd54f',
                '--text-primary': '#fff8e1',
                '--text-secondary': '#ffe082',
                '--text-muted': '#ffc107',
                '--border-color': 'rgba(255, 213, 79, 0.2)'
            },
            background: 'radial-gradient(ellipse at center, #2d2400 0%, #1a1400 70%)',
            cardBack: {
                gradient: 'linear-gradient(135deg, #f9a825, #f57f17)',
                border: 'rgba(255, 255, 255, 0.15)'
            },
            particleColors: ['#ffd54f', '#ffee58', '#ff8f00', '#fff']
        }));

        this.register(new Theme('light', '清新白', {
            variables: {
                '--bg-primary': '#f5f5f5',
                '--bg-secondary': '#e0e0e0',
                '--bg-card': '#ffffff',
                '--bg-panel': '#fafafa',
                '--color-primary': '#1976d2',
                '--color-primary-dark': '#0d47a1',
                '--color-secondary': '#388e3c',
                '--color-accent': '#f57c00',
                '--color-danger': '#d32f2f',
                '--color-gold': '#f9a825',
                '--text-primary': '#212121',
                '--text-secondary': '#616161',
                '--text-muted': '#9e9e9e',
                '--border-color': 'rgba(0, 0, 0, 0.12)'
            },
            background: 'linear-gradient(135deg, #e8eaf6 0%, #fafafa 100%)',
            cardBack: {
                gradient: 'linear-gradient(135deg, #1976d2, #1565c0)',
                border: 'rgba(0, 0, 0, 0.1)'
            },
            particleColors: ['#1976d2', '#388e3c', '#f9a825', '#d32f2f']
        }));
    }

    register(theme) {
        this.themes[theme.id] = theme;
    }

    getTheme(id) {
        return this.themes[id] || this.themes['dark-blue'];
    }

    getCurrentTheme() {
        return this.getTheme(this.currentThemeId);
    }

    getAllThemes() {
        return Object.values(this.themes);
    }

    setTheme(id) {
        const theme = this.getTheme(id);
        if (!theme) return;

        this.currentThemeId = id;
        this._applyTheme(theme);
        this._save();
    }

    _applyTheme(theme) {
        const root = document.documentElement;

        for (const [key, value] of Object.entries(theme.cssVariables)) {
            root.style.setProperty(key, value);
        }

        const gameScreen = document.getElementById('game-screen');
        if (gameScreen && theme.backgroundStyle) {
            gameScreen.style.background = theme.backgroundStyle;
        }

        const cardBacks = document.querySelectorAll('.card-back');
        cardBacks.forEach(el => {
            if (theme.cardBackStyle.gradient) {
                el.style.background = theme.cardBackStyle.gradient;
            }
            if (theme.cardBackStyle.border) {
                el.style.borderColor = theme.cardBackStyle.border;
            }
        });

        document.body.setAttribute('data-theme', theme.id);
    }

    _save() {
        try {
            localStorage.setItem('doudizhu_theme', this.currentThemeId);
        } catch (e) { /* ignore */ }
    }

    _load() {
        try {
            const saved = localStorage.getItem('doudizhu_theme');
            if (saved && this.themes[saved]) {
                this.currentThemeId = saved;
                this._applyTheme(this.getTheme(saved));
            }
        } catch (e) { /* ignore */ }
    }

    renderThemeSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'theme-grid';

        for (const theme of this.getAllThemes()) {
            const item = document.createElement('div');
            item.className = `theme-item ${theme.id === this.currentThemeId ? 'active' : ''}`;
            item.dataset.themeId = theme.id;

            const vars = theme.cssVariables;
            const bgColor = vars['--bg-primary'] || '#0a1628';
            const accentColor = vars['--color-primary'] || '#4fc3f7';
            const secondColor = vars['--color-secondary'] || '#81c784';
            const goldColor = vars['--color-gold'] || '#ffd54f';

            item.innerHTML = `
                <div class="theme-preview" style="background: ${bgColor}">
                    <div class="theme-preview-accent" style="background: ${accentColor}"></div>
                    <div class="theme-preview-secondary" style="background: ${secondColor}"></div>
                    <div class="theme-preview-gold" style="background: ${goldColor}"></div>
                </div>
                <div class="theme-name">${theme.name}</div>
            `;

            item.addEventListener('click', () => {
                this.setTheme(theme.id);
                container.querySelectorAll('.theme-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            });

            grid.appendChild(item);
        }

        container.appendChild(grid);
    }
}

class BackgroundEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this._animFrame = null;
        this._running = false;
        this._stars = [];
        this._type = 'stars';
    }

    init(containerId = 'game-screen') {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'bg-effects-canvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.4;
        `;
        container.insertBefore(this.canvas, container.firstChild);
        this.ctx = this.canvas.getContext('2d');
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this._initStars();
    }

    _initStars() {
        this._stars = [];
        const count = Math.floor((this.canvas.width * this.canvas.height) / 8000);
        for (let i = 0; i < count; i++) {
            this._stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 0.5 + Math.random() * 1.5,
                twinkleSpeed: 0.005 + Math.random() * 0.015,
                twinkleOffset: Math.random() * Math.PI * 2,
                brightness: 0.3 + Math.random() * 0.7
            });
        }
    }

    start(type = 'stars') {
        this._type = type;
        if (this._running) return;
        this._running = true;
        this._animate();
    }

    stop() {
        this._running = false;
        if (this._animFrame) {
            cancelAnimationFrame(this._animFrame);
            this._animFrame = null;
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    _animate() {
        if (!this._running || !this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this._type) {
            case 'stars': this._drawStars(); break;
            case 'snow': this._drawSnow(); break;
            case 'bubbles': this._drawBubbles(); break;
        }

        this._animFrame = requestAnimationFrame(() => this._animate());
    }

    _drawStars() {
        const time = Date.now() / 1000;

        for (const star of this._stars) {
            const twinkle = Math.sin(time * star.twinkleSpeed * 10 + star.twinkleOffset);
            const alpha = star.brightness * (0.5 + 0.5 * twinkle);

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fill();
        }
    }

    _drawSnow() {
        const time = Date.now() / 1000;

        for (const star of this._stars) {
            star.y += 0.3 + star.size * 0.2;
            star.x += Math.sin(time + star.twinkleOffset) * 0.3;

            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * 0.6})`;
            this.ctx.fill();
        }
    }

    _drawBubbles() {
        const time = Date.now() / 1000;

        for (const star of this._stars) {
            star.y -= 0.2 + star.size * 0.1;
            star.x += Math.sin(time * 0.5 + star.twinkleOffset) * 0.4;

            if (star.y < -10) {
                star.y = this.canvas.height + 5;
                star.x = Math.random() * this.canvas.width;
            }

            const radius = star.size * 2;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(79, 195, 247, ${star.brightness * 0.3})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
        }
    }

    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

class TableDecorator {
    constructor() {
        this._elements = [];
    }

    addTablePattern(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const pattern = document.createElement('div');
        pattern.className = 'table-pattern';
        pattern.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 65%;
            height: 55%;
            border: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
        `;
        container.appendChild(pattern);
        this._elements.push(pattern);

        const innerPattern = document.createElement('div');
        innerPattern.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50%;
            height: 40%;
            border: 1px solid rgba(255, 255, 255, 0.02);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
        `;
        container.appendChild(innerPattern);
        this._elements.push(innerPattern);

        const logo = document.createElement('div');
        logo.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 40px;
            opacity: 0.03;
            pointer-events: none;
            z-index: 1;
            font-weight: 900;
            letter-spacing: 8px;
            color: #fff;
        `;
        logo.textContent = '斗地主';
        container.appendChild(logo);
        this._elements.push(logo);
    }

    clear() {
        this._elements.forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        this._elements = [];
    }
}

class ScoreFloater {
    static show(x, y, score) {
        const el = document.createElement('div');
        el.className = `score-fly ${score >= 0 ? 'positive' : 'negative'}`;
        el.textContent = score >= 0 ? `+${score}` : String(score);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);

        setTimeout(() => {
            if (el.parentNode) el.remove();
        }, 1500);
    }
}

class TooltipManager {
    constructor() {
        this._tooltip = null;
        this._visible = false;
    }

    show(x, y, text) {
        if (!this._tooltip) {
            this._tooltip = document.createElement('div');
            this._tooltip.className = 'game-tooltip';
            document.body.appendChild(this._tooltip);
        }

        this._tooltip.textContent = text;
        this._tooltip.style.left = `${x}px`;
        this._tooltip.style.top = `${y - 40}px`;
        this._tooltip.style.display = 'block';
        this._visible = true;
    }

    hide() {
        if (this._tooltip) {
            this._tooltip.style.display = 'none';
        }
        this._visible = false;
    }

    destroy() {
        if (this._tooltip && this._tooltip.parentNode) {
            this._tooltip.remove();
        }
    }
}

