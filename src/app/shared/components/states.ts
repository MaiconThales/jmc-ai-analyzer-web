import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ApiError } from '../../core/errors/api-error';
import { describeError } from '../../core/errors/error-messages';

/** Estado vazio: símbolo em cinza, frase e conteúdo projetado (ação). */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty" role="status">
      <img src="logo-mark.svg" alt="" width="40" height="40" />
      <p><strong>{{ title() }}</strong></p>
      @if (message()) {
        <p class="muted">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    .empty { text-align: center; padding: 32px 16px; }
    img { filter: grayscale(1); opacity: 0.5; }
    p { margin: 6px 0; }
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
  template: `
    <div class="error" role="alert">
      <strong>{{ text() }}</strong>
      <ng-content />
      @if (retryable()) {
        <button type="button" (click)="retry.emit()">Tentar de novo</button>
      }
    </div>
  `,
  styles: `
    .error { border: 1px solid var(--prio-alta); background: var(--prio-alta-soft); color: var(--text);
      border-radius: var(--radius); padding: 16px; display: grid; gap: 8px; justify-items: start; }
    button { font: inherit; font-weight: 600; color: var(--brand); background: var(--surface);
      border: 1px solid var(--border); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
  `,
})
export class ErrorState {
  readonly error = input.required<ApiError>();
  readonly retryable = input(true);
  readonly retry = output();
  protected readonly text = computed(() => describeError(this.error()));
}

/** Indicador de carregamento acessível. */
@Component({
  selector: 'app-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="loading" role="status" aria-live="polite">{{ label() }}…</div>`,
  styles: `.loading { padding: 24px; color: var(--text-muted); }`,
})
export class LoadingState {
  readonly label = input('Carregando');
}
