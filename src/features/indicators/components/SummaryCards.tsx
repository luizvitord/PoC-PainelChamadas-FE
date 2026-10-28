import { formatarMinutos } from '../utils/formatarMinutos';

interface SummaryCardsProps {
  atendidos?: number;
  tempoMedioEntradaAteMedicoMinutos?: number | null;
}

// Decisão nº 1: atendidos no período e o tempo médio entrada → médico (indicador 3).
export function SummaryCards({ atendidos, tempoMedioEntradaAteMedicoMinutos }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total de Atendimentos',
      valor: atendidos ?? '—',
      subtitle: 'atendimentos no período',
      barClassName: 'bg-green-500',
    },
    {
      label: 'Tempo Médio de Espera',
      valor: formatarMinutos(tempoMedioEntradaAteMedicoMinutos ?? null),
      subtitle: 'da entrada ao médico, por paciente',
      barClassName: 'bg-blue-500',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {cards.map(({ label, valor, subtitle, barClassName }) => (
        <div key={label} className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={`h-1.5 w-full rounded-t-2xl ${barClassName}`} />
          <div className="px-7 py-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">{label}</p>
            <p className="mt-3 text-5xl font-black tabular-nums text-gray-800">{valor}</p>
            <p className="mt-2 text-sm font-semibold text-gray-400">{subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
