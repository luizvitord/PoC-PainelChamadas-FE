import { Card } from '@/components/ui/card';

export interface IndicadorCardProps {
  titulo: string;
  quantidade: number;
  percentual?: number;
  className?: string;
  descricao?: string;
}
export function IndicadorCard({ titulo, quantidade, percentual, className = '', descricao }: IndicadorCardProps) {
  return <Card className={`ind-stat-card ind-stat-card-sm border-t-4 ${className}`}>
    <h3 className="ind-stat-label">{titulo}</h3>
    <p className="ind-stat-value">{quantidade.toLocaleString('pt-BR')}</p>
    {percentual !== undefined && <p className="ind-stat-sub">
      {percentual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% dos cadastrados
    </p>}
    {descricao && <p className="ind-stat-sub">{descricao}</p>}
  </Card>;
}
