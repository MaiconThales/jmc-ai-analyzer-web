import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiHealthStore, HEALTH_INTERVAL_MS } from './api-health.store';

describe('ApiHealthStore', () => {
  it('consulta a saúde periodicamente e lista componentes fora do ar', () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const store = TestBed.inject(ApiHealthStore);
    vi.advanceTimersByTime(0);
    http.expectOne('/actuator/health').flush({ status: 'DOWN', components: { db: { status: 'UP' }, blobStorage: { status: 'DOWN' } } });
    expect(store.health()).toEqual({ up: false, down: ['blobStorage'] });
    vi.advanceTimersByTime(HEALTH_INTERVAL_MS);
    http.expectOne('/actuator/health').flush(null, { status: 0, statusText: 'rede' });
    expect(store.health()).toEqual({ up: false, down: [] });
    vi.advanceTimersByTime(HEALTH_INTERVAL_MS);
    http.expectOne('/actuator/health').flush({ status: 'UP' });
    expect(store.health()).toEqual({ up: true, down: [] });
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
});
