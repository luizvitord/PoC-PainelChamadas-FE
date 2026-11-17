import type { Risco } from '../../types';
import { Escopo, visivelNoEscopo } from '../../utils/escopo';
import { formatarPercentual } from '../../utils/formatarPercentual';
import { Desistencias, DesistenciasCards } from '../DesistenciasCards';
import { tituloSecao } from '../estilos';
import { Rechamadas, RechamadasCards } from '../RechamadasCards';
import { CorStatCard, StatCard } from '../StatCard';

// Campos do GET /indicadores usados aqui: volumes (indicadores 4–13), desistências e rechamadas (INT-03).
export interface VolumesFluxo extends Desistencias, Rechamadas {
  cadastrados: number;
  classificados: number;
  atendidos: number;
  percentualClassificados: number;
  percentualAtendidos: number;
  contagensPorRisco: Record<Risco, number>;
}

interface VolumesTabProps {
  volumes?: VolumesFluxo;
  escopo?: Escopo;
}

// As 5 cores do Manchester; NAO_CLASSIFICADO fica de fora porque não é uma cor (as 5 somam os classificados).
const CORES_RISCO: { risco: Exclude<Risco, 'NAO_CLASSIFICADO'>; nome: string; nivel: string; cor: CorStatCard }[] = [
  { risco: 'VERMELHO', nome: 'Vermelho', nivel: 'Emergência', cor: 'red' },
  { risco: 'LARANJA', nome: 'Laranja', nivel: 'Muito urgente', cor: 'orange' },
  { risco: 'AMARELO', nome: 'Amarelo', nivel: 'Urgente', cor: 'yellow' },
  { risco: 'VERDE', nome: 'Verde', nivel: 'Pouco urgente', cor: 'green' },
  { risco: 'AZUL', nome: 'Azul', nivel: 'Não urgente', cor: 'blue' },
];

// No SAMU, cadastrados e % classificados ficam escondidos (IND-10): o tipo só é definido na triagem.
export function VolumesTab({ volumes, escopo = 'GERAL' }: VolumesTabProps) {
  const visivel = (indicador: string) => visivelNoEscopo(indicador, escopo);
  const sem = '—';
  const percentual = (valor?: number) => (volumes && valor !== undefined ? formatarPercentual(valor) : '—%');

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
              ? `${percentual(volumes?.percentualClassificados)} dos cadastrados`
              : 'classificados na triagem'
          }
        />
        <StatCard
          cor="indigo"
          label="Nº pacientes atendidos (médico)"
          valor={volumes?.atendidos ?? sem}
          sub={`${percentual(volumes?.percentualAtendidos)} dos cadastrados`}
        />
      </div>

      <h2 className={tituloSecao}>Classificados por cor</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {CORES_RISCO.map(({ risco, nome, nivel, cor }) => (
          <StatCard key={risco} cor={cor} label={nome} valor={volumes?.contagensPorRisco[risco] ?? sem} sub={nivel} />
        ))}
      </div>

      <DesistenciasCards desistencias={volumes} escopo={escopo} />
      <RechamadasCards rechamadas={volumes} />
    </section>
  );
}
