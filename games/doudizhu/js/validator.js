/**
 * validator.js - 出牌规则验证
 */

class CardValidator {
    static validate(cards) {
        if (!cards || cards.length === 0) {
            return { type: CARD_TYPE.INVALID, rank: 0 };
        }

        const sorted = CardUtils.sortCards(cards);
        const ranks = CardUtils.getSortedRanks(cards);
        const rankCounts = CardUtils.countByRank(cards);
        const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);
        const countValues = Object.values(rankCounts).sort((a, b) => a - b);

        const len = cards.length;

        if (len === 1) {
            return { type: CARD_TYPE.SINGLE, rank: ranks[0] };
        }

        if (len === 2) {
            if (CardValidator._isRocket(cards)) {
                return { type: CARD_TYPE.ROCKET, rank: CARD_RANKS['BIG_JOKER'] };
            }
            if (CardValidator._isPair(rankCounts)) {
                return { type: CARD_TYPE.PAIR, rank: ranks[0] };
            }
            return { type: CARD_TYPE.INVALID, rank: 0 };
        }

        if (len === 3) {
            if (CardValidator._isTriple(rankCounts)) {
                return { type: CARD_TYPE.TRIPLE, rank: ranks[0] };
            }
            return { type: CARD_TYPE.INVALID, rank: 0 };
        }

        if (len === 4) {
            if (CardValidator._isBomb(rankCounts)) {
                return { type: CARD_TYPE.BOMB, rank: uniqueRanks[0] };
            }
            if (CardValidator._isTripleWithSingle(rankCounts)) {
                const tripleRank = CardValidator._findRankWithCount(rankCounts, 3);
                return { type: CARD_TYPE.TRIPLE_WITH_SINGLE, rank: tripleRank };
            }
            return { type: CARD_TYPE.INVALID, rank: 0 };
        }

        if (len === 5) {
            if (CardValidator._isTripleWithPair(rankCounts)) {
                const tripleRank = CardValidator._findRankWithCount(rankCounts, 3);
                return { type: CARD_TYPE.TRIPLE_WITH_PAIR, rank: tripleRank };
            }
            if (CardValidator._isStraight(uniqueRanks, len)) {
                return {
                    type: CARD_TYPE.STRAIGHT,
                    rank: uniqueRanks[uniqueRanks.length - 1],
                    length: len
                };
            }
            return { type: CARD_TYPE.INVALID, rank: 0 };
        }

        const rocketResult = CardValidator._checkRocket(cards);
        if (rocketResult) return rocketResult;

        const bombResult = CardValidator._checkBomb(rankCounts, uniqueRanks);
        if (bombResult) return bombResult;

        const straightResult = CardValidator._checkStraight(rankCounts, uniqueRanks, len);
        if (straightResult) return straightResult;

        const straightPairResult = CardValidator._checkStraightPair(rankCounts, uniqueRanks, len);
        if (straightPairResult) return straightPairResult;

        const planeResult = CardValidator._checkPlane(rankCounts, uniqueRanks, len);
        if (planeResult) return planeResult;

        const planeWithSinglesResult = CardValidator._checkPlaneWithSingles(rankCounts, len);
        if (planeWithSinglesResult) return planeWithSinglesResult;

        const planeWithPairsResult = CardValidator._checkPlaneWithPairs(rankCounts, len);
        if (planeWithPairsResult) return planeWithPairsResult;

        const fourWithTwoResult = CardValidator._checkFourWithTwo(rankCounts, len);
        if (fourWithTwoResult) return fourWithTwoResult;

        return { type: CARD_TYPE.INVALID, rank: 0 };
    }

    static canBeat(playedCards, lastPlay) {
        if (!lastPlay) return true;

        const current = CardValidator.validate(playedCards);
        if (current.type === CARD_TYPE.INVALID) return false;

        if (current.type === CARD_TYPE.ROCKET) return true;

        if (lastPlay.type === CARD_TYPE.ROCKET) return false;

        if (current.type === CARD_TYPE.BOMB) {
            if (lastPlay.type === CARD_TYPE.BOMB) {
                return current.rank > lastPlay.rank;
            }
            return true;
        }

        if (lastPlay.type === CARD_TYPE.BOMB) return false;

        if (current.type !== lastPlay.type) return false;

        if (current.length !== undefined && lastPlay.length !== undefined) {
            if (current.length !== lastPlay.length) return false;
        }

        return current.rank > lastPlay.rank;
    }

    static isValidPlay(selectedCards, lastPlay, isFirstPlay) {
        if (selectedCards.length === 0) return false;

        const validated = CardValidator.validate(selectedCards);
        if (validated.type === CARD_TYPE.INVALID) return false;

        if (isFirstPlay || !lastPlay) return true;

        return CardValidator.canBeat(selectedCards, lastPlay);
    }

    static getPlayType(cards) {
        return CardValidator.validate(cards);
    }

    static isBomb(cards) {
        const validated = CardValidator.validate(cards);
        return validated.type === CARD_TYPE.BOMB;
    }

    static isRocket(cards) {
        const validated = CardValidator.validate(cards);
        return validated.type === CARD_TYPE.ROCKET;
    }

    static isBombOrRocket(cards) {
        const validated = CardValidator.validate(cards);
        return validated.type === CARD_TYPE.BOMB || validated.type === CARD_TYPE.ROCKET;
    }

    // ---- Private validation helpers ----

    static _isRocket(cards) {
        return cards.length === 2 &&
            cards.some(c => c.isSmallJoker) &&
            cards.some(c => c.isBigJoker);
    }

    static _isPair(rankCounts) {
        const counts = Object.values(rankCounts);
        return counts.length === 1 && counts[0] === 2;
    }

    static _isTriple(rankCounts) {
        const counts = Object.values(rankCounts);
        return counts.length === 1 && counts[0] === 3;
    }

    static _isBomb(rankCounts) {
        const counts = Object.values(rankCounts);
        return counts.length === 1 && counts[0] === 4;
    }

    static _isTripleWithSingle(rankCounts) {
        const counts = Object.values(rankCounts).sort((a, b) => a - b);
        return counts.length === 2 && counts[0] === 1 && counts[1] === 3;
    }

    static _isTripleWithPair(rankCounts) {
        const counts = Object.values(rankCounts).sort((a, b) => a - b);
        return counts.length === 2 && counts[0] === 2 && counts[1] === 3;
    }

    static _isStraight(uniqueRanks, len) {
        if (len < MIN_STRAIGHT_LENGTH) return false;
        if (uniqueRanks.length !== len) return false;
        if (uniqueRanks.some(r => r > CARD_RANKS['A'])) return false;

        for (let i = 1; i < uniqueRanks.length; i++) {
            if (uniqueRanks[i] !== uniqueRanks[i - 1] + 1) return false;
        }
        return true;
    }

    static _checkRocket(cards) {
        if (cards.length === 2 && CardValidator._isRocket(cards)) {
            return { type: CARD_TYPE.ROCKET, rank: CARD_RANKS['BIG_JOKER'] };
        }
        return null;
    }

    static _checkBomb(rankCounts, uniqueRanks) {
        const counts = Object.values(rankCounts);
        if (counts.length === 1 && counts[0] === 4) {
            return { type: CARD_TYPE.BOMB, rank: uniqueRanks[0] };
        }
        return null;
    }

    static _checkStraight(rankCounts, uniqueRanks, len) {
        if (len < MIN_STRAIGHT_LENGTH || len > 12) return null;
        const allSingle = Object.values(rankCounts).every(c => c === 1);
        if (!allSingle) return null;
        if (!CardValidator._isStraight(uniqueRanks, len)) return null;

        return {
            type: CARD_TYPE.STRAIGHT,
            rank: uniqueRanks[uniqueRanks.length - 1],
            length: len
        };
    }

    static _checkStraightPair(rankCounts, uniqueRanks, len) {
        if (len < MIN_STRAIGHT_PAIR_LENGTH * 2) return null;
        if (len % 2 !== 0) return null;

        const allPairs = Object.values(rankCounts).every(c => c === 2);
        if (!allPairs) return null;

        const pairCount = len / 2;
        if (pairCount < MIN_STRAIGHT_PAIR_LENGTH) return null;

        if (uniqueRanks.some(r => r > CARD_RANKS['A'])) return null;

        for (let i = 1; i < uniqueRanks.length; i++) {
            if (uniqueRanks[i] !== uniqueRanks[i - 1] + 1) return null;
        }

        return {
            type: CARD_TYPE.STRAIGHT_PAIR,
            rank: uniqueRanks[uniqueRanks.length - 1],
            length: pairCount
        };
    }

    static _checkPlane(rankCounts, uniqueRanks, len) {
        if (len < MIN_PLANE_LENGTH * 3) return null;
        if (len % 3 !== 0) return null;

        const allTriples = Object.values(rankCounts).every(c => c === 3);
        if (!allTriples) return null;

        const tripleCount = len / 3;
        if (tripleCount < MIN_PLANE_LENGTH) return null;

        if (uniqueRanks.some(r => r > CARD_RANKS['A'])) return null;

        for (let i = 1; i < uniqueRanks.length; i++) {
            if (uniqueRanks[i] !== uniqueRanks[i - 1] + 1) return null;
        }

        return {
            type: CARD_TYPE.PLANE,
            rank: uniqueRanks[uniqueRanks.length - 1],
            length: tripleCount
        };
    }

    static _checkPlaneWithSingles(rankCounts, len) {
        const tripleRanks = [];
        const otherCards = [];

        for (const [rank, count] of Object.entries(rankCounts)) {
            const r = parseInt(rank);
            if (count >= 3) {
                tripleRanks.push(r);
                if (count > 3) {
                    for (let i = 0; i < count - 3; i++) otherCards.push(r);
                }
            } else {
                for (let i = 0; i < count; i++) otherCards.push(r);
            }
        }

        tripleRanks.sort((a, b) => a - b);

        const validTriples = tripleRanks.filter(r => r <= CARD_RANKS['A']);
        const sequences = CardUtils.findConsecutiveRanks(validTriples, MIN_PLANE_LENGTH, CARD_RANKS['A']);

        for (const seq of sequences) {
            const planeSize = seq.length;
            const totalNeeded = planeSize * 4;

            if (totalNeeded === len) {
                const extraTriples = tripleRanks.filter(r => !seq.includes(r));
                const extraFromTriples = extraTriples.length * 3;
                const totalOther = otherCards.length + extraFromTriples;

                if (totalOther >= planeSize || totalNeeded === len) {
                    return {
                        type: CARD_TYPE.PLANE_WITH_SINGLES,
                        rank: seq[seq.length - 1],
                        length: planeSize
                    };
                }
            }
        }

        return null;
    }

    static _checkPlaneWithPairs(rankCounts, len) {
        const tripleRanks = [];
        const pairRanks = [];

        for (const [rank, count] of Object.entries(rankCounts)) {
            const r = parseInt(rank);
            if (count >= 3) {
                tripleRanks.push(r);
                if (count === 4) pairRanks.push(r);
            } else if (count === 2) {
                pairRanks.push(r);
            }
        }

        tripleRanks.sort((a, b) => a - b);

        const validTriples = tripleRanks.filter(r => r <= CARD_RANKS['A']);
        const sequences = CardUtils.findConsecutiveRanks(validTriples, MIN_PLANE_LENGTH, CARD_RANKS['A']);

        for (const seq of sequences) {
            const planeSize = seq.length;
            const totalNeeded = planeSize * 5;

            if (totalNeeded === len) {
                const availablePairs = pairRanks.filter(r => !seq.includes(r) || rankCounts[r] > 3);
                if (availablePairs.length >= planeSize) {
                    return {
                        type: CARD_TYPE.PLANE_WITH_PAIRS,
                        rank: seq[seq.length - 1],
                        length: planeSize
                    };
                }
            }
        }

        return null;
    }

    static _checkFourWithTwo(rankCounts, len) {
        const quadRanks = [];
        const otherCounts = {};

        for (const [rank, count] of Object.entries(rankCounts)) {
            const r = parseInt(rank);
            if (count === 4) {
                quadRanks.push(r);
            } else {
                otherCounts[r] = count;
            }
        }

        if (quadRanks.length !== 1) return null;

        const quadRank = quadRanks[0];

        if (len === 6) {
            const otherCardCount = Object.values(otherCounts)
                .reduce((sum, c) => sum + c, 0);
            if (otherCardCount === 2) {
                return {
                    type: CARD_TYPE.FOUR_WITH_TWO_SINGLES,
                    rank: quadRank
                };
            }
        }

        if (len === 8) {
            const otherPairCount = Object.values(otherCounts)
                .filter(c => c === 2).length;
            if (otherPairCount === 2 && Object.keys(otherCounts).length === 2) {
                return {
                    type: CARD_TYPE.FOUR_WITH_TWO_PAIRS,
                    rank: quadRank
                };
            }
        }

        return null;
    }

    static _findRankWithCount(rankCounts, count) {
        for (const [rank, c] of Object.entries(rankCounts)) {
            if (c === count) return parseInt(rank);
        }
        return 0;
    }

    static _findAllRanksWithCount(rankCounts, count) {
        return Object.entries(rankCounts)
            .filter(([_, c]) => c === count)
            .map(([r, _]) => parseInt(r))
            .sort((a, b) => a - b);
    }

    static getTypeDisplayName(type) {
        return CARD_TYPE_NAMES[type] || '未知';
    }

    static describePlay(cards) {
        const result = CardValidator.validate(cards);
        if (result.type === CARD_TYPE.INVALID) return '无效牌型';

        const typeName = CardValidator.getTypeDisplayName(result.type);
        const rankName = RANK_DISPLAY[result.rank] || result.rank;

        switch (result.type) {
            case CARD_TYPE.SINGLE:
                return `单张 ${rankName}`;
            case CARD_TYPE.PAIR:
                return `对${rankName}`;
            case CARD_TYPE.TRIPLE:
                return `三个${rankName}`;
            case CARD_TYPE.TRIPLE_WITH_SINGLE:
                return `三带一 (${rankName})`;
            case CARD_TYPE.TRIPLE_WITH_PAIR:
                return `三带二 (${rankName})`;
            case CARD_TYPE.STRAIGHT:
                return `顺子 (${result.length}张)`;
            case CARD_TYPE.STRAIGHT_PAIR:
                return `连对 (${result.length}连)`;
            case CARD_TYPE.PLANE:
                return `飞机 (${result.length}连)`;
            case CARD_TYPE.PLANE_WITH_SINGLES:
                return `飞机带单 (${result.length}连)`;
            case CARD_TYPE.PLANE_WITH_PAIRS:
                return `飞机带对 (${result.length}连)`;
            case CARD_TYPE.FOUR_WITH_TWO_SINGLES:
                return `四带二`;
            case CARD_TYPE.FOUR_WITH_TWO_PAIRS:
                return `四带两对`;
            case CARD_TYPE.BOMB:
                return `炸弹 (${rankName})`;
            case CARD_TYPE.ROCKET:
                return `火箭`;
            default:
                return typeName;
        }
    }
}
