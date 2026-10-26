import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { dataParaLocalDateTime, toLocalDateTime } from './utils/localDateTime';
import { IndicadoresResultados } from './components/IndicadoresResultados';
import './indicators-designer.css';

export function IndicatorsFeature() {
  const hoje = toLocalDateTime(new Date()).slice(0, 10);
  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  let erro: string | undefined;
  let inicioLocal = '', fimLocal = '';
  try {
    inicioLocal = dataParaLocalDateTime(inicio, 'inicio');
    fimLocal = dataParaLocalDateTime(fim, 'fim');
    if (inicioLocal > fimLocal) erro = 'A data inicial deve ser anterior ou igual à data final.';
  } catch { erro = 'Informe as duas datas do período.'; }
  const limparPeriodo = () => {
    const hojeAtual = toLocalDateTime(new Date()).slice(0, 10);
    setInicio(hojeAtual);
    setFim(hojeAtual);
  };
  const filtros = <section className="ind-date-filter" aria-label="Filtros dos indicadores">
      <label className="form-group"><span className="form-label">Data início</span><Input aria-label="Data inicial" className="form-input" type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></label>
      <label className="form-group"><span className="form-label">Data fim</span><Input aria-label="Data final" className="form-input" type="date" value={fim} onChange={e => setFim(e.target.value)} /></label>
      <button type="button" onClick={limparPeriodo} className="btn-outline">Limpar período</button>
    </section>;
  return <main className="designer-indicators mx-auto w-full max-w-[1100px] px-6 py-8">
    {erro ? <><div className="mb-7">{filtros}</div><p role="alert">{erro}</p></> : <IndicadoresResultados inicio={inicioLocal} fim={fimLocal} escopo="GERAL" filtros={filtros} />}
  </main>;
}
