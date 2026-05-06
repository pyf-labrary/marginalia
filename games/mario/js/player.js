/* ========================================
   Super Mario - Player Controller
   ======================================== */

const Player = (() => {
    const TILE = Engine.TILE_SIZE;

    const SMALL_WIDTH = 24;
    const SMALL_HEIGHT = 30;
    const BIG_WIDTH = 24;
    const BIG_HEIGHT = 56;

    const WALK_SPEED = 3.5;
    const RUN_SPEED = 6.0;
    const ACCELERATION = 0.15;
    const DECELERATION = 0.12;
    const FRICTION = 0.08;
    const SKID_DECEL = 0.25;
    const AIR_ACCEL = 0.10;
    const JUMP_FORCE = -11.0;
    const JUMP_FORCE_BIG = -13.0;
    const SHORT_JUMP_MULT = 0.5;
    const WALL_JUMP_FORCE_X = 5;
    const WALL_JUMP_FORCE_Y = -9;
    const COYOTE_TIME = 80;
    const JUMP_BUFFER_TIME = 100;
    const FIREBALL_COOLDOWN = 400;

    let entity = null;
    let state = 'small';
    let direction = 1;
    let animFrame = 0;
    let animTimer = 0;
    let isJumping = false;
    let isDead = false;
    let isInvincible = false;
    let invincibleTimer = 0;
    let starPower = false;
    let starTimer = 0;
    let fireMode = false;
    let fireballCooldown = 0;
    let coyoteTimer = 0;
    let jumpBufferTimer = 0;
    let wasOnGround = false;
    let skidding = false;
    let crouching = false;
    let running = false;
    let lastTapDir = 0;
    let lastTapTime = 0;
    const DOUBLE_TAP_WINDOW = 250;
    let enteringPipe = false;
    let pipeTimer = 0;
    let deathTimer = 0;
    let deathBounceVy = 0;
    let growTimer = 0;
    let shrinkTimer = 0;
    let flagSliding = false;
    let flagSlideY = 0;
    let swimMode = false;
    let swimTimer = 0;
    let prevX = 0;
    let prevY = 0;
    let cheatScale = 1.0;
    let godMode = false;
    let infiniteLives = false;

    function spawn(tileX, tileY) {
        state = 'small';
        fireMode = false;
        starPower = false;
        starTimer = 0;

        entity = {
            x: tileX * TILE,
            y: tileY * TILE - Math.round(SMALL_HEIGHT * cheatScale),
            width: Math.round(SMALL_WIDTH * cheatScale),
            height: Math.round(SMALL_HEIGHT * cheatScale),
            vx: 0,
            vy: 0,
            onGround: false,
            active: true
        };

        direction = 1;
        isDead = false;
        isJumping = false;
        isInvincible = false;
        invincibleTimer = 0;
        crouching = false;
        enteringPipe = false;
        flagSliding = false;
        deathTimer = 0;
        deathBounceVy = 0;
        coyoteTimer = 0;
        jumpBufferTimer = 0;
        running = false;
        growTimer = 0;
        shrinkTimer = 0;
        prevX = entity.x;
        prevY = entity.y;

        document.getElementById('game-container').classList.remove('star-power-active');
    }

    function spawnKeepState(tileX, tileY) {
        const prevState = state;
        const prevFireMode = fireMode;
        const isBigState = prevState === 'big' || prevState === 'fire';
        const h = Math.round((isBigState ? BIG_HEIGHT : SMALL_HEIGHT) * cheatScale);
        const w = Math.round((isBigState ? BIG_WIDTH : SMALL_WIDTH) * cheatScale);

        entity = {
            x: tileX * TILE,
            y: tileY * TILE - h,
            width: w,
            height: h,
            vx: 0,
            vy: 0,
            onGround: false,
            active: true
        };

        direction = 1;
        isDead = false;
        isJumping = false;
        isInvincible = false;
        invincibleTimer = 0;
        crouching = false;
        enteringPipe = false;
        flagSliding = false;
        deathTimer = 0;
        deathBounceVy = 0;
        coyoteTimer = 0;
        jumpBufferTimer = 0;
        running = false;
        growTimer = 0;
        shrinkTimer = 0;
        starPower = false;
        starTimer = 0;
        prevX = entity.x;
        prevY = entity.y;

        document.getElementById('game-container').classList.remove('star-power-active');
    }

    function update(step) {
        if (!entity || !entity.active) return;

        prevX = entity.x;
        prevY = entity.y;

        if (isDead) {
            updateDeath(step);
            return;
        }

        if (growTimer > 0) {
            growTimer -= step * 1000;
            if (growTimer <= 0) {
                const level = Engine.getCurrentLevel();
                if (level) {
                    entity.vy = 1;
                    Physics.moveEntity(entity, level, step);
                    entity.vy = 0;
                }
            }
            return;
        }

        if (shrinkTimer > 0) {
            shrinkTimer -= step * 1000;
            if (shrinkTimer <= 0) {
                const level = Engine.getCurrentLevel();
                if (level) {
                    entity.vy = 1;
                    Physics.moveEntity(entity, level, step);
                    entity.vy = 0;
                }
            }
            return;
        }

        if (flagSliding) {
            updateFlagSlide(step);
            return;
        }

        if (enteringPipe) {
            updatePipeEntry(step);
            return;
        }

        updateTimers(step);
        handleMovement(step);
        handleJump(step);
        handleFireball(step);
        handleCrouch();

        Physics.applyGravity(entity, step);
        const collision = Physics.moveEntity(entity, Engine.getCurrentLevel(), step);

        if (collision.onGround) {
            coyoteTimer = COYOTE_TIME;
            if (!wasOnGround) {
                onLand();
            }
        } else {
            if (coyoteTimer > 0) coyoteTimer -= step * 1000;
        }
        wasOnGround = collision.onGround;

        updateAnimation(step);
        checkSpecialTiles();

        Physics.updateAllCollisions();

        if (entity.y > Engine.getCurrentLevel().height * TILE) {
            Engine.killPlayer();
        }
    }

    function updateTimers(step) {
        const dt = step * 1000;

        if (isInvincible) {
            invincibleTimer -= dt;
            if (invincibleTimer <= 0) {
                isInvincible = false;
            }
        }

        if (starPower) {
            starTimer -= dt;
            if (starTimer <= 0) {
                starPower = false;
                document.getElementById('game-container').classList.remove('star-power-active');
                const level = Engine.getCurrentLevel();
                if (level) {
                    Audio.playMusic(level.theme || 'overworld');
                }
            }
        }

        if (fireballCooldown > 0) fireballCooldown -= dt;
        if (jumpBufferTimer > 0) jumpBufferTimer -= dt;
    }

    function handleMovement(step) {
        const h = Input.getHorizontalAxis();

        if (h !== 0) {
            const now = performance.now();
            if (Input.isJustPressed('left') || Input.isJustPressed('right')) {
                if (h === lastTapDir && (now - lastTapTime) < DOUBLE_TAP_WINDOW) {
                    running = true;
                }
                lastTapDir = h;
                lastTapTime = now;
            }
        } else {
            if (entity.onGround) {
                running = false;
            }
        }

        if (Input.isPressed('run')) running = true;

        const maxSpeed = running ? RUN_SPEED : WALK_SPEED;

        if (crouching && entity.onGround) {
            const slideFriction = Math.abs(entity.vx) > WALK_SPEED ? 0.02 : FRICTION;
            entity.vx *= (1 - slideFriction);
            if (Math.abs(entity.vx) < 0.1) entity.vx = 0;
            return;
        }

        if (h !== 0) {
            direction = h;

            if (entity.onGround && entity.vx !== 0 && Math.sign(entity.vx) !== Math.sign(h)) {
                skidding = true;
                entity.vx += h * SKID_DECEL;
            } else {
                skidding = false;
                const accel = entity.onGround ? ACCELERATION : AIR_ACCEL;
                entity.vx += h * accel;
            }

            if (Math.abs(entity.vx) > maxSpeed) {
                entity.vx = Math.sign(entity.vx) * maxSpeed;
            }
        } else {
            skidding = false;
            if (entity.onGround) {
                entity.vx *= (1 - DECELERATION);
                if (Math.abs(entity.vx) < 0.1) entity.vx = 0;
            } else {
                entity.vx *= (1 - FRICTION);
            }
        }
    }

    function handleJump(step) {
        if (Input.isJustPressed('jump') || Input.consumeBuffer('jump')) {
            jumpBufferTimer = JUMP_BUFFER_TIME;
        }

        const canJump = entity.onGround || coyoteTimer > 0;

        if (jumpBufferTimer > 0 && canJump && !isJumping) {
            const force = isBig() ? JUMP_FORCE_BIG : JUMP_FORCE;
            const speedBonus = Math.abs(entity.vx) * 0.15;
            entity.vy = force - speedBonus;
            isJumping = true;
            coyoteTimer = 0;
            jumpBufferTimer = 0;

            Audio.play(isBig() ? 'jumpBig' : 'jump');
            Particles.createJumpDust(entity.x + entity.width / 2, entity.y + entity.height);
        }

        if (isJumping && !Input.isPressed('jump') && entity.vy < 0) {
            entity.vy *= SHORT_JUMP_MULT;
            isJumping = false;
        }

        if (entity.onGround && entity.vy >= 0) {
            isJumping = false;
        }
    }

    function handleFireball(step) {
        if (!fireMode || fireballCooldown > 0) return;

        if ((Input.isJustPressed('run') || Input.isMouseDown()) && !crouching) {
            const fbX = direction === 1 ? entity.x + entity.width : entity.x - 12;
            const fbY = entity.y + entity.height / 2 - 6;

            const fireball = {
                x: fbX, y: fbY,
                width: 12, height: 12,
                vx: direction * 8,
                vy: 0,
                active: true,
                bounceCount: 0,
                maxBounces: 4,
                update(step) {
                    this.vy += 0.4;
                    this.x += this.vx;
                    this.y += this.vy;

                    const level = Engine.getCurrentLevel();
                    const col = Math.floor((this.x + 6) / TILE);
                    const row = Math.floor((this.y + 12) / TILE);
                    const tileBelow = Physics.getTile(level, col, row);

                    if (Physics.isSolid(tileBelow) && this.vy > 0) {
                        this.y = (row) * TILE - this.height;
                        this.vy = -6;
                        this.bounceCount++;
                    }

                    const tileAhead = Physics.getTile(level, Math.floor((this.x + (this.vx > 0 ? 12 : 0)) / TILE), Math.floor((this.y + 6) / TILE));
                    if (Physics.isSolid(tileAhead)) {
                        this.active = false;
                        Particles.createSmallExplosion(this.x, this.y);
                    }

                    if (this.bounceCount >= this.maxBounces) this.active = false;
                    if (this.y > Engine.getCurrentLevel().height * TILE) this.active = false;
                },
                render(ctx, camera) {
                    Sprites.drawFireball(ctx, this.x - camera.x, this.y - camera.y);
                }
            };

            Engine.addProjectile(fireball);
            fireballCooldown = FIREBALL_COOLDOWN;
            Audio.play('fireball');
        }
    }

    function handleCrouch() {
        const scaledSmallH = Math.round(SMALL_HEIGHT * cheatScale);
        const scaledBigH = Math.round(BIG_HEIGHT * cheatScale);
        if (Input.isPressed('down') && entity.onGround && isBig()) {
            if (!crouching) {
                crouching = true;
                entity.y += scaledBigH - scaledSmallH;
                entity.height = scaledSmallH;
            }
        } else if (crouching) {
            const testY = entity.y - (scaledBigH - scaledSmallH);
            const level = Engine.getCurrentLevel();
            const col = Math.floor((entity.x + entity.width / 2) / TILE);
            const row = Math.floor(testY / TILE);
            const tile = Physics.getTile(level, col, row);

            if (!Physics.isSolid(tile)) {
                crouching = false;
                entity.y = testY;
                entity.height = scaledBigH;
            }
        }
    }

    function checkSpecialTiles() {
        const level = Engine.getCurrentLevel();
        if (!level) return;

        const centerCol = Math.floor((entity.x + entity.width / 2) / TILE);
        const bottomRow = Math.floor((entity.y + entity.height - 1) / TILE);

        const tile = Physics.getTile(level, centerCol, bottomRow);

        if (Physics.isHazard(tile)) {
            takeDamage();
        }

        const endCol = Math.floor((entity.x + entity.width / 2) / TILE);
        const endRow = Math.floor(entity.y / TILE);
        for (let r = endRow; r < level.height; r++) {
            const t = Physics.getTile(level, endCol, r);
            if (t === 60 || t === 61) {
                startFlagSlide(endCol, r);
                break;
            }
        }

        if (level.pipes) {
            for (const pipe of level.pipes) {
                if (Input.isPressed('down') && entity.onGround) {
                    if (Math.abs(entity.x + entity.width / 2 - pipe.x * TILE - TILE) < 10 &&
                        Math.abs(entity.y + entity.height - pipe.y * TILE) < 4) {
                        enterPipe(pipe);
                    }
                }
            }
        }
    }

    function onLand() {
        Particles.createLandDust(entity.x + entity.width / 2, entity.y + entity.height);
    }

    function startFlagSlide(col, row) {
        flagSliding = true;
        entity.vx = 0;
        entity.vy = 0;
        entity.x = col * TILE - entity.width / 2;
        flagSlideY = entity.y;

        Audio.play('flagpole');

        const level = Engine.getCurrentLevel();
        const flagTop = 2 * TILE;
        const flagBottom = (level.height - 2) * TILE;
        const ratio = 1 - (flagSlideY - flagTop) / (flagBottom - flagTop);
        const bonus = Math.floor(ratio * 5000);
        Engine.addScore(bonus, entity.x, entity.y);
    }

    function updateFlagSlide(step) {
        const level = Engine.getCurrentLevel();
        const bottomY = (level.height - 2) * TILE - entity.height;

        if (entity.y < bottomY) {
            entity.y += 3;
        } else {
            entity.y = bottomY;
            entity.vx = WALK_SPEED;
            direction = 1;
            entity.x += entity.vx;

            if (entity.x > Engine.getCurrentLevel().width * TILE - TILE * 4) {
                flagSliding = false;
                Engine.levelComplete();
            }
        }
    }

    function enterPipe(pipe) {
        enteringPipe = true;
        pipeTimer = 500;
        entity.vx = 0;
        entity.vy = 0;
        Audio.play('pipe');

        Engine.emit('pipeEnter', pipe);
    }

    function updatePipeEntry(step) {
        pipeTimer -= step * 1000;
        entity.y += 1;

        if (pipeTimer <= 0) {
            enteringPipe = false;
            Engine.emit('pipeExit');
        }
    }

    function updateDeath(step) {
        deathTimer -= step * 1000;

        if (deathTimer > 2700) {
            return;
        }

        if (deathBounceVy === 0 && deathTimer <= 2700 && deathTimer > 2600) {
            deathBounceVy = -10;
        }

        deathBounceVy += 0.45;
        entity.y += deathBounceVy;

        if (entity.y > Engine.CANVAS_HEIGHT + 100 && deathTimer > -999) {
            deathTimer = -999;
            if (Engine.getLives() <= 0) {
                setTimeout(() => {
                    Engine.emit('gameOver');
                    Engine.setState('gameOver');
                }, 800);
            } else {
                setTimeout(() => Engine.respawnPlayer(), 800);
            }
        }
    }

    function updateAnimation(step) {
        animTimer += step * 1000;

        const speed = Math.abs(entity.vx);
        const frameTime = speed > 4 ? 60 : speed > 2 ? 100 : 150;

        if (animTimer >= frameTime) {
            animTimer -= frameTime;
            if (speed > 0.5) {
                animFrame = (animFrame + 1) % 4;
            } else {
                animFrame = 0;
            }
        }
    }

    function render(ctx, camera, alpha) {
        if (!entity || !entity.active) return;

        if (isInvincible && !starPower) {
            if (Math.floor(invincibleTimer / 50) % 2 === 0) return;
        }

        const big = isBig();
        let spriteState = 'normal';
        if (starPower) spriteState = 'star';
        else if (fireMode) spriteState = 'fire';

        const spriteBig = big && !crouching && !isDead;
        const s = cheatScale;
        const baseW = spriteBig ? BIG_WIDTH : SMALL_WIDTH;
        const baseH = spriteBig ? BIG_HEIGHT : SMALL_HEIGHT;
        const drawX = entity.x - camera.x + (entity.width - baseW * s) / 2;
        const drawY = entity.y - camera.y + (entity.height - baseH * s);

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.scale(s, s);

        if (isDead) {
            Sprites.drawMario(ctx, 0, 0, 'normal', direction, 0, false);
            ctx.restore();
            return;
        }

        if (!entity.onGround && !flagSliding) {
            Sprites.drawMarioJumping(ctx, 0, 0, spriteState, direction, big);
        } else if (crouching) {
            Sprites.drawMario(ctx, 0, 0, spriteState, direction, 0, false);
        } else if (skidding) {
            Sprites.drawMario(ctx, 0, 0, spriteState, -direction, 0, big);
        } else {
            Sprites.drawMario(ctx, 0, 0, spriteState, direction, animFrame, big);
        }
        ctx.restore();
    }

    function die() {
        isDead = true;
        deathTimer = 3000;
        entity.vx = 0;
        entity.vy = 0;
        deathBounceVy = 0;

        state = 'small';
        fireMode = false;
        starPower = false;
        crouching = false;
        entity.width = Math.round(SMALL_WIDTH * cheatScale);
        entity.height = Math.round(SMALL_HEIGHT * cheatScale);

        Audio.stopMusic();
        Audio.play('die');
        document.getElementById('game-container').classList.remove('star-power-active');

        Engine.emit('playerDeath');
    }

    function takeDamage() {
        if (godMode || isInvincible || isDead || starPower) return;

        if (state === 'fire') {
            setFireMode(false);
            setState('big');
            becomeInvincible(3000);
            Audio.play('powerDown');
            shrinkTimer = 0;
        } else if (state === 'big') {
            shrinkToBig();
            becomeInvincible(3000);
            Audio.play('powerDown');
        } else {
            Engine.killPlayer();
        }
    }

    function shrinkToBig() {
        state = 'small';
        shrinkTimer = 300;
        const feetY = entity.y + entity.height;
        entity.width = Math.round(SMALL_WIDTH * cheatScale);
        entity.height = Math.round(SMALL_HEIGHT * cheatScale);
        entity.y = feetY - entity.height;
    }

    function growToBig() {
        if (state === 'small') {
            state = 'big';
            growTimer = 300;
            const feetY = entity.y + entity.height;
            entity.width = Math.round(BIG_WIDTH * cheatScale);
            entity.height = Math.round(BIG_HEIGHT * cheatScale);
            entity.y = feetY - entity.height;
            Audio.play('powerUp');
        }
    }

    function setFireMode(enabled) {
        fireMode = enabled;
        if (enabled) {
            state = 'fire';
            if (!isBig()) growToBig();
            Audio.play('powerUp');
        } else {
            state = isBig() ? 'big' : 'small';
        }
    }

    function activateStarPower() {
        starPower = true;
        starTimer = 10000;
        isInvincible = true;
        invincibleTimer = 10000;
        document.getElementById('game-container').classList.add('star-power-active');
        Audio.stopMusic();
        Audio.playMusic('starPower');
        Audio.play('star');
    }

    function becomeInvincible(duration) {
        isInvincible = true;
        invincibleTimer = duration;
    }

    function setCheatScale(s) {
        s = Math.max(0.3, Math.min(5.0, s));
        if (!entity) { cheatScale = s; return; }
        const big = isBig();
        const baseW = big ? BIG_WIDTH : SMALL_WIDTH;
        const baseH = big ? BIG_HEIGHT : SMALL_HEIGHT;
        const feetY = entity.y + entity.height;
        const centerX = entity.x + entity.width / 2;
        cheatScale = s;
        entity.width = Math.round(baseW * s);
        entity.height = Math.round(baseH * s);
        entity.x = centerX - entity.width / 2;
        entity.y = feetY - entity.height;
    }
    function getCheatScale() { return cheatScale; }
    function setGodMode(v) { godMode = !!v; }
    function isGodMode() { return godMode; }
    function setInfiniteLives(v) { infiniteLives = !!v; }
    function hasInfiniteLives() { return infiniteLives; }

    function setState(s) { state = s; }
    function getState() { return state; }
    function isBig() { return state === 'big' || state === 'fire'; }
    function hasStarPower() { return starPower; }
    function hasFireMode() { return fireMode; }
    function getEntity() { return entity; }
    function getDirection() { return direction; }
    function isDying() { return isDead; }
    function isInvincibleNow() { return isInvincible; }
    function getAnimFrame() { return animFrame; }
    function isOnGround() { return entity ? entity.onGround : false; }
    function getPrevPos() { return { x: prevX, y: prevY }; }
    function isCrouching() { return crouching; }
    function isSkidding() { return skidding; }

    function getSaveState() {
        return { state, fireMode, starPower };
    }

    function restoreSaveState(save) {
        if (!save || !entity) return;
        if (save.state === 'big' || save.state === 'fire') {
            state = save.state;
            entity.width = Math.round(BIG_WIDTH * cheatScale);
            entity.height = Math.round(BIG_HEIGHT * cheatScale);
            entity.y -= Math.round((BIG_HEIGHT - SMALL_HEIGHT) * cheatScale);
        }
        if (save.fireMode) fireMode = true;
    }

    return {
        spawn, spawnKeepState, update, render, die, takeDamage,
        growToBig, setFireMode, activateStarPower, becomeInvincible,
        getEntity, getState, setState, isBig, hasStarPower, hasFireMode,
        getDirection, isDying, isInvincible: isInvincibleNow,
        getAnimFrame, isOnGround, getPrevPos, isCrouching, isSkidding,
        getSaveState, restoreSaveState,
        setCheatScale, getCheatScale, setGodMode, isGodMode,
        setInfiniteLives, hasInfiniteLives
    };
})();
