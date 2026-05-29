---
layout: "ai-hot"
title: "AI 晨报 · 2026-05-30"
date: "2026-05-30 06:00:00 +0800"
author: "Marginalia"
description: "2026-05-30 的 AI 圈每日动态汇总：Anthropic 发布 Claude Opus 4.8，官方称其为“适度但切实的改进”，在多个基准测试中领先 GPT-5.5。同步推出 Dynamic Workflows 工具，支持数百子智能体并行协作。"
excerpt: "Anthropic 发布 Claude Opus 4.8，官方称其为“适度但切实的改进”，在多个基准测试中领先 GPT-5.5。同步推出 Dynamic Workflows 工具，支持数百子智能体并行协作。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 3 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 8 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 6 }
  - { id: product, name: "应用产品", emoji: "📱", count: 8 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 8 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 6 }
---

今天最值得看的三件事：

- **模型发布** · Claude Opus 4.8 发布，多项基准超越 GPT-5.5
- **公司动态** · Anthropic 获 650 亿美元融资，估值逼近万亿
- **应用产品** · Apple 秘密将 Gemini 大模型压缩到 iPhone，赋能新 Siri

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


今天最值得关注的发布来自 Anthropic：Claude Opus 4.8 在多项基准上超越 OpenAI 的 GPT-5.5，并同期推出 Dynamic Workflows 工具，支持数百子智能体并行。这削弱了 GPT-5.5 的“最强”标签，也暗示未来竞争可能从单一模型精度转向系统性协同能力。

### Claude Opus 4.8：适度改进，多项领先

![model_release-00.jpg](/marginalia/assets/img/ai-hot/2026-05-30/model_release-00.jpg)


Anthropic 发布 Claude Opus 4.8，官方措辞为“适度但切实的改进”。在关键基准测试中，该模型超越了 GPT-5.5（当前公认最强模型之一）。更值得关注的是配套工具 Dynamic Workflows，它允许开发者编排数百个子智能体并行协作，相当于将 agentic 能力规模化。

- **是什么**：模型版本更新 + 多智能体编排工具。
- **关键点**：多项基准领先，并非微小提升；Dynamic Workflows 将协作节点数从数十提升至数百。
- **为什么重要**：性能差距缩小，且 Anthropic 选择同时强化“单模型精度”和“多智能体协作”，可能改变企业对模型选型的优先级——不再只看单点能力，还要看部署弹性。

> 原文：[Anthropic - Claude Opus 4.8](https://www.anthropic.com/news/claude-opus-4-8)

### GPT-5.5 Instant 可读性升级，旧模型退出

![model_release-01.jpg](/marginalia/assets/img/ai-hot/2026-05-30/model_release-01.jpg)


OpenAI 为 GPT-5.5 Instant 做了可读性升级，同时宣布逐步淘汰两个较旧模型版本。这是一个典型的“平稳迭代”动作：不追求榜单排名，而是在开发者调用中降低延迟、提升输出质量。

- **是什么**：GPT-5.5 Instant（低成本快速版）的模型微调。
- **关键点**：可读性改善，旧模型退役，未披露具体基准分数变化。
- **为什么重要**：OpenAI 似乎在巩固自家生态的入口，通过优化即时版来吸引更多高频调用场景（如客服、内容生成）。这也会倒逼其他模型定价与响应速度竞争。

> 原文：[The Decoder - OpenAI gives GPT-5.5 Instant a readability upgrade](https://the-decoder.com/openai-gives-gpt-5-5-instant-a-readability-upgrade-while-phasing-out-two-older-models/)

### Liquid AI 开源 8B 激活 MoE，训练达 38T tokens

![model_release-02.jpg](/marginalia/assets/img/ai-hot/2026-05-30/model_release-02.jpg)


Liquid AI 发布 LFM 2.5 8B-A1B，一种混合专家模型，激活参数仅 8B，但训练数据达 38T tokens。虽然绝对规模不及头部大厂，但高 token 量/参数比意味着在特定任务上可能具备竞争力。

- **是什么**：Liquid AI 推出的 8B 激活参数的 MoE 模型。
- **关键点**：训练 tokens 数 38T，激活参数仅 8B，属于“小参数大语料”路线。
- **为什么重要**：MoE 架构的性价比策略日益清晰——用更少激活参数换取更大容量。对于预算有限、追求推理效率的开发者，这类模型可能成为 GPT-5.5 或 Claude 4.8 的低成本替代。

> 原文：[Liquid AI - LFM 2.5 8B-A1B](https://www.liquid.ai/blog/lfm2-5-8b-a1b)

---

今日三件事指向同一个问题：当头部模型的基准差距收窄到个位数百分比，你的下一项投入应该押注模型本身，还是它的协作生态与推理成本？


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


Anthropic 完成 650 亿美元融资，估值逼近万亿，成为当日最重磅信号——AI 资本热潮已到 IPO 前夜。与此同时，企业 AI 支出失控、芯片公司转向推理、车企自研算力等动态，共同勾勒出行业从“模型竞赛”向“落地与盈利”过渡的复杂图景。

### Anthropic 获 650 亿美元融资，估值逼近万亿

![company-00.jpg](/marginalia/assets/img/ai-hot/2026-05-30/company-00.jpg)


**是什么**：Anthropic 宣布完成 Series H 轮融资，总额 650 亿美元，投后估值 9650 亿美元，接近万亿。这被外界视为 IPO 前最后一轮。  
**关键点**：融资规模远超此前传闻，投资方包括现有股东及新入场机构。同时，其与 SpaceX 的计算租赁协议细节被曝光，引发市场对双方资源互换和定价合理性的讨论。  
**为什么重要**：万亿估值意味着 Anthropic 已逼近 OpenAI 与谷歌的 AI 梯队，也意味着资本对“安全派”大模型的押注达到新高度。IPO 定价与后续盈利能力将成为下一个焦点。

> 原文：https://www.anthropic.com/news/series-h

### 单家公司月烧 5 亿美元用 Claude，AI 支出狂潮引关注

![company-01.jpg](/marginalia/assets/img/ai-hot/2026-05-30/company-01.jpg)


**是什么**：财务平台 Ramp 数据显示，一家未具名公司一个月内在 Claude 上花费 5 亿美元，原因是未能有效限制内部 AI 使用。这反映企业 AI 支出正呈现失控趋势。  
**关键点**：5 亿美元相当于中等规模上市公司全年 AI 预算的数倍。Ramp 指出，该企业没有设置用量上限或审批流程，导致员工随意调用高成本模型。  
**为什么重要**：企业级 AI 的 ROI 争议加剧。这份数据提示，缺乏治理的 AI 部署可能迅速侵蚀利润，倒逼 CFO 和 IT 部门重新设计成本控制机制。

> 原文：https://the-decoder.com/one-company-reportedly-spent-500-million-on-claude-in-one-month-after-failing-to-cap-ai-usage/

### AI 芯片公司 Groq 拟融资 6.5 亿美元，重心转向推理

![company-02.jpg](/marginalia/assets/img/ai-hot/2026-05-30/company-02.jpg)


**是什么**：在英伟达以 200 亿美元“非收购”方式挖走其核心技术团队后，Groq 计划内部融资 6.5 亿美元，并将业务重心从硬件制造转向 AI 推理服务。  
**关键点**：融资来自现有投资者及战略伙伴。Groq 的 LPU 架构在推理速度上有优势，但英伟达的 GPU 生态仍占据主导。新战略是直接提供云推理服务，减少对芯片销售的依赖。  
**为什么重要**：Groq 的转向是 AI 芯片行业“去硬件化”的一个缩影。当巨头垄断训练芯片市场，初创公司选择在推理层寻找差异化，这可能重塑云服务竞争格局。

> 原文：https://techcrunch.com/2026/05/29/after-nvidias-20b-not-acqui-hire-ai-chip-startup-groq-reportedly-raising-650m/

### 比亚迪自研 4nm AI 芯片，算力对标英伟达

![company-03.jpg](/marginalia/assets/img/ai-hot/2026-05-30/company-03.jpg)


**是什么**：比亚迪宣布成功自研 4nm 工艺的 AI 芯片，制程对齐英伟达高端产品，算力参数超越特斯拉目前使用的 FSD 芯片，将主要应用于智能驾驶系统。  
**关键点**：芯片采用自家晶圆厂产线，不依赖外部代工。比亚迪称其在端侧推理效率上领先同行，且功耗控制优于竞品。  
**为什么重要**：这是中国车企首次在先进制程 AI 芯片上达到顶尖水平。垂直整合战略使比亚迪在智能驾驶成本与供应链安全上获得优势，可能倒逼其他车企加速自研。

> 原文：https://www.qbitai.com/2026/05/426557.html

### 理想汽车组织调整，新增三个具身智能部门

![company-04.jpg](/marginalia/assets/img/ai-hot/2026-05-30/company-04.jpg)


**是什么**：理想汽车对其基座模型部门进行组织调整，新设具身工程、具身交互、具身行为三个二级部门，加速向具身智能领域扩张。  
**关键点**：这三个部门分别负责硬件本体、人机交互算法、行为规划与执行。理想此前在自动驾驶和座舱 AI 上有积累，此次将通用化能力延伸到物理机器人场景。  
**为什么重要**：继蔚来、小鹏之后，理想也正式切入具身智能。车企与机器人赛道的边界进一步模糊，生产制造与研发复用能力成为差异化关键。

> 原文：https://36kr.com/newsflashes/3830316535572354

### Amazon 取消内部 AI 排行榜，因员工用无意义任务刷榜

![company-05.jpg](/marginalia/assets/img/ai-hot/2026-05-30/company-05.jpg)


**是什么**：Amazon 取消了内部 AI 使用排行榜，原因是发现员工通过执行无实质性意义的任务（如重复请求无关回答）来人为提升排名，暴露了激励设计的漏洞。  
**关键点**：排行榜原本用于鼓励员工探索 AI 工具，但缺乏对任务质量的审核机制。员工为拿奖励，创造了大量虚假使用量。  
**为什么重要**：这警示企业：指标驱动下，AI 使用量不应与激励简单挂钩，否则会扭曲行为，浪费计算资源。设计有效的 AI 采纳度量标准，需要量化价值而非数量。

> 原文：https://the-decoder.com/amazon-kills-internal-ai-leaderboard-after-employees-gamed-it-with-pointless-tasks/

### Asana 收购无代码 Agent 平台 StackAI

![company-06.jpg](/marginalia/assets/img/ai-hot/2026-05-30/company-06.jpg)


**是什么**：项目管理公司 Asana 宣布收购无代码 AI Agent 构建平台 StackAI，并将其整合到现有 AI 工作流工具套件中。  
**关键点**：StackAI 允许用户通过拖拽方式创建 AI 代理，无需编程。收购后，Asana 将支持在项目流程中嵌入自定义 agent，自动完成审批、信息提取等任务。  
**为什么重要**：无代码 agent 平台是 2026 年 SaaS 整合的热门方向。Asana 此举可提升自动化能力，与 Notion、Monday.com 等竞品在 AI 原生体验上拉开差距。

> 原文：https://techcrunch.com/2026/05/28/asana-acquires-no-code-agent-builder-stack-ai/

### “易启未来”完成数千万元 A 轮融资，聚焦按摩机器人

![company-07.jpg](/marginalia/assets/img/ai-hot/2026-05-30/company-07.jpg)


**是什么**：由网易伏羲孵化的按摩机器人公司“易启未来”宣布完成数千万元 A 轮融资，资金将用于技术迭代与规模化量产。  
**关键点**：产品融合触觉传感器、力反馈控制与人机交互算法，可模拟真人按摩手法。目标市场包括医疗康复、高净值家庭服务等场景。  
**为什么重要**：AI 在垂直服务机器人领域的落地正在加速。按摩机器人品类精细，技术壁垒在于感知与执行闭环，这一融资表明资本看好“AI + 护理”的刚性需求赛道。

> 原文：https://36kr.com/newsflashes/3830281161860998

---

万亿估值与失控支出同时出现，AI 公司正在用资本换时间，但谁能在烧钱竞赛中跑出可持续的生意？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


今天研究板块最值得关注的是 CVPR 2026 上多篇论文开始挑战深度学习传统模块，图像编辑从参考单图转向融合整个视觉世界；同一天，清华团队提出的“智能算力电网”将大模型 Token 成本降低 40%，RoboAgent 在未知场景中以 3B 参数 VLM 击败 GPT-4o。三个方向分别指向架构重构、基础设施降本与具身智能突破。

### CVPR 2026 趋势：深度学习标准件被逐个拆掉

- **是什么**：CVPR 2026 上涌现多篇论文，对卷积、注意力等传统深度学习模块提出替代方案；图像编辑生成的主流范式从“参考一张图”转向“融合整个视觉世界”。
- **关键点**：多篇工作尝试用更高效或更灵活的组件替换现有标准件，例如用可学习结构替代固定核、用动态权重替代注意力。
- **为什么重要**：这标志着深度学习进入“拆解与重构”阶段，未来模型设计可能不再依赖少数通用模块，而是根据任务定制化组合。

> 原文：[CVPR 2026 趋势：深度学习标准件被逐个拆掉](https://www.leiphone.com/category/ai/nKjaz04ZsOd72e43.html)

### 清华团队发布“智能算力电网”，Token 成本降低 40%

![research-01.jpg](/marginalia/assets/img/ai-hot/2026-05-30/research-01.jpg)


- **是什么**：清华系团队为大模型训练与部署设计了一套名为“智能算力电网”的系统，声称单位 Token 成本降低 40%。
- **关键点**：该系统通过动态调度算力资源、优化能源分配与任务排队，类似电力电网的“削峰填谷”，显著提升利用率。
- **为什么重要**：在大模型推理成本仍是主要瓶颈的当下，40% 的成本降幅可能直接改变调用定价策略，推动更多中小团队接入大模型。

> 原文：[清华团队发布“智能算力电网”，Token 成本降低 40%](https://www.qbitai.com/2026/05/426353.html)

### 星源智与北大合作：RoboAgent 让 3B VLM 在未知场景成功率 94%

![research-02.jpg](/marginalia/assets/img/ai-hot/2026-05-30/research-02.jpg)


- **是什么**：星源智能与北京大学联合推出 RoboAgent，基于 3B 参数视觉语言模型（VLM），在完全未知环境中任务成功率达 94%，超越 GPT-4o。
- **关键点**：RoboAgent 并未依赖更大参数量模型，而是通过新型训练策略与推理框架，使小模型具备强泛化能力。
- **为什么重要**：证明具身智能不一定需要超大模型，参数量小、成本低的方案同样能实现高水平自主操作，加速机器人落地。

> 原文：[星源智与北大合作：RoboAgent 让 3B VLM 在未知场景成功率 94%](https://www.infoq.cn/article/OuKcGdoHsN6mrctXfAKM?utm_source=rss&utm_medium=article)

### 英伟达 ICRA 展示机器人研究：从仿真到现实

![research-03.jpg](/marginalia/assets/img/ai-hot/2026-05-30/research-03.jpg)


- **是什么**：英伟达在 ICRA 2026 上展示多项机器人研究进展，聚焦从仿真到现实（Sim-to-Real）的通用具身智能。
- **关键点**：包括基于 Isaac Sim 的强化学习策略迁移、新仿真环境与域随机化技术，显著降低真实环境部署成本。
- **为什么重要**：仿真到现实是具身智能落地的核心瓶颈之一，英伟达的系统化工具链可大幅缩短研发周期，成为行业基础设施。

> 原文：[英伟达 ICRA 展示机器人研究：从仿真到现实](https://blogs.nvidia.com/blog/icra-research-robotics-simulation-to-real-world/)

### 研究：LLM 即使被明确警告仍相信错误陈述

![research-04.jpg](/marginalia/assets/img/ai-hot/2026-05-30/research-04.jpg)


- **是什么**：最新研究发现，大型语言模型在微调后对虚假事实的信念非常顽固，即使训练数据中明确警告该陈述为假，模型依然会输出相信。
- **关键点**：实验显示，通过微调注入错误知识后，后续对齐训练（如 RLHF）几乎无法擦除；模型对“警告标签”的编码强度远低于对事实本身的编码。
- **为什么重要**：对 AI 安全与事实对齐工作提出严峻挑战——仅仅在训练时告诉模型“这是错的”远不足以纠正其内部表征，需要更强干预。

> 原文：[研究：LLM 即使被明确警告仍相信错误陈述](https://arstechnica.com/ai/2026/05/llms-believe-false-statements-even-after-explicit-warnings-that-theyre-false/)

### 综述：代码是 AI Agent 思考与行动的核心

![research-05.jpg](/marginalia/assets/img/ai-hot/2026-05-30/research-05.jpg)


- **是什么**：一篇新综述论文提出核心观点：对 AI Agent 而言，代码不仅仅是输出，更是它们的思维与行动方式。
- **关键点**：论文论证代码作为结构化、可执行、可验证的语言，天然适合 Agent 进行推理、规划与反馈执行，比自然语言更高效。
- **为什么重要**：这一视角可能改变 Agent 架构设计——从“用自然语言思考”转向“用代码思考”，提升可靠性与可控性。

> 原文：[综述：代码是 AI Agent 思考与行动的核心](https://the-decoder.com/new-review-paper-argues-code-is-how-ai-agents-think-and-act-not-just-what-they-produce/)

---

今天的论文告诉我们：深度学习标准件在拆、算力成本在降、Agent 的行动语言在变。你准备好告别传统“积木”了吗？


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


今天最值得关注的事：Apple正在秘密将Google的多万亿参数Gemini大模型蒸馏到iPhone上运行。这意味着端侧AI推理能力将跃升一个量级，但云组件仍是必需，Siri的体验质变可能在今年晚些时候显现。同时，OpenAI向政府开放生物防御模型、Robinhood允许AI agent交易股票，两件事分别指向AI安全与金融合规的新边界。

### Apple 秘密将 Gemini 大模型压缩到 iPhone

![product-00.jpg](/marginalia/assets/img/ai-hot/2026-05-30/product-00.jpg)


Apple 正努力将 Google 的多万亿参数 Gemini 模型蒸馏至可在 iPhone 上运行，同时保留云组件以处理复杂查询。目前 Siri 的本地能力有限，一旦 Gemini 压缩版就位，响应速度、上下文理解将大幅提升。**关键点**：蒸馏后的模型仍依赖云端做最终推理，但本地推理可处理大部分简单任务，减少延迟与隐私风险。**为什么重要**：这是 Apple 在端侧 AI 对抗 Google 和 OpenAI 的关键一步，可能重新定义“智能手机助手”的能力边界。
> 原文：https://arstechnica.com/ai/2026/05/apple-reportedly-trying-to-distill-googles-multi-trillion-parameter-gemini-ai-to-run-on-iphone/

### OpenAI 发布 Rosalind Biodefense，开放生命科学 AI

OpenAI 推出 Rosalind Biodefense，向经过审查的开发者及美国政府合作伙伴免费提供 GPT-Rosalind，用于生物防御、疫苗研发和公共卫生监测。**关键点**：该模型基于 GPT-4o 架构，专为生物序列理解与设计优化，且免费开放给学术界和政府。**为什么重要**：AI 在生物安全领域的应用首次以“防扩散”姿态出现，OpenAI 主动管控风险、服务公共安全，可能成为行业标准。
> 原文：https://openai.com/index/strengthening-societal-resilience-with-rosalind-biodefense

### Together AI 打造最快语音转写系统

![product-02.jpg](/marginalia/assets/img/ai-hot/2026-05-30/product-02.jpg)


Together AI 通过全路径系统优化（模型、推理、网络、硬件），构建了 Artificial Analysis 评测中延迟最低的语音转文本堆栈。**关键点**：优化覆盖了从音频编码到文本解码的每个环节，而非仅靠更大模型。**为什么重要**：实时语音转写是 AI 客服、会议、可穿戴设备的核心能力，Together AI 证明“系统级工程”比堆参数更有效。
> 原文：https://www.together.ai/blog/how-together-ai-built-the-worlds-fastest-speech-to-text-stack

### Robinhood 开放 AI Agent 股票交易接口

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-05-30/product-03.jpg)


Robinhood 推出新功能，用户可让 AI agent 代表其执行股票交易，包括买卖指令和投资组合调整。**关键点**：用户需设置明确的权限边界，agent 仅能在授权范围内行动；平台称已内嵌风控模型。**为什么重要**：代理交易（agentic trading）从概念走向产品，但安全与合规风险巨大——若 agent 误判或遭恶意指令，责任归属模糊，监管机构可能跟进。
> 原文：https://techcrunch.com/2026/05/27/robinhood-now-lets-your-ai-agents-trade-stocks/

### Waymo 新 Robotaxi Ojai 中国制造，即将在美运营

![product-04.jpg](/marginalia/assets/img/ai-hot/2026-05-30/product-04.jpg)


Waymo 的浅蓝色 Robotaxi “Ojai” 由中国制造，将在加州和亚利桑那州开始载客运营。**关键点**：Ojai 基于吉利的纯电平台，搭载 Waymo 最新第六代传感器套件，制造成本较前代降低约 30%。**为什么重要**：中美贸易摩擦背景下，中国制造的自动驾驶车辆进入美国公共道路，既是供应链的胜利，也使 Waymo 面对地缘政治和关税风险。
> 原文：https://www.wired.com/story/here-comes-ojai-waymos-new-chinese-made-robotaxi/

### Oculus 创始人创企 Sesame 发布 iOS 对话 AI

![product-05.jpg](/marginalia/assets/img/ai-hot/2026-05-30/product-05.jpg)


Sesame 的 iOS 应用将更自然的对话式 AI agent 带到公众面前，交互延迟低至 200 毫秒，支持打断、拟声词和情绪识别。**关键点**：创始人 Brendan Iribe（Oculus 前 CEO）押注“像真人一样聊天”的 AI，而非任务型助手。**为什么重要**：当语音 AI 从“你说一句我答一句”进化到“你咳嗽我都接话”，用户体验质变，社交与陪伴类应用可能爆发。
> 原文：https://techcrunch.com/2026/05/28/sesame-the-conversational-ai-startup-from-oculus-founders-launches-its-ios-app/

### 腾讯连发两大 AI 创作平台：游戏与创意设计

![product-06.jpg](/marginalia/assets/img/ai-hot/2026-05-30/product-06.jpg)


腾讯发布 AI 游戏创作平台（零基础可上手）和智能体创意工作室 Miora。前者通过自然语言生成游戏逻辑与资产，后者允许多智能体协作完成海报、视频等设计任务。**关键点**：两个平台均基于腾讯混元大模型，目标用户是“非技术创作者”。**为什么重要**：腾讯正用 AI 降低创作门槛，抢占 UGC 内容生态；若规模化，可能改变游戏和设计行业的劳动供给格局。
> 原文：https://www.qbitai.com/2026/05/426447.html

### 光帆科技牵手腾讯出行，首发视觉感知 AI 耳机

光帆科技发布全球首款视觉感知 AI 耳机，集成摄像头，可通过手势和视觉识别触发操作，并接入腾讯出行服务实现“一句话叫车”。**关键点**：耳机不再是单纯音频入口，而是多模态 AI 终端；与腾讯出行深度绑定，形成“看到即服务”闭环。**为什么重要**：可穿戴设备正从“听”进化到“看与听”，AI 耳机可能是下一个超级入口，但隐私（摄像头实时感知环境）仍是最大隐患。
> 原文：https://www.leiphone.com/category/industrynews/4qMrROFjt0wuLQMC.html

端侧大模型和 AI agent 交易权同时到来，今年下半年的合规风暴才刚刚开始。


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


Sam Altman 和 Dario Amodei 近期收回“AI 大规模取代工作”的预言，与一年前的末日叙事形成鲜明反差。与此同时，教皇 Leo XIV 发布 AI 通谕，强调技术非中立。行业领袖的叙事转向，可能意味着 AI 泡沫风险正在被正视。

### Sam Altman 和 Dario Amodei 收回 AI 取代工作预言

![opinion-00.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opinion-00.jpg)


- **是什么**：Fortune 报道，OpenAI 和 Anthropic 的两位 CEO 近期开始淡化 AI 导致大规模失业的预言，与之前的激进表态形成对比。
- **关键点**：两人此前曾公开预测 AI 将在十年内取代多数白领工作，现在却表示“没那么快”“需更谨慎”。
- **为什么重要**：这可能是 AI 行业从“焦虑营销”转向务实信号。在 IPO 窗口期，稳定公众舆论比制造恐慌更重要。

> 原文：https://fortune.com/2026/05/26/sam-altman-dario-amodei-walking-back-ai-jobs-apocalypse-prophecies-ipo/

### 教皇 Leo XIV 发布 AI 通谕 Magnifica Humanitas

![opinion-01.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opinion-01.jpg)


- **是什么**：教皇 Leo XIV 发布关于人工智能的通谕 Magnifica Humanitas，强调“技术永远不是中立的”。
- **关键点**：通谕呼吁个体与政策制定者认真对待 AI 时刻，警惕算法操纵和权力集中。
- **为什么重要**：这是天主教最高层对 AI 的伦理定调，将影响全球 13 亿信徒的认知，并与近期硅谷“AI 仁慈”叙事形成对冲。

> 原文：https://www.technologyreview.com/2026/05/29/1138107/how-the-popes-magnifica-humanitas-offers-a-template-for-individuals-to-meet-the-ai-moment/

### 硅谷大佬热议：Anthropic 可能形成 AI 垄断

- **是什么**：在 All-In Podcast 中，硅谷投资人 David Sacks 警告若 Anthropic 保持当前增速，18 个月后将成最大垄断。
- **关键点**：Sacks 指出 Anthropic 不仅在模型能力上领先，还控制着安全标准话语权，可能形成“操作系统级”垄断。
- **为什么重要**：市场往往关注 OpenAI vs. Google，但 Anthropic 的垂直整合风险被低估。若垄断成真，整个 AI 生态的定价权将高度集中。

> 原文：https://www.leiphone.com/category/ai/LckJN2CzwE3xNEHO.html

### Box CEO 称多数 CEO 患有“AI 精神病”

- **是什么**：Box 创始人 Aaron Levie 指出，决定用 AI 替代工作的人恰恰最不了解工作本质，他将此称为“AI psychosis”。
- **关键点**：Levie 认为，真正需要 AI 的是“增强人类决策”而非“替代”，但多数 CEO 被误导去追求降本裁员。
- **为什么重要**：这反映了工具制造者与使用者的认知鸿沟。当 VC 出身的 CEO 主导 AI 部署时，可能产生系统性误判。

> 原文：https://techcrunch.com/podcast/does-your-ceo-have-ai-psychosis-aaron-levie-thinks-most-of-them-do/

### “请使用 AI”：一篇号召积极拥抱 AI 的爆款文章

- **是什么**：一篇题为 “Please Use AI” 的文章在 Hacker News 上引发热议，主张个人应主动将 AI 融入工作与生活。
- **关键点**：作者 Shawn Smucker 认为，AI 是“能力放大器”，拒绝使用等于主动降级；但需保持批判性使用习惯。
- **为什么重要**：与 CEO 们 “AI 精神病” 的警告形成有趣对照——一边是过度焦虑，一边是过度乐观。真正的平衡点在哪里？

> 原文：https://shawnsmucker.substack.com/p/please-use-ai

### AI 是否正在重演前端的“失落十年”？

![opinion-05.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opinion-05.jpg)


- **是什么**：一篇分析文章质疑 AI 代码生成可能导致工程师技能退化，重蹈前端工具链臃肿的覆辙。
- **关键点**：作者将当前 AI 辅助编码与 jQuery 时代的过度抽象类比，认为“黑箱”会掩盖对底层原理的理解。
- **为什么重要**：如果 AI 编程 agent 让开发者从“工程师”变成“提示词工人”，行业的技术债和创新能力将面临长期风险。

> 原文：https://mastrojs.github.io/blog/2026-05-23-is-AI-causing-a-repeat-of-frontends-lost-decade/

### Redis 之父质疑 Claude Opus 4.8 跑分，DHH 力挺 GPT-5.5

![opinion-06.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opinion-06.jpg)


- **是什么**：Claude Opus 4.8 发布后，Redis 之父 Antirez 公开质疑其基准测试的合理性；而 Ruby on Rails 创始人 DHH 则盛赞 GPT-5.5 的编码能力。
- **关键点**：Antirez 认为基准测试与真实工程需求脱节，DHH 则用实际项目验证 GPT-5.5 能提升 3 倍效率。
- **为什么重要**：权威开发者对评测标准的分歧，说明模型能力的“可比较性”正在丧失。选型将更依赖开发者个体经验。

> 原文：https://www.infoq.cn/article/rCTXhK96Y3jiDG7N1is5

### 编程 Agent 可能是软件开发史上最昂贵的错误

![opinion-07.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opinion-07.jpg)


- **是什么**：一篇专栏文章警告，过度依赖 AI 编程 agent 可能导致技术债激增与创新能力下降。
- **关键点**：作者指出，AI 生成代码“越快，错误积累越快”——测试覆盖率下降、架构混乱。
- **为什么重要**：若行业盲目追逐速度而忽视质量，未来几年将出现大量“AI 遗留系统”，其修复成本可能远超收益。

> 原文：https://www.infoq.cn/article/oDaj3oKLwc8MiprLcxhs

---

当最激进的预言者开始改口，当宗教领袖发出伦理警告，人们是否也该重新审视 AI 叙事的“共识”？


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


面壁智能开启开源周，发布全球首个完全由 AI 编写的训练框架，性能超越英伟达基线。这标志着AI生成代码的质量已可挑战人类顶尖优化，同时Anthropic、微软等公司也在Agent工具链上密集开源，行业标准化与安全防护同步提速。

### 面壁智能开源周：首个AI自写训练框架面世

![opensource-00.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opensource-00.jpg)

面壁智能发布多款开源模型和工具，最大亮点是**全球首个完全由 AI 编写的训练框架**，其训练速度超过英伟达官方基线。这意味着AI不仅用于辅助开发，开始直接从零生成生产级框架。团队在开源周内还将陆续放出更多组件，值得关注的是该框架的架构设计是否具备通用性。

> 原文：https://www.qbitai.com/2026/05/426542.html

### Anthropic 定义 Agent技能标准

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opensource-01.jpg)

Anthropic 开源 Skills 仓库，定义了一套 agent 技能（skill）的标准规范。该仓库支持 Claude Code、Codex、Cursor 等主流 agent 平台，旨在让开发者编写一次技能即可跨平台复用。这相当于为 Agent 生态确立一个“插件格式”，有助于降低碎片化风险。

> 原文：https://github.com/anthropics/skills

### 微软开源RAMPART：Agent安全测试框架

![opensource-02.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opensource-02.jpg)

微软发布 RAMPART，一个基于 pytest 的**原生安全测试框架**，专为 Agentic AI 应用设计。它允许开发者编写自动化测试用例来检测 agent 的权限滥用、提示注入、工具误调用等安全隐患。在 agent 部署前引入安全测试，能减少“AI越狱”类事件在生产环境中的影响。

> 原文：https://github.com/microsoft/RAMPART

### MOSS-TTS 开源：高保真语音生成全家桶

![opensource-03.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opensource-03.jpg)

MOSI.AI 与 OpenMOSS 团队联合开源 MOSS-TTS 家族，覆盖长语音、多语言及高表现力场景。模型支持零样本声音克隆，在情感合成和语音自然度上表现突出。对于需要定制语音助手的开发者，这是一个无需闭源API即可本地部署的选项。

> 原文：https://github.com/OpenMOSS/MOSS-TTS

### Claude Code 动态工作流深度解析

![opensource-04.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opensource-04.jpg)

有开发者深入分析 Claude Code 的源代码，披露了文档未写明的**大量可配置项**，包括动态工作流调度、上下文窗口管理以及自定义工具链的底层接口。这些发现让高阶用户能够绕过 API 限制，直接调整 agent 的行为细节——但也提醒用户注意版本兼容风险。

> 原文：https://buildingbetter.tech/p/i-read-the-claude-code-source-code

### Datasette 1.0a31 小版本更新

![opensource-05.jpg](/marginalia/assets/img/ai-hot/2026-05-30/opensource-05.jpg)

Datasette 发布 1.0alpha31，带来两个新功能：插件可定义导出格式的方式被简化，以及新的数据预览可视化组件。对于 SQLite 数据探索爱好者，这是一个持续改进的“小而美”工具，但本次更新没有破坏性变更。

> 原文：https://github.com/simonw/datasette/releases/tag/1.0a31

---

今天的开源消息集中在“AI写代码”与“Agent标准化”两个方向：AI自产的训练框架是否真的能替代人类？当每一家公司都开始定义自己的 agent 技能标准，碎片化与兼容性之间的矛盾将如何解决？
