import { TriageCall } from '@/types/patient';

import { formatRoomForSpeech } from './formatRoomForSpeech';
import { normalizeSpeechText } from './normalizeSpeechText';

export function buildSpeechText(call: Pick<TriageCall, 'patientName' | 'type' | 'room'>) {
  const patientName = (call.patientName ?? '').trim();

  if (call.type === 'triage') {
    return normalizeSpeechText(`${patientName}. Favor comparecer ao acolhimento.`);
  }

  return normalizeSpeechText(`${patientName}. Favor comparecer ao ${formatRoomForSpeech(call.room)}.`);
}
