import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { text } from '../testing/test-helpers';
import { App, NAV_STORAGE_KEY } from './app';
import { AppConfigStore } from './core/config/app-config.store';
import { NotFoundPage } from './features/not-found/not-found.page';
import { routes } from './app.routes';

describe('shell', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  function health(body: object | null, status = 200) {
    const req = http.expectOne('/actuator/health');
    if (status === 200) {
      req.flush(body);
    } else {
      req.flush(null, { status, statusText: 'x' });
    }
  }

  it('mostra navegação, saúde da API e alterna o tema (CA-W14)', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(text(el.querySelector('.api'))).toBe('verificando API');
    expect(el.querySelector('.api.checking')).not.toBeNull();
    expect(el.querySelectorAll('nav a')).toHaveLength(3);
    await new Promise((r) => setTimeout(r));
    health({ status: 'UP', components: { db: { status: 'UP' } } });
    fixture.detectChanges();
    expect(text(el.querySelector('.api'))).toBe('API ok');
    expect(el.querySelector('.api.up')).not.toBeNull();
    expect(text(el.querySelector('.banner'))).toContain('usando os limites padrão');
    (el.querySelector('.theme') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(text(el.querySelector('.theme'))).toContain('Tema claro');
  });

  it('recolhe e expande o menu lateral e lembra a escolha', () => {
    localStorage.removeItem(NAV_STORAGE_KEY);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector('.collapse') as HTMLButtonElement;
    expect(el.querySelector('.shell.collapsed')).toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    fixture.detectChanges();
    expect(el.querySelector('.shell.collapsed')).not.toBeNull();
    expect(toggle.getAttribute('aria-label')).toBe('Expandir menu');
    expect(localStorage.getItem(NAV_STORAGE_KEY)).toBe('true');
    const again = TestBed.createComponent(App);
    again.detectChanges();
    expect((again.nativeElement as HTMLElement).querySelector('.shell.collapsed')).not.toBeNull();
    localStorage.removeItem(NAV_STORAGE_KEY);
    http.match('/actuator/health');
  });

  it('ao trocar de tela, o foco vai para a área de conteúdo (mudar só a query não move)', async () => {
    const router = TestBed.inject(Router);
    router.resetConfig([
      { path: 'a', component: NotFoundPage },
      { path: 'b', component: NotFoundPage },
    ]);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const main = (fixture.nativeElement as HTMLElement).querySelector('main')!;
    await router.navigateByUrl('/a');
    expect(document.activeElement).toBe(main);
    const toggle = (fixture.nativeElement as HTMLElement).querySelector('.collapse') as HTMLButtonElement;
    toggle.focus();
    await router.navigateByUrl('/a?x=1');
    expect(document.activeElement).toBe(toggle);
    await router.navigateByUrl('/b');
    expect(document.activeElement).toBe(main);
    (fixture.nativeElement as HTMLElement).remove();
    http.match('/actuator/health');
  });

  it('funciona sem armazenamento do navegador (modo privado)', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('.collapse') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('.shell.collapsed')).not.toBeNull();
    getItem.mockRestore();
    setItem.mockRestore();
    http.match('/actuator/health');
  });

  it('avisa quando a API ou um componente estão fora do ar', async () => {
    vi.spyOn(TestBed.inject(AppConfigStore), 'loadedFromApi').mockReturnValue(true);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r));
    health({ status: 'DOWN', components: { blobStorage: { status: 'DOWN' }, outro: { status: 'DOWN' } } });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(text(el.querySelector('.banner'))).toBe('Indisponível: armazenamento de arquivos, outro.');
    expect(el.querySelector('.api.down')).not.toBeNull();
  });

  it('avisa quando a API não responde e some quando tudo está ok', async () => {
    const config = TestBed.inject(AppConfigStore);
    const loaded = vi.spyOn(config, 'loadedFromApi').mockReturnValue(true);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r));
    health(null, 0);
    fixture.detectChanges();
    expect(text((fixture.nativeElement as HTMLElement).querySelector('.banner'))).toContain('A API está fora do ar');
    expect(loaded).not.toHaveBeenCalled();
  });

  it('rotas carregam as páginas sob demanda e página de não encontrado', async () => {
    for (const route of routes.filter((r) => r.loadComponent)) {
      expect(await route.loadComponent!()).toBeTruthy();
    }
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();
    expect(text(fixture.nativeElement)).toContain('Página não encontrada');
  });
});
