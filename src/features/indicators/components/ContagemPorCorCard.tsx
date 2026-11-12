import { IndicadorCard } from './IndicadorCard';
import { CORES } from '../constants';
export function ContagemPorCorCard({ cor, quantidade }: { cor: typeof CORES[number]; quantidade: number }) {
  return <IndicadorCard titulo={cor.nome} quantidade={quantidade} className={cor.classe} />;
}
