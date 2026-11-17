import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CONTENT_ID } from '../../../core/layout/content-scroller';
import { FIXTURES } from '../../../../testing/fixtures';
import { text } from '../../../../testing/test-helpers';
import { DashboardSummary } from './dashboard-summary';
import { DiagnosisList } from './diagnosis-list';
import { SectionNav } from './section-nav';

describe('navegação do dashboard', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('filtra o diagnóstico por prioridade', () => {
    const fixture = TestBed.createComponent(DiagnosisList);
    fixture.componentRef.setInput('items', [
      { priority: 'ALTA', title: 'a' },
      { priority: 'MEDIA', title: 'm1' },
      { priority: 'MEDIA', title: 'm2' },
      { title: 'sem prioridade' },
    ]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('.filter button'));
    expect(buttons.map((b) => text(b))).toEqual(['Todas 4', 'ALTA 1', 'MÉDIA 2', 'BAIXA 0']);
    expect(buttons[3].disabled).toBe(true);
    expect(el.querySelectorAll('article')).toHaveLength(4);
    buttons[2].click();
    fixture.detectChanges();
    expect(el.querySelectorAll('article')).toHaveLength(2);
    expect(buttons[2].getAttribute('aria-pressed')).toBe('true');
    buttons[0].click();
    fixture.detectChanges();
    expect(el.querySelectorAll('article')).toHaveLength(4);
  });

  it('resumo mostra saúde, contagem por prioridade e fatos', () => {
    const fixture = TestBed.createComponent(DashboardSummary);
    fixture.componentRef.setInput('healthScore', 62);
    fixture.componentRef.setInput('diagnosis', FIXTURES.recordingDashboard.diagnosis);
    fixture.componentRef.setInput('facts', [{ label: 'Duração', value: '5 min', sub: '21' }, { label: 'Eventos', value: '10' }]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.kpi.health.atencao')).not.toBeNull();
    expect(text(el)).toContain('Prioridade alta');
    expect(text(el)).toContain('Duração5 min21');
    expect(el.querySelector('a.kpi')?.getAttribute('href')).toBe('/#diagnosis');
    fixture.componentRef.setInput('healthScore', null);
    fixture.componentRef.setInput('diagnosis', []);
    fixture.detectChanges();
    expect(el.querySelector('.kpi.health.neutral')).not.toBeNull();
    expect(text(el)).toContain('nada urgente');
  });

  it('barra de seções marca a seção que passou do topo da área de conteúdo', async () => {
    const container = document.createElement('main');
    container.id = CONTENT_ID;
    const sections = ['diagnosis', 'cpu'].map((id) => {
      const el = document.createElement('section');
      el.id = id;
      container.appendChild(el);
      return el;
    });
    document.body.appendChild(container);
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);
    const tops = { diagnosis: 500, cpu: 900 };
    sections.forEach((s) =>
      vi.spyOn(s, 'getBoundingClientRect').mockImplementation(() => ({ top: tops[s.id as keyof typeof tops] }) as DOMRect),
    );

    const fixture = TestBed.createComponent(SectionNav);
    fixture.componentRef.setInput('sections', [
      { id: 'diagnosis', label: 'O que arrumar' },
      { id: 'cpu', label: 'CPU' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      container.dispatchEvent(new Event('scroll'));
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      fixture.detectChanges();
    };
    await settle();
    expect(el.querySelector('a.active')).toBeNull();

    tops.diagnosis = -300;
    tops.cpu = 40;
    await settle();
    expect(text(el.querySelector('a.active'))).toBe('CPU');
    expect(el.querySelector('a.active')?.getAttribute('aria-current')).toBe('location');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/#diagnosis');

    fixture.destroy();
    container.remove();
  });

  it('barra de seções não faz nada sem a área de conteúdo', async () => {
    const fixture = TestBed.createComponent(SectionNav);
    fixture.componentRef.setInput('sections', [{ id: 'cpu', label: 'CPU' }]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('a.active')).toBeNull();
  });
});
