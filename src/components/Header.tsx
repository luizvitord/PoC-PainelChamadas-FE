import { Link } from "react-router-dom"

export default function Header({ title }) {
  return (
    <header className="bg-[#008140] text-white border-b-[5px] border-[#ffcc00] flex items-center gap-6 px-8 py-[1.4rem] sticky top-0 z-[100] shadow-[0_4px_24px_rgba(0,129,64,0.18)]">
      
      {/* .header-logo */}
      <Link to="/" className="bg-white px-5 py-[0.5rem] rounded-[6px] flex items-center gap-[0.6rem] flex-shrink-0">
        
        {/* .header-logo-bar
        <div className="w-[5px] h-[46px] bg-[#ffcc00] rounded-[2px]" /> */}

        {/* Brasão */}
        <img
          src="/assets/brasao-ceara.svg"
          alt="Brasão do Ceará"
          className="h-[90px] w-auto object-contain"
        />

        {/* .header-logo-text */}
        <div className="flex flex-col items-center">
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
      <div className="w-px h-[46px] bg-white/25 flex-shrink-0" />

      {/* .header-title-group */}
      <div className="flex-1 flex flex-col">
        {/* .header-title */}
        <span className="text-[1.45rem] font-black uppercase tracking-[0.08em] leading-none">
          {title}
        </span>
        {/* .header-subtitle */}
        <span className="text-[0.82rem] font-semibold uppercase opacity-75 tracking-[0.1em] mt-1">
          Hospital de Saúde Mental Prof. Frota Pinto
        </span>
      </div>
    </header>
  );
}