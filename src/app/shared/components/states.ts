import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ApiError } from '../../core/errors/api-error';
import { describeError } from '../../core/errors/error-messages';
import { Icon } from './icon';

/** Estado vazio: símbolo em cinza, frase e conteúdo projetado (ação). */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty" role="status">
      <span class="art"><img src="logo-mark.svg" alt="" width="40" height="40" /></span>
      <p class="title">{{ title() }}</p>
      @if (message()) {
        <p class="muted">{{ message() }}</p>
      }
      <div class="actions"><ng-content /></div>
    </div>
  `,
  styles: `
    .empty { display: grid; justify-items: center; text-align: center; padding: 40px 16px; animation: fade-up var(--dur-slow) var(--ease) backwards; }
    .art { display: grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; margin-bottom: 8px;
      background: var(--surface-2); border: 1px dashed var(--border-strong); }
    img { filter: grayscale(1); opacity: 0.55; }
    p { margin: 4px 0; max-width: 48ch; }
    .title { font-weight: 700; font-size: 16px; }
    .actions:empty { display: none; }
    .actions { margin-top: 12px; }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input<string>();
}

/** Erro com mensagem em português e "tentar de novo". */
@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="error" role="alert">
      <app-icon name="alert-triangle" [size]="22" />
      <div class="body">
        <strong>{{ text() }}</strong>
        <ng-content />
        @if (retryable()) {
          <button type="button" class="btn sm" (click)="retry.emit()">Tentar de novo</button>
        }
      </div>
    </div>
  `,
  styles: `
    .error { display: flex; gap: 12px; align-items: flex-start; border: 1px solid color-mix(in srgb, var(--prio-alta) 40%, transparent);
      background: var(--prio-alta-soft); color: var(--text); border-radius: var(--radius); padding: 16px;
      animation: fade-up var(--dur-slow) var(--ease) backwards; }
    app-icon { color: var(--prio-alta); margin-top: 1px; }
    .body { display: grid; gap: 10px; justify-items: start; }
  `,
})
export class ErrorState {
  readonly error = input.required<ApiError>();
  readonly retryable = input(true);
  readonly retry = output();
  protected readonly text = computed(() => describeError(this.error()));
}

/** Carregamento acessível: texto para leitores de tela e um esqueleto do conteúdo. */
@Component({
  selector: 'app-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading" role="status" aria-live="polite">
      <p class="label"><span class="spinner" aria-hidden="true"></span>{{ label() }}…</p>
      <div class="skeleton bar w60" aria-hidden="true"></div>
      <div class="grid" aria-hidden="true">
        <div class="skeleton tile"></div>
        <div class="skeleton tile"></div>
        <div class="skeleton tile"></div>
      </div>
      <div class="skeleton block" aria-hidden="true"></div>
    </div>
  `,
  styles: `
    .loading { display: grid; gap: 14px; animation: fade-in var(--dur) var(--ease) backwards; }
    .label { display: inline-flex; align-items: center; gap: 10px; margin: 0; color: var(--text-muted); font-size: 14px; }
    .spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--border-strong); border-top-color: var(--brand);
      animation: spin 0.8s linear infinite; }
    .bar { height: 28px; }
    .w60 { width: min(60%, 420px); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
    .tile { height: 84px; border-radius: var(--radius); }
    .block { height: 220px; border-radius: var(--radius); }
  `,
})
export class LoadingState {
  readonly label = input('Carregando');
}
