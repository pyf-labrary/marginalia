/**
 * card-counter.js - 记牌器和牌面分析工具
 */

class CardCounter {
    constructor() {
        this.allRanks = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        this.totalPerRank = {};
        this.playedPerRank = {};
        this.myCards = {};
        this.enabled = false;
        this.visible = false;
        this._container = null;

        this._initCounts();
    }

    _initCounts() {
        for (const rank of this.allRanks) {
            if (rank === CARD_RANKS['SMALL_JOKER'] || rank === CARD_RANKS['BIG_JOKER']) {
                this.totalPerRank[rank] = 1;
            } else {
                this.totalPerRank[rank] = 4;
            }
            this.playedPerRank[rank] = 0;
            this.myCards[rank] = 0;
        }
    }

    reset() {
        this._initCounts();
    }

    setMyHand(cards) {
        this.myCards = {};
        for (const rank of this.allRanks) {
            this.myCards[rank] = 0;
        }
        for (const card of cards) {
            this.myCards[card.rank] = (this.myCards[card.rank] || 0) + 1;
        }
    }

    recordPlay(cards, isMyPlay = false) {
        for (const card of cards) {
            this.playedPerRank[card.rank] = (this.playedPerRank[card.rank] || 0) + 1;
        }
        if (isMyPlay) {
            for (const card of cards) {
                this.myCards[card.rank] = Math.max(0, (this.myCards[card.rank] || 0) - 1);
            }
        }
    }

    getRemainingCount(rank) {
        const total = this.totalPerRank[rank] || 0;
        const played = this.playedPerRank[rank] || 0;
        const mine = this.myCards[rank] || 0;
        return total - played - mine;
    }

    getTotalRemaining() {
        let total = 0;
        for (const rank of this.allRanks) {
            total += this.getRemainingCount(rank);
        }
        return total;
    }

    getCounterData() {
        return this.allRanks.map(rank => ({
            rank,
            display: RANK_DISPLAY[rank],
            total: this.totalPerRank[rank],
            played: this.playedPerRank[rank],
            mine: this.myCards[rank],
            remaining: this.getRemainingCount(rank),
            isExhausted: this.getRemainingCount(rank) === 0 && this.myCards[rank] === 0
        }));
    }

    getHighlightedCards() {
        const highlights = [];
        for (const rank of this.allRanks) {
            const remaining = this.getRemainingCount(rank);
            if (remaining === 0 && this.playedPerRank[rank] > 0) {
                highlights.push({ rank, status: 'exhausted' });
            } else if (remaining === 1) {
                highlights.push({ rank, status: 'scarce' });
            }
        }
        return highlights;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    createDisplay() {
        if (this._container) return;

        this._container = document.createElement('div');
        this._container.className = 'card-counter-panel hidden';
        this._container.id = 'card-counter';

        this._container.innerHTML = `
            <div class="counter-header">
                <span class="counter-title">记牌器</span>
                <button class="counter-toggle-btn" id="counter-toggle">×</button>
            </div>
            <div class="counter-body" id="counter-body"></div>
            <div class="counter-footer">
                <span id="counter-remaining">剩余: 0张</span>
            </div>
        `;

        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.appendChild(this._container);
        }

        const toggleBtn = this._container.querySelector('#counter-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleVisibility());
        }
    }

    toggleVisibility() {
        this.visible = !this.visible;
        if (this._container) {
            if (this.visible) {
                this._container.classList.remove('hidden');
            } else {
                this._container.classList.add('hidden');
            }
        }
    }

    show() {
        this.visible = true;
        if (this._container) this._container.classList.remove('hidden');
    }

    hide() {
        this.visible = false;
        if (this._container) this._container.classList.add('hidden');
    }

    updateDisplay() {
        if (!this._container || !this.visible) return;

        const body = this._container.querySelector('#counter-body');
        const remainingEl = this._container.querySelector('#counter-remaining');
        if (!body) return;

        const data = this.getCounterData();
        body.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'counter-grid';

        for (const item of data) {
            const cell = document.createElement('div');
            cell.className = 'counter-cell';

            if (item.isExhausted) {
                cell.classList.add('exhausted');
            } else if (item.remaining === 0) {
                cell.classList.add('all-mine');
            } else if (item.remaining <= 1) {
                cell.classList.add('scarce');
            }

            cell.innerHTML = `
                <div class="counter-rank">${item.display}</div>
                <div class="counter-remaining-count">${item.remaining}</div>
            `;

            grid.appendChild(cell);
        }

        body.appendChild(grid);

        if (remainingEl) {
            remainingEl.textContent = `对手剩余: ${this.getTotalRemaining()}张`;
        }
    }
}

class HandAnalysisPanel {
    constructor() {
        this._container = null;
        this.visible = false;
    }

    createDisplay() {
        if (this._container) return;

        this._container = document.createElement('div');
        this._container.className = 'hand-analysis-panel hidden';
        this._container.id = 'hand-analysis';

        this._container.innerHTML = `
            <div class="analysis-header">
                <span class="analysis-title">手牌分析</span>
                <button class="analysis-toggle-btn" id="analysis-toggle">×</button>
            </div>
            <div class="analysis-body" id="analysis-body"></div>
        `;

        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.appendChild(this._container);
        }

        const toggleBtn = this._container.querySelector('#analysis-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleVisibility());
        }
    }

    toggleVisibility() {
        this.visible = !this.visible;
        if (this._container) {
            if (this.visible) {
                this._container.classList.remove('hidden');
            } else {
                this._container.classList.add('hidden');
            }
        }
    }

    show() {
        this.visible = true;
        if (this._container) this._container.classList.remove('hidden');
    }

    hide() {
        this.visible = false;
        if (this._container) this._container.classList.add('hidden');
    }

    analyze(hand) {
        if (!this._container || !this.visible) return;

        const body = this._container.querySelector('#analysis-body');
        if (!body) return;

        const pattern = CardUtils.getHandPattern(hand);
        const strength = CardUtils.evaluateHandStrength(hand);
        const moves = CardUtils.estimateMinMoves(hand);
        const bombCount = CardUtils.getBombCount(hand);
        const hasRocket = CardUtils.hasJokerPair(hand);

        const analyzer = new HandAnalyzer(hand);
        const straights = analyzer.getStraights();
        const planes = analyzer.getPlanes();
        const straightPairs = analyzer.getStraightPairs();

        body.innerHTML = `
            <div class="analysis-section">
                <div class="analysis-stat">
                    <span>手牌强度</span>
                    <span class="analysis-value">${Math.round(strength)}</span>
                </div>
                <div class="analysis-bar">
                    <div class="analysis-bar-fill" style="width: ${Math.min(100, strength)}%"></div>
                </div>
            </div>

            <div class="analysis-section">
                <div class="analysis-stat">
                    <span>预估手数</span>
                    <span class="analysis-value">${moves}</span>
                </div>
                <div class="analysis-stat">
                    <span>炸弹数</span>
                    <span class="analysis-value ${bombCount > 0 ? 'highlight' : ''}">${bombCount}</span>
                </div>
                <div class="analysis-stat">
                    <span>火箭</span>
                    <span class="analysis-value ${hasRocket ? 'highlight' : ''}">${hasRocket ? '有' : '无'}</span>
                </div>
            </div>

            <div class="analysis-section">
                <div class="analysis-label">牌型分布</div>
                <div class="analysis-distribution">
                    <div class="dist-item">
                        <span class="dist-count">${pattern.singles.length}</span>
                        <span class="dist-name">单张</span>
                    </div>
                    <div class="dist-item">
                        <span class="dist-count">${pattern.pairs.length}</span>
                        <span class="dist-name">对子</span>
                    </div>
                    <div class="dist-item">
                        <span class="dist-count">${pattern.triples.length}</span>
                        <span class="dist-name">三条</span>
                    </div>
                    <div class="dist-item">
                        <span class="dist-count">${pattern.quads.length}</span>
                        <span class="dist-name">炸弹</span>
                    </div>
                </div>
            </div>

            <div class="analysis-section">
                <div class="analysis-label">可用组合</div>
                <div class="analysis-combos">
                    ${straights.length > 0 ? `<span class="combo-tag">顺子×${straights.length}</span>` : ''}
                    ${straightPairs.length > 0 ? `<span class="combo-tag">连对×${straightPairs.length}</span>` : ''}
                    ${planes.length > 0 ? `<span class="combo-tag">飞机×${planes.length}</span>` : ''}
                    ${straights.length === 0 && straightPairs.length === 0 && planes.length === 0 ? '<span class="combo-tag dim">无特殊组合</span>' : ''}
                </div>
            </div>

            <div class="analysis-section">
                <div class="analysis-label">控制牌</div>
                <div class="analysis-controls">
                    ${this._renderControlCards(hand)}
                </div>
            </div>
        `;
    }

    _renderControlCards(hand) {
        const controls = hand.filter(c =>
            c.rank >= CARD_RANKS['A'] || c.isJoker
        );

        if (controls.length === 0) return '<span class="combo-tag dim">无</span>';

        return controls.map(c => {
            let colorClass = c.color === 'red' ? 'ctrl-red' : 'ctrl-black';
            if (c.isJoker) colorClass = c.isBigJoker ? 'ctrl-red' : 'ctrl-blue';
            return `<span class="control-card ${colorClass}">${c.displayValue}${c.suitSymbol}</span>`;
        }).join('');
    }
}

class CardProbabilityCalculator {
    constructor(cardCounter) {
        this.counter = cardCounter;
    }

    getProbabilityOfBeating(myCards, opponentCardCount) {
        if (opponentCardCount === 0) return 0;

        let beatable = 0;
        let total = 0;

        for (const card of myCards) {
            const remaining = this.counter.getRemainingCount(card.rank);
            if (remaining > 0) {
                const higherRanks = this.counter.allRanks.filter(r =>
                    r > card.rank && this.counter.getRemainingCount(r) > 0
                );
                if (higherRanks.length > 0) {
                    beatable++;
                }
                total++;
            }
        }

        return total > 0 ? beatable / total : 0;
    }

    estimateOpponentHasBomb() {
        let possibleBombs = 0;
        for (const rank of this.counter.allRanks) {
            if (rank >= CARD_RANKS['SMALL_JOKER']) continue;
            const remaining = this.counter.getRemainingCount(rank);
            if (remaining === 4) possibleBombs++;
        }

        const hasJokerSmall = this.counter.getRemainingCount(CARD_RANKS['SMALL_JOKER']) > 0;
        const hasJokerBig = this.counter.getRemainingCount(CARD_RANKS['BIG_JOKER']) > 0;
        if (hasJokerSmall && hasJokerBig) possibleBombs++;

        return possibleBombs;
    }

    getTopRemainingCards(count = 5) {
        const remaining = [];
        for (const rank of [...this.counter.allRanks].reverse()) {
            const rem = this.counter.getRemainingCount(rank);
            if (rem > 0) {
                remaining.push({ rank, display: RANK_DISPLAY[rank], count: rem });
                if (remaining.length >= count) break;
            }
        }
        return remaining;
    }

    getRiskAssessment(hand) {
        const risks = [];
        const pattern = CardUtils.getHandPattern(hand);

        const isolatedSingles = pattern.singles.filter(r => r < CARD_RANKS['10']);
        if (isolatedSingles.length >= 3) {
            risks.push({ level: 'high', message: `有${isolatedSingles.length}张低单牌难以出手` });
        }

        const hasControl = hand.some(c => c.rank >= CARD_RANKS['2'] || c.isJoker);
        if (!hasControl) {
            risks.push({ level: 'high', message: '没有控制牌（2或王）' });
        }

        const possibleBombs = this.estimateOpponentHasBomb();
        if (possibleBombs >= 2) {
            risks.push({ level: 'medium', message: `对手可能有${possibleBombs}个炸弹` });
        }

        if (hand.length > 10 && pattern.singles.length > pattern.pairs.length + pattern.triples.length) {
            risks.push({ level: 'medium', message: '手牌散牌偏多' });
        }

        return risks;
    }
}

class SmartHintSystem {
    constructor() {
        this.hintHistory = [];
    }

    getContextualHints(hand, lastPlay, isFirstPlay, gameContext) {
        const hints = [];
        const analyzer = new HandAnalyzer(hand);

        if (isFirstPlay || !lastPlay) {
            const allPlays = analyzer.getAllPlayableHands();
            if (allPlays.length === 0) return hints;

            hints.push(...this._rankFirstPlayHints(hand, allPlays, gameContext));
        } else {
            const playable = analyzer.getPlayableHandsBeating(lastPlay);
            if (playable.length === 0) {
                hints.push({
                    cards: null,
                    suggestion: '无法管住，建议不出',
                    confidence: 'high',
                    reason: '手中没有能管住的牌型'
                });
                return hints;
            }

            hints.push(...this._rankResponseHints(hand, playable, lastPlay, gameContext));
        }

        return hints.slice(0, 5);
    }

    _rankFirstPlayHints(hand, allPlays, gameContext) {
        const scored = allPlays
            .filter(p => p.type !== CARD_TYPE.BOMB && p.type !== CARD_TYPE.ROCKET)
            .map(play => {
                const remaining = CardUtils.removeCards(hand, play.cards);
                const movesDiff = CardUtils.estimateMinMoves(hand) - CardUtils.estimateMinMoves(remaining);
                let score = movesDiff * 10;

                if (play.cards.length >= 5) score += 8;
                if (play.rank < CARD_RANKS['10']) score += 5;
                if (play.rank >= CARD_RANKS['2']) score -= 8;

                return {
                    cards: play.cards,
                    type: play.type,
                    score,
                    suggestion: this._getPlaySuggestion(play, 'first'),
                    confidence: score > 10 ? 'high' : score > 0 ? 'medium' : 'low',
                    reason: this._getPlayReason(play, hand, 'first')
                };
            });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 5);
    }

    _rankResponseHints(hand, playable, lastPlay, gameContext) {
        const scored = playable.map(play => {
            let score = 0;
            const remaining = CardUtils.removeCards(hand, play.cards);
            const movesDiff = CardUtils.estimateMinMoves(hand) - CardUtils.estimateMinMoves(remaining);
            score += movesDiff * 10;

            if (play.type === CARD_TYPE.BOMB || play.type === CARD_TYPE.ROCKET) {
                score -= 20;
                if (hand.length <= 6) score += 30;
            }

            if (play.rank < CARD_RANKS['A']) score += 3;
            if (play.rank >= CARD_RANKS['2']) score -= 5;

            return {
                cards: play.cards,
                type: play.type,
                score,
                suggestion: this._getPlaySuggestion(play, 'response'),
                confidence: score > 5 ? 'high' : score > 0 ? 'medium' : 'low',
                reason: this._getPlayReason(play, hand, 'response')
            };
        });

        scored.sort((a, b) => b.score - a.score);

        scored.push({
            cards: null,
            suggestion: '不出',
            confidence: 'medium',
            reason: '保留手牌，等待更好时机',
            score: 0
        });

        return scored.slice(0, 5);
    }

    _getPlaySuggestion(play, context) {
        const typeName = CARD_TYPE_NAMES[play.type] || '';
        const rankName = RANK_DISPLAY[play.rank] || '';

        if (play.type === CARD_TYPE.BOMB) return `炸弹 ${rankName}`;
        if (play.type === CARD_TYPE.ROCKET) return '火箭';
        if (play.type === CARD_TYPE.STRAIGHT) return `顺子 (${play.length}张)`;
        if (play.type === CARD_TYPE.PLANE) return `飞机 (${play.length}连)`;

        return `${typeName} ${rankName}`;
    }

    _getPlayReason(play, hand, context) {
        const remaining = CardUtils.removeCards(hand, play.cards);
        const movesBefore = CardUtils.estimateMinMoves(hand);
        const movesAfter = CardUtils.estimateMinMoves(remaining);

        if (remaining.length === 0) return '出完即赢！';
        if (movesBefore - movesAfter >= 2) return '大幅减少手数';
        if (play.cards.length >= 5) return '一次消耗大量手牌';
        if (play.rank < CARD_RANKS['10']) return '消耗小牌';
        if (play.type === CARD_TYPE.BOMB) return '使用炸弹翻倍';
        return '常规出牌';
    }
}
