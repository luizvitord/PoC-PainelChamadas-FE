import BackButton from '@/components/BackButton';
import Header from '@/components/Header';

import { IndicatorsAccessGate } from './components/IndicatorsAccessGate';
import { IndicatorsTabs } from './components/IndicatorsTabs';
import { SummaryCards } from './components/SummaryCards';
import { useIndicatorsAccess } from './hooks/useIndicatorsAccess';

// Container da tela: os filtros (IND-03/IND-10) e o useIndicadores (IND-01) ficam aqui
// e descem como props; cards e abas só apresentam os dados.
export function IndicatorsFeature() {
  const { isUnlocked, unlock } = useIndicatorsAccess();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Indicadores de Atendimento" />
      <div className="mx-auto w-full max-w-screen-2xl px-3 pt-6">
        <BackButton />
      </div>

      {isUnlocked ? (
        <div className="mx-auto w-full max-w-screen-2xl px-3 py-8">
          <SummaryCards />
          <IndicatorsTabs />
        </div>
      ) : (
        <IndicatorsAccessGate onUnlock={unlock} />
      )}
    </div>
  );
}
