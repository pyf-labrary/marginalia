---
layout: "post"
title: "ComfyUI + Z-Image Turbo 角色形象设计工艺实录"
date: "2026-05-10 12:00:00 +0800"
author: "Marginalia"
description: "这是 AIGC 短剧角色一致性工艺的第二阶段实录：为什么把写实 base 从 FLUX.2 Dev 反转到 Z-Image Turbo，ComfyUI 全栈在消费级显卡上的部署清单，以及一个\"神话角色形象怎么也调不对\"的失败案例和它暴露出的 text2image 多约束叠加的执行力短板。"
excerpt: "这是 AIGC 短剧角色一致性工艺的第二阶段实录：为什么把写实 base 从 FLUX.2 Dev 反转到 Z-Image Turbo，ComfyUI 全栈在消费级显卡上的部署清单"
tags: [AIGC, ComfyUI, Z-Image, 角色设计, 文生图]
cover: /assets/img/posts/2026-05-10-aigc-comfyui-zimage-character-design/cover.jpg
---

## TL;DR

1. **Base 模型选型反转**：FLUX.2 Dev → **Z-Image Turbo**（阿里 Tongyi-MAI，2025-10 发布）。第三方实测 Z-Image 皮肤细节优于 Flux.1 / Qwen-Image / HiDream / **Flux.2 Dev**，中文原生强、HF 不 gated、单卡 32GB 富裕。
2. **ComfyUI 全栈在单卡 5090 部署完成**：Z-Image 31G + IPAdapter 6.3G + ControlNet Union 2.4G + 5 个关键节点。
3. **自托管视频通道**（Wan 2.2）调研出场：Animate V2 是"AI 演员替身"杀器，潜在全季可省约 ¥7700-7900。
4. **一个神话角色形象迭代失败案例**：v0→v3 始终调不对，暴露出文生图在"多个神话特征叠加约束"下的执行力短板。

---

## 1. Base 模型选型反转

### 调研结论

| 模型 | 写实/皮肤 | LoRA VRAM | 中文 | HF gating |
|---|---|---|---|---|
| **Z-Image Turbo** | 第三方实测优于 Flux.2 Dev | 12-16 GB | 双语强 | 不 gated |
| Qwen-Image-2512 | 强写实 + 强文字 | 32 GB+ | 强 | 不 gated |
| Flux.2 Dev | "脸软糊、AI 感明显" | 30 GB int8 / 96 GB full | 中等 | gated |
| Flux.2 Klein | 蒸馏版速度优先 | 12 GB | 中等 | gated |
| Flux.1 Dev | 老牌 2024 标杆 | 24 GB | 弱 | gated |

**为什么反转**：上一阶段卡在 Flux 的 license gating，需要官方 token 才能拉权重。而 Z-Image Turbo 不仅在第三方实测里皮肤细节更好，且完全不 gated、中文原生强、单卡 32GB 训练 LoRA 还很富裕——gating 阻塞问题随选型自动消失。

**LoRA 训练关键参数**（针对 Z-Image）：

- `linear_rank: 64`（不是 16/32，皮肤细节强相关）
- 推荐 70-80 张数据
- 4000 steps（不是 800-1000）
- 单卡 32GB 可同时训 2 个角色

按 5090 约 ¥2.78/h 估算，rank-64 + 4000 steps 的单角色训练成本约 ¥3-5。

---

## 2. 自托管视频通道（Wan 2.2，调研未启动）

### 经济性

```
商用 i2v: 约 ¥0.75/秒，按 60 集 × 30 镜 × 6s 估 ≈ ¥8100
Wan 2.2 自托管: 约 ¥0.5/6s，全季约 ¥150-300 + LoRA 训练 ¥80-230
潜在节省: 约 ¥7700-7900
```

### Wan 2.2 Animate V2 = "AI 演员替身"

```
单角色参考图 + driving pose video (OpenPose) + 角色 LoRA
  → SAM 2 mask + face crop + CLIP vision embed 多重融合
  → 输出该角色按指定 pose 动作的高写实视频
```

变体：Wan2.2-TI2V-5B（24GB 入门验证）、Wan2.2-14B I2V（FP8 16GB 生产）、Wan 2.2 Animate V2（14B + IP-Adapter，FP8 约 20GB）。

**决策：不立刻上**。当前 Z-Image 静态生图尚未验证完，同时上两个新模型会让问题源头混淆；且视频 LoRA ≠ 图像 LoRA 需重训。待 Z-Image LoRA 通关后再做 i2v 对照实验。

---

## 3. ComfyUI 全栈部署（单卡 5090）

### 节点

```
ComfyUI core
+ ComfyUI-Manager
+ ComfyUI_IPAdapter_plus
+ comfyui_controlnet_aux
+ PuLID_ComfyUI
+ ComfyUI-Impact-Pack (FaceDetailer)
```

### 模型

```
checkpoints/z-image-turbo            31 GB  (Z-Image Turbo 全套)
ipadapter/sdxl_models/*              6.3 GB (IPAdapter Plus + CLIP-ViT-H image_encoder)
controlnet/union-sdxl/*              2.4 GB (xinsir Union promax SDXL)
```

重启实例后模型与节点直接可用，无需重下，停机期间只按存储计费。

---

## 4. 神话角色形象迭代（失败案例）

这一节是个反面教材：一个佛教/印度神话角色（帝释天）的形象，从 v0 调到 v3 始终不对，最后暂停。它很好地暴露了文生图在叠加约束下的短板。

### v0 — 错误的设计

最初的 4 张参考图把多个印度神祇的特征拼在了一起：

```
✗ 4 只手       ← 实为毗湿奴标志
~ 第三眼       ← 实为可选 canonical（后续保留）
✗ 蓝皮         ← 克里希纳/毗湿奴标志（佛教帝释天应为金身）
✗ 5 层塔冠     ← 应是扇形宽冠
✗ 持莲花       ← 观音/弥勒标志，非帝释天
✓ 金刚杵       ← 正确
```

**问题来源**：原 prompt 把不同神祇特征拼接，造出了一个"伪混合神"。这说明角色考据没做对，后面再怎么生图都是错的——形象设计的源头错误会污染整条训练数据链。

### 经典考据后的正确依据

| 特征 | 经典 |
|---|---|
| 手数 | **2 手**（右金刚杵，左施印或持物） |
| 第三眼 | 壁画/雕塑常见，**保留** |
| 肤色 | **金身**（光明神圣尊贵） |
| 冠 | 扇形宽冠（非塔冠）|
| 装束 | 璎珞 + 天衣飘逸 |
| 坐骑 | 六牙白象（场景中可出现）|
| 汉地特色 | 少年帝王 / 男人女相 |

### v2 / v3 — 改用中文 prompt + 加三目/金身/男人女相

依正确考据重做了两轮：v2 给出唐宋宫廷少年帝王、西域金身、天宫云海等 8 个方向，反馈"基本都不行"——缺三目、男人女相不够、金身感弱、过于普通帝王。v3 针对性补三目 + 男人女相 + 金身又出 6 张，最终判定**效果仍不行，暂停**。

### 推测瓶颈

1. **文生图对"三目 + 金身 + 男人女相"叠加约束执行力弱**：任意 1 个特征可能被丢失。
2. **写实 prompt 与神话特征（三目/金身）内在矛盾**：模型偏向画"普通古装帝王"，把超现实特征当噪声丢掉。
3. **"男人女相"是模糊概念**：模型理解成"娘炮"或"中性"，而非正确的"汉地少年帝王秀美而威严"。
4. **"金身"容易降级**：变成"金黄色衣服"或"古铜色皮肤"，而非真正的"光明神圣金光"。

### 可能的修复方向（未实测）

- **改换工具**：换中文/古风更强的写实模型（Z-Image Turbo / Qwen-Image）。
- **i2i 启动**：先找一张经典壁画/造像（如敦煌壁画）作 ref，i2i 出现代写实版，用真实参考锚住超现实特征。
- **概念分层**：先出"少年男人女相帝王"基础像（无三目无金身），再 i2i 加金身，再 inpaint 加三目——把叠加约束拆成串行步骤。
- **找现成 LoRA**：社区可能已有同名神话角色 LoRA，可作 starting point。

---

## 5. 远端工作流 4 个踩坑

把模型权重下到按小时租的云 GPU 上，踩到 4 个值得记的坑：

### 5.1 huggingface-cli download 已弃用

新版 huggingface_hub（>=0.26）弃用了 `huggingface-cli download`，原 setup 脚本里所有 download 步骤静默失败（节点装好了但模型一个没下）。改用 python `from huggingface_hub import snapshot_download` 直接调用。

### 5.2 下载后 copy 导致磁盘翻倍

`snapshot_download` 把模型下到 cache 目录后，如果再 `shutil.copy2()` 到目标位置，**磁盘占用翻倍**：31GB 的模型 cache + target = 62GB，直接爆掉 50GB 的数据盘。修复：用 `os.rename(src, dst)` 替代 copy——同一文件系统上是 O(1) 的 inode 重命名，不占额外空间。

### 5.3 国际镜像 SSL 反复 timeout

国际镜像站在密集大文件下载时频繁报 `SSL handshake operation timed out`，即使开了学术加速也没救，大模型连下两次都超时。修复：阿里出品的模型（Z-Image / Qwen-Image / Wan）改走 **ModelScope**——国内通道满速、多文件并发、0 失败。

### 5.4 cache_dir 与 local_dir 语义不一致

不同 SDK 行为不同：HF 的 `snapshot_download(local_dir=...)` 直接放目标位置；ModelScope 的 `snapshot_download(cache_dir=...)` 只指定 cache 根，实际文件落在 `cache_dir/<owner>/<repo>/` 下，需要再 `os.rename` 移到目标位置。

---

## 6. 关键决策小结

- Base 模型主通道：FLUX.2 Dev → **Z-Image Turbo**
- ComfyUI 全栈部署完成
- 阿里系模型走 ModelScope 优于国际镜像
- `os.rename` 优于 `shutil.copy2`（受限磁盘下避免翻倍）
- `huggingface-cli download` → `snapshot_download` python API
- 自托管视频通道（Wan 2.2）暂缓，待静态生图通关

最大的开放问题仍是神话角色形象怎么走：是找现成社区 LoRA、用经典壁画作 i2i seed，还是接受不完美先训起来——这本质上是"超现实角色 + 写实质感"这对矛盾约束在当前文生图工具下的工程取舍。
