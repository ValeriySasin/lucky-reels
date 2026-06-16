import { ApiResponseDto }            from '@/types/dto/api-response-dto';
import { PlayerProfileDto }         from '@/types/dto/player-profile-dto';
import { PlayerSettingsDto }        from '@/types/dto/player-settings-dto';
import { UpdateBalanceDto }         from '@/types/dto/update-balance-dto';
import { UpdateBalanceOutputDto }   from '@/types/dto/update-balance-output-dto';
import { UpdateSettingsDto }        from '@/types/dto/update-settings-dto';
import { getMockBalance, setMockBalance } from './game.mock';

const INITIAL_SETTINGS: PlayerSettingsDto = { soundEnabled: true, language: 'en' };

const state = {
  settings: { ...INITIAL_SETTINGS },
};

export const playerMock = {
  'GET /player/profile': (): ApiResponseDto<PlayerProfileDto> => ({
    ok: true, status: 200,
    data: {
      id: 'player-001', username: 'Player1',
      balance: getMockBalance(),
      level: 3, totalSpins: 42, totalWins: 11,
    },
  }),

  'PUT /player/balance': (body: UpdateBalanceDto): ApiResponseDto<UpdateBalanceOutputDto> => {
    setMockBalance(body.amount);
    return { ok: true, status: 200, data: { balance: body.amount } };
  },

  'GET /player/settings': (): ApiResponseDto<PlayerSettingsDto> => ({
    ok: true, status: 200,
    data: { ...state.settings },
  }),

  'PUT /player/settings': (body: UpdateSettingsDto): ApiResponseDto<PlayerSettingsDto> => {
    state.settings = { ...state.settings, ...body };
    return { ok: true, status: 200, data: { ...state.settings } };
  },
};
