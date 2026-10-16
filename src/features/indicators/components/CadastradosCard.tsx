import { IndicadorCard } from './IndicadorCard';
export function CadastradosCard(props: { quantidade: number; percentual?: number }) {
  return <IndicadorCard titulo="Cadastrados" {...props} className="border-t-emerald-700" />;
}
