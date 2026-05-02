/**
 * statistics-ui.js - 统计面板和数据可视化
 */

class StatisticsPanel {
    constructor(statistics, history) {
        this.statistics = statistics;
        this.history = history;
        this.container = null;
        this.chartCanvas = null;
    }

    render(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.container.innerHTML = '';

        this._renderOverview();
        this._renderWinRateChart();
        this._renderRoleBreakdown();
        this._renderAchievements();
        this._renderRecentTrend();
        this._renderDetailedStats();
    }

    _renderOverview() {
        const stats = this.statistics;
        const section = this._createSection('总览');

        const cards = [
            { label: '总对局', value: stats.totalGames, icon: '🎮', color: '#4fc3f7' },
            { label: '胜率', value: `${stats.winRate}%`, icon: '📊', color: '#81c784' },
            { label: '总得分', value: this._formatScore(stats.totalScore), icon: '💰', color: '#ffd54f' },
            { label: '最高连胜', value: stats.maxWinStreak, icon: '🔥', color: '#ff8a65' }
        ];

        const grid = document.createElement('div');
        grid.className = 'stats-overview-grid';

        for (const card of cards) {
            const el = document.createElement('div');
            el.className = 'stats-overview-card';
            el.innerHTML = `
                <div class="stats-overview-icon" style="color: ${card.color}">${card.icon}</div>
                <div class="stats-overview-value" style="color: ${card.color}">${card.value}</div>
                <div class="stats-overview-label">${card.label}</div>
            `;
            grid.appendChild(el);
        }

        section.appendChild(grid);
        this.container.appendChild(section);
    }

    _renderWinRateChart() {
        const stats = this.statistics;
        const section = this._createSection('胜负统计');

        if (stats.totalGames === 0) {
            section.appendChild(this._createEmptyState('暂无对局数据'));
            this.container.appendChild(section);
            return;
        }

        const chartContainer = document.createElement('div');
        chartContainer.className = 'stats-chart-container';

        const winPercent = stats.totalGames > 0
            ? (stats.wins / stats.totalGames * 100) : 0;
        const losePercent = 100 - winPercent;

        chartContainer.innerHTML = `
            <div class="donut-chart-wrapper">
                <div class="donut-chart">
                    <svg viewBox="0 0 36 36" class="donut-svg">
                        <circle cx="18" cy="18" r="15.91549"
                            fill="transparent" stroke="#e57373"
                            stroke-width="3"></circle>
                        <circle cx="18" cy="18" r="15.91549"
                            fill="transparent" stroke="#81c784"
                            stroke-width="3"
                            stroke-dasharray="${winPercent} ${losePercent}"
                            stroke-dashoffset="25"
                            class="donut-segment"></circle>
                    </svg>
                    <div class="donut-center">
                        <span class="donut-value">${stats.winRate}%</span>
                        <span class="donut-label">胜率</span>
                    </div>
                </div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background: #81c784"></span>
                        <span>胜 ${stats.wins}场</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #e57373"></span>
                        <span>负 ${stats.losses}场</span>
                    </div>
                </div>
            </div>
        `;

        section.appendChild(chartContainer);
        this.container.appendChild(section);
    }

    _renderRoleBreakdown() {
        const stats = this.statistics;
        const section = this._createSection('身份统计');

        if (stats.totalGames === 0) {
            section.appendChild(this._createEmptyState('暂无对局数据'));
            this.container.appendChild(section);
            return;
        }

        const roleData = [
            {
                role: '地主',
                games: stats.landlordGames,
                wins: stats.landlordWins,
                winRate: stats.landlordWinRate,
                color: '#e57373',
                icon: '👑'
            },
            {
                role: '农民',
                games: stats.farmerGames,
                wins: stats.farmerWins,
                winRate: stats.farmerWinRate,
                color: '#81c784',
                icon: '🌾'
            }
        ];

        const grid = document.createElement('div');
        grid.className = 'stats-role-grid';

        for (const data of roleData) {
            const el = document.createElement('div');
            el.className = 'stats-role-card';

            const barWidth = data.games > 0
                ? (data.wins / data.games * 100) : 0;

            el.innerHTML = `
                <div class="role-card-header">
                    <span class="role-card-icon">${data.icon}</span>
                    <span class="role-card-name">${data.role}</span>
                </div>
                <div class="role-card-stats">
                    <div class="role-stat">
                        <span class="role-stat-label">对局</span>
                        <span class="role-stat-value">${data.games}</span>
                    </div>
                    <div class="role-stat">
                        <span class="role-stat-label">胜场</span>
                        <span class="role-stat-value">${data.wins}</span>
                    </div>
                    <div class="role-stat">
                        <span class="role-stat-label">胜率</span>
                        <span class="role-stat-value" style="color: ${data.color}">${data.winRate}%</span>
                    </div>
                </div>
                <div class="role-bar-container">
                    <div class="role-bar" style="width: ${barWidth}%; background: ${data.color}"></div>
                </div>
            `;

            grid.appendChild(el);
        }

        section.appendChild(grid);
        this.container.appendChild(section);
    }

    _renderAchievements() {
        const stats = this.statistics;
        const section = this._createSection('成就');

        const achievements = this._calculateAchievements(stats);

        const grid = document.createElement('div');
        grid.className = 'achievements-grid';

        for (const ach of achievements) {
            const el = document.createElement('div');
            el.className = `achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`;
            el.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.description}</div>
                </div>
                ${ach.unlocked ? '<div class="achievement-check">✓</div>' : ''}
                ${!ach.unlocked && ach.progress !== undefined ?
                    `<div class="achievement-progress">
                        <div class="achievement-progress-bar" style="width: ${ach.progress}%"></div>
                    </div>` : ''
                }
            `;
            grid.appendChild(el);
        }

        section.appendChild(grid);
        this.container.appendChild(section);
    }

    _calculateAchievements(stats) {
        return [
            {
                icon: '🎮',
                name: '初出茅庐',
                description: '完成第一局游戏',
                unlocked: stats.totalGames >= 1,
                progress: Math.min(100, stats.totalGames / 1 * 100)
            },
            {
                icon: '🏆',
                name: '首胜',
                description: '赢得第一局游戏',
                unlocked: stats.wins >= 1,
                progress: Math.min(100, stats.wins >= 1 ? 100 : 0)
            },
            {
                icon: '🔟',
                name: '老手',
                description: '完成10局游戏',
                unlocked: stats.totalGames >= 10,
                progress: Math.min(100, stats.totalGames / 10 * 100)
            },
            {
                icon: '💯',
                name: '百战',
                description: '完成100局游戏',
                unlocked: stats.totalGames >= 100,
                progress: Math.min(100, stats.totalGames / 100 * 100)
            },
            {
                icon: '🔥',
                name: '三连胜',
                description: '达成3连胜',
                unlocked: stats.maxWinStreak >= 3,
                progress: Math.min(100, stats.maxWinStreak / 3 * 100)
            },
            {
                icon: '⚡',
                name: '五连胜',
                description: '达成5连胜',
                unlocked: stats.maxWinStreak >= 5,
                progress: Math.min(100, stats.maxWinStreak / 5 * 100)
            },
            {
                icon: '💣',
                name: '爆破专家',
                description: '累计使用10次炸弹',
                unlocked: stats.bombsPlayed >= 10,
                progress: Math.min(100, stats.bombsPlayed / 10 * 100)
            },
            {
                icon: '🚀',
                name: '火箭发射',
                description: '使用火箭',
                unlocked: stats.rocketsPlayed >= 1,
                progress: Math.min(100, stats.rocketsPlayed >= 1 ? 100 : 0)
            },
            {
                icon: '🌸',
                name: '春天使者',
                description: '打出春天',
                unlocked: stats.springs >= 1,
                progress: Math.min(100, stats.springs >= 1 ? 100 : 0)
            },
            {
                icon: '👑',
                name: '霸气地主',
                description: '作为地主赢得10局',
                unlocked: stats.landlordWins >= 10,
                progress: Math.min(100, stats.landlordWins / 10 * 100)
            },
            {
                icon: '🌾',
                name: '最强农民',
                description: '作为农民赢得10局',
                unlocked: stats.farmerWins >= 10,
                progress: Math.min(100, stats.farmerWins / 10 * 100)
            },
            {
                icon: '💰',
                name: '大赢家',
                description: '单局获得1000分',
                unlocked: stats.maxWinScore >= 1000,
                progress: Math.min(100, stats.maxWinScore / 1000 * 100)
            }
        ];
    }

    _renderRecentTrend() {
        const records = this.history ? this.history.getRecords(20) : [];
        const section = this._createSection('近期走势');

        if (records.length === 0) {
            section.appendChild(this._createEmptyState('暂无对局数据'));
            this.container.appendChild(section);
            return;
        }

        const trendContainer = document.createElement('div');
        trendContainer.className = 'trend-container';

        const reversedRecords = [...records].reverse();
        reversedRecords.forEach((record, i) => {
            const isWin = record.result &&
                ((record.result.isLandlordWin && record.landlordIndex === 0) ||
                 (!record.result.isLandlordWin && record.landlordIndex !== 0));

            const dot = document.createElement('div');
            dot.className = `trend-dot ${isWin ? 'win' : 'lose'}`;
            dot.title = `第${i + 1}局: ${isWin ? '胜' : '负'} (${record.resultSummary})`;
            trendContainer.appendChild(dot);
        });

        section.appendChild(trendContainer);

        const summary = document.createElement('div');
        summary.className = 'trend-summary';
        const recentWins = reversedRecords.filter(r => {
            if (!r.result) return false;
            const isWin = (r.result.isLandlordWin && r.landlordIndex === 0) ||
                (!r.result.isLandlordWin && r.landlordIndex !== 0);
            return isWin;
        }).length;
        summary.textContent = `近${records.length}局: ${recentWins}胜 ${records.length - recentWins}负`;
        section.appendChild(summary);

        this.container.appendChild(section);
    }

    _renderDetailedStats() {
        const stats = this.statistics;
        const section = this._createSection('详细数据');

        const table = document.createElement('div');
        table.className = 'stats-detail-table';

        const rows = [
            ['总对局', stats.totalGames],
            ['胜场', stats.wins],
            ['负场', stats.losses],
            ['胜率', `${stats.winRate}%`],
            ['地主对局', stats.landlordGames],
            ['地主胜场', stats.landlordWins],
            ['地主胜率', `${stats.landlordWinRate}%`],
            ['农民对局', stats.farmerGames],
            ['农民胜场', stats.farmerWins],
            ['农民胜率', `${stats.farmerWinRate}%`],
            ['总得分', this._formatScore(stats.totalScore)],
            ['最高单局得分', this._formatScore(stats.maxWinScore)],
            ['最高单局失分', this._formatScore(stats.maxLoseScore)],
            ['当前连胜', stats.currentStreak],
            ['最高连胜', stats.maxWinStreak],
            ['累计炸弹', stats.bombsPlayed],
            ['累计火箭', stats.rocketsPlayed],
            ['春天次数', stats.springs],
            ['反春天次数', stats.antiSprings]
        ];

        for (const [label, value] of rows) {
            const row = document.createElement('div');
            row.className = 'stats-detail-row';
            row.innerHTML = `
                <span class="stats-detail-label">${label}</span>
                <span class="stats-detail-value">${value}</span>
            `;
            table.appendChild(row);
        }

        section.appendChild(table);

        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-small btn-danger stats-reset-btn';
        resetBtn.textContent = '重置统计数据';
        resetBtn.addEventListener('click', () => {
            if (confirm('确定要重置所有统计数据吗？此操作不可撤销。')) {
                this.statistics.reset();
                this.render(this.container.id);
            }
        });
        section.appendChild(resetBtn);

        this.container.appendChild(section);
    }

    _createSection(title) {
        const section = document.createElement('div');
        section.className = 'stats-section';

        const header = document.createElement('h3');
        header.className = 'stats-section-title';
        header.textContent = title;
        section.appendChild(header);

        return section;
    }

    _createEmptyState(text) {
        const el = document.createElement('div');
        el.className = 'stats-empty';
        el.textContent = text;
        return el;
    }

    _formatScore(score) {
        if (score >= 0) return `+${score}`;
        return String(score);
    }
}

class AchievementNotifier {
    constructor() {
        this._shown = new Set();
        this._load();
    }

    check(stats) {
        const newAchievements = [];
        const checks = [
            { id: 'first_game', condition: stats.totalGames >= 1, name: '初出茅庐', icon: '🎮' },
            { id: 'first_win', condition: stats.wins >= 1, name: '首胜', icon: '🏆' },
            { id: 'ten_games', condition: stats.totalGames >= 10, name: '老手', icon: '🔟' },
            { id: 'hundred_games', condition: stats.totalGames >= 100, name: '百战', icon: '💯' },
            { id: 'streak_3', condition: stats.maxWinStreak >= 3, name: '三连胜', icon: '🔥' },
            { id: 'streak_5', condition: stats.maxWinStreak >= 5, name: '五连胜', icon: '⚡' },
            { id: 'bombs_10', condition: stats.bombsPlayed >= 10, name: '爆破专家', icon: '💣' },
            { id: 'rocket', condition: stats.rocketsPlayed >= 1, name: '火箭发射', icon: '🚀' },
            { id: 'spring', condition: stats.springs >= 1, name: '春天使者', icon: '🌸' },
            { id: 'landlord_10', condition: stats.landlordWins >= 10, name: '霸气地主', icon: '👑' },
            { id: 'farmer_10', condition: stats.farmerWins >= 10, name: '最强农民', icon: '🌾' },
            { id: 'big_win', condition: stats.maxWinScore >= 1000, name: '大赢家', icon: '💰' },
        ];

        for (const check of checks) {
            if (check.condition && !this._shown.has(check.id)) {
                this._shown.add(check.id);
                newAchievements.push(check);
            }
        }

        this._save();
        return newAchievements;
    }

    showNotification(achievement) {
        const el = document.createElement('div');
        el.className = 'achievement-notification anim-slide-down';
        el.innerHTML = `
            <div class="achievement-notif-icon">${achievement.icon}</div>
            <div class="achievement-notif-text">
                <div class="achievement-notif-title">成就解锁！</div>
                <div class="achievement-notif-name">${achievement.name}</div>
            </div>
        `;

        document.body.appendChild(el);

        setTimeout(() => {
            el.classList.add('anim-fade-out');
            setTimeout(() => {
                if (el.parentNode) el.remove();
            }, 500);
        }, 3000);
    }

    _save() {
        try {
            localStorage.setItem('doudizhu_achievements',
                JSON.stringify([...this._shown]));
        } catch (e) { /* ignore */ }
    }

    _load() {
        try {
            const data = localStorage.getItem('doudizhu_achievements');
            if (data) {
                this._shown = new Set(JSON.parse(data));
            }
        } catch (e) {
            this._shown = new Set();
        }
    }
}
