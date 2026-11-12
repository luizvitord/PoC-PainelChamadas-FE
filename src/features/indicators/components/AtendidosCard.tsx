import { IndicadorCard } from './IndicadorCard';
export function AtendidosCard(props: { quantidade: number; percentual: number }) {
  return <IndicadorCard titulo="Nº pacientes atendidos (médico)" {...props} className="border-t-indigo-600" />;
}
