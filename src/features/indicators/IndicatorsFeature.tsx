import { useState } from 'react';
import { Input } from '@/components/ui/input';
import type { Escopo } from './types';
import { dataParaLocalDateTime, toLocalDateTime } from './utils/localDateTime';
import { IndicadoresResultados } from './components/IndicadoresResultados';

export function IndicatorsFeature() {
  const hoje = toLocalDateTime(new Date()).slice(0, 10);
  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  const [escopo, setEscopo] = useState<Escopo>('GERAL');
  let erro: string | undefined;
  let inicioLocal = '', fimLocal = '';
  try {
    inicioLocal = dataParaLocalDateTime(inicio, 'inicio');
    fimLocal = dataParaLocalDateTime(fim, 'fim');
    if (inicioLocal > fimLocal) erro = 'A data inicial deve ser anterior ou igual à data final.';
  } catch { erro = 'Informe as duas datas do período.'; }
  return <main className="mx-auto max-w-7xl space-y-8 p-6">
    <div><h1 className="text-3xl font-bold text-slate-900">Indicadores</h1>
      <p className="mt-2 text-slate-600">Acompanhe os pacientes por período de chegada.</p></div>
    <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-5">
      <label className="space-y-2">Data inicial<Input type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></label>
      <label className="space-y-2">Data final<Input type="date" value={fim} onChange={e => setFim(e.target.value)} /></label>
      <label className="space-y-2">Visão<select className="block h-10 rounded-md border px-4" value={escopo} onChange={e => setEscopo(e.target.value as Escopo)}>
        <option value="GERAL">Geral</option><option value="SAMU">SAMU</option>
      </select></label>
    </div>
    {erro ? <p role="alert">{erro}</p> : <IndicadoresResultados inicio={inicioLocal} fim={fimLocal} escopo={escopo} />}
  </main>;
}
