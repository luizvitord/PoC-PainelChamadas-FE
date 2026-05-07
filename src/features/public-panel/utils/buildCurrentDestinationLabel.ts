import { TriageCall } from '@/types/patient';

export function buildCurrentDestinationLabel(call: Pick<TriageCall, 'type' | 'room'>) {
  if (call.type === 'triage') {
    return 'ACOLHIMENTO';
  }

  const room = (call.room ?? '').trim();

  return room ? `CONSULTÓRIO ${room.toUpperCase()}` : 'CONSULTÓRIO';
}
