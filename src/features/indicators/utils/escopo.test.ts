import { describe, expect, it } from 'vitest';

import { OCULTOS_NO_SAMU, visivelNoEscopo } from './escopo';

describe('visivelNoEscopo', () => {
  it('na visão Geral mostra todos os indicadores', () => {
    for (const indicador of OCULTOS_NO_SAMU) {
      expect(visivelNoEscopo(indicador, 'GERAL')).toBe(true);
    }
  });

  it('na visão SAMU esconde cadastrados, % classificados e a desistência acolhimento → classificação', () => {
    expect(visivelNoEscopo('cadastrados', 'SAMU')).toBe(false);
    expect(visivelNoEscopo('percentualClassificados', 'SAMU')).toBe(false);
    expect(visivelNoEscopo('desistenciaAcolhimentoClassificacao', 'SAMU')).toBe(false);
  });

  it('na visão SAMU mantém os demais indicadores', () => {
    expect(visivelNoEscopo('atendidos', 'SAMU')).toBe(true);
    expect(visivelNoEscopo('percentualAtendidos', 'SAMU')).toBe(true);
    expect(visivelNoEscopo('tempoMedioAcolhimentoMinutos', 'SAMU')).toBe(true);
  });
});
