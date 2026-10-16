import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IndicadoresResultados } from './IndicadoresResultados';
import { IndicatorsFeature } from '../IndicatorsFeature';
import { fireEvent } from '@testing-library/react';
import { useIndicadores } from '../hooks/useIndicadores';
import { renderHook } from '@testing-library/react';
import type { IndicadoresResponse } from '../types';
import real from '../mocks/backend-atual-geral-inclui-samu.json';

vi.mock('../constants', async importOriginal => ({
  ...await importOriginal<typeof import('../constants')>(), ESCOPOS_SUPORTADOS: true,
}));
// Fixture sintética de aceite UI, NÃO uma resposta real nem o mock por escopo.
const geral: IndicadoresResponse = { ...real, porRiscoETipo: [], cadastrados: 19, classificados: 17,
  atendidos: 14, percentualClassificados: 89.47, percentualAtendidos: 73.68,
  contagensPorRisco: { ...real.contagensPorRisco, LARANJA: 5 } };
const vazio: IndicadoresResponse = { ...geral, cadastrados: 0, classificados: 0, atendidos: 0,
  percentualClassificados: 0, percentualAtendidos: 0 };
const filtros = { inicio: '2026-09-01T00:00:00', fim: '2026-09-03T23:59:59', escopo: 'GERAL' as const };
const resposta = (data = geral) => new Response(JSON.stringify(data), { status: 200 });
let client: QueryClient;
let fetchMock: ReturnType<typeof vi.fn>;
function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  fetchMock = vi.fn().mockResolvedValue(resposta());
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { cleanup(); client.clear(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('Indicadores', () => {
  it('envia datas sem UTC, começa em GERAL e usa o contrato real', async () => {
    fetchMock.mockResolvedValue(resposta(real as IndicadoresResponse));
    const { result } = renderHook(() => useIndicadores({ inicio: filtros.inicio, fim: filtros.fim }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('inicio')).toBe(filtros.inicio);
    expect(url.searchParams.get('fim')).toBe(filtros.fim);
    expect(url.searchParams.get('escopo')).toBe('GERAL');
    expect(result.current.data).toEqual(real);
  });
  it('mostra skeleton e os cards com os números da task sem recalcular', async () => {
    render(<IndicadoresResultados {...filtros} />, { wrapper });
    expect(screen.getByRole('status', { name: 'Carregando indicadores' })).toBeInTheDocument();
    await screen.findByText('19');
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('89,47% dos cadastrados')).toBeInTheDocument();
    expect(screen.getByText('73,68% dos cadastrados')).toBeInTheDocument();
    expect(within(screen.getByText('Laranja').parentElement!).getByText('5')).toBeInTheDocument();
    for (const cor of ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul']) expect(screen.getByText(cor)).toBeInTheDocument();
    expect(screen.queryByText(/desistências/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Última atualização:/).textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
  });
  it('mostra vazio sem cards', async () => {
    fetchMock.mockResolvedValue(resposta(vazio));
    render(<IndicadoresResultados {...filtros} />, { wrapper });
    await screen.findByText('Sem dados no período');
    expect(screen.queryByText('Cadastrados')).not.toBeInTheDocument();
  });
  it.each([400, 500])('mostra erro HTTP %s', async status => {
    fetchMock.mockResolvedValue(new Response('{}', { status }));
    render(<IndicadoresResultados {...filtros} />, { wrapper });
    expect(await screen.findByRole('alert')).toHaveTextContent(status === 400 ? 'Período inválido' : 'Não foi possível carregar');
  });
  it('back fora do ar oculta dados anteriores e permite tentar de novo', async () => {
    render(<IndicadoresResultados {...filtros} />, { wrapper });
    await screen.findByText('19');
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await act(async () => { await client.invalidateQueries({ queryKey: ['indicadores'] }); });
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar');
    expect(screen.queryByText('19')).not.toBeInTheDocument();
    fetchMock.mockResolvedValue(resposta());
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByText('19');
  });
  it('troca período e escopo sem exibir dados antigos, inclusive cache ao voltar', async () => {
    const view = render(<IndicadoresResultados {...filtros} />, { wrapper });
    await screen.findByText('19');
    let resolve!: (r: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>(r => { resolve = r; }));
    view.rerender(<IndicadoresResultados {...filtros} escopo="SAMU" />);
    expect(screen.getByRole('status', { name: 'Carregando indicadores' })).toBeInTheDocument();
    expect(screen.queryByText('19')).not.toBeInTheDocument();
    expect(new URL(fetchMock.mock.calls.at(-1)![0]).searchParams.get('escopo')).toBe('SAMU');
    await act(async () => resolve(resposta({ ...geral, cadastrados: 2 })));
    await waitFor(() => expect(within(screen.getByText('Cadastrados').parentElement!).getByText('2')).toBeInTheDocument());
    view.rerender(<IndicadoresResultados {...filtros} />);
    expect(screen.queryByText('19')).not.toBeInTheDocument();
    expect(screen.queryAllByText('2')).toHaveLength(0);
    expect(screen.getByRole('status', { name: 'Carregando indicadores' })).toBeInTheDocument();
    view.rerender(<IndicadoresResultados {...filtros} inicio="2026-09-02T00:00:00" />);
    expect(screen.getByRole('status', { name: 'Carregando indicadores' })).toBeInTheDocument();
  });
  it('consulta novamente no intervalo de 30 segundos', async () => {
    vi.useFakeTimers();
    renderHook(() => useIndicadores(filtros), { wrapper });
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('filtros iniciam em Geral e rejeitam período invertido sem dados antigos', async () => {
    render(<IndicatorsFeature />, { wrapper });
    expect(screen.getByLabelText('Visão')).toHaveValue('GERAL');
    await screen.findByText('19');
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2099-09-01' } });
    expect(screen.getByRole('alert')).toHaveTextContent('A data inicial');
    expect(screen.queryByText('19')).not.toBeInTheDocument();
  });
});
