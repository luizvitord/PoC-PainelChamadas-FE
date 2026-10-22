import { describe, expect, it } from 'vitest';

import { formatarPercentual } from './formatarPercentual';

describe('formatarPercentual', () => {
  it.each([
    [50, '50%'],
    [89.47, '89,47%'],
    [0, '0%'],
    [100, '100%'],
  ])('formata %s como %s', (valor, esperado) => {
    expect(formatarPercentual(valor)).toBe(esperado);
  });
});
