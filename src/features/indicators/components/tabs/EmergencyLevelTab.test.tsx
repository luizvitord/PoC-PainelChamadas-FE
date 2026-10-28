import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PROTOCOLO_PADRAO } from '@/test/protocoloFixture';

import { DetalhamentoNivel, EmergencyLevelTab } from './EmergencyLevelTab';

const RISCOS = ['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL'];
const TIPOS = ['CLINICO', 'PSIQUIATRICO', 'SAMU'];

// Valores reais do seed; as demais combinações vêm zeradas, como o back manda.
const SEED: Record<string, Omit<DetalhamentoNivel, 'risco' | 'tipo'>> = {
  'VERMELHO/CLINICO': { tempoMedioEsperaMinutos: 2.5, percentualForaDoPrazo: 50, totalComProtocolo: 2 },
  'VERMELHO/PSIQUIATRICO': { tempoMedioEsperaMinutos: 2.5, percentualForaDoPrazo: 50, totalComProtocolo: 2 },
  'LARANJA/CLINICO': { tempoMedioEsperaMinutos: 12.5, percentualForaDoPrazo: 50, totalComProtocolo: 2 },
  'LARANJA/PSIQUIATRICO': { tempoMedioEsperaMinutos: 10, percentualForaDoPrazo: 50, totalComProtocolo: 2 },
  'AMARELO/PSIQUIATRICO': { tempoMedioEsperaMinutos: 60, percentualForaDoPrazo: 50, totalComProtocolo: 2 },
  'VERDE/PSIQUIATRICO': { tempoMedioEsperaMinutos: 105, percentualForaDoPrazo: 50, totalComProtocolo: 2 },
  'AZUL/PSIQUIATRICO': { tempoMedioEsperaMinutos: 210, percentualForaDoPrazo: 50, totalComProtocolo: 2 },
  'LARANJA/SAMU': { tempoMedioEsperaMinutos: 12.5, percentualForaDoPrazo: 50, totalComProtocolo: 2 },
};

const PORRISCOETIPO: DetalhamentoNivel[] = RISCOS.flatMap((risco) =>
  TIPOS.map((tipo) => ({
    risco,
    tipo,
    ...(SEED[`${risco}/${tipo}`] ?? { tempoMedioEsperaMinutos: null, percentualForaDoPrazo: 0, totalComProtocolo: 0 }),
  })),
);

const card = (titulo: string) => screen.getByRole('heading', { name: titulo }).parentElement!.parentElement!;
const linha = (titulo: string, nivel: string) => within(card(titulo)).getByRole('row', { name: new RegExp(nivel, 'i') });
const niveisDoCard = (titulo: string) =>
  within(card(titulo)).getAllByRole('row').slice(1).map((row) => row.querySelector('td')!.textContent);

describe('EmergencyLevelTab', () => {
  it('usa as 15 combinações na fixture', () => {
    expect(PORRISCOETIPO).toHaveLength(15);
  });

  describe('visão Geral', () => {
    it('mostra Psiquiátrico com os 5 níveis e Clínico com vermelho e laranja, na ordem do protocolo', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={PORRISCOETIPO} />);

      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Psiquiátrico', 'Clínico']);
      expect(niveisDoCard('Psiquiátrico')).toEqual(['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul']);
      expect(niveisDoCard('Clínico')).toEqual(['Vermelho', 'Laranja']);
    });

    it('formata tempo médio, % fora do protocolo e (n)', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={PORRISCOETIPO} />);

      const laranjaClinico = linha('Clínico', 'Laranja');
      expect(laranjaClinico).toHaveTextContent('00:12:30');
      expect(laranjaClinico).toHaveTextContent('50%');
      expect(laranjaClinico).toHaveTextContent('(2)');

      const azulPsiquiatrico = linha('Psiquiátrico', 'Azul');
      expect(azulPsiquiatrico).toHaveTextContent('03:30:00');
      expect(azulPsiquiatrico).toHaveTextContent('50%');
    });

    it('não mostra SAMU nem Amarelo/Verde/Azul no Clínico', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={PORRISCOETIPO} escopo="GERAL" />);

      expect(screen.queryByRole('heading', { name: 'SAMU' })).not.toBeInTheDocument();
      ['Amarelo', 'Verde', 'Azul'].forEach((nivel) => {
        expect(within(card('Clínico')).queryByRole('row', { name: new RegExp(nivel, 'i') })).not.toBeInTheDocument();
      });
    });
  });

  describe('visão SAMU', () => {
    it('mostra só Laranja/SAMU com 50% fora do protocolo e só o chip Laranja', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={PORRISCOETIPO} escopo="SAMU" />);

      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['SAMU']);
      expect(niveisDoCard('SAMU')).toEqual(['Laranja']);
      expect(linha('SAMU', 'Laranja')).toHaveTextContent('00:12:30');
      expect(linha('SAMU', 'Laranja')).toHaveTextContent('50%');
      expect(screen.getAllByRole('button', { name: /^Nível / }).map((b) => b.getAttribute('aria-label'))).toEqual(['Nível Laranja']);
    });
  });

  describe('chips', () => {
    it('começam todos ativos', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={PORRISCOETIPO} />);

      const chips = screen.getAllByRole('button');
      expect(chips).toHaveLength(8);
      chips.forEach((chip) => expect(chip).toHaveAttribute('aria-pressed', 'true'));
    });

    it('desligar um nível esconde a linha em todos os tipos e ligar mostra de novo', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={PORRISCOETIPO} />);
      const chipLaranja = screen.getByRole('button', { name: 'Nível Laranja' });

      fireEvent.click(chipLaranja);

      expect(chipLaranja).toHaveAttribute('aria-pressed', 'false');
      expect(niveisDoCard('Psiquiátrico')).toEqual(['Vermelho', 'Amarelo', 'Verde', 'Azul']);
      expect(niveisDoCard('Clínico')).toEqual(['Vermelho']);

      fireEvent.click(chipLaranja);

      expect(niveisDoCard('Clínico')).toEqual(['Vermelho', 'Laranja']);
    });

    it('desligar uma coluna esconde o cabeçalho e os valores dela', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={PORRISCOETIPO} />);

      fireEvent.click(screen.getByRole('button', { name: '% fora do protocolo' }));

      expect(screen.queryByRole('columnheader', { name: '% fora do protocolo' })).not.toBeInTheDocument();
      expect(linha('Clínico', 'Laranja')).not.toHaveTextContent('50%');
      expect(linha('Clínico', 'Laranja')).toHaveTextContent('00:12:30');

      fireEvent.click(screen.getByRole('button', { name: 'Tempo médio' }));
      fireEvent.click(screen.getByRole('button', { name: 'Total (n)' }));

      expect(screen.getAllByRole('columnheader', { name: 'Nível' })).toHaveLength(2);
      expect(screen.queryByRole('columnheader', { name: 'Tempo médio' })).not.toBeInTheDocument();
      expect(linha('Clínico', 'Laranja')).not.toHaveTextContent('00:12:30');
      expect(linha('Clínico', 'Laranja')).not.toHaveTextContent('(2)');
    });

    it('avisa quando nenhum nível do tipo está selecionado', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={PORRISCOETIPO} />);

      fireEvent.click(screen.getByRole('button', { name: 'Nível Vermelho' }));
      fireEvent.click(screen.getByRole('button', { name: 'Nível Laranja' }));

      expect(within(card('Clínico')).getByText('Nenhum nível selecionado')).toBeInTheDocument();
      expect(niveisDoCard('Psiquiátrico')).toEqual(['Amarelo', 'Verde', 'Azul']);
    });
  });

  describe('sem dados', () => {
    it('mostra o estado vazio quando porRiscoETipo é undefined', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={undefined} />);

      expect(screen.getByText('Sem dados para o período')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('mostra o estado vazio quando a lista vem vazia', () => {
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={[]} />);

      expect(screen.getByText('Sem dados para o período')).toBeInTheDocument();
    });

    it('não mostra combinações enquanto o protocolo não carregou', () => {
      render(<EmergencyLevelTab protocolos={undefined} porRiscoETipo={PORRISCOETIPO} />);

      expect(screen.getByText('Sem dados para o período')).toBeInTheDocument();
    });

    it('mostra --:--:-- quando a média é null', () => {
      const semMedia = PORRISCOETIPO.map((d) => (d.risco === 'VERMELHO' && d.tipo === 'CLINICO' ? { ...d, tempoMedioEsperaMinutos: null } : d));
      render(<EmergencyLevelTab protocolos={PROTOCOLO_PADRAO} porRiscoETipo={semMedia} />);

      expect(linha('Clínico', 'Vermelho')).toHaveTextContent('--:--:--');
    });
  });
});
