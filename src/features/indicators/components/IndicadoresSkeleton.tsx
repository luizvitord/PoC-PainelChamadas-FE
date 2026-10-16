import { Skeleton } from '@/components/ui/skeleton';
export function IndicadoresSkeleton() {
  return <div role="status" aria-label="Carregando indicadores" className="space-y-6">
    <span className="sr-only">Carregando indicadores</span>
    {[3, 5].map((n) => <div key={n} className={`grid gap-4 ${n === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-5'}`}>
      {Array.from({ length: n }, (_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
    </div>)}
  </div>;
}
