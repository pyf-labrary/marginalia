/* ========================================
   Super Mario - Physics System
   ======================================== */

const Physics = (() => {
    const TILE = Engine.TILE_SIZE;

    function getTile(level, col, row) {
        if (!level || !level.tiles) return 0;
        if (row < 0 || row >= level.height || col < 0 || col >= level.width) return 0;
        return level.tiles[row * level.width + col] || 0;
    }

    function setTile(level, col, row, value) {
        if (!level || !level.tiles) return;
        if (row < 0 || row >= level.height || col < 0 || col >= level.width) return;
        level.tiles[row * level.width + col] = value;
    }

    function isSolid(tileType) {
        const solidTiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        return solidTiles.includes(tileType);
    }

    function isPlatform(tileType) {
        return tileType === 30 || tileType === 31;
    }

    function isHazard(tileType) {
        return tileType === 40 || tileType === 41;
    }

    function isBreakable(tileType) {
        return tileType === 2;
    }

    function isQuestionBlock(tileType) {
        return tileType === 3;
    }

    function isInvisibleBlock(tileType) {
        return tileType === 4;
    }

    function isPipe(tileType) {
        return tileType >= 10 && tileType <= 13;
    }

    function isCoinBlock(tileType) {
        return tileType === 5;
    }

    function applyGravity(entity, step) {
        entity.vy += Engine.GRAVITY;
        if (entity.vy > Engine.MAX_FALL_SPEED) {
            entity.vy = Engine.MAX_FALL_SPEED;
        }
    }

    function moveEntity(entity, level, step) {
        const result = {
            hitLeft: false,
            hitRight: false,
            hitTop: false,
            hitBottom: false,
            onGround: false,
            hitTile: null,
            hitTileCol: -1,
            hitTileRow: -1
        };

        moveX(entity, level, result);
        moveY(entity, level, result);

        entity.onGround = result.onGround;

        return result;
    }

    function moveX(entity, level, result) {
        entity.x += entity.vx;

        if (entity.vx > 0) {
            const right = entity.x + entity.width;
            const col = Math.floor(right / TILE);
            const topRow = Math.floor(entity.y / TILE);
            const bottomRow = Math.floor((entity.y + entity.height - 1) / TILE);

            for (let row = topRow; row <= bottomRow; row++) {
                const tile = getTile(level, col, row);
                if (isSolid(tile)) {
                    entity.x = col * TILE - entity.width;
                    entity.vx = 0;
                    result.hitRight = true;
                    result.hitTile = tile;
                    result.hitTileCol = col;
                    result.hitTileRow = row;
                    break;
                }
            }
        } else if (entity.vx < 0) {
            const left = entity.x;
            const col = Math.floor(left / TILE);
            const topRow = Math.floor(entity.y / TILE);
            const bottomRow = Math.floor((entity.y + entity.height - 1) / TILE);

            for (let row = topRow; row <= bottomRow; row++) {
                const tile = getTile(level, col, row);
                if (isSolid(tile)) {
                    entity.x = (col + 1) * TILE;
                    entity.vx = 0;
                    result.hitLeft = true;
                    result.hitTile = tile;
                    result.hitTileCol = col;
                    result.hitTileRow = row;
                    break;
                }
            }
        }

        if (entity.x < 0) {
            entity.x = 0;
            entity.vx = 0;
            result.hitLeft = true;
        }
    }

    function moveY(entity, level, result) {
        entity.y += entity.vy;

        if (entity.vy > 0) {
            const bottom = entity.y + entity.height;
            const row = Math.floor(bottom / TILE);
            const leftCol = Math.floor(entity.x / TILE);
            const rightCol = Math.floor((entity.x + entity.width - 1) / TILE);

            for (let col = leftCol; col <= rightCol; col++) {
                const tile = getTile(level, col, row);
                if (isSolid(tile) || isPlatform(tile)) {
                    entity.y = row * TILE - entity.height;
                    entity.vy = 0;
                    result.hitBottom = true;
                    result.onGround = true;
                    result.hitTile = tile;
                    result.hitTileCol = col;
                    result.hitTileRow = row;
                    break;
                }
            }
        } else if (entity.vy < 0) {
            const top = entity.y;
            const row = Math.floor(top / TILE);
            const leftCol = Math.floor((entity.x + 2) / TILE);
            const rightCol = Math.floor((entity.x + entity.width - 3) / TILE);

            for (let col = leftCol; col <= rightCol; col++) {
                const tile = getTile(level, col, row);
                if (isSolid(tile)) {
                    entity.y = (row + 1) * TILE;
                    entity.vy = 0;
                    result.hitTop = true;
                    result.hitTile = tile;
                    result.hitTileCol = col;
                    result.hitTileRow = row;

                    handleBlockHit(level, col, row, tile, entity);
                    break;
                }
            }
        }

        if (entity.y > level.height * TILE + TILE) {
            if (entity === Player.getEntity()) {
                Engine.killPlayer();
            } else {
                entity.active = false;
            }
        }
    }

    function handleBlockHit(level, col, row, tile, entity) {
        if (entity !== Player.getEntity()) return;

        if (isQuestionBlock(tile)) {
            hitQuestionBlock(level, col, row);
        } else if (isBreakable(tile)) {
            if (Player.isBig()) {
                breakBlock(level, col, row);
            } else {
                bumpBlock(col, row);
            }
        } else if (isInvisibleBlock(tile)) {
            hitInvisibleBlock(level, col, row);
        } else if (isCoinBlock(tile)) {
            hitCoinBlock(level, col, row);
        } else {
            bumpBlock(col, row);
        }
    }

    function hitQuestionBlock(level, col, row) {
        setTile(level, col, row, 6);
        bumpBlock(col, row);

        const itemType = getQuestionBlockContent(level, col, row);

        if (itemType === 'coin') {
            Engine.addCoin(col * TILE + TILE / 2, row * TILE - TILE);
            Particles.createCoinBounce(col * TILE + TILE / 2, row * TILE);
        } else {
            Items.spawn(itemType, col * TILE, (row - 1) * TILE, 'fromBlock');
        }

        Audio.play('bump');
        Engine.emit('blockHit', { col, row, type: 'question', item: itemType });
    }

    function getQuestionBlockContent(level, col, row) {
        if (level.blockContents && level.blockContents[`${col},${row}`]) {
            return level.blockContents[`${col},${row}`];
        }
        return Player.isBig() ? 'fireFlower' : 'mushroom';
    }

    function breakBlock(level, col, row) {
        setTile(level, col, row, 0);
        Engine.addScore(50, col * TILE + TILE / 2, row * TILE);

        Particles.createBlockBreak(col * TILE + TILE / 2, row * TILE + TILE / 2);

        Audio.play('breakBlock');
        Engine.screenShake(3, 100);
        Engine.emit('blockBroken', { col, row });
    }

    function bumpBlock(col, row) {
        Particles.createBlockBump(col * TILE, row * TILE);
        Audio.play('bump');

        const level = Engine.getCurrentLevel();
        const entities = Engine.getEntities();
        entities.forEach(entity => {
            if (entity.active) {
                const ex = Math.floor((entity.x + entity.width / 2) / TILE);
                const ey = Math.floor((entity.y + entity.height) / TILE);
                if (ex === col && ey === row) {
                    if (entity.onHitFromBelow) {
                        entity.onHitFromBelow();
                    }
                }
            }
        });
    }

    function hitInvisibleBlock(level, col, row) {
        setTile(level, col, row, 6);
        Items.spawn('oneUpMushroom', col * TILE, (row - 1) * TILE, 'fromBlock');
        bumpBlock(col, row);
    }

    function hitCoinBlock(level, col, row) {
        if (!level.coinBlockCounts) level.coinBlockCounts = {};
        const key = `${col},${row}`;
        if (!level.coinBlockCounts[key]) level.coinBlockCounts[key] = 0;
        level.coinBlockCounts[key]++;

        Engine.addCoin(col * TILE + TILE / 2, row * TILE - TILE);
        Particles.createCoinBounce(col * TILE + TILE / 2, row * TILE);
        bumpBlock(col, row);

        if (level.coinBlockCounts[key] >= 10) {
            setTile(level, col, row, 6);
        }
    }

    function checkEntityCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    function checkAABB(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function getOverlap(a, b) {
        const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        return { x: overlapX, y: overlapY };
    }

    function resolveCollision(a, b) {
        const overlap = getOverlap(a, b);
        if (overlap.x <= 0 || overlap.y <= 0) return null;

        if (overlap.x < overlap.y) {
            if (a.x < b.x) {
                a.x -= overlap.x;
                return 'left';
            } else {
                a.x += overlap.x;
                return 'right';
            }
        } else {
            if (a.y < b.y) {
                a.y -= overlap.y;
                return 'top';
            } else {
                a.y += overlap.y;
                return 'bottom';
            }
        }
    }

    function checkPlayerEnemyCollisions() {
        const player = Player.getEntity();
        if (!player || !player.active || Player.isDying()) return;

        const isInvincibleNonStar = Player.isInvincible() && !Player.hasStarPower();
        if (isInvincibleNonStar) return;

        const entities = Engine.getEntities();

        for (const entity of entities) {
            if (!entity.active || !entity.isEnemy || entity.squished) continue;

            if (entity.shellMode && !entity.shellMoving) {
                if (checkEntityCollision(player, entity)) {
                    kickShell(entity, player);
                }
                continue;
            }

            const stompBox = checkAABB(
                player.x - 2, player.y, player.width + 4, player.height + 4,
                entity.x, entity.y, entity.width, entity.height
            );
            if (!stompBox) continue;

            const playerBottom = player.y + player.height;
            const entityTop = entity.y;

            if (Player.hasStarPower()) {
                destroyEnemy(entity);
                continue;
            }

            if (player.vy >= 0 && playerBottom - entityTop < player.height * 0.65) {
                stompEnemy(entity);
                continue;
            }

            const DMG_SHRINK = 10;
            const dmgHit = checkAABB(
                player.x + DMG_SHRINK, player.y + DMG_SHRINK,
                player.width - DMG_SHRINK * 2, player.height - DMG_SHRINK,
                entity.x + 6, entity.y + 6,
                entity.width - 12, entity.height - 6
            );

            if (dmgHit) {
                Player.takeDamage();
            }
        }
    }

    function showEnemyName(entity) {
        const names = {
            goomba: '栗子怪', koopa: '慢慢龟', koopaRed: '红龟',
            piranha: '食人花', bulletBill: '炮弹', blooper: '乌贼',
            hammerBro: '锤子兄弟', buzzyBeetle: '钢盔龟',
            lakitu: '球盖姆', spiny: '刺猬'
        };
        const name = names[entity.type];
        if (name) {
            Particles.createScorePopup(
                entity.x + entity.width / 2,
                entity.y - 10,
                name
            );
        }
    }

    function kickShell(shell, player) {
        shell.shellMoving = true;
        const playerCenter = player.x + player.width / 2;
        const shellCenter = shell.x + shell.width / 2;
        shell.direction = playerCenter < shellCenter ? 1 : -1;
        shell.vx = shell.direction * shell.shellSpeed;
        Audio.play('kick');
        Engine.addScore(100, shell.x + shell.width / 2, shell.y);
    }

    function stompEnemy(enemy) {
        if (enemy.onStomp) {
            enemy.onStomp();
        }

        const player = Player.getEntity();
        player.vy = Input.isPressed('jump') ? -10 : -7;

        Engine.addScore(enemy.stompScore || 100,
            enemy.x + enemy.width / 2,
            enemy.y);

        Audio.play('stomp');
        Engine.freeze(3);
    }

    function destroyEnemy(enemy) {
        if (enemy.onStarKill) {
            enemy.onStarKill();
        } else {
            enemy.active = false;
            Particles.createEnemyDefeat(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        }

        Engine.addScore(enemy.starScore || 200,
            enemy.x + enemy.width / 2,
            enemy.y);

        Audio.play('kick');
    }

    function checkPlayerItemCollisions() {
        const player = Player.getEntity();
        if (!player || !player.active) return;

        Items.checkCollisions(player);
    }

    function checkProjectileCollisions() {
        const projectiles = Engine.getProjectiles();
        const entities = Engine.getEntities();
        const level = Engine.getCurrentLevel();

        for (const proj of projectiles) {
            if (!proj.active) continue;

            for (const entity of entities) {
                if (!entity.active || !entity.isEnemy) continue;

                if (checkEntityCollision(proj, entity)) {
                    if (entity.onProjectileHit) {
                        entity.onProjectileHit(proj);
                    } else {
                        entity.active = false;
                        Particles.createEnemyDefeat(
                            entity.x + entity.width / 2,
                            entity.y + entity.height / 2
                        );
                    }

                    Engine.addScore(entity.projectileScore || 100,
                        entity.x + entity.width / 2,
                        entity.y);

                    proj.active = false;
                    Audio.play('kick');
                    break;
                }
            }

            const col = Math.floor((proj.x + proj.width / 2) / TILE);
            const row = Math.floor((proj.y + proj.height / 2) / TILE);
            const tile = getTile(level, col, row);
            if (isSolid(tile)) {
                proj.active = false;
                Particles.createSmallExplosion(proj.x, proj.y);
            }
        }
    }

    function updateAllCollisions() {
        checkPlayerEnemyCollisions();
        checkPlayerItemCollisions();
        checkProjectileCollisions();
    }

    function raycast(x, y, dx, dy, maxDist, level) {
        let dist = 0;
        const stepSize = TILE / 4;

        while (dist < maxDist) {
            x += dx * stepSize;
            y += dy * stepSize;
            dist += stepSize;

            const col = Math.floor(x / TILE);
            const row = Math.floor(y / TILE);
            const tile = getTile(level, col, row);

            if (isSolid(tile)) {
                return { hit: true, x, y, col, row, tile, distance: dist };
            }
        }

        return { hit: false, x, y, distance: maxDist };
    }

    function isOnScreen(entity, camera) {
        return entity.x + entity.width > camera.x &&
               entity.x < camera.x + Engine.CANVAS_WIDTH &&
               entity.y + entity.height > camera.y &&
               entity.y < camera.y + Engine.CANVAS_HEIGHT;
    }

    function worldToTile(worldX, worldY) {
        return {
            col: Math.floor(worldX / TILE),
            row: Math.floor(worldY / TILE)
        };
    }

    function tileToWorld(col, row) {
        return {
            x: col * TILE,
            y: row * TILE
        };
    }

    function distanceBetween(a, b) {
        const dx = (a.x + a.width / 2) - (b.x + b.width / 2);
        const dy = (a.y + a.height / 2) - (b.y + b.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }

    return {
        getTile, setTile, isSolid, isPlatform, isHazard,
        isBreakable, isQuestionBlock, isPipe, isCoinBlock,
        applyGravity, moveEntity,
        checkEntityCollision, checkAABB, getOverlap, resolveCollision,
        updateAllCollisions, checkPlayerEnemyCollisions,
        checkPlayerItemCollisions, checkProjectileCollisions,
        raycast, isOnScreen, worldToTile, tileToWorld, distanceBetween,
        handleBlockHit, hitQuestionBlock, breakBlock, bumpBlock
    };
})();
