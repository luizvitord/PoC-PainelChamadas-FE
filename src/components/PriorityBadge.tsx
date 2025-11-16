import { PriorityLevel, PRIORITY_CONFIG } from '@/types/patient';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  showLabel?: boolean;
  className?: string;
}

export const PriorityBadge = ({ priority, showLabel = true, className }: PriorityBadgeProps) => {
  const config = PRIORITY_CONFIG[priority];
  
  const colorClasses = {
    red: 'bg-priority-red text-priority-red-foreground',
    orange: 'bg-priority-orange text-priority-orange-foreground',
    yellow: 'bg-priority-yellow text-priority-yellow-foreground',
    green: 'bg-priority-green text-priority-green-foreground',
    blue: 'bg-priority-blue text-priority-blue-foreground',
  };

  return (
    <Badge className={cn(colorClasses[priority], 'font-semibold', className)}>
      {showLabel ? config.label : priority.toUpperCase()}
    </Badge>
  );
};
