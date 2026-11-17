import { HttpEventType } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AnalysesApi } from '../../core/api/analyses.api';
import { UploadForm } from '../../core/api/models';
import { AppConfigStore } from '../../core/config/app-config.store';
import { ApiError, isApiError } from '../../core/errors/api-error';
import { describeError } from '../../core/errors/error-messages';
import { formatBytes } from '../../shared/format';
import { SelectedFile, validateBatch, validateFile } from './upload-validation';

/** Estado do upload: arquivos validados, progresso e erro. */
@Injectable()
export class UploadStore {
  private readonly api = inject(AnalysesApi);
  private readonly router = inject(Router);
  private readonly configStore = inject(AppConfigStore);
  private subscription?: Subscription;

  readonly files = signal<SelectedFile[]>([]);
  readonly progress = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly uploading = computed(() => this.progress() !== null);
  readonly batchError = computed(() => validateBatch(this.files(), this.configStore.config()));
  readonly hasInvalidFile = computed(() => this.files().some((f) => f.error));
  readonly totalBytes = computed(() => this.files().reduce((sum, f) => sum + f.file.size, 0));

  add(files: readonly File[]): void {
    const config = this.configStore.config();
    const known = new Set(this.files().map((f) => `${f.file.name}:${f.file.size}`));
    const added: SelectedFile[] = [];
    for (const file of files) {
      const key = `${file.name}:${file.size}`;
      if (!known.has(key)) {
        known.add(key);
        added.push({ file, error: validateFile(file, config) });
      }
    }
    this.files.update((current) => [...current, ...added]);
    this.error.set(null);
  }

  remove(index: number): void {
    this.files.update((current) => current.filter((_, i) => i !== index));
  }

  canSubmit(): boolean {
    return !this.uploading() && !this.batchError() && !this.hasInvalidFile();
  }

  submit(form: UploadForm): void {
    if (!this.canSubmit()) {
      return;
    }
    this.error.set(null);
    this.progress.set(0);
    this.subscription = this.api
      .upload(
        form,
        this.files().map((f) => f.file),
      )
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.progress.set(Math.round((event.loaded / event.total) * 100));
          } else if (event.type === HttpEventType.Response && event.body?.batchId) {
            this.progress.set(null);
            void this.router.navigate(['/batches', event.body.batchId]);
          }
        },
        error: (error: unknown) => {
          this.progress.set(null);
          this.error.set(this.describe(isApiError(error) ? error : ApiError.network()));
        },
      });
  }

  cancel(): void {
    this.subscription?.unsubscribe();
    this.progress.set(null);
  }

  private describe(error: ApiError): string {
    const config = this.configStore.config();
    return describeError(error, { maxFiles: config.maxFiles, limite: formatBytes(config.maxFileSizeBytes) });
  }
}
