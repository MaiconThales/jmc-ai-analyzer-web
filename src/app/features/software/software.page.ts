import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApiError, isApiError } from '../../core/errors/api-error';
import { describeError } from '../../core/errors/error-messages';
import { SoftwareResponse } from '../../core/api/models';
import { SoftwareApi } from '../../core/api/software.api';
import { Icon } from '../../shared/components/icon';
import { EmptyState, ErrorState, LoadingState } from '../../shared/components/states';
import { DateTimePipe } from '../../shared/pipes/format.pipes';
import { Remote } from '../../shared/state/remote';
import { MAX_RETENTION, MIN_RETENTION, validatePackage, validateRetention } from './software-validation';

interface Draft {
  name: string;
  retentionDays: number;
  appPackages: string[];
  packageInput: string;
  packageError: string | null;
}

/** Softwares: retenção e pacotes da aplicação (RF-W06). */
@Component({
  selector: 'app-software-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, ErrorState, LoadingState, DateTimePipe, Icon],
  templateUrl: './software.page.html',
  styleUrl: './software.page.scss',
})
export class SoftwarePage {
  private readonly api = inject(SoftwareApi);
  protected readonly remote = new Remote<SoftwareResponse[]>();
  protected readonly draft = signal<Draft | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly minRetention = MIN_RETENTION;
  protected readonly maxRetention = MAX_RETENTION;

  constructor() {
    this.load();
  }

  load(): void {
    this.remote.run(this.api.list());
  }

  edit(software: SoftwareResponse): void {
    this.saveError.set(null);
    this.draft.set({
      name: software.name ?? '',
      retentionDays: software.retentionDays ?? 90,
      appPackages: [...(software.appPackages ?? [])],
      packageInput: '',
      packageError: null,
    });
  }

  cancel(): void {
    this.draft.set(null);
  }

  setRetention(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.draft.update((d) => (d ? { ...d, retentionDays: value } : d));
  }

  setPackageInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.draft.update((d) => (d ? { ...d, packageInput: value, packageError: null } : d));
  }

  addPackage(event?: Event): void {
    event?.preventDefault();
    const d = this.draft();
    if (!d || !d.packageInput.trim()) {
      return;
    }
    const error = validatePackage(d.packageInput, d.appPackages);
    this.draft.set(
      error
        ? { ...d, packageError: error }
        : { ...d, appPackages: [...d.appPackages, d.packageInput.trim()], packageInput: '', packageError: null },
    );
  }

  removePackage(name: string): void {
    this.draft.update((d) => (d ? { ...d, appPackages: d.appPackages.filter((p) => p !== name) } : d));
  }

  retentionError(): string | null {
    const d = this.draft();
    return d ? validateRetention(d.retentionDays) : null;
  }

  save(): void {
    const d = this.draft();
    if (!d || this.retentionError()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set(null);
    this.api.update(d.name, { retentionDays: d.retentionDays, appPackages: d.appPackages }).subscribe({
      next: (updated) => {
        this.remote.data.update((list) => (list ?? []).map((s) => (s.name === updated.name ? updated : s)));
        this.saving.set(false);
        this.draft.set(null);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.saveError.set(describeError(isApiError(error) ? error : ApiError.network()));
      },
    });
  }
}
