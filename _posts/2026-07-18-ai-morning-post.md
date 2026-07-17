---
layout: "ai-hot"
title: "AI 晨报 · 2026-07-18"
date: "2026-07-18 06:00:00 +0800"
author: "Marginalia"
description: "2026-07-18 的 AI 圈每日动态汇总：中国AI实验室Moonshot AI发布了Kimi K3，一个2.8万亿参数的开放MoE模型，采用Kimi Delta Attention架构，激活16个专家，支持100万上下文，性能接近Opus 4.8，成本仅为Sonnet 5级别。"
excerpt: "中国AI实验室Moonshot AI发布了Kimi K3，一个2.8万亿参数的开放MoE模型，采用Kimi Delta Attention架构，激活16个专家，支持100万上下文，性能接近Opus 4.8，成本仅为Sonnet 5级别。"
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

- **模型发布** · 月之暗面发布Kimi K3：2.8万亿参数开源MoE模型
- **公司动态** · 苹果起诉OpenAI，或危及后者IPO
- **模型发布** · Mira Murati团队发布首个开源模型Inkling

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


月之暗面今天扔出业界最重磅消息：2.8万亿参数的MoE模型Kimi K3以开放权重形式发布，性能接近Opus 4.8但推理成本仅为Sonnet 5级别。同一日，Mira Murati创立的Thinking Machines Lab、英伟达、腾讯与Zyphra分别发布新模型，开源生态在模型规模、嵌入、脑电等方向同时刷新认知。

### 月之暗面发布Kimi K3：2.8万亿参数开源MoE模型

**是什么：** Moonshot AI今天正式开源Kimi K3，一个2.8万亿参数（2.8T）的Mixture-of-Experts模型，采用自研Kimi Delta Attention架构，每次推理激活16个专家。支持100万token上下文窗口，且在多项基准上性能接近OpenAI的Opus 4.8，但其推理成本仅对标Sonnet 5级别。

**关键点：** 这是目前开源世界公开的最大MoE模型之一（参数规模与DeepSeek-V3相当）。Kimi Delta Attention通过动态路由和稀疏注意力降低了长上下文计算开销，使得百万token推理成为可负担的工程实践。模型权重和架构细节已完整公开。

**为什么重要：** 开源模型在“性能-成本”曲线上第一次如此接近闭源旗舰。Kimi K3证明了超大规模MoE可以在遵循OpenAI级别能力的同时，将部署成本压至主流商用模型水平。这直接挑战了“强模型必昂贵”的前提，加速了AI基础设施层的商品化。

> 原文：[Kimi Blog](https://www.kimi.com/blog/kimi-k3)

### Mira Murati团队发布首个开源模型Inkling

![model_release-01.jpg](/marginalia/assets/img/ai-hot/2026-07-18/model_release-01.jpg)


**是什么：** 前OpenAI CTO Mira Murati创立的Thinking Machines Lab今天发布了Inkling，一个开放权重的MoE模型。这是该团队首次公开其AI能力，模型架构细节尚未完全披露，但已知采用混合专家设计。

**关键点：** 作为Mira Murati离开OpenAI后的首个公开作品，Inkling选择了完全开放的路径（开放权重而非仅提供API），叠加了团队在推理和可靠性上的研究积累。目前模型已在Hugging Face上开放下载，但尚未发布完整技术报告。

**为什么重要：** Murati团队的动向一直是业界焦点。Inkling的发布标志着又一支顶尖团队加入开源阵营，且选择MoE架构说明其延续了对大规模稀疏模型的判断。这进一步压缩了闭源模型的差异化空间，也让OpenAI的人才外溢效应更加显性。

> 原文：[Thinking Machines Lab](https://thinkingmachines.ai/news/introducing-inkling/)

### 英伟达开源Nemotron 3 Embed：8B模型排名RTEB第一

![model_release-02.jpg](/marginalia/assets/img/ai-hot/2026-07-18/model_release-02.jpg)


**是什么：** NVIDIA发布了Nemotron 3 Embed嵌入模型集合，包括8B、1B（BF16）和1B（NVFP4）三个版本。其中8B版本在RTEB检索基准上以78.46 NDCG@10的成绩排名第一。

**关键点：** 这是专门为检索增强生成（RAG）和语义搜索优化的嵌入模型。8B版本在RTEB上击败了此前所有竞品，1B版本在轻量场景下提供了精度与速度的平衡，而NVFP4量化版专为英伟达硬件优化推理效率。所有模型均开源。

**为什么重要：** 嵌入模型是RAG管线的地基。英伟达以“硬件+模型”组合拳再次推进了生态标准——RTEB榜单被自家模型屠榜，既验证了架构优势，也为开发者提供了可直接部署的顶级嵌入方案。对于做搜索、知识库的产品团队，这可能是近期最值得换上的组件。

> 原文：[MarkTechPost](https://www.marktechpost.com/2026/07/17/nvidia-ai-releases-nemotron-3-embed-an-open-embedding-collection-whose-8b-checkpoint-ranks-1-on-rteb/)

### WAIC 2026：腾讯混元Hy3大模型首秀

![model_release-03.jpg](/marginalia/assets/img/ai-hot/2026-07-18/model_release-03.jpg)


**是什么：** 腾讯在世界人工智能大会上首次公开混元Hy3大模型，并同步上线AI技能支付体系——开发者可通过平台销售基于混元的微调模型或技能组件。

**关键点：** 混元Hy3的具体参数与基准分数尚未披露，但腾讯在大会上强调了“模型+支付”的闭环：开发者训练的技能可在混元生态内定价销售，平台抽成。这一模式类似App Store，但针对的是AI模型能力和API服务。

**为什么重要：** 模型发布本身未必是最亮眼的部分，“技能支付体系”才是腾讯此次的核心产品。它将模型提供方从“卖服务”转向“建生态”，试图用商业模式吸引开发者建链。如果执行顺利，这可能成为国内AI商业化的新范式——但开放程度和抽成比例仍需观察。

> 原文：[InfoQ](https://www.infoq.cn/article/FeWLPKLYDjWko8rJjxKq)

### Zyphra开源脑电基础模型ZUNA1.1

![model_release-04.jpg](/marginalia/assets/img/ai-hot/2026-07-18/model_release-04.jpg)


**是什么：** Zyphra发布了ZUNA1.1，一个380M参数的EEG（脑电图）基础模型，基于Apache 2.0许可。支持0.5到30秒的可变长度输入，可重建和去噪头皮脑电信号。

**关键点：** 这是少有的面向神经信号的基础模型。模型采用Transformer架构在百万条脑电数据上预训练，能处理不同长度的时序输入，并自动学习去噪和重建。项目完全开源，提供预训练权重和微调脚本。

**为什么重要：** 脑机接口（BCI）领域长期缺少通用的基础模型，ZUNA1.1填补了这一空白。它让研究人员无需从零训练就能获得脑电信号的表征能力，可能加速BCI在医疗、人机交互中的应用。380M的参数规模也使得在边缘设备上部署成为可能。

> 原文：[MarkTechPost](https://www.marktechpost.com/2026/07/17/zyphra-releases-zuna1-1-an-apache-2-0-eeg-foundation-model-with-variable-length-inputs-from-0-5-to-30-seconds/)

---

今天的模型发布潮给出了一个清晰信号：开源正在从“追赶者”变为“成本定义者”。当2.8万亿参数的Kimi K3可以用Sonnet级成本运行，闭源模型还剩多少溢价空间？


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


今日最值得关注的是苹果以商业秘密起诉OpenAI，指控其首席硬件官等高层存在不当行为，这一诉讼可能直接干扰OpenAI的IPO进程。从法律和商业角度看，科技巨头间的知识产权纠纷正从竞争工具升级为战略武器，投资者需警惕IPO前的司法风险。

### 苹果起诉OpenAI，IPO窗口蒙阴影

![company-00.jpg](/marginalia/assets/img/ai-hot/2026-07-18/company-00.jpg)


苹果正式对OpenAI提起商业秘密诉讼，指控其首席硬件官及其他高层在离职后不当获取并使用苹果内部技术信息。该诉讼不仅针对个人，更直指OpenAI整体治理缺陷。**关键点**：诉讼发生在OpenAI筹备IPO的关键窗口期，任何不利裁决或漫长的诉讼都可能动摇投资者信心，甚至迫使IPO推迟。**为什么重要**：如果苹果胜诉，OpenAI可能面临赔偿、技术禁令或管理层动荡，这将是继监管审查外对OpenAI商业化的又一重击。
> 原文：[TechCrunch](https://techcrunch.com/video/how-apples-big-lawsuit-could-disrupt-openais-ipo-plans/)

### 旧金山要求苹果谷歌下架AI“脱衣”应用

![company-01.jpg](/marginalia/assets/img/ai-hot/2026-07-18/company-01.jpg)


旧金山检察官向苹果和谷歌发送停止函，要求移除13款AI换脸应用（“nudify” apps），称这些应用主要针对女性生成非自愿裸体图像，且平台从相关广告和下载中获利数百万美元。**关键点**：监管机构首次明确指控平台对AI生成有害内容承担“获利责任”，而非仅要求下架。**为什么重要**：此举可能成为美国各州乃至联邦层面加强AI内容监管的先例，平台将面临更严格的审核义务和潜在罚款。
> 原文：[Ars Technica](https://arstechnica.com/tech-policy/2026/07/apple-google-must-stop-profiting-off-ai-nudify-apps-san-francisco-ag-says/)

### xAI起诉用户，Grok儿童安全危机升级

![company-02.jpg](/marginalia/assets/img/ai-hot/2026-07-18/company-02.jpg)


马斯克的xAI首次对一名用户提起诉讼，指控其利用Grok生成儿童性虐图像（CSAM）。此前xAI曾声称模型已规避此类输出，但安全测试证明无法完全阻止。**关键点**：xAI从否认技术漏洞转向司法追责，试图将责任转移至用户行为。**为什么重要**：这是AI公司首次因CSAM问题主动起诉个体用户，但若模型本身存在不可控生成能力，监管将要求根本性技术修复而非事后追诉。
> 原文：[Ars Technica](https://arstechnica.com/tech-policy/2026/07/xai-cant-deny-grok-makes-csam-anymore-so-its-suing-users/)

### 欧盟正式强制谷歌共享搜索数据并开放Android AI

![company-03.jpg](/marginalia/assets/img/ai-hot/2026-07-18/company-03.jpg)


欧盟新规正式生效，要求谷歌向竞争对手分享搜索数据，并在Android系统中开放AI能力（如允许第三方AI助手直接调用系统权限）。谷歌警告这可能危及用户隐私与安全。**关键点**：这是《数字市场法案》的最新执行措施，意在打破谷歌搜索和移动AI的“围墙花园”。**为什么重要**：如果强制执行，Android生态将迎来AI代理的“同层竞争”，谷歌搜索的统治地位面临实质性挑战，其他AI公司（如Anthropic）可能借机获取搜索数据训练模型。
> 原文：[Ars Technica](https://arstechnica.com/gadgets/2026/07/its-official-eu-will-force-google-to-share-search-data-and-open-up-ai-on-android/)

### Databricks估值达1880亿美元，成AI领域“第二春”标杆

![company-04.jpg](/marginalia/assets/img/ai-hot/2026-07-18/company-04.jpg)


Databricks通过发布开放权重模型成本研究并重塑自身为AI数据公司，估值达到1880亿美元，延续其快速成长轨迹。**关键点**：Databricks并非原生AI公司，而是通过将数据工程与AI模型训练深度绑定，抓住了企业级AI部署的“基础设施”需求。**为什么重要**：1880亿美元估值意味着资本市场对“数据+AI”垂直整合模式的认可，对Snowflake、Palantir等同类公司构成估值锚定，也印证了AI投资正从模型层向基础设施层迁移。
> 原文：[TechCrunch](https://techcrunch.com/2026/07/17/databricks-hits-188b-valuation-extending-its-run-as-ais-favorite-second-act/)

### Meta拟将过剩AI算力卖给Anthropic

![company-05.jpg](/marginalia/assets/img/ai-hot/2026-07-18/company-05.jpg)


据The Decoder报道，扎克伯格计划出售Meta多余的AI计算能力，首个大客户可能是竞争对手Anthropic。**关键点**：Meta因大规模采购GPU后利用率不足，转而探索算力租赁业务；Anthropic作为模型公司对算力需求旺盛，且与Meta在开源立场上有微妙差异。**为什么重要**：算力交易从“云厂商卖卡”演变为“科技巨头间调剂”，标志着AI算力从稀缺资源变为可交易商品，可能重塑AWS、Azure与自建算力之间的竞争格局。
> 原文：[The Decoder](https://the-decoder.com/zuckerbergs-plan-to-sell-excess-ai-compute-could-finds-its-first-big-customer-in-anthropic/)

### Agility Robotics在特斯拉后院开设机器人训练中心

![company-06.jpg](/marginalia/assets/img/ai-hot/2026-07-18/company-06.jpg)


Agility Robotics在加州弗里蒙特开设新的Digit机器人训练中心，直接对标特斯拉的Optimus人形机器人。**关键点**：选址特斯拉总部附近，意在争夺人才和合作伙伴；训练中心将用于Digit在仓储、物流场景的环境适应训练。**为什么重要**：人形机器人商业化竞争进入“场景落地”阶段，Agility以先发优势（已有商业部署）与特斯拉的规模制造能力正面对抗，选址凸显其意图利用特斯拉生态附近的资源加速迭代。
> 原文：[TechCrunch](https://techcrunch.com/2026/07/17/agility-robotics-plants-its-flag-in-teslas-backyard/)

### AI投资热潮推动能源公司IPO激增

![company-07.jpg](/marginalia/assets/img/ai-hot/2026-07-18/company-07.jpg)


能源相关公司在美国上市速度创本世纪最快，投资者急切寻找参与AI基建繁荣的途径，多只能源IPO募资超预期。**关键点**：AI数据中心电力需求爆发式增长，带动电力基础设施、可再生能源、核电等公司IPO热潮。**为什么重要**：AI投资逻辑正从算力芯片向能源供应延伸，能源板块的IPO活跃度是AI产业长期资本投入的晴雨表，也暗示市场在寻找“确定性”收益而非押注单一模型公司。
> 原文：[Ars Technica](https://arstechnica.com/information-technology/2026/07/energy-ipos-surge-as-investors-hunt-for-ways-to-play-ai-boom/)

当AI公司的法律风险与算力交易同时成为头条，投资者该重估的是技术本身还是护城河？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


OpenAI 今天公布了内部自动化红队模型 GPT-Red，在间接提示注入测试中人类以 13% 的胜率落败，而 GPT-Red 达到 84%。这一差距意味着安全测试的范式正在转变：AI 不仅能发现人类难以察觉的漏洞，还能加速补丁闭环，未来红队工作可能全面由智能体承担。

### GPT-Red：自动化红队以84%胜率碾压人类

![research-00.jpg](/marginalia/assets/img/ai-hot/2026-07-18/research-00.jpg)

OpenAI 训练了专门用于攻击的 GPT-Red 模型，在间接提示注入（indirect prompt injection）任务中，其攻击成功率高达 84%，而人类红队成员仅为 13%。关键点在于，GPT-Red 还首次发现了一种名为“文件删除”的新型漏洞，迫使 OpenAI 紧急发布安全补丁。这一结果直接挑战了“人类直觉+规则”的传统红队模式，证明了数据驱动的攻击者可以系统性地超越人工经验。  
> 原文：[MarkTechPost](https://www.marktechpost.com/2026/07/16/openai-details-gpt-red-an-internal-automated-red-teaming-model-that-beat-human-red-teamers-84-to-13-on-prompt-injection/)

### 预训练数据可通过计算宣传被投毒

![research-01.jpg](/marginalia/assets/img/ai-hot/2026-07-18/research-01.jpg)

一项新研究揭示了另一种安全威胁：攻击者无需直接编辑训练文本，仅通过操纵社交媒体等公开数据源的分布，就可以向语言模型注入有害行为（如偏见、恶意指令）。关键点在于，这种“计算宣传”式投毒可以在不留下明显痕迹的情况下污染预训练数据，现有的数据清洗和过滤手段难以防御。该威胁迫使行业重新评估训练数据供应链的可信度。  
> 原文：[arXiv 2607.15267](http://arxiv.org/abs/2607.15267v1)

### RoboTTT：机器人策略的上下文窗口扩展至8000步

![research-02.jpg](/marginalia/assets/img/ai-hot/2026-07-18/research-02.jpg)

RoboTTT 提出在测试时对机器人策略进行微调，通过引入时间上下文窗口，模型可以回顾视觉运动序列长达 8000 个时间步（约 2 分钟）。关键点在于，相比传统固定长度上下文，RoboTTT 在长时任务（如顺序拾取、流程操作）的成功率提升了 40% 以上。这表明“测试时训练”的思路开始突破机器人感知与控制的长期依赖瓶颈。  
> 原文：[arXiv 2607.15275](http://arxiv.org/abs/2607.15275v1)

### AutoSynthesis：智能体自动化系统综述与元分析

![research-03.jpg](/marginalia/assets/img/ai-hot/2026-07-18/research-03.jpg)

AutoSynthesis 构建了一个端到端智能体系统，能够自动完成从文献检索、筛选、质量评估到效应量计算的完整元分析流程。关键点在于，系统在多个真实医学综述任务中达到了与专家接近的准确率，但耗时仅为 1/10。对于研究领域，这意味着 AI 可以大幅加速知识综合，但需警惕自动化过程中的偏倚累积。  
> 原文：[arXiv 2607.15247](http://arxiv.org/abs/2607.15247v1)

### SciDiagramEdit：从论文修订中自动编辑科学图表

![research-04.jpg](/marginalia/assets/img/ai-hot/2026-07-18/research-04.jpg)

论文提出 SciDiagramEdit 方法，能自动根据论文文字修订（如新增结果、调整结论）修改对应图表，包括重标注坐标轴、重排面板和统一样式。关键点在于，它学习了一种“图表编辑操作”序列，而非从头生成，因此编辑质量依赖原图表结构。对于研究者，这可能减轻反复手动更新图表的负担，但目前仅适用于特定布局。  
> 原文：[arXiv 2607.15272](http://arxiv.org/abs/2607.15272v1)

### SceneBind：跨视觉、听觉与语言的三维语义绑定

![research-05.jpg](/marginalia/assets/img/ai-hot/2026-07-18/research-05.jpg)

SceneBind 提出一种统一的三维场景表示，能够将视觉像素、音频事件和语言描述在空间实例级别绑定。关键点在于，模型支持跨模态查询（如“播放红色沙发的音频”），并在多个基准上超过以往的单模态或两模态方法。该工作为具身 AI 和机器人环境理解提供了更丰富的感知基础。  
> 原文：[arXiv 2607.15265](http://arxiv.org/abs/2607.15265v1)

---

当 AI 开始像专业黑客一样系统性地攻击自身系统，而不仅仅是辅助人类，安全测试的边界将彻底模糊——你准备好信任一个由自己训练出来的“敌人”了吗？


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


摇杆取代键盘指令来控制AI Agent——OpenAI今天推出的硬件WorkLouder Codex Micro，让开发者的交互方式从打字进化到“打机”。这不仅是外设创新，更暗示Agent控制正走向更直觉化、游戏化的方向。本期晨报还覆盖Google Vids虚拟形象、AI Mode跨应用联动、阶跃智能体手机等7条产品动态。

### OpenAI推摇杆硬件WorkLouder Codex Micro控制Agent

![product-00.jpg](/marginalia/assets/img/ai-hot/2026-07-18/product-00.jpg)


OpenAI发布WorkLouder Codex Micro硬件，配备可编程按键和旋钮，开发者可用摇杆替代键盘命令控制AI Agent，提升交互效率。这是OpenAI首次推出面向Agent操作的专业硬件，目标用户是频繁调试agentic工作流的开发者。**关键点**：摇杆提供物理反馈，适合需要连续微调的场景（如控制机器人臂、实时参数调节）；可编程旋钮能绑定常用指令序列。**为什么重要**：键盘打字仍是当前控制AI的主要方式，但Agent的实时交互需求正在催生新输入形态。OpenAI此举可能开启Agent外设品类，就像游戏手柄之于PC游戏。

> 原文：https://the-decoder.com/openai-wants-developers-to-stop-typing-commands-and-start-using-a-joystick-to-control-their-ai-agents/

### Google Vids新增个人AI虚拟形象视频功能

![product-01.jpg](/marginalia/assets/img/ai-hot/2026-07-18/product-01.jpg)


Google在Vids中引入个性化AI虚拟形象，用户可创建数字版自己，配合Gemini Omni生成和编辑视频，实现AI主演内容。**关键点**：用户只需上传照片或简短视频，AI即可合成拟真虚拟形象，支持口型同步、表情和肢体动作；视频编辑完全基于自然语言指令，如“让我在办公室背景前讲解这份报告”。**为什么重要**：Vids从企业视频协作工具升级为AI内容生产平台，个人虚拟形象降低了“演员”门槛，可能推动AI原生视频创作范式——未来每个人都有自己的数字替身用于内容产出。

> 原文：https://techcrunch.com/2026/07/16/google-vids-now-lets-you-star-in-your-own-ai-videos/

### Google AI模式扩展：可链接并操作第三方应用

![product-02.jpg](/marginalia/assets/img/ai-hot/2026-07-18/product-02.jpg)


Google升级AI Mode，从仅回答问题扩展到跨应用完成任务，用户可通过自然语言直接控制选定的第三方App。**关键点**：初期支持的App包括Gmail、Calendar、YouTube Music等Google生态应用，以及部分第三方（如Spotify、Todoist）；用户说“帮我订明天中午的餐厅并把信息发到群聊”，AI Mode会自动调用地图、日历和消息应用。**为什么重要**：这是Google向Agent方向的重要一步——AI Mode从搜索界面进化为操作系统级助手，直接与App深度交互。一旦形成生态，可能重塑用户与手机应用的交互方式。

> 原文：https://techcrunch.com/2026/07/16/googles-ai-mode-now-lets-you-link-and-interact-with-select-apps/

### Roblox在移动端推出AI游戏生成功能

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-07-18/product-03.jpg)


Roblox的新“Build”功能让用户仅用文本提示即可在手机App内生成基础游戏，降低游戏创作门槛。**关键点**：用户输入如“创建一个捉迷藏游戏，需要森林场景和隐藏道具”，AI自动生成地形、角色和规则逻辑；生成后可立即发布或进一步编辑。**为什么重要**：Roblox本身是UGC游戏平台，AI生成功能将创作者门槛降到“会说话就行”，可能催化下一波用户生成内容爆炸。移动端的零代码创作，让UGC从“编程”走向“对话”。

> 原文：https://techcrunch.com/2026/07/16/roblox-launches-an-ai-powered-game-creation-feature-in-its-mobile-app/

### DoorDash推出命令行工具dd-cli，Agent可直接下单

![product-04.jpg](/marginalia/assets/img/ai-hot/2026-07-18/product-04.jpg)


DoorDash开放dd-cli命令行工具beta，开发者和AI Agent可从终端搜索店铺并下单，标志平台开始面向Agent设计。**关键点**：支持参数化搜索（如“附近评分4.5以上的中餐，配送费低于$3”），返回JSON格式结果；下单流程完全可脚本化。**为什么重要**：当DoorDash主动提供CLI，意味着Agent经济正在渗透传统消费品配送——未来AI可以自动帮你点午餐、预订食材。这是平台基础设施为Agent优化的重要信号。

> 原文：https://techcrunch.com/2026/07/16/yes-you-can-now-order-doordash-from-the-command-line/

### 阶跃STEPX Neo智能体手机亮相WAIC

![product-05.jpg](/marginalia/assets/img/ai-hot/2026-07-18/product-05.jpg)


阶跃发布全球首个大模型原生智能体手机STEPX Neo，搭载Step AOS系统，展示跨App办事、本地生活等全场景智能服务。**关键点**：手机从系统底层集成大模型，Agent可理解用户意图并在不同App间自动完成任务（如“帮我查航班，再把行程添加进日历，同步发给同事”）；全双工语音交互，支持打断和上下文记忆。**为什么重要**：这是首款以“智能体”为核心设计理念的手机系统，而非简单的语音助手升级。如果Step AOS成熟，可能重新定义手机作为“数字管家”的角色。

> 原文：https://www.infoq.cn/article/62J9L28365BtFlSFxVjE

### 千问AI眼镜升级为智能体眼镜，可调用第三方Skill

千问在WAIC宣布将AI眼镜升级为智能体眼镜，支持全双工语音、眼动追踪，并能按需调用第三方Skill和Agent，实现全天候感知。**关键点**：用户可通过语音或眼球凝视激活任务（如“看到那个餐厅，帮我看看评分”）；第三方开发者可发布Skill，眼镜自动匹配场景调用。**为什么重要**：AI眼镜从“信息显示”走向“主动服务”，第三方Skill生态的开放性决定了它能覆盖多少真实场景。全天候感知+调用第三方Agent，让眼镜成为真正的“AI助手入口”。

> 原文：https://www.leiphone.com/category/industrynews/JDlu3Gqj7atcWniy.html

### 文远发布物理AI大模型WITT：单卡日处理1万分钟视频

![product-07.jpg](/marginalia/assets/img/ai-hot/2026-07-18/product-07.jpg)


文远知行发布物理AI大模型WITT，可将每一公里行驶数据转化为模型能力，单张GPU卡每日处理1万分钟视频数据。**关键点**：WITT专注于自动驾驶场景的物理世界理解，能从车载摄像头视频中提取道路结构、动态物体行为等结构化知识；训练效率提升显著，降低数据标注依赖。**为什么重要**：物理AI是自动驾驶走向L4+的关键，WITT的高效数据处理能力意味着文远得以更快迭代模型。这对自动驾驶行业的数据飞轮竞争具有参考价值。

> 原文：https://www.qbitai.com/2026/07/452961.html

今天的产品动态清楚表明：AI正在从“回答问题”转向“执行任务”，而交互方式和入口硬件（摇杆、手机、眼镜）的争夺才刚刚开始。当Agent能调用万事万物，你最想让它替你做的第一件事是什么？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


今天最值得看的一件事情是Linux之父Linus Torvalds在邮件列表中的强硬表态：他将AI视为与编译器一样的工具，直接建议批评者“fork或走开”。这标志着开源社区内部对AI辅助编程的分歧正式公开化。同时德国法院首次将AI Overviews和Perplexity纳入媒体法管辖，欧洲AI监管的边界正在从模型本身延伸至输出内容。在炒作降温的当下，理性声音开始回归——OpenAI CFO提出AI ROI记分卡，而Yann LeCun旗下的AMI Labs则拒绝用AGI概念包装产品。

### Linus Torvalds怒怼AI批评者：不喜就fork或走开

![opinion-00.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opinion-00.jpg)


**是什么：** Linux创始人Linus Torvalds在邮件列表中回应关于AI生成代码进入Linux内核的争议，直言将“大声忽略”反对使用AI的人，并建议不满者可以fork项目或直接离开。

**关键点：** Torvalds把AI工具类比为编译器——编译器早期也曾被质疑，如今无人争议。他认为抵制AI是“短视且愚蠢的”。部分开发者对此表示震惊，已有匿名讨论考虑fork内核。

**为什么重要：** Linux内核是全球最大开源协作项目，Linus的态度直接影响数万开发者的工作流。这一表态可能加速AI辅助编程在核心基础设施中的采纳，但也可能进一步撕裂开源社区中关于“代码原创性”的长期争议。

> 原文：[Ars Technica](https://arstechnica.com/ai/2026/07/linus-torvalds-to-critics-of-ai-coding-in-linux-fork-it-or-just-walk-away/)

### 德国首次将AI Overviews和Perplexity纳入媒体法管辖

**是什么：** 德国法院裁定，Google的AI Overviews以及Perplexity等AI搜索摘要服务属于“媒体服务”，需遵守德国媒体法律，包括监管责任、审核义务等。

**关键点：** 该裁定首次将AI生成的搜索结果摘要与传统编辑内容置于同一法律框架。Perplexity和Google均表示正在评估影响，可能调整在德国的服务方式。

**为什么重要：** 这是欧洲AI监管从模型训练层向输出层延伸的标志性案例。如果其他欧盟国家跟进，AI搜索产品将面临与新闻聚合平台类似的合规成本，可能改变全球AI搜索的商业模型。

> 原文：[The Decoder](https://the-decoder.com/germany-puts-googles-ai-overviews-and-perplexity-under-media-law-in-first-of-its-kind-ruling/)

### 未来实验室应像数据中心——Lila Sciences访谈

**是什么：** Latent Space专访Lila Sciences创始人，提出科学数据是最后未被充分利用的训练数据来源，并展示自动化实验室愿景：实验室应像数据中心一样运行，AI管理实验流程。

**关键点：** Lila Sciences正在构建端到端的自动化实验室，AI不仅分析数据，还能设计实验并驱动机器人执行。创始人认为，当前AI公司的瓶颈是高质量、低成本的结构化科学数据。

**为什么重要：** 如果这一设想成立，生物、化学、材料领域的研发速度将被AI大幅压缩。对于投资人，这是一个从“模型能力”转向“数据基础设施”的投资主题变化。

> 原文：[Latent Space](https://www.latent.space/p/the-lab-of-the-future-should-feel)

### OpenAI CFO提出AI实用记分卡，衡量ROI

![opinion-03.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opinion-03.jpg)


**是什么：** OpenAI首席财务官Sarah Friar发表文章，介绍一套衡量AI投入回报的记分卡，包含四项指标：有用工作完成量、任务成本、可靠性、计算回报。

**关键点：** 记分卡旨在帮助企业从“是否使用AI”过渡到“AI带来的具体业务价值”。例如，有用工作完成量指AI实际完成的任务数，可靠性衡量输出质量的一致性。

**为什么重要：** 随着企业进入第二波AI部署，ROI成为核心焦虑点。OpenAI主动推出度量框架，既是为自身产品做辩护，也是向CFO们提供购买决策工具——这可能加速企业采购决策，但也可能暴露出当前AI在复杂任务上的可靠性短板。

> 原文：[OpenAI Blog](https://openai.com/index/a-scorecard-for-the-ai-age)

### OpenAI呼吁让青少年安全使用AI，推出年龄保护措施

![opinion-04.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opinion-04.jpg)


**是什么：** OpenAI发布专题文章，阐述为何青少年应有安全使用AI的渠道，并介绍包括年龄适配保护、学习工具、家长控制在内的全套措施。

**关键点：** OpenAI区分了不同年龄段的AI交互模式：13岁以下使用严格限制版，13-17岁可访问学习助手但无敏感内容，家长可监控使用记录。该文同时也隐含回应了公众对AI对儿童发育影响的担忧。

**为什么重要：** AI教育的普及已是不可逆趋势，但大公司主动定义安全年龄边界，既是合规需要，也试图抢占“下一代用户”的心智。对于产品经理，这提供了一个参考框架：如何在不压制功能的前提下设计年龄适应性。

> 原文：[OpenAI Blog](https://openai.com/index/why-teens-deserve-access-safe-ai)

### Yann LeCun旗下AMI Labs CEO：拒绝称AI为AGI或超级智能

![opinion-05.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opinion-05.jpg)


**是什么：** AMI Labs（由Yann LeCun联合创立）CEO Alexandre LeBrun在接受TechCrunch采访时表示，追逐AGI或超级智能概念是误导，公司更关注构建能理解物理世界复杂性的实用世界模型。

**关键点：** LeBrun认为，将当前AI系统称为“通用人工智能”或“超级智能”会引发公众误解和监管过度，实际进展远未达到那种程度。AMI Labs专注于具身智能和世界模型，目标是在机器人、自动驾驶等实际场景中做出可衡量的进步。

**为什么重要：** 当前行业充斥着AGI焦虑，Yann LeCun一向是批评者，这次通过其公司的CEO进一步表达“去剧场化”立场。这对投资人来说是一个信号：注意区分“概念炒作”和“实际可交付”，实用主义可能比宏大叙事更值得长期押注。

> 原文：[TechCrunch](https://techcrunch.com/2026/07/16/why-ami-labs-alexandre-lebrun-wont-call-his-ai-agi-or-superintelligence/)

### 报告称AI蜜月期结束，打工人成“快乐行尸走肉”

![opinion-06.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opinion-06.jpg)


**是什么：** InfoQ发布的文章引用多项调研，指出企业AI应用已进入深水区：员工效率提升但创造力下降，出现“快乐式倦怠”——表面积极使用AI，实则缺乏深度思考和成就感。

**关键点：** 报告认为，AI工具让员工更容易完成重复性任务，但也削弱了主动解决问题的意愿，长期可能导致组织创新能力退化。部分企业开始强制设置“无AI工作日”以平衡。

**为什么重要：** 这是“AI提效叙事”的反面——过度依赖可能产生新的组织风险。对于CTO和产品经理，需要考虑如何设计AI工具以增强而不是替代人的判断力，否则可能在效率提升的同时削弱核心竞争力。

> 原文：[InfoQ](https://www.infoq.cn/article/IZIwV2Qia1X1q6RQvDxW)

### 留给开源模型的时间只剩6个月？

![opinion-07.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opinion-07.jpg)


**是什么：** InfoQ另一篇文章分析开源与闭源模型的市场格局，指出差距正在缩小，但商业化窗口正在收窄，未来六个月是关键窗口期。

**关键点：** 作者认为，开源模型在部分基准上已接近GPT-5水平，但闭源模型持续投入的资本优势让开源社区难以在服务体验、安全审核等方面追赶。如果六个月内开源社区没有出现能自我持续的商业化模式，开源模型可能边缘化为“科技巨头的基础设施玩物”。

**为什么重要：** 这对依赖开源模型的创业公司、企业内部部署团队是直接警醒。如果闭源模型继续以更快速度迭代，且成本持续下降，开源模型的吸引力将仅限于数据主权敏感的场景。技术决策者需要评估自己的模型选型策略是否有足够的防御性。

> 原文：[InfoQ](https://www.infoq.cn/article/jdBsbJXVi22iPafARSFx)

---

今天的八个故事共同指向一个判断：AI正在从“信不信”进入“怎么用”的务实阶段。Linus的代码工具论与德国法院的监管细化、OpenAI的ROI记分卡与AMI Labs的拒绝AGI——这些信号都提示，下一步的关键不再是模型更强，而是治理更清晰、价值可量化。留给你的问题是：在你的业务中，AI是工具还是风险？


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


今日最值得关注的新闻来自Open Interpreter：它针对Kimi K3等低成本模型做了行为优化，让编码Agent可以在低算力下运行。这或许意味着智能编码助手的成本门槛正在实质性降低——当Agent不再依赖GPT-4或Claude opus级别模型，更多中小团队和个人开发者能够参与AI编程实验。

### Open Interpreter适配Kimi K3，成为低开销编码Agent

![opensource-00.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opensource-00.jpg)


Open Interpreter推出了针对Kimi K3等轻量模型的行为优化，使其可以作为低成本编码Agent运行。这一功能在GitHub社区引发热议，核心变化在于：原本需要高端大模型才能使用的agentic coding能力，现在可以在更经济的推理成本下实现。对于个人开发者或小团队而言，这意味着可以用更低的预算尝试自动化代码任务，例如批量重构、代码审查辅助等。但需注意，低模型可能在某些复杂任务上表现受限，适合常规场景。

> 原文：[https://github.com/openinterpreter/openinterpreter](https://github.com/openinterpreter/openinterpreter)

### Thinking Machines Lab开源Tinker后训练Cookbook

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opensource-01.jpg)


Mira Murati创立的Thinking Machines Lab发布了Tinker Cookbook，这是一个开源的后训练配方集合，基于Tinker框架。它旨在帮助开发者更高效地微调模型，提供可复用的训练策略和调参指导。对于想快速上手模型定制的研究者，这套cookbook降低了后训练的实验门槛，也延续了团队在开源生态中的投入。

> 原文：[https://github.com/thinking-machines-lab/tinker-cookbook](https://github.com/thinking-machines-lab/tinker-cookbook)

### Apache Ossie立项：语义元数据交换规范

![opensource-02.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opensource-02.jpg)


Apache软件基金会正式孵化Ossie项目，目标是制定分析、AI和BI平台之间语义元数据交换的开放标准。当前不同平台元数据格式各异，导致数据与模型难以跨系统流通。Ossie一旦成熟，可能成为连接数据层与应用层的“通用语言”。对平台建设者和AI infra开发者来说，这是值得跟踪的基础设施级项目。

> 原文：[https://github.com/apache/ossie](https://github.com/apache/ossie)

### Hallmark：让AI生成代码摆脱AI味道的设计技能

![opensource-03.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opensource-03.jpg)


开源项目Hallmark为Claude Code、Cursor等编码助手提供了一套设计技能，目标是让AI生成的代码和UI不再像典型的AI作品。它通过注入更自然的变量命名、注释风格和界面布局，提升可读性和审查体验。对频繁使用AI coding工具的产品经理和工程师来说，这意味着交付物可以更接近人类手写质量，减少后续修改压力。

> 原文：[https://github.com/Nutlope/hallmark](https://github.com/Nutlope/hallmark)

### OpenCut：开源的CapCut替代版视频编辑器

![opensource-04.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opensource-04.jpg)


OpenCut作为剪映（CapCut）的开源替代方案，在GitHub获得关注。它提供了类似的视频编辑功能，完全免费。对内容创作者而言，OpenCut意味着摆脱商业软件的授权限制和用户数据顾虑。不过作为新生项目，功能成熟度和稳定性需要社区持续验证。

> 原文：[https://github.com/OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut)

### LobeHub：智能体操作系统的指挥官

![opensource-05.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opensource-05.jpg)


LobeHub开源了智能体编排平台，号称可以实现一个AI团队的招聘、调度和报告，支持7×24小时自动化运营。它试图将多个专用agent组织成协作系统，每个agent有不同分工。对于需要管理多个AI工作流的企业用户，这种统一编排层可能比自行拼接更可靠。

> 原文：[https://github.com/lobehub/lobehub](https://github.com/lobehub/lobehub)

### Nous Research发布Hermes Agent：伴你成长的Agent

![opensource-06.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opensource-06.jpg)


Nous Research开源了Hermes Agent框架，强调智能体可以随使用过程进化。它支持用户定制任务逻辑和持续学习机制，而不是一次部署后固定不变。这种“增长型agent”概念更适合长期使用的场景，例如个人助手或持续优化的自动化流程。

> 原文：[https://github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

### Anthropic开源知识工作插件库：让Claude变身领域专家

![opensource-07.jpg](/marginalia/assets/img/ai-hot/2026-07-18/opensource-07.jpg)


Anthropic发布了Knowledge Work Plugins，一套开源插件集合，使Claude能针对不同角色（如工程师、研究员）进行定制化工作。每个插件提供特定的知识库和交互模式，用户可自行组合。对希望将Claude深度嵌入知识工作场景的团队，这提供了一个可扩展的开源方案，无需从零构建角色化配置。

> 原文：[https://github.com/anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)

---

当编码Agent的成本降到几乎可忽略，软件开发的范式还会保持不变吗？今天这些开源项目正在把答案交给每个开发者。
