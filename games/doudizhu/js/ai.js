/**
 * ai.js - AI玩家决策逻辑
 */

class AIPlayer {
    constructor(difficulty = DIFFICULTY.NORMAL) {
        this.difficulty = difficulty;
    }

    decideBid(hand, currentBid, position) {
        const suggestedBid = DealAnalyzer.suggestBidScore(hand);

        switch (this.difficulty) {
            case DIFFICULTY.EASY:
                return this._easyBid(suggestedBid, currentBid);
            case DIFFICULTY.HARD:
                return this._hardBid(hand, suggestedBid, currentBid, position);
            default:
                return this._normalBid(suggestedBid, currentBid);
        }
    }

    _easyBid(suggestedBid, currentBid) {
        if (Math.random() < 0.3) return 0;
        if (suggestedBid > currentBid) {
            return Math.min(suggestedBid, currentBid + 1);
        }
        return 0;
    }

    _normalBid(suggestedBid, currentBid) {
        if (suggestedBid <= currentBid) return 0;

        const bidChance = suggestedBid >= 3 ? 0.85 : suggestedBid >= 2 ? 0.6 : 0.4;
        if (Math.random() < bidChance) {
            return currentBid + 1;
        }
        return 0;
    }

    _hardBid(hand, suggestedBid, currentBid, position) {
        const strength = CardUtils.evaluateHandStrength(hand);
        const bombCount = CardUtils.getBombCount(hand);
        const hasRocket = CardUtils.hasJokerPair(hand);

        let confidence = 0;
        if (strength > 100) confidence += 3;
        else if (strength > 80) confidence += 2;
        else if (strength > 60) confidence += 1;

        confidence += bombCount * 2;
        if (hasRocket) confidence += 3;

        const pattern = CardUtils.getHandPattern(hand);
        if (pattern.singles.length <= 2) confidence += 1;
        if (pattern.triples.length >= 2) confidence += 1;

        const has2Count = hand.filter(c => c.rank === CARD_RANKS['2']).length;
        if (has2Count >= 2) confidence += 1;

        const hasA = hand.some(c => c.rank === CARD_RANKS['A']);
        if (hasA && has2Count >= 1) confidence += 1;

        const moves = CardUtils.estimateMinMoves(hand);
        if (moves <= 5) confidence += 2;
        else if (moves <= 7) confidence += 1;
        else if (moves >= 10) confidence -= 1;

        if (position === 2 && currentBid < 3) confidence += 1;

        if (confidence > currentBid + 1) {
            return Math.min(3, currentBid + 1);
        }
        return 0;
    }

    decidePlay(hand, lastPlay, isFirstPlay, gameContext) {
        switch (this.difficulty) {
            case DIFFICULTY.EASY:
                return this._easyPlay(hand, lastPlay, isFirstPlay, gameContext);
            case DIFFICULTY.HARD:
                return this._hardPlay(hand, lastPlay, isFirstPlay, gameContext);
            default:
                return this._normalPlay(hand, lastPlay, isFirstPlay, gameContext);
        }
    }

    _easyPlay(hand, lastPlay, isFirstPlay, gameContext) {
        const analyzer = new HandAnalyzer(hand);

        if (isFirstPlay || !lastPlay) {
            return this._playSmallestFirst(hand, analyzer);
        }

        const playable = analyzer.getPlayableHandsBeating(lastPlay);
        if (playable.length === 0) return null;

        if (Math.random() < 0.2) return null;

        playable.sort((a, b) => a.rank - b.rank);
        return playable[0].cards;
    }

    _normalPlay(hand, lastPlay, isFirstPlay, gameContext) {
        const analyzer = new HandAnalyzer(hand);

        if (isFirstPlay || !lastPlay) {
            return this._playStrategicFirst(hand, analyzer, gameContext);
        }

        const playable = analyzer.getPlayableHandsBeating(lastPlay);
        if (playable.length === 0) return null;

        return this._selectBestPlay(hand, playable, lastPlay, gameContext);
    }

    _hardPlay(hand, lastPlay, isFirstPlay, gameContext) {
        const analyzer = new HandAnalyzer(hand);
        const memory = gameContext._aiMemory || null;
        const advStrategy = new AdvancedAIStrategy(memory);

        if (isFirstPlay || !lastPlay) {
            const optimal = advStrategy.selectOptimalFirstPlay(hand, analyzer, gameContext);
            if (optimal) return optimal;
            return this._playOptimalFirst(hand, analyzer, gameContext);
        }

        const playable = analyzer.getPlayableHandsBeating(lastPlay);
        if (playable.length === 0) return null;

        const response = advStrategy.selectOptimalResponse(hand, playable, lastPlay, gameContext);
        if (response) return response;

        return this._selectOptimalPlay(hand, playable, lastPlay, gameContext);
    }

    _playSmallestFirst(hand, analyzer) {
        const allPlays = analyzer.getAllPlayableHands();
        if (allPlays.length === 0) {
            return hand.length > 0 ? [hand[hand.length - 1]] : null;
        }

        const nonBombs = allPlays.filter(p =>
            p.type !== CARD_TYPE.BOMB && p.type !== CARD_TYPE.ROCKET
        );

        const toPlay = nonBombs.length > 0 ? nonBombs : allPlays;
        toPlay.sort((a, b) => a.rank - b.rank);
        return toPlay[0].cards;
    }

    _playStrategicFirst(hand, analyzer, gameContext) {
        if (hand.length <= 2) {
            const allPlays = analyzer.getAllPlayableHands();
            if (allPlays.length > 0) return allPlays[0].cards;
        }

        const triples = analyzer.getTriplesWithSingle();
        if (triples.length > 0) {
            triples.sort((a, b) => a.rank - b.rank);
            return triples[0].cards;
        }

        const triplesPair = analyzer.getTriplesWithPair();
        if (triplesPair.length > 0) {
            triplesPair.sort((a, b) => a.rank - b.rank);
            return triplesPair[0].cards;
        }

        const straights = analyzer.getStraights();
        if (straights.length > 0) {
            straights.sort((a, b) => a.rank - b.rank);
            return straights[0].cards;
        }

        const straightPairs = analyzer.getStraightPairs();
        if (straightPairs.length > 0) {
            straightPairs.sort((a, b) => a.rank - b.rank);
            return straightPairs[0].cards;
        }

        const planes = analyzer.getPlanes();
        if (planes.length > 0) {
            planes.sort((a, b) => a.rank - b.rank);
            return planes[0].cards;
        }

        const pairs = analyzer.getPairs();
        const nonBigPairs = pairs.filter(p => p.rank < CARD_RANKS['2']);
        if (nonBigPairs.length > 0) {
            nonBigPairs.sort((a, b) => a.rank - b.rank);
            return nonBigPairs[0].cards;
        }

        const singles = analyzer.getSingles();
        const nonBigSingles = singles.filter(s =>
            s.rank < CARD_RANKS['2'] && !s.cards[0].isJoker
        );
        if (nonBigSingles.length > 0) {
            nonBigSingles.sort((a, b) => a.rank - b.rank);
            return nonBigSingles[0].cards;
        }

        const allPlays = analyzer.getAllPlayableHands();
        if (allPlays.length > 0) {
            allPlays.sort((a, b) => a.rank - b.rank);
            return allPlays[0].cards;
        }

        return [hand[hand.length - 1]];
    }

    _playOptimalFirst(hand, analyzer, gameContext) {
        if (hand.length <= 2) {
            const allPlays = analyzer.getAllPlayableHands();
            if (allPlays.length > 0) return allPlays[0].cards;
        }

        const planes = analyzer.getPlanesWithSingles();
        if (planes.length > 0) {
            planes.sort((a, b) => a.rank - b.rank);
            return planes[0].cards;
        }

        const planesWithPairs = analyzer.getPlanesWithPairs();
        if (planesWithPairs.length > 0) {
            planesWithPairs.sort((a, b) => a.rank - b.rank);
            return planesWithPairs[0].cards;
        }

        return this._playStrategicFirst(hand, analyzer, gameContext);
    }

    _selectBestPlay(hand, playable, lastPlay, gameContext) {
        const nonBombs = playable.filter(p =>
            p.type !== CARD_TYPE.BOMB && p.type !== CARD_TYPE.ROCKET
        );

        if (nonBombs.length > 0) {
            const isTeammate = this._isTeammatePlay(gameContext);

            if (isTeammate) {
                if (Math.random() < 0.4) return null;
            }

            nonBombs.sort((a, b) => a.rank - b.rank);

            if (hand.length <= 4) {
                return nonBombs[0].cards;
            }

            if (nonBombs[0].rank >= CARD_RANKS['2'] && nonBombs.length > 1) {
                const lowerPlays = nonBombs.filter(p => p.rank < CARD_RANKS['2']);
                if (lowerPlays.length > 0) return lowerPlays[0].cards;
            }

            return nonBombs[0].cards;
        }

        if (hand.length <= 6) {
            playable.sort((a, b) => a.rank - b.rank);
            return playable[0].cards;
        }

        const enemyClose = this._isEnemyCloseToWin(gameContext);
        if (enemyClose) {
            playable.sort((a, b) => a.rank - b.rank);
            return playable[0].cards;
        }

        return null;
    }

    _selectOptimalPlay(hand, playable, lastPlay, gameContext) {
        const isTeammate = this._isTeammatePlay(gameContext);
        const enemyClose = this._isEnemyCloseToWin(gameContext);
        const teammateClose = this._isTeammateCloseToWin(gameContext);

        const nonBombs = playable.filter(p =>
            p.type !== CARD_TYPE.BOMB && p.type !== CARD_TYPE.ROCKET
        );

        if (hand.length <= 2) {
            playable.sort((a, b) => a.rank - b.rank);
            return playable[0].cards;
        }

        if (isTeammate && !enemyClose) {
            if (teammateClose) return null;

            if (nonBombs.length === 0) return null;

            const cheapPlays = nonBombs.filter(p => {
                const remaining = CardUtils.removeCards(hand, p.cards);
                const beforeMoves = CardUtils.estimateMinMoves(hand);
                const afterMoves = CardUtils.estimateMinMoves(remaining);
                return afterMoves <= beforeMoves;
            });

            if (cheapPlays.length > 0) {
                cheapPlays.sort((a, b) => a.rank - b.rank);
                return cheapPlays[0].cards;
            }
            return null;
        }

        if (enemyClose && nonBombs.length === 0 && playable.length > 0) {
            playable.sort((a, b) => a.rank - b.rank);
            return playable[0].cards;
        }

        if (nonBombs.length > 0) {
            const scored = nonBombs.map(play => ({
                play,
                score: this._scorePlay(hand, play, gameContext)
            }));
            scored.sort((a, b) => b.score - a.score);

            if (scored[0].score < -15 && hand.length > 10 && !enemyClose) {
                return null;
            }

            return scored[0].play.cards;
        }

        if (enemyClose || hand.length <= 6) {
            playable.sort((a, b) => a.rank - b.rank);
            return playable[0].cards;
        }

        return null;
    }

    _scorePlay(hand, play, gameContext) {
        let score = 0;
        const remaining = CardUtils.removeCards(hand, play.cards);
        const beforeMoves = CardUtils.estimateMinMoves(hand);
        const afterMoves = CardUtils.estimateMinMoves(remaining);

        score += (beforeMoves - afterMoves) * 12;

        if (remaining.length === 0) return 200;

        if (play.rank < CARD_RANKS['10']) score += 6;
        else if (play.rank < CARD_RANKS['A']) score += 3;
        else if (play.rank === CARD_RANKS['A']) score -= 1;
        else if (play.rank >= CARD_RANKS['2']) score -= 5;

        if (play.cards.length >= 5) score += play.cards.length;

        const patternAfter = CardUtils.getHandPattern(remaining);
        const isolatedSingles = patternAfter.singles.filter(r => r < CARD_RANKS['10']);
        score -= isolatedSingles.length * 2;

        if (remaining.length <= 3) score += 15;

        const enemyClose = this._isEnemyCloseToWin(gameContext);
        if (enemyClose && play.rank >= CARD_RANKS['A']) {
            score += 10;
        }

        return score;
    }

    _isTeammatePlay(gameContext) {
        if (!gameContext) return false;
        const { currentPlayer, lastPlayPlayer, landlordPosition } = gameContext;
        if (currentPlayer === undefined || lastPlayPlayer === undefined) return false;

        const currentIsLandlord = currentPlayer === landlordPosition;
        const lastIsLandlord = lastPlayPlayer === landlordPosition;

        return currentIsLandlord === lastIsLandlord;
    }

    _isEnemyCloseToWin(gameContext) {
        if (!gameContext) return false;
        const { players, currentPlayer, landlordPosition } = gameContext;
        if (!players) return false;

        const currentIsLandlord = currentPlayer === landlordPosition;

        for (let i = 0; i < players.length; i++) {
            if (i === currentPlayer) continue;
            const isEnemy = (i === landlordPosition) !== currentIsLandlord;
            if (isEnemy && players[i].cardCount <= 3) {
                return true;
            }
        }

        return false;
    }

    _isTeammateCloseToWin(gameContext) {
        if (!gameContext) return false;
        const { players, currentPlayer, landlordPosition } = gameContext;
        if (!players) return false;

        const currentIsLandlord = currentPlayer === landlordPosition;

        for (let i = 0; i < players.length; i++) {
            if (i === currentPlayer) continue;
            const isTeammate = (i === landlordPosition) === currentIsLandlord;
            if (isTeammate && players[i].cardCount <= 2) {
                return true;
            }
        }

        return false;
    }

    getHint(hand, lastPlay, isFirstPlay, gameContext) {
        return this.decidePlay(hand, lastPlay, isFirstPlay, gameContext);
    }

    static evaluatePosition(hand, role, gameContext) {
        const strength = CardUtils.evaluateHandStrength(hand);
        const moves = CardUtils.estimateMinMoves(hand);
        const bombCount = CardUtils.getBombCount(hand);

        let advantage = 0;

        if (role === PLAYER_ROLE.LANDLORD) {
            advantage += strength * 0.5;
            advantage -= moves * 5;
            advantage += bombCount * 15;
        } else {
            advantage += strength * 0.3;
            advantage -= moves * 3;
            advantage += bombCount * 10;
        }

        if (hand.length <= 3) advantage += 20;
        if (hand.length <= 1) advantage += 50;
        if (hand.length === 0) advantage += 100;

        return advantage;
    }
}

class AIStrategyAnalyzer {
    constructor(hand, role, gameContext) {
        this.hand = hand;
        this.role = role;
        this.gameContext = gameContext;
        this.analyzer = new HandAnalyzer(hand);
    }

    planStrategy() {
        const pattern = CardUtils.getHandPattern(this.hand);
        const strength = CardUtils.evaluateHandStrength(this.hand);

        return {
            shouldBeAggressive: strength > 80 || this.hand.length <= 5,
            shouldSaveBombs: this.hand.length > 8,
            mainPlaySequence: this._planPlaySequence(),
            keyCards: this._identifyKeyCards(),
            weakness: this._identifyWeakness(pattern)
        };
    }

    _planPlaySequence() {
        const sequence = [];
        let remaining = [...this.hand];

        const planes = new HandAnalyzer(remaining).getPlanes();
        for (const plane of planes) {
            sequence.push({ type: 'plane', cards: plane.cards });
            remaining = CardUtils.removeCards(remaining, plane.cards);
        }

        const straights = new HandAnalyzer(remaining).getStraights();
        for (const straight of straights) {
            sequence.push({ type: 'straight', cards: straight.cards });
            remaining = CardUtils.removeCards(remaining, straight.cards);
        }

        const straightPairs = new HandAnalyzer(remaining).getStraightPairs();
        for (const sp of straightPairs) {
            sequence.push({ type: 'straight_pair', cards: sp.cards });
            remaining = CardUtils.removeCards(remaining, sp.cards);
        }

        const triples = new HandAnalyzer(remaining).getTriplesWithSingle();
        for (const triple of triples) {
            if (triple.cards.every(c => remaining.some(r => r.id === c.id))) {
                sequence.push({ type: 'triple_with_single', cards: triple.cards });
                remaining = CardUtils.removeCards(remaining, triple.cards);
            }
        }

        const pairsAnalyzer = new HandAnalyzer(remaining);
        const pairs = pairsAnalyzer.getPairs()
            .filter(p => p.cards.every(c => remaining.some(r => r.id === c.id)));
        for (const pair of pairs) {
            sequence.push({ type: 'pair', cards: pair.cards });
            remaining = CardUtils.removeCards(remaining, pair.cards);
        }

        for (const card of remaining) {
            sequence.push({ type: 'single', cards: [card] });
        }

        return sequence;
    }

    _identifyKeyCards() {
        const keyCards = [];

        for (const card of this.hand) {
            if (card.isJoker) keyCards.push(card);
            if (card.rank === CARD_RANKS['2']) keyCards.push(card);
        }

        const bombs = this.analyzer.getBombs();
        for (const bomb of bombs) {
            keyCards.push(...bomb.cards);
        }

        return [...new Set(keyCards)];
    }

    _identifyWeakness(pattern) {
        const weaknesses = [];

        if (pattern.singles.length > 3) {
            weaknesses.push('too_many_singles');
        }

        const lowSingles = pattern.singles.filter(r => r < CARD_RANKS['10']);
        if (lowSingles.length > 2) {
            weaknesses.push('low_singles');
        }

        const noControl = this.hand.every(c =>
            c.rank < CARD_RANKS['A'] && !c.isJoker
        );
        if (noControl) {
            weaknesses.push('no_control_cards');
        }

        return weaknesses;
    }
}

class AIMemory {
    constructor() {
        this.playedCards = [];
        this.playerCardCounts = [0, 0, 0];
        this.playerPassed = [0, 0, 0];
        this.bombCount = 0;
        this.roundHistory = [];
        this.playedRankCounts = {};
        this.lastPlayTypes = [[], [], []];
    }

    recordPlay(playerIndex, cards, passed) {
        if (passed) {
            this.playerPassed[playerIndex]++;
            return;
        }

        this.playedCards.push(...cards);
        this.playerCardCounts[playerIndex] -= cards.length;

        for (const card of cards) {
            this.playedRankCounts[card.rank] = (this.playedRankCounts[card.rank] || 0) + 1;
        }

        const validated = CardValidator.validate(cards);
        if (validated.type === CARD_TYPE.BOMB || validated.type === CARD_TYPE.ROCKET) {
            this.bombCount++;
        }

        this.roundHistory.push({
            player: playerIndex,
            cards: [...cards],
            type: validated.type,
            rank: validated.rank
        });

        this.lastPlayTypes[playerIndex].push(validated.type);
        if (this.lastPlayTypes[playerIndex].length > 10) {
            this.lastPlayTypes[playerIndex].shift();
        }
    }

    getRemainingCardsEstimate() {
        const allCards = CardUtils.createFullDeck();
        const playedIds = new Set(this.playedCards.map(c => c.id));
        return allCards.filter(c => !playedIds.has(c.id));
    }

    getRemainingRankCount(rank) {
        const total = rank >= CARD_RANKS['SMALL_JOKER'] ? 1 : 4;
        return total - (this.playedRankCounts[rank] || 0);
    }

    isRankExhausted(rank) {
        return this.getRemainingRankCount(rank) === 0;
    }

    getPlayerThreatLevel(playerIndex) {
        const cardCount = this.playerCardCounts[playerIndex];
        if (cardCount <= 1) return 'critical';
        if (cardCount <= 3) return 'high';
        if (cardCount <= 6) return 'medium';
        return 'low';
    }

    estimatePlayerStyle(playerIndex) {
        const types = this.lastPlayTypes[playerIndex];
        if (types.length < 3) return 'unknown';

        const hasBombs = types.includes(CARD_TYPE.BOMB) || types.includes(CARD_TYPE.ROCKET);
        const singles = types.filter(t => t === CARD_TYPE.SINGLE).length;
        const combos = types.filter(t =>
            t === CARD_TYPE.STRAIGHT || t === CARD_TYPE.PLANE ||
            t === CARD_TYPE.STRAIGHT_PAIR
        ).length;

        if (hasBombs) return 'aggressive';
        if (combos > singles) return 'combo_player';
        if (singles > 3) return 'cautious';
        return 'balanced';
    }

    getCardCountTrend(playerIndex) {
        const entries = this.roundHistory.filter(h => h.player === playerIndex);
        if (entries.length < 2) return 'stable';

        const recentEntries = entries.slice(-3);
        const avgCardsPlayed = recentEntries.reduce((sum, e) => sum + e.cards.length, 0) / recentEntries.length;

        if (avgCardsPlayed > 3) return 'fast_decreasing';
        if (avgCardsPlayed > 1.5) return 'moderate';
        return 'slow';
    }

    reset() {
        this.playedCards = [];
        this.playerCardCounts = [0, 0, 0];
        this.playerPassed = [0, 0, 0];
        this.bombCount = 0;
        this.roundHistory = [];
        this.playedRankCounts = {};
        this.lastPlayTypes = [[], [], []];
    }

    initialize(cardCounts) {
        this.reset();
        this.playerCardCounts = [...cardCounts];
    }
}

class AdvancedAIStrategy {
    constructor(memory) {
        this.memory = memory;
    }

    shouldUseBomb(hand, gameContext) {
        const { currentPlayer, landlordPosition, players } = gameContext;
        const isLandlord = currentPlayer === landlordPosition;
        const myCards = hand.length;

        if (myCards <= 4) return true;

        if (isLandlord) {
            const farmersClose = players.some((p, i) =>
                i !== landlordPosition && p.cardCount <= 2
            );
            if (farmersClose) return true;
        } else {
            const landlordCards = players[landlordPosition].cardCount;
            if (landlordCards <= 2) return true;
        }

        if (this.memory) {
            const remaining = this.memory.getRemainingCardsEstimate();
            const remainingBombs = CardUtils.getBombCount(remaining);
            if (remainingBombs === 0) return false;
        }

        return false;
    }

    evaluatePlayValue(hand, play, gameContext) {
        let value = 0;
        const remaining = CardUtils.removeCards(hand, play.cards);
        const movesBefore = CardUtils.estimateMinMoves(hand);
        const movesAfter = CardUtils.estimateMinMoves(remaining);

        value += (movesBefore - movesAfter) * 15;

        if (remaining.length === 0) value += 200;

        if (play.type === CARD_TYPE.BOMB || play.type === CARD_TYPE.ROCKET) {
            if (this.shouldUseBomb(hand, gameContext)) {
                value += 30;
            } else {
                value -= 50;
            }
        }

        if (play.rank < CARD_RANKS['10']) value += 5;
        else if (play.rank >= CARD_RANKS['2']) value -= 8;
        else if (play.rank >= CARD_RANKS['A']) value -= 3;

        const isBigCombo = play.cards.length >= 5;
        if (isBigCombo) value += play.cards.length * 2;

        const patternAfter = CardUtils.getHandPattern(remaining);
        const isolatedSingles = patternAfter.singles.filter(r => r < CARD_RANKS['A']);
        value -= isolatedSingles.length * 3;

        return value;
    }

    selectOptimalFirstPlay(hand, analyzer, gameContext) {
        const allPlays = analyzer.getAllPlayableHands();
        if (allPlays.length === 0) return null;

        if (hand.length <= 2) {
            return allPlays[0].cards;
        }

        const scored = allPlays
            .filter(p => p.type !== CARD_TYPE.BOMB && p.type !== CARD_TYPE.ROCKET)
            .map(play => ({
                play,
                value: this.evaluatePlayValue(hand, play, gameContext)
            }));

        if (scored.length === 0) {
            return allPlays[0].cards;
        }

        scored.sort((a, b) => b.value - a.value);
        return scored[0].play.cards;
    }

    selectOptimalResponse(hand, playable, lastPlay, gameContext) {
        if (playable.length === 0) return null;

        const { currentPlayer, landlordPosition, players } = gameContext;
        const isLandlord = currentPlayer === landlordPosition;
        const isTeammatePlay = this._checkTeammate(currentPlayer, gameContext.lastPlayPlayer, landlordPosition);

        if (hand.length <= 3) {
            playable.sort((a, b) => a.rank - b.rank);
            return playable[0].cards;
        }

        if (isTeammatePlay) {
            const nonBombs = playable.filter(p =>
                p.type !== CARD_TYPE.BOMB && p.type !== CARD_TYPE.ROCKET
            );
            if (nonBombs.length === 0) return null;

            const enemyDanger = this._getEnemyDangerLevel(gameContext, isLandlord);
            if (enemyDanger === 'low') return null;

            nonBombs.sort((a, b) => a.rank - b.rank);
            return nonBombs[0].cards;
        }

        const scored = playable.map(play => ({
            play,
            value: this.evaluatePlayValue(hand, play, gameContext)
        }));

        scored.sort((a, b) => b.value - a.value);

        if (scored[0].value < -20 && hand.length > 8) {
            return null;
        }

        return scored[0].play.cards;
    }

    _checkTeammate(current, lastPlayer, landlord) {
        if (current === undefined || lastPlayer === undefined) return false;
        return (current === landlord) === (lastPlayer === landlord);
    }

    _getEnemyDangerLevel(gameContext, isLandlord) {
        const { players, landlordPosition } = gameContext;
        let minEnemyCards = 20;

        for (let i = 0; i < players.length; i++) {
            const isEnemy = isLandlord ? (i !== landlordPosition) : (i === landlordPosition);
            if (isEnemy) {
                minEnemyCards = Math.min(minEnemyCards, players[i].cardCount);
            }
        }

        if (minEnemyCards <= 1) return 'critical';
        if (minEnemyCards <= 3) return 'high';
        if (minEnemyCards <= 6) return 'medium';
        return 'low';
    }
}
