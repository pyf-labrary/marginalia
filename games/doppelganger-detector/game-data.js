/**
 * 分身检测员 (Doppelgänger Detector) — Game Data
 * Pure data constants, no logic. 1955-era Chinese setting.
 */
window.GAME_DATA = {

  // ── Names ──────────────────────────────────────────────────────────────

  NAMES_MALE: [
    '伟','强','军','明','建国',
    '国庆','志强','建华','永强','德明',
    '文斌','学良','振华','大力','宝山',
    '长江','铁柱','根生','福来','有才',
  ],

  NAMES_FEMALE: [
    '秀英','桂兰','玉珍','淑芬','凤英',
    '秀珍','翠花','桂芳','春梅','兰英',
    '淑华','玉兰','秀芳','彩霞','红梅',
    '巧云','月娥','素珍','金凤','美华',
  ],

  LAST_NAMES: [
    '王','李','张','刘','陈',
    '杨','赵','黄','周','吴',
    '徐','孙','胡','朱','高',
    '林','何','郭','马','罗',
    '梁','宋','郑','谢','韩',
    '唐','冯','于','董','萧',
  ],

  // ── Occupations ────────────────────────────────────────────────────────

  OCCUPATIONS: [
    { name: '教师', workplace: '人民小学' },
    { name: '工人', workplace: '第一钢铁厂' },
    { name: '医生', workplace: '人民医院' },
    { name: '护士', workplace: '人民医院' },
    { name: '邮递员', workplace: '中央邮局' },
    { name: '会计', workplace: '纺织厂' },
    { name: '司机', workplace: '公共汽车公司' },
    { name: '厨师', workplace: '国营饭店' },
    { name: '售货员', workplace: '百货商店' },
    { name: '图书管理员', workplace: '人民图书馆' },
    { name: '电工', workplace: '发电厂' },
    { name: '记者', workplace: '人民日报社' },
    { name: '铁路工人', workplace: '火车站' },
    { name: '裁缝', workplace: '服装合作社' },
    { name: '木匠', workplace: '家具厂' },
  ],

  // ── Apartments (20 unique residents) ───────────────────────────────────

  APARTMENTS: [
    { id: '1-101', floor: 1, room: 101, residentName: '张伟',   residentGender: 'male',   residentOccupation: '工人' },
    { id: '1-102', floor: 1, room: 102, residentName: '李秀英', residentGender: 'female', residentOccupation: '教师' },
    { id: '1-103', floor: 1, room: 103, residentName: '王强',   residentGender: 'male',   residentOccupation: '司机' },
    { id: '1-104', floor: 1, room: 104, residentName: '刘桂兰', residentGender: 'female', residentOccupation: '护士' },
    { id: '2-201', floor: 2, room: 201, residentName: '陈建国', residentGender: 'male',   residentOccupation: '医生' },
    { id: '2-202', floor: 2, room: 202, residentName: '杨玉珍', residentGender: 'female', residentOccupation: '售货员' },
    { id: '2-203', floor: 2, room: 203, residentName: '赵志强', residentGender: 'male',   residentOccupation: '电工' },
    { id: '2-204', floor: 2, room: 204, residentName: '黄淑芬', residentGender: 'female', residentOccupation: '会计' },
    { id: '3-301', floor: 3, room: 301, residentName: '周国庆', residentGender: 'male',   residentOccupation: '邮递员' },
    { id: '3-302', floor: 3, room: 302, residentName: '吴凤英', residentGender: 'female', residentOccupation: '裁缝' },
    { id: '3-303', floor: 3, room: 303, residentName: '徐建华', residentGender: 'male',   residentOccupation: '记者' },
    { id: '3-304', floor: 3, room: 304, residentName: '孙翠花', residentGender: 'female', residentOccupation: '厨师' },
    { id: '4-401', floor: 4, room: 401, residentName: '胡永强', residentGender: 'male',   residentOccupation: '铁路工人' },
    { id: '4-402', floor: 4, room: 402, residentName: '朱春梅', residentGender: 'female', residentOccupation: '图书管理员' },
    { id: '4-403', floor: 4, room: 403, residentName: '高德明', residentGender: 'male',   residentOccupation: '木匠' },
    { id: '4-404', floor: 4, room: 404, residentName: '林兰英', residentGender: 'female', residentOccupation: '教师' },
    { id: '5-501', floor: 5, room: 501, residentName: '何文斌', residentGender: 'male',   residentOccupation: '会计' },
    { id: '5-502', floor: 5, room: 502, residentName: '郭淑华', residentGender: 'female', residentOccupation: '护士' },
    { id: '5-503', floor: 5, room: 503, residentName: '马振华', residentGender: 'male',   residentOccupation: '工人' },
    { id: '5-504', floor: 5, room: 504, residentName: '罗彩霞', residentGender: 'female', residentOccupation: '售货员' },
  ],

  // ── Appearance Attributes ──────────────────────────────────────────────

  HAIR_COLORS: ['黑色', '棕色', '灰白', '白色', '深棕'],
  EYE_COLORS:  ['黑色', '棕色', '深棕', '灰色'],
  HEIGHTS:     ['矮', '中等', '高'],
  BUILDS:      ['瘦', '中等', '胖'],
  FEATURES:    ['戴眼镜', '有胡子', '有痣', '有疤痕', '戴帽子', '无明显特征'],

  // ── Visit Reasons ──────────────────────────────────────────────────────

  VISIT_REASONS: [
    { reason: '探亲',     needsDoc: 'visitor_pass' },
    { reason: '拜访朋友', needsDoc: 'visitor_pass' },
    { reason: '送信',     needsDoc: 'work_permit' },
    { reason: '修理水管', needsDoc: 'work_permit' },
    { reason: '送货',     needsDoc: 'delivery_slip' },
    { reason: '看望病人', needsDoc: 'visitor_pass' },
    { reason: '开会',     needsDoc: 'meeting_notice' },
    { reason: '检查电路', needsDoc: 'work_permit' },
  ],

  // ── Flaw Types ─────────────────────────────────────────────────────────

  FLAW_TYPES: {
    NAME_WRONG:          { id: 'name_wrong',          desc: '姓名与证件不符',   field: 'name' },
    PHOTO_WRONG:         { id: 'photo_wrong',         desc: '照片与本人不符',   field: 'photo' },
    APT_WRONG:           { id: 'apt_wrong',           desc: '公寓号错误',       field: 'apartment' },
    DOC_EXPIRED:         { id: 'doc_expired',         desc: '证件已过期',       field: 'expiry' },
    STAMP_MISSING:       { id: 'stamp_missing',       desc: '缺少公章',         field: 'stamp' },
    HEIGHT_WRONG:        { id: 'height_wrong',        desc: '身高与证件不符',   field: 'height' },
    BEHAVIOR_NERVOUS:    { id: 'behavior_nervous',    desc: '行为异常紧张',     field: 'behavior' },
    STORY_INCONSISTENT:  { id: 'story_inconsistent',  desc: '说辞前后矛盾',     field: 'story' },
  },

  // ── Greetings ──────────────────────────────────────────────────────────

  GREETINGS: {
    normal: [
      '你好，我来拜访朋友。',
      '下午好，我是这里的住户。',
      '同志你好，我来找人。',
      '你好，我来看望亲戚。',
      '同志，麻烦你了，我来办点事。',
      '你好你好，老熟人了。',
      '下午好，我来送东西。',
      '同志好，我约了人见面。',
      '你好，我来这里开会的。',
      '同志辛苦了，我来拜访住户。',
    ],
    nervous: [
      '呃...你好...我...我来找人。',
      '嗨...那个...我该进去了吧？',
      '你...你好，我...有事。',
      '那个...同志...我来...来看朋友。',
      '啊，你好...我...我是来办事的。',
      '嗯...就是...我找个人。',
      '你好...我...证件...在这里...应该在这里。',
      '同...同志好...我...我来了。',
    ],
    confident: [
      '你好。我的证件都在这里，请查看。',
      '又是你啊，我每周都来。',
      '同志好，老规矩，证件给你。',
      '你好，我赶时间，证件在这儿。',
      '下午好。我是来办公事的，这是介绍信。',
      '同志，我来过很多次了，你应该认识我。',
      '你好，一切手续都齐全，请过目。',
      '又见面了同志，今天人多吗？',
    ],
  },

  // ── Questions ──────────────────────────────────────────────────────────

  QUESTIONS: [
    { id: 'show_docs',       text: '请出示您的证件',           icon: '📋' },
    { id: 'who_visiting',    text: '您要拜访谁？',             icon: '👤' },
    { id: 'which_apt',       text: '您住在/要去哪个公寓？',     icon: '🏠' },
    { id: 'occupation',      text: '您的职业是什么？',          icon: '💼' },
    { id: 'purpose',         text: '您今天来这里做什么？',       icon: '❓' },
    { id: 'describe_person', text: '请描述一下您要拜访的人',     icon: '🔍' },
    { id: 'last_visit',      text: '您上次来是什么时候？',       icon: '📅' },
  ],

  // ── Response Templates ─────────────────────────────────────────────────

  RESPONSES: {
    who_visiting: {
      normal: [
        '我来找{residentName}，{apt}的住户。',
        '找{residentName}，我们是老朋友了。',
        '{residentName}，我和他约好了今天见面。',
        '找{apt}的{residentName}同志。',
        '我找{residentName}，有点事情要商量。',
      ],
      doppelganger: [
        '找...那个...{wrongName}。',
        '找{residentName}...不对，是{wrongName}。',
        '姓什么来着...{wrongName}...对，就是这个人。',
        '我找...呃...那个住在楼上的...{wrongName}。',
        '{wrongName}...还是{residentName}？我记混了。',
      ],
    },
    which_apt: {
      normal: [
        '{apt}，{floor}楼。',
        '公寓{apt}。',
        '{floor}楼{room}号，{apt}。',
        '就在{floor}楼，{apt}。',
        '{apt}，上次来过，记得很清楚。',
      ],
      doppelganger: [
        '{wrongApt}...等等，是{apt}。',
        '大概是...{wrongApt}吧。',
        '几楼来着...{wrongApt}...不对不对...{apt}。',
        '我记得是{wrongApt}...应该没错吧？',
        '楼上...还是楼下...{wrongApt}那个。',
      ],
    },
    occupation: {
      normal: [
        '我是{occupation}。',
        '我在{workplace}工作，是{occupation}。',
        '我的职业是{occupation}，在{workplace}。',
        '{occupation}，干了好些年了。',
        '在{workplace}当{occupation}。',
      ],
      doppelganger: [
        '我是...呃...{wrongOccupation}。',
        '工作？我...做很多事。',
        '{wrongOccupation}...不，我是说...各种工作都做。',
        '我在...那个地方...上班。',
        '这个...我是{wrongOccupation}...对，没错。',
      ],
    },
    purpose: {
      normal: [
        '我来{reason}。',
        '今天来{reason}，很快就走。',
        '{reason}，约好了的。',
        '来{reason}，顺便带了点东西。',
        '就是来{reason}，老规矩了。',
      ],
      doppelganger: [
        '就是...来看看。',
        '我有事...具体什么事我不方便说。',
        '来...办事...对，办事。',
        '你问这么多干什么？我就是来...来...',
        '有人叫我来的...谁叫的我忘了。',
      ],
    },
    describe_person: {
      normal: [
        '{residentName}，{residentDesc}。',
        '就是{residentName}啊，{residentOccupation}。',
        '{residentName}，在{workplace}工作的那位。',
        '你说{residentName}啊，我们认识好多年了，{residentDesc}。',
        '{residentName}，{residentOccupation}，住{apt}的。',
      ],
      doppelganger: [
        '就是...那个人...你知道的。',
        '高高的...或者矮矮的...我记不太清了。',
        '那个...长得很普通的...就是那个人。',
        '我见过的...但是具体长什么样...一时想不起来。',
        '就是住这儿的那个...你肯定认识。',
      ],
    },
    last_visit: {
      normal: [
        '上周来过。',
        '大概三天前。',
        '经常来，每周至少一次。',
        '前天刚来过，你不记得了？',
        '上个月来过两次。',
      ],
      doppelganger: [
        '很久以前了...',
        '我...这是第一次来。不对，我来过很多次。',
        '上次？呃...去年？还是前年？',
        '我记不清了...反正来过。',
        '最近...或者很久以前...差不多吧。',
      ],
    },
  },

  // ── Phone Call Results ─────────────────────────────────────────────────

  PHONE_RESULTS: {
    confirm: [
      '是的，我在等{visitorName}来。',
      '对，让{visitorName}上来吧。',
      '没错，{visitorName}是我朋友，让他进来。',
      '对对对，我约了{visitorName}今天来。',
    ],
    deny: [
      '我不认识这个人。',
      '没有人要来找我啊。',
      '你说谁？我没约人。',
      '搞错了吧，我今天没有客人。',
      '从来没听说过这个名字。',
    ],
    no_answer: [
      '（无人接听...）',
      '（电话响了很久没人接...）',
      '（嘟——嘟——嘟——无人应答。）',
      '（电话占线中...）',
    ],
  },

  // ── Levels ─────────────────────────────────────────────────────────────

  LEVELS: [
    {
      id: 1,
      day: 1,
      title: '第一天',
      visitors: 4,
      timeLimit: 180,
      doppelgangerChance: 0.25,
      flawCount: 3,
      requiredDocs: ['id_card'],
      rules: ['检查身份证'],
      intro: '欢迎来到分身检测部门。今天是你的第一天，任务很简单：检查每位来访者的身份证，注意姓名和照片是否匹配。祝你好运，同志。',
    },
    {
      id: 2,
      day: 2,
      title: '第二天',
      visitors: 5,
      timeLimit: 180,
      doppelgangerChance: 0.3,
      flawCount: 2,
      requiredDocs: ['id_card'],
      rules: ['检查身份证', '核对公寓号'],
      intro: '干得不错，同志。今天开始你还需要核对来访者声称的公寓号是否与登记信息一致。分身们开始变得狡猾了。',
    },
    {
      id: 3,
      day: 3,
      title: '第三天',
      visitors: 5,
      timeLimit: 160,
      doppelgangerChance: 0.35,
      flawCount: 2,
      requiredDocs: ['id_card', 'visitor_pass'],
      rules: ['检查身份证', '访客需出示访客通行证', '核对公寓号'],
      intro: '新规定：所有访客必须持有访客通行证。注意检查证件是否齐全。有些分身会试图蒙混过关。',
    },
    {
      id: 4,
      day: 4,
      title: '第四天',
      visitors: 6,
      timeLimit: 160,
      doppelgangerChance: 0.35,
      flawCount: 2,
      requiredDocs: ['id_card', 'visitor_pass'],
      rules: ['检查身份证', '访客需出示访客通行证', '注意证件有效期'],
      intro: '上级通知：近期发现伪造过期证件的情况。从今天起，请务必检查所有证件的有效期。过期证件一律不予放行。',
    },
    {
      id: 5,
      day: 5,
      title: '第五天',
      visitors: 6,
      timeLimit: 150,
      doppelgangerChance: 0.4,
      flawCount: 2,
      requiredDocs: ['id_card', 'visitor_pass', 'work_permit'],
      rules: ['检查身份证', '访客需出示访客通行证', '维修人员需出示工作证', '注意证件有效期'],
      intro: '今天会有维修工人来访。他们必须持有单位开具的工作证明。请仔细核对工作证上的公章是否齐全。',
    },
    {
      id: 6,
      day: 6,
      title: '第六天',
      visitors: 7,
      timeLimit: 150,
      doppelgangerChance: 0.4,
      flawCount: 2,
      requiredDocs: ['id_card', 'visitor_pass', 'work_permit'],
      rules: ['检查身份证', '访客需出示访客通行证', '维修人员需出示工作证', '注意证件有效期', '核对身高体貌'],
      intro: '情报显示分身的伪装技术在提升。从今天起，请注意比对来访者的身高体貌与证件上的描述是否一致。细节决定成败。',
    },
    {
      id: 7,
      day: 7,
      title: '第七天',
      visitors: 7,
      timeLimit: 140,
      doppelgangerChance: 0.45,
      flawCount: 1,
      requiredDocs: ['id_card', 'visitor_pass', 'work_permit', 'delivery_slip'],
      rules: ['检查身份证', '所有证件类型均需检查', '注意证件有效期', '核对身高体貌', '注意行为举止'],
      intro: '分身的数量在增加，而且它们越来越善于伪装。今天起请特别注意来访者的行为举止——过度紧张或说辞矛盾都是可疑迹象。',
    },
    {
      id: 8,
      day: 8,
      title: '第八天',
      visitors: 8,
      timeLimit: 140,
      doppelgangerChance: 0.45,
      flawCount: 1,
      requiredDocs: ['id_card', 'visitor_pass', 'work_permit', 'delivery_slip', 'meeting_notice'],
      rules: ['检查所有证件', '注意证件有效期和公章', '核对身高体貌', '注意行为举止', '可致电住户核实'],
      intro: '你现在可以使用电话联系住户来核实来访者的身份。善用这个工具——但要注意，有时候住户不在家，电话可能无人接听。',
    },
    {
      id: 9,
      day: 9,
      title: '第九天',
      visitors: 9,
      timeLimit: 120,
      doppelgangerChance: 0.5,
      flawCount: 1,
      requiredDocs: ['id_card', 'visitor_pass', 'work_permit', 'delivery_slip', 'meeting_notice'],
      rules: ['检查所有证件', '注意所有细节', '核对身高体貌', '注意行为举止', '可致电住户核实', '分身可能只有一个破绽'],
      intro: '形势严峻，同志。分身几乎完美地模仿了人类，每个分身可能只有一个微小的破绽。你必须全神贯注，不放过任何细节。',
    },
    {
      id: 10,
      day: 10,
      title: '最后一天',
      visitors: 10,
      timeLimit: 120,
      doppelgangerChance: 0.5,
      flawCount: 1,
      requiredDocs: ['id_card', 'visitor_pass', 'work_permit', 'delivery_slip', 'meeting_notice'],
      rules: ['检查所有证件', '注意所有细节', '核对身高体貌', '注意行为举止', '可致电住户核实', '分身极其狡猾'],
      intro: '这是最关键的一天。分身大规模渗透的情报已经确认。今天来访者中有一半可能是分身。保持警惕，同志，人民的安全就靠你了。',
    },
  ],

};
