import { Pipe, PipeTransform } from '@angular/core';
import type { StackFrame } from '../../core/api/models';
import {
  formatBytes,
  formatCount,
  formatDateTime,
  formatDuration,
  formatFraction,
  formatFrame,
  formatPercent,
  formatRelative,
} from '../format';

@Pipe({ name: 'bytes' })
export class BytesPipe implements PipeTransform {
  transform(value: number | null | undefined, suffix = ''): string {
    return formatBytes(value, suffix);
  }
}

@Pipe({ name: 'fraction' })
export class FractionPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 1): string {
    return formatFraction(value, digits);
  }
}

@Pipe({ name: 'percent1' })
export class PercentPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 1): string {
    return formatPercent(value, digits);
  }
}

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatDuration(value);
  }
}

@Pipe({ name: 'count' })
export class CountPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatCount(value);
  }
}

@Pipe({ name: 'dateTime' })
export class DateTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    return formatDateTime(value);
  }
}

@Pipe({ name: 'relative' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    return formatRelative(value);
  }
}

@Pipe({ name: 'frame' })
export class FramePipe implements PipeTransform {
  transform(value: StackFrame | null | undefined, withPackage = false): string {
    return formatFrame(value, withPackage);
  }
}

export const FORMAT_PIPES = [
  BytesPipe,
  FractionPipe,
  PercentPipe,
  DurationPipe,
  CountPipe,
  DateTimePipe,
  RelativeTimePipe,
  FramePipe,
] as const;
