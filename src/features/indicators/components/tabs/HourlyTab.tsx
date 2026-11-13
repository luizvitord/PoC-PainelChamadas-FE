import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AttendanceTypeLabel } from '@/lib/attendanceTypes';
import { PRIORITY_CONFIG } from '@/types/patient';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import type { AtendidoPorHorario, TipoChamada } from '../../hooks/useAtendidosPorHorario';
import { dentroDaFaixa, diaEHoraDe, horaDe } from '../../utils/faixaHorario';
import {
  botaoContorno,
  caixaFiltro,
  campo,
  chip,
  COR_NIVEL,
  estadoVazio,
  nota,
  pontoCor,
  rotuloCampo,
  rotuloGrupo,
  tituloSecao,
} from '../estilos';
import { StatCard } from '../StatCard';

interface HourlyTabProps {
  atendidos?: AtendidoPorHorario[];
  carregando?: boolean;
  erro?: string;
}

const ROTULO_CHAMADA: Record<TipoChamada, string> = { TRIAGEM: 'Triagem', CONSULTORIO: 'Consultório' };

// Atalhos de turno do design novo.
const TURNOS = [
  { label: 'Madrugada', inicio: '00:00', fim: '05:59' },
  { label: 'Manhã', inicio: '06:00', fim: '11:59' },
  { label: 'Tarde', inicio: '12:00', fim: '17:59' },
  { label: 'Noite', inicio: '18:00', fim: '23:59' },
];

// IND-09: atendidos do período (BE-03) filtrados por faixa de hora da chamada ao consultório.
export function HourlyTab({ atendidos, carregando, erro }: HourlyTabProps) {
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [abertos, setAbertos] = useState<Set<number>>(() => new Set());

  const titulo = <h2 className={tituloSecao}>Pacientes Atendidos por Horário</h2>;

  if (erro) {
    return (
      <section>
        {titulo}
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-base font-semibold text-red-600">
          {erro}
        </p>
      </section>
    );
  }

  if (carregando || !atendidos || atendidos.length === 0) {
    return (
      <section>
        {titulo}
        <div className={estadoVazio}>{carregando ? 'Carregando atendidos…' : 'Sem dados para o período'}</div>
      </section>
    );
  }

  const naFaixa = atendidos.filter((atendido) => dentroDaFaixa(atendido.chamadaConsultorioAt, horaInicio, horaFim));
  const totalRechamadas = naFaixa.reduce((total, atendido) => total + atendido.rechamadas.length, 0);
  const aplicarFaixa = (inicio: string, fim: string) => {
    setHoraInicio(inicio);
    setHoraFim(fim);
  };
  const alternarAberto = (pacienteId: number) =>
    setAbertos((atual) => {
      const novo = new Set(atual);
      if (novo.has(pacienteId)) novo.delete(pacienteId);
      else novo.add(pacienteId);
      return novo;
    });

  return (
    <section>
      {titulo}

      <div className={`${caixaFiltro} mb-2`}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hora-inicio" className={rotuloCampo}>Hora Início</Label>
          <Input
            id="hora-inicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            className={`${campo} !w-36`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hora-fim" className={rotuloCampo}>Hora Fim</Label>
          <Input
            id="hora-fim"
            type="time"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            className={`${campo} !w-36`}
          />
        </div>

        <div className="flex min-h-11 flex-wrap items-center gap-2">
          <span className={rotuloGrupo}>Turno</span>
          {TURNOS.map(({ label, inicio, fim }) => (
            <button
              key={label}
              type="button"
              aria-pressed={horaInicio === inicio && horaFim === fim}
              onClick={() => aplicarFaixa(inicio, fim)}
              className={chip}
            >
              {label}
            </button>
          ))}
        </div>

        <Button type="button" variant="outline" onClick={() => aplicarFaixa('', '')} className={botaoContorno}>
          <RotateCcw className="h-4 w-4" />
          Todos os horários
        </Button>
      </div>

      <p className="mb-4 ml-1 text-[13px] font-bold italic text-slate-500">
        {horaInicio || horaFim
          ? `Faixa: ${horaInicio || '00:00'} às ${horaFim || '23:59'}`
          : 'Nenhuma faixa de horário selecionada — mostrando todos os atendidos.'}
      </p>

      <div role="status" className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:max-w-[66%]">
        <StatCard cor="green" label="Atendidos na faixa" valor={naFaixa.length} sub={`de ${atendidos.length} no período`} />
        <StatCard cor="orange" label="Total de rechamadas" valor={totalRechamadas} sub="nos atendidos da faixa" />
      </div>

      {naFaixa.length === 0 ? (
        <div className={estadoVazio}>Nenhum atendido nesta faixa de horário</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {naFaixa.map(({ pacienteId, prioridade, atendimento, chamadaConsultorioAt, rechamadas }) => {
            const aberto = abertos.has(pacienteId);
            return (
              <li
                key={pacienteId}
                className={`overflow-hidden rounded-[10px] border ${aberto ? 'border-[#4c51bf] bg-white' : 'border-slate-100 bg-slate-50'}`}
              >
                <button
                  type="button"
                  aria-expanded={aberto}
                  onClick={() => alternarAberto(pacienteId)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 text-left hover:bg-slate-100"
                >
                  <span className="flex min-w-[180px] flex-1 items-center gap-2.5 text-[16px] font-extrabold uppercase text-slate-800">
                    <span className={pontoCor} style={{ background: prioridade ? COR_NIVEL[prioridade] : '#cbd5e1' }} />
                    {prioridade ? `${PRIORITY_CONFIG[prioridade].label} — ${PRIORITY_CONFIG[prioridade].urgency}` : 'Sem classificação'}
                  </span>
                  <span className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                    {atendimento ? AttendanceTypeLabel[atendimento] : '—'}
                  </span>
                  <span className="text-[16px] font-bold tabular-nums text-slate-700">
                    {chamadaConsultorioAt ? diaEHoraDe(chamadaConsultorioAt) : '—'}
                  </span>
                  <span
                    className={`min-w-[7.5rem] text-right text-[14px] font-black tabular-nums ${rechamadas.length ? 'text-[#4c51bf]' : 'text-slate-300'}`}
                  >
                    {rechamadas.length}× rechamado
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                </button>

                {aberto && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-slate-200 px-4 pb-4 pt-3">
                    <span className="min-w-[150px] text-[12px] font-black uppercase tracking-[0.12em] text-slate-500">
                      Rechamadas
                    </span>
                    {rechamadas.length === 0 ? (
                      <span className="text-[13px] font-bold italic text-slate-500">Não foi rechamado.</span>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {rechamadas.map(({ tipo, criadaEm }) => (
                          <li
                            key={`${tipo}-${criadaEm}`}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[13px] font-medium tabular-nums text-slate-700"
                          >
                            {ROTULO_CHAMADA[tipo]} {horaDe(criadaEm)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className={nota}>
        O horário considerado é o da 1ª chamada ao consultório. Clique no paciente para ver em quais horários foi
        rechamado. Se a hora de início for maior que a de fim (ex.: 22:00 → 06:00), a faixa atravessa a meia-noite.
      </p>
    </section>
  );
}
