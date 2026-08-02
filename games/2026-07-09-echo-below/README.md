# ECHO BELOW

`game/2026-07-09-echo-below/` is a sonar stealth extraction game.

## Play

```bash
cd ~/claw/game/2026-07-09-echo-below
python3 -m http.server 8069
```

Open `http://127.0.0.1:8069/`.

Controls:

- Mouse click: auto-navigate to a point; click salvage, supplies, or ruins to auto-approach and collect/scan
- Right click: cancel auto-navigation
- `WASD` / arrows: move
- `Shift`: overdrive
- `Space`: sonar ping
- `E`: collect / dock
- `Q`: deploy sonar decoy
- `Esc`: pause menu
- `M`: mute
- `R`: restart after an ended run

## Loop

Collect five signal cores, scan six ruin sites, and return to the central beacon. The near-beacon water is intentionally sparse; cores and richer salvage sit in the outer rings, so a clean run requires multiple routes, supply stops, cargo banking, and return trips. Extra salvage carries different value and weight, while supplies can repair hull, restore oxygen, cool the drive, lower noise, or add decoys. Sonar reveals the field, but every ping raises the noise profile and pulls hostile contacts toward the submersible.

## AI Media Pipeline

The game is fully playable without generated media. If these files exist, it loads them automatically:

- `assets/keyart.jpg` - title key art from `gpt-image-2`
- `assets/art/*` - in-game sprites and seabed texture from existing `gpt-image-2`, previous Dreamina International outputs, and local transparent fallback sprites
- `assets/art/atlas/*` - 24-item `gpt-image-2` sprite atlas split into salvage, supplies, hazards, fauna, and ruins
- `assets/bgm_loop.mp3` - Vertex Lyria loop
- `assets/vision_core.mp4` - Vertex Veo signal-core vision
- `assets/sfx/*.mp3` - ElevenLabs sound effects

Generate all media:

```bash
cd ~/claw/game/2026-07-09-echo-below
bash tools/gen_assets.sh
```

Generate only in-game art sprites:

```bash
bash tools/gen_art_assets.sh
```

`tools/gen_art_assets.sh` uses `~/bin/image/img-dreamina-intl`, skips files that already exist, then fills any remaining pickup/fauna gaps with `tools/make_missing_art.py` and normalizes PNG alpha with `tools/make_sprite_alpha.py`.

Generate or refresh the 24-icon atlas with `gpt-image-2`:

```bash
bash tools/gen_sprite_atlas.sh
```

`tools/gen_sprite_atlas.sh` skips existing atlas files, calls `~/bin/image/img-openai --backend wdt --model gpt-image-2`, then splits the 4x6 sheet with `tools/split_sprite_atlas.py`.

Selective generation:

```bash
bash tools/gen_assets.sh --skip-video
bash tools/gen_assets.sh --skip-image --skip-music
```

`tools/eleven_sfx.py` uses ElevenLabs `POST /v1/sound-generation`; auth is `ELEVENLABS_API_KEY` from env or `~/bin/.elevenlabs.env`.

## Debug

The game exposes:

```js
window.__ECHO
```

Useful handles:

- `__ECHO.teleportToCore()`
- `__ECHO.teleportToStructure()`
- `__ECHO.revealAll()`
- `__ECHO.deployDecoy()`
- `__ECHO.pause()`
- `__ECHO.resume()`
- `__ECHO.collect()`
- `__ECHO.teleportHome()`
- `__ECHO.dock()`
- `__ECHO.heat(90)`
- `__ECHO.win()`
