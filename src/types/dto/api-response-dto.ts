export interface ApiResponseDto<T> {
  data: T;
  status: number;
  ok: boolean;
  message?: string;
}
