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

const linhas = () => screen.getAllByRole('row').slice(1);
const horarioInicio = () => screen.getByLabelText('Hora Início');
const horarioFim = () => screen.getByLabelText('Hora Fim');

describe('HourlyTab', () => {
  it('lista os atendidos com horário da chamada, nível, tipo e rechamadas', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);

    expect(screen.getByRole('heading', { name: 'Pacientes Atendidos por Horário' })).toBeInTheDocument();
    expect(linhas()).toHaveLength(3);

    const primeira = linhas()[0];
    expect(primeira).toHaveTextContent('01/09 08:05');
    expect(primeira).toHaveTextContent('Vermelho');
    expect(primeira).toHaveTextContent('Clínico');
    expect(within(primeira).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Triagem 08:03',
      'Consultório 08:07',
      'Consultório 08:09',
    ]);
    expect(screen.getByRole('status')).toHaveTextContent('3 atendidos · 3 rechamadas');
  });

  it('não mostra nome: o paciente já foi anonimizado ao ser atendido', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);

    expect(screen.queryByRole('columnheader', { name: /nome|paciente/i })).not.toBeInTheDocument();
  });

  it('filtra pela faixa de hora da chamada', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);

    fireEvent.change(horarioInicio(), { target: { value: '12:00' } });
    fireEvent.change(horarioFim(), { target: { value: '16:00' } });

    expect(linhas().map((linha) => linha.querySelector('td')!.textContent)).toEqual(['01/09 12:35', '01/09 15:50']);
    expect(screen.getByRole('status')).toHaveTextContent('2 atendidos · 0 rechamadas');
  });

  it('avisa quando nenhum atendido cai na faixa e volta a todos os horários', () => {
    render(<HourlyTab atendidos={ATENDIDOS} />);

    fireEvent.change(horarioInicio(), { target: { value: '20:00' } });
    fireEvent.change(horarioFim(), { target: { value: '21:00' } });
    expect(screen.getByText('Nenhum atendido nesta faixa de horário')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Todos os horários' }));

    expect(horarioInicio()).toHaveValue('');
    expect(linhas()).toHaveLength(3);
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
