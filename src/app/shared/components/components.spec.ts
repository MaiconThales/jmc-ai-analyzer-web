import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Type, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiError } from '../../core/errors/api-error';
import { AppFrame } from './app-frame';
import { CopyButton } from './copy-button';
import { HealthBadge } from './health-badge';
import { Icon } from './icon';
import { PriorityChip } from './priority-chip';
import { StackTrace } from './stack-trace';
import { EmptyState, ErrorState, LoadingState } from './states';
import { StatusChip } from './status-chip';
import { TopNSelect } from './topn-select';

function render<T>(type: Type<T>, inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(type);
  Object.entries(inputs).forEach(([k, v]) => fixture.componentRef.setInput(k, v));
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('componentes compartilhados', () => {
  it('selo de saúde mostra nota, faixa e rótulo acessível', () => {
    const { el, fixture } = render(HealthBadge, { score: 8 });
    expect(el.textContent).toContain('8');
    expect(el.textContent).toContain('crítico');
    expect(el.querySelector('.health')?.getAttribute('aria-label')).toBe('Nota de saúde 8 de 100, crítico');
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();
    expect(el.classList).toContain('compact');
    expect(el.textContent).not.toContain('nota de saúde');
    fixture.componentRef.setInput('score', null);
    fixture.detectChanges();
    expect(el.textContent).toContain('—');
    expect(render(HealthBadge, { score: 90 }).el.textContent).toContain('ok');
  });

  it('chips de prioridade e estado têm ícone e texto', () => {
    expect(render(PriorityChip, { priority: 'MEDIA' }).el.textContent?.trim()).toBe('■MÉDIA');
    const failed = render(StatusChip, { status: 'FAILED' }).el;
    expect(failed.textContent?.trim()).toBe('Falhou');
    expect(failed.querySelector('app-icon svg')).not.toBeNull();
    expect(render(StatusChip, { status: 'OUTRO' }).el.textContent?.trim()).toBe('OUTRO');
    expect(render(StatusChip, { status: 'OUTRO' }).el.querySelector('app-icon')).toBeNull();
    expect(render(StatusChip, { status: null }).el.textContent?.trim()).toBe('—');
  });

  it('botão de copiar confirma a cópia', () => {
    vi.useFakeTimers();
    const clipboard = { copy: vi.fn().mockReturnValue(true) };
    TestBed.configureTestingModule({ providers: [{ provide: Clipboard, useValue: clipboard }] });
    const { el, fixture } = render(CopyButton, { text: 'abc', label: 'Copiar comando' });
    el.querySelector('button')!.click();
    fixture.detectChanges();
    expect(clipboard.copy).toHaveBeenCalledWith('abc');
    expect(el.textContent).toContain('Copiado');
    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(el.textContent).toContain('Copiar comando');
    vi.useRealTimers();
  });

  it('frame da aplicação mostra nome curto e pacote', () => {
    const { el } = render(AppFrame, { frame: { c: 'br.com.app.Tac', m: 'run', l: 12 } });
    expect(el.textContent).toContain('Tac.run:12');
    expect(el.textContent).toContain('br.com.app');
    expect(render(AppFrame, { frame: { c: 'Tac', m: 'run' } }).el.querySelector('.pkg')).toBeNull();
    expect(render(AppFrame, { frame: null }).el.textContent?.trim()).toBe('');
  });

  it('pilha destaca o frame da aplicação', () => {
    const frames = [
      { c: 'java.lang.String', m: 'valueOf', l: 1 },
      { c: 'com.app.A', m: 'b', l: 2 },
    ];
    const { el } = render(StackTrace, { frames, appFrame: frames[1] });
    expect(el.querySelectorAll('li')).toHaveLength(2);
    expect(el.querySelectorAll('li.app')).toHaveLength(1);
    expect(render(StackTrace, { frames }).el.querySelectorAll('li.app')).toHaveLength(0);
    expect(render(StackTrace, { frames: [] }).el.querySelector('details')).toBeNull();
  });

  it('estados vazio, de erro e de carregamento', () => {
    expect(render(EmptyState, { title: 'Nada', message: 'msg' }).el.textContent).toContain('msg');
    expect(render(EmptyState, { title: 'Nada' }).el.querySelectorAll('p')).toHaveLength(1);
    const { el, fixture } = render(ErrorState, { error: new ApiError(503, 'STORAGE_UNAVAILABLE', 'x') });
    const retried = vi.fn();
    fixture.componentInstance.retry.subscribe(retried);
    expect(el.textContent).toContain('Armazenamento indisponível');
    el.querySelector('button')!.click();
    expect(retried).toHaveBeenCalled();
    expect(render(ErrorState, { error: ApiError.network(), retryable: false }).el.querySelector('button')).toBeNull();
    expect(render(LoadingState).el.textContent).toContain('Carregando');
  });

  it('ícone desenha caminhos, círculos e retângulos', () => {
    const { el, fixture } = render(Icon, { name: 'copy', size: 20 });
    expect(el.querySelector('svg')?.getAttribute('width')).toBe('20');
    expect(el.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelectorAll('rect')).toHaveLength(1);
    expect(el.querySelectorAll('path')).toHaveLength(1);
    fixture.componentRef.setInput('name', 'map-pin');
    fixture.detectChanges();
    expect(el.querySelectorAll('circle')).toHaveLength(1);
  });

  it('seletor de topN emite o valor escolhido', () => {
    const { el, fixture } = render(TopNSelect, { value: 20, options: [10, 20] });
    const changed = vi.fn();
    fixture.componentInstance.changed.subscribe(changed);
    const select = el.querySelector('select')!;
    select.value = '10';
    select.dispatchEvent(new Event('change'));
    expect(changed).toHaveBeenCalledWith(10);
  });
});

@Component({ template: '' })
class Host {
  readonly value = signal(0);
}

describe('Host de teste', () => {
  it('existe para manter o arquivo com um componente de apoio', () => {
    expect(TestBed.createComponent(Host).componentInstance.value()).toBe(0);
  });
});
