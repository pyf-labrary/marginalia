/* ============================================================
   character.js - 角色生成与管理
   ============================================================ */

'use strict';

// ── 生成随机初始属性 ─────────────────────────────────────────
function rollAttributes() {
    return {
        appearance:   randomStat(1, 100),
        intelligence: randomStat(1, 100),
        constitution: randomStat(1, 100),
        wealth:       randomStat(1, 100),
        luck:         randomStat(1, 100)
    };
}

// ── 应用国家加成 ─────────────────────────────────────────────
function applyCountryMods(attrs, country) {
    const result = Object.assign({}, attrs);
    if (country.mods) {
        for (const [k, v] of Object.entries(country.mods)) {
            if (result[k] !== undefined) {
                result[k] = clamp(result[k] + v, 1, 100);
            }
        }
    }
    return result;
}

// ── 应用天赋加成 ─────────────────────────────────────────────
function applyTalentBonus(attrs, talent) {
    if (!talent || !talent.bonus) return attrs;
    const result = Object.assign({}, attrs);
    for (const [k, v] of Object.entries(talent.bonus)) {
        if (result[k] !== undefined) {
            result[k] = clamp(result[k] + v, 1, 100);
        }
    }
    return result;
}

// ── 生成一个新角色 ───────────────────────────────────────────
window.generateCharacter = function() {
    const gender = Math.random() < 0.5 ? 'male' : 'female';
    const country = randomChoice(COUNTRIES);
    const name = generateName(gender);
    const birthYear = generateBirthYear();
    const rawAttrs = rollAttributes();
    const baseAttrs = applyCountryMods(rawAttrs, country);

    return {
        name,
        gender,
        country,
        birthYear,
        baseAttributes: baseAttrs,
        // 记录出生幸运值（用于某些成就）
        birthLuck: baseAttrs.luck
    };
};

// ── 创建初始游戏状态 ─────────────────────────────────────────
window.createLifeState = function(character, talent) {
    const attrs = applyTalentBonus(
        Object.assign({}, character.baseAttributes),
        talent
    );

    return {
        // 角色基本信息
        character: character,
        talent: talent,

        // 当前属性（0-100，游戏中会变化）
        attributes: attrs,

        // 当前年龄
        age: 0,

        // 是否存活
        isAlive: true,

        // 死亡原因（id）
        deathCause: null,

        // 条件标记（各种人生状态）
        conditions: {
            job: null,
            married: false,
            in_love: false,
            has_children: false,
            has_grandchildren: false,
            children_count: 0,
            education: null,
            has_house: false,
            athlete: false,
            has_pet: false,
            has_piano: false,
            has_art: false,
            coding_interest: false,
            smoker: false,
            gambler: false,
            ill: false,
            chronic_ill: false,
            dementia: false,
            school_started: false,
            graduated_high_school: false,
            went_to_college: false,
            studied_abroad: false,
            started_business: false,
            business_success: false,
            promoted: false,
            career_peak: false,
            retired: false,
            fitness: false,
            student_council: false,
            first_love_success: false,
            parents_divorced: false,
            survived_bully: false,
            lottery_won: false,
            job_worker: false,
            vocational_training: false
        },

        // 人生日志
        lifeLog: [],

        // 人生高光时刻（重要事件）
        highlights: [],

        // 已使用的one-shot事件
        usedEvents: new Set(),

        // 本年已处理事件数
        yearEventCount: 0,

        // 自动推进计时器
        autoTimer: null
    };
};

// ── 属性安全修改 ─────────────────────────────────────────────
window.applyEffect = function(state, effect) {
    if (!effect || typeof effect !== 'object') return;
    for (const [k, v] of Object.entries(effect)) {
        if (state.attributes[k] !== undefined) {
            state.attributes[k] = clamp(state.attributes[k] + v, 0, 100);
        }
    }
};

// ── 应用天赋被动效果（放大事件收益） ────────────────────────
window.applyTalentPassive = function(state, effect) {
    if (!effect || !state.talent) return effect;
    const passive = state.talent.passive;
    const result = Object.assign({}, effect);

    switch (passive) {
        case 'study_bonus':
            // 学习类事件智力收益翻倍
            if (result.intelligence && result.intelligence > 0) {
                result.intelligence = Math.round(result.intelligence * 1.8);
            }
            break;
        case 'appearance_bonus':
            if (result.appearance && result.appearance > 0) {
                result.appearance = Math.round(result.appearance * 1.5);
            }
            break;
        case 'luck_bonus':
            if (result.luck && result.luck > 0) {
                result.luck = Math.round(result.luck * 1.5);
            }
            break;
        case 'wealth_bonus':
            if (result.wealth && result.wealth > 0) {
                result.wealth = Math.round(result.wealth * 1.5);
            }
            break;
        case 'longevity':
            if (result.constitution && result.constitution > 0) {
                result.constitution = Math.round(result.constitution * 1.5);
            }
            break;
        case 'romance_bonus':
            if (result.luck && result.luck > 0) result.luck += 1;
            if (result.appearance && result.appearance > 0) result.appearance += 1;
            break;
        case 'business_bonus':
            if (result.wealth && result.wealth > 0) {
                result.wealth = Math.round(result.wealth * 1.4);
            }
            break;
    }

    return result;
};

// ── 计算死亡概率 ─────────────────────────────────────────────
window.calcDeathProbability = function(state) {
    const { age, attributes, conditions } = state;
    const { constitution, luck } = attributes;

    let prob = 0;

    if (age < 5) {
        prob = 0.008 - constitution * 0.00006;
    } else if (age < 20) {
        prob = 0.002 - constitution * 0.00003;
    } else if (age < 40) {
        prob = 0.004 - constitution * 0.00004;
    } else if (age < 60) {
        prob = 0.012 + (age - 40) * 0.001 - constitution * 0.00008;
    } else if (age < 80) {
        prob = 0.04 + (age - 60) * 0.004 - constitution * 0.0003;
    } else if (age < 90) {
        prob = 0.12 + (age - 80) * 0.012 - constitution * 0.0005;
    } else {
        prob = 0.25 + (age - 90) * 0.025;
    }

    // 幸运修正
    prob -= (luck - 50) * 0.0003;

    // 病弱加成
    if (conditions.ill) prob += 0.02;
    if (conditions.chronic_ill) prob += 0.01;
    if (conditions.dementia) prob += 0.03;

    // 天赋体育健将减少死亡率
    if (state.talent && state.talent.passive === 'longevity') {
        prob *= 0.7;
    }

    return Math.max(0, Math.min(0.95, prob));
};

// ── 选择死亡原因 ─────────────────────────────────────────────
window.chooseDeath = function(state) {
    const { age } = state;
    const eligible = DEATH_CAUSES.filter(d => {
        if (d.minAge && age < d.minAge) return false;
        if (d.maxAge && age > d.maxAge) return false;
        return true;
    });

    if (age >= 70) {
        const natural = eligible.find(d => d.id === 'old_age');
        if (natural && Math.random() < 0.6) return natural;
    }

    if (state.conditions.dementia) {
        return eligible.find(d => d.id === 'disease') || eligible[0];
    }

    return randomChoice(eligible) || DEATH_CAUSES[0];
};

// ── 获取属性颜色 ─────────────────────────────────────────────
window.getAttrColor = function(value) {
    if (value >= 80) return '#e0b040';
    if (value >= 60) return '#40c080';
    if (value >= 40) return '#4090e0';
    if (value >= 20) return '#fdcb6e';
    return '#e05050';
};

// ── 计算人生总评 ─────────────────────────────────────────────
window.calcLifeScore = function(state) {
    const attrSum = Object.values(state.attributes).reduce((a, b) => a + b, 0);
    const ageBonus = Math.min(state.age * 0.5, 30);
    const condBonus =
        (state.conditions.married ? 5 : 0) +
        (state.conditions.has_children ? 5 : 0) +
        (state.conditions.has_grandchildren ? 8 : 0) +
        (state.conditions.business_success ? 10 : 0) +
        (state.conditions.has_house ? 3 : 0);
    return Math.round(attrSum / 5 + ageBonus + condBonus);
};

console.log('[character.js] 加载完成');
