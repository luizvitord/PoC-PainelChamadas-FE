import { TriageCall } from '@/types/patient';

export interface PublicPanelCallViewModel {
  callId: string;
  patientName: string;
  displayName: string;
  currentDestinationLabel: string;
  recentDestinationLabel: string;
  speechText: string;
  type: TriageCall['type'];
}

export interface PublicPanelViewModel {
  currentCall: PublicPanelCallViewModel | null;
  previousCalls: PublicPanelCallViewModel[];
}
