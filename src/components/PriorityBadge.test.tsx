import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PriorityBadge } from './PriorityBadge';

describe('PriorityBadge', () => {
  it.each([
    ['red', 'Emergência', 'Vermelho'],
    ['orange', 'Muito urgente', 'Laranja'],
    ['yellow', 'Urgente', 'Amarelo'],
    ['green', 'Pouco urgente', 'Verde'],
    ['blue', 'Não urgente', 'Azul'],
  ] as const)('mostra o significado de %s sem repetir a cor no texto visível', (priority, urgency, colorName) => {
    render(<PriorityBadge priority={priority} />);

    const badge = screen.getByTitle(`${colorName} — ${urgency}`);
    expect(badge).toHaveTextContent(urgency);
    // O nome da cor fica só para leitores de tela.
    expect(screen.getByText(`${colorName}:`)).toHaveClass('sr-only');
  });

  it('mostra o nome da cor quando label="color"', () => {
    render(<PriorityBadge priority="green" label="color" />);

    const badge = screen.getByTitle('Verde — Pouco urgente');
    expect(badge).toHaveTextContent(/^Verde$/);
  });
});
