import { AttendanceType } from '@/lib/attendanceTypes';
import { PriorityLevel } from '@/types/patient';

// Combinação válida do protocolo de Manchester (GET /protocolos), já no vocabulário do front.
export interface ProtocoloTempo {
  priority: PriorityLevel;
  attendanceType: AttendanceType;
  tempoMaximoMinutos: number;
}
