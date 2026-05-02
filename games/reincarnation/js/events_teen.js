/* ============================================================
   events_teen.js - 青少年事件（年龄 13-18）
   ============================================================ */

'use strict';

window.TEEN_EVENTS = [

    // ── 13岁：初中开学 ──────────────────────────────────────
    {
        id: 'middle_school',
        title: '踏入初中',
        ageMin: 13, ageMax: 13,
        weight: 100, once: true,
        text: '你升入了初中，新的学校、新的同学，一切都陌生而充满期待。你在人群中悄悄打量着周围，想着接下来三年会发生些什么。',
        effect: { intelligence: 1, luck: 1 }
    },

    // ── 13岁：青春期 ──────────────────────────────────────
    {
        id: 'puberty',
        title: '青春的困惑',
        ageMin: 13, ageMax: 14,
        weight: 80, once: true,
        text: '身体开始悄悄发生变化，情绪也变得莫名其妙。你会无缘无故地烦躁，也会因为一件小事而红了眼眶，青春期来了。',
        choices: [
            {
                text: '坦然接受，顺其自然',
                effect: { constitution: 2, intelligence: 1 },
                result: '你以平和的心态度过了这段"人生节点"，反而比同龄人更快地成长了。'
            },
            {
                text: '很困惑，把自己关在房间里',
                effect: { intelligence: 2, luck: -1 },
                result: '你在独处中写下大量日记，反复审视自己，慢慢摸索出了内心的秩序。'
            }
        ]
    },

    // ── 14岁：初恋 ──────────────────────────────────────────
    {
        id: 'first_love',
        title: '初恋萌芽',
        ageMin: 14, ageMax: 16,
        weight: 55, once: true,
        condition: function(s) { return s.attributes.appearance >= 40 || s.attributes.luck >= 50; },
        text: function(s) {
            const target = s.character.gender === 'male' ? '班上一个女生' : '班上一个男生';
            return `${target}总是在你不经意时出现，心跳开始变得不规律。你反复在心里默念着对方的名字，这大概就是传说中的……喜欢吧。`;
        },
        choices: [
            {
                text: '鼓起勇气，写信表白',
                condition: null,
                effect: { luck: 3, appearance: 2 },
                result: '对方红着脸说：「我也是……」。那一刻，你感觉整个世界都亮了。',
                setFlag: 'first_love_success'
            },
            {
                text: '把感情藏在心里，默默守护',
                effect: { intelligence: 2 },
                result: '你把这份心意珍藏起来，写了满满一本日记。这段暗恋，成了青春最柔软的一页。'
            },
            {
                text: '和朋友说了，朋友帮忙撮合',
                condition: function(s) { return s.attributes.luck >= 50; },
                effect: { luck: 2, appearance: 1 },
                result: '朋友神通广大，不知说了什么，对方竟然主动来找你说话了！'
            }
        ]
    },

    // ── 14岁：失恋 ──────────────────────────────────────────
    {
        id: 'heartbreak_teen',
        title: '初恋破碎',
        ageMin: 15, ageMax: 17,
        weight: 45, once: true,
        condition: function(s) { return s.conditions.first_love_success && !s.conditions.in_love; },
        text: '那个让你心动过的人，最终还是和你渐渐疏远了。你翻出当初写的情书，看着那些笨拙的文字，说不清是哭还是笑。',
        effect: { luck: -2, intelligence: 2 }
    },

    // ── 14岁：学习选择 ────────────────────────────────────
    {
        id: 'study_vs_play',
        title: '学习的岔路口',
        ageMin: 14, ageMax: 16,
        weight: 70, once: true,
        text: '初中的课业越来越繁重，班上的同学分成了"拼命学习派"和"享受青春派"，你夹在中间，有些迷茫。',
        choices: [
            {
                text: '专注学习，为高考打好基础',
                effect: { intelligence: 5 },
                result: '你把大部分时间都献给了课本，成绩稳步上升，父母欣慰地笑了。'
            },
            {
                text: '学习玩乐，两头兼顾',
                effect: { intelligence: 2, luck: 2, appearance: 1 },
                result: '你找到了属于自己的节奏，学习和生活都过得有滋有味。'
            },
            {
                text: '青春最重要，先玩够了再说',
                effect: { intelligence: -2, luck: 3, constitution: 1 },
                result: '你尽情挥洒青春，成绩有些下滑，但留下了很多快乐的回忆。'
            }
        ]
    },

    // ── 15岁：打架 ────────────────────────────────────────
    {
        id: 'school_fight',
        title: '校园冲突',
        ageMin: 13, ageMax: 17,
        weight: 30, once: false,
        text: '放学路上，你和另一个同学发生了口角，眼看就要动手。',
        choices: [
            {
                text: '冷静下来，讲道理',
                effect: { intelligence: 2, luck: 1 },
                result: '你压住怒气，理性沟通。对方反而有些意外，最终化解了冲突。'
            },
            {
                text: '打！反正也不吃亏！',
                effect: { constitution: 2, luck: -2 },
                result: '你打赢了，但被老师叫去谈话，还给父母打了电话。事后你沉默了好几天。'
            },
            {
                text: '绕道走，不惹麻烦',
                effect: { luck: 2 },
                result: '你选择了退让，悄悄溜走了。以后遇到对方，双方默契地互相无视。'
            }
        ]
    },

    // ── 15岁：部分打工 ────────────────────────────────────
    {
        id: 'teen_part_time',
        title: '兼职打工',
        ageMin: 15, ageMax: 18,
        weight: 40, once: true,
        text: '暑假里，你在一家便利店找到了第一份兼职。站在收银台后面，面对形形色色的顾客，你第一次体会到了赚钱的滋味。',
        effect: { intelligence: 2, wealth: 2, constitution: 1 }
    },

    // ── 15岁：叛逆期 ────────────────────────────────────
    {
        id: 'rebel_phase',
        title: '叛逆风暴',
        ageMin: 14, ageMax: 17,
        weight: 50, once: true,
        text: '父母的说教让你烦透了，你开始和他们顶嘴，把自己关在房间里，非要按照自己的想法来。',
        choices: [
            {
                text: '顶到底，我有我的想法',
                effect: { luck: 1, intelligence: 1, constitution: -1 },
                result: '家里的气氛降到了冰点。后来随着时间流逝，双方慢慢和解，但那段岁月都留下了伤痕。'
            },
            {
                text: '冷静下来，坐下来好好谈',
                effect: { intelligence: 3, luck: 2 },
                result: '你主动找父母平心静气地谈了一次，说出了自己的想法。这次对话让彼此更加理解了。'
            }
        ]
    },

    // ── 16岁：学生会 ────────────────────────────────────
    {
        id: 'student_council',
        title: '竞选学生会',
        ageMin: 14, ageMax: 16,
        weight: 35, once: true,
        condition: function(s) { return s.attributes.appearance >= 50 || s.attributes.intelligence >= 55; },
        text: '学校举行学生会竞选，你的好友鼓励你去参加，说你完全有资格当选。',
        choices: [
            {
                text: '报名参选，认真准备演讲',
                effect: { appearance: 3, intelligence: 2, luck: 2 },
                result: '你的演讲赢得了热烈掌声，成功当选！学生会的工作让你的组织能力大幅提升。',
                setFlag: 'student_council'
            },
            {
                text: '推辞掉，不想占用时间',
                effect: { intelligence: 1 },
                result: '你婉拒了这次机会，把时间留给了学业。旁人有些可惜，你却觉得无妨。'
            }
        ]
    },

    // ── 16岁：游戏沉迷 ────────────────────────────────────
    {
        id: 'gaming_addiction',
        title: '游戏的深渊',
        ageMin: 13, ageMax: 17,
        weight: 35, once: true,
        condition: function(s) { return s.attributes.intelligence < 60 && s.attributes.luck < 50; },
        text: '你迷上了一款网络游戏，每天熬夜到深夜，眼睛布满血丝。成绩开始直线下滑，父母急得团团转。',
        choices: [
            {
                text: '强迫自己戒掉，回归学习',
                effect: { intelligence: 3, constitution: -1 },
                result: '你痛苦地删掉了游戏，用了很长时间才从戒断反应中缓过来。但你的成绩慢慢回来了。'
            },
            {
                text: '继续，反正玩好了也能当职业选手',
                effect: { intelligence: -3, luck: 2 },
                result: '你的排名越来越高，但学业几乎被你抛在了脑后。'
            },
            {
                text: '适度控制，每天只玩两小时',
                effect: { intelligence: 1, luck: 1 },
                result: '你订了规矩，努力自律，学业和游戏总算维持了脆弱的平衡。'
            }
        ]
    },

    // ── 16岁：发现隐藏天赋 ──────────────────────────────
    {
        id: 'hidden_talent',
        title: '意外的天赋',
        ageMin: 14, ageMax: 17,
        weight: 30, once: true,
        text: '在一次偶然的机会中，你发现了自己在某个领域出乎意料的才能——也许是写作、辩论、或是某项运动。这个发现让你既兴奋又茫然。',
        effect: { intelligence: 3, appearance: 2, luck: 2 }
    },

    // ── 17岁：帮助同学 ────────────────────────────────────
    {
        id: 'help_classmate',
        title: '雪中送炭',
        ageMin: 13, ageMax: 17,
        weight: 50, once: false,
        text: '你的同学最近状态很差，眼神空洞、独来独往。你主动走过去问了一句"你还好吗"，对方愣了很久，然后红了眼眶。',
        choices: [
            {
                text: '耐心陪伴，认真倾听',
                effect: { luck: 3, appearance: 2 },
                result: '你们彻夜长谈，对方说你是他/她黑暗中的一束光。这段友谊从此坚不可摧。'
            },
            {
                text: '简单安慰两句就走',
                effect: { luck: 1 },
                result: '你轻描淡写地说了几句，对方勉强点了点头。你不确定有没有帮到什么。'
            }
        ]
    },

    // ── 17岁：交到"坏朋友" ──────────────────────────────
    {
        id: 'bad_influence',
        title: '危险的朋友',
        ageMin: 15, ageMax: 18,
        weight: 25, once: true,
        condition: function(s) { return s.attributes.luck < 45; },
        text: '你结识了一群"社会人"，他们大方、讲义气，但总喜欢做一些出格的事。',
        choices: [
            {
                text: '和他们玩，但不做违法的事',
                effect: { luck: 1, constitution: 1, intelligence: -1 },
                result: '你游走在边缘，偶尔出格，总算没有越过底线。这段经历成了你看清社会的独家"教材"。'
            },
            {
                text: '及时脱身，保持距离',
                effect: { intelligence: 2, luck: 2 },
                result: '你理智地选择了远离，这个决定很可能在未来某个关键时刻救了你一命。'
            }
        ]
    },

    // ── 17岁：高考冲刺 ──────────────────────────────────
    {
        id: 'gaokao_prep',
        title: '高考倒计时',
        ageMin: 17, ageMax: 17,
        weight: 90, once: true,
        text: '倒计时牌上的数字越来越小，教室里的气氛凝重而紧张。你和同学们拼命刷题，每天睡不够五小时，眼睛里布满了血丝。',
        choices: [
            {
                text: '全力冲刺，争分夺秒',
                effect: { intelligence: 5, constitution: -2 },
                result: '你透支了健康，却换来了成绩的飞跃。身边的同学说，你简直是台学习机器。'
            },
            {
                text: '保持节奏，劳逸结合',
                effect: { intelligence: 3, constitution: 1 },
                result: '你坚持每天保证充足睡眠，状态始终在线，最终以稳健的发挥迎战高考。'
            },
            {
                text: '太累了，随便考考算了',
                effect: { intelligence: -1, constitution: 2, luck: 1 },
                result: '你不想给自己太大压力，随遇而安。也许不完美，但至少没把身体搞垮。'
            }
        ]
    },

    // ── 18岁：高考结果 ──────────────────────────────────
    {
        id: 'gaokao_result',
        title: '高考成绩揭晓',
        ageMin: 18, ageMax: 18,
        weight: 100, once: true,
        text: function(s) {
            const iq = s.attributes.intelligence;
            if (iq >= 75) return '成绩出来了——你考出了令所有人震惊的高分，手机被电话打爆，父母激动得说不出话来。';
            if (iq >= 55) return '成绩出来了，你发挥正常，考入了一所不错的大学。父母松了一口气，欣慰地笑了。';
            if (iq >= 35) return '成绩出来了，略低于预期，只能选择一所普通院校。你有些失落，但也接受了现实。';
            return '成绩出来了——只能上专科，或者复读。你把手机扔在桌上，独自坐了很久。';
        },
        effect: null,
        condition: null,
        resolve: function(s) {
            const iq = s.attributes.intelligence;
            if (iq >= 75) {
                s.conditions.education = 'top_college';
                return { intelligence: 2, luck: 3 };
            } else if (iq >= 55) {
                s.conditions.education = 'college';
                return { luck: 1 };
            } else if (iq >= 35) {
                s.conditions.education = 'junior_college';
                return { luck: -1 };
            } else {
                s.conditions.education = 'highschool';
                return { luck: -2 };
            }
        }
    },

    // ── 17岁：艺术特长获奖 ──────────────────────────────
    {
        id: 'art_award',
        title: '艺术荣耀',
        ageMin: 14, ageMax: 18,
        weight: 30, once: true,
        condition: function(s) { return s.conditions.has_art || s.attributes.appearance >= 60; },
        text: '你参加了全市青少年艺术大赛，凭借一幅(首/件)充满个性的作品，一路过关斩将，最终站上了领奖台。',
        effect: { appearance: 4, intelligence: 2, luck: 3 }
    },

    // ── 17岁：运动会 ──────────────────────────────────────
    {
        id: 'sports_meet',
        title: '校运会',
        ageMin: 13, ageMax: 17,
        weight: 55, once: false,
        text: '一年一度的校运动会，操场上热闹非凡。你也报名参加了几个项目，加油声震天响。',
        condition: function(s) { return s.attributes.constitution >= 40; },
        choices: [
            {
                text: '全力以赴，争取名次',
                effect: { constitution: 3, appearance: 2 },
                result: '你拼尽全力，赢得了名次，被同学们高高抬起来绕场一周。'
            },
            {
                text: '享受过程就好，不在乎输赢',
                effect: { constitution: 1, luck: 1 },
                result: '你笑着跑完了全程，为班级贡献了应有的一份力。运动会成了难忘的回忆。'
            }
        ]
    },

    // ── 18岁：出国留学机会 ──────────────────────────────
    {
        id: 'study_abroad_chance',
        title: '出国留学',
        ageMin: 17, ageMax: 18,
        weight: 25, once: true,
        condition: function(s) { return s.attributes.wealth >= 65 && s.attributes.intelligence >= 55; },
        text: '家里提出了一个出乎意料的安排——送你出国留学。这意味着机遇，也意味着离开熟悉的一切。',
        choices: [
            {
                text: '欣然接受，出国见世面',
                effect: { intelligence: 5, wealth: 3, luck: 3 },
                result: '你踏上异国的土地，用不习惯的语言开始了全新的生活，视野和心胸都扩大了不止一倍。',
                setFlag: 'studied_abroad'
            },
            {
                text: '婉拒，不想离家太远',
                effect: { luck: 1 },
                result: '你选择留在家人身边，在熟悉的环境中走自己的路。'
            }
        ]
    },

    // ── 18岁：第一次抽烟 ──────────────────────────────────
    {
        id: 'first_cigarette',
        title: '第一支烟',
        ageMin: 15, ageMax: 18,
        weight: 20, once: true,
        condition: function(s) { return s.attributes.luck < 50; },
        text: '朋友递过来一支烟，说："抽一口试试？"你犹豫着。',
        choices: [
            {
                text: '拒绝，这东西不健康',
                effect: { constitution: 1, luck: 1 },
                result: '你摆了摆手，说了个"不"。事后证明，这是个正确的决定。'
            },
            {
                text: '抽一口，反正就一次',
                effect: { constitution: -2 },
                result: '你呛得咳嗽连连，朋友却哈哈大笑。从此便成了偶尔抽烟的人。',
                setFlag: 'smoker'
            }
        ]
    },

    // ── 18岁：告别高中 ──────────────────────────────────
    {
        id: 'graduation_day',
        title: '高中毕业',
        ageMin: 18, ageMax: 18,
        weight: 85, once: true,
        text: '毕业典礼上，同学们在彼此的衣服上签名，笑着，哭着，拍了一张又一张合照。你知道，这段岁月不会再来了。',
        effect: { luck: 2, intelligence: 1 },
        setFlag: 'graduated_high_school'
    }

]; // TEEN_EVENTS END

console.log('[events_teen.js] 加载完成，共', window.TEEN_EVENTS.length, '条事件');
