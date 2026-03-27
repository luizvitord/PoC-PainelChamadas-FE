import { usePatients } from '@/contexts/PatientContext';
import { useEffect, useRef } from 'react';

export default function PublicPanel() {
  const { recentCalls } = usePatients();
  const currentCall = recentCalls[0];
  const previousCalls = recentCalls.slice(1, 4);
  const lastSpokenCallRef = useRef<string | null>(null);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // cancela qualquer fala anterior

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!currentCall) return;

    // cria uma chave única do chamado
    const callKey = currentCall.callId;
    console.log('Chamada atual:', callKey);

    // se já falou esse chamado, não fala de novo
    if (lastSpokenCallRef.current === callKey) return;

    const text =
      currentCall.type === 'triage'
        ? `Paciente ${currentCall.patientName}, favor comparecer ao acolhimento`
        : `Paciente ${currentCall.patientName}, favor comparecer ao consultório ${currentCall.room}`;

    speak(text);

    // marca como já falado
    lastSpokenCallRef.current = callKey;
  }, [currentCall]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      console.log('Voices loaded:', voices);
    };

    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // tenta carregar imediatamente
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="relative flex flex-grow flex-col gap-0 md:flex-row">
        <div className="flex flex-grow flex-col gap-0 bg-[#0f1923]">
          <div className="flex flex-grow flex-col items-center justify-center bg-[#0f1923] p-12 text-center">
            {currentCall ? (
              <>
                <p className="mb-6 text-lg font-bold uppercase tracking-widest text-gray-400">Chamada Atual</p>
                <div className="mb-10 h-1 w-32 rounded-full bg-[#ffcc00]" />
                <h3 className="mb-8 max-w-4xl break-words text-6xl font-black uppercase leading-tight tracking-tighter text-white md:text-7xl lg:text-8xl">
                  {(currentCall.patientName || '').toUpperCase()}
                </h3>
                <div className="mb-10 h-1 w-32 rounded-full bg-[#ffcc00]" />
                <div className="mb-6 space-y-2 text-5xl font-semibold">
                  <p className="text-white">COMPARECER AO</p>
                  <div className="rounded-3xl bg-[#008140] px-20 py-8 shadow-xl">
                    <p className="text-4xl font-black uppercase tracking-widest text-white md:text-5xl">
                      {currentCall.type === 'triage' ? (
                        <>ACOLHIMENTO</>
                      ) : (
                        <>{`CONSULTÓRIO ${currentCall.room?.toUpperCase()}`}</>
                      )}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-4xl text-gray-400">Aguardando chamadas...</p>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col bg-[#1a2535] md:w-80">
          <div className="border-b border-white/10 p-7">
            <h3 className="text-center text-base font-black uppercase tracking-widest text-white">Últimas Chamadas</h3>
          </div>
          <div className="flex-grow space-y-4 overflow-y-auto p-6">
            {previousCalls.length === 0 ? (
              <p className="text-center text-gray-400">Nenhuma chamada recente</p>
            ) : (
              previousCalls.map((call) => (
                <div
                  key={call.callId}
                  className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/10 p-5"
                >
                  <p className="text-lg font-black uppercase leading-tight break-words text-white">
                    {(call.patientName || '').toUpperCase()}
                  </p>
                  <p className="mt-1 text-base font-black uppercase text-[#ffcc00]">
                    {call.type === 'triage' ? 'Acolhimento' : call.room}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="overflow-hidden whitespace-nowrap border-t border-white/10 bg-[#0f1923] p-3 text-white">
        <div className="animate-marquee inline-block text-sm font-bold uppercase tracking-widest text-gray-400">
          SESA - Secretaria da Saúde do Estado do Ceará | Hospital de Saúde Mental Prof. Frota Pinto | Atendimento Humanizado e Eficiente | Ceará em Desenvolvimento
        </div>
      </footer>
    </div>
  );
}
