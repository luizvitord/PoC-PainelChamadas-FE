import { useEffect, useRef } from 'react';
import { usePatients } from '@/contexts/PatientContext';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Building2, Stethoscope } from 'lucide-react';

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
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

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


  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-[1920px] mx-auto h-[1080px] flex flex-col">
        {/* Header precisa de header? */}
        {/* <div className="border-b border-border pb-6 mb-8">
          <h1 className="text-5xl font-bold text-center">Painel de Chamadas</h1>
        </div> */}

        <div className="flex gap-8 flex-1">
          {/* Main Call Display */}
          <div className="flex-1 flex items-center justify-center">
            {currentCall ? (
              <div className="text-center space-y-8 p-12 border-2 border-primary rounded-3xl bg-card w-full max-w-4xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    {currentCall.type === 'triage' ? (
                      <Stethoscope className="h-16 w-16 text-primary" />
                    ) : (
                      <Building2 className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  
                  <div className="text-8xl font-bold text-primary animate-pulse">
                    {currentCall.patientName}
                  </div>
                  
                  {/* Priority Badge - currently commented out */}
                  {/* {currentCall.priority && currentCall.type !== 'triage' && (
                    <div className="flex justify-center">
                      <PriorityBadge priority={currentCall.priority} className="text-3xl px-8 py-4" />
                    </div>
                  )} */}
                  
                  <div className="text-5xl font-semibold">
                    {currentCall.type === 'triage' ? (
                      <>
                        <p className="text-foreground">COMPARECER AO</p>
                        <p className="text-primary mt-2">ACOLHIMENTO</p>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground">COMPARECER AO</p>
                        <p className="text-primary mt-2">{`CONSULTÓRIO ${currentCall.room?.toUpperCase()}`}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-4xl">Aguardando chamadas...</p>
              </div>
            )}
          </div>

          {/* Recent Calls Sidebar */}
          <div className="w-96 bg-card border border-border rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Últimas Chamadas</h2>
            <div className="space-y-4">
              {previousCalls.length === 0 ? (
                <p className="text-muted-foreground text-center">Nenhuma chamada recente</p>
              ) : (
                previousCalls.map((call, index) => (
                  <div
                    key={`${call.callId}`}
                    className="bg-secondary p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{call.patientName}</span>
                      {/*priority*/}
                      {/* {call.priority && call.type !== 'triage' && (
                        <PriorityBadge priority={call.priority} showLabel={false} />
                      )} */}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {call.type === 'triage' ? 'Acolhimento' : call.room}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {call.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
