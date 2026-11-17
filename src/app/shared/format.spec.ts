import {
  formatBytes,
  formatCount,
  formatDateTime,
  formatDuration,
  formatFraction,
  formatFrame,
  formatPercent,
  formatRelative,
  framePackage,
  simpleClassName,
} from './format';

describe('format', () => {
  it('formata bytes em unidades binárias', () => {
    expect(formatBytes(null)).toBe('—');
    expect(formatBytes(Number.NaN)).toBe('—');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1468006)).toBe('1,4 MB');
    expect(formatBytes(1.7 * 1024 ** 3, '/s')).toBe('1,7 GB/s');
    expect(formatBytes(-2048)).toBe('-2,0 KB');
    expect(formatBytes(5 * 1024 ** 5)).toBe('5.120,0 TB');
  });

  it('formata frações e percentuais', () => {
    expect(formatFraction(0.0205)).toBe('2,1%');
    expect(formatFraction(undefined)).toBe('—');
    expect(formatPercent(12.76)).toBe('12,8%');
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent(1.17, 2)).toBe('1,17%');
  });

  it('formata durações', () => {
    expect(formatDuration(null)).toBe('—');
    expect(formatDuration(70)).toBe('70 ms');
    expect(formatDuration(2.5)).toBe('2,5 ms');
    expect(formatDuration(1200)).toBe('1,2 s');
    expect(formatDuration(65_000)).toBe('1 min 5 s');
    expect(formatDuration(120_000)).toBe('2 min');
    expect(formatDuration(7_380_000)).toBe('2 h 3 min');
  });

  it('formata contagens e datas', () => {
    expect(formatCount(58000)).toBe('58.000');
    expect(formatCount(undefined)).toBe('—');
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(new Date(2026, 10, 17, 14, 2))).toBe('17/11/2026, 14:02');
    expect(formatDateTime('2026-11-17T14:02:00')).toContain('17/11/2026');
  });

  it('formata tempo relativo', () => {
    const now = new Date('2026-11-17T12:00:00Z');
    expect(formatRelative(null)).toBe('—');
    expect(formatRelative('2026-11-17T10:00:00Z', now)).toBe('há 2 horas');
    expect(formatRelative(new Date('2026-11-14T12:00:00Z'), now)).toBe('há 3 dias');
    expect(formatRelative('2026-11-17T11:55:00Z', now)).toBe('há 5 minutos');
    expect(formatRelative('2026-11-17T11:59:50Z', now)).toBe('há 10 segundos');
  });

  it('formata frames e classes', () => {
    const frame = { c: 'br.com.app.util.HexaUtil', m: 'converteString', d: '(B)V', l: 23 };
    expect(formatFrame(frame)).toBe('HexaUtil.converteString:23');
    expect(formatFrame(frame, true)).toBe('br.com.app.util.HexaUtil.converteString:23');
    expect(formatFrame({ c: 'A', m: 'b', l: -1 })).toBe('A.b');
    expect(formatFrame({})).toBe('.');
    expect(formatFrame({}, true)).toBe('.');
    expect(formatFrame(null)).toBe('');
    expect(framePackage(frame)).toBe('br.com.app.util');
    expect(framePackage({ c: 'Semacote' })).toBe('');
    expect(framePackage(undefined)).toBe('');
    expect(simpleClassName('a.b.C$D')).toBe('C$D');
    expect(simpleClassName(undefined)).toBe('');
  });
});
