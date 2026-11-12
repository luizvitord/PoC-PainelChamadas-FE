export type Risco = 'VERMELHO' | 'LARANJA' | 'AMARELO' | 'VERDE' | 'AZUL' | 'NAO_CLASSIFICADO';
export type TipoAtendimento = 'CLINICO' | 'PSIQUIATRICO' | 'SAMU';
export type Escopo = 'GERAL' | 'SAMU';

/** Espelha IndicadoresResponse.Detalhamento: minutos e percentuais de 0 a 100. */
export interface Detalhamento {
  risco: Risco;
  tipo: TipoAtendimento;
  tempoMedioEsperaMinutos: number | null;
  totalComProtocolo: number;
  foraDoPrazo: number;
  percentualForaDoPrazo: number;
}

export interface IndicadoresResponse {
  cadastrados: number;
  classificados: number;
  atendidos: number;
  percentualClassificados: number;
  percentualAtendidos: number;
  tempoMedioAcolhimentoMinutos: number | null;
  tempoMedioClassificacaoAteMedicoMinutos: number | null;
  tempoMedioEntradaAteMedicoMinutos: number | null;
  contagensPorRisco: Record<Risco, number>;
  totalRechamadas: number;
  pacientesRechamadosPorRisco: Record<Risco, number>;
  porRiscoETipo: Detalhamento[];
}

export interface FiltrosIndicadores {
  inicio: string;
  fim: string;
  escopo?: Escopo;
}
