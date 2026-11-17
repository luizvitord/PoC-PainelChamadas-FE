import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import geralJson from '../mocks/geral.json';
import samuJson from '../mocks/samu.json';
import type { IndicadoresResponse } from '../types';
import { RechamadasCards } from './RechamadasCards';

const geral = geralJson as IndicadoresResponse;
const samu = samuJson as IndicadoresResponse;

const card = (titulo: string) => screen.getByText(titulo).parentElement!;
const valor = (titulo: string) => card(titulo).querySelector('p')?.textContent;
const CORES = ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul'];

describe('RechamadasCards', () => {
  it('mostra o total e as rechamadas de cada cor (Geral)', () => {
    render(<RechamadasCards rechamadas={geral} />);

    expect(valor('Total de rechamadas')).toBe('7');
    expect(CORES.map((cor) => valor(`Rechamadas ${cor}`))).toEqual(['3', '1', '2', '0', '0']);
  });

  it('a legenda de cada cor diz quantos pacientes foram rechamados', () => {
    render(<RechamadasCards rechamadas={geral} />);

    expect(card('Rechamadas Vermelho')).toHaveTextContent('2 pacientes rechamados');
    expect(card('Rechamadas Laranja')).toHaveTextContent('1 paciente rechamado');
    expect(card('Rechamadas Verde')).toHaveTextContent('0 pacientes rechamados');
  });

  it('não recalcula o total: rechamadas sem cor entram só nele', () => {
    render(<RechamadasCards rechamadas={geral} />);

    expect(valor('Total de rechamadas')).toBe('7');
    expect(screen.getByText('Rechamadas da triagem de quem ainda não tinha cor entram só no total.')).toBeInTheDocument();
  });

  it('mostra os números do SAMU', () => {
    render(<RechamadasCards rechamadas={samu} />);

    expect(valor('Total de rechamadas')).toBe('2');
    expect(CORES.map((cor) => valor(`Rechamadas ${cor}`))).toEqual(['0', '2', '0', '0', '0']);
    expect(card('Rechamadas Laranja')).toHaveTextContent('1 paciente rechamado');
  });

  it('mostra — enquanto não há dados', () => {
    render(<RechamadasCards />);

    expect(valor('Total de rechamadas')).toBe('—');
    expect(valor('Rechamadas Azul')).toBe('—');
  });
});
