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
  const hintId = useId();
  const selected = options.find((opt) => String(opt.id) === value);
  const hasSelection = Boolean(selected);

  if (error) {
    return (
      <div className={cn('flex w-full flex-col gap-1 sm:w-auto sm:min-w-[260px]', className)}>
        <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-600">
          Seu consultório
        </span>
        <div className="flex flex-wrap items-center gap-2" role="alert">
          <span className="text-sm font-semibold text-red-700">{error}</span>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry} className="h-9">
              <RotateCw className="mr-1 h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full flex-col gap-1 sm:w-auto sm:min-w-[260px]', className)}>
      <label
        htmlFor={selectId}
        className="text-xs font-black uppercase tracking-[0.08em] text-slate-600"
      >
        Seu consultório
      </label>
      {/* O médico confirma onde está agora: a chamada no painel manda o paciente para esta sala. */}
      <select
        id={selectId}
        aria-describedby={hintId}
        value={hasSelection ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={cn(
          'h-11 w-full cursor-pointer rounded-lg border bg-white px-3 text-base font-semibold shadow-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-60',
          hasSelection
            ? 'border-indigo-400 text-indigo-700 hover:border-indigo-500'
            : 'border-slate-300 text-slate-600 hover:border-indigo-300',
        )}
      >
        <option value="">{loading ? 'Carregando…' : 'Selecione o consultório em que você está'}</option>
        {options.map((opt) => (
          <option key={opt.id} value={String(opt.id)}>
            {formatConsultorioLabel(opt)}
          </option>
        ))}
      </select>
      <p id={hintId} className="text-xs text-slate-500">
        O paciente será chamado no painel para este consultório.
      </p>
    </div>
  );
}
