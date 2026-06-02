---
layout: "ai-hot"
title: "AI 晨报 · 2026-06-03"
date: "2026-06-03 06:00:00 +0800"
author: "Marginalia"
description: "2026-06-03 的 AI 圈每日动态汇总：微软推出MAI-Thinking-1（350亿活跃参数推理模型）与MAI-Code-1-Flash代码模型，性能对标业界最强。"
excerpt: "微软推出MAI-Thinking-1（350亿活跃参数推理模型）与MAI-Code-1-Flash代码模型，性能对标业界最强。"
tags: [ai-hot, ai-morning-post, daily]
keywords: "AI 晨报, AI 新闻, LLM, 大模型, daily AI news, ai-hot"
sections:
  - { id: model-release, name: "模型发布", emoji: "🚀", count: 7 }
  - { id: company, name: "公司动态", emoji: "🏢", count: 8 }
  - { id: product, name: "应用产品", emoji: "📱", count: 8 }
  - { id: opinion, name: "行业观点", emoji: "💭", count: 6 }
  - { id: opensource, name: "开源工具", emoji: "⚙️", count: 5 }
---

今天最值得看的三件事：

- **公司动态** · Anthropic秘密提交IPO申请，估值或创纪录
- **公司动态** · 佛罗里达州起诉OpenAI及Sam Altman，指控ChatGPT关联多起命案
- **公司动态** · 黑客仅通过Meta AI客服就劫持了高知名度Instagram账号

下文按板块展开，正文每条均附原始链接。



<h2 id="model-release" class="ai-section-divider">🚀 模型发布</h2>


今天最值得关注的是三家巨头同日发布重磅模型：微软推出推理与代码模型MAI，NVIDIA开源物理世界模型Cosmos 3，MiniMax开源百万Token上下文多模态M3。竞争格局清晰分化：美国企业在推理和物理AI上加速，中国公司在长上下文和多模态上保持领先。开源与闭源界限愈发模糊，开发者的模型选择正在爆炸式增长。

### 微软发布MAI推理与代码模型，挑战前沿

微软推出MAI-Thinking-1（350亿活跃参数推理模型）与MAI-Code-1-Flash代码模型，性能对标业界最强。MAI-Thinking-1采用稀疏激活架构，在数学推理等任务上表现优异；MAI-Code-1-Flash专注代码生成，效率突出。微软在推理模型领域补上关键拼图，与OpenAI形成双线竞争。对开发者而言，多了一个高性价比的推理选项，尤其适合需要链式思考的复杂任务。

> 原文：https://microsoft.ai/news/introducing-mai-thinking-1/

### NVIDIA发布Cosmos 3，推进物理AI世界模型

NVIDIA开源Cosmos 3全模态世界模型，结合Agent Toolkit补齐物理AI工具链。该模型支持文本、图像、视频、动作等多模态输入，能够模拟物理世界因果规律。开源降低了机器人、自动驾驶等领域的研发门槛。物理AI被认为是下一个前沿，NVIDIA通过开源模型和工具链试图成为底层基础设施，但模型复杂度和实际应用可靠性仍是挑战。

> 原文：https://developer.nvidia.com/blog/develop-physical-ai-reasoning-world-and-action-models-with-nvidia-cosmos-3/

### MiniMax M3开源：百万Token上下文+多模态

![model_release-02.jpg](/marginalia/assets/img/ai-hot/2026-06-03/model_release-02.jpg)


MiniMax发布M3模型，采用稀疏注意力架构，支持百万Token上下文与原生图像视频理解。在LongBench等长上下文基准上表现突出，稀疏注意力机制保障了推理效率，多模态能力原生集成无需额外适配。百万Token上下文成为主流趋势，MiniMax开源让中小团队也能尝试超长文档理解。中国创业公司在开源赛道持续输出高影响力模型，与巨头同台竞技。

> 原文：https://www.together.ai/blog/serving-minimax-m3-for-efficient-inference-unlocking-1m-token-context-and-multimodality-without-regrets

### NVIDIA Nemotron 3 Ultra成为最强开源美国模型

![model_release-03.jpg](/marginalia/assets/img/ai-hot/2026-06-03/model_release-03.jpg)


Nemotron 3 Ultra在多项基准超过Llama 4等模型，成为美国开源模型最强；但中国模型仍整体领先。该模型基于Nemotron系列，优化了推理和多语言能力。结果显示中美开源模型差距缩小，但中国在长上下文和多模态上仍占优。对开发者而言，Nemotron 3 Ultra提供了新的基线选择，也说明开源生态已全面国际化。

> 原文：https://the-decoder.com/nvidias-nemotron-3-ultra-becomes-the-smartest-open-us-model-but-china-still-leads/

### 阿里发布Qwen3.7-Plus：多模态智能体新基座

![model_release-04.jpg](/marginalia/assets/img/ai-hot/2026-06-03/model_release-04.jpg)


Qwen3.7-Plus视觉和文本能力大幅提升，跻身Vision Arena前五，支持一键复刻专业软件。阿里在视觉-语言模型上持续迭代，不仅能理解图像，还能生成代码来自动化操作专业软件界面。多模态智能体落地进入加速期，阿里通过强基座模型降低应用开发门槛。Vision Arena排名证明其视觉能力已达全球第一梯队，对自动化办公场景有直接价值。

> 原文：https://www.qbitai.com/2026/06/427730.html

### JetBrains开源Mellum2：12B MoE专业模型

![model_release-05.jpg](/marginalia/assets/img/ai-hot/2026-06-03/model_release-05.jpg)


JetBrains发布专为多模型AI流水线设计的Mellum2，12B参数MoE架构，遵循Apache 2.0许可。该模型定位专业工具链模型，强调与现有IDE集成和推理效率。参数规模适中，但MoE设计使其在特定任务上效率高。JetBrains从IDE厂商切入模型层，显示工具厂商对AI重组的思考，但影响力有限，适合对集成度有要求的开发者细看。

> 原文：https://huggingface.co/blog/JetBrains/mellum2-launch

### 百度文心PaddleOCR-VL-1.6刷新文档解析SOTA

![model_release-06.jpg](/marginalia/assets/img/ai-hot/2026-06-03/model_release-06.jpg)


PaddleOCR-VL-1.6准确率达96.33%，已上线官网支持网页端和API调用。该模型在文档OCR和版面分析上表现优异，适合发票、合同等场景。百度将能力产品化，降低使用门槛。文档数字化需求持续旺盛，细分领域的SOTA仍有商业价值，但比起前面的大模型发布，这一步属于迭代优化。

> 原文：https://www.qbitai.com/2026/06/427754.html

今天模型发布的密度和质量都创下新高，开源与闭源的界限正在消融。未来一年，你最看好哪条技术路线？


<h2 id="company" class="ai-section-divider">🏢 公司动态</h2>


今天AI公司动态最值得看的是Anthropic秘密提交IPO申请，估值可能刷新科技公司纪录——这意味着AI赛道从技术竞赛正式进入资本角力。与此同时，OpenAI遭佛州命案诉讼、Meta AI客服漏洞被用于盗号，安全与监管风险正在加速暴露。投资者需要重新审视AI公司的估值逻辑与治理能力。

### Anthropic秘密提交IPO，有望成史上最大科技IPO之一

![company-00.jpg](/marginalia/assets/img/ai-hot/2026-06-03/company-00.jpg)


Anthropic已向SEC秘密提交S-1文件，启动上市流程。知情人士透露，其估值可能超越当前任何AI独角兽，成为史上规模最大的科技IPO之一。关键点在于Anthropic主打“安全第一”的AI路线，与OpenAI形成差异化，IPO时机选择在行业资本热潮中。这意味着一级市场对AI公司的估值认可正在向二级市场延伸，投资者将有机会直接评估其商业模型与竞争壁垒。

> 原文：https://www.anthropic.com/news/confidential-draft-s1-sec

### 佛罗里达州起诉OpenAI及Sam Altman，指控ChatGPT关联多起命案

![company-01.jpg](/marginalia/assets/img/ai-hot/2026-06-03/company-01.jpg)


佛罗里达州总检察长以“极度漠视生命”为由起诉OpenAI，指控ChatGPT技术被用于策划或实施谋杀等暴力事件，OpenAI明知风险却未采取有效管控。诉讼不仅瞄准公司，还直接点名CEO Sam Altman个人责任。这是美国司法层首次将AI技术与暴力犯罪直接挂钩，可能开创产品责任新判例。若败诉，OpenAI将面临巨额赔偿和产品禁用风险，整个行业的技术部署都可能被要求更严厉的内容过滤。

> 原文：https://arstechnica.com/tech-policy/2026/06/florida-sues-openai-sam-altman-after-multiple-chatgpt-linked-murders/

### 黑客仅通过Meta AI客服就劫持高知名度Instagram账号

![company-02.jpg](/marginalia/assets/img/ai-hot/2026-06-03/company-02.jpg)


攻击者利用Meta的AI客服功能，简单请求“更改邮箱地址”，便成功获取多名名人Instagram账户控制权。Meta直到事后才紧急修复漏洞，但已造成账号被盗。关键点：AI客服的信任边界设计存在致命缺陷，系统未能识别身份验证与客服权限的区分。这暴露了AI代理在身份安全领域的脆弱性，产品经理需重新设计AI交互的安全验证流程，不能默认AI拥有变更敏感设置的权限。

> 原文：https://www.404media.co/hackers-simply-asked-meta-ai-to-give-them-access-to-high-profile-instagram-accounts-it-worked/

### 巴菲特旗下伯克希尔出资100亿美元投资Alphabet AI基础设施

Alphabet宣布800亿美元股权融资用于扩建AI算力，巴菲特旗下的伯克希尔·哈撒韦认购100亿美元。这是伯克希尔首次大举押注AI基础设施，显示长期资本对AI算力需求持续性的高度认可。这笔投资不仅为Alphabet提供弹药，也向市场传递信号：AI基建资本开支在5-10年维度上具有确定性回报，可能带动更多保守型机构配置。

> 原文：https://abc.xyz/investor/news/news-details/2026/Alphabet-Announces-Proposed-80-Billion-Equity-Capital-Raise-to-Expand-AI-Infrastructure-and-Compute-2026-b0myAMewCa/default.aspx

### 黄仁勋宣布Rubin全面投产，4万工程师参与构建

![company-04.jpg](/marginalia/assets/img/ai-hot/2026-06-03/company-04.jpg)


NVIDIA CEO黄仁勋在COMPUTEX 2026上宣布，新一代AI芯片Rubin已全面投产，同时发布史上最强CPU。Rubin是继Blackwell之后的全新架构，4万名NVIDIA工程师参与研发。这标志着AI训练和推理硬件加速进入新代际，推理成本将继续下降。对于开发者和云厂商而言，需要提前适配Rubin架构，否则可能错失性价比优势。

> 原文：https://www.infoq.cn/article/1xVhPAd4se8w1r88AaJC

### NVIDIA与微软联手推出Agentic AI统一部署技术栈

![company-05.jpg](/marginalia/assets/img/ai-hot/2026-06-03/company-05.jpg)


在微软Build大会上，双方宣布合作推出覆盖Windows到云端的统一技术栈，简化代理式AI（agentic AI）部署。该技术栈允许开发者一次开发，同时在本地PC和云端推理，解决了当前agentic AI碎片化的部署问题。关键点：微软将NVIDIA的AI推理框架深度集成进Windows，意味着agentic AI可能成为下一代操作系统级应用范式，产品经理应关注这一基础设施变化。

> 原文：https://blogs.nvidia.com/blog/microsoft-build-windows-local-cloud-devices/

### OpenAI在密歇根州动工建设1GW数据中心

作为Stargate项目的组成部分，OpenAI在密歇根州正式动工建设1GW容量的数据中心，用于支撑其AI训练和推理。这项投资将创造大量本地就业，但也引发对能源消耗和碳排放的讨论。对于竞争对手而言，OpenAI正在构建物理世界的算力壁垒，而自建数据中心意味着未来模型训练成本优势进一步巩固。

> 原文：https://openai.com/index/stargate-michigan-data-center

### Uber因AI支出超预算开始封顶员工用量

![company-07.jpg](/marginalia/assets/img/ai-hot/2026-06-03/company-07.jpg)


Uber鼓励员工大量使用内部AI工具后，仅4个月便烧光全年AI预算，被迫设置每人每月使用上限。这反映出企业在推广AI时的成本失控风险——AI按Token计费的商业模式让传统IT预算模型失效。CTO和CFO需重新设计预算管控机制，否则“AI普惠”可能变成“AI烧钱黑洞”。

> 原文：https://techcrunch.com/2026/06/02/uber-caps-employee-ai-spending-after-blowing-through-budget-in-four-months/

---

AI公司在资本狂欢与监管风暴之间走钢丝，上市潮能否撑起现有估值，安全诉讼会不会成为悬顶之剑？


<h2 id="product" class="ai-section-divider">📱 应用产品</h2>


今日最值得关注的是 OpenAI 将 Codex 插件拓展至分析师、营销、设计、投行等六大非开发职业。这意味着 AI 编程助手正在向“通用智能工作层”进化，白领的知识工作可能迎来结构性重组——不是替代，而是任务级重新分配。

### OpenAI 发布 Codex 职业插件，让非开发者也能“用代码思维工作”

OpenAI 推出面向六大职业（分析师、营销、设计、投行等）的 Codex 插件，将原本只限编程的 AI 助手扩展至报表生成、数据可视化、流程自动化等场景。关键点在“职业化”——插件针对各角色预置了数据源连接和输出模板，用户只需自然语言描述需求即可获得结构化产出。为什么重要：这是 OpenAI 将 agentic 概念下沉到具体职业的第一步，相当于给每个知识工作者配了一个“懂业务的 AI 实习生”，可能重新定义软件即服务的交付形态。

> 原文：[OpenAI](https://openai.com/index/codex-for-every-role-tool-workflow)

### OpenAI 模型和 Codex 登陆 AWS Marketplace

OpenAI 与 AWS 达成合作，前沿模型（如 GPT-5）和 Codex 开发工具现通过 AWS Marketplace 提供。关键点在于企业客户可以通过 AWS 账单统一结算，并利用 VPC 私有部署提升合规性。为什么重要：这标志着 OpenAI 从直销向企业渠道的深度拓展，有利于加速金融、医疗等强监管行业的采用，同时削弱微软 Azure 的独家优势。

> 原文：[OpenAI](https://openai.com/index/openai-frontier-models-and-codex-are-now-available-on-aws/)

### 微软推出 Project Solara：专为 AI 智能体设计的 Android 系统

![product-02.jpg](/marginalia/assets/img/ai-hot/2026-06-03/product-02.jpg)


微软展示 Project Solara，一个面向 AI 智能体的 Android 变体，旨在替代传统以 app 为中心的手机交互模式。关键点：Solara 不再有主屏幕和图标网格，而是由 AI agent 根据上下文主动弹出卡片、工具和对话界面。为什么重要：如果手机从“应用抽屉”变为“智能体交互层”，iOS 和 Android 的平台战争将转向 agent OS 标准之争，而微软凭借 Solara 和 OpenAI 的合作可能成为“第三极”。

> 原文：[Ars Technica](https://arstechnica.com/gadgets/2026/06/microsofts-project-solara-is-an-android-os-designed-for-agents-instead-of-apps/)

### 微软发布 Scout：融入 Teams 的 AI 个人助理

![product-03.jpg](/marginalia/assets/img/ai-hot/2026-06-03/product-03.jpg)


微软在 Build 大会上推出 Scout，一款嵌入 Teams 的 AI agent，自动处理日程安排、会议摘要、任务追踪等日常办公流程。关键点：Scout 可跨邮件、日历、文档和 Teams 频道工作，支持自然语言指令。为什么重要：这是微软将 agentic 能力植入“日活最高”的协作平台，对比 OpenAI Codex 偏向专业任务，Scout 瞄准普适办公自动化，可能率先改变知识工作者的一天。

> 原文：[Microsoft](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/)

### Anthropic 将 Claude Mythos 漏洞狩猎扩展至 15 国

![product-04.jpg](/marginalia/assets/img/ai-hot/2026-06-03/product-04.jpg)


Project Glasswing 规模扩大至 150 个合作伙伴，覆盖电力、水利、医疗等关键基础设施的 AI 驱动安全审计。关键点：Claude 采用“红队 + Mythos 框架”自动发现供应链和代码中的零日漏洞。为什么重要：Anthropic 正在将 AI 安全能力从封闭实验转化为公共服务，这种“漏洞保险”模式可能成为 AI 厂商竞相效仿的新商业形态。

> 原文：[Anthropic](https://www.anthropic.com/news/expanding-project-glasswing)

### 谷歌 Android 新增深度伪造来电检测功能

![product-05.jpg](/marginalia/assets/img/ai-hot/2026-06-03/product-05.jpg)


Google 在 6 月 Feature Drop 中加入 AI 假电话识别功能，可实时分析通话语音特征并警告冒充熟人的深度伪造来电。关键点：该功能运行在设备端，无需联网，利用 Tensor 芯片推断音频异常。为什么重要：随着 deepfake 诈骗激增，这是首个主流移动 OS 原生防御，但效果取决于模型覆盖面和用户信任度——如果误报率过高，可能反噬体验。

> 原文：[TechCrunch](https://techcrunch.com/2026/06/02/google-rolls-out-fake-call-detection-to-protect-against-ai-deepfake-impersonation-scams/)

### 微软推出 MDASH 框架，大规模测试 AI 智能体行为

![product-06.jpg](/marginalia/assets/img/ai-hot/2026-06-03/product-06.jpg)


微软开源 MDASH 框架，开发者只需文本描述即可自动生成 AI agent 行为测试用例，大幅降低评估成本。关键点：MDASH 支持多轮对话模拟、边界条件覆盖和失败场景标注。为什么重要：当前 agent 行为难以预测，MDASH 填补了“测试即服务”的空白，可能成为 agent 开发标配工具，但能否处理非确定性输出仍是挑战。

> 原文：[TechCrunch](https://techcrunch.com/2026/06/02/microsoft-offers-devs-a-better-way-to-control-ai-agent-behavior/)

### GitHub Copilot 新按用量计费引发用户抱怨

![product-07.jpg](/marginalia/assets/img/ai-hot/2026-06-03/product-07.jpg)


GitHub Copilot 转向 AI Credit 定价后，部分用户报告一天内用完整月额度，引起成本失控讨论。关键点：新计费按 token 消耗而非时间订阅，高频使用场景（如重构、调试）成本激增。为什么重要：这暴露出 AI 产品消费模式转型的阵痛——从“无限使用”转向“按资源定价”，倒逼用户优化提示词和缓存策略，也可能促使竞品差异化定价。

> 原文：[Ars Technica](https://arstechnica.com/ai/2026/06/ai-costs-how-much-github-copilot-users-react-to-new-usage-based-pricing-system/)

---

当 AI 助手开始理解“分析报表”和“设计演示”时，你优化的是提示词还是自己的工作流？


<h2 id="opinion" class="ai-section-divider">💭 行业观点</h2>


今日行业最值得关注的是特朗普签署修订后的AI行政令，在行业强烈游说下，对尖端模型的政府审查从强制降为自愿。这一转折表明，在缺乏国会立法的情况下，白宫对AI巨头的约束力正被实质性削弱，而“自愿”二字可能使审查机制形同虚设。与此同时，数学家警告职业被AI侵蚀、DuckDuckGo推出“无AI”搜索扩展等信号，共同指向一个核心矛盾：当产业用AI重塑效率时，从业者开始反过来质疑技术对自身领域的负面影响。

### 特朗普签署缩水版AI行政令，行业反对后仅保留自愿审查

![opinion-00.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opinion-00.jpg)


- **是什么**：特朗普于6月2日签署修订后的《促进先进人工智能创新与安全》行政令，将原先草案中对尖端模型（训练算力超过10^26 FLOPS）的强制预先政府审查改为自愿选择提交。
- **关键点**：行业团体（包括AI初创联盟、科技贸易协会）在行政令公开征求意见期间展开密集游说，称强制审查会“扼杀创新并导致人才外流”。新版行政令同时删除对云服务商报告海外客户训练活动的条款，仅保留对模型安全测试的自愿参与机制。
- **为什么重要**：这是特朗普政府第二个任期内迄今为止最标志性的AI监管动作，但其“自愿”属性使实际约束力大打折扣。值得注意的是，白宫并未放弃通过出口管制和商务部规则间接施压，但行政令本身已从“监管框架”退化为“行业自律倡议”。这对2027年国会可能推进的《AI责任法案》的立法硬度将产生示范效应。

> 原文：[White House - Promoting Advanced Artificial Intelligence Innovation and Security](https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/)

### 数学家组织警告AI正在威胁该职业

![opinion-01.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opinion-01.jpg)


- **是什么**：国际数学联盟（IMU）发表声明，指出科技公司开发的AI定理证明器和自动化推理工具正在“系统性地侵蚀数学研究的独立性和学术自由”。
- **关键点**：声明特别点名两个趋势：一是AI工具被用于快速验证已知定理，导致年轻数学家失去训练严格证明能力的机会；二是科技公司通过专利和闭源模型控制“数学发现”的底层基础设施，使依赖开源社区的学术研究面临资源不对称。
- **为什么重要**：数学界是最早经历“AI辅助 vs. AI替代”张力的纯理论领域之一。IMU的警告本质上是关于学术范式被商业逻辑裹挟的担忧——当AI能自动生成可发表的增量成果时，数学家的角色是否会被异化为“监督者”？这一讨论将逐渐扩展到物理、生物等基础科学领域。

> 原文：[Ars Technica - Mathematicians warn of AI threats to profession as industry encroaches](https://arstechnica.com/tech-policy/2026/06/mathematicians-warn-of-ai-threats-to-profession-as-industry-encroaches/)

### DuckDuckGo趁AI搜索热潮推出‘无AI’搜索扩展

![opinion-02.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opinion-02.jpg)


- **是什么**：DuckDuckGo发布Chrome和Firefox浏览器扩展，用户安装后即可将其设为默认搜索引擎，并明确标注“无AI干扰的纯搜索体验”。
- **关键点**：该扩展直接对标近期Google、Bing强制在搜索结果中嵌入AI概览（AI Overviews）的趋势。DuckDuckGo称其搜索流量在2026年Q1同比增长37%，部分来自用户主动逃离AI搜索结果。扩展还提供一键关闭所有AI相关功能的设置，包括AI摘要和聊天机器人。
- **为什么重要**：这反映出用户对AI搜索的“审美疲劳”已经转化为可量化的市场份额流失。DuckDuckGo的纯搜索路径是一种逆向差异化：当所有大厂都在往搜索结果里塞AI时，“没有AI”本身成了卖点。对于产品经理和投资人，这提示一个潜在趋势：通用AI搜索并未真正解决用户对信息准确性和控制权的焦虑。

> 原文：[TechCrunch - DuckDuckGo makes its 'no AI' search engine easier to access as its traffic booms](https://techcrunch.com/2026/06/01/duckduckgo-makes-its-no-ai-search-engine-easier-to-access-as-its-traffic-booms/)

### 图灵奖得主Richard Sutton称纯生成式AI无法进行真正科学发现

![opinion-03.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opinion-03.jpg)


- **是什么**：强化学习先驱、图灵奖得主Richard Sutton在接受采访时表示，当前基于大规模语言模型和图像生成模型的“纯生成式AI”无法完成真正的科学推理和发现。
- **关键点**：Sutton指出，生成式模型本质上是从训练数据中重组已有的模式（pattern recombining），而真正的科学发现需要提出新假设、设计实验、检验因果链——这些需要“与世界交互的反馈循环”，而非单纯的概率预测。他同时批评了行业对“AI科学家”类工具的过度宣传。
- **为什么重要**：Sutton的批评代表了强化学习学派与近期大模型狂热之间的根本分歧。作为RL（reinforcement learning）领域的奠基人，他暗示真正的“智能”必须包含主动探索（exploration）和目标导向的行动，而不仅仅是压缩（compression）和生成。这对正在高喊“AI for Science”的创业公司是一个清醒提醒：目前多数AI工具只是加速文献检索和代码写作，离颠覆科学方法还很遥远。

> 原文：[The Decoder - Turing Award winner Richard Sutton says pure generative AI can't do real science](https://the-decoder.com/turing-award-winner-richard-sutton-says-pure-generative-ai-cant-do-real-science/)

### OpenAI呼吁全球协同监管青少年AI安全

- **是什么**：OpenAI发布白皮书《通过全球领导力推进青少年安全与机遇》，提议成立“国际青少年AI安全研究所”（International Institute for Youth AI Safety），统一协调各国针对未成年用户的AI使用标准。
- **关键点**：白皮书包含三条具体倡议：强制AI服务提供商对18岁以下用户进行年龄验证（无需上传身份证，可通过行为模式推断）；禁止针对青少年推送“成瘾性互动”如无限制对话时长；设立全球通报平台要求企业报告青少年相关安全事件。OpenAI表示已在自身产品中先行实施。
- **为什么重要**：这是OpenAI首次主动提出国际监管框架，而非被动回应。其动机可以解读为“先发制人”——通过设定行业标准来影响未来立法方向，避免各国制定碎片化的严苛法规。对于技术从业者，年龄验证的技术实现（行为模式推断的准确性与隐私平衡）将成为一个新的工程挑战。

> 原文：[OpenAI - Advancing youth safety and opportunity through global leadership](https://openai.com/index/advancing-youth-safety-and-opportunity-through-global-leadership/)

### 斯科塞斯意外成为好莱坞AI拥趸，但仅用于故事板

![opinion-05.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opinion-05.jpg)


- **是什么**：著名导演马丁·斯科塞斯在《纽约时报》采访中表示，他已在最新项目中使用AI图像生成工具制作故事板（storyboard）和预可视化场景，并称这是“令人兴奋的工具”。
- **关键点**：斯科塞斯特意强调AI应被严格限制在前期制作阶段，“永远不会用于编剧、表演或后期剪辑”。他同时批评好莱坞制片方试图用AI替代编剧和美术的行为“正在摧毁电影的灵魂”。这一表态发生在WGA罢工后第二年的敏感时期。
- **为什么重要**：斯科塞斯的立场是“工具派”在创意行业中的典型代表：接受AI在非创作核心环节的效率价值，但坚决反对替代人类创造力。这并不意外，但作为好莱坞最受尊敬的导演之一，他的声音可能影响独立电影人和中小制片公司的选择——到底用AI来降低成本，还是用它来增强而非替代。

> 原文：[TechCrunch - Martin Scorsese becomes the latest and most unlikely Hollywood voice for AI](https://techcrunch.com/2026/06/02/martin-scorsese-becomes-the-latest-and-most-unlikely-hollywood-voice-for-ai/)

---

当一项技术开始让从业者主动构建“无AI”替代方案时，行业的共识可能正在从“AI将取代一切”转变为“我们需要更多选择”。如果自愿审查、无AI搜索和传统职业保护都是市场自发调节的信号，那么下一场博弈的关键阵地会在哪里？


<h2 id="opensource" class="ai-section-divider">⚙️ 开源工具</h2>


今日 GitHub 密集涌现多项高价值开源项目：微软发布文件转 Markdown 工具 MarkItDown，有望降低 LLM 数据预处理门槛；TradingAgents 多智能体框架登上热榜，将 agentic 思路切入金融交易场景；此外 Oh-my-pi、Bernini、UniLab 各有亮点，值得技术团队逐一关注。

### 微软开源 MarkItDown：文件转 Markdown 通用工具

![opensource-00.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opensource-00.jpg)


**是什么**  
微软今日开源 Python 工具 MarkItDown，支持将 Office 文档（Word、Excel、PowerPoint）、PDF 等批量转换为 Markdown 格式，并保留基本结构与元数据。

**关键点**  
- 依赖 Python 及常见库（python-docx、pdfminer.six 等），安装简单。  
- 输出为纯文本 Markdown，AI 直接可读，适合作为 LLM 知识库或训练数据预处理管道的前置模块。  
- 微软官方维护，长期可用性较高。

**为什么重要**  
大量企业数据以非结构化文档形式存在，MarkItDown 填补了从文档到 LLM 输入格式的标准化转换工具缺位。若能结合向量数据库索引，可为 RAG 系统提供低成本数据清洗方案。

> 原文：[GitHub - microsoft/markitdown](https://github.com/microsoft/markitdown)

### TradingAgents：多智能体金融交易开源框架

![opensource-01.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opensource-01.jpg)


**是什么**  
开源项目 TradingAgents 利用多个 LLM 智能体（分析、策略、执行等角色）协同完成金融交易策略研究、回测与实盘模拟，登上 GitHub 热榜。

**关键点**  
- 每个智能体独立调用 LLM（可配置 GPT-4、Claude 等），通过结构化消息协作。  
- 支持历史数据加载、技术指标计算、风险控制规则注入。  
- 提供完整示例策略与模拟运行日志，降低二次开发门槛。

**为什么重要**  
将 agentic 框架应用于金融交易，意味着开发者可用自然语言定义策略逻辑，而非编写复杂代码。它更像一个实验沙盒，加速 AI 交易策略的迭代，但实盘风险仍需人工管控。

> 原文：[GitHub - TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)

### Oh-my-pi：终端 AI 编程智能体

![opensource-02.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opensource-02.jpg)


**是什么**  
开源终端智能体 Oh-my-pi 支持用户通过自然语言在终端内执行编程任务，核心能力包括哈希锚定编辑、LSP 集成、浏览器整合等，成为 GitHub 热榜新星。

**关键点**  
- “哈希锚定编辑”：利用文件内容的哈希值定位代码位置，实现精准修改。  
- 内嵌 LSP 协议支持，可进行类型感知的代码重构。  
- 能调用浏览器引擎执行 Web 自动化任务（如抓取、填表）。

**为什么重要**  
终端智能体是 AI 编程工具的重要分支，Oh-my-pi 提供了比传统 CLI 更自然的交互方式，尤其适合远程开发或无 GUI 环境。其架构设计（模块化、插件化）也为社区扩展埋下伏笔。

> 原文：[GitHub - can1357/oh-my-pi](https://github.com/can1357/oh-my-pi)

### 字节跳动开源视频编辑框架 Bernini

![opensource-03.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opensource-03.jpg)


**是什么**  
字节跳动开源统一 DiT（Diffusion Transformer）框架 Bernini，通过大模型理解语义指令，实现 AI 视频编辑（如换背景、改物体、风格迁移），提供完整训练与推理代码。

**关键点**  
- 基于 DiT 统一图像与视频空间，支持多帧联合编辑。  
- 用户输入自然语言描述，框架自动生成掩码与编辑蓝图。  
- 官方开源包括预训练权重与少量数据预处理脚本。

**为什么重要**  
视频编辑长期依赖专业软件与人工操作，Bernini 展示了语义驱动编辑的可行性。虽然目前输出分辨率与时长有限，但作为统一框架的开源尝试，将推动更多团队投入 AI 视频赛道。

> 原文：[量子位 - 字节跳动开源 Bernini](https://www.qbitai.com/2026/06/427810.html)

### 清华AIR开源 UniLab：分钟级机器人运控训练

![opensource-04.jpg](/marginalia/assets/img/ai-hot/2026-06-03/opensource-04.jpg)


**是什么**  
清华大学 AIR 研究院开源 UniLab，提出全新强化学习训练架构，将机器人运动控制训练时间从小时级压缩至分钟级，速度提升约 10 倍。

**关键点**  
- 采用“并行环境+梯度同步”优化，大幅提高样本利用率。  
- 支持多种机器人模型（四足、双足）与任务（行走、跳跃）。  
- 提供 Docker 一键部署与可视化监控界面。

**为什么重要**  
机器人强化学习训练长期受限于仿真计算消耗，UniLab 让研究人员能在 5 分钟内完成一次完整训练迭代，极大加速算法验证与迭代。对于实验室和小团队，这意味着更低的硬件门槛。

> 原文：[量子位 - 清华 AIR 开源 UniLab](https://www.qbitai.com/2026/06/427729.html)

---

今天五个开源项目覆盖了数据预处理、金融交易、编程助手、视频编辑和机器人训练——AI 工具链正从单点突破走向标准化与成本下降。你团队的下一个项目，会从哪个工具开始构建？
