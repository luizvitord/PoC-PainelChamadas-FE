import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
});
