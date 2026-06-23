---
layout: "post"
title: "Claude Code 信息架构进阶教程：从中级到大师"
category: "Claude · LLM"
date: "2026-05-07 12:00:00 +0800"
author: "Marginalia"
description: "基于第一性原理的 Claude Code 信息架构进阶教程：八层注入模型、memory 写作模板、四棵决策树、反模式速查与沉淀循环。从中级到大师水平。"
excerpt: "基于第一性原理的 Claude Code 信息架构进阶教程：八层注入模型、memory 写作模板、四棵决策树、反模式速查与沉淀循环。从中级到大师水平。"
tags: [claude-code, workflow, memory, context-engineering]
keywords: "Claude Code, CLAUDE.md, memory, hooks, skills, subagents, context engineering, prompt cache"
cover: /assets/img/posts/2026-05-07-claude-code-context-and-memory-mastery/cover.jpg
---

> 一份基于第一性原理推导的 Claude Code 信息组织指南。讲清楚 memory、CLAUDE.md、hooks、skills、subagents 各自存在的物理理由，以及怎样在它们之间分配信息，才能让 agent 在长期、多项目、跨会话场景下保持高密度可用、低噪声。

## 阅读顺序

- §1–§3：第一性原理与基本约束（中级必读）
- §4–§7：八层信息架构与每一层的写作守则（中-高级）
- §8–§10：决策框架与反模式（高级）
- §11–§13：大师级模式与实战 case studies

---

## §1 · 一切的起点：Claude Code 是什么

把 Claude Code 剥到只剩骨头，它是三件东西：

1. **一个 LLM**：单次推理时，只能看见当前 prompt 里的内容。它不"知道"任何运行时之外的状态。
2. **一组工具（tools）**：Read/Edit/Bash/Agent/... 让它在每一轮里跟外界交换有限信息。
3. **一套上下文注入规则（context plumbing）**：决定每一次推理开始前，prompt 里都被塞进了什么。

90% 的"使用 Claude Code 进阶问题"——其实是第 3 件事的工程问题：**什么时候、把什么信息、放到哪一层、用什么机制注入**。memory、CLAUDE.md、hooks、skills、subagents 都只是这套注入规则的不同表现形式。

理解这一点，你会发现"该把规则写进 memory 还是 CLAUDE.md"这种问题不再是品味之争，而是有 deterministic 答案的。

## §2 · 五条物理约束（first-principle constraints）

所有进阶技巧都是这五条约束的衍生物。

### 约束 A — 上下文是稀缺资源

模型每次推理读的 prompt 有上限（在你这台 Sonnet 4.6 上是 200K，Opus 4.7 1M context 也是有限）。**每个 token 都要：**

- 占用窗口预算（挤掉其他可能更重要的内容）
- 增加推理成本（钱 + 延时）
- 引入潜在干扰（注意力被分散）

注意：**总 token 数不是唯一指标**，"信息密度"才是。1000 行重复废话比 200 行核心契约伤害更大，因为前者既挤掉空间又稀释关注度。

### 约束 B — 信息只在被注入 prompt 时才"存在"

这条比看上去深刻得多。

- 你硬盘上有一份完美的架构文档？除非它出现在 prompt 里，否则 LLM 看不见。
- 你上周和它说过"不要 mock 数据库"？除非这次被记录回 prompt，否则它不知道。
- 你有一个 `~/.minimax.env` 文件？除非有什么机制把"它存在 + 路径 + 用途"注入进来，否则 agent 不会找。

工程意义：**所有"agent 应该记住的事"都得有一条注入路径**。要么自动加载（CLAUDE.md / MEMORY.md 索引 / settings），要么用户当场提（@file / slash），要么 hook 主动塞（system reminder）。**没有路径 = 不存在。**

### 约束 C — 信息的"召回成本 vs 失效成本 vs 噪声成本"三角

每条信息的归属要权衡三种成本：

| 成本 | 含义 | 谁付 |
|---|---|---|
| **召回成本** | 这条信息没自动出现，下次得重新提供/解释 | 你（每次重复） |
| **失效成本** | 信息陈旧、与现实不符，agent 据此做了错事 | 你（事后清理） |
| **噪声成本** | 当前任务用不到，但占了上下文 / 让模型分心 | 每次推理（多花钱、做错） |

不同信息的衰减率不同：

- "我是 Go 工程师" — 几乎不衰减 → 适合长期 memory
- "本季度优先重构 auth 模块" — 一两个月衰减 → 短期 memory，要标日期
- "今天调试这个 bug 试过哪些方案" — 单次会话即衰减 → task list / 对话本身，**绝不**进 memory
- "这个 repo 的部署命令是 `make deploy`" — 跟代码同寿 → CLAUDE.md
- "禁止在 prod 分支强推" — 永久且 deterministic → settings permissions / hook

**衰减越慢、跨会话越频繁用 → 越靠"内层"（settings / CLAUDE.md / memory）。衰减越快、单次性 → 越靠"外层"（plan / task / 对话）。**

### 约束 D — Deterministic 行为不能靠 prompt 实现

LLM 是概率系统。如果你需要的是"**每次** commit 前 **必定** 跑 lint""**绝不** 让 agent 碰 .env"——这种 deterministic 保证，必须放在 LLM 之外的执行层（hooks / permissions），而不是写在 memory / CLAUDE.md 里。

写在文档里的规则会被遵守 99%，但是 agent 长跑场景下的 1% 偏差会累积。Hook 是 0% 偏差。

### 约束 E — Prompt cache 与稳定性

Anthropic 的 prompt cache 有 5 分钟 TTL（这台机器具体值见 ScheduleWakeup 文档）。命中 cache 的 token 便宜 90%、延时低。

工程意义：

- **CLAUDE.md / MEMORY.md 这种"每次会话都加载"的内容应保持稳定**，频繁改动会击穿 cache。
- 单次会话内反复跑工具时，文件内容尽量不要在调用之间被改写——否则后续推理 cache miss。
- 把不稳定的内容（比如临时调试日志）放到对话尾部，而不是 system / 文档区。

## §3 · 信息的四种本体（ontology）

掌握了约束，再看不同信息的"本体类型"。这决定它该用哪个机制承载。

| 本体 | 特征 | 例子 | 该放哪 |
|---|---|---|---|
| **可执行规则**（policy） | deterministic，"做/不做" | "禁止 force push"、"commit 前 lint" | hooks / permissions |
| **项目知识**（domain） | 与代码同寿，多人共享 | 架构、契约、命令 | CLAUDE.md（项目内） |
| **个人状态**（preference + history） | 跨会话、个人化 | 用户身份、习惯、纠正历史 | auto-memory |
| **会话产物**（artifact） | 单次任务的中间物 | task list、调研笔记、plan | task / 对话 / fork |

很多新手把这四类混着塞 memory，导致 memory 又长又乱、可信度衰减。**先分清本体，再选机制**。

---

## §4 · 八层信息架构

把 Claude Code 的注入层按"距离 prompt 由近到远 / 自动化由强到弱"展开成八层。每层都有：触发时机、生命周期、写什么、不写什么、典型反模式。

```
┌─ L0  模型权重（训练知识）
├─ L1  system prompt（harness 写的，不可改）
├─ L2  settings.json + hooks（可执行规则层）
├─ L3  项目 CLAUDE.md（项目知识）
├─ L4  用户级 CLAUDE.md（跨项目偏好）
├─ L5  Auto-memory（跨会话个人状态）
├─ L6  Skills + Subagents（按需注入工作流）
├─ L7  当前会话（plan / task / 工具结果 / 对话）
└─ L8  即时引用（@file / slash / 用户当场粘贴）
```

### L0 · 模型权重

**有什么**：截止 knowledge cutoff（这台 Sonnet 4.6 是 2025-08）的世界知识、编程语言、库的用法。
**进阶要点**：不要把"通用编程常识"写进 CLAUDE.md/memory（噪声），但要写"我们这个 repo 不要按你训练时的常识来"的反例。

### L1 · System prompt

**有什么**：harness 注入的工具说明、当前工作目录、平台、日期、agent 行为规范。
**生命周期**：每次会话启动注入，全程 stable。
**进阶要点**：你改不了它，但你能感知到它的边界——比如它已经规定"不要主动 commit"，你就别在 CLAUDE.md 重写一遍（噪声 + 可能冲突）。

### L2 · settings.json + hooks（可执行规则层）

#### 文件位置（按优先级由低到高）

```
~/.claude/settings.json                # 用户全局
<repo>/.claude/settings.json            # 项目共享（入版本库）
<repo>/.claude/settings.local.json      # 项目个人（不入库，gitignore）
<企业管理> managed settings              # 强制（最高优先）
```

后者覆盖前者。**不要把 `settings.local.json` 提交到 git**——里面常含个人 token 路径或允许列表。

#### Hooks 的事件模型

Claude Code 的 hooks 在生命周期事件上挂 shell 命令，输出会作为 system message 注入进 LLM 上下文。常见事件：

| 事件 | 时机 | 典型用途 |
|---|---|---|
| `SessionStart` | 会话起始 | 注入项目状态摘要、git 当前分支 |
| `UserPromptSubmit` | 用户消息提交后、推理前 | 拦敏感词、注入额外上下文 |
| `PreToolUse` | 工具调用前 | 拦截危险命令、补 plan |
| `PostToolUse` | 工具返回后 | 自动 lint、压缩输出、统计 |
| `Stop` / `SubagentStop` | 主/子 agent 完成 | 自动备份、发通知 |
| `Notification` | harness 通知 | 接管"等待用户"提示 |

**最常被错用的设计**：把 deterministic 规则写成"教 agent 记住"。例：

> ❌ memory 写：[feedback] 不要用 `npm install`，本 repo 用 `pnpm`

写一年也防不住偶尔翻车。正确做法：

> ✅ project settings.json `permissions.deny`: `["Bash(npm install*)"]`
> ✅ 同时项目 CLAUDE.md 一行说明（解释为何 deny，避免 agent 困惑）

deny 列表是 deterministic 的物理拦截；CLAUDE.md 的一行只是为了让 agent 在被拦时立刻理解"哦，应该用 pnpm"。两者协作，缺一不可。

#### Permissions 的作用域

```
permissions:
  allow: [...]
  deny:  [...]
  ask:   [...]
```

许多人只用 allow 来减少 prompt（典型场景：`/fewer-permission-prompts` 这个 skill 帮你做这件事），但 **deny + ask 用得好可以构造"安全护栏"**：

- `deny`: 永远不允许（破坏性命令、敏感目录）
- `ask`: 可以做但每次都要批准（git push、send message）
- `allow`: 不弹窗

进阶模式：把同一类工具按子模式分级。例如允许只读 git，但 push 要 ask：

```
permissions:
  allow: ["Bash(git status)", "Bash(git diff*)", "Bash(git log*)"]
  ask:   ["Bash(git push*)", "Bash(git commit*)"]
  deny:  ["Bash(git push --force*)", "Bash(git reset --hard*)"]
```

### L3 · 项目 CLAUDE.md

**触发**：当 cwd 进入该 repo（或它的子目录）时，自动加载到 system context。
**生命周期**：跟代码同 git 历史。
**写什么**：

- 项目地图（多模块仓库尤其关键，单纯 ls 无法体现哪是核心）
- 跨模块契约 / 数据流（"`A` 写入 X，`B` 读取 X，schema 在 Z"）
- 非显然的命令（不是 `npm test` 这种从 package.json 能猜出来的，而是"测单文件用 `npx vitest run path/to.test.ts -t name`"）
- 不要做的事（容易踩的坑、已经废弃的路径）
- 当前长期目标（如果存在；项目 vision 帮 agent 做权衡）

**不写什么**：

- README 已写过的内容（重复）
- 通用最佳实践（"提供有意义的错误信息"——所有项目都该这样）
- 文件清单（可发现的）
- 会高频变化的状态（PR 进度、本周计划——这是 task / project-memory 的事）

#### 子目录 CLAUDE.md（progressive disclosure）

monorepo 或多项目 workspace 中，根 CLAUDE.md 应该是"地图 + 公共契约"，每个子目录可以有自己的 CLAUDE.md，**只在工作进入该目录时才加载**。

为什么：上下文是稀缺资源（约束 A）。如果你 30 个子项目的所有细节都灌在根 CLAUDE.md，那么修一个 typo 也得带着 5000 行的工作区描述推理。

```
~/claw/CLAUDE.md                  # 工作区索引（轻量，~150 行）
~/claw/marginalia/CLAUDE.md        # Jekyll 站点细节
~/claw/tv/CLAUDE.md                # AI 短剧流水线细节
~/claw/lotus-academy-design/CLAUDE.md  # 全栈应用细节
```

#### `@import` 语法

CLAUDE.md 支持 `@path/to/file.md` 引用其他文档，加载时会展开（一定深度内）。用途：

- 把超长的契约说明拆出去：`@docs/architecture.md`
- 团队共享 + 个人覆盖：项目 CLAUDE.md `@~/.claude/my-team-conventions.md`
- 多 repo 共享一份"风格指南"

**陷阱**：被 import 的文件也吃 token；展开后总长还是有上限，别把整个 docs/ 都拉进来。

### L4 · 用户级 CLAUDE.md（`~/.claude/CLAUDE.md`）

**触发**：所有 Claude Code 会话都加载（无论 cwd）。
**写什么**：

- "我是谁、我的整体技术风格"（覆盖所有项目）
- 跨项目都成立的偏好（语言、回复长度、commit 风格）

**注意**：**不要把这里当 memory 用**。memory 系统比这里精细（分类型、有名字、能 grep）。这里只放"整体性、低频变化"的偏好，写成 1-2 段散文最佳。

### L5 · Auto-memory（跨会话个人状态）

详见 §5 专章。这里只点位置：

```
~/.claude/projects/<encoded-cwd>/memory/
├── MEMORY.md                # 索引（每会话载入，≤200 行被截）
├── user_*.md                # user 类型
├── feedback_*.md             # feedback 类型
├── project_*.md              # project 类型
└── reference_*.md            # reference 类型
```

注意 memory 是 **per-cwd** 的（每个工作目录有独立 memory 目录）。这意味着你在 `~/claw` 下积累的 memory 不会被 `~/some-other-repo` 看到——这是 feature 不是 bug：避免跨项目偏好串味。

如果你确实有跨所有 cwd 的偏好，写到 `~/.claude/CLAUDE.md`（L4），不要复制到每个 memory 目录。

### L6 · Skills + Subagents（按需注入工作流）

#### Skills

`~/.claude/skills/<name>/SKILL.md`（也可以从 plugin marketplace 安装）。每个 skill 在会话启动时被列在 system reminder 里（**只列名 + 描述**，不展开 body）；当用户输入 `/<name>` 或 trigger 命中时才注入完整 body 并执行。

为什么这设计：约束 A（稀缺）。如果 50 个 skill 的全文都加载，token 就崩了。所以 skill 是 "lazy load"：先暴露名字让 agent 知道存在，按需展开。

**写 skill 的核心要点**：

- description 必须写得让"agent 一眼就知道何时该用"。"Use to do X-ish things" 太空。"Use when user asks about X / when file matches Y" 才有用。
- body 写"做这件事的标准动作 + 资源指针"，不要写理论。
- 资源（脚本、模板、配置）放 skill 目录里，body 用相对路径引用。
- 如果 skill 涉及调用其他工具，trigger 条件描述要包含"什么时候**不该**用"——避免误触。

#### Subagents

`~/.claude/agents/<name>.md` 或内置（claude-code-guide / Plan / Explore / general-purpose）。每个 subagent 是一个**独立上下文**的 LLM 实例：

- 自己的 system prompt
- 自己的工具集（可限定）
- 与主对话**不共享**上下文（除非通过 fork，见 §11）

为什么要 subagent：约束 A 又出现了。一个 5 分钟的"读 30 个文件找 X 在哪定义"，会把 30 个文件原文塞进上下文。让 subagent 去做、只回收一段总结，主对话省了 30 个文件的 noise。

**Subagent 的"代价"**：

- 它**不知道**你和主对话之间的所有约定（除非 prompt 里写）
- 第一次调用要付 prompt cache miss
- 它的 working memory 不持久（一次结束就没了）

所以判断"派 subagent 还是自己干"，看：

- 输出能否被压缩成几句话？能 → subagent
- 任务能否独立定义、不依赖大量隐含上下文？能 → subagent
- 耗时长且我想边干边聊？能 → fork（带上下文的 subagent）

### L7 · 当前会话（plan / task / 工具结果 / 对话）

**生命周期**：单次会话。会话结束（关闭终端 / 上下文压缩）就丢失。
**写什么**：

- 当前任务的 plan（用 Plan 工具锁定方案）
- task list（用 TaskCreate；分步进度跟踪）
- 工具调用的中间结果

**最常见错误**：把"本次任务的进度"写进 memory。**不要**。memory 是给"未来会话"看的，写一次性进度只会让未来会话困惑（"这个任务做完了吗？"）。

### L8 · 即时引用（用户当场注入）

`@file.md`、`@image.png`、`/skill`、用户粘贴的代码段。

为什么这层重要：它是**用户对 agent 的精确手术工具**。当你发现 agent 缺某条信息，最快的修复不是改 CLAUDE.md，而是当场 `@`。改 CLAUDE.md 是"把这条修复变成永久"——只在你判断它会反复用到时才升级。

---

## §5 · Memory 系统深度解剖

memory 是 Claude Code 中最容易被错用的层。一旦掌握，它的 ROI 也最高。

### 5.1 为什么是四种类型

`user / feedback / project / reference` 不是随手起的。这四类对应**不同的"写入触发"和"读取触发"**：

| 类型 | 写入触发 | 读取触发 | 衰减率 |
|---|---|---|---|
| user | 学到用户身份 / 角色 / 知识 | 几乎每次（用户身份与所有任务相关） | 极低 |
| feedback | 被纠正 / 被确认 | 类似情境再次出现 | 低-中 |
| project | 学到工作内容 / 目标 / 时间表 | 工作话题相关 | 中-高（项目更迭快） |
| reference | 学到外部资源位置 | 用户提到外部系统 | 低（除非资源本身搬走） |

**含义**：写 memory 时先问自己"这条**为什么**未来会用到、**什么情境**会用到"。如果情境模糊，那条 memory 多半价值低。

### 5.2 索引文件（MEMORY.md）的设计哲学

MEMORY.md 不是 memory 本身，是**给未来会话的"目录页"**。每条索引行的目标是：让未来会话扫一眼就能判断"这条与当前任务相关吗"。

✅ 好索引行：
```
- [GitHub 操作规则](feedback_github_ops.md) — force-push 需批准；其他 GH 动作在 gittee-coder 上预授权
```

❌ 差索引行：
```
- [GH](gh.md) — github stuff
```

差在哪：差的版本即使读了也得点开文件才能判断相关性，浪费一次"判断成本"。

**索引行模板**：`- [短标题](文件名) — 一句具体钩子（who/what/why）`。

200 行截断不是 nice-to-have：超过这个数 LLM 真的看不到后面的条目。所以维护 MEMORY.md 时永远把最重要的、最跨任务的条目放上面。

### 5.3 单条 memory 的写作模板

#### user 类型：直接陈述事实
```markdown
---
name: User profile — pyf
description: Who pyf is, communication style (terse Chinese), autonomy stance
type: user
---

pyf is the operator. Roles: [...]. Communication: terse, Chinese-preferred.
Autonomy preference: act, don't propose-and-wait — only confirm for irreversible actions.
```

#### feedback 类型：规则 + Why + How to apply（强制三段式）

```markdown
---
name: Visual design quality bar
description: Never ship default themes/templates; design quality is mandatory
type: feedback
---

不要使用默认主题、模板或框架自带的样式直接交付。

**Why:** 用户在多次评审中明确指出"看起来像随手套模板"，要求把视觉作为一等输出。
默认样式没有差异化、传达不了项目意图。

**How to apply:** 凡是会被用户看到的产出（站点、报告、PPT、视频），都必须经过
独立的视觉决策（配色、排版、信息层次）。即便是内部草稿，初稿也要超出"模板感"。
```

为什么强制 Why + How：约束 C（噪声成本）的反面——一条 memory 在未来情境里可能"看起来相关但实际不该套用"。Why 让 agent 判断**这次是不是真的同情境**；How 让 agent 知道**怎样落地这条规则**。少了任一项，memory 在边缘情境下要么过度套用（生硬）要么不套用（白记）。

#### project 类型：事实 + Why + How to apply

```markdown
---
name: 周更视频迁 B 站
description: 2026-05 起视频走 B 站托管，Marginalia 嵌 iframe
type: project
---

每周一发的 AI 周报视频，从 marginalia repo 直接托管改为上传 B 站后嵌 iframe。

**Why:** Pages 仓库容量/流量受限，单期 mp4 ≥ 10MB 撞墙。
2026-05-05 之后所有新视频都按这个流程走。

**How to apply:** 用 `marginalia/scripts/publish-video.py --upload`，
脚本会把 BV id 写回 _videos/<slug>.md（`bvid:` 字段，去掉 `video:`）。
```

#### reference 类型：where + 用途

```markdown
---
name: MiniMax 开放平台
description: 按量 key + 端点 + 模型单价
type: reference
---

`~/.minimax.env` — 按量 API key
`api.minimaxi.com` — 唯一端点
模型与单价（2026-05 现状）：
  - speech-2.6-hd: ¥0.432/千字符
  - MiniMax-Hailuo-02 768P 6s: ¥1.944/条
**注意**：无公开账单查询 API，需要去 web 后台对账。
```

### 5.4 写入触发（什么时候保存）

#### 强信号（必须立即保存）

- 用户**纠正**了一个判断："不要 X，我们用 Y"
- 用户**默许**了一个非显然选择（agent 选了 A，用户没异议——这是认证的判断）
- 用户告诉了你新的环境信息（新 key、新服务器、新组织账号）
- 用户告知了项目的时间节点 / 决策原因
- 用户解释了一个奇怪 workaround 的理由

#### 弱信号（克制）

- 你"觉得"将来可能有用——多半不会
- 当前对话的中间结论——不要存，存了也是噪声
- 代码变更——git log 是 source of truth

#### 反信号（绝不保存）

- 一次性 task 的进度
- 你刚 ToolSearch 出来的工具列表
- 用户让你 grep 的结果
- 流水线日志、API 响应原文
- 任何能从 git/grep/ls 重新得到的信息

### 5.5 读取触发与"信任但验证"

memory 可以快速给出答案，但 **memory 是过去某时刻的快照**。一条 memory 提到的文件可能已被改名、删除；提到的 API key 可能轮换；提到的服务可能停了。

所以高级用法：

1. **用户在询问历史/状态** → memory 直接回答（"上次你说 X 是这样配的"）
2. **用户准备**基于 memory 行动** → 先验证再行动**

例：用户说"按之前那个流程发布报告"。
→ memory 说用 `scripts/publish.py`。
→ **不要**直接跑 `scripts/publish.py path/to.md`。
→ **先**：`ls scripts/publish.py` 确认存在 + 快速 head 一眼参数没变 → 再跑。

成本仅一次 ls + read，省掉的是"按陈旧记忆办错事的回滚成本"。

### 5.6 "对称记录"原则

新手只在被纠正时记 feedback，结果：

- agent 知道"不要做 X"
- agent 不知道"上次你认可的做法是 Y"

下次遇到类似情境，agent 会过度保守——再次询问、再次提议、再次浪费一次确认。

**修正**：用户**默许**了一个判断 = 同样要写 memory。例：

> agent 选择"把 4 个独立 PR 合并成 1 个" → 用户没异议直接接受 → 写一条 feedback：
> "对此类重构，用户偏好单 PR 而非拆分。**Why:** 用户在 [日期] 的此选择中默许了此判断。**How to apply:** 类似情境下默认走单 PR，除非有 reviewer 容量考虑。"

对称记录是把 memory 从"防错系统"升级到"判断辅助系统"的关键。

### 5.7 维护：去重、衰减、stale 检测

memory 数量到 10+ 后会出现：

1. **同主题分散**：A 文件 + B 文件都讲 GitHub 操作。**修**：合并到一个，更新索引。
2. **stale 条目**：写时正确，现在过时（人换了、key 换了、库改名）。**修**：要么 update 要么删除。**绝不**留着"添加但保留旧的，避免删错"——这是 memory 腐烂的开始。
3. **过细**：每个调试细节都记一条。**修**：细节属于代码 / git log。删掉。

#### 月度 5 分钟巡检（推荐流程）

```
1. 读 MEMORY.md，对每条问"这条还成立吗？还有用吗？"
2. 不成立 → 删（直接 rm 文件 + 删索引行）
3. 部分成立 → update（不要叠加新内容到旧文件，要 rewrite）
4. 主题分散 → 合并
5. 重要度变化 → 调整索引顺序（重要的上提，避免被 200 行截断）
```

### 5.8 进阶：memory 当 LLM 友好的"个人知识库索引"

终极用法：memory 不存"事实"，而存"**事实的索引**"。

例：你不要把整篇技术决策记录写进 memory（噪声、衰减），而是：

```markdown
---
name: ADR — Auth middleware rewrite (2026-Q2)
description: 决策记录指针；详情见 docs/decisions/0042
type: reference
---

Auth middleware 在 2026-Q2 被重写。**完整决策、理由、反对意见**见
`<repo>/docs/decisions/0042-auth-rewrite.md`。

**关键 takeaway**（避免每次都读全文）：
- 触发原因：legal 合规（不是技术债）
- 选型：JWT + Redis session（不是纯 stateless JWT）
- 拒绝的方案：OAuth proxy（运维复杂度太高）

**何时去读全文**：
- agent 要修改 auth 流程时
- 用户问"为什么不用 X 方案"时
```

这种"索引型 memory"享受了 memory 的自动注入 + ADR 文档的细节深度，回避了把长文塞 memory 的噪声成本。

---

## §6 · CLAUDE.md 工程

### 6.1 加载机制（mental model）

会话启动时（在 cwd `<repo>` 下）：

1. `<repo>/CLAUDE.md` 加载（如果存在）
2. `~/.claude/CLAUDE.md` 加载（如果存在）
3. `<repo>` 中**所有父目录**的 CLAUDE.md 也会按层级加载（如果你在子目录）

进入子目录工作时，子目录的 CLAUDE.md 也会进入上下文（progressive disclosure）。

`@path/to/file.md` 会展开 import（一定深度内）。

### 6.2 写作守则：六个"是 / 否"

| 应该写 | 不应该写 |
|---|---|
| 多文件合起来才看得懂的"大图" | 单文件就能看懂的细节 |
| 非显然的命令、参数、入口 | 通用 npm/pytest/cargo 命令 |
| 跨模块契约 / 数据流 | 单模块内部实现 |
| 已经踩过的坑、明确禁忌 | 通用最佳实践 |
| 长期项目目标（一两段） | 本周计划、PR 进度 |
| 团队/个人共识里的非默认做法 | 默认做法 |

### 6.3 三节模板（最经济的 CLAUDE.md 骨架）

我推荐对绝大多数项目用这三节：

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) ...

## 项目地图

[一段 100-300 字概述：这个 repo 做什么、有几个核心组件、谁产数据谁消费。
配一张目录功能表（不是 tree）：模块名 / 角色 / 技术栈 / 关键文件。]

## 跨模块契约 / 工作流

[多模块协作的部分。"A 写入 X，B 读取 X，schema 在 Z""build 时 A 必须先于 B"
"添加新 endpoint 时需同步改 OpenAPI + 前端 client"。这是 grep 看不出来的。]

## 不要做的事

[已经踩过 / 明确禁止的。"不要在 root 跑 git""不要把 mp4 提到此 repo"
"重构时不要碰 legacy/ 目录直到 v3 上线"。]
```

如果有非常关键的命令也可以加 "## 常用命令" 一节，但仅限 README 没写或写得不够 agent-friendly 的部分。

### 6.4 长度与密度

实操经验：CLAUDE.md 超过 300 行后边际收益急剧下降。理由：

- agent 每次启动都要"读完 + 索引"，长文吃 attention
- 维护成本上升（信息散乱、重复）
- 重要内容被淹没

**长度判断**：写完后自问"如果 CLAUDE.md 砍掉一半，agent 会做错事吗？" 不会就砍。

如果项目真的复杂到放不下，用 `@import` 把不同主题拆开：

```markdown
## 项目地图

[简版总览]

详细模块说明：
- @docs/architecture.md
- @docs/data-flow.md
- @docs/deployment.md
```

### 6.5 多项目 workspace（你这个 ~/claw 的情境）

工作区不是单 repo 时，根 CLAUDE.md 应该极简：**只做索引**。

```markdown
## Workspace 性质

~/claw 不是 git 仓库，是若干独立子项目。每个子项目自己的 CLAUDE.md 在
进入对应目录时加载。**不要在根目录跑 git。**

## 子项目地图

[一张表：子目录 / 角色 / 技术栈 / 下游]

## 跨项目契约

[只有跨项目时才适用的事，比如"报告 → 站点"的发布流程]
```

每个子项目的细节由 `<子项目>/CLAUDE.md` 自己承担。这避免根文件膨胀到 1000 行。

### 6.6 失效检测（CLAUDE.md 的运维）

CLAUDE.md 写好后会**腐烂**——命令改了、文件改名了、契约变了。检测方法：

1. **每次 `/init` 之前**：扫一眼现有 CLAUDE.md，对每条具体命令 / 路径，确认它仍然存在。
2. **被 agent 误导后**：如果 agent 跑了 CLAUDE.md 里的命令但失败了，根因可能是 CLAUDE.md 过期 → 立刻修。
3. **重大重构后**：把 CLAUDE.md 当代码一样改。
4. **季度 review**：跟 README、makefile 对照一次。

很多团队把 CLAUDE.md 写一次扔在 repo 里就再不管。半年后 agent 在它指引下做错事，团队抱怨"AI 不行"——其实是 instruction 烂了。

### 6.7 团队 vs 个人的 CLAUDE.md

`<repo>/CLAUDE.md` 是 git 跟踪的，**会被所有用 Claude Code 的同事用到**。这意味着：

- 不要在里面写个人偏好（"我喜欢中文回复"）→ 用户级 CLAUDE.md
- 不要写你的私人 token 路径 → settings.local.json
- 不要带政治倾向（"老板要求 X，我们就硬着头皮做"）→ 团队 wiki

如果你想给"自己 + 这个 repo"加只对自己生效的指引，写 `~/.claude/CLAUDE.md` 里加上"在 <repo> 中也额外 ..."这样的条件性偏好。

---

## §7 · Skills 与 Subagents

### 7.1 Skills 的设计第一性

Skill 解决"我有一个**反复使用的工作流**，每次都要复述步骤太累"的问题。

**何时升级为 skill**：

- 同一动作做了 ≥ 3 次（启动 5 分钟工作流的开销 < 重写说明的累计开销）
- 步骤多 / 易出错 / 有标准化资源（脚本、模板）
- 需要团队复用（skill 可以入 git）

**Skill 的结构**：

```
~/.claude/skills/<name>/
├── SKILL.md           # 入口，含 YAML frontmatter
├── scripts/           # 辅助脚本
├── templates/         # 模板文件
└── README.md          # 给人看的（可选）
```

`SKILL.md` 的 frontmatter 通常包含 name / description / 触发条件。**description 是最重要的字段**——它决定 agent 是否会在合适时机想起用这个 skill。

#### 写好 description 的三条原则

1. **明确触发条件**：用 "Use when..."，不要用 "Use to do..."。
   - ❌ "Use to handle authentication-related tasks."
   - ✅ "Use when the user asks to add/modify auth flows OR when files matching `*/auth/*.ts` are edited."

2. **包含负面条件**：写"什么时候**不该**用"。
   - ✅ "SKIP when file imports `openai` SDK or filename contains `-openai`."

3. **具体到 trigger 词**：列出会触发它的关键词 / 文件 pattern。

### 7.2 Subagents：四种典型用法

| 用途 | 推荐 subagent | 理由 |
|---|---|---|
| 找 X 在哪定义 | `Explore` | 只读、快速、不污染上下文 |
| 设计实现方案 | `Plan` | 需要架构判断，输出 step-by-step |
| 大型独立任务 | `general-purpose` | 多步、需要 write 权限 |
| 关于 Claude Code 本身的问题 | `claude-code-guide` | 专门训练过的指引 |

#### Fork（不带 subagent_type 的 Agent）

特殊：fork **继承当前对话的全部上下文**，但执行结果不污染主对话。

何时 fork：

- 任务**依赖隐含上下文**（"按我们刚才聊的方式继续 ..."）
- 输出能压成几句话（中间过程是噪声）
- 你想边干边继续主对话（fork 在后台跑）

**fork 守则**：

- 不要 peek（不要读 fork 的中间输出）
- 不要 race（fork 没回来前别假设结果）
- prompt 写"指令"而非"背景"（背景已经继承）

### 7.3 Skill / Subagent / Memory 的协作模式

三者分工是不同的"轴"：

- **Skill**: 做这件事的 **how**（步骤）
- **Subagent**: 做这件事的 **环境**（隔离、专用工具集）
- **Memory**: 做这件事的 **why / for whom**（用户偏好、历史决策）

进阶模式："skill + memory + hook 三件套"：

- skill 定义工作流（步骤）
- memory 记录这个用户在这个工作流上的非默认偏好
- hook 在工作流入口拦截 / 自动调用 skill

例：你的"周更视频流水线"是个完美的三件套候选：

- skill `weekly-video`: 定义"读 script.json → 跑 render.py → publish-video.py"
- memory: "用户偏好 ≤ ¥12 单期成本，默认 Hailuo-02-Fast"
- hook (`UserPromptSubmit`): 检测"周更视频"关键词时自动 reminder

---

## §8 · 决策框架

新手最大的问题是**面对一条信息不知道往哪放**。下面给一组决策树。

### 8.1 决策树 A — "我想让 agent 记住一件事"

```
这件事是 deterministic 的吗？（"绝不要 X"、"必须 Y"）
├─ 是 → settings.json (permissions / hooks)
└─ 否 → 它的衰减率？
        ├─ 跟代码同寿（"build 命令"、"模块契约"）→ CLAUDE.md
        ├─ 跨项目都成立（"我喜欢中文"）→ user-level CLAUDE.md
        ├─ 跨会话个人偏好（"我接受单 PR"）→ memory (feedback)
        ├─ 跨会话身份信息（"我是 Go 工程师"）→ memory (user)
        ├─ 项目状态有时间窗口（"merge freeze 到 X"）→ memory (project)
        ├─ 外部资源指针（"key 在 ~/.x.env"）→ memory (reference)
        └─ 单次会话（"刚才我们聊到 ..."）→ task / 对话本身
```

### 8.2 决策树 B — "agent 刚做错了"

```
是模型本身的判断错？
├─ 是 deterministic 错（每次都会错的同类）→ 升级为 hook / permission deny
├─ 是 heuristic 错（情境下做错）→ 写 feedback memory（带 Why）
└─ 是因为信息缺失 → 把信息补到 CLAUDE.md / memory（看衰减率）

是 instruction 烂导致的？（CLAUDE.md / memory 误导）
└─ 修 instruction，**不要**给它叠加补丁规则
```

### 8.3 决策树 C — "我做了个新工作流"

```
做过几次了？
├─ 1 次 → 写到对话里 / 写在 README
├─ 2-3 次 → 写到 CLAUDE.md（如果 repo 内）或 memory（如果跨项目）
└─ ≥ 3 次 → 升级为 skill
            ├─ 团队共享 → 入 git
            └─ 个人 → ~/.claude/skills/
```

### 8.4 决策树 D — "我手里这条信息要不要存"

```
这条信息能从代码 / git log / grep 重新得到吗？
├─ 能 → 不存（让 agent 当场查）
└─ 不能 → 它在未来什么情境下会再次需要？
          ├─ 答不上来 → 不存
          └─ 答得上来 → 存到对应层
```

---

## §9 · 反模式速查

### 9.1 Memory 反模式

| 反模式 | 症状 | 修复 |
|---|---|---|
| **Memory 当 todo** | "TODO: 下周改 X" 写进 memory | 用 task list；进度别进 memory |
| **Memory 当报告** | 把整篇调研笔记塞 memory | 写到 docs/，memory 只存指针 |
| **被纠正了不记** | 同一错误被纠正 3+ 次 | 第一次就写 feedback memory |
| **被认可不记** | agent 反复请求确认同样判断 | 用户默许后立刻写 memory |
| **混合类型** | 一个文件既 user 又 project | 拆开，每个文件单一 type |
| **巨型 MEMORY.md** | 200+ 行 | 200 行后会被截断；精简、合并、删 stale |
| **删而不重写** | 加新条目时把旧的留着"以防万一" | 直接覆盖，留着是 stale 之源 |
| **无日期相对时间** | "上周开始" | 写绝对日期 `2026-05-07` |

### 9.2 CLAUDE.md 反模式

| 反模式 | 症状 | 修复 |
|---|---|---|
| **复制 README** | CLAUDE.md = README 重排 | 删，让 README 自己说话 |
| **写通用最佳实践** | "写有意义的提交信息" | 删；这是 system prompt 的事 |
| **文件清单** | 把 tree 粘进去 | 删；ls 能给的不重复 |
| **过期不修** | 命令早改了仍写老命令 | 季度审计 + 用错时修 |
| **巨型单文件** | 1000+ 行根 CLAUDE.md | 拆子目录或 @import |
| **个人偏好混入团队 CLAUDE.md** | "我用 emacs 所以 ..." | 移到 user-level |

### 9.3 Hook 反模式

| 反模式 | 症状 | 修复 |
|---|---|---|
| **Hook 跑慢命令** | 每次工具调用阻塞 5s | 异步 / cache / 砍掉 |
| **Hook 输出过多** | 注入 500 行 git status | 只输出关键摘要 |
| **Hook 无限循环** | hook 触发 hook | 加退出条件 |
| **Hook 当 logging** | 用 hook 记录所有动作 | 用 `claude --debug` 或外部日志 |

### 9.4 Subagent 反模式

| 反模式 | 症状 | 修复 |
|---|---|---|
| **微任务用 subagent** | "读这个 100 行的文件" 派 agent | 直接 Read |
| **不写背景就派 fresh agent** | subagent 困惑、效果差 | 写完整 brief；或改用 fork |
| **fork 后 peek** | 读 fork 中间输出 | 等通知；信任完成消息 |
| **subagent 改了文件不验证** | "subagent 报告完成"就直接信 | 自己 git diff 看一眼 |

---

## §10 · 治理与维护

### 10.1 月度 5 分钟流程

```
1. ls ~/.claude/projects/<cwd>/memory/ ， 看条目数。
   超过 30 → 触发清理（合并、删 stale）。

2. cat MEMORY.md，对每行问：
   - 还成立吗？
   - 还有用吗？
   - 索引行钩子写得够具体吗？

3. 重新排序：跨任务最常用的提到顶部（避免 200 行截断）。

4. cd 到主要项目，cat CLAUDE.md，
   挑 3 条具体命令 / 路径，验证仍存在。
```

### 10.2 跨项目搬迁信息

memory 是 per-cwd 的。当你启动新工作区想沿用旧偏好时：

- **跨所有项目偏好** → 已经在 user-level CLAUDE.md / 用户全局 settings 里，新 cwd 自动有
- **某些项目特定的 memory 想搬过去** → 手动复制对应 `feedback_*.md`、`reference_*.md` 到新 cwd 的 memory 目录，更新 MEMORY.md 索引
- **不要全量复制**：很多 memory 是上下文特定的（"在 X 项目中 ..."），换 cwd 就不适用

### 10.3 团队中的 memory 边界

memory 是个人的（per-user × per-cwd）。**不要**：

- 把团队约定写进个人 memory（用 `<repo>/CLAUDE.md`，对所有人生效）
- 把秘密写进 memory（虽然本地，但备份/同步可能泄漏）
- 期待"队友的 agent 知道我教过我自己的 agent 的事"

队友共享的载体：CLAUDE.md（项目）+ skills（项目内或共享 plugin）+ docs/。

---

## §11 · 大师级模式

### 11.1 Context offloading via fork

主对话上下文有限，长任务会污染。模式：

```
主对话: 跟用户讨论方案 / 决策 / review
  └─ fork: 实际跑 5 分钟的"读 30 个文件 + 改 5 个" 任务
       └─ 返回: "改完了，关键变更见 a.ts:42 / b.ts:88"
主对话: 看 git diff，确认 / 调整
```

获益：

- 主对话 tokens 不被工具结果污染
- prompt cache 在主对话里仍命中（fork 自己的 cache 独立）
- 能"边干边聊"

陷阱：

- fork 的工作可能不被你及时审视 → 完成后必看 git diff
- fork 没法继续接受新指令（要再发 SendMessage 或新派一个）

### 11.2 Memory-as-protocol（多 agent 协作时的契约层）

当多个 agent（自定义 subagent / 团队 agent / cron 定时 agent）在同一个工作区操作时，用 memory 做"协议层"。例：

- agent A（每天 06:00 跑）写一条 project memory："今天的发布完成，BV 号 X"
- agent B（你手动操作）启动会话时读到这条，知道当前状态
- agent C（review 用）通过 memory 知道"这个 PR 已经过了 A 的检查"

这种用法把 memory 从"个人状态"升级为"agent 间传递结构化信息的总线"。配合自定义 schema 写得更紧（每条 frontmatter 加 `agent_origin` 字段）会更可控。

### 11.3 Progressive disclosure 三阶段

工作区进 → 子项目进 → 子模块进，每层只加载相关 CLAUDE.md：

```
~/claw/CLAUDE.md                           # 工作区索引（150 行）
~/claw/lotus-academy-design/CLAUDE.md       # 全栈应用大图（200 行）
~/claw/lotus-academy-design/server/CLAUDE.md  # 后端契约（100 行）
~/claw/lotus-academy-design/server/src/auth/CLAUDE.md  # auth 子模块（30 行）
```

注意：每一层只写**这一层增量信息**，不重复上层。最深层往往很短（30 行）但极有价值（"这个目录的代码不要 refactor 直到 X"）。

### 11.4 Prompt cache 友好的写作

CLAUDE.md / MEMORY.md / 全局 settings 是每会话开头加载的，命中 cache 收益巨大。守则：

- 不要在文件**顶部**频繁改动（顶部改一字符，下面整段 cache 失效）
- 把不稳定内容放**底部**（动态状态、最近变化）
- 把稳定的"框架"放顶部（项目目标、架构、不要做的事）

### 11.5 用 hook 做"在线 instruction tuning"

```
UserPromptSubmit hook
  ├─ 检测 prompt 关键词
  └─ 注入相关 CLAUDE.md section / memory 摘要
```

这样你可以保持根 CLAUDE.md 极简，让 hook 在用户提到"部署"时再注入 deploy 章节。代价是 hook 复杂度上升、调试难。建议只在 CLAUDE.md 真的撑不下时再用。

### 11.6 Skill 套娃与组合

一个 skill 可以"组合"其他 skill：在 SKILL.md body 里写"先调用 /A，再调用 /B"。或者更优雅地：把通用步骤抽成 sub-skill，主 skill 引用。

进阶：写一个 meta-skill `/morning-routine`，body 里依次：检查日历 → 跑 ai-morning-post → 同步 marginalia → 总结。每个子动作可以是更原子的 skill。

### 11.7 自定义 subagent 的 system prompt 工程

`~/.claude/agents/<name>.md` 让你定义专用 subagent。关键设计点：

- **限定工具集**：去掉用不到的工具，减少干扰
- **明确身份**："你是 X 专家，只回答 X 相关问题"
- **限定输出格式**：要求结构化输出，主对话好消化
- **写 negative behavior**：明确说不要做什么（避免 fresh agent 自由发挥跑偏）

### 11.8 三体协同：CLAUDE.md / memory / hook 的循环

成熟工作区会形成"自我增强"循环：

```
1. 用户告诉 agent 一个新约定
2. agent 写 memory（个人偏好层）
3. 反复用证明这个约定确实跨任务有效
4. 升级到 CLAUDE.md（如果项目特定）或 user-level（如果跨项目）
5. 反复用证明它是 deterministic 的
6. 升级到 hook / permission（机制层）
7. 这时可以从 memory / CLAUDE.md 删除（机制层已保证）
```

这是一个**信息从模糊到具体、从启发式到机制**的"沉淀"过程。掌握节奏的人，工作区会越用越好用，而不是越用越乱。

---

## §12 · 实战 case studies

下面以本工作区（`~/claw`）实际场景为例。

### Case 1: "用户告诉我 GitHub bot 账号有专用 PAT"

**信息分类**：跨会话个人状态（reference 类）+ 跨会话约定（feedback 类）。

**正确归属**：

- `reference` memory: "GitHub bot 账号 gittee-coder 的 PAT 在 `~/.config/gh/{user,org_pyf-labrary}.token`"
- `feedback` memory: "force-push 需用户批准；其他 GH 操作预授权（Why: 用户已显式授权）"
- `<repo>/CLAUDE.md`：**不写**（个人状态，团队不需要知道你的 token 在哪）
- `settings.json`：可以加 permissions allow `gh ...`，把"预授权"做成机制层

**错误归属**：

- 把 token 路径写进项目 CLAUDE.md（泄漏）
- 只写 feedback 不写 reference（agent 知道"可以做"但不知道 token 在哪）

### Case 2: "本 repo 不要把 mp4 提交"

**信息分类**：项目知识 + deterministic。

**正确归属**：

- `<repo>/CLAUDE.md` "不要做的事"：写一行
- `.gitignore`：`*.mp4`（机制层，根本拦下）
- 可选 `.claude/settings.json`：pre-commit hook 校验

**错误归属**：

- 只写 memory（每次新 cwd 又得重学；团队成员也不知道）
- 只写 CLAUDE.md 不加 .gitignore（agent 99% 遵守，1% 翻车）

### Case 3: "MiniMax key 在 ~/.minimax.env，单价 X"

**信息分类**：reference（外部资源 + 业务参数）。

**正确归属**：

- `reference` memory：路径 + 单价 + 端点
- 单价部分要标日期（"截至 2026-05-07"），方便未来识别 stale
- 不写进 CLAUDE.md（个人 + 跨项目，不该和某个 repo 绑定）

进阶：可以把"如何核对账单"也写进同一条 reference（因为没公开 API，要去 web 后台手动）。这种"边界条件"信息能避免未来 agent 浪费 10 分钟找根本不存在的 API。

### Case 4: "周更视频要做到 36氪 水准，不是精致 PPT"

**信息分类**：feedback（视觉/品质偏好）。

**正确归属**：

- `feedback` memory（已有：[视频质量门槛](feedback_video_quality.md)）

为什么不进 CLAUDE.md：

- 这不是"项目本身的知识"，是"用户对视觉的判断标准"
- 即使搬到另一台机器、另一个项目（如果做视频），这条仍成立 → 是个人偏好

**关键 Why**：feedback 必须写"为什么这是 36氪而不是 PPT"——可以引一个具体反例（"上次做的某期被指出像 PPT"）。这样未来 agent 看到"PPT 风"草稿能立刻警觉。

### Case 5: "新发现一个 prompt 技巧：避免 model sheet 关键词"

**信息分类**：feedback（实操经验，跨会话适用）。

**正确归属**：

- `feedback` memory（已有：[Seedream 概念图 prompt 经验](feedback_seedream_prompting.md)）

**Why** 部分要写：试过 X 关键词，结果出 Pixar 卡通；改用 Y 关键词，结果对。**How to apply**：在写 Seedream 提示词时，避开 X，倾向 Y。

不进 CLAUDE.md 因为：跨多个项目（tv / bodhi 都用 Seedream），不属于单个 repo。

### Case 6: "AI 周报视频每周一发"

**信息分类**：project（有时间属性的工作流）。

**正确归属**：

- `project` memory（已有：[AI 周报视频流水线](video_pipeline.md)）+ Why 解释为何周一
- `<repo>/video/CLAUDE.md`：可以引用 memory，但侧重"工程上怎么跑"
- 进阶：起一个 cron / schedule（机制层）每周日提醒收集素材

**衰减管理**：如果某天改成隔周更，这条 project memory 必须立刻 update（不是新增另一条）。

### Case 7: "agent 跑 publish.py 时把还没确认的文件也发了"

**信息分类**：feedback（需要避免的模式）+ 可能升级 hook。

**正确归属**：

- 先 `feedback` memory：解释场景 + Why + How（"publish.py 不要主动跑，先 dry-run / 让用户确认 git status"）
- 如果再发生 → 升级 hook：`PreToolUse` on `Bash(*publish.py*)`，强制 ask

这是 §11.8 沉淀循环的体现：feedback → 验证 → hook。

---

## §13 · 参考清单：每周/每月例行

### 每周

- 翻一遍当周的对话（claude `/resume`），看有哪些用户纠正没被记 → 补 memory
- 看有没有重复 ≥ 3 次的工作流 → 升级 skill
- 看 hook 有没有过期或失败的（看 hook 日志）

### 每月

- MEMORY.md 巡检（§5.7、§10.1 的流程）
- 主要项目 CLAUDE.md 失效检测（§6.6）
- skills 列表清点：哪些没用过 → 删；哪些总用 → 优化 description

### 每季

- ADR / docs 是否同步进 reference 类 memory
- settings.json permissions 清单是否仍合理（有些 deny 可能已不必要）
- 跨项目偏好是否该提升到 user-level CLAUDE.md

---

## §14 · 写在最后：信息架构是"agent 长跑"的复利

短期（一次会话）你看不出 memory / CLAUDE.md / hooks 的差别——直接在对话里粘东西也能用。

中期（一个月）你会看出差别：每次重启 cwd，你的 agent 是一开始就懂规矩，还是要重新教十遍。

长期（一年）你会看出量级差别：

- 成熟工作区的 agent 能直接做"周更视频 + 上传 + 改写 marginalia"这种 7 步链式动作
- 不维护信息架构的工作区，agent 永远停留在"逐步骤手把手"

差距全在你怎么把信息分配给八层、怎么维护它们的鲜度、怎么把"反复出现的偏好"沉淀成"机制"。

> Memory is what you remember. CLAUDE.md is what we agreed. Settings is what won't bend. Skills is how we do it. Subagent is who does it. The art is fitting each fact in the layer where it costs least to live and pays most when called.

---

附录：与本指南配套的实操脚手架

- 用户当前工作区索引：`~/claw/CLAUDE.md`
- 个人 memory 总览：`~/.claude/projects/-home-pyf-claw/memory/MEMORY.md`
- 子项目示范（多项目协作）：`~/claw/marginalia/`、`~/claw/tv/`、`~/claw/lotus-academy-design/`

如果要把本教程"用起来"——下一步建议是：挑一个最常用的子项目，按 §6.3 三节模板给它写 CLAUDE.md；然后跑一次 §10.1 的 5 分钟巡检。这两个动作的 ROI 最高。
