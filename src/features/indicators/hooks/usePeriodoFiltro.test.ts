import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePeriodoFiltro } from './usePeriodoFiltro';

describe('usePeriodoFiltro', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    // 23:30 local: em UTC (-03:00) já seria o dia seguinte
    vi.setSystemTime(new Date(2026, 9, 22, 23, 30, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('começa com início e fim em hoje (data local)', () => {
    const { result } = renderHook(() => usePeriodoFiltro());

    expect(result.current.dataInicio).toBe('2026-10-22');
    expect(result.current.dataFim).toBe('2026-10-22');
    expect(result.current.erro).toBeUndefined();
    expect(result.current.periodo).toEqual({
      inicio: '2026-10-22T00:00:00',
      fim: '2026-10-22T23:59:59.999999999',
    });
  });

  it('converte as datas escolhidas para o período do back', () => {
    const { result } = renderHook(() => usePeriodoFiltro());

    act(() => result.current.alterarInicio('2026-09-01'));
    act(() => result.current.alterarFim('2026-09-03'));

    expect(result.current.erro).toBeUndefined();
    expect(result.current.periodo).toEqual({
      inicio: '2026-09-01T00:00:00',
      fim: '2026-09-03T23:59:59.999999999',
    });
  });

  it('aceita início e fim no mesmo dia', () => {
    const { result } = renderHook(() => usePeriodoFiltro());

    act(() => result.current.alterarInicio('2026-09-03'));
    act(() => result.current.alterarFim('2026-09-03'));

    expect(result.current.erro).toBeUndefined();
    expect(result.current.periodo).toEqual({
      inicio: '2026-09-03T00:00:00',
      fim: '2026-09-03T23:59:59.999999999',
    });
  });

  it('mostra erro e mantém o último período válido quando o início passa do fim', () => {
    const { result } = renderHook(() => usePeriodoFiltro());
    act(() => result.current.alterarInicio('2026-09-01'));
    act(() => result.current.alterarFim('2026-09-03'));

    act(() => result.current.alterarInicio('2026-09-04'));

    expect(result.current.dataInicio).toBe('2026-09-04');
    expect(result.current.erro).toBe('A data de início não pode ser posterior à data de fim.');
    expect(result.current.periodo).toEqual({
      inicio: '2026-09-01T00:00:00',
      fim: '2026-09-03T23:59:59.999999999',
    });
  });

  it('mostra erro e mantém o último período válido quando uma data é apagada', () => {
    const { result } = renderHook(() => usePeriodoFiltro());

    act(() => result.current.alterarFim(''));

    expect(result.current.erro).toBe('Informe as duas datas.');
    expect(result.current.periodo).toEqual({
      inicio: '2026-10-22T00:00:00',
      fim: '2026-10-22T23:59:59.999999999',
    });
  });

  it('volta a repassar o período quando a data é corrigida', () => {
    const { result } = renderHook(() => usePeriodoFiltro());
    act(() => result.current.alterarInicio('2026-10-25'));

    act(() => result.current.alterarFim('2026-10-26'));

    expect(result.current.erro).toBeUndefined();
    expect(result.current.periodo).toEqual({
      inicio: '2026-10-25T00:00:00',
      fim: '2026-10-26T23:59:59.999999999',
    });
  });

  it('limpar volta início e fim para hoje', () => {
    const { result } = renderHook(() => usePeriodoFiltro());
    act(() => result.current.alterarInicio('2026-09-04'));
    act(() => result.current.alterarFim('2026-09-01'));

    act(() => result.current.limpar());

    expect(result.current.dataInicio).toBe('2026-10-22');
    expect(result.current.dataFim).toBe('2026-10-22');
    expect(result.current.erro).toBeUndefined();
    expect(result.current.periodo).toEqual({
      inicio: '2026-10-22T00:00:00',
      fim: '2026-10-22T23:59:59.999999999',
    });
  });
});
