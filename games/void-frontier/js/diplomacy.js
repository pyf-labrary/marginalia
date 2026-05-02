// ============================================================
// diplomacy.js - Alien race system and faction diplomacy
// ============================================================
VF.Diplomacy = {
    FACTIONS: {
        terran: {
            name: 'Terran Alliance',
            color: '#0ff',
            desc: 'Humanity\'s remnant fleet. Your people.',
            baseRelation: 80,
            traits: ['trade', 'ally'],
            greeting: 'Welcome, fellow human. We stand together.'
        },
        voidborn: {
            name: 'Voidborn Collective',
            color: '#f0f',
            desc: 'Ancient beings of pure energy from the void between stars.',
            baseRelation: 0,
            traits: ['aggressive', 'mysterious'],
            greeting: 'You trespass in our domain, flesh creature.'
        },
        crystalline: {
            name: 'Crystalline Collective',
            color: '#f8f',
            desc: 'Silicon-based lifeforms that communicate through light patterns.',
            baseRelation: 20,
            traits: ['trade', 'neutral'],
            greeting: '*Prismatic light patterns* We acknowledge your presence.'
        },
        mechanic: {
            name: 'Mechanic Syndicate',
            color: '#ff0',
            desc: 'AI-driven civilization of self-replicating machines.',
            baseRelation: 10,
            traits: ['trade', 'calculating'],
            greeting: 'ANALYSIS: Organic vessel detected. Initiating trade protocols.'
        },
        pirate: {
            name: 'Void Pirates',
            color: '#f44',
            desc: 'Lawless raiders preying on travelers.',
            baseRelation: -50,
            traits: ['aggressive', 'greedy'],
            greeting: 'Hand over your cargo, or we\'ll take it from your wreckage!'
        },
        ancient: {
            name: 'The Ancients',
            color: '#a0f',
            desc: 'Remnants of a civilization that predates the galaxy.',
            baseRelation: 30,
            traits: ['mysterious', 'powerful'],
            greeting: 'Young one... we have watched your kind for eons.'
        }
    },

    relations: {},
    _encounterTimer: 0,
    _encounterInterval: 45,
    discoveredFactions: ['terran'],

    RELATION_LEVELS: [
        { min: -100, max: -50, name: 'Hostile',   color: '#f00', canTrade: false, attackOnSight: true },
        { min: -50,  max: -10, name: 'Unfriendly', color: '#f80', canTrade: false, attackOnSight: false },
        { min: -10,  max: 20,  name: 'Neutral',   color: '#ff0', canTrade: true,  attackOnSight: false },
        { min: 20,   max: 50,  name: 'Friendly',  color: '#0f0', canTrade: true,  attackOnSight: false },
        { min: 50,   max: 100, name: 'Allied',    color: '#0ff', canTrade: true,  attackOnSight: false }
    ],

    init() {
        this.relations = {};
        this.discoveredFactions = ['terran'];
        for (const [key, faction] of Object.entries(this.FACTIONS)) {
            this.relations[key] = faction.baseRelation;
        }
        this._encounterTimer = 20;
        console.log('[Diplomacy] Initialized');
    },

    getRelation(factionKey) {
        return this.relations[factionKey] || 0;
    },

    getRelationLevel(factionKey) {
        const rel = this.getRelation(factionKey);
        for (const level of this.RELATION_LEVELS) {
            if (rel >= level.min && rel < level.max) return level;
        }
        return this.RELATION_LEVELS[2]; // neutral
    },

    modifyRelation(factionKey, amount) {
        if (!this.relations.hasOwnProperty(factionKey)) return;
        this.relations[factionKey] = VF.Utils.clamp(this.relations[factionKey] + amount, -100, 100);

        const faction = this.FACTIONS[factionKey];
        const level = this.getRelationLevel(factionKey);
        if (amount > 0) {
            VF.HUD.notify(`${faction.name}: +${amount} reputation (${level.name})`, level.color);
        } else {
            VF.HUD.notify(`${faction.name}: ${amount} reputation (${level.name})`, level.color);
        }

        // Discover faction on first interaction
        if (!this.discoveredFactions.includes(factionKey)) {
            this.discoveredFactions.push(factionKey);
            VF.HUD.notify(`New faction discovered: ${faction.name}`, faction.color);
        }
    },

    update(dt) {
        this._encounterTimer -= dt;
        if (this._encounterTimer <= 0) {
            this._encounterTimer = this._encounterInterval + VF.Utils.rand(-10, 10);
            this._triggerEncounter();
        }
    },

    _triggerEncounter() {
        if (VF.Player.dead || VF.Trading.docked || VF.Dialog.active || VF.Warp.isWarping) return;

        // Pick a random faction based on current sector
        const sector = VF.Galaxy.sectors[`${VF.Galaxy.currentSector.x},${VF.Galaxy.currentSector.y}`];
        if (!sector) return;

        const factionKeys = Object.keys(this.FACTIONS).filter(k => k !== 'terran');
        const factionKey = VF.Utils.randPick(factionKeys);
        const faction = this.FACTIONS[factionKey];
        const relation = this.getRelation(factionKey);
        const level = this.getRelationLevel(factionKey);

        // Discover faction
        if (!this.discoveredFactions.includes(factionKey)) {
            this.discoveredFactions.push(factionKey);
        }

        if (level.attackOnSight) {
            // Hostile encounter - spawn enemies
            VF.HUD.notify(`⚠ ${faction.name} hostiles detected!`, '#f44');
            const count = VF.Utils.randInt(3, 6);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = VF.Utils.rand(500, 800);
                const enemy = VF.Enemies.createEnemy(
                    VF.Utils.randPick(['fighter', 'interceptor']),
                    VF.Player.x + Math.cos(angle) * dist,
                    VF.Player.y + Math.sin(angle) * dist
                );
                if (enemy) enemy.color = faction.color;
            }
        } else if (Math.random() < 0.4) {
            // Peaceful encounter - dialog
            VF.Dialog.start('alien_contact');
        } else if (level.canTrade && Math.random() < 0.3) {
            // Trade opportunity
            VF.HUD.notify(`${faction.name} trader nearby. Press [E] to interact.`, faction.color);
        }
    },

    // Render faction relations panel
    render(ctx) {
        // Only render when diplomacy panel is requested
    },

    renderDiplomacyPanel(ctx, w, h) {
        const panelW = 420, panelH = 450;
        const px = (w - panelW) / 2;
        const py = (h - panelH) / 2;

        VF.Renderer.drawPanel(ctx, px, py, panelW, panelH);
        VF.Renderer.drawText(ctx, 'FACTION RELATIONS', px + panelW / 2, py + 15,
            '16px Courier New', '#0ff', 'center', 'top', true);
        VF.Renderer.drawText(ctx, '[X]', px + panelW - 18, py + 12, '14px Courier New', '#f44', 'center');

        let fy = py + 50;
        for (const factionKey of this.discoveredFactions) {
            const faction = this.FACTIONS[factionKey];
            if (!faction) continue;
            const relation = this.getRelation(factionKey);
            const level = this.getRelationLevel(factionKey);

            // Faction name
            VF.Renderer.drawText(ctx, faction.name, px + 20, fy, '12px Courier New', faction.color);

            // Relation bar
            const barX = px + 20;
            const barY = fy + 18;
            const barW = panelW - 40;
            const barH = 8;

            // Background
            ctx.fillStyle = '#111';
            ctx.fillRect(barX, barY, barW, barH);

            // Relation fill (centered at 50%)
            const center = barX + barW / 2;
            const relPct = (relation + 100) / 200; // 0 to 1
            const fillX = barX;
            const fillW = barW * relPct;
            ctx.fillStyle = level.color + '88';
            ctx.fillRect(fillX, barY, fillW, barH);

            // Center line
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(center, barY);
            ctx.lineTo(center, barY + barH);
            ctx.stroke();

            // Relation text
            VF.Renderer.drawText(ctx, `${level.name} (${relation})`, px + panelW - 20, fy + 2,
                '10px Courier New', level.color, 'right');

            // Description
            VF.Renderer.drawText(ctx, faction.desc, px + 20, fy + 30,
                '9px Courier New', '#556');

            // Traits
            const traitText = faction.traits.map(t => `[${t}]`).join(' ');
            VF.Renderer.drawText(ctx, traitText, px + 20, fy + 42,
                '8px Courier New', '#446');

            fy += 62;
        }

        // Undiscovered count
        const undiscovered = Object.keys(this.FACTIONS).length - this.discoveredFactions.length;
        if (undiscovered > 0) {
            VF.Renderer.drawText(ctx, `${undiscovered} undiscovered faction(s)`,
                px + panelW / 2, fy + 10, '10px Courier New', '#333', 'center');
        }
    },

    getSaveData() {
        return {
            relations: { ...this.relations },
            discoveredFactions: [...this.discoveredFactions]
        };
    },

    loadSaveData(data) {
        if (data.relations) this.relations = data.relations;
        if (data.discoveredFactions) this.discoveredFactions = data.discoveredFactions;
    }
};
