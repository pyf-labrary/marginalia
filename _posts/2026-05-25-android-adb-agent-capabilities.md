---
layout: "post"
title: "Android ADB + Agent 能做哪些事"
date: "2026-05-25 12:00:00 +0800"
author: "Marginalia"
description: "用 ADB 通道 + 多模态大模型操控 Android 的能力边界研究：对照豆包 AI 手机（UI-TARS）实现原理，逐项分级 ADB 在权限管控、装卸、文件整理、应用下载、一键换机上的可行性。"
excerpt: "用 ADB 通道 + 多模态大模型操控 Android 的能力边界研究：对照豆包 AI 手机（UI-TARS）实现原理，逐项分级 ADB 在权限管控、装卸、文件整理、应用下载、一键换机上的可行性。"
tags: [Android, ADB, Agent, AI手机, 自动化]
cover: /assets/img/posts/2026-05-25-android-adb-agent-capabilities/cover.jpg
---

> 一份关于"用 ADB 通道 + 多模态大模型（Agent）操控 Android 手机"的能力边界研究。
> 整理自一次技术调研会话，含豆包 AI 手机（UI-TARS）的实现原理对照、ADB 各项能力的可行性分级、以及"一键换机"等高阶目标的现实约束。
>
> 日期：2026-05-25

---

## 目录

1. [两条技术路线：ADB 调试通道 vs 系统级 GUI Agent](#1)
2. [ADB 能给 Agent 带来哪些能力](#2)
3. [豆包 AI 手机怎么用多模态大模型操控手机（UI-TARS）](#3)
4. [App 权限管控、装卸、文件整理的可行性](#4)
5. ["从应用商店下载安装"为什么是个坎](#5)
6. ["一键换机 / 完整克隆"的现实边界](#6)
7. [能力总表与选型建议](#7)

---

<a id="1"></a>
## 1. 两条技术路线：ADB 调试通道 vs 系统级 GUI Agent

让 Agent 操控一部 Android 手机，业界存在两条本质不同的路：

| 维度 | **ADB / 无障碍**（开发者可走） | **系统级 GUI Agent**（豆包手机一类） |
|---|---|---|
| 感知 | uiautomator 控件树（结构化、精确）+ 截图 | 纯屏幕截图视觉识别 |
| 决策 | 外部通用多模态模型看图 + 控件树后给坐标 | 端到端 GUI 专用模型直出动作 |
| 执行 | `adb shell input` / Accessibility 注入事件 | 系统级 `INJECT_EVENTS` 注入 |
| 权限门槛 | 开发者调试 / 无障碍授权即可 | 需要 ROM 级权限，刷工程机 |
| 部署形态 | 电脑端连手机，外部驱动 | 嵌入操作系统，本机运行 |

两条路殊途同归——都是"**看屏幕 → 推理 → 像人一样点击**"的闭环。区别在于执行层走的是调试通道还是系统注入，以及模型是通用多模态还是专门为 GUI 操作训练过的。

**关键结论**：用 `ADB + 截图喂给多模态模型 + uiautomator 控件树`，本质能复刻豆包那套交互闭环，只是执行层走调试通道而非系统注入。这是个人开发者 / Agent 项目最现实的落地路径。

> 环境提示：在 WSL2 里连真机，一般还需要桥接 Windows 侧的 adb server，或走 usbipd / 网络 adb（`adb tcpip` 无线调试）。

---

<a id="2"></a>
## 2. ADB 能给 Agent 带来哪些能力

接入 ADB 后，Agent 获得的能力可按用途分为五类：

### 2.1 屏幕操控 / UI 自动化
- `adb shell input tap/swipe/text/keyevent` —— 点击、滑动、输入文字、按键，脚本化操控任意 App
- `adb exec-out screencap -p` —— 截屏（多模态模型可直接读图分析画面）
- `adb shell uiautomator dump` —— 拉当前界面控件树（坐标 / 文本 / resource-id），做**视觉 + 结构双通道**自动化，比盲点坐标稳得多
- `adb shell screenrecord` —— 原生录屏成 mp4
- 配合 `scrcpy` 可实时镜像 + 鼠标键盘控制

### 2.2 App / 包管理
- `install / uninstall / pm list packages` —— 装卸 APK、枚举包名
- `pm clear` 清数据、`am start/force-stop` 起停 Activity、`am broadcast` 发广播
- `dumpsys`（battery/meminfo/activity/window）—— 抓性能、当前栈、内存

### 2.3 文件 / 数据
- `adb push/pull` —— 双向传文件
- `adb shell run-as <pkg>` —— **仅 debuggable 包**下读自家沙盒数据（SQLite / SharedPrefs）

### 2.4 日志 / 调试
- `adb logcat` —— 实时日志，定位崩溃 / 报错（带 tag/level 过滤）
- `adb bugreport`、`adb shell getprop` —— 设备信息、系统属性
- `adb forward / reverse` —— 端口转发，把手机内服务映射到本机调试，或反向让 App 访问本机 server

### 2.5 设备管理
- 多设备并行（`-s <serial>`）、`adb tcpip` 无线调试、`reboot`、`wm size/density` 改分辨率

### 对项目的实际价值
- **取代 / 补充 Playwright** —— 测原生 Android App（不只是网页）的 UI 流程
- **素材采集** —— 手机端录屏 / 截屏直接进内容流水线
- **真机内容自动化** —— 操控各类 App，绕开纯 web 接口的限制

---

<a id="3"></a>
## 3. 豆包 AI 手机怎么用多模态大模型操控手机（UI-TARS）

核心一句话：**豆包手机不是靠 API 或读控件树，而是把"看屏幕截图 → 推理 → 像人一样点屏幕"这套闭环交给一个端到端多模态大模型（字节的 UI-TARS）来做。**

### 3.1 感知：纯视觉，截图当唯一输入
- 不解析 App 接口，也不主要依赖无障碍控件树，而是**每隔约 3 秒抓一张当前屏幕截图**喂给视觉语言模型（VLM），由模型从像素里识别按钮、输入框、目标位置——和人眼看屏幕一样。
- **过滤式视觉管道**：抓的是目标 App 的 Activity Hierarchy 渲染结果，不是直接读整个 Display Buffer，因此物理上看不到后台（如视频通话）内容，是一项隐私设计。

### 3.2 推理：ReAct 范式 + 分层记忆
模型按 **推理(Reason) → 行动(Act) → 观察(Observe)** 三步循环运行：
- **工作记忆**保存近几步操作（快反应，System 1）
- **情景记忆**做语义压缩存长程上下文（深推理，System 2）
- 这样能撑住"打开美团 → 搜店 → 比价 → 加购 → 下单"这种多步跨 App 任务，而非只会单步点击。

### 3.3 动作：统一动作空间
模型输出的不是文字，而是**结构化操作原语**：`tap(x,y) / type(text) / swipe / 长按 / 返回`，并扩展到文件系统操作、终端命令、MCP 工具调用。
- 坐标级操作落到系统上，靠 **`INJECT_EVENTS` 系统级权限**（注入触摸 / 按键事件）——这正是它做成"系统级 AI 手机"、需要刷工程机的原因。普通第三方 App 拿不到这个权限，只能退而用无障碍服务。

### 3.4 端云协同
- **标准模式**：浅层 VLM，响应快
- **Pro 模式**：云端大模型深度推理 + 工具调用，更强但慢
- 主算力在云端（截图上传云端 VLM 解析）。
- 后台跑任务时起一个**虚拟显示层（影子屏幕）**，让 Agent 在不打断前台操作的情况下并行干活。

### 3.5 安全
敏感动作（支付、身份验证、密码）**自动暂停，转人工接管**。

### 3.6 模型怎么练出来的（UI-TARS）
- 三阶段管道：海量教程 / 操作截图**持续预训练(CT)** → 高质量指令**SFT** → **强化学习(RL)** 端到端优化。
- 关键数据：标注员录下操作时的"有声思维"（为什么点这里），还能在模型实时采样时**在线干预纠偏**。
- 成绩：开源版 UI-TARS-1.5-7B 在 AndroidWorld 等 7 项 GUI 基准刷新 SOTA（AndroidWorld 46.6 vs GPT-4o 34.5；OSWorld 超过 Claude），是 GitHub 热榜榜首项目，开源后超 26k Star。UI-TARS 已迭代到 2.0，支持 GUI 操作到代码执行、API 调用的混合动作流。豆包手机用的是闭源版，针对 Mobile Use 做了大量优化。

---

<a id="4"></a>
## 4. App 权限管控、装卸、文件整理的可行性

### 4.1 App 权限管控 ✅ 完全可以
ADB 直接走 `pm`（PackageManager），能读能改运行时权限：
```bash
# 看某 App 当前所有权限及授予状态
adb shell dumpsys package com.xxx.app | grep permission

# 授予 / 撤销单个权限（运行时权限，立即生效，无需重装）
adb shell pm grant   com.xxx.app android.permission.CAMERA
adb shell pm revoke  com.xxx.app android.permission.ACCESS_FINE_LOCATION

# appops 更细：控制后台弹窗、读剪贴板、悬浮窗、自启等"特殊操作"
adb shell appops set com.xxx.app SYSTEM_ALERT_WINDOW deny
adb shell appops get com.xxx.app           # 列出该 App 所有 op 状态
```
- 能批量做"隐私体检"：扫所有 App 谁拿了麦克风 / 定位 / 通讯录，一键收权。
- **限制**：`pm grant` 只能改 manifest 里声明过 `dangerous` 级的运行时权限；签名级 / 系统级权限改不了（要 root）。

### 4.2 装 / 卸 App ✅ 可以
```bash
adb install app.apk              # 装本地 APK
adb install -r -d app.apk        # 覆盖安装 / 允许降级
adb install-multiple *.apk       # split APK（AAB 拆出来的）
adb uninstall com.xxx.app        # 卸载
adb uninstall -k com.xxx.app     # 卸载但保留数据
adb shell pm uninstall --user 0 com.xxx.app   # 卸预装/系统应用（免 root，仅当前用户）
```
**关键的坎**：ADB 只能装**你已经有的 APK 文件**，不会"去应用商店下载"——详见第 5 章。

### 4.3 文件整理 ✅ 可以，等于半个 shell
```bash
adb push 本地 /sdcard/目标/         # 传进去
adb pull /sdcard/DCIM/ ./备份/       # 拉出来
adb shell ls -R /sdcard/Download     # 浏览
adb shell mv / cp / rm / mkdir ...   # 移动、复制、删、建目录
adb shell find /sdcard -name "*.mp4" -size +50M   # 按条件筛
```
- 完全能写脚本做"按类型归类相册 / 清理下载目录 / 批量重命名"。
- **限制**：免 root 时只能动**共享存储**（`/sdcard`、公共目录）和 debug 包自己的沙盒；别的 App 私有目录 `/data/data/<pkg>/` 读不了（要 root 或该包是 debuggable + `run-as`）。

---

<a id="5"></a>
## 5. "从应用商店下载安装"为什么是个坎

**ADB 没有"从 Play Store 直接下载安装"的原生命令**——Google 故意不开这个口。Play Store 没有公开的 CLI / API 让你 `adb install 包名` 就从云端拉下来装。`adb install` 永远只吃**本地 APK 文件**。

曲线达成有三条路，按"接近直接"排序：

### 路线 1：intent 打开商店页 + 自动点"安装"（最接近"直接"，最稳妥）
```bash
# 直接跳到某 App 的 Play Store 详情页
adb shell am start -a android.intent.action.VIEW -d "market://details?id=com.spotify.music"
# 然后截图找到"安装"按钮，注入点击
adb shell input tap <x> <y>
```
- 本质就是豆包那套 GUI 自动化：让模型看屏幕、点"安装"、等下载。下载和安装都由商店自己完成（合法、走正常签名校验、账号正常）。
- 缺点是要"看屏点击"，不是一条命令搞定。装 APK 时还会弹**系统确认框**，需要再 `input` 点一下"安装"，或提前 `adb shell settings` 放行未知来源。

### 路线 2：第三方 Play Store API 客户端（全自动，但有账号风险）
有开源工具逆向了 Play Store 私有协议，用 Google 账号**直接从 Google 服务器抓 APK**：`gplaycli`（命令行）、`Raccoon`（PC）、`Aurora Store`（手机端）。
```bash
gplaycli -d com.spotify.music        # 用账号从 Play 拉 APK 到本地
adb install com.spotify.music.apk    # 再装进去
```
- **代价**：非官方协议，**违反 Play 服务条款**，账号有被风控 / 封的风险（建议用小号），付费 App / 区域锁的拉不了。

### 路线 3：Managed Google Play / EMM API（官方但有门槛）
企业 MDM 场景，Google 提供官方 API 远程给托管设备静默推送安装。需把设备纳管成"企业管理设备"，个人用不上。

**结论**：正规、稳妥的方式是**路线 1**——ADB 负责"导航 + 点击"，商店负责"下载 + 安装"。这也正是 AI 手机做"一句话装 App"的真实路径：它不是绕过商店，而是替你操作商店。

---

<a id="6"></a>
## 6. "一键换机 / 完整克隆"的现实边界

能做到**部分克隆**，但"尽可能复制完整状态（含各 App 登录态 / 存档 / 系统密钥）"——**纯 ADB 无 root 做不到**。卡点不是 ADB 弱，而是 Android 的沙盒安全模型。

### 6.1 ADB 无 root 能搬的 ✅
| 类别 | 命令 | 说明 |
|---|---|---|
| 共享存储文件 | `adb pull /sdcard ./backup` | 照片 / 视频 / 下载 / 文档全量拷 |
| 已装 App 清单 | `adb shell pm list packages -3` | 拿到所有第三方包名 |
| APK 本体 | `adb shell pm path com.x` → `pull` | 把安装包抠出来搬到新机重装 |
| 部分系统设置 | `adb shell settings get/put system\|secure\|global` | ADB 持 `WRITE_SECURE_SETTINGS`，能搬亮度、字体、动画、无障碍、默认输入法等 |

→ 能拼出"文件 + 把同样的 App 都装上 + 还原一批系统偏好"的迁移脚本。

### 6.2 ADB 无 root 搬不了的 ❌（这才是"换机"的核心）
- **App 私有数据** `/data/data/<包名>/`：登录态、聊天记录、游戏存档、App 内设置——**全在这儿，无 root 一律读不到**。`run-as` 只对 debuggable 开发版有效，商店装的正式版无效。
- **系统级密钥**：WiFi 密码、账户凭据、指纹 / 人脸模板、Keystore——受保护存储，碰不到。
- **`adb backup` / `adb restore`**：老接口看着像答案，但**已基本废弃**——Android 12 起大量失效，App 默认 `allowBackup=false`，备出来多半是空的，别指望它。

**一句话**：无 root 只能搬"东西"（文件 + App 安装包 + 部分设置），搬不了"状态"（每个 App 的数据和你的登录）。装好的微信打开还是要重新扫码登录。

### 6.3 想要真·完整克隆 → 两条路

**A. Root / 解锁 BL（技术上最彻底）**
- root 后可整包 tar `/data` 分区，或 TWRP 做 nandroid 全镜像，App 数据一并搬。
- 代价：解锁 bootloader **会清空设备**、掉保修、可能触发 App 风控（银行 / 支付检测 root 拒启）、新旧机型号不同还原易崩。不推荐做日常方案。

**B. 厂商"一键换机"（最省心，也是该功能的真实来源）**
- 三星 Smart Switch / 小米·换机 / 华为手机克隆 / Google 开机迁移——它们**不是 ADB**。
- 原理：这些是**预装的系统级签名 App**，持有普通 App 和 ADB 都拿不到的特殊备份权限，能直接读全机 App 数据；再叠加 Google / 厂商云端的 App 数据备份（开发者 opt-in 的那部分）。
- 所以"一键全搬"靠的是**系统特权 + 云备份**，第三方（含 ADB）从设计上就被挡在外面。

### 6.4 建议
- 真要"尽可能复制手机状态"：**同品牌换机用厂商工具**最优；跨品牌用目标厂商的克隆 App。
- ADB 的定位是**补漏和定制**：厂商工具漏掉的、或想脚本化精确控制的（批量还原某类设置、把特定目录归类搬运、复刻 App 安装清单），用 ADB 脚本补上。

---

<a id="7"></a>
## 7. 能力总表与选型建议

### ADB 各项能力可行性分级

| 能力 | ADB 免 root | ADB + root | 厂商工具 | 卡点 |
|---|:---:|:---:|:---:|---|
| 屏幕操控 / UI 自动化 | ✅ | ✅ | — | — |
| 截屏 / 录屏 | ✅ | ✅ | — | — |
| 改 App 运行时权限 | ✅ | ✅ | — | 系统级权限要 root |
| 安装本地 APK | ✅ | ✅ | ✅ | 弹系统确认框 |
| 从商店"下载"安装 | ⚠️ 需 GUI 自动化 | ⚠️ | ✅ | ADB 不联商店 |
| 卸载（含预装） | ✅ | ✅ | — | — |
| 文件整理（共享存储） | ✅ | ✅ | — | 只限 /sdcard + 自己沙盒 |
| App 私有数据读写 | ❌ | ✅ | ✅ | 沙盒隔离 |
| WiFi / 凭据 / 指纹 | ❌ | 部分 | ✅ | 受保护存储 |
| 系统设置迁移 | 部分 | ✅ | ✅ | secure 设置受限 |
| App 数据 / 登录态迁移 | ❌ | ✅ | ✅ | 核心壁垒 |

### 选型建议
- **做 Agent 操控手机**：走 `ADB + 截图（喂多模态模型）+ uiautomator 控件树` 的双通道路线，能复刻豆包交互闭环；执行层用 `input` 注入而非系统级 `INJECT_EVENTS`。
- **隐私体检 / 权限管控 / 文件整理 / 装卸**：ADB 免 root 一把梭，可全脚本化。
- **"一句话装 App"**：ADB 负责导航 + 点击，商店负责下载 + 安装（路线 1）。
- **完整换机克隆**：同品牌用厂商工具；ADB 仅做半迁移补漏（App 清单 + APK + /sdcard + settings 快照）；App 数据交给厂商工具或 root。

---

## 参考资料

- [量子位：起底"豆包手机"，核心技术早已开源](https://www.qbitai.com/2025/12/359876.html)
- [53AI：万字拆解 UI-TARS 2.0](https://www.53ai.com/news/MultimodalLargeModel/2025121567254.html)
- [53AI：从豆包手机助手看 GUI Agent 发展](https://www.53ai.com/news/zhinengyingjian/2025122889263.html)
- [字节开源 UI-TARS-1.5（OSCHINA）](https://www.oschina.net/news/345234/bytedance-ui-tars-1-5)
- Android 官方文档：`adb`、`pm`、`appops`、`settings`、`uiautomator`
