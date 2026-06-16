import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { SYMBOL_SIZE } from '@/types/constants';
import { useReel } from './use-reel';
import { useSymbolSlot, SymbolSlotCtx } from './use-symbol-slot';

const ROWS = 3; // 1 visible + 1 above + 1 below

export function useReelComponent(app: PIXI.Application, reelIndex: number, x: number, y: number) {
  const logic     = useReel(reelIndex);
  const container = new PIXI.Container();
  const slots: SymbolSlotCtx[] = [];
  let winTl: gsap.core.Timeline | null = null;

  container.x = x;
  container.y = y;

  const maskGfx = new PIXI.Graphics()
    .rect(-SYMBOL_SIZE / 2, -SYMBOL_SIZE / 2, SYMBOL_SIZE, SYMBOL_SIZE)
    .fill(0xffffff);
  maskGfx.x = x;
  maskGfx.y = y;
  app.stage.addChild(maskGfx);
  container.mask = maskGfx;

  for (let i = 0; i < ROWS; i++) {
    const slot = useSymbolSlot(logic.symbolAtOffset(i - 1));
    slot.sprite.x = 0;
    slot.sprite.y = (i - 1) * SYMBOL_SIZE;
    container.addChild(slot.sprite);
    slots.push(slot);
  }

  function syncSymbols(): void {
    for (let i = 0; i < ROWS; i++) {
      slots[i].setSymbol(logic.symbolAtOffset(i - 1));
    }
  }

  function resetPos(): void {
    for (let i = 0; i < ROWS; i++) {
      slots[i].sprite.y = (i - 1) * SYMBOL_SIZE;
    }
  }

  function spin(landStop: number, delay: number): Promise<void> {
    return new Promise(resolve => {
      winTl?.kill();
      winTl = null;

      const len       = logic.getStripLength();
      const startStop = logic.getCurrentStop();
      const toGo      = ((landStop - startStop) % len + len) % len;
      const dist      = (3 * len + toGo) * SYMBOL_SIZE;
      const obj       = { v: 0 };

      gsap.to(obj, {
        v: dist,
        duration: 2.0,
        delay: delay / 1000,
        ease: 'power3.out',
        onUpdate: () => {
          const scroll = obj.v % SYMBOL_SIZE;
          const moved  = Math.floor(obj.v / SYMBOL_SIZE);
          const base   = (startStop + moved) % len;
          const strip  = logic.getStrip();

          for (let i = 0; i < ROWS; i++) {
            slots[i].setSymbol(strip[((base + 1 - i) % len + len) % len]);
            let y = (i - 1) * SYMBOL_SIZE + scroll;
            if (y > SYMBOL_SIZE * 1.5) y -= SYMBOL_SIZE * ROWS;
            slots[i].sprite.y = y;
          }
        },
        onComplete: () => {
          logic.setCurrentStop(landStop);
          resetPos();
          syncSymbols();
          slots.forEach(s => {
            s.sprite.scale.set(1);
            s.sprite.rotation = 0;
            s.playIdle();
          });
          resolve();
        },
      });
    });
  }

  function playWinAnimation(): void {
    winTl?.kill();
    winTl = null;

    const slot   = slots[1];
    const sprite = slot.sprite;
    slot.playWin();

    const sx = SYMBOL_SIZE / sprite.texture.width;
    const sy = SYMBOL_SIZE / sprite.texture.height;

    winTl = gsap.timeline({ onComplete: () => { winTl = null; } })
      .to(sprite.scale, { x: sx * 1.25, y: sy * 1.25, duration: 0.12, ease: 'power2.out' })
      .to(sprite.scale, { x: sx * 0.92, y: sy * 0.92, duration: 0.10 })
      .to(sprite.scale, { x: sx * 1.15, y: sy * 1.15, duration: 0.10 })
      .to(sprite.scale, { x: sx,        y: sy,         duration: 0.15 })
      .to(sprite, { rotation: -0.15, duration: 0.08 })
      .to(sprite, { rotation:  0.15, duration: 0.08 })
      .to(sprite, { rotation: -0.15, duration: 0.08 })
      .to(sprite, { rotation:  0,    duration: 0.08 });
  }

  function destroy(): void {
    winTl?.kill();
    slots.forEach(s => s.destroy());
    app.stage.removeChild(maskGfx);
    maskGfx.destroy();
    container.destroy({ children: true });
  }

  return { container, spin, playWinAnimation, destroy };
}

export type ReelCtx = ReturnType<typeof useReelComponent>;
