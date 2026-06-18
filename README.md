# Lucky Reels — HTML5 Slot Game

A single-payline 3-reel slot machine built with PixiJS v8, GSAP, and Spine animation. All audio is procedurally generated via Web Audio API — no MP3 files.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| PixiJS | 8.19 | 2D rendering, AnimatedSprite, TexturePacker atlas |
| GSAP | 3.12 | Reel spin easing, win animations, UI transitions |
| Spine (spine-pixi-v8) | 4.3 | Animated Spineboy character — idle / run / jump |
| TypeScript | 5.3 | Strict mode, path aliases (`@/*`) |
| Webpack | 5 | Bundling, dev server, DefinePlugin env vars |

## Features

- 3 reels, 1 payline, fixed strips (24 stops each)
- 3 symbols: **Seven** (×50 bet), **Crown** (×15), **Coin** (×10) — 3-of-a-kind wins
- Animated sprites — 2-frame idle loop + 3-frame win sequence per symbol
- Spineboy character reacts to game state: idle → run on spin → jump on win
- Staggered reel stop with per-reel win animation (each reel resolves its own Promise)
- Win banner with scale + fade GSAP animation
- Fixed bet ($10), balance starts at $1000
- Procedural background music (4-bar loop, BPM 104) + SFX via Web Audio API
- Sound toggle (mute/unmute)
- Responsive canvas — maintains 1920×1080 ratio on any screen size

## Getting Started

```bash
npm install
npm run dev        # dev server → http://localhost:8090
npm run build      # production build → dist/
npm run typecheck  # TypeScript check only
npm run lint       # ESLint
```

## Scene Flow

```
PreloadScene → LobbyScene → GameScene
```

- **PreloadScene** — loads all assets via `PIXI.Assets`, shows progress bar. Must finish before any sprites are created.
- **LobbyScene** — logo + "Click to continue" prompt. The click unlocks Web Audio API so background music starts immediately in GameScene.
- **GameScene** — all gameplay: reels, spin cycle, win/loss handling, UI.

## Project Structure

```
src/
├── App.ts                          Bootstrap: PIXI.Application, canvas resize, scene lifecycle
├── scenes/
│   ├── PreloadScene.ts             Asset loading, progress bar
│   ├── LobbyScene.ts               Logo + click-to-continue, unlocks AudioContext
│   └── GameScene.ts                Main scene — spin cycle, state, UI
├── components/
│   ├── reel/
│   │   ├── use-reel.ts             Strip/stop logic — pure JS, no PIXI
│   │   ├── use-symbol-slot.ts      Single AnimatedSprite — idle/win frame switching
│   │   └── use-reel-component.ts   Full reel: mask + 3 slots + GSAP spin animation
│   ├── spin-button/
│   │   ├── use-spin-button.ts      Button state (disabled, colors)
│   │   └── spin-button-component.ts  Rendered button with hover/press effects
│   ├── sound-manager/
│   │   ├── use-sound-manager.ts    Mute state
│   │   └── sound-manager-component.ts  Dispatches play() calls to ProceduralSounds
│   ├── win-banner/
│   │   └── win-banner-component.ts  Promise-based banner: show(amount, label) resolves when done
│   └── spine-character/
│       └── spine-character-component.ts  useSpineChar — idle / spin / win / destroy
├── api/
│   ├── http-client.ts              500ms mock delay, then mockRouter
│   ├── game.api.ts                 gameApi.spin()
│   └── mock/
│       ├── mock-router.ts          Dispatches by "METHOD /path" string key
│       └── game.mock.ts            RNG spin logic, win evaluation against PAYTABLE
├── data/
│   ├── reel-strips.ts              Symbol sequences for all 3 reels (24 stops each)
│   └── atlas-frames.ts             Lazy texture cache — built on first call after atlas load
├── utils/
│   ├── ProceduralSounds.ts         Web Audio API — all SFX + looping BGM, zero MP3s
│   └── draw-helpers.ts             PIXI.Graphics helpers: drawInfoBox, addLabelValue
├── enums/
│   ├── animation.ts                AnimDuration, AnimDurationMs, AnimEase
│   ├── colors.ts                   CssColor enum
│   ├── fonts.ts                    FontFamily, FontSize
│   ├── ui-layout.ts                SpinBtn, ReelFrame size/alpha constants
│   └── ui-text.ts                  All UI strings
└── types/
    ├── constants.ts                GAME_WIDTH/HEIGHT, ASSETS keys, SPIN_STAGGER
    ├── models/                     GameStateModel (canSpin getter), PaytableRowModel, SymbolKey
    └── dto/                        ApiResponseDto, SpinDto, SpinOutputDto
```

## Architecture

### Functional hooks

Reel components are factory functions returning `{ container, ...methods, destroy }`. Private state lives in closures. Types derive from `ReturnType<typeof useX>` — no duplicate interface declarations.

```ts
export function useReelComponent(app, reelIndex, x, y) {
  const logic = useReel(reelIndex); // strip/stop logic, pure JS
  const slots: SymbolSlotCtx[] = [];
  // ...
  return { container, spin, playWinAnimation, destroy };
}
export type ReelCtx = ReturnType<typeof useReelComponent>;
```

### Spin cycle

```
onSpinClicked()
  → canSpin check (!isSpinning && balance >= bet)
  → balance -= bet  (optimistic deduct)
  → POST /game/spin — 500ms mock delay
  → Promise.all(reels.map((r, i) => r.spin(stops[i], i * 300ms)))
      each .then() → playWinAnimation() + SFX_WIN if isWin
  → 550ms pause
  → balance = result.newBalance
  → isWin → spineboy.win() + await winBanner.show(amount, label)
  → UI unlock
```

### Reel scroll math

Each reel animates a single `obj.v` from `0` to `dist = (3 × stripLen + toGo) × SYMBOL_SIZE`. On every GSAP tick:

```ts
const scroll = obj.v % SYMBOL_SIZE          // offset within a slot (0..199px)
const moved  = Math.floor(obj.v / SYMBOL_SIZE) // symbols scrolled past
```

Three sprite slots recycle in a ring buffer. A `PIXI.Graphics` mask hides everything outside the visible row.

### Lazy texture cache

`atlas-frames.ts` builds texture arrays on first call to `idleFrames()` / `winFrames()` — not at module load time. This guarantees `PIXI.Texture.from()` runs only after `PreloadScene` has finished loading the TexturePacker atlas.

### Mock API

Single endpoint: `POST /game/spin`. Win probability 28%. `mockRouter` dispatches by `"METHOD /path"` key. To connect a real backend, replace the mock call in `http-client.ts` with `fetch`.

### Procedural audio

`ProceduralSounds.ts` generates all sound with Web Audio API oscillators — click, spin, stop, win SFX, and a 4-bar ambient loop (Cm–Ab–Eb–Bb, BPM 104). Notes are scheduled via `AudioContext.currentTime` for sample-accurate timing.

## Documentation

Full architecture, game logic breakdown, and interview Q&A:
- [`.claude/GAME_LOGIC.md`](.claude/GAME_LOGIC.md) — scenes, spin flow, entity interactions
- [`.claude/INTERVIEW_DEEP_DIVE.md`](.claude/INTERVIEW_DEEP_DIVE.md) — spin path, loader, API format, reel animation math
