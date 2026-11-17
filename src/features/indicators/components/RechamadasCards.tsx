import type { Risco } from '../types';
import { nota, tituloSecao } from './estilos';
import { CorStatCard, StatCard } from './StatCard';

export interface Rechamadas {
  totalRechamadas: number;
  rechamadasPorRisco: Record<Risco, number>;
  pacientesRechamadosPorRisco: Record<Risco, number>;
}

interface RechamadasCardsProps {
  rechamadas?: Rechamadas;
}

const CORES: { risco: Exclude<Risco, 'NAO_CLASSIFICADO'>; nome: string; cor: CorStatCard }[] = [
  { risco: 'VERMELHO', nome: 'Vermelho', cor: 'red' },
  { risco: 'LARANJA', nome: 'Laranja', cor: 'orange' },
  { risco: 'AMARELO', nome: 'Amarelo', cor: 'yellow' },
  { risco: 'VERDE', nome: 'Verde', cor: 'green' },
  { risco: 'AZUL', nome: 'Azul', cor: 'blue' },
];

const pacientes = (n: number) => `${n} ${n === 1 ? 'paciente rechamado' : 'pacientes rechamados'}`;

// Total e por cor: o número grande é a quantidade de rechamadas; a legenda, quantos pacientes elas envolvem.
export function RechamadasCards({ rechamadas }: RechamadasCardsProps) {
  return (
    <section className="mt-6">
      <h2 className={tituloSecao}>Rechamadas no painel</h2>
      <div className="mb-4 grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          cor="orange"
          label="Total de rechamadas"
          valor={rechamadas?.totalRechamadas ?? '—'}
          sub="triagem + consultório"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {CORES.map(({ risco, nome, cor }) => (
          <StatCard
            key={risco}
            cor={cor}
            label={`Rechamadas ${nome}`}
            valor={rechamadas?.rechamadasPorRisco[risco] ?? '—'}
            sub={rechamadas ? pacientes(rechamadas.pacientesRechamadosPorRisco[risco]) : undefined}
          />
        ))}
      </div>
      <p className={nota}>Rechamadas da triagem de quem ainda não tinha cor entram só no total.</p>
    </section>
  );
}
