# 导演艺术大师课 — 构建总结报告

> 项目：把网页版 Claude 输出的单文件 HTML 大师课 (`导演艺术大师课.html`, 73 KB / 29 张幻灯)
> 拆解、丰富并发布为多页电影感作品集；最终承载在 Marginalia 站点 `/showcases/director-masterclass/`。
> 构建日期：2026-05-18 / 五轮迭代收敛 / 已 push 至 `pyf-labrary/marginalia` main。

---

## 1. 项目结构

```
~/claw/report/director-masterclass/        ← 源工作目录
├── index.html              # 封面 + 目录（cover hero video + clickable TOC cards）
├── chapter-1.html          # Ⅰ 镜头语言基础（景别 / 角度 / 轴线）
├── chapter-2.html          # Ⅱ 运镜技法（六大运镜 / 进阶 / 长镜头）  + 章节背景视频
├── chapter-3.html          # Ⅲ 镜头组接（蒙太奇 / 剪辑语法 / 视点）
├── chapter-4.html          # Ⅳ 视觉叙事（构图 / 光影 / 色彩 / 场面调度）
├── chapter-5.html          # Ⅴ 大师风格（作者导演 Ⅰ / Ⅱ）
├── chapter-6.html          # Ⅵ 导演思维（视觉化 / 节奏 / 隐喻 / 风格 / 实践）+ 章节背景视频
├── assets/
│   ├── css/deck.css        # 1500 行：原 deck 样式 + 5 轮增量补丁
│   ├── js/deck.js          # IIFE：slide 导航 / 抽屉 / tooltip / 配乐持久化
│   ├── favicon.svg         # 金光圈 + 红快门点
│   ├── images/             # 13 张 Dreamina 5.0 生成（6 章 hero + cover + 6 angle 卡片 + 4 inline 配图 + 1 strip）
│   ├── music/              # 1 首 MiniMax music-2.6 2 分钟 BGM
│   └── video/              # 2 段 Seedance 2.0 i2v 章节动态背景
└── docs/                   # 本文件 + 后续运维笔记
```

发布路径：`~/claw/marginalia/showcases/director-masterclass/`（rsync 完整镜像）。
入口在 Marginalia `showcases.md` 顶部第一项。

---

## 2. 工具链

| 模块 | CLI | 备注 |
|---|---|---|
| 图像 | `img-dreamina` (model 5.0, ratio 16:9 / 21:9, resolution 1k–2k) | 默认通道 |
| 视频 | `video-dreamina --model seedance2.0_vip` (cover/章2) / `seedance2.0fast` (后续章) | fast 价格 ¥0.30/s vs vip ¥0.75/s |
| 音乐 | `music-minimax` (新写，模型 `music-2.6`) | 本项目顺手补的 workspace CLI |
| 站点同步 | `rsync -a --delete` + 直接 `git push` `pyf-labrary/marginalia` | OAuth 走 `~/.config/gh/org_pyf-labrary.token` |

整套构建是 4 步管道（每步 idempotent，re-run 安全）：

```bash
# 步骤 1：从原始单文件 HTML 拆出 index.html + chapter-1..6.html + 共享 CSS/JS
python3 /tmp/split-deck.py

# 步骤 2：注入 favicon、目录抽屉、外链、compact 卡片标记
python3 /tmp/enrich-deck.py

# 步骤 3：注入 cover hero + inline 图片 + 视频背景覆盖
python3 /tmp/inject-images.py

# 步骤 4：景别 bottom-band + 拍摄角度 layout 重排 + 术语 tooltip
python3 /tmp/inject-round5.py
```

---

## 3. 五轮迭代

| 轮次 | commit | 主要改动 |
|---|---|---|
| R1 | `44e080e` | 单文件拆为 7 页 + 共享 CSS/JS；6 章 hero 图（Dreamina）；1 段章 2 动态背景；MiniMax music-2.6 BGM；chapter pager；showcases.md 索引 |
| R2 | `942c1e4` | favicon；左上 ◉ MASTERCLASS 改为返 index；右上「目录」按钮 + 抽屉式 TOC；70 项导演/电影/术语自动加 zh-wiki 外链；8 个密集卡片网格切 compact；移动端响应式 |
| R3 | `7ffdd67` | cover 加电影厅 hero 图（视频占位）；景别 6 SVG 替为真实剧照 21:9 渐近条；光影/色彩内联配图；tooltip-popup 替代展开式；`.chapter-pager` 改 fixed + z-index 220 解决点击拦截 |
| R4 | `4cf26ab` | tooltip 改 paper-tone 样式（与黑卡片对比鲜明）+ JS bounds-check / hover-bridge；右下 ◂▸ nav-btn 删除；上一页/下一页改为片内 slide 翻页；BGM `currentTime` 每秒持久化 sessionStorage 跨章续播；inline-hero 改 `background-size: contain` 不裁切；§2.1/§2.2 运镜卡片也切 compact |
| R5 | `4cf26ab+` | 拉取 chapter-6 vision i2v 视频替换静图；目录按钮移至左上 MASTERCLASS 下方 + 抽屉从左侧滑入；21:9 strip 改为 bottom-band 大底+渐变；ELS/LS/MS/MCU/CU/ECU 加 `data-tip` 解释 tooltip；§1.2 拍摄角度重排（lede+quote 左右 → 6 卡片下方 + 卡片 popup 中嵌入 16:9 真实剧照）；本 BUILD-LOG.md |
| R6 | _本轮_ | ① cover hero video（373a17b8 空旷影棚导演背影）从 Dreamina 拉下来 cover-cinema.mp4 替代 webm 占位；② §1.1 景别 bottom-band → `.shot-strip` figure：图在 lede 下、宽度=lede（720px）、无渐变、底部 ELS → ECU 金色箭头条；③ §1.3 轴线 SVG 大改：520×360 viewBox、双角色头部剪影 A/B + 红色虚线轴 + 上半圆 180° 安全弧 gold 渐变（MASTER/OTS-A/OTS-B 三机位 + 视线虚线）+ 下半圆禁区红色渐变（JUMP-LINE 机位带 ✗ 红叉 + "越轴 → 左右反转" 警告）；④ §2.1/§2.2 12 张卡片加 `data-move` + JS 注入内联 SVG 动画 demo（push/pull/pan/tilt/dolly/crane/follow/arc/handheld/steadicam/crashzoom/whippan），CSS keyframes 仅在 hover 时播放，paused by default 不耗 CPU；⑤ §2.2 进阶运镜重排为 lede+quote 顶部 + 3×2 卡片网格（card-2col）；⑥ `.ext-link` hover Wikipedia REST summary 预览 popup（缩略图 16:9 + 标题 + description + 5 行 extract + "阅读全文" 链接，paper-tone 浮起卡片，bounds-check 位置） |

---

## 4. 关键设计决策

### 4.1 视觉系统
- **配色**：deck 原始 ink/noir/paper/gold/blood 五色保留，所有 tooltip 用 paper-tone 反白制造对比层级。
- **字体**：原 deck 使用 Bodoni Moda（西文）+ Noto Serif SC（中文）+ JetBrains Mono（标签）+ Cormorant Garamond（引用斜体）。沿用未改。
- **letterbox**：保留顶/底 32px 黑边 + 胶片颗粒 overlay（`body::before/after`）。

### 4.2 交互
- **导航主线**：键盘 ← → / Home / End / 触屏左右滑 / 左下「上一页」右下「下一页」（片内 slide 切换，到边界跨章 HTML 跳转，目录抽屉提供全局跳转）。
- **配乐**：右上角 ♫ 切换，M 键快捷键；autoplay 失败则首次任意交互触发；`currentTime` 每秒写 sessionStorage 跨章续播。
- **目录抽屉**：左上「▤ 目录」按钮触发，抽屉从左侧滑入，覆盖 380px / Esc 关闭。
- **卡片 tooltip**：默认只显标题，hover 弹 paper-tone 浮起卡片显示描述（含红色高亮 + 拼图标 + 嵌入 16:9 剧照 for 角度卡）；JS bounds-check 自动 popup-up/left/right；hover-bridge 220ms 防鼠标穿越间隙时关闭。
- **术语 tooltip**：`.spec-list .term[data-tip]` 纯 CSS hover 弹出，仅景别页使用（ELS/LS/MS/MCU/CU/ECU）。
- **外链**：70+ 导演/电影/术语词条用 `<a class="ext-link" target="_blank">` 跳 zh.wikipedia.org，标题（h1-h6/cite）内不注链以保视觉层级。

### 4.3 性能/容量
- 总产物 **~17 MB**（视频 10 MB + 音乐 4 MB + 图片 2.5 MB + 文本 0.4 MB）— 在 Pages 仓库可承受范围。
- 6 张 hero 图 / 7 张 inline 图均 max-width 1920 / 1200 缩放，避免 Pages 容量爆炸。
- 单视频最大 5.2 MB（chapter-2-movement.mp4），低于 [MEMORY: feedback_pages_no_video] 10MB 阈值。

---

## 5. 制片成本

| 项 | 数量 | 单价 | 小计 |
|---|---|---|---|
| Dreamina 5.0 t2i（2k）| 13 张 | 4 credit/张 ≈ ¥1 | ~¥13 |
| Seedance 2.0_vip i2v 6s | 2 段（cover 失败 / 章2 成功 / 章6 成功） | ¥4.5/段 | ~¥9 (含 1 段失败) |
| Seedance 2.0 fast i2v 6s | 4 段（cover 失败 / 章3/4/5 排队中） | ¥1.8/段 | ~¥7（半数还在生成） |
| MiniMax music-2.6 | 2 首（contemplative 30s 弃用 / main 2 min） | API 计费 | ~¥1 |
| Wiki / TTS / 其他 | — | 0 | 0 |
| **总计** | — | — | **~¥30** |

Cost ≪ 一份独立设计师做同样信息密度的 deck。Dreamina 静默降智、内容审核误杀（chapter-1-zoom / cover-empty-cinema）为主要扰动；遇到 pre-TNS check fail 不应重试同 prompt，改 prompt 是唯一出路（[MEMORY: feedback_dreamina_video_prompting]）。

---

## 6. 已知遗留

| # | 项 | 优先 |
|---|---|---|
| 1 | Cover 视频（VIP 高质）—— 用户称已生成但 CLI `list_task` 不可见（疑似 Web UI 提交未同步） | low |
| 2 | 章 3/4/5 fast 视频仍排队 querying；landing 后用 `python3 /tmp/dm-pull-video.py` 自动拉取并 patch | low |
| 3 | inline-color-palette / inline-lighting-trio 当前是单图，可改为多帧 hover 切换 carousel | optional |
| 4 | 移动端 chapter-pager + frame-counter 在小屏垂直堆叠会贴边，可加 portrait 媒体查询单独优化 | optional |
| 5 | 抽屉打开时 body 仍可滚动（slide 内 overflow），可加 scroll-lock | optional |
| 6 | 6 章导演卡片（章 5）目前 hover 弹 popup 是中性描述，可考虑加导演代表作 4-frame stills | optional |

---

## 7. 复用要点

要把这套样式应用到另一份**单文件电影感大师课 HTML**？

1. 复制 `assets/css/deck.css` + `assets/js/deck.js` + `assets/favicon.svg`。
2. 复制 4 个 inject 脚本（`/tmp/split-deck.py` / `enrich-deck.py` / `inject-images.py` / `inject-round5.py`），改源 HTML 路径 + slide 边界。
3. 用 `~/claw/bin/img-dreamina` / `~/claw/bin/video-dreamina --model seedance2.0fast` / `~/claw/bin/music-minimax` 生成媒体。
4. `rsync` 到 `~/claw/marginalia/showcases/<slug>/`，在 `showcases.md` 加索引项，commit + push。

整套从空目录到 Pages 上线，**1.5 小时** 可走完（图片/视频生成并行 30 min 是大头）。
