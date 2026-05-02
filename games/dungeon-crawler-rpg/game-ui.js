/* ============================================
   暗影地牢 - Shadow Dungeon RPG
   Game UI System
   ============================================ */

const GameUI = {
    openPanels: new Set(),
    selectedInventoryItem: null,
    selectedShopItem: null,
    selectedQuestId: null,
    selectedForgeRecipe: null,
    shopMode: 'buy',
    inventoryTab: 'all',

    // ==========================================
    // SECTION 1: Notification & Log System
    // ==========================================
    notify(message, type = 'info') {
        const area = document.getElementById('notification-area');
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        area.appendChild(notif);
        setTimeout(() => {
            if (notif.parentNode) notif.remove();
        }, 3200);
    },

    addLog(message, type = 'system') {
        const content = document.getElementById('log-content');
        if (!content) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = `[${Game.turnCount}] `;
        entry.textContent = time + message;
        content.appendChild(entry);
        content.scrollTop = content.scrollHeight;

        // Keep log manageable
        while (content.children.length > 100) {
            content.removeChild(content.firstChild);
        }
    },

    addCombatLog(message, type = 'info') {
        const content = document.getElementById('combat-log-content');
        if (!content) return;
        const entry = document.createElement('div');
        entry.className = `combat-log-entry ${type}`;
        entry.textContent = message;
        content.appendChild(entry);
        content.scrollTop = content.scrollHeight;
    },

    clearCombatLog() {
        const content = document.getElementById('combat-log-content');
        if (content) content.innerHTML = '';
    },

    // ==========================================
    // SECTION 2: Panel Management
    // ==========================================
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        if (panel.classList.contains('hidden')) {
            this.closeAllPanels();
            panel.classList.remove('hidden');
            this.openPanels.add(panelId);
            this.onPanelOpen(panelId);
        } else {
            panel.classList.add('hidden');
            this.openPanels.delete(panelId);
        }
    },

    closeAllPanels() {
        document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
        this.openPanels.clear();
    },

    onPanelOpen(panelId) {
        switch (panelId) {
            case 'inventory-panel':
                this.refreshInventory();
                break;
            case 'character-panel':
                this.refreshCharacter();
                break;
            case 'quest-panel':
                this.refreshQuests();
                break;
            case 'map-panel':
                Renderer.renderMinimap();
                break;
        }
    },

    // ==========================================
    // SECTION 3: Header & Status Bar Updates
    // ==========================================
    updateAllUI() {
        this.updateHeader();
        if (this.openPanels.has('inventory-panel')) this.refreshInventory();
        if (this.openPanels.has('character-panel')) this.refreshCharacter();
        if (this.openPanels.has('quest-panel')) this.refreshQuests();
        if (this.openPanels.has('map-panel')) Renderer.renderMinimap();
    },

    updateHeader() {
        const nameEl = document.getElementById('header-name');
        const classEl = document.getElementById('header-class');
        const levelEl = document.getElementById('header-level');
        const floorEl = document.getElementById('current-floor');
        const goldEl = document.getElementById('gold-display');

        if (nameEl) nameEl.textContent = Player.name;
        if (classEl) classEl.textContent = GameData.classes[Player.className]?.name || '';
        if (levelEl) levelEl.textContent = `Lv.${Player.level}`;
        if (floorEl) floorEl.textContent = `地牢 第${Game.floor}层`;
        if (goldEl) goldEl.textContent = `💰 ${Utils.formatNumber(Player.gold)}`;

        // HP bar
        const hpBar = document.querySelector('#header-hp-bar .hp-fill');
        const hpText = document.querySelector('#header-hp-bar .mini-bar-text');
        if (hpBar) hpBar.style.width = `${(Player.hp / Player.maxHp) * 100}%`;
        if (hpText) hpText.textContent = `${Player.hp}/${Player.maxHp}`;

        // MP bar
        const mpBar = document.querySelector('#header-mp-bar .mp-fill');
        const mpText = document.querySelector('#header-mp-bar .mini-bar-text');
        if (mpBar) mpBar.style.width = `${(Player.mp / Player.maxMp) * 100}%`;
        if (mpText) mpText.textContent = `${Player.mp}/${Player.maxMp}`;

        // EXP bar
        const expBar = document.querySelector('#header-exp-bar .exp-fill');
        const expText = document.querySelector('#header-exp-bar .mini-bar-text');
        if (expBar) expBar.style.width = `${(Player.exp / Player.expToNext) * 100}%`;
        if (expText) expText.textContent = `${Player.exp}/${Player.expToNext}`;
    },

    // ==========================================
    // SECTION 4: Combat UI
    // ==========================================
    updateCombatUI() {
        const enemy = CombatSystem.enemy;
        if (!enemy) return;

        // Enemy info
        document.getElementById('enemy-name').textContent = enemy.name;
        document.getElementById('enemy-level').textContent = `Lv.${enemy.level}`;
        document.getElementById('enemy-sprite').textContent = enemy.icon;

        // Enemy HP
        const enemyHpFill = document.querySelector('.enemy-hp-fill');
        const enemyHpText = document.querySelector('#enemy-hp-bar .combat-bar-text');
        if (enemyHpFill) enemyHpFill.style.width = `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
        if (enemyHpText) enemyHpText.textContent = `${Math.max(0, enemy.hp)}/${enemy.maxHp}`;

        // Player combat info
        document.getElementById('combat-player-name').textContent = `${Player.name} Lv.${Player.level}`;

        const playerHpFill = document.querySelector('.player-hp-fill');
        const playerHpText = document.querySelector('#combat-hp-bar .combat-bar-text');
        if (playerHpFill) playerHpFill.style.width = `${(Player.hp / Player.maxHp) * 100}%`;
        if (playerHpText) playerHpText.textContent = `${Player.hp}/${Player.maxHp}`;

        const playerMpFill = document.querySelector('.player-mp-fill');
        const playerMpText = document.querySelector('#combat-mp-bar .combat-bar-text');
        if (playerMpFill) playerMpFill.style.width = `${(Player.mp / Player.maxMp) * 100}%`;
        if (playerMpText) playerMpText.textContent = `${Player.mp}/${Player.maxMp}`;

        // Status effects
        this.renderStatusEffects('enemy-status-effects', enemy.statusEffects);
        this.renderStatusEffects('player-status-effects', Player.statusEffects);

        // Enable/disable buttons
        const isPlayerTurn = CombatSystem.isPlayerTurn && CombatSystem.combatActive;
        document.querySelectorAll('.combat-btn').forEach(btn => {
            btn.disabled = !isPlayerTurn;
        });
    },

    renderStatusEffects(containerId, effects) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        for (const effect of effects) {
            const icon = document.createElement('div');
            icon.className = 'status-icon';
            icon.innerHTML = `${effect.icon}<span class="status-duration">${effect.duration}</span>`;
            icon.title = `${effect.name} (${effect.duration}回合)`;
            container.appendChild(icon);
        }
    },

    showCombatEffect(emoji, target) {
        const container = document.getElementById('combat-effects');
        if (!container) return;
        const effect = document.createElement('div');
        effect.className = 'combat-effect';
        effect.textContent = emoji;
        effect.style.left = target === 'enemy' ? '60%' : '40%';
        effect.style.top = target === 'enemy' ? '25%' : '65%';
        container.appendChild(effect);
        setTimeout(() => effect.remove(), 700);
    },

    // ==========================================
    // SECTION 5: Inventory UI
    // ==========================================
    refreshInventory() {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const filteredItems = this.inventoryTab === 'all'
            ? Player.inventory
            : Player.inventory.filter(item => {
                switch (this.inventoryTab) {
                    case 'weapon': return item.type === 'weapon';
                    case 'armor': return item.type === 'armor';
                    case 'accessory': return item.type === 'accessory';
                    case 'consumable': return item.type === 'consumable';
                    case 'material': return item.type === 'material';
                    default: return true;
                }
            });

        // Render item slots
        for (let i = 0; i < INVENTORY_SIZE; i++) {
            const slot = document.createElement('div');
            slot.className = 'inv-slot';

            if (i < filteredItems.length) {
                const item = filteredItems[i];
                slot.textContent = item.icon;
                slot.classList.add(`rarity-${(item.rarity || 'COMMON').toLowerCase()}`);

                if (item.stackable && item.quantity > 1) {
                    const qty = document.createElement('span');
                    qty.className = 'item-qty';
                    qty.textContent = item.quantity;
                    slot.appendChild(qty);
                }

                if (this.selectedInventoryItem && this.selectedInventoryItem.uid === item.uid) {
                    slot.classList.add('selected');
                }

                slot.addEventListener('click', () => {
                    this.selectedInventoryItem = item;
                    this.refreshInventory();
                    this.showItemDetail(item);
                });
            } else {
                slot.classList.add('empty');
            }

            grid.appendChild(slot);
        }

        // Show selected item detail
        if (this.selectedInventoryItem) {
            this.showItemDetail(this.selectedInventoryItem);
        } else {
            this.clearItemDetail();
        }
    },

    showItemDetail(item) {
        document.getElementById('detail-item-name').textContent =
            `[${RARITY[item.rarity || 'COMMON'].name}] ${item.name}`;
        document.getElementById('detail-item-name').style.color =
            RARITY[item.rarity || 'COMMON'].color;
        document.getElementById('detail-item-desc').textContent =
            item.description || '';

        // Stats
        const statsDiv = document.getElementById('detail-item-stats');
        statsDiv.innerHTML = '';
        const statNames = {
            atk: '攻击', def: '防御', hp: '生命', mp: '法力',
            hit: '命中', dodge: '闪避', crit: '暴击', speed: '速度'
        };

        if (item.stats) {
            for (const key in item.stats) {
                if (item.stats[key] !== 0) {
                    const span = document.createElement('span');
                    span.className = `item-stat ${item.stats[key] > 0 ? 'positive' : 'negative'}`;
                    span.textContent = `${statNames[key] || key}: ${item.stats[key] > 0 ? '+' : ''}${item.stats[key]}`;
                    statsDiv.appendChild(span);
                }
            }
        }
        if (item.bonusStats) {
            for (const key in item.bonusStats) {
                const span = document.createElement('span');
                span.className = 'item-stat positive';
                span.textContent = `[附加] ${statNames[key] || key}: +${item.bonusStats[key]}`;
                statsDiv.appendChild(span);
            }
        }
        if (item.special) {
            const span = document.createElement('span');
            span.className = 'item-stat positive';
            span.style.color = '#ffd700';
            span.textContent = `★ ${item.special.name}: ${item.special.desc}`;
            statsDiv.appendChild(span);
        }
        if (item.requiredLevel) {
            const span = document.createElement('span');
            span.className = `item-stat ${Player.level >= item.requiredLevel ? 'positive' : 'negative'}`;
            span.textContent = `需要等级: ${item.requiredLevel}`;
            statsDiv.appendChild(span);
        }
        if (item.requiredClass) {
            const className = GameData.classes[item.requiredClass]?.name || item.requiredClass;
            const span = document.createElement('span');
            span.className = `item-stat ${Player.className === item.requiredClass ? 'positive' : 'negative'}`;
            span.textContent = `限定职业: ${className}`;
            statsDiv.appendChild(span);
        }

        // Actions
        const actionsDiv = document.getElementById('detail-item-actions');
        actionsDiv.innerHTML = '';

        if (item.type === 'consumable') {
            const useBtn = document.createElement('button');
            useBtn.textContent = '使用';
            useBtn.addEventListener('click', () => {
                ItemSystem.useItem(item);
                this.selectedInventoryItem = null;
                this.refreshInventory();
            });
            actionsDiv.appendChild(useBtn);
        }

        if (item.slot) {
            const equipBtn = document.createElement('button');
            equipBtn.textContent = ItemSystem.canEquip(item) ? '装备' : '无法装备';
            equipBtn.disabled = !ItemSystem.canEquip(item);
            equipBtn.addEventListener('click', () => {
                ItemSystem.equipItem(item);
                this.selectedInventoryItem = null;
                this.refreshInventory();
                if (this.openPanels.has('character-panel')) this.refreshCharacter();
            });
            actionsDiv.appendChild(equipBtn);
        }

        const sellBtn = document.createElement('button');
        const sellPrice = ItemSystem.getSellPrice(item);
        sellBtn.textContent = `出售 (${sellPrice}💰)`;
        sellBtn.addEventListener('click', () => {
            ItemSystem.sellItem(item.uid);
            this.selectedInventoryItem = null;
            this.refreshInventory();
        });
        actionsDiv.appendChild(sellBtn);

        const dropBtn = document.createElement('button');
        dropBtn.textContent = '丢弃';
        dropBtn.addEventListener('click', () => {
            ItemSystem.removeFromInventory(item.uid);
            this.addLog(`丢弃了 ${item.name}`, 'system');
            this.selectedInventoryItem = null;
            this.refreshInventory();
        });
        actionsDiv.appendChild(dropBtn);
    },

    clearItemDetail() {
        document.getElementById('detail-item-name').textContent = '选择一个物品';
        document.getElementById('detail-item-name').style.color = '';
        document.getElementById('detail-item-desc').textContent = '';
        document.getElementById('detail-item-stats').innerHTML = '';
        document.getElementById('detail-item-actions').innerHTML = '';
    },

    // ==========================================
    // SECTION 6: Character Panel UI
    // ==========================================
    refreshCharacter() {
        const classData = GameData.classes[Player.className];
        const classIcons = { warrior: '⚔️', mage: '🔮', rogue: '🗡️', paladin: '✨' };

        document.getElementById('char-avatar').textContent = classIcons[Player.className] || '🧙';
        document.getElementById('char-name').textContent = Player.name;
        document.getElementById('char-class-level').textContent =
            `${classData?.name || Player.className} Lv.${Player.level}`;

        // EXP bar
        const expFill = document.querySelector('#char-exp-bar .exp-fill');
        const expText = document.querySelector('#char-exp-bar .stat-bar-text');
        if (expFill) expFill.style.width = `${(Player.exp / Player.expToNext) * 100}%`;
        if (expText) expText.textContent = `EXP: ${Player.exp}/${Player.expToNext}`;

        // Stats
        document.getElementById('char-hp').textContent = `${Player.hp}/${Player.maxHp}`;
        document.getElementById('char-mp').textContent = `${Player.mp}/${Player.maxMp}`;
        document.getElementById('char-atk').textContent = Player.atk;
        document.getElementById('char-def').textContent = Player.def;
        document.getElementById('char-hit').textContent = `${Player.hit}%`;
        document.getElementById('char-dodge').textContent = `${Player.dodge}%`;
        document.getElementById('char-crit').textContent = `${Player.crit}%`;
        document.getElementById('char-speed').textContent = Player.speed;

        // Equipment slots
        const slots = document.querySelectorAll('.equip-slot');
        slots.forEach(slotEl => {
            const slotName = slotEl.dataset.slot;
            const item = Player.equipment[slotName];
            const itemSpan = slotEl.querySelector('.slot-item');
            if (item) {
                itemSpan.textContent = `${item.icon} ${item.name}`;
                itemSpan.className = 'slot-item equipped';
                itemSpan.style.color = RARITY[item.rarity || 'COMMON'].color;
                slotEl.onclick = () => {
                    if (confirm(`卸下 ${item.name}？`)) {
                        ItemSystem.unequipItem(slotName);
                        this.refreshCharacter();
                        this.updateHeader();
                    }
                };
            } else {
                itemSpan.textContent = '空';
                itemSpan.className = 'slot-item';
                itemSpan.style.color = '';
                slotEl.onclick = null;
            }
        });

        // Skill tree
        if (Player.skillPoints > 0 || Player.learnedSkills.length > 0) {
            document.getElementById('char-skill-points').classList.remove('hidden');
            document.getElementById('available-sp').textContent = Player.skillPoints;
            this.refreshSkillTree();
        }
    },

    refreshSkillTree() {
        const container = document.getElementById('skill-tree');
        if (!container) return;
        container.innerHTML = '';

        for (const skill of Player.learnedSkills) {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'stat-row';
            skillDiv.innerHTML = `
                <span class="stat-label">${skill.icon} ${skill.name}</span>
                <span class="stat-value" style="font-size:11px;color:var(--text-secondary)">${skill.description}</span>
            `;
            container.appendChild(skillDiv);
        }

        // Show learnable skills
        const allSkills = Object.values(GameData.skills).filter(
            s => s.class === Player.className && s.level <= Player.level + 5
        );
        for (const skill of allSkills) {
            if (Player.learnedSkills.find(s => s.id === skill.id)) continue;
            const skillDiv = document.createElement('div');
            skillDiv.className = 'stat-row';
            skillDiv.style.opacity = Player.level >= skill.level ? '1' : '0.4';
            skillDiv.innerHTML = `
                <span class="stat-label">${skill.icon} ${skill.name} (Lv.${skill.level})</span>
                <span class="stat-value" style="font-size:11px;color:var(--text-dim)">${skill.description}</span>
            `;
            container.appendChild(skillDiv);
        }
    },

    // ==========================================
    // SECTION 7: Quest Panel UI
    // ==========================================
    refreshQuests(tab = 'active') {
        const list = document.getElementById('quest-list');
        if (!list) return;
        list.innerHTML = '';

        const quests = tab === 'active' ? Player.questLog :
            Player.completedQuests.map(id => {
                const q = GameData.quests[id];
                return q ? { ...q, completed: true } : null;
            }).filter(Boolean);

        for (const quest of quests) {
            const entry = document.createElement('div');
            entry.className = `quest-entry ${quest.completed ? 'completed' : ''} ${this.selectedQuestId === quest.id ? 'selected' : ''}`;
            entry.innerHTML = `
                <span class="quest-title">${quest.name}</span>
                <span class="quest-type ${quest.type}">${quest.type === 'main' ? '主线' : quest.type === 'side' ? '支线' : '日常'}</span>
            `;
            entry.addEventListener('click', () => {
                this.selectedQuestId = quest.id;
                this.showQuestDetail(quest);
                this.refreshQuests(tab);
            });
            list.appendChild(entry);
        }

        if (this.selectedQuestId) {
            const quest = quests.find(q => q.id === this.selectedQuestId);
            if (quest) this.showQuestDetail(quest);
        }
    },

    showQuestDetail(quest) {
        document.getElementById('quest-detail-name').textContent = quest.name;
        document.getElementById('quest-detail-desc').textContent = quest.description;

        const objDiv = document.getElementById('quest-detail-objectives');
        objDiv.innerHTML = '<h4 style="color:var(--accent-blue);margin-bottom:8px">目标</h4>';
        for (const obj of quest.objectives) {
            const progress = quest.progress ? (quest.progress[obj.id] || 0) : 0;
            const done = progress >= obj.count;
            const p = document.createElement('div');
            p.className = `quest-objective ${done ? 'done' : 'pending'}`;
            p.textContent = `${done ? '✅' : '⬜'} ${obj.description} (${progress}/${obj.count})`;
            objDiv.appendChild(p);
        }

        const rewardDiv = document.getElementById('quest-detail-rewards');
        rewardDiv.innerHTML = '<h4 style="color:var(--accent-gold);margin-bottom:8px">奖励</h4>';
        if (quest.rewards) {
            if (quest.rewards.exp) {
                const p = document.createElement('div');
                p.className = 'quest-reward';
                p.textContent = `⭐ ${quest.rewards.exp} 经验`;
                rewardDiv.appendChild(p);
            }
            if (quest.rewards.gold) {
                const p = document.createElement('div');
                p.className = 'quest-reward';
                p.textContent = `💰 ${quest.rewards.gold} 金币`;
                rewardDiv.appendChild(p);
            }
            if (quest.rewards.items) {
                for (const itemData of quest.rewards.items) {
                    const template = GameData.items[itemData.id];
                    if (template) {
                        const p = document.createElement('div');
                        p.className = 'quest-reward';
                        p.textContent = `${template.icon} ${template.name}`;
                        rewardDiv.appendChild(p);
                    }
                }
            }
        }
    },

    // ==========================================
    // SECTION 8: Shop UI
    // ==========================================
    openShop(floor) {
        this.closeAllPanels();
        this.shopMode = 'buy';
        this.selectedShopItem = null;
        const panel = document.getElementById('shop-panel');
        panel.classList.remove('hidden');
        this.openPanels.add('shop-panel');
        this.refreshShop();
    },

    refreshShop() {
        document.getElementById('shop-gold-amount').textContent = Utils.formatNumber(Player.gold);
        const itemsDiv = document.getElementById('shop-items');
        itemsDiv.innerHTML = '';

        if (this.shopMode === 'buy') {
            const inventory = GameData.getShopInventory(Game.floor);
            for (const template of inventory) {
                const price = template.price || 10;
                const canAfford = Player.gold >= price;
                const item = document.createElement('div');
                item.className = `shop-item ${!canAfford ? 'cant-afford' : ''} ${this.selectedShopItem?.id === template.id ? 'selected' : ''}`;
                item.innerHTML = `
                    <div class="shop-item-info">
                        <span class="shop-item-icon">${template.icon}</span>
                        <span class="shop-item-name">${template.name}</span>
                    </div>
                    <span class="shop-item-price">${price} 💰</span>
                `;
                item.addEventListener('click', () => {
                    this.selectedShopItem = template;
                    this.showShopItemDetail(template, 'buy');
                    this.refreshShop();
                });
                itemsDiv.appendChild(item);
            }
        } else {
            // Sell mode
            for (const item of Player.inventory) {
                const price = ItemSystem.getSellPrice(item);
                const shopItem = document.createElement('div');
                shopItem.className = `shop-item ${this.selectedShopItem?.uid === item.uid ? 'selected' : ''}`;
                shopItem.innerHTML = `
                    <div class="shop-item-info">
                        <span class="shop-item-icon">${item.icon}</span>
                        <span class="shop-item-name" style="color:${RARITY[item.rarity || 'COMMON'].color}">${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}</span>
                    </div>
                    <span class="shop-item-price">${price} 💰</span>
                `;
                shopItem.addEventListener('click', () => {
                    this.selectedShopItem = item;
                    this.showShopItemDetail(item, 'sell');
                    this.refreshShop();
                });
                itemsDiv.appendChild(shopItem);
            }
        }
    },

    showShopItemDetail(item, mode) {
        document.getElementById('shop-detail-name').textContent = item.name;
        document.getElementById('shop-detail-name').style.color =
            RARITY[item.rarity || 'COMMON'].color;
        document.getElementById('shop-detail-desc').textContent = item.description || '';

        const statsDiv = document.getElementById('shop-detail-stats');
        statsDiv.innerHTML = '';
        const statNames = {
            atk: '攻击', def: '防御', hp: '生命', mp: '法力',
            hit: '命中', dodge: '闪避', crit: '暴击', speed: '速度'
        };
        if (item.stats) {
            for (const key in item.stats) {
                if (item.stats[key] !== 0) {
                    const span = document.createElement('span');
                    span.className = `item-stat ${item.stats[key] > 0 ? 'positive' : 'negative'}`;
                    span.textContent = `${statNames[key] || key}: ${item.stats[key] > 0 ? '+' : ''}${item.stats[key]}`;
                    statsDiv.appendChild(span);
                }
            }
        }
        if (item.effect) {
            const span = document.createElement('span');
            span.className = 'item-stat positive';
            span.textContent = item.description;
            statsDiv.appendChild(span);
        }

        const actionsDiv = document.getElementById('shop-detail-actions');
        actionsDiv.innerHTML = '';

        if (mode === 'buy') {
            const price = item.price || 10;
            const buyBtn = document.createElement('button');
            buyBtn.textContent = `购买 (${price} 💰)`;
            buyBtn.disabled = Player.gold < price;
            buyBtn.addEventListener('click', () => {
                if (Player.gold >= price) {
                    Player.gold -= price;
                    const newItem = ItemSystem.createItem(item, 'COMMON');
                    if (ItemSystem.addToInventory(newItem)) {
                        this.addLog(`购买了 ${item.name}`, 'loot');
                        this.notify(`购买了 ${item.name}`, 'success');
                    }
                    this.refreshShop();
                    this.updateHeader();
                }
            });
            actionsDiv.appendChild(buyBtn);
        } else {
            const price = ItemSystem.getSellPrice(item);
            const sellBtn = document.createElement('button');
            sellBtn.textContent = `出售 (${price} 💰)`;
            sellBtn.addEventListener('click', () => {
                ItemSystem.sellItem(item.uid);
                this.selectedShopItem = null;
                this.refreshShop();
                this.updateHeader();
            });
            actionsDiv.appendChild(sellBtn);
        }
    },

    // ==========================================
    // SECTION 9: Forge UI
    // ==========================================
    openForge() {
        this.closeAllPanels();
        this.selectedForgeRecipe = null;
        const panel = document.getElementById('forge-panel');
        panel.classList.remove('hidden');
        this.openPanels.add('forge-panel');
        this.refreshForge();
    },

    refreshForge() {
        const recipesDiv = document.getElementById('forge-recipes');
        recipesDiv.innerHTML = '';

        const recipes = GameData.getForgeRecipes();
        for (const recipe of recipes) {
            const canForge = this.canForgeRecipe(recipe);
            const entry = document.createElement('div');
            entry.className = `forge-recipe ${!canForge ? 'cant-forge' : ''} ${this.selectedForgeRecipe?.id === recipe.id ? 'selected' : ''}`;
            const resultItem = GameData.items[recipe.result];
            entry.innerHTML = `
                <span>${resultItem?.icon || '?'} ${recipe.name}</span>
                <span style="color:${RARITY[recipe.resultRarity || 'COMMON'].color}">[${RARITY[recipe.resultRarity || 'COMMON'].name}]</span>
            `;
            entry.addEventListener('click', () => {
                this.selectedForgeRecipe = recipe;
                this.showForgeDetail(recipe);
                this.refreshForge();
            });
            recipesDiv.appendChild(entry);
        }

        if (this.selectedForgeRecipe) {
            this.showForgeDetail(this.selectedForgeRecipe);
        }
    },

    showForgeDetail(recipe) {
        const resultItem = GameData.items[recipe.result];
        document.getElementById('forge-item-name').textContent =
            `${resultItem?.icon || ''} ${recipe.name}`;
        document.getElementById('forge-item-name').style.color =
            RARITY[recipe.resultRarity || 'COMMON'].color;

        const matsDiv = document.getElementById('forge-materials');
        matsDiv.innerHTML = '<h4 style="margin-bottom:8px">所需材料</h4>';

        for (const mat of recipe.materials) {
            const template = GameData.items[mat.id];
            const owned = Player.inventory
                .filter(i => i.id === mat.id)
                .reduce((sum, i) => sum + (i.quantity || 1), 0);
            const has = owned >= mat.count;
            const p = document.createElement('div');
            p.className = `forge-material ${has ? 'has' : 'missing'}`;
            p.textContent = `${template?.icon || '?'} ${template?.name || mat.id}: ${owned}/${mat.count}`;
            matsDiv.appendChild(p);
        }

        if (recipe.goldCost) {
            const p = document.createElement('div');
            p.className = `forge-material ${Player.gold >= recipe.goldCost ? 'has' : 'missing'}`;
            p.textContent = `💰 金币: ${Player.gold}/${recipe.goldCost}`;
            matsDiv.appendChild(p);
        }

        const resultDiv = document.getElementById('forge-result');
        resultDiv.innerHTML = '';
        if (resultItem) {
            resultDiv.innerHTML = `<p style="margin-top:8px;color:var(--text-secondary)">${resultItem.description || ''}</p>`;
            if (resultItem.stats) {
                const statNames = { atk: '攻击', def: '防御', hp: '生命', mp: '法力', hit: '命中', dodge: '闪避', crit: '暴击', speed: '速度' };
                for (const key in resultItem.stats) {
                    if (resultItem.stats[key]) {
                        resultDiv.innerHTML += `<span class="item-stat positive" style="display:inline-block;margin:2px">${statNames[key]}: +${Math.floor(resultItem.stats[key] * RARITY[recipe.resultRarity || 'COMMON'].mult)}</span>`;
                    }
                }
            }
        }

        const forgeBtn = document.getElementById('btn-forge');
        forgeBtn.disabled = !this.canForgeRecipe(recipe);
        forgeBtn.onclick = () => this.doForge(recipe);
    },

    canForgeRecipe(recipe) {
        if (recipe.goldCost && Player.gold < recipe.goldCost) return false;
        for (const mat of recipe.materials) {
            const owned = Player.inventory
                .filter(i => i.id === mat.id)
                .reduce((sum, i) => sum + (i.quantity || 1), 0);
            if (owned < mat.count) return false;
        }
        return true;
    },

    doForge(recipe) {
        if (!this.canForgeRecipe(recipe)) return;

        // Consume materials
        for (const mat of recipe.materials) {
            let remaining = mat.count;
            for (const item of [...Player.inventory]) {
                if (item.id === mat.id && remaining > 0) {
                    const take = Math.min(remaining, item.quantity || 1);
                    remaining -= take;
                    if ((item.quantity || 1) <= take) {
                        Player.inventory = Player.inventory.filter(i => i.uid !== item.uid);
                    } else {
                        item.quantity -= take;
                    }
                }
            }
        }

        if (recipe.goldCost) Player.gold -= recipe.goldCost;

        // Create result item
        const template = GameData.items[recipe.result];
        if (template) {
            const item = ItemSystem.createItem(template, recipe.resultRarity || 'COMMON');
            ItemSystem.addToInventory(item);
            this.addLog(`锻造了 ${item.name}！`, 'loot');
            this.notify(`锻造成功：${item.name}！`, 'success');
            Renderer.spawnParticles(Player.x, Player.y, '#ffd700', 20);
        }

        this.refreshForge();
        this.updateHeader();
    },

    // ==========================================
    // SECTION 10: Dialog System
    // ==========================================
    showDialog(dialogData) {
        const box = document.getElementById('dialog-box');
        box.classList.remove('hidden');

        document.getElementById('dialog-portrait').textContent = dialogData.icon || '💬';
        document.getElementById('dialog-speaker').textContent = dialogData.speaker || 'NPC';
        document.getElementById('dialog-text').textContent = dialogData.text || '';

        const choicesDiv = document.getElementById('dialog-choices');
        choicesDiv.innerHTML = '';

        const continueHint = document.getElementById('dialog-continue');

        if (dialogData.choices && dialogData.choices.length > 0) {
            continueHint.style.display = 'none';
            for (const choice of dialogData.choices) {
                const btn = document.createElement('button');
                btn.className = 'dialog-choice';
                btn.textContent = choice.text;
                btn.addEventListener('click', () => {
                    if (choice.action) choice.action();
                });
                choicesDiv.appendChild(btn);
            }
        } else {
            continueHint.style.display = '';
            box.onclick = () => this.closeDialog();
        }

        Game.currentDialog = dialogData;
    },

    closeDialog() {
        const box = document.getElementById('dialog-box');
        box.classList.add('hidden');
        box.onclick = null;
        Game.currentDialog = null;

        // Process dialog queue
        if (Game.dialogQueue.length > 0) {
            const next = Game.dialogQueue.shift();
            setTimeout(() => this.showDialog(next), 200);
        }
    },

    // ==========================================
    // SECTION 11: Overlays (Level Up, Loot)
    // ==========================================
    showLevelUp(newLevel) {
        const overlay = document.getElementById('levelup-overlay');
        overlay.classList.remove('hidden');

        document.getElementById('levelup-info').textContent =
            `${Player.name} 达到了 Lv.${newLevel}！`;

        const statsDiv = document.getElementById('levelup-stats');
        statsDiv.innerHTML = '';

        const classData = GameData.classes[Player.className];
        const stats = [
            { name: '最大生命', change: `+${classData.hpPerLevel}` },
            { name: '最大法力', change: `+${classData.mpPerLevel}` },
            { name: '攻击力', change: `+${classData.atkPerLevel}` },
            { name: '防御力', change: `+${classData.defPerLevel}` },
            { name: '速度', change: '+1' }
        ];

        for (const stat of stats) {
            const div = document.createElement('div');
            div.className = 'levelup-stat';
            div.innerHTML = `
                <span class="stat-name">${stat.name}</span>
                <span class="stat-change">${stat.change}</span>
            `;
            statsDiv.appendChild(div);
        }

        document.getElementById('btn-levelup-ok').onclick = () => {
            overlay.classList.add('hidden');
        };
    },

    showLoot(exp, gold, items) {
        const overlay = document.getElementById('loot-overlay');
        overlay.classList.remove('hidden');

        const itemsDiv = document.getElementById('loot-items');
        itemsDiv.innerHTML = '';

        for (const item of items) {
            if (item.type === 'gold') continue;
            const div = document.createElement('div');
            div.className = 'loot-item';
            div.innerHTML = `
                <span class="loot-item-icon">${item.icon}</span>
                <span style="color:${RARITY[item.rarity || 'COMMON'].color}">[${RARITY[item.rarity || 'COMMON'].name}] ${item.name}</span>
            `;
            itemsDiv.appendChild(div);
        }

        document.getElementById('loot-gold').textContent = `💰 ${gold} 金币`;
        document.getElementById('loot-exp').textContent = `⭐ ${exp} 经验`;

        document.getElementById('btn-loot-ok').onclick = () => {
            overlay.classList.add('hidden');
        };
    },

    // ==========================================
    // SECTION 12: Event Binding & Initialization
    // ==========================================
    init() {
        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const panelId = btn.dataset.close;
                if (panelId) {
                    document.getElementById(panelId).classList.add('hidden');
                    this.openPanels.delete(panelId);
                }
            });
        });

        // Header buttons
        document.getElementById('btn-inventory').addEventListener('click', () => this.togglePanel('inventory-panel'));
        document.getElementById('btn-character').addEventListener('click', () => this.togglePanel('character-panel'));
        document.getElementById('btn-quest-log').addEventListener('click', () => this.togglePanel('quest-panel'));
        document.getElementById('btn-minimap').addEventListener('click', () => this.togglePanel('map-panel'));
        document.getElementById('btn-save').addEventListener('click', () => SaveSystem.save());
        document.getElementById('btn-settings').addEventListener('click', () => this.togglePanel('settings-panel'));

        // Inventory tabs
        document.querySelectorAll('.inv-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.inventoryTab = tab.dataset.tab;
                this.selectedInventoryItem = null;
                this.refreshInventory();
            });
        });

        // Quest tabs
        document.querySelectorAll('.quest-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.selectedQuestId = null;
                this.refreshQuests(tab.dataset.tab);
            });
        });

        // Shop tabs
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.shopMode = tab.dataset.tab;
                this.selectedShopItem = null;
                this.refreshShop();
            });
        });

        // Combat buttons
        document.getElementById('btn-attack').addEventListener('click', () => {
            CombatSystem.playerAttack();
        });

        document.getElementById('btn-skills').addEventListener('click', () => {
            this.showSkillList();
        });

        document.getElementById('btn-items').addEventListener('click', () => {
            this.showCombatItemList();
        });

        document.getElementById('btn-defend').addEventListener('click', () => {
            CombatSystem.playerDefend();
        });

        document.getElementById('btn-flee').addEventListener('click', () => {
            CombatSystem.playerFlee();
        });

        // Settings
        document.getElementById('btn-save-settings').addEventListener('click', () => {
            Game.settings.sfxVolume = parseInt(document.getElementById('sfx-volume').value);
            Game.settings.animSpeed = document.getElementById('anim-speed').value;
            Game.settings.autoSave = document.getElementById('auto-save').checked;
            this.notify('设置已保存', 'success');
        });

        document.getElementById('btn-quit-game').addEventListener('click', () => {
            if (confirm('确定要返回主菜单吗？未保存的进度将丢失。')) {
                location.reload();
            }
        });
    },

    showSkillList() {
        const container = document.getElementById('skill-list');
        const itemContainer = document.getElementById('item-list');
        itemContainer.classList.add('hidden');

        if (!container.classList.contains('hidden')) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        container.innerHTML = '';

        for (const skill of Player.learnedSkills) {
            const btn = document.createElement('button');
            btn.className = 'skill-btn';
            btn.disabled = Player.mp < skill.mpCost;
            btn.innerHTML = `
                ${skill.icon} ${skill.name}
                <span class="skill-cost">MP: ${skill.mpCost}</span>
            `;
            btn.addEventListener('click', () => {
                CombatSystem.playerSkill(skill.id);
                container.classList.add('hidden');
            });
            container.appendChild(btn);
        }

        if (Player.learnedSkills.length === 0) {
            container.innerHTML = '<p style="color:var(--text-dim);padding:8px">没有可用技能</p>';
        }
    },

    showCombatItemList() {
        const container = document.getElementById('item-list');
        const skillContainer = document.getElementById('skill-list');
        skillContainer.classList.add('hidden');

        if (!container.classList.contains('hidden')) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        container.innerHTML = '';

        const consumables = Player.inventory.filter(i => i.type === 'consumable');
        for (const item of consumables) {
            const btn = document.createElement('button');
            btn.className = 'item-btn';
            btn.innerHTML = `
                ${item.icon} ${item.name}
                <span class="item-count">x${item.quantity || 1}</span>
            `;
            btn.addEventListener('click', () => {
                CombatSystem.playerUseItem(item.uid);
                container.classList.add('hidden');
            });
            container.appendChild(btn);
        }

        if (consumables.length === 0) {
            container.innerHTML = '<p style="color:var(--text-dim);padding:8px">没有可用道具</p>';
        }
    }
};

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    GameUI.init();
});
