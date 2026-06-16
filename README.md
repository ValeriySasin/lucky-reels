# Lucky Reels — HTML5 Slot Game

A single-payline 3-reel slot machine built with PixiJS v8, GSAP, and Spine animation. All audio is procedurally generated via Web Audio API — no MP3 files.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| PixiJS | 8.19 | 2D rendering, AnimatedSprite, TexturePacker atlas |
| GSAP | 3.12 | Reel spin easing, win animations, UI transitions |
| Spine (spine-pixi-v8) | 4.3 | Animated goblin character — idle / run / jump |
| TypeScript | 5.3 | Strict mode, path aliases (`@/*`) |
| Webpack | 5 | Bundling, dev server, DefinePlugin env vars |

## Features

- 3 reels, 1 payline, fixed strips (24 stops each)
- 3 symbols: **Seven** (×50 bet), **Crown** (×15), **Coin** (×10) — 3-of-a-kind wins
- Animated sprites — 2-frame idle loop + 3-frame win sequence per symbol
- Goblin character reacts to game state: idle → run on spin → jump on win
- Staggered reel stop with per-reel win animation (each reel resolves its own Promise)
- Win banner with scale + fade GSAP animation
- Bet selector: 1 / 5 / 10 / 25 / 50 / 100
- Paytable modal (click-to-open, animated)
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

## Project Structure

```
src/
├── App.ts                          Bootstrap: PIXI.Application, canvas resize, scene lifecycle
├── scenes/
│   ├── PreloadScene.ts             Loads all assets via PIXI.Assets, shows progress bar + stars
│   └── GameScene.ts                Main scene — UI layout, spin cycle, state management
├── components/
│   ├── reel/
│   │   ├── use-reel.ts             Strip/stop logic — pure JS, no PIXI (easily unit-tested)
│   │   ├── use-symbol-slot.ts      Single AnimatedSprite wrapper — idle/win frame switching
│   │   └── use-reel-component.ts   Full reel: mask + 3 slots + GSAP spin animation
│   ├── spin-button/
│   │   ├── use-spin-button.ts      Button state logic (disabled, colors)
│   │   └── spin-button-component.ts  Rendered button with hover/press effects
│   ├── sound-manager/
│   │   ├── use-sound-manager.ts    Mute state
│   │   └── sound-manager-component.ts  Dispatches play() calls to ProceduralSounds
│   ├── win-banner/
│   │   └── win-banner-component.ts  Promise-based banner: show(amount) resolves when done
│   ├── paytable-modal/
│   │   └── paytable-modal-component.ts  Modal with symbol grid and multipliers
│   └── spine-character/
│       └── spine-character-component.ts  useSpineChar — idle / spin / win / destroy
├── api/
│   ├── http-client.ts              Thin wrapper with 500ms mock delay
│   ├── game.api.ts                 gameApi.getConfig(), gameApi.spin()
│   ├── player.api.ts               playerApi.getProfile(), playerApi.updateBalance()
│   └── mock/
│       ├── mock-router.ts          Dispatches by "METHOD /path" string key
│       ├── game.mock.ts            RNG spin logic, win evaluation against PAYTABLE
│       └── player.mock.ts          Player profile, balance sync with game mock
├── data/
│   ├── reel-strips.ts              Symbol sequences for all 3 reels (24 stops each)
│   └── atlas-frames.ts             Lazy texture cache — built on first call after atlas load
├── utils/
│   ├── ProceduralSounds.ts         Web Audio API — all SFX + looping BGM, zero MP3s
│   └── draw-helpers.ts             PIXI.Graphics helpers: drawInfoBox, addLabelValue
├── enums/
│   ├── animation.ts                AnimDuration (seconds), AnimDurationMs, AnimEase strings
│   ├── colors.ts                   CssColor enum (hex strings for Text.style.fill)
│   ├── fonts.ts                    FontFamily, FontSize
│   ├── ui-layout.ts                UiBox, SpinBtn, ReelFrame — all size/alpha constants
│   └── ui-text.ts                  All UI strings in one place
└── types/
    ├── constants.ts                GAME_WIDTH/HEIGHT, ASSETS registry, SPIN_STAGGER
    ├── models/                     GameStateModel, PaytableRowModel, SymbolKey
    └── dto/                        API request/response interfaces (one per file)
```

## Architecture

### Functional hooks

Components are factory functions returning `{ container, ...methods, destroy }`. Private state lives in closures. Types derive from `ReturnType<typeof useX>` — no duplicate interface declarations.

```ts
export function useReelComponent(app, reelIndex, x, y) {
  const logic = useReel(reelIndex); // strip/stop logic, pure
  const slots: SymbolSlotCtx[] = [];
  // ...
  return { container, spin, playWinAnimation, destroy };
}
export type ReelCtx = ReturnType<typeof useReelComponent>;
```

Classes are used where there's a clear lifecycle with internal GSAP timelines: `WinBannerComponent`, `PaytableModalComponent`, `SpinButtonComponent`.

### Spin cycle

```
onSpinClicked()
  → canSpin check (!isSpinning && balance >= bet)
  → balance -= bet  (optimistic deduct)
  → gameApi.spin({ bet }) — POST /game/spin, 500ms mock delay
  → Promise.all(reels.map((r, i) => r.spin(stops[i], i * 300ms)))
      each .then() → playWinAnimation() + SFX if isWin
  → await 550ms pause
  → balance = result.newBalance
  → isWin → goblin.win() + await winBanner.show()
  → UI unlock
```

### Reel scroll math

Each reel animates a single `obj.v` value from `0` to `dist = (3 × stripLen + toGo) × SYMBOL_SIZE`. On every GSAP tick:

```ts
const scroll = obj.v % SYMBOL_SIZE   // fractional offset within a slot
const moved  = Math.floor(obj.v / SYMBOL_SIZE)  // symbols scrolled past
```

Three sprite slots recycle in a ring buffer — when a slot exits the bottom, it reappears at the top with the next symbol. A rectangular `PIXI.Graphics` mask hides everything outside the visible area.

### Lazy texture cache

`atlas-frames.ts` builds texture arrays on the first call to `idleFrames()` / `winFrames()` — not at module load. This guarantees `PIXI.Texture.from()` runs only after `PreloadScene` has finished loading the TexturePacker atlas.

### Mock API

Enabled by default (`USE_MOCK=true` via webpack DefinePlugin). `mockRouter` dispatches by `"METHOD /path"` key. Win probability is 28%. To connect a real backend, replace the mock call in `http-client.ts` with `fetch`.

### Procedural audio

`ProceduralSounds.ts` generates everything with Web Audio API oscillators — click, spin, stop, win SFX, and a 4-bar ambient loop (Cm–Ab–Eb–Bb, BPM 104). Notes are scheduled with `AudioContext.currentTime` for sample-accurate timing; `setTimeout` only triggers the next scheduling cycle.
