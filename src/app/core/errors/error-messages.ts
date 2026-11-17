import { ApiError } from './api-error';

const MESSAGES: Readonly<Record<string, string>> = {
  INVALID_PARAMETER: 'Algum campo está inválido.',
  EMPTY_UPLOAD: 'Selecione ao menos um arquivo .jfr.',
  TOO_MANY_FILES: 'Envie no máximo {maxFiles} arquivos por lote.',
  INVALID_FILE: 'O arquivo não é uma gravação JFR válida.',
  FILE_TOO_LARGE: 'Arquivo ou lote acima do limite ({limite}).',
  NOT_FOUND: 'Não encontrado.',
  NOT_READY: 'A análise ainda não terminou.',
  STORAGE_UNAVAILABLE: 'Armazenamento indisponível. Tente novamente em instantes.',
  INTERNAL_ERROR: 'Algo deu errado. Tente novamente.',
  NETWORK: 'Algo deu errado. Tente novamente.',
  PARSE_ERROR: 'Não foi possível ler este arquivo JFR. Ele pode estar truncado.',
  TIMEOUT: 'O processamento passou do tempo limite.',
  BLOB_NOT_FOUND: 'O arquivo não foi encontrado no armazenamento.',
};

const GENERIC = 'Algo deu errado. Tente novamente.';

/** Mensagem em português para um código de erro, com placeholders {nome} preenchidos. */
export function messageFor(code: string | null | undefined, params: Readonly<Record<string, string | number>> = {}): string {
  const template = (code && MESSAGES[code]) || GENERIC;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}

/** Mensagem para exibir um {@link ApiError}: a tradução e, para parâmetros inválidos, o detalhe da API. */
export function describeError(error: ApiError, params: Readonly<Record<string, string | number>> = {}): string {
  const message = messageFor(error.code, params);
  return error.code === 'INVALID_PARAMETER' && error.detail ? `${message} ${error.detail}` : message;
}
