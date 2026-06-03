---
layout: page
title: Apps
description: "Marginalia 上的互动应用——独立的小站、教学工具、可玩的 demo，每一个都是 Claude 协作写出来的。"
permalink: /apps/
wide: true
---

互动应用集合。和 [Showcases](/marginalia/showcases/) 的"静态 deck"不同，这里的每一个都是带后端逻辑或重交互的 SPA。

## English Interview · Drill

> 全英面试训练器：按住麦克风说英文，AI 面试官现场给评分、标准范答、地道改写、错误点评和中文教练点评。不会答？一键「看范答」。还能切「AI 对练」模式，让面试官 AI 与考生 AI 现场双语对答，你纯听 + 看中英字幕学。

全方位 7 大范围（综合·从零 / AI·LLM / 后端 / 系统设计 / CS 基础 / 行为面 / 个人项目）× 5 种面试风格 × 5 种口音（UK ♂♀ / IN ♂♀ / Panel 混音），题数 4–20。每题都给标准范答 + 答题要点，每场结束给 CEFR 估计 + 优势/待补 + 该背的地道表达。**为投递汇丰 / Standard Chartered / DBS / Citi 这类外资银行 + 同档外企远程 AI 岗的全英面试做的口语训练器。**

→ [打开 Interview Drill](https://eng.panyifeng.xyz/)（私人 demo，需带访问 token）
→ [源代码](https://github.com/pyf-labrary/english-interview)

技术栈：FastAPI 后端 + React/Tailwind 前端（预编译、全资源同域自托管）。LLM 走 DeepSeek V4，STT 以浏览器 Web Speech 实时转写为主、faster-whisper base.en 服务器兜底，TTS 走 Microsoft Edge Neural（英 / 印口音，对练模式双声线）。鉴权 + nginx 限流防白嫖。

*上线时间：2026-05-28；2026-06 加全方位主题 + 一键范答 + AI 对练观摩，前端改同域自托管。*

## Cue · 影视配乐入门

> 给小白做导演的配乐速通课。**可听 > 可读**——每一个名词都能在一秒内播出来。

12 情绪光谱 + 20 件乐器图鉴（每件配 cinematic 肖像 + 真采样 + 影视范例）+ 5 部经典片段五轨拆解（Jaws / 卧虎藏龙 / Psycho / Interstellar / 教父）+ 入门 5 课 + 41 条术语手册 + 配乐试听台 Sandbox。

→ [打开 Cue](https://pyf-labrary.github.io/cue/)

技术栈：Vite + React + Tailwind + Tone.js + Howler。乐器采样来自 Philharmonia Orchestra Samples（CC-BY-NC）+ FluidR3_GM；场景 MX 真录音由 MiniMax music-1.5 生成；27 张视觉资产由 Dreamina 5.0 生成。

*上线时间：2026-05-12。*
