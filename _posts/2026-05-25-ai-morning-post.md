---
layout: "ai-hot"
title: "AI 晨报 · 2026-05-25"
date: "2026-05-25 06:00:00 +0800"
author: "Marginalia"
description: "2026-05-25 的 AI 圈每日动态汇总：DeepSeek 宣布将旗舰模型 V4 Pro 的 75% 折扣永久化，输出 token 价格比 GPT-5.5 低 34 倍以上；同时发布 DeepSeek Reasonix，一款低延迟、高缓存的编码 Agent。"
excerpt: "DeepSeek 宣布将旗舰模型 V4 Pro 的 75% 折扣永久化，输出 token 价格比 GPT-5.5 低 34 倍以上；同时发布 DeepSeek Reasonix，一款低延迟、高缓存的编码 Agent。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 1 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 7 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 4 }
  - { id: product, name: "应用产品", emoji: "📱", count: 8 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 6 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 8 }
---

今天最值得看的三件事：

- **模型发布** · DeepSeek 永久75%折扣，并推出原生编码智能体 Reasonix
- **开源工具** · Anthropic 推出官方 Claude Code 插件目录
- **公司动态** · Anthropic 或继续向 NSA 供应 Claude，尽管被五角大楼列为供应链风险

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


DeepSeek 今天打出两张牌：将 V4 Pro 的 75% 折扣永久化，输出 token 价格低至 GPT-5.5 的 1/34；同时推出原生编码智能体 Reasonix，主打低延迟与高缓存。这意味着 DeepSeek 不再只是“价格屠夫”，更在 Agent 赛道加速布局。

### DeepSeek V4 Pro 永久降价，Reasonix 编码 Agent 发布

![model_release-00.jpg](/marginalia/assets/img/ai-hot/2026-05-25/model_release-00.jpg)


**是什么**：DeepSeek 宣布其旗舰模型 V4 Pro 的 75% 折扣永久生效，输出 token 价格比 GPT-5.5 低至少 34 倍。同时推出面向编码场景的 Agentic 产品——DeepSeek Reasonix，强调低延迟和高缓存命中率。

**关键点**：永久折扣进一步拉大了与 OpenAI 的价差，尤其对高用量开发者极具吸引力。Reasonix 并非单纯对话模型，而是专为编程任务优化的 agentic 助手，集成了缓存机制以降低重复计算成本。

**为什么重要**：DeepSeek 正在通过极致性价比锁定开发者生态，同时用 Reasonix 切入 AI 编码助手这一快速增长的市场。对于企业和个人开发者，这可能是将工作负载从 GPT-5.5 迁移的最佳时机。

> 原文：[the-decoder.com](https://the-decoder.com/deepseek-makes-its-75-percent-discount-permanent-pricing-output-tokens-at-least-34x-below-gpt-5-5/)

当价格不再是门槛，DeepSeek 的下一战是让 Reasonix 比 Cursor 更懂你的代码库。你会尝试迁移吗？


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


今天最值得关注的是Anthropic与NSA的微妙关系：尽管五角大楼将Anthropic列为供应链风险，NSA仍可能继续使用Claude模型。这揭示出美国安全部门与国防机构在AI采购上的深层分歧——技术先进性与供应链安全正在成为一对矛盾。在你阅读另外六条消息时，请留意一个共同暗线：信任危机已从技术层面蔓延到品牌、能源和跨境监管。

### 五角大楼拉黑，NSA照用：Anthropic的双重身份

![company-00.jpg](/marginalia/assets/img/ai-hot/2026-05-25/company-00.jpg)


美国国防部将Anthropic标记为供应链风险，但NSA作为独立情报机构，仍倾向继续使用Claude模型。关键点在于两家机构的采购权限与安全评估标准不同：国防部更看重系统性依赖风险，而NSA更关注模型的实际推理能力。这一事件标志着美国在AI军事化应用中，各部门尚未形成统一准入框架。

> 原文：[the-decoder.com](https://the-decoder.com/anthropic-may-keep-supplying-claude-to-the-nsa-despite-being-flagged-as-a-supply-chain-risk-by-the-pentagon/)

### 谷歌CEO认输：AI编程落后了

![company-01.jpg](/marginalia/assets/img/ai-hot/2026-05-25/company-01.jpg)


在搜索业务迎来25年最大改版的背景下，Sundar Pichai公开承认谷歌在代码生成能力上已落后于竞争对手。关键点在于谷歌并非没有技术储备（有Gemini和AlphaCode），而是产品化与开发者生态建设滞后。对投资人而言，这暗示谷歌可能在AI基础设施层（如云服务CI/CD集成）面临份额流失风险。

> 原文：[量子位](https://www.qbitai.com/2026/05/423390.html)

### AI融资狂潮：一季度超1100亿元，国产大模型扛大梁

![company-02.jpg](/marginalia/assets/img/ai-hot/2026-05-25/company-02.jpg)


今年Q1 AI领域发生近600起融资，总额超1100亿元，同比增长185.4%。月之暗面、阶跃星辰等国产大模型公司拿下超300亿元。关键点在于资金集中度极高——头部企业单轮融资额逼近整体市场的三成。对于从业者，这意味着底层大模型竞争已进入“资本消耗战”，而应用层创业窗口依然窄小。

> 原文：[36氪](https://36kr.com/newsflashes/3822775103607172)

### 特斯拉FSD中文名改“辅助驾驶”，售价纹丝不动

![company-03.jpg](/marginalia/assets/img/ai-hot/2026-05-25/company-03.jpg)


特斯拉中国官网将FSD功能名称调整为“特斯拉辅助驾驶”，但6.4万元售价未变。关键点不是命名本身，而是这意味着特斯拉在中国市场未获得监管对“全自动驾驶”的认可。改名符合近年来监管部门对“自动驾驶”一词的使用限制，但价格不变说明特斯拉仍试图维持品牌溢价。

> 原文：[36氪](https://36kr.com/newsflashes/3822856592085379)

### 马斯克弃太阳能：xAI转天然气，SpaceX押注轨道数据中心

![company-04.jpg](/marginalia/assets/img/ai-hot/2026-05-25/company-04.jpg)


Elon Musk全面放弃他曾鼓吹的“地球太阳能经济”。xAI数据中心转向天然气供电，SpaceX则将算力送入轨道。关键点是能源逻辑的实用主义转折：AI训练的高功耗迫使任何技术派都要面对现实基础设施约束。轨道数据中心虽然冷门，但高能耗与冷却优势可能成为未来另一条赛道。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/23/elon-musk-has-given-up-on-solar-power-on-earth/)

### 美国科技公司与荷兰监管“开战”：共享官员个人信息

![company-05.jpg](/marginalia/assets/img/ai-hot/2026-05-25/company-05.jpg)


多家美国科技公司将荷兰数据监管机构（AP）官员的姓名提交给美国参议院，作为对荷兰隐私执法的反击。关键点在于跨境数据主权冲突从法律战升级到身份干扰。对产品经理意味着：若你的用户遍布欧美，本地合规团队不仅要懂法律，还得提防地缘政治摩擦波及个人数据。

> 原文：[DutchNews](https://www.dutchnews.nl/2026/05/us-tech-firms-share-dutch-regulator-officials-names-with-senate/)

### “AI洗白”潮：企业改名换姓，包装成AI公司

![company-06.jpg](/marginalia/assets/img/ai-hot/2026-05-25/company-06.jpg)


越来越多公司通过改名、更换品牌标识声称自己“AI Native”，引发监管关切。关键点在于此类“AI washing”与当年“云洗白”如出一辙，但AI因涉及就业替代和伦理问题，可能招致更严厉的消费者保护诉讼。投资人可留意：当一家传统企业突然改名为“某某AI”，其财务数据真实性需要加倍审查。

> 原文：[The Guardian](https://www.theguardian.com/technology/2026/may/24/ai-washing-pr-firms-scrambling-rebrand)

当AI从技术名词演变为品牌符号、政治筹码甚至外交武器，你今天读到哪一条最能让你的同事改变对AI的原有判断？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


研究人员利用 Claude Code 自动搜索并发现了新的 AI 缩放算法，部分设计思路完全超出人类传统认知。这一实验表明，AI 不仅能辅助研究，还可能探索人类认知盲区，重塑算法设计的底层逻辑。同时，字节跳动在长文档训练上的提问式方法、Agent 后端代码的约束衰减问题，以及内存成本占据芯片三分之二，都在提醒我们：效率与成本已成为当前 AI 研究的硬约束。

### Claude Code 自主发现 AI 缩放算法，设计思路人类未想过

![research-00.jpg](/marginalia/assets/img/ai-hot/2026-05-25/research-00.jpg)


**是什么**：研究人员没有手工设计缩放算法，而是让 Claude Code 自主搜索可行方案，最终找到多个新算法，其中某些设计模式此前从未被人类考虑过。

**关键点**：实验将算法搜索视为一个优化问题，Claude Code 在迭代中生成并验证候选算法，最终发现的方案在性能上与现有方法相当甚至更优。值得注意的是，AI 采用了一些反直觉的数学结构，人类研究者难以直接构想。

**为什么重要**：这突破了“AI 辅助人类设计”的范式，展示了机器在算法创新上可能拥有超出人类经验路径的创造力。如果这种自动发现方法推广，未来 AI 缩放算法很可能不再是人类设计，而是 AI 自我演化的结果。

> 原文：[The Decoder](https://the-decoder.com/researchers-let-claude-code-discover-ai-scaling-algorithms-that-humans-probably-wouldnt-have-designed/)

### 字节跳动：提问 LMM 比转录文本更适合长文档训练

![research-01.jpg](/marginalia/assets/img/ai-hot/2026-05-25/research-01.jpg)


**是什么**：字节跳动研究发现，在长文档训练中，对大型多模态模型（LMM）进行提问式训练（如“文档第3页的数据是多少？”）比直接让模型转录全文效果更好，且计算成本更低。

**关键点**：传统做法是将长文档直接作为文本输入训练，但字节的实验表明，以 QA 形式引导模型关注关键信息，不仅能提升准确性，还减少了对上下文长度的依赖，进而降低显存和算力消耗。

**为什么重要**：随着文档长度增长（如代码库、学术论文），直接训练的计算开销呈超线性增长。提问式训练提供了一种更高效的折中方案——模型不需要记住所有细节，只需具备正确检索推理的能力。这为长文档 LLM 的部署提供了新思路。

> 原文：[The Decoder](https://the-decoder.com/bytedance-study-finds-that-asking-lmms-questions-beats-making-it-transcribe-text-for-long-document-training/)

### LLM Agent 后端代码生成中的“约束衰减”问题

![research-02.jpg](/marginalia/assets/img/ai-hot/2026-05-25/research-02.jpg)


**是什么**：一项新预印本研究揭示，LLM Agent 在自动生成后端代码时，会随迭代次数增加逐渐偏离原始约束，导致生成代码脆弱且不可靠。

**关键点**：研究者将这一现象称为“约束衰减”（constraint decay）：Agent 在多次调用 LLM 修正代码的过程中，最初的高层需求被逐步稀释，最终代码虽能通过单元测试，但其架构和安全性却远低于人类水平。

**为什么重要**：这直接挑战了当前“Agent 可以自主写生产级代码”的乐观预期。如果不解决约束衰减，基于 LLM 的代码生成只能停留在 demo 阶段，无法用于需要长期维护和合规验证的企业系统。

> 原文：[arXiv](https://arxiv.org/abs/2605.06445)

### 内存成本已占 AI 芯片总成本近三分之二

![research-03.jpg](/marginalia/assets/img/ai-hot/2026-05-25/research-03.jpg)


**是什么**：Epoch AI 最新分析显示，随着模型规模持续增长，HBM（高带宽内存）等存储成本在 AI 芯片总组件成本中的占比已接近三分之二。

**关键点**：过去芯片成本大头是计算单元（如 GPU 核心），现在内存（尤其是 HBM 堆叠层数增加）的制造成本急剧上升。以 NVIDIA H100 为例，内存封装成本已超过计算核心本身。

**为什么重要**：这意味着下一代 AI 芯片的瓶颈可能不再是算力，而是内存。硬件厂商必须在内存架构上创新（如计算存储一体化），否则模型规模增长将被存储成本彻底压垮。

> 原文：[Epoch AI](https://epoch.ai/data-insights/ai-chip-component-cost-shares)

---

当 AI 可以自主设计算法时，人类研究者的角色是否需要重新定义？留给技术社区的问题或许不是“AI 能不能替代我们”，而是“我们错过了哪些本应是 AI 才能看到的东西”。


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


今天最值得关注的是亚马逊 Bee 可穿戴 AI 的体验报道——TechCrunch 记者在亲测后描述它「既好奇又有点毛骨悚然」：便利性确实存在，但隐私焦虑同样真实。这款产品可能成为消费级可穿戴 AI 的试金石，关键在于用户能否接受「始终在线」的代价。

### 亚马逊 Bee 可穿戴 AI：便利与隐私的边界测试

![product-00.jpg](/marginalia/assets/img/ai-hot/2026-05-25/product-00.jpg)


**是什么**：亚马逊推出的 AI 可穿戴设备 Bee，TechCrunch 记者亲身体验后给出了矛盾评价。

**关键点**：设备能提供即时语音助手、环境感知等便利功能，但记者明确提到了“creeped out”感受——背后是麦克风始终开启、数据持续上传带来的隐私隐忧。

**为什么重要**：这是亚马逊在可穿戴 AI 领域的重要试探。如果 Bee 无法解决用户对隐私的天然警惕，它可能重蹈 Google Glass 早期覆辙——技术可行但社会接受度不足。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/24/i-tried-amazons-bee-wearable-and-am-both-intrigued-and-slightly-creeped-out/)

### OpenAI 详解语音 AI 的 WebRTC 架构

![product-01.jpg](/marginalia/assets/img/ai-hot/2026-05-25/product-01.jpg)


**是什么**：OpenAI 发布技术博客，公开其用 WebRTC 构建低延迟、可扩展语音 AI 服务的技术细节。

**关键点**：WebRTC 在实时音视频领域成熟，但将其用于 AI 语音推理的规模化调度需要定制优化。博客重点涉及连接管理、音频流切换和动态负载均衡。

**为什么重要**：对深度使用 GPT-4o 语音模式的开发者而言，这份架构说明提供了可直接复用的低延迟方案参考。

> 原文：[InfoQ](https://www.infoq.cn/article/HzTpYj4SIqzFOHybIO2q)

### 法拉利 + IBM AI：制造 F1 超级粉丝

![product-02.jpg](/marginalia/assets/img/ai-hot/2026-05-25/product-02.jpg)


**是什么**：法拉利与 IBM 合作，用 AI 为 F1 观众生成个性化内容，打造“超级粉丝”体验。

**关键点**：AI 分析车迷历史行为，实时推荐赛道视角、车手数据、历史对比等内容。强调从“观赛”到“沉浸式参与”的转变。

**为什么重要**：这是体育 IP 利用 AI 提升用户粘性的典型场景，其方法论可迁移至音乐、电竞等内容行业。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/23/ferrari-is-using-ai-to-create-f1-superfans/)

### 旧金山非营利组织用机器人烹饪填补人力缺口

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-05-25/product-03.jpg)


**是什么**：旧金山 Tenderloin 地区的非营利组织引入机器人厨师，解决志愿者短缺导致的餐食供应不足。

**关键点**：机器人完成切配、烹饪等重复性工作，人类志愿者负责分餐和社交陪伴。项目验证了机器人+人力的混合模式在公益场景的可行性。

**为什么重要**：社会服务领域面临人力成本上升和志愿者流失，机器人技术可能是低成本替代方案。

> 原文：[Wired](https://www.wired.com/story/these-robots-are-making-meals-for-a-nonprofit-in-san-franciscos-tenderloin/)

### 数字华夏发布人形机器人“星行侠 P2”及场景大脑

**是什么**：数字华夏在深圳文博会上发布星行侠 P2 人形机器人，同时推出 RoboEase 场景大脑和 RoboCare 康养解决方案。

**关键点**：P2 强调移动性和操作能力，场景大脑则试图提供跨行业部署的通用控制平台。现场签署多项战略合作。

**为什么重要**：人形机器人从实验室走向商业化落地，场景大脑的通用性决定了其能否复制到酒店、医院等场景。

> 原文：[雷锋网](https://www.leiphone.com/category/robot/ZRsFD3aS5OQIyJNz.html)

### Grab 多智能体系统设计实践

![product-05.jpg](/marginalia/assets/img/ai-hot/2026-05-25/product-05.jpg)


**是什么**：Grab 分享其在工程支撑场景（如客服工单、资源调度）中使用多智能体系统的架构经验。

**关键点**：采用 agentic 设计，每个 agent 负责特定子任务，通过协调器统一调度。重点解决智能体间冲突、状态同步和容错问题。

**为什么重要**：多智能体是当前 LLM 落地的热点方向，Grab 的实战案例对构建复杂业务系统的技术团队有直接参考价值。

> 原文：[InfoQ](https://www.infoq.cn/article/7DfZeiQH0zm08P88xIw9)

### 芬兰大学用 AI 聊天机器人抵御健康虚假信息

![product-06.jpg](/marginalia/assets/img/ai-hot/2026-05-25/product-06.jpg)


**是什么**：奥卢大学研究人员开发了一款基于“认知接种”方法的 AI 聊天机器人，帮助用户识别健康领域虚假信息。

**关键点**：机器人先展示常见的误导话术（如伪权威、虚假数据），再教用户识别逻辑漏洞。类似打疫苗——提前暴露弱点以产生抵抗力。

**为什么重要**：健康谣言传播迅速，该方法用 AI 进行“预干预”，可能比事后辟谣更有效。

> 原文：[36氪](https://36kr.com/newsflashes/3822778010079362)

### AI 工具模型选择：别停在默认值

![product-07.jpg](/marginalia/assets/img/ai-hot/2026-05-25/product-07.jpg)


**是什么**：评测指出，Copilot、Gemini 等 AI 工具默认使用的模型并非总是最优，用户应手动切换以获得更好输出。

**关键点**：默认模型通常偏向速度或成本，对复杂推理、代码生成等任务，切换到更大型号（如 GPT-4o、Claude 3.5）效果明显更好。

**为什么重要**：多数用户忽视这项设置，导致工具潜力未被充分利用。产品经理和开发者应将模型选择设计得更显性化。

> 原文：[The Decoder](https://the-decoder.com/why-you-shouldnt-leave-model-selection-on-default-in-copilot-gemini-and-other-ai-tools/)

---

当 AI 穿在身上，你准备好交换多少隐私换取便利？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


今天板块最大的看点是AI两大旗帜的隔空交锋：DeepMind的Hassabis认为人类正站在奇点山脚，而Meta的LeCun直接反驳“当前AI并不智能”。这不仅是学术口水战，更折射出业界对AGI路线图的根本分歧——一方相信指数级加速，一方坚持现有系统缺乏核心能力。在这场争论背后，安全、算力、创业窗口等实操议题也在本周密集被讨论。

### Hassabis vs LeCun：奇点“山脚”还是“山头”？

![opinion-00.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opinion-00.jpg)


**是什么**：Demis Hassabis在近期演讲中表示，人类正处于奇点“山脚”（foothills），暗示技术加速将很快带来质变；Yann LeCun则公开回应，称当前AI系统远未达到真正智能，缺乏对世界的基本理解。

**关键点**：两人分歧点在于对“智能”的定义——Hassabis看重能力涌现趋势，LeCun强调因果推理和常识的缺失。这本质是对大语言模型路线是否通向AGI的两种判断。

**为什么重要**：两位AI重量级人物的观点对立，直接影响了投资者和开发者对技术路径的预期。如果你押注“山脚”论，会更关注持续缩放与能力扩展；如果认同LeCun，则可能更看重符号推理、世界模型等替代方向。

> 原文：https://the-decoder.com/deepminds-hassabis-sees-humanity-in-the-foothills-of-the-singularity-while-lecun-says-current-ai-isnt-intelligent/

### 别让Claude假装做架构师

![opinion-01.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opinion-01.jpg)


**是什么**：博客文章批评开发者过度依赖Claude进行系统架构设计，指出AI往往生成看似合理但缺乏深度权衡的方案，开发者不应将决策权交给模型。

**关键点**：Claude等模型能快速输出结构图、技术选型建议，但它们对业务约束、维护成本、团队能力等隐性因素缺乏感知。文章建议将AI视为“灵感助手”而非“决策者”，架构评审仍需人类主导。

**为什么重要**：当Claude越来越擅长生成代码和设计文档时，“AI替我带脑”的诱惑很大。但架构失误的代价远高于代码bug。这篇文章提醒我们：工具越强，越要保持人的判断力。

> 原文：https://www.hollandtech.net/claude-is-not-your-architect/

### AI安全：连谷歌都在“摸着石头过河”

![opinion-02.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opinion-02.jpg)


**是什么**：TechCrunch报道指出，AI安全仍处于“实时摸索”阶段，即使是谷歌这样的巨头也没有成熟方案，每个组织都在边做边学。

**关键点**：文章引用多位安全研究者的观点，认为当前攻击面（如提示注入、模型越狱、数据投毒）远未收敛，防护措施往往滞后于威胁。谷歌内部的安全实践也是在不断迭代中调整，没有“普适性最佳实践”。

**为什么重要**：这打破了“大公司已解决AI安全”的假象。对于技术人员和投资人，意味着安全工具、评估框架、合规咨询等领域仍存在真实需求窗口，创业公司有机会在细分场景建立壁垒。

> 原文：https://techcrunch.com/2026/05/24/everyone-is-navigating-ai-security-in-real-time-even-google/

### 张璐：未来推理将吃掉70%算力，训练只占30%

![opinion-03.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opinion-03.jpg)


**是什么**：硅谷投资人张璐在AIGC2026圆桌上预测，随着AI应用大规模落地，推理侧算力需求占比将持续攀升，最终训练与推理的比例可能从当前的约4:6演变为3:7。

**关键点**：她强调技术创新只是起点，产业整合速度才是决定胜负的关键。算力结构的变化意味着芯片设计、云端部署、边缘推理的成本模型都将被重写。

**为什么重要**：如果推理真的成为算力消耗主力，那么投资逻辑将从“算卡/训练集群”转向“推理优化/边缘计算”。对于产品经理和开发者，这意味着模型压缩、量化、缓存等技术的重要性将超过训练技巧。

> 原文：https://www.qbitai.com/2026/05/423382.html

### Agent创业窗口：大厂集体下场，垂直场景是机会

![opinion-04.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opinion-04.jpg)


**是什么**：AIGC2026另一圆桌论坛讨论了Agent领域的创业前景。嘉宾们认为，当大厂将通用Agent能力作为平台功能免费开放后，创业公司的机会在于垂直场景深耕和差异化体验。

**关键点**：例如医疗、法律、教育等高度专业化且数据敏感的领域，大厂的通用方案难以满足合规与定制需求；此外，跨系统编排、私有化部署等工程能力也是创业公司的壁垒。

**为什么重要**：Agent赛道正在经历从“技术奇点”向“产业化落地”的转折。创业公司需要快速找到大厂不愿做或做不好的窄域，而非试图在通用平台上正面竞争。

> 原文：https://www.qbitai.com/2026/05/423421.html

### 周鸿祎评马斯克：十年后人类都不开车了？

![opinion-05.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opinion-05.jpg)


**是什么**：周鸿祎评论马斯克关于自动驾驶的预言（十年内人类将不再需要自己开车），认为AI下一步将深刻改变物理世界中的物流、人流和车流。

**关键点**：周鸿祎强调了“端到端”大模型在自动驾驶中的突破能力，同时指出安全、法规和基础设施的升级需要时间。他判断十年后L4级自动驾驶在封闭/半封闭场景会成为主流，但完全开放道路仍需更长时间。

**为什么重要**：虽然观点不算新鲜，但作为行业老兵对马斯克预言的“翻译”，有助于理解国内自动驾驶产业的实际推进节奏——谨慎乐观，而非激进落地。

> 原文：https://36kr.com/newsflashes/3822814415589768

---

AI的智能边界在哪里？或许答案不在Hassabis和LeCun的辩论中，而在每天不断涌现的工程细节和安全事故里。


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


今天开源社区最值得关注的是 Anthropic 官方推出的 Claude Code 插件目录——它不再只是让开发者自己找插件，而是官方下场做品质筛选。这标志着 AI 编码 Agent 生态从“野蛮生长”进入“平台化治理”。同时，多个 Agent 框架（Hermes Agent、CrewAI、Pydantic AI）和训练工具（OpenPipe ART）集中亮相，表明开源 Agent 正在从 demo 走向工程化落地。

### Anthropic 推出官方 Claude Code 插件目录

![opensource-00.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opensource-00.jpg)


**是什么：** Anthropic 官方维护的 Claude Code 插件集合仓库，开发者可以在此发现并安装经过审核的扩展插件，涵盖代码审查、文档生成、项目管理等场景。

**关键点：** 插件目录由 Anthropic 团队直接管理，意味着质量与安全有基本保障；同时采用 GitHub 仓库形式，支持社区提交 PR，未来可能形成类似 VS Code 扩展市场的生态。

**为什么重要：** 此前 Claude Code 功能相对封闭，插件目录的开放直接降低了开发者定制工作流的门槛。对于企业和个人开发者而言，这是一个明确的信号：Anthropic 正在推动 Claude Code 成为可扩展的编码平台，而不是单一工具。类比 GPTs 商店，但编码场景下插件的商业潜力可能更大。

> 原文：https://github.com/anthropics/claude-plugins-official

### NousResearch 发布 Hermes Agent：与你一起成长的智能体

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opensource-01.jpg)


**是什么：** 开源 AI Agent 框架，核心卖点是“个性化成长”——Agent 能根据用户的使用习惯和反馈持续调整行为，并非一次性部署。

**关键点：** 提出“记忆 + 反馈”闭环，允许 Agent 在任务执行过程中记录偏好、失败经验，并用于后续决策优化。框架基于 NousResearch 自研的 Hermes 模型系列，但理论上支持接入其他 LLM。

**为什么重要：** 当前多数 Agent 框架侧重“任务编排”而非“长期学习”，Hermes Agent 切中了企业用户对可持续优化的需求。如果其个性化能力落地可靠，可能成为 RAG 之外另一种知识沉淀方式。

> 原文：https://github.com/NousResearch/hermes-agent

### CrewAI：编排角色扮演自主 AI Agent 的框架

![opensource-02.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opensource-02.jpg)


**是什么：** 一个多 Agent 协作框架，允许开发者定义不同角色（如分析师、开发者、测试员），让它们通过对话与任务流转完成复杂项目。

**关键点：** 在 GitHub 上已获大量关注，社区活跃。支持多种 LLM 后端，强调角色分工和任务分解，类似“AI 团队调度器”。

**为什么重要：** CrewAI 是目前最接近“agentic workflow”生产环境的开源方案之一。对于产品经理和开发者来说，它提供了一种可视化思路：将业务流水线映射为多角色 Agent 协作，而无需自己从零构建通信协议。

> 原文：https://github.com/crewAIInc/crewAI

### Pydantic AI：Pydantic 风格的 AI Agent 框架

![opensource-03.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opensource-03.jpg)


**是什么：** Pydantic 团队（Python 类型验证库的维护者）推出的官方 AI Agent 框架，核心利用类型安全构建可靠 AI 应用。

**关键点：** 开发者用 Python 类型注解定义 Agent 的输入输出，框架自动处理验证、错误处理和重试逻辑。天然继承 Pydantic 的生态，可与 FastAPI、SQLModel 等无缝集成。

**为什么重要：** 类型安全使得 Agent 的“边界”更加明确，适合对可靠性要求高的生产环境。对于 Python 开发者而言，学习曲线极低，是当前与现有代码库集成最顺畅的 Agent 框架之一。

> 原文：https://github.com/pydantic/pydantic-ai

### OpenPipe ART：基于 GRPO 的 Agent 强化训练工具

![opensource-04.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opensource-04.jpg)


**是什么：** 一个允许开发者使用 Group Relative Policy Optimization（GRPO）对多步 Agent 进行强化训练的开源工具，支持 Qwen3.6、GPT-OSS 等模型。

**关键点：** ART 不局限于单步指令调优，而是让 Agent 在完成多步任务后，根据最终结果获得奖励信号，从而优化中间决策链条。类似 RLHF 但针对 agentic 场景。

**为什么重要：** 训练 Agent 比训练普通模型困难得多，GRPO 是当前学术界和工业界验证有效的方法之一。ART 将其打包成易用工具，降低了 Agent 强化学习的门槛，可能成为 Agent 从“演示”到“真正可靠”的关键基础设施。

> 原文：https://github.com/OpenPipe/ART

### CodeGraph：本地代码知识图谱，为 Claude Code/Cursor 等节省 Token

![opensource-05.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opensource-05.jpg)


**是什么：** 一个本地运行的代码知识图谱工具，预索引项目中的函数、类、文件关系，使 AI 编码助手在调用时只发送最小上下文，减少 token 消耗和工具调用次数。

**关键点：** 100% 本地运行，无需云端依赖；支持主流 IDE 和编码 Agent（Claude Code、Cursor、Copilot 等）。通过图索引，Agent 能更精准地定位相关代码片段。

**为什么重要：** Token 成本正在成为 AI 编码助手大规模使用的隐性瓶颈。CodeGraph 提供了一种“缓存 + 索引”思路，让 Agent 不再需要每步都重新扫描整个仓库。预计会成为各编码 Agent 的标配插件。

> 原文：https://github.com/colbymchenry/codegraph

### Chrome DevTools MCP：为编码 Agent 提供浏览器调试能力

![opensource-06.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opensource-06.jpg)


**是什么：** Google Chrome DevTools 团队官方推出的 MCP（Model Context Protocol）工具，允许 AI 编码 Agent 直接调用 Chrome 开发者工具的接口，进行网页调试、性能分析、DOM 操作等。

**关键点：** 基于 MCP 协议，兼容任何支持 MCP 的 Agent 框架（如 Claude Code、CrewAI）。Agent 可以像人类开发者一样打开 DevTools、查看网络请求、修改样式。

**为什么重要：** 网页开发和调试一直是编码 Agent 的盲区。此工具让 Agent 具备了“看屏幕”和“操作浏览器”的能力，填补了前端和后端联调场景的空白。对于产品经理而言，这意味着未来 Agent 可以自动复现并定位 UI bug。

> 原文：https://github.com/ChromeDevTools/chrome-devtools-mcp

### Multica：开源托管 Agent 平台，让编码 Agent 成为真正的队友

![opensource-07.jpg](/marginalia/assets/img/ai-hot/2026-05-25/opensource-07.jpg)


**是什么：** 一个开源的多 Agent 管理平台，提供任务分配、进度追踪、技能组合等功能，类似于“Agent 版的 Jira + 微服务编排”。

**关键点：** 支持将不同大型语言模型和 Agent 框架注册为“技能”，平台自动调度；提供 Web UI 查看各 Agent 状态和交付物；所有数据可本地化部署。

**为什么重要：** 当前 Agent 工具多聚焦单体执行，缺少团队协作层。Multica 试图填补这一空白，让企业能够将多个 Agent 像团队成员一样管理。如果成熟，可能成为下一代 AI 原生项目管理和交付平台。

> 原文：https://github.com/multica-ai/multica

---

从一个官方插件目录到多个多 Agent 框架和训练工具，今天的开源社区在告诉开发者一句话：Agent 不再是玩具，而是需要被编排、训练和管理的工程系统。留给你的问题是——当所有 Agent 工具都就位，你的业务场景真正准备好“交接”了吗？
