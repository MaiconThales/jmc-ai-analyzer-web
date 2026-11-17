import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type ThemeChoice = 'system' | 'light' | 'dark';
export const THEME_STORAGE_KEY = 'jmc-theme';

/** Tema claro, escuro ou do sistema; a escolha fica no localStorage. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly choice = signal<ThemeChoice>(readChoice(this.document));
  readonly dark = signal(false);

  constructor() {
    this.media?.addEventListener?.('change', (event) => this.systemDark.set(event.matches));
    effect(() => {
      const choice = this.choice();
      const dark = choice === 'dark' || (choice === 'system' && this.systemDark());
      this.dark.set(dark);
      this.document.documentElement.classList.toggle('theme-dark', dark);
      writeChoice(this.document, choice);
    });
  }

  /** Alterna sistema → claro → escuro → sistema. */
  cycle(): void {
    const order: ThemeChoice[] = ['system', 'light', 'dark'];
    this.choice.set(order[(order.indexOf(this.choice()) + 1) % order.length]);
  }
}

function readChoice(document: Document): ThemeChoice {
  try {
    const stored = document.defaultView?.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function writeChoice(document: Document, choice: ThemeChoice): void {
  try {
    document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // armazenamento indisponível (modo privado): o tema vale só para a sessão
  }
}
