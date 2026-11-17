import type { EtapaDesistencia } from '../types';
import { Escopo, visivelNoEscopo } from '../utils/escopo';
import { tituloSecao } from './estilos';
import { CorStatCard, StatCard } from './StatCard';

export interface Desistencias {
  totalDesistencias: number;
  desistenciasPorEtapa: Record<EtapaDesistencia, number>;
}

interface DesistenciasCardsProps {
  desistencias?: Desistencias;
  escopo?: Escopo;
}

// A etapa é o status que o paciente tinha ao desistir. CHAMADO não diz se a chamada era da triagem
// ou do consultório (o back não separa), por isso fica num card próprio.
const ETAPAS: { etapa: EtapaDesistencia; indicador?: string; label: string; sub: string; cor: CorStatCard }[] = [
  {
    etapa: 'AGUARDANDO_TRIAGEM',
    indicador: 'desistenciaAcolhimentoClassificacao',
    label: 'Acolhimento → Classificação',
    sub: 'desistiram aguardando a classificação de risco',
    cor: 'orange',
  },
  {
    etapa: 'AGUARDANDO_CONSULTA',
    label: 'Classificação → Consulta',
    sub: 'desistiram aguardando o atendimento médico',
    cor: 'yellow',
  },
  {
    etapa: 'CHAMADO',
    label: 'Após serem chamados',
    sub: 'desistiram depois de chamados no painel (triagem ou consultório)',
    cor: 'indigo',
  },
];

// Total e por etapa. No SAMU a etapa Acolhimento → Classificação some (IND-10): o tipo só é definido na triagem.
export function DesistenciasCards({ desistencias, escopo = 'GERAL' }: DesistenciasCardsProps) {
  const etapas = ETAPAS.filter(({ indicador }) => !indicador || visivelNoEscopo(indicador, escopo));

  return (
    <section className="mt-6">
      <h2 className={tituloSecao}>Desistências</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          cor="red"
          label="Total de desistências"
          valor={desistencias?.totalDesistencias ?? '—'}
          sub="pacientes que desistiram no período"
        />
        {etapas.map(({ etapa, label, sub, cor }) => (
          <StatCard key={etapa} cor={cor} label={label} valor={desistencias?.desistenciasPorEtapa[etapa] ?? '—'} sub={sub} />
        ))}
      </div>
    </section>
  );
}
