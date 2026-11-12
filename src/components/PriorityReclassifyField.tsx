import { PriorityBadge } from '@/components/PriorityBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PRIORITY_CONFIG, PriorityLevel } from '@/types/patient';
import { Check, Pencil, Undo2 } from 'lucide-react';
import { useState } from 'react';

interface PriorityReclassifyFieldProps {
  // Cor dada pela enfermagem na triagem.
  triagePriority: PriorityLevel;
  // Cor escolhida pelo médico; null mantém a da triagem.
  value: PriorityLevel | null;
  onChange: (priority: PriorityLevel | null) => void;
  // Cores que o protocolo aceita para o tipo de atendimento do paciente.
  options: PriorityLevel[];
  // Só depois de chamar o paciente: antes disso o médico está só revisando.
  canChange: boolean;
}

// Reclassificação opcional pelo médico. Nada é gravado aqui: a cor vai junto com o "Finalizar
// Consulta" e, se for diferente da triagem, passa a ser a cor final do paciente.
export function PriorityReclassifyField({ triagePriority, value, onChange, options, canChange }: PriorityReclassifyFieldProps) {
  const [open, setOpen] = useState(false);
  const current = value ?? triagePriority;
  const isReclassified = value !== null && value !== triagePriority;

  const choose = (priority: PriorityLevel) => {
    // Voltar para a cor da triagem é o mesmo que não reclassificar.
    onChange(priority === triagePriority ? null : priority);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <PriorityBadge priority={current} size="lg" />

        {canChange && options.length > 0 && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-bold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800">
              <Pencil className="h-4 w-4" aria-hidden />
              Alterar
            </PopoverTrigger>
            {/* Acima do modal do médico (o Dialog usa z-[220]/z-[221]); com o z-50 padrão a lista abria atrás dele. */}
            <PopoverContent align="start" className="z-[230] w-80 p-2">
              <p className="px-3 pb-2 pt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                Reclassificar prioridade
              </p>
              <div role="radiogroup" aria-label="Reclassificar prioridade" className="flex flex-col gap-1">
                {options.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    role="radio"
                    aria-checked={priority === current}
                    aria-label={`${PRIORITY_CONFIG[priority].label} — ${PRIORITY_CONFIG[priority].urgency}`}
                    onClick={() => choose(priority)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-slate-100 aria-checked:bg-slate-50"
                  >
                    <span className="flex w-5 justify-center text-indigo-600">
                      {priority === current && <Check className="h-5 w-5" aria-hidden />}
                    </span>
                    <PriorityBadge priority={priority} />
                    <span className="ml-auto text-sm font-semibold text-slate-500">
                      {priority === triagePriority ? 'Acolhimento' : PRIORITY_CONFIG[priority].label}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {isReclassified && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {/* Na tela é "Acolhimento", como a equipe do hospital chama; "triagem" fica só no código. */}
          <span>Acolhimento:</span>
          <PriorityBadge priority={triagePriority} size="sm" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            <Undo2 className="h-4 w-4" aria-hidden />
            Desfazer
          </button>
        </div>
      )}
    </div>
  );
}
