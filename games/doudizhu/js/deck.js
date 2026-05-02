/**
 * deck.js - 牌组管理、发牌逻辑和牌局分析
 */

class Deck {
    constructor() {
        this.cards = [];
        this.dealt = false;
    }

    initialize() {
        this.cards = CardUtils.createFullDeck();
        this.dealt = false;
    }

    shuffle() {
        this.cards = shuffleArray(this.cards);
        for (let i = 0; i < 3; i++) {
            this.cards = shuffleArray(this.cards);
        }
    }

    deal() {
        if (this.dealt) {
            throw new Error('Deck already dealt');
        }

        this.initialize();
        this.shuffle();

        const hands = [[], [], []];
        for (let i = 0; i < HAND_CARD_COUNT * PLAYER_COUNT; i++) {
            hands[i % PLAYER_COUNT].push(this.cards[i]);
        }

        const dizhuCards = this.cards.slice(HAND_CARD_COUNT * PLAYER_COUNT);

        for (let i = 0; i < PLAYER_COUNT; i++) {
            hands[i] = CardUtils.sortCards(hands[i]);
        }

        this.dealt = true;

        return {
            hands,
            dizhuCards
        };
    }

    static redeal() {
        const deck = new Deck();
        return deck.deal();
    }
}

class HandAnalyzer {
    constructor(cards) {
        this.cards = [...cards];
        this.rankCounts = CardUtils.countByRank(cards);
        this.pattern = CardUtils.getHandPattern(cards);
    }

    getSingles() {
        return this.pattern.singles.map(rank => ({
            type: CARD_TYPE.SINGLE,
            rank,
            cards: CardUtils.selectCardsByRank(this.cards, rank, 1)
        }));
    }

    getPairs() {
        return this.pattern.pairs.concat(
            this.pattern.triples,
            this.pattern.quads
        ).filter(rank => {
            return this.cards.filter(c => c.rank === rank).length >= 2;
        }).map(rank => ({
            type: CARD_TYPE.PAIR,
            rank,
            cards: CardUtils.selectCardsByRank(this.cards, rank, 2)
        }));
    }

    getTriples() {
        const tripleRanks = this.pattern.triples.concat(
            this.pattern.quads
        ).filter(rank => {
            return this.cards.filter(c => c.rank === rank).length >= 3;
        });

        return tripleRanks.map(rank => ({
            type: CARD_TYPE.TRIPLE,
            rank,
            cards: CardUtils.selectCardsByRank(this.cards, rank, 3)
        }));
    }

    getTriplesWithSingle() {
        const triples = this.getTriples();
        const results = [];

        for (const triple of triples) {
            const remaining = CardUtils.removeCards(this.cards, triple.cards);
            if (remaining.length > 0) {
                for (const card of remaining) {
                    results.push({
                        type: CARD_TYPE.TRIPLE_WITH_SINGLE,
                        rank: triple.rank,
                        cards: [...triple.cards, card]
                    });
                }
            }
        }

        return results;
    }

    getTriplesWithPair() {
        const triples = this.getTriples();
        const results = [];

        for (const triple of triples) {
            const remaining = CardUtils.removeCards(this.cards, triple.cards);
            const pairRanks = CardUtils.getRanksWithAtLeast(remaining, 2);

            for (const pairRank of pairRanks) {
                const pairCards = CardUtils.selectCardsByRank(remaining, pairRank, 2);
                results.push({
                    type: CARD_TYPE.TRIPLE_WITH_PAIR,
                    rank: triple.rank,
                    cards: [...triple.cards, ...pairCards]
                });
            }
        }

        return results;
    }

    getStraights() {
        const results = [];
        const ranksWithCards = CardUtils.getRanksWithAtLeast(this.cards, 1)
            .filter(r => r >= 3 && r <= CARD_RANKS['A']);
        const sequences = CardUtils.findConsecutiveRanks(ranksWithCards, MIN_STRAIGHT_LENGTH, CARD_RANKS['A']);

        for (const seq of sequences) {
            const cards = seq.map(rank =>
                CardUtils.selectCardsByRank(this.cards, rank, 1)[0]
            );
            results.push({
                type: CARD_TYPE.STRAIGHT,
                rank: seq[seq.length - 1],
                length: seq.length,
                cards
            });
        }

        return results;
    }

    getStraightPairs() {
        const results = [];
        const ranksWithPairs = CardUtils.getRanksWithAtLeast(this.cards, 2)
            .filter(r => r >= 3 && r <= CARD_RANKS['A']);
        const sequences = CardUtils.findConsecutiveRanks(
            ranksWithPairs, MIN_STRAIGHT_PAIR_LENGTH, CARD_RANKS['A']
        );

        for (const seq of sequences) {
            const cards = [];
            for (const rank of seq) {
                cards.push(...CardUtils.selectCardsByRank(this.cards, rank, 2));
            }
            results.push({
                type: CARD_TYPE.STRAIGHT_PAIR,
                rank: seq[seq.length - 1],
                length: seq.length,
                cards
            });
        }

        return results;
    }

    getPlanes() {
        const results = [];
        const ranksWithTriples = CardUtils.getRanksWithAtLeast(this.cards, 3)
            .filter(r => r >= 3 && r <= CARD_RANKS['A']);
        const sequences = CardUtils.findConsecutiveRanks(
            ranksWithTriples, MIN_PLANE_LENGTH, CARD_RANKS['A']
        );

        for (const seq of sequences) {
            const cards = [];
            for (const rank of seq) {
                cards.push(...CardUtils.selectCardsByRank(this.cards, rank, 3));
            }
            results.push({
                type: CARD_TYPE.PLANE,
                rank: seq[seq.length - 1],
                length: seq.length,
                cards
            });
        }

        return results;
    }

    getPlanesWithSingles() {
        const planes = this.getPlanes();
        const results = [];

        for (const plane of planes) {
            const remaining = CardUtils.removeCards(this.cards, plane.cards);
            const needed = plane.length;

            if (remaining.length >= needed) {
                const combos = this._getCombinations(remaining, needed);
                for (const combo of combos.slice(0, 10)) {
                    results.push({
                        type: CARD_TYPE.PLANE_WITH_SINGLES,
                        rank: plane.rank,
                        length: plane.length,
                        cards: [...plane.cards, ...combo]
                    });
                }
            }
        }

        return results;
    }

    getPlanesWithPairs() {
        const planes = this.getPlanes();
        const results = [];

        for (const plane of planes) {
            const remaining = CardUtils.removeCards(this.cards, plane.cards);
            const needed = plane.length;
            const pairRanks = CardUtils.getRanksWithAtLeast(remaining, 2);

            if (pairRanks.length >= needed) {
                const pairCombos = this._getCombinationsFromArray(pairRanks, needed);
                for (const combo of pairCombos.slice(0, 5)) {
                    const pairCards = [];
                    for (const rank of combo) {
                        pairCards.push(...CardUtils.selectCardsByRank(remaining, rank, 2));
                    }
                    results.push({
                        type: CARD_TYPE.PLANE_WITH_PAIRS,
                        rank: plane.rank,
                        length: plane.length,
                        cards: [...plane.cards, ...pairCards]
                    });
                }
            }
        }

        return results;
    }

    getBombs() {
        return this.pattern.quads.map(rank => ({
            type: CARD_TYPE.BOMB,
            rank,
            cards: CardUtils.selectCardsByRank(this.cards, rank, 4)
        }));
    }

    getRocket() {
        if (CardUtils.hasJokerPair(this.cards)) {
            return [{
                type: CARD_TYPE.ROCKET,
                rank: CARD_RANKS['BIG_JOKER'],
                cards: this.cards.filter(c => c.isJoker)
            }];
        }
        return [];
    }

    getFourWithTwoSingles() {
        const quads = this.pattern.quads;
        const results = [];

        for (const quadRank of quads) {
            const quadCards = CardUtils.selectCardsByRank(this.cards, quadRank, 4);
            const remaining = CardUtils.removeCards(this.cards, quadCards);

            if (remaining.length >= 2) {
                const combos = this._getCombinations(remaining, 2);
                for (const combo of combos.slice(0, 10)) {
                    results.push({
                        type: CARD_TYPE.FOUR_WITH_TWO_SINGLES,
                        rank: quadRank,
                        cards: [...quadCards, ...combo]
                    });
                }
            }
        }

        return results;
    }

    getFourWithTwoPairs() {
        const quads = this.pattern.quads;
        const results = [];

        for (const quadRank of quads) {
            const quadCards = CardUtils.selectCardsByRank(this.cards, quadRank, 4);
            const remaining = CardUtils.removeCards(this.cards, quadCards);
            const pairRanks = CardUtils.getRanksWithAtLeast(remaining, 2);

            if (pairRanks.length >= 2) {
                const pairCombos = this._getCombinationsFromArray(pairRanks, 2);
                for (const combo of pairCombos.slice(0, 5)) {
                    const pairCards = [];
                    for (const rank of combo) {
                        pairCards.push(...CardUtils.selectCardsByRank(remaining, rank, 2));
                    }
                    results.push({
                        type: CARD_TYPE.FOUR_WITH_TWO_PAIRS,
                        rank: quadRank,
                        cards: [...quadCards, ...pairCards]
                    });
                }
            }
        }

        return results;
    }

    getAllPlayableHands() {
        const allHands = [];

        allHands.push(...this.getSingles());
        allHands.push(...this.getPairs());
        allHands.push(...this.getTriples());
        allHands.push(...this.getTriplesWithSingle());
        allHands.push(...this.getTriplesWithPair());
        allHands.push(...this.getStraights());
        allHands.push(...this.getStraightPairs());
        allHands.push(...this.getPlanes());
        allHands.push(...this.getPlanesWithSingles());
        allHands.push(...this.getPlanesWithPairs());
        allHands.push(...this.getFourWithTwoSingles());
        allHands.push(...this.getFourWithTwoPairs());
        allHands.push(...this.getBombs());
        allHands.push(...this.getRocket());

        return allHands;
    }

    getPlayableHandsBeating(lastPlay) {
        if (!lastPlay) {
            return this.getAllPlayableHands();
        }

        const results = [];

        if (lastPlay.type === CARD_TYPE.ROCKET) {
            return [];
        }

        if (lastPlay.type !== CARD_TYPE.BOMB) {
            results.push(...this.getBombs());
        } else {
            const higherBombs = this.getBombs().filter(b => b.rank > lastPlay.rank);
            results.push(...higherBombs);
        }

        results.push(...this.getRocket());

        switch (lastPlay.type) {
            case CARD_TYPE.SINGLE:
                results.push(...this.getSingles().filter(h => h.rank > lastPlay.rank));
                break;
            case CARD_TYPE.PAIR:
                results.push(...this.getPairs().filter(h => h.rank > lastPlay.rank));
                break;
            case CARD_TYPE.TRIPLE:
                results.push(...this.getTriples().filter(h => h.rank > lastPlay.rank));
                break;
            case CARD_TYPE.TRIPLE_WITH_SINGLE:
                results.push(...this.getTriplesWithSingle().filter(h => h.rank > lastPlay.rank));
                break;
            case CARD_TYPE.TRIPLE_WITH_PAIR:
                results.push(...this.getTriplesWithPair().filter(h => h.rank > lastPlay.rank));
                break;
            case CARD_TYPE.STRAIGHT:
                results.push(...this.getStraights().filter(h =>
                    h.length === lastPlay.length && h.rank > lastPlay.rank
                ));
                break;
            case CARD_TYPE.STRAIGHT_PAIR:
                results.push(...this.getStraightPairs().filter(h =>
                    h.length === lastPlay.length && h.rank > lastPlay.rank
                ));
                break;
            case CARD_TYPE.PLANE:
                results.push(...this.getPlanes().filter(h =>
                    h.length === lastPlay.length && h.rank > lastPlay.rank
                ));
                break;
            case CARD_TYPE.PLANE_WITH_SINGLES:
                results.push(...this.getPlanesWithSingles().filter(h =>
                    h.length === lastPlay.length && h.rank > lastPlay.rank
                ));
                break;
            case CARD_TYPE.PLANE_WITH_PAIRS:
                results.push(...this.getPlanesWithPairs().filter(h =>
                    h.length === lastPlay.length && h.rank > lastPlay.rank
                ));
                break;
            case CARD_TYPE.FOUR_WITH_TWO_SINGLES:
                results.push(...this.getFourWithTwoSingles().filter(h => h.rank > lastPlay.rank));
                break;
            case CARD_TYPE.FOUR_WITH_TWO_PAIRS:
                results.push(...this.getFourWithTwoPairs().filter(h => h.rank > lastPlay.rank));
                break;
            case CARD_TYPE.BOMB:
                break;
        }

        return results;
    }

    _getCombinations(arr, k) {
        if (k === 0) return [[]];
        if (arr.length < k) return [];
        if (arr.length === k) return [arr];

        const results = [];
        const maxCombos = 20;

        function backtrack(start, current) {
            if (results.length >= maxCombos) return;
            if (current.length === k) {
                results.push([...current]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                current.push(arr[i]);
                backtrack(i + 1, current);
                current.pop();
            }
        }

        backtrack(0, []);
        return results;
    }

    _getCombinationsFromArray(arr, k) {
        return this._getCombinations(arr, k);
    }
}

class DealAnalyzer {
    static analyzeDeal(hands, dizhuCards) {
        const analysis = [];

        for (let i = 0; i < hands.length; i++) {
            const hand = hands[i];
            analysis.push({
                position: i,
                cardCount: hand.length,
                strength: CardUtils.evaluateHandStrength(hand),
                bombCount: CardUtils.getBombCount(hand),
                hasRocket: CardUtils.hasJokerPair(hand),
                pattern: CardUtils.getHandPattern(hand),
                estimatedMoves: CardUtils.estimateMinMoves(hand)
            });
        }

        const dizhuAnalysis = {
            cards: dizhuCards,
            strength: CardUtils.evaluateHandStrength(dizhuCards),
            hasBomb: dizhuCards.filter(c => {
                const rankCounts = CardUtils.countByRank(dizhuCards);
                return rankCounts[c.rank] === 4;
            }).length > 0
        };

        return { playerAnalysis: analysis, dizhuAnalysis };
    }

    static suggestBidScore(hand, dizhuCards = null) {
        const strength = CardUtils.evaluateHandStrength(hand);
        const bombCount = CardUtils.getBombCount(hand);
        const hasRocket = CardUtils.hasJokerPair(hand);
        const pattern = CardUtils.getHandPattern(hand);

        let bidScore = 0;

        if (hasRocket) bidScore += 3;
        bidScore += bombCount * 2;

        if (strength > 100) bidScore += 3;
        else if (strength > 70) bidScore += 2;
        else if (strength > 50) bidScore += 1;

        if (pattern.singles.filter(r => r >= CARD_RANKS['2']).length >= 2) bidScore += 1;

        const bigCards = hand.filter(c =>
            c.rank >= CARD_RANKS['A']
        ).length;
        if (bigCards >= 4) bidScore += 1;

        if (bidScore >= 5) return 3;
        if (bidScore >= 3) return 2;
        if (bidScore >= 1) return 1;
        return 0;
    }
}
