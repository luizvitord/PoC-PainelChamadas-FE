import { formatarMinutos } from '../../utils/formatarMinutos';
import { tituloSecao } from '../estilos';
import { CorStatCard, StatCard } from '../StatCard';

// Só os campos usados do IndicadoresResponse (BE-01); será trocado pelo tipo do IND-01.
export interface TemposEspera {
  tempoMedioAcolhimentoMinutos: number | null;
  tempoMedioClassificacaoAteMedicoMinutos: number | null;
  tempoMedioEntradaAteMedicoMinutos: number | null;
}

interface WaitTimesTabProps {
  tempos?: TemposEspera;
}

// Indicadores 1–3 com os nomes do design novo; null (sem amostras) vira --:--:--.
const TEMPOS: { campo: keyof TemposEspera; label: string; descricao: string; cor: CorStatCard }[] = [
  {
    campo: 'tempoMedioAcolhimentoMinutos',
    label: 'Espera p/ acolhimento / classificação',
    descricao: 'entrada (NAC) → chamada para a classificação de risco',
    cor: 'yellow',
  },
  {
    campo: 'tempoMedioClassificacaoAteMedicoMinutos',
    label: 'Espera p/ 1º atendimento médico',
    descricao: 'fim da classificação → chamada para o atendimento médico',
    cor: 'orange',
  },
  {
    campo: 'tempoMedioEntradaAteMedicoMinutos',
    label: 'Espera total (NAC → médico)',
    descricao: 'entrada (NAC / ficha) → chamada para o atendimento médico',
    cor: 'red',
  },
];

export function WaitTimesTab({ tempos }: WaitTimesTabProps) {
  return (
    <section>
      <h2 className={tituloSecao}>Tempos de Espera</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TEMPOS.map(({ campo, label, descricao, cor }) => (
          <StatCard key={campo} cor={cor} label={label} valor={formatarMinutos(tempos?.[campo] ?? null)} sub={descricao} />
        ))}
      </div>
    </section>
  );
}
