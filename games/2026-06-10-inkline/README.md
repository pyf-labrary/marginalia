# 墨線 INKLINE — 一笔画出的竞速

3D 线稿赛车,纸上水墨美学。随游玩推进,世界在三种境界间轮转:

1. **素描** — 暖纸底 + 钢笔线稿 3D 追逐视角
2. **晕染** — 集满墨色后,穿过下一道门触发:水彩从车身向外晕染上色(扩散波逐物浸染),天空、雾色、配乐随之切换
3. **剪纸** — 再行约 620m,镜头升至正俯视、景物压扁成纸片,变成 2D 俯视竞速;再行约 620m 颜色褪去、回到素描,开启新章(调色盘轮换 + 提速)

转换都锚定在「下一道门」触发(toast 预告),配 slow-mo + 水彩泼溅 + whoosh。

## 玩法

- `← →` / `A D` / 拖动 — 转向
- `W / ↑ / Shift` — 蘸墨加速
- 穿门连击(pentatonic 上行 chime)、收墨滴攒色、躲墨渍(永不上色的障碍);3 滴墨量,撞 3 次终章。

## 技术

- Three.js r160(lib/ 本地化(不能叫 vendor,GH Pages Jekyll 会排除),无外网依赖),所有物体 = EdgesGeometry 墨线层 + 透明实体层,上色 = 实体 opacity 浸染 + 全局线色 tint
- 赛道:Catmull-Rom 样条无限延伸,按弧长采样分块生成/回收
- 3D↔2D:单相机在追逐位与正俯视位之间插值(up 向量切到行进方向,fov 64→19),景物 scaleY 压扁
- 音频:WebAudio 主总线 + compressor;引擎声/音效全合成;三轨 BGM 按阶段 crossfade

## AI 资产(Vertex AI)

- `audio/{sketch,bloom,flat}.mp3` — Lyria (`music-vertex`) 各阶段配乐,首尾 acrossfade 处理成无缝 loop
- `paper.jpg` — Imagen (`img-vertex`) 水彩纸纹理,全屏 multiply 叠加
- `splash.jpg` — Imagen 白底水彩泼溅,multiply 模式做晕染转场特效(白底在 multiply 下自然消失)

本地试玩:`python3 -m http.server` 后开 `index.html`(ES module 需 http)。
