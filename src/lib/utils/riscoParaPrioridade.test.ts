import { describe, expect, it } from 'vitest';

import { PRIORITY_CONFIG } from '@/types/patient';

import { riscoParaPrioridade } from './riscoParaPrioridade';

describe('riscoParaPrioridade', () => {
  it.each([
    ['VERMELHO', 'red', 'Vermelho', 1],
    ['LARANJA', 'orange', 'Laranja', 2],
    ['AMARELO', 'yellow', 'Amarelo', 3],
    ['VERDE', 'green', 'Verde', 4],
    ['AZUL', 'blue', 'Azul', 5],
  ] as const)('mapeia %s para %s, com label e ordem do PRIORITY_CONFIG', (risco, cor, label, ordem) => {
    const prioridade = riscoParaPrioridade(risco);

    expect(prioridade).toBe(cor);
    expect(PRIORITY_CONFIG[prioridade!]).toMatchObject({ label, order: ordem });
  });

  it('mapeia NAO_CLASSIFICADO para null', () => {
    expect(riscoParaPrioridade('NAO_CLASSIFICADO')).toBeNull();
  });

  it('mapeia valores desconhecidos para null', () => {
    expect(riscoParaPrioridade('ROXO')).toBeNull();
    expect(riscoParaPrioridade('toString')).toBeNull();
  });
});
