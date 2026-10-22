import { PriorityBackend } from '@/lib/utils/backendMaps';
import { PriorityLevel } from '@/types/patient';

// Inverso de PriorityBackend (VERMELHO → red …): label e ordem saem do PRIORITY_CONFIG pela cor.
const PRIORIDADE_POR_RISCO = Object.fromEntries(
  Object.entries(PriorityBackend).map(([prioridade, risco]) => [risco, prioridade]),
) as Record<string, PriorityLevel>;

/** Risco do back → cor do front; NAO_CLASSIFICADO (ou qualquer valor fora do mapa) vira null. */
export function riscoParaPrioridade(risco: string): PriorityLevel | null {
  return Object.prototype.hasOwnProperty.call(PRIORIDADE_POR_RISCO, risco) ? PRIORIDADE_POR_RISCO[risco] : null;
}
