---
layout: "ai-hot"
title: "AI 晨报 · 2026-05-26"
date: "2026-05-26 06:00:00 +0800"
author: "Marginalia"
description: "2026-05-26 的 AI 圈每日动态汇总：DeepSeek宣布对其旗舰模型V4 Pro永久降价75%，同时推出原生编码Agent reasonix，缓存命中率极高，成本大幅降低。"
excerpt: "DeepSeek宣布对其旗舰模型V4 Pro永久降价75%，同时推出原生编码Agent reasonix，缓存命中率极高，成本大幅降低。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: company, name: "公司动态", emoji: "🏢", count: 8 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 8 }
  - { id: product, name: "应用产品", emoji: "📱", count: 8 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 8 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 8 }
---

今天最值得看的三件事：

- **公司动态** · DeepSeek永久降价75%并发布原生编码Agent reasonix
- **行业观点** · 教皇发布AI通谕：AI必须服务人类，而非少数权贵
- **研究论文** · DeepMind AlphaProof Nexus以极低成本破解多年数学难题

下文按板块展开，正文每条均附原始链接。



<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


今天的公司动态被两件事拉开：DeepSeek永久降价75%并推出原生编码Agent reasonix，把AI成本拉低一个量级；而项目管理公司ClickUp则裁员数百人，转而雇佣数千个AI代理。前者是技术产品方的价格重构，后者是企业用人逻辑的激进实验——这两条线，值得你同时关注。

### DeepSeek永久降价75%并发布原生编码Agent reasonix

DeepSeek宣布对其旗舰模型V4 Pro永久降价75%，并同步推出原生编码Agent reasonix。该Agent在缓存命中率上表现突出，推理成本大幅降低。这是DeepSeek自去年掀起价格战后的又一次激进定价——不是限时折扣，而是永久降价，意味着将低毛利作为长期战略。同时，reasonix作为原生编码Agent，指向AI辅助开发从“聊天式”转向“自主执行”的实战阶段。这轮操作既拉高了市场对编码Agent的预期，也压缩了同类产品的定价空间。

> 原文：https://www.bloomberg.com/news/articles/2026-05-23/deepseek-to-make-permanent-75-discount-on-flagship-ai-model

### OpenAI联手巴西媒体巨头，ChatGPT引入可信新闻

OpenAI与巴西媒体集团Grupo Folha和Grupo UOL达成战略合作，ChatGPT将接入其优质新闻内容，并确保来源归属和透明度。这是OpenAI在版权争议后加速推进“可信数据合作”的最新案例——通过授权协议获取高质量、有结构的新闻语料，既减少法律风险，又为模型输出增加可验证性。对巴西市场而言，ChatGPT的新闻引用能力将显著提升本地化体验，OpenAI也在拉美收获关键的地面阵地。

> 原文：https://openai.com/index/grupo-folha-grupo-uol-partnership

### ClickUp裁员数百人，用数千AI代理替代员工

![company-02.jpg](/marginalia/assets/img/ai-hot/2026-05-26/company-02.jpg)


成立九年的项目管理创业公司ClickUp解雇数百名员工，转而使用数千个AI代理完成客服、测试、内容管理等岗位工作。公司CEO表示这并非降低成本，而是“效率革命”。这一决策在硅谷引发激烈讨论：AI替代人类工作不再只是假设，而成为一家成熟SaaS公司的主动选择。问题在于，当AI代理全面接管后，组织创新、客户关系维护等依赖人类判断的环节能否被替代，尚无答案。

> 原文：https://techcrunch.com/2026/05/25/what-clickups-mass-layoff-tells-us-about-the-future-of-work/

### Waymo召回所有无人车，因暴雨导致系统失灵

![company-03.jpg](/marginalia/assets/img/ai-hot/2026-05-26/company-03.jpg)


Waymo因无人车在暴雨天气中出现系统故障，宣布大规模召回所有现役车辆，并暂停多个城市的Robotaxi服务。这是Waymo自2025年扩张以来最激进的一次安全行动——以往仅针对特定软件批次更新，此次是物理召回，说明问题涉及硬件或底层感知架构。自动驾驶在高鲁棒性场景中仍存在肉眼可见的短板，行业需要重新评估“去安全员”的节奏。

> 原文：https://www.qbitai.com/2026/05/424610.html

### 天机智能获10亿元融资，估值逼近百亿

![company-04.jpg](/marginalia/assets/img/ai-hot/2026-05-26/company-04.jpg)


45家机器人厂商背后的核心供应商——天机智能——完成新一轮10亿元融资，估值向百亿元进发。天机智能提供机器人的电机、减速器、控制器等关键模块，是典型的“卖铲人”角色。在人形机器人尚未大规模出货的今天，核心零部件企业先一步吃到资本红利，说明产业界对具身智能的长期预期远未降温。

> 原文：https://www.infoq.cn/article/0b36NHPQpYbf7586O1sJ

### 华为具身大脑一号位创业，获亿元级融资

![company-05.jpg](/marginalia/assets/img/ai-hot/2026-05-26/company-05.jpg)


原华为具身智能负责人离职创业，公司方向是用认知科学构建世界模型，已获得亿元级投资。具身智能领域的人才密度正在从大厂外溢，新的创业公司不再单纯堆硬件，而是尝试从人类认知机制中寻找通用感知与决策方案。这轮融资说明资本对“差异化技术路线”的认可，但能否落地仍取决于模型在真实物理世界中的表现。

> 原文：https://www.qbitai.com/2026/05/423455.html

### DeepSeek招兵买马，从零打造中国版Claude Code

![company-06.jpg](/marginalia/assets/img/ai-hot/2026-05-26/company-06.jpg)


DeepSeek宣布招募团队，从底层开始构建类似Claude Code的原生编码Agent工具。这与同日推出的reasonix形成呼应——reasonix是成熟产品的降价与推出，而新团队则自研底层能力，意味着DeepSeek打算补齐“推理+编码+工程”的全栈Agent能力。对于开发者工具市场，这将是一场由模型厂商发起的垂直竞争。

> 原文：https://www.infoq.cn/article/zqYChrE48RgRbWTX7vhT

### 米奥会展1.5亿元认购阶跃星辰股份

![company-07.jpg](/marginalia/assets/img/ai-hot/2026-05-26/company-07.jpg)


会展公司米奥会展以1.5亿元认购AI公司阶跃星辰少数股权。跨行业投资AI通常意味着上市公司试图将AI能力注入传统业务，但阶跃星辰的估值与技术路线尚未公开，这笔投资存在一定不确定性。对关注AI财务风险的人而言，这是一个典型的“产业资本触AI”案例，值得关注后续业务协同情况。

> 原文：https://36kr.com/newsflashes/3824694921188227?f=rss

---

今天的信息密度很高：DeepSeek的低价策略敲响了中小模型厂的警钟，ClickUp的裁人实验则为“AI替代白领”写下了最新注脚。当价格降到肉搏、当代理取代员工，你所在的企业准备好了吗？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


今天研究板块最值得关注的是 Google DeepMind 的 AlphaProof Nexus——用几百美元的计算成本，解决了一个困扰数学界数十年的开放问题，标志着 AI 在纯数学推理上进入实用化降本阶段。但与此同时，SaaS-Bench 评测狠狠戳破了一个泡沫：主流大模型在真实办公任务中完全自动化通过率最高仅为 3.8%，AI 全自动办公远未到来。开发者需要认清：AI 在符号推理和模糊任务之间的能力鸿沟仍然巨大。

### DeepMind AlphaProof Nexus：数百美元破解数十年难题

![research-00.jpg](/marginalia/assets/img/ai-hot/2026-05-26/research-00.jpg)


**是什么**：Google DeepMind 发布 AlphaProof Nexus，一个极低成本的数学证明系统，仅用数百美元的计算资源就解决了数学界长期未解的难题。  
**关键点**：传统数学推理依赖大规模算力，而 AlphaProof Nexus 通过高效的搜索和验证机制，将成本降至可忽略的水平，打破了“顶级数学问题必须由顶尖人力解决”的路径。  
**为什么重要**：这暗示符号推理的 AI 路线正在走向经济可行。对于技术投资者和研究者而言，值得关注纯推理模型在药物设计、密码学等领域的应用潜力——成本门槛大幅下降后，更多垂直问题可能被快速攻克。  
> 原文：[The Decoder](https://the-decoder.com/google-deepminds-alphaproof-nexus-solves-decades-old-math-problems-for-a-few-hundred-dollars/)

### Apple 开源高效图像压缩模型 MLPICO

**是什么**：Apple 推出 Perceptual Image Codec (MLPICO)，一种基于学习的图像压缩方案，并已开源。  
**关键点**：MLPICO 利用感知质量度量指导压缩，在相同比特率下视觉质量优于传统方法（如 JPEG、WebP），同时保持计算效率适用于设备端推理。  
**为什么重要**：Apple 开源此举将推动移动端和边缘设备的高效图像传输。对于产品经理和开发者，这意味着可以通过更低的带宽成本获得更高视觉保真度的图片体验，尤其在 AR/VR 或实时通信场景中。  
> 原文：[apple.github.io](https://apple.github.io/ml-pico/)

### SaaS-Bench 揭穿 AI 全自动办公神话，Claude 通过率仅 3.8%

![research-02.jpg](/marginalia/assets/img/ai-hot/2026-05-26/research-02.jpg)


**是什么**：UniPat AI 发布 SaaS-Bench 评测，模拟真实企业办公流程（如填写表单、多步骤协作、审批等），测试主流大模型的完全自动化能力。结果：最高分（Claude）仅 3.8%，GPT-4o 和 Gemini 表现更差。  
**关键点**：大多数模型在步骤衔接、权限理解、跨系统交互等维度频频失败，连“半自动化”（需人类介入）都难以稳定实现。  
**为什么重要**：这个评测直接否定了“AI 将取代白领”的短期叙事。对技术决策者而言，将 AI 嵌入复杂办公流时，必须设计 humans-in-the-loop 架构，而非期待端到端自主。  
> 原文：[量子位](https://www.qbitai.com/2026/05/424277.html)

### ByteDance 研究发现：训练长文档模型时，“提问”优于“转录”

![research-03.jpg](/marginalia/assets/img/ai-hot/2026-05-26/research-03.jpg)


**是什么**：ByteDance 研究表明，在处理长文档训练时，通过向大模型提问（例如针对文档内容提问）而非直接要求模型转录文本，能显著提升对长上下文的利用效率。  
**关键点**：传统方法试图让模型逐句转录或总结，但模型容易丢失重点；提问式训练迫使模型主动检索关键信息，从而在推理时更准确地定位文档中的相关段落。  
**为什么重要**：长上下文模型是当前竞争焦点（如 GPT-5、Gemini 等），这项研究提供了更高效的训练策略。对于从事 RAG 或文档问答产品的团队，这一发现可以直接优化数据构建 pipeline。  
> 原文：[The Decoder](https://the-decoder.com/bytedance-study-finds-that-asking-lmms-questions-beats-making-it-transcribe-text-for-long-document-training/)

### 港中文提出 MindVLA-U1：语言赋能自动驾驶决策

**是什么**：香港中文大学李鸿升团队论文被顶会接收，提出 MindVLA-U1 架构，让视觉-语言-行动（VLA）模型不再输给仅有视觉-行动（VA）的传统方案。  
**关键点**：核心是引入语言模型对场景进行高层推理（如“前方有施工，需变道”），再将推理结果转换为控制信号，而非简单端到端映射。  
**为什么重要**：此方法可解释性更强，且能处理罕见场景（corner case）。对自动驾驶创业公司和主机厂而言，VLA 路线若能与语言模型高效结合，可能加速从 L2+ 迈向 L4。  
> 原文：[雷锋网](https://www.leiphone.com/category/ai/aBSRTXyAOqvn84ow.html)

### 蚂蚁灵波 LingBot-VA 论文入选 RSS 2026

![research-05.jpg](/marginalia/assets/img/ai-hot/2026-05-26/research-05.jpg)


**是什么**：蚂蚁集团旗下的灵波机器人团队（LingBot）论文被机器人顶会 RSS 2026 接收，提出“边推演边行动”的 VLA 架构。  
**关键点**：该架构在机器人执行任务时动态推理下一步动作，而非依赖固定策略，在复杂操作（如抓取、移动）中表现出更好的适应性。  
**为什么重要**：这是国内企业 VLA 研究被顶级机器人会议认可的案例。对于机器人开发者，它提供了一个可复用的设计思路：在行动中持续规划，而非提前生成全部步骤。  
> 原文：[量子位](https://www.qbitai.com/2026/05/424581.html)

### AI 芯片成本结构剧变：内存占近三分之二

![research-06.jpg](/marginalia/assets/img/ai-hot/2026-05-26/research-06.jpg)


**是什么**：Epoch AI 发布数据分析，显示 AI 芯片组件成本中内存占比已接近三分之二，而计算单元（如 GPU core）占比大幅下降。  
**关键点**：随着模型变大，高带宽内存（HBM）和显存封装成本暴涨，成为芯片成本的主导因素。算力瓶颈正在从计算转移到内存带宽与容量。  
**为什么重要**：这一趋势将重塑 AI 芯片设计——未来可能更注重内存优化（如近存计算、存内计算），而非单纯堆砌计算单元。对芯片投资人和工程师来说，内存解决方案的估值逻辑应被重新审视。  
> 原文：[Epoch AI](https://epoch.ai/data-insights/ai-chip-component-cost-shares)

### 研究揭示 AI 模型引用错误率高：答案对但来源错

![research-07.jpg](/marginalia/assets/img/ai-hot/2026-05-26/research-07.jpg)


**是什么**：CiteVQA 研究发现，AI 模型在回答问题时经常给出正确答案，但却指向错误的文本来源（例如引用不存在的段落或张冠李戴）。  
**关键点**：在开放域问答中，模型“答对但引错”的比例高达 20%-30%，尤其当答案依赖多篇文档时，跨文档引用错误更加严重。  
**为什么重要**：这直接挑战了 AI 在事实核查、法律检索、学术写作等场景中的可信度。对产品经理而言，需要在系统设计中植入引用验证机制，而不能轻信模型的“证据”。  
> 原文：[The Decoder](https://the-decoder.com/ai-models-often-give-the-right-answers-but-point-to-the-wrong-sources/)

---

结语：AlphaProof 给了我们一个“低成本破难题”的希望，而 SaaS-Bench 又给了我们一个“办公自动化是梦”的现实。下个月，你的团队会尝试用 AI 自动填一张报销单，还是让它去解一道数学题？


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


体验Amazon Bee可穿戴设备，奇妙与毛骨悚然并存。这款AI助手能在手腕上随时响应，但它的环境录音能力也让人不安。今天应用产品板块最重要的信号：可穿戴AI正在加速落地，但隐私红线如何划清，将决定这类产品是成为工具还是监视器。

### 我试了亚马逊Bee：神奇与毛骨悚然之间

![product-00.jpg](/marginalia/assets/img/ai-hot/2026-05-26/product-00.jpg)


是什么：TechCrunch记者体验了Amazon Bee AI可穿戴设备——一个吸附在衣物或手腕上的小装置，能通过语音和轻触交互，调用亚马逊的AI助手完成查天气、设提醒、控制家居等任务。关键点：设备的便利性确实令人印象深刻——无需掏出手机，随时提问；但其持续监听环境的能力也引发强烈隐私焦虑，尤其是它可能记录敏感对话。为什么重要：Bee代表了亚马逊将AI服务从屏幕延展到身体的尝试，其市场反应将验证消费者对「始终在线」可穿戴AI的接受度。如果隐私担忧未能妥善解决，它可能步玻璃眼镜后尘。

> 原文：https://techcrunch.com/2026/05/24/i-tried-amazons-bee-wearable-and-am-both-intrigued-and-slightly-creeped-out/

### 300克AI主机跑122B模型：巴掌大小性能惊人

是什么：一款重量仅300克的AI主机展示出运行122B参数大语言模型的能力，性能令人意外。关键点：硬件设计极为紧凑，尺寸约如巴掌大小，却能本地部署百亿级参数模型，推理速度可圈可点。这表明边缘AI算力正从「能用」走向「够用」。为什么重要：对于产品经理和开发者而言，这意味着在机器人、边缘服务器甚至高端IoT设备上直接运行大型模型成为可能，减少对云端的依赖并降低延迟。

> 原文：https://www.leiphone.com/category/industrynews/OKDJKKDkUhQYDaee.html

### 英特尔WildCat Lake：AI PC普及的战略芯片

是什么：英特尔发布WildCat Lake处理器，基于18A工艺，专为主流轻薄本设计，集成AI加速单元。关键点：WildCat Lake强调能效比和成本控制，目标是将AI PC功能（如实时翻译、图像生成）带入中低价位笔记本，而非仅限旗舰。为什么重要：如果成功，这将在2026-2027年大幅拉低AI PC的入门门槛，加速用户从传统PC向AI原生设备的迁移，对操作系统和应用生态提出新需求。

> 原文：https://www.leiphone.com/category/chips/gAjsNSvozgcw55bE.html

### DeepSeek V4优化工具：成本降至2折

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-05-26/product-03.jpg)


是什么：一款面向DeepSeek V4的优化工具通过缓存命中率99.82%的机制，大幅降低API调用成本。关键点：实测中，一份4亿+token的账单从61美元降至12美元，降幅约80%。工具原理是智能复用此前计算的结果。为什么重要：对于依赖大模型API的创业团队，这将显著压缩推理成本门槛，使得长上下文或高频调用场景（如客服、文档分析）更经济可行。

> 原文：https://www.qbitai.com/2026/05/424552.html

### 谷歌改进Android CLI：AI代理操控安卓设备

![product-04.jpg](/marginalia/assets/img/ai-hot/2026-05-26/product-04.jpg)


是什么：Google为Android CLI新增接口，允许AI代理直接调用Android工具链，实现对设备的自动化操作。关键点：过去AI代理操控手机多依赖无障碍服务或RPA模拟点击，现在CLI层面提供原生通道，执行效率更高且更稳定。为什么重要：这是谷歌将Android打造成agentic操作系统的关键一步，未来AI代理可以一键设置手机、批量管理应用、自动化测试等，极大扩展移动端AI应用场景。

> 原文：https://www.infoq.cn/article/UAYjt4mXTI5oSGg46LLL

### Pi Coding Agent：可定制的编码助手框架

是什么：一款开箱即用的编码代理工具Pi Coding Agent，允许开发者自定义插件和规则。关键点：它提供了基础的代码补全、重构和调试功能，同时开放API供团队接入自己的代码规范或数据库。为什么重要：相比封闭的编码助手，可定制化让企业能在安全与效率间取得平衡，适合需要私有化部署的开发团队。

> 原文：https://www.producthunt.com/products/pi-coding-agent-3

### MashuPack：一键打包代码库供AI理解

是什么：MashuPack工具将代码库整理为纯净的文本文件，便于输入给Claude或ChatGPT等LLM使用。关键点：它自动忽略.ignore文件、合并依赖关系、生成项目摘要，将复杂工程结构压缩为单文件上下文。为什么重要：对于需要AI辅助理解完整项目的开发者，MashuPack消除了手动整理代码的痛点，让大模型能快速把握全貌。

> 原文：https://www.producthunt.com/products/mashupack

### Free Claude Code：开源免费替代的Claude CLI

是什么：开源项目允许用户免费使用Claude Code的终端工具和VSCode扩展，甚至支持语音输入。关键点：它实现了与官方Claude Code类似的功能（代码生成、debug），但无需付费订阅，依赖开发者自行配置API key。为什么重要：降低了高级编码助手的使用门槛，尤其适合个人开发者或预算有限的团队，但需注意开源版本的更新与维护风险。

> 原文：https://github.com/Alishahryar1/free-claude-code

---

当可穿戴AI、超小算力主机和成本断崖式下降的工具同时出现，你是否觉得「AI原生应用」的爆发点比预期来得更早？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


今日最重要的一件事：教皇Leo十四世发布首份AI通谕《Magnifica Humanitas》，明确警告不透明的AI由少数公司控制将导致“新形式的非人化”。这不是宗教与科技的隔空喊话，而是全球治理层面对AI权力集中的一次正式定性——科技公司无法再假装“技术中性”。

### 教皇通谕：AI必须服务人类，而非少数权贵

**是什么：** 教皇Leo十四世在首份通谕《Magnifica Humanitas》中，系统阐述了天主教对人工智能的伦理立场。核心观点：AI发展不应由少数公司的不透明决策主导，否则将“把人类工具化，以服务于少数人的利润或权力”。通谕呼吁全球制定具有约束力的AI伦理框架，将“人类尊严”置于效率与增长之上。

**关键点：** 这不是一份仅面向天主教徒的声明。通谕特意引用了技术哲学与劳工议题，直接批评“数据殖民主义”和“算法封建主义”。它还明确反对将AI用于武器系统以及社会信用评分等大规模监控场景。

**为什么重要：** 梵蒂冈作为全球约13亿信徒的精神中心，其道德权威能直接影响多国立法讨论。通谕发布后，欧盟AI法案修订小组已表态将参考其部分原则；美国部分州议员也借机推动AI透明法案。对科技公司而言，这意味着未来不仅要面对监管，还要应对来自宗教界的道德审查——这种压力不同于商业竞争，更难通过游说消解。

> 原文：https://www.vatican.va/content/leo-xiv/en/encyclicals/documents/20260515-magnifica-humanitas.html

### George Hotz：编码代理是软件开发的“最昂贵错误”

**是什么：** 编程传奇George Hotz（曾破解iPhone、创办Comma.ai）发表长文，直言依赖AI编码代理会使代码质量不可逆地崩溃，是“整个行业的战略失误”。

**关键点：** Hotz认为，编码代理（如GitHub Copilot、Cursor等）会在三个层面产生副作用：一，开发者不再理解自己写的代码，无法调试深层逻辑；二，模型倾向于生成“看起来正确但实际有微妙错误”的代码，累积成技术债；三，团队失去对架构的判断力，导致系统复杂度失控。他称这种现象为“永恒的Sloptember”，暗示开发者陷入了永远修不完的修补循环。

**为什么重要：** Hotz的批评来自一线实战经验，而非理论推测。他并非反对AI辅助，而是反对把代码生成权完全交给模型。对于CTO和架构师而言，这是一个警示：当团队越来越多地按Tab完成工作，你是否有能力在灾难发生前发现问题？投资人则需留意：那些标榜“AI写代码”的初创公司，其技术护城河可能比想象中浅。

> 原文：https://geohot.github.io//blog/jekyll/update/2026/05/24/the-eternal-sloptember.html

### Hassabis称人类处于奇点山脚，LeCun批当前AI并不智能

![opinion-02.jpg](/marginalia/assets/img/ai-hot/2026-05-26/opinion-02.jpg)


**是什么：** DeepMind创始人Demis Hassabis认为人类正站在奇点（singularity）的“山脚下”，而Meta首席AI科学家Yann LeCun则在同一活动中直怼：当前最先进的AI甚至还不算“智能”。

**关键点：** 两人同台于一个AI伦理论坛。Hassabis强调，未来5-10年内我们将看到“超出人类理解的智能”出现（即奇点），但必须确保它被安全设计。LeCun反驳称，当前的大语言模型没有目标、没有常识、没有因果关系推理能力，只是“高级统计模式匹配”，离真正的智能还差得远。LeCun还讽刺：“如果一个系统连杯子里的水满了该停下来都不知道，叫什么智能？”

**为什么重要：** 这场争论不是学术闲谈。它直接关系到投资方向：Hassabis的观点（奇点临近）会刺激更多人对AGI下注；而LeCun的泼冷水则暗示，当前基于LLM的商业模式可能很快碰到天花板。对产品经理而言，两队技术路线的分歧也意味着，你在选择基础模型架构时，需要警惕被某一方的叙事绑架。

> 原文：https://the-decoder.com/deepminds-hassabis-sees-humanity-in-the-foothills-of-the-singularity-while-lecun-says-current-ai-isnt-intelligent/

### “AI洗白”泛滥：企业抢戴AI帽子，监管日趋严格

![opinion-03.jpg](/marginalia/assets/img/ai-hot/2026-05-26/opinion-03.jpg)


**是什么：** 越来越多传统企业通过更名、公关稿或简单的API调用，就声称自己“成为AI公司”。《卫报》调查发现，过去一年有超过200家上市公司在财报中首次出现“AI”关键词，但其中约60%没有实际AI研发投入。监管机构开始严厉打击“AI洗白”（AI-washing）。

**关键点：** 美国SEC已对至少5家公司发起虚假宣传调查；英国CMA也在审核“AI标签”的广告合规。典型手法如：将Excel宏命名为“AI优化”、用OpenAI的API做了一个客服机器人就宣称“自研AI引擎”、更换公司名加入“AI”字样后股价短期拉升10-20%。

**为什么重要：** 对于投资人，“AI洗白”意味着估值泡沫风险。对于产品经理，真正做AI的公司正面临信任危机——“市面上的AI产品可能只是换皮”。监管趋严后，那些没有技术底子的公司会迅速暴雷，留下真正有壁垒的玩家。警惕：下一次你听到某家公司“全面拥抱AI”，不妨先查一下他们的研发人员配比。

> 原文：https://www.theguardian.com/technology/2026/may/24/ai-washing-pr-firms-scrambling-rebrand

---

当教皇、黑客与监管共同指向同一个疑惑：我们是否在用AI解决错误的问题？留给读者的思考是——当你今天按下Tab键，那是效率，还是逃逸。


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


导语：今天最值得关注的是Anthropic正式推出官方管理的Claude Code插件目录，标志着AI编码代理从单点工具走向平台化生态。当社区贡献的插件开始被官方认证，意味着开发者的选择不再依赖GitHub上的孤岛项目，而是一个有质量背书的分发渠道。对于技术决策者而言，这是判断AI编码代理能否成为下一基础设施的关键信号。

### Anthropic发布官方Claude Code插件目录，开启生态

![opensource-00.jpg](/marginalia/assets/img/ai-hot/2026-05-26/opensource-00.jpg)


Anthropic官方管理的Claude Code插件目录正式上线，首批收录社区贡献的编码代理插件。该目录由Anthropic直接维护，类似VS Code插件市场，但专为Claude Code的agentic工作流设计。关键点是：插件通过官方审核，能降低安全风险；开发者可扩展Claude Code的行为，如自定义代码审查、自动化测试等。重要性在于，这是Anthropic首次将Claude Code从单一产品升级为平台，意味着AI编码代理开始具备类似IDE的生态基础，吸引更多第三方参与。

> 原文：[https://github.com/anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)

### Multica开源：打造AI编码代理团队协作平台

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-05-26/opensource-01.jpg)


Multica是一个开源平台，允许人类将AI编码代理作为团队成员分配任务并跟踪进度。它解决了当前AI编码工具多为单兵作战的问题。关键点：支持多代理并行工作，可设定独立任务、依赖关系和进度看板；每个代理有独立对话上下文。重要性在于，它提供了“AI作为同事”而非“AI作为工具”的协作范式，适用于复杂项目中的任务拆解和并行开发，尤其对需要管理多个AI实例的团队有实际价值。

> 原文：[https://github.com/multica-ai/multica](https://github.com/multica-ai/multica)

### CodeGraph开源：预索引代码知识图谱，节省AI编码token

CodeGraph为Claude Code、Codex等编码代理自动构建本地代码知识图谱，减少不必要的文件浏览和LLM调用。关键点：通过静态分析生成函数、类、依赖关系索引，代理可直接查询图谱获取上下文，而非逐个读取源文件；可显著降低token消耗（作者称可节省30%-50%）。重要性在于，随着AI编码代理频繁使用，token成本已从概念变成实际预算问题，CodeGraph提供了一种无需牺牲准确性即可压缩输入量的方案。

> 原文：[https://github.com/colbymchenry/codegraph](https://github.com/colbymchenry/codegraph)

### Pi Agent Toolkit发布：模块化AI编码代理与统一API

Pi是一套AI代理工具包，包含编码代理CLI、统一LLM API（支持多供应商切换）、终端UI和Slack机器人。关键点：模块化设计允许开发者只取所需组件，例如只使用统一API层来切换不同模型；内置的Slack机器人可让团队在聊天中直接调用代理。重要性在于，它降低了集成多种AI能力的门槛，尤其适合需要快速在内部搭建自定义AI工作流的团队，作为开源替代商业工具（如Cline、Copilot Workspace）的灵活选项。

> 原文：[https://github.com/earendil-works/pi](https://github.com/earendil-works/pi)

### Datasette 1.0a30发布：新增跳转菜单及AI代理插件

开源数据探索工具Datasette发布新Alpha版本，带来可自定义的跳转菜单（便于跨数据导航），同时datasette-agent插件让AI代理能直接通过自然语言查询SQLite数据库。关键点：跳转菜单支持管理员配置常用视图或仪表盘链接；AI代理插件基于MCP协议，允许Claude等直接执行查询。重要性在于，Datasette从静态数据发布工具进化成AI可交互的数据后端，这对数据目录、内部知识库的AI化改造有借鉴意义。

> 原文：[https://simonwillison.net/2026/May/24/datasette/#atom-everything](https://simonwillison.net/2026/May/24/datasette/#atom-everything)

### Aider持续更新：终端AI编程搭档

![opensource-05.jpg](/marginalia/assets/img/ai-hot/2026-05-26/opensource-05.jpg)


Aider是终端中运行的AI结对编程工具，支持GPT-4、Claude 3.5/Opus等多模型，自动处理git提交。关键点：区别于Copilot的内嵌体验，Aider坚持终端原生交互；支持一次修改多个文件，并自动生成清晰的commit消息。重要性在于，它在开发者社区中已积累成熟口碑，是追求轻量、透明、可不依赖IDE场景的首选方案，适合偏好命令行的资深工程师。

> 原文：[https://github.com/Aider-AI/aider](https://github.com/Aider-AI/aider)

### Honcho开源：为AI代理提供长期记忆库

![opensource-06.jpg](/marginalia/assets/img/ai-hot/2026-05-26/opensource-06.jpg)


Honcho是一个开源的内存库，帮助AI代理保持多轮对话上下文和用户记忆，类似应用端的人设信息。关键点：支持结构化记忆（用户偏好、历史行为）和向量化记忆（语义检索）；可作为独立服务与任何代理集成。重要性在于，AI代理当前最大的短板之一是“每轮对话都像第一次见面”，Honcho填补了这种有状态记忆的空白，适合构建个性化AI助手或长期陪伴型应用。

> 原文：[https://github.com/plastic-labs/honcho](https://github.com/plastic-labs/honcho)

### Onyx开源AI平台发布：一站式连接所有大模型

![opensource-07.jpg](/marginalia/assets/img/ai-hot/2026-05-26/opensource-07.jpg)


Onyx提供开源AI聊天平台，支持与任何LLM（包括本地部署的开源模型）集成，具备文档索引、RAG等功能。关键点：目标对标Dify或Flowise的体验，但强调开箱即用的文档索引和多种部署方式（Docker、K8s）。重要性在于，它降低了普通团队搭建企业内部AI问答系统的复杂度，尤其适合希望私有化部署、同时对接多个供应商的场景。

> 原文：[https://github.com/onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx)

---

结语：当AI编码代理的插件生态、团队协作、记忆库和知识图谱在同一天集中涌现，你准备好迎接“代理即基础设施”的下一波了吗？
