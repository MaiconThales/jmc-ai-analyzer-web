import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/components/states';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyState],
  template: `
    <div class="page">
      <app-empty-state title="Página não encontrada" message="O endereço não existe ou foi digitado errado.">
        <a routerLink="/upload">Ir para o upload</a>
      </app-empty-state>
    </div>
  `,
})
export class NotFoundPage {}
