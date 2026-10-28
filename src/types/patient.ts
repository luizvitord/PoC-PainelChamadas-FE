export type PriorityLevel = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

// Datas já convertidas para Date em mapBackendPatient; null quando o back não registrou o momento.
export interface Patient {
  id: string;
  chegadaAt: Date | null;
  fullName: string;
  dateOfBirth?: string;
  cpf: string;
  classifiedAt?: Date | null;
  chamadaTriagemAt?: Date | null;
  chamadaConsultorioAt?: Date | null;
  atendimentoFinalizadoAt?: Date | null;
  prazoAtendimentoAt?: Date | null;
  status: 'waiting-triage' | 'in-triage' | 'waiting-doctor' | 'in-consultation' | 'completed';
  priority?: PriorityLevel;
  attendanceType?: 'clinical' | 'psychiatric' | 'samu';
  triageNotes?: string;
  assignedRoom?: string;
}

export interface TriageCall {
  callId: string;
  patientName?: string;
  type: 'triage' | 'doctor';
  room?: string;
  priority?: PriorityLevel;
  timestamp: Date;
  shouldAnnounce?: boolean;
}

// Só apresentação; o tempo máximo de cada cor por tipo vem do protocolo (GET /protocolos).
export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; order: number }> = {
  red: { label: 'Vermelho', order: 1 },
  orange: { label: 'Laranja', order: 2 },
  yellow: { label: 'Amarelo', order: 3 },
  green: { label: 'Verde', order: 4 },
  blue: { label: 'Azul', order: 5 },
};
