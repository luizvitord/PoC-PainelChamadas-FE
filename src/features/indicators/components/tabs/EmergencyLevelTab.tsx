import { PriorityBadge } from '@/components/PriorityBadge';
import { AttendanceType, AttendanceTypeLabel } from '@/lib/attendanceTypes';
import { getAvailablePriorities } from '@/lib/priorityRules';
import { riscoParaPrioridade } from '@/lib/utils/riscoParaPrioridade';
import { tipoParaAtendimento } from '@/lib/utils/tipoParaAtendimento';
import { PRIORITY_CONFIG, PriorityLevel } from '@/types/patient';
import { ProtocoloTempo } from '@/types/protocolo';
import { useState } from 'react';

import { Escopo } from '../../utils/escopo';
import { formatarMinutos } from '../../utils/formatarMinutos';
import { formatarPercentual } from '../../utils/formatarPercentual';

// Só os campos usados do IndicadoresResponse.Detalhamento; será trocado pelo Detalhamento do IND-01.
export interface DetalhamentoNivel {
  risco: string;
  tipo: string;
  tempoMedioEsperaMinutos: number | null;
  totalComProtocolo: number;
  percentualForaDoPrazo: number;
}

interface EmergencyLevelTabProps {
  porRiscoETipo?: DetalhamentoNivel[];
  escopo?: Escopo;
  protocolos?: ProtocoloTempo[];
}

interface LinhaNivel {
  prioridade: PriorityLevel;
  atendimento: AttendanceType;
  detalhamento: DetalhamentoNivel;
}

type Coluna = 'tempoMedio' | 'percentualFora' | 'total';

const COLUNAS: { id: Coluna; label: string }[] = [
  { id: 'tempoMedio', label: 'Tempo médio' },
  { id: 'percentualFora', label: '% fora do protocolo' },
  { id: 'total', label: 'Total (n)' },
];

// Ordem de exibição dos cards; as combinações válidas vêm do protocolo (GET /protocolos).
const ORDEM_ATENDIMENTO: AttendanceType[] = ['psychiatric', 'clinical', 'samu'];

// O back manda as 15 combinações cor × tipo: fica só o que pertence ao escopo e existe no protocolo.
function montarLinhas(porRiscoETipo: DetalhamentoNivel[], escopo: Escopo, protocolos: ProtocoloTempo[]): LinhaNivel[] {
  return porRiscoETipo
    .flatMap((detalhamento) => {
      const prioridade = riscoParaPrioridade(detalhamento.risco);
      const atendimento = tipoParaAtendimento(detalhamento.tipo);
      if (!prioridade || !atendimento) return [];
      if ((atendimento === 'samu') !== (escopo === 'SAMU')) return [];
      if (!getAvailablePriorities(protocolos, atendimento).includes(prioridade)) return [];
      return [{ prioridade, atendimento, detalhamento }];
    })
    .sort((a, b) => PRIORITY_CONFIG[a.prioridade].order - PRIORITY_CONFIG[b.prioridade].order);
}

const alternar = <T,>(conjunto: Set<T>, item: T) => {
  const novo = new Set(conjunto);
  if (novo.has(item)) novo.delete(item);
  else novo.add(item);
  return novo;
};

const titleClassName =
  'mb-4 border-b-2 border-gray-100 pb-2 text-sm font-black uppercase tracking-[0.18em] text-gray-500';
const filtroLabelClassName = 'text-xs font-black uppercase tracking-[0.18em] text-gray-500';
const colunaChipClassName =
  'rounded-lg border px-4 py-2 text-sm font-black uppercase tracking-[0.08em] transition-colors aria-pressed:border-[#008140] aria-pressed:bg-[#008140] aria-pressed:text-white aria-[pressed=false]:border-gray-200 aria-[pressed=false]:bg-gray-100 aria-[pressed=false]:text-gray-400 aria-[pressed=false]:line-through';
const thClassName = 'px-6 py-4 text-sm font-black uppercase tracking-wider text-gray-600';

export function EmergencyLevelTab({ porRiscoETipo, escopo = 'GERAL', protocolos }: EmergencyLevelTabProps) {
  const [niveisOcultos, setNiveisOcultos] = useState<Set<PriorityLevel>>(() => new Set());
  const [colunasOcultas, setColunasOcultas] = useState<Set<Coluna>>(() => new Set());

  const linhas = montarLinhas(porRiscoETipo ?? [], escopo, protocolos ?? []);

  if (linhas.length === 0) {
    return (
      <section>
        <h2 className={titleClassName}>Por Nível de Emergência</h2>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-black uppercase tracking-[0.15em] text-gray-300">
          Sem dados para o período
        </div>
      </section>
    );
  }

  const niveis = [...new Set(linhas.map((linha) => linha.prioridade))];
  const atendimentos = ORDEM_ATENDIMENTO.filter((atendimento) => linhas.some((linha) => linha.atendimento === atendimento));
  const colunasVisiveis = COLUNAS.filter((coluna) => !colunasOcultas.has(coluna.id));

  return (
    <section>
      <h2 className={titleClassName}>Por Nível de Emergência</h2>

      <div className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={filtroLabelClassName}>Níveis</span>
          {niveis.map((nivel) => (
            <button
              key={nivel}
              type="button"
              aria-pressed={!niveisOcultos.has(nivel)}
              aria-label={`Nível ${PRIORITY_CONFIG[nivel].label}`}
              onClick={() => setNiveisOcultos((atual) => alternar(atual, nivel))}
              className="rounded-full transition-opacity aria-[pressed=false]:opacity-30 aria-[pressed=false]:grayscale"
            >
              <PriorityBadge priority={nivel} className="px-4 py-1.5 text-sm font-black uppercase tracking-wide" />
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={filtroLabelClassName}>Colunas</span>
          {COLUNAS.map((coluna) => (
            <button
              key={coluna.id}
              type="button"
              aria-pressed={!colunasOcultas.has(coluna.id)}
              onClick={() => setColunasOcultas((atual) => alternar(atual, coluna.id))}
              className={colunaChipClassName}
            >
              {coluna.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {atendimentos.map((atendimento) => {
          const linhasVisiveis = linhas.filter(
            (linha) => linha.atendimento === atendimento && !niveisOcultos.has(linha.prioridade),
          );

          return (
            <div key={atendimento} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center space-x-3 border-b border-gray-100 bg-gray-50 px-6 py-5">
                <div className="h-6 w-1.5 rounded-full bg-[#008140]" />
                <h3 className="text-xl font-black uppercase tracking-wider text-gray-800">{AttendanceTypeLabel[atendimento]}</h3>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className={thClassName}>Nível</th>
                    {colunasVisiveis.map((coluna) => (
                      <th key={coluna.id} className={`${thClassName} text-right`}>{coluna.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {linhasVisiveis.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colunasVisiveis.length + 1}
                        className="px-6 py-8 text-center text-sm font-black uppercase tracking-[0.15em] text-gray-300"
                      >
                        Nenhum nível selecionado
                      </td>
                    </tr>
                  ) : (
                    linhasVisiveis.map(({ prioridade, detalhamento }) => (
                      <tr key={prioridade}>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={prioridade} className="px-3 py-1 text-sm font-black uppercase tracking-wide" />
                        </td>
                        {colunasVisiveis.map((coluna) => (
                          <td key={coluna.id} className="px-6 py-4 text-right text-lg font-bold tabular-nums text-gray-800">
                            {coluna.id === 'tempoMedio' && formatarMinutos(detalhamento.tempoMedioEsperaMinutos)}
                            {coluna.id === 'percentualFora' && formatarPercentual(detalhamento.percentualForaDoPrazo)}
                            {coluna.id === 'total' && <span className="text-gray-500">({detalhamento.totalComProtocolo})</span>}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </section>
  );
}
