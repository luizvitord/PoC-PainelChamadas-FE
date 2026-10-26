import { useState, type ReactNode } from 'react';
import { useIndicadores } from '../hooks/useIndicadores';
import { useAtendidosPorHorario } from '../hooks/useAtendidosPorHorario';
import type { FiltrosIndicadores, Risco } from '../types';
import { CORES } from '../constants';
import { CadastradosCard } from './CadastradosCard';
import { ClassificadosCard } from './ClassificadosCard';
import { AtendidosCard } from './AtendidosCard';
import { IndicadorCard } from './IndicadorCard';
import { IndicadoresSkeleton } from './IndicadoresSkeleton';
import { Button } from '@/components/ui/button';

type Aba = 'volumes' | 'tempos' | 'nivel' | 'horarios';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'volumes', label: 'Volumes e fluxo' },
  { id: 'tempos', label: 'Tempos de espera' },
  { id: 'nivel', label: 'Por nível de emergência' },
  { id: 'horarios', label: 'Atendidos por horário' },
];

function ResumoCard({ titulo, valor, unidade, cor, compacto = false }: { titulo: string; valor: string; unidade: string; cor: string; compacto?: boolean }) {
  return <div className={`ind-stat-card border-t-4 ${compacto ? 'ind-stat-card-sm' : ''} ${cor}`}>
      <p className="ind-stat-label">{titulo}</p>
      <p className="ind-stat-value">{valor}</p>
      <p className="ind-stat-sub">{unidade}</p>
  </div>;
}

function formatarMinutos(valor: number | null) {
  return valor === null ? '—' : valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function formatarDuracao(valor: number | null) {
  if (valor === null) return '--:--:--';
  const segundos = Math.round(valor * 60);
  const horas = Math.floor(segundos / 3600).toString().padStart(2, '0');
  const minutos = Math.floor((segundos % 3600) / 60).toString().padStart(2, '0');
  const resto = (segundos % 60).toString().padStart(2, '0');
  return `${horas}:${minutos}:${resto}`;
}

export function IndicadoresResultados({ filtros, ...props }: FiltrosIndicadores & { filtros?: ReactNode }) {
  const [aba, setAba] = useState<Aba>('volumes');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [nivel, setNivel] = useState<'TODOS' | Risco>('TODOS');
  const [colunasNivel, setColunasNivel] = useState(() => new Set(['tempo', 'quantidade', 'rechamadas']));
  const query = useIndicadores(props);
  const horariosQuery = useAtendidosPorHorario(props.inicio, props.fim, props.escopo ?? 'GERAL', aba === 'horarios');
  // Também oculta dados em cache ao revisitar um filtro e durante atualização.
  if (query.isPending || query.isFetching) return <div className="space-y-7"><IndicadoresSkeleton />{filtros}</div>;
  if (query.isError) return <div className="space-y-7">{filtros}<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
    <p>{query.error.message}</p>
    <Button className="mt-4" onClick={() => query.refetch()}>Tentar novamente</Button>
  </div></div>;
  const { data } = query;
  return <section aria-label="Resultados dos indicadores">
    <div className="ind-summary-grid">
      <ResumoCard titulo="Total de atendimentos" valor={data.atendidos.toLocaleString('pt-BR')} unidade="atendimentos no período" cor="border-t-[#008140]" />
      <ResumoCard titulo="Tempo médio de espera" valor={formatarMinutos(data.tempoMedioEntradaAteMedicoMinutos)} unidade="minutos por paciente" cor="border-t-indigo-600" />
    </div>

    {filtros}

    <nav className="ind-filter-tabs" aria-label="Seções dos indicadores">
      {ABAS.map(item => <button key={item.id} type="button" onClick={() => setAba(item.id)} aria-pressed={aba === item.id}
        className={`ind-filter-tab ${aba === item.id ? 'active' : ''}`}>
        {item.label}
      </button>)}
    </nav>

    {data.cadastrados === 0 ? <p role="status" className="rounded-2xl border bg-white p-10 text-center font-medium text-slate-500">Sem dados no período</p> : <>
      {aba === 'volumes' && <div>
        <div><h2 className="ind-section-title">Volumes e fluxo de atendimento</h2>
          <div className="ind-volume-grid">
            <CadastradosCard quantidade={data.cadastrados} />
            <ClassificadosCard quantidade={data.classificados} percentual={data.percentualClassificados} />
            <AtendidosCard quantidade={data.atendidos} percentual={data.percentualAtendidos} />
          </div></div>
        <div className="mt-[1.2rem]"><h2 className="ind-section-title">Desistências entre etapas</h2>
          <div className="ind-volume-grid">
            <IndicadorCard titulo="Desistentes: acolhimento → classificação" quantidade={Math.max(data.cadastrados - data.classificados, 0)} descricao={`${(100 - data.percentualClassificados).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% dos cadastrados · cadastrados − classificados`} className="border-t-red-500" />
            <IndicadorCard titulo="Desistentes: classificação → consulta" quantidade={Math.max(data.classificados - data.atendidos, 0)} descricao={`${data.classificados ? ((data.classificados - data.atendidos) / data.classificados * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : 0}% dos classificados · classificados − atendidos`} className="border-t-orange-500" />
          </div></div>
      </div>}

      {aba === 'tempos' && <div><h2 className="ind-section-title">Tempos de espera</h2>
        <div className="ind-volume-grid">
          <ResumoCard compacto titulo="Espera p/ acolhimento / classificação" valor={formatarDuracao(data.tempoMedioAcolhimentoMinutos)} unidade="entrada (NAC) → início da classificação de risco" cor="border-t-yellow-500" />
          <ResumoCard compacto titulo="Espera p/ 1º atendimento médico" valor={formatarDuracao(data.tempoMedioClassificacaoAteMedicoMinutos)} unidade="fim da classificação → início do atendimento médico" cor="border-t-orange-500" />
          <ResumoCard compacto titulo="Espera total (NAC → médico)" valor={formatarDuracao(data.tempoMedioEntradaAteMedicoMinutos)} unidade="entrada (NAC / ficha) → início do atendimento médico" cor="border-t-red-500" />
        </div></div>}

      {aba === 'nivel' && <div><h2 className="ind-section-title">Por nível de emergência</h2>
        <div className="ind-nivel-filters">
          <div className="ind-nf-group"><span className="ind-nf-label">Exibir</span>{[['tempo','Tempo'],['quantidade','Quantidade atendida'],['rechamadas','Rechamadas']].map(([id, nome]) => <button key={id} type="button" onClick={() => setColunasNivel(atuais => { const novas = new Set(atuais); novas.has(id) ? novas.delete(id) : novas.add(id); return novas; })} className={`ind-chip ${colunasNivel.has(id) ? 'active' : ''}`}>{nome}</button>)}</div>
          <div className="ind-nf-group"><span className="ind-nf-label">Nível</span><button type="button" onClick={() => setNivel('TODOS')} className={`ind-chip ${nivel === 'TODOS' ? 'active' : ''}`}>Todos</button>{CORES.map(cor => <button key={cor.risco} type="button" onClick={() => setNivel(cor.risco)} className={`ind-chip ${nivel === cor.risco ? 'active' : ''}`}><span className={`h-2.5 w-2.5 rounded-full ${cor.ponto}`} />{cor.nome}</button>)}</div>
        </div>
        <div className="ind-level-sections">{[
          { tipo: 'PSIQUIATRICO', titulo: 'Classificação de risco psiquiátrico', riscos: CORES, cor: '#4c51bf' },
          { tipo: 'CLINICO', titulo: 'Classificação de risco clínico', riscos: CORES.slice(0, 2), cor: '#3182ce' },
        ].map(secao => {
          const riscos = secao.riscos.filter(cor => nivel === 'TODOS' || nivel === cor.risco);
          if (!riscos.length || (!colunasNivel.has('tempo') && !colunasNivel.has('quantidade'))) return null;
          const total = riscos.reduce((soma, cor) => soma + (data.porRiscoETipo.find(item => item.risco === cor.risco && item.tipo === secao.tipo)?.totalComProtocolo ?? 0), 0);
          return <section key={secao.tipo} className="ind-section-card"><header className="ind-section-card-header"><span className="ind-section-card-header-bar" style={{ background: secao.cor }} /><h3>{secao.titulo}</h3>{colunasNivel.has('quantidade') && <span className="ind-sec-total">{total} atendidos</span>}</header><div className="overflow-x-auto"><table className="ind-lvl-table"><thead><tr><th>Nível</th>{colunasNivel.has('quantidade') && <th>Atendidos</th>}{colunasNivel.has('tempo') && <><th>Tempo médio de espera</th><th>% fora do tempo de protocolo</th></>}</tr></thead><tbody>{riscos.map(cor => { const item = data.porRiscoETipo.find(detalhe => detalhe.risco === cor.risco && detalhe.tipo === secao.tipo); return <tr key={cor.risco}><td><span className={`ind-metric-row-dot ${cor.ponto}`} />{cor.nome}{cor.risco === 'VERMELHO' ? ' — Emergência' : cor.risco === 'LARANJA' ? ' — Muito Urgente' : cor.risco === 'AMARELO' ? ' — Urgente' : cor.risco === 'VERDE' ? ' — Pouco Urgente' : ' — Não Urgente'}</td>{colunasNivel.has('quantidade') && <td>{item?.totalComProtocolo ?? 0}</td>}{colunasNivel.has('tempo') && <><td>{formatarDuracao(item?.tempoMedioEsperaMinutos ?? null)}</td><td>{item ? `${item.percentualForaDoPrazo.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%` : '—'}<span className="ind-lvl-meta">({item?.totalComProtocolo ?? 0})</span></td></>}</tr>; })}</tbody></table></div></section>;
        })}</div>
        {colunasNivel.has('rechamadas') && <div className="mt-[1.2rem]"><h2 className="ind-section-title">Rechamadas no painel</h2><div className="ind-volume-grid"><IndicadorCard titulo="Pacientes rechamados" quantidade={Object.values(data.pacientesRechamadosPorRisco).reduce((soma, valor) => soma + valor, 0)} className="border-t-indigo-600" /><IndicadorCard titulo="Total de rechamadas" quantidade={data.totalRechamadas} className="border-t-orange-500" /></div></div>}
        </div>}

      {aba === 'horarios' && (() => {
        const paraMinutos = (hora: string) => hora ? Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5)) : null;
        const inicioMin = paraMinutos(horaInicio);
        const fimMin = paraMinutos(horaFim);
        const naFaixa = (data: string) => {
          const valor = new Date(data);
          const minuto = valor.getHours() * 60 + valor.getMinutes();
          if (inicioMin === null && fimMin === null) return true;
          if (inicioMin !== null && fimMin !== null && inicioMin > fimMin) return minuto >= inicioMin || minuto <= fimMin;
          return (inicioMin === null || minuto >= inicioMin) && (fimMin === null || minuto <= fimMin);
        };
        const todos = horariosQuery.data ?? [];
        const pacientes = todos.filter(paciente => naFaixa(paciente.chamadaConsultorioAt));
        const rechamadas = pacientes.reduce((total, paciente) => total + paciente.rechamadasConsultorioCount, 0);
        const preset = (inicio: string, fim: string) => { setHoraInicio(inicio); setHoraFim(fim); };
        return <div><h2 className="ind-section-title">Pacientes atendidos por horário</h2>
          <div className="ind-hr-filters">
            <label className="space-y-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Hora início<input aria-label="Hora início" type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="block h-10 min-w-32 rounded-lg border bg-white px-3 text-sm font-medium normal-case tracking-normal" /></label>
            <label className="space-y-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Hora fim<input aria-label="Hora fim" type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} className="block h-10 min-w-32 rounded-lg border bg-white px-3 text-sm font-medium normal-case tracking-normal" /></label>
            <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">Turno</span>
              {[['Madrugada','00:00','05:59'],['Manhã','06:00','11:59'],['Tarde','12:00','17:59'],['Noite','18:00','23:59']].map(([nome, inicio, fim]) => <button key={nome} type="button" onClick={() => preset(inicio, fim)} className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-slate-600 hover:bg-slate-200">{nome}</button>)}
            </div>
            <button type="button" onClick={() => preset('', '')} className="h-10 rounded-lg border-2 border-slate-200 bg-white px-4 text-xs font-bold uppercase tracking-wide text-slate-700">Limpar horário</button>
          </div>
          <p className="ind-hr-info">{horaInicio || horaFim ? `Faixa: ${horaInicio || '00:00'} às ${horaFim || '23:59'}` : 'Nenhuma faixa de horário selecionada — mostrando todos os atendidos.'}</p>
          {horariosQuery.isPending ? <p role="status" className="rounded-xl border bg-white p-6 text-slate-500">Carregando atendimentos...</p> : horariosQuery.isError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{horariosQuery.error.message}</p> : <>
            <div className="mb-4 grid gap-4 md:grid-cols-3"><IndicadorCard titulo="Atendidos na faixa" quantidade={pacientes.length} descricao={`de ${todos.length} no período`} className="border-t-[#008140]" /><IndicadorCard titulo="Total de rechamadas" quantidade={rechamadas} className="border-t-orange-500" /></div>
          </>}
        </div>;
      })()}
    </>}

    <p className="ind-last-update">Última atualização: <time>{new Date(query.dataUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</time></p>
  </section>;
}
