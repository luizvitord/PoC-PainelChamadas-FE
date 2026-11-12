import { AttendanceType } from '@/lib/attendanceTypes';
import { PRIORITY_CONFIG, PriorityLevel } from '@/types/patient';
import { ProtocoloTempo } from '@/types/protocolo';

// Cores que o protocolo aceita para o tipo de atendimento, da mais urgente para a menos urgente.
export function getAvailablePriorities(protocolos: ProtocoloTempo[], attendance: AttendanceType): PriorityLevel[] {
  return protocolos
    .filter((protocolo) => protocolo.attendanceType === attendance)
    .map((protocolo) => protocolo.priority)
    .sort((a, b) => PRIORITY_CONFIG[a].order - PRIORITY_CONFIG[b].order);
}

// Tempo máximo de espera do protocolo para a cor e o tipo; null quando a combinação não existe.
export function getWaitTimeMinutes(
  protocolos: ProtocoloTempo[],
  priority: PriorityLevel,
  attendance: AttendanceType,
): number | null {
  return (
    protocolos.find((protocolo) => protocolo.priority === priority && protocolo.attendanceType === attendance)
      ?.tempoMaximoMinutos ?? null
  );
}
