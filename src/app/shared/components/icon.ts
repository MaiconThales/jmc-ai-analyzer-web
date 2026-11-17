import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Forma de um ícone: caminho, círculo [cx, cy, r] ou retângulo [x, y, largura, altura, raio]. */
type Shape = { d: string } | { c: [number, number, number] } | { r: [number, number, number, number, number] };

const RING: Shape = { c: [12, 12, 10] };

/**
 * Ícones de traço (24×24, estilo "outline"), desenhados no próprio app: nada de fonte de ícones nem CDN.
 * O traço segue `currentColor`, então o ícone herda a cor do texto.
 */
export const ICONS = {
  activity: [{ d: 'M22 12h-4l-3 9L9 3l-3 9H2' }],
  'alert-triangle': [{ d: 'M21.73 18 13.73 4a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }, { d: 'M12 9v4' }, { d: 'M12 17h.01' }],
  'arrow-down': [{ d: 'M12 5v14' }, { d: 'm19 12-7 7-7-7' }],
  'arrow-left': [{ d: 'M19 12H5' }, { d: 'm12 19-7-7 7-7' }],
  'arrow-right': [{ d: 'M5 12h14' }, { d: 'm12 5 7 7-7 7' }],
  box: [
    { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' },
    { d: 'M3.3 7 12 12l8.7-5' },
    { d: 'M12 22V12' },
  ],
  chart: [{ d: 'M3 3v18h18' }, { d: 'M18 17V9' }, { d: 'M13 17V5' }, { d: 'M8 17v-3' }],
  check: [{ d: 'M20 6 9 17l-5-5' }],
  'check-circle': [RING, { d: 'm9 12 2 2 4-4' }],
  'chevron-down': [{ d: 'm6 9 6 6 6-6' }],
  clock: [RING, { d: 'M12 6v6l4 2' }],
  copy: [{ r: [8, 8, 14, 14, 2] }, { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }],
  cpu: [
    { r: [4, 4, 16, 16, 2] },
    { r: [9, 9, 6, 6, 1] },
    { d: 'M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2' },
  ],
  droplet: [{ d: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z' }],
  file: [{ d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }, { d: 'M14 2v4a2 2 0 0 0 2 2h4' }],
  filter: [{ d: 'M22 3H2l8 9.46V19l4 2v-8.54Z' }],
  flame: [
    {
      d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z',
    },
  ],
  grid: [{ r: [3, 3, 7, 7, 1] }, { r: [14, 3, 7, 7, 1] }, { r: [14, 14, 7, 7, 1] }, { r: [3, 14, 7, 7, 1] }],
  'hard-drive': [
    { d: 'M22 12H2' },
    { d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z' },
    { d: 'M6 16h.01M10 16h.01' },
  ],
  history: [{ d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }, { d: 'M3 3v5h5' }, { d: 'M12 7v5l4 2' }],
  info: [RING, { d: 'M12 16v-4' }, { d: 'M12 8h.01' }],
  layers: [
    { d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z' },
    { d: 'm2 12 8.58 3.91a2 2 0 0 0 1.66 0L22 12' },
    { d: 'm2 17 8.58 3.91a2 2 0 0 0 1.66 0L22 17' },
  ],
  list: [{ d: 'M8 6h13M8 12h13M8 18h13' }, { d: 'M3 6h.01M3 12h.01M3 18h.01' }],
  loader: [{ d: 'M21 12a9 9 0 1 1-6.22-8.56' }],
  lock: [{ r: [3, 11, 18, 11, 2] }, { d: 'M7 11V7a5 5 0 0 1 10 0v4' }],
  'map-pin': [{ d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }, { c: [12, 10, 3] }],
  memory: [
    { d: 'M6 19v-3M10 19v-3M14 19v-3M18 19v-3M8 11V9M16 11V9M12 11V9M2 15h20' },
    { d: 'M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.1a2 2 0 0 0 0 3.84V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.06a2 2 0 0 0 0-3.84Z' },
  ],
  monitor: [{ r: [2, 3, 20, 14, 2] }, { d: 'M8 21h8M12 17v4' }],
  moon: [{ d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' }],
  'panel-left': [{ r: [3, 3, 18, 18, 2] }, { d: 'M9 3v18' }],
  pencil: [
    { d: 'M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5Z' },
    { d: 'm15 5 4 4' },
  ],
  plus: [{ d: 'M5 12h14M12 5v14' }],
  recycle: [
    { d: 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' },
    { d: 'M3 3v5h5' },
    { d: 'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16' },
    { d: 'M16 16h5v5' },
  ],
  shield: [
    {
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z',
    },
    { d: 'm9 12 2 2 4-4' },
  ],
  sun: [{ c: [12, 12, 4] }, { d: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' }],
  trash: [{ d: 'M3 6h18' }, { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }, { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }],
  upload: [{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { d: 'm17 8-5-5-5 5' }, { d: 'M12 3v12' }],
  'upload-cloud': [{ d: 'M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.24' }, { d: 'M12 12v9' }, { d: 'm16 16-4-4-4 4' }],
  wrench: [
    {
      d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z',
    },
  ],
  x: [{ d: 'M18 6 6 18M6 6l12 12' }],
  'x-circle': [RING, { d: 'm15 9-6 6M9 9l6 6' }],
  zap: [{ d: 'M13 2 3 14h9l-1 8 10-12h-9l1-8Z' }],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

/** Ícone decorativo (o significado sempre vem do texto ao lado ou de um aria-label no elemento pai). */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon' },
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      @for (s of shapes(); track $index) {
        @if (s.d) {
          <path [attr.d]="s.d" />
        } @else if (s.c) {
          <circle [attr.cx]="s.c[0]" [attr.cy]="s.c[1]" [attr.r]="s.c[2]" />
        } @else if (s.r) {
          <rect [attr.x]="s.r[0]" [attr.y]="s.r[1]" [attr.width]="s.r[2]" [attr.height]="s.r[3]" [attr.rx]="s.r[4]" />
        }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; flex: none; line-height: 0; }
    svg { display: block; }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
  protected readonly shapes = computed(() =>
    (ICONS[this.name()] as Shape[]).map((s) => ({
      d: 'd' in s ? s.d : null,
      c: 'c' in s ? s.c : null,
      r: 'r' in s ? s.r : null,
    })),
  );
}
