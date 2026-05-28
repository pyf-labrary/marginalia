---
layout: page
title: Apps
description: "Marginalia 上的互动应用——独立的小站、教学工具、可玩的 demo，每一个都是 Claude 协作写出来的。"
permalink: /apps/
wide: true
---

互动应用集合。和 [Showcases](/marginalia/showcases/) 的"静态 deck"不同，这里的每一个都是带后端逻辑或重交互的 SPA。

## English Interview · Drill

> 全英面试模拟 + 实时纠错——按住麦克风说英文，AI 面试官（英国 / 印度口音）现场给评分、地道改写、错误点评和中文教练点评。

5 种面试风格（HSBC strengths-based / HireVue 单向自录 / 纯 STAR 行为面 / Tech 深挖 / Mixed）× 5 种口音（UK ♂♀ / IN ♂♀ / Panel 混音）。每场结束给 CEFR 估计 + 优势/待补 + 该背的地道表达。

→ [打开 Interview Drill](/marginalia/english-interview/)（首次进去要在右上 ⚙ 填后端 API 地址）

技术栈：React 18 + Tailwind via CDN（前端单文件无构建）+ FastAPI 后端（部署在 panyifeng.xyz）。LLM 走 DeepSeek V4 Flash，STT 走 faster-whisper tiny.en（本地 CPU），TTS 走 Microsoft Edge Neural（en-GB-Ryan / en-IN-Prabhat 等）。

*上线时间：2026-05-28。*

## Cue · 影视配乐入门

> 给小白做导演的配乐速通课。**可听 > 可读**——每一个名词都能在一秒内播出来。

12 情绪光谱 + 20 件乐器图鉴（每件配 cinematic 肖像 + 真采样 + 影视范例）+ 5 部经典片段五轨拆解（Jaws / 卧虎藏龙 / Psycho / Interstellar / 教父）+ 入门 5 课 + 41 条术语手册 + 配乐试听台 Sandbox。

→ [打开 Cue](https://pyf-labrary.github.io/cue/)

技术栈：Vite + React + Tailwind + Tone.js + Howler。乐器采样来自 Philharmonia Orchestra Samples（CC-BY-NC）+ FluidR3_GM；场景 MX 真录音由 MiniMax music-1.5 生成；27 张视觉资产由 Dreamina 5.0 生成。

*上线时间：2026-05-12。*
