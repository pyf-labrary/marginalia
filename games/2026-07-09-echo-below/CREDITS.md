# Credits

ECHO BELOW uses original procedural Canvas and WebAudio fallback assets.

Optional generated media is produced by local tools:

- Key art: `img-openai` with `gpt-image-2`
- In-game sprites and seabed texture: existing `gpt-image-2` outputs, previous Dreamina International outputs, and local transparent fallback sprites from `tools/make_missing_art.py`
- Expanded icon atlas: one 4x6 `gpt-image-2` sheet generated through `img-openai --backend wdt`, split into 24 transparent gameplay sprites
- Vision video: `video-vertex` with Vertex Veo
- Music: `music-vertex` with Vertex Lyria
- Sound effects: ElevenLabs Text to Sound Effects via `tools/eleven_sfx.py`

No third-party model, texture, or stock-media asset is required for the default playable build.
