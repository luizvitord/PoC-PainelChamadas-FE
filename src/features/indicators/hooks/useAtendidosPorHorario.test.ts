import { afterEach, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/lib/appConfig';

import { BackendAtendidoPorHorario, getAtendidosPorHorario, mapBackendAtendidos } from './useAtendidosPorHorario';

const PERIODO = { inicio: '2026-09-01T00:00:00', fim: '2026-09-03T23:59:59.999999999' };

const VERMELHO_CLINICO: BackendAtendidoPorHorario = {
  pacienteId: 1,
  risco: 'VERMELHO',
  tipo: 'CLINICO',
  chamadaConsultorioAt: '2026-09-01T08:05:00',
  rechamadas: [{ tipo: 'TRIAGEM', criadaEm: '2026-09-01T08:03:00' }],
};

describe('useAtendidosPorHorario', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('traduz risco e tipo do back para o vocabulário do front', () => {
    expect(mapBackendAtendidos([VERMELHO_CLINICO])).toEqual([
      {
        pacienteId: 1,
        prioridade: 'red',
        atendimento: 'clinical',
        chamadaConsultorioAt: '2026-09-01T08:05:00',
        rechamadas: [{ tipo: 'TRIAGEM', criadaEm: '2026-09-01T08:03:00' }],
      },
    ]);
  });

  it('risco ou tipo ausentes viram null', () => {
    const [atendido] = mapBackendAtendidos([{ ...VERMELHO_CLINICO, risco: 'NAO_CLASSIFICADO', tipo: null }]);
    expect(atendido.prioridade).toBeNull();
    expect(atendido.atendimento).toBeNull();
  });

  it('busca o endpoint do BE-03 com período e escopo', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [VERMELHO_CLINICO] });
    vi.stubGlobal('fetch', fetchMock);

    const atendidos = await getAtendidosPorHorario(PERIODO, 'SAMU');

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(`${url.origin}${url.pathname}`).toBe(`${API_BASE_URL}/indicadores/atendidos`);
    expect(Object.fromEntries(url.searchParams)).toEqual({ ...PERIODO, escopo: 'SAMU' });
    expect(atendidos).toHaveLength(1);
  });

  it('falha com o status HTTP quando o back recusa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400 }));

    await expect(getAtendidosPorHorario(PERIODO, 'GERAL')).rejects.toThrow('HTTP 400');
  });
});
