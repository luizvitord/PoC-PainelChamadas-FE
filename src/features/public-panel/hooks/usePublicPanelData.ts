import { usePatients } from '@/contexts/PatientContext';

import { PANEL_RECENT_CALLS_LIMIT } from '../constants';
import { PublicPanelViewModel } from '../types';
import { mapCallToViewModel } from '../utils/mapCallToViewModel';

export function usePublicPanelData(): PublicPanelViewModel {
  const { recentCalls } = usePatients();

  return {
    currentCall: recentCalls[0] ? mapCallToViewModel(recentCalls[0]) : null,
    previousCalls: recentCalls.slice(1, PANEL_RECENT_CALLS_LIMIT + 1).map(mapCallToViewModel),
  };
}
