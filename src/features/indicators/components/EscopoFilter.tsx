import { Escopo, ESCOPOS } from '../utils/escopo';
import { chip, rotuloGrupo } from './estilos';

interface EscopoFilterProps {
  escopo: Escopo;
  onEscopoChange: (escopo: Escopo) => void;
}

export function EscopoFilter({ escopo, onEscopoChange }: EscopoFilterProps) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2">
      <span id="escopo-label" className={rotuloGrupo}>Visão</span>
      <div role="group" aria-labelledby="escopo-label" className="flex gap-2">
        {ESCOPOS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={escopo === id}
            onClick={() => onEscopoChange(id)}
            className={chip}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
