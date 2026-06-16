import * as PIXI from 'pixi.js';
import { SYMBOLS, SymbolKey } from '@/types/models/symbol.model';

const IDLE_NAMES = ['idle_0', 'idle_1'];
const WIN_NAMES  = ['win_0', 'win_1', 'win_2'];

export const IDLE_FRAME_COUNT = IDLE_NAMES.length;
export const WIN_FRAME_COUNT  = WIN_NAMES.length;

function buildCache(names: string[]): Record<SymbolKey, PIXI.Texture[]> {
  return Object.fromEntries(
    SYMBOLS.map(sym => [
      sym,
      names.map(f => PIXI.Texture.from(`${sym}_${f}`)),
    ]),
  ) as Record<SymbolKey, PIXI.Texture[]>;
}

let idleCache: Record<SymbolKey, PIXI.Texture[]> | null = null;
let winCache:  Record<SymbolKey, PIXI.Texture[]> | null = null;

export function idleFrames(sym: SymbolKey): PIXI.Texture[] {
  if (!idleCache) idleCache = buildCache(IDLE_NAMES);
  return idleCache[sym];
}

export function winFrames(sym: SymbolKey): PIXI.Texture[] {
  if (!winCache) winCache = buildCache(WIN_NAMES);
  return winCache[sym];
}
