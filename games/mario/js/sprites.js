/* ========================================
   Super Mario - Sprite Drawing System
   Pure canvas-based sprite rendering
   ======================================== */

const Sprites = (() => {
    const TILE = 32;
    const cache = {};

    function createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    }

    function getCached(key, w, h, drawFn) {
        if (cache[key]) return cache[key];
        const c = createCanvas(w, h);
        const ctx = c.getContext('2d');
        drawFn(ctx, w, h);
        cache[key] = c;
        return c;
    }

    function drawMario(ctx, x, y, state, direction, frame, big) {
        const h = big ? TILE * 2 : TILE;
        const w = TILE;

        ctx.save();
        if (direction === 1) {
            ctx.translate(x + w, y);
            ctx.scale(-1, 1);
            x = 0;
            y = 0;
        }

        if (state === 'star') {
            const hue = (Date.now() * 0.5) % 360;
            drawMarioBody(ctx, x, y, w, h, big, frame, `hsl(${hue}, 80%, 50%)`, `hsl(${hue + 120}, 80%, 40%)`);
        } else if (state === 'fire') {
            drawMarioBody(ctx, x, y, w, h, big, frame, '#fcfcfc', '#e52521');
        } else {
            drawMarioBody(ctx, x, y, w, h, big, frame, '#e52521', '#049cd8');
        }

        ctx.restore();
    }

    function drawMarioBody(ctx, x, y, w, h, big, frame, mainColor, accentColor) {
        if (big) {
            drawBigMario(ctx, x, y, w, h, frame, mainColor, accentColor);
        } else {
            drawSmallMario(ctx, x, y, w, h, frame, mainColor, accentColor);
        }
    }

    function drawSmallMario(ctx, x, y, w, h, frame, mainColor, accentColor) {
        ctx.fillStyle = mainColor;
        ctx.fillRect(x + 8, y + 2, 14, 10);

        ctx.fillStyle = '#fcc8a8';
        ctx.fillRect(x + 8, y + 6, 10, 6);

        ctx.fillStyle = '#4a2800';
        ctx.fillRect(x + 16, y + 8, 2, 2);

        ctx.fillStyle = mainColor;
        if (frame === 0) {
            ctx.fillRect(x + 4, y + 12, 22, 10);
        } else if (frame === 1) {
            ctx.fillRect(x + 4, y + 11, 22, 10);
        } else {
            ctx.fillRect(x + 4, y + 12, 22, 10);
        }

        ctx.fillStyle = accentColor;
        ctx.fillRect(x + 6, y + 14, 18, 6);

        ctx.fillStyle = '#fcc8a8';
        if (frame === 1) {
            ctx.fillRect(x + 4, y + 22, 6, 8);
            ctx.fillRect(x + 18, y + 24, 6, 6);
        } else if (frame === 2) {
            ctx.fillRect(x + 4, y + 24, 6, 6);
            ctx.fillRect(x + 18, y + 22, 6, 8);
        } else {
            ctx.fillRect(x + 6, y + 22, 6, 8);
            ctx.fillRect(x + 16, y + 22, 6, 8);
        }

        ctx.fillStyle = '#8c4800';
        ctx.fillRect(x + 4, y + 28, 8, 4);
        ctx.fillRect(x + 16, y + 28, 8, 4);
    }

    function drawBigMario(ctx, x, y, w, h, frame, mainColor, accentColor) {
        ctx.fillStyle = mainColor;
        ctx.fillRect(x + 6, y + 2, 18, 14);

        ctx.fillStyle = '#fcc8a8';
        ctx.fillRect(x + 6, y + 8, 16, 10);

        ctx.fillStyle = '#4a2800';
        ctx.fillRect(x + 18, y + 12, 3, 3);

        ctx.fillStyle = '#4a2800';
        ctx.fillRect(x + 10, y + 16, 12, 3);

        ctx.fillStyle = mainColor;
        ctx.fillRect(x + 2, y + 18, 26, 16);

        ctx.fillStyle = accentColor;
        ctx.fillRect(x + 4, y + 22, 22, 12);

        ctx.fillStyle = mainColor;
        ctx.fillRect(x + 10, y + 24, 10, 4);

        ctx.fillStyle = '#fcc8a8';
        if (frame === 1) {
            ctx.fillRect(x + 2, y + 34, 10, 14);
            ctx.fillRect(x + 18, y + 38, 10, 10);
        } else if (frame === 2) {
            ctx.fillRect(x + 2, y + 38, 10, 10);
            ctx.fillRect(x + 18, y + 34, 10, 14);
        } else if (frame === 3) {
            ctx.fillRect(x + 4, y + 34, 10, 14);
            ctx.fillRect(x + 16, y + 34, 10, 14);
        } else {
            ctx.fillRect(x + 4, y + 34, 10, 14);
            ctx.fillRect(x + 16, y + 34, 10, 14);
        }

        ctx.fillStyle = '#8c4800';
        ctx.fillRect(x + 2, y + 46, 12, 6);
        ctx.fillRect(x + 16, y + 46, 12, 6);
    }

    function drawMarioJumping(ctx, x, y, state, direction, big) {
        const h = big ? TILE * 2 : TILE;
        ctx.save();
        if (direction === 1) {
            ctx.translate(x + TILE, y);
            ctx.scale(-1, 1);
            x = 0; y = 0;
        }

        const mainColor = state === 'fire' ? '#fcfcfc' : (state === 'star' ? `hsl(${(Date.now()*0.5)%360}, 80%, 50%)` : '#e52521');
        const accentColor = state === 'fire' ? '#e52521' : (state === 'star' ? `hsl(${((Date.now()*0.5)+120)%360}, 80%, 40%)` : '#049cd8');

        if (big) {
            ctx.fillStyle = mainColor;
            ctx.fillRect(x + 6, y + 2, 18, 14);
            ctx.fillStyle = '#fcc8a8';
            ctx.fillRect(x + 6, y + 8, 16, 10);
            ctx.fillStyle = '#4a2800';
            ctx.fillRect(x + 18, y + 12, 3, 3);
            ctx.fillStyle = mainColor;
            ctx.fillRect(x + 2, y + 18, 26, 16);
            ctx.fillStyle = accentColor;
            ctx.fillRect(x + 4, y + 22, 22, 12);
            ctx.fillStyle = '#fcc8a8';
            ctx.fillRect(x + 0, y + 34, 10, 8);
            ctx.fillRect(x + 20, y + 42, 10, 8);
            ctx.fillStyle = '#8c4800';
            ctx.fillRect(x + -2, y + 40, 10, 6);
            ctx.fillRect(x + 22, y + 48, 10, 4);
        } else {
            ctx.fillStyle = mainColor;
            ctx.fillRect(x + 8, y + 2, 14, 10);
            ctx.fillStyle = '#fcc8a8';
            ctx.fillRect(x + 8, y + 6, 10, 6);
            ctx.fillStyle = '#4a2800';
            ctx.fillRect(x + 16, y + 8, 2, 2);
            ctx.fillStyle = mainColor;
            ctx.fillRect(x + 4, y + 12, 22, 10);
            ctx.fillStyle = accentColor;
            ctx.fillRect(x + 6, y + 14, 18, 6);
            ctx.fillStyle = '#fcc8a8';
            ctx.fillRect(x + 2, y + 20, 8, 6);
            ctx.fillRect(x + 20, y + 24, 8, 6);
            ctx.fillStyle = '#8c4800';
            ctx.fillRect(x + 0, y + 24, 8, 4);
            ctx.fillRect(x + 22, y + 28, 8, 4);
        }

        ctx.restore();
    }

    function drawGoomba(ctx, x, y, frame, squished) {
        ctx.save();
        if (squished) {
            ctx.fillStyle = '#c86800';
            ctx.fillRect(x + 2, y + TILE - 10, TILE - 4, 10);
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 8, y + TILE - 8, 3, 3);
            ctx.fillRect(x + 18, y + TILE - 8, 3, 3);
            ctx.restore();
            return;
        }

        ctx.fillStyle = '#c86800';
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + 12, 13, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(x + 3, y + 12, TILE - 6, 10);

        ctx.fillStyle = '#fcc8a8';
        ctx.fillRect(x + 6, y + 12, TILE - 12, 6);

        ctx.fillStyle = '#000';
        ctx.fillRect(x + 8, y + 13, 4, 4);
        ctx.fillRect(x + 18, y + 13, 4, 4);

        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 9, y + 13, 2, 2);
        ctx.fillRect(x + 19, y + 13, 2, 2);

        ctx.fillStyle = '#4a2800';
        if (frame === 0) {
            ctx.fillRect(x + 2, y + 22, 12, 10);
            ctx.fillRect(x + 16, y + 24, 12, 8);
        } else {
            ctx.fillRect(x + 2, y + 24, 12, 8);
            ctx.fillRect(x + 16, y + 22, 12, 10);
        }

        ctx.restore();
    }

    function drawKoopa(ctx, x, y, frame, direction, color) {
        ctx.save();

        const bodyColor = color === 'red' ? '#e52521' : '#00a800';
        const darkColor = color === 'red' ? '#aa1a18' : '#006800';

        if (direction === 1) {
            ctx.translate(x + TILE, y);
            ctx.scale(-1, 1);
            x = 0; y = 0;
        }

        ctx.fillStyle = '#fcd848';
        ctx.fillRect(x + 6, y + 2, 14, 12);

        ctx.fillStyle = '#000';
        ctx.fillRect(x + 14, y + 6, 4, 4);

        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 15, y + 6, 2, 2);

        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 4, y + 10, 22, 14);

        ctx.fillStyle = darkColor;
        ctx.fillRect(x + 6, y + 12, 18, 10);

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + 8, 14, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#fcd848';
        if (frame === 0) {
            ctx.fillRect(x + 4, y + 24, 8, 8);
            ctx.fillRect(x + 18, y + 26, 8, 6);
        } else {
            ctx.fillRect(x + 4, y + 26, 8, 6);
            ctx.fillRect(x + 18, y + 24, 8, 8);
        }

        ctx.restore();
    }

    function drawKoopaShell(ctx, x, y, color, spinning) {
        const bodyColor = color === 'red' ? '#e52521' : '#00a800';
        const darkColor = color === 'red' ? '#aa1a18' : '#006800';

        ctx.save();

        if (spinning) {
            const rot = (Date.now() * 0.01) % (Math.PI * 2);
            ctx.translate(x + TILE / 2, y + TILE / 2);
            ctx.rotate(rot);
            ctx.translate(-TILE / 2, -TILE / 2);
            x = 0; y = 0;
        }

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(x + TILE / 2, y + TILE / 2, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.ellipse(x + TILE / 2, y + TILE / 2 + 2, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(x + TILE / 2 - 3, y + TILE / 2 - 4, 4, 3, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawPiranha(ctx, x, y, frame) {
        ctx.save();

        ctx.fillStyle = '#00a800';
        ctx.fillRect(x + 8, y + 14, 16, 18);

        ctx.fillStyle = '#e52521';
        const openAmount = frame === 0 ? 0 : 4;
        ctx.fillRect(x + 4, y + 2, 24, 14 + openAmount);

        ctx.fillStyle = '#fff';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(x + 6 + i * 4, y + 14, 2, 3);
            ctx.fillRect(x + 6 + i * 4, y + 2, 2, 3);
        }

        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 10, y + 6, 4, 4);
        ctx.fillRect(x + 18, y + 6, 4, 4);

        ctx.fillStyle = '#000';
        ctx.fillRect(x + 12, y + 7, 2, 2);
        ctx.fillRect(x + 20, y + 7, 2, 2);

        ctx.restore();
    }

    function drawMushroom(ctx, x, y, type) {
        ctx.save();
        const capColor = type === 'oneUp' ? '#00a800' : '#e52521';
        const spotColor = '#fcfcfc';

        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + 12, 14, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(x + 2, y + 12, TILE - 4, 4);

        ctx.fillStyle = spotColor;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 6, y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + TILE - 6, y + 10, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fcc8a8';
        ctx.fillRect(x + 6, y + 16, TILE - 12, 10);

        ctx.fillStyle = '#000';
        ctx.fillRect(x + 10, y + 18, 3, 3);
        ctx.fillRect(x + 18, y + 18, 3, 3);

        ctx.restore();
    }

    function drawFireFlower(ctx, x, y) {
        ctx.save();

        const t = Date.now() * 0.003;
        const colorShift = Math.floor(t % 4);
        const colors = ['#e52521', '#faa005', '#fcfcfc', '#faa005'];
        const petalColor = colors[colorShift];

        ctx.fillStyle = '#00a800';
        ctx.fillRect(x + 13, y + 16, 6, 12);
        ctx.fillRect(x + 8, y + 22, 6, 4);
        ctx.fillRect(x + 18, y + 20, 6, 4);

        ctx.fillStyle = petalColor;
        const cx = x + TILE / 2;
        const cy = y + 10;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const px = cx + Math.cos(angle) * 7;
            const py = cy + Math.sin(angle) * 7;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#fcd848';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawStar(ctx, x, y) {
        ctx.save();

        const bounce = Math.sin(Date.now() * 0.005) * 3;
        const t = Date.now() * 0.003;
        const colors = ['#fcd848', '#faa005', '#fcfcfc'];
        ctx.fillStyle = colors[Math.floor(t % 3)];

        const cx = x + TILE / 2;
        const cy = y + TILE / 2 + bounce;
        const outerR = 13;
        const innerR = 6;

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 72 - 90) * Math.PI / 180;
            const innerAngle = ((i * 72 + 36) - 90) * Math.PI / 180;
            if (i === 0) ctx.moveTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR);
            else ctx.lineTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR);
            ctx.lineTo(cx + Math.cos(innerAngle) * innerR, cy + Math.sin(innerAngle) * innerR);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.fillRect(cx - 4, cy - 2, 3, 3);
        ctx.fillRect(cx + 2, cy - 2, 3, 3);

        ctx.restore();
    }

    function drawFireball(ctx, x, y) {
        ctx.save();
        const rot = (Date.now() * 0.01) % (Math.PI * 2);
        ctx.translate(x + 6, y + 6);
        ctx.rotate(rot);

        ctx.fillStyle = '#faa005';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fcd848';
        ctx.beginPath();
        ctx.arc(-1, -1, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawCoin(ctx, x, y, frame) {
        ctx.save();
        const frames = [1, 0.6, 0.2, 0.6];
        const scaleX = frames[frame % 4];

        ctx.translate(x + TILE / 2, y + TILE / 2);
        ctx.scale(scaleX, 1);

        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffec80';
        ctx.beginPath();
        ctx.arc(-2, -2, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawBulletBill(ctx, x, y, direction) {
        ctx.save();
        if (direction === -1) {
            ctx.translate(x + TILE, y);
            ctx.scale(-1, 1);
            x = 0; y = 0;
        }

        ctx.fillStyle = '#333';
        ctx.fillRect(x + 4, y + 6, TILE - 4, TILE - 12);

        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(x + 4, y + TILE / 2, 10, Math.PI / 2, -Math.PI / 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.fillRect(x + TILE - 10, y + 10, 6, 4);

        ctx.restore();
    }

    function drawBlooper(ctx, x, y, frame) {
        ctx.save();

        ctx.fillStyle = '#fcfcfc';
        const bodyH = frame === 0 ? 20 : 16;
        ctx.fillRect(x + 6, y + 2, 20, bodyH);

        ctx.fillStyle = '#fcfcfc';
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + 4, 10, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.fillRect(x + 10, y + 8, 4, 6);
        ctx.fillRect(x + 18, y + 8, 4, 6);

        const tentacleY = y + bodyH + 2;
        const spread = frame === 0 ? 4 : 10;
        ctx.fillStyle = '#fcfcfc';
        ctx.fillRect(x + 6 - spread, tentacleY, 4, 10);
        ctx.fillRect(x + TILE - 10 + spread, tentacleY, 4, 10);
        ctx.fillRect(x + 12, tentacleY, 4, 8);
        ctx.fillRect(x + 18, tentacleY, 4, 8);

        ctx.restore();
    }

    function drawHammerBro(ctx, x, y, frame, direction) {
        ctx.save();
        if (direction === -1) {
            ctx.translate(x + TILE, y);
            ctx.scale(-1, 1);
            x = 0; y = 0;
        }

        ctx.fillStyle = '#00a800';
        ctx.fillRect(x + 6, y, 20, 16);

        ctx.fillStyle = '#fcd848';
        ctx.fillRect(x + 8, y + 8, 12, 10);

        ctx.fillStyle = '#000';
        ctx.fillRect(x + 16, y + 10, 3, 3);

        ctx.fillStyle = '#00a800';
        ctx.fillRect(x + 4, y + 16, 24, 20);

        ctx.fillStyle = '#fcfcfc';
        ctx.fillRect(x + 8, y + 18, 16, 8);

        ctx.fillStyle = '#fcd848';
        ctx.fillRect(x + 4, y + 36, 10, 12);
        ctx.fillRect(x + 16, y + 36, 10, 12);

        if (frame === 1) {
            ctx.fillStyle = '#8c4800';
            ctx.fillRect(x + 22, y - 8, 4, 16);
            ctx.fillRect(x + 18, y - 10, 12, 4);
        }

        ctx.restore();
    }

    return {
        drawMario, drawMarioJumping, drawMarioBody,
        drawGoomba, drawKoopa, drawKoopaShell, drawPiranha,
        drawMushroom, drawFireFlower, drawStar, drawFireball,
        drawCoin, drawBulletBill, drawBlooper, drawHammerBro,
        getCached, createCanvas
    };
})();
