// ============================================================
// enemy-ai.js - Enemy AI behaviors and state machines
// ============================================================
VF.EnemyAI = {
    update(enemy, dt) {
        const player = VF.Player;
        if (player.dead) {
            this._idle(enemy, dt);
            return;
        }

        const dist = VF.Vec2.dist(enemy, player);
        const toPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);

        // Check if should flee
        if (enemy.fleeHpPct > 0 && enemy.hp / enemy.maxHp < enemy.fleeHpPct) {
            this._flee(enemy, player, dt);
            return;
        }

        // Check aggro range
        if (dist > enemy.aggroRange) {
            this._idle(enemy, dt);
            return;
        }

        // Execute AI behavior
        switch (enemy.ai) {
            case 'chase': this._chase(enemy, player, dist, toPlayer, dt); break;
            case 'strafe': this._strafe(enemy, player, dist, toPlayer, dt); break;
            case 'approach': this._approach(enemy, player, dist, toPlayer, dt); break;
            case 'flank': this._flank(enemy, player, dist, toPlayer, dt); break;
            case 'swarm': this._swarm(enemy, player, dist, toPlayer, dt); break;
            default: this._chase(enemy, player, dist, toPlayer, dt);
        }

        // Try to fire at player
        if (dist < enemy.aggroRange * 0.8) {
            this._tryFire(enemy, player, dist, toPlayer);
        }
    },

    _idle(enemy, dt) {
        // Drift slowly
        enemy.vx *= 0.95;
        enemy.vy *= 0.95;
        enemy.angle += 0.3 * dt;
    },

    _chase(enemy, player, dist, toPlayer, dt) {
        // Direct pursuit
        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, toPlayer, 4 * dt);

        const desiredDist = 200;
        if (dist > desiredDist) {
            enemy.vx += Math.cos(toPlayer) * enemy.speed * 2 * dt;
            enemy.vy += Math.sin(toPlayer) * enemy.speed * 2 * dt;
        } else {
            enemy.vx *= 0.95;
            enemy.vy *= 0.95;
        }

        this._clampSpeed(enemy);
    },

    _strafe(enemy, player, dist, toPlayer, dt) {
        // Circle around player while shooting
        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, toPlayer, 5 * dt);

        const desiredDist = 250;
        const perpAngle = toPlayer + (Math.PI / 2) * enemy._strafeDir;

        // Move perpendicular to player
        let moveAngle = perpAngle;
        if (dist > desiredDist + 50) moveAngle = toPlayer;
        else if (dist < desiredDist - 50) moveAngle = toPlayer + Math.PI;

        enemy.vx += Math.cos(moveAngle) * enemy.speed * 2 * dt;
        enemy.vy += Math.sin(moveAngle) * enemy.speed * 2 * dt;

        // Occasionally switch strafe direction
        enemy._aiTimer += dt;
        if (enemy._aiTimer > 3) {
            enemy._aiTimer = 0;
            enemy._strafeDir *= -1;
        }

        this._clampSpeed(enemy);
    },

    _approach(enemy, player, dist, toPlayer, dt) {
        // Slowly approach, stop at range
        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, toPlayer, 2 * dt);

        const desiredDist = 350;
        if (dist > desiredDist) {
            enemy.vx += Math.cos(toPlayer) * enemy.speed * 1.5 * dt;
            enemy.vy += Math.sin(toPlayer) * enemy.speed * 1.5 * dt;
        } else {
            // Slow drift
            enemy.vx *= 0.97;
            enemy.vy *= 0.97;
            // Slight perpendicular movement
            const perp = toPlayer + Math.PI / 2;
            enemy.vx += Math.cos(perp) * enemy.speed * 0.3 * dt * Math.sin(VF.Engine.time.elapsed);
            enemy.vy += Math.sin(perp) * enemy.speed * 0.3 * dt * Math.sin(VF.Engine.time.elapsed);
        }

        this._clampSpeed(enemy);
    },

    _flank(enemy, player, dist, toPlayer, dt) {
        // Try to get behind the player
        enemy._flankAngle += 0.5 * dt;
        const targetAngle = player.angle + Math.PI + Math.sin(enemy._flankAngle) * 0.8;
        const targetX = player.x + Math.cos(targetAngle) * 300;
        const targetY = player.y + Math.sin(targetAngle) * 300;

        const toTarget = Math.atan2(targetY - enemy.y, targetX - enemy.x);
        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, toPlayer, 6 * dt);

        enemy.vx += Math.cos(toTarget) * enemy.speed * 2.5 * dt;
        enemy.vy += Math.sin(toTarget) * enemy.speed * 2.5 * dt;

        this._clampSpeed(enemy);
    },

    _swarm(enemy, player, dist, toPlayer, dt) {
        // Move in a swarm pattern - attracted to player and other drones
        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, toPlayer, 6 * dt);

        // Attraction to player
        enemy.vx += Math.cos(toPlayer) * enemy.speed * 1.5 * dt;
        enemy.vy += Math.sin(toPlayer) * enemy.speed * 1.5 * dt;

        // Separation from other enemies
        const nearby = VF.Engine.getEntitiesByType('enemy');
        for (const other of nearby) {
            if (other === enemy || other.dead) continue;
            const d = VF.Vec2.dist(enemy, other);
            if (d < 60 && d > 0) {
                const away = Math.atan2(enemy.y - other.y, enemy.x - other.x);
                const force = (60 - d) / 60;
                enemy.vx += Math.cos(away) * force * 200 * dt;
                enemy.vy += Math.sin(away) * force * 200 * dt;
            }
        }

        // Oscillation for organic movement
        const osc = Math.sin(VF.Engine.time.elapsed * 3 + enemy.id) * 100;
        enemy.vx += Math.cos(toPlayer + Math.PI / 2) * osc * dt;
        enemy.vy += Math.sin(toPlayer + Math.PI / 2) * osc * dt;

        this._clampSpeed(enemy);
    },

    _flee(enemy, player, dt) {
        const awayAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, awayAngle, 5 * dt);
        enemy.vx += Math.cos(awayAngle) * enemy.speed * 3 * dt;
        enemy.vy += Math.sin(awayAngle) * enemy.speed * 3 * dt;
        this._clampSpeed(enemy, 1.5);
    },

    _tryFire(enemy, player, dist, toPlayer) {
        if (enemy.fireCooldown > 0) return;

        // Check if roughly facing player
        const angleDiff = Math.abs(VF.MathUtils.angleDiff(enemy.angle, toPlayer));
        if (angleDiff > 0.4) return;

        enemy.fireCooldown = 1 / enemy.fireRate;
        VF.Weapons.fire(enemy, enemy.weapon);
    },

    _clampSpeed(enemy, multiplier = 1) {
        const maxSpd = enemy.speed * multiplier;
        const spd = Math.sqrt(enemy.vx * enemy.vx + enemy.vy * enemy.vy);
        if (spd > maxSpd) {
            enemy.vx = (enemy.vx / spd) * maxSpd;
            enemy.vy = (enemy.vy / spd) * maxSpd;
        }
        // Apply friction
        enemy.vx *= 0.98;
        enemy.vy *= 0.98;
    },

    // Patrol AI - follow waypoints
    _patrol(enemy, player, dist, toPlayer, dt) {
        if (!enemy._patrolPath || enemy._patrolPath.length === 0) {
            this._idle(enemy, dt);
            return;
        }

        const target = enemy._patrolPath[enemy._patrolIndex];
        const toDist = VF.Vec2.dist(enemy, target);
        const toTarget = Math.atan2(target.y - enemy.y, target.x - enemy.x);

        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, toTarget, 3 * dt);
        enemy.vx += Math.cos(toTarget) * enemy.speed * 1.5 * dt;
        enemy.vy += Math.sin(toTarget) * enemy.speed * 1.5 * dt;

        if (toDist < 50) {
            enemy._patrolIndex = (enemy._patrolIndex + 1) % enemy._patrolPath.length;
        }

        // If player is close, switch to combat
        if (dist < enemy.aggroRange * 0.6) {
            this._chase(enemy, player, dist, toPlayer, dt);
            this._tryFire(enemy, player, dist, toPlayer);
        }

        this._clampSpeed(enemy);
    },

    // Kamikaze AI - rush at player and explode
    _kamikaze(enemy, player, dist, toPlayer, dt) {
        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, toPlayer, 8 * dt);
        enemy.vx += Math.cos(toPlayer) * enemy.speed * 4 * dt;
        enemy.vy += Math.sin(toPlayer) * enemy.speed * 4 * dt;

        if (dist < enemy.radius + player.radius + 10) {
            player.takeDamage(enemy.hp * 0.5);
            enemy.hp = 0;
            enemy.die();
            VF.Renderer.shake(15);
            if (VF.Particles) {
                VF.Particles.emit('explosion', enemy.x, enemy.y, 40);
                VF.Particles.emit('shockwave', enemy.x, enemy.y, 1);
            }
        }

        this._clampSpeed(enemy, 2);
    },

    // Sniper AI - stay far and shoot accurately
    _sniper(enemy, player, dist, toPlayer, dt) {
        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, toPlayer, 3 * dt);

        const desiredDist = 500;
        if (dist < desiredDist - 50) {
            // Back away
            const awayAngle = toPlayer + Math.PI;
            enemy.vx += Math.cos(awayAngle) * enemy.speed * 2 * dt;
            enemy.vy += Math.sin(awayAngle) * enemy.speed * 2 * dt;
        } else if (dist > desiredDist + 50) {
            enemy.vx += Math.cos(toPlayer) * enemy.speed * 1.5 * dt;
            enemy.vy += Math.sin(toPlayer) * enemy.speed * 1.5 * dt;
        } else {
            enemy.vx *= 0.95;
            enemy.vy *= 0.95;
        }

        // Precise firing
        if (enemy.fireCooldown <= 0) {
            const angleDiff = Math.abs(VF.MathUtils.angleDiff(enemy.angle, toPlayer));
            if (angleDiff < 0.1) {
                enemy.fireCooldown = 1 / enemy.fireRate;
                VF.Weapons.fire(enemy, 'enemyHeavy');
            }
        }

        this._clampSpeed(enemy);
    },

    // Support AI - heals nearby allies
    _support(enemy, player, dist, toPlayer, dt) {
        // Stay near other enemies
        const allies = VF.Engine.getEntitiesByType('enemy').filter(e => e !== enemy && !e.dead);
        if (allies.length > 0) {
            // Find most damaged ally
            let mostDamaged = null, lowestPct = 1;
            for (const ally of allies) {
                const pct = ally.hp / ally.maxHp;
                if (pct < lowestPct) { lowestPct = pct; mostDamaged = ally; }
            }

            if (mostDamaged && lowestPct < 0.8) {
                // Move towards damaged ally
                const toAlly = Math.atan2(mostDamaged.y - enemy.y, mostDamaged.x - enemy.x);
                enemy.vx += Math.cos(toAlly) * enemy.speed * 2 * dt;
                enemy.vy += Math.sin(toAlly) * enemy.speed * 2 * dt;

                // Heal if close
                const allyDist = VF.Vec2.dist(enemy, mostDamaged);
                if (allyDist < 100) {
                    mostDamaged.hp = Math.min(mostDamaged.maxHp, mostDamaged.hp + 10 * dt);
                    if (Math.random() < 0.1 && VF.Particles) {
                        VF.Particles.emit('heal', mostDamaged.x, mostDamaged.y, 2);
                    }
                }
            } else {
                // No one to heal, strafe around player
                this._strafe(enemy, player, dist, toPlayer, dt);
            }
        } else {
            this._flee(enemy, player, dt);
        }

        enemy.angle = VF.MathUtils.rotateTowards(enemy.angle, toPlayer, 3 * dt);
        this._tryFire(enemy, player, dist, toPlayer);
        this._clampSpeed(enemy);
    }
};
