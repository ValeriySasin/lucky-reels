import { ApiResponseDto }      from '@/types/dto/api-response-dto';
import { GameConfigDto }       from '@/types/dto/game-config-dto';
import { SpinDto }             from '@/types/dto/spin-dto';
import { SpinOutputDto }       from '@/types/dto/spin-output-dto';
import { SpinHistoryItemDto }  from '@/types/dto/spin-history-item-dto';
import { PAYTABLE }            from '@/types/models/paytable-row-model';
import { SymbolKey, ReelSymbols } from '@/types/models/symbol.model';
import { STRIP_0, STRIP_1, STRIP_2 } from '@/data/reel-strips';

const WIN_CHANCE      = 0.28;
const INITIAL_BALANCE = 1000;
const MAX_HISTORY     = 50;

const state = {
  balance: INITIAL_BALANCE,
  history: [] as SpinHistoryItemDto[],
};

export const getMockBalance  = ()        => state.balance;
export const setMockBalance  = (v: number) => { state.balance = v; };
export const resetMockState  = ()        => { state.balance = INITIAL_BALANCE; state.history = []; };

function rand(strip: SymbolKey[]) {
  return Math.floor(Math.random() * strip.length);
}

function evaluate(syms: ReelSymbols, bet: number) {
  if (syms[0] === syms[1] && syms[1] === syms[2]) {
    const row = PAYTABLE.find(r => r.symbols[0] === syms[0]);
    if (row) return { isWin: true, winAmount: bet * row.multiplier, winLabel: row.label };
  }
  return { isWin: false, winAmount: 0, winLabel: '' };
}

function stopFor(strip: SymbolKey[], sym: SymbolKey) {
  const positions = strip.reduce<number[]>((acc, s, i) => (s === sym ? [...acc, i] : acc), []);
  return positions[Math.floor(Math.random() * positions.length)];
}

function buildWin() {
  const row = PAYTABLE[Math.floor(Math.random() * PAYTABLE.length)];
  const sym = row.symbols[0];
  return {
    stops: [stopFor(STRIP_0, sym), stopFor(STRIP_1, sym), stopFor(STRIP_2, sym)] as [number, number, number],
    syms:  [sym, sym, sym] as ReelSymbols,
  };
}

function buildLoss() {
  let stops: [number, number, number], syms: [SymbolKey, SymbolKey, SymbolKey];
  do {
    stops = [rand(STRIP_0), rand(STRIP_1), rand(STRIP_2)];
    syms  = [STRIP_0[stops[0]], STRIP_1[stops[1]], STRIP_2[stops[2]]];
  } while (evaluate(syms, 1).isWin);
  return { stops, syms };
}

export const gameMock = {
  'GET /game/config': (): ApiResponseDto<GameConfigDto> => ({
    ok: true, status: 200,
    data: {
      reelCount: 3, betMin: 1, betMax: 100,
      betSteps: [1, 5, 10, 25, 50, 100],
      symbols: ['seven', 'crown', 'coin'],
      rtp: 96, winMultiplier: 10,
    },
  }),

  'POST /game/spin': (body: SpinDto): ApiResponseDto<SpinOutputDto> => {
    if (body.bet <= 0) throw new Error('[Mock] bet must be positive');

    const { stops, syms } = Math.random() < WIN_CHANCE ? buildWin() : buildLoss();
    const { isWin, winAmount, winLabel } = evaluate(syms, body.bet);
    state.balance = state.balance - body.bet + winAmount;

    const spinId = 'spin-' + Math.random().toString(36).slice(2, 10);
    state.history.unshift({ spinId, timestamp: Date.now(), bet: body.bet, symbols: syms, isWin, winAmount });
    if (state.history.length > MAX_HISTORY) state.history.pop();

    return {
      ok: true, status: 200,
      data: { symbols: syms, stopIndices: stops, isWin, winAmount, winLabel, newBalance: state.balance, spinId },
    };
  },

  'GET /game/history': (): ApiResponseDto<SpinHistoryItemDto[]> => ({
    ok: true, status: 200,
    data: [...state.history],
  }),
};