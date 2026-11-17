import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => localStorage.clear());

  it('alterna sistema → claro → escuro e persiste a escolha', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(service.choice()).toBe('system');
    service.cycle();
    TestBed.tick();
    expect(service.choice()).toBe('light');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(false);
    service.cycle();
    TestBed.tick();
    expect(service.dark()).toBe(true);
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    service.cycle();
    TestBed.tick();
    expect(service.choice()).toBe('system');
  });

  it('lê a escolha salva e tolera armazenamento indisponível', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(TestBed.inject(ThemeService).choice()).toBe('dark');
    TestBed.resetTestingModule();
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(service.choice()).toBe('system');
    getItem.mockRestore();
    setItem.mockRestore();
  });
});
