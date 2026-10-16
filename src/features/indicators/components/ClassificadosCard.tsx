import { IndicadorCard } from './IndicadorCard';
export function ClassificadosCard(props: { quantidade: number; percentual: number }) {
  return <IndicadorCard titulo="Classificados" {...props} className="border-t-emerald-700" />;
}
