import { useState } from 'react';

import { dataParaLocalDateTime, toLocalDateTime } from '../utils/localDateTime';

/** Período no formato LocalDateTime do back: é exatamente o que vai para o useIndicadores (IND-01). */
export interface Periodo {
  inicio: string;
  fim: string;
}

interface EstadoPeriodo {
  dataInicio: string;
  dataFim: string;
  erro?: string;
  periodo: Periodo;
}

// Dia civil local (YYYY-MM-DD); nunca via toISOString, que usaria UTC.
const hoje = () => toLocalDateTime(new Date()).slice(0, 10);

function validarPeriodo(dataInicio: string, dataFim: string): { periodo?: Periodo; erro?: string } {
  let periodo: Periodo;
  try {
    periodo = {
      inicio: dataParaLocalDateTime(dataInicio, 'inicio'),
      fim: dataParaLocalDateTime(dataFim, 'fim'),
    };
  } catch {
    return { erro: 'Informe as duas datas.' };
  }

  // O back devolve 400 para período invertido; datas iguais são válidas.
  if (dataInicio > dataFim) return { erro: 'A data de início não pode ser posterior à data de fim.' };

  return { periodo };
}

function estadoDoDia(dia: string): EstadoPeriodo {
  return {
    dataInicio: dia,
    dataFim: dia,
    periodo: { inicio: dataParaLocalDateTime(dia, 'inicio'), fim: dataParaLocalDateTime(dia, 'fim') },
  };
}

// Estado do filtro de período do container: as datas digitadas e o último período válido.
// Um período inválido mostra a mensagem, mas nunca substitui o período repassado adiante.
export function usePeriodoFiltro() {
  const [estado, setEstado] = useState<EstadoPeriodo>(() => estadoDoDia(hoje()));

  const aplicar = (datas: (anterior: EstadoPeriodo) => Pick<EstadoPeriodo, 'dataInicio' | 'dataFim'>) => {
    setEstado((anterior) => {
      const { dataInicio, dataFim } = datas(anterior);
      const { periodo, erro } = validarPeriodo(dataInicio, dataFim);
      return { dataInicio, dataFim, erro, periodo: periodo ?? anterior.periodo };
    });
  };

  return {
    ...estado,
    alterarInicio: (dataInicio: string) => aplicar((anterior) => ({ ...anterior, dataInicio })),
    alterarFim: (dataFim: string) => aplicar((anterior) => ({ ...anterior, dataFim })),
    limpar: () => setEstado(estadoDoDia(hoje())),
  };
}
