import { ReelSymbols } from '@/types/models/symbol.model';

export interface SpinOutputDto {
  symbols:     ReelSymbols;
  stopIndices: [number, number, number];
  isWin:       boolean;
  winAmount:   number;
  winLabel:    string;
  newBalance:  number;
}
