import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NOTES_PREVIEW_LIMIT, TriageNotesPreview } from './TriageNotesPreview';

describe('TriageNotesPreview', () => {
  it('shows a short note as is, without the details button', () => {
    render(<TriageNotesPreview notes="Ansiedade intensa" />);

    expect(screen.getByText('Ansiedade intensa')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens and closes the full text of a long note inside the card', () => {
    const longNote = 'x'.repeat(NOTES_PREVIEW_LIMIT + 1);
    render(<TriageNotesPreview notes={longNote} />);

    const toggle = screen.getByRole('button', { name: /ver anotação completa/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /ocultar anotação/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByText(longNote)).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /ocultar anotação/i }));

    expect(screen.getByRole('button', { name: /ver anotação completa/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('offers the details button for a note with line breaks, even when short', () => {
    render(<TriageNotesPreview notes={'Linha 1\nLinha 2'} />);

    expect(screen.getByRole('button', { name: /ver anotação completa/i })).toBeInTheDocument();
  });
});
