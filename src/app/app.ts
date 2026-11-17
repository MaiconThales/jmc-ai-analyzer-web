import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AppConfigStore } from './core/config/app-config.store';
import { ApiHealthStore } from './core/layout/api-health.store';
import { CONTENT_ID } from './core/layout/content-scroller';
import { ThemeService } from './core/theme/theme.service';
import { Icon, IconName } from './shared/components/icon';

const THEME_LABEL = { system: 'Tema do sistema', light: 'Tema claro', dark: 'Tema escuro' } as const;
const THEME_ICON: Record<keyof typeof THEME_LABEL, IconName> = { system: 'monitor', light: 'sun', dark: 'moon' };
const COMPONENT_LABEL: Record<string, string> = { db: 'banco de dados', blobStorage: 'armazenamento de arquivos' };
export const NAV_STORAGE_KEY = 'jmc-nav-collapsed';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

/** Shell: barra superior e menu fixos, só a área de conteúdo rola; aviso de indisponibilidade da API (RF-W07). */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly theme = inject(ThemeService);
  private readonly healthStore = inject(ApiHealthStore);
  private readonly configStore = inject(AppConfigStore);
  private readonly document = inject(DOCUMENT);
  private readonly storage = storageOf(this.document);

  protected readonly contentId = CONTENT_ID;
  protected readonly nav: NavItem[] = [
    { path: '/upload', label: 'Upload', icon: 'upload' },
    { path: '/history', label: 'Histórico', icon: 'history' },
    { path: '/software', label: 'Softwares', icon: 'grid' },
  ];

  /** Menu lateral recolhido (só ícones); a escolha fica salva no navegador. */
  protected readonly collapsed = signal(this.readCollapsed());
  protected readonly health = this.healthStore.health;
  protected readonly themeLabel = computed(() => THEME_LABEL[this.theme.choice()]);
  protected readonly themeIcon = computed(() => THEME_ICON[this.theme.choice()]);
  protected readonly apiState = computed(() => {
    const health = this.health();
    if (!health) {
      return { css: 'checking', text: 'verificando API' };
    }
    return health.up ? { css: 'up', text: 'API ok' } : { css: 'down', text: 'API fora do ar' };
  });
  protected readonly warning = computed(() => {
    const health = this.health();
    if (!health) {
      return null;
    }
    if (!health.up && !health.down.length) {
      return 'A API está fora do ar. Algumas telas podem não carregar.';
    }
    if (health.down.length) {
      return `Indisponível: ${health.down.map((c) => COMPONENT_LABEL[c] ?? c).join(', ')}.`;
    }
    return this.configStore.loadedFromApi() ? null : 'Não foi possível ler a configuração da API; usando os limites padrão.';
  });

  constructor() {
    // Ao trocar de tela, o foco vai para a área de conteúdo: é ela que rola, então PageDown/Espaço/setas funcionam
    // logo de cara, e o leitor de tela começa pelo conteúdo novo. Mudar só query ou fragmento não move o foco.
    let lastPath: string | null = null;
    inject(Router)
      .events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        const path = e.urlAfterRedirects.split(/[?#]/)[0];
        if (path !== lastPath) {
          lastPath = path;
          this.document.getElementById(CONTENT_ID)?.focus({ preventScroll: true });
        }
      });
  }

  toggleNav(): void {
    this.collapsed.update((value) => !value);
    try {
      this.storage?.setItem(NAV_STORAGE_KEY, String(this.collapsed()));
    } catch {
      // armazenamento indisponível: a escolha vale só para a sessão
    }
  }

  private readCollapsed(): boolean {
    try {
      return this.storage?.getItem(NAV_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }
}

function storageOf(document: Document): Storage | null {
  try {
    return document.defaultView?.localStorage ?? null;
  } catch {
    return null;
  }
}
