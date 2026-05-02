/**
 * player.js - 玩家类和玩家管理
 */

class Player {
    constructor(position, type, name) {
        this.position = position;
        this.type = type;
        this.name = name;
        this.hand = [];
        this.role = PLAYER_ROLE.UNKNOWN;
        this.bid = 0;
        this.hasBid = false;
        this.playedRounds = 0;
        this.totalCardsPlayed = 0;
        this.passCount = 0;
        this.bombsPlayed = 0;
        this.ai = type === PLAYER_TYPE.AI ? new AIPlayer() : null;
        this.aiMemory = type === PLAYER_TYPE.AI ? new AIMemory() : null;
    }

    get isHuman() {
        return this.type === PLAYER_TYPE.HUMAN;
    }

    get isAI() {
        return this.type === PLAYER_TYPE.AI;
    }

    get isLandlord() {
        return this.role === PLAYER_ROLE.LANDLORD;
    }

    get isFarmer() {
        return this.role === PLAYER_ROLE.FARMER;
    }

    get cardCount() {
        return this.hand.length;
    }

    get hasCards() {
        return this.hand.length > 0;
    }

    get roleDisplay() {
        if (this.role === PLAYER_ROLE.LANDLORD) return '地主';
        if (this.role === PLAYER_ROLE.FARMER) return '农民';
        return '';
    }

    get roleBadgeText() {
        if (this.role === PLAYER_ROLE.LANDLORD) return '主';
        if (this.role === PLAYER_ROLE.FARMER) return '农';
        return '';
    }

    setHand(cards) {
        this.hand = CardUtils.sortCards(cards);
    }

    addCards(cards) {
        this.hand = CardUtils.sortCards([...this.hand, ...cards]);
    }

    removeCards(cards) {
        this.hand = CardUtils.removeCards(this.hand, cards);
        this.totalCardsPlayed += cards.length;
        this.playedRounds++;
    }

    sortHand() {
        this.hand = CardUtils.sortCards(this.hand);
    }

    getSelectedCards() {
        return this.hand.filter(c => c.selected);
    }

    clearSelection() {
        for (const card of this.hand) {
            card.selected = false;
        }
    }

    toggleCardSelection(cardId) {
        const card = this.hand.find(c => c.id === cardId);
        if (card) {
            card.selected = !card.selected;
            return card;
        }
        return null;
    }

    selectCards(cardIds) {
        this.clearSelection();
        for (const id of cardIds) {
            const card = this.hand.find(c => c.id === id);
            if (card) card.selected = true;
        }
    }

    setRole(role) {
        this.role = role;
    }

    setBid(bid) {
        this.bid = bid;
        this.hasBid = true;
    }

    setDifficulty(difficulty) {
        if (this.ai) {
            this.ai.difficulty = difficulty;
        }
    }

    reset() {
        this.hand = [];
        this.role = PLAYER_ROLE.UNKNOWN;
        this.bid = 0;
        this.hasBid = false;
        this.playedRounds = 0;
        this.totalCardsPlayed = 0;
        this.passCount = 0;
        this.bombsPlayed = 0;
        if (this.aiMemory) this.aiMemory.reset();
    }

    getAIBid(currentBid) {
        if (!this.ai) return 0;
        return this.ai.decideBid(this.hand, currentBid, this.position);
    }

    getAIPlay(lastPlay, isFirstPlay, gameContext) {
        if (!this.ai) return null;
        return this.ai.decidePlay(this.hand, lastPlay, isFirstPlay, gameContext);
    }

    getAIHint(lastPlay, isFirstPlay, gameContext) {
        if (!this.ai) {
            const tempAI = new AIPlayer(DIFFICULTY.HARD);
            return tempAI.getHint(this.hand, lastPlay, isFirstPlay, gameContext);
        }
        return this.ai.getHint(this.hand, lastPlay, isFirstPlay, gameContext);
    }

    canPlay(lastPlay) {
        if (!lastPlay) return true;
        const analyzer = new HandAnalyzer(this.hand);
        const playable = analyzer.getPlayableHandsBeating(lastPlay);
        return playable.length > 0;
    }

    estimateStrength() {
        return CardUtils.evaluateHandStrength(this.hand);
    }

    clone() {
        const p = new Player(this.position, this.type, this.name);
        p.hand = this.hand.map(c => c.clone());
        p.role = this.role;
        p.bid = this.bid;
        p.hasBid = this.hasBid;
        p.playedRounds = this.playedRounds;
        p.totalCardsPlayed = this.totalCardsPlayed;
        p.passCount = this.passCount;
        p.bombsPlayed = this.bombsPlayed;
        return p;
    }
}

class PlayerManager {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.landlordIndex = -1;
    }

    initialize() {
        this.players = [
            new Player(PLAYER_POSITION.BOTTOM, PLAYER_TYPE.HUMAN, '你'),
            new Player(PLAYER_POSITION.RIGHT, PLAYER_TYPE.AI, '电脑A'),
            new Player(PLAYER_POSITION.LEFT, PLAYER_TYPE.AI, '电脑B')
        ];
        this.currentPlayerIndex = 0;
        this.landlordIndex = -1;
    }

    setDifficulty(difficulty) {
        for (const player of this.players) {
            player.setDifficulty(difficulty);
        }
    }

    getPlayer(index) {
        return this.players[index];
    }

    getHumanPlayer() {
        return this.players.find(p => p.isHuman);
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getLandlord() {
        return this.landlordIndex >= 0 ? this.players[this.landlordIndex] : null;
    }

    getFarmers() {
        return this.players.filter((_, i) => i !== this.landlordIndex);
    }

    getNextPlayerIndex(from = null) {
        const current = from !== null ? from : this.currentPlayerIndex;
        return (current + 1) % PLAYER_COUNT;
    }

    advanceTurn() {
        this.currentPlayerIndex = this.getNextPlayerIndex();
        return this.currentPlayerIndex;
    }

    setCurrentPlayer(index) {
        this.currentPlayerIndex = index;
    }

    setLandlord(index) {
        this.landlordIndex = index;
        this.players[index].setRole(PLAYER_ROLE.LANDLORD);
        for (let i = 0; i < this.players.length; i++) {
            if (i !== index) {
                this.players[i].setRole(PLAYER_ROLE.FARMER);
            }
        }
    }

    dealHands(hands) {
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].setHand(hands[i]);
        }
    }

    addDizhuCards(playerIndex, cards) {
        this.players[playerIndex].addCards(cards);
    }

    resetAll() {
        for (const player of this.players) {
            player.reset();
        }
        this.currentPlayerIndex = 0;
        this.landlordIndex = -1;
    }

    getCardCounts() {
        return this.players.map(p => p.cardCount);
    }

    isGameOver() {
        return this.players.some(p => p.cardCount === 0);
    }

    getWinner() {
        const winner = this.players.find(p => p.cardCount === 0);
        return winner ? this.players.indexOf(winner) : -1;
    }

    isLandlordWin() {
        const winner = this.getWinner();
        return winner === this.landlordIndex;
    }

    checkSpring() {
        if (!this.isGameOver()) return { spring: false, antiSpring: false };

        const landlord = this.getLandlord();
        const farmers = this.getFarmers();

        const spring = landlord && landlord.cardCount === 0 &&
            farmers.every(f => f.playedRounds === 0);

        const antiSpring = !this.isLandlordWin() && landlord &&
            landlord.playedRounds <= 1;

        return { spring, antiSpring };
    }

    getGameContext(currentPlayer) {
        return {
            currentPlayer: currentPlayer !== undefined ? currentPlayer : this.currentPlayerIndex,
            landlordPosition: this.landlordIndex,
            players: this.players.map(p => ({
                cardCount: p.cardCount,
                role: p.role,
                passCount: p.passCount,
                playedRounds: p.playedRounds
            }))
        };
    }

    initializeAIMemory() {
        const cardCounts = this.getCardCounts();
        for (const player of this.players) {
            if (player.aiMemory) {
                player.aiMemory.initialize(cardCounts);
            }
        }
    }

    recordPlayForAI(playerIndex, cards, passed) {
        for (const player of this.players) {
            if (player.aiMemory) {
                player.aiMemory.recordPlay(playerIndex, cards, passed);
            }
        }
    }

    calculateScores(baseBid, bombCount, hasSpring, hasAntiSpring) {
        let multiplier = baseBid;

        multiplier *= Math.pow(2, bombCount);

        if (hasSpring || hasAntiSpring) {
            multiplier *= 2;
        }

        const baseScore = BASE_SCORE * multiplier;
        const isLandlordWin = this.isLandlordWin();
        const scores = [];

        for (let i = 0; i < this.players.length; i++) {
            if (i === this.landlordIndex) {
                scores.push(isLandlordWin ? baseScore * 2 : -baseScore * 2);
            } else {
                scores.push(isLandlordWin ? -baseScore : baseScore);
            }
        }

        return scores;
    }
}
