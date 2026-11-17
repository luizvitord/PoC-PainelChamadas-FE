import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import geralJson from '../../mocks/geral.json';
import samuJson from '../../mocks/samu.json';
import type { IndicadoresResponse } from '../../types';
import { VolumesTab } from './VolumesTab';

const geral = geralJson as IndicadoresResponse;
const samu = samuJson as IndicadoresResponse;

const card = (titulo: string) => screen.getByText(titulo).parentElement!;
const CORES = ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul'];

describe('VolumesTab', () => {
  describe('visão Geral', () => {
    it('mostra cadastrados, classificados e atendidos com os percentuais do back', () => {
      render(<VolumesTab volumes={geral} escopo="GERAL" />);

      expect(card('Nº pacientes cadastrados')).toHaveTextContent('19');
      expect(card('Nº pacientes classificados')).toHaveTextContent('17');
      expect(card('Nº pacientes classificados')).toHaveTextContent('89,47% dos cadastrados');
      expect(card('Nº pacientes atendidos (médico)')).toHaveTextContent('14');
      expect(card('Nº pacientes atendidos (médico)')).toHaveTextContent('73,68% dos cadastrados');
    });

    it('mostra a contagem das 5 cores, na ordem do Manchester, sem o não classificado', () => {
      render(<VolumesTab volumes={geral} escopo="GERAL" />);

      expect(screen.getByRole('heading', { name: 'Classificados por cor' })).toBeInTheDocument();
      expect(CORES.map((cor) => card(cor).querySelector('p')?.textContent)).toEqual(['4', '5', '3', '3', '2']);
      expect(screen.queryByText(/não classificado/i)).not.toBeInTheDocument();
    });
  });

  describe('visão SAMU (IND-10)', () => {
    it('esconde cadastrados e % classificados', () => {
      render(<VolumesTab volumes={samu} escopo="SAMU" />);

      expect(screen.queryByText('Nº pacientes cadastrados')).not.toBeInTheDocument();
      expect(card('Nº pacientes classificados')).toHaveTextContent('2');
      expect(card('Nº pacientes classificados')).toHaveTextContent('classificados na triagem');
      expect(card('Nº pacientes classificados')).not.toHaveTextContent('%');
    });

    it('continua mostrando atendidos, % atendidos e a contagem por cor', () => {
      render(<VolumesTab volumes={samu} escopo="SAMU" />);

      expect(card('Nº pacientes atendidos (médico)')).toHaveTextContent('2');
      expect(card('Nº pacientes atendidos (médico)')).toHaveTextContent('100% dos cadastrados');
      expect(CORES.map((cor) => card(cor).querySelector('p')?.textContent)).toEqual(['0', '2', '0', '0', '0']);
    });
  });

  it('mostra — enquanto não há dados', () => {
    render(<VolumesTab />);

    expect(card('Nº pacientes cadastrados')).toHaveTextContent('—');
    expect(card('Nº pacientes classificados')).toHaveTextContent('—% dos cadastrados');
    expect(card('Vermelho')).toHaveTextContent('—');
  });
});
