import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IndicatorsFeature } from './IndicatorsFeature';
import type { Periodo } from './hooks/usePeriodoFiltro';
import geralJson from './mocks/geral.json';
import samuJson from './mocks/samu.json';
import type { FiltrosIndicadores, IndicadoresResponse } from './types';

const geral = geralJson as IndicadoresResponse;
const samu = samuJson as IndicadoresResponse;

// Mock do useIndicadores (INT-01): guarda filtros e `enabled` de cada chamada e devolve o estado escolhido no teste.
interface EstadoMock {
  data?: IndicadoresResponse;
  isPending: boolean;
  error: Error | null;
}
const indicadoresMock = vi.hoisted(() => ({
  chamadas: [] as { filtros: FiltrosIndicadores; enabled?: boolean }[],
  responder: (() => ({ isPending: false, error: null })) as (filtros: FiltrosIndicadores) => EstadoMock,
  refetch: vi.fn(),
}));
vi.mock('./hooks/useIndicadores', () => ({
  useIndicadores: (filtros: FiltrosIndicadores, opcoes?: { enabled?: boolean }) => {
    indicadoresMock.chamadas.push({ filtros, enabled: opcoes?.enabled });
    return { ...indicadoresMock.responder(filtros), refetch: indicadoresMock.refetch };
  },
}));

// Por padrão o back responde com o mock do escopo pedido.
const responderPorEscopo = (filtros: FiltrosIndicadores): EstadoMock => ({
  data: filtros.escopo === 'SAMU' ? samu : geral,
  isPending: false,
  error: null,
});
const ultimaChamadaIndicadores = () => indicadoresMock.chamadas[indicadoresMock.chamadas.length - 1];

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

// A aba de nível só mostra as combinações cor × tipo que existem no protocolo.
vi.mock('@/hooks/useProtocolos', async () => {
  const { PROTOCOLO_PADRAO } = await import('@/test/protocoloFixture');
  return { useProtocolos: () => ({ data: PROTOCOLO_PADRAO }) };
});

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
  beforeEach(() => {
    indicadoresMock.chamadas.length = 0;
    indicadoresMock.responder = responderPorEscopo;
    indicadoresMock.refetch.mockClear();
  });

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

  it('shows the three wait time cards', () => {
    renderIndicators();
    submitPassword('1234');

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Tempos de Espera' }));

    expect(within(screen.getByRole('tabpanel')).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Espera p/ acolhimento / classificação',
      'Espera p/ 1º atendimento médico',
      'Espera total (NAC → médico)',
    ]);
  });

  describe('dados do GET /indicadores (INT-01)', () => {
    const card = (titulo: string) => screen.getByText(titulo).parentElement!;
    const abrirAba = (nome: string) => fireEvent.mouseDown(screen.getByRole('tab', { name: nome }));

    it('só busca depois de desbloquear, com o período e o escopo do filtro', () => {
      renderIndicators();
      expect(ultimaChamadaIndicadores().enabled).toBe(false);

      submitPassword('1234');

      expect(ultimaChamadaIndicadores().enabled).toBe(true);
      expect(ultimaChamadaIndicadores().filtros).toEqual({ ...periodoAtual(), escopo: 'GERAL' });
    });

    it('trocar o período e o escopo repassa os novos filtros ao hook', () => {
      renderIndicators();
      submitPassword('1234');

      fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2026-09-01' } });
      fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2026-09-03' } });
      fireEvent.click(screen.getByRole('button', { name: 'SAMU' }));

      expect(ultimaChamadaIndicadores().filtros).toEqual({
        inicio: '2026-09-01T00:00:00',
        fim: '2026-09-03T23:59:59.999999999',
        escopo: 'SAMU',
      });
    });

    it('mostra os números da resposta nos cards e nas abas', () => {
      renderIndicators();
      submitPassword('1234');

      expect(card('Total de Atendimentos')).toHaveTextContent('14');
      expect(card('Tempo Médio de Espera')).toHaveTextContent('01:02:30');

      abrirAba('Tempos de Espera');
      expect(card('Espera p/ acolhimento / classificação')).toHaveTextContent('00:02:00');
      expect(card('Espera p/ 1º atendimento médico')).toHaveTextContent('00:57:30');
      expect(card('Espera total (NAC → médico)')).toHaveTextContent('01:02:30');

      abrirAba('Por Nível de Emergência');
      expect(screen.queryByText('Sem dados para o período')).not.toBeInTheDocument();
    });

    it('trocar o escopo atualiza os cards e as abas com a nova resposta', () => {
      renderIndicators();
      submitPassword('1234');
      abrirAba('Tempos de Espera');

      fireEvent.click(screen.getByRole('button', { name: 'SAMU' }));

      expect(card('Total de Atendimentos')).toHaveTextContent('2');
      expect(card('Tempo Médio de Espera')).toHaveTextContent('00:17:30');
      expect(card('Espera p/ acolhimento / classificação')).toHaveTextContent('00:04:00');
    });

    it('mostra skeleton nos cards e nas abas enquanto carrega, sem números', () => {
      indicadoresMock.responder = () => ({ isPending: true, error: null });
      renderIndicators();
      submitPassword('1234');

      expect(screen.getAllByRole('status', { name: 'Carregando indicadores' })).toHaveLength(2);
      expect(screen.queryByText('Total de Atendimentos')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Volumes e Fluxo de Atendimento' })).toBeInTheDocument();
    });

    it('com erro mostra a mensagem, esconde os números e permite tentar de novo', () => {
      indicadoresMock.responder = () => ({
        data: geral,
        isPending: false,
        error: new Error('Não foi possível carregar os indicadores. Tente novamente.'),
      });
      renderIndicators();
      submitPassword('1234');

      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os indicadores. Tente novamente.');
      expect(card('Total de Atendimentos')).toHaveTextContent('—');
      expect(card('Tempo Médio de Espera')).toHaveTextContent('--:--:--');

      fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
      expect(indicadoresMock.refetch).toHaveBeenCalledTimes(1);
    });

    it('período sem dados mostra 0 nos cards e o aviso nas abas', () => {
      indicadoresMock.responder = () => ({
        data: { ...geral, cadastrados: 0, classificados: 0, atendidos: 0, tempoMedioEntradaAteMedicoMinutos: null },
        isPending: false,
        error: null,
      });
      renderIndicators();
      submitPassword('1234');

      expect(card('Total de Atendimentos')).toHaveTextContent('0');
      expect(card('Tempo Médio de Espera')).toHaveTextContent('--:--:--');
      expect(screen.getByText('Sem dados para o período')).toBeInTheDocument();

      abrirAba('Tempos de Espera');
      expect(screen.getByText('Sem dados para o período')).toBeInTheDocument();
    });

    it('a aba de horários não depende do GET /indicadores', () => {
      indicadoresMock.responder = () => ({ isPending: false, error: new Error('Falhou') });
      renderIndicators();
      submitPassword('1234');

      abrirAba('Atendidos por Horário');

      expect(screen.getByText('01/09 08:05')).toBeInTheDocument();
    });
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
