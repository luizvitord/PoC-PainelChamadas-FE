import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';
import { ReactNode } from 'react';

import { botaoContorno, caixaFiltro, campo, rotuloCampo } from './estilos';

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

// YYYY-MM-DD → DD/MM/AAAA, sem passar por Date.
const paraBr = (data: string) => data.split('-').reverse().join('/');

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
    <div className="mb-4">
      <div className={caixaFiltro}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="periodo-inicio" className={rotuloCampo}>Data Início</Label>
          <Input
            id="periodo-inicio"
            type="date"
            value={dataInicio}
            max={dataFim || undefined}
            onChange={(e) => onInicioChange(e.target.value)}
            aria-invalid={!!erro}
            className={`${campo} ${erro ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="periodo-fim" className={rotuloCampo}>Data Fim</Label>
          <Input
            id="periodo-fim"
            type="date"
            value={dataFim}
            min={dataInicio || undefined}
            onChange={(e) => onFimChange(e.target.value)}
            aria-invalid={!!erro}
            className={`${campo} ${erro ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
          />
        </div>

        <Button type="button" variant="outline" onClick={onLimpar} className={botaoContorno}>
          <RotateCcw className="h-4 w-4" />
          Limpar Período
        </Button>

        {children && (
          <>
            <div className="hidden h-11 w-px bg-slate-200 sm:block" />
            {children}
          </>
        )}
      </div>

      {erro ? (
        <p role="alert" className="ml-1 mt-2 text-[14px] font-bold text-red-500">{erro}</p>
      ) : (
        dataInicio && dataFim && (
          <p className="ml-1 mt-2 text-[13px] font-bold italic text-slate-500">
            Mostrando de {paraBr(dataInicio)} a {paraBr(dataFim)}.
          </p>
        )
      )}
    </div>
  );
}
