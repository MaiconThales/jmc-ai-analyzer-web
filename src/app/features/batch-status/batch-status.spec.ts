import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FIXTURES, clone } from '../../../testing/fixtures';
import { text } from '../../../testing/test-helpers';
import { problemJsonInterceptor } from '../../core/interceptors/problem-json.interceptor';
import { BatchStatusPage } from './batch-status.page';
import { BatchStatusStore, MAX_FAILURES } from './batch-status.store';

describe('status do lote', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'batches/:batchId', component: BatchStatusPage }], withComponentInputBinding()),
        provideHttpClient(withInterceptors([problemJsonInterceptor])),
        provideHttpClientTesting(),
        BatchStatusStore,
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => vi.useRealTimers());

  it('faz polling até o lote sair de PROCESSING (CA-W01)', () => {
    const store = TestBed.inject(BatchStatusStore);
    store.start('b1');
    vi.advanceTimersByTime(0);
    const processing = { ...clone(FIXTURES.batchCompleted), status: 'PROCESSING' as const };
    http.expectOne('/api/v1/analyses/b1').flush(processing);
    expect(store.polling()).toBe(true);
    vi.advanceTimersByTime(2000);
    http.expectOne('/api/v1/analyses/b1').flush(FIXTURES.batchCompleted);
    expect(store.batch()?.status).toBe('COMPLETED');
    expect(store.polling()).toBe(false);
    vi.advanceTimersByTime(4000);
    http.expectNone('/api/v1/analyses/b1');
  });

  it('pausa com a aba oculta e desiste após falhas seguidas', () => {
    const document = TestBed.inject(DOCUMENT);
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const store = TestBed.inject(BatchStatusStore);
    store.start('b2');
    vi.advanceTimersByTime(4000);
    http.expectNone('/api/v1/analyses/b2');
    visibility.mockReturnValue('visible');
    for (let i = 0; i < MAX_FAILURES; i++) {
      vi.advanceTimersByTime(2000);
      http.expectOne('/api/v1/analyses/b2').flush(null, { status: 500, statusText: 'x' });
    }
    expect(store.error()?.code).toBe('INTERNAL_ERROR');
    expect(store.polling()).toBe(false);
  });

  it('para imediatamente quando o lote não existe', () => {
    const store = TestBed.inject(BatchStatusStore);
    store.start('nada');
    vi.advanceTimersByTime(0);
    http.expectOne('/api/v1/analyses/nada').flush({ code: 'NOT_FOUND' }, { status: 404, statusText: 'x' });
    expect(store.error()?.code).toBe('NOT_FOUND');
    store.start('rede');
    vi.advanceTimersByTime(0);
    http.expectOne('/api/v1/analyses/rede').error(new ProgressEvent('error'));
    expect(store.error()).toBeNull();
    store.stop();
  });

  it('página mostra gravações, erro traduzido e link do lote (CA-W07)', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/batches/p1');
    vi.advanceTimersByTime(0);
    http.expectOne('/api/v1/analyses/p1').flush(FIXTURES.batchPartial);
    harness.detectChanges();
    const el = harness.routeNativeElement!;
    expect(text(el)).toContain('Não foi possível ler este arquivo JFR');
    expect(el.querySelector('a[href="/batches/' + FIXTURES.batchPartial.batchId + '/dashboard"]')).not.toBeNull();
    expect(text(el)).toContain('ambiente não informado');
  });

  it('página em processamento, não encontrado e erro com nova tentativa', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/batches/b3');
    expect(text(harness.routeNativeElement)).toContain('Carregando o lote');
    vi.advanceTimersByTime(0);
    http.expectOne('/api/v1/analyses/b3').flush({ ...clone(FIXTURES.batchCompleted), status: 'PROCESSING' });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('a página atualiza sozinha');

    await harness.navigateByUrl('/batches/x');
    vi.advanceTimersByTime(0);
    http.expectOne('/api/v1/analyses/x').flush({ code: 'NOT_FOUND' }, { status: 404, statusText: 'x' });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('Lote não encontrado');

    await harness.navigateByUrl('/batches/y');
    for (let i = 0; i < MAX_FAILURES; i++) {
      vi.advanceTimersByTime(2000);
      http.expectOne('/api/v1/analyses/y').flush(null, { status: 503, statusText: 'x' });
    }
    harness.detectChanges();
    (harness.routeNativeElement!.querySelector('app-error-state button') as HTMLButtonElement).click();
    vi.advanceTimersByTime(0);
    http.expectOne('/api/v1/analyses/y').flush({ ...clone(FIXTURES.batchCompleted), recordings: [] });
  });
});
