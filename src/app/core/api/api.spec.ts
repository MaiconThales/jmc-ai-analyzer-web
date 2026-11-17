import { HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FIXTURES } from '../../../testing/fixtures';
import { AnalysesApi } from './analyses.api';
import { ConfigApi } from './config.api';
import { HealthApi } from './health.api';
import { RecordingsApi } from './recordings.api';
import { SoftwareApi } from './software.api';

describe('clientes da API', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envia o upload em multipart com progresso e campos opcionais aparados', () => {
    const events: HttpEventType[] = [];
    const file = new File(['x'], 'a.jfr');
    TestBed.inject(AnalysesApi)
      .upload({ software: 'app', softwareVersion: ' 1.0 ', environment: 'PROD', description: '  ' }, [file])
      .subscribe((e) => events.push(e.type));
    const req = http.expectOne('/api/v1/analyses');
    const body = req.request.body as FormData;
    expect(req.request.method).toBe('POST');
    expect(req.request.reportProgress).toBe(true);
    expect(body.get('software')).toBe('app');
    expect(body.get('softwareVersion')).toBe('1.0');
    expect(body.get('environment')).toBe('PROD');
    expect(body.has('description')).toBe(false);
    expect((body.get('files') as File).name).toBe('a.jfr');
    req.flush(FIXTURES.batchCompleted);
    expect(events).toContain(HttpEventType.Response);
  });

  it('consulta status, dashboard e histórico do lote', () => {
    const api = TestBed.inject(AnalysesApi);
    api.status('b1').subscribe();
    const status = http.expectOne('/api/v1/analyses/b1');
    expect(status.request.method).toBe('GET');
    status.flush(FIXTURES.batchCompleted);
    api.dashboard('b1', 20).subscribe();
    http.expectOne('/api/v1/analyses/b1/dashboard?topN=20').flush(FIXTURES.batchDashboard);
    api.history({ software: 'app', page: 1, size: 50 }).subscribe();
    http.expectOne('/api/v1/analyses?page=1&size=50&sort=createdAt,desc&software=app').flush(FIXTURES.history);
    api.history({ page: 0, size: 20 }).subscribe();
    http.expectOne('/api/v1/analyses?page=0&size=20&sort=createdAt,desc').flush(FIXTURES.history);
  });

  it('consulta gravação, software, configuração e saúde', () => {
    TestBed.inject(RecordingsApi).dashboard('r1', 10).subscribe();
    http.expectOne('/api/v1/recordings/r1/dashboard?topN=10').flush(FIXTURES.recordingDashboard);
    const software = TestBed.inject(SoftwareApi);
    software.list().subscribe();
    http.expectOne('/api/v1/software').flush(FIXTURES.software);
    software.update('meu app', { retentionDays: 30 }).subscribe();
    const patch = http.expectOne('/api/v1/software/meu%20app');
    expect(patch.request.method).toBe('PATCH');
    patch.flush(FIXTURES.software[0]);
    const config = TestBed.inject(ConfigApi);
    config.apiConfig().subscribe();
    http.expectOne('/api/v1/config').flush(FIXTURES.config);
    config.runtimeConfig().subscribe();
    http.expectOne('/runtime-config.json').flush({ pollingIntervalMs: 1000 });
    TestBed.inject(HealthApi).health().subscribe();
    http.expectOne('/actuator/health').flush({ status: 'UP' });
  });
});
