import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { useIndicadores } from './useIndicadores';
import real from '../mocks/backend-atual-geral-inclui-samu.json';

// Somente leitura. Execute contra backend isolado com o seed, nunca cria/limpa banco.
import { transferableAbortController } from 'node:util';
// O fetch nativo do Node exige AbortSignal nativo, não o do JSDOM.
beforeAll(() => vi.stubGlobal('AbortController', class { constructor() { return transferableAbortController(); } }));
afterAll(() => vi.unstubAllGlobals());
const client = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) =>
  <QueryClientProvider client={client}>{children}</QueryClientProvider>;
afterEach(() => { cleanup(); client.clear(); });
describe.skipIf(process.env.INDICADORES_LIVE !== 'true')('backend real atual (sem filtro de escopo)', () => {
  it('hook lê a resposta real do seed', async () => {
    const { result } = renderHook(() => useIndicadores({ inicio: '2026-09-01T00:00:00', fim: '2026-09-03T23:59:59' }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(real);
  });
  it('período sem pacientes retorna zero', async () => {
    const { result } = renderHook(() => useIndicadores({ inicio: '2000-01-01T00:00:00', fim: '2000-01-01T23:59:59' }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.cadastrados).toBe(0);
  });
  it('backend retorna 400 para datas malformadas', async () => {
    const { result } = renderHook(() => useIndicadores({ inicio: '0000-invalido', fim: '2026-09-03T23:59:59' }), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('Período inválido');
  });
});
describe.skipIf(process.env.INDICADORES_OFFLINE !== 'true')('backend desligado', () => {
  it('hook apresenta falha de conexão real', async () => {
    const { result } = renderHook(() => useIndicadores({ inicio: '2026-09-01T00:00:00', fim: '2026-09-03T23:59:59' }), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('Não foi possível conectar');
  });
});
