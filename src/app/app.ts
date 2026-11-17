import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppConfigStore } from './core/config/app-config.store';
import { ApiHealthStore } from './core/layout/api-health.store';
import { ThemeService } from './core/theme/theme.service';

const THEME_LABEL = { system: 'Tema do sistema', light: 'Tema claro', dark: 'Tema escuro' } as const;
const COMPONENT_LABEL: Record<string, string> = { db: 'banco de dados', blobStorage: 'armazenamento de arquivos' };

/** Shell: barra superior, navegação e aviso de indisponibilidade da API (RF-W07). */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly theme = inject(ThemeService);
  private readonly healthStore = inject(ApiHealthStore);
  private readonly configStore = inject(AppConfigStore);

  protected readonly health = this.healthStore.health;
  protected readonly themeLabel = computed(() => THEME_LABEL[this.theme.choice()]);
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
}
