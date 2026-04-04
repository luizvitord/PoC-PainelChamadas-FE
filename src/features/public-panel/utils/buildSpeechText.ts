import { TriageCall } from '@/types/patient';

export function buildSpeechText(call: Pick<TriageCall, 'patientName' | 'type' | 'room'>) {
  const patientName = (call.patientName ?? '').trim();

  if (call.type === 'triage') {
    return `${patientName}, favor comparecer ao acolhimento`;
  }

  return `${patientName}, favor comparecer ao consultório ${call.room ?? ''}`;
}
