import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RoomSelect from './RoomSelect';

describe('RoomSelect', () => {
  it('asks the doctor for the office they are in and explains where the patient goes', () => {
    render(<RoomSelect value="" onChange={vi.fn()} options={[{ id: 2, numero: 7 }]} />);

    const select = screen.getByLabelText('Seu consultório');
    expect(select).toHaveAccessibleDescription('O paciente será chamado no painel para este consultório.');
    expect(screen.getByRole('option', { name: 'Selecione o consultório em que você está' })).toBeInTheDocument();
  });
});
