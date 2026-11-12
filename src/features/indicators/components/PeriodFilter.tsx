import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';
import { ReactNode } from 'react';

interface PeriodFilterProps {
  dataInicio: string;
  dataFim: string;
  erro?: string;
  onInicioChange: (dataInicio: string) => void;
  onFimChange: (dataFim: string) => void;
  onLimpar: () => void;
  /** Outros filtros na mesma linha, depois de um divisor (ex.: Geral / SAMU do IND-10). */
  children?: ReactNode;
}

const labelClassName = 'text-xs font-black uppercase tracking-[0.18em] text-gray-500';

export function PeriodFilter({
  dataInicio,
  dataFim,
  erro,
  onInicioChange,
  onFimChange,
  onLimpar,
  children,
}: PeriodFilterProps) {
  return (
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white px-7 py-6 shadow-sm">
      <div className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="periodo-inicio" className={labelClassName}>Data Início</Label>
          <Input
            id="periodo-inicio"
            type="date"
            value={dataInicio}
            max={dataFim || undefined}
            onChange={(e) => onInicioChange(e.target.value)}
            aria-invalid={!!erro}
            className={`h-12 w-48 text-base ${erro ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="periodo-fim" className={labelClassName}>Data Fim</Label>
          <Input
            id="periodo-fim"
            type="date"
            value={dataFim}
            min={dataInicio || undefined}
            onChange={(e) => onFimChange(e.target.value)}
            aria-invalid={!!erro}
            className={`h-12 w-48 text-base ${erro ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onLimpar}
          className="h-12 rounded-lg border-2 border-gray-200 px-6 text-base font-black uppercase tracking-wide text-gray-700 hover:border-gray-300 hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" />
          Limpar
        </Button>

        {children && (
          <>
            <div className="h-12 w-px bg-gray-200" />
            {children}
          </>
        )}
      </div>

      {erro && (
        <p role="alert" className="mt-4 text-base font-semibold text-red-500">{erro}</p>
      )}
    </div>
  );
}
