import { httpClient }   from './http-client';
import { SpinDto }      from '@/types/dto/spin-dto';
import { SpinOutputDto } from '@/types/dto/spin-output-dto';

export const gameApi = {
  spin: (body: SpinDto) =>
    httpClient.post<SpinOutputDto>('/game/spin', body),
};
