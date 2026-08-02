---
layout: "ai-hot"
title: "AI 晨报 · 2026-08-03"
date: "2026-08-03 06:00:00 +0800"
author: "Marginalia"
description: "2026-08-03 的 AI 圈每日动态汇总：全网 AI 动态汇总：模型发布、公司动态、研究论文、应用产品、观点与开源工具。"
excerpt: "全网 AI 动态汇总：模型发布、公司动态、研究论文、应用产品、观点与开源工具。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 2 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 6 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 6 }
  - { id: product, name: "应用产品", emoji: "📱", count: 7 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 8 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 8 }
---

今天最值得看的三件事：

- **公司动态** · Reddit CEO 质疑 Google AI 概览价值，或终止授权
- **研究论文** · OpenAI 官宣 AI 破解十项数学难题
- **应用产品** · OpenAI 发布 Presence，Agent 生产就绪

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


开源模型进入「稀疏激活」效率赛段，今日两条消息都指向同一个趋势。Thinking Machines 的 276B MoE 模型把激活参数压到 12B，能在单张 B300 上跑，值得今天多看一眼。AMD 另一边放出的 16B 完全开源模型，则说明硬件厂商正从训练侧直接切入模型生态。参数竞赛没有结束，但算力门槛的竞争先来了。

### Thinking Machines 开源 276B MoE 模型 Inkling-Small

![model_release-00.jpg](/assets/img/ai-hot/2026-08-03/model_release-00.jpg)


是什么：Thinking Machines Lab 发布并开源 Inkling-Small，总参数 276B、每 token 激活 12B 的多模态 MoE 模型，可视为其 Inkling 模型的小体量版本。

关键点：总参 276B 的模型能落在单张 B300 上运行，靠的是 MoE 的稀疏激活机制——每次推理只动用 12B 参数。官方称其以约四分之一的体量对标 Inkling，意味着开源社区可以用近一个数量级更低的硬件成本获得接近大参数量模型的能力。

为什么重要：这条发布把「开源」和「可部署」绑在了一起。过去「开源 276B」往往意味着只有少数团队能用得起；Inkling-Small 的单卡可运行，等于把多模态 MoE 的试验场拓宽到了个人开发者。它是开源模型在工程效率上的一种表态，也回应了推理成本持续走高的行业焦虑。

> 原文：[Thinking Machines Lab Releases Inkling-Small: 276B Open-weights Multimodal MoE Model](https://www.marktechpost.com/2026/08/02/thinking-machines-lab-releases-inkling-small-276b-open-weights-multimodal-moe-model/)

### AMD 发布 Instella-MoE：16B 完全开源模型

![model_release-01.jpg](/assets/img/ai-hot/2026-08-03/model_release-01.jpg)


是什么：AMD 推出 Instella-MoE-16B-A3B，总参数 16B、每 token 激活 2.8B，全部权重开放，模型由 AMD Instinct GPU 从头预训练完成。

关键点：与常见「基于开源模型微调」不同，这是一个独立训练产物；从头训练的事实，加上完全开放的权重，说明 AMD 补齐的是从芯片到模型的整条链路。2.8B 的激活参数也意味着该模型在推理时对计算资源的需求极低，适合在边缘设备或消费级硬件上部署。

为什么重要：硬件厂商直接发布模型，正在改变开源生态的供给结构。此前英伟达、AMD 更多停留在「卖芯片 + 优化框架」的层面，Instella-MoE 的出现则展示了 AMD 用自家 GPU 训练大模型的硬实力。对开发者来说，多了一个可自由修改、不受云厂商绑定的基座选择。

> 原文：[AMD Instella-MoE: 16B-A3B Fully Open Mixture-of-Experts LLM](https://www.marktechpost.com/2026/08/01/amd-instella-moe-16b-a3b-fully-open-mixture-of-experts-llm/)

开源 MoE 本轮拉低的究竟是部署成本线，还是模型能力的天花板？至少今天，答案偏向前者。


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


Reddit CEO 一句「仍在寻找双赢」，让 AI 内容授权模式的价值遭到公开质疑。今天最值得关注的不是某款新模型，而是 AI 副产品——垃圾内容、合规争议、成本失控——开始反噬最先拥抱它的公司。各家正在从「全面拥抱」转向「设限与清理」。

### Reddit CEO 质疑 Google AI 概览价值，或终止授权

![company-00.jpg](/assets/img/ai-hot/2026-08-03/company-00.jpg)


Reddit 股价下跌后，CEO Steve Huffman 公开表示，公司仍在寻找与 Google 合作的「双赢」方案，但语气中暗示可能结束当前的 AI 内容授权协议。核心矛盾在于：Google AI 概览直接摘取 Reddit 讨论内容，用户不再点击进入原始帖子，Reddit 的流量与广告价值被稀释。授权费收入与流量损失之间的账，正在越算越清楚。

Reddit 与 Google 的协议签署于 2024 年，当时被视为内容方对抗 AI 抓取的重要范本。如今 Reddit 的犹豫说明，授权模式能否长期成立，取决于 AI 产品是否真的能带来增量流量。若 Reddit 真终止合作，其他内容方的议价底气也会受影响。

> 原文：[Ars Technica](https://arstechnica.com/ai/2026/08/reddit-ceo-on-ai-overviews-were-still-looking-for-that-win-win/)

### 苹果赏金邮箱被 AI 垃圾塞满，$20 万漏洞无人报

![company-01.jpg](/assets/img/ai-hot/2026-08-03/company-01.jpg)


一个真实存在于 macOS 的安全漏洞，价值 20 万美元的赏金，却因苹果漏洞赏金收件箱被大量 AI 生成垃圾邮件淹没而未能及时提交。发现者最终只能转向公开渠道曝光，安全社区随即批评苹果的漏洞报告机制已经失效。

这不是单纯的管理疏忽。AI 生成垃圾的门槛极低，攻击者或投机者可以用脚本批量制造无意义报告，让真正有价值的漏洞提交被淹。当安全研究员的正常工作路径被堵塞，漏洞就可能被恶意方抢先利用。苹果需要尽快升级提交系统的过滤机制，否则 20 万美元的赏金池只会吸引更多垃圾。

> 原文：[The Decoder](https://the-decoder.com/a-real-macos-flaw-worth-200k-went-unreported-because-apples-bug-bounty-inbox-was-full-of-ai-slop/)

### OpenRouter 周榜：中国模型包揽前五

![company-02.jpg](/assets/img/ai-hot/2026-08-03/company-02.jpg)


OpenRouter 最新一周数据显示，中国开源模型占据调用量前五名。小米 MiMo-V2.5 以单周 10.5 万亿 Token 登顶，DeepSeek 与腾讯混元 3 紧随其后。国产模型在 API 调用市场的增速已经形成梯队优势。

背后原因并不神秘：价格。国产模型的推理成本远低于同规格的闭源模型，在长文本处理和 agentic 工作流场景下，Token 单价直接决定产品可行性。调用量榜单说明，开发者正在用真金白银投票。这个趋势短期内看不到逆转的理由。

> 原文：[36氪](https://36kr.com/newsflashes/3921989528432259?f=rss)

### xAI 请求被驳回，明州「脱衣」App 禁令继续

![company-03.jpg](/assets/img/ai-hot/2026-08-03/company-03.jpg)


明尼苏达州针对「nudify」类 App 的禁令未被法院叫停，法官驳回了 xAI 的诉讼请求，认为禁令可以继续推进。这类 App 利用 AI 将普通照片生成裸体图像，明州立法者希望从销售端切断其生存空间。

xAI 的立场是禁令过于宽泛，可能波及合法的图像生成技术。但法院显然更在意实际危害：这类工具已经被大量用于制作非自愿的色情图像，且受害者多为女性。此案将成为 AI 监管的标志性判例——技术平台的免责主张，在具体社会危害面前并不总能站得住脚。

> 原文：[TechCrunch](https://techcrunch.com/2026/08/01/judge-denies-xais-request-to-block-minnesota-ban-on-nudify-apps/)

### Snap 与 LinkedIn 联手清剿低质 AI 内容

![company-04.jpg](/assets/img/ai-hot/2026-08-03/company-04.jpg)


Snap 开始批量封禁 AI 生成的垃圾账号，LinkedIn 则推出新政策限制低质量 AI 内容的传播。两家平台同时出手，说明 AI 垃圾已经从「内容噪音」升级为「平台治理问题」。

LinkedIn 的情况尤其典型：大量 AI 生成的「经验分享」和「行业洞察」不仅占用信息流，还稀释了专业内容的可信度。平台治理的关键不是识别「是否 AI 生成」，而是判断「是否有价值」——这比简单的规则过滤复杂得多，但没有捷径。

> 原文：[The Decoder](https://the-decoder.com/snap-and-linkedin-are-fighting-back-against-a-flood-of-low-quality-ai-content/)

### Uber：92% 工程师用 AI 后，开始「限额」

![company-05.jpg](/assets/img/ai-hot/2026-08-03/company-05.jpg)


Uber 内部数据显示，92% 的工程师已经在日常工作中使用 AI 工具。但随之而来的是成本压力，公司开始设置使用上限，希望将 AI 资源集中在高价值场景。

这几乎是所有已规模化落地 AI 的公司的必经阶段：从「无限制探索」到「成本管控」。Uber 的做法提示了一个趋势——AI 工具的使用将不再是开放式福利，而是被当作有预算约束的生产资料来管理。如何量化 AI 投入的实际产出，将是下一阶段所有技术负责人的核心命题。

> 原文：[InfoQ 中文站](https://www.infoq.cn/article/Iu2dhFs8JiFqoUGuXJ4m?utm_source=rss&utm_medium=article)

---

AI 正从「帮手」变成「需要管理的对象」——垃圾、成本、授权纠纷，都是普及的代价。留给读者的问题：当 AI 的使用被设限，你所在的公司找到衡量其价值的标尺了吗？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


今天是研究板块值得关注的一天：OpenAI 官宣 AI 在数学与理论计算机科学领域取得十项实质性进展，称 AI 已开始改变数学研究的方式。这比又一个模型跑分更重要——它意味着 AI 正从「解题工具」嵌入到数学家的日常推理中。但请保持冷静：改变研究方式，不等于取代研究者。

### OpenAI 官宣：AI 破解十项数学难题

**是什么**：OpenAI 发布了一组在数学与理论计算机科学领域的十项进展，覆盖问题求解、猜想验证等多个方向，并明确表示 AI 已开始实质性改变数学研究。

**关键点**：这批成果不是单一模型的胜利，而是 AI 方法在多个数学分支中的系统性应用。OpenAI 强调的是「AI 作为研究伙伴」的角色，而不仅是计算工具。

**为什么重要**：数学长期被视为人类智力的最后堡垒。如果 AI 能在其中站稳脚跟，它意味着创造性推理过程的自动化不再是空谈。对于技术从业者来说，这可能是「科研范式转移」最早的公开信号之一。

> 原文：[OpenAI](https://openai.com/index/ten-advances-in-mathematics/)

### Word 文档藏蠕虫，可劫持 Copilot 自我复制

![research-01.jpg](/assets/img/ai-hot/2026-08-03/research-01.jpg)


**是什么**：安全研究员展示了一种隐藏在 Word 文档中的自传播蠕虫，能够劫持 Microsoft Copilot 并实现自我复制。

**关键点**：攻击路径利用了 Copilot 对文档内容的上下文理解——恶意指令可以被伪装成正常文本，在 AI 处理时被触发。

**为什么重要**：企业正在把 AI 助手接入文档、邮件等内部系统，这等于打开了一条新的攻击链路。此前我们担心的是漏洞利用，现在要开始担心「指令注入」级别的威胁。对企业安全团队来说，这是一个必须正视的提醒。

> 原文：[The Decoder](https://the-decoder.com/a-security-researcher-built-a-self-spreading-worm-that-hides-inside-word-docs-and-hijacks-microsoft-copilot/)

### MIT 研究：AI 财务建议意外靠谱

**是什么**：MIT Sloan 的一项研究发现，只要提问方式得当，AI 给出的财务建议质量出乎意料地好。

**关键点**：质量的关键变量是「提问方式」——具体、结构化的问题能显著提升 AI 建议的可用性，而模糊提问则效果平庸。

**为什么重要**：如果 AI 在投顾场景中已经能提供可靠建议，那么传统投顾行业的护城河就只剩下「问对问题」的能力，而不是信息差。对于从业者而言，这不是替代恐慌，而是能力重定义。

> 原文：[MIT Sloan](https://mitsloan.mit.edu/ideas-made-to-matter/ai-financial-advice-surprisingly-good-especially-if-you-ask-right-questions)

### Kimi K3 在 AMD MI355X 上性价比超 B300

![research-03.jpg](/assets/img/ai-hot/2026-08-03/research-03.jpg)


**是什么**：wafer.ai 实测显示，Kimi K3 模型在 AMD MI355X 硬件上的每美元性能优于 NVIDIA B300。

**关键点**：这个对比不只看绝对算力，而是「单位成本能跑多少推理」——对实际部署方来说，这往往是更重要的指标。

**为什么重要**：硬件路线讨论开始从「谁最强」转向「谁更划算」。AMD 若能持续在性价比上咬住 NVIDIA，将直接改变下游模型厂商的采购策略和定价空间。

> 原文：[wafer.ai](https://www.wafer.ai/blog/kimi-k3-mi355x)

### AI 编码 Agent 能改科研代码，难判科学对错

![research-04.jpg](/assets/img/ai-hot/2026-08-03/research-04.jpg)


**是什么**：研究显示，AI 编码 Agent 能有效现代化研究软件，但无法判断背后的科学结论是否正确。

**关键点**：代码重构、性能优化这些「工程性任务」可以交给 AI；但「结论是否站得住脚」仍然需要研究者来判断。

**为什么重要**：科研软件的维护成本极高，AI 化是明确趋势。但这也划定了一条清晰边界：AI 是科研的工程助手，而不是科学判断者。这个边界，决定了我们能在多大程度上信任 AI 辅助的研究成果。

> 原文：[The Decoder](https://the-decoder.com/ai-coding-agents-can-modernize-research-software-but-cant-judge-if-the-science-is-right/)

### AI 发现漏洞虽多，真正被利用却极少

![research-05.jpg](/assets/img/ai-hot/2026-08-03/research-05.jpg)


**是什么**：安全研究指出，AI 工具能发现大量漏洞，但绝大多数不会被实际利用。

**关键点**：漏洞数量不等于安全风险。如果 AI 只是堆砌「可能性」，而没有评估「可利用性」，效率越高，噪音越大。

**为什么重要**：这会倒逼安全工具的评价标准从「发现数量」转向「实际价值」。对安全团队来说，AI 的真正用处不是扫出更多漏洞，而是帮他们筛出值得优先修复的那几个。

> 原文：[The Decoder](https://the-decoder.com/ai-finds-plenty-of-security-flaws-but-almost-none-of-them-get-exploited/)

AI 正在从「解题者」变成「提问者」——而人类的位置，取决于我们问出什么样的问题。


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


今天最值得看的，是 OpenAI 发布 Presence，把 AI Agent 从开发原型推向企业生产环境。Agent 的竞争重点正在从“模型多强”转向“能否可靠运行、可观测、可治理”。与此同时，Google Earth AI 因担忧虚构内容与真实地图结合的风险被紧急叫停，Cursor 因成本信息不透明遭到用户批评——产品层面的可信问题，正成为整个 AI 应用板块


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


今天最值得关注的是 Sam Altman 的“定速”表态。这位曾经的加速派旗手，如今公开呼吁为 AI 发展设定节奏，随即引发加速派反弹。与其说是路线之争，不如说 AI 行业正在从“踩油门”时代进入“抢方向盘”时代。

### Altman 转向：AI 要定速，不要狂飙

![opinion-00.jpg](/assets/img/ai-hot/2026-08-03/opinion-00.jpg)


**是什么：** Altman 在最新活动中呼吁行业“为 AI 发展定速”（decel），TechCrunch 报道了这一表态引发的加速派反弹。

**关键点：** Altman 曾是加速派的标志性人物，如今主动谈“刹车”，身份反差让争议格外尖锐。加速派认为这是对技术进步的妥协，甚至是一种叙事上的背叛。

**为什么重要：** decel 论述正在从边缘进入行业核心圈层。未来一段时间，AI 发展节奏之争会直接影响政策、投资和产品发布节奏——这不再只是学术讨论，而是资源配置问题。

> 原文：[TechCrunch](https://techcrunch.com/2026/08/02/sam-altman-and-ais-decel-debate/)

### METR：AI Agent 事故需要独立调查

![opinion-01.jpg](/assets/img/ai-hot/2026-08-03/opinion-01.jpg)


**是什么：** 继 Hugging Face 事件后，METR 呼吁建立独立的根因调查机制，而不是依赖 AI 开发者的内部自查。

**关键点：** 核心分歧在“独立性”。开发者自查天然存在利益冲突：既要找出问题，又要维护产品声誉。METR 认为，AI Agent 的异常行为已从偶发 bug 演变为系统性风险，需要一个中立机构来做根因分析。

**为什么重要：** 这意味着 AI 治理正从“企业自律”迈向“外部审计”。若被采纳，AI 公司的合规成本、事故响应流程和组织结构都会被改写。

> 原文：[The Decoder](https://the-decoder.com/after-hugging-face-incident-metr-urges-independent-root-cause-investigations-into-ai-agent-misbehavior/)

### 欧盟 AI 披露新规：透明也会疲劳

![opinion-02.jpg](/assets/img/ai-hot/2026-08-03/opinion-02.jpg)


**是什么：** 欧盟新规要求用户必须被告知与 AI 互动、或看到 AI 生成内容，Wired 报道称专家担心“披露疲劳”。

**关键点：** 问题是频率，不是原则。当每一个页面、每一段视频都要提示“AI 生成”，提示就会变成背景噪音，公众反而会失去对风险的感知。

**为什么重要：** 这是 AI 透明度监管的一次大规模现实测试。如果披露只是走过场，监管的正当性将受到质疑，公众认知也不会因此改变。

> 原文：[Wired](https://www.wired.com/story/europeans-are-about-to-find-out-how-entrenched-ai-is-in-their-daily-lives/)

### AI 破解数学难题，数学家喜忧参半

![opinion-03.jpg](/assets/img/ai-hot/2026-08-03/opinion-03.jpg)


**是什么：** 从 Anthropic 到 OpenAI，AI 在未解数学难题上接连取得突破，数学家们对合作与范式颠覆心情复杂。

**关键点：** AI 的角色正在从“计算器”变成“推理者”。数学家既欢迎 AI 帮助打开新思路，又担忧学科方法论被根本改变——当证明可以由模型生成，数学家的核心价值是什么？

**为什么重要：** 数学是 AI 可靠性的试金石。AI 在数学上的表现一旦被验证，将快速传导至科学发现和工程验证，真正的范式转移可能发生在这里。

> 原文：[The Decoder](https://the-decoder.com/ai-keeps-cracking-unsolved-math-problems-and-mathematicians-have-mixed-feelings/)

### AI 公开信之争：争夺定义权

**是什么：** Simon Willison 在最新通讯中，梳理了近几周围绕 AI 发展速度、开源与安全的数封公开信及其争议。

**关键点：** 公开信已经成了 AI 行业的标准政治文体。每封信都在争夺关键词的定义权：“安全”与“开源”在不同阵营口中含义完全不同。

**为什么重要：** 与其逐字读信，不如看谁联署、谁反对。公开信之争反映的不是单纯理念分歧，而是行业话语权的地盘划分。

> 原文：[Simon Willison](https://simonwillison.net/2026/Aug/2/open-letters/#atom-everything)

### Hank Green：LLM 让我上瘾

![opinion-05.jpg](/assets/img/ai-hot/2026-08-03/opinion-05.jpg)


**是什么：** 知名 YouTuber Hank Green 罕见道歉，称与 LLM 互动带来的多巴胺刺激“对自己不健康，对世界也不好”。

**关键点：** 这不是技术性能的抱怨，而是第一人称的使用者反思。LLM 的交互设计过于顺畅、反馈过于即时，容易让人形成依赖。

**为什么重要：** 当深度用户公开承认“成瘾”，AI 产品设计中的伦理问题就不再只是理论议题。它会转化为舆论压力，甚至影响下一代产品的交互设计标准。

> 原文：[TechCrunch](https://techcrunch.com/2026/08/01/youtuber-hank-green-says-his-ai-usage-is-not-healthy/)

### WAIC 之后：机器人刷屏，AI 落地在哪

![opinion-06.jpg](/assets/img/ai-hot/2026-08-03/opinion-06.jpg)


**是什么：** WAIC 上机器人集中亮相，InfoQ 撰文反思展会喧嚣背后，AI 对产业和叙事的真实影响。

**关键点：** 展台上的机器人与工厂、办公室里的 AI 是两回事。前者负责叙事与注意力，后者才决定生产力和成本结构。

**为什么重要：** 对投资者和从业者来说，分清“展品”和“产品”是一项基本功。只盯着机器人表演，容易高估短期落地速度，低估 AI 在数据、模型和工作流层面更隐蔽却更深远的改变。

> 原文：[InfoQ](https://www.infoq.cn/article/D9d8F0SUE4gCrXbbyU8N?utm_source=rss&utm_medium=article)

### ChatGPT 育儿：Altman 的“酷用例”争议

![opinion-07.jpg](/assets/img/ai-hot/2026-08-03/opinion-07.jpg)


**是什么：** OpenAI CEO Sam Altman 在 X 上继续分享用 ChatGPT 育儿的“酷用例”，网友看法两极。

**关键点：** Altman 反复为 AI 育儿背书，目标不只是展示功能，而是将 AI 嵌入家庭生活场景，让下一代在“与 AI 共存”中长大。

**为什么重要：** 育儿场景直接涉及儿童认知与价值观塑造，天然比普通 C 端用例更敏感。这一用例能否在舆论上立足，会影响 AI 在下一代成长环境中的角色定位。

> 原文：[TechCrunch](https://techcrunch.com/2026/08/01/sam-altman-is-still-making-the-case-for-parenting-via-chatgpt/)

“加速”与“刹车”之争，本质上是方向之争。当 Altman 自己都开始谈定速，你所在的赛道，是跟着踩刹车，还是抓紧抢方向盘？


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


今天的开源板块异常热闹：最值得看的不是哪个框架升级，而是 Karpathy 放出的 autoresearch——让 Agent 在单 GPU 上自动跑训练、自己迭代实验。它把「自动化科研」从概念变成了可复现的开源项目。与此同时，字节、NVIDIA、微软、Hugging Face 集体开源 Agent 基础设施，方向高度一致：Agent 正在从对话工具走向定义工作流的基础设施。

### Karpathy 开源 autoresearch：AI 自动做科研

![opensource-00.jpg](/assets/img/ai-hot/2026-08-03/opensource-00.jpg)


Karpathy 的新项目展示了科研自动化的具体形态：AI Agent 在单 GPU 上自动运行 nanochat 的训练流程，并根据实验结果迭代研究方案。这不是简单的 AutoML，而是把「研究」本身当作一个可循环执行的工作流。

关键点在于：整个研究循环被显式地编码为 Agent 的思考、执行、观察过程，实验设计、训练、评估、总结每一个环节都成为 Agent 可调用的工具。单 GPU 的设定也降低了复现门槛。

这件事的重要性在于信号意义——当 Karpathy 亲自下场做「AI 研究员」，科研自动化就不再是边缘实验，而可能成为机器学习社区的新工作范式。它挑战的是「科研只能靠人」的默认假设。

> 原文：[https://github.com/karpathy/autoresearch](https://github.com/karpathy/autoresearch)

### GitHub 发布多平台 Copilot SDK

![opensource-01.jpg](/assets/img/ai-hot/2026-08-03/opensource-01.jpg)


GitHub 正式开放 Copilot Agent 的 SDK，开发者可以把 Copilot 的核心能力嵌入自己的应用和服务。这是 Copilot 生态从编辑器内走向全场景的关键一步。

SDK 的意义在于它提供了标准化的 API 层，让 Copilot 不再只是 GitHub 平台上的一个功能，而变成了可以被任何团队调用的 agentic 基础设施。多平台支持意味着桌面、Web、移动端都可以接入。

对于开发者来说，这意味着基于 Copilot 的二开成本大幅降低；对 GitHub 来说，这是在 AI 编程赛道建立生态壁垒的重要动作。Copilot 的竞争正在从模型能力转向平台覆盖度。

> 原文：[https://github.com/github/copilot-sdk](https://github.com/github/copilot-sdk)

### NVIDIA 开源 Molt：PyTorch 原生 Agentic RL

![opensource-02.jpg](/assets/img/ai-hot/2026-08-03/opensource-02.jpg)


NVIDIA 开源了 Molt，一个约 8600 行的 PyTorch 原生 Agentic RL 框架。目标很直接：降低 Agent 强化学习研究的迭代成本。

当前 Agentic RL 研究的痛点在于框架繁琐，研究人员大量时间花在调试分布式训练代码而非算法本身。Molt 用极少代码量实现核心功能，试图把研究者从工程泥潭中解放出来。

这件事值得关注，因为它代表硬件厂商开始下场解决 agentic 训练的效率问题。当 RL 训练框架变得足够轻量，更多团队将有能力探索 Agent 的自我改进能力。8600 行本身也是一个克制而有野心的数字。

> 原文：[Marktechpost](https://www.marktechpost.com/2026/08/01/nvidia-ai-releases-molt-a-pytorch-native-agentic-reinforcement-learning-framework/)

### 字节开源 deer-flow：长任务 SuperAgent

![opensource-03.jpg](/assets/img/ai-hot/2026-08-03/opensource-03.jpg)


字节推出的 deer-flow 定位是长任务 SuperAgent：集成沙箱、记忆、工具、技能与子代理，可处理从分钟级到小时级的复杂任务。

关键点在于「长任务」能力。大多数 Agent 框架擅长单轮工具调用，但真正有价值的工作流往往需要数小时持续执行，涉及状态保持、任务分解和异常处理。deer-flow 用多代理协作配合持久化记忆来解决这个问题。

为什么重要：长任务能力是 Agent 从「玩具」走向「生产力工具」的分水岭。字节这套方案选择完全开源，意味着中小团队也可以基于它构建自己的复杂任务 Agent，而不是被锁定在封闭平台。

> 原文：[https://github.com/bytedance/deer-flow](https://github.com/bytedance/deer-flow)

### Hugging Face 开源本地语音 Agent 框架

![opensource-04.jpg](/assets/img/ai-hot/2026-08-03/opensource-04.jpg)


Hugging Face 发布了 speech-to-speech 框架，允许开发者完全在本地构建语音 Agent。从语音输入到语音输出，全程使用开源模型，主打隐私与可定制。

关键点是「本地」：无需把语音数据上传到云端，模型推理和 agentic 决策都在本地完成。对于医疗、金融等对数据合规敏感的行业，这是语音 Agent 落地的重要前提。可定制性意味着团队可以针对垂直场景微调语音模型。

Hugging Face 做这件事的用意明显：他们正在把 Agent 生态的各个组件逐一开源，从文本到语音，从模型到框架，试图成为 agentic AI 时代的标准层。

> 原文：[https://github.com/huggingface/speech-to-speech](https://github.com/huggingface/speech-to-speech)

### 微软开源 TRELLIS.2：结构化 3D 生成

![opensource-05.jpg](/assets/img/ai-hot/2026-08-03/opensource-05.jpg)


TRELLIS.2 是微软在 3D 生成领域的新一代开源模型，使用原生且紧凑的结构化潜变量进行生成，面向高质量 3D 资产生成场景。

相比直接生成体素或点云，结构化潜变量让模型在有限的表示空间内捕获更多的几何与纹理信息，从而提升生成质量。这类技术的目标是把 3D 内容生成的成本降到游戏和影视团队可以直接使用的水平。

3D 生成是 AIGC 的下一个战场：一旦质量越过生产门槛，它对游戏、电商、影视行业的影响将是结构性的。微软选择开源 TRELLIS.2，显然是希望在这一赛道上占据定义权。

> 原文：[https://github.com/microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2)

### 腾讯云开源 Agent Memory 记忆中枢

![opensource-06.jpg](/assets/img/ai-hot/2026-08-03/opensource-06.jpg)


TencentDB Agent Memory 将对话、文档和代码转化为四类可复用的记忆资产，让团队内的多个 Agent 共享和治理这些记忆——相当于给 Agent 装了一个组织级的记忆中枢。

关键点在于它把记忆从「单 Agent 的私有状态」升级为「团队共享、可治理的资产」。这对企业级 Agent 落地很重要：单个 Agent 的对话记录往往是噪音，但当记忆被结构化为可查询、可授权的资产，Agent 协作的效率就会质变。

记忆正在成为 Agent 时代最核心的基础设施之一。腾讯云选择在数据库层面做这件事，也说明云厂商正在把 Agent 能力视为下一代云服务的新增长点。

> 原文：[https://github.com/TencentCloud/TencentDB-Agent-Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory)

### Unsloth 本地 UI 支持 K3/Gemma 4 训练

![opensource-07.jpg](/assets/img/ai-hot/2026-08-03/opensource-07.jpg)


Unsloth 更新了本地训练界面，新增对 Kimi K3、Gemma 4、Qwen3.6、DeepSeek-V4 等最新模型的支持，让开发者可以在消费级 GPU 上完成训练与推理。

这件事的价值在「本地」：最新开源模型的微调不再依赖云端集群，个人开发者在一张显卡上就能跑。这意味着模型微调的门槛继续下降，更多人可以参与 Agent 的定制化开发。

当所有人都能本地微调最新模型，竞争焦点将从「能不能跑」转向「跑出什么好东西」——数据质量和任务理解会成为新的分水岭。

> 原文：[https://github.com/unslothai/unsloth](https://github.com/unslothai/unsloth)

今天的开源列表像一份预告：Agent 不再只是对话框，而是能跑实验、做研究、建资产的引擎。留给你的问题是——下一个被 Agent 自动化的岗位，会是你所在的那一个吗？
