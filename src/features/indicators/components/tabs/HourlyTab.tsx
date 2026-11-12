import { PriorityBadge } from '@/components/PriorityBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AttendanceTypeLabel } from '@/lib/attendanceTypes';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

import type { AtendidoPorHorario, TipoChamada } from '../../hooks/useAtendidosPorHorario';
import { dentroDaFaixa, diaEHoraDe, horaDe } from '../../utils/faixaHorario';

interface HourlyTabProps {
  atendidos?: AtendidoPorHorario[];
  carregando?: boolean;
  erro?: string;
}

const ROTULO_CHAMADA: Record<TipoChamada, string> = { TRIAGEM: 'Triagem', CONSULTORIO: 'Consultório' };

const titleClassName =
  'mb-4 border-b-2 border-gray-100 pb-2 text-sm font-black uppercase tracking-[0.18em] text-gray-500';
const labelClassName = 'text-xs font-black uppercase tracking-[0.18em] text-gray-500';
const estadoClassName =
  'rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-black uppercase tracking-[0.15em] text-gray-300';
const thClassName = 'px-6 py-4 text-sm font-black uppercase tracking-wider text-gray-600';

// IND-09: atendidos do período (BE-03) filtrados por faixa de hora da chamada ao consultório.
export function HourlyTab({ atendidos, carregando, erro }: HourlyTabProps) {
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');

  const titulo = <h2 className={titleClassName}>Pacientes Atendidos por Horário</h2>;

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
        <div className={estadoClassName}>{carregando ? 'Carregando atendidos…' : 'Sem dados para o período'}</div>
      </section>
    );
  }

  const naFaixa = atendidos.filter((atendido) => dentroDaFaixa(atendido.chamadaConsultorioAt, horaInicio, horaFim));
  const totalRechamadas = naFaixa.reduce((total, atendido) => total + atendido.rechamadas.length, 0);

  return (
    <section>
      {titulo}

      <div className="mb-6 flex flex-wrap items-end gap-6 rounded-2xl border border-gray-100 bg-white px-7 py-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <Label htmlFor="hora-inicio" className={labelClassName}>Hora Início</Label>
          <Input
            id="hora-inicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            className="h-12 w-40 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hora-fim" className={labelClassName}>Hora Fim</Label>
          <Input
            id="hora-fim"
            type="time"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            className="h-12 w-40 text-base"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setHoraInicio('');
            setHoraFim('');
          }}
          className="h-12 rounded-lg border-2 border-gray-200 px-6 text-base font-black uppercase tracking-wide text-gray-700 hover:border-gray-300 hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" />
          Todos os horários
        </Button>

        <p role="status" className="ml-auto text-base font-semibold text-gray-500">
          <span className="text-2xl font-black text-gray-800">{naFaixa.length}</span> atendidos
          {' · '}
          <span className="text-2xl font-black text-gray-800">{totalRechamadas}</span> rechamadas
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className={thClassName}>Chamada ao médico</th>
              <th className={thClassName}>Nível</th>
              <th className={thClassName}>Tipo</th>
              <th className={thClassName}>Rechamadas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {naFaixa.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm font-black uppercase tracking-[0.15em] text-gray-300">
                  Nenhum atendido nesta faixa de horário
                </td>
              </tr>
            ) : (
              naFaixa.map(({ pacienteId, prioridade, atendimento, chamadaConsultorioAt, rechamadas }) => (
                <tr key={pacienteId}>
                  <td className="px-6 py-4 text-lg font-bold tabular-nums text-gray-800">
                    {chamadaConsultorioAt ? diaEHoraDe(chamadaConsultorioAt) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {prioridade ? (
                      <PriorityBadge priority={prioridade} label="color" />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-base font-bold uppercase tracking-wide text-gray-700">
                    {atendimento ? AttendanceTypeLabel[atendimento] : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {rechamadas.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {rechamadas.map(({ tipo, criadaEm }) => (
                          <li
                            key={`${tipo}-${criadaEm}`}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-bold tabular-nums text-gray-700"
                          >
                            {ROTULO_CHAMADA[tipo]} {horaDe(criadaEm)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
