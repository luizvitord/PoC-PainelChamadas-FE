import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EscopoFilter } from './EscopoFilter';

describe('EscopoFilter', () => {
  it('mostra os chips Geral e SAMU com o escopo ativo marcado', () => {
    render(<EscopoFilter escopo="GERAL" onEscopoChange={() => {}} />);

    expect(screen.getByRole('group', { name: 'Visão' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Geral' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'SAMU' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('avisa o escopo escolhido', () => {
    const onEscopoChange = vi.fn();
    render(<EscopoFilter escopo="GERAL" onEscopoChange={onEscopoChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'SAMU' }));

    expect(onEscopoChange).toHaveBeenCalledWith('SAMU');
  });
});
