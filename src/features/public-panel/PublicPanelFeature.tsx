import { PublicPanelScreen } from './components/PublicPanelScreen';
import { usePublicPanelData } from './hooks/usePublicPanelData';
import { usePanelSpeech } from './hooks/usePanelSpeech';

export function PublicPanelFeature() {
  const panelData = usePublicPanelData();

  usePanelSpeech(panelData.currentCall);

  return <PublicPanelScreen {...panelData} />;
}
