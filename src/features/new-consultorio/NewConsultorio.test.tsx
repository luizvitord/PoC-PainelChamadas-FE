import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NewConsultorio } from './NewConsultorio.tsx';

const toastMock = vi.fn();
const getConsultoriosMock = vi.fn();
const addConsultorioMock = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

vi.mock('@/services/ConsultorioService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/ConsultorioService')>();

  return {
    ...actual,
    getConsultorios: (...args: unknown[]) => getConsultoriosMock(...args),
    addConsultorio: (...args: unknown[]) => addConsultorioMock(...args),
  };
});

describe('NewConsultorio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders the consultorios when the modal opens', async () => {
    getConsultoriosMock.mockResolvedValue([{ id: 1, numero: 1 }]);

    render(<NewConsultorio />);

    fireEvent.click(screen.getByLabelText('Abrir gestão de novo consultório'));

    expect(await screen.findByText('Adicionar Consultório')).toBeInTheDocument();
    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Consultório 1');
    expect(getConsultoriosMock).toHaveBeenCalledTimes(1);
  });

  it('submits the room number and closes the modal on success', async () => {
    getConsultoriosMock.mockResolvedValue([]);
    addConsultorioMock.mockResolvedValue({ success: true });

    render(<NewConsultorio />);

    fireEvent.click(screen.getByLabelText('Abrir gestão de novo consultório'));

    const input = await screen.findByLabelText('Número do Consultório');
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(addConsultorioMock).toHaveBeenCalledWith('4', []);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Sucesso!',
      description: 'Consultório adicionado com sucesso.',
    });

    await waitFor(() => {
      expect(screen.queryByText('Adicionar Consultório')).not.toBeInTheDocument();
    });
  });

  it('shows the duplicate validation error returned by the service', async () => {
    getConsultoriosMock.mockResolvedValue([{ id: 1, numero: 3 }]);
    addConsultorioMock.mockResolvedValue({ error: 'O consultório nº 3 já existe.' });

    render(<NewConsultorio />);

    fireEvent.click(screen.getByLabelText('Abrir gestão de novo consultório'));

    const input = await screen.findByLabelText('Número do Consultório');
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'O consultório nº 3 já existe.',
        variant: 'destructive',
      });
    });
  });

  it('clears the room number input when the value is zero or negative', async () => {
    getConsultoriosMock.mockResolvedValue([]);

    render(<NewConsultorio />);

    fireEvent.click(screen.getByLabelText('Abrir gestão de novo consultório'));

    const input = await screen.findByLabelText('Número do Consultório');

    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue(null);

    fireEvent.change(input, { target: { value: '-3' } });
    expect(input).toHaveValue(null);
  });

  it('blocks non-numeric key presses', async () => {
    getConsultoriosMock.mockResolvedValue([]);

    render(<NewConsultorio />);

    fireEvent.click(screen.getByLabelText('Abrir gestão de novo consultório'));

    const input = await screen.findByLabelText('Número do Consultório');

    const keyDownEvent = createEvent.keyDown(input, { key: 'a' });
    fireEvent(input, keyDownEvent);

    expect(keyDownEvent.defaultPrevented).toBe(true);
  });
});
