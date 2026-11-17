import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTENT_ID } from '../../../core/layout/content-scroller';
import { ANCHOR_OFFSET } from '../anchor-scroll';

export interface DashboardSection {
  id: string;
  label: string;
}

/**
 * Barra de seções do dashboard: fica fixa no topo da área de conteúdo e marca a seção visível.
 */
@Component({
  selector: 'app-section-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="sections" aria-label="Seções do dashboard">
      @for (s of sections(); track s.id) {
        <a [routerLink]="[]" [fragment]="s.id" queryParamsHandling="preserve" [class.active]="active() === s.id"
          [attr.aria-current]="active() === s.id ? 'location' : null" [attr.data-section]="s.id">{{ s.label }}</a>
      }
    </nav>
  `,
  styles: `
    :host { display: block; position: sticky; top: 0; z-index: 3; margin: 0 calc(-1 * var(--page-pad)) 16px;
      padding: 10px var(--page-pad); background: color-mix(in srgb, var(--bg) 82%, transparent);
      backdrop-filter: saturate(1.4) blur(10px); -webkit-backdrop-filter: saturate(1.4) blur(10px);
      border-bottom: 1px solid var(--border); }
    .sections { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; scroll-behavior: smooth; }
    .sections::-webkit-scrollbar { display: none; }
    a { flex: none; font-size: 13px; font-weight: 600; color: var(--text-muted); text-decoration: none; padding: 6px 12px;
      border-radius: 999px; border: 1px solid transparent; white-space: nowrap;
      transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease); }
    a:hover { color: var(--text); background: var(--surface); border-color: var(--border); }
    a.active { color: var(--surface); background: var(--brand); border-color: var(--brand); }
  `,
})
export class SectionNav {
  readonly sections = input<DashboardSection[]>([]);
  protected readonly active = signal<string | null>(null);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const container = this.document.getElementById(CONTENT_ID);
      if (!container) {
        return;
      }
      let frame = 0;
      const onScroll = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => this.setActive(this.current(container)));
      };
      container.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        container.removeEventListener('scroll', onScroll);
      });
    });
  }

  /** Última seção cujo topo já passou da barra de seções (ou a primeira, no topo da página). */
  private current(container: HTMLElement): string | null {
    const line = container.getBoundingClientRect().top + ANCHOR_OFFSET + 8;
    let current: string | null = null;
    for (const section of this.sections()) {
      const el = this.document.getElementById(section.id);
      if (el && el.getBoundingClientRect().top <= line) {
        current = section.id;
      }
    }
    return current;
  }

  private setActive(id: string | null): void {
    if (id === this.active()) {
      return;
    }
    this.active.set(id);
    // mantém a seção atual visível na barra (rolagem horizontal no celular)
    const nav = (this.host.nativeElement as HTMLElement).querySelector('nav');
    const link = id ? nav?.querySelector<HTMLElement>(`[data-section="${id}"]`) : null;
    if (nav && link) {
      nav.scrollLeft = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
    }
  }
}
