import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiError } from '../errors/api-error';
import { problemJsonInterceptor } from './problem-json.interceptor';

describe('problemJsonInterceptor', () => {
  it('entrega ApiError ao assinante', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([problemJsonInterceptor])), provideHttpClientTesting()],
    });
    let error: unknown;
    TestBed.inject(HttpClient).get('/api/x').subscribe({ error: (e: unknown) => (error = e) });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/x')
      .flush({ code: 'STORAGE_UNAVAILABLE', detail: 'fora' }, { status: 503, statusText: 'x' });
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('STORAGE_UNAVAILABLE');
  });
});
