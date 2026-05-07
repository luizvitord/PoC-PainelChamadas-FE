import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addConsultorio, validateConsultorioNumero } from './ConsultorioService';

describe('validateConsultorioNumero', () => {
  it('rejects empty values', () => {
    expect(validateConsultorioNumero('', [])).toEqual({ error: 'O consultório deve ter exatamente 1 dígito.' });
  });

  it('rejects whitespace values', () => {
    expect(validateConsultorioNumero(' ', [])).toEqual({ error: 'O consultório deve ter exatamente 1 dígito.' });
  });

  it('rejects non numeric values', () => {
    expect(validateConsultorioNumero('a', [])).toEqual({ error: 'Insira um número válido para o consultório.' });
  });

  it('rejects values with more than one digit', () => {
    expect(validateConsultorioNumero('12', [])).toEqual({ error: 'O consultório deve ter exatamente 1 dígito.' });
  });

  it('rejects values outside the accepted range', () => {
    expect(validateConsultorioNumero('0', [])).toEqual({
      error: 'Insira um número entre 1 e 9 para o consultório.',
    });
  });

  it('rejects duplicate room numbers using the numero field', () => {
    expect(validateConsultorioNumero('3', [{ id: 10, numero: 3 }])).toEqual({
      error: 'O consultório nº 3 já existe.',
    });
  });

  it('accepts a valid unique number', () => {
    expect(validateConsultorioNumero('4', [{ id: 2, numero: 3 }])).toEqual({ value: 4 });
  });
});

describe('addConsultorio', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not call the api when the room number is duplicated', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    const result = await addConsultorio('3', [{ id: 1, numero: 3 }]);

    expect(result).toEqual({ error: 'O consultório nº 3 já existe.' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('posts the consultorio when the number is valid', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: vi.fn(),
    } as unknown as Response);

    const result = await addConsultorio('5', [{ id: 1, numero: 3 }]);

    expect(result).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:1111/consultorios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero: 5 }),
    });
  });
});
