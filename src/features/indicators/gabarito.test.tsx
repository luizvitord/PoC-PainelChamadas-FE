import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PROTOCOLO_PADRAO } from '@/test/protocoloFixture';

import { SummaryCards } from './components/SummaryCards';
import { EmergencyLevelTab } from './components/tabs/EmergencyLevelTab';
import { WaitTimesTab } from './components/tabs/WaitTimesTab';
import geral from './mocks/gabarito-int00-geral.json';
import samu from './mocks/gabarito-int00-samu.json';
import type { IndicadoresResponse } from './types';

// INT-04 e INT-05: a tela contra o gabarito da INT-00 (APIRestPoc docs/indicadores/gabarito_indicadores.pdf).
// Os JSONs são o GET /indicadores real com schema.sql + seed_teste_indicadores.sql, de 01/09 a 03/09/2026.
const GERAL = geral as IndicadoresResponse;
const SAMU = samu as IndicadoresResponse;

const card = (label: string) => screen.getByRole('heading', { name: label }).parentElement!;
const celulas = (tipo: string, nivel: string) =>
  within(screen.getByRole('heading', { name: `Classificação de risco ${tipo}` }).parentElement!.parentElement!)
    .getByRole('row', { name: new RegExp(nivel, 'i') })
    .querySelectorAll('td');
const valores = (tipo: string, nivel: string) => [...celulas(tipo, nivel)].slice(1).map((td) => td.textContent);
const niveis = (tipo: string) =>
  within(screen.getByRole('heading', { name: `Classificação de risco ${tipo}` }).parentElement!.parentElement!)
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.querySelector('td')!.textContent!.split(' — ')[0]);

describe('gabarito INT-00', () => {
  describe('INT-04 · cards do topo e Tempos de Espera (1–3)', () => {
    it.each([
      ['GERAL', GERAL, '15', '00:59:00'],
      ['SAMU', SAMU, '2', '00:17:30'],
    ])('cards do topo no %s', (_, data, atendidos, entradaMedico) => {
      render(<SummaryCards atendidos={data.atendidos} tempoMedioEntradaAteMedicoMinutos={data.tempoMedioEntradaAteMedicoMinutos} />);

      expect(card('Total de Atendimentos')).toHaveTextContent(atendidos);
      expect(card('Tempo Médio de Espera')).toHaveTextContent(entradaMedico);
    });

    it.each([
      ['GERAL', GERAL, ['00:02:00', '00:54:00', '00:59:00']],
      ['SAMU', SAMU, ['00:04:00', '00:12:30', '00:17:30']],
    ])('Tempos de Espera no %s', (_, data, esperado) => {
      render(<WaitTimesTab tempos={data} />);

      expect(card('Espera p/ acolhimento / classificação')).toHaveTextContent(esperado[0]);
      expect(card('Espera p/ 1º atendimento médico')).toHaveTextContent(esperado[1]);
      expect(card('Espera total (NAC → médico)')).toHaveTextContent(esperado[2]);
    });
  });

  describe('INT-05 · Por Nível de Emergência (14–27)', () => {
    it('GERAL: tempo médio, % fora do protocolo e (n) por cor e tipo', () => {
      render(<EmergencyLevelTab porRiscoETipo={GERAL.porRiscoETipo} escopo="GERAL" protocolos={PROTOCOLO_PADRAO} />);

      // 15 e 21: o reclassificado (Laranja → Vermelho) conta como Vermelho: 0, 5 e 5 min, 2 de 3 fora.
      expect(valores('Psiquiátrico', 'Vermelho')).toEqual(['00:03:20', '66,67%', '(3)']);
      expect(valores('Psiquiátrico', 'Laranja')).toEqual(['00:10:00', '50%', '(2)']);
      expect(valores('Psiquiátrico', 'Amarelo')).toEqual(['01:00:00', '50%', '(2)']);
      expect(valores('Psiquiátrico', 'Verde')).toEqual(['01:45:00', '50%', '(2)']);
      expect(valores('Psiquiátrico', 'Azul')).toEqual(['03:30:00', '50%', '(2)']);
      expect(valores('Clínico', 'Vermelho')).toEqual(['00:02:30', '50%', '(2)']);
      expect(valores('Clínico', 'Laranja')).toEqual(['00:12:30', '50%', '(2)']);
    });

    it('GERAL: só as combinações do protocolo, sem SAMU', () => {
      render(<EmergencyLevelTab porRiscoETipo={GERAL.porRiscoETipo} escopo="GERAL" protocolos={PROTOCOLO_PADRAO} />);

      expect(niveis('Psiquiátrico')).toEqual(['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul']);
      expect(niveis('Clínico')).toEqual(['Vermelho', 'Laranja']);
      expect(screen.queryByRole('heading', { name: 'Classificação de risco SAMU' })).not.toBeInTheDocument();
    });

    it('SAMU: só Laranja, 00:12:30 e 50% (2)', () => {
      render(<EmergencyLevelTab porRiscoETipo={SAMU.porRiscoETipo} escopo="SAMU" protocolos={PROTOCOLO_PADRAO} />);

      expect(niveis('SAMU')).toEqual(['Laranja']);
      expect(valores('SAMU', 'Laranja')).toEqual(['00:12:30', '50%', '(2)']);
      expect(screen.queryByRole('heading', { name: 'Classificação de risco Psiquiátrico' })).not.toBeInTheDocument();
    });
  });
});
