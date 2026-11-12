import { useId } from 'react';
import { RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatConsultorioLabel, type Consultorio } from '@/lib/consultorioLabel';
import { cn } from '@/lib/utils';

interface RoomSelectProps {
  /** ID do consultório selecionado ('' = nenhum) */
  value: string;
  onChange: (value: string) => void;
  options: Consultorio[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function RoomSelect({
  value,
  onChange,
  options,
  loading = false,
  error = null,
  onRetry,
  disabled = false,
  className,
}: RoomSelectProps) {
  const selectId = useId();
  const hasSelection = options.some((opt) => String(opt.id) === value);

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      <label htmlFor={selectId} className="whitespace-nowrap text-sm font-black uppercase tracking-[0.08em] text-slate-600">
        Consultório da próxima chamada
      </label>

      {error ? (
        <div className="flex items-center gap-2" role="alert">
          <span className="text-sm font-semibold text-red-700">{error}</span>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              <RotateCw className="mr-1 h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </div>
      ) : (
        <select
          id={selectId}
          value={hasSelection ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className={cn(
            'min-w-[200px] cursor-pointer rounded-md border bg-white px-3 py-2 text-base font-semibold shadow-sm transition-colors',
            'hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-60',
            hasSelection ? 'border-indigo-300 text-indigo-700' : 'border-amber-400 text-slate-500',
          )}
        >
          <option value="">{loading ? 'Carregando…' : 'Selecione um consultório'}</option>
          {options.map((opt) => (
            <option key={opt.id} value={String(opt.id)}>
              {formatConsultorioLabel(opt)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
