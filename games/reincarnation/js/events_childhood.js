/* ============================================================
   events_childhood.js - 童年事件（年龄 0-12）
   ============================================================ */

'use strict';

window.CHILDHOOD_EVENTS = [

    // ── 0岁：出生 ────────────────────────────────────────────
    {
        id: 'birth',
        title: '降临人间',
        ageMin: 0, ageMax: 0,
        weight: 100, once: true,
        text: function(s) {
            const country = s.character.country;
            const gender = s.character.gender === 'female' ? '女婴' : '男婴';
            return `一声嘹亮的啼哭，你以${gender}的身份降临${country.name}。\n\n世界在你眼中是全新的，充满了未知与可能。一切，才刚刚开始。`;
        },
        effect: null,
        highlight: true
    },

    // ── 1岁：学会走路 ────────────────────────────────────────
    {
        id: 'first_steps',
        title: '迈出第一步',
        ageMin: 1, ageMax: 1,
        weight: 80, once: true,
        text: '你蹒跚地迈出了人生的第一步，随即扑通一声摔倒在地，但紧接着又咧嘴笑了。',
        effect: { constitution: 1 },
        condition: null
    },

    // ── 2岁：第一句话 ────────────────────────────────────────
    {
        id: 'first_word',
        title: '牙牙学语',
        ageMin: 2, ageMax: 2,
        weight: 80, once: true,
        text: function(s) {
            const word = s.character.gender === 'female' ? '妈妈' : '爸爸';
            return `你含混地喊出了人生中第一个词：「${word}」。父母激动得差点落泪，争相抱起你来。`;
        },
        effect: { intelligence: 1 }
    },

    // ── 3岁：幼儿园 ────────────────────────────────────────
    {
        id: 'kindergarten',
        title: '幼儿园报到',
        ageMin: 3, ageMax: 3,
        weight: 90, once: true,
        text: '第一天上幼儿园，你面对陌生的老师和小朋友，不知该如何是好。',
        choices: [
            {
                text: '鼓起勇气，主动打招呼',
                effect: { appearance: 2, luck: 1 },
                result: '你勇敢地走向小朋友，"你好，我叫{name}！"对方愣了一下，随即笑开了花。你交到了第一个朋友。'
            },
            {
                text: '躲在角落里观察',
                effect: { intelligence: 2 },
                result: '你默默地观察着周围的一切，把这个小小的世界牢牢记在心里。'
            },
            {
                text: '嚎啕大哭，不肯进教室',
                effect: { constitution: -1 },
                result: '你哭得惊天动地，老师使出浑身解数才将你哄住。第一天就留下了"哭包"的称号。'
            }
        ]
    },

    // ── 4岁：父母讲故事 ────────────────────────────────────
    {
        id: 'parent_story',
        title: '睡前故事',
        ageMin: 4, ageMax: 5,
        weight: 60, once: false,
        condition: function(s) { return s.attributes.wealth >= 30; },
        text: '每天晚上，父母都会给你讲睡前故事。你躺在温暖的被窝里，听着精灵、巨龙与英雄的冒险，心中充满了对世界的向往。',
        effect: { intelligence: 2, luck: 1 }
    },

    // ── 4岁：家庭贫困的故事 ────────────────────────────────
    {
        id: 'poor_childhood',
        title: '艰苦童年',
        ageMin: 4, ageMax: 5,
        weight: 50, once: true,
        condition: function(s) { return s.attributes.wealth < 20; },
        text: '家里总是入不敷出，父母为了生计每天奔波。你很小就懂得了生活的不易，常常靠吃剩饭度日。',
        effect: { constitution: -1, luck: -1, intelligence: 1 }
    },

    // ── 5岁：宠物 ────────────────────────────────────────
    {
        id: 'pet',
        title: '宠物小伙伴',
        ageMin: 5, ageMax: 8,
        weight: 40, once: true,
        condition: function(s) { return s.attributes.wealth >= 40 && !s.conditions.has_pet; },
        text: '父母给你带回家一只毛茸茸的小动物，是你一直梦寐以求的宠物！',
        choices: [
            {
                text: '认真照顾它',
                effect: { constitution: 2, luck: 2 },
                result: '你每天喂食、清洁，宠物和你形影不离。你在责任中悄悄成长了。',
                setFlag: 'has_pet'
            },
            {
                text: '新鲜劲儿过了就冷落它',
                effect: { luck: -2 },
                result: '没过多久你便失去了兴趣，宠物整日无精打采。父母默默多承担了照顾它的工作。',
                setFlag: 'has_pet'
            }
        ]
    },

    // ── 6岁：小学入学 ────────────────────────────────────
    {
        id: 'primary_school',
        title: '小学入学',
        ageMin: 6, ageMax: 6,
        weight: 100, once: true,
        text: '背上崭新的书包，你迈入了小学的大门。看着黑板上整整齐齐的汉字，你心中涌起一股莫名的期待。',
        choices: [
            {
                text: '课堂上认真听讲',
                effect: { intelligence: 3 },
                result: '你认真听讲，老师对你赞不绝口，第一次考试就得了高分。',
                setFlag: 'school_started'
            },
            {
                text: '边上课边玩橡皮泥',
                effect: { intelligence: -1, luck: 1 },
                result: '你偷偷玩橡皮泥，捏出了一个小人儿，被同桌悄悄鼓起了掌。',
                setFlag: 'school_started'
            }
        ]
    },

    // ── 7岁：结交好朋友 ────────────────────────────────────
    {
        id: 'first_friend',
        title: '第一个好朋友',
        ageMin: 7, ageMax: 9,
        weight: 70, once: true,
        text: function(s) {
            const friendGender = s.character.gender === 'male' ? '男孩' : '女孩';
            return `班上有个${friendGender}总是笑嘻嘻地，你们很快就成了形影不离的好朋友，每天一起上学放学。`;
        },
        effect: { luck: 2, appearance: 1 }
    },

    // ── 7岁：被欺负 ────────────────────────────────────────
    {
        id: 'bullied_child',
        title: '遭遇霸凌',
        ageMin: 7, ageMax: 11,
        weight: 35, once: true,
        setFlag: 'survived_bully',
        condition: function(s) { return s.attributes.appearance < 50 || s.attributes.luck < 40; },
        text: '班上几个调皮的孩子总是欺负你，抢你的零食，还嘲笑你的外表。',
        choices: [
            {
                text: '鼓起勇气反击',
                effect: { constitution: 3, appearance: -1 },
                result: '你狠狠地反击了一次，虽然鼻子破了相，但欺凌者再也不敢轻易找你麻烦了。'
            },
            {
                text: '告诉老师和家长',
                effect: { intelligence: 2, luck: 1 },
                result: '老师严肃批评了霸凌者，你的父母也来学校谈话。此后风波平息，但心里留下了一根刺。'
            },
            {
                text: '默默忍受',
                effect: { constitution: -2, intelligence: 1 },
                result: '你没有声张，只是默默记在心里。这段经历让你更早地看清了人性的某些阴暗面。'
            }
        ]
    },

    // ── 8岁：数学天赋 ────────────────────────────────────
    {
        id: 'math_talent',
        title: '数学小天才',
        ageMin: 8, ageMax: 11,
        weight: 40, once: true,
        condition: function(s) { return s.attributes.intelligence >= 55; },
        text: '老师发现了你在数学上的天分，推荐你参加全校数学竞赛。你拿到了一本厚厚的竞赛题目。',
        choices: [
            {
                text: '刻苦备战，全力以赴',
                effect: { intelligence: 5 },
                result: '你在竞赛中荣获一等奖，老师和父母都为你自豪。你从此爱上了数字的美妙世界。'
            },
            {
                text: '随便翻翻，能做多少做多少',
                effect: { intelligence: 2 },
                result: '你拿了个三等奖，虽然不算亮眼，但也感受到了挑战自我的快乐。'
            }
        ]
    },

    // ── 9岁：儿时疾病 ────────────────────────────────────
    {
        id: 'childhood_illness',
        title: '病倒了',
        ageMin: 4, ageMax: 10,
        weight: 35, once: false,
        condition: function(s) { return s.attributes.constitution < 60; },
        text: '你发高烧，全身滚烫，在床上躺了好几天。父母轮流守在床边，喂你药、擦汗，眼眶都红了。',
        effect: { constitution: -2, luck: 1 }
    },

    // ── 9岁：钢琴课 ────────────────────────────────────────
    {
        id: 'piano_lessons',
        title: '钢琴课',
        ageMin: 7, ageMax: 11,
        weight: 35, once: true,
        condition: function(s) { return s.attributes.wealth >= 50 && !s.conditions.has_piano; },
        text: '父母给你报了钢琴课。黑白键在你指尖下发出叮叮咚咚的声音，有些刺耳，有些悦耳。',
        choices: [
            {
                text: '认真练习，每天坚持',
                effect: { intelligence: 3, appearance: 2 },
                result: '半年后，你已经能弹奏完整的曲子了。指尖的优雅成了你独特的气质。',
                setFlag: 'has_piano'
            },
            {
                text: '三天打鱼两天晒网',
                effect: { intelligence: 1 },
                result: '练了两年，你依然停留在初级水平，最终还是放弃了。但至少识了乐谱。',
                setFlag: 'has_piano'
            },
            {
                text: '死活不肯练，哭着要退课',
                effect: { luck: -1 },
                result: '父母拗不过你，只好退了课。邻居家的孩子后来考上了音乐学院。',
            }
        ]
    },

    // ── 10岁：体育天赋 ────────────────────────────────────
    {
        id: 'sports_talent',
        title: '体育小将',
        ageMin: 8, ageMax: 12,
        weight: 40, once: true,
        condition: function(s) { return s.attributes.constitution >= 55; },
        text: '体育课上，老师注意到了你非凡的运动潜力，主动问你是否愿意加入校队。',
        choices: [
            {
                text: '加入校队，认真训练',
                effect: { constitution: 5, appearance: 2 },
                result: '你成了校队的核心成员，在区级运动会上为学校赢得了荣誉。',
                setFlag: 'athlete'
            },
            {
                text: '婉言谢绝，专心学习',
                effect: { intelligence: 2 },
                result: '你礼貌地拒绝了，把精力集中到学业上。运动场的喧嚣与你渐行渐远。'
            }
        ]
    },

    // ── 10岁：阅读爱好 ────────────────────────────────────
    {
        id: 'reading_habit',
        title: '书虫诞生',
        ageMin: 8, ageMax: 12,
        weight: 45, once: true,
        text: '你偶然间读到了一本让你废寝忘食的书，从此一发不可收拾，整天泡在图书馆里。',
        condition: function(s) { return s.attributes.intelligence >= 45; },
        effect: { intelligence: 4, luck: 1 }
    },

    // ── 11岁：家庭旅行 ────────────────────────────────────
    {
        id: 'family_trip',
        title: '家庭旅行',
        ageMin: 6, ageMax: 12,
        weight: 40, once: false,
        condition: function(s) { return s.attributes.wealth >= 55; },
        text: function(s) {
            const places = ['北京', '上海迪士尼', '西藏', '云南', '海南', '厦门'];
            const place = randomChoice(places);
            return `暑假，全家一起去了${place}旅行！你第一次见识到了与家乡截然不同的风景和人情。`;
        },
        effect: { luck: 2, intelligence: 1, appearance: 1 }
    },

    // ── 11岁：父母争吵 ────────────────────────────────────
    {
        id: 'parents_argue',
        title: '家庭风波',
        ageMin: 5, ageMax: 12,
        weight: 30, once: false,
        text: '深夜，父母的争吵声透过薄薄的墙传来。你把头埋进被子，眼眶渐渐湿润。',
        effect: { luck: -2, intelligence: 1 }
    },

    // ── 11岁：父母离婚 ────────────────────────────────────
    {
        id: 'parents_divorce',
        title: '家庭破裂',
        ageMin: 5, ageMax: 12,
        weight: 12, once: true,
        condition: function(s) { return s.attributes.luck < 35; },
        text: '父母最终决定离婚。你在两个家之间来回奔走，努力维系着与双方的联系，心里却始终有一块空缺。',
        effect: { luck: -3, intelligence: 2, constitution: -1 },
        setFlag: 'parents_divorced'
    },

    // ── 12岁：绘画天赋 ────────────────────────────────────
    {
        id: 'art_talent',
        title: '画画小天才',
        ageMin: 7, ageMax: 12,
        weight: 30, once: true,
        text: '美术老师发现你的画与众不同，线条中隐藏着不寻常的灵气，建议你参加艺术特长班。',
        choices: [
            {
                text: '报名参加，认真学习',
                effect: { appearance: 3, intelligence: 2, luck: 1 },
                result: '你的绘画技艺突飞猛进，甚至在省级比赛中获了奖，一时成了学校的骄傲。',
                setFlag: 'has_art'
            },
            {
                text: '随便画着玩就行',
                effect: { luck: 1 },
                result: '绘画依然是你的小爱好，无拘无束地涂鸦，有时倒也画出几幅佳作。'
            }
        ]
    },

    // ── 12岁：对电脑的兴趣 ────────────────────────────────
    {
        id: 'computer_interest',
        title: '第一台电脑',
        ageMin: 9, ageMax: 12,
        weight: 35, once: true,
        condition: function(s) { return s.attributes.wealth >= 40; },
        text: '家里买了第一台电脑！你对着那个发光的屏幕，感觉整个新世界向你打开了大门。',
        choices: [
            {
                text: '学习编程，钻研技术',
                effect: { intelligence: 4 },
                result: '你自学了基本的编程知识，在同龄人中显得格外超前。',
                setFlag: 'coding_interest'
            },
            {
                text: '整天打游戏',
                effect: { intelligence: -1, luck: 1 },
                result: '你沉浸在游戏世界里，成绩略有下滑，但也成了同学中的游戏高手。'
            },
            {
                text: '用来查资料、学知识',
                effect: { intelligence: 3, luck: 1 },
                result: '互联网上浩瀚的知识让你如饥似渴，视野一下子开阔了许多。'
            }
        ]
    },

    // ── 12岁：受伤 ────────────────────────────────────────
    {
        id: 'childhood_injury',
        title: '运动受伤',
        ageMin: 6, ageMax: 12,
        weight: 30, once: false,
        text: '在和小朋友玩耍时，你不小心摔倒，膝盖擦破了皮，哭了好一阵子。',
        effect: { constitution: -1, luck: -1 }
    },

    // ── 12岁：自然灾害（罕见） ────────────────────────────
    {
        id: 'natural_disaster',
        title: '自然灾害',
        ageMin: 3, ageMax: 12,
        weight: 5, once: true,
        condition: function(s) { return s.attributes.luck < 30; },
        text: '一场地震袭来，房屋剧烈摇晃。所幸全家人没有受伤，但家里的很多东西都损毁了。这段经历让你很久之后都还会做噩梦。',
        effect: { constitution: -2, luck: -3, intelligence: 2 }
    },

    // ── 12岁：看到父母辛苦 ────────────────────────────────
    {
        id: 'parents_hard_work',
        title: '父母的辛苦',
        ageMin: 8, ageMax: 12,
        weight: 50, once: true,
        text: '有一天你很晚才睡，看到父母还在昏暗的台灯下忙碌。那一刻，你第一次真正感受到了他们的辛苦，心里涌起一股酸涩的感动。',
        effect: { intelligence: 2, luck: 1 }
    },

    // ── 12岁：与年长者的教导 ────────────────────────────
    {
        id: 'wise_elder',
        title: '老者的教导',
        ageMin: 7, ageMax: 12,
        weight: 25, once: true,
        text: '邻居的老爷爷常常和你讲故事，讲他年轻时走南闯北的经历，讲人生的酸甜苦辣。你听得入迷，很多话都记在了心里。',
        effect: { intelligence: 3, luck: 2 }
    },

    // ── 10岁：努力得到认可 ────────────────────────────────
    {
        id: 'teacher_praise',
        title: '老师的表扬',
        ageMin: 7, ageMax: 12,
        weight: 55, once: false,
        text: '这次考试你发挥出色，老师当着全班同学的面表扬了你，并把你的卷子贴在了光荣栏上。你感到无比骄傲。',
        condition: function(s) { return s.attributes.intelligence >= 50; },
        effect: { intelligence: 2, appearance: 1 }
    },

    // ── 9岁：考试失败 ────────────────────────────────────
    {
        id: 'exam_failure',
        title: '考试失利',
        ageMin: 7, ageMax: 12,
        weight: 40, once: false,
        condition: function(s) { return s.attributes.intelligence < 50; },
        text: '期末考试成绩出来了，你考得一塌糊涂。试卷被父母拿回家签字，他们沉默地看着，什么也没说，这让你更加难受。',
        choices: [
            {
                text: '下定决心，好好学习',
                effect: { intelligence: 3 },
                result: '这次失败让你痛定思痛，此后你更加刻苦，成绩慢慢有了起色。'
            },
            {
                text: '破罐子破摔',
                effect: { intelligence: -2, luck: -1 },
                result: '你开始逃避，把试卷藏起来，成绩一落千丈。'
            }
        ]
    }

]; // CHILDHOOD_EVENTS END

console.log('[events_childhood.js] 加载完成，共', window.CHILDHOOD_EVENTS.length, '条事件');
