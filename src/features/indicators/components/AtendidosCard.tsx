import { IndicadorCard } from './IndicadorCard';
export function AtendidosCard(props: { quantidade: number; percentual: number }) {
  return <IndicadorCard titulo="Atendidos" {...props} className="border-t-emerald-700" />;
}
