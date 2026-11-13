import { Link } from "react-router-dom"

import BackButton from "./BackButton";

interface HeaderProps {
  title: string;
  /** Mostra o "Voltar" no canto direito do cabeçalho (todas as telas, menos o menu e o painel público). */
  showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
  return (
    <header className="bg-[#008140] text-white border-b-[5px] border-[#ffcc00] flex items-center gap-3 sm:gap-6 px-4 sm:px-8 py-3 sticky top-0 z-[100] shadow-[0_4px_24px_rgba(0,129,64,0.18)]">

      {/* .header-logo */}
      <Link to="/" className="bg-white px-3 sm:px-5 py-[0.5rem] rounded-[6px] flex items-center gap-[0.6rem] flex-shrink-0">

        {/* Brasão */}
        <img
          src="/assets/brasao-ceara.svg"
          alt="Brasão do Ceará"
          className="h-[52px] sm:h-[90px] w-auto object-contain"
        />

        {/* .header-logo-text */}
        <div className="hidden sm:flex flex-col items-center">
          {/* .header-logo-name */}
          <span className="font-kanit text-brand-text font-black text-[45px] leading-none tracking-[-0.02em]">
            CEARÁ
          </span>
          {/* .header-logo-sub */}
          <span className="font-maitree text-brand-text font-bold text-[0.68rem] uppercase tracking-[0.08em] -mt-[6px]">
            Governo do Estado
          </span>
        </div>
      </Link>

      {/* .header-divider */}
      <div className="hidden sm:block w-px h-[46px] bg-white/25 flex-shrink-0" />

      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base sm:text-[1.45rem] font-black uppercase tracking-[0.03em] leading-tight sm:leading-none">
          {title}
        </span>
        <span className="hidden sm:block text-[16px] font-semibold uppercase opacity-80 tracking-[0.08em] mt-1">
          Hospital de Saúde Mental Prof. Frota Pinto
        </span>
      </div>

      {showBack && <BackButton />}
    </header>
  );
}
