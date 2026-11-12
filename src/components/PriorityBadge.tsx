import { cn } from '@/lib/utils';
import { PRIORITY_CONFIG, PriorityLevel } from '@/types/patient';

// Fundo e texto em tom suave da cor; a bolinha usa a cor oficial da prioridade.
const COLOR_CLASSES: Record<PriorityLevel, { pill: string; dot: string }> = {
  red: { pill: 'border-red-200 bg-red-50 text-red-700', dot: 'bg-priority-red' },
  orange: { pill: 'border-orange-200 bg-orange-50 text-orange-700', dot: 'bg-priority-orange' },
  yellow: { pill: 'border-amber-200 bg-amber-50 text-amber-800', dot: 'bg-priority-yellow' },
  green: { pill: 'border-green-200 bg-green-50 text-green-700', dot: 'bg-priority-green' },
  blue: { pill: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-priority-blue' },
};

const SIZE_CLASSES = {
  sm: { pill: 'gap-1.5 px-2.5 py-0.5 text-xs', dot: 'h-2 w-2' },
  md: { pill: 'gap-2 px-3 py-1 text-sm', dot: 'h-2.5 w-2.5' },
  lg: { pill: 'gap-2 px-4 py-1.5 text-base', dot: 'h-3 w-3' },
};

interface PriorityBadgeProps {
  priority: PriorityLevel;
  // "urgency" (padrão): significado no Manchester, ex. "Pouco urgente".
  // "color": nome da cor, para telas organizadas por cor (ex.: indicadores, que seguem o PDF).
  label?: 'urgency' | 'color';
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

// Selo único de prioridade: bolinha na cor + um texto só, sem repetir a cor ao lado.
// O nome da cor continua no title (passar o mouse) e para leitores de tela.
export const PriorityBadge = ({ priority, label = 'urgency', size = 'md', className }: PriorityBadgeProps) => {
  const { label: colorName, urgency } = PRIORITY_CONFIG[priority];

  return (
    <span
      title={`${colorName} — ${urgency}`}
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border font-black uppercase tracking-wide',
        COLOR_CLASSES[priority].pill,
        SIZE_CLASSES[size].pill,
        className,
      )}
    >
      <span aria-hidden className={cn('shrink-0 rounded-full', COLOR_CLASSES[priority].dot, SIZE_CLASSES[size].dot)} />
      {label === 'urgency' && <span className="sr-only">{colorName}: </span>}
      {label === 'urgency' ? urgency : colorName}
    </span>
  );
};
