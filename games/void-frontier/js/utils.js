// ============================================================
// utils.js - General utility functions for Void Frontier
// ============================================================
const VF = window.VF || {};
window.VF = VF;

VF.Utils = {
    // Unique ID generator
    _idCounter: 0,
    uid() { return ++this._idCounter; },

    // Clamp value between min and max
    clamp(v, min, max) { return v < min ? min : v > max ? max : v; },

    // Linear interpolation
    lerp(a, b, t) { return a + (b - a) * t; },

    // Smooth step interpolation
    smoothstep(a, b, t) {
        t = this.clamp((t - a) / (b - a), 0, 1);
        return t * t * (3 - 2 * t);
    },

    // Random float in range
    rand(min, max) { return Math.random() * (max - min) + min; },

    // Random integer in range [min, max]
    randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },

    // Random element from array
    randPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

    // Weighted random pick: items = [{value, weight}, ...]
    weightedPick(items) {
        let total = items.reduce((s, i) => s + i.weight, 0);
        let r = Math.random() * total;
        for (const item of items) {
            r -= item.weight;
            if (r <= 0) return item.value;
        }
        return items[items.length - 1].value;
    },

    // Seeded random number generator (mulberry32)
    seededRNG(seed) {
        return function() {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    },

    // Hash string to number
    hashStr(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const ch = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash |= 0;
        }
        return hash;
    },

    // Deep clone object
    deepClone(obj) { return JSON.parse(JSON.stringify(obj)); },

    // Format number with commas
    formatNum(n) {
        return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Format time in mm:ss
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    // Throttle function calls
    throttle(fn, delay) {
        let last = 0;
        return function(...args) {
            const now = Date.now();
            if (now - last >= delay) {
                last = now;
                return fn.apply(this, args);
            }
        };
    },

    // Object pool for performance
    createPool(factory, reset, initialSize = 50) {
        const pool = [];
        const active = [];
        for (let i = 0; i < initialSize; i++) pool.push(factory());

        return {
            get() {
                const obj = pool.length > 0 ? pool.pop() : factory();
                active.push(obj);
                return obj;
            },
            release(obj) {
                const idx = active.indexOf(obj);
                if (idx !== -1) {
                    active.splice(idx, 1);
                    reset(obj);
                    pool.push(obj);
                }
            },
            releaseAll() {
                while (active.length > 0) {
                    const obj = active.pop();
                    reset(obj);
                    pool.push(obj);
                }
            },
            getActive() { return active; },
            getPoolSize() { return pool.length; },
            getActiveCount() { return active.length; }
        };
    },

    // Color utilities
    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    },

    // Easing functions
    Ease: {
        linear: t => t,
        inQuad: t => t * t,
        outQuad: t => t * (2 - t),
        inOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        inCubic: t => t * t * t,
        outCubic: t => (--t) * t * t + 1,
        inOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        inElastic: t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI / 3)),
        outElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
        outBounce(t) {
            const n1 = 7.5625, d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },

    // Timer helper
    createTimer(duration, onComplete, loop = false) {
        return { elapsed: 0, duration, onComplete, loop, done: false,
            update(dt) {
                if (this.done) return;
                this.elapsed += dt;
                if (this.elapsed >= this.duration) {
                    if (this.onComplete) this.onComplete();
                    if (this.loop) this.elapsed -= this.duration;
                    else this.done = true;
                }
            },
            progress() { return VF.Utils.clamp(this.elapsed / this.duration, 0, 1); },
            reset() { this.elapsed = 0; this.done = false; }
        };
    },

    // Event emitter mixin
    EventEmitter: {
        _events: null,
        on(event, fn) {
            if (!this._events) this._events = {};
            if (!this._events[event]) this._events[event] = [];
            this._events[event].push(fn);
            return this;
        },
        off(event, fn) {
            if (!this._events || !this._events[event]) return this;
            this._events[event] = this._events[event].filter(f => f !== fn);
            return this;
        },
        emit(event, ...args) {
            if (!this._events || !this._events[event]) return;
            for (const fn of this._events[event]) fn(...args);
        }
    },

    // Apply mixin to object
    applyMixin(target, mixin) {
        for (const key of Object.keys(mixin)) {
            if (typeof mixin[key] === 'function') {
                target[key] = mixin[key].bind(target);
            } else {
                target[key] = VF.Utils.deepClone(mixin[key]);
            }
        }
        return target;
    },

    // Debounce function calls
    debounce(fn, delay) {
        let timer = null;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    // Generate a UUID v4
    uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },

    // Shuffle array in place
    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // Chunk array into groups
    chunk(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    },

    // Flatten nested array
    flatten(arr) {
        return arr.reduce((flat, item) =>
            flat.concat(Array.isArray(item) ? this.flatten(item) : item), []);
    },

    // Remove duplicates from array
    unique(arr) {
        return [...new Set(arr)];
    },

    // Group array by key function
    groupBy(arr, keyFn) {
        return arr.reduce((groups, item) => {
            const key = keyFn(item);
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {});
    },

    // Simple string template
    template(str, vars) {
        return str.replace(/\{(\w+)\}/g, (match, key) => vars[key] !== undefined ? vars[key] : match);
    },

    // Convert seconds to human readable
    humanTime(seconds) {
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    },

    // Format large numbers with suffixes
    formatLargeNum(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return Math.floor(n).toString();
    },

    // Color manipulation
    adjustBrightness(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent)));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + Math.round(2.55 * percent)));
        return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
    },

    // Interpolate between two hex colors
    lerpColor(color1, color2, t) {
        const c1 = parseInt(color1.replace('#', ''), 16);
        const c2 = parseInt(color2.replace('#', ''), 16);
        const r = Math.round(((c1 >> 16) & 0xFF) + (((c2 >> 16) & 0xFF) - ((c1 >> 16) & 0xFF)) * t);
        const g = Math.round(((c1 >> 8) & 0xFF) + (((c2 >> 8) & 0xFF) - ((c1 >> 8) & 0xFF)) * t);
        const b = Math.round((c1 & 0xFF) + ((c2 & 0xFF) - (c1 & 0xFF)) * t);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
};
