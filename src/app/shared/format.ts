import type { StackFrame } from '../core/api/models';

const LOCALE = 'pt-BR';
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

function number(value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Bytes em unidade binária com 1 casa: "1,4 MB". */
export function formatBytes(bytes: number | null | undefined, suffix = ''): string {
  if (bytes == null || Number.isNaN(bytes)) {
    return '—';
  }
  let value = Math.abs(bytes);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 ? 0 : 1;
  return `${bytes < 0 ? '-' : ''}${number(value, digits)} ${UNITS[unit]}${suffix}`;
}

/** Fração de 0 a 1 em percentual: 0,0205 → "2,1%". */
export function formatFraction(fraction: number | null | undefined, digits = 1): string {
  return fraction == null ? '—' : `${number(fraction * 100, digits)}%`;
}

/** Percentual já em 0–100: 12,76 → "12,8%". */
export function formatPercent(percent: number | null | undefined, digits = 1): string {
  return percent == null ? '—' : `${number(percent, digits)}%`;
}

/** Milissegundos legíveis: "70 ms", "1,2 s", "1 min 5 s", "2 h 3 min". */
export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) {
    return '—';
  }
  if (ms < 1000) {
    return `${number(ms, ms < 10 && ms % 1 !== 0 ? 1 : 0)} ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${number(seconds, 1)} s`;
  }
  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const rest = totalSeconds % 60;
  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }
  return rest > 0 ? `${minutes} min ${rest} s` : `${minutes} min`;
}

/** Número inteiro com separador de milhar: 58000 → "58.000". */
export function formatCount(value: number | null | undefined): string {
  return value == null ? '—' : number(value, 0);
}

/** Data e hora local: "17/11/2026 14:02". */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

/** Tempo relativo: "há 2 h", "há 3 dias". */
export function formatRelative(value: string | Date | null | undefined, now: Date = new Date()): string {
  if (!value) {
    return '—';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const format = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) {
      return format.format(Math.trunc(seconds / size), unit);
    }
  }
  return format.format(seconds, 'second');
}

/** Nome simples de uma classe: "br.com.app.Tac$Inner" → "Tac$Inner". */
export function simpleClassName(className: string | null | undefined): string {
  if (!className) {
    return '';
  }
  return className.substring(className.lastIndexOf('.') + 1);
}

/** Frame legível: "HexaUtil.converteString:23". */
export function formatFrame(frame: StackFrame | null | undefined, withPackage = false): string {
  if (!frame) {
    return '';
  }
  const type = withPackage ? (frame.c ?? '') : simpleClassName(frame.c);
  const line = frame.l != null && frame.l >= 0 ? `:${frame.l}` : '';
  return `${type}.${frame.m ?? ''}${line}`;
}

/** Pacote de um frame: "br.com.app.util". */
export function framePackage(frame: StackFrame | null | undefined): string {
  const type = frame?.c ?? '';
  const index = type.lastIndexOf('.');
  return index > 0 ? type.substring(0, index) : '';
}
