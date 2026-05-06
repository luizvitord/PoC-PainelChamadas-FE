import { PANEL_TICKER_TEXT } from '../constants';
import { PublicPanelViewModel } from '../types';

interface PublicPanelScreenProps extends PublicPanelViewModel {}

export function PublicPanelScreen({ currentCall, previousCalls }: PublicPanelScreenProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col md:flex-row">
          <section className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 text-center md:px-12">
            {currentCall ? (
              <>
                <p className="mb-4 text-[1.35rem] font-bold uppercase tracking-[0.28em] text-slate-600 md:text-[1.8rem]">
                  Chamada Atual
                </p>
                <div className="mb-10 h-2 w-36 rounded-full bg-[#008140]" />
                <h2 className="mb-10 max-w-5xl break-words text-[clamp(3.5rem,10vw,9rem)] font-black uppercase leading-none tracking-[-0.03em] text-slate-900">
                  {currentCall.displayName}
                </h2>
                <div className="mb-8 h-2 w-36 rounded-full bg-[#008140]" />
                <p className="mb-4 text-[1.8rem] font-bold uppercase text-slate-600 md:text-[2.6rem]">Comparecer ao</p>
                <div className="rounded-2xl bg-[#008140] px-8 py-6 shadow-[0_8px_32px_rgba(0,129,64,0.35)] md:px-16">
                  <p className="text-[1.8rem] font-black uppercase tracking-[0.12em] text-white md:text-[3.6rem]">
                    {currentCall.currentDestinationLabel}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-3xl font-semibold text-slate-500 md:text-5xl">Aguardando chamadas...</p>
            )}
          </section>

          <aside className="flex w-full flex-col border-t-4 border-[#008140] bg-slate-100 md:w-[340px] md:border-l-4 md:border-t-0">
            <div className="bg-[#008140] px-6 py-6 text-center text-base font-black uppercase tracking-[0.18em] text-white">
              Últimas Chamadas
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
              {previousCalls.length === 0 ? (
                <p className="py-6 text-center text-sm font-medium text-slate-600">Nenhuma chamada recente</p>
              ) : (
                previousCalls.map((call) => (
                  <article key={call.callId} className="rounded-xl border border-slate-300 bg-white px-4 py-4">
                    <p className="break-words text-lg font-black uppercase leading-tight text-slate-900">{call.displayName}</p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.1em] text-[#006434]">
                      {call.recentDestinationLabel}
                    </p>
                  </article>
                ))
              )}
            </div>
          </aside>
        </main>

        <footer className="overflow-hidden bg-[#008140] px-4 py-3">
          <div className="animate-marquee inline-block whitespace-nowrap text-sm font-bold uppercase tracking-[0.15em] text-white/85 md:text-base">
            {PANEL_TICKER_TEXT}
          </div>
        </footer>
      </div>
    </div>
  );
}
