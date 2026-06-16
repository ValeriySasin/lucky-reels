import { SymbolKey } from '@/types/models/symbol.model';

export interface GameConfigDto {
  reelCount:     number;
  betMin:        number;
  betMax:        number;
  betSteps:      number[];
  symbols:       SymbolKey[];
  rtp:           number;
  winMultiplier: number;
}
