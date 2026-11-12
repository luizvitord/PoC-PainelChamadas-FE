import { AttendanceType } from '@/lib/attendanceTypes';
import { AttendanceTypeBackend } from '@/lib/utils/backendMaps';

// Inverso de AttendanceTypeBackend (CLINICO → clinical …).
const ATENDIMENTO_POR_TIPO = Object.fromEntries(
  Object.entries(AttendanceTypeBackend).map(([atendimento, tipo]) => [tipo, atendimento]),
) as Record<string, AttendanceType>;

/** Tipo do back → tipo de atendimento do front; valor fora do mapa vira null. */
export function tipoParaAtendimento(tipo: string): AttendanceType | null {
  return Object.prototype.hasOwnProperty.call(ATENDIMENTO_POR_TIPO, tipo) ? ATENDIMENTO_POR_TIPO[tipo] : null;
}
