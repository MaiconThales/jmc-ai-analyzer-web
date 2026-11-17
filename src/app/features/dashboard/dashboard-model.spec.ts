import { FIXTURES, clone } from '../../../testing/fixtures';
import { countByPriority, fromBatch, fromRecording, metricSeries, perRecording, sumPoints } from './dashboard-model';
import { resolveTopN } from './top-n';
import { DEFAULT_CONFIG } from '../../core/config/app-config.store';

describe('dashboard-model', () => {
  it('normaliza o dashboard da gravação com uma série por métrica', () => {
    const model = fromRecording(FIXTURES.recordingDashboard);
    expect(model.cpu.available).toBe(true);
    expect(model.cpu.series.map((s) => s.name)).toEqual(['JVM (usuário)', 'JVM (sistema)', 'Máquina']);
    expect(model.heap.series.map((s) => s.name)).toEqual(['Usado', 'Comprometido']);
    expect(model.threads.series.map((s) => s.name)).toEqual(['Ativas', 'Daemon']);
    expect(model.diagnosis.length).toBeGreaterThan(0);
    expect(model.recordingNames).toEqual({});
  });

  it('normaliza o lote com uma série por gravação', () => {
    const model = fromBatch(FIXTURES.batchDashboard);
    expect(model.cpu.series).toHaveLength(3);
    expect(model.cpu.series[0].name).toMatch(/\.jfr$/);
    expect(Object.keys(model.recordingNames)).toHaveLength(3);
  });

  it('tolera respostas vazias', () => {
    const empty = fromRecording({});
    expect(empty.cpu.available).toBe(false);
    expect(empty.cpu.series).toEqual([]);
    expect(empty.diagnosis).toEqual([]);
    expect(empty.findings).toEqual([]);
    const batch = fromBatch({ includedRecordings: [{ originalName: 'sem-id' }] });
    expect(batch.recordingNames).toEqual({});
    expect(batch.heap.series).toEqual([]);
    const noName = clone(FIXTURES.batchDashboard);
    noName.includedRecordings = [{ id: noName.includedRecordings![0].id }];
    expect(Object.values(fromBatch(noName).recordingNames)[0]).toBe(noName.includedRecordings[0].id);
  });

  it('soma pontos de várias métricas e usa o id quando falta o nome', () => {
    const a = [{ ts: 't1', avg: 1, max: 2 }, { ts: 't2', avg: 3, max: 4 }];
    const b = [{ ts: 't1', avg: 10, max: 20 }];
    expect(sumPoints([a, b])).toEqual([{ ts: 't1', avg: 11, max: 22 }, { ts: 't2', avg: 3, max: 4 }]);
    expect(sumPoints([[], []])).toEqual([]);
    expect(sumPoints([[{ ts: 't' }]])).toEqual([{ ts: 't', avg: 0, max: 0 }]);
    expect(perRecording({ r1: { CPU_JVM_USER: a } }, ['CPU_JVM_USER'], {})[0].name).toBe('r1');
    expect(perRecording(undefined, ['CPU_JVM_USER'], {})).toEqual([]);
    expect(metricSeries(undefined, ['HEAP_USED'])).toEqual([]);
  });

  it('conta prioridades e resolve topN', () => {
    expect(countByPriority([{ priority: 'ALTA' }, { priority: 'MEDIA' }, { priority: 'MEDIA' }, {}])).toEqual({
      ALTA: 1,
      MEDIA: 2,
      BAIXA: 0,
    });
    expect(resolveTopN(undefined, DEFAULT_CONFIG)).toBe(10);
    expect(resolveTopN('abc', DEFAULT_CONFIG)).toBe(10);
    expect(resolveTopN('0', DEFAULT_CONFIG)).toBe(10);
    expect(resolveTopN('20', DEFAULT_CONFIG)).toBe(20);
    expect(resolveTopN('500', DEFAULT_CONFIG)).toBe(50);
  });
});
