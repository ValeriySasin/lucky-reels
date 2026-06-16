import { SymbolKey } from './symbol.model';

export interface PaytableRowModelData {
  symbols:    SymbolKey[];
  multiplier: number;
  label:      string;
}

export class PaytableRowModel {
  symbols:    SymbolKey[];
  multiplier: number;
  label:      string;

  constructor(data: Partial<PaytableRowModelData> = {}) {
    this.symbols    = data.symbols    ?? [];
    this.multiplier = data.multiplier ?? 0;
    this.label      = data.label      ?? '';
  }

}

export const PAYTABLE: PaytableRowModel[] = [
  new PaytableRowModel({ symbols: ['seven'], multiplier: 50, label: 'JACKPOT!' }),
  new PaytableRowModel({ symbols: ['crown'], multiplier: 15, label: 'BIG WIN'  }),
  new PaytableRowModel({ symbols: ['coin'],  multiplier: 10, label: 'WIN'      }),
];
