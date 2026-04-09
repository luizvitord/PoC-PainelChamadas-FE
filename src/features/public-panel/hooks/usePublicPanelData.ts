import { usePatients } from '@/contexts/PatientContext';

import { PublicPanelDataModel } from '../types';
import { mapCallToViewModel } from '../utils/mapCallToViewModel';

export function usePublicPanelData(): PublicPanelDataModel {
  const { recentCalls } = usePatients();

  return {
    recentCalls: recentCalls.map(mapCallToViewModel),
  };
}
