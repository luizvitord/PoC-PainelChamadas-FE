import BackButton from '@/components/BackButton';
import Header from '@/components/Header';

import { IndicatorsAccessGate } from './components/IndicatorsAccessGate';
import { IndicatorsTabs } from './components/IndicatorsTabs';
import { PeriodFilter } from './components/PeriodFilter';
import { SummaryCards } from './components/SummaryCards';
import { useIndicatorsAccess } from './hooks/useIndicatorsAccess';
import { usePeriodoFiltro } from './hooks/usePeriodoFiltro';

// Container da tela: os filtros (IND-03/IND-10) e o useIndicadores (IND-01) ficam aqui
// e descem como props; cards e abas só apresentam os dados.
export function IndicatorsFeature() {
  const { isUnlocked, unlock } = useIndicatorsAccess();
  const { dataInicio, dataFim, erro, periodo, alterarInicio, alterarFim, limpar } = usePeriodoFiltro();

  // TODO IND-01: const { data } = useIndicadores({ ...periodo, escopo });
  // `periodo` só muda com um período válido; o `escopo` vem do filtro do IND-10.

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Indicadores de Atendimento" />
      <div className="mx-auto w-full max-w-screen-2xl px-3 pt-6">
        <BackButton />
      </div>

      {isUnlocked ? (
        <div className="mx-auto w-full max-w-screen-2xl px-3 py-8">
          <PeriodFilter
            dataInicio={dataInicio}
            dataFim={dataFim}
            erro={erro}
            onInicioChange={alterarInicio}
            onFimChange={alterarFim}
            onLimpar={limpar}
          />
          {/* TODO IND-01: atendidos={data?.atendidos} tempoMedioEntradaAteMedicoMinutos={data?.tempoMedioEntradaAteMedicoMinutos} */}
          <SummaryCards />
          {/* TODO IND-01: tempos={data} porRiscoETipo={data?.porRiscoETipo}; o escopo entra com o filtro do IND-10 */}
          <IndicatorsTabs tempos={undefined} porRiscoETipo={undefined} />
        </div>
      ) : (
        <IndicatorsAccessGate onUnlock={unlock} />
      )}
    </div>
  );
}
