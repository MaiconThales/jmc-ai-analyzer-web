import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FIXTURES } from '../../../testing/fixtures';
import { stubCharts, text } from '../../../testing/test-helpers';
import { problemJsonInterceptor } from '../../core/interceptors/problem-json.interceptor';
import { BatchDashboardPage } from '../batch-dashboard/batch-dashboard.page';
import { RecordingDashboardPage } from '../recording-dashboard/recording-dashboard.page';

describe('páginas de dashboard', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'recordings/:recordingId', component: RecordingDashboardPage },
            { path: 'batches/:batchId/dashboard', component: BatchDashboardPage },
          ],
          withComponentInputBinding(),
        ),
        provideHttpClient(withInterceptors([problemJsonInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    stubCharts();
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  it('dashboard da gravação: cabeçalho, blocos, topN na URL e rolagem até o fragmento', async () => {
    const scroller = TestBed.inject(ViewportScroller);
    const scroll = vi.spyOn(scroller, 'scrollToAnchor').mockImplementation(() => undefined);
    await harness.navigateByUrl('/recordings/r1?topN=20#cpu');
    http.expectOne('/api/v1/recordings/r1/dashboard?topN=20').flush(FIXTURES.recordingDashboard);
    await harness.fixture.whenStable();
    harness.detectChanges();
    const el = harness.routeNativeElement!;
    expect(text(el.querySelector('h1'))).toBe(FIXTURES.recordingDashboard.originalName);
    expect(el.querySelector('app-diagnosis-list')).not.toBeNull();
    expect(text(el.querySelector('#metadata'))).toContain('Versão do extrator');
    expect(scroll).toHaveBeenCalledWith('cpu');

    const select = el.querySelector('app-topn-select select') as HTMLSelectElement;
    select.value = '50';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toContain('topN=50');
    http.expectOne('/api/v1/recordings/r1/dashboard?topN=50').flush(FIXTURES.recordingDashboard);
  });

  it('dashboard da gravação: estados não pronto, não encontrado e erro', async () => {
    await harness.navigateByUrl('/recordings/f1');
    http.expectOne('/api/v1/recordings/f1/dashboard?topN=10').flush(FIXTURES.errorNotReady, { status: 409, statusText: 'x' });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('Não foi possível ler este arquivo JFR');

    await harness.navigateByUrl('/recordings/f2');
    http.expectOne('/api/v1/recordings/f2/dashboard?topN=10').flush({ code: 'NOT_READY', status: 'PROCESSING' }, { status: 409, statusText: 'x' });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('A análise ainda não terminou');

    await harness.navigateByUrl('/recordings/x');
    http.expectOne('/api/v1/recordings/x/dashboard?topN=10').flush({ code: 'NOT_FOUND' }, { status: 404, statusText: 'x' });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('Gravação não encontrada');

    await harness.navigateByUrl('/recordings/y');
    http.expectOne('/api/v1/recordings/y/dashboard?topN=10').flush(null, { status: 500, statusText: 'x' });
    harness.detectChanges();
    (harness.routeNativeElement!.querySelector('app-error-state button') as HTMLButtonElement).click();
    http.expectOne('/api/v1/recordings/y/dashboard?topN=10').flush(FIXTURES.recordingDashboard);
  });

  it('dashboard do lote: comparativo, aviso de excluídas e troca de topN (CA-W05, CA-W07)', async () => {
    await harness.navigateByUrl('/batches/p1/dashboard');
    http.expectOne('/api/v1/analyses/p1/dashboard?topN=10').flush(FIXTURES.batchDashboardPartial);
    harness.detectChanges();
    const el = harness.routeNativeElement!;
    expect(text(el.querySelector('div.warning'))).toContain('ficaram fora do consolidado');
    expect(el.querySelector('app-comparison-table')).not.toBeNull();

    const select = el.querySelector('app-topn-select select') as HTMLSelectElement;
    select.value = '20';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    http.expectOne('/api/v1/analyses/p1/dashboard?topN=20').flush(FIXTURES.batchDashboard);
    harness.detectChanges();
    expect(el.querySelector('div.warning')).toBeNull();
  });

  it('dashboard do lote: não pronto, não encontrado e erro', async () => {
    await harness.navigateByUrl('/batches/a/dashboard');
    http.expectOne('/api/v1/analyses/a/dashboard?topN=10').flush({ code: 'NOT_READY' }, { status: 409, statusText: 'x' });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('Nenhuma gravação do lote foi concluída');

    await harness.navigateByUrl('/batches/b/dashboard');
    http.expectOne('/api/v1/analyses/b/dashboard?topN=10').flush({ code: 'NOT_FOUND' }, { status: 404, statusText: 'x' });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('Lote não encontrado');

    await harness.navigateByUrl('/batches/c/dashboard');
    http.expectOne('/api/v1/analyses/c/dashboard?topN=10').flush(null, { status: 500, statusText: 'x' });
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('app-error-state')).not.toBeNull();
    (harness.routeNativeElement!.querySelector('app-error-state button') as HTMLButtonElement).click();
    http.expectOne('/api/v1/analyses/c/dashboard?topN=10').flush({ ...FIXTURES.batchDashboard, description: null, environment: null });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('ambiente não informado');
  });
});
