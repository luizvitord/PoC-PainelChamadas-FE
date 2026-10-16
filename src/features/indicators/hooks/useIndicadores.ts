import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/appConfig';
import { ESCOPOS_SUPORTADOS, INDICADORES_REFETCH_INTERVAL } from '../constants';
import type { FiltrosIndicadores, IndicadoresResponse } from '../types';

export class IndicadoresError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

export function useIndicadores({ inicio, fim, escopo = 'GERAL' }: FiltrosIndicadores) {
  return useQuery<IndicadoresResponse, Error>({
    queryKey: ['indicadores', inicio, fim, escopo],
    queryFn: async ({ signal }) => {
      if (escopo === 'SAMU' && !ESCOPOS_SUPORTADOS) {
        throw new IndicadoresError('A visão SAMU aguarda suporte do backend.');
      }
      if (!inicio || !fim || inicio > fim) throw new IndicadoresError('Informe um período válido.', 400);
      const params = new URLSearchParams({ inicio, fim, escopo });
      let response: Response;
      try {
        response = await fetch(`${API_BASE_URL}/indicadores?${params}`, { signal });
      } catch (error) {
        if (signal.aborted) throw error;
        throw new IndicadoresError('Não foi possível conectar ao servidor. Tente novamente.');
      }
      if (!response.ok) {
        throw new IndicadoresError(response.status === 400
          ? 'Período inválido. Confira as datas informadas.'
          : 'Não foi possível carregar os indicadores. Tente novamente.', response.status);
      }
      return response.json();
    },
    refetchInterval: INDICADORES_REFETCH_INTERVAL,
    refetchOnMount: 'always',
    staleTime: 0,
    retry: false,
    placeholderData: undefined,
  });
}
