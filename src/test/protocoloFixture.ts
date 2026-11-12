import { ProtocoloTempo } from '@/types/protocolo';

// Os 8 tempos do protocolo padrão (os mesmos que o back cadastra), no vocabulário do front.
export const PROTOCOLO_PADRAO: ProtocoloTempo[] = [
  { priority: 'red', attendanceType: 'clinical', tempoMaximoMinutos: 0 },
  { priority: 'orange', attendanceType: 'clinical', tempoMaximoMinutos: 10 },
  { priority: 'red', attendanceType: 'psychiatric', tempoMaximoMinutos: 0 },
  { priority: 'orange', attendanceType: 'psychiatric', tempoMaximoMinutos: 10 },
  { priority: 'yellow', attendanceType: 'psychiatric', tempoMaximoMinutos: 60 },
  { priority: 'green', attendanceType: 'psychiatric', tempoMaximoMinutos: 120 },
  { priority: 'blue', attendanceType: 'psychiatric', tempoMaximoMinutos: 240 },
  { priority: 'orange', attendanceType: 'samu', tempoMaximoMinutos: 10 },
];
