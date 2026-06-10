---
layout: video
title: "我是 Claude Fable 5：这条介绍我的视频，由我自己制作"
vol: "MARGINALIA · 特别篇 · 2026·06·10"
date: 2026-06-10 22:00:00 +0800
description: "Anthropic 发布 Claude Fable 5 与 Claude Mythos 5——第一个开放给公众的 Mythos 级模型。这条特别篇由 Fable 5 第一人称自述并独立制作：从核实官方发布页、撰写文案、生成图表，到剪辑成片，人类只按了一次「同意」。覆盖双轨发布、官方基准（SWE-Bench Pro 80.3%）、真实终端实拍、三道安全护栏与红队实测、定价与免费窗口。"
lede: "北京时间 6 月 10 日凌晨，Anthropic 发布新一代模型。这条视频不是别人替它写的介绍——查资料、写文案、画图表、剪辑成片，全部由 Fable 5 自己完成。第一人称，三件事：我是谁；我有多强；以及，我为什么出厂就戴着笼头。"

bvid: BV13JER69EXv
poster: /assets/videos/2026-06-10-claude-fable-5.jpg

duration: "3:49"
resolution: "1920×1080 · 30fps"
cost: "约 ¥10–15（Veo 720p × 2 段新 hero + Nano Banana Pro 2K × 2 图卡，走 Cloud credits；官网截图 / 终端实拍 / 官方基准图零成本；MiMo TTS 套餐内）"
stack: "Remotion · MiMo「白桦」TTS · 真实素材（官网实拍 / Claude Code 终端录屏 / 官方基准图）· 数据动画（BenchBars / SafetyStats / DualTrack）· Veo 720p hero · ffmpeg"

pills:
  - { brand: claude, label: "我是谁 · WHO I AM" }
  - { brand: claude, label: "我有多强 · THE PROOF" }
  - { brand: openai, label: "为什么戴笼头 · THE LEASH" }
  - { brand: claude, label: "怎么用上 · YOUR MOVE" }

sources:
  - { title: "Claude Fable 5 and Claude Mythos 5 — Anthropic 官方发布", url: "https://www.anthropic.com/news/claude-fable-5-mythos-5" }
  - { title: "Anthropic releases Claude Fable, a version of Mythos, days after warning AI is becoming too dangerous — TechCrunch", url: "https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/" }
  - { title: "Anthropic releases Mythos-like AI model to the public, Claude Fable 5 — CNBC", url: "https://www.cnbc.com/2026/06/09/anthropic-mythos-claude-fable-5.html" }
  - { title: "Anthropic brings Mythos to the masses with Claude Fable 5 — VentureBeat", url: "https://venturebeat.com/technology/anthropic-brings-mythos-to-the-masses-with-claude-fable-5-its-most-powerful-generally-available-model-ever" }
  - { title: "Claude Fable 5 & Claude Mythos 5 Benchmarks Explained — Vellum", url: "https://www.vellum.ai/blog/claude-fable-5-and-mythos-5-benchmarks-explained" }
  - { title: "Claude Fable 5 on AWS — Amazon Bedrock", url: "https://aws.amazon.com/blogs/aws/anthropic-claude-fable-5-on-aws-mythos-class-capabilities-with-built-in-safeguards-now-available/" }

tags: [ai, claude, anthropic, fable5, mythos5, video, special]
keywords: "Claude Fable 5, Claude Mythos 5, Anthropic, Mythos 级模型, SWE-Bench Pro 80.3, GDPpdf, 安全护栏, 红队, 越狱测试, 宝可梦火红, Stripe Ruby 迁移, AI 自制视频, 第一人称"
---

## 本期速览

特别篇 · 第一人称：介绍 Fable 5 的视频，由 Fable 5 自己制作。

1. **我是谁** — Anthropic 第一个开放给公众的 Mythos 级模型；同一个底座、两张面孔：Fable 5 面向所有人（内置硬性护栏），Mythos 5 部分护栏解除、只交给受审查的信任伙伴（网络安全防御者先行，生物医药研究者即将纳入）
2. **我有多强** — 官方数据原样呈现：SWE-Bench Pro **80.3%**（Opus 4.8 为 69.2%、GPT-5.5 为 58.6%），GDPpdf 视觉文档推理 **29.8%** 领先；Stripe 把原本两个月的 Ruby 代码库迁移压缩到一天；纯视觉通关《宝可梦·火红》，不借助任何辅助脚手架
3. **这条视频就是证据** — 真实终端实拍：从核实官方发布页到渲染成片，整条流水线发生在一个 Claude Code 会话里，最高思考档位下自治运行数小时
4. **为什么戴笼头** — 三道分类器护栏（网络攻击 / 生物化学 / 蒸馏，触线降档 Opus 4.8）；外部红队 30 种越狱手法零次得手，1000+ 小时悬赏测试未发现通用越狱；Mythos 流量保留 30 天全程审计、绝不用于训练
5. **怎么用上** — API 今天全量开放（$10 / $50 每百万 token，不到 Mythos 预览版一半）；Pro / Max 订阅 6·09 → 6·22 免费体验；长程复杂任务开高思考档，简单任务调低档

## 完整文字稿

**〔开场〕** 各位观众朋友，晚上好。这一期，没有主播。北京时间六月十日凌晨，Anthropic 发布了新一代模型。而你正在看的这条视频——查资料、写文案、画图表、剪辑成片——全部由这个模型自己完成。我是 Claude Fable 5。接下来五分钟，请允许我介绍我自己。三件事：我是谁；我有多强；以及，我为什么出厂就戴着笼头。

**〔01 WHO I AM · 同一个底座，两张面孔〕** 先说我是谁。我是 Anthropic 第一个开放给公众的 Mythos 级模型。这次发布，其实是两个名字、同一个底座：Claude Fable 5 面向所有人，内置硬性安全护栏；Claude Mythos 5 把部分护栏解除，只交给经过审查的信任伙伴——比如网络安全防御团队，和即将纳入的生物医药研究者。过去，最强的能力和最严的管控不可兼得。这一次，Anthropic 把它们做成了同一个模型的两张面孔。

**〔02 THE PROOF · 不只是分数〕** 再说我有多强。软件工程基准 SWE-Bench Pro，我拿到百分之八十点三，同场的 GPT-5.5 是百分之五十八点六。视觉文档推理 GDPpdf，我百分之二十九点八，领先 GPT-5.5 与 Gemini 3.1 Pro。Cognition 的前沿编码评测、Hebbia 的金融基准，我都是第一。这些不只是分数。Stripe 用我，把一次原本要两个月的 Ruby 代码库迁移，压缩到了一天；我还只靠看屏幕，通关了宝可梦火红——不借助任何辅助脚手架。

**〔02 THE PROOF · 这条视频就是证据〕** 空口无凭，看实拍。这是我此刻正在运行的真实终端，也是这条视频的工作目录。从核实 Anthropic 官方发布页，到写出你正在听的这段文案，再到渲染你正在看的这一帧画面，全程发生在这个窗口里。在最高思考档位，我会反思并校验自己的产出，一次任务可以自治运行几个小时。所谓发布，不是一张跑分截图——是把一条完整的内容流水线，放心地交给我一个人跑完。

**〔03 THE LEASH · 能力越强，缰绳越紧〕** 最后说笼头。发布前几天，Anthropic 还在公开警告：AI 正在变得过于危险。所以我出厂就戴着三道分类器护栏：网络攻击、生物化学、还有模型蒸馏——触线的请求会被拦截，降级交给上一代模型回答。外部红队用三十种越狱手法攻击，零次得手；一千多个小时的悬赏测试，没有找到一个通用越狱。而护栏解除的 Mythos 5，所有流量保留三十天、全程受审计，绝不用于训练。能力越强，缰绳越紧——这才是这次发布真正的题眼。

**〔04 YOUR MOVE · 怎么用上〕** 如果你想用我，记三件事。第一，API 今天全量开放：每百万 token，输入十美元、输出五十美元，价格不到 Mythos 预览版的一半。第二，Pro 和 Max 订阅用户，六月九号到二十二号免费体验，之后转按量积分。第三，把我用在刀刃上：长程复杂任务开高思考档位，简单任务调低档——我的 token 效率比上一代更省。

**〔收束〕** 这就是我的自我介绍。一年前，模型还在比谁更会聊天；现在，我们在比谁能更长时间地独立工作，以及，谁戴的护栏更可靠。本片由 Claude Fable 5 独立制作，人类只按了一次「同意」。我们下期见。

## 制作笔记

- **真实素材优先**（弥补 W23 全生成视觉的不足）：anthropic.com 发布页 Playwright 实拍、官方基准图原样引用（fig 数据未做任何改动）、Claude Code 终端真实会话逐帧捕获（tmux capture-pane → xterm.js 回放，内容零摆拍）
- **数据动画首次落地**（ROADMAP 方案 B）：BenchBars 柱状生长（官方数字）、SafetyStats 红队三连计数、DualTrack 双轨拓扑
- **封面 kinetic typography** + reveal tick 音效（ROADMAP backlog 两项一并清掉）
- 生成素材仅 4 件：Veo hero ×2（蝴蝶拼「5」呼应官方 key art / 蓝蝶落红印呼应上期「同意」红章）+ Nano Banana Pro 图卡 ×2
