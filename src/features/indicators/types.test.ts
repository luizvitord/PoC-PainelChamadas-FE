import { describe, expect, it } from 'vitest';

import geral from './mocks/geral.json';
import samu from './mocks/samu.json';
import type { IndicadoresResponse } from './types';

// Campos do record IndicadoresResponse.java (APIRestPoc), na ordem do back.
const CAMPOS_DO_BACK: (keyof IndicadoresResponse)[] = [
  'cadastrados',
  'classificados',
  'atendidos',
  'percentualClassificados',
  'percentualAtendidos',
  'tempoMedioAcolhimentoMinutos',
  'tempoMedioClassificacaoAteMedicoMinutos',
  'tempoMedioEntradaAteMedicoMinutos',
  'contagensPorRisco',
  'totalDesistencias',
  'desistenciasPorEtapa',
  'totalRechamadas',
  'rechamadasPorRisco',
  'pacientesRechamadosPorRisco',
  'porRiscoETipo',
  'comportamentoSuicida',
  'atendidosSemAvaliacaoSuicida',
];

describe('IndicadoresResponse', () => {
  it.each([
    ['geral', geral],
    ['samu', samu],
  ])('o mock %s tem exatamente os campos do back', (_, mock) => {
    expect(Object.keys(mock)).toEqual(CAMPOS_DO_BACK);
  });

  it('as desistências trazem as três etapas que o back sempre manda', () => {
    expect(Object.keys(geral.desistenciasPorEtapa).sort()).toEqual(['AGUARDANDO_CONSULTA', 'AGUARDANDO_TRIAGEM', 'CHAMADO']);
  });
});
