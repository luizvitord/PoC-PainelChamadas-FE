import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PatientAlreadyCalledError } from '@/lib/patientErrors';
import { PROTOCOLO_PADRAO } from '@/test/protocoloFixture';
import { Patient } from '@/types/patient';

import Doctor from './Doctor';

const toastMock = vi.fn();
const callForDoctorMock = vi.fn();
const recallPatientMock = vi.fn();
const refreshPatientsMock = vi.fn();
const completeConsultationMock = vi.fn();
const abandonConsultationMock = vi.fn();
const getConsultoriosMock = vi.fn();
let waitingForDoctor: Patient[] = [];

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/hooks/useProtocolos', () => ({
  useProtocolos: () => ({ data: PROTOCOLO_PADRAO, isLoading: false }),
}));

vi.mock('@/services/ConsultorioService', () => ({
  getConsultorios: () => getConsultoriosMock(),
}));

vi.mock('@/contexts/PatientContext', () => ({
  usePatients: () => ({
    getWaitingForDoctor: () => waitingForDoctor,
    callForDoctor: callForDoctorMock,
    recallPatient: recallPatientMock,
    completeConsultation: completeConsultationMock,
    abandonConsultation: abandonConsultationMock,
    refreshPatients: refreshPatientsMock,
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

// IDs propositalmente diferentes dos números exibidos no painel público
const CONSULTORIOS = [
  { id: 2, numero: 7 },
  { id: 3, numero: 8 },
];

const roomPatient: Patient = { ...patient, id: '10', priority: 'green', attendanceType: 'clinical' };

const renderDoctor = () =>
  render(
    <MemoryRouter>
      <Doctor />
    </MemoryRouter>,
  );

const headerSelect = () => screen.getAllByRole('combobox')[0];

const openPatientModal = async () => {
  await screen.findByRole('option', { name: 'Consultório 1' });
  fireEvent.change(headerSelect(), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: /selecionar para consulta/i }));
  return screen.findByRole('dialog', { name: 'Chamar Paciente' });
};

const resetMocks = (consultorios: unknown) => {
  vi.clearAllMocks();
  sessionStorage.clear();
  getConsultoriosMock.mockResolvedValue(consultorios);
  callForDoctorMock.mockResolvedValue(undefined);
  recallPatientMock.mockResolvedValue(undefined);
  refreshPatientsMock.mockResolvedValue(undefined);
  completeConsultationMock.mockResolvedValue(undefined);
  abandonConsultationMock.mockResolvedValue(undefined);
};

describe('Doctor call modal lock', () => {
  beforeEach(() => {
    resetMocks([{ id: 1, numero: 1 }]);
    waitingForDoctor = [patient];
  });

  it('can be closed before the patient is called', async () => {
    renderDoctor();
    await openPatientModal();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Chamar Paciente' })).not.toBeInTheDocument());
    expect(callForDoctorMock).not.toHaveBeenCalled();
  });

  it('locks after the patient is called: X stays visible but blocked, and Esc does nothing', async () => {
    renderDoctor();
    const dialog = await openPatientModal();

    fireEvent.click(screen.getByRole('button', { name: 'Chamar para o Consultório 1' }));
    await screen.findByRole('button', { name: 'Chamar novamente' });

    const close = within(dialog).getByRole('button', { name: /fechar indisponível/i });
    expect(close).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(close);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.getByRole('dialog', { name: 'Chamar Paciente' })).toBeInTheDocument();
  });

  it('warns and closes the modal when another office called the patient first', async () => {
    callForDoctorMock.mockRejectedValue(new PatientAlreadyCalledError());
    renderDoctor();
    await openPatientModal();

    fireEvent.click(screen.getByRole('button', { name: 'Chamar para o Consultório 1' }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Paciente já chamado', variant: 'destructive' })),
    );
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Chamar Paciente' })).not.toBeInTheDocument());
  });
});

describe('Doctor suicidal behavior assessment', () => {
  beforeEach(() => {
    resetMocks([{ id: 1, numero: 1 }]);
    waitingForDoctor = [patient];
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

    await waitFor(() => expect(completeConsultationMock).toHaveBeenCalledWith('1', 'ideation', null));
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

describe('Doctor reclassification', () => {
  beforeEach(() => {
    resetMocks([{ id: 1, numero: 1 }]);
    waitingForDoctor = [patient];
  });

  const callPatient = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Chamar para o Consultório 1' }));
    await screen.findByRole('button', { name: 'Chamar novamente' });
  };

  it('only offers reclassification after the patient is called', async () => {
    renderDoctor();
    await openPatientModal();

    expect(screen.queryByRole('button', { name: 'Alterar' })).not.toBeInTheDocument();

    await callPatient();
    expect(screen.getByRole('button', { name: 'Alterar' })).toBeInTheDocument();
  });

  it('finishes with the doctor color and shows the change in the confirmation', async () => {
    renderDoctor();
    await openPatientModal();
    await callPatient();

    fireEvent.click(screen.getByRole('button', { name: 'Alterar' }));
    fireEvent.click(await screen.findByRole('radio', { name: 'Vermelho — Emergência' }));
    expect(screen.getByText('Acolhimento:')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /^sem ideação/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar Consulta' }));

    const confirm = await screen.findByRole('dialog', { name: 'Confirmar finalização' });
    expect(confirm).toHaveTextContent('Prioridade reclassificada: Muito urgente → Emergência');

    fireEvent.click(screen.getByRole('button', { name: 'Sim, finalizar' }));
    await waitFor(() => expect(completeConsultationMock).toHaveBeenCalledWith('1', 'none', 'red'));
  });

  it('Desfazer goes back to the triage color and finishes without reclassification', async () => {
    renderDoctor();
    await openPatientModal();
    await callPatient();

    fireEvent.click(screen.getByRole('button', { name: 'Alterar' }));
    fireEvent.click(await screen.findByRole('radio', { name: 'Amarelo — Urgente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(screen.queryByText('Acolhimento:')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /^sem ideação/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar Consulta' }));
    const confirm = await screen.findByRole('dialog', { name: 'Confirmar finalização' });
    expect(confirm).not.toHaveTextContent('Prioridade reclassificada');

    fireEvent.click(screen.getByRole('button', { name: 'Sim, finalizar' }));
    await waitFor(() => expect(completeConsultationMock).toHaveBeenCalledWith('1', 'none', null));
  });
});

describe('Doctor - seu consultório', () => {
  beforeEach(() => {
    resetMocks(CONSULTORIOS);
    waitingForDoctor = [roomPatient];
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
