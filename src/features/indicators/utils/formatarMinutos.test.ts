import { describe, expect, it } from 'vitest';

import { formatarMinutos } from './formatarMinutos';

describe('formatarMinutos', () => {
  it.each([
    [12.5, '00:12:30'],
    [210, '03:30:00'],
    [0, '00:00:00'],
    [2.5, '00:02:30'],
    [1500, '25:00:00'],
  ])('formata %s min como %s', (minutos, esperado) => {
    expect(formatarMinutos(minutos)).toBe(esperado);
  });

  it('arredonda ao segundo', () => {
    expect(formatarMinutos(1.0083)).toBe('00:01:00');
    expect(formatarMinutos(1.0091)).toBe('00:01:01');
  });

  it('mostra --:--:-- quando não há média', () => {
    expect(formatarMinutos(null)).toBe('--:--:--');
  });
});
