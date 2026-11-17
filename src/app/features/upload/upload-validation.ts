import { AppConfig } from '../../core/config/app-config.store';
import { formatBytes } from '../../shared/format';

export const SOFTWARE_PATTERN = /^[a-z0-9][a-z0-9-]{1,63}$/;
export const MAX_DESCRIPTION = 500;
export const MAX_VERSION = 64;

export interface SelectedFile {
  file: File;
  error: string | null;
}

/** Valida cada arquivo com os limites vindos de GET /api/v1/config. */
export function validateFile(file: File, config: AppConfig): string | null {
  if (!file.name.toLowerCase().endsWith(config.allowedExtension.toLowerCase())) {
    return `Não é um arquivo ${config.allowedExtension}.`;
  }
  if (file.size === 0) {
    return 'Arquivo vazio.';
  }
  if (file.size > config.maxFileSizeBytes) {
    return `Acima do limite de ${formatBytes(config.maxFileSizeBytes)}.`;
  }
  return null;
}

/** Problemas do lote como um todo (quantidade e tamanho total). */
export function validateBatch(files: readonly SelectedFile[], config: AppConfig): string | null {
  if (!files.length) {
    return 'Selecione ao menos um arquivo .jfr.';
  }
  if (files.length > config.maxFiles) {
    return `Envie no máximo ${config.maxFiles} arquivos por lote.`;
  }
  const total = files.reduce((sum, f) => sum + f.file.size, 0);
  if (total > config.maxRequestSizeBytes) {
    return `O lote tem ${formatBytes(total)}; o limite é ${formatBytes(config.maxRequestSizeBytes)}.`;
  }
  return null;
}

export function validateSoftware(value: string): string | null {
  if (!value.trim()) {
    return 'Informe o software.';
  }
  return SOFTWARE_PATTERN.test(value.trim())
    ? null
    : 'Use minúsculas, números e hífen (2 a 64 caracteres), começando por letra ou número.';
}
