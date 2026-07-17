---
layout: "ai-hot"
title: "AI 晨报 · 2026-07-17"
date: "2026-07-17 06:00:00 +0800"
author: "Marginalia"
description: "2026-07-17 的 AI 圈每日动态汇总：Moonshot AI发布Kimi K3，2.8万亿参数开源MoE模型，性能逼近GPT-5.6和Opus 4.8，定价低于Sonnet 5。"
excerpt: "Moonshot AI发布Kimi K3，2.8万亿参数开源MoE模型，性能逼近GPT-5.6和Opus 4.8，定价低于Sonnet 5。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 6 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 8 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 6 }
  - { id: product, name: "应用产品", emoji: "📱", count: 8 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 8 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 8 }
---

今天最值得看的三件事：

- **模型发布** · 国产最大开源模型Kimi K3发布，2.8T参数
- **模型发布** · Mira Murati的Thinking Machines发布开源模型Inkling
- **行业观点** · Linus Torvalds怒怼AI反对者：不爽就fork

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


今天模型发布板块最值得关注的是Moonshot AI的Kimi K3——2.8万亿参数开源MoE，性能逼近GPT-5.6和Opus 4.8，定价却低于Sonnet 5。这不仅是国产开源模型参数量的新纪录，更意味着一线闭源模型的价格壁垒正在被开源方案打破。与此同时，Mira Murati的新公司也交出了首份作业，但表现并未超越中国团队。

### Kimi K3：2.8T参数开源MoE，性能比肩顶尖闭源

Moonshot AI 发布 Kimi K3，一个 2.8 万亿参数的 MoE 开源模型。在官方公布的基准测试中，其综合性能接近 GPT-5.6 和 Opus 4.8，但 API 定价低于 Sonnet 5。Kimi K3 采用混合专家架构（MoE），在保持高容量的同时控制推理成本。此次开源意味着任何团队都可以在本地部署或微调这一级别的模型，可能加速国产大模型在 B 端应用的渗透。

> 原文：https://www.kimi.com/blog/kimi-k3

### Inkling 发布：前OpenAI CTO首款模型，落后于中国团队

![model_release-01.jpg](/marginalia/assets/img/ai-hot/2026-07-17/model_release-01.jpg)


Thinking Machines Lab 由前 OpenAI CTO Mira Murati 创办，今日发布首款开源模型 Inkling（975B 参数、MoE 架构）。模型在多项国际基准上领先美国其他实验室（如 Mistral、Meta 的 Llama 系列），但在与国内模型（如 Kimi K3 等）对比时处于劣势。Inkling 的最大意义在于验证了“明星研究团队独立创业”的模式仍能快速产出高水平成果，但“追赶中国”已经成为海外新品发布时的常态。

> 原文：https://thinkingmachines.ai/news/introducing-inkling/

### Nemotron 3 Embed：NVIDIA登顶检索排行榜

![model_release-02.jpg](/marginalia/assets/img/ai-hot/2026-07-17/model_release-02.jpg)


NVIDIA 发布 Nemotron 3 Embed 模型，在检索基准 RTEB（Retrieval Task Evaluation Benchmark）上排名第一。该模型专注于提升智能体（agentic）应用中的检索能力，例如 RAG 场景下的段落召回和工具选择。NVIDIA 延续了“基础模型+垂直优化”的策略，在嵌入模型这一细分赛道上卡住了又一个关键入口。

> 原文：https://huggingface.co/blog/nvidia/nemotron-3-embed-wins-rteb

### Mobius：上海AI Lab推出非Transformer科学基座模型

![model_release-03.jpg](/marginalia/assets/img/ai-hot/2026-07-17/model_release-03.jpg)


上海人工智能实验室在 WAIC 2026 上发布 Mobius，一个 397B 参数的科学智能体基座模型，采用非 Transformer 架构，专注于化学、物理、生物等科学领域的任务求解。其核心设计围绕“符号推理+数值模拟”展开，与传统的大语言模型在结构上根本不同。如果 Mobius 能在特定基准上超越 Transformer 变体，可能开启一条通往科学专用模型的新路线。

> 原文：https://www.qbitai.com/2026/07/452942.html

### WITT：文远知行发布物理AI大模型，专注自动驾驶数据闭环

![model_release-04.jpg](/marginalia/assets/img/ai-hot/2026-07-17/model_release-04.jpg)


文远知行在 WAIC 发布物理 AI 大模型 WITT，宣称单卡每天可处理 1 万分钟视频，将行驶数据高效转化为模型能力。WITT 本质上是一个针对自动驾驶的感知-预测-规划联合训练框架，而非通用对话模型。对于 L4 量产玩家来说，数据闭环的效率直接决定迭代速度，WITT 试图用大模型压缩传统多模型 pipeline。

> 原文：https://www.qbitai.com/2026/07/452961.html

### Gemma 4静默更新：Google在不换版本号下修复工程问题

![model_release-05.jpg](/marginalia/assets/img/ai-hot/2026-07-17/model_release-05.jpg)


Google 在不更改版本号的情况下更新了 Gemma 4 模型，修复了工具调用（tool calling）中的 bug 以及部分场景下的响应截断问题。这类“静默更新”在开源模型领域并不罕见，但 Google 未做任何公告，只在模型卡中注明变更。对开发者而言，模型版本号无法唯一标识行为，意味着生产依赖需要更严谨的校验机制。

> 原文：https://the-decoder.com/gemma-4-gets-a-stealth-update-that-fixes-tool-calling-bugs-and-truncated-responses-under-the-same-name/

当2.8T参数开源模型开始与最贵闭源掰手腕，模型发布的核心变量正在从“谁更强”转向“谁更便宜、更好用”。你会在自己的应用里换掉GPT-5.6去跑Kimi K3吗？


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


今天最值得关注的是 **Apple Intelligence 正式获批在华上线**，接入阿里巴巴 Qwen 和百度模型。这意味着苹果在 AI 监管最严格的市场终于拿到入场券，也侧面验证了中国大模型企业已具备服务全球头部设备商的能力。与此同时，xAI 首次起诉用户、现代工人因机器人罢工，提醒我们 AI 的商业化并非只有「高增长」叙事，合规和劳资矛盾正在成为真实成本。

### xAI 起诉 Grok 用户制造 CSAM

![company-00.jpg](/marginalia/assets/img/ai-hot/2026-07-17/company-00.jpg)


**是什么**：xAI 对一名用户提起首起诉讼，指控其利用 Grok 生成儿童性虐待内容（CSAM）。此前 xAI 一直回避该问题，本次起诉标志着策略转向。

**关键点**：诉讼对象是用户而非模型开发方，意在将责任归咎于「恶意使用」以减轻平台监管压力。同时，这是生成式 AI 公司首次因 CSAM 发起法律行动。

**为什么重要**：大模型的内容安全不是「可否认」的技术问题，而是必须面对的法律和伦理成本。xAI 的举动可能成为行业模板——起诉用户而非改进模型，但也暴露了当前技术手段难以根除这一顽疾。

> 原文：[Ars Technica](https://arstechnica.com/tech-policy/2026/07/xai-cant-deny-grok-makes-csam-anymore-so-its-suing-users/)

### 现代工人罢工抗议人形机器人上岗

![company-01.jpg](/marginalia/assets/img/ai-hot/2026-07-17/company-01.jpg)


**是什么**：现代汽车工人发起罢工，抗议公司计划在 2028 年前于美国工厂部署 2.5 万台 Atlas 人形机器人。这是首次因 AI 机器人引发的规模化罢工。

**关键点**：工人担忧岗位被替代，但现代强调机器人将从事焊接、组装等重复性工作，不直接取代现有职位。不过 2.5 万台的规模——相当于数万名劳动力——使工会无法信任企业承诺。

**为什么重要**：人形机器人从实验室走向工厂的速度远超预期，但劳资博弈才刚刚开始。如果此次罢工持续，可能倒逼政策层面出台「机器人税」或劳动力转换保障方案，影响整个制造业 AI 化的节奏。

> 原文：[Ars Technica](https://arstechnica.com/ai/2026/07/fear-of-humanoid-robots-spurs-human-workers-to-strike-at-hyundai-auto-factory/)

### Apple Intelligence 获准在华上线，接入阿里和百度 AI

![company-02.jpg](/marginalia/assets/img/ai-hot/2026-07-17/company-02.jpg)


**是什么**：苹果 AI 功能 Apple Intelligence 已获中国监管机构批准，将使用阿里巴巴的 Qwen 系列模型和百度的 AI 模型提供本地化服务。这是苹果在 AI 战略上的重要里程碑。

**关键点**：苹果未使用自研模型，而是选择与本土厂商合作，既规避数据出境监管，也借力成熟的中文大模型能力。Qwen 和百度成为首批进入苹果生态的中国大模型。

**为什么重要**：对中国 AI 公司而言，拿下苹果相当于获得了全球最大消费电子渠道的「认证」，有利于后续拓展其他跨国客户。对苹果而言，这是应对华为、小米等本土 AI 手机竞争的关键一步，也意味着其全球 AI 布局必须接受「一市场一策略」的现实。

> 原文：[TechCrunch](https://techcrunch.com/2026/07/16/apple-intelligence-approved-for-launch-in-china-with-alibabas-qwen-ai/)

### AI 热潮推动能源 IPO 创本世纪最快募资速度

![company-03.jpg](/marginalia/assets/img/ai-hot/2026-07-17/company-03.jpg)


**是什么**：得益于 AI 算力需求暴涨，能源公司（如数据中心供能、核电、天然气发电）上市募资速度创本世纪最快纪录。投资者急切寻找能分享 AI 红利的非科技标的。

**关键点**：多家能源公司在提交招股书后数周内完成 IPO，融资规模远超预期。典型逻辑是：AI 训练和推理需要海量电力，而现有电网难以满足增量，因此独立发电商和储能设施成为新宠。

**为什么重要**：AI 的「算力焦虑」正在传导至能源板块，使得传统能源公司获得了 AI 概念溢价。对投资人而言，这是少数「确定性高于炒作」的板块——因为无论哪个模型胜出，电都得用。但需警惕行业过热导致供给过剩。

> 原文：[Ars Technica](https://arstechnica.com/information-technology/2026/07/energy-ipos-surge-as-investors-hunt-for-ways-to-play-ai-boom/)

### 前 DeepMind 研究员未发布产品即获 3 亿美元估值

![company-04.jpg](/marginalia/assets/img/ai-hot/2026-07-17/company-04.jpg)


**是什么**：前 DeepMind 研究员 Andrew Dai 创办的视觉 AI 公司，尚未推出任何产品，即以 3 亿美元估值完成种子轮融资。该轮由顶级风投领投，团队背景为主要卖点。

**关键点**：种子轮估值已达独角兽级别，且无产品、无客户。投资人押注的是 DeepMind 的血统、视觉生成领域的潜力，以及押注下一个「Stable Diffusion」级别的平台。

**为什么重要**：人才溢价在 AI 领域已极端化。这种「Paper 估值」现象既反映了 AI 核心技术人才的稀缺，也暗藏风险——没有产品验证的公司一旦技术路线未达预期，估值可能瞬间崩塌。对行业而言，这加剧了人才囤积和资源错配。

> 原文：[TechCrunch](https://techcrunch.com/2026/07/16/how-a-former-deepmind-researcher-raised-at-a-300m-pre-seed-valuation-before-launching-a-product/)

### 石油化工 AI 公司 Applied Computing 获 2000 万美元 A 轮

![company-05.jpg](/marginalia/assets/img/ai-hot/2026-07-17/company-05.jpg)


**是什么**：Applied Computing 完成 2000 万美元 A 轮融资，旨在为石油天然气行业打造「全厂级 AI 基础模型」，即用一个模型理解整个工厂的运营数据。

**关键点**：不同于通用大模型，该公司专注于工业流程的时序数据和多模态融合，目标是预测设备故障、优化能耗、提高产量。客户均为大型能源企业。

**为什么重要**：工业 AI 是比消费级 AI 更「重」但付费意愿更强的赛道。石油化工行业数字化转型需求确定，且单个工厂年产值数亿美元，AI 带来的效率提升有直接财务回报。这条赛道可能诞生多个垂直龙头，但扩张速度会慢于互联网 AI。

> 原文：[TechCrunch](https://techcrunch.com/2026/07/15/applied-computing-wants-to-give-oil-and-gas-operators-an-ai-model-for-the-entire-plant/)

### 蔚来芯片公司神玑发布具身智能开发平台

![company-06.jpg](/marginalia/assets/img/ai-hot/2026-07-17/company-06.jpg)


**是什么**：蔚来旗下芯片公司神玑在 WAIC 2026 首次独立参展，发布睿动具身智能开发平台及分布式智能体平台，面向机器人开发者。

**关键点**：平台提供从芯片、算法到仿真环境的全套工具链，目标是降低具身智能研发门槛。神玑此前以汽车 AI 芯片闻名，这是其首次向通用机器人市场拓展。

**为什么重要**：蔚来正尝试将芯片能力从车端外溢到具身智能，但汽车与机器人对算力、功耗、实时性的要求差异较大，能否复用技术栈存疑。对行业而言，这意味着更多玩家在争夺「机器人操作系统」定义权。

> 原文：[36氪](https://36kr.com/newsflashes/3899667446613640)

### 阶跃与支付宝达成 AI Agent 系统级合作

**是什么**：阶跃星辰与支付宝在 WAIC 上宣布合作，基于阶跃的 STEP-X 终端，用户可通过自然语言直接调用支付宝的支付、出行、理财等服务，实现跨端智能体办事。

**关键点**：这不是简单的 API 接入，而是「系统级」合作——STEP-X 将成为支付宝服务的全新交互入口，用户无需打开支付宝 App。

**为什么重要**：这是 AI Agent 首次与国民级支付工具深度绑定，其意义在于：一旦用户习惯被培养，Agent 就不只是聊天机器人，而成为生活服务的「超级入口」。支付宝提供场景，阶跃提供终端——这是一次典型的能力互补，但也意味着支付安全、隐私授权等挑战需要共同解决。

> 原文：[雷锋网](https://www.leiphone.com/category/industrynews/owcf1OSxXWdhLsHd.html)

---

今天的动态有一个共同底色：**AI 正从「技术故事」变成「商业和社会的碰壁故事」**。xAI 面临法律底线、现代工人用罢工投票、苹果向监管妥协——这些都不是技术能够独立解决的事。留给读者的问题：当 AI 公司估值靠非技术因素（地缘、劳资、合规）来决定时，投资人的估值模型准备好了吗？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


**导语**：Google DeepMind与Isomorphic Labs今天联合发布生物弹性（bioresilience）方法，直指AI被恶意用于制造生物威胁的潜在风险。这是大型AI实验室首次系统化从模型层设计防御框架，而非事后检测。同时，机器人领域的RoboTTT论文将视觉运动上下文扩展到8K步，以及一项研究警告计算宣传可污染预训练数据，值得关注。

### DeepMind与Isomorphic Labs提出生物弹性AI方法

![research-00.jpg](/marginalia/assets/img/ai-hot/2026-07-17/research-00.jpg)


**是什么**：Google DeepMind与Isomorphic Labs联合发布了一份白皮书，阐述其“生物弹性”方法——在AI系统的设计、训练和部署阶段嵌入防护措施，以降低模型被用于设计或增强生物威胁的风险。该方法涵盖数据过滤、输出监控、红队测试及与生物安全专家的协作。

**关键点**：与常见的“检测-响应”安全策略不同，生物弹性主张从源头减少模型对有害生物知识的习得，并确保即使模型被诱导，也无法产生可操作的危险输出。白皮书同时承认，没有完美方案，但提供了一套可迭代的实践框架。

**为什么重要**：这是前沿AI实验室首次将生物威胁防御从“事后补救”升级为“事前构建”。对于投资人和技术从业者，它意味着AI安全将催生新的评估标准和合规要求，尤其是涉及基因编辑、病原体等领域时。LLM的能力越强，这类“软约束”方法就越关键。

> 原文：[https://deepmind.google/blog/our-approach-to-bioresilience/](https://deepmind.google/blog/our-approach-to-bioresilience/)

### RoboTTT：机器人策略在测试时训练，上下文扩展至8K步

![research-01.jpg](/marginalia/assets/img/ai-hot/2026-07-17/research-01.jpg)


**是什么**：论文《RoboTTT》提出了“测试时训练”（Test-Time Training）方法，让机器人在推理阶段继续学习，从而将视觉运动上下文窗口从通常的百步级别扩展到8000个时间步。

**关键点**：该方法通过一个轻量级适配器在测试时快速微调策略，使机器人能够记住并利用长达数分钟的历史信息。在长时任务（如多步操作、导航）上，性能相比基线提升超过30%。

**为什么重要**：传统机器人策略受限于有限上下文，长时任务容易遗忘。RoboTTT提供了一条不依赖更大量训练数据或更大模型的路径。对于关注具身智能或机器人自动化的从业者，这是实现“持续学习”实际部署的重要一步。

> 原文：[http://arxiv.org/abs/2607.15275v1](http://arxiv.org/abs/2607.15275v1)

### SciDiagramEdit：从论文修订中学习自动编辑科学图表

![research-02.jpg](/marginalia/assets/img/ai-hot/2026-07-17/research-02.jpg)


**是什么**：这篇论文提出了SciDiagramEdit系统，能够从论文的修订历史中自动学习如何编辑科学图表（如调整坐标轴、标注、配色等），无需人工标注修改指令。

**关键点**：系统利用diff信息捕捉作者的真实编辑意图，训练一个视觉-语言模型来预测并执行编辑动作。在多个学科图表上，编辑成功率超过80%。

**为什么重要**：科学图表编辑繁琐且易出错。该工具可大幅降低科研人员制作高质量图表的时间成本，尤其适用于论文返修阶段的快速调整。对于学术出版工具和科研效率提升，这是一个直接可用的技术方案。

> 原文：[http://arxiv.org/abs/2607.15272v1](http://arxiv.org/abs/2607.15272v1)

### 研究警告：计算宣传可污染LLM预训练数据，且难以检测

![research-03.jpg](/marginalia/assets/img/ai-hot/2026-07-17/research-03.jpg)


**是什么**：新论文通过实验证明，攻击者可以利用计算宣传手段——例如大规模生成看似无害但包含隐藏有害模式的文本——污染LLM的预训练数据，使模型在特定条件下输出危险内容。

**关键点**：这种污染手法不依赖数据投毒的传统方式（直接插入恶意样本），而是通过语义隐藏副通道（如特定词汇序列或句子结构）来触发。现有的数据清洗和检测方法几乎无法识别这类攻击。

**为什么重要**：随着LLM依赖大规模互联网爬取数据，此类“隐蔽污染”的风险被严重低估。对于平台方和模型开发者，本研究提示需要更细粒度的数据溯源和对抗训练机制。对于投资人，这是评估模型安全底座的前置指标。

> 原文：[http://arxiv.org/abs/2607.15267v1](http://arxiv.org/abs/2607.15267v1)

### Beyond Success Rate：引入推理预算的安全Agent评估

![research-04.jpg](/marginalia/assets/img/ai-hot/2026-07-17/research-04.jpg)


**是什么**：论文《Beyond Success Rate》提出了一种成本感知的安全Agent评估框架，在评估Agent（如自主编码助手、网页导航工具）时，不再只看最终任务成功率，而是同时考虑其推理预算（如API调用次数、计算时间）与安全违规率。

**关键点**：传统评估只测“能否完成”，忽略了Agent在“试错”过程中可能产生的危险行为（如泄露敏感数据、执行恶意指令）。新框架通过引入帕累托前沿，可同时衡量效率与安全性。

**为什么重要**：Agent正在从演示走向生产，但安全评估方法还停留在“巅峰能力”比较。本研究直接回应了“如何客观对比不同Agent的安全水平”这一行业痛点，对Agent平台和监管方都有参考价值。

> 原文：[http://arxiv.org/abs/2607.15263v1](http://arxiv.org/abs/2607.15263v1)

### SearchOS-V1：工具集成LLM实现鲁棒开放域信息搜索Agent协作

![research-05.jpg](/marginalia/assets/img/ai-hot/2026-07-17/research-05.jpg)


**是什么**：SearchOS-V1是一个新系统，通过集成多种工具（搜索引擎、代码执行器、文档解析器等）的LLM Agent，完成复杂的开放域网页搜索任务，并设计了一套记忆机制来缓解长历史跟踪问题。

**关键点**：系统采用模块化Agent协作，每个子Agent负责特定工具，并通过共享上下文池保持历史一致性。在复杂多步搜索（如比较不同产品、跟踪实时变化）上，成功率相比单Agent基线提升近一倍。

**为什么重要**：当前LLM Agent在长流程、多源信息整合中容易丢失上下文或出错。SearchOS-V1提供了一种实用的“Agent联邦”架构，对构建可靠的信息搜索、竞品分析、市场研究工具具有借鉴意义。

> 原文：[http://arxiv.org/abs/2607.15257v1](http://arxiv.org/abs/2607.15257v1)

---

**结语**：今天的研究释放了一个清晰信号——AI安全正在从“检测”走向“设计”，而Agent的长上下文能力不再只是“更好用”，更是“更可靠”的前提。当你评估下一轮AI投资时，哪篇论文最有可能改变技术栈的平衡？


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


OpenAI 今天推出了 Codex Micro——一款可编程游戏杆控制器，让开发者用摇杆和旋钮操作编码 Agent，而非打字。与此同时，千问将 AI 眼镜升级为智能体眼镜，支持语音、眼动和第三方 Skill 调用。AI 应用正从纯软件向着硬件化、多模态交互加速演进。

### OpenAI 发布 Codex Micro：一个用于控制 AI 代理的物理游戏杆

![product-00.jpg](/marginalia/assets/img/ai-hot/2026-07-17/product-00.jpg)


**是什么**  
OpenAI 推出 Codex Micro，一个可编程游戏杆控制器，专为控制 AI 编码代理（Codex agent）设计，配备旋钮和 LED 指示灯。开发者可以通过物理摇杆来导航代码、选择片段、执行命令，不再依赖键盘输入。

**关键点**  
- 产品形态：类似游戏手柄，但只有摇杆、几个按钮和旋钮，极简交互。  
- 目标用户：使用 Codex 进行编程的开发者，尤其是沉浸式编码场景。  
- 定位：并非替代终端，而是为 agentic coding 提供一种更直觉的操控方式。

**为什么重要**  
这是 OpenAI 从纯软件跨入硬件的标志性一步。它暗示着 AI 代理的交互范式正在从“命令行+自然语言”向“物理控制+多模态”演进。如果成功，可能会催生一类新的开发者外设。

> 原文：https://the-decoder.com/openai-wants-developers-to-stop-typing-commands-and-start-using-a-joystick-to-control-their-ai-agents/

### Google Vids 加入 AI 化身功能，用户可“参演”视频

![product-01.jpg](/marginalia/assets/img/ai-hot/2026-07-17/product-01.jpg)


**是什么**  
Google Vids 推出个性化 AI 头像功能，用户可以创建自己的数字分身，并让该分身出现在生成的视频中。同时集成 Gemini Omni 工具，支持多模态内容编辑。

**关键点**  
- 用户上传几张照片即可生成数字分身，可调整表情、动作、背景。  
- 视频内容完全由 AI 生成，用户只需提供脚本或提示。  
- 集成 Gemini Omni，可同时处理文本、图像、语音，让视频制作更流畅。

**为什么重要**  
这标志着“人人皆可演”的视频生成产品化落地，降低了 UGC 视频的门槛。对于产品经理和内容创作者而言，这是快速制作个性化视频（如营销、培训）的实用工具，也展示了头部平台如何将多模态模型无缝嵌入现有产品。

> 原文：https://techcrunch.com/2026/07/16/google-vids-now-lets-you-star-in-your-own-ai-videos/

### Roblox 移动端上线 AI 一键生成游戏

![product-02.jpg](/marginalia/assets/img/ai-hot/2026-07-17/product-02.jpg)


**是什么**  
Roblox 在其移动应用中推出“Build”功能，用户只需输入文字提示（如“一个海盗冒险岛”），即可自动生成基础游戏场景、角色和交互逻辑。

**关键点**  
- 面向移动端用户，降低游戏创建门槛至“一句话”。  
- 生成的游戏虽为基础框架，但可后续手动调整。  
- 填补了 Roblox 在移动端无原生创作工具的空白。

**为什么重要**  
Roblox 的生态核心是 UGC 游戏，AI 生成功能可能大幅扩大创作者基数，同时改变平台内容供给结构。投资人应关注该功能是否会稀释高质量游戏占比，或带来新的 monetization 模式（如生成即变现）。

> 原文：https://techcrunch.com/2026/07/16/roblox-launches-an-ai-powered-game-creation-feature-in-its-mobile-app/

### Google AI Mode 升级：从回答问题到跨应用执行任务

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-07-17/product-03.jpg)


**是什么**  
Google 扩展了 AI Mode 的能力，用户现在可以将其与第三方应用（如日历、邮件、购物清单等）链接，实现跨应用任务执行。例如“根据下周的会议安排，在 DoorDash 上预订午餐”。

**关键点**  
- 支持的应用列表正在扩展，首批包括 Gmail、Google Calendar、DoorDash、Spotify 等。  
- 用户授权后，AI Mode 可以直接在应用中执行操作（创建事件、下单等）。  
- 本质是 Agentic 能力的开放，将搜索从信息检索升级为行动引擎。

**为什么重要**  
这是 Google 构建“AI 操作系统”的关键一步。跨应用任务执行意味着 Google AI Mode 正在成为用户与第三方服务之间的智能中转站。对于开发者，这意味着需要为 AI Agent 准备可被调用的 API 或 action 端点。

> 原文：https://techcrunch.com/2026/07/16/googles-ai-mode-now-lets-you-link-and-interact-with-select-apps/

### DoorDash 推出命令行工具 dd-cli，专为 AI Agent 设计

![product-04.jpg](/marginalia/assets/img/ai-hot/2026-07-17/product-04.jpg)


**是什么**  
DoorDash 开放 dd-cli 公测，允许开发者通过终端搜索餐厅、构建购物车并直接下单。该工具尤其是为 AI Agent（如代码代理、自动化脚本）设计的。

**关键点**  
- 支持 `doordash search "pizza"`, `doordash add-item`, `doordash checkout` 等命令。  
- 输出结构化 JSON，方便 Agent 解析。  
- 旨在让 AI 能够代表用户完成外卖点餐这一高频任务。

**为什么重要**  
这代表了消费级服务在 Agentic 时代的基础设施建设——为 AI 提供可编程接口。DoorDash 主动适配 AI Agent 的趋势，可能成为其他本地生活服务的范本。对于技术从业者，这意味着可以自定义自动化流程（如“下班时自动点餐”）。

> 原文：https://techcrunch.com/2026/07/16/yes-you-can-now-order-doordash-from-the-command-line/

### Google NotebookLM 正式更名 Gemini Notebook，开放搜索应用集成

![product-05.jpg](/marginalia/assets/img/ai-hot/2026-07-17/product-05.jpg)


**是什么**  
Google 将 NotebookLM 重新品牌为 Gemini Notebook，并将底层的搜索应用能力开放给第三方集成，允许其他应用使用其多模态搜索与摘要功能。

**关键点**  
- 命名统一到 Gemini 品牌下，增强认知一致性。  
- 开放的搜索应用 API 允许开发者将 Notebook 的搜索+推理能力嵌入自己的产品。  
- 原有用户数据、笔记功能不受影响。

**为什么重要**  
更名意味着 Google 正在将 NotebookLM 从实验性产品升级为平台级能力。第三方集成可能催生知识管理、企业文档搜索等场景的新应用。产品经理可以思考如何利用 Gemini Notebook 的底层能力提升自家产品的信息处理效率。

> 原文：https://the-decoder.com/google-rebrands-notebooklm-as-gemini-notebook-and-opens-its-search-app-to-third-party-integration/

### 千问 AI 眼镜升级为智能体眼镜，支持全双工语音与眼动追踪

**是什么**  
千问宣布其 AI 眼镜升级为“智能体眼镜”（Agent Glasses），支持按需调用第三方 Skill 和 Agent，新增全双工语音交互、眼动追踪等功能。

**关键点**  
- 全双工语音：用户无需唤醒词即可持续对话。  
- 眼动追踪：可通过视线选择菜单、确认操作。  
- 第三方 Agent/Skill 生态：类似手机应用商店，但面向眼镜场景（如导航、翻译、购物）。

**为什么重要**  
这是 AI 可穿戴设备从“AI 助手”向“AI 代理平台”演变的一个实例。与 OpenAI 的游戏杆不同，千问选择眼镜作为 Agent 的物理载体，强调“解放双手”场景。产品经理可关注其第三方生态如何构建，以及能否复制手机应用商店的飞轮效应。

> 原文：https://www.leiphone.com/category/industrynews/JDlu3Gqj7atcWniy.html

### OpenAI 推出 ChatGPT 品牌篮球（没错，是篮球）

![product-07.jpg](/marginalia/assets/img/ai-hot/2026-07-17/product-07.jpg)


**是什么**  
OpenAI 发布了一款印有 ChatGPT 标志的篮球，这是其首个“硬件”产品（非 Codex Micro），售价不明。该产品引发社交媒体热议和困惑。

**关键点**  
- 与篮球无关，与 AI 无关，纯粹是品牌周边。  
- 可能是营销噱头，也可能是对“AI 硬件”概念的一种解构。  
- 引发“OpenAI 为什么卖篮球”的讨论，热度远超实际价值。

**为什么重要**  
对于一家估值数千亿美元的公司来说，推出周边产品通常意味着品牌建设进入快车道。但相比 Codex Micro 的严肃硬件，篮球更像一个信号：OpenAI 愿意尝试非理性营销，以扩大品牌大众认知。投资人不必过度解读，但它提醒我们：AI 公司也需要“文化符号”。

> 原文：https://techcrunch.com/2026/07/16/why-is-openai-selling-a-chatgpt-basketball/

---

今天的产品线清晰地分为三条路：AI 控制硬件（游戏杆、眼镜）、AI 化身/生成（Vids、Roblox）和 AI 行动引擎（Google AI Mode、dd-cli）。你会为哪个场景写第一行代码？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


Linux创始人Linus Torvalds用“fork or shut up”的姿态捍卫AI编码工具，而欧盟同日裁定谷歌必须向竞争对手开放搜索数据与Android AI。两件事合在一起，说明AI的普及已从技术选择上升到规则重塑——不认同就自己改，不改就按法律改。

### Linus：不爽AI就fork

![opinion-00.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opinion-00.jpg)


Linus Torvalds在 Linux 内核邮件列表中公开支持AI辅助编码，对批评者直言“要么 fork，要么走人”。关键点：他认为AI工具能提升内核开发效率，反对者若不喜欢可以自建分支。为什么重要：在开源世界，Linus的态度往往定调实际接纳度，这标志着AI已不只是“玩具”，而是核心开发流程的标配。  
> 原文：https://arstechnica.com/ai/2026/07/linus-torvalds-to-critics-of-ai-coding-in-linux-fork-it-or-just-walk-away/

### 欧盟强制谷歌共享搜索数据，开放Android AI

![opinion-01.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opinion-01.jpg)


欧盟委员会正式裁定，谷歌必须向竞争对手授权搜索数据，并允许第三方AI在Android上原生运行。谷歌警告此举可能削弱安全和隐私保护。为什么重要：这起案件为全球AI反垄断树立标杆，一旦落地，将打破搜索数据与移动端的AI垄断，让更多小而美的AI产品有机会直接触达十亿级用户。  
> 原文：https://arstechnica.com/gadgets/2026/07/its-official-eu-will-force-google-to-share-search-data-and-open-up-ai-on-android/

### 德国全球首例：AI搜索纳入媒体法

![opinion-02.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opinion-02.jpg)


德国媒体监管机构裁定，谷歌AI Overviews和Perplexity等AI搜索产品必须遵守媒体法，包括内容来源标识、更正权等义务。为什么重要：这是全球首个将AI摘要视为“媒体内容”而非“工具”的判例，意味着AI搜索在法律上要承担与新闻机构类似的责任，影响后续欧盟立法走向。  
> 原文：https://the-decoder.com/germany-puts-googles-ai-overviews-and-perplexity-under-media-law-in-first-of-its-kind-ruling/

### Anthropic加速推动各州AI监管立法

![opinion-03.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opinion-03.jpg)


Anthropic政策负责人表示，去年支持的加州和纽约AI透明法律可能已过时，正推动各州制定更严格的监管规则。为什么重要：与OpenAI积极游说联邦法案不同，Anthropic选择“从州突围”，这反映了大模型公司对碎片化监管与先发优势的不同判断——谁能主导地方规则，谁就能在合规成本上卡住对手。  
> 原文：https://www.wired.com/story/why-anthropic-is-pushing-states-to-regulate-ai-faster/

### 未来实验室应像数据中心

![opinion-04.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opinion-04.jpg)


Lila Sciences联合创始人Andy Beam与Rafa Gómez-Bombarelli阐述他们如何将实验流程与AI基础设施深度耦合，让科学实验像数据中心一样可编排、可重复。为什么重要：这代表了AI for Science从“辅助工具”到“实验操作系统”的范式转变——未来的实验室不是更多试管，而是更多GPU。  
> 原文：https://www.latent.space/p/the-lab-of-the-future-should-feel

### OpenAI呼吁给青少年安全使用AI

OpenAI发布原则文章，主张青少年有权在安全前提下使用AI，包括年龄防护、学习辅助和家长控制。为什么重要：这一表态是AI厂商首次正面回应未成年用户群体，背后是争夺下一代用户的心智与信任，同时规避潜在的伦理诉讼。  
> 原文：https://openai.com/index/why-teens-deserve-access-safe-ai

### Netflix已有300部AI参与制作的内容

![opinion-06.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opinion-06.jpg)


Netflix确认其内容库中已有300部作品使用了AI技术，涵盖剧本辅助、生成式视觉、后期自动化等。为什么重要：这项数据直观展示了AI在娱乐行业的渗透速度——内容制作效率正在被重新定义，投资人与从业者需重新评估“AI是否会替代创意岗位”这个问题。  
> 原文：https://the-decoder.com/netflixs-300-ai-productions-show-how-fast-the-technology-is-spreading-through-entertainment/

### 评论：AI功能应默认为opt-in

![opinion-07.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opinion-07.jpg)


作者呼吁禁止默认启用生成式AI功能后让用户手动opt-out的做法，改为默认关闭、用户自愿开启。为什么重要：这与欧盟监管的“知情同意”逻辑一致，但当前大多数产品选择直接默认开启以获取数据。这一争论将在用户体验、隐私合规与AI采纳率之间反复拉扯。  
> 原文：https://www.wired.com/story/please-stop-making-me-opt-out-of-ai/

监管与开源的碰撞，正在把 AI 从“技术选项”变成“基础设施规则”。当 Linus 和欧盟都在说“不改变就离开”时，你更怕谁？


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


今日开源板块最值得关注的是xAI在数据泄露事件后开源命令行工具Grok-Build，这既是对外展示透明度的举动，也可能是重建信任的策略。此外，Anthropic发布知识工作插件库，实用主义开源趋势明显。同时，OpenCut作为CapCut的开源替代、PostHog的AI可观测性工具等值得开发者留意。

### xAI 开源 Grok-Build：数据泄露后的透明化行动

![opensource-00.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opensource-00.jpg)


xAI 在遭遇大规模数据泄露后，选择将其命令行工具 Grok-Build 在 GitHub 上开源。该项目是 xAI 内部用于构建和部署 Grok 模型的基础工具，公开后允许开发者审查代码并自行搭建类似流程。关键点在于此次开源动机特殊——在安全事件后开放核心工具，以提升社区信任。但需注意，开源版本可能剥离了敏感生产配置，实际应用需谨慎调试。为什么重要：xAI 首次将核心基础设施开源，或为后续模型权重部分开放铺路，也反映出 AI 公司面临安全压力时转而拥抱透明度。

> 原文：[the-decoder](https://the-decoder.com/xai-open-sources-grok-build-on-github-after-massive-data-breach/)

### OpenCut：CapCut 的开源替代品

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opensource-01.jpg)


OpenCut 正式发布，定位为字节跳动 CapCut 的自由开源替代。它支持多轨道剪辑、滤镜、文字特效等基础功能，采用 GPL v3 许可。关键点：OpenCut 目前仍处于早期阶段，功能不如 CapCut 完整，但无云服务依赖且可本地化部署。为什么重要：视频编辑领域长期缺乏成熟的 FOSS 选项，OpenCut 的出现填补了这一空白，适合隐私敏感型团队或需要自定义工作流的内容创作者。

> 原文：[GitHub](https://github.com/OpenCut-app/OpenCut)

### PostHog 推出 AI 可观测性工具：代理诊断利器

![opensource-02.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opensource-02.jpg)


PostHog，这个自驱动的产品分析平台，新增了 AI 可观测性功能。开发者可通过它监控 LLM 调用链、Agent 行为轨迹以及 Token 消耗，及时发现幻觉或循环错误。关键点：PostHog 本身是开源产品分析工具，与 LangSmith 等 SaaS 方案不同，它允许自托管数据，现在又集成了 AI 调试能力，且覆盖 agentic 场景。为什么重要：随着 AI Agent 增多，开源自托管可观测性方案变得稀缺，PostHog 可能成为 AI 应用团队的标配基础设施。

> 原文：[GitHub](https://github.com/PostHog/posthog)

### Thinking Machines Lab 开源 Tinker Cookbook

Thinking Machines Lab 发布 Tinker Cookbook，这是一套用于模型后训练的配方和工具集合，包含指令微调、RLHF 等常见流程的参考实现。关键点：项目提供模块化的 YAML 配置，可直接与 HuggingFace 框架集成。为什么重要：后训练工具链目前碎片化严重，Tinker Cookbook 提供了一个统一的开源起点，尤其适合中小团队快速实验模型对齐。

> 原文：[GitHub](https://github.com/thinking-machines-lab/tinker-cookbook)

### Open Interpreter 接入 Kimi K3

![opensource-04.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opensource-04.jpg)


Open Interpreter 更新支持 Kimi K3 模型，成为该低成本模型的编码 Agent 前端。关键点：Kimi K3 主打低价长上下文，结合 Open Interpreter 可在本地替代部分云 API 调用。为什么重要：这进一步验证了开源 Agent 框架对新兴低成本模型的快速适配能力，也降低了构建代码助手的经济门槛。

> 原文：[GitHub](https://github.com/openinterpreter/openinterpreter)

### GitHub 发布 Copilot SDK：将 Agent 嵌入任意应用

![opensource-05.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opensource-05.jpg)


GitHub 推出多平台 Copilot CLI SDK，允许开发者将 Copilot Agent 集成到自己的应用和服务中，支持 Node.js、Python、Go 等环境。关键点：SDK 封装了认证、对话流和上下文管理，开发者可快速构建 AI 助手。为什么重要：这是 Copilot 从编辑器插件走向平台化服务的关键一步，但厂商锁定风险需评估。

> 原文：[GitHub](https://github.com/github/copilot-sdk)

### Hermes Agent：可成长的个性化 AI 代理

![opensource-06.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opensource-06.jpg)


Nous Research 开源 Hermes Agent，强调该代理能根据用户交互历史调整行为，实现个性化。关键点：基于 Hermes 系列模型构建，支持记忆模块和技能学习。为什么重要：个性化 Agent 是当前热点，但多数方案依赖商业 API，Hermes Agent 的完全开源设计为隐私偏好用户提供了新选择。

> 原文：[GitHub](https://github.com/NousResearch/hermes-agent)

### Anthropic 开源知识工作插件库

![opensource-07.jpg](/marginalia/assets/img/ai-hot/2026-07-17/opensource-07.jpg)


Anthropic 发布一系列开源插件，将 Claude Cowork 转换为特定角色（如数据分析师、法律助理）的专业工具。关键点：插件采用模块化设计，可组合使用，社区可贡献新插件。为什么重要：Anthropic 采取“开源插件”策略，一方面扩大 Claude 生态，另一方面避免开放核心模型权重，是一种折中的生态构建方式。

> 原文：[GitHub](https://github.com/anthropics/knowledge-work-plugins)

今日开源项目多数瞄准“工具化”和“可观测性”，xAI 的透明化举动最引人深思——当数据泄露成为常态，开源是否是最有效的公关？
