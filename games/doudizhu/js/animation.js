/**
 * animation.js - 动画控制和特效
 */

class AnimationController {
    constructor(renderer) {
        this.renderer = renderer;
        this.activeAnimations = [];
        this.animationQueue = [];
        this.isProcessing = false;
    }

    async dealCardsAnimation(playerManager, speedConfig) {
        const human = playerManager.getHumanPlayer();
        const handContainer = this.renderer.el('hand-cards');

        if (!handContainer) return;

        handContainer.innerHTML = '';

        for (let i = 0; i < human.hand.length; i++) {
            const card = human.hand[i];
            const cardEl = CardUtils.buildCardElement(card, 'hand');
            cardEl.style.opacity = '0';
            cardEl.style.zIndex = i;
            handContainer.appendChild(cardEl);
        }

        const leftContainer = this.renderer.el('cards-left');
        const rightContainer = this.renderer.el('cards-right');
        if (leftContainer) leftContainer.innerHTML = '';
        if (rightContainer) rightContainer.innerHTML = '';

        const interval = speedConfig.dealInterval;

        for (let i = human.hand.length - 1; i >= 0; i--) {
            const cards = handContainer.children;
            if (cards[i]) {
                cards[i].style.opacity = '1';
                cards[i].classList.add('anim-deal-card');
                cards[i].style.animationDelay = '0ms';
            }

            const leftPlayerCards = playerManager.getPlayer(PLAYER_POSITION.LEFT).cardCount;
            const rightPlayerCards = playerManager.getPlayer(PLAYER_POSITION.RIGHT).cardCount;

            const dealIndex = human.hand.length - 1 - i;
            if (dealIndex < leftPlayerCards && leftContainer) {
                const back = CardUtils.buildCardBackElement();
                back.classList.add('anim-deal-card');
                leftContainer.appendChild(back);
            }
            if (dealIndex < rightPlayerCards && rightContainer) {
                const back = CardUtils.buildCardBackElement();
                back.classList.add('anim-deal-card');
                rightContainer.appendChild(back);
            }

            await sleep(interval);
        }

        await sleep(200);

        const cardElements = handContainer.querySelectorAll('.hand-card');
        cardElements.forEach(el => {
            el.classList.remove('anim-deal-card');
        });
    }

    async playCardsAnimation(position, cards) {
        let animClass;
        switch (position) {
            case PLAYER_POSITION.BOTTOM: animClass = 'anim-play-card'; break;
            case PLAYER_POSITION.LEFT: animClass = 'anim-play-left'; break;
            case PLAYER_POSITION.RIGHT: animClass = 'anim-play-right'; break;
        }

        this.renderer.renderPlayedCards(position, cards, animClass);

        const validated = CardValidator.validate(cards);
        if (validated.type === CARD_TYPE.BOMB) {
            await this.bombAnimation();
        } else if (validated.type === CARD_TYPE.ROCKET) {
            await this.rocketAnimation();
        }
    }

    async bombAnimation() {
        const gameScreen = this.renderer.el('game-screen');
        if (!gameScreen) return;

        gameScreen.classList.add('anim-bomb-shake');
        this.renderer.showMessage('💣 炸弹！', 1500);

        await this.createExplosionParticles();

        await sleep(600);
        gameScreen.classList.remove('anim-bomb-shake');
    }

    async rocketAnimation() {
        const gameScreen = this.renderer.el('game-screen');
        if (!gameScreen) return;

        gameScreen.classList.add('anim-bomb-shake');
        this.renderer.showMessage('🚀 火箭！', 2000);

        await this.createRocketTrail();

        await sleep(800);
        gameScreen.classList.remove('anim-bomb-shake');
    }

    async createExplosionParticles() {
        const centerInfo = this.renderer.el('center-info');
        if (!centerInfo) return;

        const colors = ['#ff5722', '#ff9800', '#ffc107', '#f44336', '#ff6f00'];
        const particles = [];

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'sparkle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.setProperty('--px', `${(Math.random() - 0.5) * 200}px`);
            particle.style.setProperty('--py', `${(Math.random() - 0.5) * 200}px`);
            particle.style.width = `${4 + Math.random() * 8}px`;
            particle.style.height = particle.style.width;
            particle.style.left = '50%';
            particle.style.top = '50%';
            centerInfo.appendChild(particle);
            particles.push(particle);
        }

        await sleep(800);

        particles.forEach(p => {
            if (p.parentNode) p.parentNode.removeChild(p);
        });
    }

    async createRocketTrail() {
        const centerInfo = this.renderer.el('center-info');
        if (!centerInfo) return;

        const colors = ['#e91e63', '#f44336', '#ff5722', '#ff9800', '#ffc107'];
        const particles = [];

        for (let wave = 0; wave < 3; wave++) {
            for (let i = 0; i < 12; i++) {
                const particle = document.createElement('div');
                particle.className = 'sparkle';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

                const angle = (Math.PI * 2 / 12) * i;
                const distance = 100 + wave * 40;
                particle.style.setProperty('--px', `${Math.cos(angle) * distance}px`);
                particle.style.setProperty('--py', `${Math.sin(angle) * distance}px`);
                particle.style.width = `${3 + Math.random() * 6}px`;
                particle.style.height = particle.style.width;
                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.animationDelay = `${wave * 0.15}s`;
                centerInfo.appendChild(particle);
                particles.push(particle);
            }
        }

        await sleep(1200);

        particles.forEach(p => {
            if (p.parentNode) p.parentNode.removeChild(p);
        });
    }

    async revealDizhuCards(cards) {
        this.renderer.renderDizhuCards(cards, true);
        await sleep(300);
    }

    async bidAnimation(position, bid) {
        const text = bid === 0 ? MESSAGES.NO_BID : `${bid}分`;
        this.renderer.showPlayerAction(position, text, 2000);
        this.renderer.setActiveTurn(position);
    }

    async passAnimation(position) {
        this.renderer.showPlayerAction(position, MESSAGES.PASS, 1500);
        this.renderer.clearPlayedCards(position);
    }

    async winAnimation(isWin) {
        if (isWin) {
            await this.createConfetti();
        }
    }

    async createConfetti() {
        const colors = [
            '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
            '#ff8c94', '#a8e6cf', '#dcedc1', '#ffd3b6',
            '#ffaaa5', '#ff8b94'
        ];

        const confettiPieces = [];

        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}vw`;
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration = `${2 + Math.random() * 3}s`;
            piece.style.animationDelay = `${Math.random() * 2}s`;
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            piece.style.width = `${6 + Math.random() * 8}px`;
            piece.style.height = `${10 + Math.random() * 12}px`;
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            document.body.appendChild(piece);
            confettiPieces.push(piece);
        }

        await sleep(5000);

        confettiPieces.forEach(p => {
            if (p.parentNode) p.parentNode.removeChild(p);
        });
    }

    async screenTransition(fromScreen, toScreen) {
        const from = this.renderer.el(fromScreen);
        const to = this.renderer.el(toScreen);

        if (from) {
            from.classList.add('screen-leave');
            await sleep(300);
            from.classList.remove('active', 'screen-leave');
        }

        if (to) {
            to.classList.add('active', 'screen-enter');
            await sleep(400);
            to.classList.remove('screen-enter');
        }
    }

    async messageAnimation(text, duration = 1500) {
        this.renderer.showMessage(text, duration);
        await sleep(duration);
    }

    highlightCards(cardIds) {
        const handContainer = this.renderer.el('hand-cards');
        if (!handContainer) return;

        const allCards = handContainer.querySelectorAll('.hand-card');
        allCards.forEach(el => {
            el.classList.remove('selected');
        });

        for (const id of cardIds) {
            const cardEl = handContainer.querySelector(`[data-card-id="${id}"]`);
            if (cardEl) {
                cardEl.classList.add('selected');
            }
        }
    }

    clearHighlights() {
        const handContainer = this.renderer.el('hand-cards');
        if (!handContainer) return;

        const allCards = handContainer.querySelectorAll('.hand-card');
        allCards.forEach(el => el.classList.remove('selected'));
    }

    async springAnimation() {
        this.renderer.showMessage('🌸 春天！双倍！', 2500);
        const gameScreen = this.renderer.el('game-screen');
        if (gameScreen) {
            gameScreen.classList.add('anim-bomb-shake');
            await sleep(500);
            gameScreen.classList.remove('anim-bomb-shake');
        }
        await sleep(2000);
    }

    async antiSpringAnimation() {
        this.renderer.showMessage('🔄 反春天！双倍！', 2500);
        const gameScreen = this.renderer.el('game-screen');
        if (gameScreen) {
            gameScreen.classList.add('anim-bomb-shake');
            await sleep(500);
            gameScreen.classList.remove('anim-bomb-shake');
        }
        await sleep(2000);
    }

    shakeHandCards() {
        const handContainer = this.renderer.el('hand-cards');
        if (!handContainer) return;

        handContainer.classList.add('anim-shake');
        setTimeout(() => {
            handContainer.classList.remove('anim-shake');
        }, 500);
    }

    cancelAllAnimations() {
        this.activeAnimations = [];
        this.animationQueue = [];
        this.isProcessing = false;
    }
}

class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this._initialized = false;
    }

    init() {
        if (this._initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this._initialized = true;
        } catch (e) {
            this.enabled = false;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    play(soundType) {
        if (!this.enabled || !this._initialized || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            const params = this._getSoundParams(soundType);
            oscillator.type = params.type;
            oscillator.frequency.value = params.freq;
            gainNode.gain.value = params.gain;
            gainNode.gain.exponentialRampToValueAtTime(
                0.001, this.audioContext.currentTime + params.duration
            );

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + params.duration);
        } catch (e) {
            // silent fail
        }
    }

    _getSoundParams(soundType) {
        const params = {
            [SOUND_TYPES.CLICK]: { type: 'sine', freq: 800, gain: 0.1, duration: 0.1 },
            [SOUND_TYPES.SELECT]: { type: 'sine', freq: 600, gain: 0.08, duration: 0.08 },
            [SOUND_TYPES.DEAL]: { type: 'sine', freq: 400, gain: 0.05, duration: 0.05 },
            [SOUND_TYPES.PLAY_CARD]: { type: 'sine', freq: 500, gain: 0.1, duration: 0.15 },
            [SOUND_TYPES.PASS]: { type: 'triangle', freq: 300, gain: 0.08, duration: 0.2 },
            [SOUND_TYPES.BOMB]: { type: 'sawtooth', freq: 150, gain: 0.15, duration: 0.5 },
            [SOUND_TYPES.ROCKET]: { type: 'sawtooth', freq: 200, gain: 0.2, duration: 0.8 },
            [SOUND_TYPES.WIN]: { type: 'sine', freq: 880, gain: 0.12, duration: 0.5 },
            [SOUND_TYPES.LOSE]: { type: 'triangle', freq: 220, gain: 0.1, duration: 0.6 },
            [SOUND_TYPES.BID]: { type: 'sine', freq: 660, gain: 0.1, duration: 0.15 },
            [SOUND_TYPES.PLANE]: { type: 'sine', freq: 700, gain: 0.12, duration: 0.3 },
            [SOUND_TYPES.STRAIGHT]: { type: 'sine', freq: 550, gain: 0.1, duration: 0.25 }
        };

        return params[soundType] || params[SOUND_TYPES.CLICK];
    }

    playSequence(notes, interval = 100) {
        if (!this.enabled) return;
        notes.forEach((note, i) => {
            setTimeout(() => {
                if (this.audioContext) {
                    try {
                        const osc = this.audioContext.createOscillator();
                        const gain = this.audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(this.audioContext.destination);
                        osc.type = 'sine';
                        osc.frequency.value = note;
                        gain.gain.value = 0.1;
                        gain.gain.exponentialRampToValueAtTime(
                            0.001, this.audioContext.currentTime + 0.2
                        );
                        osc.start();
                        osc.stop(this.audioContext.currentTime + 0.2);
                    } catch (e) {
                        // silent fail
                    }
                }
            }, i * interval);
        });
    }

    playWinJingle() {
        this.playSequence([523, 659, 784, 1047], 120);
    }

    playLoseJingle() {
        this.playSequence([440, 349, 294, 220], 150);
    }

    playBombSound() {
        this.play(SOUND_TYPES.BOMB);
    }

    playRocketSound() {
        this.play(SOUND_TYPES.ROCKET);
        setTimeout(() => {
            this.playSequence([880, 1047, 1319], 80);
        }, 200);
    }
}
