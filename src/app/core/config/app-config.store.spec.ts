import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FIXTURES } from '../../../testing/fixtures';
import { AppConfigStore, DEFAULT_CONFIG, merge } from './app-config.store';

describe('AppConfigStore', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  it('usa os limites da API e o intervalo do container', async () => {
    const store = TestBed.inject(AppConfigStore);
    const loading = store.load();
    http.expectOne('/api/v1/config').flush({ ...FIXTURES.config, upload: { ...FIXTURES.config.upload, maxFiles: 5 } });
    http.expectOne('/runtime-config.json').flush({ pollingIntervalMs: 500 });
    await loading;
    expect(store.config().maxFiles).toBe(5);
    expect(store.config().pollingIntervalMs).toBe(500);
    expect(store.loadedFromApi()).toBe(true);
    expect(store.topNOptions()).toEqual([10, 20, 50]);
  });

  it('cai nos padrões quando a API ou o runtime-config falham', async () => {
    const store = TestBed.inject(AppConfigStore);
    const loading = store.load();
    http.expectOne('/api/v1/config').flush(null, { status: 503, statusText: 'x' });
    http.expectOne('/runtime-config.json').flush(null, { status: 404, statusText: 'x' });
    await loading;
    expect(store.config()).toEqual(DEFAULT_CONFIG);
    expect(store.loadedFromApi()).toBe(false);
  });

  it('completa campos ausentes com os padrões', () => {
    expect(merge({}, undefined)).toEqual(DEFAULT_CONFIG);
    expect(merge({ dashboard: { maxTopN: 20 } }, 0).maxTopN).toBe(20);
    expect(merge(undefined, -1).pollingIntervalMs).toBe(2000);
  });
});
