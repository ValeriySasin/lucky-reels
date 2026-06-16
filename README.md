# Lucky Reels — HTML5 Slot Game

A single-payline slot machine built with PixiJS v8, GSAP, and Spine animation.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| PixiJS | v8 | 2D rendering, AnimatedSprite, TexturePacker atlas |
| GSAP | 3.x | Reel spin easing, win animations, UI transitions |
| Spine (spine-pixi-v8) | 4.3 | Animated character — idle / run / jump |
| TypeScript | 5.x | Strict typing throughout |
| Webpack | 5 | Bundling, path aliases, DefinePlugin |

## Features

- 3 reels × 1 visible row, fixed reel strips (24 stops each)
- 3 symbols: **Seven** (×50), **Crown** (×15), **Coin** (×10) — 3-of-a-kind wins
- Animated atlas sprites — 2-frame idle loop + 3-frame win sequence per symbol
- Spine character reacts to game state: idle → run (spin) → jump (win)
- Win banner with GSAP animation
- Bet selector: 1 / 5 / 10 / 25 / 50 / 100
- Paytable modal
- Procedural background music + sound effects (Web Audio API, no audio files)
- Sound on/off toggle
- Spin button disabled until player data loads from API

## Getting Started

```bash
npm install
npm run dev      # http://localhost:8090
npm run build    # output → dist/
```

## Project Structure

```
src/
  App.ts                        Entry — creates PIXI.Application, mounts scenes
  scenes/
    PreloadScene.ts             Loads all assets via PIXI.Assets, shows progress bar
    GameScene.ts                Main scene — UI, spin cycle, win/loss handling
  components/
    reel/
      use-reel.ts               Strip/stop logic (pure, no PIXI)
      use-symbol-slot.ts        Single AnimatedSprite — idle/win animations
      use-reel-component.ts     Full reel: container + mask + 3 slots + GSAP spin
    spin-button/                SpinButtonComponent — enabled/disabled states
    sound-manager/              SoundManagerComponent — mute/unmute, play by key
    spine-character/
      spine-character-component.ts  useSpineChar — idle / run / jump
  data/
    reel-strips.ts              Single source of truth for all strip arrays
    atlas-frames.ts             Lazy texture cache (built on first call, after atlas load)
  types/
    constants.ts                GAME_WIDTH/HEIGHT, ASSETS registry, layout constants
    dto/                        API request/response interfaces (one interface per file)
    models/                     GameStateModel (canSpin getter), PaytableRowModel, SymbolKey
    factory/                    atlasFrameFactory — builds frame name strings
  enums/                        FontFamily, AnimDuration, AnimEase, UiText, UiLayout
  api/
    http-client.ts              Thin wrapper: 500ms mock delay → mockRouter
    game/game-api.ts            gameApi.spin()
    player/player-api.ts        playerApi.getData()
    mock/
      mock-router.ts            Dispatches by "METHOD /path" key
      game.mock.ts              Spin logic, win calculation against PAYTABLE
      player.mock.ts            Player profile mock data
  utils/
    ProceduralSounds.ts         Web Audio API — all SFX + background music, no MP3s
    draw-helpers.ts             PIXI.Graphics helpers (info boxes, labels)
public/
  assets/
    spine/                      Spine skeleton + atlas (goblin character)
    symbols/                    symbols.json + symbols.png (TexturePacker atlas)
    ui/                         Background, reel frame, win banner, bottom panel, spin button
```

## Architecture

### Functional hooks pattern
All PixiJS components are plain functions returning `{ method, destroy }` objects — no classes. Private state lives in closures. Types are derived via `ReturnType<typeof useX>`, no duplicate interface declarations.

```ts
export function useReelComponent(app, reelIndex, x, y) {
  const logic = useReel(reelIndex);   // strip/stop logic
  const slots: SymbolSlotCtx[] = [];  // private, in closure
  // ...
  return { container, spin, playWinAnimation, destroy };
}
export type ReelCtx = ReturnType<typeof useReelComponent>;
```

### Spin cycle
1. `onSpinClicked()` checks `state.canSpin` (`!isSpinning && balance >= bet`)
2. `gameApi.spin({ bet })` — POST to mock, 500ms delay, returns `{ stops, isWin, winAmount, newBalance }`
3. All three reels start in parallel with stagger: `reel.spin(stops[i], i * SPIN_STAGGER)`
4. Each reel resolves its Promise individually — per-reel `.then()` fires win sound + animation as that reel stops
5. `Promise.all(reelPromises)` — after all stop: update balance, show win banner if needed, unlock spin

### Lazy texture cache
`atlas-frames.ts` builds the frame cache on the first call to `idleFrames()` / `winFrames()`, not at module load time. This ensures `PIXI.Texture.from()` is called only after `PreloadScene` has finished loading the atlas.

### Mock API
Enabled by default (`USE_MOCK=true` via webpack DefinePlugin). `mockRouter` dispatches by `"METHOD /path"` key. To switch to a real backend, replace `http-client.ts`'s mock call with `fetch`.

### Procedural audio
`ProceduralSounds.ts` generates all sounds via Web Audio API oscillators — no MP3 files. Background music is a 4-bar loop (BPM 104) scheduled ahead of time using `AudioContext.currentTime` for sample-accurate timing.

## Documentation

Full architecture breakdown, file-by-file explanations, and interview Q&A: [`.claude/PROJECT_GUIDE.md`](.claude/PROJECT_GUIDE.md)
