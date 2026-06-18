import { ApiResponseDto } from '@/types/dto/api-response-dto';
import { gameMock } from './game.mock';

type MockHandler = (body?: unknown) => ApiResponseDto<unknown>;

const handlers: Record<string, MockHandler> = {
  ...(gameMock as Record<string, MockHandler>),
};

export function mockRouter<T>(method: string, path: string, body?: unknown): ApiResponseDto<T> {
  const key = `${method} ${path}`;
  const handler = handlers[key];

  if (!handler) throw new Error(`[Mock] No handler for: ${key}`);

  return handler(body) as ApiResponseDto<T>;
}
