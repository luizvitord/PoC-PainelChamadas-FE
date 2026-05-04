import { useEffect, useState } from 'react';

interface CalledPatientTimerProps {
  calledAt: number;
}

export function CalledPatientTimer({ calledAt }: CalledPatientTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - calledAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [calledAt]);

  const minutes   = Math.floor(elapsed / 60);
  const seconds   = elapsed % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isWarning  = elapsed >= 120;
  const isDanger   = elapsed >= 180;
  const progress   = Math.min((elapsed / 180) * 100, 100);
  const statusText = isDanger ? "Considere rechamar" : isWarning ? "Aguardando resposta" : "Aguardando chegada";

  const borderColor = isDanger ? 'border-red-200'  : isWarning ? 'border-yellow-200' : 'border-green-200';
  const bgColor     = isDanger ? 'bg-red-50'       : isWarning ? 'bg-yellow-50'      : 'bg-green-50';
  const barColor    = isDanger ? 'bg-red-500'      : isWarning ? 'bg-yellow-400'     : 'bg-green-500';
  const timerColor  = isDanger ? 'text-red-500'    : isWarning ? 'text-yellow-500'   : 'text-green-500';

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors duration-500 ${borderColor} ${bgColor}`}>
      <div className="h-1 w-full bg-slate-200">
        <div
          className={`h-full rounded-r-sm transition-all duration-1000 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Tempo desde a chamada
          </div>
          <div className="text-[10px] text-slate-400">{statusText}</div>
        </div>
        <div className={`text-3xl font-black tabular-nums ${timerColor}`}>
          {formatted}
        </div>
      </div>
    </div>
  );
}