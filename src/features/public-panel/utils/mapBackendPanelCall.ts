import { PriorityLevel, TriageCall } from '@/types/patient';

export interface BackendPanelCall {
  id: number | string;
  pacienteId?: number | string;
  patientName?: string;
  ticketNumber?: string;
  type?: 'triage' | 'doctor' | string;
  destination?: string;
  consultorioId?: number | string | null;
  consultorioNumero?: number | string | null;
  priority?: PriorityLevel | string | null;
  createdAt?: string;
}

export function mapBackendPanelCall(call: BackendPanelCall, shouldAnnounce = false): TriageCall {
  const type = call.type === 'doctor' ? 'doctor' : 'triage';

  return {
    callId: String(call.id),
    ticketNumber: call.ticketNumber || '',
    patientName: call.patientName || '',
    type,
    room: mapRoom(call, type),
    priority: mapPriority(call.priority),
    timestamp: mapCreatedAt(call.createdAt),
    shouldAnnounce,
  };
}

function mapCreatedAt(createdAt: BackendPanelCall['createdAt']) {
  if (!createdAt) {
    return new Date();
  }

  const parsedDate = new Date(createdAt);

  if (Number.isFinite(parsedDate.getTime())) {
    return parsedDate;
  }

  return new Date(0);
}

function mapRoom(call: BackendPanelCall, type: TriageCall['type']) {
  if (type === 'triage') {
    return call.destination || 'Triagem';
  }

  if (call.consultorioNumero != null) {
    return String(call.consultorioNumero);
  }

  if (call.consultorioId != null) {
    return String(call.consultorioId);
  }

  return call.destination || undefined;
}

function mapPriority(priority: BackendPanelCall['priority']): PriorityLevel | undefined {
  if (
    priority === 'red' ||
    priority === 'orange' ||
    priority === 'yellow' ||
    priority === 'green' ||
    priority === 'blue'
  ) {
    return priority;
  }

  return undefined;
}
