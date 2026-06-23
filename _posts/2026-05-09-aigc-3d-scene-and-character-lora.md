---
layout: "post"
title: "AIGC 短剧的跨镜空间一致性 + 角色一致性工艺实测"
category: "AIGC 工艺"
date: "2026-05-09 12:00:00 +0800"
author: "Marginalia"
description: "AIGC 短剧有两个绕不开的痛点：同一场景切镜不能错乱（空间一致性），以及角色跨镜跨集不能漂移（身份一致性）。本文把 World Labs Marble、Apple SHARP、Zero123++、SDXL/Flux LoRA 几条路径全部跑了一遍，给出带单位成本的对比结论，以及一个反向优化的教训。"
excerpt: "AIGC 短剧有两个绕不开的痛点：同一场景切镜不能错乱（空间一致性），以及角色跨镜跨集不能漂移（身份一致性）。本文把 World Labs Marble、Apple SHARP、Zero123++"
tags: [AIGC, 3D生成, LoRA, 角色一致性, 短剧]
cover: /assets/img/posts/2026-05-09-aigc-3d-scene-and-character-lora/cover.jpg
---

## TL;DR

| 路径 | 结论 | 单位成本 |
|---|---|---|
| **World Labs Marble 单图** | 跨镜空间方案的实测最优解 | ¥10-20 / 场景 |
| **Marble 多图（i2i 拼多视角）** | **反向优化**——i2i 几何不一致让 Marble 拼缝鬼影 | 浪费的 ¥10-20 |
| **Apple SHARP（单卡 monocular）** | 喷泉锥，仅 ±10° 微调，不能跨镜 | ¥0 |
| **Zero123++** | 几何严格一致但风格"3D 玩具感"，对写实剧不适用 | ¥0.5 / 推理 |
| **SDXL LoRA 角色锁** | 5 张图 800 步即可锁 4 臂/3 眼这种违反常识特征 | ¥0.6 / 角色 |
| **Flux LoRA**（未实测） | 写实天花板远高于 SDXL，但被 HF gating 阻塞 | ¥1.5-2 / 角色 |

**最终推荐工艺**：**Marble 单图 anchor（关键场景）+ LoRA 锁角色 + ControlNet 控镜（同场切镜）**。

> 测试对象是一个 AIGC 佛经题材短剧项目，需要大量"同场多镜"和"同角色跨集"的镜头。

---

## 1. 跨镜 3D 场景生成（"同场切镜不错乱"）

### 1.1 World Labs Marble — 主通道

World Labs Marble 接受一张图，约 5 分钟产出一个完整 3D 世界，输出：

- `splat.spz` 约 30 MB（full）+ 500k/150k/100k 三档精简
- `mesh.glb` 1-5 MB（碰撞网格）
- `pano.png` 约 12 MB（360 全景）
- 元数据 JSON（含 `metric_scale_factor` 度量尺度）

把它作为关键场景的空间锚点：同一场景内的多个镜头都从这一份持久世界里取视角，几何/比例/光照天然一致，这是当前任何 i2v/t2v 模型都做不到的。

一个值得记的实现坑：user prompt 会被 Marble 的 VLM 自动扩展成一长段场景描述写进 world 元数据，所以输入图本身的信息量决定了重建质量，文字提示只是辅助。

### 1.2 多图融合的反向优化（教训）

**假设**：用图生图（i2i）出 4 个不同 azimuth 视角图，喂 Marble 的 multi-image 接口，应该比单图更好。

**实测**：**比单图差**。多图版在缩略图角落出现明显的**拼缝鬼影**，单图版反而干净。

**根因**：i2i 出的 4 张"伪多视角"**几何不严格一致**——同一根立柱在 4 张图里位置/比例都在漂移。Marble 把它们当作真实多视角做光束法平差（bundle adjustment）时，不一致的几何被强行对齐，引入鬼影。

**结论**：除非用专门训练几何一致性的多视角扩散模型（Zero123++ / Wonder3D），否则"i2i 凑多视角"喂 Marble = 浪费算力 + 劣化质量。单图反而是更稳的输入。

### 1.3 Apple SHARP — 免费但有限

Apple 开源的 SHARP 在一块消费级 Apple Silicon（M1 16GB，Metal 后端）上做 monocular 重建，fp32 推理约 33 秒，输出约 118 万 gaussian 的 `.ply`（约 64 MB）。

两个限制：

- 其 `render` 子命令强制 CUDA，Apple Silicon 跑不了它自带的渲染器，需要自己用 Blender Geometry Nodes 把 mesh 转点云 + Cycles GPU 渲染（实测约 12s/帧 1280×720）。SH degree-0 的颜色解码公式是 `rgb = clamp(0.5 + 0.28209479 * f_dc, 0, 1)`。
- **根本限制**：SHARP 是 monocular depth lift，重建结果是从原相机方向往前的"喷泉锥"，背面/侧面是真空白。**只适合原视角微调（dolly / 微 pan）**，不能跨镜切场。

### 1.4 Zero123++ — 几何对了风格变了

在一块 RTX 5090（32GB，fp16）上推理约 3.1 秒（Apple Silicon fp32 OOM 静默死，fp16 因 MPS NaN 不可用）。输入单图 → 输出 6 个固定视角（azimuth 30/90/150/210/270/330 配 elevation ±20/±10），3×2 网格 320×320。

**问题**：6 视角几何严格一致没问题，但**风格变成"3D 玩具 / 塑料"**——Zero123++ 训练数据偏 Objaverse 几何资产，没学到照片级写实。对写实风格短剧不适用，对玩具/物体题材可能可行。

**替代方向**（未实测）：Era3D / Wonder3D / EscherNet 据称对 scene 写实保留更好。

### 1.5 Hunyuan World 2.0（备选未实测）

腾讯开源、Apache 2.0，自托管需要 24-32 GB VRAM（5090 完全 cover），输出格式比 Marble 还全：mesh + 3DGS + 深度图 + 法线图 + 相机参数。在线 demo 必须登录腾讯账号、无法自动化，所以暂未纳入流水线，但作为"自托管替代 Marble"的长期选项很有吸引力。

---

## 2. 角色 LoRA 训练（"跨镜跨集角色不漂"）

工具栈是 `ostris/ai-toolkit`（GitHub）+ SDXL 1.0 / Flux.1-dev，在一块按小时租的云 GPU（5090，约 ¥2.78/h）上训练。

每个角色用一个不含宗教专名的触发词（这是规避内容过滤的小技巧），配上简化角色描述与姿态修饰，自动生成 caption。示例（佛经/神话公共领域人物）：

- 阿阇世王 — 紫袍重金 + 凶相 + 红宝石冠 + 匕首
- 帝释天 — 蓝皮 + **4 臂 + 3 眼** + 多层冠
- 毗沙门天王 — 金甲 + 红披风 + 持伞和宝塔

数据量：每角色仅 4-5 张（远低于推荐的 20-50 张）。

### 2.1 SDXL 实测结果

**配置**：SDXL 1.0 + LoRA dim 32 + bf16 + adamw8bit + 800 steps + lr 1e-4

| 角色 | 训练时长 | 成本 | 关键特征锁定 | 评价 |
|---|---|---|---|---|
| **阿阇世王** | 约 12.5 min | ¥0.6 | 紫袍 + 重金 + 凶相 + 黑络腮胡 + 红宝石冠 + 孔雀翎 + 匕首 + 虎纹底 | 全锁 |
| **帝释天** | 约 13 min | ¥0.6 | **4 臂 + 3 眼** + 蓝肤 + 多层冠 + 蓝金星纹长袍 + 天宫云海 | 全锁 |

**关键发现**：5 张图 + 800 steps 就能锁住**"4 臂 + 3 眼"**这种违反人体常识的特征——这是 SDXL base 默认完全画不出的（它会把帝释天画成 1-2 臂、无第三眼）。也就是说，对于强角色记忆，训练图数量可以远低于通常建议值，前提是这些图把目标特征讲清楚了。

### 2.2 SDXL 的天花板（也是切 Flux 的理由）

虽然特征锁定 OK，但 SDXL 输出有挥之不去的**"render 感 / 塑料感"**——织物纹理不真、金属皮纸糊、皮肤毛孔失真，整体是"AI 海报感"而非"剧照感"。这是 SDXL 的写实天花板，**LoRA 改不了**，要写实必须换 base 模型。

### 2.3 Flux 路径被阻塞

```
FLUX.1-dev    → gated（non-commercial），需 HF token + accept license
FLUX.1-schnell → 早期 Apache 2.0，后被收紧也 gated（实测国内镜像也 403）
```

Flux 写实天花板远高于 SDXL，但门槛卡在 license gating（镜像站不绕过 gated repo，仍需官方 token）。重训成本约 30-45 min/角色。这个阻塞在后续的模型选型中被另一条路径绕开了（见姊妹篇 Z-Image Turbo 选型）。

### 2.4 5 张图也是瓶颈（独立于模型选择）

LoRA 通常推荐 15-50 张训练图，5 张容易过拟合或漂移。两条扩充路线：

- **(A) 数据增广**（0 成本）：现有 5 张做 crop / 旋转 / 颜色抖动 → 20-30 张
- **(B) i2i 扩展**（约 ¥3-5/角色）：从现有 ref 出更多表情/姿态/角度变体

---

## 3. GPU 经济性

按小时租的云 GPU 是这套流水线的算力底座，几档参考单价：

```
4090:      ¥1.8-2.18 / h
5090:      ¥2.88 / h
vGPU-32GB: ¥1.68 / h（A100 切片，无 Blackwell FP8）
```

**5090 性价比最优**：相比 4090 仅 +32% 单价，换来 +33% VRAM + 30-60% 速度（Blackwell + FP8），单任务实际成本几乎打平。

横向对比内容生成本身的开销：一份 ¥260 的 Marble 预算，约等于 90 小时 5090，足够跑完整季的 3DGS 场景 + 多个角色 LoRA + 视频试验还有富余。也就是说，在这套工艺里，3D 场景重建（Marble）才是单位成本的大头，本地训练/推理反而便宜。

实操上几条铁律：模型权重/数据/训练产物训完立刻拉回本地，不要把唯一副本留在易失的实例临时盘上；阿里系模型（Z-Image / Qwen-Image / Wan 等）走 ModelScope 下载比国际镜像稳得多。

---

## 4. 推荐工艺（落地）

### 4.1 短期（已可执行）

```
关键场景 anchor (5-10 个/集) → Marble 单图    ¥10-20 × N
微调镜头 (dolly / 小 pan)    → SHARP 兜底     ¥0
角色锁                       → SDXL LoRA + ai-toolkit  约 ¥0.6/角色
跨镜切镜空间一致             → Marble splat → Blender depth/flat → i2i ref
```

### 4.2 中期

```
1. 解决写实 base 的 gating（换不 gated 的写实模型）
2. 数据增广（A）+ i2i 扩展（B）→ 每角色 25-30 训练图
3. 重训角色 LoRA
4. 写 ControlNet pose+depth 流水线，对接 Blender + Marble splat
```

### 4.3 长期（解锁更省的自托管栈）

- **自托管 Hunyuan World 2.0** 替代 Marble（省 30-50×）
- **自托管视频模型**（Wan 2.2 / HunyuanVideo）替代商用 i2v（省约 80%）
- **角色专属 TTS**（GPT-SoVITS / F5-TTS）替代通用 voice
- **唇形同步**（MuseTalk / LatentSync）

---

## 5. 关键决策

- Marble 是当前空间一致性主通道
- i2i 凑多视角喂 Marble 这条路排除（拼缝鬼影）
- SHARP 仅做兜底（monocular 限制）
- 5090 是首选卡（性价比 + Blackwell FP8）
- ai-toolkit 是 LoRA 训练事实标准
- 触发词避免宗教专名直用，规避内容过滤

开放问题主要在写实 base 的选型（Flux gating 待绕开）、训练数据量扩充、以及真正几何一致的多视角解（Zero123++ 风格不对，Wonder3D/Era3D 待实测）。
