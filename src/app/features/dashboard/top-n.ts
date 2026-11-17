import { AppConfig } from '../../core/config/app-config.store';

/** topN da query string, limitado ao máximo da API (padrão quando ausente ou inválido). */
export function resolveTopN(value: string | null | undefined, config: AppConfig): number {
  const parsed = Number(value);
  if (!value || !Number.isInteger(parsed) || parsed < 1) {
    return config.defaultTopN;
  }
  return Math.min(parsed, config.maxTopN);
}
