import { PublicPanelScreen } from './components/PublicPanelScreen';
import { usePublicPanelData } from './hooks/usePublicPanelData';
import { usePanelSpeech } from './hooks/usePanelSpeech';

export function PublicPanelFeature() {
  const { recentCalls } = usePublicPanelData();
  const panelData = usePanelSpeech(recentCalls);

  return <PublicPanelScreen {...panelData} />;
}
