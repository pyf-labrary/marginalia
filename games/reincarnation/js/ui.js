/* ============================================================
   ui.js - 界面渲染与交互
   ============================================================ */

'use strict';

window.UI = (function() {

    // ── 内部辅助 ─────────────────────────────────────────────
    function $(id) { return document.getElementById(id); }

    function setHTML(id, html) {
        const el = $(id);
        if (el) el.innerHTML = html;
    }

    // ── 屏幕切换 ─────────────────────────────────────────────
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const el = $('screen-' + screenId);
        if (el) el.classList.add('active');
    }

    // ── 渲染出生屏幕 ─────────────────────────────────────────
    function renderBirthScreen(character, rerollsLeft) {
        // 基本信息
        const genderText = character.gender === 'male' ? '男' : '女';
        const infoHtml = `
            <div class="birth-info-item">
                <span class="birth-info-label">姓名</span>
                <span class="birth-info-value">${character.name}</span>
            </div>
            <div class="birth-info-item">
                <span class="birth-info-label">性别</span>
                <span class="birth-info-value">${genderText}</span>
            </div>
            <div class="birth-info-item">
                <span class="birth-info-label">出生地</span>
                <span class="birth-info-value">${character.country.flag} ${character.country.name}</span>
            </div>
            <div class="birth-info-item">
                <span class="birth-info-label">出生年份</span>
                <span class="birth-info-value">${character.birthYear}年</span>
            </div>
        `;
        setHTML('birth-info-grid', infoHtml);

        // 属性
        const attrs = character.baseAttributes;
        const total = Object.values(attrs).reduce((a, b) => a + b, 0);
        const grade = getAttrGrade(total / 5);

        let attrsHtml = '';
        for (const [key, def] of Object.entries(ATTRS)) {
            const v = attrs[key] || 0;
            const color = getAttrColor(v);
            attrsHtml += `
                <div class="attr-item">
                    <span class="attr-icon">${def.icon}</span>
                    <span class="attr-name">${def.name}</span>
                    <span class="attr-value" style="color:${color}">${v}</span>
                    <div class="attr-bar">
                        <div class="attr-bar-fill" style="width:${v}%;background:${color}"></div>
                    </div>
                </div>
            `;
        }
        setHTML('birth-attrs-grid', attrsHtml);
        setHTML('attr-total-score', total);
        setHTML('attr-total-grade',
            `<span style="color:${grade.color}">（${grade.text}）</span>`);

        // 剩余投掷次数
        const rerollEl = $('reroll-count');
        if (rerollEl) rerollEl.textContent = rerollsLeft;
        const rerollBtn = $('btn-reroll');
        if (rerollBtn) rerollBtn.disabled = rerollsLeft <= 0;
    }

    // ── 渲染天赋列表 ─────────────────────────────────────────
    function renderTalents(selectedId) {
        const grid = $('talent-grid');
        if (!grid) return;
        grid.innerHTML = '';
        for (const talent of TALENTS) {
            const div = document.createElement('div');
            div.className = 'talent-card' + (talent.id === selectedId ? ' selected' : '');
            div.dataset.id = talent.id;
            div.innerHTML = `
                <div class="talent-card-icon">${talent.icon}</div>
                <div class="talent-card-info">
                    <div class="talent-card-name">${talent.name}</div>
                    <div class="talent-card-desc">${talent.description}</div>
                </div>
            `;
            grid.appendChild(div);
        }
    }

    // ── 更新人生屏幕顶部信息 ─────────────────────────────────
    function updateLifeHeader(state) {
        const { character, age, attributes } = state;
        setHTML('life-name', character.name);
        setHTML('life-meta',
            `${character.gender === 'male' ? '♂' : '♀'} · ${character.country.flag}${character.country.name}`);
        setHTML('life-age-num', age);

        // 属性条
        let html = '';
        for (const [key, def] of Object.entries(ATTRS)) {
            const v = attributes[key] || 0;
            const color = def.color;
            html += `
                <div class="life-attr-item" title="${def.name}: ${v}">
                    <span class="life-attr-icon">${def.icon}</span>
                    <div class="life-attr-track">
                        <div class="life-attr-fill" style="width:${v}%;background:${color}"></div>
                    </div>
                    <span class="life-attr-val">${v}</span>
                </div>
            `;
        }
        setHTML('life-attrs-row', html);
    }

    // ── 显示事件 ─────────────────────────────────────────────
    function showEvent(age, text, effects) {
        // 年龄标签
        setHTML('event-age-tag', `${age} 岁`);

        // 事件文字
        setHTML('event-body', escapeHtml(text));

        // 属性效果
        let effectHtml = '';
        if (effects) {
            const tags = formatEffects(effects);
            for (const t of tags) {
                const sign = t.value > 0 ? '+' : '';
                effectHtml += `<span class="effect-tag ${t.cls}">${t.icon}${t.name} ${sign}${t.value}</span>`;
            }
        }
        setHTML('event-effects-bar', effectHtml);

        // 隐藏选择面板
        hideChoices();

        // 重置动画
        const card = $('event-card');
        if (card) {
            card.style.animation = 'none';
            card.offsetHeight; // reflow
            card.style.animation = '';
        }
    }

    // ── 显示选择 ─────────────────────────────────────────────
    function showChoices(choices, onChoose) {
        const panel = $('choice-panel');
        const list = $('choices-list');
        if (!panel || !list) return;

        list.innerHTML = '';
        choices.forEach((choice, i) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.onclick = function() {
                // 高亮选中
                document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                // 禁用所有选项
                document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
                if (typeof onChoose === 'function') onChoose(i);
            };
            list.appendChild(btn);
        });

        panel.style.display = 'block';
        $('btn-next').disabled = true;
    }

    // ── 隐藏选择 ─────────────────────────────────────────────
    function hideChoices() {
        const panel = $('choice-panel');
        if (panel) panel.style.display = 'none';
        const btn = $('btn-next');
        if (btn) btn.disabled = false;
    }

    // ── 显示选择结果 ─────────────────────────────────────────
    function showChoiceResult(text, effects) {
        const body = $('event-body');
        if (body) {
            body.innerHTML += `\n\n<span style="color:#a080e0">→ ${escapeHtml(text)}</span>`;
        }

        // 更新效果栏
        let effectHtml = '';
        if (effects) {
            const tags = formatEffects(effects);
            for (const t of tags) {
                const sign = t.value > 0 ? '+' : '';
                effectHtml += `<span class="effect-tag ${t.cls}">${t.icon}${t.name} ${sign}${t.value}</span>`;
            }
        }
        setHTML('event-effects-bar', effectHtml);

        // 重新启用继续按钮
        const btn = $('btn-next');
        if (btn) btn.disabled = false;
    }

    // ── 添加日志条目 ─────────────────────────────────────────
    function addLogEntry(age, title) {
        const log = $('log-scroll');
        if (!log) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="log-entry-age">${age}岁</span><span class="log-entry-title">${escapeHtml(title)}</span>`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    // ── 显示/隐藏日志面板 ────────────────────────────────────
    function toggleLog(show) {
        const panel = $('life-log-panel');
        if (panel) panel.style.display = show ? 'flex' : 'none';
    }

    // ── 渲染死亡屏幕 ─────────────────────────────────────────
    function renderDeathScreen(state, deathInfo) {
        const { character, age, attributes, conditions, highlights } = state;
        const title = getLifeTitle(state);

        // 死亡标题
        setHTML('death-title', title);
        setHTML('death-cause-text',
            `享年 ${age} 岁 · ${deathInfo ? deathInfo.text : '离开了这个世界'}`);
        setHTML('death-icon-large', age >= 70 ? '🌸' : age >= 50 ? '🍂' : '🕊️');

        // 身份信息
        const genderText = character.gender === 'male' ? '男' : '女';
        const jobInfo = conditions.job ? JOBS[conditions.job] : null;
        setHTML('summary-identity-row', `
            <div class="summary-name-group">
                <div class="s-name">${character.name}</div>
                <div class="s-title">${title}</div>
                ${jobInfo ? `<div style="font-size:13px;color:#9090b0;margin-top:4px">${jobInfo.icon} ${jobInfo.name}</div>` : ''}
            </div>
            <div class="summary-age-group">
                <div class="s-age">${age}</div>
                <div class="s-age-label">岁</div>
            </div>
        `);

        // 最终属性
        let attrHtml = '';
        for (const [key, def] of Object.entries(ATTRS)) {
            const v = attributes[key] || 0;
            const color = getAttrColor(v);
            attrHtml += `
                <div class="attr-item">
                    <span class="attr-icon">${def.icon}</span>
                    <span class="attr-name">${def.name}</span>
                    <span class="attr-value" style="color:${color}">${v}</span>
                    <div class="attr-bar">
                        <div class="attr-bar-fill" style="width:${v}%;background:${color}"></div>
                    </div>
                </div>
            `;
        }
        setHTML('summary-final-attrs', attrHtml);

        // 统计信息
        const stats = [
            { val: conditions.married ? '已婚' : '未婚', label: '婚姻状态' },
            { val: conditions.has_children ? '有' : '无', label: '子女' },
            { val: conditions.has_grandchildren ? '有' : '无', label: '孙辈' },
            { val: conditions.has_house ? '有' : '无', label: '房产' },
            { val: conditions.retired ? '已退休' : (age >= 60 ? '未退休' : '在职'), label: '退休状态' },
            { val: calcLifeScore(state), label: '人生评分' }
        ];
        let statsHtml = '';
        for (const s of stats) {
            statsHtml += `
                <div class="summary-stat-item">
                    <span class="summary-stat-val">${s.val}</span>
                    <span class="summary-stat-label">${s.label}</span>
                </div>
            `;
        }
        setHTML('summary-stats-grid', statsHtml);

        // 高光时刻
        if (highlights && highlights.length > 0) {
            let hlHtml = '';
            for (const hl of highlights.slice(0, 6)) {
                hlHtml += `
                    <div class="highlight-item">
                        <span class="highlight-age">${hl.age}岁</span>
                        ${escapeHtml(hl.text)}
                    </div>
                `;
            }
            setHTML('highlights-list', hlHtml);
        } else {
            setHTML('highlights-list', '<div class="empty-state">这一生，平平淡淡地度过了。</div>');
        }
    }

    // ── 渲染新解锁成就 ───────────────────────────────────────
    function renderNewAchievements(achievements) {
        const section = $('new-achievements-section');
        if (!section) return;

        if (!achievements || achievements.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        let html = '';
        for (const ach of achievements) {
            html += `
                <div class="new-ach-item">
                    <span class="new-ach-icon">${ach.icon}</span>
                    <span class="new-ach-name">${ach.name}</span>
                </div>
            `;
        }
        setHTML('new-achievements-list', html);
    }

    // ── 渲染成就大厅 ─────────────────────────────────────────
    function renderAchievementsPage(unlocked, filter) {
        filter = filter || 'all';
        let list = ACHIEVEMENTS;
        if (filter === 'unlocked') list = ACHIEVEMENTS.filter(a => unlocked[a.id]);
        if (filter === 'locked') list = ACHIEVEMENTS.filter(a => !unlocked[a.id]);

        const total = ACHIEVEMENTS.length;
        const count = Object.keys(unlocked).length;

        setHTML('ach-progress-text', `${count} / ${total} 已解锁`);
        const fill = $('ach-progress-fill');
        if (fill) fill.style.width = (count / total * 100) + '%';

        let html = '';
        for (const ach of list) {
            const isUnlocked = !!unlocked[ach.id];
            html += `
                <div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="ach-card-icon">${isUnlocked ? ach.icon : '🔒'}</div>
                    <div class="ach-card-info">
                        <div class="ach-card-name">${ach.name}</div>
                        <div class="ach-card-desc">${isUnlocked ? ach.desc : '???'}</div>
                        <div class="ach-card-rarity rarity-${ach.rarity}">${rarityText(ach.rarity)}</div>
                    </div>
                </div>
            `;
        }
        setHTML('achievements-grid', html || '<div class="empty-state"><div class="empty-icon">🏆</div>暂无成就</div>');
    }

    // ── 渲染历史记录 ─────────────────────────────────────────
    function renderHistoryPage(history) {
        if (!history || history.length === 0) {
            setHTML('history-list', '<div class="empty-state"><div class="empty-icon">📜</div>还没有历史记录<br>开始你的第一段人生吧！</div>');
            return;
        }

        let html = '';
        const reversed = history.slice().reverse();
        for (let i = 0; i < reversed.length; i++) {
            const h = reversed[i];
            html += `
                <div class="history-item">
                    <div class="hist-header">
                        <span class="hist-name">${h.name}</span>
                        <span class="hist-age">${h.age}岁</span>
                    </div>
                    <div class="hist-meta">
                        ${h.gender === 'male' ? '♂' : '♀'} · ${h.country} · ${h.birthYear}年出生
                    </div>
                    <div class="hist-title">${h.title}</div>
                </div>
            `;
        }
        setHTML('history-list', html);
    }

    // ── 更新主页统计 ─────────────────────────────────────────
    function updateStartStats(totalLives, maxAge, achCount) {
        setHTML('total-lives-display', totalLives);
        setHTML('max-age-display', maxAge);
        setHTML('ach-count-display', achCount);
    }

    // ── 成就弹出通知 ─────────────────────────────────────────
    let toastTimer = null;
    function showAchievementToast(achievement) {
        const toast = $('ach-toast');
        if (!toast) return;
        setHTML('ach-toast-name', achievement.name);
        toast.classList.remove('hidden');
        toast.classList.add('show');

        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hidden');
        }, 2800);
    }

    // ── 队列式连续弹窗 ───────────────────────────────────────
    function showAchievementQueue(achievements) {
        if (!achievements || achievements.length === 0) return;
        let idx = 0;
        function next() {
            if (idx >= achievements.length) return;
            showAchievementToast(achievements[idx]);
            idx++;
            if (idx < achievements.length) {
                setTimeout(next, 3200);
            }
        }
        next();
    }

    // ── 辅助：稀有度文字 ─────────────────────────────────────
    function rarityText(rarity) {
        const map = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };
        return map[rarity] || rarity;
    }

    // ── 辅助：HTML转义 ───────────────────────────────────────
    function escapeHtml(str) {
        if (typeof str !== 'string') return str || '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── 导出公共接口 ─────────────────────────────────────────
    return {
        showScreen,
        renderBirthScreen,
        renderTalents,
        updateLifeHeader,
        showEvent,
        showChoices,
        hideChoices,
        showChoiceResult,
        addLogEntry,
        toggleLog,
        renderDeathScreen,
        renderNewAchievements,
        renderAchievementsPage,
        renderHistoryPage,
        updateStartStats,
        showAchievementToast,
        showAchievementQueue
    };

})();

console.log('[ui.js] 加载完成');
