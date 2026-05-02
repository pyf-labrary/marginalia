/* ============================================================
   events_late.js - 中老年事件（年龄 41-100+）
   ============================================================ */

'use strict';

window.LATE_EVENTS = [

    // ── 42岁：中年危机 ──────────────────────────────────────
    {
        id: 'midlife_crisis',
        title: '中年危机',
        ageMin: 40, ageMax: 48,
        weight: 60, once: true,
        text: '你照着镜子，发现两鬓开始出现白发，眼角有了细纹。孩子在长大，父母在老去，而你……不知道从什么时候开始，已经是"中年人"了。',
        choices: [
            {
                text: '置之一笑，岁月如此，随它去',
                effect: { luck: 3, intelligence: 2 },
                result: '你豁然开朗，年龄不过是个数字，人生的质量才是真正重要的。'
            },
            {
                text: '重新规划人生，做出改变',
                effect: { intelligence: 4, appearance: 2, luck: 2 },
                result: '你开始健身、学新技能、规划未来。这场危机变成了你人生的新起点。'
            },
            {
                text: '郁郁寡欢，陷入消沉',
                effect: { constitution: -3, luck: -2, intelligence: -1 },
                result: '你消沉了很长时间，家人为此担忧不已。阴影笼罩着这段岁月。'
            }
        ]
    },

    // ── 45岁：事业巅峰 ──────────────────────────────────────
    {
        id: 'career_peak',
        title: '事业巅峰',
        ageMin: 40, ageMax: 52,
        weight: 45, once: true,
        condition: function(s) {
            return s.conditions.job && s.conditions.job !== 'unemployed' &&
                   s.attributes.intelligence >= 55;
        },
        text: '多年的积累终于在这一刻爆发。你在行业内已经是响当当的名字，手下带着一支团队，参与着真正能影响他人的决策。',
        choices: [
            {
                text: '继续拼搏，攀向更高峰',
                effect: { intelligence: 3, wealth: 8, luck: 2, constitution: -2 },
                result: '你把健康透支在了工作里，但换来了名誉与财富的双重丰收。',
                setFlag: 'career_peak'
            },
            {
                text: '见好就收，开始享受生活',
                effect: { constitution: 3, luck: 4, intelligence: 1 },
                result: '你主动降低工作强度，把省下来的时间还给家人和自己。事业差不多了，人生还长。'
            }
        ]
    },

    // ── 45岁：孩子长大 ──────────────────────────────────────
    {
        id: 'child_grown',
        title: '孩子长大了',
        ageMin: 40, ageMax: 56,
        weight: 55, once: true,
        condition: function(s) { return s.conditions.has_children; },
        text: '孩子考上了大学，或者找到了第一份工作。你送他/她离家那天，车子驶远了，你站在原地，半天没动。',
        effect: { luck: 3, constitution: -1 },
        highlight: true
    },

    // ── 48岁：二次创业 ──────────────────────────────────────
    {
        id: 'second_venture',
        title: '再次创业',
        ageMin: 42, ageMax: 55,
        weight: 25, once: true,
        condition: function(s) {
            return s.conditions.started_business && s.attributes.intelligence >= 60 &&
                   s.attributes.wealth >= 50;
        },
        text: '有了第一次的经验，你决定再次创业。这一次，你更清楚风险在哪里，也更懂得如何应对。',
        resolve: function(s) {
            const score = (s.attributes.intelligence + s.attributes.luck + s.attributes.wealth) / 3;
            if (score >= 58) {
                s.conditions.business_success = true;
                s.conditions.job = 'entrepreneur';
                return { wealth: 15, intelligence: 4, luck: 5 };
            } else {
                return { wealth: -5, intelligence: 2 };
            }
        },
        text_after: function(s) {
            return s.conditions.business_success
                ? '这一次，你成功了。公司越做越大，财富和声望接踵而来。'
                : '事业再次遇挫，但你没有再次崩溃——有些东西，只有经历过才会真正明白。';
        }
    },

    // ── 48岁：晋升领导 ──────────────────────────────────────
    {
        id: 'leadership_role',
        title: '走上领导岗位',
        ageMin: 42, ageMax: 55,
        weight: 35, once: true,
        condition: function(s) {
            return s.conditions.job && s.conditions.job !== 'unemployed' &&
                   s.conditions.promoted && s.attributes.intelligence >= 60;
        },
        text: '多年耕耘，你终于走上了领导岗位。站在台上发言时，你想起了刚入职时那个拘谨的年轻人。',
        effect: { wealth: 8, intelligence: 3, luck: 3, appearance: 2 },
        resolve: function(s) {
            const jobs = ['doctor', 'engineer', 'scientist', 'lawyer'];
            if (!jobs.includes(s.conditions.job)) {
                s.conditions.job = 'politician';
            }
            return null;
        }
    },

    // ── 50岁：健康警告 ──────────────────────────────────────
    {
        id: 'health_warning',
        title: '身体的警告',
        ageMin: 45, ageMax: 58,
        weight: 55, once: true,
        condition: function(s) { return s.attributes.constitution < 65; },
        text: '体检报告上出现了几个异常指标，医生严肃地叮嘱你要注意休息、控制饮食、规律运动。你把报告折起来放进包里，心里沉甸甸的。',
        choices: [
            {
                text: '听医嘱，认真改变生活方式',
                effect: { constitution: 5, luck: 2 },
                result: '你调整了作息，开始清淡饮食，每天晚饭后散步。半年后复查，指标明显好转。'
            },
            {
                text: '随便看看，不太当回事',
                effect: { constitution: -3, luck: -2 },
                result: '你没有认真对待。几年后，症状开始明显，才追悔莫及。',
                setFlag: 'ill'
            }
        ]
    },

    // ── 52岁：慢性病 ──────────────────────────────────────
    {
        id: 'chronic_illness',
        title: '慢性病缠身',
        ageMin: 48, ageMax: 68,
        weight: 35, once: true,
        condition: function(s) { return s.attributes.constitution < 50; },
        text: '医生告知你患上了某种慢性病——高血压、糖尿病，或是别的什么。这意味着余生都要与药物为伴。',
        choices: [
            {
                text: '积极配合治疗，调整生活',
                effect: { constitution: -2, luck: 2 },
                result: '你严格遵医嘱，虽然生活受到一些限制，但病情得到了控制。',
                setFlag: 'chronic_ill'
            },
            {
                text: '抗拒承认，不想改变',
                effect: { constitution: -5, luck: -3 },
                result: '逃避没有意义，症状越来越重，最终不得不面对。',
                setFlag: 'chronic_ill'
            }
        ]
    },

    // ── 52岁：离婚风波 ──────────────────────────────────────
    {
        id: 'late_divorce',
        title: '婚姻破裂',
        ageMin: 42, ageMax: 56,
        weight: 18, once: true,
        condition: function(s) { return s.conditions.married && s.attributes.luck < 38; },
        text: '多年的婚姻走到了尽头。昔日誓言言犹在耳，如今却连在同一屋檐下待着都觉得窒息。你们决定分开。',
        choices: [
            {
                text: '和平分手，好聚好散',
                effect: { luck: 2, intelligence: 2 },
                result: '你们以成年人的方式道别，没有撕破脸。各自往后的路，都走得清明一些。',
                setFlag: 'married', flagValue: false
            },
            {
                text: '争夺财产，不甘示弱',
                effect: { luck: -3, constitution: -2 },
                result: '漫长的诉讼耗尽了你的精力和财富，就算最终赢了，心里也只剩下一片荒芜。',
                setFlag: 'married', flagValue: false
            }
        ]
    },

    // ── 58岁：退休规划 ──────────────────────────────────────
    {
        id: 'retirement_plan',
        title: '退休倒计时',
        ageMin: 55, ageMax: 62,
        weight: 70, once: true,
        text: '退休的日子越来越近了。你开始盘算：攒了多少钱？身体还好吗？退休之后，想做什么？',
        choices: [
            {
                text: '早退休，趁还能动去享受',
                effect: { constitution: 3, luck: 4 },
                result: '你提前退休，用省下来的时间旅游、陪伴家人、培养爱好。自由的滋味，真好。',
                setFlag: 'retired'
            },
            {
                text: '再干几年，多攒些钱',
                effect: { wealth: 6, constitution: -2 },
                result: '你又坚持了几年，银行存款更厚实了，但身体也悄悄透支了一些。',
                setFlag: 'retired'
            }
        ]
    },

    // ── 62岁：儿孙绕膝 ──────────────────────────────────────
    {
        id: 'grandchildren',
        title: '儿孙绕膝',
        ageMin: 58, ageMax: 72,
        weight: 55, once: true,
        condition: function(s) { return s.conditions.has_children; },
        text: '孙子/孙女出生了！那个小小的婴儿好奇地看着你，你觉得时间仿佛兜了一圈，回到了很久以前。',
        effect: { luck: 5, constitution: 1 },
        setFlag: 'has_grandchildren',
        highlight: true
    },

    // ── 64岁：失去伴侣 ──────────────────────────────────────
    {
        id: 'spouse_death',
        title: '阴阳两隔',
        ageMin: 62, ageMax: 82,
        weight: 30, once: true,
        condition: function(s) { return s.conditions.married; },
        text: '相伴几十年的爱人先你而去。你在空荡荡的房间里坐了很久，对面那把椅子，再也不会有人坐了。',
        effect: { luck: -5, constitution: -3, intelligence: 1 },
        setFlag: 'married', flagValue: false,
        highlight: true
    },

    // ── 65岁：出国旅游 ──────────────────────────────────────
    {
        id: 'retirement_travel',
        title: '退休后的远行',
        ageMin: 60, ageMax: 72,
        weight: 40, once: false,
        condition: function(s) { return s.conditions.retired && s.attributes.wealth >= 50 && s.attributes.constitution >= 40; },
        text: '退休后，你终于有时间去那些想去很久的地方了。你拎着行李箱，像个年轻人一样踏上了旅途。',
        effect: { luck: 3, intelligence: 2, constitution: 1 }
    },

    // ── 65岁：参加老年大学 ──────────────────────────────────
    {
        id: 'senior_university',
        title: '老年大学',
        ageMin: 62, ageMax: 75,
        weight: 40, once: true,
        text: '你报名参加了社区的老年大学，学书法、太极、摄影，或者别的什么。每天出门，和新认识的老朋友聊天，充实极了。',
        condition: function(s) { return s.conditions.retired; },
        effect: { intelligence: 3, constitution: 3, luck: 2 }
    },

    // ── 68岁：回顾人生 ──────────────────────────────────────
    {
        id: 'life_review',
        title: '往事如烟',
        ageMin: 65, ageMax: 78,
        weight: 60, once: true,
        text: '翻出旧相册，那些泛黄的照片里有年轻时的你，意气风发。你坐在窗边，让往事一幕幕在脑海中回放，发现每一段经历都有它存在的意义。',
        effect: { intelligence: 3, luck: 2 },
        highlight: true
    },

    // ── 70岁：志愿者活动 ──────────────────────────────────
    {
        id: 'volunteer',
        title: '奉献的晚年',
        ageMin: 60, ageMax: 78,
        weight: 30, once: false,
        condition: function(s) { return s.conditions.retired && s.attributes.constitution >= 40; },
        text: '你开始参加志愿者活动，帮助有需要的人。看到受助者感激的眼神，你感到了一种从未有过的充实与平静。',
        effect: { luck: 3, intelligence: 1, constitution: 1 }
    },

    // ── 72岁：遗产传承 ──────────────────────────────────────
    {
        id: 'legacy',
        title: '传承与馈赠',
        ageMin: 65, ageMax: 82,
        weight: 40, once: true,
        condition: function(s) { return s.conditions.has_children && s.attributes.wealth >= 50; },
        text: '你开始认真考虑把一部分财富和人生智慧传给下一代。不仅仅是钱，还有你走过的这一生里悟出的道理。',
        choices: [
            {
                text: '写下一封长信，把心里话都说出来',
                effect: { intelligence: 3, luck: 3 },
                result: '多年后，孩子们说那封信改变了他们的人生。你留下的，不只是财富。',
                highlight: true
            },
            {
                text: '默默安排好身后事',
                effect: { luck: 2 },
                result: '你把一切都安排妥当，给家人省去了很多麻烦，但有些话，始终没有说出口。'
            }
        ]
    },

    // ── 78岁：老年痴呆（罕见） ──────────────────────────────
    {
        id: 'dementia',
        title: '记忆的消逝',
        ageMin: 75, ageMax: 90,
        weight: 10, once: true,
        condition: function(s) { return s.attributes.constitution < 45 && s.attributes.luck < 40; },
        text: '你开始忘东忘西——出门忘带钥匙、叫不出老朋友的名字……医生说，这是老年痴呆的早期症状。',
        effect: { intelligence: -8, constitution: -3 },
        setFlag: 'dementia'
    },

    // ── 80岁：最后的遐想 ──────────────────────────────────
    {
        id: 'final_journey',
        title: '最后的旅途',
        ageMin: 78, ageMax: 90,
        weight: 40, once: true,
        condition: function(s) { return s.attributes.constitution >= 35; },
        text: '你搭上了一列火车，去了一个很久以前就想去却一直没去的地方。火车穿过平原，穿过山川，你靠着窗，看着窗外流动的风景，满足地笑了。',
        effect: { luck: 4, intelligence: 2 }
    },

    // ── 85岁：临终之愿 ──────────────────────────────────────
    {
        id: 'final_wish',
        title: '临终之言',
        ageMin: 82, ageMax: 100,
        weight: 50, once: true,
        text: '你感觉到身体在一点点放慢。家人轮流守在床边。你拉着他们的手，说了一些话，有些是从未说出口的道歉，有些是迟到多年的谢谢。',
        effect: { luck: 5 },
        highlight: true
    },

    // ── 88岁：寿宴 ────────────────────────────────────────
    {
        id: 'birthday_feast',
        title: '寿宴',
        ageMin: 80, ageMax: 95,
        weight: 40, once: true,
        condition: function(s) { return s.conditions.has_children || s.conditions.has_grandchildren; },
        text: '儿孙们为你操办了一场热闹的寿宴。满屋子的笑声，满桌子的菜，你坐在主位上，看着眼前的一切，心里满是感激。',
        effect: { luck: 4, constitution: 2 },
        highlight: true
    }

]; // LATE_EVENTS END

console.log('[events_late.js] 加载完成，共', window.LATE_EVENTS.length, '条事件');
