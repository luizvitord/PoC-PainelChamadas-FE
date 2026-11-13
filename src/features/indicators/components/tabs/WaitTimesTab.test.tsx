import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TemposEspera, WaitTimesTab } from './WaitTimesTab';

// Valores de aceite do seed no escopo GERAL (BE-01).
const SEED_GERAL: TemposEspera = {
  tempoMedioAcolhimentoMinutos: 2,
  tempoMedioClassificacaoAteMedicoMinutos: 57.5,
  tempoMedioEntradaAteMedicoMinutos: 62.5,
};

// Nomes dos cards no design novo (indicadores 1, 2 e 3).
const ACOLHIMENTO = 'Espera p/ acolhimento / classificação';
const CLASSIFICACAO_MEDICO = 'Espera p/ 1º atendimento médico';
const ENTRADA_MEDICO = 'Espera total (NAC → médico)';

const card = (titulo: string) => screen.getByRole('heading', { name: titulo }).parentElement!;

describe('WaitTimesTab', () => {
  it('mostra os 3 tempos na ordem dos indicadores 1–3', () => {
    render(<WaitTimesTab tempos={SEED_GERAL} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Tempos de Espera' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      ACOLHIMENTO,
      CLASSIFICACAO_MEDICO,
      ENTRADA_MEDICO,
    ]);
  });

  it('formata os minutos em HH:MM:SS', () => {
    render(<WaitTimesTab tempos={SEED_GERAL} />);

    expect(card(ACOLHIMENTO)).toHaveTextContent('00:02:00');
    expect(card(CLASSIFICACAO_MEDICO)).toHaveTextContent('00:57:30');
    expect(card(ENTRADA_MEDICO)).toHaveTextContent('01:02:30');
  });

  it('mostra --:--:-- quando o tempo vem null (sem amostras)', () => {
    render(<WaitTimesTab tempos={{ ...SEED_GERAL, tempoMedioAcolhimentoMinutos: null }} />);

    expect(card(ACOLHIMENTO)).toHaveTextContent('--:--:--');
    expect(card(ENTRADA_MEDICO)).toHaveTextContent('01:02:30');
  });

  it('mantém os 3 cards com --:--:-- enquanto não há dados', () => {
    render(<WaitTimesTab />);

    expect(screen.getAllByText('--:--:--')).toHaveLength(3);
  });
});
