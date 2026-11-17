import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../errors/api-error';

/** Campos do RFC 9457 e o code; o resto vira propriedades extras do erro. */
const STANDARD_FIELDS = new Set(['type', 'title', 'status', 'detail', 'instance', 'code']);

interface ProblemBody {
  code?: string;
  detail?: string;
  [key: string]: unknown;
}

/** Converte qualquer erro HTTP em {@link ApiError}. */
export const problemJsonInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError((error: unknown) => throwError(() => toApiError(error))));

export function toApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse) || error.status === 0) {
    return ApiError.network();
  }
  const body = isProblem(error.error) ? error.error : {};
  const properties = Object.fromEntries(Object.entries(body).filter(([key]) => !STANDARD_FIELDS.has(key)));
  return new ApiError(error.status, body.code ?? fallbackCode(error.status), body.detail ?? error.message, properties);
}

function isProblem(value: unknown): value is ProblemBody {
  return typeof value === 'object' && value !== null;
}

function fallbackCode(status: number): string {
  if (status === 404) {
    return 'NOT_FOUND';
  }
  return status >= 500 ? 'INTERNAL_ERROR' : 'INVALID_PARAMETER';
}
