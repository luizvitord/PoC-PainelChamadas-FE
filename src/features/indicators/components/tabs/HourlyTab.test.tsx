import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { AtendidoPorHorario } from '../../hooks/useAtendidosPorHorario';
import { HourlyTab } from './HourlyTab';

// Parte do seed (BE-03): Paciente Teste 01 tem 3 rechamadas.
const ATENDIDOS: AtendidoPorHorario[] = [
  {
    pacienteId: 1,
    prioridade: 'red',
    atendimento: 'clinical',
    chamadaConsultorioAt: '2026-09-01T08:05:00',
    rechamadas: [
      { tipo: 'TRIAGEM', criadaEm: '2026-09-01T08:03:00' },
      { tipo: 'CONSULTORIO', criadaEm: '2026-09-01T08:07:00' },
      { tipo: 'CONSULTORIO', criadaEm: '2026-09-01T08:09:00' },
    ],
  },
  {
    pacienteId: 9,
    prioridade: 'yellow',
    atendimento: 'psychiatric',
    chamadaConsultorioAt: '2026-09-01T12:35:00',
    rechamadas: [],
  },
  {
    pacienteId: 12,
    prioridade: 'green',
    atendimento: 'psychiatric',
    chamadaConsultorioAt: '2026-09-01T15:50:00',
    rechamadas: [],
  },
];

// Cada atendido é um botão expansível (aria-expanded); os cards de resumo ficam no role=status.
const itens = () => screen.getAllByRole('button').filter((botao) => botao.hasAttribute('aria-expanded'));
const resumo = (label: string) => within(screen.getByRole('status')).getByText(label).parentElement!;
const horarioInicio = () => screen.getByLabelText('Hora Início');
const horarioFim = () => screen.getByLabelText('Hora Fim');

describe('HourlyTab', () => {
  it('lista os atendidos com horário da chamada, nível, tipo e quantas rechamadas', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);

    expect(screen.getByRole('heading', { name: 'Pacientes Atendidos por Horário' })).toBeInTheDocument();
    expect(itens()).toHaveLength(3);

    const primeiro = itens()[0];
    expect(primeiro).toHaveTextContent('Vermelho — Emergência');
    expect(primeiro).toHaveTextContent('Clínico');
    expect(primeiro).toHaveTextContent('01/09 08:05');
    expect(primeiro).toHaveTextContent('3× rechamado');
    expect(resumo('Atendidos na faixa')).toHaveTextContent('3de 3 no período');
    expect(resumo('Total de rechamadas')).toHaveTextContent('3');
  });

  it('abre o atendido para mostrar os horários das rechamadas', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);
    const primeiro = itens()[0];
    expect(primeiro).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(primeiro);

    expect(primeiro).toHaveAttribute('aria-expanded', 'true');
    const detalhe = primeiro.parentElement!;
    expect(within(detalhe).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Triagem 08:03',
      'Consultório 08:07',
      'Consultório 08:09',
    ]);

    fireEvent.click(itens()[1]);
    expect(within(itens()[1].parentElement!).getByText('Não foi rechamado.')).toBeInTheDocument();
  });

  it('não mostra nome: o paciente já foi anonimizado ao ser atendido', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);

    expect(screen.queryByText(/paciente teste|nome/i)).not.toBeInTheDocument();
  });

  it('filtra pela faixa de hora da chamada', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);

    fireEvent.change(horarioInicio(), { target: { value: '12:00' } });
    fireEvent.change(horarioFim(), { target: { value: '16:00' } });

    expect(itens().map((item) => item.textContent)).toEqual([
      expect.stringContaining('01/09 12:35'),
      expect.stringContaining('01/09 15:50'),
    ]);
    expect(resumo('Atendidos na faixa')).toHaveTextContent('2de 3 no período');
    expect(resumo('Total de rechamadas')).toHaveTextContent('0');
    expect(screen.getByText('Faixa: 12:00 às 16:00')).toBeInTheDocument();
  });

  it('os chips de turno preenchem a faixa', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Manhã' }));

    expect(horarioInicio()).toHaveValue('06:00');
    expect(horarioFim()).toHaveValue('11:59');
    expect(screen.getByRole('button', { name: 'Manhã' })).toHaveAttribute('aria-pressed', 'true');
    expect(itens()).toHaveLength(1);
  });

  it('avisa quando nenhum atendido cai na faixa e volta a todos os horários', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);

    fireEvent.change(horarioInicio(), { target: { value: '20:00' } });
    fireEvent.change(horarioFim(), { target: { value: '21:00' } });
    expect(screen.getByText('Nenhum atendido nesta faixa de horário')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Todos os horários' }));

    expect(horarioInicio()).toHaveValue('');
    expect(itens()).toHaveLength(3);
  });

  it('mostra carregando, erro e período sem atendidos', () => {
    const { rerender } = render(<HourlyTab carregando />);
    expect(screen.getByText('Carregando atendidos…')).toBeInTheDocument();

    rerender(<HourlyTab erro="Falha ao carregar os atendidos (HTTP 500)" />);
    expect(screen.getByRole('alert')).toHaveTextContent('HTTP 500');

    rerender(<HourlyTab atendidos={[]} />);
    expect(screen.getByText('Sem dados para o período')).toBeInTheDocument();
  });
});
