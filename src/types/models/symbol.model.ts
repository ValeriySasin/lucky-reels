export const SYMBOLS = ['crown', 'coin', 'seven'] as const;
export type SymbolKey = typeof SYMBOLS[number];
export type ReelSymbols = [SymbolKey, SymbolKey, SymbolKey];
