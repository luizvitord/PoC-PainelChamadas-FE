import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SummaryCards } from './SummaryCards';

const card = (titulo: string) => screen.getByText(titulo).parentElement!;

describe('SummaryCards', () => {
  it('mostra atendidos no período e o tempo médio entrada → médico', () => {
    render(<SummaryCards atendidos={14} tempoMedioEntradaAteMedicoMinutos={62.5} />);

    expect(card('Total de Atendimentos')).toHaveTextContent('14');
    expect(card('Total de Atendimentos')).toHaveTextContent('atendimentos no período');
    expect(card('Tempo Médio de Espera')).toHaveTextContent('01:02:30');
  });

  it('mostra 0 atendidos e --:--:-- quando o período não tem amostras', () => {
    render(<SummaryCards atendidos={0} tempoMedioEntradaAteMedicoMinutos={null} />);

    expect(card('Total de Atendimentos')).toHaveTextContent('0');
    expect(card('Tempo Médio de Espera')).toHaveTextContent('--:--:--');
  });

  it('mostra — e --:--:-- enquanto não há dados', () => {
    render(<SummaryCards />);

    expect(card('Total de Atendimentos')).toHaveTextContent('—');
    expect(card('Tempo Médio de Espera')).toHaveTextContent('--:--:--');
  });
});
