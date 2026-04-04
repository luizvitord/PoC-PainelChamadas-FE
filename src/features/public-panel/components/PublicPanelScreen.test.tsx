import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PublicPanelScreen } from './PublicPanelScreen';

describe('PublicPanelScreen', () => {
  it('renders the empty state when there is no current call', () => {
    render(<PublicPanelScreen currentCall={null} previousCalls={[]} />);

    expect(screen.getByText('Aguardando chamadas...')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma chamada recente')).toBeInTheDocument();
  });

  it('renders the current call and previous calls', () => {
    render(
      <PublicPanelScreen
        currentCall={{
          callId: 'current',
          patientName: 'Maria',
          displayName: 'MARIA',
          currentDestinationLabel: 'ACOLHIMENTO',
          recentDestinationLabel: 'Acolhimento',
          speechText: 'Paciente Maria, favor comparecer ao acolhimento',
          type: 'triage',
        }}
        previousCalls={[
          {
            callId: 'previous',
            patientName: 'Joao',
            displayName: 'JOAO',
            currentDestinationLabel: 'CONSULTÓRIO 3',
            recentDestinationLabel: '3',
            speechText: 'Paciente Joao, favor comparecer ao consultório 3',
            type: 'doctor',
          },
        ]}
      />,
    );

    expect(screen.getByText('Chamada Atual')).toBeInTheDocument();
    expect(screen.getByText('MARIA')).toBeInTheDocument();
    expect(screen.getByText('ACOLHIMENTO')).toBeInTheDocument();
    expect(screen.getByText('JOAO')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
