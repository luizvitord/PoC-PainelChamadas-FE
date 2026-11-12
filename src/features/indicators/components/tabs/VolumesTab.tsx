import { TabPlaceholder } from '../TabPlaceholder';

// IND-04: cadastrados, classificados, atendidos, contagem por cor e desistências (indicadores 4–13).
// No SAMU, "Nº cadastrados", "% classificados" e a desistência Acolhimento → Classificação ficam
// escondidos (IND-10): usar visivelNoEscopo de utils/escopo.
export function VolumesTab() {
  return <TabPlaceholder title="Volumes e Fluxo de Atendimento" />;
}
