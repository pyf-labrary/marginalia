/* ========================================
   Super Mario - Enemy System
   ======================================== */

const Enemies = (() => {
    const TILE = Engine.TILE_SIZE;

    const ENEMY_TYPES = {
        goomba: {
            width: 28, height: 28,
            speed: 1.2,
            stompScore: 100,
            starScore: 200,
            projectileScore: 100
        },
        koopa: {
            width: 28, height: 40,
            speed: 1.0,
            stompScore: 100,
            starScore: 200,
            projectileScore: 100,
            color: 'green'
        },
        koopaRed: {
            width: 28, height: 40,
            speed: 1.0,
            stompScore: 100,
            starScore: 200,
            projectileScore: 100,
            color: 'red',
            turnsAtEdge: true
        },
        piranha: {
            width: 28, height: 32,
            stompScore: 0,
            starScore: 200,
            projectileScore: 200,
            isPiranha: true
        },
        bulletBill: {
            width: 28, height: 24,
            speed: 3.5,
            stompScore: 200,
            starScore: 200,
            projectileScore: 200,
            noGravity: true
        },
        blooper: {
            width: 28, height: 32,
            speed: 1.5,
            stompScore: 200,
            starScore: 200,
            isSwimmer: true
        },
        hammerBro: {
            width: 28, height: 48,
            speed: 0.8,
            stompScore: 1000,
            starScore: 1000,
            projectileScore: 1000,
            throwsHammers: true
        },
        buzzyBeetle: {
            width: 28, height: 24,
            speed: 1.0,
            stompScore: 100,
            starScore: 200,
            fireproof: true
        },
        lakitu: {
            width: 28, height: 32,
            speed: 2.0,
            stompScore: 800,
            starScore: 800,
            isFlying: true,
            spawnsEnemies: true
        },
        spiny: {
            width: 24, height: 24,
            speed: 1.2,
            stompScore: 0,
            starScore: 200,
            projectileScore: 200,
            noStomp: true
        }
    };

    function create(data) {
        const typeDef = ENEMY_TYPES[data.type];
        if (!typeDef) return null;

        const enemy = {
            type: data.type,
            x: data.x * TILE,
            y: data.y * TILE - typeDef.height,
            width: typeDef.width,
            height: typeDef.height,
            vx: -(typeDef.speed || 0),
            vy: 0,
            active: true,
            isEnemy: true,
            direction: data.direction || -1,
            stompScore: typeDef.stompScore,
            starScore: typeDef.starScore,
            projectileScore: typeDef.projectileScore,
            onGround: false,
            animFrame: 0,
            animTimer: 0,
            stateTimer: 0,
            color: typeDef.color || 'green',
            noGravity: typeDef.noGravity || false,
            fireproof: typeDef.fireproof || false,
            noStomp: typeDef.noStomp || false,
            activated: false,
            shellMode: false,
            shellSpeed: 8,
            shellMoving: false,
            squished: false,
            squishedTimer: 0,
            piranhaTimer: 0,
            piranhaPhase: 'hidden',
            piranhaBaseY: 0,
            hammerTimer: 0,
            jumpTimer: 0,
            lakituTimer: 0,
            swimPhase: 0,
            swimTimer: 0
        };

        enemy.vx = enemy.direction * (typeDef.speed || 0);

        if (typeDef.isPiranha) {
            enemy.piranhaBaseY = enemy.y + enemy.height;
            enemy.y = enemy.piranhaBaseY;
            enemy.piranhaPhase = 'hidden';
            enemy.piranhaTimer = 1000 + Math.random() * 2000;
        }

        if (typeDef.isFlying) {
            enemy.baseY = enemy.y;
            enemy.noGravity = true;
        }

        if (typeDef.isSwimmer) {
            enemy.noGravity = true;
            enemy.swimTimer = 0;
        }

        enemy.update = function(step) {
            this.animTimer += step * 1000;
            if (this.animTimer > 200) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 2;
            }

            const camera = Engine.getCamera();
            if (!this.activated) {
                if (this.x < camera.x + Engine.CANVAS_WIDTH + TILE) {
                    this.activated = true;
                }
                return;
            }

            if (this.squished) {
                this.squishedTimer -= step * 1000;
                if (this.squishedTimer <= 0) {
                    this.active = false;
                }
                return;
            }

            if (this.type === 'piranha' || typeDef.isPiranha) {
                updatePiranha(this, step);
                return;
            }

            if (this.shellMode) {
                updateShell(this, step);
                return;
            }

            if (typeDef.isFlying || this.type === 'lakitu') {
                updateFlying(this, step);
                return;
            }

            if (typeDef.isSwimmer) {
                updateSwimmer(this, step);
                return;
            }

            if (typeDef.throwsHammers) {
                updateHammerBro(this, step);
            }

            if (!this.noGravity) {
                Physics.applyGravity(this, step);
            }

            const level = Engine.getCurrentLevel();
            const collision = Physics.moveEntity(this, level, step);

            if (collision.hitLeft || collision.hitRight) {
                this.direction *= -1;
                this.vx = this.direction * (typeDef.speed || 1);
            }

            if (typeDef.turnsAtEdge && this.onGround) {
                const checkCol = this.direction > 0 ?
                    Math.floor((this.x + this.width + 4) / TILE) :
                    Math.floor((this.x - 4) / TILE);
                const checkRow = Math.floor((this.y + this.height + 4) / TILE);
                const tileBelow = Physics.getTile(level, checkCol, checkRow);

                if (!Physics.isSolid(tileBelow)) {
                    this.direction *= -1;
                    this.vx = this.direction * (typeDef.speed || 1);
                }
            }
        };

        enemy.render = function(ctx, camera, alpha) {
            const drawX = this.x - camera.x;
            const drawY = this.y - camera.y;

            if (drawX + this.width < -50 || drawX > Engine.CANVAS_WIDTH + 50) return;

            switch (this.type) {
                case 'goomba':
                    Sprites.drawGoomba(ctx, drawX, drawY, this.animFrame, this.squished);
                    break;
                case 'koopa':
                case 'koopaRed':
                    if (this.shellMode) {
                        Sprites.drawKoopaShell(ctx, drawX, drawY, this.color, this.shellMoving);
                    } else {
                        Sprites.drawKoopa(ctx, drawX, drawY, this.animFrame, this.direction, this.color);
                    }
                    break;
                case 'piranha':
                    if (this.piranhaPhase !== 'hidden') {
                        Sprites.drawPiranha(ctx, drawX, drawY, this.animFrame);
                    }
                    break;
                case 'bulletBill':
                    Sprites.drawBulletBill(ctx, drawX, drawY, this.direction);
                    break;
                case 'blooper':
                    Sprites.drawBlooper(ctx, drawX, drawY, this.animFrame);
                    break;
                case 'hammerBro':
                    Sprites.drawHammerBro(ctx, drawX, drawY, this.animFrame, this.direction);
                    break;
                case 'buzzyBeetle':
                    if (this.shellMode) {
                        Sprites.drawKoopaShell(ctx, drawX, drawY, 'blue', this.shellMoving);
                    } else {
                        drawBuzzyBeetle(ctx, drawX, drawY, this.animFrame, this.direction);
                    }
                    break;
                case 'lakitu':
                    drawLakitu(ctx, drawX, drawY, this.animFrame);
                    break;
                case 'spiny':
                    drawSpiny(ctx, drawX, drawY, this.animFrame, this.direction);
                    break;
                default:
                    ctx.fillStyle = '#e52521';
                    ctx.fillRect(drawX, drawY, this.width, this.height);
            }
        };

        enemy.onStomp = function() {
            if (this.noStomp) {
                Player.takeDamage();
                return;
            }

            switch (this.type) {
                case 'goomba':
                    this.squished = true;
                    this.squishedTimer = 500;
                    this.height = 10;
                    this.y += 18;
                    this.vx = 0;
                    break;
                case 'koopa':
                case 'koopaRed':
                case 'buzzyBeetle':
                    if (!this.shellMode) {
                        this.shellMode = true;
                        this.shellMoving = false;
                        this.vx = 0;
                        this.height = 24;
                        this.y += 16;
                    } else if (!this.shellMoving) {
                        launchShell(this);
                    } else {
                        this.shellMoving = false;
                        this.vx = 0;
                    }
                    break;
                default:
                    this.active = false;
                    Particles.createEnemyDefeat(this.x + this.width / 2, this.y + this.height / 2);
            }
        };

        enemy.onHitFromBelow = function() {
            this.active = false;
            this.vy = -5;
            Particles.createEnemyDefeat(this.x + this.width / 2, this.y + this.height / 2);
            Engine.addScore(this.stompScore, this.x + this.width / 2, this.y);
        };

        enemy.onStarKill = function() {
            this.active = false;
            Particles.createEnemyDefeat(this.x + this.width / 2, this.y + this.height / 2);
        };

        enemy.onProjectileHit = function(proj) {
            if (this.fireproof) {
                proj.active = false;
                return;
            }
            this.active = false;
            Particles.createEnemyDefeat(this.x + this.width / 2, this.y + this.height / 2);
        };

        return enemy;
    }

    function launchShell(enemy) {
        const player = Player.getEntity();
        if (!player) return;

        enemy.shellMoving = true;
        const playerCenter = player.x + player.width / 2;
        const enemyCenter = enemy.x + enemy.width / 2;
        enemy.direction = playerCenter < enemyCenter ? 1 : -1;
        enemy.vx = enemy.direction * enemy.shellSpeed;
    }

    function updateShell(enemy, step) {
        if (!enemy.shellMoving) return;

        Physics.applyGravity(enemy, step);
        const level = Engine.getCurrentLevel();
        const collision = Physics.moveEntity(enemy, level, step);

        if (collision.hitLeft || collision.hitRight) {
            enemy.direction *= -1;
            enemy.vx = enemy.direction * enemy.shellSpeed;
            Audio.play('bump');
            Engine.screenShake(2, 50);
        }

        const entities = Engine.getEntities();
        for (const other of entities) {
            if (other === enemy || !other.active || !other.isEnemy) continue;
            if (Physics.checkEntityCollision(enemy, other)) {
                other.active = false;
                Particles.createEnemyDefeat(other.x + other.width / 2, other.y + other.height / 2);
                Engine.addScore(other.stompScore || 100, other.x + other.width / 2, other.y);
                Audio.play('kick');
            }
        }

        const player = Player.getEntity();
        if (player && Physics.checkEntityCollision(enemy, player)) {
            if (!Player.isInvincible() && !Player.isDying()) {
                const playerBottom = player.y + player.height;
                const enemyTop = enemy.y;
                if (player.vy > 0 && playerBottom - enemyTop < 12) {
                    enemy.shellMoving = false;
                    enemy.vx = 0;
                    player.vy = -7;
                } else {
                    Player.takeDamage();
                }
            }
        }
    }

    function updatePiranha(enemy, step) {
        const dt = step * 1000;
        enemy.piranhaTimer -= dt;

        const player = Player.getEntity();
        const playerNear = player && Math.abs(player.x - enemy.x) < TILE * 2;

        switch (enemy.piranhaPhase) {
            case 'hidden':
                if (enemy.piranhaTimer <= 0 && !playerNear) {
                    enemy.piranhaPhase = 'rising';
                    enemy.piranhaTimer = 800;
                }
                break;
            case 'rising':
                enemy.y -= 1.5;
                if (enemy.y <= enemy.piranhaBaseY - enemy.height - 8) {
                    enemy.piranhaPhase = 'exposed';
                    enemy.piranhaTimer = 1500;
                }
                break;
            case 'exposed':
                if (enemy.piranhaTimer <= 0) {
                    enemy.piranhaPhase = 'sinking';
                }
                break;
            case 'sinking':
                enemy.y += 1.5;
                if (enemy.y >= enemy.piranhaBaseY) {
                    enemy.y = enemy.piranhaBaseY;
                    enemy.piranhaPhase = 'hidden';
                    enemy.piranhaTimer = 2000 + Math.random() * 1000;
                }
                break;
        }

        if (enemy.piranhaPhase !== 'hidden' && player) {
            if (Physics.checkEntityCollision(enemy, player) && !Player.isInvincible()) {
                Player.takeDamage();
            }
        }
    }

    function updateFlying(enemy, step) {
        const player = Player.getEntity();
        if (!player) return;

        if (enemy.type === 'lakitu') {
            const targetX = player.x;
            if (enemy.x < targetX - 40) enemy.vx = Math.min(enemy.vx + 0.1, 3);
            else if (enemy.x > targetX + 40) enemy.vx = Math.max(enemy.vx - 0.1, -3);

            enemy.x += enemy.vx;
            enemy.y = enemy.baseY + Math.sin(Date.now() * 0.002) * 20;

            enemy.lakituTimer -= step * 1000;
            if (enemy.lakituTimer <= 0) {
                enemy.lakituTimer = 3000;
                spawnSpiny(enemy.x, enemy.y + enemy.height);
            }
        }
    }

    function updateSwimmer(enemy, step) {
        enemy.swimTimer += step * 1000;

        if (enemy.swimTimer > 2000) {
            enemy.swimTimer = 0;
            enemy.swimPhase = (enemy.swimPhase + 1) % 2;
        }

        const player = Player.getEntity();
        if (!player) return;

        if (enemy.swimPhase === 0) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                enemy.vx = (dx / dist) * 2;
                enemy.vy = (dy / dist) * 2;
            }
        } else {
            enemy.vy = -2;
            enemy.vx *= 0.95;
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
    }

    function updateHammerBro(enemy, step) {
        enemy.hammerTimer -= step * 1000;
        enemy.jumpTimer -= step * 1000;

        if (enemy.hammerTimer <= 0) {
            enemy.hammerTimer = 1500 + Math.random() * 1000;
            throwHammer(enemy);
        }

        if (enemy.jumpTimer <= 0) {
            enemy.jumpTimer = 2000 + Math.random() * 1500;
            enemy.vy = -8;
        }

        const player = Player.getEntity();
        if (player) {
            enemy.direction = player.x < enemy.x ? -1 : 1;
        }
    }

    function throwHammer(enemy) {
        const hammer = {
            x: enemy.x + (enemy.direction > 0 ? enemy.width : -16),
            y: enemy.y - 8,
            width: 16, height: 16,
            vx: enemy.direction * 3,
            vy: -8,
            active: true,
            isEnemy: true,
            stompScore: 0,
            noStomp: true,
            animTimer: 0,
            rotation: 0,
            update(step) {
                this.vy += 0.35;
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += 0.3;
                if (this.y > Engine.getCurrentLevel().height * TILE + 100) {
                    this.active = false;
                }
            },
            render(ctx, camera) {
                const dx = this.x - camera.x;
                const dy = this.y - camera.y;
                ctx.save();
                ctx.translate(dx + 8, dy + 8);
                ctx.rotate(this.rotation);
                ctx.fillStyle = '#8c4800';
                ctx.fillRect(-2, -8, 4, 16);
                ctx.fillRect(-6, -10, 12, 4);
                ctx.restore();
            },
            onStomp() {}
        };

        Engine.addEntity(hammer);
    }

    function spawnSpiny(x, y) {
        const spiny = create({ type: 'spiny', x: x / TILE, y: y / TILE });
        if (spiny) {
            spiny.activated = true;
            spiny.vy = -3;
            Engine.addEntity(spiny);
        }
    }

    function drawBuzzyBeetle(ctx, x, y, frame, dir) {
        ctx.save();
        if (dir === -1) {
            ctx.translate(x + 28, y);
            ctx.scale(-1, 1);
            x = 0; y = 0;
        }
        ctx.fillStyle = '#333366';
        ctx.beginPath();
        ctx.arc(x + 14, y + 8, 13, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(x + 1, y + 8, 26, 8);
        ctx.fillStyle = '#fcc8a8';
        ctx.fillRect(x + 4, y + 16, 8, 8);
        ctx.fillRect(x + 16, y + 16, 8, 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 18, y + 8, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 19, y + 9, 2, 2);
        ctx.restore();
    }

    function drawLakitu(ctx, x, y, frame) {
        ctx.fillStyle = '#fcfcfc';
        ctx.beginPath();
        ctx.arc(x + 14, y + 24, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fcc8a8';
        ctx.fillRect(x + 6, y + 4, 16, 14);
        ctx.fillStyle = '#00a800';
        ctx.fillRect(x + 4, y, 20, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 10, y + 8, 3, 3);
        ctx.fillRect(x + 16, y + 8, 3, 3);
    }

    function drawSpiny(ctx, x, y, frame, dir) {
        ctx.save();
        if (dir === -1) {
            ctx.translate(x + 24, y);
            ctx.scale(-1, 1);
            x = 0; y = 0;
        }
        ctx.fillStyle = '#e52521';
        ctx.fillRect(x + 2, y + 8, 20, 16);
        ctx.fillStyle = '#fcc8a8';
        ctx.fillRect(x + 4, y + 16, 6, 8);
        ctx.fillRect(x + 14, y + 16, 6, 8);
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x + 4 + i * 5, y + 8);
            ctx.lineTo(x + 6 + i * 5, y);
            ctx.lineTo(x + 8 + i * 5, y + 8);
            ctx.fill();
        }
        ctx.restore();
    }

    return {
        create, ENEMY_TYPES,
        launchShell, throwHammer, spawnSpiny
    };
})();
