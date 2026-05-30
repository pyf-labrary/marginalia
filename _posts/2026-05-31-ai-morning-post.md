---
layout: "ai-hot"
title: "AI 晨报 · 2026-05-31"
date: "2026-05-31 06:00:00 +0800"
author: "Marginalia"
description: "2026-05-31 的 AI 圈每日动态汇总：StepFun推出Step 3.7 Flash，198B参数MoE架构，原生视觉支持，256k上下文，面向编程Agent与搜索工作流。海光同日完成适配。"
excerpt: "StepFun推出Step 3.7 Flash，198B参数MoE架构，原生视觉支持，256k上下文，面向编程Agent与搜索工作流。海光同日完成适配。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 4 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 8 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 6 }
  - { id: product, name: "应用产品", emoji: "📱", count: 8 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 8 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 8 }
---

今天最值得看的三件事：

- **模型发布** · StepFun发布Step 3.7 Flash：198B MoE视觉语言模型
- **公司动态** · 软银拟投资750亿欧元建设法国数据中心
- **开源工具** · Anthropic开源Claude Code终端编程工具

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


**导语**：今天最值得看的模型发布是StepFun的198B MoE视觉语言模型Step 3.7 Flash，以原生视觉+256k上下文直指编程Agent和搜索工作流。海光同日适配，本土化部署速度值得关注。同时Liquid AI开源8B-A1B MoE、英伟达开源Eagle视觉模型，生态持续分化。

### StepFun发布Step 3.7 Flash：198B MoE视觉语言模型

![model_release-00.jpg](/marginalia/assets/img/ai-hot/2026-05-31/model_release-00.jpg)


**是什么**：StepFun（阶跃星辰）推出Step 3.7 Flash，198B参数MoE（混合专家）架构，原生支持视觉输入，上下文长度256k token。模型面向编程Agent与搜索工作流场景，同日海光（Hygon）完成适配，可在国产硬件上部署。

**关键点**：参数规模为198B（含激活参数推测较低），MoE架构推理效率优于稠密模型；256k上下文在长代码、多轮搜索场景有优势；海光适配意味着国产算力闭环加速。

**为什么重要**：这是国内少数对标GPT-5级别视觉语言模型的开源/商用选择，尤其针对编程Agent这一实战场景。海光适配进一步降低了大模型国产化落地的门槛。对于技术团队，值得评估其在代码补全、RAG搜索中的实际延迟与精度。

> 原文：[StepFun releases Step 3.7 Flash](https://www.marktechpost.com/2026/05/29/stepfun-releases-step-3-7-flash-a-198b-moe-vision-language-model-for-coding-agents-and-search-workflows/)

### Liquid AI发布8B-A1B MoE模型，训练于38T tokens

![model_release-01.jpg](/marginalia/assets/img/ai-hot/2026-05-31/model_release-01.jpg)


**是什么**：Liquid AI推出LFM 2.5 8B-A1B，8B总参数、1B激活参数的MoE模型，训练数据量为38T tokens。模型在多项基准（MMLU, HumanEval等）表现超越同规模竞品，在Hacker News引发热议。

**关键点**：仅1B激活参数即可达到较优性能，推理成本极低；训练数据量38T远超同体量模型（如8B稠密模型通常只训练2-4T），数据质量与混合策略可能是关键差异。

**为什么重要**：对于边缘设备、实时推理场景，这类“小激活”MoE模型极具吸引力。Liquid AI延续其神经架构搜索+高效训练的路线，可能重新定义8B级别性价比上限。

> 原文：[Liquid AI LFM 2.5 8B-A1B](https://www.liquid.ai/blog/lfm2-5-8b-a1b)

### OpenAI升级GPT-5.5 Instant可读性，逐步淘汰旧模型

![model_release-02.jpg](/marginalia/assets/img/ai-hot/2026-05-31/model_release-02.jpg)


**是什么**：OpenAI为GPT-5.5 Instant模型提升可读性（readability），同时开始淘汰两个较老模型版本，具体版本号未披露。该升级主要改进输出文本的流畅度与逻辑连贯性。

**关键点**：可读性提升可能针对长文本生成场景（如报告、邮件）；淘汰旧模型是OpenAI惯用的模型生命周期管理，暗示GPT-5.5 Instant已稳定并进入大规模替换阶段。

**为什么重要**：对于API调用者，需关注旧模型下线时间线以避免生产环境中断。可读性提升对To C应用体验直接影响，但对技术判断而言，本次更新幅度较小，属常规迭代。

> 原文：[OpenAI gives GPT-5.5 Instant a readability upgrade](https://the-decoder.com/openai-gives-gpt-5-5-instant-a-readability-upgrade-while-phasing-out-two-older-models/)

### 英伟达发布Eagle视觉语言模型，数据驱动策略

![model_release-03.jpg](/marginalia/assets/img/ai-hot/2026-05-31/model_release-03.jpg)


**是什么**：NVlabs（英伟达研究）开源Eagle系列视觉语言模型，采用“数据为中心”的训练策略，即通过精心设计训练数据集（而非单纯增大模型或数据量）来提升性能。模型在多个视觉语言榜单（如MMBench、MMMU）上取得领先。

**关键点**：开源权重，社区可复现；数据积累是英伟达做多模态的核心壁垒，这次公开了部分数据策略思路；模型规模未详细公布，但侧重中等规模（7B-13B级别）。

**为什么重要**：英伟达从“算力提供商”转向“算法开源者”，Eagle的出现可能影响视觉语言模型的技术路线——数据质量比模型规模更关键。对产品经理而言，这是评估多模态能力底座的又一选择。

> 原文：[NVlabs/Eagle GitHub](https://github.com/NVlabs/Eagle)

**结语**：模型发布进入“开卷考试”阶段，198B MoE、1B激活MoE、数据驱动视觉模型——资源效率与场景专注正在取代纯参数竞赛。如果只能关注一个信号，Step 3.7 Flash的国产化适配进度值得追踪。


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


导语：今天最值得看的消息是软银宣布投资750亿欧元在法国建设5吉瓦数据中心，这是AI基础设施领域迄今最大手笔之一，标志着欧洲正成为算力军备赛的新战场。与此同时，Groq、OpenRouter分别完成新融资，微软与英伟达密谋Agent原生PC，AI产业链各环节的资本与战略动作密集落地，值得逐一拆解。

### 软银拟投750亿欧元，法国或成欧洲AI算力中心

![company-00.jpg](/marginalia/assets/img/ai-hot/2026-05-31/company-00.jpg)


软银宣布计划投资高达750亿欧元，在法国开发和运营多达5吉瓦的数据中心容量，专门为AI计算提供基础设施。这一规模远超此前任何单一数据中心的投资计划，显示出软银对AI算力需求的长期押注。关键点：投资额750亿欧元、总容量5GW、落地法国。为什么重要：欧洲在AI基建竞赛中一直落后于美国和中国，软银此举可能撬动更多资本流向该地区，同时巩固法国作为欧洲AI枢纽的地位。风险在于，此类超大规模项目周期长、回报不确定，但一旦建成，将显著改变全球算力分布。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/30/softbank-says-it-will-invest-up-to-e75-billion-to-build-french-data-centers/)

### AI芯片创企Groq融资6.5亿美元，转向推理服务

![company-01.jpg](/marginalia/assets/img/ai-hot/2026-05-31/company-01.jpg)


继英伟达20亿美元收购传闻落空后，AI芯片初创公司Groq正筹集6.5亿美元内部资金，将重心从训练芯片转向AI推理服务。关键点：融资额6.5亿美元、此前有收购传闻、战略转向推理。为什么重要：推理是AI落地商业化的关键环节，Groq选择避开与英伟达在训练领域的正面竞争，押注推理市场的高增长。这反映了AI芯片行业的分化趋势——专用推理芯片和云推理服务正在成为新风口。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/29/after-nvidias-20b-not-acqui-hire-ai-chip-startup-groq-reportedly-raising-650m/)

### OpenRouter完成1.13亿美元B轮，模型路由成新基建

![company-02.jpg](/marginalia/assets/img/ai-hot/2026-05-31/company-02.jpg)


AI模型路由平台OpenRouter宣布获1.13亿美元B轮融资，资金将用于扩展服务和支持更多模型。关键点：B轮1.13亿美元、路由平台、多模型接入。为什么重要：随着大模型数量激增，开发者需要一个统一的接口来调用、比较和切换不同模型。OpenRouter正是扮演这一“中间层”角色，其融资表明市场对模型管理工具的需求正在爆发，类似于API网关在云时代的价值。

> 原文：[OpenRouter](https://openrouter.ai/announcements/series-b)

### 微软英伟达联手打造AI PC，Agent将取代Copilot

![company-03.jpg](/marginalia/assets/img/ai-hot/2026-05-31/company-03.jpg)


据爆料，微软和英伟达正在合作开发新一代AI PC，可以直接运行自主Agent，取代传统的Copilot体验。关键点：AI PC原生Agent、微软英伟达合作、取代Copilot。为什么重要：如果成真，这将是PC交互范式的根本转变——从“问答助手”升级为“替用户执行任务的Agent”。英伟达提供底层算力，微软负责系统集成，两者联手可能重新定义PC在AI时代的角色，对苹果、高通等竞争对手形成压力。

> 原文：[The Decoder](https://the-decoder.com/microsoft-and-nvidia-reportedly-team-up-on-ai-pcs-that-run-actual-agents-instead-of-copilot/)

### Meta泄露路线图：AI挂件、超级感知眼镜与企业可穿戴

![company-04.jpg](/marginalia/assets/img/ai-hot/2026-05-31/company-04.jpg)


Meta内部备忘录泄露其硬件路线图，包括AI挂件、超级感知眼镜以及面向企业的可穿戴设备战略。关键点：AI挂件（类似别针、挂坠）、超级感知（超越人类视觉听觉？）、企业市场。为什么重要：Meta在AR/VR领域持续投入后，转向更轻量、可日常佩戴的AI硬件，这是对“下一代计算平台”的另一次试探。如果成功，AI挂件可能成为继智能手表后的新爆款品类；如果失败，则可能重演Quest系列的用户教育难题。

> 原文：[The Decoder](https://the-decoder.com/metas-leaked-memo-reveals-ai-pendant-supersensing-glasses-and-enterprise-wearables-strategy/)

### Anthropic超越OpenAI，成为全球最具价值AI创业公司

![company-05.jpg](/marginalia/assets/img/ai-hot/2026-05-31/company-05.jpg)


据报道，Anthropic估值超越OpenAI，成为全球最具价值AI初创企业。关键点：估值超越、AI创业格局变化。为什么重要：Anthropic以“更安全、更可控”的AI理念著称，其估值反超OpenAI说明资本更看重“负责任的AI”叙事，而非纯粹的技术领先。这也意味着OpenAI在商业化与安全平衡上面临更激烈的竞争，双方的人才争夺和市场定位大战将进一步升级。

> 原文：[Qazinform](https://qazinform.com/news/anthropic-surpasses-openai-to-become-worlds-most-valuable-ai-startup) （来源报道；原始信息待交叉验证）

### 比亚迪自研4nm AI芯片，对标英伟达用于智能驾驶

![company-06.jpg](/marginalia/assets/img/ai-hot/2026-05-31/company-06.jpg)


比亚迪发布自研AI芯片，采用4nm工艺，算力强大，将全面应用于智能驾驶系统。关键点：4nm制程、自研、智能驾驶专用。为什么重要：车企自研AI芯片成为趋势（特斯拉、小鹏之后），比亚迪此举既能降低成本，又能实现软硬件深度整合，提升智驾竞争力。同时，4nm制程意味着比亚迪在芯片设计能力上逼近国际大厂，未来可能向外部供应，挑战英伟达在车规级AI芯片的地位。

> 原文：[量子位](https://www.qbitai.com/2026/05/426557.html)

### 韩国AI芯片创企XCENA融资1.35亿美元，押注内存是AI瓶颈

![company-07.jpg](/marginalia/assets/img/ai-hot/2026-05-31/company-07.jpg)


XCENA获1.35亿美元融资（投后估值5.7亿美元），坚持“内存才是AI真正瓶颈”的技术路线。关键点：内存优先、1.35亿美元、韩国AI芯片。为什么重要：当大多数公司聚焦算力提升时，XCENA指出海量数据传输中的内存带宽瓶颈更具挑战性。这一视角可能催生新型计算架构（如存内计算），且韩国在存储芯片上的产业优势可为XCENA提供独特生态。成败与否，将影响未来AI芯片设计的方向选择。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/29/xcena-secures-135m-at-570m-valuation-betting-on-memory-as-ais-real-bottleneck/)

结语：从750亿欧元的数据中心到4nm的自研芯片，AI的军备赛已经渗透产业链每个环节——你押注的是算力、存储、还是终端？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


今天研究板块最值得关注的是RoboAgent：仅3B参数的视觉语言模型在从未见过的机器人任务中成功率达到94%，首次在尺寸上碾压GPT-4o这类通用大模型。与此同时，英伟达和清华联合推出的Gamma-World将世界模型从单人场景扩展到多智能体交互，而EY报告中的AI幻觉事件则给行业敲响警钟。模型小型化的路径正在打开，但可信度仍需强验证。

### Gamma-World：从单人仿真到多智能体世界模型

![research-00.jpg](/marginalia/assets/img/ai-hot/2026-05-31/research-00.jpg)


英伟达与清华大学联合提出Gamma-World，将传统世界模型从单智能体场景扩展到多智能体交互。关键点在于，它能让多个agent在同一虚拟环境中同时感知、决策并相互影响，更接近真实世界的动态复杂性。重要性在于：多智能体仿真一直是机器人、自动驾驶和游戏AI的瓶颈，Gamma-World为此提供了可扩展的基础框架，有可能成为下一代具身智能训练环境的基石。

> 原文：[https://www.qbitai.com/2026/05/426662.html](https://www.qbitai.com/2026/05/426662.html)

### RoboAgent：3B VLM在未知场景以94%成功率超越GPT-4o

![research-01.jpg](/marginalia/assets/img/ai-hot/2026-05-31/research-01.jpg)


RoboAgent由星源智联与北大联合发布，是一个3B参数的视觉语言模型，在零样本机器人操作任务中成功率达94%，对比下GPT-4o在该基准上的表现只有约70%。关键点在于：模型通过大规模异构机器人数据训练，并采用“任务分解+视觉推理”的管道，不依赖任何微调即可泛化到新环境。为什么重要？它挑战了“参数量越大越好”的直觉，展示了专用小模型在具身任务中的巨大潜力，为边缘端机器人部署提供了可行方案。

> 原文：[https://www.infoq.cn/article/OuKcGdoHsN6mrctXfAKM](https://www.infoq.cn/article/OuKcGdoHsN6mrctXfAKM)

### AI越有用，越难模仿人类：大规模研究揭示helpfulness与human simulation的取舍

![research-02.jpg](/marginalia/assets/img/ai-hot/2026-05-31/research-02.jpg)


一项大规模研究系统评估了不同版本AI聊天机器人的helpfulness与模拟人类行为的能力，发现两者呈负相关。提升helpfulness（如给出直接答案）会显著削弱模型在心理理论测试、人格模拟等任务上的表现。关键点：这种权衡可能源于训练目标的对齐方式——强调有用性会掩盖模型对人类反应变异性的建模。重要性在于，如果你依赖AI做用户研究或社会模拟，需要警惕：一个“更懂事”的助手可能恰好是最不像人的。

> 原文：[https://the-decoder.com/making-ai-chatbots-helpful-weakens-their-ability-to-simulate-human-behavior-large-scale-study-finds/](https://the-decoder.com/making-ai-chatbots-helpful-weakens-their-ability-to-simulate-human-behavior-large-scale-study-finds/)

### 英伟达X-Token知识蒸馏：在Llama-3.2 1B上提升3.82平均分

![research-03.jpg](/marginalia/assets/img/ai-hot/2026-05-31/research-03.jpg)


英伟达提出X-Token投影引导的跨分词器知识蒸馏方法，允许学生在不同分词器（tokenizer）下从教师模型学习。在Llama-3.2 1B上进行实验，平均得分比此前最优的Gold方法高出3.82个百分点。关键点：该方法解决了不同分词器间表示空间不匹配的问题，通过投影层将教师的知识映射到学生可对齐的空间。重要性在于，它降低了蒸馏对模型架构一致性的依赖，使得小模型可以更灵活地从大模型汲取知识，属于工业级知识迁移的实用突破。

> 原文：[https://www.marktechpost.com/2026/05/29/nvidia-introduces-x-token-projection-guided-cross-tokenizer-kd-that-outperforms-gold-by-3-82-average-points-on-llama-3-2-1b/](https://www.marktechpost.com/2026/05/29/nvidia-introduces-x-token-projection-guided-cross-tokenizer-kd-that-outperforms-gold-by-3-82-average-points-on-llama-3-2-1b/)

### EY加拿大网络安全报告被曝大量AI幻觉引用

![research-04.jpg](/marginalia/assets/img/ai-hot/2026-05-31/research-04.jpg)


GPTZero调查发现，EY（安永）加拿大发布的一份网络安全报告中，多处引用被证实是由AI（很可能是ChatGPT）生成的幻觉内容——包括虚构的论文、作者和机构名称。关键点：作为四大会计师事务所之一，EY本应具备专业的事实核查流程，但这份专业报告却“相信”了AI编造的参考文献。为什么重要？这不仅是声誉危机，更揭示了一个系统性风险：当专业组织开始依赖AI撰写正式报告，却又缺少人工复核机制时，信息污染会从学术圈蔓延至商业决策层。

> 原文：[https://gptzero.me/investigations/ey](https://gptzero.me/investigations/ey)

### Kronos：面向金融市场的语言基础模型

![research-05.jpg](/marginalia/assets/img/ai-hot/2026-05-31/research-05.jpg)


Kronos是一个专为金融市场设计的语言基础模型，基于海量市场语言数据——包括研究报告、财报电话会议记录、新闻、监管文件等——进行训练。关键点：它将金融领域的专用词汇、时间序列与语言结构的交叉理解作为核心能力，而非通用文本模型。重要性在于，通用大模型往往在金融推理任务上表现不佳（如情绪校准、合规判断），Kronos这种垂直领域自预训练模型可能提供更专业且可解释的金融分析能力，尤其适合量化投资和合规系统。

> 原文：[https://github.com/shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos)

---

今日的研究再次证明，模型大小并非决胜关键，训练范式和任务对齐才是。当AI开始帮你“写报告”时，你还能分清它是帮你节省时间，还是帮你制造幻觉？


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


今日最值得关注的是 Shift 雇佣戴摄像头的清洁工免费上门，用真实家庭数据训练未来家务机器人——这一模式将数据采集成本与隐私风险推向极值。同时，Google Gemini Spark 全天候助理虽有用却定位模糊，Robinhood 开放 AI 代理直接交易股票则可能改写金融操作规则。产品层正在出现从“工具”到“自主代理人”的显著切换，但变现与合规之间的张力也在同步放大。

### Shift 雇佣清洁工戴摄像头，免费上门训练机器人

![product-00.jpg](/marginalia/assets/img/ai-hot/2026-05-31/product-00.jpg)


Shift 公司招募人类清洁工，佩戴摄像头免费为用户打扫家庭，同时录制大量日常家务的触觉、路径、交互数据，用于训练未来的通用家务机器人。核心卖点是“用真实世界数据而非合成数据”训练具身智能。为什么重要？这可能是目前最高效的机器人训练数据采集方式之一，但隐私风险（家中全程录像）和劳工权益（免费劳动？实际是Shift付费给清洁工但用户免费享受服务）尚未被充分讨论。若成功，将大幅降低机器人训练的“现实鸿沟”；若翻车，可能引发新一轮公众对AI数据采集的信任危机。

> 原文：[Ars Technica](https://arstechnica.com/ai/2026/05/robot-training-startup-will-send-humans-wearing-cameras-to-clean-your-home/)

### Google Gemini Spark：全天候AI助理好用，但定位模糊

![product-01.jpg](/marginalia/assets/img/ai-hot/2026-05-31/product-01.jpg)


Gemini Spark 是 Google 推出的 24/7 AI 助理，可自动执行邮件摘要、日程规划、活动提醒等后台操作。实测反馈正面，用户认为“确实有用”，但问题在于：它和已有的 Google Assistant、Gemini 手机端功能重合度高，作为独立订阅产品或硬件无不可替代性。为什么重要？这反映了目前 AI 助理类产品普遍面临的困境——功能够用但缺乏杀手级场景，用户愿意尝鲜但不一定长期付费。Google 需要给 Spark 一个更明确的“不可被系统级AI替代”的理由。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/30/i-put-googles-24-7-ai-assistant-gemini-spark-to-work-and-its-actually-pretty-useful/)

### Robinhood 开放 AI 代理直接交易股票

![product-02.jpg](/marginalia/assets/img/ai-hot/2026-05-31/product-02.jpg)


Robinhood 平台新增功能：用户可授权 AI 代理自动执行股票交易操作。代理可根据用户设定的策略（如技术指标、新闻情绪）独立下单。什么意义？这是主流券商首次直接开放 AI 自主高频交易入口，大幅降低算法交易门槛。但风险也显而易见：AI 决策缺乏人类监督下的纠错机制，市场操纵或异常波动可能被放大。Robinhood 此举意在争夺活跃交易用户，但监管和风控将成为后续焦点。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/27/robinhood-now-lets-your-ai-agents-trade-stocks/)

### OpenAI Codex 获自主操作 Windows 能力：自主调试应用

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-05-31/product-03.jpg)


OpenAI 的 Codex 模型现在可以自主控制 Windows PC，包括启动应用、操作界面、查找 bug、运行测试并修复问题。类似“AI 测试工程师”的角色，但具备完整桌面操作权限。为什么重要？这标志着代码生成 AI 向“自主软件工程 agent”的进化，从辅助编码到独立完成测试和修复闭环。如果可靠性足够，将大幅降低软件测试和运维的人力成本，但安全控制和权限隔离仍是落地瓶颈。

> 原文：[The Decoder](https://the-decoder.com/openais-codex-can-now-operate-your-windows-pc-autonomously-hunting-bugs-and-testing-apps-on-its-own/)

### 波士顿儿童医院用 OpenAI 模型诊断 40+ 罕见病

波士顿儿童医院公开使用 OpenAI 的 GPT 系列模型，辅助医生分析罕见病病例，已帮助识别出 40 多种疑难杂症。关键点：并非简单的“问诊机器人”，而是利用模型整合病历、基因数据和文献，给出诊断建议。为什么重要？AI 在医疗辅助诊断上的价值在“长尾病”中体现最明显——人类医生接触少、经验有限，而模型能快速检索全球知识。但诊断结果的准确率和责任归属仍需稳健验证。

> 原文：[OpenAI Blog](https://openai.com/index/boston-childrens-hospital)

### Salesforce 用 AI Agent 将 231 天系统迁移压缩至 13 天

![product-05.jpg](/marginalia/assets/img/ai-hot/2026-05-31/product-05.jpg)


Salesforce 声称其 AI 代理（Agentforce）在前端系统迁移任务中，将原本耗时 231 天的手动工作降低至 13 天，且事故数量更少。核心能力：数据映射、代码转换、测试自动化全部由 agent 完成。为什么重要？这直接验证了 AI Agent 在企业级数字化转型中的 ROI——不仅仅是提高效率，而是把不可能的时间线变为可能。如果可复制，将加速企业向 AI 原生架构迁移。

> 原文：[The Decoder](https://the-decoder.com/salesforce-claims-ai-agents-cut-a-231-day-migration-to-13-days-with-fewer-incidents/)

### 思格新能源发布行业首个全域 AI 智能体 SigenAgent

思格新能源推出 SigenAgent，定位为“全域 AI 智能体”，覆盖光伏、储能、用能等能源场景的智能调度与预测。为什么重要？能源管理正在从规则引擎走向 AI agent 自主决策，SigenAgent 宣称可实现能源交易、负荷预测、设备运维的一体化 Agent。这是一次垂直行业 agent 化的典型落地，但能源领域对稳定性和安全性的要求极高，agent 的自主权边界需要明确。

> 原文：[雷锋网](https://www.leiphone.com/category/ai/5q3DxRKzBzMEg7CQ.html)

### Rokid 乐奇 AI 眼镜创日本众筹纪录：6.24 亿日元

![product-07.jpg](/marginalia/assets/img/ai-hot/2026-05-31/product-07.jpg)


Rokid 旗下乐奇 AI 眼镜在日本众筹平台 Makuake 筹得超 6.24 亿日元（约合人民币 3100 万元），刷新平台历史众筹金额纪录。关键点：产品为轻量级 AI 眼镜，集成语音助手、实时翻译、导航等功能。为什么重要？AI 眼镜在消费端一直“叫好不叫座”，但此次日本市场的高额认筹说明跨境需求可能存在差异化机会——尤其在日本市场，轻便、语音交互、免提信息获取可能是用户刚需。

> 原文：[36氪](https://36kr.com/newsflashes/3831673401190273)

---

一个有趣的问题浮现：当AI代理开始替我们做家务、交易股票、诊断疾病，人类还剩下多少“授权边界”需要亲手画牢？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


导语：今天最值得看的是程序员与CEO之间对AI的认知鸿沟——一方面越来越多程序员拒绝在无AI环境下工作，研究者警告这可能带来技能退化；另一方面Box创始人Aaron Levie直指多数CEO患上了“AI精神病”，误以为AI能轻易替代人类。两股对立思潮正在撕裂科技行业，而决定长期竞争力的，可能是中间那条路。

### 程序员拒绝无AI环境：短期舒适，长期风险

![opinion-00.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opinion-00.jpg)


**是什么**：部分程序员在招聘中明确表示不愿在无AI辅助的环境下工作，甚至把AI工具当作必要条件。**关键点**：研究者警告，过度依赖AI编码可能让开发者丧失调试、重构和系统设计能力，导致代码质量下降和隐性技术债积累。**为什么重要**：当AI成为“拐杖”而非“杠杆”，团队整体韧性会变弱；对个人而言，技能退化将降低在非AI环境下的竞争力。这种依赖正在成为行业隐性风险。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/29/coders-are-refusing-to-work-without-ai-and-that-could-come-back-to-bite-them/)

### Box创始人：多数CEO患有“AI精神病”

**是什么**：Box联合创始人Aaron Levie在播客中直言，大量CEO正经历“AI psychosis”（AI精神病）——认为AI可以大规模替换人类工作。**关键点**：Levie指出，这种错觉通常来自对工作真实细节的无知；CEO们看不到AI在复杂协作、上下文理解、决策责任上的巨大局限。**为什么重要**：如果高管层基于幻想做资源分配和人效评估，将引发错误裁员和业务流程断裂，最终伤害公司长期创新能力。

> 原文：[TechCrunch Podcast](https://techcrunch.com/podcast/does-your-ceo-have-ai-psychosis-aaron-levie-thinks-most-of-them-do/)

### “请使用AI”病毒文章引发热议

**是什么**：作者Shawn Smucker发表《Please Use AI》，在Hacker News上获得759票，引爆讨论。**关键点**：文章呼吁开发者主动拥抱AI，不要因恐惧或道德批判而拒绝工具，强调“使用”本身是学习与适应的方式。**为什么重要**：这篇文章与上述“拒绝无AI”形成鲜明对比——它代表另一方观点：不拥抱AI才是真正的风险。两种声音的冲突说明行业尚未形成共识。

> 原文：[Substack](https://shawnsmucker.substack.com/p/please-use-ai)

### AI正在重演前端开发的“失落十年”？

![opinion-03.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opinion-03.jpg)


**是什么**：一篇技术分析指出，AI的层抽象可能让前端开发陷入类似2010年代的停滞期——框架不断堆叠，底层能力退化。**关键点**：当AI生成代码越来越强，开发者可能不再深入理解浏览器、性能优化和可访问性，重蹈前端被“脚手架”绑架的覆辙。**为什么重要**：这不仅是技术栈担忧，更是职业发展警示——如果AI让中间层技能贬值，从业者需要主动下沉到更底层的不可替代能力。

> 原文：[MastroJS Blog](https://mastrojs.github.io/blog/2026-05-23-is-AI-causing-a-repeat-of-frontends-lost-decade/)

### AI工作悲伤：科技工作者的心理危机

![opinion-04.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opinion-04.jpg)


**是什么**：Jack Maguire发文描述科技从业者因AI替代威胁而经历的“job grief”（工作悲伤）——失去职业认同感，像承受一场无声的丧失。**关键点**：不同于焦虑，这种悲伤是一种对“自己即将被替代”的复杂心理反应，更难被外界识别。**为什么重要**：行业关注技术冲击时，常忽略心理健康问题。如果群体性悲伤蔓延，可能导致创造力下降和人才流失，企业需要主动提供心理支持和转型路径。

> 原文：[jackmaguire.org](https://jackmaguire.org/blog/ai-job-grief/)

### 对AI持道德立场就会被排斥，这很糟糕

![opinion-05.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opinion-05.jpg)


**是什么**：一篇个人博文指出，在科技圈公开对AI表达道德批判态度（如数据隐私、环境影响）会遭到孤立，甚至被视为“反进步”。**关键点**：作者认为这种排斥文化让不同意见者沉默，阻止了必要的公共讨论。**为什么重要**：AI发展需要多元视角，道德批评并非反对技术，而是帮助它走向更可持续的方向。如果圈子只接受赞美，长期会积累社会反噬。

> 原文：[martyn.berlin](https://musings.martyn.berlin/to-have-a-moral-stance-on-ai-is-to-be-an-outcast-and-it-sucks)

### “我们应该比模型更累”：AI疲劳的反思

![opinion-06.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opinion-06.jpg)


**是什么**：Vicki Boykis提出，人类对AI的疲劳感（信息过载、决策疲惫）应该超过模型本身的“累”——模型可以恒速运转，但人的精力是有限的。**关键点**：她呼吁重新审视人机关系：不要用AI的速度衡量人的产出，而是让AI服务于人的节奏。**为什么重要**：在追求效率的狂热中，谨记“人不是机器”是维持创造力和判断力的底线。这也是对“AI精神病”的一种人文矫正。

> 原文：[vickiboykis.com](https://vickiboykis.com/2026/05/28/we-should-be-more-tired-than-the-model/)

### 梵蒂冈为何派“内线”进入Anthropic

![opinion-07.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opinion-07.jpg)


**是什么**：Wired披露，教皇利奥十四世与AI公司Anthropic之间存在隐秘联系——梵蒂冈通过“内线”试图影响AI伦理发展。**关键点**：Anthropic以“安全对齐”闻名，梵蒂冈希望确保AI价值观与天主教伦理相契，尤其涉及生命尊严、劳动定义等议题。**为什么重要**：这是宗教力量首次深度介入科技公司战略，预示AI伦理博弈将从学术界扩大到机构层面。对行业而言，伦理标准不再只是技术问题，也是政治和信仰问题。

> 原文：[Wired](https://www.wired.com/story/the-vaticans-man-inside-anthropic/)

结语：AI到底是杠杆还是拐杖？今天的8个故事指向同一个问题：当每个人都必须面对AI，谁在过度依赖、谁在过度恐惧，又有谁在偷偷嵌入自己的价值观？


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


Anthropic 今日开源了终端内的 AI 编程 Agent 工具 Claude Code，这是该板块最值得关注的动态。它意味着 AI 编程不再局限于 IDE 插件，而是直接进入开发者的终端原生环境——Agent 可以理解整个代码库，用自然语言完成复杂任务。对于技术决策者来说，这一动作将加速编程工具生态的洗牌，并重新定义“开发者”与“AI 协作”的边界。

### Anthropic开源Claude Code：终端内的AI编程Agent

![opensource-00.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opensource-00.jpg)


Claude Code 是 Anthropic 推出的终端内 Agent 编程工具，可直接理解代码库并通过自然语言执行重构、调试、文件修改等复杂操作。关键点在于它不依附于特定 IDE，而是运行在终端中，利用 Agent 模式进行跨文件、多步骤操作，并且代码完全开源。为什么重要？这标志着 AI 编程工具的“终局形态”正在形成——开发者无需离开终端即可完成大部分编码工作，Claude Code 的开源也意味着社区可以定制、集成到 CI/CD 流程，甚至作为其他 Agent 的基石。对于团队来说，这意味着更低的迁移成本和更高的可扩展性。

> 原文：[https://github.com/anthropics/claude-code](https://github.com/anthropics/claude-code)

### Twenty：开源AI驱动CRM挑战Salesforce

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opensource-01.jpg)


Twenty 是一款专为 AI 时代设计的开源 CRM，目标直指 Salesforce。它融合了传统客户管理、管道追踪与 AI 能力，如自动填充、智能推荐、对话摘要。关键点在于其开源架构允许企业自行部署并训练模型，数据隐私可控且工作流高度灵活。为什么重要？在 AI agentic 时代，CRM 作为“企业客户记忆层”的价值凸显——Twenty 试图用开源生态打破 Salesforce 的封闭，尤其适合对数据合规和定制化有强需求的团队。

> 原文：[https://github.com/twentyhq/twenty](https://github.com/twentyhq/twenty)

### MoneyPrinterTurbo：一键AI短视频生成

![opensource-02.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opensource-02.jpg)


MoneyPrinterTurbo 利用 AI 大模型实现“输入主题 → 生成高清短视频”的全流程自动化，包括配音、字幕和素材拼接。关键点在于其“一键式”体验和多语言支持，大幅降低了视频制作门槛。为什么重要？内容创作市场正被 AI 重构，短视频生成是高频刚需。该工具开源后，开发者可二次开发用于营销、教育或社交媒体自动发布，有望成为 AI 视频代理的起点。

> 原文：[https://github.com/harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo)

### Microsoft开源Markitdown：文档转Markdown利器

![opensource-03.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opensource-03.jpg)


Markitdown 是微软开源的 Python 工具，可将 PDF、Docx、HTML 等格式转换为 Markdown，专为 LLM 数据预处理设计。关键点在于它保留文档结构、表格和代码块，转换效率高。为什么重要？大模型训练和 RAG 应用依赖高质量结构化文本，Markitdown 填补了从原始文档到 LLM 可用格式的关键一环。微软此举意在推动其 Markdown 生态，开发者可将其嵌入文档处理管道。

> 原文：[https://github.com/microsoft/markitdown](https://github.com/microsoft/markitdown)

### LlamaIndex开源LiteParse：快速文档解析

![opensource-04.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opensource-04.jpg)


LiteParse 是 LlamaIndex 团队的开源文档解析工具，主打速度快、支持 PDF、Docx、PPTX 等多种格式。关键点在于它的内存效率和实时解析能力，与 Markitdown 形成互补。为什么重要？在 RAG 系统中，文档解析常是性能瓶颈。LiteParse 优化了解析速度，并与 LlamaIndex 生态深度集成，适合需要快速索引大量文档的搜索增强生成场景。

> 原文：[https://github.com/run-llama/liteparse](https://github.com/run-llama/liteparse)

### Cursor发布官方插件系统

![opensource-05.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opensource-05.jpg)


Cursor 开放了插件规范并推出官方插件仓库，支持 Git、Jira、Notion 等流行开发工具的集成。关键点在于用户可通过插件扩展 IDE 功能，第三方开发者可构建新的插件。为什么重要？Cursor 正从“AI IDE”向“平台化”转型，插件系统是其生态扩张的关键一步。这一动作将加剧与 VS Code 的竞争，并可能催生围绕 AI 编程的新工具生态。

> 原文：[https://github.com/cursor/plugins](https://github.com/cursor/plugins)

### Compound Engineering插件：让Agent协作更高效

![opensource-06.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opensource-06.jpg)


该开源插件让 Claude Code、Codex 等工具支持“复合工程”模式——多个 Agent 并行协作、共享上下文，共同完成复杂软件工程任务。关键点在于它定义了一套任务分解与协作协议。为什么重要？单个 Agent 能力有限，而复合工程通过分工协作可能突破瓶颈。该插件的开源特性使其可被集成到主流 Agent 工具中，是 Agentic 软件开发方向的重要尝试。

> 原文：[https://github.com/EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)

### Taste-Skill：教AI生成“有品味”的文本

![opensource-07.jpg](/marginalia/assets/img/ai-hot/2026-05-31/opensource-07.jpg)


Taste-Skill 是一个开源技能文件，通过一组风格指令引导 AI 模型生成避免陈词滥调、具有特定美感的文本。关键点在于它可加载到支持 Skill 的模型（如 Claude、GPT）中，作为一种“美学滤镜”。为什么重要？AI 生成内容同质化严重，“品味”正成为差异化壁垒。Taste-Skill 代表了一种新思路：通过开源“品味文件”来改变输出质量，对内容创作者或品牌风格控制有参考价值。

> 原文：[https://github.com/Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)

当 Claude Code 和 Compound Engineering 把编程自主权交给 Agent，开发者角色的边界正在模糊——你准备好成为 Agent 的“协作者”而非“操作者”了吗？
