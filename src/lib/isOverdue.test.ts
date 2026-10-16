import { describe, expect, it } from 'vitest';

import { isOverdue } from './isOverdue';

const at = (time: string) => new Date(`2026-10-08T${time}`).getTime();

describe('isOverdue', () => {
  describe('laranja clínico classificado às 10:00 (prazo 10:10)', () => {
    const patient = { prazoAtendimentoAt: new Date('2026-10-08T10:10:00') };

    it('não pisca antes do prazo', () => {
      expect(isOverdue(patient, at('10:00:00'))).toBe(false);
      expect(isOverdue(patient, at('10:09:59'))).toBe(false);
    });

    it('não pisca exatamente no prazo', () => {
      expect(isOverdue(patient, at('10:10:00'))).toBe(false);
    });

    it('pisca depois do prazo', () => {
      expect(isOverdue(patient, at('10:10:01'))).toBe(true);
      expect(isOverdue(patient, at('12:00:00'))).toBe(true);
    });
  });

  describe('amarelo psiquiátrico classificado às 10:00 (prazo 11:00)', () => {
    const patient = { prazoAtendimentoAt: new Date('2026-10-08T11:00:00') };

    it('não pisca com 10 min, regra antiga do laranja', () => {
      expect(isOverdue(patient, at('10:10:01'))).toBe(false);
    });

    it('não pisca antes de completar 60 min', () => {
      expect(isOverdue(patient, at('10:59:59'))).toBe(false);
    });

    it('pisca depois de 60 min', () => {
      expect(isOverdue(patient, at('11:00:01'))).toBe(true);
    });
  });

  describe('sem prazo do protocolo', () => {
    it('não pisca quando o prazo é null', () => {
      expect(isOverdue({ prazoAtendimentoAt: null }, at('23:59:59'))).toBe(false);
    });

    it('não pisca quando o prazo não veio', () => {
      expect(isOverdue({}, at('23:59:59'))).toBe(false);
    });
  });
});
