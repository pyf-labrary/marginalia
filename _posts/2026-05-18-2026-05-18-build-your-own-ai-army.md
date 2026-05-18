---
layout: "post"
title: "搭建你自己的 AI 军团：从单兵 Copilot 到 85% 自动化的工程闭环"
date: "2026-05-18 12:00:00 +0800"
author: "Marginalia"
description: "从单兵 Copilot 升级到 PM/Worker/Auditor 三层架构 AI 军团的 4-6 周施工路线图，含 GitLab + ZenTao + Confluence + 企微 + Sentry/Grafana 完整案例编制。"
excerpt: "从单兵 Copilot 升级到 PM/Worker/Auditor 三层架构 AI 军团的 4-6 周施工路线图，含 GitLab + ZenTao + Confluence + 企微 + Sentry/Grafana 完整案例编制。"
tags: [AI军团, Claude Code, 工程化, 自动化]
---

> 日期：2026-05-18
> 适用栈参考：Claude Code（Opus 4.7 + Sonnet 4.6 + Haiku 4.5）/ 任意 Git 平台 / 任意 issue tracker / 任意 IM 通知通道
> 目标读者：已经把 AI Coding 用到日常的开发者；想从「让 AI 帮我写代码」升级到「让一支 AI 军团替我跑产研流水线」

---

## 0. TL;DR

**一句话**：把 AI 从「单兵 Copilot」升级成「PM / Worker / Auditor 三层金字塔 + 权限矩阵 + canary 回路」的工程闭环，6 周内把日常研发自动化率从 35% 推到 85%。

**按 ROI 排，三个杠杆 + 一个长期项**：

| # | 杠杆 | 投入 | 预期增益 | 周期 |
|---|---|---|---|---|
| L1 | **Action Permission Matrix**（GREEN/YELLOW/ORANGE/RED 四档分级 + PreToolUse hook） | 2 天 | 砍掉 60% 人工 ack 摩擦 | Week 1 |
| L2 | **反馈回路**（Sentry → issue tracker → PM agent → Worker → 反向回填） | 1 周 | 解锁「线上痛点 → hotfix」闭环 | Week 2-3 |
| L3 | **Canary + 自动回滚**（低风险 PR 直接 auto-merge + 部署 beta） | 2 周 | 把「ack 每个 MR」降为「看灰度报告」 | Week 4-6 |
| L4 | **PM/Worker/Auditor 金字塔常驻**（cron-driven 多 agent 编队） | 持续 | 让军团 24h 跑 | 后续 |

**阶段性目标**：Week 1 → 50% / Week 3 → 65% / Week 6 → 80% / 稳态 → 85%。

**终态指标**：

- 每日 ack 次数 15+ → 3-5
- P2/P3 bug 响应时长 4h → 20min
- AI PR 平均生命周期 6h → 30min
- 灰度逃逸次数 → 0（红线由规则拦）

**成本**（10-20 人团队规模）：一次性投入 17 工作日 + 周维护 5.5h + 月 token 账单约 $700，月省 ~75h 个人时间。

**永远不解锁的红线**：push 主干 / 生产 DB migration / 真钱支付 / 删生产资源 / 业务定价决策 — 硬编码 regex 拦截，不依赖 LLM 判断。

**底线认知**：不是堆 prompt，是搭工程闭环。Prompt 优化的边际收益很快递减，工程闭环才是护城河。

---

## 1. 心法：为什么是「军团」而不是「更强的 Copilot」

### 1.1 单兵 Copilot 的天花板

不管你的 prompt 多花哨、上下文多长，单 agent 模式有三个硬上限：

1. **串行瓶颈**：一次只能干一件事；你 ack 等待时间 = 实际产出时间的 3-5 倍
2. **上下文污染**：长对话里早期决策被后期 token 稀释；一次 50K context 后判断质量明显下降
3. **角色错位**：让同一个模型同时干「写代码 + review 自己代码 + 决定要不要 deploy」违反职责分离

### 1.2 军团模式怎么破

| 单兵痛点 | 军团解法 |
|---|---|
| 串行等待 | 3-7 个 worker 并行，每个独立 worktree |
| 上下文污染 | PM 单次会话保持 < 50K，每个任务派给新 worker |
| 角色错位 | PM / Worker / Auditor 三层职责分离，Auditor 不持有写权限 |
| ack 疲劳 | 按风险分级（GREEN/YELLOW/ORANGE/RED），只 ack 真正需要决策的 |

核心一句话：**这不是让 AI 替你工作，而是把你从 ack 机器变回决策者**。

---

## 2. 三层架构总览

```
┌──────────────────────────────────────────────────────────┐
│  上层：PM Agent (Opus 类强模型) — 接单 / 拆解 / 派工 / 验收 │
│  常驻 cron + 反应式（IM @我 / 新 bug / 监控告警）            │
└──────────────────────────────────────────────────────────┘
                          ↓ 派任务
┌──────────────────────────────────────────────────────────┐
│  中层：Worker Pool (Sonnet 类性价比模型, 3-7 并行)         │
│  每个 worker = 独立 worktree + 完整 PR-to-merge 能力       │
└──────────────────────────────────────────────────────────┘
                          ↓ 提交产物
┌──────────────────────────────────────────────────────────┐
│  下层：Auditor Pool (Haiku 类便宜模型, 巡检 / 守门 / 回归) │
│  代码 review / 安全扫描 / 灰度 watcher / 日报汇总           │
└──────────────────────────────────────────────────────────┘
                          ↓ 输出
┌──────────────────────────────────────────────────────────┐
│  反馈回路：IM 通知 / 日报 / 监控告警 / 灰度 SLO            │
│  + 红线触发 → 暂停整条流水线 + P0 告警                     │
└──────────────────────────────────────────────────────────┘
```

### 2.1 职责分配原则

- **强模型只做判断 + 拆解 + 验收**，单次会话短（< 50K token），节省 token
- **中档模型干 80% 实活**，并行最高 7 个 worker（受 IDE/Code Agent 并发限制）
- **便宜模型干机械审计**（lint 解释、test fail 分类、灰度 SLO 抽样），便宜量大
- **没有任何 agent 同时持有写权限和审计权限**（职责分离）

### 2.2 为什么强模型不能干所有事

按典型按 token 计价，Opus 类比 Sonnet 类贵 5×、比 Haiku 类贵 15×。让 Opus 干「读 lint 报告判断哪行是 false positive」是赔本买卖。

但反过来，让 Haiku 类干「这个 bug 算不算需要回滚的级别」这种判断也不行——出错代价远高于省下来的 token 钱。

**规则**：判断 → 强模型；干活 → 中档；机械 → 便宜。

---

## 3. 阶段路线图

### Phase 1（Week 1）：Action Permission Matrix — 把直觉变成规则

这是整套军团最被低估的一步。多数人上来就堆 prompt、起 cron，结果第一周就出事——因为没有任何机制拦住模型干蠢事。

**核心产出**：一份动作分级表 + 一个 PreToolUse hook

#### 3.1.1 动作四档分级

| 等级 | 含义 | 典型动作 | 自动化策略 |
|---|---|---|---|
| **GREEN** | 完全可逆 / 本地 | 改文档 / 跑 lint / 改本地任务状态 / 发 IM 汇报 | 全自动，不 ack |
| **YELLOW** | 共享但可回滚 | push 到 feature 分支 / 开 PR / 改 dev 环境配置 | 自动 + 事后通知 |
| **ORANGE** | 共享难回滚 | beta 部署 / merge PR / 改测试环境 .env | canary 通过即自动（Phase 3 解锁） |
| **RED** | 灾难性 | push master / 生产部署 / DB migration / 真钱支付 | **永远人 ack**（不解锁） |

#### 3.1.2 规则编码

把规则写成机器可读 YAML，挂到 hook 上：

```yaml
# rules/action-permissions.yaml
rules:
  - pattern: "git push.*\\b(master|main|prod)\\b"
    level: RED
    reason: "不能直接 push 主干分支"

  - pattern: "git (reset --hard|checkout --) .*"
    level: RED
    reason: "可能吞掉别人未推送的工作"

  - pattern: ".*--force.*"
    level: ORANGE
    reason: "force 操作要 canary 路径，不能直接放"

  - pattern: "(stripe|paypal).*--live"
    level: RED
    reason: "真钱接口必须人 ack"

  - pattern: "kubectl apply -f .* -n (prod|production)"
    level: RED
    reason: "生产集群修改必须 review"

  - pattern: "rm -rf /"
    level: RED
    reason: "显式拦截灾难命令"
```

#### 3.1.3 hook 落地

在你的 Code Agent 的 `PreToolUse` 钩子里跑一个脚本：

- GREEN → 直接放行
- YELLOW → 放行 + 追加一行到 `auto-actions.log`
- ORANGE → 转 canary 流程（Phase 3）；未上线前仍人 ack
- RED → 阻断 + 必须显式 ack 才能继续

**重要**：第一周观察期只 log 不 enforce，确认无误报再切真拦。否则一个误判把军团整条流水线卡死。

#### 3.1.4 经验

- 规则文件必须进 git，团队/未来的自己能 review
- 规则匹配优先级写死 `RED > ORANGE > YELLOW > GREEN`，多条命中取最高
- 不要相信 LLM 来判断「这条命令属于哪一档」——硬编码 regex 兜底，再让 LLM 做语义补充判断

---

### Phase 2（Week 2-3）：反馈回路 — 让军团知道「上次干得好不好」

没有反馈的 AI 军团就是失控的流水线。Phase 2 解决：怎么把「线上出问题了」「用户报 bug 了」「监控异常了」自动喂回军团。

#### 3.2.1 监控 → issue tracker 自建桥

最常见的回路：**错误监控（Sentry / Bugsnag / 自建）→ issue tracker（Jira / GitHub Issues / 自建）→ PM agent 接单**。

关键工程要素：

1. **准入阈值**：不是每个监控告警都建 issue。典型准入条件：
   ```
   events > 10 (短时间复现 10 次以上)
   AND affected_users > 3
   AND level >= error
   ```
   否则会把 PM agent 淹没在噪音里。

2. **去重**：监控系统的 issue_id 进 issue tracker 的某个字段（keywords / labels），24h Redis SET 防重复建单。

3. **反向回填**：PR 描述自动带 `Closes #123`，merge 后通过 Git 平台 webhook 反向把 issue 标 resolved。这一步看起来微不足道，但少了它整条回路就是单向的，PM agent 不知道自己上次提的 PR 到底解决问题了没有。

#### 3.2.2 PM agent 接单 prompt 模板

PM 不写代码，只判断。短 context、JSON 输出：

```
你是军团的 PM。下面是一个监控触发的新 bug：
{bug 详情 + stack trace + 最近 10 个相关 commit}

判断：
1. 这个 bug 能不能 AI 自动修？(YES / NO / NEED_INFO)
2. 如果 YES，列出最多 5 步修复计划
3. 如果 NO，说明为什么需要人介入
4. risk 评级 (low / mid / high)

只输出 JSON，不写代码。
```

PM 判 YES 才 spawn 一个 worker（独立 worktree）去实际修。

#### 3.2.3 24h 后部署监控

部署完不是结束。Phase 2 的最后一块：**部署后 24h 内同 issue 复发 → 自动回滚 + P0 告警**。

这一步逼着你把回滚做成单一入口（一个 `rollback.sh`，不是各种 ad-hoc 操作的集合）。一旦做了，整个团队的 incident 响应都受益。

---

### Phase 3（Week 4-6）：Canary Gate — 解锁 ORANGE 级自动化

最重的一步。做完之后 AI 真能「自己 push beta」。

#### 3.3.1 流量切分

不管你跑 k8s / docker / 物理机，核心是**让两个版本同时跑**，按流量比例分配：

- 入口层（nginx / envoy / 云负载均衡）配 5% 流量到新版本 pod
- 95% 流量保留旧版本

实现方式很多：nginx `split_clients`、envoy weighted clusters、k8s Argo Rollouts / Flagger、各家云原生 canary 方案。挑一个能在 30 秒内回切的就行。

#### 3.3.2 SLO 自动判定

选三个核心指标做 AND 判定：

| 指标 | 典型阈值 |
|---|---|
| HTTP 5xx 率 | canary ≤ 旧版 + 0.5% |
| 核心接口 P95 延迟 | canary ≤ 旧版 × 1.2 |
| 业务关键失败率（如下单失败 / agent run 失败） | canary ≤ 旧版 + 1% |

30 分钟观察窗口内全部满足 → 切 100% + 通知；任意一项不满足 → 自动 revert + 监控留痕。

**重要**：三指标 AND 而不是 OR。OR 会让噪音指标误触发回滚，AND 让回滚信号干净。

#### 3.3.3 PR 风险评分

PM agent 在 PR 合并前算一个 risk score：

```
risk_score = w1 * touches_auth +
             w2 * touches_billing +
             w3 * touches_migration +
             w4 * (lines_changed > 500) +
             w5 * touches_critical_path
```

- `risk = low`（UI 文案 / 文档 / 单测 / 内部工具）：canary 通过即自动 merge + deploy
- `risk = mid`（业务逻辑、新 API）：canary 通过 + 人点一次 yes
- `risk = high`（auth / billing / migration）：永远人 review 全 diff

`touches_critical_path` 用 git log heatmap 加权——历史上被反复修改的文件大概率是核心路径。

#### 3.3.4 回滚演练

**每周让 Auditor 跑一次「故意失败的 canary」**，确认回滚链路活着。

很多团队搭完 canary 就放在那不演练，等到真出事的时候才发现回滚脚本里某个环境变量上个月就 broken 了。

---

### Phase 4（持续）：金字塔常驻

前三步做完，最后这一步把军团变成 24h 跑的常驻系统。

#### 3.4.1 PM 常驻 cron

每天早上一个固定时间触发：

- 扫产品文档系统过去 24h 更新的 PRD
- 扫 issue tracker 新 P0/P1 bug
- 扫 IM 群里 @我或 @机器人 的消息
- 输出一份 `briefing.md`，列出「今天打算让军团干啥」
- 等你 ack 一次（每天 1 次 ack 比每个任务 1 次 ack 划算 10×）

#### 3.4.2 Worker pool

用你的 Code Agent 起 3-7 个 worktree-isolated worker（每个 worker 独立分支 + 独立 PR + 独立任务绑定）。worker 之间不互相依赖；冲突由 PM 重排。

#### 3.4.3 Auditor 巡检 routine

每 4h 跑一次便宜模型巡检：

- stale container / drift env / 过期 secret
- 待合 PR > 24h → 提醒 PM 复审
- 待办 issue > 7 天 → 标 stale
- 输出审计日志

#### 3.4.4 每晚日报

22 点 cron 自动汇总当天：

- 开了几个 PR / 合了几个 / 修了几个 bug
- canary 触发次数 / 回滚次数
- 触发了几次 RED 拦截（被拦的命令 + 原因）
- 推送到你的 IM 私聊

---

## 4. 红线清单（永不解锁）

不管军团多成熟，以下动作永远人 ack：

| 动作 | 理由 |
|---|---|
| `git push` 到主干分支 | 不可逆 + 影响 prod |
| `git reset --hard` 共享分支 | 吃别人的 commit |
| 生产环境 DB migration | 高风险 + 难回滚 |
| 真钱支付接口（Stripe live / 银联 / 支付宝）写操作 | 涉及真钱 |
| 改生产环境 `.env` / secret | 配置隔离原则 |
| 删除 K8s namespace / 集群 | 灾难性 |
| 业务定价 / 产品取舍 / PRD 决策 | 需人判断 |
| 首次接入新外部 API（OIDC / 支付 / 跨境合规） | LLM 容易脑补字段、踩 schema 坑 |
| `kubectl delete` / `terraform destroy` 生产资源 | 灾难性 |
| 直接 `curl` 生产 API（绕过封装好的 CLI） | 容易传错 header / 缺鉴权 |

红线判定不要依赖 LLM——**硬编码 regex grep 兜底，模式匹配在前，LLM 推理在后**。

---

## 5. 度量指标

### 5.1 健康指标（每天看）

| 指标 | 含义 |
|---|---|
| AI 提 PR / 总 PR | 自动化覆盖率，目标 70% |
| PR 平均人工接触次数 | 目标 1 次（仅看 canary 报告） |
| 每天 ack 次数 | 目标 ≤ 5 |
| P2/P3 bug 响应时长 | 目标 ≤ 20min |
| canary 回滚成功率 | 目标 ≥ 99% |
| RED 规则拦截次数 | 突增表示规则误判或 PM 走偏 |
| 灰度逃逸次数（线上才发现的回归） | 目标 0 |

### 5.2 异常告警

- `canary_rollback` 24h > 3 → 暂停 Phase 3 自动化
- `red_line_blocked` 1h > 5 → 检查规则误判
- PM 决策 reject 率 > 30% → PM prompt 需要调
- 任意 RED 规则被绕过 → P0 告警

### 5.3 阶段目标

| 阶段 | 自动化率 | 每日 ack 次数 | AI PR 生命周期 |
|---|---|---|---|
| 起点 | 35% | 15+ | 6h |
| Phase 1 末 | 50% | 9 | 4h |
| Phase 2 末 | 65% | 7 | 2h |
| Phase 3 末 | 80% | 5 | 1h |
| 稳态 | 85% | 3-5 | 30min |

---

## 6. 主要风险与缓解

| 风险 | 缓解 |
|---|---|
| 规则误判导致 GREEN 动作误删 prod 数据 | YELLOW 以上全部走 git，永不直接改 prod 数据 |
| 监控噪音淹没 issue tracker | 阈值（events>10 + users>3）+ 24h 去重 |
| Canary watcher 误判通过 → 灰度逃逸 | 三指标 AND + 前 10 次人 spot check |
| PM agent 把红线问题判成 auto | red_list 硬编码 grep 兜底，不依赖 LLM |
| Worker 之间 worktree 冲突 | PM 拆任务时强制单文件夹独占 |
| Token 成本爆炸 | 强模型限 50K context；便宜模型占调用量 60% |
| 整个军团失控 | 留一个总开关：`echo PAUSE > army-state`，所有 cron 启动前 check |

**总开关脚本**：

```bash
# 紧急停军团
echo "PAUSE" > ~/.army-state

# 所有 cron routine 启动前的第一行
[[ "$(cat ~/.army-state 2>/dev/null)" == "PAUSE" ]] && exit 0
```

简单粗暴，但比任何花哨的 feature flag 系统都靠谱。

---

## 7. 入门 PoC 优先级

不要试图一次性搭完所有 Phase。按「能跑通即看到价值」排序，每个 PoC 1 周内做完：

### PoC 1：低优先级 bug → PR → IM 汇报 ★推荐起点

- **为什么**：bug 边界清晰、有客观验收（复现 + 测试通过）、失败成本极低
- **范围**：只接 P2/P3 + 标签 `auto-eligible` 的 bug
- **不接**：P0/P1（涉判断）、auth/billing 类（红线）
- **验收**：1 周跑通 3-5 个 bug，PM 决策准确率 > 80%

### PoC 2：依赖升级 + 测试回归

- **为什么**：纯机械、有 audit 客观信号（npm audit / cargo audit / pip-audit）
- **范围**：minor / patch 自动 PR，major 走人 review
- **配套**：类似 Renovate / Dependabot 思路，但用 PM agent 做「哪些 major 该手动 review」判断

### PoC 3：文档 / i18n 同步

- **为什么**：纯文本变更、零 prod 风险
- **范围**：英文文案落地后自动补 zh/ja；架构文档改动同步到 onboarding 文档
- **价值**：练手 + 把军团基础设施跑顺

### PoC 4：跨系统巡检日报

- **为什么**：纯读、0 风险、立即看到「军团在干啥」
- **范围**：Git 平台 PR / issue tracker / 监控告警 / 容器健康
- **产出**：每天固定时间 IM 推送

### 不推荐先做的 PoC

- **Feature 开发**：太大、太多业务判断，先把基础设施跑顺
- **Canary deploy**：基础设施投入 2 周起步，放到 Phase 3
- **PRD → 任务自动拆解**：判断密集，留给 PM agent 成熟后做

---

## 8. 投入产出预估

| 阶段 | 一次性投入 | 周维护 | 月节省（按 ack 时长） |
|---|---|---|---|
| Phase 1 | 2 工作日 | 0.5h | ~15h |
| Phase 2 | 5 工作日 | 1h | ~20h |
| Phase 3 | 10 工作日 | 2h | ~30h |
| Phase 4 | 持续 | 2h | ~10h |
| **合计** | **17 工作日** | **5.5h/周** | **~75h/月** |

按月 22 工作日 × 8h = 176h，节省 75h ≈ 42% 个人时间。

考虑到节省的不只是时间，更是「上下文切换成本」，实际感受会更显著。

---

## 9. 常见误区

### 9.1 「先把 prompt 调好再说基础设施」

错。Prompt 优化的边际收益很快递减；工程闭环才是真正的护城河。

一支基础设施完备的军团 + 平庸 prompt > 顶级 prompt + 没有反馈回路。

### 9.2 「LLM 越强越好，全用 Opus」

错。Opus 干 Haiku 能干的活，是给账单送钱。Token 成本是真实约束，按职责分模型才能跑长期。

### 9.3 「不需要 PM agent，让 Sonnet 自己接单」

错。Sonnet 接单容易在「这个 bug 该不该自动修」上犯错（典型：把涉及 auth 的 bug 判成 low risk）。PM 用强模型保判断质量，是性价比最高的一笔投资。

### 9.4 「Canary 太重，跳过这步」

错。Canary 不是为了赶时髦的高级 SRE 实践，是为了**把人从「ack 每个 PR」解放到「看灰度报告」**。没有 canary，Phase 3 永远做不到 80% 自动化。

### 9.5 「记忆系统能替代规则系统」

错。记忆是软约束（LLM 可能选择不遵守），规则是硬约束（hook 直接拦）。RED 红线必须走规则，不能寄希望于「我在 memory 里写过了模型会记得」。

---

## 10. 一句话总结

**这不是「让 AI 替你工作」，而是「把你从 ack 机器变回决策者」。**

军团的本质：让你只关心 RED 类决策 + 周/月级方向，把 GREEN/YELLOW/ORANGE 全卷进流水线。

可以达到 85% 的稳态，但前提是花两周把基础设施（permission matrix + canary）搭对——不是堆 prompt，是搭工程闭环。

---

## 11. 具体案例：GitLab + ZenTao + Confluence + 企微 + Sentry/Grafana

下面用一个国内中型研发团队常见栈，给出一份**可直接照抄的军团编制**。规模假设：

- 10-20 人研发团队
- 1 个主产品 + 2-3 个内部工具
- 已有 GitLab self-hosted、ZenTao 项目管理、Confluence 知识库、企微办公、Sentry 错误监控、Grafana 指标看板

### 11.1 工具链职责映射

| 系统 | 在军团中的角色 | 谁来读 | 谁来写 |
|---|---|---|---|
| **GitLab** | 代码 + MR + CI + webhook 总线 | Worker / Auditor | Worker（开 MR）/ PM（merge 决策） |
| **ZenTao** | 任务/bug 调度中心（军团的「工单池」） | PM（接单）/ Auditor（巡检） | PM（建任务）/ Worker（标进度）/ Bridge（自动建单） |
| **Confluence** | PRD / 决策文档 / 周报存档 | PM（早会扫描）/ Worker（取需求） | PM（写 briefing）/ Auditor（写日报） |
| **企微** | 唯一通知出口 + 唯一 ack 入口 | — | PM / Auditor（推送）/ 你（@回复 ack） |
| **Sentry** | 线上错误信号源 | Bridge（轮询 / webhook）/ Auditor（24h 监控） | — |
| **Grafana** | 指标信号源（canary SLO 判定） | Canary Watcher / Auditor | — |

**关键设计**：

- **企微是唯一的人机交互通道**。不要让军团从 IM / 邮件 / Slack 多通道喂消息——你会漏。所有 ack、所有告警、所有日报都收敛到一个企微群（@机器人 + 你私聊）。
- **ZenTao 是军团的事实任务源**。哪怕 bug 来自 Sentry、需求来自 Confluence，最终都得在 ZenTao 落一条记录，PM 才接得到。没在 ZenTao 的需求军团一律不接（避免歧义）。
- **GitLab webhook 是反馈回路的脊柱**。MR 状态变化、Pipeline 成败、Sentry 关联 issue 都靠 GitLab webhook 串起来。

### 11.2 军团编制表

| 角色 | 模型 | 数量 | 触发方式 | 单次会话上下文上限 | 职责 |
|---|---|---|---|---|---|
| **PM Lead** | Opus 4.7 | 1 | 每天 9:00 cron + 反应式（@机器人 / Sentry P0 / ZenTao 新 P0） | 50K | 接单 / 拆解 / 派工 / 验收 / 走 RED 时给你提 ack |
| **Worker** | Sonnet 4.6 | 5 | PM 派单 spawn（worktree 隔离） | 100K | 拉分支 / 改代码 / 跑测试 / 开 MR / 标 ZenTao 进度 |
| **Reviewer** | Sonnet 4.6 | 2 | MR 开了即触发 | 80K | 代码 review（功能 + 风格 + 测试覆盖）/ 给 LGTM 或要求改 |
| **Security Auditor** | Sonnet 4.6 | 1 | MR 开了即触发（与 Reviewer 并行） | 80K | OWASP 扫描 / secret 泄露检查 / 鉴权变更告警 |
| **Canary Watcher** | Haiku 4.5 | 1 | MR merge 后部署 beta 时触发，常驻 30min | 20K | Grafana 三指标抽样 / SLO 判定 / 触发 promote 或 rollback |
| **Sentry Bridge** | Haiku 4.5 | 1 | Sentry webhook 触发 | 10K | 阈值过滤 / 去重 / 建 ZenTao bug / 反向回填 |
| **Patrol Auditor** | Haiku 4.5 | 1 | 每 4h cron | 30K | stale MR / stale 容器 / 过期 secret / drift 检查 |
| **Daily Reporter** | Haiku 4.5 | 1 | 每天 22:00 cron | 40K | 汇总当天动作 / 写 Confluence 日报 / 推企微 |

**编制小计**：1 Opus + 8 Sonnet + 4 Haiku = **13 个 agent 槽位**，并发上限 7（受 Claude Code `/team` 限制），实际同时活跃的 ~3-5 个。

**月 token 预算估算**（中等活跃度，按 2026-05 价格）：

| 角色 | 每月调用次数 | 平均 token | 月成本 |
|---|---|---|---|
| PM Lead (Opus) | ~150 | 30K in / 5K out | ~$200 |
| Worker × 5 (Sonnet) | ~600 | 60K in / 15K out | ~$300 |
| Reviewer + Security (Sonnet) | ~400 | 40K in / 8K out | ~$120 |
| Haiku × 4 | ~3000 | 15K in / 3K out | ~$80 |
| **合计** | | | **~$700/月** |

按节省 75h/月 × 时薪保守 ¥200 计，月节省 ~¥15000，ROI ≈ 3×。

### 11.3 端到端流程图：Sentry 告警 → 自动 PR → 合并

```
┌─────────────┐
│   Sentry    │  events>10 && users>3 && level>=error
│  (prod alert)│
└──────┬──────┘
       │ webhook
       ▼
┌──────────────────┐
│ Sentry Bridge    │  Haiku · 阈值 + 去重 + 建单
│ (Haiku 4.5)      │
└──────┬───────────┘
       │ POST /zentao/api/bugs (label=auto-sentry)
       ▼
┌──────────────────┐
│   ZenTao         │  新 bug · 等 PM 扫描
│   bug pool       │
└──────┬───────────┘
       │ 15min cron 扫描
       ▼
┌──────────────────┐         ┌──────────────────────┐
│ PM Lead          │ ─────►  │ 红线检查 (硬编码 grep)│
│ (Opus 4.7)       │ ◄─────  │ 命中 RED → 转人 ack   │
└──────┬───────────┘         └──────────────────────┘
       │ 判定 = auto · risk = low/mid
       │ spawn worker (worktree 隔离)
       ▼
┌──────────────────┐
│ Worker N         │  Sonnet · 改代码 · 跑测试 · 开 MR
│ (Sonnet 4.6)     │
└──────┬───────────┘
       │ git push + MR (描述带 "Resolves zt#xxx")
       ▼
┌──────────────────┐
│   GitLab         │  CI 跑 lint + 单测 + 构建
│   MR             │
└──────┬───────────┘
       │ webhook: pipeline succeeded
       ▼
┌──────────────────┐ ┌──────────────────┐
│ Reviewer         │ │ Security Auditor │  并行
│ (Sonnet 4.6)     │ │ (Sonnet 4.6)     │
└──────┬───────────┘ └────────┬─────────┘
       │ 双 LGTM       │
       └───────┬───────┘
               ▼
    ┌─────────────────────┐
    │ PM Lead 二次验收     │  risk 评级 + 决策
    │ (Opus 4.7)          │
    └──────────┬──────────┘
               │
        ┌──────┴──────┐
   risk=low      risk=mid/high
        │              │
        ▼              ▼
  auto-merge      企微 @你 ack
        │              │
        └──────┬───────┘
               ▼
    ┌─────────────────────┐
    │  GitLab merge       │  → CI 部署到 beta canary
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Canary Watcher      │  Haiku · 抽样 Grafana 30min
    │ (Haiku 4.5)         │
    └──────────┬──────────┘
               │
        ┌──────┴──────┐
   SLO 通过         SLO 失败
        │              │
        ▼              ▼
   promote 100%   auto-rollback
        │              │
        └──────┬───────┘
               ▼
    ┌─────────────────────┐
    │ 反向回填 ZenTao bug  │  status=resolved + MR 链接
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ 企微通知（你 + 群）   │  ✅ zt#xxx 已修复（MR !123）
    └─────────────────────┘
```

### 11.4 PM 早会流程图：9:00 cron 一次性 ack

PM 不在每个任务上找你，而是每天早 9 点一次性给你一份「今天打算干啥」的 briefing：

```
09:00 cron 触发
   │
   ├─► 拉 Confluence 过去 24h 更新的 PRD
   │      └─► 摘要每篇 PRD 的核心变更
   │
   ├─► 拉 ZenTao 新 P0/P1 bug
   │      └─► 按红线 grep 过滤
   │
   ├─► 拉企微 @机器人 消息（昨日 19:00 - 今早 9:00）
   │
   ├─► 拉 GitLab 待合 MR（昨日新开 + 已挂 24h+）
   │
   └─► 输出 Confluence 页面《YYYY-MM-DD 军团 briefing》
          ├─ 今日计划自动派工（YELLOW，事后报）
          ├─ 今日计划走 canary（ORANGE，看灰度报告）
          ├─ 需你决策（RED，列具体 ack 点）
          └─ 推企微卡片 → @你 → 一次 ack
                            │
                            ▼
                       军团整天按 briefing 跑
                       异常才再次打扰你
```

**关键**：briefing 不是「请求批准」，而是「我准备这么干，除非你拦」。默认 30 分钟没回复就开跑（GREEN/YELLOW 部分），RED 部分等到回复才动。

### 11.5 角色协作时序图：一个典型 bug 修复

```
时间   Sentry  Bridge  ZenTao  PM   Worker  GitLab Reviewer SecAud Watcher 企微  你
─────────────────────────────────────────────────────────────────────────────────
10:14  alert
10:14   ──►  filter
10:14         ──►   create bug
10:30                       scan (cron)
10:31                       judge: auto / low
10:32                       ──► spawn worker-3
10:32 ────────────────────────────► clone / branch
10:45                                ──► run tests · open MR !456
10:46                                ──►   CI pipeline start
10:52                                ──►   pipeline ok
10:53                                      ──►  review start ──► review start
10:58                                      ──►  LGTM       ──►  no issue
10:58                       verify: risk=low
10:59                       ──► auto-merge
11:00                                ──► merge !456
11:01                                ──► deploy beta canary
11:01                                                              ──► watch 30min
11:31                                                              ──► SLO ok
11:32                                                              ──► promote 100%
11:32         ◄── webhook: MR merged
11:32         ──► ZenTao bug status=resolved
11:33                                                                     ──► 卡片: zt#xxx ✅ → 私聊
11:33                                                                              ──► you see ✓
```

**全程 79 分钟无人介入**。你在 11:33 看到企微卡片，确认这条修复链路按预期跑完——以前需要 4h+ 你在线响应、5 次以上 ack 的工作。

### 11.6 部署到企微的两条铁律

1. **一个 bot 对应一个用途**。不要让"军团 bot"同时发日报、ack 请求、监控告警——你会盲点。建议：
   - `军团-播报` 群机器人 → 日报 / 一般通知（你可以静音）
   - `军团-ack` 群机器人 → 需要决策的 RED 类消息（不能静音）
   - `军团-告警` 群机器人 → P0 / canary 回滚 / 红线绕过（最高优先级）

2. **企微消息卡片要带"一键操作"**。不要让你在企微看完还要切到 ZenTao / GitLab 才能操作。卡片里直接埋 deep link：
   ```
   ┌───────────────────────────────────────┐
   │ 🟡 zt#1234 准备 auto-merge !456       │
   │ risk=low · CI passed · 双 LGTM        │
   │ ─────────────────────────────────────│
   │ [批准合并]  [改 high]  [看 diff]      │
   └───────────────────────────────────────┘
   ```
   每个按钮调企微回调到你的网关，触发对应动作。

### 11.7 这套案例最容易踩的 3 个坑

1. **ZenTao API 限流**。Sentry Bridge 高峰期一秒建 10 条 bug，ZenTao 直接 429。解决：Bridge 加 token bucket（5 req/s），Sentry side 加 windowed 聚合。

2. **Confluence 写入幂等问题**。Daily Reporter 22:00 跑，如果失败重试，会重复创建当天报告。解决：用「日期 + 类型」做幂等键，存在即更新而非新建。

3. **企微 webhook 不支持高交互卡片**。原生 webhook 卡片按钮回调要走自建网关。如果你不想搭网关，退而求其次用「回复关键字」：你在群里回复 `ack 1234` 也能触发军团 ack 流程，PM 监听企微消息即可。

---

## 附录：技术选型建议

### 模型分层

| 层 | 推荐模型 | 替代 |
|---|---|---|
| PM | Claude Opus 4.7 / GPT-5 类强推理模型 | Claude Sonnet 4.6（预算紧） |
| Worker | Claude Sonnet 4.6 / GPT-4o 类性价比模型 | DeepSeek 类开源备选 |
| Auditor | Claude Haiku 4.5 / Gemini Flash 类便宜快模型 | 任意小模型 |

### Agent 容器

- **Claude Code**：原生支持 `/team`、worktree 隔离、hook、cron，写本文时综合最成熟
- **Cursor / Windsurf**：IDE 集成最好，但多 agent 编队需要自己搭
- **Aider / OpenHands**：开源派，灵活但要自己搭基础设施
- **自建 Agent**：用 LangGraph / AutoGen / Anthropic SDK 直接搭，最大自由度但工程投入最大

不论选哪个，三层架构 + 红线 + canary 的核心原则不变。

### 反馈回路所需基础设施

- **监控**：Sentry / Bugsnag / Datadog / 自建 ELK 任选其一
- **Issue tracker**：Jira / Linear / GitHub Issues / GitLab Issues 任选其一，要有 API
- **Git 平台**：GitHub / GitLab / Gitea / 自建，要有 webhook
- **IM 通知**：Slack / Discord / Telegram / 企微 / 飞书，任意能接 webhook 的都行
- **流量切分**：nginx / envoy / Argo Rollouts / Flagger / 各家云原生

每一项都不强求「最好」，强求**有 API 可编程**。
