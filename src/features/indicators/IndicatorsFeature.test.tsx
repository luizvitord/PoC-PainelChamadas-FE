import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { IndicatorsFeature } from './IndicatorsFeature';

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
    expect(screen.getAllByRole('tab')).toHaveLength(4);

    unmount();
    renderIndicators();

    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('renders the four indicator tabs and switches between them', () => {
    renderIndicators();
    submitPassword('1234');

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Volumes e Fluxo',
      'Tempos de Espera',
      'Por Nível de Emergência',
      'Atendidos por Horário',
    ]);
    expect(screen.getByRole('heading', { name: 'Volumes e Fluxo de Atendimento' })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Tempos de Espera' }));

    expect(screen.getByRole('heading', { name: 'Tempos de Espera' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Volumes e Fluxo de Atendimento' })).not.toBeInTheDocument();
  });
});
