import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import { useProtocolos } from '@/hooks/useProtocolos';
import { useState } from 'react';

import { EscopoFilter } from './components/EscopoFilter';
import { IndicatorsAccessGate } from './components/IndicatorsAccessGate';
import { IndicatorsTabs } from './components/IndicatorsTabs';
import { PeriodFilter } from './components/PeriodFilter';
import { SummaryCards } from './components/SummaryCards';
import { useIndicatorsAccess } from './hooks/useIndicatorsAccess';
import { usePeriodoFiltro } from './hooks/usePeriodoFiltro';
import { Escopo } from './utils/escopo';

// Container da tela: os filtros (IND-03/IND-10) e o useIndicadores (IND-01) ficam aqui
// e descem como props; cards e abas só apresentam os dados.
export function IndicatorsFeature() {
  const { isUnlocked, unlock } = useIndicatorsAccess();
  const { dataInicio, dataFim, erro, periodo, alterarInicio, alterarFim, limpar } = usePeriodoFiltro();
  const [escopo, setEscopo] = useState<Escopo>('GERAL');
  const { data: protocolos } = useProtocolos();

  // TODO IND-01: const { data } = useIndicadores({ ...periodo, escopo });
  // `periodo` só muda com um período válido; o `escopo` vale para todas as abas.

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title={escopo === 'SAMU' ? 'Indicadores de Atendimento — SAMU' : 'Indicadores de Atendimento'} />
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
          >
            <EscopoFilter escopo={escopo} onEscopoChange={setEscopo} />
          </PeriodFilter>
          {/* TODO IND-01: atendidos={data?.atendidos} tempoMedioEntradaAteMedicoMinutos={data?.tempoMedioEntradaAteMedicoMinutos} */}
          <SummaryCards />
          {/* TODO IND-01: tempos={data} porRiscoETipo={data?.porRiscoETipo} */}
          <IndicatorsTabs tempos={undefined} porRiscoETipo={undefined} escopo={escopo} protocolos={protocolos} />
        </div>
      ) : (
        <IndicatorsAccessGate onUnlock={unlock} />
      )}
    </div>
  );
}
