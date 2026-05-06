export type PriorityLevel = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

export interface Patient {
  id: string;
  ticketNumber: string;
  fullName: string;
  dateOfBirth: string;
  cpf: string;
  registeredAt: Date;
  classifiedAt?: Date | null;
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
}

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; waitTime: string; order: number }> = {
  red: { label: 'Vermelho', waitTime: '0 min', order: 1 },
  orange: { label: 'Laranja', waitTime: '10 min', order: 2 },
  yellow: { label: 'Amarelo', waitTime: '60 min', order: 3 },
  green: { label: 'Verde', waitTime: '120 min', order: 4 },
  blue: { label: 'Azul', waitTime: '240 min', order: 5 },
};
