import { formatarMinutos } from '../utils/formatarMinutos';
import { StatCard } from './StatCard';

interface SummaryCardsProps {
  atendidos?: number;
  tempoMedioEntradaAteMedicoMinutos?: number | null;
}

// Decisão nº 1: atendidos no período e o tempo médio entrada → médico (indicador 3).
export function SummaryCards({ atendidos, tempoMedioEntradaAteMedicoMinutos }: SummaryCardsProps) {
  return (
    <div className="mb-4 grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard
        tamanho="md"
        cor="green"
        label="Total de Atendimentos"
        valor={atendidos ?? '—'}
        sub="atendimentos no período"
      />
      <StatCard
        tamanho="md"
        cor="indigo"
        label="Tempo Médio de Espera"
        valor={formatarMinutos(tempoMedioEntradaAteMedicoMinutos ?? null)}
        sub="da entrada ao médico, por paciente"
      />
    </div>
  );
}
