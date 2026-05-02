/* ========================================
   Super Mario - Items & Power-ups System
   ======================================== */

const Items = (() => {
    const TILE = Engine.TILE_SIZE;
    let items = [];
    let staticCoins = [];
    let collectedCoins = {};

    const ITEM_TYPES = {
        mushroom: {
            width: 28, height: 28,
            speed: 2.0,
            score: 1000,
            movesOnGround: true
        },
        oneUpMushroom: {
            width: 28, height: 28,
            speed: 2.0,
            score: 0,
            movesOnGround: true
        },
        fireFlower: {
            width: 26, height: 28,
            speed: 0,
            score: 1000,
            movesOnGround: false
        },
        star: {
            width: 26, height: 26,
            speed: 3.0,
            score: 1000,
            movesOnGround: true,
            bounces: true
        },
        coin: {
            width: 20, height: 24,
            speed: 0,
            score: 200,
            isCoin: true
        }
    };

    function spawn(type, x, y, source) {
        const typeDef = ITEM_TYPES[type];
        if (!typeDef) return;

        const item = {
            type,
            x, y,
            width: typeDef.width,
            height: typeDef.height,
            vx: 0,
            vy: 0,
            active: true,
            onGround: false,
            collected: false,
            emergeTimer: source === 'fromBlock' ? 500 : 0,
            emergeStartY: y + TILE,
            emergeTargetY: y,
            speed: typeDef.speed,
            direction: 1,
            score: typeDef.score,
            movesOnGround: typeDef.movesOnGround,
            bounces: typeDef.bounces,
            isCoin: typeDef.isCoin,
            animFrame: 0,
            animTimer: 0,
            floatTimer: 0,
            sparkleTimer: 0
        };

        if (source === 'fromBlock') {
            item.y = item.emergeStartY;
            item.emerging = true;
        }

        if (item.movesOnGround) {
            const player = Player.getEntity();
            if (player) {
                item.direction = player.x < x ? -1 : 1;
            }
            item.vx = item.direction * item.speed;
        }

        items.push(item);

        Engine.emit('itemSpawned', { type, x, y });
    }

    function loadLevelItems(itemData) {
        items = [];
        staticCoins = [];
        collectedCoins = {};

        if (!itemData) return;

        for (const data of itemData) {
            if (data.type === 'coin') {
                staticCoins.push({
                    x: data.x * TILE,
                    y: data.y * TILE,
                    width: 20,
                    height: 24,
                    active: true,
                    animFrame: 0,
                    animTimer: 0,
                    collected: false,
                    key: `${data.x},${data.y}`
                });
            } else {
                spawn(data.type, data.x * TILE, data.y * TILE);
            }
        }
    }

    function update(step) {
        const dt = step * 1000;

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            if (!item.active) {
                items.splice(i, 1);
                continue;
            }
            updateItem(item, step, dt);
        }

        for (const coin of staticCoins) {
            if (!coin.active) continue;
            coin.animTimer += dt;
            if (coin.animTimer > 150) {
                coin.animTimer = 0;
                coin.animFrame = (coin.animFrame + 1) % 4;
            }
        }
    }

    function updateItem(item, step, dt) {
        if (item.emerging) {
            item.y -= 1.5;
            if (item.y <= item.emergeTargetY) {
                item.y = item.emergeTargetY;
                item.emerging = false;
            }
            return;
        }

        item.animTimer += dt;
        if (item.animTimer > 150) {
            item.animTimer = 0;
            item.animFrame = (item.animFrame + 1) % 4;
        }

        item.sparkleTimer += dt;
        item.floatTimer += dt;

        if (item.movesOnGround) {
            if (!item.bounces) {
                Physics.applyGravity(item, step);
            } else {
                item.vy += 0.3;
            }

            const level = Engine.getCurrentLevel();
            const collision = Physics.moveEntity(item, level, step);

            if (collision.hitLeft || collision.hitRight) {
                item.direction *= -1;
                item.vx = item.direction * item.speed;
            }

            if (collision.hitBottom && item.bounces) {
                item.vy = -8;
            }
        } else if (item.type === 'fireFlower' || item.type === 'coin') {
            item.floatOffset = Math.sin(item.floatTimer * 0.003) * 3;
        }

        const camera = Engine.getCamera();
        if (item.x < camera.x - TILE * 4 || item.x > camera.x + Engine.CANVAS_WIDTH + TILE * 4) {
            if (item.movesOnGround && item.x < camera.x - TILE * 4) {
                item.active = false;
            }
        }
    }

    function checkCollisions(player) {
        for (const item of items) {
            if (!item.active || item.emerging || item.collected) continue;

            if (Physics.checkEntityCollision(player, item)) {
                collectItem(item);
            }
        }

        for (const coin of staticCoins) {
            if (!coin.active || coin.collected) continue;

            if (Physics.checkAABB(
                player.x, player.y, player.width, player.height,
                coin.x, coin.y, coin.width, coin.height
            )) {
                collectCoin(coin);
            }
        }
    }

    function collectItem(item) {
        item.collected = true;
        item.active = false;

        switch (item.type) {
            case 'mushroom':
                Player.growToBig();
                Engine.addScore(item.score, item.x, item.y);
                Particles.createPowerUpEffect(item.x + item.width / 2, item.y + item.height / 2);
                break;

            case 'oneUpMushroom':
                Engine.addLife();
                Particles.createScorePopup(item.x, item.y, '1UP');
                Particles.createPowerUpEffect(item.x + item.width / 2, item.y + item.height / 2);
                break;

            case 'fireFlower':
                Player.setFireMode(true);
                Engine.addScore(item.score, item.x, item.y);
                Particles.createPowerUpEffect(item.x + item.width / 2, item.y + item.height / 2);
                break;

            case 'star':
                Player.activateStarPower();
                Engine.addScore(item.score, item.x, item.y);
                Particles.createStarEffect(item.x + item.width / 2, item.y + item.height / 2);
                break;

            case 'coin':
                Engine.addCoin(item.x, item.y);
                break;
        }

        Engine.emit('itemCollected', { type: item.type, x: item.x, y: item.y });
    }

    function collectCoin(coin) {
        coin.collected = true;
        coin.active = false;
        collectedCoins[coin.key] = true;
        Engine.addCoin(coin.x + coin.width / 2, coin.y);
        Particles.createCoinCollect(coin.x + coin.width / 2, coin.y + coin.height / 2);
    }

    function render(ctx, camera) {
        for (const coin of staticCoins) {
            if (!coin.active) continue;
            const x = coin.x - camera.x;
            const y = coin.y - camera.y;
            if (x + coin.width < 0 || x > Engine.CANVAS_WIDTH) continue;

            Sprites.drawCoin(ctx, x - 6, y - 4, coin.animFrame);

            if (coin.animTimer < 50) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(x + coin.width / 2 + 4, y + 4, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (const item of items) {
            if (!item.active) continue;
            renderItem(ctx, camera, item);
        }
    }

    function renderItem(ctx, camera, item) {
        const x = item.x - camera.x;
        const y = item.y - camera.y + (item.floatOffset || 0);

        if (x + item.width < 0 || x > Engine.CANVAS_WIDTH) return;

        switch (item.type) {
            case 'mushroom':
                Sprites.drawMushroom(ctx, x, y, 'super');
                break;
            case 'oneUpMushroom':
                Sprites.drawMushroom(ctx, x, y, 'oneUp');
                break;
            case 'fireFlower':
                Sprites.drawFireFlower(ctx, x, y);
                break;
            case 'star':
                Sprites.drawStar(ctx, x, y);
                renderStarTrail(ctx, item, camera);
                break;
            case 'coin':
                Sprites.drawCoin(ctx, x, y, item.animFrame);
                break;
        }

        if (item.sparkleTimer > 200) {
            item.sparkleTimer = 0;
            if (item.type !== 'coin') {
                renderSparkle(ctx, x + Math.random() * item.width, y + Math.random() * item.height);
            }
        }
    }

    function renderStarTrail(ctx, item, camera) {
        ctx.globalAlpha = 0.3;
        for (let i = 1; i <= 3; i++) {
            const trailX = item.x - item.vx * i * 2 - camera.x;
            const trailY = item.y - camera.y;
            ctx.globalAlpha = 0.3 - i * 0.08;
            Sprites.drawStar(ctx, trailX, trailY);
        }
        ctx.globalAlpha = 1;
    }

    function renderSparkle(ctx, x, y) {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.8;
        const s = 2;
        ctx.fillRect(x - s, y, s * 2, 1);
        ctx.fillRect(x, y - s, 1, s * 2);
        ctx.globalAlpha = 1;
    }

    function createBlockCoin(col, row) {
        const coin = {
            x: col * TILE + TILE / 2,
            y: row * TILE,
            vy: -10,
            active: true,
            timer: 600,
            animFrame: 0,
            animTimer: 0
        };

        const updateCoin = () => {
            coin.vy += 0.5;
            coin.y += coin.vy;
            coin.timer -= 16;
            coin.animTimer += 16;
            if (coin.animTimer > 60) {
                coin.animTimer = 0;
                coin.animFrame = (coin.animFrame + 1) % 4;
            }
            if (coin.timer <= 0) {
                coin.active = false;
            }
            if (coin.active) requestAnimationFrame(updateCoin);
        };
        requestAnimationFrame(updateCoin);
    }

    function getItems() { return items; }
    function getStaticCoins() { return staticCoins; }
    function isCollected(key) { return !!collectedCoins[key]; }

    function spawnAtPosition(type, worldX, worldY) {
        spawn(type, worldX, worldY);
    }

    function clearAll() {
        items = [];
        staticCoins = [];
        collectedCoins = {};
    }

    return {
        spawn, loadLevelItems, update, render,
        checkCollisions, getItems, getStaticCoins,
        createBlockCoin, spawnAtPosition, clearAll, isCollected,
        ITEM_TYPES
    };
})();
