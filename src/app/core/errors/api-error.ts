/** Erro normalizado vindo da API (problem+json) ou da rede. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly detail: string,
    readonly properties: Readonly<Record<string, unknown>> = {},
  ) {
    super(detail);
    this.name = 'ApiError';
  }

  static network(): ApiError {
    return new ApiError(0, NETWORK_ERROR, 'Falha de comunicação com a API.');
  }
}

export const NETWORK_ERROR = 'NETWORK';

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
