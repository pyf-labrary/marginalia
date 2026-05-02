/**
 * multiplayer-sim.js - 多人模拟和挑战模式系统
 */

class ChallengeMode {
    constructor() {
        this.challenges = [];
        this.currentChallenge = null;
        this.completedChallenges = new Set();
        this._buildChallenges();
        this._load();
    }

    _buildChallenges() {
        this.challenges = [
            new Challenge({
                id: 'speed_demon',
                name: '极速玩家',
                description: '在3分钟内赢得一局游戏',
                icon: '⚡',
                difficulty: 'normal',
                condition: (result, gameTime) => result.isWin && gameTime < 180000,
                reward: 500
            }),
            new Challenge({
                id: 'bomb_master',
                name: '炸弹大师',
                description: '在一局游戏中使用2个以上炸弹并获胜',
                icon: '💣',
                difficulty: 'hard',
                condition: (result) => result.isWin && result.bombCount >= 2,
                reward: 800
            }),
            new Challenge({
                id: 'clean_sweep',
                name: '完美清场',
                description: '作为地主打出春天',
                icon: '🌸',
                difficulty: 'hard',
                condition: (result) => result.isWin && result.spring && result.players[0].isLandlord,
                reward: 1500
            }),
            new Challenge({
                id: 'comeback_king',
                name: '逆转之王',
                description: '在手牌少于5张时使用炸弹逆转获胜',
                icon: '👑',
                difficulty: 'expert',
                condition: (result) => result.isWin && result.bombCount > 0,
                reward: 1200
            }),
            new Challenge({
                id: 'winning_streak_5',
                name: '五连胜',
                description: '连续赢得5局游戏',
                icon: '🔥',
                difficulty: 'hard',
                condition: null,
                reward: 1000
            }),
            new Challenge({
                id: 'no_bomb_win',
                name: '无炸胜利',
                description: '在没有使用炸弹/火箭的情况下赢得游戏',
                icon: '🎯',
                difficulty: 'normal',
                condition: (result) => result.isWin && result.bombCount === 0,
                reward: 600
            }),
            new Challenge({
                id: 'farmer_hero',
                name: '农民英雄',
                description: '作为农民连续赢得3局',
                icon: '🌾',
                difficulty: 'hard',
                condition: null,
                reward: 900
            }),
            new Challenge({
                id: 'big_score',
                name: '高分玩家',
                description: '单局获得800分以上',
                icon: '💰',
                difficulty: 'hard',
                condition: (result) => result.isWin && result.players[0].score >= 800,
                reward: 700
            }),
            new Challenge({
                id: 'quick_finish',
                name: '速战速决',
                description: '在10手内出完所有牌',
                icon: '🏃',
                difficulty: 'expert',
                condition: null,
                reward: 1100
            }),
            new Challenge({
                id: 'perfect_read',
                name: '完美预判',
                description: '使用提示功能不超过2次并获胜',
                icon: '🧠',
                difficulty: 'normal',
                condition: null,
                reward: 500
            })
        ];
    }

    getChallenge(id) {
        return this.challenges.find(c => c.id === id);
    }

    getAllChallenges() {
        return this.challenges.map(c => ({
            ...c,
            completed: this.completedChallenges.has(c.id)
        }));
    }

    getActiveChallenges(count = 3) {
        return this.challenges
            .filter(c => !this.completedChallenges.has(c.id))
            .slice(0, count);
    }

    checkCompletion(result, gameTime = 0) {
        const newCompletions = [];

        for (const challenge of this.challenges) {
            if (this.completedChallenges.has(challenge.id)) continue;
            if (challenge.condition && challenge.condition(result, gameTime)) {
                this.completedChallenges.add(challenge.id);
                newCompletions.push(challenge);
            }
        }

        if (newCompletions.length > 0) {
            this._save();
        }

        return newCompletions;
    }

    get completionRate() {
        return this.challenges.length > 0
            ? (this.completedChallenges.size / this.challenges.length * 100).toFixed(0)
            : 0;
    }

    get totalReward() {
        let total = 0;
        for (const challenge of this.challenges) {
            if (this.completedChallenges.has(challenge.id)) {
                total += challenge.reward;
            }
        }
        return total;
    }

    _save() {
        try {
            localStorage.setItem('doudizhu_challenges',
                JSON.stringify([...this.completedChallenges]));
        } catch (e) { /* ignore */ }
    }

    _load() {
        try {
            const data = localStorage.getItem('doudizhu_challenges');
            if (data) {
                this.completedChallenges = new Set(JSON.parse(data));
            }
        } catch (e) {
            this.completedChallenges = new Set();
        }
    }

    reset() {
        this.completedChallenges = new Set();
        this._save();
    }
}

class Challenge {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.icon = config.icon;
        this.difficulty = config.difficulty;
        this.condition = config.condition;
        this.reward = config.reward;
    }

    get difficultyText() {
        const map = { normal: '普通', hard: '困难', expert: '专家' };
        return map[this.difficulty] || '普通';
    }

    get difficultyColor() {
        const map = { normal: '#81c784', hard: '#ffb74d', expert: '#ef5350' };
        return map[this.difficulty] || '#81c784';
    }
}

class ChallengeRenderer {
    constructor(challengeMode) {
        this.challengeMode = challengeMode;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'challenge-header';
        header.innerHTML = `
            <div class="challenge-progress-info">
                <span>挑战进度: ${this.challengeMode.completionRate}%</span>
                <span>累计奖励: ${this.challengeMode.totalReward}分</span>
            </div>
            <div class="challenge-progress-bar-container">
                <div class="challenge-progress-bar"
                     style="width: ${this.challengeMode.completionRate}%"></div>
            </div>
        `;
        container.appendChild(header);

        const list = document.createElement('div');
        list.className = 'challenge-list';

        for (const challenge of this.challengeMode.getAllChallenges()) {
            const item = document.createElement('div');
            item.className = `challenge-item ${challenge.completed ? 'completed' : ''}`;
            item.innerHTML = `
                <div class="challenge-icon">${challenge.icon}</div>
                <div class="challenge-info">
                    <div class="challenge-name">
                        ${challenge.name}
                        <span class="challenge-difficulty"
                              style="color: ${challenge.difficultyColor}">
                            ${challenge.difficultyText}
                        </span>
                    </div>
                    <div class="challenge-desc">${challenge.description}</div>
                </div>
                <div class="challenge-reward">
                    ${challenge.completed
                        ? '<span class="challenge-completed-badge">✓</span>'
                        : `<span class="challenge-reward-value">+${challenge.reward}</span>`
                    }
                </div>
            `;
            list.appendChild(item);
        }

        container.appendChild(list);
    }

    showCompletionNotification(challenge) {
        const el = document.createElement('div');
        el.className = 'challenge-notification anim-slide-down';
        el.innerHTML = `
            <div class="challenge-notif-icon">${challenge.icon}</div>
            <div class="challenge-notif-text">
                <div class="challenge-notif-title">挑战完成！</div>
                <div class="challenge-notif-name">${challenge.name}</div>
                <div class="challenge-notif-reward">+${challenge.reward}分</div>
            </div>
        `;

        document.body.appendChild(el);

        setTimeout(() => {
            el.classList.add('anim-fade-out');
            setTimeout(() => { if (el.parentNode) el.remove(); }, 500);
        }, 4000);
    }
}

class AIPersonality {
    constructor(name, personality) {
        this.name = name;
        this.personality = personality;
        this.avatar = this._getAvatar();
        this.quotes = this._getQuotes();
        this.playstyle = this._getPlaystyle();
    }

    _getAvatar() {
        const avatars = {
            aggressive: '😈',
            cautious: '🤔',
            strategic: '🧐',
            lucky: '🍀',
            bluffer: '😏',
            calm: '😌',
            wild: '🤪',
            wise: '🧙'
        };
        return avatars[this.personality] || '🤖';
    }

    _getQuotes() {
        const quoteMap = {
            aggressive: {
                play: ['接招吧！', '看看这个！', '怕了吧？'],
                pass: ['哼，算你走运', '让你一次'],
                win: ['太简单了！', '就这？'],
                lose: ['下次不会输！', '等着瞧！'],
                bomb: ['爆炸！', '吃我一炸！'],
                bid: ['我来当地主！', '看我的！']
            },
            cautious: {
                play: ['小心出牌', '这张应该安全', '试试这个'],
                pass: ['不急不急', '稳一稳', '先过'],
                win: ['还好还好', '虚惊一场'],
                lose: ['唉...', '再想想策略'],
                bomb: ['必须用了...', '只能炸了'],
                bid: ['让我想想...', '风险有点大']
            },
            strategic: {
                play: ['计划通', '按照计划行事', '正如所料'],
                pass: ['战术性不出', '保留实力', '等待时机'],
                win: ['一切尽在掌握', '完美的策略'],
                lose: ['需要调整策略', '分析失误'],
                bomb: ['关键一击', '决定性的一手'],
                bid: ['经过分析...', '胜率可接受']
            },
            lucky: {
                play: ['运气不错！', '哈哈好牌！', '感觉今天走运'],
                pass: ['等等好运', '下把就来了'],
                win: ['运气站在我这边！', '幸运之星！'],
                lose: ['运气用完了', '下次一定行'],
                bomb: ['天降炸弹！', '运气爆棚！'],
                bid: ['感觉能行！', '今天运气好！']
            }
        };
        return quoteMap[this.personality] || quoteMap.cautious;
    }

    _getPlaystyle() {
        const styles = {
            aggressive: { riskTolerance: 0.8, bombThreshold: 0.3, bidAggression: 1.5 },
            cautious: { riskTolerance: 0.3, bombThreshold: 0.7, bidAggression: 0.7 },
            strategic: { riskTolerance: 0.5, bombThreshold: 0.5, bidAggression: 1.0 },
            lucky: { riskTolerance: 0.6, bombThreshold: 0.4, bidAggression: 1.2 }
        };
        return styles[this.personality] || styles.cautious;
    }

    getQuote(situation) {
        const quotes = this.quotes[situation] || this.quotes.play;
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    shouldBid(suggestedBid, currentBid) {
        const adjustedBid = Math.floor(suggestedBid * this.playstyle.bidAggression);
        return adjustedBid > currentBid;
    }
}

class AIPersonalityManager {
    constructor() {
        this.personalities = [
            new AIPersonality('张三', 'aggressive'),
            new AIPersonality('李四', 'cautious'),
            new AIPersonality('王五', 'strategic'),
            new AIPersonality('赵六', 'lucky'),
            new AIPersonality('小明', 'aggressive'),
            new AIPersonality('小红', 'cautious'),
            new AIPersonality('老王', 'strategic'),
            new AIPersonality('阿福', 'lucky')
        ];
    }

    getRandomPair() {
        const shuffled = shuffleArray(this.personalities);
        return [shuffled[0], shuffled[1]];
    }

    getByName(name) {
        return this.personalities.find(p => p.name === name);
    }
}

class QuoteDisplay {
    constructor() {
        this._timeout = null;
    }

    show(position, text, duration = 2000) {
        this.hide();

        let containerId;
        switch (position) {
            case PLAYER_POSITION.LEFT: containerId = 'avatar-left'; break;
            case PLAYER_POSITION.RIGHT: containerId = 'avatar-right'; break;
            default: return;
        }

        const avatar = document.getElementById(containerId);
        if (!avatar) return;

        const bubble = document.createElement('div');
        bubble.className = 'quote-bubble anim-scale-in';
        bubble.textContent = text;
        bubble.style.cssText = `
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-panel);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 6px 12px;
            font-size: 12px;
            color: var(--text-primary);
            white-space: nowrap;
            z-index: 200;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        avatar.style.position = 'relative';
        avatar.appendChild(bubble);

        this._timeout = setTimeout(() => {
            bubble.classList.add('anim-fade-out');
            setTimeout(() => { if (bubble.parentNode) bubble.remove(); }, 300);
        }, duration);
    }

    hide() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        document.querySelectorAll('.quote-bubble').forEach(el => el.remove());
    }
}

class RankSystem {
    constructor() {
        this.exp = 0;
        this.level = 1;
        this.rankTier = 0;
        this._load();
    }

    static get RANKS() {
        return [
            { name: '青铜', icon: '🥉', minLevel: 1, color: '#cd7f32' },
            { name: '白银', icon: '🥈', minLevel: 5, color: '#c0c0c0' },
            { name: '黄金', icon: '🥇', minLevel: 10, color: '#ffd700' },
            { name: '铂金', icon: '💎', minLevel: 16, color: '#e5e4e2' },
            { name: '钻石', icon: '💠', minLevel: 23, color: '#b9f2ff' },
            { name: '大师', icon: '🏅', minLevel: 31, color: '#ff6b6b' },
            { name: '王者', icon: '👑', minLevel: 40, color: '#ff4500' }
        ];
    }

    static get EXP_PER_LEVEL() { return 100; }

    get currentRank() {
        const ranks = RankSystem.RANKS;
        let rank = ranks[0];
        for (const r of ranks) {
            if (this.level >= r.minLevel) rank = r;
        }
        return rank;
    }

    get nextRank() {
        const ranks = RankSystem.RANKS;
        const currentIdx = ranks.indexOf(this.currentRank);
        return currentIdx < ranks.length - 1 ? ranks[currentIdx + 1] : null;
    }

    get expToNextLevel() {
        return RankSystem.EXP_PER_LEVEL;
    }

    get currentExp() {
        return this.exp % RankSystem.EXP_PER_LEVEL;
    }

    get expProgress() {
        return (this.currentExp / this.expToNextLevel * 100).toFixed(0);
    }

    get levelInRank() {
        const rank = this.currentRank;
        return this.level - rank.minLevel + 1;
    }

    get displayText() {
        const rank = this.currentRank;
        return `${rank.icon} ${rank.name} ${this.levelInRank}`;
    }

    addResult(isWin, score, isLandlord, bombCount, spring) {
        let expGain = 0;

        if (isWin) {
            expGain = 30;
            if (isLandlord) expGain += 10;
            if (bombCount > 0) expGain += bombCount * 5;
            if (spring) expGain += 20;
            expGain += Math.floor(Math.abs(score) / 50);
        } else {
            expGain = 10;
        }

        expGain = Math.max(5, expGain);

        this.exp += expGain;

        const oldLevel = this.level;
        this.level = Math.floor(this.exp / RankSystem.EXP_PER_LEVEL) + 1;

        this._save();

        return {
            expGain,
            levelUp: this.level > oldLevel,
            oldLevel,
            newLevel: this.level,
            rankChanged: this._getRankForLevel(oldLevel) !== this._getRankForLevel(this.level)
        };
    }

    _getRankForLevel(level) {
        const ranks = RankSystem.RANKS;
        let rank = ranks[0];
        for (const r of ranks) {
            if (level >= r.minLevel) rank = r;
        }
        return rank.name;
    }

    _save() {
        try {
            localStorage.setItem('doudizhu_rank', JSON.stringify({
                exp: this.exp, level: this.level
            }));
        } catch (e) { /* ignore */ }
    }

    _load() {
        try {
            const data = localStorage.getItem('doudizhu_rank');
            if (data) {
                const parsed = JSON.parse(data);
                this.exp = parsed.exp || 0;
                this.level = parsed.level || 1;
            }
        } catch (e) { /* ignore */ }
    }

    reset() {
        this.exp = 0;
        this.level = 1;
        this._save();
    }
}

class RankDisplay {
    constructor(rankSystem) {
        this.rankSystem = rankSystem;
        this.panel = null;
    }

    createDisplay(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.panel = document.createElement('div');
        this.panel.className = 'rank-display';
        this.panel.id = 'rank-display-panel';
        container.appendChild(this.panel);
        this.update();
    }

    update() {
        if (!this.panel) return;
        const rs = this.rankSystem;
        const rank = rs.currentRank;
        const next = rs.nextRank;

        this.panel.innerHTML = `
            <div class="rank-badge" style="color: ${rank.color}">
                <span class="rank-icon">${rank.icon}</span>
                <span class="rank-name">${rank.name} ${rs.levelInRank}</span>
            </div>
            <div class="rank-exp-info">
                <div class="rank-level">Lv.${rs.level}</div>
                <div class="rank-exp-bar">
                    <div class="rank-exp-fill" style="width: ${rs.expProgress}%"></div>
                </div>
                <div class="rank-exp-text">${rs.currentExp}/${rs.expToNextLevel}</div>
            </div>
            ${next ? `<div class="rank-next">下一段位: ${next.icon} ${next.name} (Lv.${next.minLevel})</div>` : '<div class="rank-next">已达最高段位！</div>'}
        `;
    }

    showExpGain(result) {
        const el = document.createElement('div');
        el.className = 'rank-exp-gain anim-slide-up';
        el.innerHTML = `
            <span class="exp-gain-value">+${result.expGain} EXP</span>
            ${result.levelUp ? `<span class="exp-level-up">升级! Lv.${result.newLevel}</span>` : ''}
            ${result.rankChanged ? `<span class="exp-rank-up">段位晋升!</span>` : ''}
        `;

        document.body.appendChild(el);
        setTimeout(() => {
            el.classList.add('anim-fade-out');
            setTimeout(() => { if (el.parentNode) el.remove(); }, 500);
        }, 3000);
    }
}

class SpectatorMode {
    constructor(renderer, animation, sound, enhancedSound, effects) {
        this.renderer = renderer;
        this.animation = animation;
        this.sound = sound;
        this.enhancedSound = enhancedSound || null;
        this.effects = effects || null;
        this.isActive = false;
        this._game = null;
        this._stopFlag = false;
        this._personalityManager = new AIPersonalityManager();
        this._quoteDisplay = new QuoteDisplay();
        this._aiPair = [];
    }

    async start() {
        this.isActive = true;
        this._stopFlag = false;
        this._aiPair = this._personalityManager.getRandomPair();

        this.renderer.resetGameScreen();
        this.renderer.showScreen('game-screen');
        this._showSpectatorBanner();

        const config = new GameConfig();
        config.difficulty = DIFFICULTY.HARD;
        config.speed = 'normal';
        this._game = new SpectatorGame(this.renderer, this.animation, this.sound, config);
        this._game.setAINames(this._aiPair[0], this._aiPair[1]);

        this._game.on(EVENT_TYPES.GAME_START, () => {
            if (this.enhancedSound) this.enhancedSound.play('gameStart');
        });

        this._game.on(EVENT_TYPES.CARDS_PLAYED, (data) => {
            if (this.enhancedSound) {
                this.enhancedSound.playForCardType(data.type.type);
            }
            if (this.effects) {
                if (data.type.type === CARD_TYPE.BOMB) {
                    this.effects.bombEffect();
                } else if (data.type.type === CARD_TYPE.ROCKET) {
                    this.effects.rocketEffect();
                }
            }

            const personality = data.player === 1 ? this._aiPair[0] : this._aiPair[1];
            const type = data.type;
            let situation = 'play';
            if (type.type === CARD_TYPE.BOMB || type.type === CARD_TYPE.ROCKET) {
                situation = 'bomb';
            }
            if (Math.random() < 0.4) {
                this._quoteDisplay.show(
                    data.player === 1 ? PLAYER_POSITION.RIGHT : PLAYER_POSITION.LEFT,
                    personality.getQuote(situation),
                    2000
                );
            }
        });

        this._game.on(EVENT_TYPES.BID_MADE, (data) => {
            if (this.enhancedSound) {
                this.enhancedSound.play(data.bid > 0 ? 'bidCall' : 'bidPass');
            }
        });

        this._game.on(EVENT_TYPES.TURN_START, (data) => {
            if (this.enhancedSound && data.player === 0) {
                this.enhancedSound.play('turnStart');
            }
        });

        this._game.on(EVENT_TYPES.PASS_TURN, (data) => {
            if (this.enhancedSound) this.enhancedSound.play('cardPass');

            if (Math.random() < 0.3) {
                const personality = data.player === 1 ? this._aiPair[0] : this._aiPair[1];
                this._quoteDisplay.show(
                    data.player === 1 ? PLAYER_POSITION.RIGHT : PLAYER_POSITION.LEFT,
                    personality.getQuote('pass'),
                    1500
                );
            }
        });

        this._game.on(EVENT_TYPES.GAME_END, (data) => {
            if (this.enhancedSound) {
                this.enhancedSound.play('win');
            }
            if (this.effects) {
                this.effects.winCelebration();
            }
        });

        await this._game.startNewGame();
    }

    stop() {
        this._stopFlag = true;
        this.isActive = false;
        this._quoteDisplay.hide();
        this._hideSpectatorBanner();
        if (this._game) {
            this._game.phase = GAME_PHASE.IDLE;
            this._game = null;
        }
    }

    _showSpectatorBanner() {
        let banner = document.getElementById('spectator-banner');
        if (banner) banner.remove();

        banner = document.createElement('div');
        banner.id = 'spectator-banner';
        banner.className = 'spectator-banner';
        banner.innerHTML = `
            <span class="spectator-icon">👁</span>
            <span class="spectator-text">观战模式</span>
            <span class="spectator-players">
                ${this._aiPair[0].avatar} ${this._aiPair[0].name}
                vs
                ${this._aiPair[1].avatar} ${this._aiPair[1].name}
            </span>
            <button id="btn-stop-spectate" class="btn btn-small btn-danger">退出观战</button>
        `;
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) gameScreen.appendChild(banner);

        const stopBtn = document.getElementById('btn-stop-spectate');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stop();
                this.renderer.showScreen('start-screen');
            });
        }
    }

    _hideSpectatorBanner() {
        const banner = document.getElementById('spectator-banner');
        if (banner) banner.remove();
    }
}

class SpectatorGame extends Game {
    constructor(renderer, animation, sound, config) {
        super(renderer, animation, sound, config);
        this._aiNameLeft = null;
        this._aiNameRight = null;
    }

    setAINames(personalityRight, personalityLeft) {
        this._aiNameRight = personalityRight;
        this._aiNameLeft = personalityLeft;
    }

    async startNewGame() {
        this.resetGameState();
        this.playerManager.initialize();

        if (this._aiNameRight) {
            const pRight = this.playerManager.getPlayer(PLAYER_POSITION.RIGHT);
            pRight.name = this._aiNameRight.name;
            const nameRight = document.getElementById('name-right');
            if (nameRight) nameRight.textContent = this._aiNameRight.name;
            const avatarRight = document.getElementById('avatar-right');
            if (avatarRight) {
                const img = avatarRight.querySelector('.avatar-img');
                if (img) img.textContent = this._aiNameRight.avatar;
            }
        }
        if (this._aiNameLeft) {
            const pLeft = this.playerManager.getPlayer(PLAYER_POSITION.LEFT);
            pLeft.name = this._aiNameLeft.name;
            const nameLeft = document.getElementById('name-left');
            if (nameLeft) nameLeft.textContent = this._aiNameLeft.name;
            const avatarLeft = document.getElementById('avatar-left');
            if (avatarLeft) {
                const img = avatarLeft.querySelector('.avatar-img');
                if (img) img.textContent = this._aiNameLeft.avatar;
            }
        }

        this.playerManager.setDifficulty(this.config.difficulty);

        this.autoPlayEnabled = true;

        this.renderer.resetGameScreen();
        this.renderer.showScreen('game-screen');

        this.phase = GAME_PHASE.DEALING;
        this.emit(EVENT_TYPES.GAME_START);

        await this.dealCards();
    }

    handleHumanTurn(isFirstPlay) {
        this._handleAutoPlay(isFirstPlay);
    }
}
