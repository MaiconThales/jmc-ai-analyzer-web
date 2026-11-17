import { Clipboard } from '@angular/cdk/clipboard';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FIXTURES, clone } from '../../../../testing/fixtures';
import { stubCharts, text } from '../../../../testing/test-helpers';
import { fromBatch, fromRecording } from '../dashboard-model';
import { ComparisonTable } from './comparison-table';
import { CoveragePanel } from './coverage-panel';
import { DiagnosisList } from './diagnosis-list';
import { FindingsList } from './findings-list';
import { MetricsBlocks } from './metrics-blocks';

function render<T>(type: Type<T>, inputs: Record<string, unknown>) {
  const fixture = TestBed.createComponent(type);
  Object.entries(inputs).forEach(([k, v]) => fixture.componentRef.setInput(k, v));
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('blocos do dashboard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Clipboard, useValue: { copy: vi.fn().mockReturnValue(true) } }],
    });
    stubCharts();
  });

  it('diagnóstico mostra os itens dos exemplos com local e ação (CA-W02)', () => {
    const el = render(DiagnosisList, { items: FIXTURES.recordingDashboard.diagnosis });
    const content = text(el);
    expect(content).toContain('Flag da JVM limita o compilador ao C1');
    expect(content).toContain('JVM limitada a menos processadores que a máquina');
    expect(content).toContain('Thread com maior volume de alocação');
    expect(content).toContain('seu código');
    expect(content).toMatch(/➜/);
    expect(el.querySelector('a[href$="#allocation"]')).not.toBeNull();
    expect(el.querySelector('.spread')).toBeNull();
  });

  it('diagnóstico do lote mostra "em N de M gravações" com links (CA-W05)', () => {
    const model = fromBatch(FIXTURES.batchDashboard);
    const el = render(DiagnosisList, { items: model.diagnosis, names: model.recordingNames, totalRecordings: 3 });
    expect(text(el.querySelector('.spread'))).toMatch(/^em \d de 3 gravações$/);
    expect(el.querySelector('a[href^="/recordings/"]')?.textContent).toMatch(/\.jfr$/);
  });

  it('diagnóstico vazio e itens com thread, alvo e categoria desconhecida', () => {
    expect(text(render(DiagnosisList, { items: [] }))).toContain('Nenhum problema encontrado');
    const el = render(DiagnosisList, {
      items: [
        { priority: 'ALTA', category: 'NOVA', title: 't', location: { thread: 'main', target: 'db:5432' }, recordingIds: ['x'] },
        { title: 'sem prioridade' },
      ],
      totalRecordings: 2,
    });
    expect(text(el)).toContain('NOVA');
    expect(text(el)).toContain('thread main');
    expect(text(el)).toContain('alvo db:5432');
    expect(text(el)).toContain('gravação');
  });

  it('cobertura lista problemas e permite copiar o comando (CA-W03)', () => {
    const el = render(CoveragePanel, { coverage: FIXTURES.recordingDashboard.coverage });
    const content = text(el);
    expect(content).toContain('EXCEPTIONS (Ausente)');
    expect(content).toContain('FILE_IO (Ausente)');
    expect(content).toContain('HOT_METHODS (Insuficiente)');
    (el.querySelector('.cmd button') as HTMLButtonElement).click();
    expect(TestBed.inject(Clipboard).copy).toHaveBeenCalledWith(expect.stringContaining('-XX:StartFlightRecording'));
    const ok = render(CoveragePanel, { coverage: { items: [{ domain: 'CPU', status: 'OK' }] } });
    expect(text(ok)).toContain('A gravação tem dados para todos os domínios.');
    expect(text(render(CoveragePanel, { coverage: undefined }))).toContain('Com dados: nenhum');
    expect(text(render(CoveragePanel, { coverage: { items: [{ domain: 'X', reason: 'r' }] } }))).toContain('X (Ausente)');
  });

  it('achados do JMC mostram severidade e HTML sanitizado', () => {
    const el = render(FindingsList, {
      findings: [
        ...FIXTURES.recordingDashboard.findings!.slice(0, 3),
        { ruleId: 'X', name: 'Perigo', severity: 'WARNING', summary: '<p>ok<script>alert(1)</script></p>', recordingIds: ['a'] },
        { ruleId: 'Y', name: 'Outro', severity: 'NOVA' },
        { ruleId: 'Z', name: 'Sem' },
      ],
    });
    expect(text(el)).toContain('Aviso');
    expect(el.innerHTML).not.toContain('<script>');
    expect(text(el)).toContain('1 gravação(ões)');
  });

  it('comparativo lista uma linha por gravação', () => {
    const el = render(ComparisonTable, { rows: FIXTURES.batchDashboard.comparison });
    expect(el.querySelectorAll('tbody tr')).toHaveLength(3);
  });

  it('blocos de métricas usam os ids do domainRef e indicam indisponíveis', () => {
    const el = render(MetricsBlocks, { model: fromRecording(FIXTURES.recordingDashboard) });
    for (const id of ['cpu', 'heap', 'gc', 'threads', 'hotMethods', 'allocation', 'locks', 'exceptions', 'io', 'leakSuspects', 'threadCpu']) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
    expect(text(el.querySelector('#io'))).toContain('Leitura de rede');
    expect(text(el.querySelector('#locks'))).toContain('Thread estacionada');

    const empty = clone(FIXTURES.recordingDashboard);
    for (const key of ['gc', 'locks', 'hotMethods', 'allocation', 'exceptions', 'io', 'leakSuspects', 'threadCpu'] as const) {
      empty[key] = { available: false };
    }
    empty.cpu = { available: false };
    empty.heap = { available: false };
    empty.threads = { available: false };
    const none = render(MetricsBlocks, { model: fromRecording(empty) });
    expect(none.querySelectorAll('.unavailable')).toHaveLength(11);

    const odd = clone(FIXTURES.recordingDashboard);
    odd.heap = { available: true };
    odd.io = { available: true, totals: { NOVO: { count: 1 } }, top: [{ type: 'NOVO', target: 't' }] } as unknown as typeof odd.io;
    odd.locks = { available: true, top: [{ type: 'NOVO', className: 'a.B' }] } as unknown as typeof odd.locks;
    odd.hotMethods = { available: true, top: [{}] };
    odd.allocation = { available: true, top: [{}] };
    odd.exceptions = { available: true, top: [{}] };
    odd.threadCpu = { available: true, top: [{}] };
    const oddEl = render(MetricsBlocks, { model: fromRecording(odd) });
    expect(text(oddEl.querySelector('#io'))).toContain('NOVO');
  });
});
