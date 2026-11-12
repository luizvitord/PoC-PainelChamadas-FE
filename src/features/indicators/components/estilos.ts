// Classes do design novo dos Indicadores (frontNovo.html, out/2026), com a fonte atual do site.
// Os tamanhos seguem o protótipo, que usa 18px de base: 0.72rem → 13px, 2.8rem → 50px…

export const tituloSecao =
  'mb-3.5 border-b-2 border-slate-100 pb-2 text-[15px] font-black uppercase tracking-[0.18em] text-slate-500';

export const caixaFiltro = 'flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4';

export const rotuloCampo = 'text-[13px] font-black uppercase tracking-[0.15em] text-slate-500';

export const rotuloGrupo = 'mr-1 text-[12px] font-black uppercase tracking-[0.14em] text-slate-500';

export const campo = 'h-11 w-44 rounded-[10px] border-[1.5px] border-slate-200 bg-slate-50 text-base focus-visible:bg-white';

export const botaoContorno =
  'h-11 rounded-lg border-[1.5px] border-slate-200 bg-white px-5 text-[15px] font-black uppercase tracking-[0.1em] text-slate-700 hover:border-slate-300 hover:bg-slate-50';

// Chip em pílula; o estado vem do aria-pressed (ligado = verde).
export const chip =
  'inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[14px] font-extrabold uppercase tracking-[0.06em] transition-colors aria-pressed:border-[#008140] aria-pressed:bg-[#008140] aria-pressed:text-white aria-[pressed=false]:border-slate-200 aria-[pressed=false]:bg-slate-100 aria-[pressed=false]:text-slate-600 aria-[pressed=false]:hover:bg-slate-200';

export const pontoCor = 'inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full';

export const cartao = 'overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.05)]';

export const estadoVazio =
  'rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-[13px] font-black uppercase tracking-[0.15em] text-slate-300';

export const nota = 'px-1 pt-2.5 text-[12.5px] italic text-slate-400';

// Cores das bolinhas por nível, as mesmas do protótipo.
export const COR_NIVEL = {
  red: '#e53e3e',
  orange: '#dd6b20',
  yellow: '#d69e2e',
  green: '#38a169',
  blue: '#3182ce',
} as const;
