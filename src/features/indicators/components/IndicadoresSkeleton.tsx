import { Skeleton } from '@/components/ui/skeleton';
export function IndicadoresSkeleton() {
  return <div role="status" aria-label="Carregando indicadores" className="space-y-6">
    <span className="sr-only">Carregando indicadores</span>
    <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
    <Skeleton className="h-14 rounded-xl" />
    <div className="grid gap-5 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
  </div>;
}
