import { ViewportScroller } from '@angular/common';
import { Injector, afterNextRender, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

/** Espaço acima do bloco ao rolar até ele (a barra de seções do dashboard fica fixa no topo do conteúdo). */
export const ANCHOR_OFFSET = 72;

/**
 * Rola até o fragmento da URL (ex.: #cpu) assim que os dados do dashboard chegam.
 * A rolagem nativa do roteador acontece antes, quando os blocos ainda não existem.
 */
export function scrollToFragmentWhenReady(ready: () => boolean): void {
  const scroller = inject(ViewportScroller);
  scroller.setOffset([0, ANCHOR_OFFSET]);
  const injector = inject(Injector);
  const fragment = toSignal(inject(ActivatedRoute).fragment);
  let done = false;
  effect(() => {
    const target = fragment();
    if (!done && target && ready()) {
      done = true;
      afterNextRender(() => scroller.scrollToAnchor(target), { injector });
    }
  });
}
