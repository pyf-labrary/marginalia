/* ========================================
   Super Mario - Rendering System
   ======================================== */

const Renderer = (() => {
    const TILE = 32;
    let animFrame = 0;
    let animTimer = 0;
    const ANIM_SPEED = 150;

    const SKY_COLORS = {
        overworld: ['#5c94fc', '#7cb4ff'],
        underground: ['#000000', '#0a0a1a'],
        castle: ['#1a0a0a', '#0a0000'],
        underwater: ['#0040a0', '#003080'],
        night: ['#0a0a2e', '#1a1a3e']
    };

    const TILE_COLORS = {
        0: null,
        1: { fill: '#c86800', stroke: '#7c3800', type: 'ground' },
        2: { fill: '#c86800', stroke: '#7c3800', type: 'brick' },
        3: { fill: '#faa005', stroke: '#c87000', type: 'question' },
        4: { fill: 'transparent', stroke: 'transparent', type: 'invisible' },
        5: { fill: '#faa005', stroke: '#c87000', type: 'coinBlock' },
        6: { fill: '#886444', stroke: '#664422', type: 'usedBlock' },
        7: { fill: '#888888', stroke: '#666666', type: 'stone' },
        8: { fill: '#c8c8c8', stroke: '#aaaaaa', type: 'steel' },
        9: { fill: '#c86800', stroke: '#7c3800', type: 'groundTop' },
        10: { fill: '#00a800', stroke: '#005800', type: 'pipeTopLeft' },
        11: { fill: '#00a800', stroke: '#005800', type: 'pipeTopRight' },
        12: { fill: '#00a800', stroke: '#006800', type: 'pipeLeft' },
        13: { fill: '#00a800', stroke: '#006800', type: 'pipeRight' },
        14: { fill: '#8c5c00', stroke: '#5c3800', type: 'bridge' },
        15: { fill: '#c86800', stroke: '#7c3800', type: 'stair' },
        16: { fill: '#fcfcfc', stroke: '#e0e0e0', type: 'cloud' },
        17: { fill: '#00c800', stroke: '#008800', type: 'bush' },
        18: { fill: '#006400', stroke: '#004800', type: 'tree' },
        19: { fill: '#8B4513', stroke: '#5c2d0e', type: 'trunk' },
        20: { fill: '#654321', stroke: '#3d2914', type: 'platform' },
        30: { fill: '#886444', stroke: '#664422', type: 'semisolid' },
        31: { fill: '#886444', stroke: '#664422', type: 'semisolidEdge' },
        50: { fill: '#ffd700', stroke: '#daa520', type: 'coin' },
        60: { fill: '#ff0000', stroke: '#cc0000', type: 'flag' },
        61: { fill: '#00ff00', stroke: '#00cc00', type: 'flagPole' }
    };

    function update(dt) {
        animTimer += dt * 1000;
        if (animTimer >= ANIM_SPEED) {
            animTimer -= ANIM_SPEED;
            animFrame = (animFrame + 1) % 4;
        }
    }

    function renderBackground(ctx, camera, level) {
        const theme = level.theme || 'overworld';
        const colors = SKY_COLORS[theme] || SKY_COLORS.overworld;

        const gradient = ctx.createLinearGradient(0, 0, 0, Engine.CANVAS_HEIGHT);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, Engine.CANVAS_WIDTH, Engine.CANVAS_HEIGHT);

        if (theme === 'overworld' || theme === 'night') {
            renderClouds(ctx, camera, level);
            renderHills(ctx, camera, level);
        }

        if (theme === 'night') {
            renderStars(ctx, camera);
        }

        if (theme === 'underwater') {
            renderWaterEffect(ctx, camera);
        }
    }

    function renderClouds(ctx, camera, level) {
        const cloudPositions = level.clouds || generateCloudPositions(level.width);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

        for (const cloud of cloudPositions) {
            const x = cloud.x - camera.x * 0.3;
            const y = cloud.y;
            const w = cloud.w || 64;

            if (x + w < -50 || x > Engine.CANVAS_WIDTH + 50) continue;

            drawCloud(ctx, x, y, w);
        }
    }

    function drawCloud(ctx, x, y, width) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const h = width * 0.4;
        const r = h / 2;

        ctx.beginPath();
        ctx.arc(x + r, y + h - r, r, Math.PI, 0);
        ctx.arc(x + width / 2, y + r * 0.3, r * 1.2, Math.PI, 0);
        ctx.arc(x + width - r, y + h - r, r, Math.PI, 0);
        ctx.lineTo(x + width, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x + width * 0.3, y + h - r * 0.8, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    function generateCloudPositions(levelWidth) {
        const clouds = [];
        for (let i = 0; i < levelWidth; i += 12) {
            clouds.push({
                x: i * TILE + Math.random() * TILE * 6,
                y: 30 + Math.random() * 60,
                w: 48 + Math.random() * 48
            });
        }
        return clouds;
    }

    function renderHills(ctx, camera, level) {
        const parallax = 0.4;
        const offsetX = -camera.x * parallax;

        ctx.fillStyle = '#4aa52e';
        for (let i = -1; i < level.width / 16 + 2; i++) {
            const x = i * 512 + offsetX;
            const y = Engine.CANVAS_HEIGHT - 100;
            drawHill(ctx, x, y, 200, 80);
        }

        ctx.fillStyle = '#56b83a';
        for (let i = -1; i < level.width / 10 + 2; i++) {
            const x = i * 350 + 150 + offsetX * 1.2;
            const y = Engine.CANVAS_HEIGHT - 80;
            drawHill(ctx, x, y, 120, 50);
        }
    }

    function drawHill(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.quadraticCurveTo(x + width / 2, y - height * 0.3, x + width, y + height);
        ctx.closePath();
        ctx.fill();
    }

    function renderStars(ctx, camera) {
        ctx.fillStyle = '#ffffff';
        const seed = 42;
        for (let i = 0; i < 50; i++) {
            const px = ((seed * (i + 1) * 7919) % 10000) / 10000;
            const py = ((seed * (i + 1) * 6271) % 10000) / 10000;
            const size = 1 + (i % 3);
            const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5;

            ctx.globalAlpha = 0.3 + twinkle * 0.7;
            ctx.fillRect(
                px * Engine.CANVAS_WIDTH,
                py * Engine.CANVAS_HEIGHT * 0.6,
                size, size
            );
        }
        ctx.globalAlpha = 1;
    }

    function renderWaterEffect(ctx, camera) {
        ctx.fillStyle = 'rgba(0, 100, 200, 0.1)';
        const t = Date.now() * 0.001;
        for (let y = 0; y < Engine.CANVAS_HEIGHT; y += 20) {
            const offset = Math.sin(t + y * 0.05) * 5;
            ctx.fillRect(offset, y, Engine.CANVAS_WIDTH, 2);
        }
    }

    function renderTiles(ctx, camera, level) {
        if (!level || !level.tiles) return;

        const startCol = Math.max(0, Math.floor(camera.x / TILE) - 1);
        const endCol = Math.min(level.width, Math.ceil((camera.x + Engine.CANVAS_WIDTH) / TILE) + 1);
        const startRow = Math.max(0, Math.floor(camera.y / TILE) - 1);
        const endRow = Math.min(level.height, Math.ceil((camera.y + Engine.CANVAS_HEIGHT) / TILE) + 1);

        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const tile = level.tiles[row * level.width + col];
                if (!tile || tile === 0) continue;

                const x = col * TILE - camera.x;
                const y = row * TILE - camera.y;

                drawTile(ctx, tile, x, y, col, row);
            }
        }
    }

    function drawTile(ctx, tileType, x, y, col, row) {
        const tileInfo = TILE_COLORS[tileType];
        if (!tileInfo || tileInfo.fill === 'transparent') return;

        switch (tileInfo.type) {
            case 'ground':
            case 'groundTop':
                drawGroundTile(ctx, x, y, tileInfo);
                break;
            case 'brick':
                drawBrickTile(ctx, x, y, tileInfo);
                break;
            case 'question':
            case 'coinBlock':
                drawQuestionTile(ctx, x, y, tileInfo);
                break;
            case 'usedBlock':
                drawUsedBlockTile(ctx, x, y, tileInfo);
                break;
            case 'stone':
            case 'steel':
                drawStoneTile(ctx, x, y, tileInfo);
                break;
            case 'pipeTopLeft':
            case 'pipeTopRight':
            case 'pipeLeft':
            case 'pipeRight':
                drawPipeTile(ctx, x, y, tileType, tileInfo);
                break;
            case 'stair':
                drawStairTile(ctx, x, y, tileInfo);
                break;
            case 'coin':
                drawCoinTile(ctx, x, y);
                break;
            case 'flag':
                drawFlagTile(ctx, x, y);
                break;
            case 'flagPole':
                drawFlagPoleTile(ctx, x, y);
                break;
            case 'semisolid':
            case 'semisolidEdge':
                drawSemisolidTile(ctx, x, y, tileInfo);
                break;
            default:
                ctx.fillStyle = tileInfo.fill;
                ctx.fillRect(x, y, TILE, TILE);
                ctx.strokeStyle = tileInfo.stroke;
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
        }
    }

    function drawGroundTile(ctx, x, y, info) {
        ctx.fillStyle = info.fill;
        ctx.fillRect(x, y, TILE, TILE);

        ctx.fillStyle = info.stroke;
        ctx.fillRect(x, y, TILE, 2);
        ctx.fillRect(x, y, 2, TILE);

        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 2, y + 2, TILE - 4, 2);

        ctx.fillStyle = info.stroke;
        const p = 8;
        for (let px = 0; px < TILE; px += p) {
            for (let py = 0; py < TILE; py += p) {
                if ((px + py) % (p * 2) === 0) {
                    ctx.fillRect(x + px + 1, y + py + 1, p - 2, 1);
                }
            }
        }
    }

    function drawBrickTile(ctx, x, y, info) {
        ctx.fillStyle = info.fill;
        ctx.fillRect(x, y, TILE, TILE);

        ctx.strokeStyle = info.stroke;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(x, y + TILE / 2);
        ctx.lineTo(x + TILE, y + TILE / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + TILE / 2, y);
        ctx.lineTo(x + TILE / 2, y + TILE / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + TILE / 2);
        ctx.lineTo(x, y + TILE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + TILE, y + TILE / 2);
        ctx.lineTo(x + TILE, y + TILE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + TILE / 4, y + TILE / 2);
        ctx.lineTo(x + TILE / 4, y + TILE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + TILE * 3 / 4, y + TILE / 2);
        ctx.lineTo(x + TILE * 3 / 4, y + TILE);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 1, y + 1, TILE / 2 - 2, TILE / 2 - 2);
        ctx.fillRect(x + TILE / 4 + 1, y + TILE / 2 + 1, TILE / 2 - 2, TILE / 2 - 2);
    }

    function drawQuestionTile(ctx, x, y, info) {
        const bounce = Math.sin(Date.now() * 0.005) * 2;

        ctx.fillStyle = info.fill;
        ctx.fillRect(x, y + bounce, TILE, TILE);

        ctx.strokeStyle = info.stroke;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + bounce + 1, TILE - 2, TILE - 2);

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x + 2, y + bounce + 2, TILE - 4, 3);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', x + TILE / 2, y + TILE / 2 + bounce);

        ctx.fillStyle = info.stroke;
        ctx.font = 'bold 18px monospace';
        ctx.fillText('?', x + TILE / 2 + 1, y + TILE / 2 + bounce + 1);
        ctx.fillStyle = '#fff';
        ctx.fillText('?', x + TILE / 2, y + TILE / 2 + bounce);
    }

    function drawUsedBlockTile(ctx, x, y, info) {
        ctx.fillStyle = info.fill;
        ctx.fillRect(x, y, TILE, TILE);

        ctx.strokeStyle = info.stroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
    }

    function drawStoneTile(ctx, x, y, info) {
        ctx.fillStyle = info.fill;
        ctx.fillRect(x, y, TILE, TILE);

        ctx.strokeStyle = info.stroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);

        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 2, y + 2, TILE - 4, 2);
        ctx.fillRect(x + 2, y + 2, 2, TILE - 4);
    }

    function drawPipeTile(ctx, x, y, tileType, info) {
        const isTop = tileType === 10 || tileType === 11;
        const isLeft = tileType === 10 || tileType === 12;

        ctx.fillStyle = info.fill;
        ctx.fillRect(x, y, TILE, TILE);

        if (isTop) {
            ctx.fillStyle = '#00c800';
            ctx.fillRect(x - (isLeft ? 4 : 0), y, TILE + 4, TILE);
            ctx.fillStyle = '#00e800';
            ctx.fillRect(x + (isLeft ? 2 : 4), y + 2, TILE - 8, TILE - 2);
        } else {
            ctx.fillStyle = '#00c800';
            ctx.fillRect(x, y, TILE, TILE);
            ctx.fillStyle = '#00e800';
            ctx.fillRect(x + 4, y, TILE - 8, TILE);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        if (isLeft) {
            ctx.fillRect(x + 2, y, 4, TILE);
        }

        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        if (!isLeft) {
            ctx.fillRect(x + TILE - 6, y, 4, TILE);
        }
    }

    function drawStairTile(ctx, x, y, info) {
        ctx.fillStyle = info.fill;
        ctx.fillRect(x, y, TILE, TILE);

        ctx.strokeStyle = info.stroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);

        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 1, y + 1, TILE - 2, 2);
    }

    function drawCoinTile(ctx, x, y) {
        const frames = [1, 0.6, 0.2, 0.6];
        const scaleX = frames[animFrame];

        ctx.save();
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

        ctx.fillStyle = '#daa520';
        ctx.beginPath();
        ctx.arc(2, 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawFlagTile(ctx, x, y) {
        ctx.fillStyle = '#00c800';
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 4);
        ctx.lineTo(x + TILE - 4, y + 12);
        ctx.lineTo(x + 8, y + 20);
        ctx.closePath();
        ctx.fill();
    }

    function drawFlagPoleTile(ctx, x, y) {
        ctx.fillStyle = '#888888';
        ctx.fillRect(x + TILE / 2 - 2, y, 4, TILE);

        ctx.fillStyle = '#aaaaaa';
        ctx.fillRect(x + TILE / 2 - 1, y, 2, TILE);
    }

    function drawSemisolidTile(ctx, x, y, info) {
        ctx.fillStyle = info.fill;
        ctx.fillRect(x, y, TILE, 8);

        ctx.fillStyle = 'rgba(136, 100, 68, 0.5)';
        ctx.fillRect(x + 2, y + 8, 4, TILE - 8);
        ctx.fillRect(x + TILE - 6, y + 8, 4, TILE - 8);
    }

    function renderForeground(ctx, camera, level) {
        if (level.foreground) {
            for (const item of level.foreground) {
                const x = item.x - camera.x;
                const y = item.y - camera.y;
                if (x + item.width < 0 || x > Engine.CANVAS_WIDTH) continue;
                drawForegroundItem(ctx, item, x, y);
            }
        }
    }

    function drawForegroundItem(ctx, item, x, y) {
        ctx.globalAlpha = item.alpha || 0.3;
        ctx.fillStyle = item.color || '#000';
        ctx.fillRect(x, y, item.width, item.height);
        ctx.globalAlpha = 1;
    }

    function renderGrid(ctx, camera, level) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 0.5;

        const startCol = Math.floor(camera.x / TILE);
        const endCol = Math.ceil((camera.x + Engine.CANVAS_WIDTH) / TILE);
        const startRow = Math.floor(camera.y / TILE);
        const endRow = Math.ceil((camera.y + Engine.CANVAS_HEIGHT) / TILE);

        for (let col = startCol; col <= endCol; col++) {
            const x = col * TILE - camera.x;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, Engine.CANVAS_HEIGHT);
            ctx.stroke();
        }

        for (let row = startRow; row <= endRow; row++) {
            const y = row * TILE - camera.y;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(Engine.CANVAS_WIDTH, y);
            ctx.stroke();
        }
    }

    Engine.on('update', (data) => {
        update(data.step);
    });

    return {
        renderBackground, renderTiles, renderForeground,
        renderGrid, drawTile, drawCloud, drawHill,
        TILE_COLORS, SKY_COLORS, update,
        getAnimFrame: () => animFrame
    };
})();
