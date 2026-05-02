// ============================================================
// trading.js - Space station docking, trading, repair services
// ============================================================
VF.Trading = {
    docked: false,
    currentStation: null,
    dockRange: 80,
    _tradeGoods: [],
    _repairCostPerHp: 2,

    GOODS: {
        fuel_cell:    { name: 'Fuel Cell',      basePrice: 50,  category: 'supply', desc: 'Restores energy' },
        repair_kit:   { name: 'Repair Kit',     basePrice: 80,  category: 'supply', desc: 'Repairs hull damage' },
        shield_cell:  { name: 'Shield Cell',    basePrice: 60,  category: 'supply', desc: 'Restores shields' },
        nav_data:     { name: 'Nav Data',       basePrice: 120, category: 'data',   desc: 'Reveals nearby systems' },
        weapon_mod:   { name: 'Weapon Mod',     basePrice: 200, category: 'mod',    desc: 'Temporary weapon boost' },
        cargo_expander:{ name: 'Cargo Expander', basePrice: 300, category: 'mod',   desc: '+50 cargo space' },
        rare_alloy:   { name: 'Rare Alloy',     basePrice: 150, category: 'trade',  desc: 'Valuable trade good' },
        data_core:    { name: 'Data Core',      basePrice: 250, category: 'trade',  desc: 'Encrypted data worth credits' },
        alien_artifact:{ name: 'Alien Artifact', basePrice: 500, category: 'trade',  desc: 'Mysterious alien technology' }
    },

    init() {
        this.docked = false;
        this.currentStation = null;
        console.log('[Trading] Initialized');
    },

    update(dt) {
        if (this.docked) return;

        // Check proximity to stations
        const player = VF.Player;
        const sector = VF.Galaxy.sectors[`${VF.Galaxy.currentSector.x},${VF.Galaxy.currentSector.y}`];
        if (!sector) return;

        for (const station of sector.stations) {
            const dist = VF.Vec2.dist(player, station);
            if (dist < this.dockRange * 2 && !station._promptShown) {
                station._promptShown = true;
                VF.HUD.notify(`Press [E] to dock at ${station.name}`, '#0ff');
            }
            if (dist > this.dockRange * 3) {
                station._promptShown = false;
            }
        }

        // Dock with E key
        if (VF.Input.justPressed('KeyE')) {
            for (const station of sector.stations) {
                const dist = VF.Vec2.dist(player, station);
                if (dist < this.dockRange) {
                    this.dock(station);
                    break;
                }
            }
        }
    },

    dock(station) {
        this.docked = true;
        this.currentStation = station;
        station.discovered = true;
        this._generateTradeGoods(station);
        VF.Player.vx = 0;
        VF.Player.vy = 0;
        VF.HUD.notify(`Docked at ${station.name}`, '#0ff');
        if (VF.Audio) VF.Audio.play('menu_click');
        VF.Engine.emit('docked', station);
    },

    undock() {
        if (!this.docked) return;
        VF.HUD.notify('Undocked', '#088');
        this.docked = false;
        this.currentStation = null;
        if (VF.Audio) VF.Audio.play('menu_click');
        VF.Engine.emit('undocked');
    },

    _generateTradeGoods(station) {
        this._tradeGoods = [];
        const rng = VF.Utils.seededRNG(station.id);

        for (const [key, good] of Object.entries(this.GOODS)) {
            // Price varies by station
            const priceVariance = 0.7 + rng() * 0.6;
            const price = Math.floor(good.basePrice * priceVariance);
            const stock = Math.floor(rng() * 10) + 1;

            this._tradeGoods.push({
                key,
                name: good.name,
                desc: good.desc,
                category: good.category,
                buyPrice: price,
                sellPrice: Math.floor(price * 0.6),
                stock,
                maxStock: stock
            });
        }
    },

    buyGood(goodKey) {
        const good = this._tradeGoods.find(g => g.key === goodKey);
        if (!good || good.stock <= 0) return false;
        if (VF.Player.credits < good.buyPrice) return false;

        VF.Player.credits -= good.buyPrice;
        good.stock--;

        // Apply item effect
        this._applyGoodEffect(goodKey);
        if (VF.Audio) VF.Audio.play('pickup');
        return true;
    },

    sellResources(resourceType, amount) {
        if (!VF.Resources.has(resourceType, amount)) return false;
        const res = VF.Resources.TYPES[resourceType];
        if (!res) return false;

        // Station buys at 80% value
        const price = Math.floor(res.value * amount * 0.8);
        VF.Resources.remove(resourceType, amount);
        VF.Player.credits += price;
        VF.HUD.notify(`Sold ${amount} ${res.name} for ${price}⬡`, '#ff0');
        if (VF.Audio) VF.Audio.play('pickup');
        return true;
    },

    sellAllResources() {
        let totalValue = 0;
        for (const [key, amount] of Object.entries(VF.Resources.storage)) {
            if (amount > 0) {
                const res = VF.Resources.TYPES[key];
                if (res) {
                    const price = Math.floor(res.value * amount * 0.8);
                    totalValue += price;
                    VF.Resources.storage[key] = 0;
                }
            }
        }
        if (totalValue > 0) {
            VF.Player.credits += totalValue;
            VF.HUD.notify(`Sold all cargo for ${totalValue}⬡`, '#ff0');
            if (VF.Audio) VF.Audio.play('upgrade');
        }
        return totalValue;
    },

    repair() {
        const p = VF.Player;
        const damage = p.maxHp - p.hp;
        if (damage <= 0) return false;

        const cost = Math.floor(damage * this._repairCostPerHp);
        if (p.credits < cost) return false;

        p.credits -= cost;
        p.hp = p.maxHp;
        p.shield = p.maxShield;
        VF.HUD.notify(`Ship repaired for ${cost}⬡`, '#0f0');
        if (VF.Audio) VF.Audio.play('upgrade');
        if (VF.Particles) VF.Particles.emit('heal', p.x, p.y, 15);
        return true;
    },

    getRepairCost() {
        return Math.floor((VF.Player.maxHp - VF.Player.hp) * this._repairCostPerHp);
    },

    _applyGoodEffect(key) {
        const p = VF.Player;
        switch (key) {
            case 'fuel_cell':
                p.energy = p.maxEnergy;
                VF.HUD.notify('Energy restored!', '#ff0');
                break;
            case 'repair_kit':
                p.hp = Math.min(p.maxHp, p.hp + 30);
                VF.HUD.notify('+30 Hull', '#0f0');
                if (VF.Particles) VF.Particles.emit('heal', p.x, p.y, 10);
                break;
            case 'shield_cell':
                p.shield = p.maxShield;
                VF.HUD.notify('Shields restored!', '#08f');
                break;
            case 'nav_data':
                // Reveal nearby systems
                const nearby = VF.Galaxy.getNearbySystems(p.x, p.y, 3000);
                for (const sys of nearby) sys.discovered = true;
                VF.HUD.notify('Nearby systems revealed!', '#0ff');
                break;
            case 'weapon_mod':
                // Temporary damage boost (handled elsewhere)
                p._weaponBoostTimer = 60;
                VF.HUD.notify('Weapon damage +50% for 60s!', '#f80');
                break;
            case 'cargo_expander':
                VF.Resources.maxStorage += 50;
                VF.HUD.notify('+50 Cargo Space', '#0ff');
                break;
            case 'rare_alloy':
            case 'data_core':
            case 'alien_artifact':
                // Trade goods - add to inventory for selling elsewhere
                p.inventory.push({ type: key, name: this.GOODS[key].name, value: this.GOODS[key].basePrice });
                VF.HUD.notify(`${this.GOODS[key].name} added to cargo`, '#ff0');
                break;
        }
    },

    render(ctx) {
        if (!this.docked) return;

        const w = VF.Engine.width;
        const h = VF.Engine.height;
        const panelW = 500, panelH = 550;
        const px = (w - panelW) / 2;
        const py = (h - panelH) / 2;

        // Dim background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, w, h);

        VF.Renderer.drawPanel(ctx, px, py, panelW, panelH);

        // Station name
        VF.Renderer.drawText(ctx, this.currentStation.name.toUpperCase(), px + panelW / 2, py + 15,
            '16px Courier New', '#0ff', 'center', 'top', true);
        VF.Renderer.drawText(ctx, `Faction: ${this.currentStation.faction}`, px + panelW / 2, py + 38,
            '10px Courier New', '#088', 'center');

        // Credits
        VF.Renderer.drawText(ctx, `Credits: ${VF.Utils.formatNum(VF.Player.credits)}⬡`, px + panelW - 15, py + 15,
            '12px Courier New', '#ff0', 'right');

        // Services
        let sy = py + 60;

        // Repair button
        const repairCost = this.getRepairCost();
        const canRepair = repairCost > 0 && VF.Player.credits >= repairCost;
        ctx.fillStyle = canRepair ? 'rgba(0,80,0,0.4)' : 'rgba(40,40,40,0.4)';
        ctx.fillRect(px + 15, sy, panelW - 30, 28);
        ctx.strokeStyle = canRepair ? '#0f0' : '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 15, sy, panelW - 30, 28);
        VF.Renderer.drawText(ctx, `Repair Ship (${repairCost}⬡)`, px + 25, sy + 8, '12px Courier New',
            canRepair ? '#0f0' : '#444');
        VF.Renderer.drawText(ctx, `Hull: ${Math.floor(VF.Player.hp)}/${VF.Player.maxHp}`, px + panelW - 25, sy + 8,
            '10px Courier New', '#888', 'right');
        sy += 36;

        // Sell all resources
        const cargoValue = VF.Resources.getValue();
        ctx.fillStyle = cargoValue > 0 ? 'rgba(80,80,0,0.4)' : 'rgba(40,40,40,0.4)';
        ctx.fillRect(px + 15, sy, panelW - 30, 28);
        ctx.strokeStyle = cargoValue > 0 ? '#ff0' : '#333';
        ctx.strokeRect(px + 15, sy, panelW - 30, 28);
        VF.Renderer.drawText(ctx, `Sell All Cargo (~${VF.Utils.formatNum(Math.floor(cargoValue * 0.8))}⬡)`,
            px + 25, sy + 8, '12px Courier New', cargoValue > 0 ? '#ff0' : '#444');
        sy += 40;

        // Trade goods
        VF.Renderer.drawText(ctx, '── SHOP ──', px + panelW / 2, sy, '11px Courier New', '#088', 'center');
        sy += 20;

        for (const good of this._tradeGoods) {
            const canBuy = good.stock > 0 && VF.Player.credits >= good.buyPrice;
            ctx.fillStyle = canBuy ? 'rgba(0,40,60,0.3)' : 'rgba(20,20,20,0.3)';
            ctx.fillRect(px + 15, sy, panelW - 30, 24);

            VF.Renderer.drawText(ctx, good.name, px + 25, sy + 6, '11px Courier New',
                canBuy ? '#ccc' : '#444');
            VF.Renderer.drawText(ctx, `${good.buyPrice}⬡`, px + 280, sy + 6, '11px Courier New',
                canBuy ? '#ff0' : '#444');
            VF.Renderer.drawText(ctx, `Stock: ${good.stock}`, px + 360, sy + 6, '10px Courier New',
                good.stock > 0 ? '#888' : '#400');
            VF.Renderer.drawText(ctx, good.desc, px + 25, sy + 18, '8px Courier New', '#446');

            sy += 28;
        }

        // Undock button
        sy = py + panelH - 40;
        ctx.fillStyle = 'rgba(100,0,0,0.4)';
        ctx.fillRect(px + panelW / 2 - 60, sy, 120, 28);
        ctx.strokeStyle = '#f44';
        ctx.strokeRect(px + panelW / 2 - 60, sy, 120, 28);
        VF.Renderer.drawText(ctx, 'UNDOCK [E]', px + panelW / 2, sy + 8, '12px Courier New', '#f44', 'center');

        // Controls hint
        VF.Renderer.drawText(ctx, 'Click items to buy | [E] to undock', px + panelW / 2, py + panelH - 10,
            '9px Courier New', '#446', 'center');
    },

    handleClick(mx, my) {
        if (!this.docked) return false;

        const w = VF.Engine.width, h = VF.Engine.height;
        const panelW = 500, panelH = 550;
        const px = (w - panelW) / 2;
        const py = (h - panelH) / 2;

        // Repair button
        let sy = py + 60;
        if (VF.Collision.pointInRect(mx, my, px + 15, sy, panelW - 30, 28)) {
            this.repair();
            return true;
        }
        sy += 36;

        // Sell all
        if (VF.Collision.pointInRect(mx, my, px + 15, sy, panelW - 30, 28)) {
            this.sellAllResources();
            return true;
        }
        sy += 60;

        // Trade goods
        for (const good of this._tradeGoods) {
            if (VF.Collision.pointInRect(mx, my, px + 15, sy, panelW - 30, 24)) {
                this.buyGood(good.key);
                return true;
            }
            sy += 28;
        }

        // Undock button
        sy = py + panelH - 40;
        if (VF.Collision.pointInRect(mx, my, px + panelW / 2 - 60, sy, 120, 28)) {
            this.undock();
            return true;
        }

        return false;
    }
};
