// ============================================================
// math-utils.js - Vector math, collision, geometry utilities
// ============================================================
VF.Vec2 = {
    create(x = 0, y = 0) { return { x, y }; },
    add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; },
    sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; },
    mul(v, s) { return { x: v.x * s, y: v.y * s }; },
    div(v, s) { return s !== 0 ? { x: v.x / s, y: v.y / s } : { x: 0, y: 0 }; },
    dot(a, b) { return a.x * b.x + a.y * b.y; },
    cross(a, b) { return a.x * b.y - a.y * b.x; },
    len(v) { return Math.sqrt(v.x * v.x + v.y * v.y); },
    lenSq(v) { return v.x * v.x + v.y * v.y; },
    dist(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); },
    distSq(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; },
    normalize(v) {
        const l = Math.sqrt(v.x * v.x + v.y * v.y);
        return l > 0 ? { x: v.x / l, y: v.y / l } : { x: 0, y: 0 };
    },
    rotate(v, angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
    },
    angle(v) { return Math.atan2(v.y, v.x); },
    angleBetween(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); },
    lerp(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; },
    reflect(v, normal) {
        const d = 2 * (v.x * normal.x + v.y * normal.y);
        return { x: v.x - d * normal.x, y: v.y - d * normal.y };
    },
    fromAngle(angle, length = 1) {
        return { x: Math.cos(angle) * length, y: Math.sin(angle) * length };
    },
    copy(v) { return { x: v.x, y: v.y }; },
    set(target, x, y) { target.x = x; target.y = y; return target; },
    addTo(target, v) { target.x += v.x; target.y += v.y; return target; },
    mulTo(target, s) { target.x *= s; target.y *= s; return target; },
    zero() { return { x: 0, y: 0 }; }
};

VF.Collision = {
    // Circle vs circle
    circleCircle(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1, dy = y2 - y1;
        const distSq = dx * dx + dy * dy;
        const radSum = r1 + r2;
        return distSq <= radSum * radSum;
    },

    // Point in circle
    pointInCircle(px, py, cx, cy, r) {
        const dx = px - cx, dy = py - cy;
        return dx * dx + dy * dy <= r * r;
    },

    // Point in rectangle
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },

    // Circle vs rectangle
    circleRect(cx, cy, cr, rx, ry, rw, rh) {
        const closestX = VF.Utils.clamp(cx, rx, rx + rw);
        const closestY = VF.Utils.clamp(cy, ry, ry + rh);
        const dx = cx - closestX, dy = cy - closestY;
        return dx * dx + dy * dy <= cr * cr;
    },

    // Rectangle vs rectangle
    rectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    },

    // Line segment intersection
    lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 0.0001) return null;
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1), t, u };
        }
        return null;
    },

    // Spatial hash grid for broad-phase collision
    createSpatialHash(cellSize) {
        const cells = {};
        const getKey = (x, y) => `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;

        return {
            clear() { for (const k in cells) delete cells[k]; },
            insert(obj, x, y, r) {
                const minX = Math.floor((x - r) / cellSize);
                const maxX = Math.floor((x + r) / cellSize);
                const minY = Math.floor((y - r) / cellSize);
                const maxY = Math.floor((y + r) / cellSize);
                for (let gx = minX; gx <= maxX; gx++) {
                    for (let gy = minY; gy <= maxY; gy++) {
                        const key = `${gx},${gy}`;
                        if (!cells[key]) cells[key] = [];
                        cells[key].push(obj);
                    }
                }
            },
            query(x, y, r) {
                const result = new Set();
                const minX = Math.floor((x - r) / cellSize);
                const maxX = Math.floor((x + r) / cellSize);
                const minY = Math.floor((y - r) / cellSize);
                const maxY = Math.floor((y + r) / cellSize);
                for (let gx = minX; gx <= maxX; gx++) {
                    for (let gy = minY; gy <= maxY; gy++) {
                        const key = `${gx},${gy}`;
                        if (cells[key]) {
                            for (const obj of cells[key]) result.add(obj);
                        }
                    }
                }
                return [...result];
            }
        };
    }
};

// Perlin noise for procedural generation
VF.Noise = {
    _perm: null,
    init(seed = 42) {
        const rng = VF.Utils.seededRNG(seed);
        this._perm = new Uint8Array(512);
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        for (let i = 0; i < 512; i++) this._perm[i] = p[i & 255];
    },
    _grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    },
    _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); },
    perlin2D(x, y) {
        if (!this._perm) this.init();
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        const xf = x - Math.floor(x), yf = y - Math.floor(y);
        const u = this._fade(xf), v = this._fade(yf);
        const p = this._perm;
        const aa = p[p[X] + Y], ab = p[p[X] + Y + 1];
        const ba = p[p[X + 1] + Y], bb = p[p[X + 1] + Y + 1];
        const x1 = VF.Utils.lerp(this._grad(aa, xf, yf), this._grad(ba, xf - 1, yf), u);
        const x2 = VF.Utils.lerp(this._grad(ab, xf, yf - 1), this._grad(bb, xf - 1, yf - 1), u);
        return VF.Utils.lerp(x1, x2, v);
    },
    fbm(x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
        let sum = 0, amp = 1, freq = 1, maxAmp = 0;
        for (let i = 0; i < octaves; i++) {
            sum += this.perlin2D(x * freq, y * freq) * amp;
            maxAmp += amp;
            amp *= gain;
            freq *= lacunarity;
        }
        return sum / maxAmp;
    }
};

VF.MathUtils = {
    TWO_PI: Math.PI * 2,
    HALF_PI: Math.PI / 2,
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,

    // Normalize angle to [-PI, PI]
    normalizeAngle(a) {
        while (a > Math.PI) a -= VF.MathUtils.TWO_PI;
        while (a < -Math.PI) a += VF.MathUtils.TWO_PI;
        return a;
    },

    // Shortest angle difference
    angleDiff(from, to) {
        return this.normalizeAngle(to - from);
    },

    // Rotate towards target angle at given speed
    rotateTowards(current, target, speed) {
        const diff = this.angleDiff(current, target);
        if (Math.abs(diff) < speed) return target;
        return current + Math.sign(diff) * speed;
    },

    // Map value from one range to another
    map(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    },

    // Bezier curve point
    bezier(t, p0, p1, p2, p3) {
        const u = 1 - t, uu = u * u, uuu = uu * u;
        const tt = t * t, ttt = tt * t;
        return {
            x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
            y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
        };
    },

    // Catmull-Rom spline interpolation
    catmullRom(t, p0, p1, p2, p3) {
        const t2 = t * t, t3 = t2 * t;
        return {
            x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
            y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        };
    },

    // Spring physics simulation
    spring(current, target, velocity, stiffness = 100, damping = 10, dt = 1/60) {
        const force = (target - current) * stiffness;
        const dampForce = -velocity * damping;
        const acceleration = force + dampForce;
        const newVelocity = velocity + acceleration * dt;
        const newPosition = current + newVelocity * dt;
        return { position: newPosition, velocity: newVelocity };
    },

    // Smooth damp (Unity-style)
    smoothDamp(current, target, currentVelocity, smoothTime, maxSpeed = Infinity, dt = 1/60) {
        smoothTime = Math.max(0.0001, smoothTime);
        const omega = 2 / smoothTime;
        const x = omega * dt;
        const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        let change = current - target;
        const maxChange = maxSpeed * smoothTime;
        change = VF.Utils.clamp(change, -maxChange, maxChange);
        const temp = (currentVelocity + omega * change) * dt;
        currentVelocity = (currentVelocity - omega * temp) * exp;
        let output = target + (change + temp) * exp;
        if (target - current > 0 === output > target) {
            output = target;
            currentVelocity = (output - target) / dt;
        }
        return { value: output, velocity: currentVelocity };
    },

    // Polar to cartesian
    polarToCartesian(angle, radius) {
        return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    },

    // Cartesian to polar
    cartesianToPolar(x, y) {
        return { angle: Math.atan2(y, x), radius: Math.sqrt(x * x + y * y) };
    },

    // Check if angle is between two angles
    isAngleBetween(angle, start, end) {
        angle = this.normalizeAngle(angle);
        start = this.normalizeAngle(start);
        end = this.normalizeAngle(end);
        if (start <= end) return angle >= start && angle <= end;
        return angle >= start || angle <= end;
    },

    // Generate points on a circle
    circlePoints(cx, cy, radius, count) {
        const points = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * this.TWO_PI;
            points.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }
        return points;
    },

    // Generate a spiral path
    spiralPoints(cx, cy, startRadius, endRadius, turns, pointsPerTurn = 20) {
        const points = [];
        const totalPoints = turns * pointsPerTurn;
        for (let i = 0; i <= totalPoints; i++) {
            const t = i / totalPoints;
            const angle = t * turns * this.TWO_PI;
            const radius = VF.Utils.lerp(startRadius, endRadius, t);
            points.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }
        return points;
    },

    // Signed area of triangle (for winding order)
    triangleArea(p1, p2, p3) {
        return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
    },

    // Check if point is inside polygon
    pointInPolygon(px, py, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    },

    // Calculate centroid of polygon
    polygonCentroid(polygon) {
        let cx = 0, cy = 0;
        for (const p of polygon) { cx += p.x; cy += p.y; }
        return { x: cx / polygon.length, y: cy / polygon.length };
    }
};
