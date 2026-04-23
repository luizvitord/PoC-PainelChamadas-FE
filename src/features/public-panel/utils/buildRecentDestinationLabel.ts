import { TriageCall } from '@/types/patient';

export function buildRecentDestinationLabel(call: Pick<TriageCall, 'type' | 'room'>) {
  if (call.type === 'triage') {
    return 'Acolhimento';
  }

  const room = (call.room ?? '').trim();

  return room ? room.toUpperCase() : 'Consultório';
}
