// ============================================================
// upgrades.js - Ship upgrade system, tech tree, crafting
// ============================================================
VF.Upgrades = {
    CATEGORIES: {
        weapons: {
            name: 'Weapons',
            upgrades: {
                laser_dmg:    { name: 'Laser Damage +',     cost: 100, maxLevel: 5, effect: 'weaponDmg',   value: 0.15, resource: { iron: 5 } },
                laser_rate:   { name: 'Laser Fire Rate +',  cost: 120, maxLevel: 5, effect: 'weaponRate',  value: 0.1,  resource: { silicon: 5 } },
                plasma_unlock:{ name: 'Unlock Plasma',      cost: 300, maxLevel: 1, effect: 'unlockWeapon', value: 'plasma', resource: { crystal: 3 } },
                railgun_unlock:{ name: 'Unlock Railgun',    cost: 500, maxLevel: 1, effect: 'unlockWeapon', value: 'railgun', resource: { titanium: 5, crystal: 3 } },
                scatter_unlock:{ name: 'Unlock Scatter',    cost: 400, maxLevel: 1, effect: 'unlockWeapon', value: 'scatter', resource: { iron: 10, silicon: 5 } },
                missile_dmg:  { name: 'Missile Damage +',   cost: 200, maxLevel: 3, effect: 'missileDmg',  value: 0.2,  resource: { titanium: 3 } },
                crit_chance:  { name: 'Critical Hit +',     cost: 250, maxLevel: 3, effect: 'critChance',  value: 0.05, resource: { crystal: 2 } }
            }
        },
        defense: {
            name: 'Defense',
            upgrades: {
                hull_hp:      { name: 'Hull Integrity +',   cost: 80,  maxLevel: 8, effect: 'maxHp',      value: 20,   resource: { iron: 3 } },
                shield_cap:   { name: 'Shield Capacity +',  cost: 100, maxLevel: 6, effect: 'maxShield',  value: 15,   resource: { silicon: 3 } },
                shield_regen: { name: 'Shield Regen +',     cost: 150, maxLevel: 5, effect: 'shieldRegen', value: 1,    resource: { crystal: 2 } },
                armor:        { name: 'Armor Plating',      cost: 200, maxLevel: 4, effect: 'armor',      value: 0.05, resource: { titanium: 4 } },
                dodge:        { name: 'Evasion System',     cost: 300, maxLevel: 3, effect: 'dodge',      value: 0.03, resource: { exotic: 1 } }
            }
        },
        engine: {
            name: 'Engine',
            upgrades: {
                speed:        { name: 'Max Speed +',        cost: 80,  maxLevel: 6, effect: 'speed',      value: 20,   resource: { hydrogen: 5 } },
                accel:        { name: 'Acceleration +',     cost: 100, maxLevel: 5, effect: 'accel',      value: 50,   resource: { helium: 3 } },
                boost_eff:    { name: 'Boost Efficiency',   cost: 150, maxLevel: 4, effect: 'boostEff',   value: 0.15, resource: { plasma: 2 } },
                warp_range:   { name: 'Warp Range +',       cost: 400, maxLevel: 3, effect: 'warpRange',  value: 1000, resource: { exotic: 2, darkMatter: 1 } }
            }
        },
        systems: {
            name: 'Systems',
            upgrades: {
                energy_cap:   { name: 'Energy Capacity +',  cost: 80,  maxLevel: 6, effect: 'maxEnergy',  value: 15,   resource: { silicon: 3 } },
                energy_regen: { name: 'Energy Regen +',     cost: 100, maxLevel: 5, effect: 'energyRegen', value: 3,   resource: { crystal: 2 } },
                scanner:      { name: 'Scanner Range +',    cost: 200, maxLevel: 4, effect: 'scanRange',  value: 100,  resource: { silicon: 5, crystal: 1 } },
                cargo:        { name: 'Cargo Capacity +',   cost: 120, maxLevel: 5, effect: 'cargo',      value: 50,   resource: { iron: 5 } },
                mining:       { name: 'Mining Efficiency +', cost: 150, maxLevel: 4, effect: 'mining',    value: 0.2,  resource: { titanium: 3 } }
            }
        }
    },

    // Current upgrade levels
    levels: {},
    unlockedWeapons: ['laser', 'missile'],

    init() {
        this.levels = {};
        this.unlockedWeapons = ['laser', 'missile'];
        // Initialize all levels to 0
        for (const cat of Object.values(this.CATEGORIES)) {
            for (const key of Object.keys(cat.upgrades)) {
                this.levels[key] = 0;
            }
        }
        console.log('[Upgrades] Initialized');
    },

    canAfford(upgradeKey) {
        const upgrade = this._findUpgrade(upgradeKey);
        if (!upgrade) return false;
        if (this.levels[upgradeKey] >= upgrade.maxLevel) return false;

        const level = this.levels[upgradeKey];
        const cost = Math.floor(upgrade.cost * Math.pow(1.4, level));

        if (VF.Player.credits < cost) return false;

        // Check resource cost
        if (upgrade.resource) {
            for (const [res, amount] of Object.entries(upgrade.resource)) {
                const needed = Math.ceil(amount * (1 + level * 0.5));
                if (!VF.Resources.has(res, needed)) return false;
            }
        }
        return true;
    },

    purchase(upgradeKey) {
        if (!this.canAfford(upgradeKey)) return false;

        const upgrade = this._findUpgrade(upgradeKey);
        const level = this.levels[upgradeKey];
        const cost = Math.floor(upgrade.cost * Math.pow(1.4, level));

        VF.Player.credits -= cost;

        // Deduct resources
        if (upgrade.resource) {
            for (const [res, amount] of Object.entries(upgrade.resource)) {
                const needed = Math.ceil(amount * (1 + level * 0.5));
                VF.Resources.remove(res, needed);
            }
        }

        this.levels[upgradeKey]++;
        this._applyEffect(upgrade, this.levels[upgradeKey]);

        VF.Engine.emit('upgradePurchased', upgradeKey, this.levels[upgradeKey]);
        if (VF.Audio) VF.Audio.play('upgrade');
        return true;
    },

    _applyEffect(upgrade, level) {
        const p = VF.Player;
        switch (upgrade.effect) {
            case 'maxHp': p.maxHp += upgrade.value; p.hp = p.maxHp; break;
            case 'maxShield': p.maxShield += upgrade.value; p.shield = p.maxShield; break;
            case 'shieldRegen': p.shieldRegen += upgrade.value; break;
            case 'speed': p.speed += upgrade.value; break;
            case 'accel': p.acceleration += upgrade.value; break;
            case 'maxEnergy': p.maxEnergy += upgrade.value; p.energy = p.maxEnergy; break;
            case 'energyRegen': p.energyRegen += upgrade.value; break;
            case 'cargo': VF.Resources.maxStorage += upgrade.value; break;
            case 'unlockWeapon':
                if (!this.unlockedWeapons.includes(upgrade.value)) {
                    this.unlockedWeapons.push(upgrade.value);
                }
                break;
            case 'weaponDmg':
                VF.Weapons.TYPES.laser.damage *= (1 + upgrade.value);
                break;
            case 'weaponRate':
                VF.Weapons.TYPES.laser.cooldown *= (1 - upgrade.value);
                break;
            case 'boostEff':
                p.boostEnergyCost *= (1 - upgrade.value);
                break;
        }
    },

    _findUpgrade(key) {
        for (const cat of Object.values(this.CATEGORIES)) {
            if (cat.upgrades[key]) return cat.upgrades[key];
        }
        return null;
    },

    getCost(upgradeKey) {
        const upgrade = this._findUpgrade(upgradeKey);
        if (!upgrade) return 0;
        return Math.floor(upgrade.cost * Math.pow(1.4, this.levels[upgradeKey]));
    },

    getResourceCost(upgradeKey) {
        const upgrade = this._findUpgrade(upgradeKey);
        if (!upgrade || !upgrade.resource) return {};
        const level = this.levels[upgradeKey];
        const costs = {};
        for (const [res, amount] of Object.entries(upgrade.resource)) {
            costs[res] = Math.ceil(amount * (1 + level * 0.5));
        }
        return costs;
    },

    getSaveData() {
        return {
            levels: { ...this.levels },
            unlockedWeapons: [...this.unlockedWeapons]
        };
    },

    loadSaveData(data) {
        this.levels = data.levels || {};
        this.unlockedWeapons = data.unlockedWeapons || ['laser', 'missile'];
    },

    // Upgrade presets for quick application
    PRESETS: {
        combat: {
            name: 'Combat Focus',
            desc: 'Prioritize weapon damage and fire rate',
            upgrades: ['laser_dmg', 'laser_rate', 'crit_chance']
        },
        defense: {
            name: 'Tank Build',
            desc: 'Maximize hull and shield durability',
            upgrades: ['hull_hp', 'shield_cap', 'shield_regen', 'armor']
        },
        explorer: {
            name: 'Explorer Build',
            desc: 'Focus on speed, scanning, and warp range',
            upgrades: ['speed', 'accel', 'scanner', 'warp_range']
        },
        trader: {
            name: 'Trader Build',
            desc: 'Maximize cargo and energy efficiency',
            upgrades: ['cargo', 'energy_cap', 'energy_regen', 'mining']
        }
    },

    // Get recommended next upgrade based on playstyle
    getRecommendation() {
        const p = VF.Player;
        const recommendations = [];

        // Low HP? Recommend hull
        if (p.maxHp < 150) recommendations.push({ key: 'hull_hp', reason: 'Low hull integrity' });
        // Low shield? Recommend shield
        if (p.maxShield < 80) recommendations.push({ key: 'shield_cap', reason: 'Weak shields' });
        // Slow? Recommend speed
        if (p.speed < 320) recommendations.push({ key: 'speed', reason: 'Slow movement' });
        // Low energy? Recommend energy
        if (p.maxEnergy < 130) recommendations.push({ key: 'energy_cap', reason: 'Low energy capacity' });
        // No weapons unlocked? Recommend plasma
        if (!this.unlockedWeapons.includes('plasma')) {
            recommendations.push({ key: 'plasma_unlock', reason: 'Unlock new weapon' });
        }

        return recommendations.filter(r => this.canAfford(r.key));
    },

    // Calculate total investment
    getTotalInvestment() {
        let total = 0;
        for (const [key, level] of Object.entries(this.levels)) {
            const upgrade = this._findUpgrade(key);
            if (!upgrade) continue;
            for (let i = 0; i < level; i++) {
                total += Math.floor(upgrade.cost * Math.pow(1.4, i));
            }
        }
        return total;
    },

    // Get upgrade progress percentage
    getOverallProgress() {
        let current = 0, max = 0;
        for (const cat of Object.values(this.CATEGORIES)) {
            for (const [key, upgrade] of Object.entries(cat.upgrades)) {
                current += this.levels[key] || 0;
                max += upgrade.maxLevel;
            }
        }
        return max > 0 ? current / max : 0;
    },

    // Reset all upgrades (refund partial credits)
    resetAll() {
        const refund = Math.floor(this.getTotalInvestment() * 0.5);
        this.levels = {};
        this.unlockedWeapons = ['laser', 'missile'];
        for (const cat of Object.values(this.CATEGORIES)) {
            for (const key of Object.keys(cat.upgrades)) {
                this.levels[key] = 0;
            }
        }
        VF.Player.credits += refund;
        VF.HUD.notify(`Upgrades reset! Refunded ${refund}⬡`, '#ff0');
        return refund;
    }
};
