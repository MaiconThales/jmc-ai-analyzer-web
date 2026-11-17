import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '../../core/errors/api-error';
import { Remote } from './remote';

describe('Remote', () => {
  it('guarda dados, erro e estado de carregamento', () => {
    const remote = new Remote<number>(null);
    const source = new Subject<number>();
    remote.run(source);
    expect(remote.loading()).toBe(true);
    source.next(1);
    expect(remote.data()).toBe(1);
    expect(remote.loading()).toBe(false);

    remote.run(throwError(() => new ApiError(404, 'NOT_FOUND', 'x')));
    expect(remote.error()?.code).toBe('NOT_FOUND');
    expect(remote.data()).toBeNull();

    remote.run(throwError(() => new Error('rede')));
    expect(remote.error()?.code).toBe('NETWORK');
  });

  it('mantém os dados quando pedido e cancela a consulta anterior', () => {
    const remote = new Remote<number>(null);
    remote.run(of(5));
    const pending = new Subject<number>();
    remote.run(pending, true);
    expect(remote.data()).toBe(5);
    remote.run(of(6));
    pending.next(7);
    expect(remote.data()).toBe(6);
  });

  it('cancela ao destruir o contexto de injeção', () => {
    const callbacks: (() => void)[] = [];
    const destroyRef = { onDestroy: (fn: () => void) => callbacks.push(fn) } as unknown as DestroyRef;
    const remote = new Remote<number>(destroyRef);
    const source = new Subject<number>();
    remote.run(source);
    callbacks.forEach((fn) => fn());
    source.next(1);
    expect(remote.data()).toBeNull();
    expect(TestBed.runInInjectionContext(() => new Remote<number>())).toBeInstanceOf(Remote);
    expect(new Remote<number>()).toBeInstanceOf(Remote);
  });
});
