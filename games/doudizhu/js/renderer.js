/**
 * renderer.js - 界面渲染
 */

class Renderer {
    constructor() {
        this.elements = {};
        this.cardClickHandler = null;
        this._cacheElements();
    }

    _cacheElements() {
        const ids = [
            'start-screen', 'settings-screen', 'rules-screen',
            'game-screen', 'result-screen',
            'hand-cards', 'cards-left', 'cards-right',
            'play-bottom', 'play-left', 'play-right',
            'action-bottom', 'action-left', 'action-right',
            'dizhu-cards', 'dizhu-cards-container',
            'center-info', 'game-message',
            'bid-area', 'play-buttons',
            'pause-menu',
            'avatar-left', 'avatar-right', 'avatar-bottom',
            'role-left', 'role-right', 'role-bottom',
            'name-left', 'name-right', 'name-bottom',
            'count-left', 'count-right',
            'game-multiplier', 'game-bomb-count',
            'result-icon', 'result-title', 'result-detail',
            'score-rows', 'result-stats',
            'btn-play', 'btn-pass', 'btn-hint'
        ];

        for (const id of ids) {
            this.elements[id] = document.getElementById(id);
        }
    }

    el(id) {
        return this.elements[id] || document.getElementById(id);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });
        const screen = this.el(screenId);
        if (screen) {
            screen.classList.add('active');
            screen.classList.add('screen-enter');
            setTimeout(() => screen.classList.remove('screen-enter'), 400);
        }
    }

    renderHandCards(cards, onCardClick) {
        const container = this.el('hand-cards');
        if (!container) return;

        container.innerHTML = '';

        const sorted = CardUtils.sortCards(cards);

        sorted.forEach((card, index) => {
            const cardEl = CardUtils.buildCardElement(card, 'hand');
            cardEl.style.zIndex = index;

            if (card.selected) {
                cardEl.classList.add('selected');
            }

            cardEl.addEventListener('click', (e) => {
                e.stopPropagation();
                if (onCardClick) onCardClick(card.id);
            });

            container.appendChild(cardEl);
        });
    }

    updateCardSelection(cardId, isSelected) {
        const container = this.el('hand-cards');
        if (!container) return;

        const cardEl = container.querySelector(`[data-card-id="${cardId}"]`);
        if (cardEl) {
            if (isSelected) {
                cardEl.classList.add('selected');
            } else {
                cardEl.classList.remove('selected');
            }
        }
    }

    renderAICards(position, count) {
        const containerId = position === PLAYER_POSITION.LEFT ? 'cards-left' : 'cards-right';
        const container = this.el(containerId);
        if (!container) return;

        container.innerHTML = '';

        const displayCount = Math.min(count, 10);
        for (let i = 0; i < displayCount; i++) {
            const back = CardUtils.buildCardBackElement();
            container.appendChild(back);
        }
    }

    updateCardCount(position, count) {
        const countId = position === PLAYER_POSITION.LEFT ? 'count-left' : 'count-right';
        const el = this.el(countId);
        if (el) {
            el.textContent = `${count}张`;
            if (count <= 3) {
                el.style.color = 'var(--color-danger)';
                el.style.fontWeight = '700';
            } else {
                el.style.color = '';
                el.style.fontWeight = '';
            }
        }
    }

    renderPlayedCards(position, cards, animClass = '') {
        let containerId;
        switch (position) {
            case PLAYER_POSITION.BOTTOM: containerId = 'play-bottom'; break;
            case PLAYER_POSITION.LEFT: containerId = 'play-left'; break;
            case PLAYER_POSITION.RIGHT: containerId = 'play-right'; break;
        }

        const container = this.el(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (!cards || cards.length === 0) return;

        const sorted = CardUtils.sortCards(cards);
        sorted.forEach((card, index) => {
            const cardEl = CardUtils.buildCardElement(card, 'played');
            if (animClass) {
                cardEl.classList.add(animClass);
                cardEl.style.animationDelay = `${index * 0.05}s`;
            }
            container.appendChild(cardEl);
        });
    }

    clearPlayedCards(position) {
        let containerId;
        if (position === undefined) {
            ['play-bottom', 'play-left', 'play-right'].forEach(id => {
                const el = this.el(id);
                if (el) el.innerHTML = '';
            });
            return;
        }
        switch (position) {
            case PLAYER_POSITION.BOTTOM: containerId = 'play-bottom'; break;
            case PLAYER_POSITION.LEFT: containerId = 'play-left'; break;
            case PLAYER_POSITION.RIGHT: containerId = 'play-right'; break;
        }
        const el = this.el(containerId);
        if (el) el.innerHTML = '';
    }

    showPlayerAction(position, text, duration = 0) {
        let actionId;
        switch (position) {
            case PLAYER_POSITION.BOTTOM: actionId = 'action-bottom'; break;
            case PLAYER_POSITION.LEFT: actionId = 'action-left'; break;
            case PLAYER_POSITION.RIGHT: actionId = 'action-right'; break;
        }

        const el = this.el(actionId);
        if (!el) return;

        el.textContent = text;
        el.classList.add('anim-scale-in');

        if (duration > 0) {
            setTimeout(() => {
                el.textContent = '';
                el.classList.remove('anim-scale-in');
            }, duration);
        }
    }

    clearPlayerAction(position) {
        this.showPlayerAction(position, '');
    }

    clearAllActions() {
        for (let i = 0; i < PLAYER_COUNT; i++) {
            this.clearPlayerAction(i);
        }
    }

    renderDizhuCards(cards, faceUp = true) {
        const container = this.el('dizhu-cards-container');
        const wrapper = this.el('dizhu-cards');
        if (!container || !wrapper) return;

        container.innerHTML = '';
        wrapper.classList.remove('hidden');

        for (const card of cards) {
            if (faceUp) {
                const cardEl = CardUtils.buildCardElement(card, 'dizhu');
                cardEl.classList.add('anim-flip');
                container.appendChild(cardEl);
            } else {
                const back = CardUtils.buildDizhuCardBackElement();
                container.appendChild(back);
            }
        }
    }

    hideDizhuCards() {
        const wrapper = this.el('dizhu-cards');
        if (wrapper) wrapper.classList.add('hidden');
    }

    showBidArea() {
        const el = this.el('bid-area');
        if (el) {
            el.classList.remove('hidden');
            el.classList.add('anim-slide-up');
        }
    }

    hideBidArea() {
        const el = this.el('bid-area');
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('anim-slide-up');
        }
    }

    updateBidButtons(currentBid) {
        const btn1 = document.getElementById('btn-bid-1');
        const btn2 = document.getElementById('btn-bid-2');
        const btn3 = document.getElementById('btn-bid-3');

        if (btn1) btn1.disabled = currentBid >= 1;
        if (btn2) btn2.disabled = currentBid >= 2;
        if (btn3) btn3.disabled = currentBid >= 3;

        if (btn1) btn1.style.opacity = currentBid >= 1 ? '0.4' : '1';
        if (btn2) btn2.style.opacity = currentBid >= 2 ? '0.4' : '1';
        if (btn3) btn3.style.opacity = currentBid >= 3 ? '0.4' : '1';
    }

    showPlayButtons(canPass = true) {
        const el = this.el('play-buttons');
        if (el) {
            el.classList.remove('hidden');
            el.classList.add('anim-slide-up');
        }
        const passBtn = this.el('btn-pass');
        if (passBtn) {
            passBtn.disabled = !canPass;
            passBtn.style.opacity = canPass ? '1' : '0.4';
        }
    }

    hidePlayButtons() {
        const el = this.el('play-buttons');
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('anim-slide-up');
        }
    }

    setPlayButtonEnabled(enabled) {
        const btn = this.el('btn-play');
        if (btn) {
            btn.disabled = !enabled;
        }
    }

    showMessage(text, duration = 0) {
        const el = this.el('game-message');
        if (!el) return;

        el.textContent = text;
        el.classList.add('anim-scale-bounce');

        if (duration > 0) {
            setTimeout(() => {
                el.textContent = '';
                el.classList.remove('anim-scale-bounce');
            }, duration);
        }
    }

    clearMessage() {
        const el = this.el('game-message');
        if (el) {
            el.textContent = '';
            el.classList.remove('anim-scale-bounce');
        }
    }

    setRoleBadge(position, role) {
        let badgeId, avatarId;
        switch (position) {
            case PLAYER_POSITION.BOTTOM:
                badgeId = 'role-bottom'; avatarId = 'avatar-bottom'; break;
            case PLAYER_POSITION.LEFT:
                badgeId = 'role-left'; avatarId = 'avatar-left'; break;
            case PLAYER_POSITION.RIGHT:
                badgeId = 'role-right'; avatarId = 'avatar-right'; break;
        }

        const badge = this.el(badgeId);
        const avatar = this.el(avatarId);

        if (badge) {
            badge.classList.remove('hidden', 'landlord', 'farmer');
            if (role === PLAYER_ROLE.LANDLORD) {
                badge.classList.add('landlord');
                badge.textContent = '主';
            } else if (role === PLAYER_ROLE.FARMER) {
                badge.classList.add('farmer');
                badge.textContent = '农';
            }
        }

        if (avatar && role === PLAYER_ROLE.LANDLORD) {
            avatar.classList.add('anim-pulse-gold');
        }
    }

    setActiveTurn(position) {
        ['avatar-left', 'avatar-right', 'avatar-bottom'].forEach(id => {
            const el = this.el(id);
            if (el) el.classList.remove('active-turn');
        });

        let avatarId;
        switch (position) {
            case PLAYER_POSITION.BOTTOM: avatarId = 'avatar-bottom'; break;
            case PLAYER_POSITION.LEFT: avatarId = 'avatar-left'; break;
            case PLAYER_POSITION.RIGHT: avatarId = 'avatar-right'; break;
        }

        const el = this.el(avatarId);
        if (el) el.classList.add('active-turn');
    }

    clearActiveTurn() {
        ['avatar-left', 'avatar-right', 'avatar-bottom'].forEach(id => {
            const el = this.el(id);
            if (el) el.classList.remove('active-turn');
        });
    }

    updateGameInfo(multiplier, bombCount) {
        const mulEl = this.el('game-multiplier');
        const bombEl = this.el('game-bomb-count');

        if (mulEl) mulEl.textContent = `底分: ${multiplier}`;
        if (bombEl) bombEl.textContent = `炸弹: ${bombCount}`;
    }

    showPauseMenu() {
        const el = this.el('pause-menu');
        if (el) el.classList.remove('hidden');
    }

    hidePauseMenu() {
        const el = this.el('pause-menu');
        if (el) el.classList.add('hidden');
    }

    renderResult(data) {
        const iconEl = this.el('result-icon');
        const titleEl = this.el('result-title');
        const detailEl = this.el('result-detail');
        const scoresEl = this.el('score-rows');
        const statsEl = this.el('result-stats');

        if (iconEl) {
            iconEl.textContent = data.isWin ? '🎉' : '😔';
            iconEl.className = `result-icon ${data.isWin ? 'anim-win' : 'anim-lose'}`;
        }

        if (titleEl) {
            titleEl.textContent = data.isWin ? MESSAGES.GAME_WIN : MESSAGES.GAME_LOSE;
            titleEl.className = `result-title ${data.isWin ? 'win' : 'lose'}`;
        }

        if (detailEl) {
            let detail = data.isLandlordWin ? MESSAGES.LANDLORD_WIN : MESSAGES.FARMER_WIN;
            if (data.spring) detail += ' | ' + MESSAGES.SPRING;
            if (data.antiSpring) detail += ' | ' + MESSAGES.ANTI_SPRING;
            detailEl.textContent = detail;
        }

        if (scoresEl) {
            scoresEl.innerHTML = '';
            data.players.forEach(p => {
                const row = document.createElement('div');
                row.className = 'score-row player-row';

                const nameSpan = document.createElement('span');
                nameSpan.textContent = p.name;

                const roleSpan = document.createElement('span');
                roleSpan.textContent = p.roleDisplay;
                roleSpan.style.color = p.isLandlord ? 'var(--color-danger)' : 'var(--color-secondary)';

                const scoreSpan = document.createElement('span');
                scoreSpan.textContent = p.score > 0 ? `+${p.score}` : String(p.score);
                scoreSpan.className = p.score > 0 ? 'score-positive' : 'score-negative';

                row.appendChild(nameSpan);
                row.appendChild(roleSpan);
                row.appendChild(scoreSpan);
                scoresEl.appendChild(row);
            });
        }

        if (statsEl) {
            const lines = [];
            lines.push(`倍数: ${data.multiplier}x`);
            if (data.bombCount > 0) lines.push(`炸弹数: ${data.bombCount}`);
            if (data.spring) lines.push('春天加倍');
            if (data.antiSpring) lines.push('反春天加倍');
            statsEl.textContent = lines.join('  |  ');
        }

        this.showScreen('result-screen');
    }

    clearAllRoleBadges() {
        ['role-left', 'role-right', 'role-bottom'].forEach(id => {
            const el = this.el(id);
            if (el) {
                el.classList.add('hidden');
                el.classList.remove('landlord', 'farmer');
            }
        });
        ['avatar-left', 'avatar-right', 'avatar-bottom'].forEach(id => {
            const el = this.el(id);
            if (el) el.classList.remove('anim-pulse-gold');
        });
    }

    resetGameScreen() {
        this.clearPlayedCards();
        this.clearAllActions();
        this.clearMessage();
        this.hideBidArea();
        this.hidePlayButtons();
        this.hideDizhuCards();
        this.hidePauseMenu();
        this.clearActiveTurn();
        this.clearAllRoleBadges();
        this.updateGameInfo(1, 0);

        const handCards = this.el('hand-cards');
        if (handCards) handCards.innerHTML = '';

        const cardsLeft = this.el('cards-left');
        if (cardsLeft) cardsLeft.innerHTML = '';

        const cardsRight = this.el('cards-right');
        if (cardsRight) cardsRight.innerHTML = '';
    }
}
