import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { catchError, of } from 'rxjs';
import { ENVIRONMENTS, Environment } from '../../core/api/models';
import { SoftwareApi } from '../../core/api/software.api';
import { AppConfigStore } from '../../core/config/app-config.store';
import { Icon } from '../../shared/components/icon';
import { BytesPipe } from '../../shared/pipes/format.pipes';
import { MAX_DESCRIPTION, MAX_VERSION, SOFTWARE_PATTERN } from './upload-validation';
import { UploadStore } from './upload.store';

/** Envio de gravações JFR (RF-W01). */
@Component({
  selector: 'app-upload-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UploadStore],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatProgressBarModule,
    BytesPipe,
    Icon,
  ],
  templateUrl: './upload.page.html',
  styleUrl: './upload.page.scss',
})
export class UploadPage {
  protected readonly store = inject(UploadStore);
  protected readonly config = inject(AppConfigStore).config;
  protected readonly environments = ENVIRONMENTS;
  protected readonly maxDescription = MAX_DESCRIPTION;
  protected readonly dragging = signal(false);

  protected readonly form = new FormGroup({
    software: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(SOFTWARE_PATTERN)] }),
    softwareVersion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(MAX_VERSION)] }),
    environment: new FormControl<Environment | ''>('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(MAX_DESCRIPTION)] }),
  });

  private readonly softwareNames = toSignal(inject(SoftwareApi).list().pipe(catchError(() => of([]))), { initialValue: [] });
  private readonly typed = toSignal(this.form.controls.software.valueChanges, { initialValue: '' });
  protected readonly suggestions = computed(() => {
    const term = this.typed().toLowerCase();
    return this.softwareNames()
      .map((s) => s.name ?? '')
      .filter((name) => name.includes(term));
  });
  private readonly descriptionValue = toSignal(this.form.controls.description.valueChanges, { initialValue: '' });
  protected readonly descriptionLength = computed(() => this.descriptionValue().length);

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.add(Array.from(input.files ?? []));
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.store.add(Array.from(event.dataTransfer?.files ?? []));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.store.submit({
      software: value.software.trim(),
      softwareVersion: value.softwareVersion,
      environment: value.environment || undefined,
      description: value.description,
    });
  }
}
