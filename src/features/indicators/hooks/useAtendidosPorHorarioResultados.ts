import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/appConfig';
import { INDICADORES_REFETCH_INTERVAL } from '../constants';
import type { Escopo, Risco, TipoAtendimento } from '../types';

export interface PacienteAtendido {
  id: number;
  nome: string;
  risco: Risco | null;
  tipo: TipoAtendimento | null;
  chegadaAt: string;
  chamadaConsultorioAt: string;
  rechamadasConsultorioCount: number;
}

interface PacienteBackend extends Partial<PacienteAtendido> {
  status?: string;
}

export function useAtendidosPorHorario(inicio: string, fim: string, escopo: Escopo, enabled: boolean) {
  return useQuery<PacienteAtendido[], Error>({
    queryKey: ['atendidos-por-horario', inicio, fim, escopo],
    enabled,
    queryFn: async ({ signal }) => {
      const response = await fetch(`${API_BASE_URL}/pacientes`, { signal });
      if (!response.ok) throw new Error('Não foi possível carregar os pacientes atendidos.');
      const payload = await response.json();
      const pacientes = Array.isArray(payload) ? payload as PacienteBackend[] : [];
      return pacientes.filter((paciente): paciente is PacienteAtendido => {
        if (!paciente.id || !paciente.nome || !paciente.chegadaAt || !paciente.chamadaConsultorioAt) return false;
        const noPeriodo = paciente.chegadaAt >= inicio && paciente.chegadaAt <= fim;
        const noEscopo = escopo === 'SAMU' ? paciente.tipo === 'SAMU' : paciente.tipo !== 'SAMU';
        return noPeriodo && noEscopo;
      }).map(paciente => ({ ...paciente, rechamadasConsultorioCount: paciente.rechamadasConsultorioCount ?? 0 }));
    },
    refetchInterval: INDICADORES_REFETCH_INTERVAL,
    retry: false,
  });
}
