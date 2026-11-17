import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { text } from '../testing/test-helpers';
import { App } from './app';
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
    expect(text(el.querySelector('.api'))).toBe('● verificando API');
    expect(el.querySelectorAll('nav a')).toHaveLength(3);
    await new Promise((r) => setTimeout(r));
    health({ status: 'UP', components: { db: { status: 'UP' } } });
    fixture.detectChanges();
    expect(text(el.querySelector('.api'))).toBe('● API ok');
    expect(text(el.querySelector('.banner'))).toContain('usando os limites padrão');
    (el.querySelector('.theme') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(text(el.querySelector('.theme'))).toContain('Tema claro');
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
