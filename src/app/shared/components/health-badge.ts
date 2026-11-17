import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HEALTH_LABEL, healthBand } from '../health';

/** Selo de saúde: anel com a nota e o rótulo da faixa. */
@Component({
  selector: 'app-health-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (score() !== null && score() !== undefined) {
      <div class="health" role="img" [class]="band()" [attr.aria-label]="'Nota de saúde ' + score() + ' de 100, ' + label()">
        <div class="ring" [style.--p]="score()" aria-hidden="true"><b>{{ score() }}</b></div>
        @if (!compact()) {
          <div><strong>{{ label() }}</strong><small>nota de saúde</small></div>
        }
      </div>
    } @else {
      <span class="muted">—</span>
    }
  `,
  styles: `
    .health { display: inline-flex; align-items: center; gap: 10px; --hc: var(--health-ok); }
    .critico { --hc: var(--health-critico); }
    .atencao { --hc: var(--health-atencao); }
    .ring { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center;
      background: conic-gradient(var(--hc) calc(var(--p) * 1%), var(--border) 0); }
    .ring b { width: 40px; height: 40px; border-radius: 50%; background: var(--surface); display: grid;
      place-items: center; font-size: 15px; }
    strong { color: var(--hc); display: block; line-height: 1.1; }
    small { color: var(--text-muted); font-size: 12px; }
    :host-context(.compact) .ring { width: 36px; height: 36px; }
  `,
})
export class HealthBadge {
  readonly score = input<number | null | undefined>();
  readonly compact = input(false);
  protected readonly band = computed(() => healthBand(this.score() ?? 0));
  protected readonly label = computed(() => HEALTH_LABEL[this.band()]);
}
