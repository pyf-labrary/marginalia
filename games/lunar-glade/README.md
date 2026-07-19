# 月白林隙 · Lunar Glade

`game/2026-07-19-lunar-glade/` — 月光庭院探索小游戏。用 Grok Imagine 游戏资产生成套件（core / character / animation / tilesets / UI icons）出齐角色、地砖、道具与 UI，再以 Canvas 2D 做成可玩成品。

## 玩法

1. **拾取月华**（粉银花）——点灯燃料  
2. **Space** 切换提灯：开灯才能点祠，但会吸引**影蛾**  
3. 提灯靠近冷祠，消耗 **3 月华** 点燃（共 5 座）  
4. 五祠皆燃后，踏入**中央月门**通关  

**灯芯**归零则失败。

## 操作

| 键 | 作用 |
|---|---|
| WASD / 方向键 | 移动 |
| Space | 提灯开/关 |
| Esc | 暂停 |
| M | 静音 |
| R | 结束后重开 |

## 本地运行

```bash
cd ~/claw/game/2026-07-19-lunar-glade
python3 -m http.server 8079
```

打开 `http://127.0.0.1:8079/`。

## 资产管线（Imagine 套件）

| 技能 | 产出 |
|---|---|
| `game-asset-core` | 绿幕精灵、引擎就绪默认、风格锚定 |
| `game-character-consistency` | 狐灯使角色定妆（edit-chain 基础） |
| `game-animation-frames` | 行走：`image_to_video` → ffmpeg 抽帧 → 8 帧 sheet |
| `game-tilesets` | 苔地 / 石径无缝砖 + 2×2 验缝 |
| `game-ui-icons` | 月华/心/提灯/月 图标 + 空白面板 |

目录：

```
assets/
  art/       hero, moth, moonblossom, shrine(+lit), tree
  tiles/     grass, path (+ 2x2 verify)
  ui/        icons, panel
  anim/      walk/w00..w07, walk_sheet, hero_walk.mp4
  keyart.jpg
```

## Debug

```js
window.__LUNAR.G          // 当前局状态
window.__LUNAR.startRun()
window.__LUNAR.endGame(true)
```
