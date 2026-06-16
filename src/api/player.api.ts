import { httpClient }             from './http-client';
import { PlayerProfileDto }       from '@/types/dto/player-profile-dto';
import { UpdateBalanceDto }       from '@/types/dto/update-balance-dto';
import { UpdateBalanceOutputDto } from '@/types/dto/update-balance-output-dto';

export const playerApi = {
  getProfile: () =>
    httpClient.get<PlayerProfileDto>('/player/profile'),

  updateBalance: (body: UpdateBalanceDto) =>
    httpClient.put<UpdateBalanceOutputDto>('/player/balance', body),
};