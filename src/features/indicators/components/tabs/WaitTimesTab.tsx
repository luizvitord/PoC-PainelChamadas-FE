import { formatarMinutos } from '../../utils/formatarMinutos';

// Só os campos usados do IndicadoresResponse (BE-01); será trocado pelo tipo do IND-01.
export interface TemposEspera {
  tempoMedioAcolhimentoMinutos: number | null;
  tempoMedioClassificacaoAteMedicoMinutos: number | null;
  tempoMedioEntradaAteMedicoMinutos: number | null;
}

interface WaitTimesTabProps {
  tempos?: TemposEspera;
}

// Indicadores 1–3: médias em minutos; null (sem amostras) vira --:--:--.
const TEMPOS: { campo: keyof TemposEspera; label: string; descricao: string }[] = [
  { campo: 'tempoMedioAcolhimentoMinutos', label: 'Acolhimento', descricao: 'da entrada à chamada para a triagem' },
  {
    campo: 'tempoMedioClassificacaoAteMedicoMinutos',
    label: 'Classificação → Médico',
    descricao: 'da classificação à chamada para o consultório',
  },
  {
    campo: 'tempoMedioEntradaAteMedicoMinutos',
    label: 'Entrada → Médico',
    descricao: 'da entrada à chamada para o consultório',
  },
];

const titleClassName =
  'mb-4 border-b-2 border-gray-100 pb-2 text-sm font-black uppercase tracking-[0.18em] text-gray-500';

export function WaitTimesTab({ tempos }: WaitTimesTabProps) {
  return (
    <section>
      <h2 className={titleClassName}>Tempos de Espera</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TEMPOS.map(({ campo, label, descricao }) => (
          <div key={campo} className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-1.5 w-full rounded-t-2xl bg-[#008140]" />
            <div className="px-7 py-6">
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">{label}</h3>
              <p className="mt-3 text-5xl font-black tabular-nums text-gray-800">
                {formatarMinutos(tempos?.[campo] ?? null)}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-400">Tempo médio {descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
