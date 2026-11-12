import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PatientAlreadyCalledError } from '@/lib/patientErrors';
import { SuicidalBehavior } from '@/lib/suicidalBehavior';

import { PatientProvider, usePatients } from './PatientContext';

const { getMock, putMock } = vi.hoisted(() => ({ getMock: vi.fn(), putMock: vi.fn() }));

vi.mock('axios', () => ({
  default: { create: () => ({ get: getMock, put: putMock, post: vi.fn() }) },
}));

describe('PatientContext completeConsultation', () => {
  it.each<[SuicidalBehavior, string]>([
    ['none', 'NENHUM'],
    ['ideation', 'IDEACAO'],
    ['attempt', 'TENTATIVA'],
  ])('sends the %s assessment to the backend as %s', async (behavior, backendValue) => {
    getMock.mockResolvedValue({ data: [] });
    putMock.mockResolvedValue({});
    let context: ReturnType<typeof usePatients> | undefined;
    const Capture = () => {
      context = usePatients();
      return null;
    };

    render(
      <PatientProvider>
        <Capture />
      </PatientProvider>,
    );
    await waitFor(() => expect(context).toBeDefined());
    await context!.completeConsultation('7', behavior);

    expect(putMock).toHaveBeenCalledWith('/pacientes/7/finalizar', { comportamentoSuicida: backendValue });
  });

  it("sends the doctor's reclassification as riscoReclassificado", async () => {
    getMock.mockResolvedValue({ data: [] });
    putMock.mockResolvedValue({});
    let context: ReturnType<typeof usePatients> | undefined;
    const Capture = () => {
      context = usePatients();
      return null;
    };

    render(
      <PatientProvider>
        <Capture />
      </PatientProvider>,
    );
    await waitFor(() => expect(context).toBeDefined());
    await context!.completeConsultation('7', 'none', 'red');

    expect(putMock).toHaveBeenCalledWith('/pacientes/7/finalizar', {
      comportamentoSuicida: 'NENHUM',
      riscoReclassificado: 'VERMELHO',
    });
  });
});

describe('PatientContext callForDoctor', () => {
  const renderContext = async () => {
    let context: ReturnType<typeof usePatients> | undefined;
    const Capture = () => {
      context = usePatients();
      return null;
    };
    render(
      <PatientProvider>
        <Capture />
      </PatientProvider>,
    );
    await waitFor(() => expect(context).toBeDefined());
    return context!;
  };

  it('turns a 409 from the backend into PatientAlreadyCalledError', async () => {
    getMock.mockResolvedValue({ data: [] });
    putMock.mockRejectedValue({ response: { status: 409 } });
    const context = await renderContext();

    await expect(context.callForDoctor('7', '2')).rejects.toBeInstanceOf(PatientAlreadyCalledError);
    expect(putMock).toHaveBeenCalledWith('/pacientes/7/chamar?consultorioId=2');
  });

  it('keeps other failures as they are', async () => {
    getMock.mockResolvedValue({ data: [] });
    const falhaDeRede = new Error('Network Error');
    putMock.mockRejectedValue(falhaDeRede);
    const context = await renderContext();

    await expect(context.callForDoctor('7', '2')).rejects.toBe(falhaDeRede);
  });
});
