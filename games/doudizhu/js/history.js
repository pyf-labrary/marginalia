/**
 * history.js - 游戏回放和历史记录系统
 */

class GameAction {
    constructor(type, playerIndex, data = {}) {
        this.type = type;
        this.playerIndex = playerIndex;
        this.data = data;
        this.timestamp = Date.now();
    }

    static deal(hands, dizhuCards) {
        return new GameAction('deal', -1, {
            handCounts: hands.map(h => h.length),
            dizhuCardCount: dizhuCards.length
        });
    }

    static bid(playerIndex, bid) {
        return new GameAction('bid', playerIndex, { bid });
    }

    static setLandlord(playerIndex, dizhuCards) {
        return new GameAction('set_landlord', playerIndex, {
            dizhuCards: dizhuCards.map(c => ({ rank: c.rank, suit: c.suit, id: c.id }))
        });
    }

    static playCards(playerIndex, cards, cardType) {
        return new GameAction('play', playerIndex, {
            cards: cards.map(c => ({ rank: c.rank, suit: c.suit, id: c.id })),
            cardType: cardType.type,
            cardRank: cardType.rank,
            cardLength: cardType.length
        });
    }

    static pass(playerIndex) {
        return new GameAction('pass', playerIndex, {});
    }

    static gameEnd(winnerIndex, isLandlordWin, scores, spring, antiSpring) {
        return new GameAction('game_end', winnerIndex, {
            isLandlordWin,
            scores,
            spring,
            antiSpring
        });
    }
}

class GameRecord {
    constructor() {
        this.id = this._generateId();
        this.startTime = Date.now();
        this.endTime = null;
        this.actions = [];
        this.result = null;
        this.playerNames = ['你', '电脑A', '电脑B'];
        this.landlordIndex = -1;
        this.finalBid = 0;
        this.bombCount = 0;
        this.totalRounds = 0;
    }

    _generateId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    addAction(action) {
        this.actions.push(action);

        if (action.type === 'set_landlord') {
            this.landlordIndex = action.playerIndex;
        }
        if (action.type === 'play') {
            if (action.data.cardType === CARD_TYPE.BOMB ||
                action.data.cardType === CARD_TYPE.ROCKET) {
                this.bombCount++;
            }
            this.totalRounds++;
        }
        if (action.type === 'game_end') {
            this.endTime = Date.now();
            this.result = action.data;
        }
    }

    get duration() {
        const end = this.endTime || Date.now();
        return end - this.startTime;
    }

    get durationText() {
        const seconds = Math.floor(this.duration / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    get isComplete() {
        return this.result !== null;
    }

    get winnerName() {
        if (!this.result) return '';
        const endAction = this.actions.find(a => a.type === 'game_end');
        if (!endAction) return '';
        return this.playerNames[endAction.playerIndex] || '';
    }

    get resultSummary() {
        if (!this.result) return '未完成';
        return this.result.isLandlordWin ? '地主获胜' : '农民获胜';
    }

    toJSON() {
        return {
            id: this.id,
            startTime: this.startTime,
            endTime: this.endTime,
            actions: this.actions,
            playerNames: this.playerNames,
            landlordIndex: this.landlordIndex,
            finalBid: this.finalBid,
            bombCount: this.bombCount,
            totalRounds: this.totalRounds,
            result: this.result
        };
    }

    static fromJSON(data) {
        const record = new GameRecord();
        Object.assign(record, data);
        return record;
    }
}

class GameHistory {
    constructor(maxRecords = 50) {
        this.records = [];
        this.maxRecords = maxRecords;
        this.currentRecord = null;
        this._load();
    }

    startNewRecord() {
        this.currentRecord = new GameRecord();
        return this.currentRecord;
    }

    recordAction(action) {
        if (this.currentRecord) {
            this.currentRecord.addAction(action);
        }
    }

    finishRecord() {
        if (this.currentRecord && this.currentRecord.isComplete) {
            this.records.unshift(this.currentRecord);
            if (this.records.length > this.maxRecords) {
                this.records = this.records.slice(0, this.maxRecords);
            }
            this._save();
        }
        this.currentRecord = null;
    }

    getRecords(count = 20) {
        return this.records.slice(0, count);
    }

    getRecord(id) {
        return this.records.find(r => r.id === id);
    }

    deleteRecord(id) {
        this.records = this.records.filter(r => r.id !== id);
        this._save();
    }

    clearAll() {
        this.records = [];
        this._save();
    }

    getStatsSummary() {
        const total = this.records.length;
        if (total === 0) return null;

        let wins = 0;
        let losses = 0;
        let totalDuration = 0;
        let totalBombs = 0;
        let springs = 0;
        let antiSprings = 0;
        let landlordGames = 0;
        let landlordWins = 0;
        let longestGame = 0;
        let shortestGame = Infinity;

        for (const record of this.records) {
            if (!record.result) continue;

            const humanIsLandlord = record.landlordIndex === 0;
            const humanWins = (record.result.isLandlordWin && humanIsLandlord) ||
                (!record.result.isLandlordWin && !humanIsLandlord);

            if (humanWins) wins++;
            else losses++;

            if (humanIsLandlord) {
                landlordGames++;
                if (humanWins) landlordWins++;
            }

            totalDuration += record.duration;
            totalBombs += record.bombCount;
            if (record.result.spring) springs++;
            if (record.result.antiSpring) antiSprings++;

            longestGame = Math.max(longestGame, record.duration);
            shortestGame = Math.min(shortestGame, record.duration);
        }

        return {
            total,
            wins,
            losses,
            winRate: total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0',
            avgDuration: total > 0 ? Math.floor(totalDuration / total / 1000) : 0,
            totalBombs,
            springs,
            antiSprings,
            landlordGames,
            landlordWins,
            landlordWinRate: landlordGames > 0
                ? ((landlordWins / landlordGames) * 100).toFixed(1) : '0.0',
            longestGame: longestGame === 0 ? 0 : Math.floor(longestGame / 1000),
            shortestGame: shortestGame === Infinity ? 0 : Math.floor(shortestGame / 1000)
        };
    }

    _save() {
        try {
            const data = this.records.map(r => r.toJSON());
            localStorage.setItem('doudizhu_history', JSON.stringify(data));
        } catch (e) {
            // storage full or not available - trim records
            if (this.records.length > 10) {
                this.records = this.records.slice(0, 10);
                try {
                    localStorage.setItem('doudizhu_history',
                        JSON.stringify(this.records.map(r => r.toJSON())));
                } catch (e2) { /* give up */ }
            }
        }
    }

    _load() {
        try {
            const data = localStorage.getItem('doudizhu_history');
            if (data) {
                const parsed = JSON.parse(data);
                this.records = parsed.map(d => GameRecord.fromJSON(d));
            }
        } catch (e) {
            this.records = [];
        }
    }
}

class GameReplayController {
    constructor(renderer) {
        this.renderer = renderer;
        this.record = null;
        this.actionIndex = 0;
        this.isPlaying = false;
        this.speed = 1;
        this._timeoutId = null;
    }

    loadRecord(record) {
        this.record = record;
        this.actionIndex = 0;
        this.isPlaying = false;
    }

    play() {
        if (!this.record) return;
        this.isPlaying = true;
        this._playNextAction();
    }

    pause() {
        this.isPlaying = false;
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = null;
        }
    }

    stop() {
        this.pause();
        this.actionIndex = 0;
    }

    setSpeed(speed) {
        this.speed = clamp(speed, 0.5, 4);
    }

    stepForward() {
        if (!this.record || this.actionIndex >= this.record.actions.length) return false;
        this._executeAction(this.record.actions[this.actionIndex]);
        this.actionIndex++;
        return true;
    }

    stepBack() {
        if (this.actionIndex > 0) {
            this.actionIndex = Math.max(0, this.actionIndex - 1);
        }
    }

    jumpTo(index) {
        this.actionIndex = clamp(index, 0, this.record ? this.record.actions.length : 0);
    }

    get progress() {
        if (!this.record || this.record.actions.length === 0) return 0;
        return this.actionIndex / this.record.actions.length;
    }

    get totalActions() {
        return this.record ? this.record.actions.length : 0;
    }

    get currentActionIndex() {
        return this.actionIndex;
    }

    _playNextAction() {
        if (!this.isPlaying || !this.record) return;
        if (this.actionIndex >= this.record.actions.length) {
            this.isPlaying = false;
            return;
        }

        const action = this.record.actions[this.actionIndex];
        this._executeAction(action);
        this.actionIndex++;

        const delay = this._getActionDelay(action) / this.speed;
        this._timeoutId = setTimeout(() => {
            this._playNextAction();
        }, delay);
    }

    _executeAction(action) {
        switch (action.type) {
            case 'deal':
                this.renderer.showMessage('发牌中...', 1000);
                break;
            case 'bid':
                this._showBidAction(action);
                break;
            case 'set_landlord':
                this._showLandlordAction(action);
                break;
            case 'play':
                this._showPlayAction(action);
                break;
            case 'pass':
                this.renderer.showPlayerAction(action.playerIndex, '不出', 1500);
                break;
            case 'game_end':
                this._showGameEndAction(action);
                break;
        }
    }

    _showBidAction(action) {
        const bidText = action.data.bid > 0 ? `${action.data.bid}分` : '不叫';
        this.renderer.showPlayerAction(action.playerIndex, bidText, 2000);
    }

    _showLandlordAction(action) {
        const playerNames = this.record.playerNames;
        this.renderer.showMessage(
            `${playerNames[action.playerIndex]} 成为地主`,
            2000
        );
    }

    _showPlayAction(action) {
        const typeName = CARD_TYPE_NAMES[action.data.cardType] || '';
        const cardCount = action.data.cards ? action.data.cards.length : 0;
        this.renderer.showPlayerAction(
            action.playerIndex,
            `${typeName} (${cardCount}张)`,
            2000
        );
    }

    _showGameEndAction(action) {
        const text = action.data.isLandlordWin ? '地主获胜' : '农民获胜';
        this.renderer.showMessage(text, 3000);
    }

    _getActionDelay(action) {
        switch (action.type) {
            case 'deal': return 2000;
            case 'bid': return 1500;
            case 'set_landlord': return 2000;
            case 'play': return 1200;
            case 'pass': return 800;
            case 'game_end': return 3000;
            default: return 1000;
        }
    }

    destroy() {
        this.stop();
        this.record = null;
    }
}

class HistoryRenderer {
    constructor(containerId) {
        this.containerId = containerId;
        this.onRecordSelect = null;
        this.onRecordDelete = null;
    }

    render(records) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = '';

        if (records.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'history-empty';
            empty.textContent = '暂无对局记录';
            container.appendChild(empty);
            return;
        }

        for (const record of records) {
            const item = this._createRecordItem(record);
            container.appendChild(item);
        }
    }

    _createRecordItem(record) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.dataset.recordId = record.id;

        const dateStr = new Date(record.startTime).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const isWin = record.result &&
            ((record.result.isLandlordWin && record.landlordIndex === 0) ||
             (!record.result.isLandlordWin && record.landlordIndex !== 0));

        item.innerHTML = `
            <div class="history-item-left">
                <div class="history-result ${isWin ? 'win' : 'lose'}">
                    ${isWin ? '胜' : '负'}
                </div>
                <div class="history-info">
                    <div class="history-date">${dateStr}</div>
                    <div class="history-detail">
                        ${record.resultSummary} | ${record.durationText} | 
                        炸弹×${record.bombCount}
                    </div>
                </div>
            </div>
            <div class="history-item-right">
                <span class="history-role ${record.landlordIndex === 0 ? 'landlord' : 'farmer'}">
                    ${record.landlordIndex === 0 ? '地主' : '农民'}
                </span>
                <button class="btn-delete-record" data-id="${record.id}" title="删除">✕</button>
            </div>
        `;

        const deleteBtn = item.querySelector('.btn-delete-record');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onRecordDelete) {
                    this.onRecordDelete(record.id);
                }
            });
        }

        item.addEventListener('click', () => {
            if (this.onRecordSelect) {
                this.onRecordSelect(record);
            }
        });

        return item;
    }

    renderStats(stats) {
        const container = document.getElementById('history-stats');
        if (!container || !stats) return;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">总对局</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.winRate}%</div>
                    <div class="stat-label">胜率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.wins}</div>
                    <div class="stat-label">胜场</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.losses}</div>
                    <div class="stat-label">负场</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.landlordWinRate}%</div>
                    <div class="stat-label">地主胜率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalBombs}</div>
                    <div class="stat-label">总炸弹数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.springs}</div>
                    <div class="stat-label">春天次数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.avgDuration}s</div>
                    <div class="stat-label">平均时长</div>
                </div>
            </div>
        `;
    }
}
