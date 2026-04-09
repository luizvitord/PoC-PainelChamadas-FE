import { TriageCall } from '@/types/patient';

import { PublicPanelCallViewModel } from '../types';
import { abbreviatePatientName } from './abbreviatePatientName';
import { buildCurrentDestinationLabel } from './buildCurrentDestinationLabel';
import { buildRecentDestinationLabel } from './buildRecentDestinationLabel';
import { buildSpeechText } from './buildSpeechText';

export function mapCallToViewModel(call: TriageCall): PublicPanelCallViewModel {
  const patientName = (call.patientName ?? '').trim();

  return {
    callId: call.callId,
    patientName,
    displayName: abbreviatePatientName(patientName).toUpperCase(),
    currentDestinationLabel: buildCurrentDestinationLabel(call),
    recentDestinationLabel: buildRecentDestinationLabel(call),
    speechText: buildSpeechText(call),
    type: call.type,
  };
}
