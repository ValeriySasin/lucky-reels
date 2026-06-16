import { httpClient }     from './http-client';
import { GameConfigDto }  from '@/types/dto/game-config-dto';
import { SpinDto }        from '@/types/dto/spin-dto';
import { SpinOutputDto }  from '@/types/dto/spin-output-dto';

export const gameApi = {
  getConfig: () =>
    httpClient.get<GameConfigDto>('/game/config'),

  spin: (body: SpinDto) =>
    httpClient.post<SpinOutputDto>('/game/spin', body),
};