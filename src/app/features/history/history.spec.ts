import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FIXTURES, clone } from '../../../testing/fixtures';
import { text } from '../../../testing/test-helpers';
import { problemJsonInterceptor } from '../../core/interceptors/problem-json.interceptor';
import { HistoryPage } from './history.page';

describe('histórico', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'history', component: HistoryPage }], withComponentInputBinding()),
        provideHttpClient(withInterceptors([problemJsonInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  it('lista lotes, filtra por software e pagina pela URL (CA-W08)', async () => {
    await harness.navigateByUrl('/history?software=fixture-app&page=1&size=50');
    http.expectOne('/api/v1/software').flush(FIXTURES.software);
    const page = clone(FIXTURES.history);
    page.page = { ...page.page, number: 1, totalPages: 3 };
    page.content[0].status = 'PROCESSING';
    http.expectOne('/api/v1/analyses?page=1&size=50&sort=createdAt,desc&software=fixture-app').flush(page);
    harness.detectChanges();
    const el = harness.routeNativeElement!;
    expect(el.querySelectorAll('tbody tr')).toHaveLength(page.content.length);
    expect(el.querySelector('tbody a')?.getAttribute('href')).toBe(`/batches/${page.content[0].batchId}`);
    expect(text(el.querySelector('.pager'))).toContain('Página 2 de 3');

    (el.querySelectorAll('.pager button')[1] as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toContain('page=2');
    http.expectOne((r) => r.urlWithParams.includes('page=2')).flush(FIXTURES.history);

    const filter = el.querySelector('[data-testid="software-filter"]') as HTMLSelectElement;
    filter.value = '';
    filter.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).not.toContain('software=');
    http.expectOne('/api/v1/analyses?page=0&size=50&sort=createdAt,desc').flush(FIXTURES.history);

    const size = el.querySelectorAll('select')[1] as HTMLSelectElement;
    size.value = '100';
    size.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    http.expectOne('/api/v1/analyses?page=0&size=100&sort=createdAt,desc').flush(FIXTURES.history);
    harness.detectChanges();
    (el.querySelectorAll('.pager button')[0] as HTMLButtonElement).click();
  });

  it('estado vazio, erro e página anterior até a primeira', async () => {
    await harness.navigateByUrl('/history?size=7&page=1');
    http.expectOne('/api/v1/software').flush(null, { status: 500, statusText: 'x' });
    http.expectOne('/api/v1/analyses?page=1&size=20&sort=createdAt,desc').flush({ content: [], page: { totalPages: 0 } });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('Nenhuma análise ainda');
    const page = harness.routeDebugElement!.componentInstance as HistoryPage & { goTo: (n: number) => void };
    page.goTo(0);
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).not.toContain('page=');
    http.expectOne('/api/v1/analyses?page=0&size=20&sort=createdAt,desc').flush(null, { status: 500, statusText: 'x' });
    harness.detectChanges();
    (harness.routeNativeElement!.querySelector('app-error-state button') as HTMLButtonElement).click();
    http.expectOne('/api/v1/analyses?page=0&size=20&sort=createdAt,desc').flush({ content: [], page: {} });
    harness.detectChanges();
    expect(text(harness.routeNativeElement)).toContain('Nenhuma análise ainda');
  });
});
