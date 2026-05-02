/* ============================================================
   events_adult.js - 成年事件（年龄 19-40）
   ============================================================ */

'use strict';

window.ADULT_EVENTS = [

    // ── 19岁：大学入学 ──────────────────────────────────────
    {
        id: 'college_start',
        title: '大学报到',
        ageMin: 18, ageMax: 19,
        weight: 85, once: true,
        condition: function(s) { return s.conditions.education && s.conditions.education !== 'highschool'; },
        text: '你背着行李，第一次独自踏入了大学校园。宿舍里四个来自不同地方的室友，互相打量着，又互相笑了。一切都是新的。',
        choices: [
            {
                text: '积极融入，广交朋友',
                effect: { appearance: 2, luck: 3, intelligence: 1 },
                result: '你迅速融入了集体，成了宿舍的开心果，朋友圈一下子扩大了好几倍。',
                setFlag: 'went_to_college'
            },
            {
                text: '专注学业，好好提升自己',
                effect: { intelligence: 4, luck: 1 },
                result: '你把主要精力投入学习，GPA名列前茅，被导师列为重点培养对象。',
                setFlag: 'went_to_college'
            },
            {
                text: '参加各种社团和活动',
                effect: { appearance: 3, intelligence: 2, luck: 2 },
                result: '你加入了好几个社团，忙得不可开交，但收获了课本里学不到的东西。',
                setFlag: 'went_to_college'
            }
        ]
    },

    // ── 19岁：没上大学 ──────────────────────────────────────
    {
        id: 'no_college',
        title: '走入社会',
        ageMin: 18, ageMax: 19,
        weight: 60, once: true,
        condition: function(s) { return s.conditions.education === 'highschool' || !s.conditions.education; },
        text: '同龄人都上了大学，而你选择（或不得不）直接踏入社会。城市很大，你提着行李，有些茫然地站在路口。',
        choices: [
            {
                text: '去工厂打工，积累经验',
                resolve: function(s) { s.conditions.job = 'worker'; return { constitution: 3, wealth: 2 }; },
                result: '流水线上的工作机械而辛苦，但你开始攒下第一笔钱。生活的滋味，也慢慢有了底气。',
                setFlag: 'job_worker'
            },
            {
                text: '报名参加职业培训班',
                effect: { intelligence: 4, luck: 1 },
                result: '你学了一门实用技能，很快在同龄人中脱颖而出，找到了待遇不错的工作。',
                setFlag: 'vocational_training'
            },
            {
                text: '复读，争取明年再考',
                effect: { intelligence: 3, constitution: -1 },
                result: '你回到了高三的轨道，用一年时间重整旗鼓，再次向大学发起冲击。'
            }
        ]
    },

    // ── 20岁：校园恋情 ──────────────────────────────────────
    {
        id: 'campus_romance',
        title: '校园恋情',
        ageMin: 19, ageMax: 22,
        weight: 55, once: true,
        condition: function(s) {
            return s.conditions.went_to_college &&
                   !s.conditions.in_love &&
                   (s.attributes.appearance >= 45 || s.attributes.luck >= 50);
        },
        text: function(s) {
            const target = s.character.gender === 'male' ? '女孩' : '男孩';
            return `图书馆、操场、社团活动……你和那个${target}总是不期而遇。心跳加速的感觉再次降临，这次更加强烈。`;
        },
        choices: [
            {
                text: '勇敢表白，告诉对方你的心意',
                effect: { appearance: 3, luck: 3 },
                result: '对方笑着说了"好"。你们牵手走出图书馆，走进了彼此的世界。',
                setFlag: 'in_love'
            },
            {
                text: '暗中观察，等合适时机',
                effect: { intelligence: 2 },
                result: '时机没有等到，对方却被别人先一步牵走了。这次，你终究是慢了一步。'
            }
        ]
    },

    // ── 22岁：毕业找工作 ────────────────────────────────────
    {
        id: 'job_hunting',
        title: '求职季',
        ageMin: 21, ageMax: 24,
        weight: 80, once: true,
        condition: function(s) { return s.conditions.went_to_college && !s.conditions.job; },
        text: '毕业季，简历投出去一封封，大多如石沉大海，偶尔来一个面试，又因为各种原因落选。你坐在宿舍里，对着电脑屏幕发呆。',
        resolve: function(s) {
            const iq = s.attributes.intelligence;
            const app = s.attributes.appearance;
            if (iq >= 70) {
                s.conditions.job = 'engineer';
                return { wealth: 5, luck: 3 };
            } else if (iq >= 55 || app >= 60) {
                s.conditions.job = 'clerk';
                return { wealth: 3, luck: 1 };
            } else {
                s.conditions.job = 'worker';
                return { wealth: 1, luck: -1 };
            }
        },
        text_after: function(s) {
            const job = JOBS[s.conditions.job];
            return `经过漫长的等待，你终于收到了一封录用通知——${job ? job.name : '某工作'}。\n\n职业生涯，就此起步。`;
        }
    },

    // ── 23岁：第一次失恋（成年） ────────────────────────────
    {
        id: 'heartbreak_adult',
        title: '痛彻心扉',
        ageMin: 20, ageMax: 30,
        weight: 40, once: true,
        condition: function(s) { return s.conditions.in_love; },
        text: '你们分手了。没有吵架，没有争执，只是有一天你们都承认：走不下去了。\n\n你在被窝里哭了很久，把两年的照片删了又恢复，恢复了又删。',
        effect: { luck: -2, intelligence: 2 },
        setFlag: 'in_love',
        flagValue: false
    },

    // ── 25岁：认真的感情 ────────────────────────────────────
    {
        id: 'serious_relationship',
        title: '认真的爱情',
        ageMin: 22, ageMax: 30,
        weight: 60, once: true,
        condition: function(s) {
            return !s.conditions.married && !s.conditions.in_love &&
                   (s.attributes.appearance >= 45 || s.attributes.luck >= 50);
        },
        text: '你遇到了一个让你觉得"也许可以在一起很久"的人。ta认真地看待每一件事，也认真地看待你们的关系。',
        choices: [
            {
                text: '全身心投入这段感情',
                effect: { luck: 4, appearance: 2 },
                result: '你们默契地走入了稳定的关系，彼此都知道这不是儿戏。',
                setFlag: 'in_love'
            },
            {
                text: '保持克制，先把事业做好',
                effect: { intelligence: 2, wealth: 2 },
                result: '你婉转地表达了自己的想法，对方理解地点了点头。这段感情被小心地放慢了节奏。'
            }
        ]
    },

    // ── 27岁：结婚 ──────────────────────────────────────────
    {
        id: 'marriage',
        title: '步入婚姻',
        ageMin: 24, ageMax: 33,
        weight: 55, once: true,
        condition: function(s) { return s.conditions.in_love && !s.conditions.married; },
        text: '那个人单膝跪地，或是你们共同决定——去领结婚证吧。婚礼那天，你穿着礼服，眼眶泛红，笑得很傻。',
        choices: [
            {
                text: '办一场热闹的婚礼',
                condition: function(s) { return s.attributes.wealth >= 50; },
                effect: { appearance: 3, luck: 3, wealth: -5 },
                result: '宾客盈门，鲜花满堂，那一天成了你人生中最绚烂的日子之一。',
                setFlag: 'married'
            },
            {
                text: '简单领证，两人的心意最重要',
                effect: { luck: 4, intelligence: 1 },
                result: '你们静静地在民政局领了证，吃了一顿两人的小饭桌，简单而幸福。',
                setFlag: 'married'
            }
        ]
    },

    // ── 28岁：生孩子 ────────────────────────────────────────
    {
        id: 'first_child',
        title: '初为人父母',
        ageMin: 25, ageMax: 36,
        weight: 55, once: true,
        condition: function(s) { return s.conditions.married && !s.conditions.has_children; },
        text: '医院里，一声嘹亮的啼哭划破了走廊的宁静。护士把那个小小的、皱巴巴的婴儿抱出来，你的眼泪当场就掉下来了。',
        effect: { luck: 4, constitution: -1, wealth: -3 },
        setFlag: 'has_children',
        highlight: true
    },

    // ── 27岁：买房 ──────────────────────────────────────────
    {
        id: 'buy_house',
        title: '买房大战',
        ageMin: 25, ageMax: 35,
        weight: 50, once: true,
        condition: function(s) { return s.attributes.wealth >= 50 && !s.conditions.has_house; },
        text: '房价高得离谱，但租房的不稳定感越来越强。你和家人一起看房，算来算去，最终咬牙签了合同。',
        choices: [
            {
                text: '贷款买，咬牙撑过去',
                effect: { wealth: -5, luck: 3 },
                result: '背上了30年房贷，每个月还款像座山。但那把钥匙握在手里，感觉踏实多了。',
                setFlag: 'has_house'
            },
            {
                text: '再等等，继续存钱',
                effect: { wealth: 2 },
                result: '你决定继续观望，继续攒钱。等待本身也是一种选择。'
            }
        ]
    },

    // ── 28岁：工作升职 ────────────────────────────────────
    {
        id: 'promotion',
        title: '升职加薪',
        ageMin: 24, ageMax: 36,
        weight: 55, once: false,
        condition: function(s) { return s.conditions.job && s.attributes.intelligence >= 50; },
        text: function(s) {
            const job = JOBS[s.conditions.job];
            return `经理把你叫进了办公室，推了一份新合同过来："公司决定提升你担任更重要的职位。" 你保持着镇定，离开办公室后才在走廊里悄悄攥了攥拳头。`;
        },
        choices: [
            {
                text: '接受升职，挑战自己',
                effect: { intelligence: 3, wealth: 6, luck: 2 },
                result: '新职位责任更重，压力也更大，但薪水涨了三成。你知道，机会是留给敢于冒险的人的。',
                setFlag: 'promoted'
            },
            {
                text: '婉拒，不想那么累',
                effect: { luck: 1, constitution: 2 },
                result: '你婉拒了，保住了自己的空闲时间。同事看你的眼神有些复杂。'
            }
        ]
    },

    // ── 29岁：被解雇 ────────────────────────────────────────
    {
        id: 'fired',
        title: '突然失业',
        ageMin: 22, ageMax: 38,
        weight: 25, once: false,
        condition: function(s) { return s.conditions.job && s.attributes.luck < 45; },
        text: 'HR把你叫过去，客套地说了一堆，然后推给你一份离职协议。公司裁员，你的名字在名单上。',
        choices: [
            {
                text: '平静接受，立刻着手找新工作',
                effect: { intelligence: 2, luck: 2 },
                result: '你把这次失业当成一次重新出发的机会，三个月后找到了一份更适合自己的工作。',
                setFlag: 'job',
                flagValue: 'unemployed'
            },
            {
                text: '奋力抗争，要求赔偿',
                effect: { luck: 3, intelligence: 1 },
                result: '你援引劳动法据理力争，最终拿到了一笔合理的赔偿。',
                setFlag: 'job',
                flagValue: 'unemployed'
            },
            {
                text: '彻底崩溃，一蹶不振',
                effect: { constitution: -3, luck: -3 },
                result: '你陷入了一段低谷期，整天躺在家里，体重飙升，精神每况愈下。',
                setFlag: 'job',
                flagValue: 'unemployed'
            }
        ]
    },

    // ── 28岁：创业 ──────────────────────────────────────────
    {
        id: 'startup',
        title: '创业的念头',
        ageMin: 24, ageMax: 36,
        weight: 30, once: true,
        condition: function(s) { return s.attributes.intelligence >= 55 && !s.conditions.started_business; },
        text: '脑子里那个想法越来越清晰——为什么不自己干？朋友们有的支持，有的担心，父母更是几乎全程反对。',
        choices: [
            {
                text: '放手一搏！辞职创业',
                effect: null,
                resolve: function(s) {
                    const success = (s.attributes.intelligence + s.attributes.luck + s.attributes.wealth) / 3;
                    if (success >= 55) {
                        s.conditions.business_success = true;
                        s.conditions.job = 'entrepreneur';
                        return { wealth: 12, intelligence: 4, luck: 4 };
                    } else {
                        s.conditions.job = 'unemployed';
                        return { wealth: -8, intelligence: 2, luck: -2 };
                    }
                },
                result: function(s) {
                    return s.conditions.business_success
                        ? '创业维艰，但你撑下来了。公司慢慢走上正轨，投资人开始主动找上门来。'
                        : '三年后，资金链断裂，公司关门大吉。你背上了债务，一夜之间回到了原点。';
                },
                setFlag: 'started_business'
            },
            {
                text: '先兼职摸索，时机成熟再说',
                effect: { intelligence: 3, wealth: 2 },
                result: '你白天上班，晚上搞副业，慢慢积累资源和经验，等待真正的时机。',
                setFlag: 'started_business'
            },
            {
                text: '理智压过冲动，暂时放弃',
                effect: { intelligence: 1, wealth: 1 },
                result: '你计算了风险，决定暂时搁置这个想法。也许时机还没到。'
            }
        ]
    },

    // ── 30岁：意外受伤 ────────────────────────────────────
    {
        id: 'accident_adult',
        title: '突发意外',
        ageMin: 20, ageMax: 40,
        weight: 20, once: false,
        condition: function(s) { return s.attributes.luck < 40; },
        text: '一个普通的下午，一场意外突如其来——滑倒、车祸、或是工伤。你躺在医院里，望着白色的天花板，第一次认真地想到了死亡。',
        effect: { constitution: -5, luck: -2 }
    },

    // ── 30岁：健身习惯 ────────────────────────────────────
    {
        id: 'fitness_lifestyle',
        title: '锻炼的力量',
        ageMin: 20, ageMax: 36,
        weight: 45, once: true,
        condition: function(s) { return s.attributes.constitution >= 50; },
        text: '你开始认真健身，每周三次雷打不动。半年后，镜子里的自己判若两人，精力和自信都大幅提升。',
        effect: { constitution: 6, appearance: 4 },
        setFlag: 'fitness'
    },

    // ── 28岁：旅行 ────────────────────────────────────────
    {
        id: 'travel_adventure',
        title: '说走就走的旅行',
        ageMin: 22, ageMax: 32,
        weight: 40, once: false,
        text: '你请了半个月的假，买了一张机票，独自去了一个陌生的地方。迷路、语言不通、在路边摊吃东西，一切都是冒险。',
        condition: function(s) { return s.attributes.wealth >= 40 || s.attributes.luck >= 55; },
        effect: { intelligence: 3, appearance: 2, luck: 3 }
    },

    // ── 32岁：与老友重逢 ────────────────────────────────
    {
        id: 'old_friend',
        title: '老朋友重逢',
        ageMin: 25, ageMax: 38,
        weight: 40, once: false,
        text: '多年未见的老朋友突然联系了你。你们在一家小馆子里喝酒聊天，从傍晚聊到深夜，把这些年发生的事情一一说给对方听。',
        effect: { luck: 3, intelligence: 1 }
    },

    // ── 32岁：亲人离世 ────────────────────────────────────
    {
        id: 'family_death',
        title: '生离死别',
        ageMin: 22, ageMax: 42,
        weight: 25, once: false,
        text: '家里打来电话，说了一个让你措手不及的消息——一位你深爱的亲人，走了。\n\n你赶回家，站在灵堂前，脑子里一片空白，才真正明白了"失去"是什么感觉。',
        effect: { luck: -3, intelligence: 2, constitution: -1 }
    },

    // ── 30岁：投资股市 ────────────────────────────────────
    {
        id: 'stock_investment',
        title: '股市浮沉',
        ageMin: 25, ageMax: 40,
        weight: 35, once: false,
        condition: function(s) { return s.attributes.wealth >= 45; },
        text: '朋友推荐你炒股，说某只股票涨势很好。你拿出一笔钱，看着数字每天上下浮动，既期待又紧张。',
        choices: [
            {
                text: '重仓压注，大赚一笔',
                resolve: function(s) {
                    const roll = Math.random();
                    if (roll < 0.35 || s.attributes.luck >= 60) {
                        return { wealth: 10, luck: 3 };
                    } else {
                        return { wealth: -10, luck: -3 };
                    }
                },
                result: function(s) {
                    return s.attributes.wealth > 55
                        ? '运气站在你这边，这次投资让你的财富翻了一倍。'
                        : '行情急转直下，你把家底折进去了大半，难受了好几个月。';
                }
            },
            {
                text: '只投小钱，当体验',
                effect: null,
                resolve: function(s) {
                    return Math.random() < 0.5 ? { wealth: 3, luck: 1 } : { wealth: -2, luck: 0 };
                },
                result: '小赌怡情，大赌伤身。这次体验让你更清楚地认识了自己的风险承受能力。'
            }
        ]
    },

    // ── 28岁：中彩票（极罕见） ──────────────────────────────
    {
        id: 'lottery_win',
        title: '天降横财',
        ageMin: 22, ageMax: 38,
        weight: 4, once: true,
        condition: function(s) { return s.attributes.luck >= 75; },
        text: '你随手买了张彩票，没当回事。直到有一天看了开奖号码……你盯着那几个数字，手开始抖了。中了！',
        effect: { wealth: 15, luck: 5 },
        setFlag: 'lottery_won',
        highlight: true
    },

    // ── 30岁：赌博成瘾 ────────────────────────────────────
    {
        id: 'gambling_addiction',
        title: '赌博的深渊',
        ageMin: 22, ageMax: 38,
        weight: 15, once: true,
        condition: function(s) { return s.attributes.luck < 35 && s.attributes.wealth < 50; },
        text: '你第一次赢钱时，那种感觉让你飘飘然。于是一次、两次、三次……当你意识到不对劲时，已经深陷其中，欠了不少债。',
        choices: [
            {
                text: '当机立断，彻底戒掉',
                effect: { wealth: -6, intelligence: 2 },
                result: '你强迫自己斩断了这条路，用很长时间还清了债务。伤疤还在，但你站起来了。'
            },
            {
                text: '继续，指望翻本',
                effect: { wealth: -12, constitution: -2, luck: -4 },
                result: '越陷越深，家庭和工作都受到了严重冲击，你付出了惨痛的代价。',
                setFlag: 'gambler'
            }
        ]
    },

    // ── 35岁：人生危机 ────────────────────────────────────
    {
        id: 'life_crisis',
        title: '三十五岁的迷失',
        ageMin: 30, ageMax: 38,
        weight: 35, once: true,
        text: '你突然觉得，自己活着好像只是在"完成任务"。工作、还贷、带孩子……你不记得上一次真正为自己做什么是什么时候了。',
        choices: [
            {
                text: '寻求心理咨询，梳理自己',
                effect: { intelligence: 4, luck: 2 },
                result: '经过一段时间的自我审视，你慢慢找回了内心的方向，也更清楚地知道了自己真正想要的是什么。'
            },
            {
                text: '报名学习一项新技能或爱好',
                effect: { intelligence: 3, appearance: 2, luck: 2 },
                result: '新的爱好为你打开了一扇窗，带来了新的朋友和新的视角，生活重新鲜活起来。'
            },
            {
                text: '继续扛着，总会过去的',
                effect: { constitution: -2, intelligence: 1 },
                result: '你把情绪压下去，继续前行。这种压力以后或许会以另一种方式反弹，但眼前先过了这关。'
            }
        ]
    }

]; // ADULT_EVENTS END

console.log('[events_adult.js] 加载完成，共', window.ADULT_EVENTS.length, '条事件');
