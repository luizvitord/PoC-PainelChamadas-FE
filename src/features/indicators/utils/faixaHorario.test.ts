import { describe, expect, it } from 'vitest';

import { dentroDaFaixa, diaEHoraDe, horaDe } from './faixaHorario';

describe('faixaHorario', () => {
  it('lê hora e dia direto do LocalDateTime, sem fuso', () => {
    expect(horaDe('2026-09-01T08:05:00')).toBe('08:05');
    expect(diaEHoraDe('2026-09-01T23:59:59')).toBe('01/09 23:59');
  });

  it('sem faixa, passa tudo (inclusive sem horário)', () => {
    expect(dentroDaFaixa('2026-09-01T08:05:00', '', '')).toBe(true);
    expect(dentroDaFaixa(null, '', '')).toBe(true);
  });

  it('faixa normal é inclusiva nas duas pontas', () => {
    expect(dentroDaFaixa('2026-09-01T08:00:00', '08:00', '12:00')).toBe(true);
    expect(dentroDaFaixa('2026-09-01T12:00:59', '08:00', '12:00')).toBe(true);
    expect(dentroDaFaixa('2026-09-01T12:01:00', '08:00', '12:00')).toBe(false);
    expect(dentroDaFaixa('2026-09-01T07:59:00', '08:00', '12:00')).toBe(false);
  });

  it('só um lado preenchido limita só aquele lado', () => {
    expect(dentroDaFaixa('2026-09-01T07:00:00', '', '08:00')).toBe(true);
    expect(dentroDaFaixa('2026-09-01T09:00:00', '', '08:00')).toBe(false);
    expect(dentroDaFaixa('2026-09-01T23:00:00', '22:00', '')).toBe(true);
  });

  it('início depois do fim cruza a meia-noite', () => {
    expect(dentroDaFaixa('2026-09-01T23:30:00', '22:00', '06:00')).toBe(true);
    expect(dentroDaFaixa('2026-09-02T05:00:00', '22:00', '06:00')).toBe(true);
    expect(dentroDaFaixa('2026-09-02T12:00:00', '22:00', '06:00')).toBe(false);
  });

  it('com faixa, quem não tem horário fica de fora', () => {
    expect(dentroDaFaixa(null, '08:00', '12:00')).toBe(false);
  });
});
