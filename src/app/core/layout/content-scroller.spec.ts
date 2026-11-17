import { TestBed } from '@angular/core/testing';
import { CONTENT_ID, ContentScroller } from './content-scroller';

describe('ContentScroller', () => {
  let scroller: ContentScroller;
  let container: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ContentScroller] });
    scroller = TestBed.inject(ContentScroller);
    container = document.createElement('main');
    container.id = CONTENT_ID;
    container.scrollTo = vi.fn() as unknown as typeof container.scrollTo;
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  it('lê e muda a posição da área de conteúdo, não da janela', () => {
    container.scrollTop = 40;
    expect(scroller.getScrollPosition()).toEqual([0, 40]);
    scroller.scrollToPosition([0, 120]);
    expect(container.scrollTo).toHaveBeenCalledWith({ left: 0, top: 120 });
  });

  it('rola até a âncora descontando o deslocamento e foca o alvo', () => {
    const target = document.createElement('section');
    target.id = 'cpu';
    target.tabIndex = -1;
    container.appendChild(target);
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({ top: 64 } as DOMRect);
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 864 } as DOMRect);
    container.scrollTop = 100;
    scroller.setOffset([0, 72]);
    scroller.scrollToAnchor('cpu');
    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 0, top: 828 }));
    expect(document.activeElement).toBe(target);

    scroller.setOffset(() => [0, 2000]);
    scroller.scrollToAnchor('cpu', { behavior: 'instant' });
    expect(container.scrollTo).toHaveBeenLastCalledWith({ behavior: 'instant', left: 0, top: 0 });
  });

  it('ignora âncora inexistente e funciona sem a área de conteúdo', () => {
    scroller.scrollToAnchor('nada');
    expect(container.scrollTo).not.toHaveBeenCalled();
    container.remove();
    expect(scroller.getScrollPosition()).toEqual([0, 0]);
    expect(() => scroller.scrollToPosition([0, 10])).not.toThrow();
    expect(() => scroller.scrollToAnchor('cpu')).not.toThrow();
  });

  it('configura a restauração do histórico sem quebrar quando o navegador recusa', () => {
    scroller.setHistoryScrollRestoration('manual');
    expect(history.scrollRestoration).toBe('manual');
    scroller.setHistoryScrollRestoration('auto');
    const spy = vi.spyOn(history, 'scrollRestoration', 'set').mockImplementation(() => {
      throw new Error('iframe isolado');
    });
    expect(() => scroller.setHistoryScrollRestoration('manual')).not.toThrow();
    spy.mockRestore();
  });
});
