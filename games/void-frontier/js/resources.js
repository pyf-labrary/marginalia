// ============================================================
// resources.js - Resource types, mining, inventory management
// ============================================================
VF.Resources = {
    TYPES: {
        iron:     { name: 'Iron',     color: '#aaa', icon: '⬡', value: 5,  rarity: 1,   desc: 'Common structural metal' },
        silicon:  { name: 'Silicon',  color: '#88a', icon: '◇', value: 8,  rarity: 0.8, desc: 'Used in electronics' },
        titanium: { name: 'Titanium', color: '#8cf', icon: '⬢', value: 15, rarity: 0.5, desc: 'Strong lightweight alloy' },
        crystal:  { name: 'Crystal',  color: '#f8f', icon: '◆', value: 25, rarity: 0.3, desc: 'Energy-focusing crystal' },
        hydrogen: { name: 'Hydrogen', color: '#8ff', icon: '○', value: 3,  rarity: 1,   desc: 'Basic fuel element' },
        helium:   { name: 'Helium',   color: '#ff8', icon: '○', value: 4,  rarity: 0.9, desc: 'Fusion fuel' },
        water:    { name: 'Water',    color: '#48f', icon: '◎', value: 6,  rarity: 0.7, desc: 'Essential for life support' },
        nitrogen: { name: 'Nitrogen', color: '#8f8', icon: '○', value: 5,  rarity: 0.8, desc: 'Atmosphere component' },
        organic:  { name: 'Organic',  color: '#4a4', icon: '❋', value: 12, rarity: 0.4, desc: 'Biological compounds' },
        exotic:   { name: 'Exotic',   color: '#f4f', icon: '✦', value: 50, rarity: 0.1, desc: 'Rare exotic matter' },
        plasma:   { name: 'Plasma',   color: '#fa0', icon: '✧', value: 30, rarity: 0.2, desc: 'Superheated energy' },
        darkMatter: { name: 'Dark Matter', color: '#a0f', icon: '✶', value: 100, rarity: 0.05, desc: 'Mysterious substance' }
    },

    // Player resource storage
    storage: {},
    maxStorage: 500,

    init() {
        this.storage = {};
        for (const key of Object.keys(this.TYPES)) {
            this.storage[key] = 0;
        }
        console.log('[Resources] Initialized');
    },

    add(type, amount) {
        if (!this.TYPES[type]) return false;
        const total = this.getTotal();
        const canAdd = Math.min(amount, this.maxStorage - total);
        if (canAdd <= 0) return false;
        this.storage[type] = (this.storage[type] || 0) + canAdd;
        VF.Engine.emit('resourceGained', type, canAdd);
        return true;
    },

    remove(type, amount) {
        if (!this.storage[type] || this.storage[type] < amount) return false;
        this.storage[type] -= amount;
        return true;
    },

    has(type, amount) {
        return (this.storage[type] || 0) >= amount;
    },

    getTotal() {
        let total = 0;
        for (const key of Object.keys(this.storage)) total += this.storage[key];
        return total;
    },

    getValue() {
        let total = 0;
        for (const [key, amount] of Object.entries(this.storage)) {
            if (this.TYPES[key]) total += this.TYPES[key].value * amount;
        }
        return total;
    },

    // Generate resource drops from an asteroid or enemy
    generateDrop(sourceType, amount = 1) {
        const drops = [];
        for (let i = 0; i < amount; i++) {
            const roll = Math.random();
            let cumulative = 0;
            for (const [key, res] of Object.entries(this.TYPES)) {
                cumulative += res.rarity / 6; // normalize roughly
                if (roll <= cumulative) {
                    drops.push({ type: key, amount: VF.Utils.randInt(1, 3) });
                    break;
                }
            }
        }
        return drops;
    },

    getSaveData() {
        return { storage: { ...this.storage }, maxStorage: this.maxStorage };
    },

    loadSaveData(data) {
        this.storage = data.storage || {};
        this.maxStorage = data.maxStorage || 500;
    },

    // Resource conversion recipes
    RECIPES: {
        refined_alloy: {
            name: 'Refined Alloy',
            inputs: { iron: 10, titanium: 3 },
            output: { type: 'titanium', amount: 5 },
            time: 5
        },
        energy_crystal: {
            name: 'Energy Crystal',
            inputs: { crystal: 2, silicon: 5 },
            output: { type: 'crystal', amount: 3 },
            time: 8
        },
        exotic_compound: {
            name: 'Exotic Compound',
            inputs: { exotic: 1, plasma: 2 },
            output: { type: 'darkMatter', amount: 1 },
            time: 15
        },
        fuel_synthesis: {
            name: 'Fuel Synthesis',
            inputs: { hydrogen: 5, helium: 3 },
            output: { type: 'plasma', amount: 2 },
            time: 6
        },
        bio_extract: {
            name: 'Bio Extract',
            inputs: { organic: 5, water: 3 },
            output: { type: 'organic', amount: 4 },
            time: 4
        }
    },

    _activeRecipe: null,
    _craftTimer: 0,

    canCraft(recipeKey) {
        const recipe = this.RECIPES[recipeKey];
        if (!recipe) return false;
        for (const [res, amount] of Object.entries(recipe.inputs)) {
            if (!this.has(res, amount)) return false;
        }
        return true;
    },

    startCraft(recipeKey) {
        if (!this.canCraft(recipeKey) || this._activeRecipe) return false;
        const recipe = this.RECIPES[recipeKey];

        // Consume inputs
        for (const [res, amount] of Object.entries(recipe.inputs)) {
            this.remove(res, amount);
        }

        this._activeRecipe = { key: recipeKey, recipe };
        this._craftTimer = recipe.time;
        VF.HUD.notify(`Crafting ${recipe.name}...`, '#0ff');
        return true;
    },

    updateCrafting(dt) {
        if (!this._activeRecipe) return;
        this._craftTimer -= dt;
        if (this._craftTimer <= 0) {
            const recipe = this._activeRecipe.recipe;
            this.add(recipe.output.type, recipe.output.amount);
            VF.HUD.notify(`Crafted: ${recipe.name}!`, '#0f0');
            if (VF.Audio) VF.Audio.play('upgrade');
            this._activeRecipe = null;
        }
    },

    getCraftProgress() {
        if (!this._activeRecipe) return null;
        return {
            name: this._activeRecipe.recipe.name,
            progress: 1 - this._craftTimer / this._activeRecipe.recipe.time
        };
    },

    // Resource scanner - find nearby resource-rich areas
    scanForResources(x, y, range) {
        const results = [];
        const systems = VF.Galaxy.getNearbySystems(x, y, range);
        for (const sys of systems) {
            for (const planet of sys.planets) {
                if (planet.resources && planet.resources.length > 0) {
                    results.push({
                        system: sys.name,
                        planet: planet.name,
                        resources: planet.resources,
                        distance: VF.Vec2.dist({ x, y }, sys),
                        x: sys.x, y: sys.y
                    });
                }
            }
        }
        return results.sort((a, b) => a.distance - b.distance);
    },

    // Auto-sell low-value resources
    autoSellBelow(valueThreshold) {
        let totalSold = 0;
        for (const [key, amount] of Object.entries(this.storage)) {
            if (amount <= 0) continue;
            const res = this.TYPES[key];
            if (res && res.value <= valueThreshold) {
                const price = Math.floor(res.value * amount * 0.6);
                totalSold += price;
                this.storage[key] = 0;
            }
        }
        if (totalSold > 0) {
            VF.Player.credits += totalSold;
            VF.HUD.notify(`Auto-sold low-value resources: +${totalSold}⬡`, '#ff0');
        }
        return totalSold;
    }
};
