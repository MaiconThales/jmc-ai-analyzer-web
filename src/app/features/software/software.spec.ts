import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FIXTURES } from '../../../testing/fixtures';
import { text } from '../../../testing/test-helpers';
import { problemJsonInterceptor } from '../../core/interceptors/problem-json.interceptor';
import { SoftwarePage } from './software.page';
import { MAX_PACKAGES, validatePackage, validateRetention } from './software-validation';

describe('softwares', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([problemJsonInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('valida pacotes e retenção', () => {
    expect(validatePackage('com.empresa', [])).toBeNull();
    expect(validatePackage('com.', [])).toBeNull();
    expect(validatePackage('1com', [])).toContain('inválido');
    expect(validatePackage('a', ['a'])).toContain('já adicionado');
    expect(validatePackage('b', Array.from({ length: MAX_PACKAGES }, (_, i) => `p${i}`))).toContain('No máximo');
    expect(validateRetention(30)).toBeNull();
    expect(validateRetention(0)).toContain('de 1 a 3650');
    expect(validateRetention(1.5)).toContain('de 1 a 3650');
  });

  it('edita retenção e pacotes e atualiza a lista (CA-W09)', () => {
    const fixture = TestBed.createComponent(SoftwarePage);
    fixture.detectChanges();
    http.expectOne('/api/v1/software').flush([...FIXTURES.software, { name: 'outro', appPackages: ['com.x'] }]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(text(el)).toContain('não definidos');
    (el.querySelector('button.link') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).not.toBeNull();

    const days = el.querySelector('input[type="number"]') as HTMLInputElement;
    days.value = '0';
    days.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(text(el)).toContain('Informe de 1 a 3650 dias.');
    days.value = '30';
    days.dispatchEvent(new Event('input'));

    const pkg = el.querySelector('.add input') as HTMLInputElement;
    const form = el.querySelector('.add') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    pkg.value = '1bad';
    pkg.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(text(el)).toContain('Pacote Java inválido');
    pkg.value = 'br.com.sascar';
    pkg.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    pkg.value = 'com.remover';
    pkg.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    (el.querySelectorAll('.chip button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    (el.querySelector('.actions .primary') as HTMLButtonElement).click();
    const req = http.expectOne(`/api/v1/software/${FIXTURES.software[0].name}`);
    expect(req.request.body).toEqual({ retentionDays: 30, appPackages: ['br.com.sascar'] });
    req.flush({ ...FIXTURES.software[0], retentionDays: 30, appPackages: ['br.com.sascar'] });
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeNull();
    expect(text(el)).toContain('br.com.sascar');
  });

  it('mostra erro ao salvar, cancela e trata lista vazia e falha', () => {
    const fixture = TestBed.createComponent(SoftwarePage);
    const page = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne('/api/v1/software').flush([{ name: 'x' }]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    page.save();
    page.addPackage();
    page.setRetention({ target: { value: '1' } } as unknown as Event);
    page.setPackageInput({ target: { value: 'a' } } as unknown as Event);
    page.removePackage('a');
    expect(page.retentionError()).toBeNull();
    page.edit({ name: 'x' });
    page.save();
    http.expectOne('/api/v1/software/x').flush({ code: 'INVALID_PARAMETER', detail: 'ruim' }, { status: 400, statusText: 'x' });
    fixture.detectChanges();
    expect(text(el)).toContain('Algum campo está inválido. ruim');
    page.save();
    http.expectOne('/api/v1/software/x').error(new ProgressEvent('error'));
    page.cancel();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeNull();
    page.edit({ name: 'x', retentionDays: 0 });
    page.save();
    http.expectNone('/api/v1/software/x');

    page.load();
    http.expectOne('/api/v1/software').flush([]);
    fixture.detectChanges();
    expect(text(el)).toContain('Nenhum software ainda');
    page.load();
    http.expectOne('/api/v1/software').flush(null, { status: 500, statusText: 'x' });
    fixture.detectChanges();
    (el.querySelector('app-error-state button') as HTMLButtonElement).click();
    http.expectOne('/api/v1/software').flush([]);
  });
});
