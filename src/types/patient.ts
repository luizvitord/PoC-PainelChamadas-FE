export type PriorityLevel = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

export interface Patient {
  id: string;
  ticketNumber: string;
  fullName: string;
  dateOfBirth: string;
  cpf: string;
  registeredAt: Date;
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
  red: { label: 'Emergência', waitTime: '0 min', order: 1 },
  orange: { label: 'Muito Urgente', waitTime: '10 min', order: 2 },
  yellow: { label: 'Urgente', waitTime: '60 min', order: 3 },
  green: { label: 'Pouco Urgente', waitTime: '120 min', order: 4 },
  blue: { label: 'Não Urgente', waitTime: '240 min', order: 5 },
};
