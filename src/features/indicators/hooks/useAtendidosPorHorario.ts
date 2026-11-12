import { useQuery } from '@tanstack/react-query';

import { AttendanceType } from '@/lib/attendanceTypes';
import { API_BASE_URL } from '@/lib/appConfig';
import { riscoParaPrioridade } from '@/lib/utils/riscoParaPrioridade';
import { tipoParaAtendimento } from '@/lib/utils/tipoParaAtendimento';
import { PriorityLevel } from '@/types/patient';

import { Escopo } from '../utils/escopo';
import type { Periodo } from './usePeriodoFiltro';

export type TipoChamada = 'TRIAGEM' | 'CONSULTORIO';

/** Espelha AtendidoPorHorarioResponse (BE-03); sem nome: o paciente já foi anonimizado ao ser atendido. */
export interface BackendAtendidoPorHorario {
  pacienteId: number;
  risco: string | null;
  tipo: string | null;
  chamadaConsultorioAt: string | null;
  rechamadas: { tipo: TipoChamada; criadaEm: string }[];
}

/** Atendido no vocabulário do front; datas continuam LocalDateTime (sem fuso). */
export interface AtendidoPorHorario {
  pacienteId: number;
  prioridade: PriorityLevel | null;
  atendimento: AttendanceType | null;
  chamadaConsultorioAt: string | null;
  rechamadas: { tipo: TipoChamada; criadaEm: string }[];
}

export function mapBackendAtendidos(atendidos: BackendAtendidoPorHorario[]): AtendidoPorHorario[] {
  return atendidos.map(({ pacienteId, risco, tipo, chamadaConsultorioAt, rechamadas }) => ({
    pacienteId,
    prioridade: risco ? riscoParaPrioridade(risco) : null,
    atendimento: tipo ? tipoParaAtendimento(tipo) : null,
    chamadaConsultorioAt,
    rechamadas: rechamadas ?? [],
  }));
}

export async function getAtendidosPorHorario({ inicio, fim }: Periodo, escopo: Escopo, signal?: AbortSignal) {
  const params = new URLSearchParams({ inicio, fim, escopo });
  const response = await fetch(`${API_BASE_URL}/indicadores/atendidos?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Falha ao carregar os atendidos (HTTP ${response.status})`);
  }

  return mapBackendAtendidos(await response.json());
}

// Mesmo período e escopo dos demais indicadores; só busca com a página desbloqueada.
export function useAtendidosPorHorario(periodo: Periodo, escopo: Escopo, enabled: boolean) {
  return useQuery({
    queryKey: ['indicadores', 'atendidos', periodo.inicio, periodo.fim, escopo],
    queryFn: ({ signal }) => getAtendidosPorHorario(periodo, escopo, signal),
    enabled,
  });
}
