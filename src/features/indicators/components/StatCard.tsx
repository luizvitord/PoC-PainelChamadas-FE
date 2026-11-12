import { ReactNode } from 'react';

const BARRA = {
  green: 'bg-[#008140]',
  indigo: 'bg-[#4c51bf]',
  blue: 'bg-[#3182ce]',
  yellow: 'bg-[#ffcc00]',
  red: 'bg-[#e53e3e]',
  orange: 'bg-[#dd6b20]',
} as const;

export type CorStatCard = keyof typeof BARRA;

interface StatCardProps {
  label: string;
  valor: ReactNode;
  sub?: ReactNode;
  cor: CorStatCard;
  /** "sm" é o tamanho dos cards dentro das abas; "md" o dos cards do topo. */
  tamanho?: 'md' | 'sm';
}

// Card de número do design novo: barra colorida no topo, rótulo, valor grande e legenda.
export function StatCard({ label, valor, sub, cor, tamanho = 'sm' }: StatCardProps) {
  const md = tamanho === 'md';
  return (
    <div
      className={`relative flex flex-col gap-1.5 overflow-hidden rounded-[14px] border border-slate-100 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.05)] ${md ? 'px-6 py-5' : 'px-5 py-4'}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${BARRA[cor]}`} />
      <h3 className={`${md ? 'text-[13px]' : 'text-[12px]'} font-black uppercase tracking-[0.14em] text-slate-500`}>{label}</h3>
      <p className={`${md ? 'text-[50px]' : 'text-[34px]'} font-black leading-none tabular-nums text-slate-800`}>{valor}</p>
      {sub && <p className="mt-0.5 text-[14px] font-semibold text-slate-500">{sub}</p>}
    </div>
  );
}
