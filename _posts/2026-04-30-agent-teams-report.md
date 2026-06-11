---
layout: "post"
title: "Claude Code Agent Teams 功能学习报告"
date: "2026-04-30 12:00:00 +0800"
author: "Marginalia"
description: "Claude Code 2.1.32 起的实验功能 Agent Teams：sub-agent 之间如何协作、怎么写 agent.md 编排团队、怎么启用、相比单 agent 模式的取舍与坑点整理。"
excerpt: "Claude Code 2.1.32 起的实验功能 Agent Teams：sub-agent 之间如何协作、怎么写 agent.md 编排团队、怎么启用、相比单 agent 模式的取舍与坑点整理。"
tags: [claude-code, agent-teams, multi-agent, experimental, sub-agents]
keywords: "Claude Code, agent teams, sub-agents, multi-agent orchestration, agent.md, sandbox"
cover: /assets/img/posts/2026-04-30-agent-teams-report/cover.jpg
---

> 来源：https://code.claude.com/docs/en/agent-teams
> 状态：实验性（experimental），默认关闭
> 版本要求：Claude Code ≥ 2.1.32

---

## 1. 它是什么

Agent Teams 让多个独立的 Claude Code 实例**作为团队协同工作**：

- 一个会话作为 **team lead（团队领导）**：负责创建团队、派活、汇总成果
- 其他会话作为 **teammates（队友）**：每人一个独立上下文窗口
- 队友之间**直接互相通信**，不必经过 lead 中转
- 用户也可以**直接和某个队友对话**，而不必让 lead 转达

这是它和普通 subagent 最大的区别。

## 2. 与 Subagent 的对比

|  | Subagent | Agent Team |
|---|---|---|
| 上下文 | 独立窗口，结果回传给主 agent | 独立窗口，完全独立 |
| 通信 | 只能向主 agent 报告 | 队友互相直接发消息 |
| 协调 | 主 agent 全权管理 | 共享任务列表 + 自协调 |
| 适合 | 结果导向的小任务 | 需要讨论/挑战/协作的复杂任务 |
| Token 成本 | 较低 | 显著更高（每个队友是完整 Claude 实例） |

**经验法则**：单纯并行干活用 subagent；要"互相辩论、互相 review、跨层协作"才上 team。

## 3. 核心架构

| 组件 | 角色 |
|---|---|
| **Team Lead** | 创建团队、派活、协调的主会话 |
| **Teammates** | 各自独立的 Claude Code 实例，处理被分配的任务 |
| **Task List** | 共享任务列表，队友自己 claim 任务 |
| **Mailbox** | 队友间消息系统（自动投递，无需 lead 轮询） |

存储位置：

- 团队配置：`~/.claude/teams/{team-name}/config.json`
- 任务列表：`~/.claude/tasks/{team-name}/`

⚠️ 这两个文件由 Claude Code 自动维护，**不要手动编辑**，每次状态变更都会被覆盖。

## 4. 启用方法

设置环境变量 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`，可写入 `settings.json`：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**重要**：这个变量在 **session 启动时**读取，已经在跑的 session 改了 settings.json 不会即时生效，必须**重启 Claude Code**。

## 5. 显示模式

| 模式 | 说明 | 要求 |
|---|---|---|
| **in-process** | 所有队友在主终端内，Shift+Down 循环切换 | 任意终端 |
| **split panes** | 每个队友独立面板，可点击交互 | tmux 或 iTerm2（+ `it2` CLI） |
| **auto**（默认） | 在 tmux 内自动用 split panes，否则 in-process | — |

强制 in-process：`claude --teammate-mode in-process`
全局设置：`~/.claude/settings.json` 里 `"teammateMode": "in-process"`

## 6. 启动一个团队

启用功能后，**用自然语言**让 lead 创建团队：

```
我在设计一个跟踪 TODO 注释的 CLI 工具。创建一个 agent team
从不同角度探索：一个负责 UX，一个负责技术架构，
一个唱反调（devil's advocate）。
```

Claude 会自动：
1. 创建团队和共享 task list
2. 为每个角色 spawn 队友
3. 让他们各自探索
4. 综合发现
5. 完成后清理团队

## 7. 控制团队

### 指定数量和模型
```
创建 4 个队友的团队来并行重构这些模块，每个队友用 Sonnet。
```

### 要求计划审批（高风险任务）
```
Spawn 一个 architect 队友来重构鉴权模块，
开工前要求计划审批。
```
队友先在只读 plan mode 出方案 → 提交给 lead → lead 决定批/驳回 → 通过后再动手。

### 直接和某个队友对话
- **in-process**: Shift+Down 切换到队友 → 直接打字发消息；Enter 进入队友会话；Esc 打断；Ctrl+T 切换 task list
- **split-pane**: 直接点对应面板

### 任务分配
- Lead 显式指派：告诉 lead 把哪个任务给谁
- 自助 claim：队友干完一个就自动捡下一个空闲、无依赖的任务
- 用文件锁防并发抢同一任务

### 关闭单个队友
```
让 researcher 队友关闭
```
队友可同意（优雅退出）或拒绝（带理由）。

### 清理团队
```
清理团队
```
⚠️ 必须由 **lead** 执行，不能让队友清。清理前要先关掉所有队友。

## 8. 复用 Subagent 定义作为队友角色

可以引用任意 subagent type 作为队友：

```
用 security-reviewer agent type spawn 一个队友，审计 auth 模块。
```

队友会继承该定义的 `tools` 白名单和 `model`，定义体作为追加的系统提示。
**注意**：subagent 定义里的 `skills` 和 `mcpServers` 字段在队友模式下**不生效**，队友直接从项目和用户设置里加载。

## 9. 用 Hooks 强制质量门

| Hook | 触发时机 | 用法 |
|---|---|---|
| `TeammateIdle` | 队友即将进入 idle | 退出码 2 → 反馈并让其继续工作 |
| `TaskCreated` | 任务正被创建 | 退出码 2 → 阻止创建并反馈 |
| `TaskCompleted` | 任务正被标记完成 | 退出码 2 → 阻止完成并反馈 |

## 10. 经典使用场景

### 并行 Code Review
```
创建 agent team review PR #142，spawn 三个 reviewer：
- 一个看安全
- 一个看性能
- 一个看测试覆盖率
```
单个 reviewer 倾向于盯一类问题，分工后各域同时被认真覆盖。

### 竞争性假设调试
```
用户反馈 app 发完一条消息就退出。Spawn 5 个队友
调查不同假设，让他们互相对话尝试推翻对方理论，
像科学辩论一样。共识写进 findings doc。
```
对抗性结构对抗"锚定偏差" —— 单 agent 容易找到一个看似合理的解释就停。

## 11. 最佳实践

- **3-5 个队友为宜**，每队友 5-6 个任务最舒服
- **任务粒度**要适中：太小协调成本高，太大风险大
- **避免文件冲突**：让每个队友拥有不同的文件集
- **新手从研究/审查类任务起步**（不写代码），熟悉协作机制后再上并行实现
- 上下文：队友会自动加载 `CLAUDE.md`、MCP、skills，**但不继承 lead 的对话历史**，所以 spawn prompt 必须自包含
- 如果 lead 自己开始干活而非派活，明确告诉它"等队友完成"

## 12. 已知限制（实验性阶段）

- ❌ **`/resume` `/rewind` 不能恢复 in-process 队友**：恢复后队友已不在
- ❌ 任务状态会延迟，有时队友忘记标记完成，阻塞依赖任务
- ❌ 关闭慢：队友会先把当前请求/工具调用做完
- ❌ 一次只能管一个团队，需先清理旧团队
- ❌ 不能嵌套 team：队友不能再 spawn 自己的 team
- ❌ Lead 固定：创建团队的会话终身是 lead，不能转让
- ❌ Spawn 时所有队友共用 lead 的权限模式，事后才能单独改
- ❌ Split panes 在 VS Code 集成终端、Windows Terminal、Ghostty 不支持

## 13. 故障排查要点

| 现象 | 处理 |
|---|---|
| 队友看不见 | in-process 下按 Shift+Down 循环；任务可能没复杂到值得开 team |
| 权限弹窗太多 | 提前在 permission settings 预批常用操作 |
| 队友遇错就停 | 直接给指令补救，或 spawn 替补队友 |
| Lead 提早收工 | 告诉它继续 / 让它等队友完成 |
| 残留 tmux 会话 | `tmux ls` 找出，`tmux kill-session -t <name>` 清掉 |

## 14. 总结

Agent Teams 是 Claude Code 把"多 agent 并发"从**主从汇报模式**升级到**对等协作模式**的实验功能：

- 价值场景：研究/审查、新模块/功能、对抗性调试、跨层协作
- 不适合：顺序任务、同文件编辑、强依赖任务（用单 session 或 subagent 更好）
- 代价：Token 消耗显著增加，协调开销也随队友数增加
- 当前阶段：实验性，明确知道限制再用
