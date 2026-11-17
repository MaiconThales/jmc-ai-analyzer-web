import { healthBand } from './health';

describe('healthBand', () => {
  it('aplica as faixas crítico < 40, atenção 40–74, ok ≥ 75', () => {
    expect(healthBand(0)).toBe('critico');
    expect(healthBand(39)).toBe('critico');
    expect(healthBand(40)).toBe('atencao');
    expect(healthBand(74)).toBe('atencao');
    expect(healthBand(75)).toBe('ok');
    expect(healthBand(100)).toBe('ok');
  });
});
