import { ApiResponseDto } from '@/types/dto/api-response-dto';
import { mockRouter } from './mock/mock-router';

const MOCK_DELAY_MS = 500;

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<ApiResponseDto<T>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
  return mockRouter<T>(method, path, body);
}

export const httpClient = {
  get:    <T>(path: string)                => request<T>('GET',    path),
  post:   <T>(path: string, body: unknown) => request<T>('POST',   path, body),
  put:    <T>(path: string, body: unknown) => request<T>('PUT',    path, body),
  delete: <T>(path: string)               => request<T>('DELETE', path),
};
