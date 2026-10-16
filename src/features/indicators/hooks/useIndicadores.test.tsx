import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useIndicadores } from './useIndicadores';
vi.mock('../constants', async original => ({ ...await original<typeof import('../constants')>(), ESCOPOS_SUPORTADOS: false }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('não apresenta dados combinados como SAMU enquanto backend não suporta escopo', async () => {
  const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
  const client = new QueryClient();
  const { result } = renderHook(() => useIndicadores({ inicio: '2026-09-01T00:00:00', fim: '2026-09-03T23:59:59', escopo: 'SAMU' }), {
    wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.error?.message).toContain('aguarda suporte');
  expect(fetchMock).not.toHaveBeenCalled();
  client.clear();
});
