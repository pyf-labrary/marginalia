/* ============================================================
   achievements.js - 成就系统
   ============================================================ */

'use strict';

window.ACHIEVEMENTS = [

    // ── 寿命成就 ────────────────────────────────────────────
    {
        id: 'live_to_50',
        name: '知天命',
        icon: '🕯️',
        desc: '活到50岁',
        rarity: 'common',
        check: function(s) { return s.age >= 50; }
    },
    {
        id: 'live_to_70',
        name: '古稀之年',
        icon: '🌅',
        desc: '活到70岁',
        rarity: 'rare',
        check: function(s) { return s.age >= 70; }
    },
    {
        id: 'live_to_80',
        name: '耄耋长者',
        icon: '🌠',
        desc: '活到80岁',
        rarity: 'rare',
        check: function(s) { return s.age >= 80; }
    },
    {
        id: 'live_to_90',
        name: '人瑞之寿',
        icon: '✨',
        desc: '活到90岁',
        rarity: 'epic',
        check: function(s) { return s.age >= 90; }
    },
    {
        id: 'live_to_100',
        name: '百岁人瑞',
        icon: '👑',
        desc: '活到100岁',
        rarity: 'legendary',
        check: function(s) { return s.age >= 100; }
    },

    // ── 属性成就 ────────────────────────────────────────────
    {
        id: 'max_appearance',
        name: '倾国倾城',
        icon: '💅',
        desc: '颜值达到90以上',
        rarity: 'rare',
        check: function(s) { return s.attributes.appearance >= 90; }
    },
    {
        id: 'max_intelligence',
        name: '旷世天才',
        icon: '🧠',
        desc: '智力达到90以上',
        rarity: 'rare',
        check: function(s) { return s.attributes.intelligence >= 90; }
    },
    {
        id: 'max_constitution',
        name: '金刚不坏',
        icon: '💪',
        desc: '体质达到90以上',
        rarity: 'rare',
        check: function(s) { return s.attributes.constitution >= 90; }
    },
    {
        id: 'max_wealth',
        name: '富可敌国',
        icon: '💰',
        desc: '家境/财富达到90以上',
        rarity: 'epic',
        check: function(s) { return s.attributes.wealth >= 90; }
    },
    {
        id: 'max_luck',
        name: '气运天子',
        icon: '🍀',
        desc: '幸运达到90以上',
        rarity: 'epic',
        check: function(s) { return s.attributes.luck >= 90; }
    },
    {
        id: 'all_max',
        name: '人生赢家',
        icon: '🌟',
        desc: '所有属性都达到75以上',
        rarity: 'legendary',
        check: function(s) {
            return Object.values(s.attributes).every(v => v >= 75);
        }
    },
    {
        id: 'all_low',
        name: '天命多舛',
        icon: '😢',
        desc: '所有属性都低于25',
        rarity: 'common',
        check: function(s) {
            return Object.values(s.attributes).every(v => v < 25);
        }
    },

    // ── 职业成就 ────────────────────────────────────────────
    {
        id: 'become_doctor',
        name: '悬壶济世',
        icon: '🏥',
        desc: '成为医生',
        rarity: 'rare',
        check: function(s) { return s.conditions.job === 'doctor'; }
    },
    {
        id: 'become_entrepreneur',
        name: '商界传奇',
        icon: '🚀',
        desc: '创业成功',
        rarity: 'epic',
        check: function(s) { return s.conditions.business_success; }
    },
    {
        id: 'become_celebrity',
        name: '万众瞩目',
        icon: '🌟',
        desc: '成为明星',
        rarity: 'epic',
        check: function(s) { return s.conditions.job === 'celebrity'; }
    },
    {
        id: 'become_scientist',
        name: '探索宇宙',
        icon: '🔬',
        desc: '成为科学家',
        rarity: 'rare',
        check: function(s) { return s.conditions.job === 'scientist'; }
    },
    {
        id: 'become_politician',
        name: '庙堂之上',
        icon: '🏛️',
        desc: '进入政界',
        rarity: 'epic',
        check: function(s) { return s.conditions.job === 'politician'; }
    },

    // ── 人生经历成就 ────────────────────────────────────────
    {
        id: 'get_married',
        name: '执子之手',
        icon: '💍',
        desc: '结婚',
        rarity: 'common',
        check: function(s) { return s.conditions.married; }
    },
    {
        id: 'have_child',
        name: '初为人父母',
        icon: '👶',
        desc: '有了第一个孩子',
        rarity: 'common',
        check: function(s) { return s.conditions.has_children; }
    },
    {
        id: 'have_grandchild',
        name: '含饴弄孙',
        icon: '👴',
        desc: '有了孙子孙女',
        rarity: 'rare',
        check: function(s) { return s.conditions.has_grandchildren; }
    },
    {
        id: 'buy_house',
        name: '安居乐业',
        icon: '🏠',
        desc: '买了一套房',
        rarity: 'common',
        check: function(s) { return s.conditions.has_house; }
    },
    {
        id: 'studied_abroad',
        name: '海归精英',
        icon: '✈️',
        desc: '出国留学',
        rarity: 'rare',
        check: function(s) { return s.conditions.studied_abroad; }
    },
    {
        id: 'win_lottery',
        name: '天降横财',
        icon: '🎰',
        desc: '中了彩票',
        rarity: 'epic',
        check: function(s) { return s.attributes.luck >= 80 && s.conditions.lottery_won; }
    },
    {
        id: 'survived_bullying',
        name: '愈战愈勇',
        icon: '🥊',
        desc: '经历过霸凌但活下来了',
        rarity: 'common',
        check: function(s) { return s.conditions.survived_bully && s.age >= 20; }
    },
    {
        id: 'started_business',
        name: '创业先锋',
        icon: '💼',
        desc: '尝试过创业（不论成败）',
        rarity: 'common',
        check: function(s) { return s.conditions.started_business; }
    },

    // ── 特殊结局成就 ────────────────────────────────────────
    {
        id: 'perfect_life',
        name: '圆满人生',
        icon: '🌈',
        desc: '结婚、有孩子、有孙子孙女，并活过80岁',
        rarity: 'legendary',
        check: function(s) {
            return s.conditions.married &&
                   s.conditions.has_children &&
                   s.conditions.has_grandchildren &&
                   s.age >= 80;
        }
    },
    {
        id: 'die_young',
        name: '天妒英才',
        icon: '🕊️',
        desc: '在30岁之前死亡',
        rarity: 'rare',
        check: function(s) { return !s.isAlive && s.age < 30; }
    },
    {
        id: 'die_old',
        name: '无疾而终',
        icon: '🌸',
        desc: '以老龄自然死亡',
        rarity: 'rare',
        check: function(s) { return !s.isAlive && s.age >= 75 && s.deathCause === 'old_age'; }
    },
    {
        id: 'first_reincarnation',
        name: '初入轮回',
        icon: '🔄',
        desc: '完成第一次人生',
        rarity: 'common',
        check: function(s) { return !s.isAlive; }
    },
    {
        id: 'ten_reincarnations',
        name: '轮回老手',
        icon: '🌀',
        desc: '完成10次人生',
        rarity: 'rare',
        check: function(s, global) { return global.totalLives >= 10; }
    },
    {
        id: 'retired_happy',
        name: '安享晚年',
        icon: '🏖️',
        desc: '退休并活到70岁以上',
        rarity: 'rare',
        check: function(s) { return s.conditions.retired && s.age >= 70; }
    },
    {
        id: 'never_married',
        name: '自由灵魂',
        icon: '🦅',
        desc: '终生未婚但活过70岁',
        rarity: 'rare',
        check: function(s) { return !s.conditions.married && s.age >= 70; }
    },
    {
        id: 'overachiever',
        name: '超级卷王',
        icon: '📈',
        desc: '既当了领导，又有家庭，又活过70岁',
        rarity: 'epic',
        check: function(s) {
            return s.conditions.promoted &&
                   s.conditions.has_children &&
                   s.age >= 70;
        }
    },
    {
        id: 'born_lucky',
        name: '天生好命',
        icon: '🌠',
        desc: '出生时幸运值在80以上',
        rarity: 'rare',
        check: function(s) { return s.character && s.character.birthLuck >= 80; }
    },
    {
        id: 'late_bloomer',
        name: '大器晚成',
        icon: '🎆',
        desc: '50岁之后事业达到巅峰',
        rarity: 'epic',
        check: function(s) { return s.conditions.career_peak && s.age >= 50; }
    }
];

// ── 检查本局有哪些新成就 ────────────────────────────────────
window.checkNewAchievements = function(state, globalState) {
    const newlyUnlocked = [];
    const unlocked = globalState.achievements || {};

    for (const ach of ACHIEVEMENTS) {
        if (unlocked[ach.id]) continue;
        try {
            if (ach.check(state, globalState)) {
                newlyUnlocked.push(ach);
                unlocked[ach.id] = true;
            }
        } catch (e) {
            // 跳过条件检查出错的成就
        }
    }

    globalState.achievements = unlocked;
    return newlyUnlocked;
};

// ── 获取成就解锁数量 ────────────────────────────────────────
window.getAchievementCount = function(globalState) {
    return Object.keys(globalState.achievements || {}).length;
};

console.log('[achievements.js] 加载完成，共', window.ACHIEVEMENTS.length, '个成就');
