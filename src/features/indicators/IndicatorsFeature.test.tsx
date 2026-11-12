import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IndicatorsFeature } from './IndicatorsFeature';
import type { Periodo } from './hooks/usePeriodoFiltro';

// Envolve o hook real só para ler o período que o container repassaria ao useIndicadores (IND-01).
const periodosRepassados: Periodo[] = [];
vi.mock('./hooks/usePeriodoFiltro', async (importOriginal) => {
  const original = await importOriginal<typeof import('./hooks/usePeriodoFiltro')>();
  return {
    ...original,
    usePeriodoFiltro: () => {
      const filtro = original.usePeriodoFiltro();
      periodosRepassados.push(filtro.periodo);
      return filtro;
    },
  };
});

vi.mock('@/hooks/useProtocolos', () => ({
  useProtocolos: () => ({ data: [] }),
}));

// Guarda os argumentos que o container passa ao hook do BE-03 e devolve um atendido fixo.
const chamadasAtendidos: { periodo: Periodo; escopo: string; enabled: boolean }[] = [];
vi.mock('./hooks/useAtendidosPorHorario', () => ({
  useAtendidosPorHorario: (periodo: Periodo, escopo: string, enabled: boolean) => {
    chamadasAtendidos.push({ periodo, escopo, enabled });
    return {
      data: [
        {
          pacienteId: 1,
          prioridade: 'red',
          atendimento: 'clinical',
          chamadaConsultorioAt: '2026-09-01T08:05:00',
          rechamadas: [{ tipo: 'CONSULTORIO', criadaEm: '2026-09-01T08:07:00' }],
        },
      ],
      isPending: false,
      error: null,
    };
  },
}));

const ultimaChamadaAtendidos = () => chamadasAtendidos[chamadasAtendidos.length - 1];

const periodoAtual = () => periodosRepassados[periodosRepassados.length - 1];

function renderIndicators() {
  return render(
    <MemoryRouter>
      <IndicatorsFeature />
    </MemoryRouter>,
  );
}

function submitPassword(password: string) {
  fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('IndicatorsFeature', () => {
  it('asks for the password before showing the indicators', () => {
    renderIndicators();

    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('keeps the page locked when the password is wrong', () => {
    renderIndicators();

    submitPassword('0000');

    expect(screen.getByText('Senha incorreta. Tente novamente.')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('asks for the password again every time the page is opened', () => {
    const { unmount } = renderIndicators();

    submitPassword('1234');
    expect(screen.getAllByRole('tab')).toHaveLength(5);

    unmount();
    renderIndicators();

    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('renders the five indicator tabs and switches between them', () => {
    renderIndicators();
    submitPassword('1234');

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Volumes e Fluxo',
      'Tempos de Espera',
      'Por Nível de Emergência',
      'Atendidos por Horário',
      'Risco Suicida',
    ]);
    expect(screen.getByRole('heading', { name: 'Volumes e Fluxo de Atendimento' })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Tempos de Espera' }));

    expect(screen.getByRole('heading', { name: 'Tempos de Espera' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Volumes e Fluxo de Atendimento' })).not.toBeInTheDocument();
  });

  it('shows the empty state in the emergency level tab while there is no data (IND-01)', () => {
    renderIndicators();
    submitPassword('1234');

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Por Nível de Emergência' }));

    expect(screen.getByRole('heading', { name: 'Por Nível de Emergência' })).toBeInTheDocument();
    expect(screen.getByText('Sem dados para o período')).toBeInTheDocument();
  });

  it('shows the three wait time cards without values while there is no data (IND-01)', () => {
    renderIndicators();
    submitPassword('1234');

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Tempos de Espera' }));

    expect(within(screen.getByRole('tabpanel')).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Espera p/ acolhimento / classificação',
      'Espera p/ 1º atendimento médico',
      'Espera total (NAC → médico)',
    ]);
  });

  describe('atendidos por horário (IND-09)', () => {
    it('só busca os atendidos depois de desbloquear a página', () => {
      chamadasAtendidos.length = 0;
      renderIndicators();
      expect(ultimaChamadaAtendidos().enabled).toBe(false);

      submitPassword('1234');

      expect(ultimaChamadaAtendidos().enabled).toBe(true);
      expect(ultimaChamadaAtendidos().escopo).toBe('GERAL');
      expect(ultimaChamadaAtendidos().periodo).toEqual(periodoAtual());
    });

    it('repassa o escopo escolhido para a busca', () => {
      renderIndicators();
      submitPassword('1234');

      fireEvent.click(screen.getByRole('button', { name: 'SAMU' }));

      expect(ultimaChamadaAtendidos().escopo).toBe('SAMU');
    });

    it('mostra os atendidos na aba', () => {
      renderIndicators();
      submitPassword('1234');

      fireEvent.mouseDown(screen.getByRole('tab', { name: 'Atendidos por Horário' }));

      expect(screen.getByRole('heading', { name: 'Pacientes Atendidos por Horário' })).toBeInTheDocument();
      expect(screen.getByText('01/09 08:05')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { expanded: false }));
      expect(screen.getByText('Consultório 08:07')).toBeInTheDocument();
    });
  });

  describe('filtro Geral / SAMU', () => {
    const chip = (nome: string) => screen.getByRole('button', { name: nome });

    it('começa na visão Geral', () => {
      renderIndicators();
      submitPassword('1234');

      expect(chip('Geral')).toHaveAttribute('aria-pressed', 'true');
      expect(chip('SAMU')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('Indicadores de Atendimento')).toBeInTheDocument();
    });

    it('escolher SAMU deixa a visão visível no título', () => {
      renderIndicators();
      submitPassword('1234');

      fireEvent.click(chip('SAMU'));

      expect(chip('SAMU')).toHaveAttribute('aria-pressed', 'true');
      expect(chip('Geral')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('Indicadores de Atendimento — SAMU')).toBeInTheDocument();

      fireEvent.click(chip('Geral'));

      expect(screen.getByText('Indicadores de Atendimento')).toBeInTheDocument();
    });

    it('o escopo vale para todas as abas', () => {
      renderIndicators();
      submitPassword('1234');
      fireEvent.click(chip('SAMU'));

      fireEvent.mouseDown(screen.getByRole('tab', { name: 'Por Nível de Emergência' }));

      expect(chip('SAMU')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('Indicadores de Atendimento — SAMU')).toBeInTheDocument();
    });

    it('limpar o período não muda o escopo', () => {
      renderIndicators();
      submitPassword('1234');
      fireEvent.click(chip('SAMU'));

      fireEvent.click(chip('Limpar Período'));

      expect(chip('SAMU')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('filtro de período', () => {
    beforeEach(() => {
      periodosRepassados.length = 0;
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 22, 9, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const dataInicio = () => screen.getByLabelText('Data Início') as HTMLInputElement;
    const dataFim = () => screen.getByLabelText('Data Fim') as HTMLInputElement;

    it('começa com as duas datas em hoje', () => {
      renderIndicators();
      submitPassword('1234');

      expect(dataInicio().value).toBe('2026-10-22');
      expect(dataFim().value).toBe('2026-10-22');
      expect(periodoAtual()).toEqual({ inicio: '2026-10-22T00:00:00', fim: '2026-10-22T23:59:59.999999999' });
    });

    it('trocar as datas muda o período repassado', () => {
      renderIndicators();
      submitPassword('1234');

      fireEvent.change(dataInicio(), { target: { value: '2026-09-01' } });
      fireEvent.change(dataFim(), { target: { value: '2026-09-03' } });

      expect(periodoAtual()).toEqual({ inicio: '2026-09-01T00:00:00', fim: '2026-09-03T23:59:59.999999999' });
      expect(dataInicio()).toHaveAttribute('max', '2026-09-03');
      expect(dataFim()).toHaveAttribute('min', '2026-09-01');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('início depois do fim mostra a mensagem e não atualiza o período', () => {
      renderIndicators();
      submitPassword('1234');
      fireEvent.change(dataInicio(), { target: { value: '2026-09-01' } });
      fireEvent.change(dataFim(), { target: { value: '2026-09-03' } });

      fireEvent.change(dataInicio(), { target: { value: '2026-09-05' } });

      expect(screen.getByRole('alert')).toHaveTextContent('A data de início não pode ser posterior à data de fim.');
      expect(periodoAtual()).toEqual({ inicio: '2026-09-01T00:00:00', fim: '2026-09-03T23:59:59.999999999' });
      expect(periodosRepassados.some((periodo) => periodo.inicio.startsWith('2026-09-05'))).toBe(false);
    });

    it('limpar volta as duas datas para hoje', () => {
      renderIndicators();
      submitPassword('1234');
      fireEvent.change(dataInicio(), { target: { value: '2026-09-05' } });
      fireEvent.change(dataFim(), { target: { value: '2026-09-01' } });

      fireEvent.click(screen.getByRole('button', { name: 'Limpar Período' }));

      expect(dataInicio().value).toBe('2026-10-22');
      expect(dataFim().value).toBe('2026-10-22');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(periodoAtual()).toEqual({ inicio: '2026-10-22T00:00:00', fim: '2026-10-22T23:59:59.999999999' });
    });
  });
});
