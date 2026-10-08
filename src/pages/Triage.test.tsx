import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Patient } from '@/types/patient';

import Triage from './Triage';

const toastMock = vi.fn();
const callForTriageMock = vi.fn();
const rechamarTriagemMock = vi.fn();
const refreshPatientsMock = vi.fn();
let waitingForTriage: Patient[] = [];
let waitingForDoctor: Patient[] = [];

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

vi.mock('@/contexts/PatientContext', () => ({
  usePatients: () => ({
    getWaitingForTriage: () => waitingForTriage,
    getWaitingForDoctor: () => waitingForDoctor,
    callForTriage: callForTriageMock,
    rechamarTriagem: rechamarTriagemMock,
    assignPriority: vi.fn(),
    abandonConsultation: vi.fn(),
    refreshPatients: refreshPatientsMock,
  }),
}));

const buildPatient = (overrides: Partial<Patient> = {}): Patient => ({
  id: '1',
  chegadaAt: new Date('2026-10-08T10:00:00'),
  ticketNumber: 'T-01',
  fullName: 'Maria da Silva',
  dateOfBirth: '1990-01-01',
  cpf: '123.456.789-00',
  registeredAt: new Date('2026-10-08T10:00:00'),
  status: 'waiting-triage',
  ...overrides,
});

const renderTriage = () =>
  render(
    <MemoryRouter>
      <Triage />
    </MemoryRouter>,
  );

const openTriageModal = async () => {
  fireEvent.click(screen.getByRole('button', { name: /chamar paciente/i }));
  return screen.findByRole('button', { name: /rechamar/i });
};

describe('Triage recall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    waitingForTriage = [buildPatient()];
    waitingForDoctor = [];
    callForTriageMock.mockResolvedValue(undefined);
    refreshPatientsMock.mockResolvedValue(undefined);
  });

  it('calls rechamarTriagem with the selected patient and keeps the modal open', async () => {
    rechamarTriagemMock.mockResolvedValue(undefined);
    renderTriage();

    const recallButton = await openTriageModal();
    fireEvent.click(recallButton);

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Paciente chamado novamente',
        description: 'Maria da Silva foi chamado novamente para o acolhimento.',
      });
    });

    expect(rechamarTriagemMock).toHaveBeenCalledTimes(1);
    expect(rechamarTriagemMock).toHaveBeenCalledWith('1');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rechamar/i })).toBeEnabled();
  });

  it('disables the button while the request is in progress', async () => {
    let resolveRecall: () => void = () => {};
    rechamarTriagemMock.mockReturnValue(new Promise<void>((resolve) => { resolveRecall = resolve; }));
    renderTriage();

    const recallButton = await openTriageModal();
    fireEvent.click(recallButton);

    await waitFor(() => expect(recallButton).toBeDisabled());
    fireEvent.click(recallButton);
    expect(rechamarTriagemMock).toHaveBeenCalledTimes(1);

    resolveRecall();
    await waitFor(() => expect(recallButton).toBeEnabled());
  });

  it('shows an error toast when the recall fails', async () => {
    rechamarTriagemMock.mockRejectedValue(new Error('409'));
    renderTriage();

    fireEvent.click(await openTriageModal());

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível rechamar o paciente.',
      });
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not show the recall button when reclassifying an already classified patient', async () => {
    waitingForTriage = [];
    waitingForDoctor = [buildPatient({ status: 'waiting-doctor', priority: 'orange', attendanceType: 'clinical' })];
    renderTriage();

    fireEvent.click(screen.getByRole('button', { name: /reclassificar/i }));

    expect(await screen.findByText('Reclassificação de Risco')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rechamar/i })).not.toBeInTheDocument();
  });
});
