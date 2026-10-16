import { useIndicadores } from '../hooks/useIndicadores';
import type { FiltrosIndicadores } from '../types';
import { CORES } from '../constants';
import { CadastradosCard } from './CadastradosCard';
import { ClassificadosCard } from './ClassificadosCard';
import { AtendidosCard } from './AtendidosCard';
import { ContagemPorCorCard } from './ContagemPorCorCard';
import { IndicadoresSkeleton } from './IndicadoresSkeleton';
import { Button } from '@/components/ui/button';

export function IndicadoresResultados(props: FiltrosIndicadores) {
  const query = useIndicadores(props);
  // Também oculta dados em cache ao revisitar um filtro e durante atualização.
  if (query.isPending || query.isFetching) return <IndicadoresSkeleton />;
  if (query.isError) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
    <p>{query.error.message}</p>
    <Button className="mt-4" onClick={() => query.refetch()}>Tentar novamente</Button>
  </div>;
  const { data } = query;
  return <section aria-label="Resultados dos indicadores" className="space-y-6">
    <p className="text-sm text-slate-600">Última atualização: <time>{new Date(query.dataUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</time></p>
    {data.cadastrados === 0 ? <p role="status" className="rounded-xl border bg-white p-8 text-center">Sem dados no período</p> : <>
      <div className="grid gap-4 md:grid-cols-3">
        <CadastradosCard quantidade={data.cadastrados} />
        <ClassificadosCard quantidade={data.classificados} percentual={data.percentualClassificados} />
        <AtendidosCard quantidade={data.atendidos} percentual={data.percentualAtendidos} />
      </div>
      <h2 className="text-xl font-semibold">Contagem por cor</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CORES.map(cor => <ContagemPorCorCard key={cor.risco} cor={cor} quantidade={data.contagensPorRisco[cor.risco]} />)}
      </div>
    </>}
  </section>;
}
