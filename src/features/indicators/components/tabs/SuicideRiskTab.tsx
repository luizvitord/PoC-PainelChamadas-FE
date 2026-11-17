import type { ComportamentoSuicida } from '../../types';
import { formatarPercentual } from '../../utils/formatarPercentual';
import { nota, tituloSecao } from '../estilos';
import { CorStatCard, StatCard } from '../StatCard';

// Contagem das marcações de comportamento suicida feitas pelo médico ao finalizar a consulta,
// como vem do GET /indicadores (período e escopo do filtro).
export interface RiscoSuicida {
  comportamentoSuicida: Record<ComportamentoSuicida, number>;
  atendidosSemAvaliacaoSuicida: number;
}

interface SuicideRiskTabProps {
  risco?: RiscoSuicida;
}

const OPCOES: { campo: ComportamentoSuicida; label: string; cor: CorStatCard }[] = [
  { campo: 'TENTATIVA', label: 'Tentativa de suicídio', cor: 'red' },
  { campo: 'IDEACAO', label: 'Ideação suicida sem tentativa', cor: 'orange' },
  { campo: 'NENHUM', label: 'Não relacionado a comportamento suicida', cor: 'green' },
];

export function SuicideRiskTab({ risco }: SuicideRiskTabProps) {
  const contagem = risco?.comportamentoSuicida;
  const comMarcacao = contagem ? contagem.TENTATIVA + contagem.IDEACAO + contagem.NENHUM : undefined;
  const percentual = (valor: number) =>
    formatarPercentual(comMarcacao ? Math.round((valor / comMarcacao) * 100) : 0);

  return (
    <section>
      <h2 className={tituloSecao}>Risco Suicida (atendimento médico)</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {OPCOES.map(({ campo, label, cor }) => (
          <StatCard
            key={campo}
            cor={cor}
            label={label}
            valor={contagem?.[campo] ?? '—'}
            sub={`${contagem ? percentual(contagem[campo]) : '—%'} dos atendidos`}
          />
        ))}
      </div>

      <p className="mt-3 rounded-[10px] border border-slate-100 bg-slate-50 px-4 py-3 text-[14px] font-semibold text-slate-600">
        Total de atendidos com marcação: <strong className="text-slate-800">{comMarcacao ?? '—'}</strong>
        {' · '}Sem marcação (atendimentos anteriores à obrigatoriedade ou ainda não finalizados pelo médico):{' '}
        <strong className="text-slate-800">{risco?.atendidosSemAvaliacaoSuicida ?? '—'}</strong>
      </p>
      <p className={nota}>
        Contagem das opções marcadas pelo médico no atendimento, respeitando o período acima. Os percentuais são
        calculados sobre o total de pacientes com marcação.
      </p>
    </section>
  );
}
