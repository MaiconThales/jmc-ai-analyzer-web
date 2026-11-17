import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/** Id da área de conteúdo do shell: o único elemento que rola (os menus ficam fixos). */
export const CONTENT_ID = 'conteudo';

/**
 * `ViewportScroller` que rola a área de conteúdo em vez da janela.
 * Assim a rolagem do roteador (topo ao navegar, voltar à posição, âncoras #cpu) continua funcionando
 * com os menus fixos. Sem a área de conteúdo (ex.: testes), não faz nada.
 */
@Injectable()
export class ContentScroller implements ViewportScroller {
  private readonly document = inject(DOCUMENT);
  private offset: () => [number, number] = () => [0, 0];

  setOffset(offset: [number, number] | (() => [number, number])): void {
    this.offset = Array.isArray(offset) ? () => offset : offset;
  }

  getScrollPosition(): [number, number] {
    const container = this.container();
    return container ? [container.scrollLeft, container.scrollTop] : [0, 0];
  }

  scrollToPosition(position: [number, number], options?: ScrollOptions): void {
    this.container()?.scrollTo({ ...options, left: position[0], top: position[1] });
  }

  scrollToAnchor(anchor: string, options?: ScrollOptions): void {
    const container = this.container();
    const target = this.document.getElementById(anchor) ?? this.document.getElementsByName(anchor)[0];
    if (!container || !target) {
      return;
    }
    const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ behavior: this.behavior(), ...options, left: 0, top: Math.max(0, top - this.offset()[1]) });
    target.focus({ preventScroll: true });
  }

  setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void {
    try {
      const history = this.document.defaultView?.history;
      if (history) {
        history.scrollRestoration = scrollRestoration;
      }
    } catch {
      // histórico indisponível (iframe isolado): a restauração fica com o navegador
    }
  }

  private container(): HTMLElement | null {
    return this.document.getElementById(CONTENT_ID);
  }

  /** Rolagem suave, exceto para quem pediu menos movimento. */
  private behavior(): ScrollBehavior {
    return this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }
}
