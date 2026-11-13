import { ArrowLeft } from "lucide-react";

// Botão "Voltar" do cabeçalho (design novo: translúcido sobre o verde, à direita do título).
export default function BackButton({ label = "Voltar" }) {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg border-[1.5px] border-white/35 bg-white/[0.18] px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
      {label}
    </button>
  );
}
