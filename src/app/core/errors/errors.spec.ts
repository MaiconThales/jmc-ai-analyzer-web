import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, isApiError } from './api-error';
import { describeError, messageFor } from './error-messages';
import { toApiError } from '../interceptors/problem-json.interceptor';

describe('erros', () => {
  it('traduz códigos e preenche placeholders', () => {
    expect(messageFor('TOO_MANY_FILES', { maxFiles: 20 })).toBe('Envie no máximo 20 arquivos por lote.');
    expect(messageFor('FILE_TOO_LARGE')).toBe('Arquivo ou lote acima do limite ({limite}).');
    expect(messageFor('DESCONHECIDO')).toBe('Algo deu errado. Tente novamente.');
    expect(messageFor(null)).toBe('Algo deu errado. Tente novamente.');
    for (const code of ['EMPTY_UPLOAD', 'INVALID_FILE', 'NOT_FOUND', 'NOT_READY', 'STORAGE_UNAVAILABLE', 'INTERNAL_ERROR',
      'NETWORK', 'PARSE_ERROR', 'TIMEOUT', 'BLOB_NOT_FOUND']) {
      expect(messageFor(code)).not.toBe('');
    }
  });

  it('acrescenta o detalhe da API só para parâmetros inválidos', () => {
    expect(describeError(new ApiError(400, 'INVALID_PARAMETER', "'software' é obrigatório."))).toBe(
      "Algum campo está inválido. 'software' é obrigatório.",
    );
    expect(describeError(new ApiError(400, 'INVALID_PARAMETER', ''))).toBe('Algum campo está inválido.');
    expect(describeError(new ApiError(404, 'NOT_FOUND', 'x'))).toBe('Não encontrado.');
  });

  it('converte respostas HTTP em ApiError', () => {
    const problem = toApiError(
      new HttpErrorResponse({
        status: 409,
        error: { type: 'about:blank', title: 't', status: 409, instance: '/x', code: 'NOT_READY', detail: 'd', errorCode: 'PARSE_ERROR' },
      }),
    );
    expect(problem).toEqual(expect.objectContaining({ status: 409, code: 'NOT_READY', detail: 'd' }));
    expect(problem.properties).toEqual({ errorCode: 'PARSE_ERROR' });
    expect(toApiError(new HttpErrorResponse({ status: 404, error: 'texto' })).code).toBe('NOT_FOUND');
    expect(toApiError(new HttpErrorResponse({ status: 502 })).code).toBe('INTERNAL_ERROR');
    expect(toApiError(new HttpErrorResponse({ status: 413, error: null })).code).toBe('INVALID_PARAMETER');
    expect(toApiError(new HttpErrorResponse({ status: 0 })).code).toBe('NETWORK');
    expect(toApiError(new Error('x')).code).toBe('NETWORK');
    expect(isApiError(problem)).toBe(true);
    expect(isApiError(new Error())).toBe(false);
  });
});
