import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Patient } from '@/types/patient';

import Doctor from './Doctor';

const toastMock = vi.fn();
const callForDoctorMock = vi.fn();
const recallPatientMock = vi.fn();
const refreshPatientsMock = vi.fn();
const getConsultoriosMock = vi.fn();
let waitingForDoctor: Patient[] = [];

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/services/ConsultorioService', () => ({
  getConsultorios: () => getConsultoriosMock(),
}));

vi.mock('@/contexts/PatientContext', () => ({
  usePatients: () => ({
    getWaitingForDoctor: () => waitingForDoctor,
    callForDoctor: callForDoctorMock,
    recallPatient: recallPatientMock,
    completeConsultation: vi.fn(),
    abandonConsultation: vi.fn(),
    refreshPatients: refreshPatientsMock,
  }),
}));

// IDs propositalmente diferentes dos números exibidos no painel público
const CONSULTORIOS = [
  { id: 2, numero: 7 },
  { id: 3, numero: 8 },
];

const patient: Patient = {
  id: '10',
  chegadaAt: new Date('2026-10-08T10:00:00'),
  ticketNumber: 'T-01',
  fullName: 'Maria da Silva',
  dateOfBirth: '1990-01-01',
  cpf: '123.456.789-00',
  registeredAt: new Date('2026-10-08T10:00:00'),
  status: 'waiting-doctor',
  priority: 'green',
  attendanceType: 'clinical',
} as Patient;

const renderDoctor = () =>
  render(
    <MemoryRouter>
      <Doctor />
    </MemoryRouter>,
  );

const headerSelect = () => screen.getAllByRole('combobox')[0];

describe('Doctor - consultório da próxima chamada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    waitingForDoctor = [patient];
    getConsultoriosMock.mockResolvedValue(CONSULTORIOS);
    callForDoctorMock.mockResolvedValue(undefined);
    recallPatientMock.mockResolvedValue(undefined);
    refreshPatientsMock.mockResolvedValue(undefined);
  });

  it('começa sem consultório e bloqueia a chamada até a escolha', async () => {
    renderDoctor();
    await waitFor(() => expect(headerSelect()).not.toBeDisabled());

    expect(headerSelect()).toHaveValue('');
    expect(screen.getByRole('button', { name: /selecionar para consulta/i })).toBeDisabled();
  });

  it('exibe o número do consultório (o mesmo do painel), não o ID', async () => {
    renderDoctor();
    await waitFor(() => expect(headerSelect()).not.toBeDisabled());

    expect(within(headerSelect()).getByRole('option', { name: 'Consultório 7' })).toHaveValue('2');
    expect(within(headerSelect()).getByRole('option', { name: 'Consultório 8' })).toHaveValue('3');
  });

  it('troca de consultório e chama logo depois: envia o ID do consultório exibido', async () => {
    renderDoctor();
    await waitFor(() => expect(headerSelect()).not.toBeDisabled());

    fireEvent.change(headerSelect(), { target: { value: '2' } });
    expect(headerSelect()).toHaveDisplayValue('Consultório 7');
    fireEvent.change(headerSelect(), { target: { value: '3' } });
    expect(headerSelect()).toHaveDisplayValue('Consultório 8');

    fireEvent.click(screen.getByRole('button', { name: /selecionar para consulta/i }));
    const callButton = await screen.findByRole('button', { name: 'Chamar para o Consultório 8' });
    fireEvent.click(callButton);

    await waitFor(() => expect(callForDoctorMock).toHaveBeenCalledTimes(1));
    expect(callForDoctorMock).toHaveBeenCalledWith('10', '3');
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.stringContaining('Consultório 8') }),
      ),
    );
  });

  it('permite trocar o consultório dentro do modal antes de chamar', async () => {
    renderDoctor();
    await waitFor(() => expect(headerSelect()).not.toBeDisabled());
    fireEvent.change(headerSelect(), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /selecionar para consulta/i }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: '3' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Chamar para o Consultório 8' }));

    await waitFor(() => expect(callForDoctorMock).toHaveBeenCalledWith('10', '3'));
  });

  it('enquanto a chamada está pendente, bloqueia a troca e um segundo envio', async () => {
    let resolveCall: () => void = () => {};
    callForDoctorMock.mockImplementation(() => new Promise<void>((r) => { resolveCall = r; }));

    renderDoctor();
    await waitFor(() => expect(headerSelect()).not.toBeDisabled());
    fireEvent.change(headerSelect(), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /selecionar para consulta/i }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Chamar para o Consultório 7' }));

    const pending = await within(dialog).findByRole('button', { name: /chamando/i });
    expect(pending).toBeDisabled();
    expect(within(dialog).getByRole('combobox')).toBeDisabled();
    fireEvent.click(pending);
    expect(callForDoctorMock).toHaveBeenCalledTimes(1);

    await act(async () => resolveCall());
    expect(await within(dialog).findByTestId('called-room-info')).toHaveTextContent('Consultório 7');
  });

  it('mantém o consultório se a chamada falhar e informa o erro', async () => {
    callForDoctorMock.mockRejectedValue(new Error('500'));
    renderDoctor();
    await waitFor(() => expect(headerSelect()).not.toBeDisabled());
    fireEvent.change(headerSelect(), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /selecionar para consulta/i }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Chamar para o Consultório 8' }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })),
    );
    expect(within(dialog).getByRole('button', { name: 'Chamar para o Consultório 8' })).not.toBeDisabled();
    expect(within(dialog).queryByTestId('called-room-info')).not.toBeInTheDocument();
  });

  it('ao recarregar, restaura a escolha feita nesta aba', async () => {
    sessionStorage.setItem('doctorActiveRoomId', '3');
    renderDoctor();

    await waitFor(() => expect(headerSelect()).toHaveDisplayValue('Consultório 8'));
  });

  it('descarta seleção salva que não existe mais no backend', async () => {
    sessionStorage.setItem('doctorActiveRoomId', '99');
    renderDoctor();

    await waitFor(() => expect(headerSelect()).toHaveValue(''));
    expect(sessionStorage.getItem('doctorActiveRoomId')).toBeNull();
    expect(screen.getByRole('button', { name: /selecionar para consulta/i })).toBeDisabled();
  });

  it('se a lista de consultórios falhar, mostra o erro e mantém a chamada bloqueada', async () => {
    getConsultoriosMock.mockResolvedValueOnce({ error: 'GET Error' });
    renderDoctor();

    expect(await screen.findByText(/não foi possível carregar os consultórios/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /selecionar para consulta/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
    await waitFor(() => expect(headerSelect()).not.toBeDisabled());
  });
});
