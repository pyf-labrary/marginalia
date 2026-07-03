---
layout: "ai-hot"
title: "AI 晨报 · 2026-07-04"
date: "2026-07-04 06:00:00 +0800"
author: "Marginalia"
description: "2026-07-04 的 AI 圈每日动态汇总：Anthropic 新一代模型 Claude Sonnet 5（Fable 5）上线不到24小时，因性能下降、拒答问题等遭遇大量用户差评，性价比被指不如竞品。"
excerpt: "Anthropic 新一代模型 Claude Sonnet 5（Fable 5）上线不到24小时，因性能下降、拒答问题等遭遇大量用户差评，性价比被指不如竞品。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 3 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 7 }
  - { id: research, name: "研究论文", emoji: "🔬", count: 3 }
  - { id: product, name: "应用产品", emoji: "📱", count: 5 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 3 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 8 }
---

今天最值得看的三件事：

- **公司动态** · OpenAI 提议让美国政府持股 5%，与特朗普政府谈
- **模型发布** · Anthropic 发布 Claude Sonnet 5 遭差评刷屏
- **公司动态** · 微软斥资 25 亿美元成立 AI 部署公司 Frontier

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


Anthropic 新旗舰上线 24 小时便遭用户差评刷屏，性能不升反降；另一边，Mistral 开源了数学证明 Agent，在 PutnamBench 上解决近九成问题。模型发布进入“口碑分化”阶段——闭源激进更新失误，开源专攻窄场景出成绩。

### Claude Sonnet 5 上线即翻车：性能下降、拒答频繁

Anthropic 于 7 月 3 日发布 Claude Sonnet 5（代号 Fable 5），意在接替此前口碑不错的 Sonnet 4。然而上线不到 24 小时，社交平台与评测社区出现大量差评：用户反馈模型在代码、逻辑推理等任务上表现不如前代，且频繁拒绝回答简单问题。性价比也被用户拿来与 GPT-4o 等竞品对比，认为其定价缺乏竞争力。Anthropic 尚未官方回应，但已有用户猜测是训练数据或对齐策略出了问题。

> 原文：https://www.leiphone.com/category/yanxishe/GLDTfDIWau83OKGC.html

### Vidu S1 实时交互视频模型：让视频“活”起来

![model_release-01.jpg](/marginalia/assets/img/ai-hot/2026-07-04/model_release-01.jpg)


生数科技发布 Vidu S1，主打实时视频通话与语音控制视频走向。用户可以通过自然语言指令实时调整视频内容（如改变场景、角色动作），支持高清分辨率与高帧率输出。模型还能创建专属交互角色，适用于虚拟陪伴、直播、教育等场景。这是继文本、图像之后，多模态交互向实时视频生成的重要一步，但商业化落地仍需解决延迟与成本问题。

> 原文：https://36kr.com/newsflashes/3879857819201798

### Leanstral 1.5 开源：数学证明 Agent 逼近人类水平

![model_release-02.jpg](/marginalia/assets/img/ai-hot/2026-07-04/model_release-02.jpg)


Mistral AI 开源 Leanstral 1.5，一个专注于 Lean 4 的代码 Agent 模型。它采用 119B MoE 架构，在 PutnamBench（一套高难度数学竞赛题）上解决 587/672 个问题，覆盖率达 87.4%。模型通过结合形式化验证与强化学习，实现了数学定理证明的自动化突破。Apache 2.0 许可证意味着开发者可自由部署和修改。这一进展对 AI for Math、程序验证领域有直接价值，也展示了小参数量 MoE 模型在窄领域超车的可能。

> 原文：https://www.marktechpost.com/2026/07/03/mistral-ai-releases-leanstral-1-5-an-apache-2-0-lean-4-code-agent-model-solving-587-of-672-putnambench-problems/

---

当闭源为了版本号而激进上架时，开源正靠专注与软工细节赢得信任。明天你会把 100 美元花在 Claude 还是租一张 MoE 显卡跑 Lean？


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


**导语**：今日最值得关注的是OpenAI向特朗普政府提出将5%股权捐给美国主权财富基金，这是AI巨头主动让渡利益以换取政治信任的罕见动作。与此同时，微软斥资25亿美元成立专门的企业AI部署公司，两大玩家正以截然不同的路径争夺AI落地的控制权。对于从业者而言，理解这些战略信号比追逐每个融资数字更重要。

### OpenAI 提议美国政府持股5%，意在缓和监管压力

![company-00.jpg](/marginalia/assets/img/ai-hot/2026-07-04/company-00.jpg)


**是什么**：Sam Altman与特朗普政府谈判，提议将OpenAI 5%的股权捐赠给美国主权财富基金。这一金额远低于参议员Sanders此前要求的目标，但已足以引发市场震动。

**关键点**：OpenAI正在主动寻求与政府建立利益绑定关系，而非被动应付监管。5%的股权意味着美国政府将直接获得一家顶级AI公司的重要少数权益，同时也获得参与公司治理的潜在通道。

**为什么重要**：这标志着AI行业与政府关系的转折点——从对抗监管转向“利益共享”。若成真，其他AI公司可能被迫跟进，形成“政府入股”的行业新范式。对投资者而言，OpenAI的估值和政治风险将重新被定价；对从业者，则需关注政府意志如何影响技术发展方向。

> 原文：[Ars Technica](https://arstechnica.com/tech-policy/2026/07/openai-floats-giving-us-5-stake-to-win-over-ai-haters/)

### 微软斥资25亿美元成立AI部署公司Frontier

![company-01.jpg](/marginalia/assets/img/ai-hot/2026-07-04/company-01.jpg)


**是什么**：Microsoft宣布推出Frontier Company，投入25亿美元专项预算，计划在企业客户中嵌入6000名AI工程师，直接对标Amazon、OpenAI等对手的部署能力。

**关键点**：这并非传统的咨询或集成服务，而是一家独立的、“部署优先”的子公司。Frontier将专注把AI能力深度嵌入企业核心流程，而非仅仅提供API或云平台。

**为什么重要**：AI的竞争正从模型能力转向落地效率。微软此举表明，即便拥有最强的AI平台（Azure+OpenAI），仍需重兵投入客户现场才能兑现收入。对于从事AI工程落地的团队而言，这意味着更大的就业市场，同时也意味着部署岗位的需求将超过模型研发岗位。

> 原文：[TechCrunch](https://techcrunch.com/2026/07/02/microsoft-launches-its-own-ai-deployment-company-with-2-5-billion-commitment/)

### Anthropic与三星洽谈定制AI芯片，加速硬件自主权

![company-02.jpg](/marginalia/assets/img/ai-hot/2026-07-04/company-02.jpg)


**是什么**：Anthropic正在与三星讨论开发定制AI芯片，距离OpenAI宣布与博通合作自研芯片仅过去一周。

**关键点**：Anthropic此前主要依赖英伟达GPU，但与三星的合作可能聚焦于推理专用芯片或低功耗边缘芯片。三星作为存储和代工巨头，可以提供从设计到制造的垂直整合能力。

**为什么重要**：顶尖AI模型公司正在集体“向上游走”，通过定制芯片来降低推理成本、获取差异化性能。这对英伟达的王座构成间接挑战，也意味着AI芯片领域的市场竞争将进一步白热化。对芯片创业者来说，Anthropic和三星的合作可能开辟新的替代路线。

> 原文：[TechCrunch](https://techcrunch.com/2026/07/02/anthropic-is-discussing-a-new-custom-chip-with-samsung/)

### 扎克伯格内部承认AI代理进展慢于预期

![company-03.jpg](/marginalia/assets/img/ai-hot/2026-07-04/company-03.jpg)


**是什么**：Meta CEO Mark Zuckerberg在内部会议上承认，AI代理（AI agents）的研发进展未达到他此前的期望。同日，Meta低调推出AI游戏应用Pocket。

**关键点**：Zuckerberg长期以来将AI代理视为下一代人机交互的核心，但内部反馈显示技术成熟度远不及对外宣传。Pocket的发布极为低调，可能意为试探性产品。

**为什么重要**：Meta在AI领域的战略方向（开源模型、元宇宙AI）曾备受期待，但核心产品的落地困难值得警惕。如果连拥有最多AI算力和人才的Meta都进展缓慢，行业整体对AI代理的上市时间表可能需要下调。投资者应重新评估“agentic AI”相关公司的估值预期。

> 原文：[TechCrunch](https://techcrunch.com/2026/07/02/mark-zuckerberg-tells-staff-that-ai-agents-havent-progressed-as-quickly-as-hed-hoped/)

### Google DeepMind与A24开展影视AI研究合作

![company-04.jpg](/marginalia/assets/img/ai-hot/2026-07-04/company-04.jpg)


**是什么**：Google DeepMind宣布与独立电影公司A24达成首次研究合作，探索AI在影视创作中的应用，具体研究方向未公开。

**关键点**：这是DeepMind首次与纯影视创意方正式合作，而非仅提供技术工具。A24以作者电影著称，合作意味着AI可能介入剧本开发、视觉风格生成或后期制作等创意核心环节。

**为什么重要**：AI与影视行业的结合长期以来仅限于特效和辅助工具，DeepMind的入局可能推动“AI辅助创作”向“AI协作创作”跨越。对AI产品经理而言，这是观察如何与创意行业建立深层信任的绝佳案例——技术方需要谦逊地尊重创作主导权。

> 原文：[Google DeepMind Blog](https://deepmind.google/blog/google-deepmind-and-a24-announce-first-of-its-kind-research-partnership/)

### 谷歌2025年因AI建设电力消耗飙升37%

![company-05.jpg](/marginalia/assets/img/ai-hot/2026-07-04/company-05.jpg)


**是什么**：Google发布的2025年度环境报告显示，其AI建设导致电力消耗同比增长37%，清洁能源目标的实现面临严峻挑战。

**关键点**：尽管Google签订大量可再生能源购电协议，但AI数据中心的高密度计算导致实际碳排放不降反升。公司正探索核能、先进地热等备选方案，但短期内难以扭转趋势。

**为什么重要**：AI的规模扩张正在与全球碳中和目标发生直接冲突。对于运营AI基础设施的团队而言，电力成本和环保合规将成为下一代数据中心选址的核心约束。同时也提醒投资者：AI公司的“绿色叙事”与真实能耗之间存在巨大差距。

> 原文：[Ars Technica](https://arstechnica.com/ai/2026/07/googles-ai-buildout-drove-37-increase-in-electricity-use-in-2025/)

### 中国AI视频公司Kling融资20亿美元筹备港股IPO

![company-06.jpg](/marginalia/assets/img/ai-hot/2026-07-04/company-06.jpg)


**是什么**：中国AI视频生成公司Kling完成20亿美元新一轮融资，计划在香港上市，市场预计估值将超过百亿美元。

**关键点**：Kling是继Sora之后的全球AI视频赛道主要竞争者之一，其技术路径侧重高质量长视频生成。本轮融资规模罕见，且IPO地点选择香港而非美股，规避了中概股监管不确定性。

**为什么重要**：这是中国AI公司进入上市窗口期的信号。如果Kling成功港股IPO，将重新打开中国AI资产的估值参考，并吸引更多美元基金通过港股重返中国AI市场。对于关注出海和全球竞争的产品经理，Kling的技术能力将直接影响海外视频生成市场的格局。

> 原文：[The Decoder](https://the-decoder.com/chinese-ai-video-maker-kling-raises-2-billion-as-it-gears-up-for-hong-kong-ipo/)

**结语**：OpenAI的股权让利与微软的大举部署，同时指向一个事实：AI行业的赢家不再是模型最强的公司，而是最能搞定“人与政府”关系的公司。你怎么选——技术信仰派，还是政治实用派？


<h2 id="research" class="ai-section-divider">🔬 研究论文</h2>


### 导语

![research-00.jpg](/marginalia/assets/img/ai-hot/2026-07-04/research-00.jpg)


英国 AI 安全研究所（UK AISI）的实验给出一个值得警觉的判断：当前主流基准测试严重低估了 AI Agent 的真实能力，这意味着我们可能正基于错误的安全指标制定监管与部署决策。与此同时，中国团队将 LeCun 的 JEPA 架构引入细胞建模，为世界模型打开生物应用窗口；另一篇 arXiv 论文则提醒，持久化状态的 Agent 正暴露新的分布式攻击面。

### 基准测试失灵：AI Agent 能力被刻意隐藏

![research-01.jpg](/marginalia/assets/img/ai-hot/2026-07-04/research-01.jpg)


**是什么**：UK AISI 的对比实验发现，标准基准测试（如 GSM8K、HumanEval）在衡量 AI Agent 时存在系统性低估——Agent 在开放环境中能完成的任务复杂度远超基准评分所反映的水平。

**关键点**：基准测试通常设计为独立、短路径任务，而现实场景中 Agent 可调用工具、多轮迭代，其实际能力被碎片化评估掩盖。这种偏差导致安全风险被低估：一个在基准上表现“安全”的 Agent，可能在实际部署中产生意料之外的误操作。

**为什么重要**：若监管标准、风险分级完全依赖现有基准，则可能对高能力 Agent 采取过于宽松的管控措施。UK AISI 呼吁重新设计动态、交互式评估框架，以匹配 Agent 的真实行为边界。

> 原文：https://the-decoder.com/uks-ai-security-institute-finds-standard-benchmarks-systematically-underestimate-what-ai-agents-can-actually-do/

### JEPA 跨界细胞建模：世界模型进入生命科学

![research-02.jpg](/marginalia/assets/img/ai-hot/2026-07-04/research-02.jpg)


**是什么**：受 Yann LeCun 提出的联合嵌入预测架构（JEPA）启发，中国研究团队将其应用于细胞内部状态建模，使模型能预测细胞在扰动下的动态变化——这是世界模型概念首次在生物微观领域落地。

**关键点**：JEPA 不直接预测像素或数据，而是学习隐空间中的状态转移。团队将这一思路迁移至单细胞 RNA 测序数据，让模型学习细胞状态的“隐变量”演化路径，而非简单拟合表达量。初步结果显示，模型能准确预测药物刺激后的细胞分化轨迹。

**为什么重要**：世界模型的核心是构建对复杂系统的内部因果理解。生命科学领域一直缺少这样的统一框架，JEPA 的跨界应用可能成为 AI for Science 的新范式——不仅“预测”，更“理解”系统的内在动力学。

> 原文：https://www.qbitai.com/2026/07/442746.html

### Agent 分布式攻击面：持久化状态带来新漏洞

**是什么**：arXiv 上的一篇论文系统分析了 AI 编码 Agent 在持久化状态（persistent state）下的安全攻击面，指出这类 Agent 存在通信、状态同步和权限管理上的分布式脆弱点。

**关键点**：与一次性对话不同，持久化 Agent 会跨会话保留内存、文件系统和外部服务链接。攻击者可通过“状态注入”——在 Agent 与外部工具交互时嵌入恶意指令——破坏信任链。论文给出了多个可复现的攻击场景，包括提示注入、历史状态中毒等。

**为什么重要**：随着 AI Agent 从实验走向生产（如自动化编码、运维），持久化状态成为标配。当前业界的安全防护几乎都针对“无状态”场景，忽略了跨会话攻击链。该论文提醒开发者：Agent 的安全设计必须考虑持久化带来的新威胁维度。

> 原文：http://arxiv.org/abs/2607.02514v1

### 结语

当评估体系失效，安全阈值可能形同虚设；当 Agent 学会持久化，攻击面也随之穿越时间——你的下一个 Agent，真的准备好了吗？


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


今天应用产品领域最值得关注的是Vercel推出开源Agent框架Eve，其首席软件官断言Agent是新型软件。同时微软大改Copilot加入AutoPilot，加入超应用竞赛。Agent形态正在从聊天助手走向可编程基础设施。

### Vercel 推出开源 Agent 框架 Eve，重新定义软件形态

![product-00.jpg](/marginalia/assets/img/ai-hot/2026-07-04/product-00.jpg)


**是什么**：Vercel 发布了名为 Eve 的开源 Agent 框架，首席软件官（CSO）在博客中将 Agent 定义为“新型软件”，强调 Eve 关注三大核心——技能（Skills）、沙箱（Sandbox）和 Agent 可读网站（Agent-readable websites）。

**关键点**：Eve 允许开发者以编程方式定义 Agent 的技能模块，并在隔离沙箱中执行；同时鼓励构建对 Agent 友好的页面结构，使 Agent 能自主解析和操作网页。

**为什么重要**：这一定位突破了当前 Agent 主要作为对话助手的局限，将其视为可组合、可编程的软件单元。Vercel 作为前端基础设施公司，此举可能推动 Agent 成为下一代 Web 应用的核心架构。

> 原文：https://www.latent.space/p/vercel-agents-new-software

### 微软大改 Copilot 并推出 AutoPilot Agents 超级应用

![product-01.jpg](/marginalia/assets/img/ai-hot/2026-07-04/product-01.jpg)


**是什么**：Microsoft 对已有的 Copilot 进行彻底改造，加入名为 AutoPilot 的代理功能，使其具备自主执行复杂任务的能力，意图加入 Anthropic 和 OpenAI 已开启的 AI 超级应用竞赛。

**关键点**：AutoPilot Agents 可以跨应用（如 Office 365、Teams、Outlook）执行多步骤任务，用户只需自然语言指令。微软将 Copilot 从辅助工具升级为主动代理。

**为什么重要**：这是微软在 Agent 竞争中最激进的一步。若成功，Copilot 将从“副驾驶”变为“自动驾驶”，直接与 Anthropic 的 Claude Computer Use 和 OpenAI 的 Operator 对位。

> 原文：https://the-decoder.com/microsoft-follows-anthropic-and-openai-into-the-ai-super-app-race-with-overhauled-copilot-and-autopilot-agents/

### Adobe 实验“Agentic 网站”：页面按用户意图自组装

![product-02.jpg](/marginalia/assets/img/ai-hot/2026-07-04/product-02.jpg)


**是什么**：Adobe 正在测试一种基于 Agent 的网站生成方式，网页会根据访问者的个人意图实时动态组装内容，而非预先设计好的静态页面。

**关键点**：核心技术是利用 Agent 理解用户上下文（如搜索历史、行为模式），然后从组件库中选取并组合最相关的模块，实现真正的“千人千面”。

**为什么重要**：如果落地，将彻底颠覆传统 Web 设计范式——从“设计页面”转向“设计组件和规则”，Agent 成为网页的实时组装者。

> 原文：https://www.latent.space/p/the-website-of-the-future

### Meta 低调推出“Vibe Coding”游戏应用 Pocket

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-07-04/product-03.jpg)


**是什么**：Meta 发布了一款名为 Pocket 的实验性产品，允许用户通过文本提示（即“Vibe Coding”风格）生成并分享互动小游戏。

**关键点**：用户只需描述游戏玩法（如“打地鼠但用香蕉”），系统自动生成可玩的 HTML5 游戏，并支持社交分享。目前处于低调测试阶段。

**为什么重要**：这是 Meta 在“创作者工具”方向的又一尝试，延续了“用自然语言生成内容”的趋势。虽然级别较低，但可能为 UGC 游戏平台开辟新路径。

> 原文：https://techcrunch.com/2026/07/02/meta-quietly-launches-vibe-coded-gaming-app-pocket/

### 生数科技发布 Vidu S1 实时交互视频模型

![product-04.jpg](/marginalia/assets/img/ai-hot/2026-07-04/product-04.jpg)


**是什么**：生数科技推出 Vidu S1 实时交互视频模型，支持视频通话级别的实时生成和语音控制。本条归类为产品发布。

**关键点**：与以往文本到视频不同，Vidu S1 可实时响应用户语音指令，在视频生成过程中改变场景、角色动作等，实现类似“视频版 Siri”的交互。

**为什么重要**：实时交互是视频生成从离线工具向实时产品跨越的关键一步，应用场景拓展至虚拟陪伴、直播、教育等。

> 原文：https://36kr.com/newsflashes/3879857819201798

当 Agent 从聊天窗口走进代码库和网页组件，或许我们正站在“软件即 Agent”的起点——你的下一个产品，还会是传统的 App 吗？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


当 Simon Willison 在 AI Engineer World's Fair 后连发数文，聚焦 loops 辩论与开源差距时，Agent 狂欢中的冷思考正在浮现。工程界的真实问题，远比赛道概念更有价值。

### Simon Willison：Loops 辩论、Agent 技能工程与开源差距

AI 领域知名博主 Simon Willison 在参加 AI Engineer World's Fair 后，连续发表多篇博客，直击当前 AI 工程的核心争议。他讨论了围绕“loops”的辩论——即是否需要在 AI agent 中引入显式的循环控制，以及 agent 技能工程（Skill Engineering）的设计原则。此外，Willison 还推出了一张“开源 AI 差距地图”，系统梳理了从模型训练到工具链的各个环节中，开源生态与闭源方案之间的差距。他的核心判断是：当前的工程实践过度关注模型能力，而低估了任务拆解、工具编排与错误恢复的系统性难度。这些反思来自一线实操，值得每位技术决策者跟进。

> 原文：[Simon Willison 博客](https://simonwillison.net/2026/Jul/3/open-source-ai-gap-map/#atom-everything)

### Agent 狂欢下的冷思考：规模化落地为何僵局

![opinion-01.jpg](/marginalia/assets/img/ai-hot/2026-07-04/opinion-01.jpg)


多篇中文技术媒体近日集中反思 Agent 落地的实际困境。InfoQ 编译的文章指出，GitLab 内部调研显示，AI 辅助工具并未显著提升整体交付效率，甚至在部分场景下因上下文切换成本导致反效果。观点认为，当前 Agent 落地面临三重障碍：工程层面，任务编排与状态管理仍缺乏成熟框架；治理层面，无法保证长期稳定执行；效率层面，“增人不增力”的边际收益递减已出现。这些冷思考提醒我们，从 Demo 到生产环境的鸿沟并没有被填补，投资与设计应当回到基础设施与可观测性上来。

> 原文：[InfoQ 文章](https://www.infoq.cn/article/KmDMAvlzBGgwu5A2kf7t)

### Jersey Mike's IPO 文件暴露 AI 炒作泛滥

![opinion-02.jpg](/marginalia/assets/img/ai-hot/2026-07-04/opinion-02.jpg)


TechCrunch 在一篇略带调侃的文章中指出，即使是 Jersey Mike's 这样的传统三明治连锁店，在其 IPO 文件中也不忘提及 AI 战略，包括使用 AI 优化库存、预测客流等。这一现象折射出 AI 炒作已经渗透到非科技行业的公开文件中，成为“镀金”符号。虽然“AI+餐饮”本身并非不可行，但当每家公司的招股书都要塞进 AI 关键词时，投资者需要警惕其中的泡沫信号——真正的价值应体现在具体业务指标的改善，而非概念堆砌。

> 原文：[TechCrunch](https://techcrunch.com/2026/07/02/jersey-mikes-ipo-illustrates-how-bad-the-ai-hype-has-become/)

当 AI 被写进三明治店的 IPO 文件，泡沫的注脚已然写就；但真正值得追随的，永远是那些在 loops 和 agent 技能中打磨细节的工程师。


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


今天是 2026 年 7 月 4 日，开源工具板块最值得关注的是 OpenAI 正式发布 Codex Plugin for Claude Code——让两个最火的编码 Agent 工具直接互通。这不是简单的适配，而是 Agent 间互操作走向标准化的信号：当头部玩家开始主动开放接口，工具链的“单打独斗”阶段可能正在过去。

### OpenAI 开源 Codex Plugin for Claude Code

![opensource-00.jpg](/marginalia/assets/img/ai-hot/2026-07-04/opensource-00.jpg)


**是什么**：OpenAI 在 GitHub 上开源了 Codex Plugin for Claude Code，允许用户在 Claude Code（Anthropic 的编码 Agent 工具）中直接调用 Codex 进行代码审查、任务委派等操作。插件由 OpenAI 官方维护，类似一个双向桥接器。

**关键点**：这不是用户自己拼装的 hack 方案，而是两家公司（OpenAI 与 Anthropic）在 Agent 生态上的首次官方协作。插件让 Claude Code 能调用 Codex 的代码补全与审查能力，反之亦然——但当前版本更侧重“从 Claude 调用 Codex”。

**为什么重要**：标志 Agent 工具从“各自为政”走向“互操作性”。对于开发者来说，不再被单一 Agent 绑定；对于平台方来说，开源降低了第三方接入门槛。这可能是 Agent 生态标准化协议的开端。

> 原文：[GitHub - openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc)

### 开源 AI 渗透测试工具 Strix 火爆

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-07-04/opensource-01.jpg)


**是什么**：Strix 是一个基于 AI 的渗透测试工具，能够自动扫描应用漏洞并提出修复建议。它在 GitHub 上迅速积累关注，成为本周热门项目。

**关键点**：Strix 的核心是“自动化攻击 + 修复建议”闭环。它利用 LLM 理解漏洞上下文，而非简单匹配规则库。目前已支持常见 Web 漏洞和部分 API 安全测试。

**为什么重要**：安全运维的自动化是刚需，但此前 AI 渗透工具多偏向攻击方。Strix 兼顾检测与修复，降低了安全团队的门槛。若能持续维护，可能成为 DevSecOps 的开源标配。

> 原文：[GitHub - usestrix/strix](https://github.com/usestrix/strix)

### Superpowers：可组合的编码 Agent 技能框架

![opensource-02.jpg](/marginalia/assets/img/ai-hot/2026-07-04/opensource-02.jpg)


**是什么**：Superpowers 是一套面向编码 Agent 的开发方法论和可复用技能集合。它提供类似“微服务”的模块化设计，让 Agent 开发人员可以像搭积木一样组合技能。

**关键点**：框架定义了一套标准接口，技能（skill）之间通过松散耦合的协议通信。官方示例包括代码审查、文档生成、测试编写等常用 Agent 技能。项目仍处于早期阶段（0.1.x）。

**为什么重要**：当前 Agent 开发重复造轮子严重。Superpowers 试图建立技能复用标准，类似 React Hooks 之于前端。如果社区采纳，可能加速 Agent 开发效率一个数量级。

> 原文：[GitHub - obra/superpowers](https://github.com/obra/superpowers)

### Chrome DevTools 发布 MCP 协议，Agent 可调试网页

![opensource-03.jpg](/marginalia/assets/img/ai-hot/2026-07-04/opensource-03.jpg)


**是什么**：Chrome DevTools 团队开源了 MCP（Model Context Protocol）实现，使得 AI 编码 Agent 可以直接控制 Chrome 的调试工具，实现自动化页面调试、DOM 检查和网络分析。

**关键点**：MCP 原本是 Anthropic 提出的协议，用于 Agent 与外部工具交互。Chrome 官方采用意味着该协议获得主流浏览器厂商支持。Agent 现在可以像人类一样操作 DevTools 面板。

**为什么重要**：前端自动化调试一直是 Agent 的盲区——之前 Agent 只能通过 Puppeteer 进行黑盒操作，无法利用 DevTools 的深度诊断信息。MCP 让 Agent 获得和白盒一样的洞察力，尤其适合自动化跨浏览器测试和性能分析。

> 原文：[GitHub - ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)

### Google 开源 agents-cli：一键部署 Agent 到云

![opensource-04.jpg](/marginalia/assets/img/ai-hot/2026-07-04/opensource-04.jpg)


**是什么**：Google 发布 agents-cli 命令行工具，允许开发者用任何编码助手（如 Cursor、Copilot）创建 AI Agent，并一键部署到 Google Cloud 上。

**关键点**：工具链从“编写代码”到“部署运行”全流程集成，支持评估和版本管理。目标用户是已经使用编码助手生成 Agent 代码的开发者。

**为什么重要**：Google 在 Agent 部署环节抢占入口。相比手动配置云资源，agents-cli 降低了部署门槛，但生态绑定较强（仅支持 Google Cloud）。对于云服务商竞争，Agent 部署的丝滑体验可能成为新卖点。

> 原文：[GitHub - google/agents-cli](https://github.com/google/agents-cli)

### Nous Research 开源 Hermes Agent：强化学习驱动

![opensource-05.jpg](/marginalia/assets/img/ai-hot/2026-07-04/opensource-05.jpg)


**是什么**：Hermes Agent 是一个基于强化学习的自改进 Agent 框架。它能通过环境反馈自动优化自身行为，目标是“越用越强”。

**关键点**：核心是 RL 训练 loop，Agent 在执行任务后收到奖惩信号，更新策略。项目开源了训练代码和预训练权重，强调 reproducibility。

**为什么重要**：大部分编码 Agent 目前依赖 prompt engineering 或 fine-tuning 静态提升。Hermes 引入在线学习，让 Agent 能动态适应任务变化。如果RL pipeline 足够轻量，可能开启“Agent 终身学习”范式。

> 原文：[GitHub - NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

### NVIDIA 官方发布 AI Agent 技能库 skills

![opensource-06.jpg](/marginalia/assets/img/ai-hot/2026-07-04/opensource-06.jpg)


**是什么**：NVIDIA 在 GitHub 上开源了一组官方验证过的 AI Agent 技能（skills），涵盖图像处理、视频分析、科学计算等 NVIDIA 擅长的领域。

**关键点**：技能库采用标准化接口（类似 Superpowers 的理念），每个技能都附带测试和性能基准。目前首个版本包含 10 个技能，主要面向 GPU 加速场景。

**为什么重要**：NVIDIA 的加入为 Agent 技能标准提供了硬件层面的背书。当技能需要调用 GPU 资源，NVIDIA 的技能库可确保最佳性能。这既是对开源生态的贡献，也是对自家硬件软生态的布局。

> 原文：[GitHub - NVIDIA/skills](https://github.com/NVIDIA/skills)

### Simon Willison 发布 llm-coding-agent 实验版本

**是什么**：知名 Python 开源作者 Simon Willison 发布了 llm-coding-agent 的 0.1a0 版本，一个基于其 llm 工具库的编码 Agent 脚本。

**关键点**：该工具非常轻量，主要是用 LLM 调用和 shell 命令组合实现简单的“阅读代码-生成修改-应用”。目前只是实验性质，文档尚不完整。

**为什么重要**：Simon 的 llm 库在 Python 社区有广泛用户，这个 Agent 实验可能成为“从零开始造一个 Agent”的经典教程。但当前版本成熟度很低，不建议生产使用，但值得关注其后续演进思路。

> 原文：[Simon Willison's blog](https://simonwillison.net/2026/Jul/2/llm-coding-agent/#atom-everything)

---

今天八条 story 几乎都在做同一件事：让 Agent 更好用、更智能、更互联。当巨头们争相开源自己的 Agent 基础设施，下一个值得问的问题是——谁能率先让这些开源组件拼出一个真正可信任的生产级 Agent？
