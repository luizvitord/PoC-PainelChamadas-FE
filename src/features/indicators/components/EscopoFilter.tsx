import { Escopo, ESCOPOS } from '../utils/escopo';

interface EscopoFilterProps {
  escopo: Escopo;
  onEscopoChange: (escopo: Escopo) => void;
}

const labelClassName = 'text-xs font-black uppercase tracking-[0.18em] text-gray-500';
const chipClassName =
  'h-12 rounded-lg border px-6 text-base font-black uppercase tracking-[0.08em] transition-colors aria-pressed:border-[#008140] aria-pressed:bg-[#008140] aria-pressed:text-white aria-pressed:shadow-[0_2px_8px_rgba(0,129,64,0.28)] aria-[pressed=false]:border-gray-200 aria-[pressed=false]:bg-gray-100 aria-[pressed=false]:text-gray-600 aria-[pressed=false]:hover:bg-gray-200 aria-[pressed=false]:hover:text-gray-800';

export function EscopoFilter({ escopo, onEscopoChange }: EscopoFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <span id="escopo-label" className={labelClassName}>Visão</span>
      <div role="group" aria-labelledby="escopo-label" className="flex gap-3">
        {ESCOPOS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={escopo === id}
            onClick={() => onEscopoChange(id)}
            className={chipClassName}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
