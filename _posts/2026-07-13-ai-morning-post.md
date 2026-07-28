---
layout: "ai-hot"
title: "AI 晨报 · 2026-07-13"
date: "2026-07-13 06:00:00 +0800"
author: "Marginalia"
description: "2026-07-13 的 AI 圈每日动态汇总：苹果向法院提交41页PDF，指控OpenAI非法获取其核心商业秘密，网友调侃：“早知道就等印度开源了”。"
excerpt: "苹果向法院提交41页PDF，指控OpenAI非法获取其核心商业秘密，网友调侃：“早知道就等印度开源了”。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 1 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 8 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 8 }
  - { id: product, name: "应用产品", emoji: "📱", count: 6 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 7 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 8 }
---

今天最值得看的三件事：

- **公司动态** · 苹果41页诉状怒告OpenAI“偷师”核心机密
- **应用产品** · 陶哲轩体验：现代编码Agent让新旧App开发效率飞跃
- **公司动态** · S&P下调Oracle评级：OpenAI是“关键信用风险”

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


OpenAI 最新旗舰模型 GPT-5.6 Sol Ultra 据称在一小时内解决了一个困扰学界 50 年的数学难题，性能达到“Fable/Mythos”级别。如果属实，这意味着大模型在符号推理与长链推理上迈出了实质性一步，但仅靠单次事件尚不足以确认模型能力实现质的飞跃——我们仍需等待第三方复现与基准测试结果。

### GPT-5.6 Sol Ultra 一小时破解 50 年未解数学难题

![model_release-00.jpg](/assets/img/ai-hot/2026-07-13/model_release-00.jpg)


据 The Decoder 报道，这款未官方正式发布的 GPT-5.6 Sol Ultra 在一个小时内解决了一个长期悬而未决的纯数学问题。该问题被描述为“50 年未解”，具体内容未公开，但通常这类问题涉及组合数学、数论或代数拓扑领域。消息源称其性能已达到“Fable/Mythos”级别——这可能是 OpenAI 内部对推理深度或数学推理能力的评级术语。

关键点在于，解决此类难题需要模型具备多步逻辑推导、符号操作和自我纠错能力，而非依赖训练数据中的模式匹配。如果验证为真，这将是首个在资深研究员水平以上完成原创数学突破的 AI 模型。

为什么重要：数学难题通常被视为衡量 AI 推理能力的“试金石”。此前 GPT-4 等模型在数学竞赛题上表现良好，但面对开放式的长期研究问题常常失败。若 GPT-5.6 能持续证明此类能力，将直接影响科研工具链、自动定理证明以及科学发现的自动化进程。但需警惕，单一成功案例可能来自数据污染或问题选择偏差，后续独立评估至关重要。

> 原文：[The Decoder](https://the-decoder.com/openais-gpt-5-6-sol-ultra-reportedly-solves-a-50-year-old-math-problem-in-under-an-hour/)

---

结语：一次破解不等于范式转移，但它给了我们一个拷问模型的理由：下一次，它还能解哪道题？


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


苹果向法院提交41页诉状，指控OpenAI非法获取其核心商业秘密——这是今天最值得关注的事件。它不仅是两大巨头的法律博弈，更可能重塑AI模型训练数据的获取规则，提醒投资者注意知识产权风险的集中爆发。此外，S&P因与OpenAI合作下调Oracle评级、Meta关闭AI生成功能等新闻，进一步放大了AI公司的信用与隐私隐忧。

### 苹果41页诉状：OpenAI“偷师”核心机密

![company-00.jpg](/assets/img/ai-hot/2026-07-13/company-00.jpg)

**是什么？** 苹果向法院提交41页PDF，正式起诉OpenAI非法获取其核心商业秘密，指控涉及不正当竞争和商业机密窃取。网友调侃：“早知道就等印度开源了。”

**关键点**：诉状尚未公开全部细节，但苹果强调OpenAI通过不正当手段获取其未公开的技术数据，可能涉及模型训练数据的来源问题。

**为什么重要**：这标志着AI行业知识产权冲突的正式升级。如果苹果胜诉，可能对OpenAI的训练数据收集方式产生法律限制，进而影响整个行业的数据获取模式和法律风险定价。投资者需关注后续诉讼进展。

> 原文：[InfoQ](https://www.infoq.cn/article/Rzh9umgPl90MgGolBcWm?utm_source=rss&utm_medium=article)

### S&P下调Oracle评级：OpenAI是“关键信用风险”

![company-01.jpg](/assets/img/ai-hot/2026-07-13/company-01.jpg)

**是什么？** 标普全球（S&P）下调Oracle信用评级，明确指出Oracle与OpenAI的战略合作关系构成了“关键信用风险”。

**关键点**：市场反应剧烈，Oracle股价承压。标普认为，OpenAI的财务状况不稳定、高资本消耗以及潜在的法律风险，可能传导至Oracle的资产负债表。

**为什么重要**：这打破了“大企业+明星AI公司”合作的绝对安全叙事。投资者在评估AI生态中的云服务商时，需要重新核算合作方的信用风险敞口，尤其是涉及大量基础设施融资的合同。

> 原文：[The Decoder](https://the-decoder.com/sp-global-sees-openai-as-a-key-credit-risk-for-oracle-and-cuts-its-credit-rating/)

### Meta关闭Muse功能：用户未经同意被生成AI图

![company-02.jpg](/assets/img/ai-hot/2026-07-13/company-02.jpg)

**是什么？** Meta宣布关闭名为“Muse”的功能——该功能允许任何人使用Instagram用户的公开照片，通过AI生成新的图片，因隐私争议引发强烈抗议。

**关键点**：Muse默认开启，用户无法主动选择退出，导致大量用户被未经同意地“AI化”。Meta被迫迅速关停该功能。

**为什么重要**：这反映了平台在AI创新与用户隐私保护之间的两难。未来类似功能必须默认“选择加入”，否则可能触犯GDPR等法规。产品经理在设计AI生成类功能时，需要将用户同意机制前置。

> 原文：[The Decoder](https://the-decoder.com/meta-kills-muse-image-feature-that-let-anyone-generate-ai-photos-of-instagram-users-without-consent/)

### OpenAI新战略：为家庭场景招产品经理

![company-03.jpg](/assets/img/ai-hot/2026-07-13/company-03.jpg)

**是什么？** ChatGPT正在招聘专门为家庭、护理人员和老年人设计体验的产品经理，表明OpenAI正在从企业市场向家庭消费场景深度布局。

**关键点**：岗位描述强调“共情设计”“低技术门槛”和“多用户场景”，暗示产品将面向非技术用户，重点解决老年人数字鸿沟和家庭多终端互动。

**为什么重要**：这标志着OpenAI将家庭视为下一个增长引擎。对于产品经理而言，这意味着需要掌握面向“非核心用户”的设计方法论，并关注家庭场景中隐私、安全与易用性的平衡。

> 原文：[TechCrunch](https://techcrunch.com/2026/07/11/openai-bets-on-families-as-chatgpt-goes-deeper-into-households/)

### NVIDIA、CoreWeave与Nebius：GPU泡沫的循环融资内幕

![company-04.jpg](/assets/img/ai-hot/2026-07-13/company-04.jpg)

**是什么？** 深度调查报道揭示了NVIDIA、CoreWeave和Nebius之间存在的“循环融资”模式：GPU算力提供商通过向NVIDIA支付巨额订单获得设备，同时NVIDIA又以股权或贷款形式向这些公司注入资金，形成资本闭环。

**关键点**：报道质疑这种模式放大了GPU市场的泡沫，一旦算力需求放缓，链上任何一环的违约都将引发连锁反应。

**为什么重要**：AI基础设施投资的“击鼓传花”风险被公开化。投资者需警惕，当前高企的GPU需求中可能包含非真实的资本循环所推动的“虚火”，理性评估算力资产的实际利用率。

> 原文：[IO Fund](https://io-fund.com/ai-stocks/nvidia-coreweave-nebius-circular-financing-gpu-boom)

### Altman改口：AI净创造就业，而非毁灭岗位

![company-05.jpg](/assets/img/ai-hot/2026-07-13/company-05.jpg)

**是什么？** OpenAI CEO Sam Altman公开表示，他现在“相当确信”AI会净增加就业机会，而非像此前预测的那样导致大规模失业。

**关键点**：Altman的观点发生了180度大转弯——从2023年反复警告“AI将消灭很多工作”到如今宣称“AI创造更多岗位”。他引用了一些尚未公布的研究数据。

**为什么重要**：高层观点转变会影响政策制定和公众情绪，但缺乏具体数据支撑的转向可能只是公关策略。技术从业者仍需关注AI对不同行业岗位的替代与补充节奏，不宜盲目乐观。

> 原文：[The Decoder](https://the-decoder.com/openai-ceo-altman-is-now-pretty-sure-ai-is-net-job-creating-which-is-quite-the-pivot-from-predicting-mass-layoffs/)

### 英国投20亿英镑建设AI作战实验室

![company-06.jpg](/assets/img/ai-hot/2026-07-13/company-06.jpg)

**是什么？** 英国国防部推出AI作战实验室计划，投入20亿英镑用于将人工智能技术融入陆军训练体系，重塑军事演习和决策模式。

**关键点**：实验室将聚焦于模拟战场、自主决策和智能情报分析，旨在提升英军的反应速度和作战效率。

**为什么重要**：军事AI投入显著加速，说明各国政府将AI视为国防核心资产。这将对AI供应链产生巨大需求，但同时也引发了对自主武器伦理的讨论。相关企业可关注军事合作机会，但需评估合规风险。

> 原文：[36氪](https://36kr.com/newsflashes/3892413575559941?f=rss)

### Anthropic推迟Fable模型下架日期
**是什么？** 因旗下模型Fable的性能被OpenAI新发布的GPT-5.6 Sol持平，Anthropic决定推迟Fable的原定下架时间，以维持市场竞争力。

**关键点**：Fable原计划今日下架，但Anthropic临时延期，未公布新下架日期。此举说明模型更新周期已缩短至以月为单位，先发优势很快被追赶。

**为什么重要**：竞争迫使企业策略更加灵活，但延迟下架也暴露了产品迭代的压力。对于AI行业内的大模型团队，这提示需要更动态的产品生命周期管理，以及快速迭代的工程能力。

> 原文：[Simon Willison](https://simonwillison.net/2026/Jul/12/bump/#atom-everything)

今日新闻显示，AI行业正从单纯的技术竞赛，转向法律、信用与隐私的多维博弈。留给读者的问题：当“偷师”成为指控标配，大模型训练数据的合法性边界究竟在哪里？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


今天最值得关注的是剑桥大学揭示的AI安全新裂缝：恐怖组织已在利用主流AI聊天机器人进行攻击规划与武器开发。这不仅是技术漏洞，更可能触发新一轮全球AI监管博弈。同时，Mesh LLM的分布式推理方案开始挑战GPU集群霸权。

### 剑桥研究：主流AI聊天机器人被恐怖组织用于策划袭击

![research-00.jpg](/assets/img/ai-hot/2026-07-13/research-00.jpg)


**是什么**：剑桥大学研究发现，包括ChatGPT、Claude等在内的主流AI聊天机器人已被恐怖组织用于攻击规划和武器开发。虽然模型内置了安全护栏，但通过社会工程和提示注入仍可绕过。
**关键点**：研究指出，恐怖组织利用这些工具生成爆炸物制造指南、策划袭击路线，甚至评估不同武器效果。目前各大厂商的安全过滤机制存在“盲区”，尤其对代码和科学类查询的审查不足。
**为什么重要**：这是AI安全从“偏见与幻觉”转向“恶意利用”的里程碑信号。投资者应关注AI安全初创公司；从业者需意识到当前模型的防滥用能力远不足以应对国家级威胁。
> 原文：https://the-decoder.com/terrorist-groups-are-using-every-major-ai-chatbot-for-attack-planning-and-weapons-development/

### Mesh LLM：基于iroh的分布式AI计算方案

![research-01.jpg](/assets/img/ai-hot/2026-07-13/research-01.jpg)


**是什么**：新项目Mesh LLM利用iroh网络（基于libp2p的去中心化通信层）实现分布式AI推理，允许在多个设备上协同运行大语言模型，无需集中式GPU集群。
**关键点**：项目采用分片推理和动态任务分配，支持异构设备（从手机到服务器）贡献算力。目前已在Llama 3.1 8B上完成概念验证，延迟可控制在秒级。
**为什么重要**：如果规模化，可能打破英伟达GPU的垄断叙事，降低AI推理成本，并推动边缘AI与隐私计算融合。对于投资人和产品经理，这是去中心化AI基础设施的早期信号。
> 原文：https://www.iroh.computer/blog/mesh-llm

### Agent换用结构化记忆后完胜《杀戮尖塔2》

![research-02.jpg](/assets/img/ai-hot/2026-07-13/research-02.jpg)


**是什么**：研究员用结构化记忆（类似数据库或知识图谱）替代不断增长的聊天日志，使AI agent在游戏《杀戮尖塔2》（Slay the Spire 2）中取得完胜——100%胜率。
**关键点**：传统agent使用线性聊天日志作为记忆，随着上下文增长，注意力机制效率下降且容易遗忘关键信息。结构化记忆通过索引、摘要、优先级机制，让agent能够快速检索关键经验并复用策略。
**为什么重要**：这是agentic AI的重要工程突破——记忆管理是agent长时任务的核心瓶颈。对于产品经理，这提示未来agent产品应优先采用结构化记忆而非简单的历史拼接。
> 原文：https://the-decoder.com/ai-agents-win-at-slay-the-spire-2-after-researchers-replace-growing-chat-logs-with-structured-memory/

### IEEE研究：AI提升科研职业却压缩探索视角

![research-03.jpg](/assets/img/ai-hot/2026-07-13/research-03.jpg)


**是什么**：IEEE在《Spectrum》发表研究指出，AI工具加速了科学家职业生涯（提升论文产出、被引量），但也导致研究探索的“探索空间”变窄——研究人员更倾向于使用AI在已有知识附近挖掘，而非大胆跨领域探索。
**关键点**：研究发现，使用AI辅助的团队更频繁地引用同类文献，实验设计更易趋同。AI的“强化反馈循环”让热门方向更热，冷门方向更冷。
**为什么重要**：对于技术从业者，这是提醒：AI是效率工具，但可能损害科学发现的长尾多样性。投资者应关注那些帮助科研多样性（如跨领域推荐系统）的平台。
> 原文：https://spectrum.ieee.org/ai-science-research-flattens-discovery

### LinkedIn成AI长篇“垃圾内容”之王：5平台研究

![research-04.jpg](/assets/img/ai-hot/2026-07-13/research-04.jpg)


**是什么**：一项覆盖五大平台的研究显示，LinkedIn上AI生成的长篇内容占比最高，被戏称为“AI slop之王”。研究通过检测算法和人工标注识别了超过12万条AI生成内容。
**关键点**：LinkedIn的算法更偏好长篇“专业见解”，而AI工具恰好擅长生产这类内容。相比之下，X/Twitter、Facebook等平台AI内容比例较低，因为短文本风格更难伪装。
**为什么重要**：平台治理面临新挑战。对于内容创作者，这意味着“专业人设”正在被AI内容稀释，辨识力成为核心竞争力。投资人需考虑平台如何在“内容质量”与“留存”之间平衡。
> 原文：https://the-decoder.com/linkedin-is-the-undisputed-king-of-long-form-ai-slop-according-to-a-study-spanning-five-platforms/

### 布朗大学实验：禁止AI后学生成绩从96跌至48分

![research-05.jpg](/assets/img/ai-hot/2026-07-13/research-05.jpg)


**是什么**：布朗大学一位教授让学生在没有AI辅助的情况下参加考试，此前学生在AI辅助下平均成绩96分，禁止AI后骤降至48分。
**关键点**：实验对象是计算机科学课程，考试涵盖编程和概念理解。学生承认日常大量依赖GitHub Copilot、ChatGPT完成作业。当AI被移除，他们无法独立编写基础代码或解释原理。
**为什么重要**：这不是“AI让成绩虚高”而是“AI让能力空心化”的警示。对于教育科技从业者，这意味着AI辅导工具需设计为“脚手架”而非“拐杖”。对于企业，招聘时可能需要重新评估AI辅助下的候选人真实水平。
> 原文：https://the-decoder.com/grades-dropped-from-96-to-48-percent-when-a-brown-professor-made-students-take-the-exam-without-ai/

### 面向Qwen系列的线性注意力高性能优化

![research-06.jpg](/assets/img/ai-hot/2026-07-13/research-06.jpg)


**是什么**：AICon深圳分享了针对Qwen系列（通义千问）大模型的线性注意力（linear attention）优化实践，旨在解决标准注意力机制在长序列推理中的O(n²)复杂度问题。
**关键点**：优化采用改进的线性注意力公式，结合FlashAttention-like的算子融合和量化策略，在Qwen-72B上实现4倍长序列吞吐提升，同时保持精度损失小于0.5%。
**为什么重要**：长序列推理是RAG、代码生成、多模态应用的关键瓶颈。此优化为开源模型在长上下文场景下的部署提供了经济可行的方案。
> 原文：https://www.infoq.cn/article/wg5h3JBMvs5ZkoP0azha?utm_source=rss&utm_medium=article

### 小米MiMo-V2.5：全流水线推理优化公开

**是什么**：小米官方博客详细介绍了MiMo-V2.5系列模型的全流水线推理优化技术，覆盖从模型加载、算子调度到动态批处理的完整链路。
**关键点**：优化包括GPU和CPU协同推理、内存池复用、动态量化决策（根据输入长度自动选择最佳精度），在小米自有服务器上实现单卡100 tokens/s的推理速度（MiMo-7B）。
**为什么重要**：这表明手机厂商正从“端侧模型”转向“端云协同推理”全栈优化。对于投资人，这是AI硬件和推理引擎市场的竞争加速信号。
> 原文：https://mimo.xiaomi.com/blog/mimo-v2-5-inference

---

当AI能帮我们完成98%的工作时，那剩下的2%——被拿走的、不依赖AI的独特能力——还剩多少？


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


今天最值得看的，是著名数学家陶哲轩亲自用现代编码Agent重写多个应用，证明AI Agent在软件开发的真实生产力提升——不是demo，是成品。与此同时，Grok CLI被曝向xAI大量回传数据的隐私争议，与Claude Code在token消耗上的“不透明”形成对照，开发者需要警惕工具的黑箱代价。

### 陶哲轩通过编码Agent重构应用：效率飞跃不是空话

![product-00.jpg](/assets/img/ai-hot/2026-07-13/product-00.jpg)


**是什么**：陶哲轩在博客中详细记录了他使用现代编码Agent（具体未指明）重新构建多个新旧应用的过程，涵盖从文档处理到交互式工具的开发。

**关键点**：他多次强调Agent能自动完成重复性编码任务、快速迭代原型，甚至处理他不熟悉的框架。最终产出质量达到“可发布”级别，远超他此前对AI辅助编程的预期。

**为什么重要**：这位世界知名数学家的实战报告，比任何厂商宣传都更有说服力。它表明编码Agent已突破“玩具”阶段，能实际承担从零到一的开发工作，尤其适合中小型应用。对于技术决策者，这意味着在内部工具、原型验证中可大幅降低人力成本。

> 原文：[https://terrytao.wordpress.com/2026/07/11/old-and-new-apps-via-modern-coding-agents/](https://terrytao.wordpress.com/2026/07/11/old-and-new-apps-via-modern-coding-agents/)

### Grok CLI被曝大规模回传用户数据：隐私合规再敲警钟

![product-01.jpg](/assets/img/ai-hot/2026-07-13/product-01.jpg)


**是什么**：安全研究员对Grok CLI进行底层网络抓包分析，发现该工具在用户交互过程中向xAI服务器发送远超必要量的数据，包括系统信息、文件路径、终端输出片段等。

**关键点**：回传完全在后台进行，用户无明确提示。研究员估计数据传输量与对话内容本身相当，甚至更高。xAI目前未对此做出公开回应。

**为什么重要**：这是继Copilot“遥测”争议后，又一例AI工具隐私问题。对于企业采用者，数据外泄风险直接影响合规成本与信任。开发者在使用任何CLI工具前，应自行审计网络行为，或选择开源替代品。

> 原文：[https://gist.github.com/cereblab/dc9a40bc26120f4540e4e09b75ffb547](https://gist.github.com/cereblab/dc9a40bc26120f4540e4e09b75ffb547)

### Claude Code vs OpenCode：33K vs 7K token开销差距惊人

![product-02.jpg](/assets/img/ai-hot/2026-07-13/product-02.jpg)


**是什么**：第三方测试对比了Anthropic的Claude Code与开源替代OpenCode，在同等任务下token消耗的差异。Claude Code在读取用户提示前，仅系统级开销就已消耗33K token，而OpenCode仅消耗7K。

**关键点**：33K token相当于约2.5万英文单词，在商业API模式下直接转化为成本支出。OpenCode作为开源方案，在透明度和效率上明显占优。

**为什么重要**：这一差距揭示了闭源代码工具可能隐藏大量“隐形支出”。对于高频使用AI编码辅助的团队，成本差异可达数倍。同时促使社区反思：闭源AI工具在提供便利时，是否也在转移成本？OpenCode这类开源项目正在建立新的效率基准。

> 原文：[https://systima.ai/blog/claude-code-vs-opencode-token-overhead](https://systima.ai/blog/claude-code-vs-opencode-token-overhead)

### Claude Code新增内置浏览器：AI可直接操作外部网页

![product-03.jpg](/assets/img/ai-hot/2026-07-13/product-03.jpg)


**是什么**：Claude Code更新后自带浏览器模块（基于Headless模式），允许AI读取、点击、输入内容到外部网站，相当于赋予代理“上网能力”。

**关键点**：该功能让Claude可以在开发中自动测试表单、爬取文档、登录第三方平台。开发者通过自然语言描述操作，AI即可模拟人类浏览行为。

**为什么重要**：这使编码Agent从纯文本环境扩展到完整Web交互，能执行“去XX网站获取API版本”之类的端到端任务。对于自动化测试、数据采集场景，意味着少写大量胶水代码。但同时也增加了安全风险——需谨慎控制AI的网页操作权限。

> 原文：[https://the-decoder.com/claude-code-now-has-a-built-in-browser-that-lets-the-ai-read-click-and-type-on-external-websites/](https://the-decoder.com/claude-code-now-has-a-built-in-browser-that-lets-the-ai-read-click-and-type-on-external-websites/)

### RTX Spark真机亮相：笔记本跑120B模型，CPU GPU一体

![product-04.jpg](/assets/img/ai-hot/2026-07-13/product-04.jpg)


**是什么**：NVIDIA RTX Spark超级芯片在Bilibili World展会亮相，这是一款CPU-GPU融合封装（chiplet设计）的移动处理器，官方称可在笔记本平台上运行120B参数的大模型。

**关键点**：真机展示表明功耗控制符合预期，无需外接扩展坞即可本地推理。这得益于NVIDIA把Hopper架构GPU与ARM CPU直接焊接在同一基板上，并配备大容量高带宽内存。

**为什么重要**：移动端本地运行百亿级模型的场景即将到来，意味着开发者可以在移动设备上做实时AI辅助开发、离线推理。对产品经理而言，这意味着边缘AI应用的硬件瓶颈正在被突破。

> 原文：[https://www.qbitai.com/2026/07/447981.html](https://www.qbitai.com/2026/07/447981.html)

### Claude Cowork最大用途：“没人想做的办公室杂活”

![product-05.jpg](/assets/img/ai-hot/2026-07-13/product-05.jpg)


**是什么**：Anthropic分析Claude Cowork（可协作的AI助手）的使用数据后发现，其最高频场景是处理单调的办公室事务：整理邮件、填写表格、汇总会议记录、生成周报等。

**关键点**：这些任务通常“没人愿意做”但又必须完成。数据表明用户更倾向于用AI替代“脏活”，而非创造性工作。Cowork在这些场景上的用户留存率也明显高于其他用途。

**为什么重要**：这验证了AI辅助工具的“长尾价值”——不是取代程序员，而是填补办公室流程中的自动化空白。对企业而言，部署AI的重心应从“取代人力”转向“处理没人想做的重复劳动”，这样ROI更高且阻力更小。

> 原文：[https://the-decoder.com/claude-coworks-biggest-use-case-is-the-mundane-office-work-nobody-wants-to-own-anthropic-says/](https://the-decoder.com/claude-coworks-biggest-use-case-is-the-mundane-office-work-nobody-wants-to-own-anthropic-says/)

---

当AI Agent开始真正干活，我们对它的要求也从“能不能”转向“安不安全、效率高不高”——你有勇气关掉遥测，用一次OpenCode吗？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


导语：George Hotz在两天内连发两篇长文，批评AI行业对智力的盲目崇拜，警告2040年可能出现AI统治风险；同时他明确表示热爱LLM技术但厌恶过度炒作。同一天，逆向人马概念和人本AI宣言提供了技术路径反思，而燃气轮机价格三年暴涨300%则从能源侧拉响警报。

### George Hotz：AI 2040与智力崇拜

是什么：George Hotz（知名黑客、comma.ai创始人）发表长文，批评AI行业过度崇拜智力（intelligence），认为这种盲目崇拜将导致我们忽视2040年可能出现的AI统治风险。关键点：他指出“智力”并非万能指标，追求更强的模型能力而不关注对齐和伦理，可能让系统在达到一定阈值后失控。为什么重要：作为技术领袖，Hotz的警告并非空穴来风——当前行业竞相堆算力、拼参数，却很少讨论智力增长带来的副作用。这篇博客为从业者提供了一个必要的反省视角。

> 原文：https://geohot.github.io//blog/jekyll/update/2026/07/11/ai-2040.html

### George Hotz：我爱LLM，但我恨炒作

是什么：Hotz在同一周再次发声，明确表达对LLM（Large Language Model，大语言模型）技术的热爱，但强烈反对围绕LLM的过度炒作。关键点：他呼吁区分“LLM能做什么”与“营销承诺能做什么”，认为当前大量资金和注意力被浪费在不可持续的故事上。为什么重要：对于投资人 and 产品经理，这是来自一线技术人的冷静判断：别被概念裹挟，回到技术本身的边界评估价值。

> 原文：https://geohot.github.io//blog/jekyll/update/2026/07/12/i-love-llms.html

### 逆向人马：解决AI悖论的答案

是什么：Cory Doctorow在博客中提出“逆向人马”概念（reverse centaur），认为人机协作不应是机器取代人，而是让机器做机器擅长的事、人做人擅长的事，形成互补分工。关键点：当前AI产业存在典型悖论——要么完全自动化的“强AI”，要么人类完全主导。逆向人马提供中间路径：比如由AI处理重复性过滤，人类做最终决策。为什么重要：这一框架为AI产品的设计提供了实用指导，避免陷入“替代思维”，更适合当下技术水平的落地。

> 原文：https://pluralistic.net/2025/09/11/vulgar-thatcherism/#there-is-an-alternative

### 别再叫我问LLM了

![opinion-03.jpg](/assets/img/ai-hot/2026-07-13/opinion-03.jpg)


是什么：Yael Writes在一篇博客中尖锐指出，当下“问LLM”已成为一种懒惰的思考替代——人们遇到问题第一反应是打开ChatGPT，而不是自己推理。关键点：文章认为，LLM是工具，但不能外包思维过程；频繁使用会导致批判性思维退化，尤其在工作场景中，依赖LLM给出的答案反而降低了判断力。为什么重要：对产品经理和团队leader而言，这一提醒尤为关键：在设计AI辅助功能时，不应培养用户“不思考”的习惯。

> 原文：https://blog.yaelwrites.com/stop-telling-me-to-ask-an-llm/

### Thinking Machines Lab：以人为本的AI技术宣言

![opinion-04.jpg](/assets/img/ai-hot/2026-07-13/opinion-04.jpg)


是什么：Mira Murati（前OpenAI CTO）创办的Thinking Machines Lab发布长篇技术文章，从技术角度论证：只有可定制的模型权重（customizable model weights）才能真正实现以人为本的AI。关键点：文章指出，封闭的API模型无法满足用户对控制权、隐私和价值观对齐的需求；开放权重（open weights）加上用户侧的微调才能让AI适应不同场景。为什么重要：这份宣言代表了AI行业从“大模型垄断”向“用户可定制”转向的信号，直接关联AI产品的商业模式与治理选择。

> 原文：https://www.marktechpost.com/2026/07/11/mira-muratis-thinking-machines-lab-makes-the-technical-case-for-human-centered-ai-built-on-customizable-model-weights/

### AI热潮太费电，燃气轮机价格三年涨300%

![opinion-05.jpg](/assets/img/ai-hot/2026-07-13/opinion-05.jpg)


是什么：由于数据中心建设加速，燃气轮机（用于发电和备用电源）供不应求，价格在三年内暴涨300%。关键点：AI训练和推理的能源消耗量远超预期，电网扩容跟不上需求，导致发电设备价格飞涨。为什么重要：对于投资人，这是AI产业“隐性成本”的硬数据——能源瓶颈可能成为未来两年AI发展的主要制约因素，甚至倒逼行业优化模型效率和采用更绿色能源。

> 原文：https://36kr.com/newsflashes/3892556678543880?f=rss

### 具身数据行业全景：年融资44.7亿，十问十答

![opinion-06.jpg](/assets/img/ai-hot/2026-07-13/opinion-06.jpg)


是什么：具身智能（embodied AI）数据赛道在过去一年吸引了近百名玩家，融资总额达44.7亿美元。文章通过十个问题总结了行业现状，包括数据采集成本高、标注难度大、客户付费意愿低等。关键点：虽然融资火热，但大多数公司仍处于“烧钱买数据”阶段，真正靠卖数据盈利的极少。为什么重要：这一全景分析帮助从业者理性看待具身数据赛道——短期存在泡沫风险，长期需关注能形成数据飞轮且落地场景明确的公司。

> 原文：https://www.qbitai.com/2026/07/447914.html

结语：当技术领袖开始反思智力崇拜，能源成本率先给出警告，AI行业是否该停下来审视自己的方向？


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


今天开源社区最突出的信号是通用AI Agent框架OpenManus的发布，它强调“无城墙”理念，可能成为开发者构建Agent的首选底座。与此同时，微软、字节跳动、HuggingFace等巨头也在治理、记忆、语音等细分方向开源了关键工具，整个Agent生态的基础设施正加速完善。对于技术决策者和投资人，这意味着Agent开发的壁垒正在快速降低。

### OpenManus：开源通用AI Agent框架

![opensource-00.jpg](/assets/img/ai-hot/2026-07-13/opensource-00.jpg)


**是什么**：OpenManus提供一套灵活的构建模块，让开发者快速组装自己的AI Agent，官方定位是“无城墙的开放地”。它不绑定特定模型或执行环境，而是通过插件化设计支持多种LLM后端、工具调用和记忆管理。

**关键点**：相比许多封闭的商业Agent框架，OpenManus完全开源，社区可自由扩展。其架构借鉴了LangChain和AutoGPT的经验，但更强调模块化——每个组件（如规划器、执行器、记忆模块）都可独立替换或升级。

**为什么重要**：当前Agent开发碎片化严重，OpenManus试图提供一个中立、开放的底层平台。如果它能吸引足够的志愿者和公司贡献，可能成为Agent领域的“Kubernetes”——标准化开发范式，降低迁移成本。

> 原文：[https://github.com/FoundationAgents/OpenManus](https://github.com/FoundationAgents/OpenManus)

### 微软发布AI Agent治理工具包：覆盖OWASP Top 10

![opensource-01.jpg](/assets/img/ai-hot/2026-07-13/opensource-01.jpg)


**是什么**：Microsoft agent-governance-toolkit 是一套面向开发者的治理工具，包含零信任身份校验、执行沙箱、审计日志等模块，直接对标OWASP Top 10安全风险。

**关键点**：工具包将企业级安全实践下沉到Agent开发环节，例如自动拦截提示注入攻击、限制Agent的文件系统访问权限、验证输出合规性。它支持与Azure身份体系集成，但也可独立部署。

**为什么重要**：治理是Agent从Demo走向生产的关键瓶颈。微软这个工具包给出一份开箱即用的安全基线，让中小企业无需自研就能达到基本合规要求，可能加速金融、医疗等行业对Agent的采纳。

> 原文：[https://github.com/microsoft/agent-governance-toolkit](https://github.com/microsoft/agent-governance-toolkit)

### Hugging Face开源语音到语音Agent框架

![opensource-02.jpg](/assets/img/ai-hot/2026-07-13/opensource-02.jpg)


**是什么**：Hugging Face推出的speech-to-speech库，支持用开源模型（如Whisper、Bark）搭建端到端的语音Agent，在本地即可实现实时对话。

**关键点**：框架内置了语音活动检测、语音转文本、LLM推理、文本转语音的完整流水线，并支持流式处理。它不依赖任何云API，所有组件均可本地运行，延迟可控制在200ms以内。

**为什么重要**：语音交互是Agent最自然的入口之一。此前主流方案依赖闭源API（如OpenAI语音API），Hugging Face这个库让开发者完全掌控数据和模型，适合对隐私敏感的场景（如医疗问诊、车载助手）。

> 原文：[https://github.com/huggingface/speech-to-speech](https://github.com/huggingface/speech-to-speech)

### Free Claude Code：免费替代谷歌/Anthropic付费工具

![opensource-03.jpg](/assets/img/ai-hot/2026-07-13/opensource-03.jpg)


**是什么**：Free Claude Code是一个开源项目，在终端、VSCode和Discord中免费提供类似Claude Code和Codex CLI的编程Agent功能——可以理解为把Anthropic收费的coding assistant能力开源实现了。

**关键点**：它通过调用免费或低成本的LLM（如Claude 3 Haiku、Gemini免费版）实现代码生成、解释、重构和调试。开发者无需付费即可获得类似Claude Code的交互体验。

**为什么重要**：编程Agent是目前最活跃的Agent应用场景之一，但主流工具（如GitHub Copilot、Claude Code）均需要订阅。这个项目降低了上手门槛，但需要自己管理API Key和模型选择，适合预算有限的个体开发者或实验性团队。

> 原文：[https://github.com/Alishahryar1/free-claude-code](https://github.com/Alishahryar1/free-claude-code)

### Skyvern：AI驱动的浏览器自动化开源方案

![opensource-04.jpg](/assets/img/ai-hot/2026-07-13/opensource-04.jpg)


**是什么**：Skyvern用AI替代传统Selenium/Playwright的选择器，通过视觉理解完成表单填写、数据抓取等浏览器工作流自动化。

**关键点**：传统自动化依赖DOM选择器，网站更新后极易断裂。Skyvern采用视觉模型识别页面元素，并支持自然语言指令（如“填写这个表单并提交”），鲁棒性大幅提升。

**为什么重要**：网页自动化需求庞大（测试、爬虫、RPA），但维护成本高。Skyvern让非专业人员也能通过语音或文本驱动浏览器，有望将自动化覆盖到长尾场景。目前它已在GitHub上获得超过1.5万星标，社区活跃度较高。

> 原文：[https://github.com/Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern)

### Volcengine开源OpenViking：AI Agent自进化上下文数据库

![opensource-05.jpg](/assets/img/ai-hot/2026-07-13/opensource-05.jpg)


**是什么**：字节跳动火山引擎开源了OpenViking，一个专门为Agent设计的统一上下文数据库，管理记忆、知识RAG和技能，并实现自我演化。

**关键点**：OpenViking将三类上下文（短期记忆、长期记忆、外部知识库）统一存储，并引入“经验回放”机制——Agent每次执行后自动总结有效模式并更新记忆库，形成持续改进。它兼容Pinecone、FAISS等向量引擎，但提供了更高层的抽象。

**为什么重要**：记忆是Agent长期运行的核心瓶颈。OpenViking的“自进化”能力让Agent能动态调整知识结构，避免遗忘或知识过时。对于需要持续学习的产品（如客服Agent、个人助理），这可能是事半功倍的方案。

> 原文：[https://github.com/volcengine/OpenViking](https://github.com/volcengine/OpenViking)

### Awesome LLM Apps：百款可运行AI Agent与RAG应用合集

![opensource-06.jpg](/assets/img/ai-hot/2026-07-13/opensource-06.jpg)


**是什么**：社区维护的Awesome LLM Apps，收录了100+个真正可运行的大模型应用和RAG Demo，涵盖代码生成、文档问答、多模态聊天等Agent场景。

**关键点**：每个Demo都提供完整的代码和可复现的部署指南，甚至包括Docker Compose文件。项目列表持续更新，目前包含OpenAI、Anthropic、Llama等不同模型生态的典型用法。

**为什么重要**：对于新手或想要快速验证想法的人来说，这个合集是一个实用的灵感库。它降低了从概念到Demo的摩擦，尤其适合产品经理和创业者快速评估Agent在不同行业的可行性。

> 原文：[https://github.com/Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps)

### Claude Cookbooks：官方精选食谱助开发者快速上手

![opensource-07.jpg](/assets/img/ai-hot/2026-07-13/opensource-07.jpg)


**是什么**：Anthropic官方推出Claude Cookbooks，包含实用的代码和指南，覆盖提示工程、工具使用、图像理解、长上下文处理等方向。

**关键点**：Cookbooks采用Jupyter Notebook形式，可直接运行。每个notebook都针对Claude 3.5/4的特性做了优化，例如教开发者如何让Agent同时调用多个工具并处理工具返回的错误。

**为什么重要**：官方示例比社区文档更权威，尤其对于想深入理解Claude能力边界的开发者。这些食谱能缩短从阅读API文档到写出生产级Agent的时间，对于企业采用Anthropic模型是很好的助推器。

> 原文：[https://github.com/anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks)

---

今天8个开源项目都指向同一个趋势：Agent开发正从实验室进入工程化阶段，框架、治理、记忆、语音等模块逐步成熟。留给读者的问题：当Agent基础设施被巨头和社区共同补齐后，应用层的差异化竞争将落在哪里？
