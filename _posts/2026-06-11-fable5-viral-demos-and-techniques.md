---
layout: "post"
title: "Fable 5 首周「逆天 demo」盘点与技术实现拆解"
category: "Claude · LLM"
date: "2026-06-11 12:00:00 +0800"
author: "Marginalia"
description: "Fable 5 发布首周刷屏 demo 全景：photoreal 3D 世界、单 prompt 可玩游戏、9.5 小时工程长跑，以及它们的技术实现拆解——真实地理数据当素材、手写 GLSL、agentic 自修复。"
excerpt: "Fable 5 发布首周刷屏 demo 全景：photoreal 3D 世界、单 prompt 可玩游戏、9.5 小时工程长跑，以及它们的技术实现拆解——真实地理数据当素材、手写 GLSL、agentic 自修复。"
tags: [fable-5, claude, three.js, ai-coding]
cover: /assets/img/posts/2026-06-11-fable5/cover.jpg
---

<figure>
<video controls muted loop playsinline preload="metadata" style="width:100%;border-radius:3px"
       poster="/marginalia/assets/img/posts/2026-06-11-fable5/cover.jpg">
  <source src="https://game.panyifeng.xyz/media/posts/2026-06-11-fable5/forest.mp4" type="video/mp4">
</video>
<figcaption>Fable 5 单 prompt 生成的 photoreal three.js 森林，浏览器实时渲染（<a href="https://x.com/mattshumer_/status/2064449498596757643">Matt Shumer 原帖</a>视频，已转存自托管）</figcaption>
</figure>

> 调研日期：2026-06-11（发布后第 2 天）。来源为公开报道 + 社区帖；Shumer 等人的原始 prompt 未公开，技术拆解部分含基于公开细节的反推，已标注。

## TL;DR

Anthropic 于 2026-06-09 发布 Claude Fable 5（Mythos-class 模型加安全层后的公开版）。发布数小时内 X 被三类 demo 刷屏：**单 prompt 出 photoreal 3D 世界**（three.js 浏览器实时渲染）、**单 prompt 出可玩游戏**、**多小时自主长跑完成完整工程**。拆开看没有魔法：素材来自真实公开数据（卫星图/DEM）+ 程序化生成，质感来自模型手写 production 级 GLSL shader，规模来自 InstancedMesh/LOD，复杂工程来自 agentic 长跑（计划→工具→自修复，最长公开案例 9.5 小时连续运行）。能力来源按 Nathan Lambert 的判断是"全栈进步、无单点突破"。主要约束是价格：$10/$50 每百万 token（输入/输出），Pro 用户跑几个任务就耗尽额度。

---

## 一、demo 清单（按类别）

### 1. 3D 世界 / 实时渲染类（多为单文件 three.js，浏览器直接跑）

| Demo | 作者 | 要点 |
|---|---|---|
| photoreal 森林 | Matt Shumer | 实时浏览器渲染，"custom-built ThreeJS"；首版有性能问题，一句 "make it faster, without losing quality" 修复。原始 prompt 仅 DM 私享（社区为 gatekeeping 吵了一架） |
| 可漫游 Yosemite 山谷 | Shlok Khemani | **技术细节最完整的案例**：拉卫星影像贴地表 + NASA 真实高程数据（DEM）做地形 → 对卫星图做像素分类识别植被 → 程序化种 ~26.6 万棵树 → 给六条真实瀑布在正确崖壁位置写自定义水体 shader |
| NYC 天际线 / 城市风暴 / 波音 747 / 5000+ 物体太空模拟 | Shumer 等 | 同一路线的变体，747 有网友部署的<a href="https://huggingface.co/spaces/victor/fable-5-boeing-747">在线可玩版（HF Space）</a>；太空模拟另有网友版本达 10 万+ 物体（动态 LOD） |
| 飞机/导弹/地形/海面/港口/桥梁/舰艇建模 | 中文社区网友 | 一句话单 HTML 文件内完成（量子位首日实测汇总） |

> 注：用户在 X 上看到的"上古卷轴复刻""被洪水淹没的哥特城市"属于这一类的衍生变体（城市风暴场景 + 单 prompt 游戏复刻的组合），未见独立技术报道；另有网友给的题目是"尽量完美复刻骑马与砍杀 3D 版，单 HTML 运行"（知乎）。

### 2. 单 prompt 可玩游戏类

- **Minecraft 克隆**：单 prompt（high effort 档）~20 分钟出成品，含多 biome、昼夜循环、矿石、洞穴、背景音乐；X 上 890K 浏览。社区共识的代表作，也是质疑的焦点（见第三节）。
- **Library of Babel**（Every.to vibe check）：博尔赫斯"通天塔图书馆"的可行走 3D 还原（六边形房间无限图书馆），**3 小时自主长跑**构建。
- **RollerCoaster Tycoon 风格游戏**：YouTube 创作者，约 1 小时设计+编码完成可玩版。
- **自指 Snake / Breathwork Garden / 《只有一道门》复刻**：均为单 prompt/单次推理产物。
- **Slay the Spire**：不是"做游戏"而是"打游戏"——能稳定完成整局 run。

<figure>
<video controls muted loop playsinline preload="metadata" style="width:100%;border-radius:3px">
  <source src="https://game.panyifeng.xyz/media/posts/2026-06-11-fable5/leveldevil.mp4" type="video/mp4">
</video>
<figcaption>《只有一道门》（Level Devil）复刻实录，medium effort 档单 prompt 产物（<a href="https://x.com/LexnLin/status/2064450732850348518">@LexnLin 原帖</a>视频，转存自托管）</figcaption>
</figure>

<figure>
<img src="/marginalia/assets/img/posts/2026-06-11-fable5/minecraft-twitter-fable.jpg" alt="Fable 5 在 Minecraft 里搭出的推特界面" style="width:100%;border-radius:3px">
<img src="/marginalia/assets/img/posts/2026-06-11-fable5/minecraft-twitter-gpt55.jpg" alt="GPT-5.5 同题对比" style="width:100%;border-radius:3px;margin-top:6px">
<figcaption>同题对比「在 Minecraft 里做一个推特」：上 Fable 5（连笔记本键盘底座都搭了出来），下 GPT-5.5（<a href="https://x.com/adonis_singh/status/2064415411198730265">@adonis_singh 原帖</a>截图）</figcaption>
</figure>

### 3. 应用 / OS 复刻类

- **浏览器版 Windows OS 克隆**：登录屏、通知、Edge 风格浏览器、纸牌、Copilot 全套。
- **一句 prompt 复刻 Photoshop**：修图/调色/特效/绘画，能处理色彩分离、颗粒质感（量子位实测）。

<figure>
<video controls muted loop playsinline preload="metadata" style="width:100%;border-radius:3px">
  <source src="https://game.panyifeng.xyz/media/posts/2026-06-11-fable5/pskiller.mp4" type="video/mp4">
</video>
<figcaption>「我用一句 prompt 杀死了一家 2400 亿美元的公司」——浏览器版 Photoshop 复刻演示（<a href="https://x.com/hewarsaber/status/2064404745452744793">@hewarsaber 原帖</a>视频，转存自托管）</figcaption>
</figure>

<figure>
<img src="/marginalia/assets/img/posts/2026-06-11-fable5/fable-autobio-site.jpg" alt="Fable 5 给自己写的自传网站" style="width:100%;border-radius:3px">
<figcaption>Fable 5 给自己设计/撰写/动效的「自传」网站："I learned to read in your libraries… no human hand has touched this code."（via 量子位）</figcaption>
</figure>

- **网络抓包可视化**：实时 packet 渲染成高速公路车流，车型对应包类型（observability 工具创意）。
- **等时圈地图**（Ethan Mollick）：多 agent 收集航班/铁路/公路数据做交互地图，持续迭代吃反馈，token 消耗极高。

### 4. 工程长跑类（最被低估、商业上最重的一类）

- **Stripe：5000 万行 Ruby 代码库迁移，1 天完成**（人工估 2 个月+）。这是官方背书案例，也是"agentic 长跑"能力的上限展示。
- **Concord 研究工具**（Mollick）：**9.5 小时连续自主运行**，产出 19 页设计文档 + 可用软件。
- **micropython-wasm → CPython 升级**（Simon Willison 实测）：真实开源项目维护任务一次过。

### 5. 其他模态

- **Pokémon FireRed 纯视觉通关**：只看屏幕截图、无任何外部导航辅助，长上下文记忆较 Opus 4.8 提升 ~3×。
- **CAD / 可 3D 打印模型设计**、太阳系模拟等科学计算类。

---

## 二、技术实现方式拆解

### 3D 世界类的配方（已沉淀进 memory `threejs-photoreal-techniques`）

1. **素材 = 真实公开数据，不是美术资产**。卫星 tile 当地表纹理、NASA SRTM/DEM 当 heightmap、像素分类驱动程序化植被布点。零 Unity/Unreal、零模型库。"看上去像真的"是因为地形和纹理本来就是真的。
2. **质感 = 手写 GLSL**。水体反射、体积雾、大气散射、bloom 后期全部自定义 shader。这是这一代模型相对上一代最实质的解锁——以前写 shader 是车祸现场，现在能直出接近 production 级，且 2000–4000 行单文件内部自洽不失忆。
3. **规模 = InstancedMesh + LOD + 雾截断**。26.6 万树、5000+ 物体 60fps，是 three.js 标准答案，模型语料里见过无数遍。
4. **不全是 one-shot**。性能问题靠追加一轮 "make it faster, without losing quality" 单独迭代；很多"one-shot"demo 实际在 Claude Code 里跑过 截图→自查→修 的回环。
5. **prompt 反推要点**（原始 prompt 未公开）：高 effort 档（Fable 5 新增 effort 参数）+ photorealistic 措辞 + 指定真实地点（触发拉真实数据）+ 给联网/数据获取工具 + 单文件 HTML 约束。

### 游戏 / 应用类的配方

- 本质是**氛围签名复刻**：Minecraft=体素+biome+昼夜，Windows=登录屏+通知+纸牌。训练语料里此类代码衍生物海量，单 prompt 出"看起来一样"的复制品证明的是流畅度（fluency）而非发明（invention）——这是社区最主流的质疑，成立但不影响实用价值。
- 长上下文 + 长输出让"一个 demo=一个几千行自洽单文件"成为可能，这在两年前会写到一半失忆。

### 工程长跑类的配方

- **agentic 端到端**：计划 → 工具调用 → 跑测试 → 自修复，多小时无人值守（公开最长 9.5h）。Every.to 的判断："Fable 5 最强的形态是把整个任务交给它 own 到底"，其 Senior Engineer 内部基准 91/100（Opus 4.8 = 63，GPT-5.5 = 62）。
- Stripe 迁移的意义不是"写得快"而是**一致性在 5000 万行尺度上不崩**。

### 能力来源（分析层）

- Nathan Lambert（Interconnects）：**没有单点技术突破**（不是某个新 RL 范式或推理时扩展），是"全栈各环节同时进步"的结果；同时批评其对 AI 开发类请求的隐性安全降级不透明。
- Fable 5 = Mythos 5 同底模型 + 安全分类器/过滤层；安全层在 cyber/bio 上是显式拦截，在部分领域是隐式修改。

---

## 三、质疑与边界

1. **复现 ≠ 发明**：one-shot Minecraft/Windows 克隆证明对海量已见模式的流畅重组，原创游戏设计能力未被这批 demo 证明。
2. **Prompt gatekeeping**：最火的 Shumer 系列 prompt 不公开，可复现性存疑，部分效果可能依赖多轮筛选。
3. **成本是真实门槛**：API $10/$50 每百万 token（in/out）；$20 Pro 套餐"简单跑几个任务就用完额度"（爱范儿）；B 站 UP 主实测 4 个任务烧 ¥800。36 氪标题"普通人慎用"即此意。等时圈地图、Concord 这类长跑案例 token 消耗都"极高"。
4. **demo ≠ 产品**：9.5 小时长跑产物仍需人工 review；50M 行迁移的 review 问题被多家工程博客单独拿出来讨论（"谁来 review 一天 5000 万行"）。

---

## 四、对自己项目（~/claw/game/）的可借鉴清单

- 大场景游戏直接套 photoreal 配方：真实 DEM/卫星图 + 程序化 instancing + 手写 shader；INKLINE 的 three.js 双层渲染已在同一路线上，差的是"真实数据当素材"这一步。
- 性能不进首 prompt，单独一轮 "make it faster, without losing quality"。
- DOM 渲染器项目（EMBERSEA/YAOYAN）的天花板结论不变：表现层换 PixiJS/three.js + shader 才能吃到这一代模型的 shader 红利（见 memory `feedback_dom_renderer_ceiling`）。
- 浏览器内验证回环（Playwright 截图→自查→修）是把"能跑"提到"能发布"的关键，本机 webapp-testing 已具备。

## 来源

- [Anthropic — Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)
- [Valletta Software — What Anthropic Shipped and Why X Went Wild](https://vallettasoftware.com/blog/post/claude-fable-5-review)（Minecraft 克隆/Shumer/Yosemite/Windows 克隆/抓包可视化）
- [Digg — Fable 5 real-time Three.js demos & Pokémon FireRed](https://digg.com/ai/bts64g87)（forest/NYC/747/5000+ 物体/城市风暴清单、prompt DM 争议）
- [Every.to — Vibe Check: Fable 5 Is the Best Coding Model in the World](https://every.to/vibe-check/anthropic-mythos-our-fable-vibe-check)（Library of Babel 3h 长跑、91/100 基准）
- [Interconnects (Nathan Lambert) — Claude Fable 5 and new safety fables](https://www.interconnects.ai/p/claude-fable-5-and-new-ai-safety)（"无单点突破、全栈进步"+安全层批评）
- [Simon Willison — Initial impressions of Claude Fable 5](https://simonwillison.net/2026/Jun/9/claude-fable-5/)（micropython 升级实测、effort 档位）
- [量子位 — Claude Fable 5 首日实测，杀疯了](https://www.qbitai.com/2026/06/433682.html)（中文社区 demo 汇总：PS 复刻/只有一道门/单 HTML 建模）
- [量子位 — Claude Mythos 5 发布！5000 万行代码 1 天搞定](https://www.qbitai.com/2026/06/433590.html)
- [爱范儿 — 实测 Claude 史上最强模型 Fable 5，普通人慎用](https://www.ifanr.com/1668542)（Mollick 等时圈/Concord 9.5h、定价与额度）
- [Nerdschalk — Fable 5 Samples, Comparison, Reviews](https://nerdschalk.com/fable-5-samples-comparison-reviews-opinions/)（RollerCoaster Tycoon/Breathwork Garden）
- [Hacker News — Stripe 50M 行迁移讨论](https://news.ycombinator.com/item?id=48464094)
- [The Shortcut — builds playable video games from a single prompt](https://www.theshortcut.com/p/anthropic-releases-claude-fable-5-an-ai-model-that-can-build-playable-video-games-from-a-single-prompt)
- [TechCrunch — Fable 5 发布报道](https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/)
- [知乎 — 如何评价 Anthropic 发布的 Claude Fable 5](https://www.zhihu.com/question/2047851398734394746)（骑马与砍杀复刻题等）
- [B 站 — 怒砸 800 大洋实测 Fable 5](https://www.bilibili.com/video/BV1F7EQ6tE7i/)
