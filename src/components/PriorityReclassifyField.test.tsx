import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PriorityReclassifyField } from './PriorityReclassifyField';

const OPTIONS = ['red', 'orange', 'yellow', 'green', 'blue'] as const;

describe('PriorityReclassifyField', () => {
  it('starts on the triage color and lists only the protocol options', () => {
    render(
      <PriorityReclassifyField triagePriority="orange" value={null} onChange={vi.fn()} options={['red', 'orange']} canChange />,
    );

    expect(screen.getByTitle('Laranja — Muito urgente')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Alterar' }));

    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('radio', { name: 'Laranja — Muito urgente' })).toHaveAttribute('aria-checked', 'true');
  });

  it('choosing the triage color again means no reclassification', () => {
    const onChange = vi.fn();
    render(<PriorityReclassifyField triagePriority="orange" value="red" onChange={onChange} options={[...OPTIONS]} canChange />);

    fireEvent.click(screen.getByRole('button', { name: 'Alterar' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Laranja — Muito urgente' }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('hides the change button when it is not allowed yet', () => {
    render(
      <PriorityReclassifyField triagePriority="orange" value={null} onChange={vi.fn()} options={[...OPTIONS]} canChange={false} />,
    );

    expect(screen.queryByRole('button', { name: 'Alterar' })).not.toBeInTheDocument();
  });
});
