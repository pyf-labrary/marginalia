/**
 * constants.js - 游戏常量和配置
 */

const SUITS = {
    SPADE: 'spade',
    HEART: 'heart',
    DIAMOND: 'diamond',
    CLUB: 'club'
};

const SUIT_SYMBOLS = {
    [SUITS.SPADE]: '♠',
    [SUITS.HEART]: '♥',
    [SUITS.DIAMOND]: '♦',
    [SUITS.CLUB]: '♣'
};

const SUIT_COLORS = {
    [SUITS.SPADE]: 'black',
    [SUITS.HEART]: 'red',
    [SUITS.DIAMOND]: 'red',
    [SUITS.CLUB]: 'black'
};

const CARD_RANKS = {
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14,
    '2': 15,
    'SMALL_JOKER': 16,
    'BIG_JOKER': 17
};

const RANK_DISPLAY = {
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J',
    12: 'Q',
    13: 'K',
    14: 'A',
    15: '2',
    16: '小',
    17: '大'
};

const CARD_TYPE = {
    SINGLE: 'single',
    PAIR: 'pair',
    TRIPLE: 'triple',
    TRIPLE_WITH_SINGLE: 'triple_with_single',
    TRIPLE_WITH_PAIR: 'triple_with_pair',
    STRAIGHT: 'straight',
    STRAIGHT_PAIR: 'straight_pair',
    PLANE: 'plane',
    PLANE_WITH_SINGLES: 'plane_with_singles',
    PLANE_WITH_PAIRS: 'plane_with_pairs',
    FOUR_WITH_TWO_SINGLES: 'four_with_two_singles',
    FOUR_WITH_TWO_PAIRS: 'four_with_two_pairs',
    BOMB: 'bomb',
    ROCKET: 'rocket',
    INVALID: 'invalid'
};

const CARD_TYPE_NAMES = {
    [CARD_TYPE.SINGLE]: '单张',
    [CARD_TYPE.PAIR]: '对子',
    [CARD_TYPE.TRIPLE]: '三条',
    [CARD_TYPE.TRIPLE_WITH_SINGLE]: '三带一',
    [CARD_TYPE.TRIPLE_WITH_PAIR]: '三带二',
    [CARD_TYPE.STRAIGHT]: '顺子',
    [CARD_TYPE.STRAIGHT_PAIR]: '连对',
    [CARD_TYPE.PLANE]: '飞机',
    [CARD_TYPE.PLANE_WITH_SINGLES]: '飞机带单',
    [CARD_TYPE.PLANE_WITH_PAIRS]: '飞机带对',
    [CARD_TYPE.FOUR_WITH_TWO_SINGLES]: '四带二',
    [CARD_TYPE.FOUR_WITH_TWO_PAIRS]: '四带两对',
    [CARD_TYPE.BOMB]: '炸弹',
    [CARD_TYPE.ROCKET]: '火箭',
    [CARD_TYPE.INVALID]: '无效'
};

const GAME_PHASE = {
    IDLE: 'idle',
    DEALING: 'dealing',
    BIDDING: 'bidding',
    PLAYING: 'playing',
    FINISHED: 'finished'
};

const PLAYER_POSITION = {
    BOTTOM: 0,
    RIGHT: 1,
    LEFT: 2
};

const PLAYER_ROLE = {
    UNKNOWN: 'unknown',
    LANDLORD: 'landlord',
    FARMER: 'farmer'
};

const PLAYER_TYPE = {
    HUMAN: 'human',
    AI: 'ai'
};

const DIFFICULTY = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard'
};

const GAME_SPEED = {
    SLOW: {
        dealInterval: 120,
        aiThinkTime: 2000,
        playCardDelay: 600,
        messageDelay: 1500,
        bidDelay: 1500
    },
    NORMAL: {
        dealInterval: 80,
        aiThinkTime: 1200,
        playCardDelay: 400,
        messageDelay: 1000,
        bidDelay: 1000
    },
    FAST: {
        dealInterval: 40,
        aiThinkTime: 600,
        playCardDelay: 200,
        messageDelay: 600,
        bidDelay: 600
    }
};

const TOTAL_CARDS = 54;
const HAND_CARD_COUNT = 17;
const DIZHU_CARD_COUNT = 3;
const PLAYER_COUNT = 3;

const BASE_SCORE = 100;

const MESSAGES = {
    DEALING: '正在发牌...',
    BID_TURN: '请叫分',
    BID_WAIT: '等待叫分...',
    NO_BID: '不叫',
    BID_1: '1分',
    BID_2: '2分',
    BID_3: '3分',
    YOUR_TURN: '请出牌',
    PASS: '不出',
    INVALID_CARDS: '无效的牌型',
    MUST_PLAY: '必须出牌',
    CANNOT_BEAT: '管不上',
    GAME_WIN: '你赢了！',
    GAME_LOSE: '你输了！',
    LANDLORD_WIN: '地主获胜',
    FARMER_WIN: '农民获胜',
    SPRING: '春天！所有农民未出牌',
    ANTI_SPRING: '反春天！地主只出了一手牌',
    BOMB_PLAYED: '炸弹！',
    ROCKET_PLAYED: '火箭！',
    NO_ONE_BID: '没有人叫地主，重新发牌',
    WAITING: '等待中...'
};

const EVENT_TYPES = {
    GAME_START: 'game_start',
    DEAL_COMPLETE: 'deal_complete',
    BID_START: 'bid_start',
    BID_MADE: 'bid_made',
    BID_COMPLETE: 'bid_complete',
    TURN_START: 'turn_start',
    CARDS_PLAYED: 'cards_played',
    PASS_TURN: 'pass_turn',
    BOMB_PLAYED: 'bomb_played',
    ROCKET_PLAYED: 'rocket_played',
    ROUND_END: 'round_end',
    GAME_END: 'game_end',
    SPRING: 'spring',
    ANTI_SPRING: 'anti_spring'
};

const SOUND_TYPES = {
    DEAL: 'deal',
    PLAY_CARD: 'play_card',
    PASS: 'pass',
    BOMB: 'bomb',
    ROCKET: 'rocket',
    WIN: 'win',
    LOSE: 'lose',
    BID: 'bid',
    CLICK: 'click',
    SELECT: 'select',
    SPRING: 'spring',
    TIMER_WARNING: 'timer_warning',
    PLANE: 'plane',
    STRAIGHT: 'straight'
};

const CARD_SORT_ORDER = [
    CARD_RANKS['3'],
    CARD_RANKS['4'],
    CARD_RANKS['5'],
    CARD_RANKS['6'],
    CARD_RANKS['7'],
    CARD_RANKS['8'],
    CARD_RANKS['9'],
    CARD_RANKS['10'],
    CARD_RANKS['J'],
    CARD_RANKS['Q'],
    CARD_RANKS['K'],
    CARD_RANKS['A'],
    CARD_RANKS['2'],
    CARD_RANKS['SMALL_JOKER'],
    CARD_RANKS['BIG_JOKER']
];

const SUIT_SORT_ORDER = {
    [SUITS.SPADE]: 4,
    [SUITS.HEART]: 3,
    [SUITS.CLUB]: 2,
    [SUITS.DIAMOND]: 1
};

const MIN_STRAIGHT_LENGTH = 5;
const MIN_STRAIGHT_PAIR_LENGTH = 3;
const MIN_PLANE_LENGTH = 2;

const TIMER_DURATION = 30;
const TIMER_WARNING_THRESHOLD = 10;

class GameConfig {
    constructor() {
        this.difficulty = DIFFICULTY.NORMAL;
        this.speed = 'normal';
        this.soundEnabled = true;
        this.cardStyle = 'classic';
        this.autoPlay = false;
        this.showHints = true;
        this.timerEnabled = false;
    }

    getSpeedConfig() {
        switch (this.speed) {
            case 'slow': return GAME_SPEED.SLOW;
            case 'fast': return GAME_SPEED.FAST;
            default: return GAME_SPEED.NORMAL;
        }
    }

    save() {
        try {
            localStorage.setItem('doudizhu_config', JSON.stringify({
                difficulty: this.difficulty,
                speed: this.speed,
                soundEnabled: this.soundEnabled,
                cardStyle: this.cardStyle
            }));
        } catch (e) {
            // localStorage not available
        }
    }

    load() {
        try {
            const data = localStorage.getItem('doudizhu_config');
            if (data) {
                const parsed = JSON.parse(data);
                this.difficulty = parsed.difficulty || DIFFICULTY.NORMAL;
                this.speed = parsed.speed || 'normal';
                this.soundEnabled = parsed.soundEnabled !== false;
                this.cardStyle = parsed.cardStyle || 'classic';
            }
        } catch (e) {
            // localStorage not available
        }
    }
}

class GameStatistics {
    constructor() {
        this.totalGames = 0;
        this.wins = 0;
        this.losses = 0;
        this.landlordGames = 0;
        this.landlordWins = 0;
        this.farmerGames = 0;
        this.farmerWins = 0;
        this.totalScore = 0;
        this.maxWinScore = 0;
        this.maxLoseScore = 0;
        this.bombsPlayed = 0;
        this.rocketsPlayed = 0;
        this.springs = 0;
        this.antiSprings = 0;
        this.winStreak = 0;
        this.maxWinStreak = 0;
        this.currentStreak = 0;
        this.load();
    }

    get winRate() {
        return this.totalGames > 0 ? (this.wins / this.totalGames * 100).toFixed(1) : '0.0';
    }

    get landlordWinRate() {
        return this.landlordGames > 0
            ? (this.landlordWins / this.landlordGames * 100).toFixed(1) : '0.0';
    }

    get farmerWinRate() {
        return this.farmerGames > 0
            ? (this.farmerWins / this.farmerGames * 100).toFixed(1) : '0.0';
    }

    recordGame(isWin, isLandlord, score, bombCount, hasSpring, hasAntiSpring, hasRocket) {
        this.totalGames++;

        if (isWin) {
            this.wins++;
            this.currentStreak++;
            this.maxWinStreak = Math.max(this.maxWinStreak, this.currentStreak);
        } else {
            this.losses++;
            this.currentStreak = 0;
        }

        if (isLandlord) {
            this.landlordGames++;
            if (isWin) this.landlordWins++;
        } else {
            this.farmerGames++;
            if (isWin) this.farmerWins++;
        }

        this.totalScore += score;
        if (score > 0) {
            this.maxWinScore = Math.max(this.maxWinScore, score);
        } else {
            this.maxLoseScore = Math.min(this.maxLoseScore, score);
        }

        this.bombsPlayed += bombCount;
        if (hasRocket) this.rocketsPlayed++;
        if (hasSpring) this.springs++;
        if (hasAntiSpring) this.antiSprings++;

        this.save();
    }

    save() {
        try {
            localStorage.setItem('doudizhu_stats', JSON.stringify(this));
        } catch (e) {
            // ignore
        }
    }

    load() {
        try {
            const data = localStorage.getItem('doudizhu_stats');
            if (data) {
                const parsed = JSON.parse(data);
                Object.assign(this, parsed);
            }
        } catch (e) {
            // ignore
        }
    }

    reset() {
        this.totalGames = 0;
        this.wins = 0;
        this.losses = 0;
        this.landlordGames = 0;
        this.landlordWins = 0;
        this.farmerGames = 0;
        this.farmerWins = 0;
        this.totalScore = 0;
        this.maxWinScore = 0;
        this.maxLoseScore = 0;
        this.bombsPlayed = 0;
        this.rocketsPlayed = 0;
        this.springs = 0;
        this.antiSprings = 0;
        this.winStreak = 0;
        this.maxWinStreak = 0;
        this.currentStreak = 0;
        this.save();
    }
}

class EventEmitter {
    constructor() {
        this._handlers = {};
    }

    on(event, handler) {
        if (!this._handlers[event]) {
            this._handlers[event] = [];
        }
        this._handlers[event].push(handler);
        return this;
    }

    off(event, handler) {
        if (!this._handlers[event]) return this;
        if (handler) {
            this._handlers[event] = this._handlers[event].filter(h => h !== handler);
        } else {
            delete this._handlers[event];
        }
        return this;
    }

    emit(event, ...args) {
        if (!this._handlers[event]) return;
        this._handlers[event].forEach(handler => {
            try {
                handler(...args);
            } catch (e) {
                console.error(`Event handler error for ${event}:`, e);
            }
        });
    }

    once(event, handler) {
        const wrapper = (...args) => {
            handler(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
        return this;
    }

    removeAllListeners() {
        this._handlers = {};
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffleArray(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function groupBy(arr, keyFn) {
    const result = {};
    for (const item of arr) {
        const key = keyFn(item);
        if (!result[key]) result[key] = [];
        result[key].push(item);
    }
    return result;
}

function countBy(arr, keyFn) {
    const result = {};
    for (const item of arr) {
        const key = keyFn(item);
        result[key] = (result[key] || 0) + 1;
    }
    return result;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
