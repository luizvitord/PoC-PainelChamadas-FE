import BackButton from "./BackButton";

export default function Header({ title, showBackButton = true }) {
  return (
    <header className="bg-[#008140] text-white p-4 shadow-lg border-b-4 border-[#ffcc00]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
        <div className="w-[110px]">
          {showBackButton && <BackButton />}
        </div>
          <div className="bg-white p-2 rounded shadow-sm">
            <svg width="140" height="42" viewBox="0 0 140 42" fill="none">
              <text x="8" y="27" fill="#008140" fontWeight="900" fontSize="22">
                CEARÁ
              </text>
              <text x="8" y="40" fill="#008140" fontWeight="bold" fontSize="10">
                GOVERNO DO ESTADO
              </text>
              <rect x="0" y="0" width="4" height="42" fill="#ffcc00" />
            </svg>
          </div>

          <div className="h-10 w-px bg-white/30"></div>

          <div>
            <h1 className="font-bold text-base md:text-lg uppercase tracking-tight leading-none">
              {title}
            </h1>
            <p className="text-xs md:text-sm opacity-90 uppercase font-semibold mt-1">
              Hospital de Saúde Mental Prof. Frota Pinto
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}