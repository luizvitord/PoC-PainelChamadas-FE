export type PriorityLevel = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

// Datas já convertidas para Date em mapBackendPatient; null quando o back não registrou o momento.
export interface Patient {
  id: string;
  chegadaAt: Date | null;
  ticketNumber: string;
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
  ticketNumber: string;
  patientName?: string;
  type: 'triage' | 'doctor';
  room?: string;
  priority?: PriorityLevel;
  timestamp: Date;
  shouldAnnounce?: boolean;
}

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; waitTime: string; order: number }> = {
  red: { label: 'Vermelho', waitTime: '0 min', order: 1 },
  orange: { label: 'Laranja', waitTime: '10 min', order: 2 },
  yellow: { label: 'Amarelo', waitTime: '60 min', order: 3 },
  green: { label: 'Verde', waitTime: '120 min', order: 4 },
  blue: { label: 'Azul', waitTime: '240 min', order: 5 },
};
