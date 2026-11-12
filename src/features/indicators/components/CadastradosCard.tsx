import { IndicadorCard } from './IndicadorCard';
export function CadastradosCard(props: { quantidade: number; percentual?: number }) {
  return <IndicadorCard titulo="Nº pacientes cadastrados" descricao="total de cadastros no NAC" {...props} className="border-t-[#008140]" />;
}
