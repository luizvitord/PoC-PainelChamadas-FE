import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PatientAlreadyCalledError } from '@/lib/patientErrors';
import { Patient } from '@/types/patient';

import Doctor from './Doctor';

const toastMock = vi.fn();
const callForDoctorMock = vi.fn();
const completeConsultationMock = vi.fn();
const abandonConsultationMock = vi.fn();
let waitingForDoctor: Patient[] = [];

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/contexts/PatientContext', () => ({
  usePatients: () => ({
    getWaitingForDoctor: () => waitingForDoctor,
    callForDoctor: callForDoctorMock,
    recallPatient: vi.fn(),
    completeConsultation: completeConsultationMock,
    abandonConsultation: abandonConsultationMock,
    refreshPatients: vi.fn().mockResolvedValue(undefined),
  }),
}));

const patient: Patient = {
  id: '1',
  chegadaAt: new Date('2026-11-05T10:00:00'),
  fullName: 'Maria da Silva',
  cpf: '123.456.789-00',
  status: 'waiting-doctor',
  priority: 'orange',
  attendanceType: 'psychiatric',
};

const renderDoctor = () =>
  render(
    <MemoryRouter>
      <Doctor />
    </MemoryRouter>,
  );

const openPatientModal = async () => {
  await screen.findByRole('option', { name: 'Consultório 1' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: /selecionar para consulta/i }));
  return screen.findByRole('dialog', { name: 'Chamar Paciente' });
};

describe('Doctor call modal lock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    waitingForDoctor = [patient];
    callForDoctorMock.mockResolvedValue(undefined);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [{ id: 1, numero: 1 }] }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('can be closed before the patient is called', async () => {
    renderDoctor();
    await openPatientModal();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Chamar Paciente' })).not.toBeInTheDocument());
    expect(callForDoctorMock).not.toHaveBeenCalled();
  });

  it('locks after the patient is called: no close button and Esc does nothing', async () => {
    renderDoctor();
    const dialog = await openPatientModal();

    fireEvent.click(screen.getByRole('button', { name: 'Chamar Paciente' }));
    await screen.findByRole('button', { name: 'Chamar novamente' });

    expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.getByRole('dialog', { name: 'Chamar Paciente' })).toBeInTheDocument();
  });

  it('warns and closes the modal when another office called the patient first', async () => {
    callForDoctorMock.mockRejectedValue(new PatientAlreadyCalledError());
    renderDoctor();
    await openPatientModal();

    fireEvent.click(screen.getByRole('button', { name: 'Chamar Paciente' }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Paciente já chamado', variant: 'destructive' })),
    );
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Chamar Paciente' })).not.toBeInTheDocument());
  });
});

describe('Doctor suicidal behavior assessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    waitingForDoctor = [patient];
    completeConsultationMock.mockResolvedValue(undefined);
    abandonConsultationMock.mockResolvedValue(undefined);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [{ id: 1, numero: 1 }] }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('only finishes the consultation after the assessment and sends the chosen option', async () => {
    renderDoctor();
    await openPatientModal();

    expect(screen.getByText('Obrigatório')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finalizar Consulta' })).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: /^ideação suicida/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar Consulta' }));

    const confirm = await screen.findByRole('dialog', { name: 'Confirmar finalização' });
    expect(confirm).toHaveTextContent('Ideação ou tentativa de suicídio: Ideação suicida');

    fireEvent.click(screen.getByRole('button', { name: 'Sim, finalizar' }));

    await waitFor(() => expect(completeConsultationMock).toHaveBeenCalledWith('1', 'ideation'));
  });

  it('registers a withdrawal without the assessment and starts the next opening unselected', async () => {
    renderDoctor();
    await openPatientModal();

    fireEvent.click(screen.getByRole('radio', { name: /^tentativa de suicídio/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Encerrar (Desistência)' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Sim, marcar como desistência' }));

    await waitFor(() => expect(abandonConsultationMock).toHaveBeenCalledWith('1'));
    expect(completeConsultationMock).not.toHaveBeenCalled();

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Chamar Paciente' })).not.toBeInTheDocument());
    await openPatientModal();

    screen.getAllByRole('radio').forEach((radio) => expect(radio).not.toBeChecked());
    expect(screen.getByRole('button', { name: 'Finalizar Consulta' })).toBeDisabled();
  });
});
