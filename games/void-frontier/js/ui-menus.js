// ============================================================
// ui-menus.js - In-game menus: upgrade panel, inventory, settings
// ============================================================
VF.UIMenus = {
    activeMenu: null, // 'upgrade', 'inventory', 'settings', 'galaxy'
    _scrollY: 0,

    init() {
        console.log('[UIMenus] Initialized');
    },

    toggle(menuName) {
        if (this.activeMenu === menuName) {
            this.activeMenu = null;
        } else {
            this.activeMenu = menuName;
            this._scrollY = 0;
        }
    },

    close() {
        this.activeMenu = null;
    },

    isOpen() {
        return this.activeMenu !== null;
    },

    handleClick(mx, my) {
        if (!this.activeMenu) return false;

        const w = VF.Engine.width;
        const h = VF.Engine.height;
        const panelW = 400, panelH = 500;
        const px = (w - panelW) / 2;
        const py = (h - panelH) / 2;

        // Close button
        if (VF.Collision.pointInRect(mx, my, px + panelW - 30, py + 5, 25, 25)) {
            this.close();
            return true;
        }

        if (this.activeMenu === 'upgrade') {
            return this._handleUpgradeClick(mx, my, px, py, panelW, panelH);
        }

        return false;
    },

    _handleUpgradeClick(mx, my, px, py, panelW, panelH) {
        let itemY = py + 60 + this._scrollY;
        const categories = Object.entries(VF.Upgrades.CATEGORIES);

        for (const [catKey, cat] of categories) {
            itemY += 25; // category header
            for (const [upKey, upgrade] of Object.entries(cat.upgrades)) {
                const btnX = px + panelW - 80;
                const btnY = itemY;
                const btnW = 60, btnH = 20;

                if (VF.Collision.pointInRect(mx, my, btnX, btnY, btnW, btnH)) {
                    if (VF.Upgrades.canAfford(upKey)) {
                        VF.Upgrades.purchase(upKey);
                        return true;
                    }
                }
                itemY += 28;
            }
            itemY += 10;
        }
        return false;
    },

    render(ctx) {
        if (!this.activeMenu) return;

        const w = VF.Engine.width;
        const h = VF.Engine.height;

        // Dim background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);

        switch (this.activeMenu) {
            case 'upgrade': this._renderUpgradeMenu(ctx, w, h); break;
            case 'inventory': this._renderInventoryMenu(ctx, w, h); break;
            case 'galaxy': this._renderGalaxyMap(ctx, w, h); break;
        }
    },

    _renderUpgradeMenu(ctx, w, h) {
        const panelW = 420, panelH = 520;
        const px = (w - panelW) / 2;
        const py = (h - panelH) / 2;

        VF.Renderer.drawPanel(ctx, px, py, panelW, panelH);

        // Title
        VF.Renderer.drawText(ctx, 'SHIP UPGRADES', px + panelW / 2, py + 15, '16px Courier New', '#0ff', 'center', 'top', true);

        // Credits
        VF.Renderer.drawText(ctx, `Credits: ${VF.Utils.formatNum(VF.Player.credits)}`, px + panelW / 2, py + 38, '12px Courier New', '#ff0', 'center');

        // Close button
        VF.Renderer.drawText(ctx, '[X]', px + panelW - 18, py + 12, '14px Courier New', '#f44', 'center');

        // Categories and upgrades
        let itemY = py + 60 + this._scrollY;
        const categories = Object.entries(VF.Upgrades.CATEGORIES);

        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py + 55, panelW, panelH - 60);
        ctx.clip();

        for (const [catKey, cat] of categories) {
            // Category header
            VF.Renderer.drawText(ctx, `── ${cat.name} ──`, px + 15, itemY, '12px Courier New', '#088');
            itemY += 25;

            for (const [upKey, upgrade] of Object.entries(cat.upgrades)) {
                const level = VF.Upgrades.levels[upKey];
                const maxed = level >= upgrade.maxLevel;
                const canAfford = VF.Upgrades.canAfford(upKey);
                const cost = VF.Upgrades.getCost(upKey);

                // Name and level
                const nameColor = maxed ? '#0a0' : '#ccc';
                VF.Renderer.drawText(ctx, upgrade.name, px + 15, itemY + 3, '11px Courier New', nameColor);

                // Level pips
                for (let i = 0; i < upgrade.maxLevel; i++) {
                    const pipX = px + 220 + i * 14;
                    ctx.fillStyle = i < level ? '#0ff' : '#223';
                    ctx.fillRect(pipX, itemY + 4, 10, 10);
                    ctx.strokeStyle = '#0ff';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(pipX, itemY + 4, 10, 10);
                }

                // Buy button
                if (!maxed) {
                    const btnX = px + panelW - 80;
                    ctx.fillStyle = canAfford ? 'rgba(0,100,100,0.5)' : 'rgba(40,40,40,0.5)';
                    ctx.fillRect(btnX, itemY, 60, 20);
                    ctx.strokeStyle = canAfford ? '#0ff' : '#333';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(btnX, itemY, 60, 20);
                    VF.Renderer.drawText(ctx, `${cost}⬡`, btnX + 30, itemY + 4, '10px Courier New',
                        canAfford ? '#ff0' : '#444', 'center');
                } else {
                    VF.Renderer.drawText(ctx, 'MAX', px + panelW - 50, itemY + 3, '10px Courier New', '#0a0', 'center');
                }

                itemY += 28;
            }
            itemY += 10;
        }

        ctx.restore();
    },

    _renderInventoryMenu(ctx, w, h) {
        const panelW = 380, panelH = 450;
        const px = (w - panelW) / 2;
        const py = (h - panelH) / 2;

        VF.Renderer.drawPanel(ctx, px, py, panelW, panelH);
        VF.Renderer.drawText(ctx, 'CARGO HOLD', px + panelW / 2, py + 15, '16px Courier New', '#0ff', 'center', 'top', true);
        VF.Renderer.drawText(ctx, '[X]', px + panelW - 18, py + 12, '14px Courier New', '#f44', 'center');

        // Storage bar
        const total = VF.Resources.getTotal();
        const max = VF.Resources.maxStorage;
        VF.Renderer.drawBar(ctx, px + 15, py + 42, panelW - 30, 8, total, max, '#111', '#0aa', '#0aa');
        VF.Renderer.drawText(ctx, `${total}/${max}`, px + panelW / 2, py + 54, '10px Courier New', '#888', 'center');

        // Resource list
        let iy = py + 72;
        for (const [key, amount] of Object.entries(VF.Resources.storage)) {
            if (amount <= 0) continue;
            const res = VF.Resources.TYPES[key];
            if (!res) continue;

            ctx.fillStyle = res.color;
            ctx.font = '14px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(res.icon, px + 20, iy + 2);

            VF.Renderer.drawText(ctx, res.name, px + 45, iy, '12px Courier New', '#ccc');
            VF.Renderer.drawText(ctx, `x${amount}`, px + 180, iy, '12px Courier New', '#fff');
            VF.Renderer.drawText(ctx, `${amount * res.value}⬡`, px + panelW - 20, iy, '11px Courier New', '#ff0', 'right');

            iy += 24;
        }

        if (iy === py + 72) {
            VF.Renderer.drawText(ctx, 'Cargo hold is empty', px + panelW / 2, py + 200, '12px Courier New', '#446', 'center');
        }

        // Total value
        VF.Renderer.drawText(ctx, `Total Value: ${VF.Utils.formatNum(VF.Resources.getValue())}⬡`,
            px + panelW / 2, py + panelH - 30, '12px Courier New', '#ff0', 'center');
    },

    _renderGalaxyMap(ctx, w, h) {
        const panelW = 500, panelH = 500;
        const px = (w - panelW) / 2;
        const py = (h - panelH) / 2;

        VF.Renderer.drawPanel(ctx, px, py, panelW, panelH);
        VF.Renderer.drawText(ctx, 'GALAXY MAP', px + panelW / 2, py + 15, '16px Courier New', '#0ff', 'center', 'top', true);
        VF.Renderer.drawText(ctx, '[X]', px + panelW - 18, py + 12, '14px Courier New', '#f44', 'center');

        // Draw galaxy overview
        const mapCx = px + panelW / 2;
        const mapCy = py + panelH / 2 + 10;
        const mapScale = 0.04;

        // Draw all known sectors
        for (const [key, sector] of Object.entries(VF.Galaxy.sectors)) {
            for (const sys of sector.systems) {
                const sx = mapCx + (sys.x - VF.Player.x) * mapScale;
                const sy = mapCy + (sys.y - VF.Player.y) * mapScale;

                if (sx < px + 10 || sx > px + panelW - 10 || sy < py + 40 || sy > py + panelH - 10) continue;

                ctx.fillStyle = sys.discovered ? sys.star.color : '#223';
                ctx.beginPath();
                ctx.arc(sx, sy, sys.discovered ? 3 : 1.5, 0, Math.PI * 2);
                ctx.fill();

                if (sys.discovered && mapScale > 0.02) {
                    ctx.font = '8px Courier New';
                    ctx.fillStyle = '#446';
                    ctx.textAlign = 'center';
                    ctx.fillText(sys.name, sx, sy + 10);
                }
            }
        }

        // Player position
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(mapCx, mapCy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mapCx, mapCy, 8, 0, Math.PI * 2);
        ctx.stroke();

        VF.Renderer.drawText(ctx, 'YOU', mapCx, mapCy + 14, '8px Courier New', '#0f0', 'center');
    },

    handleScroll(deltaY) {
        if (this.activeMenu) {
            this._scrollY -= deltaY * 0.5;
            this._scrollY = VF.Utils.clamp(this._scrollY, -500, 0);
        }
    }
};
