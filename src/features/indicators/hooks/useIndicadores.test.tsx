import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useIndicadores } from './useIndicadores';
import samu from '../mocks/samu.json';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('consulta SAMU sem configuração extra e devolve sua resposta exclusiva', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(samu)));
  vi.stubGlobal('fetch', fetchMock);
  const client = new QueryClient();
  const { result } = renderHook(() => useIndicadores({ inicio: '2026-09-01T00:00:00', fim: '2026-09-03T23:59:59', escopo: 'SAMU' }), {
    wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('escopo')).toBe('SAMU');
  expect(result.current.data).toEqual(samu);
  client.clear();
});
