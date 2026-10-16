// IND-06: os valores entram quando o PO decidir o que cada card mostra (cadastrados ou atendidos? qual dos tempos?).
const SUMMARY_CARDS = [
  { label: 'Total de Atendimentos', subtitle: 'atendimentos hoje', barClassName: 'bg-green-500' },
  { label: 'Tempo Médio de Espera', subtitle: 'minutos por paciente', barClassName: 'bg-blue-500' },
] as const;

export function SummaryCards() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {SUMMARY_CARDS.map(({ label, subtitle, barClassName }) => (
        <div key={label} className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={`h-1.5 w-full rounded-t-2xl ${barClassName}`} />
          <div className="px-7 py-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">{label}</p>
            <p className="mt-3 text-5xl font-black text-gray-800">—</p>
            <p className="mt-2 text-sm font-semibold text-gray-400">{subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
