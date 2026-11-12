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
import { caixaFiltro, cartao, chip, COR_NIVEL, estadoVazio, pontoCor, rotuloGrupo, tituloSecao } from '../estilos';

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

// Barra colorida do cabeçalho de cada card, como no design novo.
const COR_ATENDIMENTO: Record<AttendanceType, string> = {
  psychiatric: '#4c51bf',
  clinical: '#3182ce',
  samu: '#dd6b20',
};

const thClassName = 'px-4 py-2.5 text-right text-[12px] font-black uppercase tracking-[0.12em] text-slate-500 first:text-left';

export function EmergencyLevelTab({ porRiscoETipo, escopo = 'GERAL', protocolos }: EmergencyLevelTabProps) {
  const [niveisOcultos, setNiveisOcultos] = useState<Set<PriorityLevel>>(() => new Set());
  const [colunasOcultas, setColunasOcultas] = useState<Set<Coluna>>(() => new Set());

  const linhas = montarLinhas(porRiscoETipo ?? [], escopo, protocolos ?? []);

  if (linhas.length === 0) {
    return (
      <section>
        <h2 className={tituloSecao}>Por Nível de Emergência</h2>
        <div className={estadoVazio}>Sem dados para o período</div>
      </section>
    );
  }

  const niveis = [...new Set(linhas.map((linha) => linha.prioridade))];
  const atendimentos = ORDEM_ATENDIMENTO.filter((atendimento) => linhas.some((linha) => linha.atendimento === atendimento));
  const colunasVisiveis = COLUNAS.filter((coluna) => !colunasOcultas.has(coluna.id));

  return (
    <section>
      <h2 className={tituloSecao}>Por Nível de Emergência</h2>

      <div className={`${caixaFiltro} mb-4 flex-col !items-start !gap-3`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={rotuloGrupo}>Exibir</span>
          {COLUNAS.map((coluna) => (
            <button
              key={coluna.id}
              type="button"
              aria-pressed={!colunasOcultas.has(coluna.id)}
              onClick={() => setColunasOcultas((atual) => alternar(atual, coluna.id))}
              className={chip}
            >
              {coluna.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={rotuloGrupo}>Nível</span>
          {niveis.map((nivel) => (
            <button
              key={nivel}
              type="button"
              aria-pressed={!niveisOcultos.has(nivel)}
              aria-label={`Nível ${PRIORITY_CONFIG[nivel].label}`}
              onClick={() => setNiveisOcultos((atual) => alternar(atual, nivel))}
              className={chip}
            >
              <span className={`${pontoCor} ring-2 ring-white/70`} style={{ background: COR_NIVEL[nivel] }} />
              {PRIORITY_CONFIG[nivel].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {atendimentos.map((atendimento) => {
          const linhasVisiveis = linhas.filter(
            (linha) => linha.atendimento === atendimento && !niveisOcultos.has(linha.prioridade),
          );

          return (
            <div key={atendimento} className={cartao}>
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="h-[22px] w-1.5 flex-shrink-0 rounded" style={{ background: COR_ATENDIMENTO[atendimento] }} />
                <h3 className="text-[16px] font-black uppercase tracking-[0.14em] text-slate-800">
                  Classificação de risco {AttendanceTypeLabel[atendimento]}
                </h3>
              </div>

              <div className="relative overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className={thClassName}>Nível</th>
                      {colunasVisiveis.map((coluna) => (
                        <th key={coluna.id} className={thClassName}>{coluna.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {linhasVisiveis.length === 0 ? (
                      <tr>
                        <td
                          colSpan={colunasVisiveis.length + 1}
                          className="px-4 py-7 text-center text-[13px] font-black uppercase tracking-[0.15em] text-slate-300"
                        >
                          Nenhum nível selecionado
                        </td>
                      </tr>
                    ) : (
                      linhasVisiveis.map(({ prioridade, detalhamento }) => (
                        <tr key={prioridade}>
                          <td className="whitespace-nowrap px-4 py-3 text-[16px] font-bold text-slate-700">
                            <span className="flex items-center gap-2.5">
                              <span className={pontoCor} style={{ background: COR_NIVEL[prioridade] }} />
                              {PRIORITY_CONFIG[prioridade].label} — {PRIORITY_CONFIG[prioridade].urgency}
                            </span>
                          </td>
                          {colunasVisiveis.map((coluna) => (
                            <td
                              key={coluna.id}
                              className="whitespace-nowrap px-4 py-3 text-right text-[17px] font-bold tabular-nums text-slate-800"
                            >
                              {coluna.id === 'tempoMedio' && formatarMinutos(detalhamento.tempoMedioEsperaMinutos)}
                              {coluna.id === 'percentualFora' && formatarPercentual(detalhamento.percentualForaDoPrazo)}
                              {coluna.id === 'total' && <span className="text-slate-400">({detalhamento.totalComProtocolo})</span>}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
