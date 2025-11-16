import { useEffect } from 'react';
import { usePatients } from '@/contexts/PatientContext';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Building2, Stethoscope } from 'lucide-react';

export default function PublicPanel() {
  const { recentCalls } = usePatients();
  const currentCall = recentCalls[0];
  const previousCalls = recentCalls.slice(1, 4);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-[1920px] mx-auto h-[1080px] flex flex-col">
        {/* Header */}
        <div className="border-b border-border pb-6 mb-8">
          <h1 className="text-5xl font-bold text-center">Emergency Room - Call Panel</h1>
        </div>

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
                    {currentCall.ticketNumber}
                  </div>
                  
                  {currentCall.priority && (
                    <div className="flex justify-center">
                      <PriorityBadge priority={currentCall.priority} className="text-3xl px-8 py-4" />
                    </div>
                  )}
                  
                  {currentCall.type === 'doctor' && currentCall.patientName && (
                    <div className="text-4xl font-semibold text-foreground">
                      {currentCall.patientName}
                    </div>
                  )}
                  
                  <div className="text-5xl font-semibold">
                    {currentCall.type === 'triage' ? (
                      <>
                        <p className="text-foreground">COMPARECER À</p>
                        <p className="text-primary mt-2">TRIAGEM</p>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground">COMPARECER AO</p>
                        <p className="text-primary mt-2">{currentCall.room?.toUpperCase()}</p>
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
                    key={`${call.ticketNumber}-${call.timestamp.getTime()}`}
                    className="bg-secondary p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{call.patientName}</span>
                      {call.priority && <PriorityBadge priority={call.priority} showLabel={false} />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {call.type === 'triage' ? 'Triagem' : call.room}
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
