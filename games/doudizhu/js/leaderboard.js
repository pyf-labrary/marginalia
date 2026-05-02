/**
 * leaderboard.js - 排行榜和成绩追踪系统
 */

class LeaderboardEntry {
    constructor(data) {
        this.score = data.score || 0;
        this.date = data.date || Date.now();
        this.role = data.role || 'farmer';
        this.bid = data.bid || 1;
        this.bombCount = data.bombCount || 0;
        this.spring = data.spring || false;
        this.antiSpring = data.antiSpring || false;
        this.duration = data.duration || 0;
        this.difficulty = data.difficulty || 'normal';
    }

    get formattedDate() {
        return new Date(this.date).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    get formattedDuration() {
        const secs = Math.floor(this.duration / 1000);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    get roleDisplay() {
        return this.role === 'landlord' ? '地主' : '农民';
    }
}

class Leaderboard {
    constructor(maxEntries = 100) {
        this.maxEntries = maxEntries;
        this.entries = [];
        this._load();
    }

    addEntry(data) {
        const entry = new LeaderboardEntry(data);
        this.entries.push(entry);
        this.entries.sort((a, b) => b.score - a.score);
        if (this.entries.length > this.maxEntries) {
            this.entries = this.entries.slice(0, this.maxEntries);
        }
        this._save();
        return this.entries.indexOf(entry);
    }

    getTopScores(count = 10) {
        return this.entries.slice(0, count);
    }

    getPersonalBest() {
        return this.entries.length > 0 ? this.entries[0] : null;
    }

    getAverageScore() {
        if (this.entries.length === 0) return 0;
        const sum = this.entries.reduce((s, e) => s + e.score, 0);
        return Math.round(sum / this.entries.length);
    }

    getHighestBombGame() {
        if (this.entries.length === 0) return null;
        return this.entries.reduce((best, e) =>
            e.bombCount > (best ? best.bombCount : 0) ? e : best, null
        );
    }

    getFastestWin() {
        const wins = this.entries.filter(e => e.score > 0 && e.duration > 0);
        if (wins.length === 0) return null;
        return wins.reduce((best, e) =>
            e.duration < (best ? best.duration : Infinity) ? e : best, null
        );
    }

    getStatsByDifficulty() {
        const stats = {};
        for (const entry of this.entries) {
            const diff = entry.difficulty || 'normal';
            if (!stats[diff]) {
                stats[diff] = { total: 0, wins: 0, totalScore: 0 };
            }
            stats[diff].total++;
            if (entry.score > 0) stats[diff].wins++;
            stats[diff].totalScore += entry.score;
        }
        return stats;
    }

    clear() {
        this.entries = [];
        this._save();
    }

    _save() {
        try {
            localStorage.setItem('doudizhu_leaderboard', JSON.stringify(this.entries));
        } catch (e) { /* ignore */ }
    }

    _load() {
        try {
            const data = localStorage.getItem('doudizhu_leaderboard');
            if (data) {
                this.entries = JSON.parse(data).map(d => new LeaderboardEntry(d));
            }
        } catch (e) {
            this.entries = [];
        }
    }
}

class LeaderboardRenderer {
    constructor(leaderboard) {
        this.leaderboard = leaderboard;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        this._renderHighlights(container);
        this._renderTable(container);
        this._renderDifficultyStats(container);
    }

    _renderHighlights(container) {
        const personalBest = this.leaderboard.getPersonalBest();
        const fastestWin = this.leaderboard.getFastestWin();
        const avgScore = this.leaderboard.getAverageScore();
        const highBomb = this.leaderboard.getHighestBombGame();

        const section = document.createElement('div');
        section.className = 'leaderboard-highlights';
        section.innerHTML = `
            <div class="lb-highlight-card">
                <div class="lb-highlight-icon">🏆</div>
                <div class="lb-highlight-value">${personalBest ? personalBest.score : 0}</div>
                <div class="lb-highlight-label">最高分</div>
            </div>
            <div class="lb-highlight-card">
                <div class="lb-highlight-icon">📊</div>
                <div class="lb-highlight-value">${avgScore}</div>
                <div class="lb-highlight-label">平均分</div>
            </div>
            <div class="lb-highlight-card">
                <div class="lb-highlight-icon">⚡</div>
                <div class="lb-highlight-value">${fastestWin ? fastestWin.formattedDuration : '-'}</div>
                <div class="lb-highlight-label">最快胜利</div>
            </div>
            <div class="lb-highlight-card">
                <div class="lb-highlight-icon">💣</div>
                <div class="lb-highlight-value">${highBomb ? highBomb.bombCount : 0}</div>
                <div class="lb-highlight-label">最多炸弹</div>
            </div>
        `;
        container.appendChild(section);
    }

    _renderTable(container) {
        const top = this.leaderboard.getTopScores(15);

        const section = document.createElement('div');
        section.className = 'leaderboard-table';

        if (top.length === 0) {
            section.innerHTML = '<div class="lb-empty">暂无记录，快去赢一局吧！</div>';
            container.appendChild(section);
            return;
        }

        const header = document.createElement('div');
        header.className = 'lb-row lb-header';
        header.innerHTML = `
            <span class="lb-rank">#</span>
            <span class="lb-score-col">得分</span>
            <span class="lb-role-col">身份</span>
            <span class="lb-date-col">日期</span>
            <span class="lb-extra-col">详情</span>
        `;
        section.appendChild(header);

        top.forEach((entry, index) => {
            const row = document.createElement('div');
            row.className = `lb-row ${index < 3 ? 'lb-top-' + (index + 1) : ''}`;

            let rankBadge;
            if (index === 0) rankBadge = '🥇';
            else if (index === 1) rankBadge = '🥈';
            else if (index === 2) rankBadge = '🥉';
            else rankBadge = index + 1;

            let extras = [];
            if (entry.bombCount > 0) extras.push(`💣×${entry.bombCount}`);
            if (entry.spring) extras.push('🌸春天');
            if (entry.antiSpring) extras.push('🔄反春');

            row.innerHTML = `
                <span class="lb-rank">${rankBadge}</span>
                <span class="lb-score-col ${entry.score >= 0 ? 'lb-positive' : 'lb-negative'}">
                    ${entry.score >= 0 ? '+' : ''}${entry.score}
                </span>
                <span class="lb-role-col">
                    <span class="lb-role-badge ${entry.role}">${entry.roleDisplay}</span>
                </span>
                <span class="lb-date-col">${entry.formattedDate}</span>
                <span class="lb-extra-col">${extras.join(' ') || '-'}</span>
            `;
            section.appendChild(row);
        });

        container.appendChild(section);
    }

    _renderDifficultyStats(container) {
        const stats = this.leaderboard.getStatsByDifficulty();
        const difficulties = Object.keys(stats);

        if (difficulties.length === 0) return;

        const section = document.createElement('div');
        section.className = 'leaderboard-difficulty-stats';

        const title = document.createElement('h4');
        title.className = 'lb-section-title';
        title.textContent = '难度分布';
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'lb-diff-grid';

        const diffNames = { easy: '简单', normal: '普通', hard: '困难' };
        const diffColors = { easy: '#81c784', normal: '#4fc3f7', hard: '#ff8a65' };

        for (const [diff, data] of Object.entries(stats)) {
            const winRate = data.total > 0 ? (data.wins / data.total * 100).toFixed(0) : 0;
            const card = document.createElement('div');
            card.className = 'lb-diff-card';
            card.innerHTML = `
                <div class="lb-diff-name" style="color: ${diffColors[diff] || '#4fc3f7'}">
                    ${diffNames[diff] || diff}
                </div>
                <div class="lb-diff-stats">
                    <span>${data.total}局</span>
                    <span>胜率 ${winRate}%</span>
                </div>
                <div class="lb-diff-bar">
                    <div class="lb-diff-bar-fill" style="width: ${winRate}%; background: ${diffColors[diff] || '#4fc3f7'}"></div>
                </div>
            `;
            grid.appendChild(card);
        }

        section.appendChild(grid);
        container.appendChild(section);
    }
}

class DailyChallenge {
    constructor() {
        this.today = this._getTodayKey();
        this.challenge = null;
        this.completed = false;
        this._load();
    }

    _getTodayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }

    getToday() {
        const key = this._getTodayKey();
        if (this.today !== key) {
            this.today = key;
            this.challenge = null;
            this.completed = false;
        }

        if (!this.challenge) {
            this.challenge = this._generateDailyChallenge(key);
        }

        return {
            challenge: this.challenge,
            completed: this.completed,
            date: this.today
        };
    }

    _generateDailyChallenge(key) {
        const hash = this._hashString(key);
        const challenges = [
            { name: '今日地主', desc: '作为地主赢得一局', icon: '👑' },
            { name: '今日农民', desc: '作为农民赢得一局', icon: '🌾' },
            { name: '速战速决', desc: '在2分钟内获胜', icon: '⚡' },
            { name: '炸弹日', desc: '使用至少一个炸弹', icon: '💣' },
            { name: '高分挑战', desc: '获得500分以上', icon: '💰' },
            { name: '完美博弈', desc: '不使用提示获胜', icon: '🧠' },
            { name: '连胜挑战', desc: '连续赢得2局', icon: '🔥' }
        ];
        return challenges[hash % challenges.length];
    }

    _hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    markCompleted() {
        this.completed = true;
        this._save();
    }

    _save() {
        try {
            localStorage.setItem('doudizhu_daily', JSON.stringify({
                today: this.today,
                completed: this.completed
            }));
        } catch (e) { /* ignore */ }
    }

    _load() {
        try {
            const data = localStorage.getItem('doudizhu_daily');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.today === this._getTodayKey()) {
                    this.completed = parsed.completed;
                }
            }
        } catch (e) { /* ignore */ }
    }
}
