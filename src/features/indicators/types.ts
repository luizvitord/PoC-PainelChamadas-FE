export type Risco = 'VERMELHO' | 'LARANJA' | 'AMARELO' | 'VERDE' | 'AZUL' | 'NAO_CLASSIFICADO';
export type TipoAtendimento = 'CLINICO' | 'PSIQUIATRICO' | 'SAMU';
export type Escopo = 'GERAL' | 'SAMU';
/** Etapas do TipoStatus em que alguém pode desistir; o back sempre manda as três (com 0 quando não houve). */
/** Avaliação obrigatória do médico ao finalizar a consulta (ComportamentoSuicida.java). */
export type ComportamentoSuicida = 'NENHUM' | 'IDEACAO' | 'TENTATIVA';
export type EtapaDesistencia = 'AGUARDANDO_TRIAGEM' | 'CHAMADO' | 'AGUARDANDO_CONSULTA';

/** Espelha IndicadoresResponse.Detalhamento: minutos e percentuais de 0 a 100. */
export interface Detalhamento {
  risco: Risco;
  tipo: TipoAtendimento;
  tempoMedioEsperaMinutos: number | null;
  totalComProtocolo: number;
  foraDoPrazo: number;
  percentualForaDoPrazo: number;
}

/** Espelha IndicadoresResponse.java campo a campo, na mesma ordem. Mapas por risco trazem as 6 chaves. */
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
  /** Só status DESISTENCIA; inclui registros sem etapa, então pode passar da soma das etapas. */
  totalDesistencias: number;
  desistenciasPorEtapa: Record<EtapaDesistencia, number>;
  /** Rechamadas de triagem + consultório; inclui quem ainda não tinha cor, que fica fora dos mapas por risco. */
  totalRechamadas: number;
  /** Soma das rechamadas de cada risco. */
  rechamadasPorRisco: Record<Risco, number>;
  /** Cada paciente rechamado conta uma vez, no seu risco. */
  pacientesRechamadosPorRisco: Record<Risco, number>;
  porRiscoETipo: Detalhamento[];
  /** Entre os atendidos (FINALIZADO), quantos tiveram cada opção marcada; as três chaves sempre vêm. */
  comportamentoSuicida: Record<ComportamentoSuicida, number>;
  /** Atendidos finalizados sem marcação (anteriores à obrigatoriedade da avaliação). */
  atendidosSemAvaliacaoSuicida: number;
}

export interface FiltrosIndicadores {
  inicio: string;
  fim: string;
  escopo?: Escopo;
}
