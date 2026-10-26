import { IndicadorCard } from './IndicadorCard';
export function ClassificadosCard(props: { quantidade: number; percentual: number }) {
  return <IndicadorCard titulo="Nº pacientes classificados" {...props} className="border-t-blue-500" />;
}
