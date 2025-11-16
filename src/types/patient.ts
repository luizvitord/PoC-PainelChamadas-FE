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
  attendanceType?: 'clinical' | 'psychiatric';
  triageNotes?: string;
  assignedRoom?: string;
}

export interface TriageCall {
  ticketNumber: string;
  patientName?: string;
  type: 'triage' | 'doctor';
  room?: string;
  priority?: PriorityLevel;
  timestamp: Date;
}

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; waitTime: string; order: number }> = {
  red: { label: 'Immediate', waitTime: '0 min', order: 1 },
  orange: { label: 'Very Urgent', waitTime: '10 min', order: 2 },
  yellow: { label: 'Urgent', waitTime: '60 min', order: 3 },
  green: { label: 'Standard', waitTime: '120 min', order: 4 },
  blue: { label: 'Non-Urgent', waitTime: '240 min', order: 5 },
};
