---
layout: post
title: "Claude Max $100 套餐榨干指南（小白友好版）"
date: 2026-04-28 12:00:00 +0800
author: Marginalia
description: "理解 Claude Max 套餐的 token 计费本质：最大化 prompt cache 命中率、压低单次请求成本、把 5 小时与 7 天双时间窗口的额度榨干。Claude Code 实战经验整理。"
excerpt: "理解 Max 套餐的 token 计费本质，最大化 prompt cache 命中率，压低单次请求成本，把 5 小时 / 7 天双窗口的额度用满。"
tags: [claude, llm, token-economy, prompt-cache, claude-code]
keywords: "Claude Max, Claude Pro, prompt cache, token, LLM 计费, Claude Code, Anthropic"
cover: /assets/img/posts/2026-04-28-claude-max-token-guide/cover.jpg
---


> 目标：把 Max $100/月套餐的"请求次数"和"token 量"两方面用到极限。
> 阅读对象：刚开始用 Claude Code、对 LLM 计费机制不熟悉的用户。
> 最后更新：2026-04-28。

---

## 0. 先理解：你的额度到底是什么？

很多人以为 "Max $100 = 每月多少次请求"。**错。**

### 0.1 LLM 是按 token 计费的

- **token 是模型看世界的最小单位**。一个英文单词约 1.3 token，一个汉字约 1–2 token。一段 1000 字中文 ≈ 1500 token。
- 每次你和 Claude 对话，它都会把**整个会话历史 + 系统提示 + 你新说的话**全部当成"输入 token"重新读一遍，然后生成"输出 token"作为回复。
- Anthropic 对 Opus 4.7 的官方价：**输入 $5 / 百万 token，输出 $25 / 百万 token**。这是地板价，所有产品在这个价位上加价或打包。

### 0.2 Max $100 套餐的本质

不是"无限用"，而是**"按 token 折算的额度，分两个时间窗口结算"**：

- **5 小时滚动窗口**：从你第一次发消息开始计时，5 小时内能用的 token 量有上限。Max $100 大约是 Pro 的 5 倍。
- **周窗口**：再叠一层 7 天总量上限，防止你 5h 满血连续刷。
- 触顶后两种选择：等窗口刷新，或开 `/extra-usage` 自动按 API 原价续费。

**关键理解**：你浪费的不是"次数"，是 token。一次塞满 1M context 的请求 ≈ 几十次小请求的额度。所以**省 token = 省额度 = 多干活**。

---

## 1. 最大化"请求次数"——压低单次成本

### 1.1 让 prompt cache 真正命中（最重要的一条）

#### 技术原理

LLM 推理时，每个 token 都要和**前面所有 token**做注意力计算，越长的 context 越贵越慢。Anthropic 发现：很多对话的开头部分（system prompt、CLAUDE.md、项目说明）是反复出现的，每次重算太浪费。

于是他们做了 **prompt cache**：

1. 你第一次发请求时，Anthropic 把对话**前缀**（从开头开始连续的一段）算完后，把中间结果（KV cache，模型内部状态）存到服务器上，打个指纹。
2. 下次你再发请求，如果**前缀完全一致**，直接复用上次的中间结果，不用重算。
3. 命中部分的计费：**只收原价的 0.1×**（即 1/10 价）。
4. 默认 cache 存活 5 分钟（5min TTL），写入要付 1.25× 的"建表费"；1 小时版本写入 2×，但适合长任务。

**关键限制**：cache 是**前缀匹配**。只要前面有一个 token 变了，后面所有 cache 全失效，得从变动点之后重算。

#### 操作建议

- **同一个会话连续干活，别频繁 `/clear`**。`/clear` 会把整个对话历史清空，下一条消息等于从零建 cache，等于把前面所有 cache 钱白扔了。
- **不要中途改 CLAUDE.md / system prompt / 早期消息**。这些都在前缀里，改了 = 后面全失效。
  - 把**稳定内容**（项目结构、规范、常用命令）放 CLAUDE.md 顶部。
  - 把**易变内容**（当前任务描述、临时笔记）放对话末尾或单独说。
- **同一个文件让 Claude 反复 Read 没关系**——它读过一次后，文件内容就在 context 里了，第二次读会 cache 命中，几乎免费。
- 长会话越用越省，因为前缀越长、cache 占比越大。

### 1.2 选对模型档位（省 3–5×）

#### 技术原理

Anthropic 一个家族里有多个模型：
- **Opus 4.7**：最聪明，最贵（$5/$25 per M token）。适合规划、复杂重构、难 debug。
- **Sonnet 4.6**：聪明 80%，价格 1/5（$3/$15 per M token）。适合执行类任务。
- **Haiku 4.5**：够用，价格 1/25 左右（$1/$5）。适合格式化、简单脚本、命令解释。

模型差距主要在**多步推理深度**。你让它"把这个函数改成异步"，Sonnet 完全够；你让它"重新设计这个模块的并发模型"，才需要 Opus。

#### 操作建议

- 在 Claude Code 里 `/model sonnet` 或 `/model haiku` 切换。
- **经典省钱组合：Opus 规划 + Sonnet 执行**。
  - 按 `Shift+Tab` 两次进入 **Plan Mode**，让 Opus 出方案。
  - 方案确认后切 Sonnet 执行。同一个会话内 cache 还在，无缝衔接。
- 如果你发现自己每天都顶 5h 上限：八成在用 Opus 干 Sonnet 该干的活。

### 1.3 用 subagent 隔离上下文（保护主对话 cache）

#### 技术原理

Subagent 是"开一个独立子对话"。它有自己的 context、自己的工具调用，完事后**只把摘要返回**给主对话。

为什么省钱？
- 探索类任务（"找出所有调用 X 的地方"）要读几十个文件，主对话如果亲自读，context 立刻被几万行代码污染，**后续每条消息都要重读这堆垃圾**，每次都按现价算（cache 命中部分变少）。
- 让 subagent 去读，主对话只收到 200 字摘要。主对话 context 干净，cache 持续命中。

#### 操作建议

- 探索代码库 → 用内置的 `Explore` subagent。
- 复杂规划 → 用 `Plan` subagent。
- 代码审查 → 用 `code-reviewer` subagent。
- 在 Claude Code 里直接说"用 Explore agent 找一下 ..."，或它会自动调度。

### 1.4 `/compact` 而不是 `/clear`

#### 技术原理

- **`/clear`**：把对话历史完全清空，从零开始。下一条消息发出去是空 cache，要重新建（贵）。
- **`/compact`**：让 Claude 把长对话压缩成一段**摘要**保留下来，然后基于摘要继续。Claude Code 会把摘要作为新前缀重建 cache，但保留了关键决策、已读文件、当前进度。

何时该用：
- 接近 context 上限（200k 或 1M）时，必须二选一。
- 任务还没完成 → `/compact`。
- 任务已结束、要换全新任务 → `/clear`。

---

## 2. 最大化"token 量"——把 1M 上下文用满

Max 套餐的最大红利：**Opus 4.7 默认 1M context，200k 以上不加价**。这是 API 直连都享受不到的福利（API 上 1M 是企业版才默认）。

### 2.1 一次喂够上下文，别来回追问

#### 技术原理

每次发消息，模型都要重读整个会话。你做对比：

- **方案 A**：5 轮对话，每轮喂 1 个文件 + 提问 → 5 次推理，每次都带前 N 轮历史。token 总量 ≈ 1+2+3+4+5 = 15 份文件。
- **方案 B**：1 轮对话，喂 5 个文件 + 完整任务 → 1 次推理，token ≈ 5 份文件。

哪怕考虑 cache，方案 B 也明显便宜（少 60% token），而且**结果更好**——模型一次看到全貌比逐步喂更容易抓到关联。

#### 操作建议

- 任务开始前花 30 秒想清楚："这个任务需要它看哪些文件？"，一次性让它 Read 全。
- 让 Claude 自主探索（用 Bash/Grep/Read 工具）比你手动复制粘贴片段更省——它的工具调用走 cache，你的人工粘贴是全新 input token。
- 任务描述要完整：背景、目标、约束、不要做什么，一次说清。

### 2.2 善用 1 小时长 cache

#### 技术原理

默认 cache 是 5 分钟 TTL，超时就失效。如果你的任务持续超过 5 分钟（Claude 在思考、跑测试、读大文件），cache 会过期，下一条消息又得重建。

**1 小时 cache** 的交易：写入收 2× 钱（贵 60%），但保 1 小时。
- 短任务：5min cache 划算。
- 长任务（>10 分钟、跨多个回合）：1h cache 净赚——一次贵的写入，换十几次 0.1× 读取。

#### 操作建议

- Claude Code 在 Max 套餐下会**自动判断**是否升级到 1h cache，你一般不用管。
- 如果你自己用 API 写脚本，手动设 `cache_control: {type: "ephemeral", ttl: "1h"}`。

### 2.3 避开 token 浪费的几个坑

#### 坑 1：让它读巨型 lock 文件 / dist / node_modules

`package-lock.json` 动辄几万行，读一次几十万 token，cache 也救不了——因为你只读这一次。

**对策**：
- 项目根目录建 `.claudeignore`，列出要跳过的路径：
  ```
  node_modules/
  dist/
  build/
  *.lock
  *.log
  .next/
  ```
- CLAUDE.md 里也写一句"不要读 X 目录"。

#### 坑 2：截图比文字贵

#### 技术原理
图片在模型里被切成"图块 token"，一张普通截图 ≈ 1500–2000 token，相当于上千字英文。

**对策**：能用文字描述清楚的就别贴图。报错信息、代码、配置都是文字，别截图。

#### 坑 3：原始 `git diff` / 大日志直接塞

几千行 diff 几万 token 起步。

**对策**：
- 先 `git diff --stat` 看哪些文件变了。
- 再针对性看具体文件：`git diff src/foo.ts`。
- 大日志先 `tail -100` 或 `grep ERROR` 过滤。

#### 坑 4：让 Opus 来回 lint / typecheck

每次让它"再跑一下 tsc 看看"都是新 token。

**对策**：用 **hooks**（在 Claude Code `settings.json` 里配）。
```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write", "command": "npm run typecheck" }
    ]
  }
}
```
每次 Edit/Write 后自动跑 typecheck，结果直接喂回 Claude，无需你提示。

---

## 3. 配额监控与节奏

### 3.1 看准你在哪个窗口

- `/status` 查当前 5h 窗口剩余 + 周限额剩余。
- **5h 窗口从你第一次请求时启动**，不是整点对齐。比如你 09:30 发第一条，窗口到 14:30。
- `/cost` 看当前会话烧了多少 token + 等价美元。校准直觉用。

### 3.2 排期策略

#### 5h 窗口内
- **一个连续大任务 + cache 持续命中** > 5 个独立小任务。
- 上午 plan、下午 execute 是两个独立窗口、两次冷 cache 起步，不如一气呵成。
- 想休息：让 Claude 在 5h 窗口结束前完成阶段性产出，写到文件或 CLAUDE.md，下个窗口让它自己 Read 续上。

#### 周窗口内
- 周一前几个窗口做 Opus 硬活（规划、架构、难 bug）。
- 周中后段切 Sonnet 续命。
- 用 `/extra-usage set-limit` 设上限（比如 $50/月），防失控。

### 3.3 红线指标（超过说明你在亏）

| 现象 | 含义 | 对策 |
|---|---|---|
| 每天都顶 5h 上限 | 在用 Opus 干 Sonnet 的活 | 切档；区分规划 vs 执行 |
| Opus 重读同样代码 >3 次 | cache 没命中 | 检查是否中途 `/clear` 或改了 CLAUDE.md |
| `/extra-usage` 月超 $50 | 用量已超 Max $100 价值 | 升 Max $200 更划算 |
| 一次任务 >30 万 token 还没出结果 | Claude 在打转 | 停掉，重新拆解任务 |

---

## 4. Claude Code 必配清单

按这个顺序配置一次，长期受益：

### 4.1 CLAUDE.md（项目根目录）

每次启动 Claude Code 自动加载，进 cache。范例：

```markdown
# 项目说明
这是一个 React + Node.js 全栈应用，TypeScript。

# 目录结构
- src/client: 前端
- src/server: 后端
- src/shared: 共享类型

# 常用命令
- 开发: pnpm dev
- 测试: pnpm test
- 构建: pnpm build

# 不要碰
- node_modules/, dist/, *.lock
- src/legacy/ (废弃代码)

# 风格
- 优先编辑现有文件，不要新建
- 不写注释除非有非显然的 why
```

### 4.2 .claudeignore（项目根目录）

```
node_modules/
dist/
build/
.next/
*.lock
*.log
*.min.js
coverage/
```

### 4.3 自定义 subagents（`.claude/agents/` 目录）

为高频任务建专属 agent，复用时省 cache。

### 4.4 Hooks（`.claude/settings.json`）

自动化重复检查，省 token 又快。

### 4.5 命令速查

| 命令 | 用途 |
|---|---|
| `/model opus` / `sonnet` / `haiku` | 切模型 |
| `/status` | 看配额剩余 |
| `/cost` | 看本会话消费 |
| `/compact` | 压缩对话保留摘要 |
| `/clear` | 全清（慎用） |
| `/agents` | 管理 subagent |
| `/extra-usage` | 配置超额自动续费 |
| `Shift+Tab` ×2 | 进 Plan Mode |

---

## 5. TL;DR——三条最高 ROI 的动作

如果你只看这一节：

1. **保持长会话 + 稳定 CLAUDE.md**
   让 prompt cache 持续命中。理论上能省 10×。前提：别频繁 `/clear`，别中途改顶部内容。

2. **Opus 规划 / Sonnet 执行**
   规划用 Opus（Plan Mode），执行切 Sonnet。能省 3–5×，效果不打折。

3. **一次喂够上下文**
   任务开始时把所有相关文件、完整需求一次说清，让 Claude 自己探索代码库。比来回追问省 2–3× token，结果还更好。

---

## 附录：核心数字速记

| 项 | 数值 |
|---|---|
| Opus 4.7 输入 | $5 / 百万 token |
| Opus 4.7 输出 | $25 / 百万 token |
| Sonnet 4.6 输入/输出 | $3 / $15 per M |
| Cache 写入（5min） | 1.25× 输入价 |
| Cache 写入（1h） | 2× 输入价 |
| Cache 命中读 | 0.1× 输入价（**省 90%**）|
| Max $100 配额折算 | ≈ Pro $20 的 5 倍 |
| Max 套餐 Opus context | 默认 1M，200k 以上无溢价 |
| 5h 窗口 | 从首条消息计时 |
| 1 张截图 | ≈ 1500–2000 token |
| 1000 字中文 | ≈ 1500 token |
