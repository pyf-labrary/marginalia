# 猎龙纪 · JURASSIC HUNT

驾驶武装皮卡穿越侏罗纪的 3D 狩猎游戏。Three.js (r177) + 原生 ES modules，零构建步骤。

## 运行

ES modules 需要 HTTP 服务：

```bash
cd ~/claw/game/2026-06-11-jurassic-hunt
python3 -m http.server 8923
# 浏览器打开 http://localhost:8923/
```

## 玩法

| 操作 | 键位 |
|---|---|
| 驾驶 | W A S D |
| 氮气加速 | Shift |
| 移动准星（机枪追随准星） | 鼠标；推向屏幕边缘转动视角 |
| 开火（弹药无限） | 鼠标左键 |
| 第一 / 第三人称切换 | V 或 C |

左下角雷达地图：地形底图 + 恐龙（红）/ UFO（青）/ 外星人（绿）/ 陨石 ◆ / 狮身人面像 ▲ / 神秘物体 ◇，扇形为当前视野。所有资源（含穿越视频）在标题屏预载完成后才允许进入，保证全程零卡顿。

- **恐龙**：六种地面恐龙（似鸡龙 / 迅猛龙 / 三角龙 / 剑龙 / 霸王龙 / 腕龙），血量与体型成正比；**击中头部要害一发必杀**（×2 积分 + 慢动作），打躯干需多发。空中有翼龙群，可击落。
- **UFO**：随机出现，击落后坠毁，外星人从残骸走出用激光攻击皮卡。
- **陨石**：车体受损后开到罗盘 ◆ 标记的发光陨石旁，靠近自动修复。
- **神秘物体**：黑色方碑 / 巨型琥珀 / 远古晶簇 / 摩艾石像随机出现（罗盘 ?），射击得分。
- **回家**：沙漠区有金字塔与狮身人面像（罗盘 ▲）。连续射击狮身人面像 12 发唤醒时空之门，转场回到现代午夜都市，结算战绩。

## AI 生成资产（Google Vertex AI）

| 文件 | 生成方式 |
|---|---|
| `assets/keyart.jpg` | Nano Banana 2（gemini-3.1-flash-image）via `img-vertex` — 标题画面 |
| `assets/bgm_jurassic.mp3` | Lyria（lyria-002）via `music-vertex` — 史前战斗鼓点循环 |
| `assets/bgm_city.mp3` | Lyria via `music-vertex` — 现代都市 synthwave |
| `assets/timewarp.mp4` | Veo 3.1 via `video-vertex` — 时空穿越过场（960×540 crf28 压缩） |

枪声 / 爆炸 / 恐龙吼叫 / 激光 / 引擎等全部音效为 WebAudio 程序化合成（`src/audio.js`），无外部采样。

## 结构

```
index.html      HUD/标题屏/CSS（远征队琥珀色 HUD 风格）
src/main.js     主循环：输入、相机、射击判定、修复、穿越流程
src/world.js    地形（FBM 高度场）、天空 shader、植被 instancing、金字塔/狮身人面像、陨石、神秘物体
src/dinos.js    六种恐龙程序化建模 + AI 状态机 + 翼龙 + 刷怪
src/ufo.js      UFO 巡航/坠毁 + 外星人 AI + 激光弹
src/truck.js    皮卡建模 + 街机物理 + 机枪炮塔
src/effects.js  粒子池/曳光弹/冲击波/爆炸
src/audio.js    WebAudio 总线 + 程序化 SFX + BGM
src/city.js     现代都市夜景（结局场景）
src/hud.js      DOM HUD：血条/积分/击杀流/罗盘/伤害数字
```

调试句柄：`window.__JH`（S 状态 / world / truck / 各 manager / shoot / startWarp）。
