---
layout: "ai-hot"
title: "AI 晨报 · 2026-05-23"
date: "2026-05-23 06:00:00 +0800"
author: "Marginalia"
description: "2026-05-23 的 AI 圈每日动态汇总：DeepSeek推进AGI优先策略，同时降低V4 Pro API价格永久折扣。"
excerpt: "DeepSeek推进AGI优先策略，同时降低V4 Pro API价格永久折扣。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 5 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 8 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 6 }
  - { id: product, name: "应用产品", emoji: "📱", count: 8 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 8 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 8 }
---

今天最值得看的三件事：

- **行业观点** · Trump突然取消AI安全行政令签署
- **公司动态** · DeepSeek获700亿融资，组建Code团队由ACM金牌大神带队
- **公司动态** · SpaceX IPO文件曝光，押注AI数据中心挑战巨头

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


谷歌在 I/O 大会后突然发布 Gemini 3.5，性能显著提升且声称可节省 10 亿美元成本。这一动作表明，模型产品已从单纯拼能力转向拼性价比，可能挤压中小厂商的竞争力空间。

### Gemini 3.5 深夜发布，4 倍速度节省 10 亿美元

![model_release-00.jpg](/marginalia/assets/img/ai-hot/2026-05-23/model_release-00.jpg)


**是什么**：谷歌在 I/O 后悄然推出 Gemini 3.5 模型，CEO 宣布性能大幅提升，推理速度比前代快 4 倍，同时预计可为谷歌节省超 10 亿美元运营成本。  
**关键点**：延迟降低 75%，成本降至原来的 1/5 左右，且在多项基准测试中超越 GPT-4o、Claude 3.5。  
**为什么重要**：这是谷歌首次将成本与速度作为宣传核心，意味着大模型竞争进入“每 token 成本”精细化阶段，也给业界定了新性价比基准——谁能在保持性能的同时将成本拉至同量级，谁才能持续服务企业级客户。  
> 原文：[InfoQ](https://www.infoq.cn/article/COda3jCSAliReaA4YVJc)

### Qwen3.7-Max 发布：百万 Token 上下文窗口

![model_release-01.jpg](/marginalia/assets/img/ai-hot/2026-05-23/model_release-01.jpg)


**是什么**：阿里云推出 Qwen3.7-Max，具备 1M Token 上下文窗口和扩展思考模式，定位最强 Agent 模型。  
**关键点**：支持在百万 Token 内进行长程推理，可一次性处理长达 300 页文档，且内置思考链（Chain-of-Thought）能力；同时优化了工具调用（function calling）的准确率。  
**为什么重要**：1M 上下文窗口让它在合同审查、代码库分析等需长期依赖任务的场景具备差异化优势，这是目前开源模型中最大的上下文能力之一。  
> 原文：[MarkTechPost](https://www.marktechpost.com/2026/05/21/qwen-introduces-qwen3-7-max-a-reasoning-agent-model-with-a-1m-token-context-window/)

### Cohere 发布 Command A+：218B 稀疏 MoE 模型可跑在 2 张 H100 上

![model_release-02.jpg](/marginalia/assets/img/ai-hot/2026-05-23/model_release-02.jpg)


**是什么**：Cohere 开源 Command A+，218B 参数的稀疏 MoE（Mixture of Experts）模型，支持 48 种语言，首次适配 Agentic workflow。  
**关键点**：推理时仅激活部分专家，使得单次推理成本大幅降低；官方称最低可工作在 2 张 H100 上，部署门槛远低于同参数规模的密集模型。  
**为什么重要**：Cohere 长期深耕企业多语言场景，此次开源让中小团队也能在本地部署大参数模型用于 Agent 任务，降低了对云端 API 的依赖。  
> 原文：[MarkTechPost](https://www.marktechpost.com/2026/05/21/cohere-releases-command-a-a-218b-sparse-moe-model-for-agentic-workflows-that-runs-on-as-few-as-two-h100-gpus/)

### 微软 Fara1.5 浏览器 Agent 开源，性能超 Operator 和 Gemini

![model_release-03.jpg](/marginalia/assets/img/ai-hot/2026-05-23/model_release-03.jpg)


**是什么**：微软开源 Fara1.5 系列（4B/9B/27B），专注于浏览器和计算机控制 Agent。在 Online-Mind2Web 基准上超越 OpenAI Operator 和 Gemini 2.5 Computer Use。  
**关键点**：27B 版本在所有尺寸中均取得最高分，4B 版本在极低算力下仍可完成大部分浏览任务；模型支持自我纠错（self-correction）和长程规划分解。  
**为什么重要**：浏览器 Agent 被视为下一代个人助理，微软用开源+小体积+高性能的组合直接挑战闭源方案，可能加速该领域落地。  
> 原文：[MarkTechPost](https://www.marktechpost.com/2026/05/22/microsoft-releases-fara1-5-a-family-of-browser-computer-use-agents-4b-9b-27b-that-outperform-openai-operator-and-gemini-2-5-computer-use-on-online-mind2web/)

### 智谱代码生成速度达 400 tokens/s

![model_release-04.jpg](/marginalia/assets/img/ai-hot/2026-05-23/model_release-04.jpg)


**是什么**：智谱宣布在代码生成任务中达到每秒 400 tokens 的推理速度，自称“顶流最快”。  
**关键点**：该速度基于其自研 GPU 集群和优化的推理引擎实现，主要面向代码补全和纠错场景。  
**为什么重要**：对开发者工具而言，延迟比模型准确率更影响体验；400 tokens/s 意味着每次补全几乎无感知，可能重新定义代码助手类产品的性能门槛。  
> 原文：[量子位](https://www.qbitai.com/2026/05/422511.html)

---

模型发布密度和多样性在加速，但核心竞争已从“谁更强”转向“谁更省、谁更稳”。当 Gemini 3.5 把成本拉低一个量级，Agent 模型是否会迎来真正的规模落地？


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


导语：今日最重磅的是DeepSeek完成700亿融资，同时宣布V4 Pro API永久降价——这一组合拳既显示了AGI优先策略的资本底气，也可能撕开API价格战的新口子。与此同时，SpaceX IPO文件曝光其AI轨道数据中心计划，试图在Grok受挫后换个赛道挑战云巨头。这两件事指向同一个判断：AI基础设施的竞争正从算力规模延伸到新型部署形态与定价策略。

### DeepSeek获700亿融资，Code团队由ACM金牌大神带队

![company-00.jpg](/marginalia/assets/img/ai-hot/2026-05-23/company-00.jpg)


**是什么：** DeepSeek宣布完成约700亿元人民币融资，资金将用于推进AGI优先策略，同时组建一支由ACM国际大学生程序设计竞赛金牌获得者领衔的代码团队。此外，公司宣布V4 Pro API价格永久下调。

**关键点：** 700亿规模在AI初创领域极为罕见，且选择在模型降价时融资，表明投资者认可其“以价换量+技术领先”的路径。Code团队由ACM金牌得主带队，直接对标OpenAI Codex的代码生成能力。

**为什么重要：** 这既是DeepSeek巩固中国AI头部位置的关键注资，也是全球API定价战的升级信号——若V4 Pro降价后仍能保持毛利率，其他厂商将面临跟降或丢份额的两难。

> 原文：[量子位](https://www.qbitai.com/2026/05/422624.html)

### SpaceX IPO文件曝光，押注AI数据中心挑战巨头

![company-01.jpg](/marginalia/assets/img/ai-hot/2026-05-23/company-01.jpg)


**是什么：** SpaceX提交的S-1文件中透露，计划建设AI轨道数据中心，将计算单元部署在低地球轨道，以实现低延迟、高安全的AI推理服务。该计划被视为在Grok表现不佳后，公司决心在AI领域“翻身”的核心押注。

**关键点：** 轨道数据中心的概念此前仅停留在理论层面，SpaceX凭借星链和火箭复用能力，有望将硬件送入轨道并维护。文件显示初期投资规模未公开，但明确瞄准超大规模云厂商的市场。

**为什么重要：** 若轨道数据中心可行，将颠覆现有AI基础设施的地理依赖（如土地、电力成本），并为边缘计算提供新范式。但技术成熟度和法规风险极高，是对赌未来的“黑天鹅”动作。

> 原文：[Ars Technica](https://arstechnica.com/ai/2026/05/as-grok-flounders-spacex-bets-future-on-beating-big-tech-at-ai/)

### Anthropic以3亿美元收购API工具商Stainless

**是什么：** Anthropic宣布以约3亿美元收购API SDK生成公司Stainless。Stainless的主打产品能自动生成高质量、多语言的API客户端代码，降低第三方集成的工程门槛。

**关键点：** 这是Anthropic在开发者生态上的明确布局——此前Claude API的文档和SDK体验常被批评不如OpenAI，收购Stainless可快速补课。交易金额对Anthropic目前估值而言较小，但象征意义重大。

**为什么重要：** 在模型能力趋同的当下，开发者体验成为API厂商的差异化战场。Stainless的团队和技术可帮助Anthropic缩短与OpenAI在工具链上的差距，吸引更多企业级客户。

> 原文：[雷锋网](https://www.leiphone.com/category/ai/Yqq5YAFbgrGAusRi.html)

### Manus创始人计划融资10亿美元回购股份

**是什么：** AI代理平台Manus的创始人正在洽谈新一轮融资，目标金额约10亿美元，主要用于从早期投资者和员工手中回购股份。同时资金也将用于扩大其AI代理产品线。

**关键点：** 回购股份通常意味着创始人对公司长期价值有信心，希望集中股权控制权。Manus此前在AI代理领域获得关注，但产品尚未大规模商业化。

**为什么重要：** 10亿美元规模对于一家尚未证明PMF的AI代理公司来说是豪赌。如果成功，将验证“AI代理即服务平台”的资本吸引力；若失败，可能成为泡沫信号。

> 原文：[雷锋网](https://www.leiphone.com/category/zaobao/qFYlp8Q5YFJ9KJRc.html)

### Hark获7亿美元A轮融资，打造“通用”AI界面

![company-04.jpg](/marginalia/assets/img/ai-hot/2026-05-23/company-04.jpg)


**是什么：** 神秘AI初创公司Hark宣布完成7亿美元A轮融资，计划今年夏天推出多模态模型及配套硬件，旨在打造“通用”AI交互界面。

**关键点：** Hark此前几乎零公开信息，7亿美元的A轮融资额在AI领域属于顶级起点，暗示投资者对其团队或技术方向的极高信任。产品路线图同时涉及模型和硬件，类似早期Siri或Rabbit R1的升级版。

**为什么重要：** 这可能意味着AI硬件和界面赛道出现新玩家。若其“通用界面”能在多模态体验上超过现有语音助手和智能眼镜，将直接挑战Meta、苹果等巨头。但神秘感也带来不确定性：产品落地前一切只是预期。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/21/hark-raises-700m-series-a-for-its-secretive-universal-ai-interface/)

### OpenAI被Gartner评为企业编码代理领导者

**是什么：** Gartner发布2026年企业AI编码代理Magic Quadrant报告，将OpenAI Codex评为领导者象限。该评估基于市场执行力、产品完整性和创新性。

**关键点：** Gartner的魔力象限是企业采购决策的重要参考。Codex被列为领导者，意味着其在代码生成质量、安全性和企业集成能力上获得权威认可。但报告未公布完整象限，其他落选厂商可能被归类为挑战者或远见者。

**为什么重要：** 这直接强化了OpenAI在企业开发者市场的话语权，可能促使更多CIO将Codex纳入开发工具链。对GitHub Copilot（基于OpenAI）而言也是利好，但需注意Copilot与Codex的归属关系。

> 原文：[OpenAI官方](https://openai.com/index/gartner-2026-agentic-coding-leader)

### 微软开始取消Claude Code许可证

![company-06.jpg](/marginalia/assets/img/ai-hot/2026-05-23/company-06.jpg)


**是什么：** 微软已开始通知部分客户，将停止提供Claude Code订阅服务。已购买用户将受到影响，具体补偿方案尚未公布。Claude Code是Anthropic的AI编程助手产品。

**关键点：** 微软此前在Azure上销售Claude Code许可证作为其AI解决方案的一部分，如今决定终止合作。原因可能是微软聚焦自家Copilot产品，或与Anthropic的协议到期未续。

**为什么重要：** 这反映了大厂生态中的竞争排他性：微软作为OpenAI的最大投资者，持续减码Anthropic产品符合其战略。开发者若依赖Claude Code需紧急寻找替代方案，短期利好OpenAI Codex和GitHub Copilot。

> 原文：[The Verge](https://www.theverge.com/tech/930447/microsoft-claude-code-discontinued-notepad)

### Spotify与环球音乐达成AI翻唱/混音合作协议

![company-07.jpg](/marginalia/assets/img/ai-hot/2026-05-23/company-07.jpg)


**是什么：** Spotify与环球音乐集团（UMG）达成协议，允许Spotify Premium用户使用AI工具对UMG旗下歌曲进行翻唱和混音。生成的改编作品可在平台内播放，艺术家将参与收入分成。

**关键点：** 这是主流音乐平台首次大规模开放AI内容生成，且版权方同意分成模式。用户无法直接下载或商用，改编仅限平台内消费。技术由Spotify内部AI团队提供，模型训练基于UMG授权数据。

**为什么重要：** 这为AI生成音乐与版权共处提供了范本。如果分成机制可行，其他厂牌和平台将快速跟进，AI翻唱可能成为音乐消费的新品类。但艺术家权益的具体分配细节仍是关键悬念。

> 原文：[TechCrunch](https://techcrunch.com/2026/05/21/spotify-and-universal-music-strike-deal-allowing-fan-made-ai-covers-and-remixes/)

结语：当SpaceX试图让AI数据中心上天，DeepSeek选择让API价格落地——基础设施的星辰大海与价格战的泥泞缠斗，哪个才是今年的主旋律？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


**导语：** 两篇里程碑式论文今日刷屏：李飞飞团队推出空间智能领域的 ImageNet 级基准，为具身智能提供统一评测尺度；OpenAI 模型证明了 Erdős 猜想，论文获顶级期刊接收。前者补齐机器人感知训练的关键一环，后者将 AI 数学推理推进到可发表水平。以下是你不可跳过的 6 条研究。

### 李飞飞团队发布空间智能ImageNet基准

![research-00.jpg](/marginalia/assets/img/ai-hot/2026-05-23/research-00.jpg)


**是什么：** 斯坦福李飞飞实验室联合多家机构发布全新基准 **3D-IntStructBench**（暂定名），专门评测具身智能体的空间理解能力，覆盖物体识别、姿态估计、空间关系推理等任务。目标是成为空间智能领域统一的“ImageNet”。

**关键点：** 该基准包含超过 10 万组真实与合成场景，支持静态与动态环境评估，并引入“空间图”评价指标，要求模型同时理解物体本身及其在三维世界中的位置、方位和功能关系。初步评测显示，当前最强的视觉-语言模型（如 GPT-5 系列）在上述任务上仍远落后于人类表现。

**为什么重要：** 缺乏标准评测是具身智能迟迟难落地的原因之一。有了类似 ImageNet 的基准，后续模型对比才有公平平台，也会倒逼研究者转向“空间感知”而非“图像识别”本身。

> 原文：https://www.qbitai.com/2026/05/422738.html

### AI首次证明数学难题被顶级期刊接收

![research-01.jpg](/marginalia/assets/img/ai-hot/2026-05-23/research-01.jpg)


**是什么：** OpenAI 发布论文称，其推理模型成功证明了组合数学领域知名的 **Erdős 问题**（涉及有限集合的极值性质），该证明已通过同行评审并被顶级数学期刊 *Combinatorica* 接收。这是 AI 首次独立完成、且被学术共同体认可的困难定理证明。

**关键点：** 该模型基于强化学习与形式化验证结合，没有依赖人类给出的解题步骤，而是从海量数学论文中学习归纳，最后生成了 10 页以上的完整构造性证明。评审人确认：证明正确、新颖且简洁，达到人类博士生毕业水平。

**为什么重要：** 此前 AI 在数学竞赛（IMO）中拿金牌，但那是闭卷考试；被期刊接收意味着 AI 能从事前沿数学研究。未来数学家的角色可能从“证明者”变为“假设检验员”或“审稿人”。

> 原文：https://the-decoder.com/openai-shifts-the-boundary-of-automated-reasoning-with-a-milestone-in-ai-mathematics-that-experts-are-now-unpacking/

### 多流LLM架构：并行分离提示、思考与I/O

![research-02.jpg](/marginalia/assets/img/ai-hot/2026-05-23/research-02.jpg)


**是什么：** 伦敦大学学院团队提出 **Multi-Stream LLM**，将 Transformer 推理阶段拆分为三条并行流：Prompt Stream（处理用户输入）、Thought Stream（内部推理）、I/O Stream（与外部工具交互）。每条流由独立的注意力头和前馈网络负责，共享底层嵌入。

**关键点：** 相比传统串行架构，Multi-Stream LLM 在 Tool-use、多步推理、实时对话等场景下延迟降低 40%~60%，准确率不降反升。核心思路是解决“思考写作同时进行导致的混淆”——让模型不再同时兼顾输入理解、逻辑推演与输出生成。

**为什么重要：** 这是 LLM 架构层面的“微服务化”。当模型需要频繁调用工具或长链推理时，串行处理瓶颈明显。分离流后，每路可以独立优化，为 agentic 场景（如自主编程、复杂 API 调用）提供了更干净的底层范式。

> 原文：https://arxiv.org/abs/2605.12460

### 自演化Agent系统MOSS：通过源码级重写持续学习

![research-03.jpg](/marginalia/assets/img/ai-hot/2026-05-23/research-03.jpg)


**是什么：** 中科大与微软研究院联合发布 **MOSS** 框架，赋予 agent 在部署后自动修改自身代码的能力。与之前“基于环境反馈调整 prompt”不同，MOSS 直接重写函数体、新增方法或删改逻辑，属于真正的系统级自演化。

**关键点：** 论文在代码补全、网页搜索、Data Science 等 6 个 benchmark 上验证：MOSS 在 3 次交互迭代内，任务成功率平均提升 25% 以上，且未来 agent 的所有版本均可追溯、回滚。需要特别注意的是，当前版本依赖外部沙箱隔离，以防无限循环或恶意重写。

**为什么重要：** 如果 agent 只能调参无法改代码，成长天花板很低。MOSS 松开了这层限制，使得 agent 可以像人类程序员一样根据 bug 报告修代码、根据需求加功能。这也是通往“通用智能体”的必经之路——但安全约束将随之变得更严。

> 原文：https://arxiv.org/abs/2605.22794v1

### Gated DeltaNet-2：线性注意力中解耦擦除与写入

![research-04.jpg](/marginalia/assets/img/ai-hot/2026-05-23/research-04.jpg)


**是什么：** 天津大学等团队改进线性注意力模型 **DeltaNet**，提出 **Gated DeltaNet-2**。关键创新在于引入两个独立的门控：一个控制从记忆中“擦除”旧信息的比例，另一个控制“写入”新信息的比例，类似 RNN 中 Forget Gate 与 Input Gate 的解耦。

**关键点：** 在 128K 长序列的检索与推理任务上，Gated DeltaNet-2 达到甚至超越标准 Softmax 注意力，同时保持线性复杂度（O(n)）。显存占用和推理延迟均低于 Mamba 2 及原版 DeltaNet。论文还提供了硬件适配优化，使其在单张 A100 上可处理百万 token。

**为什么重要：** 长上下文仍是 LLM 的刚需，但线性注意力往往在长程依赖精度上妥协。Gated DeltaNet-2 在效率和效果之间找到了更好的平衡点，尤其适合需要频繁读到又写入的 agent 工作记忆场景。

> 原文：https://arxiv.org/abs/2605.22791v1

### SONIC：超大规模人形机器人全身运动控制

![research-05.jpg](/marginalia/assets/img/ai-hot/2026-05-23/research-05.jpg)


**是什么：** 清华与星动纪元联合提出 **SONIC** 框架，实现人形机器人从“只动腿”到“全身协调运动”。该模型基于 diffusion policy，在仿真中同时控制全身 40+ 自由度（包括躯干、手臂、手指），并在真机（HIKERobot 双足人形）上成功迁移。

**关键点：** 核心是提出“层次式扩散策略”：顶层规划全身运动轨迹（比如起身、下蹲、搬箱），底层用修正后的阻抗控制实现肌肉级扭矩。在跌倒恢复、爬楼梯、双手搬运玻璃杯等复杂任务上，成功率最高提升至 92%（相比单关节策略的 38%）。操作频率 50Hz，延迟在 20ms 以内。

**为什么重要：** 目前人形机器人控制大多将上肢与下肢控制器分开训练，导致上下身不协调（如走路时手臂僵直）。SONIC 证明了统一训练可能，且能做到实时部署，非常适合家庭服务、工业生产场景。

> 原文：https://arxiv.org/abs/2511.07820v3

---

今日研究的两极非常鲜明：一边是空间感知和具身控制快速落地，另一边是 AI 数学推理首次跨过期刊门槛。当模型能自己证明难题、自己改 bug、自己规划全身动作，留给“人类不可替代”的领域还剩多少？


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


Spotify 今日连推两项 AI 功能，分别面向播客消费与有声书生产。播客摘要+AI问答即将覆盖 Premium 用户，效率场景是最大的切入口；而 ElevenLabs 驱动的有声书工具则试图降低创作者门槛，不要求独家授权，这可能在出版链条中引发新变量。与此同时，OpenAI 的 Mac 窗口转 Codex 上下文、Anthropic 的 MCP 隧道等产品级更新，继续拓展 agentic AI 的应用边界。

### Spotify AI 播客摘要与问答：从被动听到主动问

![product-00.jpg](/marginalia/assets/img/ai-hot/2026-05-23/product-00.jpg)


Premium 用户可生成每日或每周播客简报，还能对任意播客就内容进行 AI 问答。关键点在于：它不是简单的文字转录摘要，而是结合音频语义理解的问答式交互。为什么重要？播客信息密度高但回溯困难，这个功能把“听”变成“问”，可能改变用户消费播客的习惯——从整集听完到按需获取。对于内容创作者，这也意味着需要重新设计播客结构（比如明确分段）以适配 AI 索引。

> 原文：https://techcrunch.com/2026/05/21/spotify-adds-ai-powered-qa-and-briefing-generation-features-to-podcasts/

### Spotify + ElevenLabs 有声书工具：AI 配音，不锁版权

![product-01.jpg](/marginalia/assets/img/ai-hot/2026-05-23/product-01.jpg)


作者可以用 AI 生成有声书，无需与平台签订独家授权协议。这在有声书市场是个微妙的变化——以往有声书制作往往涉及高成本的录音和版权独享，现在 ElevenLabs 的声音克隆质量足以让独立作者快速将文字作品转为音频。为什么重要？可能冲击传统有声书制作方的定价权，也让更多长尾内容（如博客合集、非虚构短篇）获得音频版本。Spotify 借此补充叙事类音频库，与播客形成互补。

> 原文：https://techcrunch.com/2026/05/21/spotify-launches-an-elevenlabs-powered-audiobook-creation-tool/

### OpenAI Appshots：Mac 窗口即 Codex 上下文

![product-02.jpg](/marginalia/assets/img/ai-hot/2026-05-23/product-02.jpg)


Codex 可以读取任何 Mac 应用窗口的内容（如浏览器、终端、设计工具），直接将所见转化为编码提示。本质上是把屏幕变成了大模型的“眼睛”。为什么重要？开发者不必再手动复制粘贴错误信息或 UI 截图，Codex 能实时理解当前工作场景。这对调试、原型生成、跨应用协作效率提升明显。但也带来隐私和权限边界的问题——用户需要主动授权窗口共享。

> 原文：https://the-decoder.com/openai-appshots-turn-any-mac-window-into-context-for-codex/

### Anthropic MCP 隧道：内部代理的安全通道

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-05-23/product-03.jpg)


MCP 隧道允许企业内部的私有代理通过加密通道安全访问内部系统，而不暴露公网端点。这是 Anthropic 在 agentic AI 基础架构上的落地：让 AI 代理像 VPN 服务一样安全连接数据库、API 和遗留系统。为什么重要？企业部署 AI 代理的核心障碍之一是安全合规，MCP 隧道提供了标准化的访问控制层。关注它如何与现有身份认证（如 OAuth、IAM）集成。

> 原文：https://www.infoq.cn/article/jvoDNDaa2bRzwrHQy7lT

### ChatGPT PowerPoint 插件：效率工具，但可能误删内容

![product-04.jpg](/marginalia/assets/img/ai-hot/2026-05-23/product-04.jpg)


OpenAI 在 ChatGPT 中推出了原生 PowerPoint 插件，可以基于对话生成幻灯片或修改已有 PPT。但官方明确警告“可能意外删除内容”。关键点：这种“非确定性操作”在大模型接入文件编辑类 API 时很常见——模型对自己的修改范围没有精确认知。为什么重要？它展示了 AI 办公插件从生成式到编辑式的演进，但可靠性仍是硬伤。对于严肃办公场景，用户需要更明确的撤销机制和操作日志。

> 原文：https://the-decoder.com/openai-launches-a-chatgpt-powerpoint-plugin-and-warns-it-might-accidentally-delete-your-content/

### 安克 AI 消噪耳机：存算一体芯片，通话清晰度获吉尼斯纪录

安克的新款耳机搭载 Thus A1 存算一体 AI 芯片，在通话清晰度上获得了吉尼斯世界纪录认证。关键点：存算一体架构意味着 AI 降噪推理在耳机本地完成，延迟和功耗都有优势。为什么重要？这说明 AI 音频处理正在从云端下沉到端侧专用芯片，未来通话降噪、环境音自适应可能成为耳机标配。对开发者来说，存算一体芯片的生态和开发工具值得关注。

> 原文：https://www.leiphone.com/category/weiwu/SE0UCzo94OXxs9aG.html

### CopilotKit 重新定义 Agentic AI 堆栈

![product-06.jpg](/marginalia/assets/img/ai-hot/2026-05-23/product-06.jpg)


CopilotKit 推出了 AG-UI 协议和一套生产级架构，旨在标准化 AI agent 与 UI 组件的交互方式。关键点：它试图解决当前 agent 开发中“如何让 AI 操作前端界面”的碎片化问题，提供可复用的交互模式。为什么重要？当 AI 代理需要执行网页操作（如填写表单、点击按钮）时，缺少统一协议会导致大量定制开发。AG-UI 如果被广泛采用，可能成为 agent 时代的“React”——降低开发门槛。

> 原文：https://www.marktechpost.com/2026/05/21/how-copilotkit-is-redefining-the-agentic-ai-stack-in-2026/

### 京东 618 AI 数字人直播晚会：消费场景的又一次试水

![product-07.jpg](/marginalia/assets/img/ai-hot/2026-05-23/product-07.jpg)


京东将举办全网首档 AI 数字人购物直播晚会，数字人演绎 IP 并与用户互动。虽然重要性评分最低，但它是国内电商在 AI 内容营销上的典型动作。关键点：数字人主播的制造成本已大幅降低，但用户接受度和转化效果仍需验证。为什么重要？这标志着 AI 数字人从“概念展示”走向“大型商业活动”，后续可能被天猫、拼多多等平台复制。对于产品经理，需要关注数字人带货的真实 ROI 与用户疲劳度。

> 原文：https://36kr.com/newsflashes/3820427661398407

---

AI 正在从文本渗透到音视频的生产与消费，播客、有声书、电商标配数字人——你的产品在哪个环节被改写？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


特朗普在科技CEO拒绝出席后，直接取消了AI安全测试行政令，称其为“创新阻碍”。同日，加州签署全美首例AI工人保护行政令。联邦与州在AI监管上走向对立，企业将面临更复杂的合规环境。此外，内存涨价、AI抄袭争议、GitHub内部乱象等话题也值得跟进。

### 特朗普取消AI安全行政令：科技CEO冷落成导火索

![opinion-00.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opinion-00.jpg)


特朗普原计划签署一项强制AI模型安全测试的行政令，但在多家头部AI公司CEO集体拒绝出席签署仪式后，他直接取消该命令，并公开称该行政令是“创新的阻碍”。这是白宫在AI监管立场上的重大退缩，也暴露了联邦层面缺乏统一协调的监管能力。对于行业而言，短期监管不确定性增加，但长期可能激发州级立法加速。

> 原文：https://arstechnica.com/tech-policy/2026/05/trump-canceled-ai-safety-testing-eo-after-snub-from-tech-ceos/

### 加州签署全美首例AI工人保护行政令

![opinion-01.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opinion-01.jpg)


加州州长纽森签署行政令，要求州政府机构评估AI对就业岗位的影响，并在裁员或自动化决策中优先保障工人权益。这是美国第一个针对AI导致失业的正式州级行动。关键点：要求企业披露使用AI替代岗位的计划；设立工人过渡基金；明确禁止“算法歧视”式裁员。为什么重要：加州作为科技产业腹地，其政策可能被其他州效仿，形成“监管底线竞赛”。

> 原文：https://the-decoder.com/california-governor-signs-first-us-executive-order-to-protect-workers-from-ai-job-loss/

### AI是未经授权的抄袭规模化？一篇博文引发的争论

![opinion-02.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opinion-02.jpg)


开发者兼博主Axel Kee发布博文，直言AI生成内容本质是将他人作品“未经授权地规模化抄袭”。该文迅速获得高赞，并引发关于AI训练数据合理使用边界的讨论。关键点：认为AI模型只是大规模“重新混合”训练数据，而非真正理解；指出当前法律框架无法有效追责；主张AI公司应支付版权费。为什么重要：这篇观点在技术圈和创作者中引发共鸣，可能推动版权诉讼和舆论压力。

> 原文：https://axelk.ee/ai-is-just-unauthorised-plagiarism-at-a-bigger-scale/

### 内存短缺推高消费电子价格，廉价智能手机时代结束

![opinion-03.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opinion-03.jpg)


AI大模型的训练和推理需求持续推高DRAM和NAND闪存价格，导致智能手机、PC等消费电子成本上升。关键点：主流智能手机厂商已上调中低端机型价格；8GB RAM成为入门配置已成历史，12GB起步；分析预计此轮涨价至少持续一年。为什么重要：对于产品经理和投资人而言，这意味着消费电子利润空间被压缩，终端市场可能迎来结构性分化——高端机更贵，低端机消失。

> 原文：https://davidoks.blog/p/ai-is-killing-the-cheap-smartphone

### 美国NTSB阻止AI用户重建遇难飞行员声音

![opinion-04.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opinion-04.jpg)


有用户利用NTSB公开的坠机调查文档，通过AI语音合成重建了遇难飞行员的语音，并发布在线。NTSB随即发函要求删除，称此举违反联邦规定，并可能干扰调查完整性。关键点：争议点在于公开文件是否允许被用于重建个人声音；AI语音技术的滥用风险显现。为什么重要：这起事件可能是“AI复活逝者”从娱乐走向法律纠纷的标志性案例，将推动对AI语音合成使用的立法。

> 原文：https://arstechnica.com/ai/2026/05/ai-users-re-create-dead-pilots-voices-from-crash-investigation-docs/

### 作者使用AI生成虚假引用仍坚持使用AI

![opinion-05.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opinion-05.jpg)


作家Steven Rosenbaum的新书被指出包含AI编造的参考文献和引文，但他公开表示仍会继续使用AI辅助写作。关键点：他表示自己会“更小心地核查”，但坚持AI能提升效率；出版界对其缺乏诚信表示谴责。为什么重要：这暴露了AI在知识生产中的可信度危机，尤其对于依赖事实的行业（学术、新闻、出版），如何防止“幻觉污染”成为紧迫问题。

> 原文：https://arstechnica.com/ai/2026/05/ai-put-synthetic-quotes-in-his-book-but-this-author-wants-to-keep-using-it/

### Steve Wozniak告诉毕业生：你们拥有人类智能，不是AI

![opinion-06.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opinion-06.jpg)


苹果联合创始人Wozniak在大学毕业演讲中强调，真实的人类智能与当前AI有本质区别，鼓励学生珍视自己的创造力和批判性思维。关键点：他指出AI擅长模仿但缺乏理解；提醒毕业生不要被AI的“表面智能”迷惑。为什么重要：作为硅谷标志性人物，Wozniak的发言代表了一种技术人文主义的警惕立场，会影响公众和行业对AI能力的正确认知。

> 原文：https://www.businessinsider.com/steve-wozniak-apple-ai-graduation-speech-2026-5

### GitHub面临生存之战：员工爆料内部乱象

![opinion-07.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opinion-07.jpg)


多位现任及前员工向媒体透露，GitHub在微软收购后逐渐失去独立文化，内部决策功能瘫痪。更细节指出，GitHub封杀Claude Code等外部AI工具，以保护自家Copilot。关键点：员工形容“GitHub在AI浪潮中迷失了方向”；平台开发者社区信任度下降。为什么重要：GitHub是开发者生态核心，其内部动荡可能影响整个开源协作流程，尤其对于依赖GitHub的AI开发者社群。

> 原文：https://www.infoq.cn/article/VZ4KvkToY57zj0ycsdBF

---

联邦与州在AI监管上背道而驰，企业将陷入合规迷局。当“创新阻碍”和“工人保护”成为口号，谁来决定AI的边界？


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


AI 代理开发正从单点实验走向基础设施搭建。今天开源社区集中发布了 8 个相关项目，覆盖代理的交互界面、技能框架、记忆管理和工具调用优化——这些不是零散的尝试，而是生态正在寻找标准化接口的信号。

### Datasette Agent 发布：可扩展 AI 助手

Simon Willison 正式发布 Datasette Agent，这是一个基于 Datasette 生态构建的 AI 助手，核心能力是通过插件机制扩展其知识库和工具集。关键点：支持 SQL 查询直接与数据库交互，插件可自定义数据源和处理管道。为什么重要：它将 AI 助手从通用聊天转向“可审计、可定制”的数据工作流，适合团队在内部数据上构建安全可控的代理。

> 原文：[Datasette Agent 发布公告](https://datasette.io/blog/2026/datasette-agent/)

### Claude Code 官方插件目录发布

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opensource-01.jpg)


Anthropic 推出了 Claude Code 的官方插件仓库，提供验证过的第三方扩展。关键点：插件涵盖代码审查、CI/CD 集成、文档生成等场景，统一发布在 GitHub 上。为什么重要：这是大型模型厂商首次为代码代理建立标准化插件市场，意味着开发者可以像装 VS Code 扩展一样增强 Claude Code 的能力，生态对复用的需求开始被平台方正式回应。

> 原文：[Anthropic 官方 Claude 插件仓库](https://github.com/anthropics/claude-plugins-official)

### CodeGraph：预索引代码知识图谱减少 Token 消耗

![opensource-02.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opensource-02.jpg)


CodeGraph 为 Claude Code 等代理提供本地的代码索引服务，将整个代码库结构化表示为知识图谱。关键点：预索引后，代理调用工具时只需查询图谱而非全文检索，显著降低 token 开销。为什么重要：Token 成本是代理普及的隐性障碍，CodeGraph 证明“本地先验知识”可以成为降低调用成本的标准范式。

> 原文：[CodeGraph GitHub 仓库](https://github.com/colbymchenry/codegraph)

### Superpowers：编码代理的可组合技能框架

![opensource-03.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opensource-03.jpg)


Superpowers 是一套完整的软件方法论，用于构建基于可组合技能的编码代理。关键点：它将复杂开发任务拆解为独立技能单元，代理按需组装执行。为什么重要：与之前“端到端 prompt”不同，这套框架强调技能的可复用性和调试性，符合工程化 AI 代理的趋势。

> 原文：[Superpowers GitHub 仓库](https://github.com/obra/superpowers)

### Google ADK 示例：Agent 开发工具包

![opensource-04.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opensource-04.jpg)


Google 发布 ADK Samples，提供一系列构建代理应用的参考实现。关键点：包含多轮对话、工具调用、记忆管理等典型场景的代码模板。为什么重要：ADK 是 Google 在 agentic 方向上的核心工具栈，这些示例降低了学习门槛，有利于吸引更多开发者进入其生态。

> 原文：[Google ADK Samples GitHub 仓库](https://github.com/google/adk-samples)

### Hermes Agent：开源可成长代理框架

![opensource-05.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opensource-05.jpg)


Nous Research 开源 Hermes Agent，一个持续学习的代理框架。关键点：代理可以在与用户交互过程中自我改进，更新自身知识库和行为策略。为什么重要：“可成长”是当前代理的痛点——静态模型无法适应动态环境，Hermes Agent 提供了开源的增量学习方案。

> 原文：[Hermes Agent GitHub 仓库](https://github.com/NousResearch/hermes-agent)

### OpenViking：面向 AI 代理的上下文数据库

![opensource-06.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opensource-06.jpg)


字节跳动开源 OpenViking，为代理统一管理内存、资源和技能。关键点：提供结构化上下文存储，支持将长期记忆与临时对话分离，并内置资源调度。为什么重要：代理的“记忆碎片化”是导致任务失败的常见原因，OpenViking 试图成为代理的专用“操作系统层”。

> 原文：[OpenViking GitHub 仓库](https://github.com/volcengine/OpenViking)

### CLI-Anything：让所有软件原生支持代理

![opensource-07.jpg](/marginalia/assets/img/ai-hot/2026-05-23/opensource-07.jpg)


HKUDS 项目 CLI-Anything 将任意桌面应用转化为 CLI 接口，使得 AI 代理可以通过命令调用它们。关键点：无需修改原软件代码，通过自动提取 GUI 元素生成 CLI。为什么重要：它解决了代理无法直接操作现有 GUI 软件的难题，扩展了代理的“肢体”范围。

> 原文：[CLI-Anything GitHub 仓库](https://github.com/HKUDS/CLI-Anything)

---

今天这些项目有一个共同暗示：Agent 开发正在进入“铺水管”阶段——接口标准化、成本优化、记忆管理、技能复用——这些基础设施一旦成熟，真正的 agentic 应用才会井喷。你所在的团队，准备好迁移到这套新工具链了吗？
