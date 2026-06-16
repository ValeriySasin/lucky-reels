import { ReelSymbols } from '@/types/models/symbol.model';

export interface SpinHistoryItemDto {
  spinId:    string;
  timestamp: number;
  bet:       number;
  symbols:   ReelSymbols;
  isWin:     boolean;
  winAmount: number;
}
