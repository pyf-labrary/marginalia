/**
 * app.js - 应用入口、事件绑定和全局控制
 */

class App {
    constructor() {
        this.config = new GameConfig();
        this.statistics = new GameStatistics();
        this.renderer = new Renderer();
        this.animation = new AnimationController(this.renderer);
        this.sound = new SoundManager();
        this.enhancedSound = new EnhancedSoundManager();
        this.effects = new EffectsManager();
        this.themeManager = new ThemeManager();
        this.history = new GameHistory();
        this.tutorial = new TutorialManager(this.renderer);
        this.statsPanel = new StatisticsPanel(this.statistics, this.history);
        this.historyRenderer = new HistoryRenderer('history-list');
        this.achievementNotifier = new AchievementNotifier();
        this.cardCounter = new CardCounter();
        this.handAnalysis = new HandAnalysisPanel();
        this.rankSystem = new RankSystem();
        this.rankDisplay = new RankDisplay(this.rankSystem);
        this.personalityManager = new AIPersonalityManager();
        this.quoteDisplay = new QuoteDisplay();
        this.spectator = null;
        this._currentAIPair = [];
        this.game = null;

        this._initialized = false;
    }

    initialize() {
        if (this._initialized) return;

        this.config.load();
        this._applySettings();
        this._bindStartScreen();
        this._bindSettingsScreen();
        this._bindRulesScreen();
        this._bindGameScreen();
        this._bindResultScreen();
        this._bindStatsScreen();
        this._bindHistoryScreen();
        this._bindKeyboard();
        this._setupTutorial();
        this._setupHistoryCallbacks();

        this.cardCounter.createDisplay();
        this.handAnalysis.createDisplay();
        this.themeManager.renderThemeSelector('theme-selector');
        this.rankDisplay.createDisplay('start-screen');

        this._initialized = true;

        this.renderer.showScreen('start-screen');

        if (!this.tutorial.hasCompletedTutorial() && this.statistics.totalGames === 0) {
            this._showFirstTimeTip();
        }
    }

    _applySettings() {
        this.sound.setEnabled(this.config.soundEnabled);
        this.enhancedSound.setEnabled(this.config.soundEnabled);
    }

    _showFirstTimeTip() {
        const tipEl = document.createElement('div');
        tipEl.className = 'first-time-tip anim-slide-up';
        tipEl.innerHTML = `
            <div style="background: var(--bg-panel); border: 1px solid var(--color-accent);
                        border-radius: 12px; padding: 16px 20px; text-align: center;
                        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
                        z-index: 5000; box-shadow: 0 8px 30px rgba(0,0,0,0.4);">
                <p style="color: var(--text-primary); margin-bottom: 8px;">
                    第一次玩？试试 <strong style="color: var(--color-accent);">新手教程</strong>！
                </p>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="background: none; border: 1px solid var(--border-color);
                               color: var(--text-muted); padding: 4px 12px; border-radius: 6px;
                               cursor: pointer; font-size: 12px;">
                    知道了
                </button>
            </div>
        `;
        document.body.appendChild(tipEl);
        setTimeout(() => { if (tipEl.parentNode) tipEl.remove(); }, 8000);
    }

    // ========== Start Screen ==========

    _bindStartScreen() {
        const btnStart = document.getElementById('btn-start');
        const btnSettings = document.getElementById('btn-settings');
        const btnRules = document.getElementById('btn-rules');
        const btnTutorial = document.getElementById('btn-tutorial');
        const btnStats = document.getElementById('btn-stats');
        const btnHistory = document.getElementById('btn-history');

        if (btnStart) {
            btnStart.addEventListener('click', () => {
                this.enhancedSound.init();
                this.enhancedSound.play('click');
                this.startGame();
            });
        }

        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                this.enhancedSound.init();
                this.enhancedSound.play('click');
                this.showSettings();
            });
        }

        if (btnRules) {
            btnRules.addEventListener('click', () => {
                this.enhancedSound.init();
                this.enhancedSound.play('click');
                this.showRules();
            });
        }

        if (btnTutorial) {
            btnTutorial.addEventListener('click', () => {
                this.enhancedSound.init();
                this.enhancedSound.play('click');
                this.startTutorial();
            });
        }

        if (btnStats) {
            btnStats.addEventListener('click', () => {
                this.enhancedSound.init();
                this.enhancedSound.play('click');
                this.showStats();
            });
        }

        if (btnHistory) {
            btnHistory.addEventListener('click', () => {
                this.enhancedSound.init();
                this.enhancedSound.play('click');
                this.showHistory();
            });
        }

        const btnSpectate = document.getElementById('btn-spectate');
        if (btnSpectate) {
            btnSpectate.addEventListener('click', () => {
                this.enhancedSound.init();
                this.enhancedSound.play('click');
                this.startSpectate();
            });
        }
    }

    // ========== Settings Screen ==========

    _bindSettingsScreen() {
        const btnClose = document.getElementById('btn-settings-close');
        const btnSave = document.getElementById('btn-settings-save');

        if (btnClose) {
            btnClose.addEventListener('click', () => {
                this.enhancedSound.play('click');
                this.renderer.showScreen('start-screen');
            });
        }

        if (btnSave) {
            btnSave.addEventListener('click', () => {
                this.enhancedSound.play('click');
                this._saveSettings();
                this.renderer.showScreen('start-screen');
            });
        }

        this._loadSettingsToUI();
    }

    _loadSettingsToUI() {
        const diffRadios = document.querySelectorAll('input[name="difficulty"]');
        diffRadios.forEach(radio => {
            radio.checked = radio.value === this.config.difficulty;
        });

        const speedRadios = document.querySelectorAll('input[name="speed"]');
        speedRadios.forEach(radio => {
            radio.checked = radio.value === this.config.speed;
        });

        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.checked = this.config.soundEnabled;
        }

        const styleRadios = document.querySelectorAll('input[name="card-style"]');
        styleRadios.forEach(radio => {
            radio.checked = radio.value === this.config.cardStyle;
        });
    }

    _saveSettings() {
        const diffRadio = document.querySelector('input[name="difficulty"]:checked');
        if (diffRadio) this.config.difficulty = diffRadio.value;

        const speedRadio = document.querySelector('input[name="speed"]:checked');
        if (speedRadio) this.config.speed = speedRadio.value;

        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) this.config.soundEnabled = soundToggle.checked;

        const styleRadio = document.querySelector('input[name="card-style"]:checked');
        if (styleRadio) this.config.cardStyle = styleRadio.value;

        this.config.save();
        this._applySettings();
    }

    // ========== Rules Screen ==========

    _bindRulesScreen() {
        const btnClose = document.getElementById('btn-rules-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                this.enhancedSound.play('click');
                this.renderer.showScreen('start-screen');
            });
        }
    }

    // ========== Stats Screen ==========

    _bindStatsScreen() {
        const btnClose = document.getElementById('btn-stats-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                this.enhancedSound.play('click');
                this.renderer.showScreen('start-screen');
            });
        }
    }

    // ========== History Screen ==========

    _bindHistoryScreen() {
        const btnClose = document.getElementById('btn-history-close');
        const btnClear = document.getElementById('btn-clear-history');

        if (btnClose) {
            btnClose.addEventListener('click', () => {
                this.enhancedSound.play('click');
                this.renderer.showScreen('start-screen');
            });
        }

        if (btnClear) {
            btnClear.addEventListener('click', () => {
                if (confirm('确定要清除所有对局历史吗？')) {
                    this.history.clearAll();
                    this._refreshHistoryScreen();
                }
            });
        }
    }

    _setupHistoryCallbacks() {
        this.historyRenderer.onRecordDelete = (id) => {
            this.history.deleteRecord(id);
            this._refreshHistoryScreen();
        };

        this.historyRenderer.onRecordSelect = (record) => {
            this.enhancedSound.play('click');
        };
    }

    _refreshHistoryScreen() {
        const records = this.history.getRecords();
        this.historyRenderer.render(records);

        const stats = this.history.getStatsSummary();
        if (stats) {
            this.historyRenderer.renderStats(stats);
        }
    }

    // ========== Game Screen ==========

    _bindGameScreen() {
        this._bindBidButtons();
        this._bindPlayButtons();
        this._bindMenuButtons();
    }

    _bindBidButtons() {
        const btn1 = document.getElementById('btn-bid-1');
        const btn2 = document.getElementById('btn-bid-2');
        const btn3 = document.getElementById('btn-bid-3');
        const btnNoBid = document.getElementById('btn-no-bid');

        if (btn1) btn1.addEventListener('click', () => this._onBid(1));
        if (btn2) btn2.addEventListener('click', () => this._onBid(2));
        if (btn3) btn3.addEventListener('click', () => this._onBid(3));
        if (btnNoBid) btnNoBid.addEventListener('click', () => this._onBid(0));
    }

    _onBid(bid) {
        if (!this.game) return;
        this.enhancedSound.play(bid > 0 ? 'bidCall' : 'bidPass');
        this.game.onBid(bid);
    }

    _bindPlayButtons() {
        const btnPlay = document.getElementById('btn-play');
        const btnPass = document.getElementById('btn-pass');
        const btnHint = document.getElementById('btn-hint');

        if (btnPlay) {
            btnPlay.addEventListener('click', () => {
                if (!this.game) return;
                this.game.onPlayClick();
            });
        }

        if (btnPass) {
            btnPass.addEventListener('click', () => {
                if (!this.game) return;
                this.enhancedSound.play('cardPass');
                this.game.onPassClick();
            });
        }

        if (btnHint) {
            btnHint.addEventListener('click', () => {
                if (!this.game) return;
                this.enhancedSound.play('click');
                this.game.onHintClick();
            });
        }
    }

    _bindMenuButtons() {
        const btnMenu = document.getElementById('btn-menu');
        const btnAutoPlay = document.getElementById('btn-auto-play');
        const btnPauseClose = document.getElementById('btn-pause-close');
        const btnResume = document.getElementById('btn-resume');
        const btnRestart = document.getElementById('btn-restart');
        const btnQuit = document.getElementById('btn-quit');

        if (btnAutoPlay) {
            btnAutoPlay.addEventListener('click', () => {
                if (!this.game) return;
                this.enhancedSound.play('click');
                this._toggleAutoPlay();
            });
        }

        if (btnMenu) {
            btnMenu.addEventListener('click', () => {
                if (!this.game) return;
                this.enhancedSound.play('click');
                this.game.pauseGame();
            });
        }

        if (btnPauseClose) {
            btnPauseClose.addEventListener('click', () => {
                if (!this.game) return;
                this.game.resumeGame();
            });
        }

        if (btnResume) {
            btnResume.addEventListener('click', () => {
                if (!this.game) return;
                this.enhancedSound.play('click');
                this.game.resumeGame();
            });
        }

        if (btnRestart) {
            btnRestart.addEventListener('click', () => {
                this.enhancedSound.play('click');
                if (this.game) {
                    this.game.restartGame();
                }
            });
        }

        if (btnQuit) {
            btnQuit.addEventListener('click', () => {
                this.enhancedSound.play('click');
                if (this.game) {
                    this.game.quitGame();
                    this.game = null;
                }
            });
        }
    }

    // ========== Result Screen ==========

    _bindResultScreen() {
        const btnPlayAgain = document.getElementById('btn-play-again');
        const btnBackHome = document.getElementById('btn-back-home');

        if (btnPlayAgain) {
            btnPlayAgain.addEventListener('click', () => {
                this.enhancedSound.play('click');
                this.startGame();
            });
        }

        if (btnBackHome) {
            btnBackHome.addEventListener('click', () => {
                this.enhancedSound.play('click');
                this.game = null;
                this.renderer.showScreen('start-screen');
            });
        }
    }

    // ========== Tutorial ==========

    _setupTutorial() {
        this.tutorial.onComplete = () => {
            this.enhancedSound.play('notification');
            this.startGame();
        };

        this.tutorial.onSkip = () => {
            this.renderer.showScreen('start-screen');
        };
    }

    // ========== Keyboard Shortcuts ==========

    _bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (this.tutorial.isActive) return;
            if (!this.game) return;

            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (this.game.phase === GAME_PHASE.PLAYING) {
                        const playBtns = this.renderer.el('play-buttons');
                        if (playBtns && !playBtns.classList.contains('hidden')) {
                            const playBtn = document.getElementById('btn-play');
                            if (playBtn && !playBtn.disabled) {
                                this.game.onPlayClick();
                            }
                        }
                    }
                    break;

                case 'p':
                case 'P':
                    if (this.game.phase === GAME_PHASE.PLAYING) {
                        const playBtns = this.renderer.el('play-buttons');
                        if (playBtns && !playBtns.classList.contains('hidden')) {
                            const passBtn = document.getElementById('btn-pass');
                            if (passBtn && !passBtn.disabled) {
                                this.game.onPassClick();
                            }
                        }
                    }
                    break;

                case 'h':
                case 'H':
                    if (this.game.phase === GAME_PHASE.PLAYING) {
                        this.game.onHintClick();
                    }
                    break;

                case 't':
                case 'T':
                    this._toggleAutoPlay();
                    break;

                case 'Escape':
                    if (this.game.phase === GAME_PHASE.PLAYING) {
                        const pauseMenu = this.renderer.el('pause-menu');
                        if (pauseMenu && !pauseMenu.classList.contains('hidden')) {
                            this.game.resumeGame();
                        } else {
                            this.game.pauseGame();
                        }
                    }
                    break;

                case '1':
                    if (this.game.phase === GAME_PHASE.BIDDING) this._onBid(1);
                    break;
                case '2':
                    if (this.game.phase === GAME_PHASE.BIDDING) this._onBid(2);
                    break;
                case '3':
                    if (this.game.phase === GAME_PHASE.BIDDING) this._onBid(3);
                    break;
                case '0':
                    if (this.game.phase === GAME_PHASE.BIDDING) this._onBid(0);
                    break;
            }
        });
    }

    // ========== Game Lifecycle ==========

    async startGame() {
        this.game = new Game(this.renderer, this.animation, this.sound, this.config);
        this._updateAutoPlayUI(false);

        this._currentAIPair = this.personalityManager.getRandomPair();
        const nameRight = document.getElementById('name-right');
        const nameLeft = document.getElementById('name-left');
        const avatarRight = document.getElementById('avatar-right');
        const avatarLeft = document.getElementById('avatar-left');
        if (nameRight) nameRight.textContent = this._currentAIPair[0].name;
        if (nameLeft) nameLeft.textContent = this._currentAIPair[1].name;
        if (avatarRight) {
            const img = avatarRight.querySelector('.avatar-img');
            if (img) img.textContent = this._currentAIPair[0].avatar;
        }
        if (avatarLeft) {
            const img = avatarLeft.querySelector('.avatar-img');
            if (img) img.textContent = this._currentAIPair[1].avatar;
        }

        const gameRecord = this.history.startNewRecord();

        this.game.on(EVENT_TYPES.GAME_START, () => {
            this.enhancedSound.play('gameStart');
        });

        this.game.on(EVENT_TYPES.DEAL_COMPLETE, () => {
            gameRecord.addAction(GameAction.deal(
                this.game.playerManager.players.map(p => p.hand),
                this.game.dizhuCards
            ));

            this.cardCounter.reset();
            const human = this.game.playerManager.getHumanPlayer();
            this.cardCounter.setMyHand(human.hand);
            this.cardCounter.show();
            this.cardCounter.updateDisplay();
            this.handAnalysis.show();
            this.handAnalysis.analyze(human.hand);
        });

        this.game.on(EVENT_TYPES.BID_MADE, (data) => {
            gameRecord.addAction(GameAction.bid(data.player, data.bid));
            if (data.bid > 0) {
                this.enhancedSound.play('bidCall');
            } else {
                this.enhancedSound.play('bidPass');
            }
        });

        this.game.on(EVENT_TYPES.BID_COMPLETE, (data) => {
            gameRecord.addAction(
                GameAction.setLandlord(data.landlord, this.game.dizhuCards)
            );
            gameRecord.finalBid = data.bid;
        });

        this.game.on(EVENT_TYPES.TURN_START, (data) => {
            if (data.player === 0) {
                this.enhancedSound.play('turnStart');
            }
        });

        this.game.on(EVENT_TYPES.CARDS_PLAYED, (data) => {
            gameRecord.addAction(
                GameAction.playCards(data.player, data.cards, data.type)
            );

            this.enhancedSound.playForCardType(data.type.type);

            if (data.type.type === CARD_TYPE.BOMB) {
                this.effects.bombEffect();
            } else if (data.type.type === CARD_TYPE.ROCKET) {
                this.effects.rocketEffect();
            } else if (data.type.type === CARD_TYPE.STRAIGHT ||
                       data.type.type === CARD_TYPE.PLANE ||
                       data.type.type === CARD_TYPE.PLANE_WITH_SINGLES ||
                       data.type.type === CARD_TYPE.PLANE_WITH_PAIRS) {
                this.effects.bigPlayEffect(window.innerWidth / 2, window.innerHeight / 2);
            } else if (data.cards.length >= 3) {
                this.effects.cardPlayEffect(window.innerWidth / 2, window.innerHeight / 2);
            }

            this.cardCounter.recordPlay(data.cards, data.player === 0);
            this.cardCounter.updateDisplay();

            if (data.player === 0) {
                const human = this.game.playerManager.getHumanPlayer();
                this.handAnalysis.analyze(human.hand);
            }

            const player = this.game.playerManager.getPlayer(data.player);
            if (player.cardCount === 1) {
                this.enhancedSound.play('lastCard');
                this.effects.screenFlash('rgba(255, 0, 0, 0.15)', 200);
            } else if (player.cardCount === 2) {
                this.enhancedSound.play('lastTwoCards');
            }

            if (data.player !== 0 && Math.random() < 0.35) {
                const personality = data.player === 1
                    ? this._currentAIPair[0]
                    : this._currentAIPair[1];
                if (personality) {
                    let situation = 'play';
                    if (data.type.type === CARD_TYPE.BOMB || data.type.type === CARD_TYPE.ROCKET) {
                        situation = 'bomb';
                    }
                    this.quoteDisplay.show(
                        data.player === 1 ? PLAYER_POSITION.RIGHT : PLAYER_POSITION.LEFT,
                        personality.getQuote(situation),
                        2000
                    );
                }
            }
        });

        this.game.on(EVENT_TYPES.PASS_TURN, (data) => {
            gameRecord.addAction(GameAction.pass(data.player));

            if (data.player !== 0 && Math.random() < 0.25) {
                const personality = data.player === 1
                    ? this._currentAIPair[0]
                    : this._currentAIPair[1];
                if (personality) {
                    this.quoteDisplay.show(
                        data.player === 1 ? PLAYER_POSITION.RIGHT : PLAYER_POSITION.LEFT,
                        personality.getQuote('pass'),
                        1500
                    );
                }
            }
        });

        this.game.on(EVENT_TYPES.GAME_END, (data) => {
            this._onGameEnd(data);

            const winnerIndex = this.game.playerManager.getWinner();
            const scores = data.players.map(p => p.score);
            gameRecord.addAction(
                GameAction.gameEnd(
                    winnerIndex,
                    data.isLandlordWin,
                    scores,
                    data.spring,
                    data.antiSpring
                )
            );

            this.history.finishRecord();
        });

        await this.game.startNewGame();
    }

    _onGameEnd(data) {
        const humanIndex = 0;
        const humanPlayer = data.players[humanIndex];

        this.statistics.recordGame(
            data.isWin,
            humanPlayer.isLandlord,
            humanPlayer.score,
            data.bombCount,
            data.spring || false,
            data.antiSpring || false,
            false
        );

        const rankResult = this.rankSystem.addResult(
            data.isWin,
            humanPlayer.score,
            humanPlayer.isLandlord,
            data.bombCount,
            data.spring || false
        );
        this.rankDisplay.update();
        setTimeout(() => {
            this.rankDisplay.showExpGain(rankResult);
        }, 1200);

        const newAchievements = this.achievementNotifier.check(this.statistics);
        for (const ach of newAchievements) {
            setTimeout(() => {
                this.achievementNotifier.showNotification(ach);
            }, 2500);
        }

        if (data.isWin) {
            this.enhancedSound.play('win');
            this.effects.winCelebration();

            if (data.player !== 0) {
                for (let i = 0; i < 2; i++) {
                    const p = this._currentAIPair[i];
                    if (p) {
                        setTimeout(() => {
                            this.quoteDisplay.show(
                                i === 0 ? PLAYER_POSITION.RIGHT : PLAYER_POSITION.LEFT,
                                p.getQuote('lose'),
                                3000
                            );
                        }, 500 + i * 800);
                    }
                }
            }
        } else {
            this.enhancedSound.play('lose');
            this.effects.loseSadness();
        }

        if (data.spring) {
            this.effects.springEffect();
        }

        this.cardCounter.hide();
        this.handAnalysis.hide();
        this.quoteDisplay.hide();

        if (this.game && this.game.autoPlayEnabled) {
            setTimeout(() => {
                if (this.game && this.game.autoPlayEnabled) {
                    this.startGame();
                }
            }, 4000);
        }
    }

    showSettings() {
        this._loadSettingsToUI();
        this.renderer.showScreen('settings-screen');
    }

    showRules() {
        this.renderer.showScreen('rules-screen');
    }

    showStats() {
        this.statsPanel.render('stats-content');
        this.renderer.showScreen('stats-screen');
    }

    showHistory() {
        this._refreshHistoryScreen();
        this.renderer.showScreen('history-screen');
    }

    _toggleAutoPlay() {
        if (!this.game) return;
        const enabled = this.game.toggleAutoPlay();
        this._updateAutoPlayUI(enabled);
    }

    _updateAutoPlayUI(enabled) {
        const btn = document.getElementById('btn-auto-play');
        if (btn) {
            btn.classList.toggle('active', enabled);
            const textEl = btn.querySelector('.auto-play-text');
            if (textEl) {
                textEl.textContent = enabled ? '取消托管' : '托管';
            }
        }

        if (enabled) {
            this.renderer.showMessage('已开启托管模式', 1500);
        }
    }

    startSpectate() {
        this.enhancedSound.init();
        this.spectator = new SpectatorMode(
            this.renderer, this.animation, this.sound, this.enhancedSound, this.effects
        );
        this.spectator.start();
    }

    startTutorial() {
        this.tutorial.start();
    }

    getStatistics() {
        return {
            totalGames: this.statistics.totalGames,
            wins: this.statistics.wins,
            losses: this.statistics.losses,
            winRate: this.statistics.winRate,
            landlordWinRate: this.statistics.landlordWinRate,
            farmerWinRate: this.statistics.farmerWinRate,
            totalScore: this.statistics.totalScore,
            maxWinScore: this.statistics.maxWinScore,
            maxWinStreak: this.statistics.maxWinStreak,
            bombsPlayed: this.statistics.bombsPlayed,
            rocketsPlayed: this.statistics.rocketsPlayed,
            springs: this.statistics.springs
        };
    }
}

// ========== Application Bootstrap ==========

let app = null;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    app.initialize();
});

window.addEventListener('beforeunload', () => {
    if (app && app.config) {
        app.config.save();
    }
});

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
