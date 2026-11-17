import Header from '@/components/Header';
import { useProtocolos } from '@/hooks/useProtocolos';
import { useState } from 'react';

import { EscopoFilter } from './components/EscopoFilter';
import { SkeletonCards } from './components/EstadoIndicadores';
import { IndicatorsAccessGate } from './components/IndicatorsAccessGate';
import { IndicatorsTabs } from './components/IndicatorsTabs';
import { PeriodFilter } from './components/PeriodFilter';
import { SummaryCards } from './components/SummaryCards';
import { useAtendidosPorHorario } from './hooks/useAtendidosPorHorario';
import { useIndicadores } from './hooks/useIndicadores';
import { useIndicatorsAccess } from './hooks/useIndicatorsAccess';
import { usePeriodoFiltro } from './hooks/usePeriodoFiltro';
import { Escopo } from './utils/escopo';

// Container da tela: os filtros (IND-03/IND-10) e o useIndicadores (INT-01) ficam aqui
// e descem como props; cards e abas só apresentam os dados.
export function IndicatorsFeature() {
  const { isUnlocked, unlock } = useIndicatorsAccess();
  const { dataInicio, dataFim, erro, periodo, alterarInicio, alterarFim, limpar } = usePeriodoFiltro();
  const [escopo, setEscopo] = useState<Escopo>('GERAL');
  const { data: protocolos } = useProtocolos();
  const atendidos = useAtendidosPorHorario(periodo, escopo, isUnlocked);

  // `periodo` só muda com um período válido; o `escopo` vale para todas as abas.
  const indicadores = useIndicadores({ ...periodo, escopo }, { enabled: isUnlocked });

  // Trocar período ou escopo é outra chave sem placeholder: volta a carregar e nunca mostra números do filtro anterior.
  // O refetch de 30 s mantém os dados na tela. Com erro, os números somem para não parecerem atuais.
  const carregando = indicadores.isPending;
  const erroIndicadores = indicadores.error?.message;
  const data = erroIndicadores ? undefined : indicadores.data;
  const estadoIndicadores = {
    carregando,
    erro: erroIndicadores,
    semDados: data?.cadastrados === 0,
    onTentarNovamente: () => indicadores.refetch(),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title={escopo === 'SAMU' ? 'Indicadores de Atendimento — SAMU' : 'Indicadores de Atendimento'} showBack />

      {isUnlocked ? (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {carregando ? (
            <SkeletonCards quantidade={2} className="mb-4 grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2" />
          ) : (
            <SummaryCards
              atendidos={data?.atendidos}
              tempoMedioEntradaAteMedicoMinutos={data?.tempoMedioEntradaAteMedicoMinutos}
            />
          )}
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
          <IndicatorsTabs
            volumes={data}
            riscoSuicida={data}
            tempos={data}
            porRiscoETipo={data?.porRiscoETipo}
            indicadores={estadoIndicadores}
            escopo={escopo}
            protocolos={protocolos}
            atendidos={{ data: atendidos.data, carregando: atendidos.isPending, erro: atendidos.error?.message }}
          />
        </div>
      ) : (
        <IndicatorsAccessGate onUnlock={unlock} />
      )}
    </div>
  );
}
