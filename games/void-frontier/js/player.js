// ============================================================
// player.js - Player ship: movement, physics, shields, stats
// ============================================================
VF.Player = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    angle: -Math.PI / 2, // facing up
    radius: 18,
    type: 'player',
    dead: false,
    alive: true,

    // Stats
    hp: 100, maxHp: 100,
    shield: 50, maxShield: 50,
    shieldRegen: 3, // per second
    shieldRegenDelay: 2, // seconds after hit
    _shieldRegenTimer: 0,
    energy: 100, maxEnergy: 100,
    energyRegen: 15,

    // Movement
    speed: 280,
    acceleration: 600,
    friction: 3,
    rotSpeed: 5,
    boosting: false,
    boostMultiplier: 1.8,
    boostEnergyCost: 25, // per second

    // Combat
    weaponIndex: 0,
    fireCooldown: 0,
    invulnTime: 0,
    kills: 0,
    damageDealt: 0,
    credits: 500,
    xp: 0,
    level: 1,
    xpToNext: 100,

    // Ship shape (polygon points for rendering)
    shape: [
        { x: 22, y: 0 },
        { x: -14, y: -14 },
        { x: -8, y: -6 },
        { x: -8, y: 6 },
        { x: -14, y: 14 }
    ],

    // Engine flame shape
    flameShape: [
        { x: -10, y: -5 },
        { x: -22, y: 0 },
        { x: -10, y: 5 }
    ],

    // Equipped items
    equipment: {
        weapon: 'laser',
        secondary: 'missile',
        shield: 'basic',
        engine: 'standard',
        hull: 'light'
    },

    // Inventory
    inventory: [],
    maxInventory: 20,

    init() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.hp = this.maxHp;
        this.shield = this.maxShield;
        this.energy = this.maxEnergy;
        this.dead = false;
        this.alive = true;
        this.kills = 0;
        this.damageDealt = 0;
        this.invulnTime = 0;
        this._shieldRegenTimer = 0;
        this.fireCooldown = 0;
        this.weaponIndex = 0;
        this.credits = 500;
        this.xp = 0;
        this.level = 1;
        this.xpToNext = 100;
        this.inventory = [];
        console.log('[Player] Initialized');
    },

    update(dt) {
        if (this.dead) return;

        const input = VF.Input;
        const move = input.getMovement();

        // Rotate towards mouse
        const mouseWorld = VF.Camera.screenToWorld(input.mouse.x, input.mouse.y);
        const targetAngle = Math.atan2(mouseWorld.y - this.y, mouseWorld.x - this.x);
        this.angle = VF.MathUtils.rotateTowards(this.angle, targetAngle, this.rotSpeed * dt);

        // Boost
        this.boosting = input.isDown('ShiftLeft') && this.energy > 5;
        const speedMul = this.boosting ? this.boostMultiplier : 1;
        if (this.boosting) {
            this.energy -= this.boostEnergyCost * dt;
        }

        // Apply thrust
        if (move.x !== 0 || move.y !== 0) {
            this.vx += move.x * this.acceleration * dt;
            this.vy += move.y * this.acceleration * dt;
        }

        // Clamp speed
        const maxSpd = this.speed * speedMul;
        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (spd > maxSpd) {
            this.vx = (this.vx / spd) * maxSpd;
            this.vy = (this.vy / spd) * maxSpd;
        }

        // Friction
        this.vx *= (1 - this.friction * dt);
        this.vy *= (1 - this.friction * dt);

        // Move
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Weapon firing
        this.fireCooldown -= dt;
        if (input.mouse.down && this.fireCooldown <= 0) {
            VF.Weapons.fire(this, this.equipment.weapon);
        }
        // Secondary weapon
        if (input.mouse.rightDown && this.fireCooldown <= 0) {
            VF.Weapons.fire(this, this.equipment.secondary);
        }

        // Weapon switch
        if (input.justPressed('Digit1')) this.equipment.weapon = 'laser';
        if (input.justPressed('Digit2')) this.equipment.weapon = 'plasma';
        if (input.justPressed('Digit3')) this.equipment.weapon = 'railgun';
        if (input.justPressed('Digit4')) this.equipment.weapon = 'scatter';

        // Shield regen
        this._shieldRegenTimer -= dt;
        if (this._shieldRegenTimer <= 0 && this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegen * dt);
        }

        // Energy regen
        this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegen * dt);

        // Invulnerability timer
        if (this.invulnTime > 0) this.invulnTime -= dt;
    },

    takeDamage(amount, source) {
        if (this.dead || this.invulnTime > 0) return;

        // Shield absorbs damage first
        if (this.shield > 0) {
            const shieldDmg = Math.min(this.shield, amount * 0.7);
            this.shield -= shieldDmg;
            amount -= shieldDmg;
            this._shieldRegenTimer = this.shieldRegenDelay;
        }

        this.hp -= amount;
        VF.Renderer.shake(amount * 0.3);
        VF.Renderer.flash('#f00', 0.15);

        if (VF.Particles) {
            VF.Particles.emit('sparks', this.x, this.y, 8);
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    },

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    },

    addXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHp += 10;
            this.maxShield += 5;
            this.hp = this.maxHp;
            this.shield = this.maxShield;
            if (VF.Particles) VF.Particles.emit('levelUp', this.x, this.y, 30);
            console.log('[Player] Level up!', this.level);
        }
    },

    die() {
        this.dead = true;
        this.alive = false;
        if (VF.Particles) {
            VF.Particles.emit('explosion', this.x, this.y, 60);
            VF.Particles.emit('shockwave', this.x, this.y, 1);
        }
        VF.Renderer.shake(20);
        VF.Renderer.flash('#fff', 0.8);
        if (VF.Audio) VF.Audio.play('explosion_large');
        VF.Engine.emit('playerDeath');
    },

    respawn() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.hp = this.maxHp;
        this.shield = this.maxShield;
        this.energy = this.maxEnergy;
        this.dead = false;
        this.alive = true;
        this.invulnTime = 3;
        this.credits = Math.floor(this.credits * 0.8); // lose 20% credits
    },

    render(ctx) {
        if (this.dead) return;
        const cam = VF.Camera;

        cam.begin(ctx);

        // Engine flame
        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (spd > 20) {
            const flameLen = VF.Utils.rand(0.8, 1.5) * (this.boosting ? 1.8 : 1);
            const flamePoints = this.flameShape.map(p => ({
                x: p.x * flameLen,
                y: p.y * (0.8 + Math.random() * 0.4)
            }));
            const flameColor = this.boosting ? '#4af' : '#f80';
            const flameFill = this.boosting ? 'rgba(100,180,255,0.4)' : 'rgba(255,150,50,0.4)';
            VF.Renderer.drawPolygon(ctx, this.x, this.y, flamePoints, this.angle, 1, flameColor, flameFill, 1);
        }

        // Invulnerability flash
        if (this.invulnTime > 0 && Math.floor(this.invulnTime * 10) % 2 === 0) {
            cam.end(ctx);
            return;
        }

        // Shield bubble
        if (this.shield > 0) {
            const shieldAlpha = (this.shield / this.maxShield) * 0.25;
            ctx.save();
            ctx.globalAlpha = shieldAlpha + Math.sin(VF.Engine.time.elapsed * 3) * 0.05;
            VF.Renderer.drawCircle(ctx, this.x, this.y, this.radius + 6, 'rgba(0,200,255,0.1)', 'rgba(0,200,255,0.4)', 1);
            ctx.restore();
        }

        // Ship body
        const hpPct = this.hp / this.maxHp;
        const bodyColor = hpPct > 0.5 ? '#0ff' : hpPct > 0.25 ? '#ff0' : '#f44';
        VF.Renderer.drawPolygon(ctx, this.x, this.y, this.shape, this.angle, 1, bodyColor, 'rgba(0,40,60,0.8)', 1.5);

        // Cockpit glow
        const cockpitPos = VF.Vec2.fromAngle(this.angle, 8);
        VF.Renderer.drawCircle(ctx, this.x + cockpitPos.x, this.y + cockpitPos.y, 3, '#0ff', null);

        cam.end(ctx);
    },

    // Get serializable state for saving
    getSaveData() {
        return {
            x: this.x, y: this.y, hp: this.hp, maxHp: this.maxHp,
            shield: this.shield, maxShield: this.maxShield,
            energy: this.energy, maxEnergy: this.maxEnergy,
            credits: this.credits, xp: this.xp, level: this.level,
            xpToNext: this.xpToNext, kills: this.kills,
            equipment: { ...this.equipment },
            inventory: [...this.inventory]
        };
    },

    loadSaveData(data) {
        Object.assign(this, data);
        this.dead = false;
        this.alive = true;
    },

    // Skill tree - passive abilities
    skills: {
        vampiric: { level: 0, maxLevel: 3, desc: 'Heal 1% HP per kill per level', cost: 200 },
        overcharge: { level: 0, maxLevel: 3, desc: 'Energy regen +20% per level', cost: 250 },
        hardened: { level: 0, maxLevel: 5, desc: 'Reduce damage taken by 3% per level', cost: 150 },
        scavenger: { level: 0, maxLevel: 3, desc: 'Increase loot drop rate by 10% per level', cost: 300 },
        navigator: { level: 0, maxLevel: 3, desc: 'Increase warp range by 500 per level', cost: 350 },
        trader: { level: 0, maxLevel: 3, desc: 'Better trade prices by 5% per level', cost: 200 },
        tactician: { level: 0, maxLevel: 3, desc: 'XP gain +15% per level', cost: 250 },
        berserker: { level: 0, maxLevel: 3, desc: 'Damage +5% per level when below 50% HP', cost: 300 }
    },

    purchaseSkill(skillKey) {
        const skill = this.skills[skillKey];
        if (!skill || skill.level >= skill.maxLevel) return false;
        const cost = skill.cost * (skill.level + 1);
        if (this.credits < cost) return false;
        this.credits -= cost;
        skill.level++;
        VF.HUD.notify(`Skill upgraded: ${skillKey} Lv.${skill.level}`, '#0ff');
        return true;
    },

    getSkillBonus(skillKey) {
        const skill = this.skills[skillKey];
        return skill ? skill.level : 0;
    },

    // Combat stats tracking
    combatStats: {
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        shotsFired: 0,
        shotsHit: 0,
        distanceTraveled: 0,
        resourcesCollected: 0,
        missionsCompleted: 0,
        bossesKilled: 0,
        deathCount: 0,
        maxCombo: 0,
        _comboCount: 0,
        _comboTimer: 0
    },

    updateCombatStats(dt) {
        // Distance tracking
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.combatStats.distanceTraveled += speed * dt;

        // Combo system
        if (this.combatStats._comboTimer > 0) {
            this.combatStats._comboTimer -= dt;
            if (this.combatStats._comboTimer <= 0) {
                if (this.combatStats._comboCount > this.combatStats.maxCombo) {
                    this.combatStats.maxCombo = this.combatStats._comboCount;
                }
                this.combatStats._comboCount = 0;
            }
        }
    },

    addComboKill() {
        this.combatStats._comboCount++;
        this.combatStats._comboTimer = 3; // 3 second combo window
        if (this.combatStats._comboCount > 2) {
            const bonus = this.combatStats._comboCount * 5;
            this.credits += bonus;
            VF.HUD.notify(`${this.combatStats._comboCount}x COMBO! +${bonus}⬡`, '#ff0');
        }
    },

    // Ship customization - visual
    shipSkins: {
        default: { primary: '#0ff', secondary: '#08f', engine: '#f80' },
        crimson: { primary: '#f44', secondary: '#a00', engine: '#ff0' },
        phantom: { primary: '#a0f', secondary: '#60a', engine: '#f0f' },
        emerald: { primary: '#0f0', secondary: '#080', engine: '#0ff' },
        solar: { primary: '#ff0', secondary: '#f80', engine: '#fff' }
    },
    currentSkin: 'default',

    setSkin(skinKey) {
        if (this.shipSkins[skinKey]) {
            this.currentSkin = skinKey;
        }
    },

    getSkinColors() {
        return this.shipSkins[this.currentSkin] || this.shipSkins.default;
    }
};
