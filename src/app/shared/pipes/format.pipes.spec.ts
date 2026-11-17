import {
  BytesPipe,
  CountPipe,
  DateTimePipe,
  DurationPipe,
  FractionPipe,
  FramePipe,
  PercentPipe,
  RelativeTimePipe,
} from './format.pipes';

describe('pipes de formatação', () => {
  it('delegam para as funções de formatação', () => {
    expect(new BytesPipe().transform(2048)).toBe('2,0 KB');
    expect(new BytesPipe().transform(2048, '/s')).toBe('2,0 KB/s');
    expect(new FractionPipe().transform(0.5)).toBe('50,0%');
    expect(new FractionPipe().transform(0.5, 0)).toBe('50%');
    expect(new PercentPipe().transform(3)).toBe('3,0%');
    expect(new DurationPipe().transform(70)).toBe('70 ms');
    expect(new CountPipe().transform(1000)).toBe('1.000');
    expect(new DateTimePipe().transform(null)).toBe('—');
    expect(new RelativeTimePipe().transform(null)).toBe('—');
    expect(new FramePipe().transform({ c: 'a.B', m: 'c', l: 1 })).toBe('B.c:1');
    expect(new FramePipe().transform({ c: 'a.B', m: 'c', l: 1 }, true)).toBe('a.B.c:1');
  });
});
