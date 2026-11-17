import type { CoverageStatus, Priority } from '../core/api/models';

export type HealthBand = 'critico' | 'atencao' | 'ok';

/** Faixas confirmadas (W-D12): crítico < 40, atenção 40–74, ok ≥ 75. */
export function healthBand(score: number): HealthBand {
  if (score < 40) {
    return 'critico';
  }
  return score < 75 ? 'atencao' : 'ok';
}

export const HEALTH_LABEL: Record<HealthBand, string> = { critico: 'crítico', atencao: 'atenção', ok: 'ok' };

export const PRIORITY_META: Record<Priority, { label: string; icon: string; css: string }> = {
  ALTA: { label: 'ALTA', icon: '▲', css: 'alta' },
  MEDIA: { label: 'MÉDIA', icon: '■', css: 'media' },
  BAIXA: { label: 'BAIXA', icon: '●', css: 'baixa' },
};

export const COVERAGE_META: Record<CoverageStatus, { label: string; icon: string; css: string }> = {
  OK: { label: 'OK', icon: '✓', css: 'ok' },
  INSUFICIENTE: { label: 'Insuficiente', icon: '◐', css: 'insuficiente' },
  AUSENTE: { label: 'Ausente', icon: '✗', css: 'ausente' },
};

export const CATEGORY_LABEL: Record<string, string> = {
  MEMORIA: 'Memória',
  GC: 'GC',
  CPU: 'CPU',
  THREADS: 'Threads',
  LOCKS: 'Locks',
  EXCECOES: 'Exceções',
  IO: 'I/O',
  CONFIG_JVM: 'Configuração da JVM',
  AMBIENTE: 'Ambiente',
  GRAVACAO: 'Gravação',
};

export const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Na fila',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  PARTIAL: 'Parcial',
  FAILED: 'Falhou',
};
