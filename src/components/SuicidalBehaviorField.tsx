import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SUICIDAL_BEHAVIOR_OPTIONS, SuicidalBehavior, SuicidalBehaviorLabel } from '@/lib/suicidalBehavior';
import { useId } from 'react';

interface SuicidalBehaviorFieldProps {
  value: SuicidalBehavior | null;
  onChange: (value: SuicidalBehavior) => void;
}

// Obrigatório para finalizar a consulta. Começa sem opção marcada: um padrão "sem ideação"
// deixaria o médico finalizar sem avaliar e o indicador contaria uma avaliação que não houve.
export function SuicidalBehaviorField({ value, onChange }: SuicidalBehaviorFieldProps) {
  const legendId = useId();

  return (
    <fieldset className="flex flex-col gap-2">
      <legend id={legendId} className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-base font-bold uppercase tracking-[0.1em] text-slate-500">
          Ideação ou tentativa de suicídio
        </span>
        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-0.5 text-sm font-black uppercase tracking-wide text-red-600">
          Obrigatório
        </span>
        {value === null && (
          <span className="text-sm font-semibold text-red-600">Selecione uma opção para finalizar a consulta.</span>
        )}
      </legend>

      {/* Lado a lado em telas largas, para o modal do médico caber sem rolagem. */}
      <RadioGroup
        value={value ?? ''}
        onValueChange={(option) => onChange(option as SuicidalBehavior)}
        aria-labelledby={legendId}
        required
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {SUICIDAL_BEHAVIOR_OPTIONS.map(({ value: option, description }) => (
          <Label
            key={option}
            htmlFor={`${legendId}-${option}`}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
              value === option ? 'border-[#008140] bg-[#f0fff4]' : 'border-gray-200 hover:border-[#008140] hover:bg-[#f0fff4]'
            }`}
          >
            <RadioGroupItem id={`${legendId}-${option}`} value={option} className="mt-1 h-5 w-5 shrink-0" />
            <span className="flex flex-col gap-1">
              <span className="text-lg font-bold text-slate-800">{SuicidalBehaviorLabel[option]}</span>
              <span className="text-sm font-medium leading-snug text-slate-500">{description}</span>
            </span>
          </Label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
