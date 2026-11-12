import { Escopo, visivelNoEscopo } from '../../utils/escopo';
import { formatarPercentual } from '../../utils/formatarPercentual';
import { tituloSecao } from '../estilos';
import { StatCard } from '../StatCard';

// Campos do GET /indicadores usados aqui (BE-02 para as desistências); entram com o IND-01.
export interface VolumesFluxo {
  cadastrados: number;
  classificados: number;
  atendidos: number;
  percentualClassificados: number;
  percentualAtendidos: number;
  desistenciasAcolhimentoClassificacao: number;
  desistenciasClassificacaoConsulta: number;
}

interface VolumesTabProps {
  volumes?: VolumesFluxo;
  escopo?: Escopo;
}

const percentualDe = (parte: number, total: number) => formatarPercentual(total ? Math.round((parte / total) * 10000) / 100 : 0);

// IND-04: volumes (indicadores 4–13) e desistências. No SAMU, cadastrados, % classificados
// e a desistência Acolhimento → Classificação ficam escondidos (IND-10).
export function VolumesTab({ volumes, escopo = 'GERAL' }: VolumesTabProps) {
  const visivel = (indicador: string) => visivelNoEscopo(indicador, escopo);
  const sem = '—';

  return (
    <section>
      <h2 className={tituloSecao}>Volumes e Fluxo de Atendimento</h2>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {visivel('cadastrados') && (
          <StatCard
            cor="green"
            label="Nº pacientes cadastrados"
            valor={volumes?.cadastrados ?? sem}
            sub="total de cadastros no NAC"
          />
        )}
        <StatCard
          cor="blue"
          label="Nº pacientes classificados"
          valor={volumes?.classificados ?? sem}
          sub={
            visivel('percentualClassificados')
              ? `${volumes ? formatarPercentual(volumes.percentualClassificados) : '—%'} dos cadastrados`
              : 'classificados na triagem'
          }
        />
        <StatCard
          cor="indigo"
          label="Nº pacientes atendidos (médico)"
          valor={volumes?.atendidos ?? sem}
          sub={`${volumes ? formatarPercentual(volumes.percentualAtendidos) : '—%'} dos cadastrados`}
        />
      </div>

      <h2 className={tituloSecao}>Desistências entre etapas</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {visivel('desistenciaAcolhimentoClassificacao') && (
          <StatCard
            cor="red"
            label="Desistentes: Acolhimento → Classificação"
            valor={volumes?.desistenciasAcolhimentoClassificacao ?? sem}
            sub={`${volumes ? percentualDe(volumes.desistenciasAcolhimentoClassificacao, volumes.cadastrados) : '—%'} dos cadastrados`}
          />
        )}
        <StatCard
          cor="orange"
          label="Desistentes: Classificação → Consulta"
          valor={volumes?.desistenciasClassificacaoConsulta ?? sem}
          sub={`${volumes ? percentualDe(volumes.desistenciasClassificacaoConsulta, volumes.classificados) : '—%'} dos classificados`}
        />
      </div>
    </section>
  );
}
