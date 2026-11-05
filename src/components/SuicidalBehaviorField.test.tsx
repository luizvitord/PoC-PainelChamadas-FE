import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SuicidalBehaviorField } from './SuicidalBehaviorField';

describe('SuicidalBehaviorField', () => {
  it('lists the options from absence to the most severe, with none selected', () => {
    render(<SuicidalBehaviorField value={null} onChange={vi.fn()} />);

    const radios = screen.getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('value'))).toEqual(['none', 'ideation', 'attempt']);
    radios.forEach((radio) => expect(radio).not.toBeChecked());
    expect(screen.getByRole('radiogroup', { name: /ideação ou tentativa de suicídio/i })).toBeInTheDocument();
  });

  it('flags the field as required until an option is chosen', () => {
    const { rerender } = render(<SuicidalBehaviorField value={null} onChange={vi.fn()} />);

    expect(screen.getByText('Obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Selecione uma opção para finalizar a consulta.')).toBeInTheDocument();

    rerender(<SuicidalBehaviorField value="none" onChange={vi.fn()} />);

    expect(screen.getByText('Obrigatório')).toBeInTheDocument();
    expect(screen.queryByText('Selecione uma opção para finalizar a consulta.')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^sem ideação ou tentativa/i })).toBeChecked();
  });

  it('reports the chosen option', () => {
    const onChange = vi.fn();
    render(<SuicidalBehaviorField value={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole('radio', { name: /^tentativa de suicídio/i }));

    expect(onChange).toHaveBeenCalledWith('attempt');
  });
});
