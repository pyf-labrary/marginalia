/* ============================================================
   data.js - 游戏核心数据
   ============================================================ */

'use strict';

// ── 属性定义 ────────────────────────────────────────────────
window.ATTRS = {
    appearance:   { name: '颜值', icon: '✨', color: '#e05090' },
    intelligence: { name: '智力', icon: '🧠', color: '#40c0c0' },
    constitution: { name: '体质', icon: '💪', color: '#4090e0' },
    wealth:       { name: '家境', icon: '💰', color: '#e0b040' },
    luck:         { name: '幸运', icon: '🍀', color: '#7c5cbf' }
};

// ── 天赋列表 ────────────────────────────────────────────────
window.TALENTS = [
    {
        id: 'beautiful',
        name: '天生丽质',
        icon: '💅',
        description: '颜值+20，社交事件额外收益',
        bonus: { appearance: 20 },
        passive: 'appearance_bonus'
    },
    {
        id: 'genius',
        name: '天才学子',
        icon: '📚',
        description: '智力+20，所有学习收益翻倍',
        bonus: { intelligence: 20 },
        passive: 'study_bonus'
    },
    {
        id: 'athlete',
        name: '体育健将',
        icon: '🏃',
        description: '体质+20，寿命上限延长',
        bonus: { constitution: 20 },
        passive: 'longevity'
    },
    {
        id: 'rich_kid',
        name: '富家千金',
        icon: '💎',
        description: '家境+20，财富事件更多机遇',
        bonus: { wealth: 20 },
        passive: 'wealth_bonus'
    },
    {
        id: 'lucky',
        name: '天选之人',
        icon: '⭐',
        description: '幸运+20，意外之喜频频降临',
        bonus: { luck: 20 },
        passive: 'luck_bonus'
    },
    {
        id: 'balanced',
        name: '全面发展',
        icon: '🎯',
        description: '全属性+8，均衡成长无明显短板',
        bonus: { appearance: 8, intelligence: 8, constitution: 8, wealth: 8, luck: 8 },
        passive: null
    },
    {
        id: 'scholar',
        name: '书香门第',
        icon: '📖',
        description: '智力+12，家境+8，学历道路畅通',
        bonus: { intelligence: 12, wealth: 8 },
        passive: 'scholar_path'
    },
    {
        id: 'street_smart',
        name: '社会历练',
        icon: '🗺️',
        description: '幸运+12，体质+8，社会经验丰富',
        bonus: { luck: 12, constitution: 8 },
        passive: 'social_bonus'
    },
    {
        id: 'charming',
        name: '万人迷',
        icon: '💖',
        description: '颜值+15，幸运+8，爱情运势绝佳',
        bonus: { appearance: 15, luck: 8 },
        passive: 'romance_bonus'
    },
    {
        id: 'entrepreneur',
        name: '商业奇才',
        icon: '💼',
        description: '家境+12，智力+8，创业特殊加成',
        bonus: { wealth: 12, intelligence: 8 },
        passive: 'business_bonus'
    }
];

// ── 国家/地区 ────────────────────────────────────────────────
window.COUNTRIES = [
    { id: 'china',       name: '中国',   flag: '🇨🇳', mods: { intelligence: 5 } },
    { id: 'usa',         name: '美国',   flag: '🇺🇸', mods: { wealth: 5, luck: 2 } },
    { id: 'japan',       name: '日本',   flag: '🇯🇵', mods: { constitution: 5, intelligence: 3 } },
    { id: 'uk',          name: '英国',   flag: '🇬🇧', mods: { intelligence: 3, wealth: 3 } },
    { id: 'india',       name: '印度',   flag: '🇮🇳', mods: { intelligence: 5 } },
    { id: 'brazil',      name: '巴西',   flag: '🇧🇷', mods: { appearance: 5, luck: 3 } },
    { id: 'france',      name: '法国',   flag: '🇫🇷', mods: { appearance: 5, intelligence: 2 } },
    { id: 'south_korea', name: '韩国',   flag: '🇰🇷', mods: { appearance: 8, intelligence: 2 } },
    { id: 'canada',      name: '加拿大', flag: '🇨🇦', mods: { constitution: 3, luck: 5 } },
    { id: 'unknown',     name: '异界',   flag: '🌀', mods: { luck: 12, appearance: -5 } }
];

// ── 姓名数据 ────────────────────────────────────────────────
window.NAME_DATA = {
    surnames: ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈',
               '张', '刘', '黄', '林', '徐', '马', '宋', '唐', '谢', '邓',
               '沈', '韩', '杨', '朱', '秦', '许', '何', '吕', '施', '于'],
    male_given: ['伟', '浩', '宇', '轩', '远', '博', '文', '武', '杰', '超',
                 '凯', '磊', '阳', '帆', '彬', '昊', '翔', '晨', '峰', '俊',
                 '子墨', '天宇', '浩然', '宇轩', '明哲', '子豪', '俊杰', '雨泽', '梓豪', '浩宇'],
    female_given: ['芳', '静', '敏', '艳', '娟', '玲', '倩', '雪', '梅', '莉',
                   '琳', '婷', '慧', '燕', '丹', '洁', '萍', '若曦', '诗涵', '紫萱',
                   '雅欣', '佳怡', '梦洁', '语桐', '可欣', '悦然', '晓彤', '锦绣', '芸汐', '灵儿']
};

// ── 死亡原因 ────────────────────────────────────────────────
window.DEATH_CAUSES = [
    { id: 'old_age',     text: '寿终正寝',   desc: '你安详地离开了这个世界，走完了精彩的一生。',    minAge: 70 },
    { id: 'heart',       text: '心脏病突发', desc: '心脏突然停止跳动，一切都是那么猝不及防。',     minAge: 45 },
    { id: 'cancer',      text: '病魔缠身',   desc: '经过漫长的抗争，你终究没能战胜病魔。',         minAge: 35 },
    { id: 'stroke',      text: '脑溢血',     desc: '一场突如其来的脑溢血夺走了你的生命。',        minAge: 50 },
    { id: 'accident',    text: '意外事故',   desc: '谁也没想到，一场意外就这样结束了旅程。',      minAge: 0  },
    { id: 'traffic',     text: '交通事故',   desc: '一场交通事故，生命在瞬间画上了句号。',        minAge: 15 },
    { id: 'drowning',    text: '意外溺水',   desc: '不慎落入水中，未能生还。',                   minAge: 0, maxAge: 25 },
    { id: 'disease',     text: '急症离世',   desc: '一场来势汹汹的急症夺走了你的生命。',          minAge: 0  },
    { id: 'depression',  text: '抑郁离世',   desc: '长期的心理创伤最终将你击垮，无声地离去。',    minAge: 15, maxAge: 55 },
    { id: 'overwork',    text: '过劳猝死',   desc: '因长期过度工作，身体终于承受不住而崩溃。',    minAge: 25, maxAge: 50 }
];

// ── 职业列表 ────────────────────────────────────────────────
window.JOBS = {
    student:     { name: '学生',       icon: '🎓', income: 0 },
    worker:      { name: '工人',       icon: '🔧', income: 1 },
    clerk:       { name: '职员',       icon: '💼', income: 2 },
    teacher:     { name: '教师',       icon: '📝', income: 2 },
    engineer:    { name: '工程师',     icon: '⚙️', income: 3 },
    doctor:      { name: '医生',       icon: '🏥', income: 4 },
    lawyer:      { name: '律师',       icon: '⚖️', income: 4 },
    artist:      { name: '艺术家',     icon: '🎨', income: 2 },
    athlete:     { name: '职业运动员', icon: '🏆', income: 3 },
    entrepreneur:{ name: '企业家',     icon: '🚀', income: 5 },
    scientist:   { name: '科学家',     icon: '🔬', income: 3 },
    celebrity:   { name: '明星',       icon: '🌟', income: 5 },
    politician:  { name: '政界人士',   icon: '🏛️', income: 4 },
    freelancer:  { name: '自由职业',   icon: '🎯', income: 2 },
    unemployed:  { name: '待业',       icon: '🏠', income: 0 }
};

// ── 工具函数 ────────────────────────────────────────────────

window.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

window.randomStat = function(min, max) {
    min = min || 1; max = max || 100;
    // 略向中间集中
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    return Math.round((a + b) / 2);
};

window.randomChoice = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

window.weightedChoice = function(items, weightKey) {
    weightKey = weightKey || 'weight';
    const total = items.reduce((s, it) => s + (it[weightKey] || 1), 0);
    let r = Math.random() * total;
    for (const item of items) {
        r -= (item[weightKey] || 1);
        if (r <= 0) return item;
    }
    return items[items.length - 1];
};

window.clamp = function(v, lo, hi) {
    lo = (lo === undefined) ? 0 : lo;
    hi = (hi === undefined) ? 100 : hi;
    return Math.max(lo, Math.min(hi, v));
};

window.generateName = function(gender) {
    const sur = randomChoice(NAME_DATA.surnames);
    const pool = gender === 'female' ? NAME_DATA.female_given : NAME_DATA.male_given;
    return sur + randomChoice(pool);
};

window.getAttrGrade = function(v) {
    if (v >= 90) return { text: '传奇', color: '#e0b040' };
    if (v >= 75) return { text: '优秀', color: '#a080e0' };
    if (v >= 55) return { text: '良好', color: '#40c080' };
    if (v >= 35) return { text: '普通', color: '#74b9ff' };
    if (v >= 15) return { text: '较差', color: '#fdcb6e' };
    return { text: '悲惨', color: '#e05050' };
};

window.getLifeTitle = function(state) {
    const { age, attributes, conditions } = state;
    const avg = Object.values(attributes).reduce((a, b) => a + b, 0) / 5;
    if (age >= 95) return '百岁人瑞';
    if (age >= 80) return '长寿老者';
    if (conditions.business_success) return '成功企业家';
    if (conditions.job === 'celebrity') return '一代明星';
    if (conditions.job === 'politician') return '一方官员';
    if (conditions.job === 'scientist') return '学术泰斗';
    if (conditions.job === 'doctor') return '悬壶济世者';
    if (conditions.married && conditions.has_children && age >= 60) return '儿孙绕膝的长者';
    if (avg >= 72) return '人生赢家';
    if (avg <= 22) return '命途多舛者';
    if (!conditions.married && age >= 50) return '独行侠';
    if (conditions.has_children) return '平凡的父母';
    return '普通的旅行者';
};

window.formatEffects = function(effect) {
    if (!effect || typeof effect !== 'object') return [];
    return Object.entries(effect)
        .filter(([k]) => ATTRS[k])
        .map(([k, v]) => ({
            key: k,
            name: ATTRS[k].name,
            icon: ATTRS[k].icon,
            value: v,
            cls: v > 0 ? 'effect-pos' : v < 0 ? 'effect-neg' : 'effect-neu'
        }));
};

// 生成出生年份（当前年 - 0~30 年，使游戏有时代感）
window.generateBirthYear = function() {
    const currentYear = new Date().getFullYear();
    return currentYear - randomInt(0, 30);
};

console.log('[data.js] 加载完成');
