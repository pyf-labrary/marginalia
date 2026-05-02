/**
 * tutorial.js - 新手教程模式
 */

class TutorialStep {
    constructor(config) {
        this.id = config.id;
        this.title = config.title;
        this.content = config.content;
        this.highlight = config.highlight || null;
        this.action = config.action || null;
        this.position = config.position || 'center';
        this.waitForAction = config.waitForAction || false;
        this.delay = config.delay || 0;
        this.onEnter = config.onEnter || null;
        this.onExit = config.onExit || null;
        this.showArrow = config.showArrow || false;
        this.arrowTarget = config.arrowTarget || null;
    }
}

class TutorialManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.steps = [];
        this.currentStepIndex = -1;
        this.isActive = false;
        this.overlay = null;
        this.dialog = null;
        this.onComplete = null;
        this.onSkip = null;

        this._buildTutorialSteps();
    }

    _buildTutorialSteps() {
        this.steps = [
            new TutorialStep({
                id: 'welcome',
                title: '欢迎来到斗地主！',
                content: '斗地主是一款经典的三人扑克牌游戏。接下来我将教你如何玩这个游戏。',
                position: 'center'
            }),
            new TutorialStep({
                id: 'intro_cards',
                title: '认识牌面',
                content: '游戏使用一副54张扑克牌（含大小王）。牌的大小顺序为：\n大王 > 小王 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3',
                position: 'center'
            }),
            new TutorialStep({
                id: 'intro_roles',
                title: '角色介绍',
                content: '游戏分为"地主"和"农民"两个阵营。\n• 地主：一人，拥有20张牌\n• 农民：两人，各17张牌\n地主一人对抗两名农民！',
                position: 'center'
            }),
            new TutorialStep({
                id: 'dealing',
                title: '发牌阶段',
                content: '每人先发17张牌，剩余3张为底牌（扣着不翻开）。',
                position: 'top',
                highlight: '.dizhu-cards'
            }),
            new TutorialStep({
                id: 'bidding',
                title: '叫地主',
                content: '发完牌后，玩家轮流叫分（1分、2分、3分或不叫）。\n叫分最高的人成为地主，获得3张底牌。\n叫的分数越高，赢得的分数越多，但风险也越大！',
                position: 'bottom',
                highlight: '.bid-area'
            }),
            new TutorialStep({
                id: 'card_types_basic',
                title: '基本牌型',
                content: '• 单张：任意一张牌\n• 对子：两张相同点数的牌\n• 三条：三张相同点数的牌\n• 三带一：三张相同 + 一张单牌\n• 三带二：三张相同 + 一对',
                position: 'center'
            }),
            new TutorialStep({
                id: 'card_types_combo',
                title: '组合牌型',
                content: '• 顺子：5张或以上连续单牌（不含2和王）\n• 连对：3对或以上连续对子\n• 飞机：2组或以上连续三条\n• 飞机可以带等量单牌或对子',
                position: 'center'
            }),
            new TutorialStep({
                id: 'card_types_special',
                title: '特殊牌型',
                content: '• 炸弹：四张相同点数（可以管任何牌型！）\n• 火箭：大小王（最大牌型，管一切！）\n• 四带二：四张相同 + 两张单牌或两对\n\n炸弹和火箭会让倍数翻倍！',
                position: 'center'
            }),
            new TutorialStep({
                id: 'playing_rules',
                title: '出牌规则',
                content: '• 地主先出牌，然后按逆时针轮流出\n• 出牌必须"打过"上家（相同牌型且更大）\n• 可以选择"不出"（过牌）\n• 炸弹和火箭可以管任何牌型',
                position: 'center'
            }),
            new TutorialStep({
                id: 'selecting_cards',
                title: '选牌出牌',
                content: '点击你的手牌来选中/取消选中。\n选好牌后点击"出牌"按钮打出。\n如果不想出，点"不出"跳过。\n不知道出什么？点"提示"获得建议！',
                position: 'bottom',
                highlight: '.hand-cards'
            }),
            new TutorialStep({
                id: 'winning',
                title: '胜负判定',
                content: '• 地主先出完所有牌 → 地主获胜\n• 任意农民先出完牌 → 农民获胜\n\n如果农民一张没出（春天）或地主只出一手牌（反春天），分数翻倍！',
                position: 'center'
            }),
            new TutorialStep({
                id: 'shortcuts',
                title: '快捷键',
                content: '• 回车/空格：出牌\n• P：不出（过牌）\n• H：提示\n• Esc：菜单\n• 1/2/3/0：叫分/不叫',
                position: 'center'
            }),
            new TutorialStep({
                id: 'tips',
                title: '游戏小贴士',
                content: '• 作为农民要和队友配合\n• 大牌（2、A、王）是控制牌，别浪费\n• 顺子和连对能快速消耗手牌\n• 注意对手剩余牌数，关键时刻用炸弹\n• 记住出过的大牌有助于判断局势',
                position: 'center'
            }),
            new TutorialStep({
                id: 'complete',
                title: '教程完成！',
                content: '你已经掌握了斗地主的基本规则。\n现在开始你的第一局游戏吧！\n\n祝你好运！🎴',
                position: 'center'
            })
        ];
    }

    start() {
        this.isActive = true;
        this.currentStepIndex = -1;
        this._createOverlay();
        this.nextStep();
    }

    stop() {
        this.isActive = false;
        this.currentStepIndex = -1;
        this._removeOverlay();
    }

    skip() {
        this.stop();
        if (this.onSkip) this.onSkip();
    }

    nextStep() {
        if (!this.isActive) return;

        const prevStep = this.getCurrentStep();
        if (prevStep && prevStep.onExit) {
            prevStep.onExit();
        }

        this.currentStepIndex++;

        if (this.currentStepIndex >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.getCurrentStep();
        if (step.onEnter) step.onEnter();

        this._renderStep(step);
    }

    prevStep() {
        if (!this.isActive || this.currentStepIndex <= 0) return;

        this.currentStepIndex--;
        const step = this.getCurrentStep();
        this._renderStep(step);
    }

    complete() {
        this.stop();
        this._markCompleted();
        if (this.onComplete) this.onComplete();
    }

    getCurrentStep() {
        if (this.currentStepIndex < 0 || this.currentStepIndex >= this.steps.length) {
            return null;
        }
        return this.steps[this.currentStepIndex];
    }

    get progress() {
        return {
            current: this.currentStepIndex + 1,
            total: this.steps.length,
            percent: ((this.currentStepIndex + 1) / this.steps.length * 100).toFixed(0)
        };
    }

    hasCompletedTutorial() {
        try {
            return localStorage.getItem('doudizhu_tutorial_complete') === 'true';
        } catch (e) {
            return false;
        }
    }

    _markCompleted() {
        try {
            localStorage.setItem('doudizhu_tutorial_complete', 'true');
        } catch (e) { /* ignore */ }
    }

    resetCompletion() {
        try {
            localStorage.removeItem('doudizhu_tutorial_complete');
        } catch (e) { /* ignore */ }
    }

    _createOverlay() {
        this._removeOverlay();

        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.id = 'tutorial-overlay';

        this.dialog = document.createElement('div');
        this.dialog.className = 'tutorial-dialog';
        this.dialog.id = 'tutorial-dialog';

        this.overlay.appendChild(this.dialog);
        document.body.appendChild(this.overlay);
    }

    _removeOverlay() {
        const existing = document.getElementById('tutorial-overlay');
        if (existing) existing.remove();
        this.overlay = null;
        this.dialog = null;
    }

    _renderStep(step) {
        if (!this.dialog) return;

        const prog = this.progress;
        const isFirst = this.currentStepIndex === 0;
        const isLast = this.currentStepIndex === this.steps.length - 1;

        this.dialog.className = `tutorial-dialog tutorial-${step.position}`;
        this.dialog.innerHTML = `
            <div class="tutorial-header">
                <div class="tutorial-progress">
                    <div class="tutorial-progress-bar" style="width: ${prog.percent}%"></div>
                </div>
                <span class="tutorial-step-count">${prog.current} / ${prog.total}</span>
            </div>
            <div class="tutorial-body">
                <h3 class="tutorial-title">${step.title}</h3>
                <div class="tutorial-content">${this._formatContent(step.content)}</div>
            </div>
            <div class="tutorial-footer">
                <button class="btn btn-small tutorial-skip" id="tutorial-skip-btn">跳过教程</button>
                <div class="tutorial-nav">
                    ${!isFirst ? '<button class="btn btn-small btn-secondary" id="tutorial-prev-btn">上一步</button>' : ''}
                    <button class="btn btn-small btn-primary" id="tutorial-next-btn">
                        ${isLast ? '开始游戏' : '下一步'}
                    </button>
                </div>
            </div>
        `;

        const nextBtn = this.dialog.querySelector('#tutorial-next-btn');
        const prevBtn = this.dialog.querySelector('#tutorial-prev-btn');
        const skipBtn = this.dialog.querySelector('#tutorial-skip-btn');

        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        if (skipBtn) skipBtn.addEventListener('click', () => this.skip());

        if (step.highlight) {
            this._highlightElement(step.highlight);
        } else {
            this._clearHighlight();
        }
    }

    _formatContent(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/•/g, '<span class="tutorial-bullet">•</span>');
    }

    _highlightElement(selector) {
        this._clearHighlight();
        const el = document.querySelector(selector);
        if (el) {
            el.classList.add('tutorial-highlighted');
        }
    }

    _clearHighlight() {
        document.querySelectorAll('.tutorial-highlighted').forEach(el => {
            el.classList.remove('tutorial-highlighted');
        });
    }
}

class CardTypeGuide {
    constructor() {
        this.examples = this._buildExamples();
    }

    _buildExamples() {
        return {
            [CARD_TYPE.SINGLE]: {
                name: '单张',
                description: '任意一张牌',
                examples: ['3', 'K', 'A', '2', '小王'],
                minCards: 1,
                tips: '尽量保留大的单牌作为控制牌'
            },
            [CARD_TYPE.PAIR]: {
                name: '对子',
                description: '两张点数相同的牌',
                examples: ['33', 'KK', 'AA'],
                minCards: 2,
                tips: '对2是最大对子，仅次于炸弹'
            },
            [CARD_TYPE.TRIPLE]: {
                name: '三条',
                description: '三张点数相同的牌',
                examples: ['333', 'KKK'],
                minCards: 3,
                tips: '很少单独出，通常配合带牌'
            },
            [CARD_TYPE.TRIPLE_WITH_SINGLE]: {
                name: '三带一',
                description: '三张相同 + 一张单牌',
                examples: ['333+5', 'KKK+3'],
                minCards: 4,
                tips: '带走小牌是好策略'
            },
            [CARD_TYPE.TRIPLE_WITH_PAIR]: {
                name: '三带二',
                description: '三张相同 + 一对',
                examples: ['333+55', 'KKK+44'],
                minCards: 5,
                tips: '比三带一多消耗1张牌'
            },
            [CARD_TYPE.STRAIGHT]: {
                name: '顺子',
                description: '5张或以上连续单牌（不含2和王）',
                examples: ['34567', '910JQK', '3456789'],
                minCards: 5,
                tips: '最长可以从3到A，共12张'
            },
            [CARD_TYPE.STRAIGHT_PAIR]: {
                name: '连对',
                description: '3对或以上连续对子（不含2和王）',
                examples: ['334455', '99JJQQKK'],
                minCards: 6,
                tips: '能快速消耗大量手牌'
            },
            [CARD_TYPE.PLANE]: {
                name: '飞机',
                description: '2组或以上连续三条',
                examples: ['333444', '888999'],
                minCards: 6,
                tips: '可以带等量单牌或对子'
            },
            [CARD_TYPE.PLANE_WITH_SINGLES]: {
                name: '飞机带单',
                description: '飞机 + 等数量单牌',
                examples: ['333444+56', '888999+3K'],
                minCards: 8,
                tips: '带走最小的单牌'
            },
            [CARD_TYPE.PLANE_WITH_PAIRS]: {
                name: '飞机带对',
                description: '飞机 + 等数量对子',
                examples: ['333444+5566'],
                minCards: 10,
                tips: '一次性出很多牌！'
            },
            [CARD_TYPE.FOUR_WITH_TWO_SINGLES]: {
                name: '四带二',
                description: '四张相同 + 两张单牌',
                examples: ['3333+45'],
                minCards: 6,
                tips: '不算炸弹，不加倍'
            },
            [CARD_TYPE.FOUR_WITH_TWO_PAIRS]: {
                name: '四带两对',
                description: '四张相同 + 两对',
                examples: ['3333+4455'],
                minCards: 8,
                tips: '不算炸弹，不加倍'
            },
            [CARD_TYPE.BOMB]: {
                name: '炸弹',
                description: '四张点数相同的牌',
                examples: ['3333', 'AAAA', '2222'],
                minCards: 4,
                tips: '可以管任何牌型！使用后倍数翻倍'
            },
            [CARD_TYPE.ROCKET]: {
                name: '火箭',
                description: '大小王',
                examples: ['小王+大王'],
                minCards: 2,
                tips: '最大牌型！可以管一切包括炸弹'
            }
        };
    }

    getExample(type) {
        return this.examples[type] || null;
    }

    getAllExamples() {
        return this.examples;
    }

    getQuickReference() {
        return Object.entries(this.examples).map(([type, info]) => ({
            type,
            name: info.name,
            description: info.description,
            minCards: info.minCards
        }));
    }

    getTipForSituation(hand, lastPlay) {
        const tips = [];

        if (!lastPlay) {
            tips.push('你是首家出牌，可以自由选择牌型');
            if (hand.length <= 3) {
                tips.push('手牌不多了，尽快出完！');
            }
            const hasBomb = CardUtils.getBombCount(hand) > 0;
            if (hasBomb) {
                tips.push('你有炸弹，可以考虑留到关键时刻');
            }
        } else {
            const analyzer = new HandAnalyzer(hand);
            const playable = analyzer.getPlayableHandsBeating(lastPlay);

            if (playable.length === 0) {
                tips.push('你没有能管住的牌，只能选择不出');
            } else if (playable.length === 1) {
                tips.push('只有一种选择可以管住');
            } else {
                tips.push(`有 ${playable.length} 种出法可以管住`);
            }

            const hasBombOption = playable.some(p =>
                p.type === CARD_TYPE.BOMB || p.type === CARD_TYPE.ROCKET
            );
            if (hasBombOption && playable.length > 1) {
                tips.push('可以用炸弹管住，但会消耗炸弹');
            }
        }

        return tips;
    }
}

class InteractiveTutorial extends TutorialManager {
    constructor(renderer, game) {
        super(renderer);
        this.game = game;
        this.cardGuide = new CardTypeGuide();
        this._interactiveSteps = [];
    }

    _buildInteractiveSteps() {
        return [
            {
                id: 'select_card',
                title: '试着选一张牌',
                content: '点击你手中的任意一张牌来选中它。选中的牌会上移。再次点击可以取消选择。',
                waitFor: 'card_select',
                validate: () => {
                    const human = this.game.playerManager.getHumanPlayer();
                    return human && human.getSelectedCards().length > 0;
                }
            },
            {
                id: 'play_single',
                title: '出一张单牌',
                content: '选择一张牌，然后点击"出牌"按钮。',
                waitFor: 'card_play',
                validate: (cards) => {
                    return cards && cards.length === 1;
                }
            },
            {
                id: 'use_hint',
                title: '使用提示',
                content: '点击"提示"按钮，系统会帮你选择合适的牌。多次点击可以切换不同的出法。',
                waitFor: 'hint_click'
            }
        ];
    }

    showCardTypeInfo(type) {
        const info = this.cardGuide.getExample(type);
        if (!info) return;

        const dialog = document.createElement('div');
        dialog.className = 'card-type-info-dialog';
        dialog.innerHTML = `
            <div class="card-type-info-header">
                <h3>${info.name}</h3>
                <button class="btn-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
            <div class="card-type-info-body">
                <p><strong>说明：</strong>${info.description}</p>
                <p><strong>最少张数：</strong>${info.minCards}张</p>
                <p><strong>举例：</strong>${info.examples.join('、')}</p>
                <p class="tip"><strong>技巧：</strong>${info.tips}</p>
            </div>
        `;

        document.body.appendChild(dialog);
        setTimeout(() => {
            if (dialog.parentNode) dialog.remove();
        }, 8000);
    }
}
