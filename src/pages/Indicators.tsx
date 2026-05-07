import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePatients } from "@/contexts/PatientContext";
import { PriorityLevel } from "@/types/patient";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";

const PASSWORD = "1234";

const PRIORITY_ORDER: PriorityLevel[] = ["red", "orange", "yellow", "green", "blue"];

const PRIORITY_DOT_COLOR: Record<PriorityLevel, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
};

const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  red: "Emergência",
  orange: "Muito Urgente",
  yellow: "Urgente",
  green: "Pouco Urgente",
  blue: "Não Urgente",
};

export default function Indicators() {
  const { patients, getWaitingForDoctor, refreshPatients } = usePatients();
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem("indicators_unlocked") === "true");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem("indicators_unlocked", "true");
      setIsUnlocked(true);
    } else {
      setError(true);
      setPassword("");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPatients();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshPatients]);

  const waitingForDoctor = getWaitingForDoctor();
const totalAtendimentos = patients.length;

  const avgWaitMinutes = (() => {
    if (waitingForDoctor.length === 0) return null;
    const now = Date.now();
    const totalMs = waitingForDoctor.reduce((acc, p) => {
      const from = p.classifiedAt ? new Date(p.classifiedAt).getTime() : new Date(p.registeredAt).getTime();
      return acc + (now - from);
    }, 0);
    return Math.round(totalMs / waitingForDoctor.length / 60000);
  })();

  const countByPriority = PRIORITY_ORDER.reduce<Record<PriorityLevel, number>>(
    (acc, level) => {
      acc[level] = waitingForDoctor.filter((p) => p.priority === level).length;
      return acc;
    },
    { red: 0, orange: 0, yellow: 0, green: 0, blue: 0 }
  );

  const lastUpdate = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="Indicadores de Atendimento" />
          <div className="mx-auto w-full max-w-screen-2xl px-3 pt-6">
            <BackButton />
          </div>
        <div className="flex flex-col items-center justify-center px-4 py-24">
          <div className="w-full max-w-xl rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 border border-purple-100">
                <Lock className="h-7 w-7 text-purple-600" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-wide text-gray-800">Acesso Restrito</h2>
              <p className="text-center text-lg font-medium text-gray-500">Digite a senha para acessar os indicadores</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`h-12 text-base ${error ? "border-red-400 focus-visible:ring-red-300" : ""}`}
                autoFocus
              />
              {error && (
                <p className="text-base font-semibold text-red-500">Senha incorreta. Tente novamente.</p>
              )}
              <Button type="submit" className="h-12 text-base font-black uppercase tracking-wide bg-[#008140] hover:bg-[#005a2b]">
                Entrar
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Indicadores de Atendimento" />
      <div className="mx-auto w-full max-w-screen-2xl px-3 pt-6">
        <BackButton />
      </div>

      <div className="mx-auto w-full max-w-screen-2xl px-3 py-8">
        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-1.5 w-full rounded-t-2xl bg-green-500" />
            <div className="px-7 py-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                Total de Atendimentos
              </p>
              <p className="mt-3 text-5xl font-black text-gray-800">{totalAtendimentos}</p>
              <p className="mt-2 text-sm font-semibold text-gray-400">atendimentos hoje</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-1.5 w-full rounded-t-2xl bg-blue-500" />
            <div className="px-7 py-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                Tempo Médio de Espera
              </p>
              <p className="mt-3 text-5xl font-black text-gray-800">
                {avgWaitMinutes !== null ? avgWaitMinutes : "—"}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-400">minutos por paciente</p>
            </div>
          </div>
        </div>

        {/* Priority breakdown */}
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-gray-500">
            Atendimentos por Nível de Emergência
          </p>

          <div className="flex flex-col gap-3">
            {PRIORITY_ORDER.map((level) => (
              <div
                key={level}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-6 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${PRIORITY_DOT_COLOR[level]}`} />
                  <span className="text-base font-bold text-gray-700">{PRIORITY_LABEL[level]}</span>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">
                  {countByPriority[level]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-right text-xs italic text-gray-400">
          Última atualização: {lastUpdate}
        </p>
      </div>
    </div>
  );
}
