---
layout: "ai-hot"
title: "AI 晨报 · 2026-05-24"
date: "2026-05-24 06:00:00 +0800"
author: "Marginalia"
description: "2026-05-24 的 AI 圈每日动态汇总：谷歌CEO皮查伊亲自介绍Gemini 3.5，称其速度提升4倍，每年可节省超10亿美元成本，内部已被颠覆。"
excerpt: "谷歌CEO皮查伊亲自介绍Gemini 3.5，称其速度提升4倍，每年可节省超10亿美元成本，内部已被颠覆。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 4 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 5 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 2 }
  - { id: product, name: "应用产品", emoji: "📱", count: 8 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 8 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 8 }
---

今天最值得看的三件事：

- **公司动态** · DeepSeek V4 API永久降价75%，梁文锋称目标是AGI
- **模型发布** · 谷歌深夜发布Gemini 3.5，速度快4倍年省10亿美元
- **模型发布** · 英伟达开源Nemotron扩散语言模型，文本生成速度接近光速

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


今天的模型战场，速度成为唯一主线。谷歌 Gemini 3.5 将推理成本砍掉近一个量级，英伟达用扩散架构挑战自回归霸权，而阿里与 Anthropic 则各自展示了“自主运行”与“漏洞发现”这两面镜子——模型能力的边界在快速外扩，但维护责任也在同步膨胀。

### 谷歌深夜发布Gemini 3.5：速度提升4倍，年省超10亿美元

![model_release-00.jpg](/marginalia/assets/img/ai-hot/2026-05-24/model_release-00.jpg)


谷歌CEO皮查伊亲自站台，宣布 Gemini 3.5 正式发布。核心卖点是推理速度比前代快4倍，直接换算成基础设施成本，每年可节省超10亿美元。据内部消息，该模型已替代旧版本支撑谷歌内部多个核心业务线。

关键点在于：速度提升来自架构级优化而非简单堆算力。这意味着中小团队若无法复现这种效率，将在大规模推理场景中失去竞争力。对投资者而言，“年省10亿”不仅仅是成本故事——它暗示着谷歌在模型商业化的边际成本上已拉开身位。

> 原文：[InfoQ - 谷歌CEO皮查伊亲自介绍Gemini 3.5](https://www.infoq.cn/article/COda3jCSAliReaA4YVJc)

### 英伟达开源Nemotron扩散语言模型，文本生成速度接近“光速”

![model_release-01.jpg](/marginalia/assets/img/ai-hot/2026-05-24/model_release-01.jpg)


NVIDIA 发布 Nemotron-Labs 扩散语言模型，采用扩散方法替代自回归，将文本生成速度推至接近理论极限。Hugging Face 官方博客称该模型在长文本生成任务上延迟降低一个数量级。

关键点：扩散模型在图像生成领域早已成熟，但在语言模型上一直受限于离散 token 的采样效率。Nemotron 证明了扩散路径在语言上同样可行，且能显著提速。对开发者而言，这意味着实时对话、流式输出等场景的部署成本可能大幅下降——英伟达正在从卖 GPU 转向卖模型架构标准。

> 原文：[Hugging Face Blog - NVIDIA Nemotron-Labs Diffusion](https://huggingface.co/blog/nvidia/nemotron-labs-diffusion)

### 阿里Qwen模型自主运行35小时，优化自研芯片代码

![model_release-02.jpg](/marginalia/assets/img/ai-hot/2026-05-24/model_release-02.jpg)


阿里公布最新进展：其 AI 模型 Qwen 连续自主运行 35 小时，为自家定制芯片优化底层代码，未有人工干预。据 The Decoder 报道，该模型在编译开关、内存布局等环节进行了数千次尝试，最终生成性能提升明显的补丁。

关键点：这是“软件定义硬件”的典型实践——模型不仅能写代码，还能针对特定硬件架构做编译器级别的优化。对芯片厂商而言，AI 驱动芯片设计自动化（AI for Chip）的成熟速度可能快于预期。但需警惕：自主运行 35 小时不等于完全可靠，依赖度需长期验证。

> 原文：[The Decoder - Alibaba's AI model ran autonomously for 35 hours to optimize code for its own custom chip](https://the-decoder.com/alibabas-latest-ai-model-ran-autonomously-for-35-hours-to-optimize-code-for-its-own-custom-chip/)

### Anthropic发布Claude Mythos预览版：捉bug速度超过修复能力

![model_release-03.jpg](/marginalia/assets/img/ai-hot/2026-05-24/model_release-03.jpg)


Anthropic 推出 Claude Mythos Preview，专攻代码漏洞发现。实测中其发现 bug 的数量和速度远超开发团队修复能力，导致安全团队被迫优先排序漏洞等级，甚至需要暂停部分功能以避免补丁堆积。

关键点：这不是模型能力翻车，而是效率失衡带来的安全悖论——漏洞发现速率远超修复流水线规模。对 CISO 和工程管理者来说，这意味着需要重新审视安全操作流程：自动化发现工具必须与自动化修复工具联动，否则只会制造“半开的后门”。Claude Mythos 或许会成为安全运维中的一个新标杆，但也暴露出工具矩阵不配套的短板。

> 原文：[The Decoder - Anthropic warns Claude Mythos Preview finds bugs faster than developers can patch them](https://the-decoder.com/anthropic-warns-claude-mythos-preview-finds-bugs-faster-than-developers-can-patch-them/)

---

速度决定成本，成本决定规模，规模决定生态——今天发布的每一个模型，都在尝试重新定义这三个变量的关系。你的团队准备好迎接“漏勺式”工具链了吗？


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


今天最值得关注的是DeepSeek宣布V4-Pro API永久降价75%，梁文锋称优先目标是AGI研究而非盈利——这一价格调整直接冲击模型API市场。与此同时，微软突然取消Claude Code许可证，开发者社区强烈反弹，背后或隐藏与Anthropic的竞争。AI公司的商业策略正在出现明显分化。

### DeepSeek V4-Pro API永久降价75%，AGI优先于盈利

![company-00.jpg](/marginalia/assets/img/ai-hot/2026-05-24/company-00.jpg)


DeepSeek官方今日宣布V4-Pro模型API价格永久调整为原价的1/4，即每百万token的输入/输出价格降至原先的25%。创始人梁文锋在内部信中明确表示，公司第一目标是通用人工智能（AGI）研究，而非短期盈利。这一策略与当前主流AI公司普遍追求商业化的路径形成鲜明对比。考虑到V4-Pro在多项基准测试中已与GPT-4o持平，降价可能引发新一轮API价格战，并进一步挤压中小模型厂商的生存空间。

> 原文：https://api-docs.deepseek.com/quick_start/pricing

### 微软突然取消Claude Code许可证，开发者社区炸锅

![company-01.jpg](/marginalia/assets/img/ai-hot/2026-05-24/company-01.jpg)


微软开始撤销开发者此前购买的Claude Code许可证，受影响用户反馈未获得提前通知或退款。Claude Code是Anthropic推出的代码生成工具，微软此举被普遍解读为与Anthropic的竞争——微软此前已通过GitHub Copilot和Azure OpenAI服务布局代码智能，Claude Code直接威胁其生态。开发者社群在Reddit和X平台上激烈讨论，部分用户称将转向其他平台。事件折射出大型平台在AI工具授权上的话语权与不确定性。

> 原文：https://www.theverge.com/tech/930447/microsoft-claude-code-discontinued-notepad

### OpenAI每赚1美元亏1.22美元，财务压力持续

![company-02.jpg](/marginalia/assets/img/ai-hot/2026-05-24/company-02.jpg)


OpenAI向外界披露最新财务数据：即使剔除股权激励成本，每收入1美元仍净亏损1.22美元。这意味着公司运营层面每赚1美元要烧掉2.22美元的现金等价物。此前OpenAI已通过多轮融资和变卖资产维持运转，但长期亏损模型能否支撑到大规模盈利仍存争议。该数据再次引发市场对AI公司“烧钱换增长”模式的质疑，并可能影响其未来估值。

> 原文：https://the-decoder.com/openai-burned-through-1-22-per-dollar-earned-even-after-stripping-out-stock-based-compensation/

### 美团外卖前负责人获投餐饮具身模型，不造人形机器人

![company-03.jpg](/marginalia/assets/img/ai-hot/2026-05-24/company-03.jpg)


元节智能宣布完成千万级种子轮融资，团队核心为美团外卖前高管。公司明确不涉足人形机器人，而是聚焦餐饮后厨场景，研发具身模型（embodied model）驱动的协作机器人，解决炒菜、配餐等重复性劳动。投融资逻辑显示：具身智能正从“泛化机器人”转向垂直场景落地，餐饮后厨因成本敏感、劳动力短缺而成为首批商业化窗口。

> 原文：https://www.qbitai.com/2026/05/423159.html

### 越疆机器人十年出货10万台，进军具身智能

越疆科技在广东具身智能训练场举办研讨会，展示协作机器人产品线与具身智能新布局。公司宣布十年累计出货量突破10万台，覆盖工业、教育与科研场景。此次向具身智能的延伸，意图通过已有硬件渠道引入大模型驱动的感知与决策能力，形成“机器人即服务”的新业务模式。这一路径与元节智能形成对比：越疆更强调通用平台，而元节专注后厨垂直场景。

> 原文：https://www.leiphone.com/category/industrynews/SgRj0865rXHmoVwv.html

当最激进的降价和最激进的封锁同时出现，AI生态的脆弱性与分化速度是否已经超过大多数人的预期？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


GPT-5之后，模型行为控制一直是安全与可解释性的核心瓶颈。今天值得关注的是Nous Research提出的对比神经元归因（CNA）方法，它无需稀疏自编码器训练或权重修改，即可通过识别并消融稀疏MLP神经元回路来引导大模型行为。若该方法可规模化推广，将极大降低模型对齐的计算门槛。

### CNA：无训练、无权重修改的模型行为引导

![research-00.jpg](/marginalia/assets/img/ai-hot/2026-05-24/research-00.jpg)


**是什么**：对比神经元归因（Contrastive Neuron Attribution, CNA）是一种无需训练或修改权重即可干预LLM行为的技术。它通过对比正向与负向样本的神经元激活模式，识别出控制特定行为的稀疏MLP回路，然后直接消融这些回路以改变模型输出。

**关键点**：CNA完全绕开了传统稀疏自编码器（SAE）的预训练步骤，也不需要任何梯度更新或权重微调。只需一次前向传播对比即可定位关键神经元回路，且消融操作在推理时动态生效，不改变模型参数。

**为什么重要**：当前模型对齐通常依赖RLHF或监督微调，成本高昂且可能引入灾难性遗忘。CNA提供了一种轻量级替代方案，尤其适合安全场景下的快速行为修正。若能扩展到更大规模模型，可能成为可解释性工程化的突破口。

> 原文：[Nous Research Releases Contrastive Neuron Attribution (CNA)](https://www.marktechpost.com/2026/05/23/nous-research-releases-contrastive-neuron-attribution-cna-sparse-mlp-circuit-steering-without-sae-training-or-weight-modification/)

### ViMax：从剧本到视频，全流程智能体框架

![research-01.jpg](/marginalia/assets/img/ai-hot/2026-05-24/research-01.jpg)


**是什么**：香港大学推出的ViMax是一个全能型智能体视频生成框架，将导演、编剧、制片角色整合进单一端到端系统。用户只需输入一句话概念，ViMax即可自动完成场景构思、分镜设计、角色调度并直接生成视频。

**关键点**：ViMax并非简单的文生视频模型，而是多智能体协作架构：编剧智能体负责剧本与对白，导演智能体规划镜头与节奏，制片智能体管理资源与连贯性，最后统一由视频生成模块渲染。框架已开源，支持自定义工作流。

**为什么重要**：现有视频生成工具（如Sora、Runway）侧重画质与运动，但缺乏叙事逻辑控制。ViMax将创作过程结构化，降低了专业视频制作的门槛，尤其适合广告、短片和演示场景。开源属性也便于研究者在此基础上探索可控视频内容生成。

> 原文：[HKUDS/ViMax](https://github.com/HKUDS/ViMax)

---

无需训练就能定向操控模型行为，这是否意味着未来对齐技术将从“调参”走向“拆回路”？留给模型可解释性研究者的一个问题。


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


今天最值得关注的是谷歌AI眼镜的亲测结果：Gemini驱动的AR功能终于让智能眼镜接近实用，但仍有明显短板。与此同时，星巴克用AI拍照盘点库存9个月后叫停，成为“AI落地难”的最新案例——两个故事一左一右，勾勒出当前AI应用产品“高期望、低成熟”的真实图景。

### 亲测谷歌AI眼镜：Gemini加持但未完全成熟

![product-00.jpg](/marginalia/assets/img/ai-hot/2026-05-24/product-00.jpg)


TechCrunch 体验了谷歌的 Android XR 眼镜原型机，核心亮点是 Gemini 驱动的实时翻译、导航和消息叠加等 AR 功能——信息直接投射在用户视野中，无需掏出手机。关键点：翻译准确度尚可，但延迟和视野边界仍有感知；导航时画面稳定性不足，长期佩戴有轻微眩晕感。为什么重要：这是谷歌继 Google Glass 后最大的 AR 硬件押注，虽然“几乎可用”意味着离大规模消费级还有距离，但已比前代产品有质的飞跃，尤其对开发者来说是明确的信号——AI AR 眼镜的交互范式正在成型。

> 原文：https://techcrunch.com/2026/05/22/we-tried-googles-ai-glasses-and-theyre-almost-there/

### 星巴克叫停AI库存盘点：上线9个月即废

![product-01.jpg](/marginalia/assets/img/ai-hot/2026-05-24/product-01.jpg)


星巴克终止在北美门店使用AI拍照盘点库存系统，原因是“频繁出错”。系统本意是自动识别货架上的咖啡豆、杯盖等物品数量并同步供应链，但实际运行中经常误判（比如把空货架识别为满货）、漏识，导致店员仍需手动核验。为什么重要：这不是技术本身的问题，而是场景适配的典型失败——AI 在受控环境下可以很准，但门店光线、货架拥挤度、商品摆放方式的多变，让 CV 模型不堪其扰。对任何想在零售场景部署 AI 视觉的公司，这叫“上车前先摸清路况”。

> 原文：https://36kr.com/newsflashes/3821221746266498

### ChatGPT推出PowerPoint插件，但警告会误删内容

![product-02.jpg](/marginalia/assets/img/ai-hot/2026-05-24/product-02.jpg)


OpenAI 发布了 ChatGPT 的 PowerPoint 插件，用户可通过自然语言指令生成或编辑幻灯片。但附带警告：“可能意外删除用户内容。”关键点：该插件内置了内容安全审查机制，在判定某些文本“敏感”或“不符合政策”时，会直接移除，且移除行为可能不通知用户。为什么重要：这是 AI 工具“过度干预”的新案例。对产品经理而言，AI 插件既要增强生产力，又需避免“替用户做决定”的越权——OpenAI 的解决方案是贴警告，但这是不够的。用户信任一旦因意外删除而造成裂痕，修复成本远高于技术改进成本。

> 原文：https://the-decoder.com/openai-launches-a-chatgpt-powerpoint-plugin-and-warns-it-might-accidentally-delete-your-content/

### Anthropic推出MCP隧道，私有代理安全访问企业内网

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-05-24/product-03.jpg)


Anthropic 发布 Model Context Protocol 隧道，允许私有 AI 代理安全地访问企业内部系统（如数据库、API、知识库），同时保持数据不出域。关键点：MCP 是 Anthropic 去年推出的开放协议，此次的“隧道”相当于增加了企业级数据通道加密和鉴权层，代理可以在内网执行检索、查询、编写报告等任务。为什么重要：企业级 AI 落地的最大障碍是数据安全，MCP 隧道提供了标准化的安全访问方式，直接对标微软 Copilot 等产品背后的连接器。对于想构建“私有 agent”的团队，这是值得关注的架构参考。

> 原文：https://www.infoq.cn/article/jvoDNDaa2bRzwrHQy7lT

### OpenAI推出Appshots：任意Mac窗口变Codex上下文

![product-04.jpg](/marginalia/assets/img/ai-hot/2026-05-24/product-04.jpg)


OpenAI 发布 Appshots 功能，允许 Codex（其编程 AI 模型）将当前 Mac 窗口的截图作为编程上下文。关键点：开发者可以截取设计稿、错误日志、文档页面等，Codex 自动识别窗口内容并据此生成或补全代码。为什么重要：这打破了代码和视觉上下文之间的壁垒，尤其对前端开发者来说，截图 → 生成 UI 代码的流程变得更加自然。同时也说明，多模态上下文正在从“手动传图”进化到“自动感知”。

> 原文：https://the-decoder.com/openai-appshots-turn-any-mac-window-into-context-for-codex/

### 法拉利用IBM AI打造F1超级粉丝体验

![product-05.jpg](/marginalia/assets/img/ai-hot/2026-05-24/product-05.jpg)


Scuderia Ferrari HP 与 IBM 合作，利用 AI 为 F1 车迷提供个性化洞察、实时预测和交互式体验。关键点：系统分析历史数据和实时赛道状态，生成每位车手的超车概率、策略建议等信息，并通过 AR 或聊天界面推送给粉丝。为什么重要：体育赛事的 AI 应用正从“后台数据分析”走向“前台观众交互”，法拉利的目标是把 F1 观赛从被动收视变成主动参与。对产品经理来说，这是如何用 AI 重构原有体验的示范——不一定需要颠覆性技术，但需要懂场景。

> 原文：https://techcrunch.com/2026/05/23/ferrari-is-using-ai-to-create-f1-superfans/

### 中经社发布“十五五”产业研究智能体，可自动生成报告

![product-06.jpg](/marginalia/assets/img/ai-hot/2026-05-24/product-06.jpg)


新华社下属中经社推出一个智能体，能够自主完成产业链分析报告，涵盖数据采集、图表生成、文字撰写全流程。关键点：智能体内置了权威经济数据源，支持用户指定行业维度，输出完整 PDF 报告。为什么重要：这是国内权威机构对 AI 辅助研究的一次官方背书。相比通用 LLM，这类垂直领域智能体在数据可信度和报告格式上更有优势，但同时也提出了新问题：AI 生成的研究报告如何追责、如何辨认事实与幻觉？

> 原文：https://www.infoq.cn/article/2Gb32HBQU3CtTGm7oqq3

### 联想天禧AI 4.0实现虚拟上下文窗口10倍扩容

![product-07.jpg](/marginalia/assets/img/ai-hot/2026-05-24/product-07.jpg)


联想发布天禧 AI 4.0，声称通过“虚拟上下文窗口”技术将大模型的长程推理能力扩展到 10 倍。关键点：具体技术路径是通过外部记忆机制动态管理 token 优先级，从而在有限显存下处理更长序列。为什么重要：上下文窗口是当前大模型的核心瓶颈之一，10 倍扩容若真能稳定实现，将直接降低长文档分析、复杂对话等场景的部署成本。但“虚拟”二字暗示可能存在精度损失，需要观察实际效果。

> 原文：https://www.infoq.cn/article/wCwTSfI13xoY4xKQg0Oh

---

谷歌的眼镜和星巴克的翻车告诉我们同一件事：AI 应用产品的“可用性”不是通过发布会宣告的，而是通过真实场景里的每一次点击、每一次识别、每一次失败累积出来的。今天这些故事里，哪一个最让你重新思考自己产品里的“边界条件”？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


今日最值得关注的事件是：用户利用AI从坠机调查文档中的频谱图重建了已故飞行员的语音，迫使美国NTSB紧急封锁其文档系统。这不仅是技术能力的边界试探，更揭示了公开数据在AI时代面临的全新安全与伦理挑战——即便是为调查事故而公布的波形图，也可能被逆向分析出个人隐私。与此同时，谷歌CEO皮查伊重新定义链接地位，微软报告显示AI成本高于人工，以及特朗普AI行政令因CEO缺席而取消，共同构成行业一周缩影。

### AI复活坠机飞行员声音，美政府紧急屏蔽数据

![opinion-00.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opinion-00.jpg)


是什么：美国国家运输安全委员会（NTSB）因用户利用AI从坠机调查文档中的频谱图重建飞行员声音，暂时封锁了其公共文档访问系统。关键点：用户通过开源语音合成工具，将频谱图转换为近似音色和语调的合成音频，引发隐私与数据滥用担忧。为什么重要：这暴露了AI对“残存数字痕迹”的逆向重建能力，即使是非敏感数据（如波形图）也可能被武器化，迫使监管机构重新评估公开数据的安全边界。

> 原文：https://arstechnica.com/ai/2026/05/ai-users-re-create-dead-pilots-voices-from-crash-investigation-docs/

### Google CEO称链接只是搜索的一部分，AI答案已成核心

![opinion-01.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opinion-01.jpg)


是什么：皮查伊在公开场合表示，链接不再是搜索的唯一目标，AI生成的直接答案已成为用户核心需求。关键点：Wired评论指出，即使讨厌AI，用户也离不开谷歌的AI搜索功能；同时谷歌搜索的“disregard”功能疑似被破坏。为什么重要：这标志着搜索体验从“列表导航”向“答案即服务”的根本转变，对SEO行业、内容创作者和传统搜索竞争对手形成长期冲击。

> 原文：https://www.wired.com/story/even-if-you-hate-ai-you-will-use-google-ai-search/

### 特朗普取消AI安全测试行政令签署活动

![opinion-02.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opinion-02.jpg)


是什么：特朗普原计划签署关于AI安全测试的行政令，但因顶级AI公司CEO集体缺席而临时取消。关键点：多家主要AI公司高层拒绝出席白宫活动，担忧行政令可能增加合规成本并影响研发速度。为什么重要：事件凸显美国联邦政府在AI监管上缺乏行业共识和执行力，空有政治表态却无企业配合，政策落地的难度超出预期。

> 原文：https://arstechnica.com/tech-policy/2026/05/trump-canceled-ai-safety-testing-eo-after-snub-from-tech-ceos/

### 微软报告AI比雇佣人类员工更昂贵

![opinion-03.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opinion-03.jpg)


是什么：微软内部研究显示，当前用AI代理（agentic）完成某些任务的总成本高于直接雇佣人类员工。关键点：成本主要来自推理计算、数据工程和人工干预，尚未达到规模化降本点。为什么重要：在行业狂热追捧AI替代劳动力的当下，该报告提供了一个冷静提醒：AI的经济性并非天然成立，尤其在非标准化、低容错率的任务中，人类仍然更具成本优势。

> 原文：https://fortune.com/2026/05/22/microsoft-ai-cost-problem-tokens-agents/

### 纽约客：Altman赢得对Musk官司，但我们都输了

![opinion-04.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opinion-04.jpg)


是什么：Sam Altman在与Elon Musk的法律诉讼中获胜，但《纽约客》评论称，司法判决对AI行业监管和透明度产生了负面长期影响。关键点：法院倾向于保护企业自主创新，降低公开披露责任，可能削弱公众对AI安全的知情权。为什么重要：这场判决预示着未来AI公司可能更少被要求公开安全细节，监管透明度倒退，行业内部审计与外部信任之间的裂隙加大。

> 原文：https://www.newyorker.com/news/letter-from-silicon-valley/sam-altman-won-in-court-against-elon-musk-but-really-we-all-lost

### AI在书中插入虚假引用，作者仍坚持使用AI

![opinion-05.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opinion-05.jpg)


是什么：作家Steven Rosenbaum的新书被AI添加了不准确的引用，但他仍认为AI辅助写作利大于弊。关键点：AI生成了看似合理但完全虚构的文献来源，作者未经仔细核验即出版。为什么重要：这反映了当前生成式AI在内容创作中的“幻觉”问题尚未解决，而作者对工具效率的偏好可能正在降低事实准确性标准，对出版行业和知识传播构成风险。

> 原文：https://arstechnica.com/ai/2026/05/ai-put-synthetic-quotes-in-his-book-but-this-author-wants-to-keep-using-it/

### Cloudflare CEO：建设者和销售者安全，AI将取代衡量者

![opinion-06.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opinion-06.jpg)


是什么：Cloudflare CEO Matthew Prince表示，AI的主要威胁不是针对创造者（builders）和销售者（sellers），而是针对“衡量者”（measurers）——那些负责中间层指标测量和汇报的岗位。关键点：这类工作高度依赖数据统计和模板化报告，容易被AI自动化替代。为什么重要：王子提供了一个简洁的组织分层框架，帮助职场人判断自身岗位风险：远离单纯的“统计与监控”角色，转向创造或交易价值。

> 原文：https://the-decoder.com/cloudflare-ceo-prince-says-builders-and-sellers-are-safe-but-ai-is-coming-for-the-measurers/

### 昆仑万维方汉：五类人AI替代不了，企业做第二名最稳妥

![opinion-07.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opinion-07.jpg)


是什么：在AIGC2026大会上，昆仑万维方汉提出五类不会被AI替代的人类角色，并认为企业应该追求“第二名”的竞争策略。关键点：五类包括：创意突破者、复杂决策者、情感连接者、伦理判断者、跨界整合者；“第二名”策略指快速跟进领头羊，减少试错成本。为什么重要：方汉的观点为企业AI转型提供了务实路线图——不追求技术领先，而是利用成熟模型在应用层建立差异化。

> 原文：https://www.qbitai.com/2026/05/423202.html

---

今天的板块贯穿一个清晰的主线：AI能力越强，它带来的隐私、成本、监管和岗位替代问题就越复杂。面对这一切，你是选择“跟随第二名”，还是成为那个被AI衡量的人？


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


今天开源社区围绕 AI 代理（Agent）工具链集中发力：Anthropic 官方上架了 Claude Code 插件目录，Chrome 团队开源了 DevTools 的 Model Context Protocol 服务，微软则拿出了覆盖 OWASP Top 10 的 Agent 治理工具包。三件事指向同一个信号：代理生态正在从“能跑”走向“能用且可控”。

### Anthropic官方Claude Code插件目录上线GitHub

![opensource-00.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opensource-00.jpg)


Anthropic 在 GitHub 上建立了 `claude-plugins-official` 仓库，作为官方管理的 Claude Code 插件事务目录。开发者可以在此发现、提交和审核高质量插件，类似于 VS Code 的扩展市场，但更侧重 agentic 工作流（如数据访问、代码操作）。

关键点在于：这是 Anthropic 首次为 Claude 的插件生态提供官方排序与质量背书，而非任由第三方分散发布。对于企业用户，这意味着代理功能的可信度与可维护性大幅提升；对于插件开发者，则有了明确的曝光渠道和合规标准。

> 原文：[https://github.com/anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)

### Chrome DevTools MCP开源：为编码代理提供浏览器调试能力

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opensource-01.jpg)


Chrome 团队发布了 `chrome-devtools-mcp`，一个基于 Model Context Protocol (MCP) 的服务，允许 AI 编码代理直接连接并控制 Chrome DevTools。这意味着代理可以像人类开发者一样执行 DOM 检查、网络面板分析、性能审计等操作，而不仅仅是输出文本代码。

重要性在于：此前编码代理缺乏对真实浏览器运行环境的细粒度操控能力。MCP 接口标准化了代理与调试工具的交互，让自动化测试、UI 修复、性能优化等任务具备了闭环可行性。这是 AI 开发工具从“生成代码”向“操作运行环境”迈出的关键一步。

> 原文：[https://github.com/ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)

### 微软开源AI Agent治理工具包，覆盖OWASP Top 10

微软的 `agent-governance-toolkit` 提供了一个策略引擎，围绕 OWASP Top 10 安全风险为 AI 代理提供执行控制。核心能力包括：零信任身份认证、沙箱执行、输入/输出过滤、审计日志等。

为什么重要？当前大多数代理框架（如 LangChain、AutoGPT）侧重能力扩展，而缺乏内建的安全护栏。微软此举直接将企业级安全标准引入代理开发，降低了 AI 代理上生产线的合规成本。对于 CTO 和安全团队，这是一个“拿来即用”的治理层参考实现。

> 原文：[https://github.com/microsoft/agent-governance-toolkit](https://github.com/microsoft/agent-governance-toolkit)

### Meta开源SAM 3：下一代图像分割模型

![opensource-03.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opensource-03.jpg)


Meta 发布了 `sam3`，相比 SAM 2，在分割精度、多尺度目标识别和预训练权重泛化能力上均有提升。模型依旧以 ViT 为骨干，但训练数据量和训练策略有所升级，支持更细粒度的 mask 输出。

对于计算机视觉工程师，SAM 3 延续了“一键分割”的便利性，同时显著降低了在长尾物体和密集场景下的失效概率。开源权重意味着可以直接用于微调或集成到现有分割流水线中，而无需重新训练全量模型。

> 原文：[https://github.com/facebookresearch/sam3](https://github.com/facebookresearch/sam3)

### NousResearch开源Hermes Agent：可成长的AI代理

![opensource-04.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opensource-04.jpg)


`hermes-agent` 是一个基于 NousResearch 的 Hermes 模型的代理框架，强调“成长性”：支持插件动态加载、长期记忆持久化、自定义工具调用以及多轮对话中的上下文扩展。

设计上，Hermes Agent 并非提供一个固定功能的代理，而是一个可扩展的代理基础架构，类似一个 AI 代理操作系统。对于想快速搭建专属代理（如客服、代码助手）的团队，提供了一个比 langchain 更轻量、更聚焦的起点。

> 原文：[https://github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

### 腾讯开源TencentDB Agent Memory：4层本地记忆流水线

![opensource-05.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opensource-05.jpg)


TencentDB Agent Memory 是一个完全在本地运行的 AI 代理记忆系统，包含四层结构：符号短时记忆、任务画布、长期存储索引和语义检索。灵感来自认知架构，但针对数据库场景优化。

对于隐私敏感的应用（如金融、医疗），本地记忆意味着数据不离开设备；四层流水线则让代理既能记住短期会话状态，又能跨 session 调用历史知识。它可作为 RAG 系统的记忆层替代方案，尤其适合本地部署的 agent。

> 原文：[https://www.marktechpost.com/2026/05/23/tencent-open-sources-tencentdb-agent-memory-a-4-tier-local-memory-pipeline-for-ai-agents/](https://www.marktechpost.com/2026/05/23/tencent-open-sources-tencentdb-agent-memory-a-4-tier-local-memory-pipeline-for-ai-agents/)

### Perplexity开源Bumblebee：只读的供应链安全检查工具

![opensource-06.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opensource-06.jpg)


Bumblebee 是 Perplexity 内部使用的开发者端点库存扫描器，现已开源。它以只读方式扫描组织内所有暴露的 API 端点、第三方依赖、开发环境，识别潜在供应链攻击面。

扫射面是“只读”，意味着无需在目标系统安装 agent，仅通过公开信息和元数据即可生成风险清单。对于 DevSecOps 团队，这是一个零部署成本的快速初始审计工具，特别适合云原生和多微服务架构。

> 原文：[https://www.marktechpost.com/2026/05/23/perplexity-open-sources-bumblebee-a-read-only-supply-chain-scanner-for-developer-endpoints/](https://www.marktechpost.com/2026/05/23/perplexity-open-sources-bumblebee-a-read-only-supply-chain-scanner-for-developer-endpoints/)

### Models.dev：开源AI模型规格与定价数据库

![opensource-07.jpg](/marginalia/assets/img/ai-hot/2026-05-24/opensource-07.jpg)


`models.dev` 是一个开源数据库，收录了数百个 AI 模型的技术规格（参数量、上下文长度、推理速度）、定价（API 调用价格、硬件成本）和能力分类（文本、图像、多模态）。开发者可以通过 API 或 CLI 查询，便于做模型选型对比。

在模型爆发、定价不透明的当下，这类结构化数据工具是工程团队的“刚需”。它把分散在 Hugging Face、各大厂商定价页上的信息统一化，减少了选型时的调研成本。注意目前依赖于社区贡献，数据完整性和时效性需关注。

> 原文：[https://github.com/anomalyco/models.dev](https://github.com/anomalyco/models.dev)

今天开源社区的共同主题是“代理生态的基础设施化”——从官方目录、浏览器调试、安全治理到记忆系统，每个项目都在解决代理走向生产环境的某个短板。当工具链逐渐成熟，留给开发者的核心问题不再是“能否造出代理”，而是“如何让代理可信、可控且可维护”。
