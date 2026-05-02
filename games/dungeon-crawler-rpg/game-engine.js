/* ============================================
   暗影地牢 - Shadow Dungeon RPG
   Game Engine - Core Systems
   ============================================ */

// ==========================================
// SECTION 1: Game State & Constants
// ==========================================
const TILE_SIZE = 32;
const MAP_COLS = 50;
const MAP_ROWS = 40;
const VIEWPORT_COLS = 25;
const VIEWPORT_ROWS = 19;
const MAX_FLOOR = 20;
const MAX_LEVEL = 50;
const INVENTORY_SIZE = 40;

const TILE = {
    FLOOR: 0, WALL: 1, DOOR: 2, STAIRS_DOWN: 3, STAIRS_UP: 4,
    CHEST: 5, TRAP: 6, WATER: 7, LAVA: 8, SHOP: 9, FORGE: 10,
    PILLAR: 11, GRASS: 12, CRYSTAL: 13, PORTAL: 14, BOSS_DOOR: 15
};

const DIRECTION = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 };
const DIR_OFFSET = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
];

const RARITY = {
    COMMON: { name: '普通', color: '#aaaacc', mult: 1.0 },
    UNCOMMON: { name: '优秀', color: '#44dd88', mult: 1.3 },
    RARE: { name: '稀有', color: '#4488ff', mult: 1.6 },
    EPIC: { name: '史诗', color: '#aa55ff', mult: 2.0 },
    LEGENDARY: { name: '传说', color: '#ffd700', mult: 2.5 }
};

// ELEMENT is defined in game-data.js

const STATUS = {
    POISON: { name: '中毒', icon: '☠️', duration: 3, tickDmg: 0.05 },
    BURN: { name: '灼烧', icon: '🔥', duration: 3, tickDmg: 0.08 },
    FREEZE: { name: '冰冻', icon: '❄️', duration: 2, skipTurn: true },
    STUN: { name: '眩晕', icon: '💫', duration: 1, skipTurn: true },
    BLEED: { name: '流血', icon: '🩸', duration: 4, tickDmg: 0.04 },
    REGEN: { name: '再生', icon: '💚', duration: 3, tickHeal: 0.06 },
    SHIELD: { name: '护盾', icon: '🛡️', duration: 3, defBonus: 0.5 },
    BERSERK: { name: '狂暴', icon: '😡', duration: 3, atkBonus: 0.4, defPenalty: 0.2 },
    BLIND: { name: '致盲', icon: '🌑', duration: 2, hitPenalty: 0.3 },
    SLOW: { name: '减速', icon: '🐌', duration: 3, spdPenalty: 0.3 },
    HASTE: { name: '加速', icon: '⚡', duration: 3, spdBonus: 0.3 },
    WEAKEN: { name: '虚弱', icon: '💔', duration: 3, atkPenalty: 0.3 }
};

// Global game state
const Game = {
    state: 'menu',
    paused: false,
    floor: 1,
    turnCount: 0,
    totalKills: 0,
    totalGold: 0,
    totalSteps: 0,
    playTime: 0,
    playStartTime: 0,
    animSpeed: 1,
    autoSave: true,
    lastUpdate: 0,
    canvas: null,
    ctx: null,
    minimapCanvas: null,
    minimapCtx: null,
    keys: {},
    keyQueue: [],
    moveTimer: 0,
    moveCooldown: 150,
    interactTarget: null,
    currentMap: null,
    entities: [],
    particles: [],
    animations: [],
    camera: { x: 0, y: 0 },
    dialogQueue: [],
    currentDialog: null,
    settings: { sfxVolume: 70, animSpeed: 'normal', autoSave: true }
};

// Player object
const Player = {
    name: '勇者',
    className: 'warrior',
    level: 1,
    exp: 0,
    expToNext: 100,
    gold: 0,
    x: 0,
    y: 0,
    facing: DIRECTION.DOWN,
    hp: 100, maxHp: 100,
    mp: 50, maxMp: 50,
    baseAtk: 10, baseDef: 5,
    baseHit: 95, baseDodge: 5,
    baseCrit: 5, baseCritDmg: 150,
    baseSpeed: 10,
    atk: 10, def: 5,
    hit: 95, dodge: 5,
    crit: 5, critDmg: 150,
    speed: 10,
    skillPoints: 0,
    statPoints: 0,
    equipment: {
        weapon: null, head: null, body: null,
        legs: null, feet: null,
        accessory1: null, accessory2: null
    },
    inventory: [],
    skills: [],
    learnedSkills: [],
    statusEffects: [],
    questLog: [],
    completedQuests: [],
    discoveredRooms: new Set(),
    visitedFloors: new Set(),
    killCount: {},
    flags: {}
};

// ==========================================
// SECTION 2: Utility Functions
// ==========================================
const Utils = {
    rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    randFloat(min, max) {
        return Math.random() * (max - min) + min;
    },
    chance(percent) {
        return Math.random() * 100 < percent;
    },
    pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    weightedPick(items, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < items.length; i++) {
            r -= weights[i];
            if (r <= 0) return items[i];
        }
        return items[items.length - 1];
    },
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    dist(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    manhattan(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    },
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return Math.floor(n).toString();
    },
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
};

// ==========================================
// SECTION 3: Map Generator
// ==========================================
const MapGenerator = {
    generate(floor) {
        const map = {
            floor,
            tiles: [],
            rooms: [],
            corridors: [],
            entities: [],
            items: [],
            explored: [],
            visible: [],
            width: MAP_COLS,
            height: MAP_ROWS
        };

        // Initialize with walls
        for (let y = 0; y < MAP_ROWS; y++) {
            map.tiles[y] = [];
            map.explored[y] = [];
            map.visible[y] = [];
            for (let x = 0; x < MAP_COLS; x++) {
                map.tiles[y][x] = TILE.WALL;
                map.explored[y][x] = false;
                map.visible[y][x] = false;
            }
        }

        // Generate rooms using BSP
        const roomCount = Utils.rand(8, 14) + Math.floor(floor / 3);
        this.generateRoomsBSP(map, roomCount);

        // Connect rooms with corridors
        this.connectRooms(map);

        // Add special tiles
        this.addDoors(map);
        this.addDecorations(map, floor);

        // Place stairs
        this.placeStairs(map, floor);

        // Place entities (monsters, NPCs)
        this.placeEntities(map, floor);

        // Place items and chests
        this.placeItems(map, floor);

        // Place traps on higher floors
        if (floor >= 3) {
            this.placeTraps(map, floor);
        }

        // Boss room on every 5th floor
        if (floor % 5 === 0) {
            this.createBossRoom(map, floor);
        }

        // Shop room on every 3rd floor
        if (floor % 3 === 0) {
            this.createShopRoom(map, floor);
        }

        return map;
    },

    generateRoomsBSP(map, targetRooms) {
        const minRoomSize = 4;
        const maxRoomSize = 10;
        const attempts = targetRooms * 10;

        for (let i = 0; i < attempts && map.rooms.length < targetRooms; i++) {
            const w = Utils.rand(minRoomSize, maxRoomSize);
            const h = Utils.rand(minRoomSize, maxRoomSize);
            const x = Utils.rand(2, MAP_COLS - w - 2);
            const y = Utils.rand(2, MAP_ROWS - h - 2);

            const room = { x, y, w, h, cx: Math.floor(x + w / 2), cy: Math.floor(y + h / 2) };

            // Check overlap
            let overlaps = false;
            for (const other of map.rooms) {
                if (x - 1 < other.x + other.w && x + w + 1 > other.x &&
                    y - 1 < other.y + other.h && y + h + 1 > other.y) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                map.rooms.push(room);
                // Carve room
                for (let ry = y; ry < y + h; ry++) {
                    for (let rx = x; rx < x + w; rx++) {
                        map.tiles[ry][rx] = TILE.FLOOR;
                    }
                }
            }
        }
    },

    connectRooms(map) {
        // Connect each room to the next using L-shaped corridors
        for (let i = 0; i < map.rooms.length - 1; i++) {
            const a = map.rooms[i];
            const b = map.rooms[i + 1];
            this.carveCorridor(map, a.cx, a.cy, b.cx, b.cy);
        }
        // Add extra connections for loops
        for (let i = 0; i < Math.floor(map.rooms.length / 3); i++) {
            const a = Utils.pick(map.rooms);
            const b = Utils.pick(map.rooms);
            if (a !== b) {
                this.carveCorridor(map, a.cx, a.cy, b.cx, b.cy);
            }
        }
    },

    carveCorridor(map, x1, y1, x2, y2) {
        let x = x1, y = y1;
        // Horizontal first, then vertical (or random)
        const hFirst = Utils.chance(50);

        if (hFirst) {
            while (x !== x2) {
                if (x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS) {
                    map.tiles[y][x] = TILE.FLOOR;
                }
                x += x < x2 ? 1 : -1;
            }
            while (y !== y2) {
                if (x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS) {
                    map.tiles[y][x] = TILE.FLOOR;
                }
                y += y < y2 ? 1 : -1;
            }
        } else {
            while (y !== y2) {
                if (x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS) {
                    map.tiles[y][x] = TILE.FLOOR;
                }
                y += y < y2 ? 1 : -1;
            }
            while (x !== x2) {
                if (x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS) {
                    map.tiles[y][x] = TILE.FLOOR;
                }
                x += x < x2 ? 1 : -1;
            }
        }
        if (x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS) {
            map.tiles[y][x] = TILE.FLOOR;
        }
    },

    addDoors(map) {
        for (let y = 1; y < MAP_ROWS - 1; y++) {
            for (let x = 1; x < MAP_COLS - 1; x++) {
                if (map.tiles[y][x] !== TILE.FLOOR) continue;
                // Check if this is a doorway (wall on two opposite sides, floor on other two)
                const n = map.tiles[y - 1][x] === TILE.WALL;
                const s = map.tiles[y + 1][x] === TILE.WALL;
                const e = map.tiles[y][x + 1] === TILE.WALL;
                const w = map.tiles[y][x - 1] === TILE.WALL;
                if ((n && s && !e && !w) || (!n && !s && e && w)) {
                    if (Utils.chance(30)) {
                        map.tiles[y][x] = TILE.DOOR;
                    }
                }
            }
        }
    },

    addDecorations(map, floor) {
        for (const room of map.rooms) {
            if (Utils.chance(40)) {
                // Add pillars to larger rooms
                if (room.w >= 6 && room.h >= 6) {
                    const px1 = room.x + 1, py1 = room.y + 1;
                    const px2 = room.x + room.w - 2, py2 = room.y + room.h - 2;
                    if (map.tiles[py1][px1] === TILE.FLOOR) map.tiles[py1][px1] = TILE.PILLAR;
                    if (map.tiles[py1][px2] === TILE.FLOOR) map.tiles[py1][px2] = TILE.PILLAR;
                    if (map.tiles[py2][px1] === TILE.FLOOR) map.tiles[py2][px1] = TILE.PILLAR;
                    if (map.tiles[py2][px2] === TILE.FLOOR) map.tiles[py2][px2] = TILE.PILLAR;
                }
            }
            // Random decorations
            if (Utils.chance(20)) {
                const dx = Utils.rand(room.x + 1, room.x + room.w - 2);
                const dy = Utils.rand(room.y + 1, room.y + room.h - 2);
                if (map.tiles[dy][dx] === TILE.FLOOR) {
                    map.tiles[dy][dx] = floor >= 10 ? TILE.CRYSTAL : TILE.GRASS;
                }
            }
        }
    },

    placeStairs(map, floor) {
        // Stairs up in first room (player start)
        if (floor > 1) {
            const startRoom = map.rooms[0];
            map.tiles[startRoom.cy][startRoom.cx] = TILE.STAIRS_UP;
        }
        // Stairs down in last room
        if (floor < MAX_FLOOR) {
            const endRoom = map.rooms[map.rooms.length - 1];
            map.tiles[endRoom.cy][endRoom.cx] = TILE.STAIRS_DOWN;
        }
        // Portal on final floor
        if (floor === MAX_FLOOR) {
            const endRoom = map.rooms[map.rooms.length - 1];
            map.tiles[endRoom.cy][endRoom.cx] = TILE.PORTAL;
        }
    },

    placeEntities(map, floor) {
        const monsterCount = Utils.rand(6, 10) + Math.floor(floor * 1.5);
        const availableMonsters = GameData.getMonstersByFloor(floor);

        for (let i = 0; i < monsterCount; i++) {
            const room = Utils.pick(map.rooms.slice(1)); // Skip first room
            const mx = Utils.rand(room.x + 1, room.x + room.w - 2);
            const my = Utils.rand(room.y + 1, room.y + room.h - 2);

            if (map.tiles[my][mx] === TILE.FLOOR && !map.entities.find(e => e.x === mx && e.y === my)) {
                const template = Utils.pick(availableMonsters);
                const monster = this.createMonster(template, floor);
                monster.x = mx;
                monster.y = my;
                map.entities.push(monster);
            }
        }

        // Place NPC in first room occasionally
        if (Utils.chance(40) && floor > 1) {
            const npcRoom = map.rooms[0];
            const npc = this.createNPC(floor);
            npc.x = npcRoom.cx + 1;
            npc.y = npcRoom.cy;
            map.entities.push(npc);
        }
    },

    createMonster(template, floor) {
        const levelBonus = Math.floor(floor * 0.8);
        const level = template.level + Utils.rand(0, 2) + levelBonus;
        const scaleFactor = 1 + (level - template.level) * 0.1;

        return {
            type: 'monster',
            id: template.id,
            name: template.name,
            icon: template.icon,
            level: level,
            hp: Math.floor(template.hp * scaleFactor),
            maxHp: Math.floor(template.hp * scaleFactor),
            mp: Math.floor(template.mp * scaleFactor),
            maxMp: Math.floor(template.mp * scaleFactor),
            atk: Math.floor(template.atk * scaleFactor),
            def: Math.floor(template.def * scaleFactor),
            speed: template.speed,
            hit: template.hit || 90,
            dodge: template.dodge || 5,
            crit: template.crit || 3,
            element: template.element || ELEMENT.NONE,
            skills: template.skills || [],
            loot: template.loot || [],
            exp: Math.floor(template.exp * scaleFactor),
            gold: Math.floor(template.gold * scaleFactor),
            statusEffects: [],
            isBoss: template.isBoss || false,
            behavior: template.behavior || 'aggressive',
            x: 0, y: 0,
            patrol: null,
            alertRange: template.alertRange || 6,
            isAlert: false
        };
    },

    createNPC(floor) {
        const npcs = GameData.getNPCs(floor);
        const template = Utils.pick(npcs);
        return {
            type: 'npc',
            id: template.id,
            name: template.name,
            icon: template.icon,
            dialog: template.dialog,
            quest: template.quest || null,
            shop: template.shop || null,
            x: 0, y: 0
        };
    },

    placeItems(map, floor) {
        const chestCount = Utils.rand(2, 5) + Math.floor(floor / 3);
        for (let i = 0; i < chestCount; i++) {
            const room = Utils.pick(map.rooms.slice(1));
            const cx = Utils.rand(room.x + 1, room.x + room.w - 2);
            const cy = Utils.rand(room.y + 1, room.y + room.h - 2);
            if (map.tiles[cy][cx] === TILE.FLOOR) {
                map.tiles[cy][cx] = TILE.CHEST;
                const loot = this.generateChestLoot(floor);
                map.items.push({ x: cx, y: cy, items: loot, opened: false });
            }
        }
    },

    generateChestLoot(floor) {
        const items = [];
        const itemCount = Utils.rand(1, 3);
        for (let i = 0; i < itemCount; i++) {
            const rarity = this.rollRarity(floor);
            const pool = GameData.getItemsByFloorAndRarity(floor, rarity);
            if (pool.length > 0) {
                const template = Utils.pick(pool);
                items.push(ItemSystem.createItem(template, rarity));
            }
        }
        // Gold
        items.push({ type: 'gold', amount: Utils.rand(10, 30) * floor });
        return items;
    },

    rollRarity(floor) {
        const legendaryChance = Math.min(1 + floor * 0.3, 5);
        const epicChance = Math.min(3 + floor * 0.5, 12);
        const rareChance = Math.min(8 + floor * 0.8, 25);
        const uncommonChance = Math.min(20 + floor, 40);

        const roll = Math.random() * 100;
        if (roll < legendaryChance) return 'LEGENDARY';
        if (roll < legendaryChance + epicChance) return 'EPIC';
        if (roll < legendaryChance + epicChance + rareChance) return 'RARE';
        if (roll < legendaryChance + epicChance + rareChance + uncommonChance) return 'UNCOMMON';
        return 'COMMON';
    },

    placeTraps(map, floor) {
        const trapCount = Utils.rand(2, 4) + Math.floor(floor / 4);
        for (let i = 0; i < trapCount; i++) {
            const room = Utils.pick(map.rooms.slice(1));
            const tx = Utils.rand(room.x + 1, room.x + room.w - 2);
            const ty = Utils.rand(room.y + 1, room.y + room.h - 2);
            if (map.tiles[ty][tx] === TILE.FLOOR) {
                map.tiles[ty][tx] = TILE.TRAP;
            }
        }
    },

    createBossRoom(map, floor) {
        // Use the last room as boss room, make it bigger
        const lastRoom = map.rooms[map.rooms.length - 1];
        // Place boss door at entrance
        const doorX = lastRoom.cx;
        const doorY = lastRoom.y;
        if (doorY > 0 && map.tiles[doorY][doorX] !== undefined) {
            map.tiles[doorY][doorX] = TILE.BOSS_DOOR;
        }

        // Place boss
        const bossTemplate = GameData.getBoss(floor);
        if (bossTemplate) {
            const boss = this.createMonster(bossTemplate, floor);
            boss.x = lastRoom.cx;
            boss.y = lastRoom.cy + 1;
            boss.isBoss = true;
            // Remove stairs from boss position
            if (map.tiles[lastRoom.cy][lastRoom.cx] === TILE.STAIRS_DOWN) {
                map.tiles[lastRoom.cy][lastRoom.cx] = TILE.FLOOR;
                // Place stairs after boss is defeated
                boss.onDeath = () => {
                    map.tiles[lastRoom.cy][lastRoom.cx] = TILE.STAIRS_DOWN;
                    GameUI.addLog('楼梯出现了！', 'system');
                };
            }
            map.entities.push(boss);
        }
    },

    createShopRoom(map, floor) {
        if (map.rooms.length < 3) return;
        const shopRoom = map.rooms[Math.floor(map.rooms.length / 2)];
        map.tiles[shopRoom.cy][shopRoom.cx] = TILE.SHOP;
    }
};

// ==========================================
// SECTION 4: Item System
// ==========================================
const ItemSystem = {
    createItem(template, rarity = 'COMMON') {
        const rarityData = RARITY[rarity];
        const item = {
            ...Utils.deepClone(template),
            uid: Date.now() + Math.random(),
            rarity: rarity,
            rarityName: rarityData.name,
            rarityColor: rarityData.color
        };

        // Scale stats by rarity
        if (item.stats) {
            for (const key in item.stats) {
                item.stats[key] = Math.floor(item.stats[key] * rarityData.mult);
            }
        }

        // Random bonus stats for rare+
        if (['RARE', 'EPIC', 'LEGENDARY'].includes(rarity)) {
            item.bonusStats = this.generateBonusStats(rarity);
        }

        // Legendary items get special effects
        if (rarity === 'LEGENDARY' && !item.special) {
            item.special = this.generateSpecialEffect();
        }

        return item;
    },

    generateBonusStats(rarity) {
        const bonusCount = rarity === 'RARE' ? 1 : rarity === 'EPIC' ? 2 : 3;
        const possibleStats = ['atk', 'def', 'hp', 'mp', 'crit', 'dodge', 'speed', 'hit'];
        const bonuses = {};
        const chosen = Utils.shuffle(possibleStats).slice(0, bonusCount);
        for (const stat of chosen) {
            const base = stat === 'hp' ? Utils.rand(10, 30) :
                         stat === 'mp' ? Utils.rand(5, 20) :
                         stat === 'crit' || stat === 'dodge' ? Utils.rand(1, 5) :
                         Utils.rand(2, 8);
            bonuses[stat] = Math.floor(base * RARITY[rarity].mult);
        }
        return bonuses;
    },

    generateSpecialEffect() {
        const effects = [
            { name: '生命汲取', desc: '攻击时恢复5%伤害的生命', type: 'lifesteal', value: 0.05 },
            { name: '法力汲取', desc: '攻击时恢复3%伤害的法力', type: 'manasteal', value: 0.03 },
            { name: '连击', desc: '10%几率攻击两次', type: 'doubleStrike', value: 0.1 },
            { name: '反射', desc: '反弹10%受到的伤害', type: 'reflect', value: 0.1 },
            { name: '经验加成', desc: '获得经验+15%', type: 'expBonus', value: 0.15 },
            { name: '金币加成', desc: '获得金币+20%', type: 'goldBonus', value: 0.2 },
            { name: '元素爆发', desc: '暴击时触发元素伤害', type: 'elementBurst', value: 0.3 },
            { name: '坚韧', desc: '生命低于30%时防御+25%', type: 'tenacity', value: 0.25 }
        ];
        return Utils.pick(effects);
    },

    canEquip(item) {
        if (!item || !item.slot) return false;
        if (item.requiredLevel && Player.level < item.requiredLevel) return false;
        if (item.requiredClass && item.requiredClass !== Player.className) return false;
        return true;
    },

    equipItem(item) {
        if (!this.canEquip(item)) return false;

        const slot = item.slot;
        const currentEquip = Player.equipment[slot];

        // Unequip current
        if (currentEquip) {
            this.addToInventory(currentEquip);
        }

        // Remove from inventory
        const idx = Player.inventory.findIndex(i => i.uid === item.uid);
        if (idx !== -1) Player.inventory.splice(idx, 1);

        // Equip
        Player.equipment[slot] = item;
        this.recalcStats();
        GameUI.addLog(`装备了 ${item.name}`, 'system');
        GameUI.notify(`装备了 ${item.name}`, 'info');
        return true;
    },

    unequipItem(slot) {
        const item = Player.equipment[slot];
        if (!item) return false;
        if (Player.inventory.length >= INVENTORY_SIZE) {
            GameUI.notify('背包已满！', 'warning');
            return false;
        }
        Player.equipment[slot] = null;
        this.addToInventory(item);
        this.recalcStats();
        GameUI.addLog(`卸下了 ${item.name}`, 'system');
        return true;
    },

    addToInventory(item) {
        if (item.stackable) {
            const existing = Player.inventory.find(i => i.id === item.id);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
                return true;
            }
        }
        if (Player.inventory.length >= INVENTORY_SIZE) {
            GameUI.notify('背包已满！', 'warning');
            return false;
        }
        if (!item.quantity) item.quantity = 1;
        Player.inventory.push(item);
        return true;
    },

    removeFromInventory(uid, count = 1) {
        const idx = Player.inventory.findIndex(i => i.uid === uid);
        if (idx === -1) return false;
        const item = Player.inventory[idx];
        if (item.stackable && item.quantity > count) {
            item.quantity -= count;
        } else {
            Player.inventory.splice(idx, 1);
        }
        return true;
    },

    useItem(item) {
        if (item.type !== 'consumable') return false;

        let used = false;
        if (item.effect) {
            switch (item.effect.type) {
                case 'heal':
                    if (Player.hp < Player.maxHp) {
                        const heal = Math.floor(item.effect.value);
                        Player.hp = Math.min(Player.maxHp, Player.hp + heal);
                        GameUI.addLog(`使用 ${item.name}，恢复了 ${heal} 点生命`, 'system');
                        used = true;
                    }
                    break;
                case 'healPercent':
                    if (Player.hp < Player.maxHp) {
                        const heal = Math.floor(Player.maxHp * item.effect.value);
                        Player.hp = Math.min(Player.maxHp, Player.hp + heal);
                        GameUI.addLog(`使用 ${item.name}，恢复了 ${heal} 点生命`, 'system');
                        used = true;
                    }
                    break;
                case 'mana':
                    if (Player.mp < Player.maxMp) {
                        const mana = Math.floor(item.effect.value);
                        Player.mp = Math.min(Player.maxMp, Player.mp + mana);
                        GameUI.addLog(`使用 ${item.name}，恢复了 ${mana} 点法力`, 'system');
                        used = true;
                    }
                    break;
                case 'manaPercent':
                    if (Player.mp < Player.maxMp) {
                        const mana = Math.floor(Player.maxMp * item.effect.value);
                        Player.mp = Math.min(Player.maxMp, Player.mp + mana);
                        GameUI.addLog(`使用 ${item.name}，恢复了 ${mana} 点法力`, 'system');
                        used = true;
                    }
                    break;
                case 'fullRestore':
                    Player.hp = Player.maxHp;
                    Player.mp = Player.maxMp;
                    Player.statusEffects = [];
                    GameUI.addLog(`使用 ${item.name}，完全恢复！`, 'system');
                    used = true;
                    break;
                case 'buff':
                    CombatSystem.applyStatus(Player, item.effect.status, item.effect.duration || 5);
                    GameUI.addLog(`使用 ${item.name}`, 'system');
                    used = true;
                    break;
                case 'cure':
                    if (Player.statusEffects.length > 0) {
                        Player.statusEffects = Player.statusEffects.filter(s => !s.isDebuff);
                        GameUI.addLog(`使用 ${item.name}，清除了负面状态`, 'system');
                        used = true;
                    }
                    break;
                case 'escape':
                    GameUI.addLog(`使用 ${item.name}，传送回楼梯处`, 'system');
                    // Teleport to stairs up
                    for (let y = 0; y < MAP_ROWS; y++) {
                        for (let x = 0; x < MAP_COLS; x++) {
                            if (Game.currentMap.tiles[y][x] === TILE.STAIRS_UP) {
                                Player.x = x;
                                Player.y = y;
                                used = true;
                                break;
                            }
                        }
                        if (used) break;
                    }
                    if (!used) {
                        Player.x = Game.currentMap.rooms[0].cx;
                        Player.y = Game.currentMap.rooms[0].cy;
                        used = true;
                    }
                    break;
            }
        }

        if (used) {
            this.removeFromInventory(item.uid);
            GameUI.updateAllUI();
        } else {
            GameUI.notify('现在无法使用此物品', 'warning');
        }
        return used;
    },

    recalcStats() {
        // Start from base stats
        Player.atk = Player.baseAtk;
        Player.def = Player.baseDef;
        Player.hit = Player.baseHit;
        Player.dodge = Player.baseDodge;
        Player.crit = Player.baseCrit;
        Player.critDmg = Player.baseCritDmg;
        Player.speed = Player.baseSpeed;
        let bonusHp = 0, bonusMp = 0;

        // Add equipment stats
        for (const slot in Player.equipment) {
            const item = Player.equipment[slot];
            if (!item) continue;
            if (item.stats) {
                Player.atk += item.stats.atk || 0;
                Player.def += item.stats.def || 0;
                Player.hit += item.stats.hit || 0;
                Player.dodge += item.stats.dodge || 0;
                Player.crit += item.stats.crit || 0;
                Player.speed += item.stats.speed || 0;
                bonusHp += item.stats.hp || 0;
                bonusMp += item.stats.mp || 0;
            }
            if (item.bonusStats) {
                Player.atk += item.bonusStats.atk || 0;
                Player.def += item.bonusStats.def || 0;
                Player.hit += item.bonusStats.hit || 0;
                Player.dodge += item.bonusStats.dodge || 0;
                Player.crit += item.bonusStats.crit || 0;
                Player.speed += item.bonusStats.speed || 0;
                bonusHp += item.bonusStats.hp || 0;
                bonusMp += item.bonusStats.mp || 0;
            }
        }

        // Apply level-based stats
        const classData = GameData.classes[Player.className];
        Player.maxHp = classData.baseHp + (Player.level - 1) * classData.hpPerLevel + bonusHp;
        Player.maxMp = classData.baseMp + (Player.level - 1) * classData.mpPerLevel + bonusMp;
        Player.hp = Math.min(Player.hp, Player.maxHp);
        Player.mp = Math.min(Player.mp, Player.maxMp);
    },

    sellItem(uid) {
        const item = Player.inventory.find(i => i.uid === uid);
        if (!item) return false;
        const price = this.getSellPrice(item);
        Player.gold += price;
        this.removeFromInventory(uid);
        GameUI.addLog(`出售了 ${item.name}，获得 ${price} 金币`, 'loot');
        GameUI.updateAllUI();
        return true;
    },

    getSellPrice(item) {
        const base = item.price || 10;
        return Math.floor(base * RARITY[item.rarity || 'COMMON'].mult * 0.4);
    },

    getItemDescription(item) {
        let desc = item.description || '';
        if (item.stats) {
            const statNames = {
                atk: '攻击', def: '防御', hp: '生命', mp: '法力',
                hit: '命中', dodge: '闪避', crit: '暴击', speed: '速度'
            };
            for (const key in item.stats) {
                if (item.stats[key] !== 0) {
                    desc += `\n${statNames[key] || key}: +${item.stats[key]}`;
                }
            }
        }
        if (item.bonusStats) {
            for (const key in item.bonusStats) {
                desc += `\n[附加] ${key}: +${item.bonusStats[key]}`;
            }
        }
        if (item.special) {
            desc += `\n★ ${item.special.name}: ${item.special.desc}`;
        }
        return desc;
    }
};

// ==========================================
// SECTION 5: Combat System
// ==========================================
const CombatSystem = {
    enemy: null,
    isPlayerTurn: true,
    combatActive: false,
    turnNumber: 0,
    fled: false,

    startCombat(monster) {
        this.enemy = monster;
        this.isPlayerTurn = Player.speed >= monster.speed;
        this.combatActive = true;
        this.turnNumber = 0;
        this.fled = false;

        Game.state = 'combat';

        // Switch screens
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('combat-screen').classList.add('active');

        console.log('[Combat] started vs', monster.name);

        GameUI.updateCombatUI();
        GameUI.clearCombatLog();
        GameUI.addCombatLog(`遭遇了 ${monster.name} (Lv.${monster.level})！`, 'info');

        if (monster.isBoss) {
            GameUI.addCombatLog(`⚠️ BOSS战！小心应对！`, 'critical');
        }

        if (!this.isPlayerTurn) {
            setTimeout(() => this.enemyTurn(), 800);
        }
    },

    endCombat(victory) {
        this.combatActive = false;
        document.getElementById('combat-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        Game.state = 'exploring';

        if (victory) {
            const exp = this.calculateExp();
            const gold = this.calculateGold();
            const loot = this.generateLoot();

            Game.totalKills++;
            Player.killCount[this.enemy.id] = (Player.killCount[this.enemy.id] || 0) + 1;

            // Check quest progress
            QuestSystem.onMonsterKill(this.enemy.id);

            // Remove entity from map
            const idx = Game.currentMap.entities.indexOf(this.enemy);
            if (idx !== -1) Game.currentMap.entities.splice(idx, 1);

            // Boss death callback
            if (this.enemy.onDeath) {
                this.enemy.onDeath();
            }

            // Show loot overlay
            GameUI.showLoot(exp, gold, loot);

            // Grant rewards
            Player.gold += gold;
            Game.totalGold += gold;
            this.grantExp(exp);

            for (const item of loot) {
                if (item.type === 'gold') {
                    Player.gold += item.amount;
                } else {
                    ItemSystem.addToInventory(item);
                }
            }

            GameUI.addLog(`击败了 ${this.enemy.name}！获得 ${exp} 经验，${gold} 金币`, 'combat');
        } else if (this.fled) {
            GameUI.addLog('成功逃跑了！', 'system');
        }

        this.enemy = null;
        GameUI.updateAllUI();
    },

    playerAttack() {
        if (!this.isPlayerTurn || !this.combatActive) return;
        this.isPlayerTurn = false;

        const result = this.calculateAttack(Player, this.enemy);
        this.applyAttackResult(result, Player, this.enemy);

        if (result.hit) {
            GameUI.addCombatLog(
                `你对 ${this.enemy.name} 造成了 ${result.damage} 点伤害${result.critical ? ' (暴击！)' : ''}`,
                result.critical ? 'critical' : 'player-action'
            );
            GameUI.showCombatEffect('⚔️', 'enemy');

            // Check special weapon effects
            this.checkSpecialEffects(Player, this.enemy, result);
        } else {
            GameUI.addCombatLog(`你的攻击被 ${this.enemy.name} 闪避了！`, 'info');
        }

        this.checkCombatEnd();
    },

    playerSkill(skillId) {
        if (!this.isPlayerTurn || !this.combatActive) return;

        const skill = Player.learnedSkills.find(s => s.id === skillId);
        if (!skill) return;
        if (Player.mp < skill.mpCost) {
            GameUI.notify('法力不足！', 'warning');
            return;
        }

        this.isPlayerTurn = false;
        Player.mp -= skill.mpCost;

        switch (skill.type) {
            case 'damage': {
                const baseDmg = skill.power + Player.atk * (skill.atkScale || 0.5);
                const result = this.calculateSkillDamage(baseDmg, Player, this.enemy, skill);
                this.enemy.hp -= result.damage;
                GameUI.addCombatLog(
                    `使用 ${skill.name}，对 ${this.enemy.name} 造成 ${result.damage} 点${skill.element || ''}伤害！`,
                    'player-action'
                );
                GameUI.showCombatEffect(skill.icon || '✨', 'enemy');

                if (skill.statusEffect) {
                    if (Utils.chance(skill.statusChance || 30)) {
                        this.applyStatus(this.enemy, skill.statusEffect, skill.statusDuration || 3);
                        GameUI.addCombatLog(`${this.enemy.name} 被施加了 ${STATUS[skill.statusEffect].name}！`, 'info');
                    }
                }
                break;
            }
            case 'heal': {
                const healAmt = Math.floor(skill.power + Player.maxHp * (skill.healScale || 0.2));
                Player.hp = Math.min(Player.maxHp, Player.hp + healAmt);
                GameUI.addCombatLog(`使用 ${skill.name}，恢复了 ${healAmt} 点生命！`, 'player-action');
                GameUI.showCombatEffect('💚', 'player');
                break;
            }
            case 'buff': {
                this.applyStatus(Player, skill.statusEffect, skill.statusDuration || 3);
                GameUI.addCombatLog(`使用 ${skill.name}，获得了 ${STATUS[skill.statusEffect].name} 效果！`, 'player-action');
                GameUI.showCombatEffect(STATUS[skill.statusEffect].icon, 'player');
                break;
            }
            case 'debuff': {
                if (Utils.chance(skill.statusChance || 50)) {
                    this.applyStatus(this.enemy, skill.statusEffect, skill.statusDuration || 3);
                    GameUI.addCombatLog(`使用 ${skill.name}，${this.enemy.name} 被施加了 ${STATUS[skill.statusEffect].name}！`, 'player-action');
                } else {
                    GameUI.addCombatLog(`使用 ${skill.name}，但没有生效！`, 'info');
                }
                break;
            }
            case 'aoe': {
                const baseDmg = skill.power + Player.atk * (skill.atkScale || 0.3);
                const result = this.calculateSkillDamage(baseDmg, Player, this.enemy, skill);
                this.enemy.hp -= result.damage;
                GameUI.addCombatLog(`使用 ${skill.name}，造成 ${result.damage} 点伤害！`, 'player-action');
                GameUI.showCombatEffect(skill.icon || '💥', 'enemy');
                break;
            }
            case 'drain': {
                const baseDmg = skill.power + Player.atk * (skill.atkScale || 0.4);
                const result = this.calculateSkillDamage(baseDmg, Player, this.enemy, skill);
                this.enemy.hp -= result.damage;
                const healAmt = Math.floor(result.damage * (skill.drainPercent || 0.5));
                Player.hp = Math.min(Player.maxHp, Player.hp + healAmt);
                GameUI.addCombatLog(`使用 ${skill.name}，造成 ${result.damage} 伤害，恢复 ${healAmt} 生命！`, 'player-action');
                GameUI.showCombatEffect('🩸', 'enemy');
                break;
            }
        }

        this.checkCombatEnd();
    },

    playerDefend() {
        if (!this.isPlayerTurn || !this.combatActive) return;
        this.isPlayerTurn = false;

        this.applyStatus(Player, 'SHIELD', 1);
        // Also heal a tiny bit
        const healAmt = Math.floor(Player.maxHp * 0.05);
        Player.hp = Math.min(Player.maxHp, Player.hp + healAmt);

        GameUI.addCombatLog(`你进入防御姿态，防御提升并恢复了 ${healAmt} 生命`, 'player-action');
        this.checkCombatEnd();
    },

    playerFlee() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        if (this.enemy.isBoss) {
            GameUI.addCombatLog('无法从BOSS战中逃跑！', 'info');
            return;
        }

        const fleeChance = 40 + (Player.speed - this.enemy.speed) * 3;
        if (Utils.chance(fleeChance)) {
            this.fled = true;
            this.endCombat(false);
        } else {
            this.isPlayerTurn = false;
            GameUI.addCombatLog('逃跑失败！', 'info');
            this.checkCombatEnd();
        }
    },

    playerUseItem(uid) {
        if (!this.isPlayerTurn || !this.combatActive) return;
        const item = Player.inventory.find(i => i.uid === uid);
        if (!item || item.type !== 'consumable') return;

        const used = ItemSystem.useItem(item);
        if (used) {
            this.isPlayerTurn = false;
            this.checkCombatEnd();
        }
    },

    enemyTurn() {
        if (!this.combatActive || this.isPlayerTurn) return;

        // Process enemy status effects
        const canAct = this.processStatusEffects(this.enemy);
        if (!canAct) {
            GameUI.addCombatLog(`${this.enemy.name} 无法行动！`, 'info');
            this.turnNumber++;
            this.isPlayerTurn = true;
            this.processStatusEffects(Player);
            GameUI.updateCombatUI();
            return;
        }

        // Enemy AI
        const action = this.enemyAI();

        switch (action.type) {
            case 'attack': {
                const result = this.calculateAttack(this.enemy, Player);
                this.applyAttackResult(result, this.enemy, Player);
                if (result.hit) {
                    GameUI.addCombatLog(
                        `${this.enemy.name} 对你造成了 ${result.damage} 点伤害${result.critical ? ' (暴击！)' : ''}`,
                        result.critical ? 'critical' : 'enemy-action'
                    );
                    GameUI.showCombatEffect('💥', 'player');
                } else {
                    GameUI.addCombatLog(`${this.enemy.name} 的攻击被你闪避了！`, 'info');
                }
                break;
            }
            case 'skill': {
                const skill = action.skill;
                this.enemy.mp -= skill.mpCost || 0;
                const baseDmg = skill.power + this.enemy.atk * (skill.atkScale || 0.5);
                const result = this.calculateSkillDamage(baseDmg, this.enemy, Player, skill);

                if (skill.type === 'heal') {
                    const healAmt = Math.floor(skill.power + this.enemy.maxHp * 0.15);
                    this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + healAmt);
                    GameUI.addCombatLog(`${this.enemy.name} 使用了 ${skill.name}，恢复了 ${healAmt} 生命！`, 'enemy-action');
                } else {
                    Player.hp -= result.damage;
                    GameUI.addCombatLog(`${this.enemy.name} 使用了 ${skill.name}，造成 ${result.damage} 点伤害！`, 'enemy-action');
                    if (skill.statusEffect && Utils.chance(skill.statusChance || 25)) {
                        this.applyStatus(Player, skill.statusEffect, skill.statusDuration || 2);
                        GameUI.addCombatLog(`你被施加了 ${STATUS[skill.statusEffect].name}！`, 'critical');
                    }
                }
                break;
            }
        }

        this.turnNumber++;
        this.isPlayerTurn = true;
        this.checkCombatEnd();
    },

    enemyAI() {
        const enemy = this.enemy;
        const hpPercent = enemy.hp / enemy.maxHp;

        // Boss special behavior
        if (enemy.isBoss && enemy.skills.length > 0) {
            // Use heal if low HP
            if (hpPercent < 0.3) {
                const healSkill = enemy.skills.find(s => s.type === 'heal');
                if (healSkill && enemy.mp >= (healSkill.mpCost || 0)) {
                    return { type: 'skill', skill: healSkill };
                }
            }
            // Use skills more often
            if (Utils.chance(60) && enemy.skills.length > 0) {
                const usableSkills = enemy.skills.filter(s => enemy.mp >= (s.mpCost || 0));
                if (usableSkills.length > 0) {
                    return { type: 'skill', skill: Utils.pick(usableSkills) };
                }
            }
        }

        // Regular monster AI
        if (enemy.skills.length > 0 && Utils.chance(35)) {
            const usableSkills = enemy.skills.filter(s => enemy.mp >= (s.mpCost || 0));
            if (usableSkills.length > 0) {
                return { type: 'skill', skill: Utils.pick(usableSkills) };
            }
        }

        return { type: 'attack' };
    },

    calculateAttack(attacker, defender) {
        // Hit check
        let hitChance = attacker.hit - defender.dodge;
        // Check blind status
        const blindStatus = attacker.statusEffects?.find(s => s.id === 'BLIND');
        if (blindStatus) hitChance -= 30;

        if (!Utils.chance(hitChance)) {
            return { hit: false, damage: 0, critical: false };
        }

        // Base damage
        let damage = attacker.atk * Utils.randFloat(0.85, 1.15);

        // Defense reduction
        const defReduction = defender.def / (defender.def + 50);
        damage *= (1 - defReduction);

        // Check berserk
        const berserk = attacker.statusEffects?.find(s => s.id === 'BERSERK');
        if (berserk) damage *= 1.4;

        // Check weaken
        const weaken = attacker.statusEffects?.find(s => s.id === 'WEAKEN');
        if (weaken) damage *= 0.7;

        // Check shield on defender
        const shield = defender.statusEffects?.find(s => s.id === 'SHIELD');
        if (shield) damage *= 0.5;

        // Critical hit
        let critical = false;
        if (Utils.chance(attacker.crit || 5)) {
            critical = true;
            damage *= (attacker.critDmg || 150) / 100;
        }

        damage = Math.max(1, Math.floor(damage));
        return { hit: true, damage, critical };
    },

    calculateSkillDamage(baseDmg, attacker, defender, skill) {
        let damage = baseDmg * Utils.randFloat(0.9, 1.1);

        // Element effectiveness
        if (skill.element) {
            const effectiveness = this.getElementEffectiveness(skill.element, defender.element);
            damage *= effectiveness;
        }

        // Defense reduction (skills have partial armor penetration)
        const defReduction = defender.def / (defender.def + 80);
        damage *= (1 - defReduction * 0.7);

        damage = Math.max(1, Math.floor(damage));
        return { damage };
    },

    getElementEffectiveness(atkElement, defElement) {
        const chart = {
            [ELEMENT.FIRE]: { [ELEMENT.ICE]: 1.5, [ELEMENT.FIRE]: 0.5, [ELEMENT.WATER]: 0.5 },
            [ELEMENT.ICE]: { [ELEMENT.LIGHTNING]: 1.5, [ELEMENT.ICE]: 0.5, [ELEMENT.FIRE]: 0.5 },
            [ELEMENT.LIGHTNING]: { [ELEMENT.WATER]: 1.5, [ELEMENT.LIGHTNING]: 0.5, [ELEMENT.ICE]: 0.5 },
            [ELEMENT.POISON]: { [ELEMENT.HOLY]: 0.5 },
            [ELEMENT.HOLY]: { [ELEMENT.DARK]: 1.5, [ELEMENT.HOLY]: 0.5 },
            [ELEMENT.DARK]: { [ELEMENT.HOLY]: 0.5, [ELEMENT.DARK]: 0.5 }
        };
        return chart[atkElement]?.[defElement] || 1.0;
    },

    applyAttackResult(result, attacker, defender) {
        if (result.hit) {
            defender.hp -= result.damage;
            defender.hp = Math.max(0, defender.hp);
        }
        GameUI.updateCombatUI();
    },

    applyStatus(target, statusId, duration) {
        const existing = target.statusEffects.find(s => s.id === statusId);
        if (existing) {
            existing.duration = Math.max(existing.duration, duration);
            return;
        }
        const statusData = STATUS[statusId];
        if (!statusData) return;
        target.statusEffects.push({
            id: statusId,
            ...statusData,
            duration,
            isDebuff: ['POISON', 'BURN', 'FREEZE', 'STUN', 'BLEED', 'BLIND', 'SLOW', 'WEAKEN'].includes(statusId)
        });
    },

    processStatusEffects(target) {
        let canAct = true;
        const toRemove = [];

        for (const effect of target.statusEffects) {
            // Tick damage
            if (effect.tickDmg) {
                const dmg = Math.floor(target.maxHp * effect.tickDmg);
                target.hp = Math.max(1, target.hp - dmg);
                const name = target === Player ? '你' : target.name;
                GameUI.addCombatLog(`${name} 受到 ${effect.name} 效果，损失 ${dmg} 生命`, 'info');
            }
            // Tick heal
            if (effect.tickHeal) {
                const heal = Math.floor(target.maxHp * effect.tickHeal);
                target.hp = Math.min(target.maxHp, target.hp + heal);
            }
            // Skip turn
            if (effect.skipTurn) {
                canAct = false;
            }

            effect.duration--;
            if (effect.duration <= 0) {
                toRemove.push(effect);
            }
        }

        for (const effect of toRemove) {
            const idx = target.statusEffects.indexOf(effect);
            if (idx !== -1) target.statusEffects.splice(idx, 1);
        }

        return canAct;
    },

    checkSpecialEffects(attacker, defender, result) {
        if (attacker !== Player) return;
        const weapon = Player.equipment.weapon;
        if (!weapon || !weapon.special) return;

        const special = weapon.special;
        switch (special.type) {
            case 'lifesteal': {
                const heal = Math.floor(result.damage * special.value);
                Player.hp = Math.min(Player.maxHp, Player.hp + heal);
                if (heal > 0) GameUI.addCombatLog(`生命汲取恢复了 ${heal} 生命`, 'info');
                break;
            }
            case 'manasteal': {
                const mana = Math.floor(result.damage * special.value);
                Player.mp = Math.min(Player.maxMp, Player.mp + mana);
                break;
            }
            case 'doubleStrike': {
                if (Utils.chance(special.value * 100)) {
                    const result2 = this.calculateAttack(Player, defender);
                    if (result2.hit) {
                        defender.hp -= result2.damage;
                        GameUI.addCombatLog(`连击！额外造成 ${result2.damage} 伤害！`, 'critical');
                    }
                }
                break;
            }
            case 'elementBurst': {
                if (result.critical) {
                    const burstDmg = Math.floor(result.damage * special.value);
                    defender.hp -= burstDmg;
                    GameUI.addCombatLog(`元素爆发！额外造成 ${burstDmg} 伤害！`, 'critical');
                }
                break;
            }
        }
    },

    checkCombatEnd() {
        GameUI.updateCombatUI();

        if (this.enemy && this.enemy.hp <= 0) {
            GameUI.addCombatLog(`${this.enemy.name} 被击败了！`, 'critical');
            setTimeout(() => this.endCombat(true), 1000);
            return;
        }

        if (Player.hp <= 0) {
            GameUI.addCombatLog('你倒下了...', 'critical');
            setTimeout(() => {
                this.combatActive = false;
                document.getElementById('combat-screen').classList.remove('active');
                GameEngine.gameOver();
            }, 1000);
            return;
        }

        if (this.isPlayerTurn) {
            // Process player status effects at start of turn
            const canAct = this.processStatusEffects(Player);
            if (!canAct) {
                GameUI.addCombatLog('你无法行动！', 'info');
                this.isPlayerTurn = false;
                setTimeout(() => this.enemyTurn(), 800);
            }
            GameUI.updateCombatUI();
        } else {
            setTimeout(() => this.enemyTurn(), 800);
        }
    },

    calculateExp() {
        let exp = this.enemy.exp;
        // Exp bonus from equipment
        for (const slot in Player.equipment) {
            const item = Player.equipment[slot];
            if (item?.special?.type === 'expBonus') {
                exp = Math.floor(exp * (1 + item.special.value));
            }
        }
        return exp;
    },

    calculateGold() {
        let gold = this.enemy.gold + Utils.rand(0, Math.floor(this.enemy.gold * 0.3));
        for (const slot in Player.equipment) {
            const item = Player.equipment[slot];
            if (item?.special?.type === 'goldBonus') {
                gold = Math.floor(gold * (1 + item.special.value));
            }
        }
        return gold;
    },

    generateLoot() {
        const loot = [];
        if (this.enemy.loot) {
            for (const drop of this.enemy.loot) {
                if (Utils.chance(drop.chance)) {
                    const rarity = MapGenerator.rollRarity(Game.floor);
                    const template = GameData.items[drop.itemId];
                    if (template) {
                        loot.push(ItemSystem.createItem(template, rarity));
                    }
                }
            }
        }
        // Boss guaranteed legendary
        if (this.enemy.isBoss) {
            const bossLoot = GameData.getBossLoot(Game.floor);
            if (bossLoot) {
                loot.push(ItemSystem.createItem(bossLoot, 'LEGENDARY'));
            }
        }
        return loot;
    },

    grantExp(amount) {
        Player.exp += amount;
        while (Player.exp >= Player.expToNext && Player.level < MAX_LEVEL) {
            Player.exp -= Player.expToNext;
            Player.level++;
            Player.skillPoints += 2;
            Player.statPoints += 3;

            const classData = GameData.classes[Player.className];
            Player.baseAtk += classData.atkPerLevel;
            Player.baseDef += classData.defPerLevel;
            Player.baseSpeed += 1;
            Player.expToNext = Math.floor(100 * Math.pow(1.15, Player.level - 1));

            ItemSystem.recalcStats();
            Player.hp = Player.maxHp;
            Player.mp = Player.maxMp;

            // Learn new skills
            const newSkills = GameData.getSkillsAtLevel(Player.className, Player.level);
            for (const skill of newSkills) {
                if (!Player.learnedSkills.find(s => s.id === skill.id)) {
                    Player.learnedSkills.push(Utils.deepClone(skill));
                    GameUI.notify(`学会了新技能：${skill.name}！`, 'success');
                }
            }

            GameUI.showLevelUp(Player.level);
            GameUI.addLog(`升级到 Lv.${Player.level}！`, 'system');
        }
    }
};

// ==========================================
// SECTION 6: Quest System
// ==========================================
const QuestSystem = {
    availableQuests: [],

    initQuests(floor) {
        const floorQuests = GameData.getQuestsByFloor(floor);
        for (const q of floorQuests) {
            if (!Player.completedQuests.includes(q.id) && !Player.questLog.find(ql => ql.id === q.id)) {
                this.availableQuests.push(Utils.deepClone(q));
            }
        }
    },

    acceptQuest(questId) {
        const quest = this.availableQuests.find(q => q.id === questId);
        if (!quest) return false;
        if (Player.questLog.length >= 10) {
            GameUI.notify('任务日志已满！', 'warning');
            return false;
        }

        quest.progress = {};
        for (const obj of quest.objectives) {
            quest.progress[obj.id] = 0;
        }

        Player.questLog.push(quest);
        this.availableQuests = this.availableQuests.filter(q => q.id !== questId);
        GameUI.addLog(`接受了任务：${quest.name}`, 'quest');
        GameUI.notify(`新任务：${quest.name}`, 'info');
        return true;
    },

    onMonsterKill(monsterId) {
        for (const quest of Player.questLog) {
            for (const obj of quest.objectives) {
                if (obj.type === 'kill' && obj.target === monsterId) {
                    quest.progress[obj.id] = Math.min(
                        (quest.progress[obj.id] || 0) + 1,
                        obj.count
                    );
                    if (quest.progress[obj.id] >= obj.count) {
                        GameUI.notify(`任务目标完成：${obj.description}`, 'success');
                    }
                }
            }
            this.checkQuestComplete(quest);
        }
    },

    onItemCollect(itemId) {
        for (const quest of Player.questLog) {
            for (const obj of quest.objectives) {
                if (obj.type === 'collect' && obj.target === itemId) {
                    const count = Player.inventory.filter(i => i.id === itemId)
                        .reduce((sum, i) => sum + (i.quantity || 1), 0);
                    quest.progress[obj.id] = Math.min(count, obj.count);
                }
            }
            this.checkQuestComplete(quest);
        }
    },

    onFloorReach(floor) {
        for (const quest of Player.questLog) {
            for (const obj of quest.objectives) {
                if (obj.type === 'reach' && obj.target <= floor) {
                    quest.progress[obj.id] = obj.count;
                }
            }
            this.checkQuestComplete(quest);
        }
    },

    checkQuestComplete(quest) {
        const allDone = quest.objectives.every(obj =>
            (quest.progress[obj.id] || 0) >= obj.count
        );
        if (allDone && !quest.completed) {
            quest.completed = true;
            this.completeQuest(quest);
        }
    },

    completeQuest(quest) {
        // Grant rewards
        if (quest.rewards) {
            if (quest.rewards.exp) {
                CombatSystem.grantExp(quest.rewards.exp);
                GameUI.addLog(`任务奖励：${quest.rewards.exp} 经验`, 'quest');
            }
            if (quest.rewards.gold) {
                Player.gold += quest.rewards.gold;
                GameUI.addLog(`任务奖励：${quest.rewards.gold} 金币`, 'quest');
            }
            if (quest.rewards.items) {
                for (const itemData of quest.rewards.items) {
                    const template = GameData.items[itemData.id];
                    if (template) {
                        const item = ItemSystem.createItem(template, itemData.rarity || 'UNCOMMON');
                        ItemSystem.addToInventory(item);
                        GameUI.addLog(`任务奖励：${item.name}`, 'quest');
                    }
                }
            }
        }

        Player.completedQuests.push(quest.id);
        Player.questLog = Player.questLog.filter(q => q.id !== quest.id);
        GameUI.notify(`任务完成：${quest.name}！`, 'success');
        GameUI.addLog(`完成了任务：${quest.name}`, 'quest');
        GameUI.updateAllUI();
    }
};

// ==========================================
// SECTION 7: Visibility & FOV System
// ==========================================
const FOVSystem = {
    radius: 8,

    update() {
        const map = Game.currentMap;
        if (!map) return;

        // Clear visibility
        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                map.visible[y][x] = false;
            }
        }

        // Simple raycasting FOV
        const px = Player.x, py = Player.y;
        const steps = 360;

        for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            let x = px + 0.5;
            let y = py + 0.5;

            for (let d = 0; d < this.radius; d++) {
                const tileX = Math.floor(x);
                const tileY = Math.floor(y);

                if (tileX < 0 || tileX >= MAP_COLS || tileY < 0 || tileY >= MAP_ROWS) break;

                map.visible[tileY][tileX] = true;
                map.explored[tileY][tileX] = true;

                if (map.tiles[tileY][tileX] === TILE.WALL) break;

                x += dx;
                y += dy;
            }
        }
    }
};

// ==========================================
// SECTION 8: Save/Load System
// ==========================================
const SaveSystem = {
    save() {
        const saveData = {
            version: 2,
            timestamp: Date.now(),
            player: {
                name: Player.name,
                className: Player.className,
                level: Player.level,
                exp: Player.exp,
                expToNext: Player.expToNext,
                gold: Player.gold,
                hp: Player.hp, maxHp: Player.maxHp,
                mp: Player.mp, maxMp: Player.maxMp,
                baseAtk: Player.baseAtk, baseDef: Player.baseDef,
                baseHit: Player.baseHit, baseDodge: Player.baseDodge,
                baseCrit: Player.baseCrit, baseCritDmg: Player.baseCritDmg,
                baseSpeed: Player.baseSpeed,
                skillPoints: Player.skillPoints,
                statPoints: Player.statPoints,
                equipment: Player.equipment,
                inventory: Player.inventory,
                learnedSkills: Player.learnedSkills,
                statusEffects: [],
                questLog: Player.questLog,
                completedQuests: Player.completedQuests,
                killCount: Player.killCount,
                flags: Player.flags,
                x: Player.x, y: Player.y
            },
            game: {
                floor: Game.floor,
                turnCount: Game.turnCount,
                totalKills: Game.totalKills,
                totalGold: Game.totalGold,
                totalSteps: Game.totalSteps,
                playTime: Game.playTime + (Date.now() - Game.playStartTime) / 1000
            },
            map: {
                tiles: Game.currentMap.tiles,
                rooms: Game.currentMap.rooms,
                entities: Game.currentMap.entities.map(e => ({
                    ...e, onDeath: undefined
                })),
                items: Game.currentMap.items,
                explored: Game.currentMap.explored
            }
        };

        try {
            localStorage.setItem('shadowDungeonSave', JSON.stringify(saveData));
            GameUI.notify('游戏已保存！', 'success');
            GameUI.addLog('游戏已保存', 'system');
            return true;
        } catch (e) {
            GameUI.notify('保存失败！', 'error');
            return false;
        }
    },

    load() {
        try {
            const data = localStorage.getItem('shadowDungeonSave');
            if (!data) return false;

            const saveData = JSON.parse(data);
            if (!saveData.version) return false;

            // Restore player
            Object.assign(Player, saveData.player);
            Player.discoveredRooms = new Set();
            Player.visitedFloors = new Set();

            // Restore game state
            Game.floor = saveData.game.floor;
            Game.turnCount = saveData.game.turnCount;
            Game.totalKills = saveData.game.totalKills;
            Game.totalGold = saveData.game.totalGold;
            Game.totalSteps = saveData.game.totalSteps;
            Game.playTime = saveData.game.playTime;

            // Restore map
            Game.currentMap = {
                floor: Game.floor,
                tiles: saveData.map.tiles,
                rooms: saveData.map.rooms,
                entities: saveData.map.entities,
                items: saveData.map.items,
                explored: saveData.map.explored,
                visible: [],
                width: MAP_COLS,
                height: MAP_ROWS
            };

            // Initialize visible array
            for (let y = 0; y < MAP_ROWS; y++) {
                Game.currentMap.visible[y] = [];
                for (let x = 0; x < MAP_COLS; x++) {
                    Game.currentMap.visible[y][x] = false;
                }
            }

            ItemSystem.recalcStats();
            return true;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    },

    hasSave() {
        return localStorage.getItem('shadowDungeonSave') !== null;
    },

    deleteSave() {
        localStorage.removeItem('shadowDungeonSave');
    }
};

// ==========================================
// SECTION 9: Renderer
// ==========================================
const Renderer = {
    tileColors: {
        [TILE.FLOOR]: '#1a1a2e',
        [TILE.WALL]: '#2a2a3e',
        [TILE.DOOR]: '#4a3a2a',
        [TILE.STAIRS_DOWN]: '#2244aa',
        [TILE.STAIRS_UP]: '#22aa44',
        [TILE.CHEST]: '#aa8822',
        [TILE.TRAP]: '#1a1a2e',
        [TILE.WATER]: '#1a3a5a',
        [TILE.LAVA]: '#5a1a0a',
        [TILE.SHOP]: '#3a2a4a',
        [TILE.FORGE]: '#4a2a1a',
        [TILE.PILLAR]: '#3a3a4e',
        [TILE.GRASS]: '#1a2a1a',
        [TILE.CRYSTAL]: '#2a1a3a',
        [TILE.PORTAL]: '#4a1a6a',
        [TILE.BOSS_DOOR]: '#5a1a1a'
    },

    tileIcons: {
        [TILE.STAIRS_DOWN]: '🔽',
        [TILE.STAIRS_UP]: '🔼',
        [TILE.CHEST]: '📦',
        [TILE.TRAP]: '⚠️',
        [TILE.SHOP]: '🏪',
        [TILE.FORGE]: '🔨',
        [TILE.CRYSTAL]: '💎',
        [TILE.PORTAL]: '🌀',
        [TILE.BOSS_DOOR]: '🚪',
        [TILE.DOOR]: '🚪'
    },

    init() {
        Game.canvas = document.getElementById('game-canvas');
        Game.ctx = Game.canvas.getContext('2d');
        Game.minimapCanvas = document.getElementById('minimap-canvas');
        Game.minimapCtx = Game.minimapCanvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        const container = document.getElementById('game-canvas-container');
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        Game.canvas.width = w;
        Game.canvas.height = h;
    },

    render() {
        const ctx = Game.ctx;
        const canvas = Game.canvas;
        const map = Game.currentMap;
        if (!ctx || !map) return;

        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate camera
        const viewW = canvas.width;
        const viewH = canvas.height;
        Game.camera.x = Player.x * TILE_SIZE - viewW / 2 + TILE_SIZE / 2;
        Game.camera.y = Player.y * TILE_SIZE - viewH / 2 + TILE_SIZE / 2;

        const startCol = Math.max(0, Math.floor(Game.camera.x / TILE_SIZE));
        const startRow = Math.max(0, Math.floor(Game.camera.y / TILE_SIZE));
        const endCol = Math.min(MAP_COLS, Math.ceil((Game.camera.x + viewW) / TILE_SIZE) + 1);
        const endRow = Math.min(MAP_ROWS, Math.ceil((Game.camera.y + viewH) / TILE_SIZE) + 1);

        // Draw tiles
        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                const screenX = x * TILE_SIZE - Game.camera.x;
                const screenY = y * TILE_SIZE - Game.camera.y;
                const tile = map.tiles[y][x];

                if (map.visible[y][x]) {
                    // Visible tile
                    ctx.fillStyle = this.tileColors[tile] || '#1a1a2e';
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                    // Wall shading
                    if (tile === TILE.WALL) {
                        ctx.fillStyle = 'rgba(0,0,0,0.3)';
                        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                        // Wall border
                        ctx.strokeStyle = '#3a3a5e';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(screenX + 0.5, screenY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
                    }

                    // Floor pattern
                    if (tile === TILE.FLOOR) {
                        if ((x + y) % 2 === 0) {
                            ctx.fillStyle = 'rgba(255,255,255,0.02)';
                            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                        }
                    }

                    // Tile icons
                    if (this.tileIcons[tile]) {
                        ctx.font = `${TILE_SIZE - 8}px serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(this.tileIcons[tile], screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);
                    }

                    // Opened chest
                    if (tile === TILE.CHEST) {
                        const chestData = map.items.find(i => i.x === x && i.y === y);
                        if (chestData && chestData.opened) {
                            ctx.fillStyle = 'rgba(0,0,0,0.5)';
                            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                        }
                    }

                    // Trap (hidden until stepped on or detected)
                    if (tile === TILE.TRAP) {
                        // Only show if player has high perception or has triggered it
                        if (Player.className === 'rogue' || Utils.manhattan(Player.x, Player.y, x, y) <= 2) {
                            ctx.font = `${TILE_SIZE - 12}px serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.globalAlpha = 0.5;
                            ctx.fillText('⚠️', screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);
                            ctx.globalAlpha = 1;
                        }
                    }

                    // Water/Lava animation
                    if (tile === TILE.WATER || tile === TILE.LAVA) {
                        const wave = Math.sin(Date.now() / 500 + x + y) * 0.1 + 0.1;
                        ctx.fillStyle = tile === TILE.WATER ?
                            `rgba(68,136,255,${wave})` : `rgba(255,100,30,${wave})`;
                        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                    }

                } else if (map.explored[y][x]) {
                    // Explored but not visible (fog of war)
                    ctx.fillStyle = this.tileColors[tile] || '#1a1a2e';
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                    if (tile === TILE.WALL) {
                        ctx.strokeStyle = '#222233';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(screenX + 0.5, screenY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
                    }
                }
            }
        }

        // Draw entities
        for (const entity of map.entities) {
            if (!map.visible[entity.y]?.[entity.x]) continue;
            const screenX = entity.x * TILE_SIZE - Game.camera.x;
            const screenY = entity.y * TILE_SIZE - Game.camera.y;

            if (entity.type === 'monster') {
                // Monster background
                ctx.fillStyle = entity.isBoss ? 'rgba(255,0,0,0.2)' : 'rgba(200,50,50,0.15)';
                ctx.beginPath();
                ctx.arc(screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2, TILE_SIZE / 2 - 2, 0, Math.PI * 2);
                ctx.fill();

                // Monster icon
                ctx.font = `${TILE_SIZE - 6}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(entity.icon, screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);

                // HP bar
                if (entity.hp < entity.maxHp) {
                    const barW = TILE_SIZE - 4;
                    const barH = 3;
                    const barX = screenX + 2;
                    const barY = screenY - 5;
                    ctx.fillStyle = '#401010';
                    ctx.fillRect(barX, barY, barW, barH);
                    ctx.fillStyle = '#e04040';
                    ctx.fillRect(barX, barY, barW * (entity.hp / entity.maxHp), barH);
                }

                // Boss indicator
                if (entity.isBoss) {
                    ctx.font = '10px serif';
                    ctx.fillText('👑', screenX + TILE_SIZE / 2, screenY - 10);
                }
            } else if (entity.type === 'npc') {
                ctx.fillStyle = 'rgba(68,136,255,0.15)';
                ctx.beginPath();
                ctx.arc(screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2, TILE_SIZE / 2 - 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.font = `${TILE_SIZE - 6}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(entity.icon, screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);

                // Quest indicator
                if (entity.quest) {
                    ctx.font = '12px serif';
                    ctx.fillText('❗', screenX + TILE_SIZE - 4, screenY);
                }
            }
        }

        // Draw player
        const playerScreenX = Player.x * TILE_SIZE - Game.camera.x;
        const playerScreenY = Player.y * TILE_SIZE - Game.camera.y;

        // Player glow
        ctx.fillStyle = 'rgba(68,221,136,0.15)';
        ctx.beginPath();
        ctx.arc(playerScreenX + TILE_SIZE / 2, playerScreenY + TILE_SIZE / 2, TILE_SIZE / 2 + 2, 0, Math.PI * 2);
        ctx.fill();

        // Player icon
        const classIcons = { warrior: '⚔️', mage: '🔮', rogue: '🗡️', paladin: '✨' };
        ctx.font = `${TILE_SIZE - 4}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            classIcons[Player.className] || '🧙',
            playerScreenX + TILE_SIZE / 2,
            playerScreenY + TILE_SIZE / 2
        );

        // Draw particles
        this.renderParticles(ctx);
    },

    renderParticles(ctx) {
        for (let i = Game.particles.length - 1; i >= 0; i--) {
            const p = Game.particles[i];
            p.life -= 0.02;
            if (p.life <= 0) {
                Game.particles.splice(i, 1);
                continue;
            }
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0;

            const screenX = p.x - Game.camera.x;
            const screenY = p.y - Game.camera.y;

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    },

    renderMinimap() {
        const ctx = Game.minimapCtx;
        const map = Game.currentMap;
        if (!ctx || !map) return;

        const canvas = Game.minimapCanvas;
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(canvas.width / MAP_COLS, canvas.height / MAP_ROWS);

        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                if (!map.explored[y][x]) continue;

                const tile = map.tiles[y][x];
                const sx = x * scale;
                const sy = y * scale;

                if (tile === TILE.WALL) {
                    ctx.fillStyle = map.visible[y][x] ? '#333355' : '#222233';
                } else if (tile === TILE.STAIRS_DOWN) {
                    ctx.fillStyle = '#4488ff';
                } else if (tile === TILE.STAIRS_UP) {
                    ctx.fillStyle = '#44dd88';
                } else if (tile === TILE.CHEST) {
                    ctx.fillStyle = '#ffdd00';
                } else if (tile === TILE.SHOP) {
                    ctx.fillStyle = '#ff8844';
                } else if (tile === TILE.PORTAL) {
                    ctx.fillStyle = '#aa55ff';
                } else if (tile === TILE.BOSS_DOOR) {
                    ctx.fillStyle = '#ff4455';
                } else {
                    ctx.fillStyle = map.visible[y][x] ? '#1a1a3e' : '#111122';
                }

                ctx.fillRect(sx, sy, scale, scale);
            }
        }

        // Draw entities on minimap
        for (const entity of map.entities) {
            if (!map.visible[entity.y]?.[entity.x]) continue;
            const sx = entity.x * scale;
            const sy = entity.y * scale;
            ctx.fillStyle = entity.type === 'monster' ?
                (entity.isBoss ? '#ff0000' : '#ee5555') : '#ff8844';
            ctx.fillRect(sx, sy, scale * 1.5, scale * 1.5);
        }

        // Draw player
        ctx.fillStyle = '#44dd88';
        ctx.fillRect(Player.x * scale - 1, Player.y * scale - 1, scale * 2 + 2, scale * 2 + 2);
    },

    spawnParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2,
                y: y * TILE_SIZE + TILE_SIZE / 2,
                vx: Utils.randFloat(-2, 2),
                vy: Utils.randFloat(-3, -0.5),
                gravity: 0.05,
                size: Utils.randFloat(2, 5),
                color: color,
                life: 1
            });
        }
    }
};

// ==========================================
// SECTION 10: Game Engine (Main Loop & Input)
// ==========================================
const GameEngine = {
    init() {
        Renderer.init();
        this.bindInput();
        this.setupStartScreen();

        // Check for save
        if (SaveSystem.hasSave()) {
            document.getElementById('btn-load-game').style.opacity = '1';
        } else {
            document.getElementById('btn-load-game').style.opacity = '0.4';
        }
    },

    setupStartScreen() {
        // New game button
        document.getElementById('btn-new-game').addEventListener('click', () => {
            document.querySelector('.start-menu').classList.add('hidden');
            document.getElementById('class-select').classList.remove('hidden');
        });

        // Load game button
        document.getElementById('btn-load-game').addEventListener('click', () => {
            if (SaveSystem.load()) {
                this.startGame(true);
            } else {
                GameUI.notify('没有找到存档！', 'warning');
            }
        });

        // How to play
        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            document.querySelector('.start-menu').classList.add('hidden');
            document.getElementById('how-to-play').classList.remove('hidden');
        });

        document.getElementById('btn-back-help').addEventListener('click', () => {
            document.getElementById('how-to-play').classList.add('hidden');
            document.querySelector('.start-menu').classList.remove('hidden');
        });

        // Class selection
        document.querySelectorAll('.class-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // Start adventure
        document.getElementById('btn-start-adventure').addEventListener('click', () => {
            const selectedClass = document.querySelector('.class-card.selected');
            if (!selectedClass) {
                GameUI.notify('请选择一个职业！', 'warning');
                return;
            }

            const className = selectedClass.dataset.class;
            const playerName = document.getElementById('player-name').value.trim() || '勇者';

            this.initNewGame(playerName, className);
            this.startGame(false);
        });
    },

    initNewGame(name, className) {
        const classData = GameData.classes[className];

        Player.name = name;
        Player.className = className;
        Player.level = 1;
        Player.exp = 0;
        Player.expToNext = 100;
        Player.gold = 50;
        Player.hp = classData.baseHp;
        Player.maxHp = classData.baseHp;
        Player.mp = classData.baseMp;
        Player.maxMp = classData.baseMp;
        Player.baseAtk = classData.baseAtk;
        Player.baseDef = classData.baseDef;
        Player.baseHit = classData.baseHit || 95;
        Player.baseDodge = classData.baseDodge || 5;
        Player.baseCrit = classData.baseCrit || 5;
        Player.baseCritDmg = 150;
        Player.baseSpeed = classData.baseSpeed || 10;
        Player.skillPoints = 0;
        Player.statPoints = 0;
        Player.equipment = {
            weapon: null, head: null, body: null,
            legs: null, feet: null,
            accessory1: null, accessory2: null
        };
        Player.inventory = [];
        Player.learnedSkills = [];
        Player.statusEffects = [];
        Player.questLog = [];
        Player.completedQuests = [];
        Player.discoveredRooms = new Set();
        Player.visitedFloors = new Set();
        Player.killCount = {};
        Player.flags = {};

        // Starting skills
        const startSkills = GameData.getStartingSkills(className);
        Player.learnedSkills = startSkills.map(s => Utils.deepClone(s));

        // Starting equipment
        const startEquip = GameData.getStartingEquipment(className);
        if (startEquip.weapon) {
            Player.equipment.weapon = ItemSystem.createItem(startEquip.weapon, 'COMMON');
        }
        if (startEquip.body) {
            Player.equipment.body = ItemSystem.createItem(startEquip.body, 'COMMON');
        }

        // Starting items
        const hpPotion = GameData.items['potion_hp_small'];
        if (hpPotion) {
            const potion = ItemSystem.createItem(hpPotion, 'COMMON');
            potion.quantity = 3;
            Player.inventory.push(potion);
        }
        const mpPotion = GameData.items['potion_mp_small'];
        if (mpPotion) {
            const potion = ItemSystem.createItem(mpPotion, 'COMMON');
            potion.quantity = 2;
            Player.inventory.push(potion);
        }

        ItemSystem.recalcStats();

        Game.floor = 1;
        Game.turnCount = 0;
        Game.totalKills = 0;
        Game.totalGold = 0;
        Game.totalSteps = 0;
        Game.playTime = 0;
    },

    startGame(isLoad) {
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        Game.state = 'exploring';
        Game.playStartTime = Date.now();
        // Defer resize to after layout reflow
        requestAnimationFrame(() => Renderer.resize());

        if (!isLoad) {
            this.generateFloor(1);
        }

        // Place player
        if (!isLoad) {
            const startRoom = Game.currentMap.rooms[0];
            Player.x = startRoom.cx;
            Player.y = startRoom.cy;
        }

        Player.visitedFloors.add(Game.floor);
        QuestSystem.initQuests(Game.floor);
        FOVSystem.update();
        GameUI.updateAllUI();
        GameUI.addLog(`${Player.name} 进入了地牢第 ${Game.floor} 层`, 'story');

        // Start game loop
        this.gameLoop();
    },

    generateFloor(floor) {
        Game.floor = floor;
        Game.currentMap = MapGenerator.generate(floor);
        QuestSystem.initQuests(floor);
        QuestSystem.onFloorReach(floor);
    },

    gameLoop() {
        if (Game.state === 'menu' || Game.state === 'gameover') return;

        const now = Date.now();
        const dt = now - (Game.lastUpdate || now);
        Game.lastUpdate = now;

        if (Game.state === 'exploring' && !Game.paused) {
            this.processInput(dt);
            Renderer.render();
        }
        requestAnimationFrame(() => this.gameLoop());
    },

    processInput(dt) {
        Game.moveTimer -= dt;
        if (Game.moveTimer > 0) return;

        let dx = 0, dy = 0;
        if (Game.keys['ArrowUp'] || Game.keys['KeyW']) { dy = -1; Player.facing = DIRECTION.UP; }
        else if (Game.keys['ArrowDown'] || Game.keys['KeyS']) { dy = 1; Player.facing = DIRECTION.DOWN; }
        else if (Game.keys['ArrowLeft'] || Game.keys['KeyA']) { dx = -1; Player.facing = DIRECTION.LEFT; }
        else if (Game.keys['ArrowRight'] || Game.keys['KeyD']) { dx = 1; Player.facing = DIRECTION.RIGHT; }

        if (dx !== 0 || dy !== 0) {
            this.movePlayer(dx, dy);
            Game.moveTimer = Game.moveCooldown;
        }
    },

    movePlayer(dx, dy) {
        const newX = Player.x + dx;
        const newY = Player.y + dy;
        const map = Game.currentMap;

        if (newX < 0 || newX >= MAP_COLS || newY < 0 || newY >= MAP_ROWS) return;

        const tile = map.tiles[newY][newX];

        // Check for entities at target
        const entity = map.entities.find(e => e.x === newX && e.y === newY);
        if (entity) {
            if (entity.type === 'monster') {
                CombatSystem.startCombat(entity);
                return;
            } else if (entity.type === 'npc') {
                this.interactNPC(entity);
                return;
            }
        }

        // Check walkability
        if (tile === TILE.WALL || tile === TILE.PILLAR) return;
        if (tile === TILE.BOSS_DOOR) {
            // Check if player wants to enter boss room
            GameUI.addLog('你站在BOSS房间门前...', 'story');
        }

        // Move
        Player.x = newX;
        Player.y = newY;
        Game.totalSteps++;
        Game.turnCount++;

        // Update FOV
        FOVSystem.update();

        // Check tile effects
        this.checkTileEffect(newX, newY);

        // Update interaction prompt
        this.checkInteraction();

        // Auto-save every 50 steps
        if (Game.settings.autoSave && Game.totalSteps % 50 === 0) {
            SaveSystem.save();
        }

        GameUI.updateAllUI();
    },

    checkTileEffect(x, y) {
        const map = Game.currentMap;
        const tile = map.tiles[y][x];

        switch (tile) {
            case TILE.STAIRS_DOWN:
                GameUI.showDialog({
                    speaker: '系统',
                    icon: '🔽',
                    text: `要前往第 ${Game.floor + 1} 层吗？`,
                    choices: [
                        { text: '下楼', action: () => this.goDownstairs() },
                        { text: '留在这里', action: () => GameUI.closeDialog() }
                    ]
                });
                break;

            case TILE.STAIRS_UP:
                if (Game.floor > 1) {
                    GameUI.showDialog({
                        speaker: '系统',
                        icon: '🔼',
                        text: `要返回第 ${Game.floor - 1} 层吗？`,
                        choices: [
                            { text: '上楼', action: () => this.goUpstairs() },
                            { text: '留在这里', action: () => GameUI.closeDialog() }
                        ]
                    });
                }
                break;

            case TILE.CHEST: {
                const chestData = map.items.find(i => i.x === x && i.y === y);
                if (chestData && !chestData.opened) {
                    chestData.opened = true;
                    GameUI.addLog('打开了宝箱！', 'loot');
                    Renderer.spawnParticles(x, y, '#ffd700', 15);

                    for (const item of chestData.items) {
                        if (item.type === 'gold') {
                            Player.gold += item.amount;
                            GameUI.addLog(`获得 ${item.amount} 金币`, 'loot');
                        } else {
                            ItemSystem.addToInventory(item);
                            GameUI.addLog(`获得 ${item.name}`, 'loot');
                            QuestSystem.onItemCollect(item.id);
                        }
                    }
                    GameUI.notify('打开了宝箱！', 'loot');
                }
                break;
            }

            case TILE.TRAP:
                if (Player.className === 'rogue' && Utils.chance(50)) {
                    GameUI.addLog('你灵巧地避开了陷阱！', 'system');
                } else {
                    const trapDmg = Math.floor(Player.maxHp * Utils.randFloat(0.05, 0.15));
                    Player.hp = Math.max(1, Player.hp - trapDmg);
                    GameUI.addLog(`触发了陷阱！受到 ${trapDmg} 点伤害`, 'combat');
                    GameUI.notify(`陷阱！-${trapDmg} HP`, 'error');
                    Renderer.spawnParticles(x, y, '#ff4455', 8);
                }
                map.tiles[y][x] = TILE.FLOOR; // Trap is consumed
                break;

            case TILE.SHOP:
                GameUI.openShop(Game.floor);
                break;

            case TILE.FORGE:
                GameUI.openForge();
                break;

            case TILE.PORTAL:
                if (Game.floor === MAX_FLOOR) {
                    this.victory();
                }
                break;

            case TILE.CRYSTAL:
                // Restore some MP
                const mpRestore = Math.floor(Player.maxMp * 0.2);
                Player.mp = Math.min(Player.maxMp, Player.mp + mpRestore);
                GameUI.addLog(`水晶的力量恢复了 ${mpRestore} 点法力`, 'system');
                map.tiles[y][x] = TILE.FLOOR;
                Renderer.spawnParticles(x, y, '#aa55ff', 12);
                break;
        }
    },

    checkInteraction() {
        const prompt = document.getElementById('interaction-prompt');
        Game.interactTarget = null;

        for (const dir of DIR_OFFSET) {
            const checkX = Player.x + dir.x;
            const checkY = Player.y + dir.y;
            const entity = Game.currentMap.entities.find(e => e.x === checkX && e.y === checkY);
            if (entity && entity.type === 'npc') {
                Game.interactTarget = entity;
                prompt.classList.remove('hidden');
                return;
            }
        }
        prompt.classList.add('hidden');
    },

    interactNPC(npc) {
        if (npc.dialog) {
            const dialogData = typeof npc.dialog === 'function' ? npc.dialog() : npc.dialog;
            GameUI.showDialog({
                speaker: npc.name,
                icon: npc.icon,
                text: dialogData.text,
                choices: dialogData.choices || []
            });
        }

        if (npc.quest) {
            const quest = GameData.quests[npc.quest];
            if (quest && !Player.completedQuests.includes(quest.id) &&
                !Player.questLog.find(q => q.id === quest.id)) {
                GameUI.showDialog({
                    speaker: npc.name,
                    icon: npc.icon,
                    text: quest.description,
                    choices: [
                        { text: '接受任务', action: () => { QuestSystem.acceptQuest(quest.id); GameUI.closeDialog(); } },
                        { text: '拒绝', action: () => GameUI.closeDialog() }
                    ]
                });
            }
        }

        if (npc.shop) {
            GameUI.openShop(Game.floor);
        }
    },

    goDownstairs() {
        GameUI.closeDialog();
        Game.floor++;
        this.generateFloor(Game.floor);

        const startRoom = Game.currentMap.rooms[0];
        Player.x = startRoom.cx;
        Player.y = startRoom.cy;
        Player.visitedFloors.add(Game.floor);

        FOVSystem.update();
        GameUI.updateAllUI();
        GameUI.addLog(`进入了地牢第 ${Game.floor} 层`, 'story');
        GameUI.notify(`地牢 第${Game.floor}层`, 'info');

        if (Game.floor % 5 === 0) {
            GameUI.addLog('⚠️ 你感受到了强大的气息...这层有BOSS！', 'story');
        }
    },

    goUpstairs() {
        GameUI.closeDialog();
        Game.floor--;
        this.generateFloor(Game.floor);

        // Find stairs down position
        let placed = false;
        for (let y = 0; y < MAP_ROWS && !placed; y++) {
            for (let x = 0; x < MAP_COLS && !placed; x++) {
                if (Game.currentMap.tiles[y][x] === TILE.STAIRS_DOWN) {
                    Player.x = x;
                    Player.y = y;
                    placed = true;
                }
            }
        }
        if (!placed) {
            const room = Game.currentMap.rooms[Game.currentMap.rooms.length - 1];
            Player.x = room.cx;
            Player.y = room.cy;
        }

        FOVSystem.update();
        GameUI.updateAllUI();
        GameUI.addLog(`返回了地牢第 ${Game.floor} 层`, 'story');
    },

    gameOver() {
        Game.state = 'gameover';
        const playTime = Game.playTime + (Date.now() - Game.playStartTime) / 1000;

        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('combat-screen').classList.remove('active');
        document.getElementById('gameover-screen').classList.add('active');

        document.getElementById('gameover-stats').innerHTML = `
            <p>角色：${Player.name} (${GameData.classes[Player.className]?.name || Player.className})</p>
            <p>等级：Lv.${Player.level}</p>
            <p>到达层数：第${Game.floor}层</p>
            <p>击杀数：${Game.totalKills}</p>
            <p>获得金币：${Game.totalGold}</p>
            <p>游戏时间：${Utils.formatTime(playTime)}</p>
        `;

        document.getElementById('btn-revive').onclick = () => {
            Player.hp = Math.floor(Player.maxHp * 0.5);
            Player.mp = Math.floor(Player.maxMp * 0.3);
            Player.statusEffects = [];
            if (Game.floor > 1) Game.floor--;
            this.generateFloor(Game.floor);
            const room = Game.currentMap.rooms[0];
            Player.x = room.cx;
            Player.y = room.cy;

            document.getElementById('gameover-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            Game.state = 'exploring';
            FOVSystem.update();
            GameUI.updateAllUI();
            this.gameLoop();
        };

        document.getElementById('btn-gameover-quit').onclick = () => {
            location.reload();
        };
    },

    victory() {
        Game.state = 'victory';
        const playTime = Game.playTime + (Date.now() - Game.playStartTime) / 1000;

        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('victory-screen').classList.add('active');

        document.getElementById('victory-stats').innerHTML = `
            <p>🎉 ${Player.name} 征服了暗影地牢！</p>
            <p>等级：Lv.${Player.level}</p>
            <p>击杀数：${Game.totalKills}</p>
            <p>获得金币：${Game.totalGold}</p>
            <p>总步数：${Game.totalSteps}</p>
            <p>游戏时间：${Utils.formatTime(playTime)}</p>
        `;

        document.getElementById('btn-continue-playing').onclick = () => {
            document.getElementById('victory-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            Game.state = 'exploring';
            this.gameLoop();
        };

        document.getElementById('btn-victory-quit').onclick = () => {
            location.reload();
        };
    },

    bindInput() {
        document.addEventListener('keydown', (e) => {
            Game.keys[e.code] = true;

            if (Game.state === 'exploring') {
                switch (e.code) {
                    case 'KeyI': GameUI.togglePanel('inventory-panel'); break;
                    case 'KeyC': GameUI.togglePanel('character-panel'); break;
                    case 'KeyQ': GameUI.togglePanel('quest-panel'); break;
                    case 'KeyM': GameUI.togglePanel('map-panel'); break;
                    case 'KeyE':
                        if (Game.interactTarget) {
                            this.interactNPC(Game.interactTarget);
                        }
                        break;
                    case 'Escape':
                        GameUI.closeAllPanels();
                        GameUI.closeDialog();
                        break;
                }
            }

            if (Game.state === 'combat') {
                switch (e.code) {
                    case 'Escape':
                        document.getElementById('skill-list').classList.add('hidden');
                        document.getElementById('item-list').classList.add('hidden');
                        break;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            Game.keys[e.code] = false;
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    GameEngine.init();
});

// ==========================================
// SECTION 11: Extended Monster Variants
// ==========================================
// Additional monster variants for more variety per floor
const ExtendedMonsters = {
    slime_red: {
        id: 'slime_red', name: '红色史莱姆', icon: '🔴', level: 3,
        hp: 50, mp: 10, atk: 9, def: 3, speed: 6, hit: 86, dodge: 4, crit: 3,
        exp: 22, gold: 14, element: ELEMENT.FIRE,
        skills: [{ name: '火焰弹', type: 'damage', power: 12, mpCost: 5, element: ELEMENT.FIRE, statusEffect: 'BURN', statusChance: 20, statusDuration: 2 }],
        loot: [{ itemId: 'potion_hp_small', chance: 25 }],
        minFloor: 2, maxFloor: 7
    },
    slime_gold: {
        id: 'slime_gold', name: '黄金史莱姆', icon: '🟡', level: 4,
        hp: 30, mp: 0, atk: 5, def: 15, speed: 18, hit: 80, dodge: 25, crit: 2,
        exp: 50, gold: 100, element: ELEMENT.NONE,
        skills: [],
        loot: [{ itemId: 'ring_hp', chance: 15 }],
        minFloor: 3, maxFloor: 20
    },
    kobold: {
        id: 'kobold', name: '狗头人', icon: '🐕', level: 3,
        hp: 40, mp: 8, atk: 9, def: 4, speed: 10, hit: 89, dodge: 7, crit: 6,
        exp: 20, gold: 18, element: ELEMENT.NONE,
        skills: [{ name: '投石', type: 'damage', power: 8, mpCost: 3 }],
        loot: [{ itemId: 'mat_iron_ore', chance: 30 }],
        minFloor: 2, maxFloor: 6
    },
    mushroom_toxic: {
        id: 'mushroom_toxic', name: '毒蘑菇', icon: '🍄', level: 4,
        hp: 45, mp: 20, atk: 6, def: 6, speed: 3, hit: 85, dodge: 2, crit: 2,
        exp: 24, gold: 12, element: ELEMENT.POISON,
        skills: [
            { name: '毒孢子', type: 'damage', power: 8, mpCost: 5, statusEffect: 'POISON', statusChance: 60, statusDuration: 4 },
            { name: '麻痹粉', type: 'debuff', mpCost: 8, statusEffect: 'SLOW', statusChance: 45, statusDuration: 2 }
        ],
        loot: [{ itemId: 'potion_cure', chance: 35 }],
        minFloor: 2, maxFloor: 7
    },
    harpy: {
        id: 'harpy', name: '鹰身女妖', icon: '🦅', level: 7,
        hp: 75, mp: 25, atk: 16, def: 6, speed: 15, hit: 94, dodge: 14, crit: 10,
        exp: 48, gold: 32, element: ELEMENT.NONE,
        skills: [
            { name: '尖啸', type: 'debuff', mpCost: 8, statusEffect: 'STUN', statusChance: 30, statusDuration: 1 },
            { name: '俯冲', type: 'damage', power: 20, mpCost: 6, atkScale: 0.7 }
        ],
        loot: [{ itemId: 'boots_swift', chance: 5 }],
        minFloor: 5, maxFloor: 10
    },
    troll: {
        id: 'troll', name: '巨魔', icon: '👹', level: 8,
        hp: 160, mp: 5, atk: 22, def: 12, speed: 5, hit: 85, dodge: 2, crit: 6,
        exp: 55, gold: 40, element: ELEMENT.NONE,
        skills: [
            { name: '再生', type: 'heal', power: 30, mpCost: 5 },
            { name: '巨拳', type: 'damage', power: 25, mpCost: 0, atkScale: 0.6 }
        ],
        loot: [{ itemId: 'armor_chain', chance: 8 }, { itemId: 'mat_iron_ore', chance: 35 }],
        minFloor: 5, maxFloor: 11
    },
    wraith: {
        id: 'wraith', name: '怨灵', icon: '👤', level: 9,
        hp: 80, mp: 50, atk: 20, def: 5, speed: 13, hit: 90, dodge: 22, crit: 8,
        exp: 60, gold: 38, element: ELEMENT.DARK,
        skills: [
            { name: '灵魂尖啸', type: 'damage', power: 25, mpCost: 10, element: ELEMENT.DARK, statusEffect: 'BLIND', statusChance: 30, statusDuration: 2 },
            { name: '生命汲取', type: 'drain', power: 18, mpCost: 12, drainPercent: 0.6 }
        ],
        loot: [{ itemId: 'mat_dark_essence', chance: 25 }],
        minFloor: 6, maxFloor: 12
    },
    gargoyle: {
        id: 'gargoyle', name: '石像鬼', icon: '🗿', level: 10,
        hp: 140, mp: 10, atk: 20, def: 22, speed: 6, hit: 87, dodge: 3, crit: 5,
        exp: 65, gold: 45, element: ELEMENT.NONE,
        skills: [
            { name: '石化凝视', type: 'debuff', mpCost: 10, statusEffect: 'STUN', statusChance: 35, statusDuration: 1 },
            { name: '石拳', type: 'damage', power: 22, mpCost: 0, atkScale: 0.7 }
        ],
        loot: [{ itemId: 'mat_iron_ore', chance: 40 }, { itemId: 'helm_steel', chance: 6 }],
        minFloor: 7, maxFloor: 13
    },
    vampire: {
        id: 'vampire', name: '吸血鬼', icon: '🧛', level: 12,
        hp: 180, mp: 60, atk: 28, def: 14, speed: 12, hit: 93, dodge: 10, crit: 12,
        exp: 90, gold: 65, element: ELEMENT.DARK,
        skills: [
            { name: '血之吻', type: 'drain', power: 30, mpCost: 12, drainPercent: 0.7 },
            { name: '暗影斗篷', type: 'buff', mpCost: 15, statusEffect: 'HASTE', statusDuration: 2 },
            { name: '魅惑', type: 'debuff', mpCost: 10, statusEffect: 'WEAKEN', statusChance: 45, statusDuration: 2 }
        ],
        loot: [{ itemId: 'amulet_vitality', chance: 8 }, { itemId: 'mat_dark_essence', chance: 35 }],
        minFloor: 10, maxFloor: 16
    },
    phoenix: {
        id: 'phoenix', name: '火凤凰', icon: '🐦', level: 16,
        hp: 250, mp: 80, atk: 35, def: 18, speed: 14, hit: 94, dodge: 12, crit: 12,
        exp: 160, gold: 110, element: ELEMENT.FIRE,
        skills: [
            { name: '凤凰之火', type: 'aoe', power: 45, mpCost: 18, element: ELEMENT.FIRE, statusEffect: 'BURN', statusChance: 50, statusDuration: 3 },
            { name: '涅槃', type: 'heal', power: 100, mpCost: 30 },
            { name: '烈焰冲击', type: 'damage', power: 40, mpCost: 12, element: ELEMENT.FIRE }
        ],
        loot: [{ itemId: 'mat_crystal', chance: 45 }, { itemId: 'sword_flame', chance: 10 }],
        minFloor: 14, maxFloor: 20
    },
    death_knight: {
        id: 'death_knight', name: '死亡骑士', icon: '⚰️', level: 17,
        hp: 300, mp: 40, atk: 40, def: 28, speed: 9, hit: 93, dodge: 5, crit: 10,
        exp: 180, gold: 130, element: ELEMENT.DARK,
        skills: [
            { name: '死亡之握', type: 'damage', power: 45, mpCost: 12, element: ELEMENT.DARK, statusEffect: 'SLOW', statusChance: 40, statusDuration: 2 },
            { name: '亡灵护甲', type: 'buff', mpCost: 15, statusEffect: 'SHIELD', statusDuration: 3 },
            { name: '灵魂收割', type: 'drain', power: 35, mpCost: 15, drainPercent: 0.5 }
        ],
        loot: [{ itemId: 'sword_dark', chance: 8 }, { itemId: 'armor_mithril', chance: 6 }],
        minFloor: 15, maxFloor: 20
    },
    elemental_storm: {
        id: 'elemental_storm', name: '风暴元素', icon: '🌪️', level: 14,
        hp: 160, mp: 60, atk: 28, def: 12, speed: 16, hit: 92, dodge: 15, crit: 10,
        exp: 110, gold: 75, element: ELEMENT.LIGHTNING,
        skills: [
            { name: '闪电链', type: 'damage', power: 35, mpCost: 12, element: ELEMENT.LIGHTNING, statusEffect: 'STUN', statusChance: 25, statusDuration: 1 },
            { name: '风暴之怒', type: 'aoe', power: 30, mpCost: 15, element: ELEMENT.LIGHTNING }
        ],
        loot: [{ itemId: 'sword_thunder', chance: 8 }, { itemId: 'mat_crystal', chance: 35 }],
        minFloor: 12, maxFloor: 18
    },
    medusa: {
        id: 'medusa', name: '美杜莎', icon: '🐍', level: 13,
        hp: 170, mp: 50, atk: 25, def: 14, speed: 11, hit: 93, dodge: 8, crit: 8,
        exp: 100, gold: 70, element: ELEMENT.POISON,
        skills: [
            { name: '石化凝视', type: 'debuff', mpCost: 15, statusEffect: 'FREEZE', statusChance: 40, statusDuration: 2 },
            { name: '毒蛇之咬', type: 'damage', power: 25, mpCost: 8, statusEffect: 'POISON', statusChance: 50, statusDuration: 4 },
            { name: '蛇发鞭打', type: 'damage', power: 30, mpCost: 10, atkScale: 0.6 }
        ],
        loot: [{ itemId: 'amulet_luck', chance: 10 }, { itemId: 'ring_crit', chance: 8 }],
        minFloor: 11, maxFloor: 17
    },
    cerberus: {
        id: 'cerberus', name: '地狱三头犬', icon: '🐕‍🦺', level: 18,
        hp: 350, mp: 30, atk: 45, def: 25, speed: 11, hit: 92, dodge: 6, crit: 12,
        exp: 200, gold: 140, element: ELEMENT.FIRE,
        skills: [
            { name: '三重撕咬', type: 'damage', power: 50, mpCost: 10, atkScale: 0.8, statusEffect: 'BLEED', statusChance: 40, statusDuration: 3 },
            { name: '地狱吐息', type: 'aoe', power: 40, mpCost: 15, element: ELEMENT.FIRE, statusEffect: 'BURN', statusChance: 45, statusDuration: 3 }
        ],
        loot: [{ itemId: 'boots_dragon', chance: 8 }, { itemId: 'mat_dragon_scale', chance: 30 }],
        minFloor: 16, maxFloor: 20
    }
};

// Register extended monsters into GameData
Object.assign(GameData.monsters, ExtendedMonsters);

// ==========================================
// SECTION 12: Achievement System
// ==========================================
const AchievementSystem = {
    achievements: {
        first_blood: { id: 'first_blood', name: '初次击杀', desc: '击败第一个怪物', icon: '🗡️', unlocked: false },
        floor_5: { id: 'floor_5', name: '深入探索', desc: '到达地牢第5层', icon: '🏰', unlocked: false },
        floor_10: { id: 'floor_10', name: '勇往直前', desc: '到达地牢第10层', icon: '🏰', unlocked: false },
        floor_20: { id: 'floor_20', name: '地牢征服者', desc: '到达地牢第20层', icon: '👑', unlocked: false },
        level_10: { id: 'level_10', name: '初露锋芒', desc: '角色达到10级', icon: '⬆️', unlocked: false },
        level_25: { id: 'level_25', name: '身经百战', desc: '角色达到25级', icon: '⬆️', unlocked: false },
        level_50: { id: 'level_50', name: '传奇英雄', desc: '角色达到50级', icon: '🌟', unlocked: false },
        kill_100: { id: 'kill_100', name: '百人斩', desc: '累计击杀100个怪物', icon: '💀', unlocked: false },
        gold_1000: { id: 'gold_1000', name: '小富翁', desc: '累计获得1000金币', icon: '💰', unlocked: false },
        gold_10000: { id: 'gold_10000', name: '大富翁', desc: '累计获得10000金币', icon: '💎', unlocked: false },
        boss_slayer: { id: 'boss_slayer', name: 'BOSS猎人', desc: '击败第一个BOSS', icon: '👹', unlocked: false },
        legendary_item: { id: 'legendary_item', name: '传说收藏家', desc: '获得一件传说级装备', icon: '⭐', unlocked: false },
        full_equip: { id: 'full_equip', name: '全副武装', desc: '装备所有装备栏', icon: '🛡️', unlocked: false },
        quest_master: { id: 'quest_master', name: '任务大师', desc: '完成10个任务', icon: '📜', unlocked: false },
        survivor: { id: 'survivor', name: '幸存者', desc: '在生命值低于10%时击败敌人', icon: '❤️', unlocked: false },
        speed_runner: { id: 'speed_runner', name: '速通达人', desc: '在1000步内到达第5层', icon: '🏃', unlocked: false }
    },

    check() {
        const a = this.achievements;

        if (!a.first_blood.unlocked && Game.totalKills >= 1) this.unlock('first_blood');
        if (!a.floor_5.unlocked && Game.floor >= 5) this.unlock('floor_5');
        if (!a.floor_10.unlocked && Game.floor >= 10) this.unlock('floor_10');
        if (!a.floor_20.unlocked && Game.floor >= 20) this.unlock('floor_20');
        if (!a.level_10.unlocked && Player.level >= 10) this.unlock('level_10');
        if (!a.level_25.unlocked && Player.level >= 25) this.unlock('level_25');
        if (!a.level_50.unlocked && Player.level >= 50) this.unlock('level_50');
        if (!a.kill_100.unlocked && Game.totalKills >= 100) this.unlock('kill_100');
        if (!a.gold_1000.unlocked && Game.totalGold >= 1000) this.unlock('gold_1000');
        if (!a.gold_10000.unlocked && Game.totalGold >= 10000) this.unlock('gold_10000');
        if (!a.quest_master.unlocked && Player.completedQuests.length >= 10) this.unlock('quest_master');
        if (!a.speed_runner.unlocked && Game.floor >= 5 && Game.totalSteps <= 1000) this.unlock('speed_runner');

        if (!a.full_equip.unlocked) {
            const allEquipped = Object.values(Player.equipment).every(e => e !== null);
            if (allEquipped) this.unlock('full_equip');
        }

        if (!a.survivor.unlocked && Player.hp > 0 && Player.hp <= Player.maxHp * 0.1) {
            if (CombatSystem.enemy && CombatSystem.enemy.hp <= 0) this.unlock('survivor');
        }
    },

    unlock(id) {
        const achievement = this.achievements[id];
        if (!achievement || achievement.unlocked) return;
        achievement.unlocked = true;
        GameUI.notify(`🏆 成就解锁：${achievement.name}`, 'loot');
        GameUI.addLog(`🏆 成就解锁：${achievement.name} - ${achievement.desc}`, 'quest');
    },

    getUnlocked() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    },

    getAll() {
        return Object.values(this.achievements);
    }
};

// Hook achievement checks into combat end
const originalEndCombat = CombatSystem.endCombat.bind(CombatSystem);
CombatSystem.endCombat = function(victory) {
    originalEndCombat(victory);
    AchievementSystem.check();
};

// Hook into floor change
const originalGoDown = GameEngine.goDownstairs.bind(GameEngine);
GameEngine.goDownstairs = function() {
    originalGoDown();
    AchievementSystem.check();
};

// ==========================================
// SECTION 13: Particle Effect Presets
// ==========================================
const ParticlePresets = {
    levelUp(x, y) {
        const colors = ['#ffd700', '#ffaa00', '#ff8800', '#ffffff'];
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2,
                y: y * TILE_SIZE + TILE_SIZE / 2,
                vx: Math.cos(angle) * Utils.randFloat(1, 3),
                vy: Math.sin(angle) * Utils.randFloat(1, 3),
                gravity: 0,
                size: Utils.randFloat(2, 5),
                color: Utils.pick(colors),
                life: 1
            });
        }
    },

    heal(x, y) {
        const colors = ['#44dd88', '#22ff66', '#88ffaa'];
        for (let i = 0; i < 15; i++) {
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2 + Utils.randFloat(-10, 10),
                y: y * TILE_SIZE + TILE_SIZE / 2,
                vx: Utils.randFloat(-0.5, 0.5),
                vy: Utils.randFloat(-2, -0.5),
                gravity: 0,
                size: Utils.randFloat(2, 4),
                color: Utils.pick(colors),
                life: 1
            });
        }
    },

    fire(x, y) {
        const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ff6600'];
        for (let i = 0; i < 20; i++) {
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2 + Utils.randFloat(-8, 8),
                y: y * TILE_SIZE + TILE_SIZE / 2,
                vx: Utils.randFloat(-1, 1),
                vy: Utils.randFloat(-3, -1),
                gravity: -0.02,
                size: Utils.randFloat(3, 6),
                color: Utils.pick(colors),
                life: 1
            });
        }
    },

    ice(x, y) {
        const colors = ['#88ccff', '#aaddff', '#ffffff', '#66aaff'];
        for (let i = 0; i < 18; i++) {
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2 + Utils.randFloat(-12, 12),
                y: y * TILE_SIZE + TILE_SIZE / 2 + Utils.randFloat(-12, 12),
                vx: Utils.randFloat(-1.5, 1.5),
                vy: Utils.randFloat(-1.5, 1.5),
                gravity: 0.02,
                size: Utils.randFloat(2, 5),
                color: Utils.pick(colors),
                life: 1
            });
        }
    },

    lightning(x, y) {
        const colors = ['#ffff00', '#ffffff', '#88aaff', '#ffdd00'];
        for (let i = 0; i < 12; i++) {
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2,
                y: y * TILE_SIZE + Utils.randFloat(0, TILE_SIZE),
                vx: Utils.randFloat(-3, 3),
                vy: Utils.randFloat(-1, 1),
                gravity: 0,
                size: Utils.randFloat(1, 3),
                color: Utils.pick(colors),
                life: 0.8
            });
        }
    },

    poison(x, y) {
        const colors = ['#44aa44', '#22cc22', '#88ff44', '#66dd66'];
        for (let i = 0; i < 12; i++) {
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2 + Utils.randFloat(-6, 6),
                y: y * TILE_SIZE + TILE_SIZE / 2,
                vx: Utils.randFloat(-0.8, 0.8),
                vy: Utils.randFloat(-1.5, -0.3),
                gravity: 0.01,
                size: Utils.randFloat(2, 4),
                color: Utils.pick(colors),
                life: 1
            });
        }
    },

    dark(x, y) {
        const colors = ['#440066', '#660088', '#8800aa', '#330044'];
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2,
                y: y * TILE_SIZE + TILE_SIZE / 2,
                vx: Math.cos(angle) * Utils.randFloat(0.5, 2),
                vy: Math.sin(angle) * Utils.randFloat(0.5, 2),
                gravity: 0,
                size: Utils.randFloat(3, 6),
                color: Utils.pick(colors),
                life: 1
            });
        }
    },

    holy(x, y) {
        const colors = ['#ffffff', '#ffffaa', '#ffdd88', '#ffd700'];
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2,
                y: y * TILE_SIZE + TILE_SIZE / 2,
                vx: Math.cos(angle) * Utils.randFloat(1, 2.5),
                vy: Math.sin(angle) * Utils.randFloat(1, 2.5) - 1,
                gravity: -0.01,
                size: Utils.randFloat(2, 4),
                color: Utils.pick(colors),
                life: 1
            });
        }
    },

    death(x, y) {
        const colors = ['#ff0000', '#880000', '#440000', '#cc0000'];
        for (let i = 0; i < 25; i++) {
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2 + Utils.randFloat(-15, 15),
                y: y * TILE_SIZE + TILE_SIZE / 2 + Utils.randFloat(-15, 15),
                vx: Utils.randFloat(-2, 2),
                vy: Utils.randFloat(-2, 2),
                gravity: 0.05,
                size: Utils.randFloat(2, 6),
                color: Utils.pick(colors),
                life: 1
            });
        }
    },

    chest(x, y) {
        const colors = ['#ffd700', '#ffaa00', '#ffffff', '#ffcc44'];
        for (let i = 0; i < 20; i++) {
            Game.particles.push({
                x: x * TILE_SIZE + TILE_SIZE / 2 + Utils.randFloat(-5, 5),
                y: y * TILE_SIZE + TILE_SIZE / 2,
                vx: Utils.randFloat(-1.5, 1.5),
                vy: Utils.randFloat(-3, -1),
                gravity: 0.04,
                size: Utils.randFloat(2, 4),
                color: Utils.pick(colors),
                life: 1
            });
        }
    }
};

// ==========================================
// SECTION 14: Sound Effect Placeholders
// ==========================================
const SFX = {
    enabled: true,
    volume: 0.7,

    play(name) {
        if (!this.enabled) return;
        // Audio context for procedural sound effects
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.value = this.volume * 0.15;

            switch (name) {
                case 'hit':
                    osc.frequency.value = 200;
                    osc.type = 'sawtooth';
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.15);
                    break;
                case 'critical':
                    osc.frequency.value = 400;
                    osc.type = 'square';
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.2);
                    break;
                case 'heal':
                    osc.frequency.value = 523;
                    osc.type = 'sine';
                    osc.frequency.linearRampToValueAtTime(784, ctx.currentTime + 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.3);
                    break;
                case 'levelup':
                    osc.frequency.value = 440;
                    osc.type = 'sine';
                    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.5);
                    break;
                case 'pickup':
                    osc.frequency.value = 600;
                    osc.type = 'sine';
                    osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.15);
                    break;
                case 'error':
                    osc.frequency.value = 150;
                    osc.type = 'square';
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.2);
                    break;
                default:
                    osc.frequency.value = 440;
                    osc.type = 'sine';
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.1);
            }
        } catch (e) {
            // Audio not supported, silently fail
        }
    }
};
