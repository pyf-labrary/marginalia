/* ============================================
   暗影地牢 - Shadow Dungeon RPG
   Game Data - Items, Monsters, Skills, Quests
   ============================================ */

// Shared constants (loaded before game-engine.js)
const ELEMENT = {
    NONE: '无', FIRE: '火', ICE: '冰', LIGHTNING: '雷',
    POISON: '毒', HOLY: '圣', DARK: '暗'
};

const GameData = {
    // ==========================================
    // CLASS DEFINITIONS
    // ==========================================
    classes: {
        warrior: {
            name: '战士', icon: '⚔️',
            baseHp: 120, baseMp: 30, baseAtk: 15, baseDef: 12,
            baseHit: 95, baseDodge: 3, baseCrit: 5, baseSpeed: 8,
            hpPerLevel: 12, mpPerLevel: 3,
            atkPerLevel: 3, defPerLevel: 2,
            description: '近战专精，高生命值和防御力'
        },
        mage: {
            name: '法师', icon: '🔮',
            baseHp: 70, baseMp: 100, baseAtk: 8, baseDef: 5,
            baseHit: 90, baseDodge: 5, baseCrit: 8, baseSpeed: 9,
            hpPerLevel: 6, mpPerLevel: 10,
            atkPerLevel: 2, defPerLevel: 1,
            description: '强大的魔法攻击，低生命值'
        },
        rogue: {
            name: '盗贼', icon: '🗡️',
            baseHp: 85, baseMp: 50, baseAtk: 13, baseDef: 7,
            baseHit: 98, baseDodge: 12, baseCrit: 15, baseSpeed: 14,
            hpPerLevel: 8, mpPerLevel: 5,
            atkPerLevel: 3, defPerLevel: 1,
            description: '高暴击和闪避，灵活多变'
        },
        paladin: {
            name: '圣骑士', icon: '✨',
            baseHp: 100, baseMp: 60, baseAtk: 11, baseDef: 10,
            baseHit: 93, baseDodge: 4, baseCrit: 5, baseSpeed: 9,
            hpPerLevel: 10, mpPerLevel: 6,
            atkPerLevel: 2, defPerLevel: 2,
            description: '攻守兼备，拥有治疗能力'
        }
    },

    // ==========================================
    // SKILLS DATABASE
    // ==========================================
    skills: {
        // --- Warrior Skills ---
        w_slash: {
            id: 'w_slash', name: '猛力斩', icon: '⚔️', type: 'damage',
            mpCost: 5, power: 20, atkScale: 0.8,
            description: '用力挥砍，造成大量物理伤害',
            class: 'warrior', level: 1
        },
        w_shield_bash: {
            id: 'w_shield_bash', name: '盾击', icon: '🛡️', type: 'damage',
            mpCost: 8, power: 15, atkScale: 0.5,
            statusEffect: 'STUN', statusChance: 40, statusDuration: 1,
            description: '用盾牌猛击，有几率眩晕敌人',
            class: 'warrior', level: 3
        },
        w_war_cry: {
            id: 'w_war_cry', name: '战吼', icon: '📢', type: 'buff',
            mpCost: 10, statusEffect: 'BERSERK', statusDuration: 3,
            description: '发出战吼，进入狂暴状态，攻击力大幅提升',
            class: 'warrior', level: 5
        },
        w_whirlwind: {
            id: 'w_whirlwind', name: '旋风斩', icon: '🌀', type: 'aoe',
            mpCost: 15, power: 30, atkScale: 0.6,
            description: '旋转攻击，对敌人造成范围伤害',
            class: 'warrior', level: 8
        },
        w_iron_wall: {
            id: 'w_iron_wall', name: '铁壁', icon: '🏰', type: 'buff',
            mpCost: 12, statusEffect: 'SHIELD', statusDuration: 4,
            description: '进入铁壁状态，大幅提升防御',
            class: 'warrior', level: 10
        },
        w_execute: {
            id: 'w_execute', name: '斩杀', icon: '💀', type: 'damage',
            mpCost: 20, power: 50, atkScale: 1.2,
            description: '对低生命敌人造成巨额伤害',
            class: 'warrior', level: 15
        },
        w_earthquake: {
            id: 'w_earthquake', name: '地震斩', icon: '🌋', type: 'aoe',
            mpCost: 25, power: 60, atkScale: 0.8,
            statusEffect: 'STUN', statusChance: 25, statusDuration: 1,
            description: '劈开大地，造成范围伤害并可能眩晕',
            class: 'warrior', level: 20
        },

        // --- Mage Skills ---
        m_fireball: {
            id: 'm_fireball', name: '火球术', icon: '🔥', type: 'damage',
            mpCost: 8, power: 25, atkScale: 1.0, element: ELEMENT.FIRE,
            statusEffect: 'BURN', statusChance: 30, statusDuration: 3,
            description: '发射火球，有几率灼烧敌人',
            class: 'mage', level: 1
        },
        m_ice_bolt: {
            id: 'm_ice_bolt', name: '冰箭', icon: '❄️', type: 'damage',
            mpCost: 10, power: 20, atkScale: 0.9, element: ELEMENT.ICE,
            statusEffect: 'FREEZE', statusChance: 25, statusDuration: 1,
            description: '发射冰箭，有几率冻结敌人',
            class: 'mage', level: 3
        },
        m_lightning: {
            id: 'm_lightning', name: '闪电链', icon: '⚡', type: 'damage',
            mpCost: 12, power: 30, atkScale: 1.1, element: ELEMENT.LIGHTNING,
            statusEffect: 'STUN', statusChance: 20, statusDuration: 1,
            description: '释放闪电，有几率眩晕敌人',
            class: 'mage', level: 5
        },
        m_mana_shield: {
            id: 'm_mana_shield', name: '法力护盾', icon: '🔵', type: 'buff',
            mpCost: 15, statusEffect: 'SHIELD', statusDuration: 4,
            description: '用法力形成护盾，减少受到的伤害',
            class: 'mage', level: 7
        },
        m_meteor: {
            id: 'm_meteor', name: '陨石术', icon: '☄️', type: 'aoe',
            mpCost: 25, power: 55, atkScale: 1.3, element: ELEMENT.FIRE,
            description: '召唤陨石轰击，造成巨额火焰伤害',
            class: 'mage', level: 10
        },
        m_blizzard: {
            id: 'm_blizzard', name: '暴风雪', icon: '🌨️', type: 'aoe',
            mpCost: 22, power: 40, atkScale: 1.0, element: ELEMENT.ICE,
            statusEffect: 'SLOW', statusChance: 50, statusDuration: 2,
            description: '召唤暴风雪，造成冰冻伤害并减速',
            class: 'mage', level: 13
        },
        m_arcane_burst: {
            id: 'm_arcane_burst', name: '奥术爆发', icon: '💫', type: 'damage',
            mpCost: 30, power: 70, atkScale: 1.5,
            description: '释放纯粹的奥术能量，造成毁灭性伤害',
            class: 'mage', level: 18
        },
        m_time_stop: {
            id: 'm_time_stop', name: '时间停止', icon: '⏳', type: 'debuff',
            mpCost: 35, statusEffect: 'FREEZE', statusChance: 80, statusDuration: 2,
            description: '冻结时间，使敌人无法行动',
            class: 'mage', level: 22
        },

        // --- Rogue Skills ---
        r_backstab: {
            id: 'r_backstab', name: '背刺', icon: '🗡️', type: 'damage',
            mpCost: 6, power: 25, atkScale: 0.9,
            description: '从背后攻击，造成高额伤害，暴击率翻倍',
            class: 'rogue', level: 1
        },
        r_poison_blade: {
            id: 'r_poison_blade', name: '淬毒', icon: '☠️', type: 'damage',
            mpCost: 8, power: 15, atkScale: 0.6,
            statusEffect: 'POISON', statusChance: 60, statusDuration: 4,
            description: '用毒刃攻击，高几率使敌人中毒',
            class: 'rogue', level: 3
        },
        r_smoke_bomb: {
            id: 'r_smoke_bomb', name: '烟雾弹', icon: '💨', type: 'debuff',
            mpCost: 10, statusEffect: 'BLIND', statusChance: 70, statusDuration: 2,
            description: '投掷烟雾弹，使敌人致盲',
            class: 'rogue', level: 5
        },
        r_shadow_step: {
            id: 'r_shadow_step', name: '暗影步', icon: '👤', type: 'buff',
            mpCost: 12, statusEffect: 'HASTE', statusDuration: 3,
            description: '融入暗影，大幅提升速度和闪避',
            class: 'rogue', level: 8
        },
        r_blade_dance: {
            id: 'r_blade_dance', name: '刃舞', icon: '💃', type: 'aoe',
            mpCost: 18, power: 35, atkScale: 0.7,
            description: '快速连续攻击，造成多段伤害',
            class: 'rogue', level: 12
        },
        r_assassinate: {
            id: 'r_assassinate', name: '暗杀', icon: '🎯', type: 'damage',
            mpCost: 25, power: 60, atkScale: 1.3,
            description: '致命一击，对低生命敌人伤害翻倍',
            class: 'rogue', level: 16
        },
        r_shadow_clone: {
            id: 'r_shadow_clone', name: '影分身', icon: '👥', type: 'buff',
            mpCost: 20, statusEffect: 'HASTE', statusDuration: 4,
            description: '创造分身，大幅提升闪避和攻击速度',
            class: 'rogue', level: 20
        },

        // --- Paladin Skills ---
        p_holy_strike: {
            id: 'p_holy_strike', name: '圣光打击', icon: '✨', type: 'damage',
            mpCost: 8, power: 20, atkScale: 0.7, element: ELEMENT.HOLY,
            description: '用圣光之力攻击，对暗属性敌人伤害加倍',
            class: 'paladin', level: 1
        },
        p_heal: {
            id: 'p_heal', name: '治疗术', icon: '💚', type: 'heal',
            mpCost: 10, power: 30, healScale: 0.25,
            description: '恢复自身生命值',
            class: 'paladin', level: 2
        },
        p_divine_shield: {
            id: 'p_divine_shield', name: '神圣护盾', icon: '🛡️', type: 'buff',
            mpCost: 15, statusEffect: 'SHIELD', statusDuration: 4,
            description: '召唤神圣护盾，大幅减少受到的伤害',
            class: 'paladin', level: 5
        },
        p_smite: {
            id: 'p_smite', name: '惩击', icon: '⚡', type: 'damage',
            mpCost: 12, power: 30, atkScale: 0.8, element: ELEMENT.HOLY,
            statusEffect: 'WEAKEN', statusChance: 35, statusDuration: 2,
            description: '神圣惩击，有几率削弱敌人',
            class: 'paladin', level: 7
        },
        p_regen: {
            id: 'p_regen', name: '再生术', icon: '🌿', type: 'buff',
            mpCost: 14, statusEffect: 'REGEN', statusDuration: 5,
            description: '持续恢复生命值',
            class: 'paladin', level: 10
        },
        p_holy_nova: {
            id: 'p_holy_nova', name: '圣光新星', icon: '🌟', type: 'aoe',
            mpCost: 22, power: 40, atkScale: 0.9, element: ELEMENT.HOLY,
            description: '释放圣光能量，造成范围伤害',
            class: 'paladin', level: 14
        },
        p_resurrection: {
            id: 'p_resurrection', name: '复活术', icon: '👼', type: 'heal',
            mpCost: 40, power: 0, healScale: 0.8,
            description: '强大的治疗术，恢复大量生命',
            class: 'paladin', level: 18
        },
        p_judgment: {
            id: 'p_judgment', name: '审判', icon: '⚖️', type: 'damage',
            mpCost: 30, power: 65, atkScale: 1.2, element: ELEMENT.HOLY,
            description: '神圣审判，造成巨额圣光伤害',
            class: 'paladin', level: 22
        }
    },

    // ==========================================
    // ITEMS DATABASE
    // ==========================================
    items: {
        // --- Consumables ---
        potion_hp_small: {
            id: 'potion_hp_small', name: '小型生命药水', icon: '🧪', type: 'consumable',
            description: '恢复50点生命值', price: 25, stackable: true,
            effect: { type: 'heal', value: 50 }, minFloor: 1
        },
        potion_hp_medium: {
            id: 'potion_hp_medium', name: '中型生命药水', icon: '🧪', type: 'consumable',
            description: '恢复150点生命值', price: 80, stackable: true,
            effect: { type: 'heal', value: 150 }, minFloor: 5
        },
        potion_hp_large: {
            id: 'potion_hp_large', name: '大型生命药水', icon: '🧪', type: 'consumable',
            description: '恢复400点生命值', price: 200, stackable: true,
            effect: { type: 'heal', value: 400 }, minFloor: 10
        },
        potion_hp_percent: {
            id: 'potion_hp_percent', name: '生命精华', icon: '❤️', type: 'consumable',
            description: '恢复50%最大生命值', price: 350, stackable: true,
            effect: { type: 'healPercent', value: 0.5 }, minFloor: 12
        },
        potion_mp_small: {
            id: 'potion_mp_small', name: '小型法力药水', icon: '💧', type: 'consumable',
            description: '恢复30点法力值', price: 20, stackable: true,
            effect: { type: 'mana', value: 30 }, minFloor: 1
        },
        potion_mp_medium: {
            id: 'potion_mp_medium', name: '中型法力药水', icon: '💧', type: 'consumable',
            description: '恢复80点法力值', price: 60, stackable: true,
            effect: { type: 'mana', value: 80 }, minFloor: 5
        },
        potion_mp_large: {
            id: 'potion_mp_large', name: '大型法力药水', icon: '💧', type: 'consumable',
            description: '恢复200点法力值', price: 150, stackable: true,
            effect: { type: 'mana', value: 200 }, minFloor: 10
        },
        potion_full: {
            id: 'potion_full', name: '万灵药', icon: '⭐', type: 'consumable',
            description: '完全恢复生命和法力，清除负面状态', price: 500, stackable: true,
            effect: { type: 'fullRestore' }, minFloor: 15
        },
        potion_cure: {
            id: 'potion_cure', name: '解毒药水', icon: '💊', type: 'consumable',
            description: '清除所有负面状态', price: 40, stackable: true,
            effect: { type: 'cure' }, minFloor: 3
        },
        scroll_escape: {
            id: 'scroll_escape', name: '传送卷轴', icon: '📜', type: 'consumable',
            description: '传送回楼梯处', price: 100, stackable: true,
            effect: { type: 'escape' }, minFloor: 1
        },
        potion_berserk: {
            id: 'potion_berserk', name: '狂暴药水', icon: '😡', type: 'consumable',
            description: '进入狂暴状态3回合', price: 120, stackable: true,
            effect: { type: 'buff', status: 'BERSERK', duration: 3 }, minFloor: 5
        },
        potion_haste: {
            id: 'potion_haste', name: '加速药水', icon: '⚡', type: 'consumable',
            description: '获得加速状态3回合', price: 100, stackable: true,
            effect: { type: 'buff', status: 'HASTE', duration: 3 }, minFloor: 5
        },
        potion_shield: {
            id: 'potion_shield', name: '护盾药水', icon: '🛡️', type: 'consumable',
            description: '获得护盾状态3回合', price: 100, stackable: true,
            effect: { type: 'buff', status: 'SHIELD', duration: 3 }, minFloor: 5
        },

        // --- Weapons ---
        sword_rusty: {
            id: 'sword_rusty', name: '生锈的剑', icon: '🗡️', type: 'weapon', slot: 'weapon',
            description: '一把生锈的旧剑', price: 30,
            stats: { atk: 5 }, minFloor: 1
        },
        sword_iron: {
            id: 'sword_iron', name: '铁剑', icon: '🗡️', type: 'weapon', slot: 'weapon',
            description: '标准的铁制长剑', price: 80,
            stats: { atk: 10, hit: 2 }, minFloor: 1
        },
        sword_steel: {
            id: 'sword_steel', name: '钢剑', icon: '🗡️', type: 'weapon', slot: 'weapon',
            description: '精炼钢制长剑', price: 200,
            stats: { atk: 18, hit: 3, crit: 2 }, minFloor: 4
        },
        sword_silver: {
            id: 'sword_silver', name: '银剑', icon: '⚔️', type: 'weapon', slot: 'weapon',
            description: '银制长剑，对暗属性有效', price: 400,
            stats: { atk: 25, hit: 5, crit: 3 }, minFloor: 7
        },
        sword_flame: {
            id: 'sword_flame', name: '烈焰之剑', icon: '🔥', type: 'weapon', slot: 'weapon',
            description: '燃烧着火焰的魔法剑', price: 800,
            stats: { atk: 35, crit: 5 }, minFloor: 10
        },
        sword_ice: {
            id: 'sword_ice', name: '寒冰之剑', icon: '❄️', type: 'weapon', slot: 'weapon',
            description: '散发寒气的魔法剑', price: 800,
            stats: { atk: 32, speed: 3, hit: 5 }, minFloor: 10
        },
        sword_thunder: {
            id: 'sword_thunder', name: '雷霆之剑', icon: '⚡', type: 'weapon', slot: 'weapon',
            description: '蕴含雷电之力的魔法剑', price: 800,
            stats: { atk: 30, crit: 8, speed: 2 }, minFloor: 10
        },
        sword_dark: {
            id: 'sword_dark', name: '暗影之刃', icon: '🌑', type: 'weapon', slot: 'weapon',
            description: '被黑暗力量侵蚀的利刃', price: 1200,
            stats: { atk: 45, crit: 10 }, minFloor: 14
        },
        sword_holy: {
            id: 'sword_holy', name: '圣光之剑', icon: '✨', type: 'weapon', slot: 'weapon',
            description: '散发圣光的神圣之剑', price: 1200,
            stats: { atk: 40, hit: 8, hp: 30 }, minFloor: 14
        },
        sword_dragon: {
            id: 'sword_dragon', name: '屠龙剑', icon: '🐉', type: 'weapon', slot: 'weapon',
            description: '传说中的屠龙之剑', price: 2500,
            stats: { atk: 60, crit: 12, hit: 10 }, minFloor: 18
        },
        staff_wood: {
            id: 'staff_wood', name: '木杖', icon: '🪄', type: 'weapon', slot: 'weapon',
            description: '简单的木制法杖', price: 25,
            stats: { atk: 3, mp: 10 }, minFloor: 1, requiredClass: 'mage'
        },
        staff_crystal: {
            id: 'staff_crystal', name: '水晶杖', icon: '🔮', type: 'weapon', slot: 'weapon',
            description: '镶嵌水晶的法杖', price: 150,
            stats: { atk: 8, mp: 25 }, minFloor: 4, requiredClass: 'mage'
        },
        staff_arcane: {
            id: 'staff_arcane', name: '奥术法杖', icon: '🔮', type: 'weapon', slot: 'weapon',
            description: '蕴含奥术能量的法杖', price: 500,
            stats: { atk: 15, mp: 50, crit: 5 }, minFloor: 8, requiredClass: 'mage'
        },
        staff_elemental: {
            id: 'staff_elemental', name: '元素法杖', icon: '🌈', type: 'weapon', slot: 'weapon',
            description: '掌控元素之力的法杖', price: 1000,
            stats: { atk: 25, mp: 80, crit: 8 }, minFloor: 13, requiredClass: 'mage'
        },
        staff_void: {
            id: 'staff_void', name: '虚空法杖', icon: '🌀', type: 'weapon', slot: 'weapon',
            description: '连接虚空的强大法杖', price: 2000,
            stats: { atk: 40, mp: 120, crit: 12 }, minFloor: 17, requiredClass: 'mage'
        },
        dagger_iron: {
            id: 'dagger_iron', name: '铁匕首', icon: '🔪', type: 'weapon', slot: 'weapon',
            description: '锋利的铁匕首', price: 50,
            stats: { atk: 7, speed: 3, crit: 5 }, minFloor: 1, requiredClass: 'rogue'
        },
        dagger_shadow: {
            id: 'dagger_shadow', name: '暗影匕首', icon: '🔪', type: 'weapon', slot: 'weapon',
            description: '暗影中闪烁的匕首', price: 300,
            stats: { atk: 15, speed: 5, crit: 10, dodge: 3 }, minFloor: 5, requiredClass: 'rogue'
        },
        dagger_venom: {
            id: 'dagger_venom', name: '毒蛇匕首', icon: '🐍', type: 'weapon', slot: 'weapon',
            description: '淬了蛇毒的匕首', price: 600,
            stats: { atk: 22, speed: 6, crit: 12 }, minFloor: 9, requiredClass: 'rogue'
        },
        dagger_phantom: {
            id: 'dagger_phantom', name: '幻影之刃', icon: '👻', type: 'weapon', slot: 'weapon',
            description: '如幻影般的利刃', price: 1200,
            stats: { atk: 35, speed: 8, crit: 18, dodge: 5 }, minFloor: 14, requiredClass: 'rogue'
        },
        mace_iron: {
            id: 'mace_iron', name: '铁锤', icon: '🔨', type: 'weapon', slot: 'weapon',
            description: '沉重的铁锤', price: 60,
            stats: { atk: 8, def: 3 }, minFloor: 1, requiredClass: 'paladin'
        },
        mace_holy: {
            id: 'mace_holy', name: '圣锤', icon: '🔨', type: 'weapon', slot: 'weapon',
            description: '被祝福的圣锤', price: 350,
            stats: { atk: 16, def: 5, hp: 20 }, minFloor: 5, requiredClass: 'paladin'
        },
        mace_divine: {
            id: 'mace_divine', name: '神圣之锤', icon: '⚒️', type: 'weapon', slot: 'weapon',
            description: '散发神圣光辉的战锤', price: 800,
            stats: { atk: 28, def: 8, hp: 40, mp: 20 }, minFloor: 10, requiredClass: 'paladin'
        },
        mace_judgment: {
            id: 'mace_judgment', name: '审判之锤', icon: '⚖️', type: 'weapon', slot: 'weapon',
            description: '执行神圣审判的战锤', price: 1800,
            stats: { atk: 42, def: 12, hp: 60, mp: 30 }, minFloor: 16, requiredClass: 'paladin'
        },

        // --- Armor (Head) ---
        helm_leather: {
            id: 'helm_leather', name: '皮帽', icon: '🎩', type: 'armor', slot: 'head',
            description: '简单的皮制帽子', price: 30,
            stats: { def: 2, hp: 5 }, minFloor: 1
        },
        helm_iron: {
            id: 'helm_iron', name: '铁盔', icon: '⛑️', type: 'armor', slot: 'head',
            description: '坚固的铁制头盔', price: 100,
            stats: { def: 5, hp: 15 }, minFloor: 3
        },
        helm_steel: {
            id: 'helm_steel', name: '钢盔', icon: '⛑️', type: 'armor', slot: 'head',
            description: '精炼钢制头盔', price: 250,
            stats: { def: 9, hp: 25 }, minFloor: 7
        },
        helm_mithril: {
            id: 'helm_mithril', name: '秘银头盔', icon: '👑', type: 'armor', slot: 'head',
            description: '轻盈而坚固的秘银头盔', price: 600,
            stats: { def: 14, hp: 40, mp: 15 }, minFloor: 12
        },
        helm_dragon: {
            id: 'helm_dragon', name: '龙鳞头盔', icon: '🐲', type: 'armor', slot: 'head',
            description: '用龙鳞打造的头盔', price: 1500,
            stats: { def: 22, hp: 60, speed: 2 }, minFloor: 17
        },

        // --- Armor (Body) ---
        armor_cloth: {
            id: 'armor_cloth', name: '布衣', icon: '👕', type: 'armor', slot: 'body',
            description: '简单的布制衣服', price: 20,
            stats: { def: 2 }, minFloor: 1
        },
        armor_leather: {
            id: 'armor_leather', name: '皮甲', icon: '🦺', type: 'armor', slot: 'body',
            description: '轻便的皮制铠甲', price: 60,
            stats: { def: 5, dodge: 2 }, minFloor: 1
        },
        armor_chain: {
            id: 'armor_chain', name: '锁子甲', icon: '🦺', type: 'armor', slot: 'body',
            description: '由铁环编织的铠甲', price: 150,
            stats: { def: 10, hp: 10 }, minFloor: 4
        },
        armor_plate: {
            id: 'armor_plate', name: '板甲', icon: '🛡️', type: 'armor', slot: 'body',
            description: '厚重的板金铠甲', price: 350,
            stats: { def: 18, hp: 25 }, minFloor: 8
        },
        armor_mithril: {
            id: 'armor_mithril', name: '秘银铠甲', icon: '🛡️', type: 'armor', slot: 'body',
            description: '秘银打造的轻型铠甲', price: 800,
            stats: { def: 25, hp: 40, speed: 2 }, minFloor: 12
        },
        armor_dragon: {
            id: 'armor_dragon', name: '龙鳞铠甲', icon: '🐉', type: 'armor', slot: 'body',
            description: '用龙鳞打造的传说铠甲', price: 2000,
            stats: { def: 38, hp: 80, speed: 3 }, minFloor: 17
        },
        robe_apprentice: {
            id: 'robe_apprentice', name: '学徒法袍', icon: '👘', type: 'armor', slot: 'body',
            description: '法师学徒的法袍', price: 40,
            stats: { def: 2, mp: 15 }, minFloor: 1, requiredClass: 'mage'
        },
        robe_arcane: {
            id: 'robe_arcane', name: '奥术法袍', icon: '👘', type: 'armor', slot: 'body',
            description: '蕴含奥术能量的法袍', price: 300,
            stats: { def: 6, mp: 40, crit: 3 }, minFloor: 6, requiredClass: 'mage'
        },
        robe_archmage: {
            id: 'robe_archmage', name: '大法师法袍', icon: '👘', type: 'armor', slot: 'body',
            description: '大法师穿戴的强大法袍', price: 1200,
            stats: { def: 12, mp: 80, crit: 6, atk: 10 }, minFloor: 13, requiredClass: 'mage'
        },

        // --- Armor (Legs) ---
        legs_leather: {
            id: 'legs_leather', name: '皮裤', icon: '👖', type: 'armor', slot: 'legs',
            description: '简单的皮制护腿', price: 25,
            stats: { def: 2, dodge: 1 }, minFloor: 1
        },
        legs_chain: {
            id: 'legs_chain', name: '锁子护腿', icon: '👖', type: 'armor', slot: 'legs',
            description: '铁环编织的护腿', price: 120,
            stats: { def: 6, hp: 10 }, minFloor: 4
        },
        legs_plate: {
            id: 'legs_plate', name: '板甲护腿', icon: '👖', type: 'armor', slot: 'legs',
            description: '厚重的板金护腿', price: 300,
            stats: { def: 12, hp: 20 }, minFloor: 8
        },
        legs_mithril: {
            id: 'legs_mithril', name: '秘银护腿', icon: '👖', type: 'armor', slot: 'legs',
            description: '秘银打造的护腿', price: 700,
            stats: { def: 18, hp: 30, speed: 2 }, minFloor: 13
        },

        // --- Armor (Feet) ---
        boots_leather: {
            id: 'boots_leather', name: '皮靴', icon: '👢', type: 'armor', slot: 'feet',
            description: '简单的皮靴', price: 20,
            stats: { def: 1, speed: 2 }, minFloor: 1
        },
        boots_iron: {
            id: 'boots_iron', name: '铁靴', icon: '👢', type: 'armor', slot: 'feet',
            description: '沉重但坚固的铁靴', price: 80,
            stats: { def: 4, speed: 1 }, minFloor: 3
        },
        boots_swift: {
            id: 'boots_swift', name: '疾风靴', icon: '👟', type: 'armor', slot: 'feet',
            description: '轻盈的疾风之靴', price: 250,
            stats: { def: 3, speed: 6, dodge: 3 }, minFloor: 7
        },
        boots_shadow: {
            id: 'boots_shadow', name: '暗影之靴', icon: '👢', type: 'armor', slot: 'feet',
            description: '无声的暗影之靴', price: 500,
            stats: { def: 5, speed: 8, dodge: 5 }, minFloor: 11
        },
        boots_dragon: {
            id: 'boots_dragon', name: '龙鳞战靴', icon: '👢', type: 'armor', slot: 'feet',
            description: '龙鳞打造的战靴', price: 1200,
            stats: { def: 12, speed: 5, hp: 30 }, minFloor: 16
        },

        // --- Accessories ---
        ring_hp: {
            id: 'ring_hp', name: '生命之戒', icon: '💍', type: 'accessory', slot: 'accessory1',
            description: '增加生命值的戒指', price: 100,
            stats: { hp: 30 }, minFloor: 2
        },
        ring_mp: {
            id: 'ring_mp', name: '法力之戒', icon: '💍', type: 'accessory', slot: 'accessory1',
            description: '增加法力值的戒指', price: 100,
            stats: { mp: 25 }, minFloor: 2
        },
        ring_power: {
            id: 'ring_power', name: '力量之戒', icon: '💍', type: 'accessory', slot: 'accessory1',
            description: '增加攻击力的戒指', price: 150,
            stats: { atk: 5 }, minFloor: 3
        },
        ring_protection: {
            id: 'ring_protection', name: '守护之戒', icon: '💍', type: 'accessory', slot: 'accessory1',
            description: '增加防御力的戒指', price: 150,
            stats: { def: 5 }, minFloor: 3
        },
        ring_crit: {
            id: 'ring_crit', name: '暴击之戒', icon: '💍', type: 'accessory', slot: 'accessory1',
            description: '增加暴击率的戒指', price: 200,
            stats: { crit: 8 }, minFloor: 5
        },
        amulet_luck: {
            id: 'amulet_luck', name: '幸运护符', icon: '🔮', type: 'accessory', slot: 'accessory2',
            description: '带来好运的护符', price: 180,
            stats: { crit: 3, dodge: 3, hit: 3 }, minFloor: 4
        },
        amulet_vitality: {
            id: 'amulet_vitality', name: '活力护符', icon: '🔮', type: 'accessory', slot: 'accessory2',
            description: '增强生命力的护符', price: 250,
            stats: { hp: 50, def: 3 }, minFloor: 6
        },
        amulet_wisdom: {
            id: 'amulet_wisdom', name: '智慧护符', icon: '🔮', type: 'accessory', slot: 'accessory2',
            description: '增强魔力的护符', price: 250,
            stats: { mp: 40, atk: 3 }, minFloor: 6
        },
        amulet_dragon: {
            id: 'amulet_dragon', name: '龙之护符', icon: '🐉', type: 'accessory', slot: 'accessory2',
            description: '蕴含龙之力量的护符', price: 1500,
            stats: { hp: 80, mp: 40, atk: 8, def: 8 }, minFloor: 15
        },

        // --- Materials ---
        mat_iron_ore: {
            id: 'mat_iron_ore', name: '铁矿石', icon: '🪨', type: 'material',
            description: '普通的铁矿石', price: 10, stackable: true, minFloor: 1
        },
        mat_crystal: {
            id: 'mat_crystal', name: '魔力水晶', icon: '💎', type: 'material',
            description: '蕴含魔力的水晶', price: 30, stackable: true, minFloor: 3
        },
        mat_dragon_scale: {
            id: 'mat_dragon_scale', name: '龙鳞', icon: '🐲', type: 'material',
            description: '坚硬的龙鳞片', price: 100, stackable: true, minFloor: 10
        },
        mat_dark_essence: {
            id: 'mat_dark_essence', name: '暗影精华', icon: '🌑', type: 'material',
            description: '凝聚的暗影能量', price: 80, stackable: true, minFloor: 8
        },
        mat_holy_shard: {
            id: 'mat_holy_shard', name: '圣光碎片', icon: '✨', type: 'material',
            description: '散发圣光的碎片', price: 80, stackable: true, minFloor: 8
        },
        mat_mithril: {
            id: 'mat_mithril', name: '秘银矿', icon: '🪙', type: 'material',
            description: '珍贵的秘银矿石', price: 60, stackable: true, minFloor: 6
        }
    },

    // ==========================================
    // MONSTERS DATABASE
    // ==========================================
    monsters: {
        // --- Floor 1-3: 初级怪物 ---
        slime_green: {
            id: 'slime_green', name: '绿色史莱姆', icon: '🟢', level: 1,
            hp: 30, mp: 0, atk: 5, def: 2, speed: 5, hit: 85, dodge: 3, crit: 2,
            exp: 15, gold: 8, element: ELEMENT.NONE,
            skills: [], behavior: 'passive',
            loot: [{ itemId: 'potion_hp_small', chance: 30 }],
            minFloor: 1, maxFloor: 5
        },
        slime_blue: {
            id: 'slime_blue', name: '蓝色史莱姆', icon: '🔵', level: 2,
            hp: 40, mp: 10, atk: 7, def: 3, speed: 6, hit: 85, dodge: 5, crit: 2,
            exp: 20, gold: 12, element: ELEMENT.ICE,
            skills: [{ name: '冰冻触手', type: 'damage', power: 10, mpCost: 5, statusEffect: 'FREEZE', statusChance: 15, statusDuration: 1 }],
            loot: [{ itemId: 'potion_mp_small', chance: 25 }],
            minFloor: 1, maxFloor: 6
        },
        rat_giant: {
            id: 'rat_giant', name: '巨型老鼠', icon: '🐀', level: 1,
            hp: 25, mp: 0, atk: 7, def: 1, speed: 10, hit: 90, dodge: 8, crit: 5,
            exp: 12, gold: 6, element: ELEMENT.NONE,
            skills: [], behavior: 'aggressive',
            loot: [{ itemId: 'mat_iron_ore', chance: 20 }],
            minFloor: 1, maxFloor: 4
        },
        bat: {
            id: 'bat', name: '蝙蝠', icon: '🦇', level: 2,
            hp: 20, mp: 0, atk: 8, def: 1, speed: 14, hit: 92, dodge: 15, crit: 8,
            exp: 14, gold: 7, element: ELEMENT.DARK,
            skills: [], behavior: 'aggressive',
            loot: [{ itemId: 'potion_hp_small', chance: 15 }],
            minFloor: 1, maxFloor: 5
        },
        skeleton: {
            id: 'skeleton', name: '骷髅兵', icon: '💀', level: 3,
            hp: 45, mp: 0, atk: 10, def: 5, speed: 7, hit: 88, dodge: 3, crit: 5,
            exp: 25, gold: 15, element: ELEMENT.DARK,
            skills: [{ name: '骨刃斩', type: 'damage', power: 12, mpCost: 0, atkScale: 0.5 }],
            loot: [{ itemId: 'sword_rusty', chance: 10 }, { itemId: 'mat_iron_ore', chance: 25 }],
            minFloor: 2, maxFloor: 7
        },
        goblin: {
            id: 'goblin', name: '哥布林', icon: '👺', level: 2,
            hp: 35, mp: 5, atk: 8, def: 3, speed: 9, hit: 88, dodge: 8, crit: 6,
            exp: 18, gold: 20, element: ELEMENT.NONE,
            skills: [],
            loot: [{ itemId: 'dagger_iron', chance: 8 }],
            minFloor: 1, maxFloor: 6
        },

        // --- Floor 4-7: 中级怪物 ---
        zombie: {
            id: 'zombie', name: '僵尸', icon: '🧟', level: 5,
            hp: 80, mp: 0, atk: 14, def: 8, speed: 4, hit: 82, dodge: 0, crit: 3,
            exp: 35, gold: 20, element: ELEMENT.DARK,
            skills: [{ name: '感染之咬', type: 'damage', power: 15, mpCost: 0, statusEffect: 'POISON', statusChance: 30, statusDuration: 3 }],
            loot: [{ itemId: 'potion_cure', chance: 20 }],
            minFloor: 4, maxFloor: 9
        },
        orc_warrior: {
            id: 'orc_warrior', name: '兽人战士', icon: '👹', level: 6,
            hp: 100, mp: 10, atk: 18, def: 10, speed: 7, hit: 90, dodge: 3, crit: 5,
            exp: 45, gold: 30, element: ELEMENT.NONE,
            skills: [{ name: '猛击', type: 'damage', power: 20, mpCost: 5, atkScale: 0.6 }],
            loot: [{ itemId: 'sword_iron', chance: 10 }, { itemId: 'armor_chain', chance: 8 }],
            minFloor: 4, maxFloor: 10
        },
        spider_giant: {
            id: 'spider_giant', name: '巨型蜘蛛', icon: '🕷️', level: 5,
            hp: 60, mp: 15, atk: 12, def: 5, speed: 11, hit: 92, dodge: 10, crit: 8,
            exp: 38, gold: 22, element: ELEMENT.POISON,
            skills: [{ name: '毒液喷射', type: 'damage', power: 10, mpCost: 5, statusEffect: 'POISON', statusChance: 50, statusDuration: 4 }],
            loot: [{ itemId: 'potion_cure', chance: 25 }],
            minFloor: 3, maxFloor: 8
        },
        ghost: {
            id: 'ghost', name: '幽灵', icon: '👻', level: 6,
            hp: 50, mp: 30, atk: 15, def: 3, speed: 12, hit: 88, dodge: 20, crit: 5,
            exp: 42, gold: 25, element: ELEMENT.DARK,
            skills: [
                { name: '灵魂冲击', type: 'damage', power: 18, mpCost: 8, element: ELEMENT.DARK },
                { name: '恐惧', type: 'debuff', mpCost: 10, statusEffect: 'WEAKEN', statusChance: 40, statusDuration: 2 }
            ],
            loot: [{ itemId: 'mat_dark_essence', chance: 20 }],
            minFloor: 4, maxFloor: 10
        },
        wolf_dire: {
            id: 'wolf_dire', name: '恐狼', icon: '🐺', level: 5,
            hp: 70, mp: 0, atk: 16, def: 6, speed: 13, hit: 93, dodge: 8, crit: 10,
            exp: 40, gold: 18, element: ELEMENT.NONE,
            skills: [{ name: '撕咬', type: 'damage', power: 15, mpCost: 0, statusEffect: 'BLEED', statusChance: 30, statusDuration: 3 }],
            loot: [{ itemId: 'boots_leather', chance: 10 }],
            minFloor: 3, maxFloor: 8
        },

        // --- Floor 8-12: 高级怪物 ---
        dark_knight: {
            id: 'dark_knight', name: '暗黑骑士', icon: '🖤', level: 9,
            hp: 150, mp: 20, atk: 25, def: 18, speed: 8, hit: 92, dodge: 5, crit: 8,
            exp: 70, gold: 50, element: ELEMENT.DARK,
            skills: [
                { name: '暗影斩', type: 'damage', power: 30, mpCost: 8, element: ELEMENT.DARK },
                { name: '暗黑护甲', type: 'buff', mpCost: 10, statusEffect: 'SHIELD', statusDuration: 2 }
            ],
            loot: [{ itemId: 'sword_steel', chance: 12 }, { itemId: 'armor_plate', chance: 8 }],
            minFloor: 8, maxFloor: 14
        },
        fire_elemental: {
            id: 'fire_elemental', name: '火元素', icon: '🔥', level: 10,
            hp: 120, mp: 40, atk: 22, def: 10, speed: 10, hit: 90, dodge: 8, crit: 10,
            exp: 65, gold: 45, element: ELEMENT.FIRE,
            skills: [
                { name: '烈焰吐息', type: 'damage', power: 35, mpCost: 12, element: ELEMENT.FIRE, statusEffect: 'BURN', statusChance: 40, statusDuration: 3 },
                { name: '火焰爆发', type: 'aoe', power: 25, mpCost: 15, element: ELEMENT.FIRE }
            ],
            loot: [{ itemId: 'sword_flame', chance: 5 }, { itemId: 'mat_crystal', chance: 30 }],
            minFloor: 8, maxFloor: 14
        },
        ice_golem: {
            id: 'ice_golem', name: '冰霜魔像', icon: '🧊', level: 10,
            hp: 200, mp: 20, atk: 20, def: 25, speed: 4, hit: 85, dodge: 0, crit: 3,
            exp: 75, gold: 55, element: ELEMENT.ICE,
            skills: [
                { name: '冰霜冲击', type: 'damage', power: 25, mpCost: 10, element: ELEMENT.ICE, statusEffect: 'FREEZE', statusChance: 30, statusDuration: 1 }
            ],
            loot: [{ itemId: 'sword_ice', chance: 5 }, { itemId: 'mat_crystal', chance: 35 }],
            minFloor: 8, maxFloor: 14
        },
        necromancer: {
            id: 'necromancer', name: '死灵法师', icon: '🧙', level: 11,
            hp: 100, mp: 80, atk: 18, def: 8, speed: 9, hit: 90, dodge: 5, crit: 8,
            exp: 80, gold: 60, element: ELEMENT.DARK,
            skills: [
                { name: '暗影箭', type: 'damage', power: 30, mpCost: 10, element: ELEMENT.DARK },
                { name: '生命汲取', type: 'drain', power: 20, mpCost: 15, drainPercent: 0.5 },
                { name: '诅咒', type: 'debuff', mpCost: 12, statusEffect: 'WEAKEN', statusChance: 50, statusDuration: 3 }
            ],
            loot: [{ itemId: 'staff_arcane', chance: 8 }, { itemId: 'mat_dark_essence', chance: 30 }],
            minFloor: 9, maxFloor: 15
        },
        minotaur: {
            id: 'minotaur', name: '牛头人', icon: '🐂', level: 11,
            hp: 180, mp: 10, atk: 28, def: 15, speed: 8, hit: 88, dodge: 3, crit: 12,
            exp: 85, gold: 55, element: ELEMENT.NONE,
            skills: [
                { name: '冲锋', type: 'damage', power: 35, mpCost: 5, atkScale: 0.7, statusEffect: 'STUN', statusChance: 25, statusDuration: 1 }
            ],
            loot: [{ itemId: 'helm_steel', chance: 10 }, { itemId: 'legs_plate', chance: 8 }],
            minFloor: 8, maxFloor: 14
        },

        // --- Floor 13-17: 精英怪物 ---
        demon: {
            id: 'demon', name: '恶魔', icon: '😈', level: 14,
            hp: 250, mp: 50, atk: 35, def: 20, speed: 11, hit: 93, dodge: 8, crit: 10,
            exp: 120, gold: 80, element: ELEMENT.DARK,
            skills: [
                { name: '地狱火', type: 'damage', power: 45, mpCost: 15, element: ELEMENT.FIRE, statusEffect: 'BURN', statusChance: 40, statusDuration: 3 },
                { name: '恐惧凝视', type: 'debuff', mpCost: 12, statusEffect: 'WEAKEN', statusChance: 50, statusDuration: 3 }
            ],
            loot: [{ itemId: 'sword_dark', chance: 5 }, { itemId: 'mat_dark_essence', chance: 40 }],
            minFloor: 13, maxFloor: 18
        },
        dragon_young: {
            id: 'dragon_young', name: '幼龙', icon: '🐲', level: 15,
            hp: 300, mp: 40, atk: 38, def: 22, speed: 10, hit: 92, dodge: 6, crit: 8,
            exp: 150, gold: 100, element: ELEMENT.FIRE,
            skills: [
                { name: '龙息', type: 'aoe', power: 50, mpCost: 15, element: ELEMENT.FIRE, statusEffect: 'BURN', statusChance: 50, statusDuration: 3 },
                { name: '龙爪', type: 'damage', power: 35, mpCost: 5, atkScale: 0.8 }
            ],
            loot: [{ itemId: 'mat_dragon_scale', chance: 40 }, { itemId: 'sword_flame', chance: 8 }],
            minFloor: 13, maxFloor: 19
        },
        lich: {
            id: 'lich', name: '巫妖', icon: '☠️', level: 16,
            hp: 200, mp: 120, atk: 30, def: 15, speed: 9, hit: 95, dodge: 5, crit: 12,
            exp: 140, gold: 90, element: ELEMENT.DARK,
            skills: [
                { name: '死亡射线', type: 'damage', power: 55, mpCost: 20, element: ELEMENT.DARK },
                { name: '灵魂汲取', type: 'drain', power: 30, mpCost: 15, drainPercent: 0.6 },
                { name: '死亡诅咒', type: 'debuff', mpCost: 18, statusEffect: 'POISON', statusChance: 60, statusDuration: 4 },
                { name: '暗影治愈', type: 'heal', power: 50, mpCost: 20 }
            ],
            loot: [{ itemId: 'staff_elemental', chance: 6 }, { itemId: 'mat_dark_essence', chance: 45 }],
            minFloor: 14, maxFloor: 20
        },
        golem_ancient: {
            id: 'golem_ancient', name: '远古魔像', icon: '🗿', level: 15,
            hp: 400, mp: 0, atk: 32, def: 35, speed: 3, hit: 80, dodge: 0, crit: 5,
            exp: 130, gold: 85, element: ELEMENT.NONE,
            skills: [
                { name: '巨拳', type: 'damage', power: 40, mpCost: 0, atkScale: 0.8, statusEffect: 'STUN', statusChance: 30, statusDuration: 1 }
            ],
            loot: [{ itemId: 'mat_mithril', chance: 35 }, { itemId: 'helm_mithril', chance: 5 }],
            minFloor: 13, maxFloor: 19
        },

        // --- Floor 18-20: 终极怪物 ---
        shadow_lord: {
            id: 'shadow_lord', name: '暗影领主', icon: '🌑', level: 18,
            hp: 350, mp: 80, atk: 42, def: 25, speed: 12, hit: 95, dodge: 10, crit: 12,
            exp: 200, gold: 150, element: ELEMENT.DARK,
            skills: [
                { name: '暗影风暴', type: 'aoe', power: 55, mpCost: 20, element: ELEMENT.DARK },
                { name: '虚空之触', type: 'damage', power: 45, mpCost: 15, statusEffect: 'WEAKEN', statusChance: 50, statusDuration: 3 },
                { name: '暗影恢复', type: 'heal', power: 60, mpCost: 20 }
            ],
            loot: [{ itemId: 'sword_dark', chance: 10 }, { itemId: 'mat_dark_essence', chance: 50 }],
            minFloor: 18, maxFloor: 20
        },
        angel_fallen: {
            id: 'angel_fallen', name: '堕落天使', icon: '👼', level: 19,
            hp: 320, mp: 100, atk: 40, def: 22, speed: 14, hit: 96, dodge: 12, crit: 15,
            exp: 220, gold: 160, element: ELEMENT.HOLY,
            skills: [
                { name: '圣光审判', type: 'damage', power: 60, mpCost: 20, element: ELEMENT.HOLY },
                { name: '神圣治愈', type: 'heal', power: 80, mpCost: 25 },
                { name: '光之束缚', type: 'debuff', mpCost: 15, statusEffect: 'STUN', statusChance: 40, statusDuration: 1 }
            ],
            loot: [{ itemId: 'sword_holy', chance: 8 }, { itemId: 'mat_holy_shard', chance: 50 }],
            minFloor: 18, maxFloor: 20
        }
    },

    // ==========================================
    // BOSSES DATABASE
    // ==========================================
    bosses: {
        boss_floor5: {
            id: 'boss_floor5', name: '骷髅王', icon: '💀', level: 8, isBoss: true,
            hp: 300, mp: 30, atk: 22, def: 12, speed: 7, hit: 90, dodge: 5, crit: 8,
            exp: 200, gold: 150, element: ELEMENT.DARK, alertRange: 10,
            skills: [
                { name: '死亡之握', type: 'damage', power: 30, mpCost: 10, statusEffect: 'WEAKEN', statusChance: 40, statusDuration: 2 },
                { name: '召唤骷髅', type: 'buff', mpCost: 15, statusEffect: 'BERSERK', statusDuration: 2 },
                { name: '骨刺', type: 'aoe', power: 25, mpCost: 10 }
            ],
            loot: [{ itemId: 'sword_steel', chance: 50 }, { itemId: 'helm_iron', chance: 40 }],
            minFloor: 5
        },
        boss_floor10: {
            id: 'boss_floor10', name: '火焰巨龙', icon: '🐉', level: 15, isBoss: true,
            hp: 600, mp: 60, atk: 35, def: 20, speed: 9, hit: 92, dodge: 5, crit: 10,
            exp: 500, gold: 350, element: ELEMENT.FIRE, alertRange: 12,
            skills: [
                { name: '龙息', type: 'aoe', power: 50, mpCost: 15, element: ELEMENT.FIRE, statusEffect: 'BURN', statusChance: 60, statusDuration: 3 },
                { name: '龙尾横扫', type: 'damage', power: 40, mpCost: 10, statusEffect: 'STUN', statusChance: 30, statusDuration: 1 },
                { name: '龙之怒吼', type: 'buff', mpCost: 20, statusEffect: 'BERSERK', statusDuration: 3 },
                { name: '龙之再生', type: 'heal', power: 80, mpCost: 25 }
            ],
            loot: [{ itemId: 'mat_dragon_scale', chance: 80 }, { itemId: 'sword_flame', chance: 30 }],
            minFloor: 10
        },
        boss_floor15: {
            id: 'boss_floor15', name: '深渊领主', icon: '😈', level: 22, isBoss: true,
            hp: 1000, mp: 100, atk: 48, def: 28, speed: 11, hit: 94, dodge: 8, crit: 12,
            exp: 800, gold: 600, element: ELEMENT.DARK, alertRange: 12,
            skills: [
                { name: '深渊之火', type: 'aoe', power: 60, mpCost: 20, element: ELEMENT.FIRE, statusEffect: 'BURN', statusChance: 50, statusDuration: 3 },
                { name: '灵魂撕裂', type: 'damage', power: 55, mpCost: 15, element: ELEMENT.DARK, statusEffect: 'WEAKEN', statusChance: 40, statusDuration: 3 },
                { name: '暗影护甲', type: 'buff', mpCost: 20, statusEffect: 'SHIELD', statusDuration: 3 },
                { name: '深渊治愈', type: 'heal', power: 120, mpCost: 30 },
                { name: '恐惧领域', type: 'debuff', mpCost: 25, statusEffect: 'BLIND', statusChance: 60, statusDuration: 2 }
            ],
            loot: [{ itemId: 'sword_dark', chance: 40 }, { itemId: 'armor_mithril', chance: 30 }],
            minFloor: 15
        },
        boss_floor20: {
            id: 'boss_floor20', name: '暗影之王', icon: '👑', level: 30, isBoss: true,
            hp: 2000, mp: 200, atk: 65, def: 40, speed: 13, hit: 96, dodge: 10, crit: 15,
            exp: 2000, gold: 1500, element: ELEMENT.DARK, alertRange: 15,
            skills: [
                { name: '终焉之刃', type: 'damage', power: 80, mpCost: 20, element: ELEMENT.DARK },
                { name: '暗影风暴', type: 'aoe', power: 70, mpCost: 25, element: ELEMENT.DARK, statusEffect: 'BLIND', statusChance: 40, statusDuration: 2 },
                { name: '时间扭曲', type: 'debuff', mpCost: 30, statusEffect: 'SLOW', statusChance: 70, statusDuration: 3 },
                { name: '暗影再生', type: 'heal', power: 200, mpCost: 40 },
                { name: '王之护盾', type: 'buff', mpCost: 25, statusEffect: 'SHIELD', statusDuration: 3 },
                { name: '灵魂收割', type: 'drain', power: 60, mpCost: 30, drainPercent: 0.5 }
            ],
            loot: [{ itemId: 'sword_dragon', chance: 50 }, { itemId: 'armor_dragon', chance: 40 }],
            minFloor: 20
        }
    },

    // ==========================================
    // QUESTS DATABASE
    // ==========================================
    quests: {
        q_tutorial: {
            id: 'q_tutorial', name: '初入地牢', type: 'main',
            description: '探索地牢的第一层，熟悉环境并击败一些怪物。',
            objectives: [
                { id: 'kill_3', type: 'kill', target: 'slime_green', count: 3, description: '击败3只绿色史莱姆' }
            ],
            rewards: { exp: 50, gold: 30, items: [{ id: 'potion_hp_small', rarity: 'COMMON' }] },
            minFloor: 1
        },
        q_rat_problem: {
            id: 'q_rat_problem', name: '鼠患', type: 'side',
            description: '地牢里的巨型老鼠越来越多了，帮忙清理一下吧。',
            objectives: [
                { id: 'kill_rats', type: 'kill', target: 'rat_giant', count: 5, description: '击败5只巨型老鼠' }
            ],
            rewards: { exp: 40, gold: 25 },
            minFloor: 1
        },
        q_skeleton_threat: {
            id: 'q_skeleton_threat', name: '骷髅威胁', type: 'main',
            description: '骷髅兵开始在地牢中出没，必须消灭它们。',
            objectives: [
                { id: 'kill_skeletons', type: 'kill', target: 'skeleton', count: 5, description: '击败5个骷髅兵' }
            ],
            rewards: { exp: 80, gold: 50, items: [{ id: 'sword_iron', rarity: 'UNCOMMON' }] },
            minFloor: 2
        },
        q_spider_nest: {
            id: 'q_spider_nest', name: '蜘蛛巢穴', type: 'side',
            description: '巨型蜘蛛在地牢深处筑巢，清除它们的威胁。',
            objectives: [
                { id: 'kill_spiders', type: 'kill', target: 'spider_giant', count: 4, description: '击败4只巨型蜘蛛' }
            ],
            rewards: { exp: 60, gold: 40, items: [{ id: 'potion_cure', rarity: 'COMMON' }] },
            minFloor: 3
        },
        q_deep_exploration: {
            id: 'q_deep_exploration', name: '深入探索', type: 'main',
            description: '继续深入地牢，到达第5层。',
            objectives: [
                { id: 'reach_5', type: 'reach', target: 5, count: 1, description: '到达地牢第5层' }
            ],
            rewards: { exp: 150, gold: 100, items: [{ id: 'ring_hp', rarity: 'UNCOMMON' }] },
            minFloor: 3
        },
        q_orc_invasion: {
            id: 'q_orc_invasion', name: '兽人入侵', type: 'main',
            description: '兽人战士开始入侵地牢，击退它们！',
            objectives: [
                { id: 'kill_orcs', type: 'kill', target: 'orc_warrior', count: 6, description: '击败6个兽人战士' }
            ],
            rewards: { exp: 120, gold: 80, items: [{ id: 'armor_chain', rarity: 'RARE' }] },
            minFloor: 5
        },
        q_ghost_hunt: {
            id: 'q_ghost_hunt', name: '猎鬼行动', type: 'side',
            description: '幽灵在地牢中游荡，消灭它们以安抚亡灵。',
            objectives: [
                { id: 'kill_ghosts', type: 'kill', target: 'ghost', count: 5, description: '击败5个幽灵' }
            ],
            rewards: { exp: 100, gold: 60, items: [{ id: 'amulet_luck', rarity: 'UNCOMMON' }] },
            minFloor: 5
        },
        q_dark_knight_challenge: {
            id: 'q_dark_knight_challenge', name: '暗黑骑士的挑战', type: 'main',
            description: '暗黑骑士守卫着地牢深处，击败它们以继续前进。',
            objectives: [
                { id: 'kill_dk', type: 'kill', target: 'dark_knight', count: 4, description: '击败4个暗黑骑士' }
            ],
            rewards: { exp: 200, gold: 150, items: [{ id: 'sword_silver', rarity: 'RARE' }] },
            minFloor: 8
        },
        q_reach_floor10: {
            id: 'q_reach_floor10', name: '深渊之门', type: 'main',
            description: '到达地牢第10层，面对火焰巨龙的挑战。',
            objectives: [
                { id: 'reach_10', type: 'reach', target: 10, count: 1, description: '到达地牢第10层' }
            ],
            rewards: { exp: 300, gold: 200, items: [{ id: 'amulet_vitality', rarity: 'RARE' }] },
            minFloor: 8
        },
        q_dragon_slayer: {
            id: 'q_dragon_slayer', name: '屠龙勇士', type: 'main',
            description: '击败幼龙，证明你的实力。',
            objectives: [
                { id: 'kill_dragons', type: 'kill', target: 'dragon_young', count: 3, description: '击败3条幼龙' }
            ],
            rewards: { exp: 400, gold: 300, items: [{ id: 'helm_dragon', rarity: 'EPIC' }] },
            minFloor: 13
        },
        q_lich_king: {
            id: 'q_lich_king', name: '巫妖之祸', type: 'side',
            description: '巫妖正在地牢中施展黑暗仪式，阻止它们。',
            objectives: [
                { id: 'kill_liches', type: 'kill', target: 'lich', count: 3, description: '击败3个巫妖' }
            ],
            rewards: { exp: 350, gold: 250, items: [{ id: 'staff_elemental', rarity: 'EPIC' }] },
            minFloor: 14
        },
        q_final_descent: {
            id: 'q_final_descent', name: '最终降临', type: 'main',
            description: '到达地牢最深处，面对暗影之王。',
            objectives: [
                { id: 'reach_20', type: 'reach', target: 20, count: 1, description: '到达地牢第20层' }
            ],
            rewards: { exp: 1000, gold: 500, items: [{ id: 'amulet_dragon', rarity: 'LEGENDARY' }] },
            minFloor: 16
        }
    },

    // ==========================================
    // NPCs DATABASE
    // ==========================================
    npcs: {
        merchant: {
            id: 'merchant', name: '旅行商人', icon: '🧔',
            dialog: {
                text: '欢迎光临！我这里有各种好东西，要看看吗？',
                choices: []
            },
            shop: true
        },
        healer: {
            id: 'healer', name: '治疗师', icon: '👩‍⚕️',
            dialog: () => ({
                text: '你看起来受伤了，让我帮你治疗吧。',
                choices: [
                    {
                        text: `治疗 (${Math.floor(Player.level * 5)} 金币)`,
                        action: () => {
                            const cost = Math.floor(Player.level * 5);
                            if (Player.gold >= cost) {
                                Player.gold -= cost;
                                Player.hp = Player.maxHp;
                                Player.mp = Player.maxMp;
                                Player.statusEffects = [];
                                GameUI.addLog('治疗师恢复了你的生命和法力', 'system');
                                GameUI.notify('已完全恢复！', 'success');
                            } else {
                                GameUI.notify('金币不足！', 'warning');
                            }
                            GameUI.closeDialog();
                            GameUI.updateAllUI();
                        }
                    },
                    { text: '不用了', action: () => GameUI.closeDialog() }
                ]
            })
        },
        sage: {
            id: 'sage', name: '智者', icon: '🧙',
            dialog: () => {
                const tips = [
                    '火属性克制冰属性，冰属性克制雷属性，雷属性克制水属性。',
                    '盗贼可以发现隐藏的陷阱，其他职业要小心脚下。',
                    '每5层会有一个BOSS，做好准备再前进。',
                    '传说级装备拥有特殊效果，非常强大。',
                    '商店每3层出现一次，记得补充物资。',
                    '水晶可以恢复法力值，不要错过。',
                    '防御不仅能减伤，还能恢复少量生命。',
                    '暴击率和暴击伤害是盗贼的核心属性。'
                ];
                return {
                    text: Utils.pick(tips),
                    choices: [{ text: '谢谢', action: () => GameUI.closeDialog() }]
                };
            }
        },
        blacksmith: {
            id: 'blacksmith', name: '铁匠', icon: '⚒️',
            dialog: {
                text: '需要锻造装备吗？把材料带来，我帮你打造。',
                choices: [
                    { text: '打开锻造', action: () => { GameUI.closeDialog(); GameUI.openForge(); } },
                    { text: '离开', action: () => GameUI.closeDialog() }
                ]
            }
        }
    },

    // ==========================================
    // SHOP INVENTORIES
    // ==========================================
    shopInventories: {
        1: ['potion_hp_small', 'potion_mp_small', 'scroll_escape', 'sword_iron', 'armor_leather', 'helm_leather', 'boots_leather', 'ring_hp'],
        3: ['potion_hp_small', 'potion_mp_small', 'potion_cure', 'potion_berserk', 'sword_steel', 'armor_chain', 'helm_iron', 'boots_iron', 'ring_power', 'amulet_luck'],
        6: ['potion_hp_medium', 'potion_mp_medium', 'potion_cure', 'potion_haste', 'potion_shield', 'sword_silver', 'armor_plate', 'helm_steel', 'legs_chain', 'boots_swift', 'ring_crit', 'amulet_vitality'],
        9: ['potion_hp_medium', 'potion_mp_medium', 'potion_berserk', 'potion_haste', 'sword_flame', 'sword_ice', 'sword_thunder', 'armor_mithril', 'helm_mithril', 'legs_plate', 'boots_shadow', 'amulet_wisdom'],
        12: ['potion_hp_large', 'potion_mp_large', 'potion_full', 'sword_dark', 'sword_holy', 'armor_dragon', 'helm_dragon', 'legs_mithril', 'boots_dragon', 'amulet_dragon'],
        15: ['potion_hp_large', 'potion_mp_large', 'potion_full', 'potion_hp_percent', 'sword_dragon', 'armor_dragon', 'helm_dragon', 'boots_dragon', 'amulet_dragon'],
        18: ['potion_full', 'potion_hp_percent', 'sword_dragon', 'armor_dragon', 'helm_dragon', 'boots_dragon', 'amulet_dragon']
    },

    // ==========================================
    // FORGE RECIPES
    // ==========================================
    forgeRecipes: [
        {
            id: 'forge_steel_sword', name: '钢剑', result: 'sword_steel', resultRarity: 'UNCOMMON',
            materials: [{ id: 'mat_iron_ore', count: 5 }], goldCost: 100
        },
        {
            id: 'forge_silver_sword', name: '银剑', result: 'sword_silver', resultRarity: 'RARE',
            materials: [{ id: 'mat_iron_ore', count: 8 }, { id: 'mat_crystal', count: 3 }], goldCost: 300
        },
        {
            id: 'forge_mithril_armor', name: '秘银铠甲', result: 'armor_mithril', resultRarity: 'RARE',
            materials: [{ id: 'mat_mithril', count: 5 }, { id: 'mat_iron_ore', count: 10 }], goldCost: 500
        },
        {
            id: 'forge_dragon_sword', name: '屠龙剑', result: 'sword_dragon', resultRarity: 'EPIC',
            materials: [{ id: 'mat_dragon_scale', count: 8 }, { id: 'mat_mithril', count: 5 }, { id: 'mat_crystal', count: 5 }], goldCost: 1500
        },
        {
            id: 'forge_dragon_armor', name: '龙鳞铠甲', result: 'armor_dragon', resultRarity: 'EPIC',
            materials: [{ id: 'mat_dragon_scale', count: 10 }, { id: 'mat_mithril', count: 8 }], goldCost: 1200
        },
        {
            id: 'forge_holy_sword', name: '圣光之剑', result: 'sword_holy', resultRarity: 'EPIC',
            materials: [{ id: 'mat_holy_shard', count: 6 }, { id: 'mat_crystal', count: 5 }, { id: 'mat_mithril', count: 3 }], goldCost: 800
        },
        {
            id: 'forge_dark_blade', name: '暗影之刃', result: 'sword_dark', resultRarity: 'EPIC',
            materials: [{ id: 'mat_dark_essence', count: 6 }, { id: 'mat_crystal', count: 5 }, { id: 'mat_iron_ore', count: 5 }], goldCost: 800
        }
    ],

    // ==========================================
    // DATA ACCESS METHODS
    // ==========================================
    getMonstersByFloor(floor) {
        const result = [];
        for (const id in this.monsters) {
            const m = this.monsters[id];
            if (floor >= m.minFloor && floor <= (m.maxFloor || 999)) {
                result.push(m);
            }
        }
        return result.length > 0 ? result : [this.monsters.slime_green];
    },

    getBoss(floor) {
        for (const id in this.bosses) {
            if (this.bosses[id].minFloor === floor) {
                return this.bosses[id];
            }
        }
        // Generate a scaled boss for non-defined floors
        const bossKeys = Object.keys(this.bosses);
        const template = this.bosses[bossKeys[bossKeys.length - 1]];
        return { ...template, level: template.level + floor - template.minFloor };
    },

    getBossLoot(floor) {
        const bossLootTable = {
            5: 'sword_steel',
            10: 'sword_flame',
            15: 'sword_dark',
            20: 'sword_dragon'
        };
        const itemId = bossLootTable[floor];
        return itemId ? this.items[itemId] : this.items['sword_silver'];
    },

    getItemsByFloorAndRarity(floor, rarity) {
        const result = [];
        for (const id in this.items) {
            const item = this.items[id];
            if (item.type === 'material' || item.type === 'consumable') {
                if (floor >= (item.minFloor || 1)) {
                    result.push(item);
                }
            } else {
                if (floor >= (item.minFloor || 1) && floor <= (item.minFloor || 1) + 8) {
                    result.push(item);
                }
            }
        }
        return result.length > 0 ? result : [this.items.potion_hp_small];
    },

    getSkillsAtLevel(className, level) {
        const result = [];
        for (const id in this.skills) {
            const skill = this.skills[id];
            if (skill.class === className && skill.level === level) {
                result.push(skill);
            }
        }
        return result;
    },

    getStartingSkills(className) {
        const result = [];
        for (const id in this.skills) {
            const skill = this.skills[id];
            if (skill.class === className && skill.level <= 1) {
                result.push(skill);
            }
        }
        return result;
    },

    getStartingEquipment(className) {
        const equipMap = {
            warrior: { weapon: this.items.sword_rusty, body: this.items.armor_leather },
            mage: { weapon: this.items.staff_wood, body: this.items.robe_apprentice },
            rogue: { weapon: this.items.dagger_iron, body: this.items.armor_leather },
            paladin: { weapon: this.items.mace_iron, body: this.items.armor_leather }
        };
        return equipMap[className] || equipMap.warrior;
    },

    getQuestsByFloor(floor) {
        const result = [];
        for (const id in this.quests) {
            const quest = this.quests[id];
            if (floor >= quest.minFloor && floor <= quest.minFloor + 3) {
                result.push(quest);
            }
        }
        return result;
    },

    getNPCs(floor) {
        const available = [this.npcs.sage];
        if (floor % 2 === 0) available.push(this.npcs.healer);
        if (floor % 3 === 0) available.push(this.npcs.merchant);
        if (floor >= 5) available.push(this.npcs.blacksmith);
        return available;
    },

    getShopInventory(floor) {
        // Find the closest shop tier
        const tiers = Object.keys(this.shopInventories).map(Number).sort((a, b) => a - b);
        let tier = tiers[0];
        for (const t of tiers) {
            if (t <= floor) tier = t;
        }
        const itemIds = this.shopInventories[tier] || this.shopInventories[1];
        return itemIds.map(id => this.items[id]).filter(Boolean);
    },

    getForgeRecipes() {
        return this.forgeRecipes;
    }
};
