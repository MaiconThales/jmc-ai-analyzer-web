import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpEventType } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { FIXTURES } from '../../../testing/fixtures';
import { text } from '../../../testing/test-helpers';
import { DEFAULT_CONFIG } from '../../core/config/app-config.store';
import { problemJsonInterceptor } from '../../core/interceptors/problem-json.interceptor';
import { UploadPage } from './upload.page';
import { UploadStore } from './upload.store';
import { validateBatch, validateFile, validateSoftware } from './upload-validation';

function jfr(name: string, size = 10): File {
  return new File([new Uint8Array(size)], name);
}

describe('validação do upload', () => {
  it('valida arquivos, lote e software (CA-W06)', () => {
    const config = { ...DEFAULT_CONFIG, maxFiles: 2, maxFileSizeBytes: 100, maxRequestSizeBytes: 150 };
    expect(validateFile(jfr('a.JFR'), config)).toBeNull();
    expect(validateFile(jfr('a.txt'), config)).toBe('Não é um arquivo .jfr.');
    expect(validateFile(jfr('a.jfr', 0), config)).toBe('Arquivo vazio.');
    expect(validateFile(jfr('a.jfr', 101), config)).toContain('Acima do limite');
    const f = (size: number) => ({ file: jfr('a.jfr', size), error: null });
    expect(validateBatch([], config)).toContain('Selecione');
    expect(validateBatch([f(1), f(1), f(1)], config)).toContain('no máximo 2');
    expect(validateBatch([f(100), f(100)], config)).toContain('o limite é');
    expect(validateBatch([f(10)], config)).toBeNull();
    expect(validateSoftware('')).toBe('Informe o software.');
    expect(validateSoftware('Billing')).toContain('minúsculas');
    expect(validateSoftware('billing-service')).toBeNull();
  });
});

describe('upload', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([problemJsonInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('store envia com progresso e navega para o status (CA-W01)', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const store = TestBed.runInInjectionContext(() => new UploadStore());
    store.add([jfr('a.jfr'), jfr('a.jfr'), jfr('b.txt')]);
    expect(store.files()).toHaveLength(2);
    expect(store.canSubmit()).toBe(false);
    store.remove(1);
    expect(store.canSubmit()).toBe(true);
    store.submit({ software: 'app' });
    const req = http.expectOne('/api/v1/analyses');
    req.event({ type: HttpEventType.UploadProgress, loaded: 5, total: 10 });
    expect(store.progress()).toBe(50);
    req.event({ type: HttpEventType.UploadProgress, loaded: 5 });
    req.flush(FIXTURES.batchCompleted);
    expect(store.uploading()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/batches', FIXTURES.batchCompleted.batchId]);
  });

  it('store mostra o erro da API em português e permite cancelar', () => {
    const store = TestBed.runInInjectionContext(() => new UploadStore());
    store.submit({ software: 'app' });
    http.expectNone('/api/v1/analyses');
    store.add([jfr('a.jfr')]);
    store.submit({ software: 'app' });
    http.expectOne('/api/v1/analyses').flush({ code: 'TOO_MANY_FILES' }, { status: 400, statusText: 'x' });
    expect(store.error()).toBe('Envie no máximo 20 arquivos por lote.');
    store.submit({ software: 'app' });
    http.expectOne('/api/v1/analyses').error(new ProgressEvent('error'));
    expect(store.error()).toBe('Algo deu errado. Tente novamente.');
    store.submit({ software: 'app' });
    const pending = http.expectOne('/api/v1/analyses');
    store.cancel();
    expect(pending.cancelled).toBe(true);
    expect(store.uploading()).toBe(false);
    expect(store.totalBytes()).toBe(10);
  });

  it('página valida o formulário, lista arquivos e envia', async () => {
    const fixture = TestBed.createComponent(UploadPage);
    fixture.detectChanges();
    http.expectOne('/api/v1/software').flush(FIXTURES.software);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const page = fixture.componentInstance;
    const input = el.querySelector('[data-testid="file-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [jfr('a.jfr'), jfr('x.txt')], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(text(el.querySelector('.files'))).toContain('Não é um arquivo .jfr.');
    (el.querySelectorAll('.files button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    page.submit();
    fixture.detectChanges();
    http.expectNone('/api/v1/analyses');
    expect(text(el)).toContain('Informe o software.');

    const software = el.querySelector('input[formcontrolname="software"]') as HTMLInputElement;
    software.value = 'Ruim';
    software.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(text(el)).toContain('Use minúsculas');

    software.value = 'fixture';
    software.dispatchEvent(new Event('input'));
    const description = el.querySelector('textarea') as HTMLTextAreaElement;
    description.value = 'abc';
    description.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(text(el)).toContain('3/500');
    expect((page as unknown as { suggestions: () => string[] }).suggestions()).toEqual(['fixture-app']);

    page.submit();
    fixture.detectChanges();
    const req = http.expectOne('/api/v1/analyses');
    expect((req.request.body as FormData).get('software')).toBe('fixture');
    expect(text(el)).toContain('Cancelar');
    (el.querySelector('.actions button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const drop = el.querySelector('.drop') as HTMLElement;
    const over = new Event('dragover') as DragEvent;
    drop.dispatchEvent(over);
    fixture.detectChanges();
    expect(drop.classList).toContain('dragging');
    const dropEvent = Object.assign(new Event('drop'), { dataTransfer: { files: [jfr('c.jfr')] } });
    drop.dispatchEvent(dropEvent);
    fixture.detectChanges();
    expect(text(el.querySelector('.files'))).toContain('c.jfr');
    drop.dispatchEvent(Object.assign(new Event('drop'), { dataTransfer: null }));
    Object.defineProperty(input, 'files', { value: null, configurable: true });
    input.dispatchEvent(new Event('change'));
  });

  it('página sobrevive à falha ao listar softwares', () => {
    const fixture = TestBed.createComponent(UploadPage);
    fixture.detectChanges();
    http.expectOne('/api/v1/software').flush(null, { status: 500, statusText: 'x' });
    fixture.detectChanges();
    expect((fixture.componentInstance as unknown as { suggestions: () => string[] }).suggestions()).toEqual([]);
  });
});
