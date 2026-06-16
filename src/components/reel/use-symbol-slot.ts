import * as PIXI from 'pixi.js';
import { SYMBOL_SIZE } from '@/types/constants';
import { SymbolKey } from '@/types/models/symbol.model';
import { idleFrames, winFrames, IDLE_FRAME_COUNT, WIN_FRAME_COUNT } from '@/data/atlas-frames';

const BASE_CYCLE_RATE = 3;
const IDLE_FPS = IDLE_FRAME_COUNT * BASE_CYCLE_RATE;
const WIN_FPS  = WIN_FRAME_COUNT  * BASE_CYCLE_RATE;

export function useSymbolSlot(sym: SymbolKey) {
  const sprite = new PIXI.AnimatedSprite(idleFrames(sym));
  let currentSym = sym;

  sprite.anchor.set(0.5);
  sprite.width  = SYMBOL_SIZE;
  sprite.height = SYMBOL_SIZE;
  sprite.animationSpeed = IDLE_FPS / 60;
  sprite.loop = true;
  sprite.play();

  function setSymbol(next: SymbolKey): void {
    if (next === currentSym) return;
    currentSym = next;
    const playing = sprite.playing;
    sprite.textures = idleFrames(next);
    sprite.animationSpeed = IDLE_FPS / 60;
    sprite.loop = true;
    if (playing) sprite.play();
  }

  function playWin(): void {
    sprite.textures = winFrames(currentSym);
    sprite.animationSpeed = WIN_FPS / 60;
    sprite.loop = false;
    sprite.onComplete = () => sprite.stop();
    sprite.gotoAndPlay(0);
  }

  function playIdle(): void {
    sprite.textures = idleFrames(currentSym);
    sprite.animationSpeed = IDLE_FPS / 60;
    sprite.loop = true;
    sprite.onComplete = undefined; // PixiJS API accepts only undefined here
    sprite.gotoAndPlay(0);
  }

  function destroy(): void {
    sprite.destroy();
  }

  return { sprite, setSymbol, playWin, playIdle, destroy };
}

export type SymbolSlotCtx = ReturnType<typeof useSymbolSlot>;
