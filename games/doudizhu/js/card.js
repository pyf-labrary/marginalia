/**
 * card.js - 卡牌类和卡牌工具方法
 */

class Card {
    constructor(rank, suit = null) {
        this.rank = rank;
        this.suit = suit;
        this.id = Card.generateId(rank, suit);
        this.selected = false;
    }

    static generateId(rank, suit) {
        if (rank === CARD_RANKS['SMALL_JOKER']) return 'joker_small';
        if (rank === CARD_RANKS['BIG_JOKER']) return 'joker_big';
        return `${suit}_${rank}`;
    }

    get isJoker() {
        return this.rank === CARD_RANKS['SMALL_JOKER'] || this.rank === CARD_RANKS['BIG_JOKER'];
    }

    get isSmallJoker() {
        return this.rank === CARD_RANKS['SMALL_JOKER'];
    }

    get isBigJoker() {
        return this.rank === CARD_RANKS['BIG_JOKER'];
    }

    get isTwo() {
        return this.rank === CARD_RANKS['2'];
    }

    get displayValue() {
        return RANK_DISPLAY[this.rank] || String(this.rank);
    }

    get suitSymbol() {
        if (this.isSmallJoker) return '☆';
        if (this.isBigJoker) return '★';
        return SUIT_SYMBOLS[this.suit] || '';
    }

    get color() {
        if (this.isSmallJoker) return 'black';
        if (this.isBigJoker) return 'red';
        return SUIT_COLORS[this.suit] || 'black';
    }

    get cssClass() {
        if (this.isSmallJoker) return 'card-joker-small';
        if (this.isBigJoker) return 'card-joker-big';
        return this.color === 'red' ? 'card-red' : 'card-black';
    }

    compareTo(other) {
        if (this.rank !== other.rank) {
            return this.rank - other.rank;
        }
        if (this.suit && other.suit) {
            return (SUIT_SORT_ORDER[this.suit] || 0) - (SUIT_SORT_ORDER[other.suit] || 0);
        }
        return 0;
    }

    equals(other) {
        return this.id === other.id;
    }

    clone() {
        const card = new Card(this.rank, this.suit);
        card.selected = this.selected;
        return card;
    }

    toString() {
        return `${this.displayValue}${this.suitSymbol}`;
    }
}

class CardUtils {
    static createFullDeck() {
        const cards = [];
        const suits = [SUITS.SPADE, SUITS.HEART, SUITS.DIAMOND, SUITS.CLUB];
        const ranks = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

        for (const suit of suits) {
            for (const rank of ranks) {
                cards.push(new Card(rank, suit));
            }
        }

        cards.push(new Card(CARD_RANKS['SMALL_JOKER'], null));
        cards.push(new Card(CARD_RANKS['BIG_JOKER'], null));

        return cards;
    }

    static sortCards(cards) {
        return [...cards].sort((a, b) => {
            if (a.rank !== b.rank) return b.rank - a.rank;
            const suitA = SUIT_SORT_ORDER[a.suit] || 0;
            const suitB = SUIT_SORT_ORDER[b.suit] || 0;
            return suitB - suitA;
        });
    }

    static getRanks(cards) {
        return cards.map(c => c.rank);
    }

    static getSortedRanks(cards) {
        return CardUtils.getRanks(cards).sort((a, b) => a - b);
    }

    static getUniqueSortedRanks(cards) {
        return [...new Set(CardUtils.getSortedRanks(cards))];
    }

    static countByRank(cards) {
        const counts = {};
        for (const card of cards) {
            counts[card.rank] = (counts[card.rank] || 0) + 1;
        }
        return counts;
    }

    static getCardsByRank(cards, rank) {
        return cards.filter(c => c.rank === rank);
    }

    static getRanksByCount(cards, count) {
        const rankCounts = CardUtils.countByRank(cards);
        return Object.entries(rankCounts)
            .filter(([_, c]) => c === count)
            .map(([r, _]) => parseInt(r))
            .sort((a, b) => a - b);
    }

    static getRanksWithAtLeast(cards, count) {
        const rankCounts = CardUtils.countByRank(cards);
        return Object.entries(rankCounts)
            .filter(([_, c]) => c >= count)
            .map(([r, _]) => parseInt(r))
            .sort((a, b) => a - b);
    }

    static removeCards(hand, cardsToRemove) {
        const removeIds = new Set(cardsToRemove.map(c => c.id));
        return hand.filter(c => !removeIds.has(c.id));
    }

    static containsCard(cards, card) {
        return cards.some(c => c.id === card.id);
    }

    static cardsToString(cards) {
        return cards.map(c => c.toString()).join(' ');
    }

    static findConsecutiveRanks(ranks, minLength, maxRank = CARD_RANKS['A']) {
        const filtered = ranks.filter(r => r <= maxRank);
        const unique = [...new Set(filtered)].sort((a, b) => a - b);
        const sequences = [];

        let start = 0;
        for (let i = 1; i <= unique.length; i++) {
            if (i === unique.length || unique[i] !== unique[i - 1] + 1) {
                const len = i - start;
                if (len >= minLength) {
                    for (let s = start; s <= i - minLength; s++) {
                        for (let e = s + minLength; e <= i; e++) {
                            sequences.push(unique.slice(s, e));
                        }
                    }
                }
                start = i;
            }
        }

        return sequences;
    }

    static evaluateHandStrength(cards) {
        const rankCounts = CardUtils.countByRank(cards);
        let score = 0;

        for (const [rank, count] of Object.entries(rankCounts)) {
            const r = parseInt(rank);
            if (count === 4) score += 40 + r * 2;
            else if (count === 3) score += 15 + r;
            else if (count === 2) score += 5 + r * 0.5;
            else score += r * 0.3;

            if (r >= CARD_RANKS['2']) score += 5;
            if (r >= CARD_RANKS['SMALL_JOKER']) score += 15;
        }

        const singleRanks = CardUtils.getRanksWithAtLeast(cards, 1)
            .filter(r => r <= CARD_RANKS['A']);
        const straights = CardUtils.findConsecutiveRanks(singleRanks, 5);
        score += straights.length * 5;

        const pairRanks = CardUtils.getRanksWithAtLeast(cards, 2)
            .filter(r => r <= CARD_RANKS['A']);
        const straightPairs = CardUtils.findConsecutiveRanks(pairRanks, 3);
        score += straightPairs.length * 8;

        const tripleRanks = CardUtils.getRanksWithAtLeast(cards, 3)
            .filter(r => r <= CARD_RANKS['A']);
        const planes = CardUtils.findConsecutiveRanks(tripleRanks, 2);
        score += planes.length * 12;

        return score;
    }

    static hasJokerPair(cards) {
        const hasSmall = cards.some(c => c.isSmallJoker);
        const hasBig = cards.some(c => c.isBigJoker);
        return hasSmall && hasBig;
    }

    static getBombCount(cards) {
        const rankCounts = CardUtils.countByRank(cards);
        let count = 0;
        for (const [_, c] of Object.entries(rankCounts)) {
            if (c === 4) count++;
        }
        if (CardUtils.hasJokerPair(cards)) count++;
        return count;
    }

    static selectCardsByRank(hand, rank, count) {
        const available = hand.filter(c => c.rank === rank);
        return available.slice(0, count);
    }

    static findNCardsOfRank(hand, rank, n) {
        const matching = hand.filter(c => c.rank === rank);
        if (matching.length >= n) {
            return matching.slice(0, n);
        }
        return null;
    }

    static getHandPattern(cards) {
        const rankCounts = CardUtils.countByRank(cards);
        const pattern = { singles: [], pairs: [], triples: [], quads: [] };

        for (const [rank, count] of Object.entries(rankCounts)) {
            const r = parseInt(rank);
            if (count === 1) pattern.singles.push(r);
            else if (count === 2) pattern.pairs.push(r);
            else if (count === 3) pattern.triples.push(r);
            else if (count === 4) pattern.quads.push(r);
        }

        pattern.singles.sort((a, b) => a - b);
        pattern.pairs.sort((a, b) => a - b);
        pattern.triples.sort((a, b) => a - b);
        pattern.quads.sort((a, b) => a - b);

        return pattern;
    }

    static estimateMinMoves(cards) {
        if (cards.length === 0) return 0;

        const pattern = CardUtils.getHandPattern(cards);
        let moves = 0;
        let remainingSingles = pattern.singles.length;
        let remainingPairs = pattern.pairs.length;

        const tripleRanks = [...pattern.triples];
        const consecutiveTriples = CardUtils.findConsecutiveRanks(
            tripleRanks.filter(r => r <= CARD_RANKS['A']),
            MIN_PLANE_LENGTH
        );

        if (consecutiveTriples.length > 0) {
            const longest = consecutiveTriples.reduce(
                (best, seq) => seq.length > best.length ? seq : best, []
            );
            const planeSize = longest.length;

            if (remainingSingles >= planeSize) {
                moves++;
                remainingSingles -= planeSize;
                tripleRanks.splice(0, planeSize);
            } else if (remainingPairs >= planeSize) {
                moves++;
                remainingPairs -= planeSize;
                tripleRanks.splice(0, planeSize);
            } else {
                moves++;
                tripleRanks.splice(0, planeSize);
            }
        }

        for (const _ of tripleRanks) {
            if (remainingSingles > 0) {
                moves++;
                remainingSingles--;
            } else if (remainingPairs > 0) {
                moves++;
                remainingPairs--;
            } else {
                moves++;
            }
        }

        const singleRanks = pattern.singles.filter(r => r <= CARD_RANKS['A']);
        const straightSeqs = CardUtils.findConsecutiveRanks(singleRanks, 5);
        if (straightSeqs.length > 0) {
            const longest = straightSeqs.reduce(
                (best, seq) => seq.length > best.length ? seq : best, []
            );
            moves++;
            remainingSingles -= longest.length;
        }

        const pairRanks = pattern.pairs.filter(r => r <= CARD_RANKS['A']);
        const pairSeqs = CardUtils.findConsecutiveRanks(pairRanks, 3);
        if (pairSeqs.length > 0) {
            const longest = pairSeqs.reduce(
                (best, seq) => seq.length > best.length ? seq : best, []
            );
            moves++;
            remainingPairs -= longest.length;
        }

        moves += Math.max(0, remainingSingles);
        moves += Math.max(0, remainingPairs);
        moves += pattern.quads.length;

        return Math.max(1, moves);
    }

    static buildCardElement(card, type = 'hand') {
        const div = document.createElement('div');

        const baseClass = type === 'hand' ? 'hand-card' : type === 'played' ? 'played-card' : 'dizhu-card';
        div.className = `${baseClass} ${card.cssClass}`;
        div.dataset.cardId = card.id;
        div.dataset.rank = card.rank;

        const valueTop = document.createElement('div');
        valueTop.className = 'card-value';
        valueTop.textContent = card.displayValue;

        const suitTop = document.createElement('div');
        suitTop.className = 'card-suit';
        suitTop.textContent = card.suitSymbol;

        const centerSuit = document.createElement('div');
        centerSuit.className = 'card-center-suit';
        centerSuit.textContent = card.suitSymbol;

        div.appendChild(valueTop);
        div.appendChild(suitTop);
        div.appendChild(centerSuit);

        if (type === 'hand') {
            const bottomDiv = document.createElement('div');
            bottomDiv.className = 'card-bottom';

            const valueBottom = document.createElement('div');
            valueBottom.className = 'card-value';
            valueBottom.textContent = card.displayValue;

            const suitBottom = document.createElement('div');
            suitBottom.className = 'card-suit';
            suitBottom.textContent = card.suitSymbol;

            bottomDiv.appendChild(valueBottom);
            bottomDiv.appendChild(suitBottom);
            div.appendChild(bottomDiv);
        }

        return div;
    }

    static buildCardBackElement() {
        const div = document.createElement('div');
        div.className = 'card-back';
        return div;
    }

    static buildDizhuCardBackElement() {
        const div = document.createElement('div');
        div.className = 'dizhu-card-back';
        return div;
    }
}
