import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HEALTH_LABEL, healthBand } from '../health';

/** Selo de saúde: anel animado com a nota e o rótulo da faixa. */
@Component({
  selector: 'app-health-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.compact]': 'compact()' },
  template: `
    @if (score() !== null && score() !== undefined) {
      <div class="health" role="img" [class]="band()" [attr.aria-label]="'Nota de saúde ' + score() + ' de 100, ' + label()">
        <div class="ring" [style.--p]="score()" aria-hidden="true"><b>{{ score() }}</b></div>
        @if (!compact()) {
          <div class="text"><strong>{{ label() }}</strong><small>nota de saúde</small></div>
        }
      </div>
    } @else {
      <span class="muted">—</span>
    }
  `,
  styles: `
    :host { display: inline-flex; }
    .health { display: inline-flex; align-items: center; gap: 12px; --hc: var(--health-ok); }
    .critico { --hc: var(--health-critico); }
    .atencao { --hc: var(--health-atencao); }
    .ring { --size: 56px; width: var(--size); height: var(--size); border-radius: 50%; display: grid; place-items: center;
      background: conic-gradient(var(--hc) calc(var(--p) * 1%), color-mix(in srgb, var(--border) 80%, transparent) 0);
      animation: ring-fill 1s var(--ease) backwards; }
    .ring b { width: calc(var(--size) - 12px); height: calc(var(--size) - 12px); border-radius: 50%; background: var(--surface);
      display: grid; place-items: center; font-family: var(--mono); font-size: 16px; color: var(--text); }
    .text { display: grid; line-height: 1.15; }
    strong { color: var(--hc); font-size: 16px; text-transform: capitalize; }
    small { color: var(--text-muted); font-size: 12px; }
    :host(.compact) .ring { --size: 38px; }
    :host(.compact) .ring b { font-size: 12px; width: calc(var(--size) - 8px); height: calc(var(--size) - 8px); }
  `,
})
export class HealthBadge {
  readonly score = input<number | null | undefined>();
  readonly compact = input(false);
  protected readonly band = computed(() => healthBand(this.score() ?? 0));
  protected readonly label = computed(() => HEALTH_LABEL[this.band()]);
}
