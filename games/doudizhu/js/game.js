/**
 * game.js - 游戏主逻辑控制
 */

class Game extends EventEmitter {
    constructor(renderer, animationController, soundManager, config) {
        super();
        this.renderer = renderer;
        this.animation = animationController;
        this.sound = soundManager;
        this.config = config;

        this.playerManager = new PlayerManager();
        this.phase = GAME_PHASE.IDLE;
        this.deck = new Deck();

        this.dizhuCards = [];
        this.currentBid = 0;
        this.bidCount = 0;
        this.firstBidder = 0;
        this.highestBidder = -1;
        this.bombCount = 0;

        this.lastPlay = null;
        this.lastPlayPlayer = -1;
        this.passCount = 0;
        this.roundStarter = -1;

        this.hintIndex = 0;
        this.hintCache = [];

        this.isProcessing = false;
        this._turnTimeout = null;

        this.autoPlayEnabled = false;
        this._autoPlayAI = new AIPlayer(DIFFICULTY.HARD);
    }

    get speedConfig() {
        return this.config.getSpeedConfig();
    }

    async startNewGame() {
        this.resetGameState();
        this.playerManager.initialize();
        this.playerManager.setDifficulty(this.config.difficulty);
        this.renderer.resetGameScreen();
        this.renderer.showScreen('game-screen');

        this.phase = GAME_PHASE.DEALING;
        this.emit(EVENT_TYPES.GAME_START);

        await this.dealCards();
    }

    resetGameState() {
        this.phase = GAME_PHASE.IDLE;
        this.dizhuCards = [];
        this.currentBid = 0;
        this.bidCount = 0;
        this.firstBidder = 0;
        this.highestBidder = -1;
        this.bombCount = 0;
        this.lastPlay = null;
        this.lastPlayPlayer = -1;
        this.passCount = 0;
        this.roundStarter = -1;
        this.hintIndex = 0;
        this.hintCache = [];
        this.isProcessing = false;
        this._clearTimeout();
    }

    _clearTimeout() {
        if (this._turnTimeout) {
            clearTimeout(this._turnTimeout);
            this._turnTimeout = null;
        }
    }

    async dealCards() {
        this.renderer.showMessage(MESSAGES.DEALING);

        const dealResult = this.deck.deal();
        this.playerManager.dealHands(dealResult.hands);
        this.dizhuCards = dealResult.dizhuCards;

        this.renderer.renderDizhuCards(this.dizhuCards, false);

        await this.animation.dealCardsAnimation(this.playerManager, this.speedConfig);

        this.renderer.renderAICards(PLAYER_POSITION.LEFT,
            this.playerManager.getPlayer(PLAYER_POSITION.LEFT).cardCount);
        this.renderer.renderAICards(PLAYER_POSITION.RIGHT,
            this.playerManager.getPlayer(PLAYER_POSITION.RIGHT).cardCount);
        this.renderer.updateCardCount(PLAYER_POSITION.LEFT,
            this.playerManager.getPlayer(PLAYER_POSITION.LEFT).cardCount);
        this.renderer.updateCardCount(PLAYER_POSITION.RIGHT,
            this.playerManager.getPlayer(PLAYER_POSITION.RIGHT).cardCount);

        const human = this.playerManager.getHumanPlayer();
        this.renderer.renderHandCards(human.hand, (cardId) => this.onCardClick(cardId));

        this.renderer.clearMessage();
        this.emit(EVENT_TYPES.DEAL_COMPLETE);

        await sleep(500);
        this.startBidding();
    }

    startBidding() {
        this.phase = GAME_PHASE.BIDDING;
        this.currentBid = 0;
        this.bidCount = 0;
        this.highestBidder = -1;
        this.firstBidder = Math.floor(Math.random() * PLAYER_COUNT);

        this.playerManager.setCurrentPlayer(this.firstBidder);
        this.emit(EVENT_TYPES.BID_START);

        this.processBidTurn();
    }

    async processBidTurn() {
        const currentPlayer = this.playerManager.getCurrentPlayer();
        const currentIndex = this.playerManager.currentPlayerIndex;

        this.renderer.setActiveTurn(currentIndex);

        if (currentPlayer.isHuman && !this.autoPlayEnabled) {
            this.renderer.showMessage(MESSAGES.BID_TURN);
            this.renderer.showBidArea();
            this.renderer.updateBidButtons(this.currentBid);
        } else if (currentPlayer.isHuman && this.autoPlayEnabled) {
            this.renderer.showMessage('托管叫分中...');
            await sleep(this.speedConfig.bidDelay * 0.8);

            const bid = this._autoPlayAI.decideBid(
                currentPlayer.hand, this.currentBid, currentIndex
            );
            this.renderer.hideBidArea();
            await this.handleBid(currentIndex, bid);
        } else {
            this.renderer.showMessage(MESSAGES.BID_WAIT);
            await sleep(this.speedConfig.bidDelay);

            const bid = currentPlayer.getAIBid(this.currentBid);
            await this.handleBid(currentIndex, bid);
        }
    }

    async handleBid(playerIndex, bid) {
        const player = this.playerManager.getPlayer(playerIndex);
        player.setBid(bid);
        this.bidCount++;

        this.sound.play(SOUND_TYPES.BID);

        if (bid > 0) {
            this.currentBid = bid;
            this.highestBidder = playerIndex;
        }

        await this.animation.bidAnimation(playerIndex, bid);
        this.emit(EVENT_TYPES.BID_MADE, { player: playerIndex, bid });

        if (bid === 3) {
            this.renderer.hideBidArea();
            await sleep(this.speedConfig.messageDelay);
            this.finalizeBid();
            return;
        }

        if (this.bidCount >= PLAYER_COUNT) {
            this.renderer.hideBidArea();
            await sleep(this.speedConfig.messageDelay);

            if (this.highestBidder === -1) {
                await this.animation.messageAnimation(MESSAGES.NO_ONE_BID, 2000);
                await this.restartDeal();
                return;
            }

            this.finalizeBid();
            return;
        }

        this.playerManager.advanceTurn();
        this.processBidTurn();
    }

    async restartDeal() {
        this.resetGameState();
        this.playerManager.resetAll();
        this.renderer.resetGameScreen();
        this.deck = new Deck();

        this.phase = GAME_PHASE.DEALING;
        await this.dealCards();
    }

    async finalizeBid() {
        this.playerManager.setLandlord(this.highestBidder);

        for (let i = 0; i < PLAYER_COUNT; i++) {
            const player = this.playerManager.getPlayer(i);
            this.renderer.setRoleBadge(i, player.role);
        }

        const landlordName = this.playerManager.getLandlord().name;
        await this.animation.messageAnimation(`${landlordName} 成为地主！`, 1500);

        await this.animation.revealDizhuCards(this.dizhuCards);
        this.playerManager.addDizhuCards(this.highestBidder, this.dizhuCards);

        if (this.highestBidder === PLAYER_POSITION.BOTTOM) {
            const human = this.playerManager.getHumanPlayer();
            this.renderer.renderHandCards(human.hand, (cardId) => this.onCardClick(cardId));
        }

        this.renderer.renderAICards(PLAYER_POSITION.LEFT,
            this.playerManager.getPlayer(PLAYER_POSITION.LEFT).cardCount);
        this.renderer.renderAICards(PLAYER_POSITION.RIGHT,
            this.playerManager.getPlayer(PLAYER_POSITION.RIGHT).cardCount);
        this.renderer.updateCardCount(PLAYER_POSITION.LEFT,
            this.playerManager.getPlayer(PLAYER_POSITION.LEFT).cardCount);
        this.renderer.updateCardCount(PLAYER_POSITION.RIGHT,
            this.playerManager.getPlayer(PLAYER_POSITION.RIGHT).cardCount);

        this.renderer.updateGameInfo(this.currentBid, this.bombCount);
        this.playerManager.initializeAIMemory();

        this.emit(EVENT_TYPES.BID_COMPLETE, { landlord: this.highestBidder, bid: this.currentBid });

        await sleep(1000);
        this.startPlayPhase();
    }

    startPlayPhase() {
        this.phase = GAME_PHASE.PLAYING;
        this.lastPlay = null;
        this.lastPlayPlayer = -1;
        this.passCount = 0;

        this.playerManager.setCurrentPlayer(this.highestBidder);
        this.roundStarter = this.highestBidder;

        this.renderer.hideDizhuCards();
        this.renderer.clearMessage();
        this.renderer.clearPlayedCards();

        this.processPlayTurn();
    }

    async processPlayTurn() {
        if (this.phase !== GAME_PHASE.PLAYING) return;

        const currentIndex = this.playerManager.currentPlayerIndex;
        const currentPlayer = this.playerManager.getCurrentPlayer();

        this.renderer.setActiveTurn(currentIndex);
        this.renderer.clearPlayedCards(currentIndex);
        this.renderer.clearPlayerAction(currentIndex);

        const isFirstPlay = this.lastPlay === null ||
            this.lastPlayPlayer === currentIndex;

        if (isFirstPlay) {
            this.lastPlay = null;
            this.lastPlayPlayer = -1;
            this.passCount = 0;
            this.renderer.clearPlayedCards();
            this.renderer.clearAllActions();
        }

        this.emit(EVENT_TYPES.TURN_START, { player: currentIndex });

        if (currentPlayer.isHuman) {
            this.handleHumanTurn(isFirstPlay);
        } else {
            await this.handleAITurn(currentIndex, isFirstPlay);
        }
    }

    handleHumanTurn(isFirstPlay) {
        if (this.autoPlayEnabled) {
            this._handleAutoPlay(isFirstPlay);
            return;
        }

        this.renderer.showMessage(MESSAGES.YOUR_TURN);
        const canPass = !isFirstPlay && this.lastPlay !== null;
        this.renderer.showPlayButtons(canPass);
        this.hintIndex = 0;
        this.hintCache = [];
    }

    async _handleAutoPlay(isFirstPlay) {
        this.renderer.hidePlayButtons();
        this.renderer.showMessage('托管中...');

        await sleep(this.speedConfig.aiThinkTime * 0.6);

        if (this.phase !== GAME_PHASE.PLAYING) return;

        const human = this.playerManager.getHumanPlayer();
        const gameContext = this.playerManager.getGameContext(0);
        gameContext.lastPlayPlayer = this.lastPlayPlayer;
        gameContext.landlordPosition = this.playerManager.landlordIndex;
        gameContext._aiMemory = null;

        const cards = this._autoPlayAI.decidePlay(
            human.hand, this.lastPlay, isFirstPlay, gameContext
        );

        human.clearSelection();

        if (cards && cards.length > 0) {
            await this.executePlay(0, cards);
        } else {
            if (isFirstPlay) {
                const analyzer = new HandAnalyzer(human.hand);
                const allPlays = analyzer.getAllPlayableHands();
                if (allPlays.length > 0) {
                    allPlays.sort((a, b) => a.rank - b.rank);
                    await this.executePlay(0, allPlays[0].cards);
                    return;
                }
            }
            await this.executePass(0);
        }
    }

    async handleAITurn(playerIndex, isFirstPlay) {
        const player = this.playerManager.getPlayer(playerIndex);

        await sleep(this.speedConfig.aiThinkTime);

        if (this.phase !== GAME_PHASE.PLAYING) return;

        const gameContext = this.playerManager.getGameContext(playerIndex);
        gameContext.lastPlayPlayer = this.lastPlayPlayer;
        gameContext.landlordPosition = this.playerManager.landlordIndex;
        gameContext._aiMemory = player.aiMemory || null;

        const cards = player.getAIPlay(this.lastPlay, isFirstPlay, gameContext);

        if (cards && cards.length > 0) {
            await this.executePlay(playerIndex, cards);
        } else {
            await this.executePass(playerIndex);
        }
    }

    async executePlay(playerIndex, cards) {
        const player = this.playerManager.getPlayer(playerIndex);

        const validated = CardValidator.validate(cards);
        if (validated.type === CARD_TYPE.INVALID) {
            console.error('AI played invalid cards:', cards);
            await this.executePass(playerIndex);
            return;
        }

        player.removeCards(cards);
        this.playerManager.recordPlayForAI(playerIndex, cards, false);

        if (validated.type === CARD_TYPE.BOMB || validated.type === CARD_TYPE.ROCKET) {
            this.bombCount++;
            player.bombsPlayed++;
            this.renderer.updateGameInfo(this.currentBid, this.bombCount);

            if (validated.type === CARD_TYPE.BOMB) {
                this.sound.playBombSound();
            } else {
                this.sound.playRocketSound();
            }
        } else {
            this.sound.play(SOUND_TYPES.PLAY_CARD);
        }

        this.lastPlay = validated;
        this.lastPlayPlayer = playerIndex;
        this.passCount = 0;

        await this.animation.playCardsAnimation(playerIndex, cards);

        if (playerIndex === PLAYER_POSITION.BOTTOM) {
            const human = this.playerManager.getHumanPlayer();
            this.renderer.renderHandCards(human.hand, (cardId) => this.onCardClick(cardId));
        }

        this.renderer.renderAICards(PLAYER_POSITION.LEFT,
            this.playerManager.getPlayer(PLAYER_POSITION.LEFT).cardCount);
        this.renderer.renderAICards(PLAYER_POSITION.RIGHT,
            this.playerManager.getPlayer(PLAYER_POSITION.RIGHT).cardCount);
        this.renderer.updateCardCount(PLAYER_POSITION.LEFT,
            this.playerManager.getPlayer(PLAYER_POSITION.LEFT).cardCount);
        this.renderer.updateCardCount(PLAYER_POSITION.RIGHT,
            this.playerManager.getPlayer(PLAYER_POSITION.RIGHT).cardCount);

        const description = CardValidator.describePlay(cards);
        this.renderer.showPlayerAction(playerIndex, description, 2000);

        this.emit(EVENT_TYPES.CARDS_PLAYED, { player: playerIndex, cards, type: validated });

        if (player.cardCount === 0) {
            await sleep(this.speedConfig.playCardDelay);
            this.endGame(playerIndex);
            return;
        }

        await sleep(this.speedConfig.playCardDelay);
        this.advanceToNextTurn();
    }

    async executePass(playerIndex) {
        const player = this.playerManager.getPlayer(playerIndex);
        player.passCount++;
        this.passCount++;

        this.playerManager.recordPlayForAI(playerIndex, [], true);

        this.sound.play(SOUND_TYPES.PASS);
        await this.animation.passAnimation(playerIndex);

        this.emit(EVENT_TYPES.PASS_TURN, { player: playerIndex });

        await sleep(this.speedConfig.playCardDelay);
        this.advanceToNextTurn();
    }

    advanceToNextTurn() {
        this.playerManager.advanceTurn();
        this.processPlayTurn();
    }

    onCardClick(cardId) {
        if (this.phase !== GAME_PHASE.PLAYING) return;

        const currentPlayer = this.playerManager.getCurrentPlayer();
        if (!currentPlayer.isHuman) return;

        const card = currentPlayer.toggleCardSelection(cardId);
        if (card) {
            this.sound.play(SOUND_TYPES.SELECT);
            this.renderer.updateCardSelection(cardId, card.selected);
        }

        this.hintIndex = 0;
        this.hintCache = [];

        const selected = currentPlayer.getSelectedCards();
        if (selected.length > 0) {
            const isFirstPlay = this.lastPlay === null ||
                this.lastPlayPlayer === this.playerManager.currentPlayerIndex;
            const isValid = CardValidator.isValidPlay(selected, this.lastPlay, isFirstPlay);
            this.renderer.setPlayButtonEnabled(isValid);
        } else {
            this.renderer.setPlayButtonEnabled(false);
        }
    }

    async onPlayClick() {
        if (this.phase !== GAME_PHASE.PLAYING || this.isProcessing) return;

        const currentPlayer = this.playerManager.getCurrentPlayer();
        if (!currentPlayer.isHuman) return;

        const selected = currentPlayer.getSelectedCards();
        if (selected.length === 0) return;

        const isFirstPlay = this.lastPlay === null ||
            this.lastPlayPlayer === this.playerManager.currentPlayerIndex;

        if (!CardValidator.isValidPlay(selected, this.lastPlay, isFirstPlay)) {
            this.renderer.showMessage(MESSAGES.INVALID_CARDS, 1000);
            this.animation.shakeHandCards();
            return;
        }

        this.isProcessing = true;
        this.renderer.hidePlayButtons();
        this.renderer.clearMessage();

        currentPlayer.clearSelection();
        await this.executePlay(this.playerManager.currentPlayerIndex, selected);
        this.isProcessing = false;
    }

    async onPassClick() {
        if (this.phase !== GAME_PHASE.PLAYING || this.isProcessing) return;

        const currentPlayer = this.playerManager.getCurrentPlayer();
        if (!currentPlayer.isHuman) return;

        const isFirstPlay = this.lastPlay === null ||
            this.lastPlayPlayer === this.playerManager.currentPlayerIndex;

        if (isFirstPlay) {
            this.renderer.showMessage(MESSAGES.MUST_PLAY, 1000);
            return;
        }

        this.isProcessing = true;
        this.renderer.hidePlayButtons();
        this.renderer.clearMessage();

        currentPlayer.clearSelection();
        this.renderer.renderHandCards(currentPlayer.hand, (cardId) => this.onCardClick(cardId));

        await this.executePass(this.playerManager.currentPlayerIndex);
        this.isProcessing = false;
    }

    onHintClick() {
        if (this.phase !== GAME_PHASE.PLAYING) return;

        const currentPlayer = this.playerManager.getCurrentPlayer();
        if (!currentPlayer.isHuman) return;

        const isFirstPlay = this.lastPlay === null ||
            this.lastPlayPlayer === this.playerManager.currentPlayerIndex;

        if (this.hintCache.length === 0) {
            const analyzer = new HandAnalyzer(currentPlayer.hand);
            const playable = isFirstPlay
                ? analyzer.getAllPlayableHands()
                : analyzer.getPlayableHandsBeating(this.lastPlay);

            this.hintCache = playable;
            this.hintIndex = 0;
        }

        if (this.hintCache.length === 0) {
            this.renderer.showMessage(MESSAGES.CANNOT_BEAT, 1000);
            return;
        }

        const hint = this.hintCache[this.hintIndex % this.hintCache.length];
        this.hintIndex++;

        currentPlayer.clearSelection();
        for (const card of hint.cards) {
            const handCard = currentPlayer.hand.find(c => c.id === card.id);
            if (handCard) handCard.selected = true;
        }

        this.renderer.renderHandCards(currentPlayer.hand, (cardId) => this.onCardClick(cardId));
        this.renderer.setPlayButtonEnabled(true);

        this.sound.play(SOUND_TYPES.CLICK);
    }

    async endGame(winnerIndex) {
        this.phase = GAME_PHASE.FINISHED;
        this._clearTimeout();

        const isLandlordWin = winnerIndex === this.playerManager.landlordIndex;
        const { spring, antiSpring } = this.playerManager.checkSpring();

        if (spring) {
            await this.animation.springAnimation();
        } else if (antiSpring) {
            await this.animation.antiSpringAnimation();
        }

        const scores = this.playerManager.calculateScores(
            this.currentBid, this.bombCount, spring, antiSpring
        );

        const humanIndex = 0;
        const humanIsLandlord = humanIndex === this.playerManager.landlordIndex;
        const humanWins = (isLandlordWin && humanIsLandlord) ||
            (!isLandlordWin && !humanIsLandlord);

        if (humanWins) {
            this.sound.playWinJingle();
        } else {
            this.sound.playLoseJingle();
        }

        let multiplier = this.currentBid;
        multiplier *= Math.pow(2, this.bombCount);
        if (spring || antiSpring) multiplier *= 2;

        const resultData = {
            isWin: humanWins,
            isLandlordWin,
            spring,
            antiSpring,
            multiplier,
            bombCount: this.bombCount,
            players: this.playerManager.players.map((p, i) => ({
                name: p.name,
                roleDisplay: p.roleDisplay,
                isLandlord: p.isLandlord,
                score: scores[i]
            }))
        };

        await this.animation.winAnimation(humanWins);
        this.renderer.renderResult(resultData);

        this.emit(EVENT_TYPES.GAME_END, resultData);
    }

    onBid(bid) {
        if (this.phase !== GAME_PHASE.BIDDING) return;

        const currentPlayer = this.playerManager.getCurrentPlayer();
        if (!currentPlayer.isHuman) return;

        this.renderer.hideBidArea();
        this.renderer.clearMessage();
        this.sound.play(SOUND_TYPES.BID);

        this.handleBid(this.playerManager.currentPlayerIndex, bid);
    }

    pauseGame() {
        this.renderer.showPauseMenu();
    }

    resumeGame() {
        this.renderer.hidePauseMenu();
    }

    async restartGame() {
        this.renderer.hidePauseMenu();
        this.phase = GAME_PHASE.IDLE;
        this._clearTimeout();
        this.animation.cancelAllAnimations();
        await this.startNewGame();
    }

    quitGame() {
        this.phase = GAME_PHASE.IDLE;
        this._clearTimeout();
        this.animation.cancelAllAnimations();
        this.renderer.hidePauseMenu();
        this.renderer.showScreen('start-screen');
    }

    setAutoPlay(enabled) {
        this.autoPlayEnabled = enabled;
        this.emit('auto_play_changed', { enabled });

        if (enabled && this.phase === GAME_PHASE.PLAYING) {
            const current = this.playerManager.getCurrentPlayer();
            if (current.isHuman && !this.isProcessing) {
                this.renderer.hidePlayButtons();
                current.clearSelection();
                this.renderer.renderHandCards(current.hand, (cardId) => this.onCardClick(cardId));
                this._handleAutoPlay(
                    this.lastPlay === null || this.lastPlayPlayer === this.playerManager.currentPlayerIndex
                );
            }
        }

        if (enabled && this.phase === GAME_PHASE.BIDDING) {
            const current = this.playerManager.getCurrentPlayer();
            if (current.isHuman) {
                this.renderer.hideBidArea();
                const bid = this._autoPlayAI.decideBid(
                    current.hand, this.currentBid, this.playerManager.currentPlayerIndex
                );
                this.handleBid(this.playerManager.currentPlayerIndex, bid);
            }
        }
    }

    toggleAutoPlay() {
        this.setAutoPlay(!this.autoPlayEnabled);
        return this.autoPlayEnabled;
    }

    getGameState() {
        return {
            phase: this.phase,
            currentPlayer: this.playerManager.currentPlayerIndex,
            landlord: this.playerManager.landlordIndex,
            currentBid: this.currentBid,
            bombCount: this.bombCount,
            lastPlay: this.lastPlay,
            lastPlayPlayer: this.lastPlayPlayer,
            cardCounts: this.playerManager.getCardCounts(),
            autoPlay: this.autoPlayEnabled
        };
    }
}
