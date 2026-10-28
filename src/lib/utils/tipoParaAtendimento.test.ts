import { describe, expect, it } from 'vitest';

import { tipoParaAtendimento } from './tipoParaAtendimento';

describe('tipoParaAtendimento', () => {
  it.each([
    ['CLINICO', 'clinical'],
    ['PSIQUIATRICO', 'psychiatric'],
    ['SAMU', 'samu'],
  ] as const)('mapeia %s para %s', (tipo, esperado) => {
    expect(tipoParaAtendimento(tipo)).toBe(esperado);
  });

  it('mapeia valores desconhecidos para null', () => {
    expect(tipoParaAtendimento('ODONTO')).toBeNull();
    expect(tipoParaAtendimento('constructor')).toBeNull();
  });
});
