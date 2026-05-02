/* ============================================================
   game.js - 游戏主控制器
   ============================================================ */

'use strict';

// ── 全局游戏状态 ─────────────────────────────────────────────
const GlobalState = {
    totalLives: 0,
    maxAge: 0,
    achievements: {},
    history: []       // 最近20条人生记录
};

// ── 当前局状态 ───────────────────────────────────────────────
let State = null;

// ── 事件池 ───────────────────────────────────────────────────
const ALL_EVENTS = [];

// ── 局部变量 ─────────────────────────────────────────────────
let selectedTalentId = null;
let currentCharacter = null;
let rerollsLeft = 3;
let autoPlayTimer = null;
let isAutoPlay = false;

// 事件处理阶段: 'new'|'showing'|'choosing'|'result'
let eventPhase = 'new';
let pendingEvent = null;       // 当前显示的事件对象
let pendingChoiceResult = null;// 选择后的效果

// ── 初始化 ───────────────────────────────────────────────────
function initGame() {
    // 合并所有事件
    ALL_EVENTS.length = 0;
    ALL_EVENTS.push(
        ...CHILDHOOD_EVENTS,
        ...TEEN_EVENTS,
        ...ADULT_EVENTS,
        ...LATE_EVENTS
    );

    // 读取存档
    loadGlobalState();

    // 更新主页统计
    UI.updateStartStats(
        GlobalState.totalLives,
        GlobalState.maxAge,
        getAchievementCount(GlobalState)
    );

    // 绑定所有按钮
    bindButtons();

    UI.showScreen('start');
}

// ── 按钮绑定 ─────────────────────────────────────────────────
function bindButtons() {
    // 主页
    document.getElementById('btn-new-life').onclick = onNewLife;
    document.getElementById('btn-achievements').onclick = onOpenAchievements;
    document.getElementById('btn-history').onclick = onOpenHistory;

    // 出生页
    document.getElementById('btn-reroll').onclick = onReroll;
    document.getElementById('btn-back-birth').onclick = () => UI.showScreen('start');
    document.getElementById('btn-start-life').onclick = onStartLife;

    // 人生页
    document.getElementById('btn-next').onclick = onNext;
    document.getElementById('btn-show-log').onclick = () => UI.toggleLog(true);
    document.getElementById('btn-close-log').onclick = () => UI.toggleLog(false);
    document.getElementById('btn-auto').onclick = toggleAutoPlay;

    // 死亡页
    document.getElementById('btn-reincarnate').onclick = onNewLife;
    document.getElementById('btn-to-main').onclick = () => { stopAutoPlay(); UI.showScreen('start'); };

    // 成就页
    document.getElementById('btn-back-ach').onclick = () => UI.showScreen('start');
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            UI.renderAchievementsPage(GlobalState.achievements, this.dataset.filter);
        };
    });

    // 历史页
    document.getElementById('btn-back-hist').onclick = () => UI.showScreen('start');
}

// ── 新生命流程 ───────────────────────────────────────────────
function onNewLife() {
    stopAutoPlay();
    rerollsLeft = 3;
    selectedTalentId = null;

    currentCharacter = generateCharacter();
    UI.renderBirthScreen(currentCharacter, rerollsLeft);
    UI.renderTalents(null);

    document.getElementById('btn-start-life').disabled = true;

    // 天赋选择事件
    document.getElementById('talent-grid').onclick = function(e) {
        const card = e.target.closest('.talent-card');
        if (!card) return;
        selectedTalentId = card.dataset.id;
        UI.renderTalents(selectedTalentId);
        document.getElementById('btn-start-life').disabled = false;
    };

    UI.showScreen('birth');
}

// ── 重投属性 ─────────────────────────────────────────────────
function onReroll() {
    if (rerollsLeft <= 0) return;
    rerollsLeft--;
    currentCharacter = generateCharacter();
    UI.renderBirthScreen(currentCharacter, rerollsLeft);
    // 保持已选天赋
    UI.renderTalents(selectedTalentId);
    if (selectedTalentId) {
        document.getElementById('btn-start-life').disabled = false;
    }
}

// ── 正式开始人生 ─────────────────────────────────────────────
function onStartLife() {
    if (!selectedTalentId) return;

    const talent = TALENTS.find(t => t.id === selectedTalentId);
    State = createLifeState(currentCharacter, talent);

    // 清空日志
    const logScroll = document.getElementById('log-scroll');
    if (logScroll) logScroll.innerHTML = '';
    UI.toggleLog(false);

    // 更新头部
    UI.updateLifeHeader(State);

    eventPhase = 'new';
    pendingEvent = null;
    State.yearEventCount = 0;

    UI.showScreen('life');
    processNextEvent();
}

// ── 继续按钮 ─────────────────────────────────────────────────
function onNext() {
    if (eventPhase === 'showing') {
        // 无选择事件：应用效果，记录，推进
        commitEvent(pendingEvent, pendingEvent && pendingEvent.effect);
    } else if (eventPhase === 'result') {
        // 选择结果已展示：推进
        commitEvent(pendingEvent, pendingChoiceResult);
    }
}

// ── 提交事件（效果已处理，仅记录并推进） ────────────────────
function commitEvent(event, resolvedEffect) {
    if (!event) {
        advanceToNextEvent();
        return;
    }

    // 记录到日志
    UI.addLogEntry(State.age, event.title);

    // 记录到人生日志
    const logText = typeof event.text === 'function'
        ? event.text(State)
        : event.text;
    State.lifeLog.push({ age: State.age, title: event.title, text: logText });

    // 如果是高光事件，存入highlights
    if (event.highlight) {
        State.highlights.push({ age: State.age, text: event.title });
    }

    // 检查成就
    const newAchs = checkNewAchievements(State, GlobalState);
    if (newAchs.length > 0) {
        UI.showAchievementQueue(newAchs);
        saveGlobalState();
    }

    eventPhase = 'new';
    pendingEvent = null;
    pendingChoiceResult = null;
    State.yearEventCount++;

    advanceToNextEvent();
}

// ── 推进到下一个事件 ─────────────────────────────────────────
function advanceToNextEvent() {
    const MAX_PER_YEAR = 2;

    if (State.yearEventCount >= MAX_PER_YEAR) {
        advanceYear();
    } else {
        processNextEvent();
    }
}

// ── 年龄推进 ─────────────────────────────────────────────────
function advanceYear() {
    State.age++;
    State.yearEventCount = 0;

    // 颜值自然衰减（40岁后）
    if (State.age > 40 && State.talent && State.talent.passive !== 'appearance_bonus') {
        const decay = Math.floor((State.age - 40) / 10);
        if (decay > 0 && State.age % 3 === 0) {
            State.attributes.appearance = clamp(State.attributes.appearance - 1, 0, 100);
        }
    }

    // 更新头部
    UI.updateLifeHeader(State);

    // 检查死亡
    const deathProb = calcDeathProbability(State);
    if (Math.random() < deathProb) {
        endLife();
        return;
    }

    processNextEvent();
}

// ── 选择下一个事件 ───────────────────────────────────────────
function processNextEvent() {
    const event = selectEvent();

    if (!event) {
        // 本年无可用事件，直接过年
        advanceYear();
        return;
    }

    // 标记已使用的one-shot事件
    if (event.once) State.usedEvents.add(event.id);

    pendingEvent = event;

    // 解析文本（支持函数）
    let text = typeof event.text === 'function' ? event.text(State) : event.text;

    // 处理 resolve（动态决定效果）
    let resolvedEffect = event.effect || null;
    if (typeof event.resolve === 'function') {
        const extra = event.resolve(State);
        resolvedEffect = extra;
        // 立即应用（resolve 自行修改 state.conditions）
        if (extra) {
            const boostedEffect = applyTalentPassive(State, extra);
            applyEffect(State, boostedEffect);
            resolvedEffect = extra;
        }
        // 如果有 text_after，替换文本
        if (typeof event.text_after === 'function') {
            text = event.text_after(State);
        }
    } else if (resolvedEffect) {
        // 普通效果，立即应用
        const boostedEffect = applyTalentPassive(State, resolvedEffect);
        applyEffect(State, boostedEffect);
    }

    // 处理 setFlag
    if (event.setFlag) {
        const val = (event.flagValue !== undefined) ? event.flagValue : true;
        State.conditions[event.setFlag] = val;
    }

    // 更新属性显示
    UI.updateLifeHeader(State);

    // 有无选择？
    if (event.choices && event.choices.length > 0) {
        // 过滤满足条件的选项
        const validChoices = event.choices.filter(c =>
            !c.condition || c.condition(State)
        );

        if (validChoices.length === 0) {
            // 无可用选项，作为纯叙事事件
            UI.showEvent(State.age, text, resolvedEffect);
            eventPhase = 'showing';
            return;
        }

        UI.showEvent(State.age, text, null);
        eventPhase = 'choosing';

        UI.showChoices(validChoices, function(idx) {
            onChoiceMade(validChoices[idx]);
        });
    } else {
        // 无选择事件
        UI.showEvent(State.age, text, resolvedEffect);
        eventPhase = 'showing';
    }
}

// ── 玩家做出选择 ─────────────────────────────────────────────
function onChoiceMade(choice) {
    // 应用选择效果
    let effect = choice.effect;
    if (typeof effect === 'function') {
        effect = effect(State);
    }
    if (typeof choice.resolve === 'function') {
        effect = choice.resolve(State);
    }

    if (effect) {
        const boostedEffect = applyTalentPassive(State, effect);
        applyEffect(State, boostedEffect);
        pendingChoiceResult = boostedEffect;
    } else {
        pendingChoiceResult = null;
    }

    // 处理 setFlag
    if (choice.setFlag) {
        const val = (choice.flagValue !== undefined) ? choice.flagValue : true;
        State.conditions[choice.setFlag] = val;
    }

    // 获取结果文本
    let resultText = choice.result;
    if (typeof resultText === 'function') {
        resultText = resultText(State);
    }
    // 替换占位符
    if (resultText) {
        resultText = resultText.replace(/{name}/g, State.character.name);
    }

    // 更新属性显示
    UI.updateLifeHeader(State);

    // 显示结果
    if (resultText) {
        UI.showChoiceResult(resultText, pendingChoiceResult);
        eventPhase = 'result';
    } else {
        // 直接提交
        commitEvent(pendingEvent, pendingChoiceResult);
    }
}

// ── 从事件池选择一个事件 ─────────────────────────────────────
function selectEvent() {
    const age = State.age;

    const eligible = ALL_EVENTS.filter(ev => {
        // 年龄范围
        if (age < ev.ageMin || age > ev.ageMax) return false;
        // 已用one-shot
        if (ev.once && State.usedEvents.has(ev.id)) return false;
        // 条件
        if (ev.condition && typeof ev.condition === 'function') {
            try { if (!ev.condition(State)) return false; }
            catch (e) { return false; }
        }
        return true;
    });

    if (eligible.length === 0) return null;

    return weightedChoice(eligible);
}

// ── 人生结束 ─────────────────────────────────────────────────
function endLife() {
    State.isAlive = false;

    const deathInfo = chooseDeath(State);
    State.deathCause = deathInfo ? deathInfo.id : 'old_age';

    // 添加到人生高光
    if (deathInfo && deathInfo.desc) {
        State.highlights.push({ age: State.age, text: deathInfo.desc });
    }

    // 更新全局统计
    GlobalState.totalLives++;
    if (State.age > GlobalState.maxAge) {
        GlobalState.maxAge = State.age;
    }

    // 添加历史记录
    GlobalState.history.push({
        name: State.character.name,
        gender: State.character.gender,
        country: State.character.country.name,
        birthYear: State.character.birthYear,
        age: State.age,
        title: getLifeTitle(State)
    });
    if (GlobalState.history.length > 20) GlobalState.history.shift();

    // 最终成就检查
    const newAchs = checkNewAchievements(State, GlobalState);

    // 更新主页统计
    UI.updateStartStats(
        GlobalState.totalLives,
        GlobalState.maxAge,
        getAchievementCount(GlobalState)
    );

    saveGlobalState();

    // 渲染死亡页
    UI.renderDeathScreen(State, deathInfo);
    UI.renderNewAchievements(newAchs);

    stopAutoPlay();
    UI.showScreen('death');
}

// ── 自动推进 ─────────────────────────────────────────────────
function toggleAutoPlay() {
    isAutoPlay = !isAutoPlay;
    const btn = document.getElementById('btn-auto');
    if (isAutoPlay) {
        btn.textContent = '⏹ 停止';
        btn.style.color = '#e05090';
        scheduleAutoNext();
    } else {
        stopAutoPlay();
    }
}

function scheduleAutoNext() {
    if (!isAutoPlay) return;
    autoPlayTimer = setTimeout(() => {
        if (!isAutoPlay) return;
        // 只在非选择状态下自动推进
        if (eventPhase === 'showing' || eventPhase === 'result') {
            const nextBtn = document.getElementById('btn-next');
            if (nextBtn && !nextBtn.disabled) {
                onNext();
                scheduleAutoNext();
            } else {
                stopAutoPlay();
            }
        } else if (eventPhase === 'choosing') {
            // 自动随机选择
            const choices = document.querySelectorAll('.choice-btn:not([disabled])');
            if (choices.length > 0) {
                const pick = choices[Math.floor(Math.random() * choices.length)];
                pick.click();
                setTimeout(scheduleAutoNext, 800);
            }
        }
    }, 600);
}

function stopAutoPlay() {
    isAutoPlay = false;
    if (autoPlayTimer) clearTimeout(autoPlayTimer);
    autoPlayTimer = null;
    const btn = document.getElementById('btn-auto');
    if (btn) {
        btn.textContent = '⚡ 自动';
        btn.style.color = '';
    }
}

// ── 成就大厅 ─────────────────────────────────────────────────
function onOpenAchievements() {
    UI.renderAchievementsPage(GlobalState.achievements, 'all');
    // 重置筛选按钮状态
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (allBtn) allBtn.classList.add('active');
    UI.showScreen('achievements');
}

// ── 历史记录 ─────────────────────────────────────────────────
function onOpenHistory() {
    UI.renderHistoryPage(GlobalState.history);
    UI.showScreen('history');
}

// ── 存档 ─────────────────────────────────────────────────────
function saveGlobalState() {
    try {
        const saveData = {
            totalLives: GlobalState.totalLives,
            maxAge: GlobalState.maxAge,
            achievements: GlobalState.achievements,
            history: GlobalState.history
        };
        localStorage.setItem('reincarnation_save', JSON.stringify(saveData));
    } catch (e) {
        // 存储失败时静默处理
    }
}

function loadGlobalState() {
    try {
        const raw = localStorage.getItem('reincarnation_save');
        if (!raw) return;
        const data = JSON.parse(raw);
        GlobalState.totalLives = data.totalLives || 0;
        GlobalState.maxAge = data.maxAge || 0;
        GlobalState.achievements = data.achievements || {};
        GlobalState.history = data.history || [];
    } catch (e) {
        // 读取失败时使用默认值
    }
}

// ── 入口 ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
    initGame();
});

console.log('[game.js] 加载完成');
