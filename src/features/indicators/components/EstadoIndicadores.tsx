import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { estadoVazio } from './estilos';

/** Situação do GET /indicadores que o container repassa para os cards e as abas. */
export interface EstadoIndicadores {
  carregando?: boolean;
  erro?: string;
  semDados?: boolean;
  onTentarNovamente?: () => void;
}

export function SkeletonCards({ quantidade, className }: { quantidade: number; className: string }) {
  return (
    <div role="status" aria-label="Carregando indicadores" className={className}>
      <span className="sr-only">Carregando indicadores</span>
      {Array.from({ length: quantidade }, (_, i) => (
        <Skeleton key={i} className="h-36 rounded-2xl" />
      ))}
    </div>
  );
}

// Carregando, erro ou período vazio no lugar do conteúdo da aba; não renderiza nada quando há dados.
export function EstadoAba({ carregando, erro, semDados, onTentarNovamente }: EstadoIndicadores) {
  if (erro) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-base font-semibold text-red-600">{erro}</p>
        {onTentarNovamente && (
          <Button className="mt-4" onClick={onTentarNovamente}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  if (carregando) return <SkeletonCards quantidade={3} className="grid grid-cols-1 gap-4 md:grid-cols-3" />;

  if (semDados) return <div className={estadoVazio}>Sem dados para o período</div>;

  return null;
}
