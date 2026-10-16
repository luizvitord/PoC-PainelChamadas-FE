import { Card } from '@/components/ui/card';

export interface IndicadorCardProps {
  titulo: string;
  quantidade: number;
  percentual?: number;
  className?: string;
}
export function IndicadorCard({ titulo, quantidade, percentual, className = '' }: IndicadorCardProps) {
  return <Card className={`p-6 border-t-4 ${className}`}>
    <h3 className="font-semibold text-slate-600">{titulo}</h3>
    <p className="mt-3 text-4xl font-bold tabular-nums text-slate-900">{quantidade.toLocaleString('pt-BR')}</p>
    {percentual !== undefined && <p className="mt-2 text-sm text-slate-600">
      {percentual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% dos cadastrados
    </p>}
  </Card>;
}
