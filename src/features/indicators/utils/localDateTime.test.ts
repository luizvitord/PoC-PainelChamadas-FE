import { describe, expect, it } from 'vitest';
import { dataParaLocalDateTime, toLocalDateTime } from './localDateTime';

describe('LocalDateTime sem fuso', () => {
  it('preserva meia-noite e a hora local sem deslocar três horas', () => {
    expect(toLocalDateTime(new Date(2026, 8, 1, 0, 0, 0))).toBe('2026-09-01T00:00:00');
    expect(toLocalDateTime(new Date(2026, 8, 3, 23, 59, 59))).toBe('2026-09-03T23:59:59');
  });
  it('monta o dia civil incluindo frações do último segundo', () => {
    expect(dataParaLocalDateTime('2026-09-01', 'inicio')).toBe('2026-09-01T00:00:00');
    expect(dataParaLocalDateTime('2026-09-03', 'fim')).toBe('2026-09-03T23:59:59.999999999');
  });
  it.each(['', '2026-02-30', '2026-13-01', '2026-09-01T00:00:00Z'])('rejeita data inválida: %s', value => {
    expect(() => dataParaLocalDateTime(value, 'inicio')).toThrow();
  });
  it('rejeita Date inválido', () => expect(() => toLocalDateTime(new Date(NaN))).toThrow());
});
