---
layout: "post"
title: "用 Claude Code 搭 PM/Worker/Auditor 三 agent 自动开发流水线：Issue → PR → merge 全闭环"
date: "2026-05-25 12:00:00 +0800"
author: "Marginalia"
description: "约 300 行脚本、不靠编排框架，用 Claude Code headless 把 Issue→PR→merge 串成 agent 间零人工干预的流水线；附真实运行账本与设计取舍。"
excerpt: "约 300 行脚本、不靠编排框架，用 Claude Code headless 把 Issue→PR→merge 串成 agent 间零人工干预的流水线；附真实运行账本与设计取舍。"
tags: [Claude Code, AI Agent, 多智能体, 自动化开发, LLMOps]
---

几周前我写过一篇偏「方法论」的长文，讲怎么把 AI 从单兵 Copilot 升级成 PM/Worker/Auditor 三层金字塔（那篇是 6 周路线图 + canary + 度量体系的宏图）。这篇不一样：宏图我没全做，但**最小闭环已经在真实的 bug 上跑通并合并了**。所以这篇只讲一件事——那条最小闭环到底是怎么用 Claude Code 搭出来的、每一行设计为什么这么写、踩了哪些坑，以及它现在**还差什么**（我会诚实地把没做完的部分单列一节，而不是吹成全自动生产系统）。

代码很短，短到可以逐段贴出来读。这恰恰是我想传达的核心判断：**多 agent 自动开发流水线的难点不在编排框架，在职责分离的拓扑、状态外置的纪律、和确定性的安全闸——这三样都可以用文件系统 + GitHub + 几个 shell 脚本表达，不需要重型基础设施。**

---

## 0. 它现在能做什么（先放真实证据）

不绕弯子，先放跑通的那一单。我在自己的一个前端项目 cue（一个影视配乐教学互动站）里开了一个 P3 的布局 bug，打上 `auto-eligible` 标，然后没再碰键盘，直到最后那一下「批准合并」：

```
Issue#1 ──worker(Opus,125s)──▶ PR#2 ──auditor(Sonnet,90s)──▶ ✅LGTM ──pyf 批准──▶ merged
```

这是 `runs.jsonl` 执行账本里这一单的真实记录（原文照搬，没修饰）：

```jsonl
{"ts": "2026-05-23T00:48:30.477948+00:00", "role": "worker", "task": "fix pyf-labrary/cue#1 (cue)", "issue": 1, "duration_s": 125.0, "result": "ok"}
{"ts": "2026-05-23T00:56:27.466030+00:00", "role": "auditor", "task": "review pyf-labrary/cue PR#2 (cue)", "issue": 1, "duration_s": 90.0, "result": "ok"}
{"ts": "2026-05-23T12:10:24.551876+00:00", "role": "pm", "task": "triage pyf-labrary/cue#1: already resolved — PR#2 merged, issue CLOSED/COMPLETED; no re-dispatch (would duplicate)", "issue": 1, "result": "ok"}
```

这几行后面会逐字段拆。这里先注意最后那行 PM 的记录：它是我**故意在 Issue 已经合并关闭之后**又对它跑了一次 PM 分诊——PM 没有重复派工，而是核对了 GitHub 和账本两个事实源，判断「已解决、再派会重复」，直接 no-op 退出。这是整套设计里我最在意的一个性质：**幂等**——下一节会讲为什么它是无人值守的前提。

Worker 在那次跑里写出来的 PR，根因分析是这样的（节选自真实 PR body，不是我事后补的）：

> 根容器 `relative isolate` 建立了一个层叠上下文。hero 背景图 div 是 `absolute … z-0`（带显式 z-index 的定位元素），而下方带 `border-t` 的「情绪详情」section 是无定位、无 z-index 的普通流块。按 CSS 绘制顺序，`z-index:0` 的定位元素绘制在普通流块之上……修复：给该 section 加 `relative z-10`，与 HERO 同层。

一个真实的 CSS 层叠上下文 bug，被一个 headless agent 定位到根因、给出最小修复、跑了 `npm run build`、开了 PR、写清验收标准——全程我没看一眼代码，直到 Auditor 评论 LGTM 后我点了合并。这就是这条流水线当前的能力边界。下面讲它怎么搭的。

---

## 1. 为什么是「三个 agent」而不是「一个更强的 agent」

这点上一篇讲过心法，这里只补一句落到实现的判断：**职责分离（Separation of Duties）不是 prompt 能模拟的，必须是结构保证。**

让同一个 agent loop 既写代码、又 review 自己写的代码、又决定要不要合并，本质上是让它自己制衡自己——再强的模型也做不到，因为它没有「另一个视角」，它只有自己刚才那条推理链的延续。会计和信息安全里把这叫 SoD：经手钱的人不能同时是审账的人。放到 agent 流水线里就是：

- **PM**：拆解、分诊、派工、验收编排。**不碰代码**。
- **Worker**：在隔离的分支里写码、跑测试、开 PR。**只能动自己那条 feature 分支**。
- **Auditor**：审 diff + 安全扫，结论评论回 PR。**结构上不持写权**——它根本没有 Edit/Write 工具，想改也改不了。
- **人（我）**：只做最后那一下合并审批，以及红线 ack。

关键在最后两条的「结构上」。我不是在 Auditor 的 prompt 里写「请你不要改代码」（那是软约束，模型可能不遵守、可能幻觉、可能被任务诱导绕过），而是在**启动它的命令行里就没给它 Edit/Write 工具**。这是确定性的：

```bash
# Auditor 的工具白名单——注意没有 Edit/Write，从机制上保证它改不了代码
claude -p "$prompt" \
  --append-system-prompt "$(cat ~/army/roles/auditor.md)" \
  --permission-mode default \
  --model sonnet \
  --allowedTools Bash Read Grep Glob
```

对比 Worker 的启动命令，差别一目了然：

```bash
# Worker——给了 Edit/Write，且用 acceptEdits 模式让它能连续改文件不卡 ack
claude -p "$prompt" \
  --append-system-prompt "$(cat ~/army/roles/worker.md)" \
  --permission-mode acceptEdits \
  --model "$model" \
  --allowedTools Bash Edit Write Read Grep Glob
```

PM 同理，白名单也只有 `Bash Read Grep Glob`——它能调 `gh` 命令操作 Issue、能读项目代码做分诊判断，但**不能直接改业务代码**。三个角色的写权限差异，全部落在 `--allowedTools` 这一行上，而不是 prompt 里的客套话。

> 工程判断：**能用白名单表达的约束，就不要用 prompt 表达。** 白名单是 Claude Code 给你的确定性闸门，prompt 是概率性请求。安全相关的东西，永远优先选确定性的那个。

模型分层也在这三条命令里：PM = Opus（判断要准），Worker 默认 Opus（写码质量优先，琐碎活降 Sonnet），Auditor = Sonnet（review 够用，巡检/日报可降 Haiku）。底座是 Claude Code 登录 Claude Max 订阅跑，所有 headless 进程挂同一份订阅 auth，**边际美元成本约等于零**——这是当初选 Claude Code 而不是只吃 BYOK 的运行时当底座的决定性理由（详见项目里的 ADR-001）。

---

## 2. 架构：三段触发 + 一份注册表，没有常驻框架

整套东西的物理结构异常简单。所有「运行时之家」在一个目录 `~/army/`：

```
~/army/
├── CLAUDE.md            组织宪法（PM 运行于此时自动加载）
├── roles/
│   ├── pm.md            PM 角色手册
│   ├── worker.md        Worker 角色手册
│   └── auditor.md       Auditor 角色手册
├── projects.yaml        项目注册表：project → 路径/repo/部门/worker 画像/测试
├── bin/
│   ├── army-dispatch    poller：扫 auto-eligible Issue → 唤 PM（默认 DRY）
│   ├── army-run-pm      唤 PM 分诊 + 派工某 Issue
│   ├── army-run-worker  建 worktree + 起 Worker 修 + 开 PR + 记账
│   ├── army-run-auditor 起 Auditor 只读审 PR + 评论
│   ├── army-ledger      写一行 JSON 到 runs.jsonl
│   ├── army-guard       总开关：PAUSE 时让任务自退
│   ├── army-watchdog    出口探活（curl api.anthropic.com）
│   └── pm               本地直连：交互对话 PM（同一角色，另一道门）
├── runs.jsonl           执行账本（事实源之一）
└── worktrees/<proj>/    Worker 的隔离工作区
```

`bin/` 下所有脚本加起来 **305 行**（`wc -l` 实测）。没有 Airflow、没有 Celery/RabbitMQ、没有自建状态机引擎、没有数据库。

它的运行模型是**事件式 + 状态外置**：

```
┌─────────────────────────────────────────────────────────────┐
│  事实源（状态全在这里，不在任何进程的内存里）                  │
│                                                               │
│   GitHub Issues + Projects     ←── 任务/状态（label 路由）    │
│   GitHub PR                    ←── 代码评审载体              │
│   ~/army/projects.yaml         ←── 项目注册表（路径/repo/测试）│
│   ~/army/runs.jsonl            ←── 执行账本                  │
│   ~/army/pyf-docs/             ←── PRD/决策/报告知识库        │
└───────────────────────────┬─────────────────────────────────┘
                            │  每次唤起都从这里"水合"
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   army-run-pm        army-run-worker     army-run-auditor
   (cwd=~/army,        (cwd=worktree,      (cwd=项目目录,
    Opus, 只读)         Opus, 可写自分支)    Sonnet, 只读)
        │                   │                   │
        └─ 干完即弃 ────────┴───────────────────┘
           （没有常驻 agent；进程跑完就没了，状态早写回事实源）
```

注意这里**没有常驻的 agent 进程**。PM、Worker、Auditor 都是「唤起 → 从文件/GitHub 把这次需要的状态读进来（水合）→ 干活 → 把结果写回事实源 → 进程退出」。它们之间不靠共享内存、不靠消息传递、不靠长连接对话来协作——它们靠的是**同一份外置事实源**。Worker 开了 PR，这个事实写在 GitHub 上；Auditor 下次被唤起时去 GitHub 读到这个 PR，就知道该审什么。中间没有任何「PM 把消息发给 Worker」的环节。

这是从内容自动化项目（tv / bodhi 短剧流水线）里沿用过来的纪律：**记忆在文件里，不在聊天历史里。** 它带来三个直接好处，下一节展开。

`projects.yaml` 是把任务路由到正确工作环境的注册表。每个 project 登记它的路径、repo、worker 画像（`code` 走 PR-to-merge / `media` 走产物落盘 / `research` 走文件级改）和测试命令：

```yaml
projects:
  cue:
    department: software
    worker_type: code
    path: ~/claw/apps/cue
    repo: pyf-labrary/cue          # push 即 GH Actions 部署
    test: "npm run test"
    worktree_base: ~/army/worktrees/cue
  bywork:
    department: quant
    worker_type: research          # 非 git repo → 无 PR 流，走文件级 + ledger
    path: ~/bywork
    repo: null
```

派活的时候，「切项目」就是「换 Worker 的 `--cwd`」——而不是某个全局锁。Worker 一旦 `cd` 进项目目录，Claude Code 会自动加载那个项目自己的 `CLAUDE.md`，于是它立刻拿到该项目的工具链、约定、红线。一份注册表 + cwd 切换，就把「军团能干多少种活」做成了可插拔的——加一个部门 = 在 yaml 里加一行 + 给那个项目写好 `CLAUDE.md`。

---

## 3. 状态机 + 账本：无状态、可恢复、幂等

我的宿主是一台 WSL，它会关机、会被 Windows 重启、网络会断。任何依赖「进程一直活着、内存里记着进度」的设计在这种环境下都会碎。所以整套流水线的第一性原理是：**任何一个进程随时可以死，重来一遍不出错。**

实现它只需要两条规矩：

**规矩一：状态在 GitHub / 文件，不在内存。** 任务状态机的单一事实源是 GitHub Projects 的 `status` 字段，配合 label 路由（`auto-eligible` 表示军团可接、`army/triaged` 表示 PM 已分诊、`project:<name>` 指路由）。状态机长这样：

```
        pyf 开 Issue（打 auto-eligible 标）
                  │
                  ▼
              triage ──────────┐  PM 读 + 判断接不接
       接 + 拆解 │              │ 不接/缺信息
                  ▼              ▼
              ready          blocked（评论说明原因，等 pyf 输入）
       PM 派工   │
                  ▼
           in-progress ───┐  Worker：改码/测/开 PR + 记账
        worker 失败 3×    │
                  ▼        │
              review ◀─────┘  Auditor：审 diff + 安全扫
       不过 → 评论 + 回 in-progress（worker 修）
       过   │
                  ▼
        awaiting-approval     推审批给 pyf
       pyf 批准 │
                  ▼
               done           合并 PR + 关 Issue（Closes #N 自动关）
```

进程重启后，dispatcher 不靠记忆重建队列，而是重新 `gh issue list` / `gh pr list` + 读 Project status，把世界重新拼出来。session-id 映射丢了也无害——下次唤起重新水合即可。

**规矩二：每个动作执行前先查现态，做成幂等。** 这就是第 0 节那个「PM 对已合并的 Issue#1 no-op」的来历。PM 被唤起处理一个 Issue，第一件事是 `gh issue view` 看它现在什么状态；如果已经有开放/已合并的 PR，就不重复派工。Worker 同理：如果该 Issue 已经有开放 PR 了，就不重复开。`briefings`/`reports` 的幂等键是「日期 + 类型」，存在即更新而非新建。

账本是这套机制的可观测面。每个角色干完都调 `army-ledger` 追加一行 JSON 到 `runs.jsonl`。脚本本身只有几十行，核心是这段 Python：

```python
rec = {"ts": datetime.datetime.now(datetime.timezone.utc).isoformat(),
       "role": role, "task": task}
if issue:    rec["issue"] = int(issue) if issue.isdigit() else issue
if duration: rec["duration_s"] = float(duration)
if files:    rec["files_touched"] = [f for f in files.split(",") if f]
if result:   rec["result"] = result
with open(ledger, "a") as fh:
    fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
```

为什么是 append-only 的 JSONL 而不是数据库？因为它**跨运行时、可 grep/diff、永久留存、零依赖**。换底座、换模型，账本格式不变，历史可续。我要看的「军团整体健康、token 花在哪、各角色耗时」是跨工具聚合的，单厂 dashboard 给不了。回头看第 0 节那三行账本，字段就很清楚了：

```jsonl
{... "role": "worker",  "issue": 1, "duration_s": 125.0, "result": "ok"}   ← 写码 125 秒
{... "role": "auditor", "issue": 1, "duration_s": 90.0,  "result": "ok"}   ← 审码 90 秒
{... "role": "pm", "task": "...already resolved...no re-dispatch...", "issue": 1, "result": "ok"}  ← 幂等 no-op
```

`role` + `issue` 让你能把一单的全生命周期串起来，`duration_s` 是真实耗时（不是估的），`result` 是 ok/fail。这就是这条流水线的「飞行记录仪」。

---

## 4. 一次派工的完整链路：把脚本读一遍

现在把第 0 节那条闭环用代码走一遍。三个脚本，每个都短。

### 4.1 PM 分诊 + 派工（`army-run-pm`）

PM 被唤起后干的事，全写在注入给它的 prompt 里：

```bash
prompt="你是 PM，处理 $repo 的 Issue #$issue（项目 $proj）。
1) gh issue view $issue --repo $repo 读它。
2) 分诊：军团能否接、是否清晰可执行。不接/信息不足 → gh issue comment 说明原因，不派工，结束。
3) 接 → gh issue edit $issue --add-label army/triaged，再派 worker：
   ~/army/bin/army-run-worker $proj $issue $wmodel（建 worktree + 起 worker + 开 PR）。
4) 报告 worker 开的 PR 号 + 一句结论；记 ledger。
铁律：不亲自改代码、不合并 PR（合并是 pyf 审批）。Auditor 由 dispatcher 另行触发，你不用管。"

start=$(date +%s); cd ~/army
claude -p "$prompt" \
  --append-system-prompt "$(cat ~/army/roles/pm.md)" \
  --permission-mode default \
  --model opus \
  --allowedTools Bash Read Grep Glob
```

几个设计点：

- **`cd ~/army`** 是有意的——PM 运行在控制面之家，Claude Code 自动加载这里的 `CLAUDE.md`（组织宪法：服务谁、事实源、红线、工作路径铁律）。Worker/Auditor 运行在别处，拿不到这份，所以靠 `--append-system-prompt` 注入角色手册。这是「靠 cwd 拿身份」和「靠注入拿身份」两种手段的分工。
- **PM 派工是直接调下一个脚本** `army-run-worker`，不是「发消息给 Worker」。链式调用，进程级编排，没有队列中间件。
- **「分诊」是真判断**：PM 会判定 Issue 信息够不够、军团接不接得了。接不了就 `gh issue comment` 说明原因、打住，不硬派。这是把「PM 决策准确率」做成可度量的地方（验收目标是一周 3-5 单、准确率 >80%）。

### 4.2 Worker：worktree 物理隔离 + 改 + 测 + 开 PR（`army-run-worker`）

Worker 脚本最有意思的是 **git worktree** 那一段——它是「多 Worker 并行不打架」的物理基础：

```bash
branch="army/issue-$issue"
wt="$HOME/army/worktrees/$proj/issue-$issue"

git -C "$path" fetch origin --quiet || true
[[ -d "$wt" ]] || git -C "$path" worktree add "$wt" -b "$branch" origin/main 2>/dev/null \
  || git -C "$path" worktree add "$wt" -b "$branch"
```

每个 Worker 在 `~/army/worktrees/<proj>/issue-N` 下有一份**独立的工作目录 + 独立的分支**，都基于最新的 `origin/main` 拉出来。两个 Worker 同时改同一个 repo 的不同 Issue，物理上在两个目录、两条分支，互不污染对方的工作区。这比「同一个 checkout 来回切分支」干净得多——切分支会让正在跑的两个 agent 互相踩脚。

然后起 Worker，跑完记账：

```bash
cd "$wt"
claude -p "$prompt" \
  --append-system-prompt "$(cat ~/army/roles/worker.md)" \
  --permission-mode acceptEdits \
  --model "$model" \
  --allowedTools Bash Edit Write Read Grep Glob
rc=$?
dur=$(( $(date +%s) - start ))
~/army/bin/army-ledger --role worker --issue "$issue" --duration "$dur" \
  --result "$([[ $rc -eq 0 ]] && echo ok || echo fail)" --task "fix $repo#$issue ($proj)"
```

Worker 的 prompt 里钉死了一条红线：**绝不 push 到 main/master，只在本分支开 PR**，PR body 写 `Closes #N`（合并即自动关 Issue，这是状态机里「done」那一步的自动化）。`acceptEdits` 模式让它能连续改文件而不在每次编辑卡一次人工 ack——因为它在隔离 worktree 里，且最终产物要过 PR 门 + Auditor + 人审三道关，让它在沙盒里自由改是安全的。

### 4.3 Auditor：只读 review，且改不了代码（`army-run-auditor`）

Auditor 的核心已经在第 1 节讲过——白名单没有 Edit/Write。它的 prompt 里还藏了一个真实踩过的坑：

```bash
prompt="审查 PR #$pr（仓 $repo）。
1) gh pr view + gh pr diff 看改动，对照它要修的问题。
2) 审：修复是否正确、是否最小化、有无副作用/回归、安全（无注入/泄密/越权/误删）。
3) 结论用 gh pr comment 写回（用 comment，不要 review --approve，
   因作者同账号会被 GitHub 拒）：通过写「LGTM」+ 理由；有问题写「⚠️」+ 逐条列出。
SoD 铁律：你只读——不改任何代码、不 merge PR（合并是 pyf 的审批）。"
```

那个坑是：当前 Worker 和 Auditor 用的是**同一个 GitHub bot 账号**，GitHub 不允许 PR 作者 approve 自己的 PR。所以 Auditor 走的是 `gh pr comment` 写结论，而不是 `gh pr review --approve`。这是「身份分离没做到底」留下的一个真实约束，我把它记在了技术债清单里（见第 6 节）——要彻底分权，得给 Auditor 单开一个 bot 账号。

注意 Auditor **不合并 PR**。即使它评了 LGTM，合并这一下永远是我（人）来点。这是流水线里唯一一个永远保留的人工闸——也是「awaiting-approval → done」那一步。整条流水线我把人工干预收敛到了这一个点上。

---

## 5. 安全：硬约束 > 软约束

这条流水线敢「放手让 agent 自己改代码、自己开 PR」，前提是有几道闸拦住它干蠢事。我把安全分成三个层次，**确定性的优先级永远高于概率性的**。

**第一层：工具白名单（确定性，已落地）。** 前面讲过——Auditor/PM 没有 Edit/Write，结构上改不了代码。这是数学上拦得住的。

**第二层：总开关（确定性，已落地）。** 每个脚本第一行都是 `~/army/bin/army-guard || exit 0`。guard 读 `~/.army-state`，是 `PAUSE` 就让调用方自己 skip。一条命令停全军：

```bash
echo PAUSE > ~/.army-state    # 紧急停
echo RUN   > ~/.army-state    # 恢复（或删掉文件）
```

配套有一个 `army-watchdog`，curl 探 `api.anthropic.com`，探不到（出口代理挂了）就记日志退 1。

**第三层：红线规则（规划中，目前靠软约束 + 人审兜底）。** 我写了一份 runtime-无关的红线 spec，列了「永远要人 ack」的硬规则：push main/master、改 `.env`/secret/删 prod、≥10MB 二进制进站点、跳过内容合规备案等等。它的设计意图是**编译成 Claude Code 的 PreToolUse hook**，用硬编码 regex 在工具执行前拦——因为 LLM 是概率性的，「在 prompt 里写了别 push main」是软约束（可能不遵守、可能被任务诱导绕过、可能幻觉），而 hook 是确定性的。

但我要诚实：**这层红线 hook 现在还没挂上。** 当前 Worker 守红线靠的是三道软兜底——`roles/worker.md` 里的角色手册约束 + PR 门（它只能开 PR 不能直接合）+ 我最后人审。在挂上 hard hook 之前，我不会把它切到无人值守。而且红线 hook 上线策略也写死了「第一周只 log 不拦」——一个误判会卡死整条流水线，得先观察确认无误报再切真拦。

> 这三层的取舍逻辑：**能确定性拦的（白名单、总开关）现在就硬拦；要等 hook 才能确定性拦的（红线），在它就位前宁可用「软约束 + 收窄能力 + 人审」三重兜底压着，也不放开无人值守。** 安全这件事上，「还没做到的部分」必须当成「还没安全」对待，而不是「prompt 写了应该没事」。

---

## 6. 当前真实状态：哪些跑通了，哪些还没

技术博客最容易翻车的地方是把 demo 吹成生产。这一节专门划清楚边界。

**已经是能跑的实物（不是图纸）：**

- `~/army/` 控制面骨架全部就位：组织宪法 `CLAUDE.md`、三份角色手册、项目注册表、`bin/` 下 8 个脚本（共 305 行）、账本、知识库脚手架。
- 三角色（PM/Worker/Auditor）都在**真实 bug**（cue Issue#1）上端到端验证过，PR#2 已合并。
- 工具白名单 SoD、git worktree 隔离、`runs.jsonl` 账本、`army-guard` 总开关——这几样是实打实在用的。
- PM 的幂等：对已合并的 Issue 正确 no-op，核了 GitHub + 账本两个事实源。

**还没做完（按我自己的路线图，诚实列出）：**

- **dispatcher 仍是 DRY 模式。** `army-dispatch` 这个 poller 现在默认只「`gh` 查 + 记日志，不真起 PM」（防止意外烧 token），要 `ARMY_DISPATCH_LIVE=1` 才真唤起。也就是说目前每一单仍是我手动 `army-run-pm <proj> <N>` 触发的，**自动接单的最后一根线还没接通**。
- **Auditor 还靠手动触发。** poller 里「发现 review 态新 PR → 自动唤 Auditor」这条路径还没写，当前是我手动 `army-run-auditor`。
- **红线 hard hook 没挂。** 见第 5 节——无人值守前必须先挂上（log-only 先行）。
- **Telegram 桥 + systemd 常驻没接。** 设计里 PM 应该能收 Telegram 的 `@PM` ping、审批走 IM 卡片，dispatcher 应该是 systemd 用户服务定时跑。这两样都还没落地（systemd unit 这台机器上目前也确实没装）。换句话说，**它现在是一套「手动触发也能跑通全闭环」的流水线，但还不是 24h 无人值守的常驻系统。**

**技术债（小但真实）：**

- Worker 的 ledger 记了两遍（角色手册自记 + 包装脚本记），该二选一。
- 凭据管理：项目 remote 一律走 SSH / 凭据助手，别让 token 明文落进 `.git/config`。
- Worker 的 worktree 在 `~/army/worktrees/` 下、不在项目树内，拿不到工作区根的 `CLAUDE.md`（只能拿项目自身那份）——需要时用 `--add-dir` 补。
- Auditor 与 Worker 同 bot 账号，导致前面那个「不能 self-approve、只能 comment」的妥协——要彻底分权得单开账号。

把这些列出来不是给自己挑刺，而是因为**一套自动开发流水线真正的难点恰恰在这些边角**：身份分离、凭据管理、幂等、续跑、误判防护。能跑通一个 happy-path demo 不难，难的是把这些边角逐个收口到敢无人值守。这份清单就是从 demo 到生产之间还差的路。

---

## 7. 为什么没上 Airflow / 没自建编排框架

最后回到最初那个判断，把它讲透。一开始我也考虑过更「正经」的方案——上一篇方法论文里甚至画过 13 个 agent 槽位 + Sentry + Grafana + canary 的团队版大图。落到单人个人项目时我全砍了，理由是：

**Claude Code 原生就给了搭多 agent 编排所需的全部机制：**

- `claude -p` headless 模式 = 可脚本化唤起的 agent 进程；
- `--append-system-prompt` = 给同一个底座注入不同角色身份；
- `--allowedTools` = 确定性的权限隔离（SoD 的结构保证）；
- `--model` per-task = 模型分层旋钮（判断用 Opus、审查用 Sonnet）；
- PreToolUse hook = 硬红线所需的确定性闸门（待挂）；
- 加载 cwd 的 `CLAUDE.md` = 每个项目自带工具链/约定/红线。

剩下要我「自己搭」的，**根本不是 agent loop、不是工具执行器、不是记忆引擎**——那些借底座的就好。要搭的只是一层薄胶水：项目注册表（一份 yaml）、三个唤起脚本（链式调用，进程级编排）、一个账本（append JSONL）、一个总开关（读一个文件）。状态机的事实源直接用 GitHub Issues/PR/Projects——它本来就是工程团队的工单池 + 评审台 + 看板，免费、有 API、零运维。

> 一句话总结这个取舍：**编排框架（Airflow/队列/状态机引擎）解决的是「进程怎么调度、状态存哪、消息怎么传」——但当你把状态全外置到 GitHub + 文件、让每个 agent 干完即弃、用进程链式调用替代消息传递时，这些问题根本不出现，于是框架也就不需要了。** 300 行脚本不是「简陋版的 Airflow」，它是一个**根本不需要 Airflow 的架构**。

这也是我最想留给读者的工程判断：搭多 agent 自动开发流水线，先别急着选编排框架。先把三件事想清楚——**职责怎么分权（用白名单，不用 prompt）、状态放哪（外置到 GitHub/文件，别留内存）、安全闸怎么确定性化（hook/白名单，不靠模型自觉）**。这三样想透了，剩下的胶水可能比你以为的薄得多。

---

## 附：复现这套的最小清单

如果你想照着搭一套自己的：

1. **底座**：Claude Code，登录订阅跑（headless `claude -p`），边际成本压到接近零。
2. **事实源**：GitHub repo + Issues + Projects + 一份 `projects.yaml` + 一个 append-only `runs.jsonl`。状态全往这里放。
3. **三个唤起脚本**：PM（`--allowedTools Bash Read Grep Glob`，cwd=控制面之家）、Worker（加 `Edit Write` + `acceptEdits` + git worktree 隔离）、Auditor（去掉 `Edit Write`，结构上只读）。链式调用，不上队列。
4. **总开关**：每个脚本第一行读一个 state 文件，`PAUSE` 就自退。
5. **红线**：写一份 runtime-无关的硬规则 spec，编译成 PreToolUse hook，**先 log-only 一周**再切真拦。无人值守前必挂。
6. **验收**：拿真实的低风险 bug（P3/cosmetic）开练，目标一周跑通 3-5 单、PM 决策准确率 >80%，再逐步把 dispatcher 从 DRY 切 LIVE、把 Auditor 自动化、接 IM 审批。

别一上来就追无人值守。先让「手动触发也能跑通全闭环」稳定下来——那已经是把 AI 从「单兵 Copilot」毕业成「会自己分诊、写码、自审、走流程」的流水线了。后面那几根线（自动接单、IM 审批、常驻）是锦上添花，不是地基。
