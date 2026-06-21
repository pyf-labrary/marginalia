---
layout: page
title: Apps
description: "Marginalia 上的互动应用——独立的小站、教学工具、可玩的 demo，每一个都是 Claude 协作写出来的。"
permalink: /apps/
wide: true
---

互动应用集合。和 [Showcases](/marginalia/showcases/) 的"静态 deck"不同，这里的每一个都是带后端逻辑或重交互的 SPA。配图均为应用实际界面截图。

<ul class="cover-list" role="list">

<li class="cover-row">
<a class="cover-media" href="https://dashboard.ssbx.site/"><img src="/marginalia/assets/img/site/covers/bodhi-web.jpg" alt="BODHI 制片人预览板实际界面：左侧导航 + 镜次面板里一格格电影级镜头卡，每张标着选用 take 和单镜花费" loading="lazy"></a>
<div class="cover-body" markdown="1">
## BODHI 制片人预览板 (bodhi-web)

> 一个人用 AI 拍佛经故事电视剧，靠这块**只读制片台**把上千次零散生成拢成一部可追溯、可续跑的成片。不是数据库，直接读项目自己的账本。

13 个视图覆盖整条流水线：镜次面板（每镜的选用 take / 帧数 / 单镜成本 / 筛选）、角色库（锁定定妆 + 身份配色 + 跨集一致性）、场记一致性（逐场光线 / 在场人物 / 服化道，从账本回生）、预算（按 stage / 按集 / top 单镜）、运行日志（append-only `runs.jsonl`，每次生成的 prompt / 参考图 / 成本 / 产物 sha）、剧情分镜、活动时间线…… 这块板是 E01 恒伽达整集（17 分钟 / 122 镜 / 800+ 次生成）的真实快照。

→ [打开只读 dashboard](https://dashboard.ssbx.site/)（公开演示，完整一集）
→ [源代码 bodhi-pipeline](https://github.com/pyf-labrary/bodhi-pipeline)（MIT 开源：项目 CLI + 这块 dashboard）

技术栈：后端零重依赖——Python 标准库 + Pillow（缩略图），不接数据库、直接读 `runs.jsonl` / 状态账本；前端原生 JS + Tailwind。`export_static.py` 把跑着的只读板烘成一个纯静态站（强制只读、抹掉所有编辑入口、把查询端点烤成静态 JSON、只拷被 API 引用的媒体），nginx + certbot 托管，这个公开演示就是这么来的。

*上线时间：2026-06-21。*
</div>
</li>

<li class="cover-row">
<a class="cover-media" href="https://github.com/pyf-labrary/fanbox-web"><img src="/marginalia/assets/img/site/covers/fanbox-web.jpg" alt="翻箱 Web 版实际界面：左侧文件网格 + 底部内嵌终端正在跑命令" loading="lazy"></a>
<div class="cover-body" markdown="1">
## 翻箱 Web 版 (fork 花叔作品)

> **文件管理 × AI agent 终端**，一个浏览器标签页搞定。Fork 自花叔的 [FanBox](https://github.com/alchaincyf/fanbox)，把桌面版能力搬进浏览器：左边浏览/预览/编辑文件，右下角真终端里跑 Claude Code，agent 每改一个文件，对应卡片实时点亮。

本 fork 定位「服务端跑在 WSL，Windows 浏览器访问」——agent 原生跑 Linux，打开/定位文件自动交还 Windows 资源管理器。在上游之上做了三件事：**终端会话刷新不丢**（pty 断开后脱管保活 30 分钟 + 输出缓冲回放，跑一半的 Claude Code 不被刷新腰斩）、zip 预览中文文件名乱码修复（自解析 central directory + GBK 回退，反哺上游 #9）、透明图缩略图陈旧缓存击穿（上游 #1）。

→ [源代码](https://github.com/pyf-labrary/fanbox-web)（MIT 开源，fork 自 alchaincyf/fanbox）

技术栈：零依赖 Node 服务端（唯一原生依赖 node-pty 按「装得上就用」处理，装不上其余功能照常）+ 原生 JS 前端 + xterm.js；WebSocket TTY 透传、SSE 文件变化推送、OSC 7 目录跟随。`npm install --omit=dev && npm start` 即用。

*上线时间：2026-06-11。*
</div>
</li>

<li class="cover-row">
<a class="cover-media" href="https://tty.panyifeng.xyz/"><img src="/marginalia/assets/img/site/covers/claude-web-terminal.jpg" alt="Claude Web Terminal 实际界面：浏览器里的 Claude Code 多窗口会话" loading="lazy"></a>
<div class="cover-body" markdown="1">
## Claude Web Terminal

> 在浏览器里跑 **Claude Code**（或任意 shell）。服务端把伪终端（PTY）通过 WebSocket 桥到 xterm.js，Claude 的全交互 TUI——菜单、方向键选择、流式输出——和真终端一模一样。手机、平板、任何浏览器都能远程接管同一个会话。

多窗口分页，随手增删；每个窗口由 **tmux** 托管，所以关掉标签页、重启服务、甚至重启整台机器后，会话依然在跑，重新打开就接回原处。记常用工作目录、用户名密码登录（HTTP + WebSocket 双重 cookie 鉴权）、xterm 本地打包（不依赖 CDN，弱网/被墙也能开）。

→ [打开 Claude Web Terminal](https://tty.panyifeng.xyz/)（私人部署，需账号密码）
→ [源代码](https://github.com/pyf-labrary/claude-web-terminal)（MIT 开源）

技术栈：Node + node-pty + ws + express 后端，原生 JS + xterm.js 前端，tmux 做会话持久层；nginx 反代 + TLS + systemd 自启。开箱即用的 systemd unit 和 nginx 配置都在仓库 `deploy/`。
</div>
</li>

<li class="cover-row">
<a class="cover-media" href="https://eng.panyifeng.xyz/"><img src="/marginalia/assets/img/site/covers/english-interview.jpg" alt="English Interview Drill 实际界面" loading="lazy"></a>
<div class="cover-body" markdown="1">
## English Interview · Drill

英语口语面试训练器：抽题 → 对着麦克风说 → 实时转写 → AI 按面试官标准逐维度评分、给出改进版范答，还能和 AI 面试官多轮对练、观摩两个 AI 互相面试。全方位主题（自我介绍 / 行为面 / 系统设计 / 谈薪…），手机即开即用，为外企英面而生。

→ [打开 Interview Drill](https://eng.panyifeng.xyz/)（私人 demo，需带访问 token）
→ [源代码](https://github.com/pyf-labrary/english-interview)

技术栈：FastAPI 后端 + React/Tailwind 前端（预编译、全资源同域自托管）。LLM 走 DeepSeek V4，STT 以浏览器 Web Speech 实时转写为主、faster-whisper base.en 服务器兜底，TTS 走 Microsoft Edge Neural（英 / 印口音，对练模式双声线）。鉴权 + nginx 限流防白嫖。

*上线时间：2026-05-28；2026-06 加全方位主题 + 一键范答 + AI 对练观摩，前端改同域自托管。*
</div>
</li>

<li class="cover-row">
<a class="cover-media" href="https://pyf-labrary.github.io/cue/"><img src="/marginalia/assets/img/site/covers/cue.jpg" alt="Cue 影视配乐入门实际界面：情绪光谱" loading="lazy"></a>
<div class="cover-body" markdown="1">
## Cue · 影视配乐入门

> 给小白做导演的配乐速通课。**可听 > 可读**——每一个名词都能在一秒内播出来。

12 情绪光谱 + 20 件乐器图鉴（每件配 cinematic 肖像 + 真采样 + 影视范例）+ 5 部经典片段五轨拆解（Jaws / 卧虎藏龙 / Psycho / Interstellar / 教父）+ 入门 5 课 + 41 条术语手册 + 配乐试听台 Sandbox。

→ [打开 Cue](https://pyf-labrary.github.io/cue/)

技术栈：Vite + React + Tailwind + Tone.js + Howler。乐器采样来自 Philharmonia Orchestra Samples（CC-BY-NC）+ FluidR3_GM；场景 MX 真录音由 MiniMax music-1.5 生成；27 张视觉资产由 Dreamina 5.0 生成。

*上线时间：2026-05-12。*
</div>
</li>

</ul>
