import { describe, expect, it } from 'vitest';

import { mapBackendPatient } from './mapBackendPatient';

describe('mapBackendPatient', () => {
  it('maps a classified patient converting every backend date to Date', () => {
    const patient = mapBackendPatient({
      id: 7,
      nome: 'Maria da Silva',
      cpf: '123.456.789-00',
      triageNotes: 'Ansiedade intensa',
      risco: 'LARANJA',
      tipo: 'PSIQUIATRICO',
      chegadaAt: '2026-10-08T10:00:00',
      classifiedAt: '2026-10-08T10:20:00',
      chamadaTriagemAt: '2026-10-08T10:05:00',
      chamadaConsultorioAt: '2026-10-08T10:40:00',
      atendimentoFinalizadoAt: null,
      prazoAtendimentoAt: '2026-10-08T10:30:00',
    }, 'waiting-doctor');

    expect(patient).toEqual({
      id: '7',
      fullName: 'Maria da Silva',
      cpf: '123.456.789-00',
      ticketNumber: '',
      status: 'waiting-doctor',
      priority: 'orange',
      attendanceType: 'psychiatric',
      triageNotes: 'Ansiedade intensa',
      chegadaAt: new Date('2026-10-08T10:00:00'),
      classifiedAt: new Date('2026-10-08T10:20:00'),
      chamadaTriagemAt: new Date('2026-10-08T10:05:00'),
      chamadaConsultorioAt: new Date('2026-10-08T10:40:00'),
      atendimentoFinalizadoAt: null,
      prazoAtendimentoAt: new Date('2026-10-08T10:30:00'),
    });
  });

  it('reads the backend LocalDateTime as local time, without shifting the time zone', () => {
    const patient = mapBackendPatient({ id: 1, chegadaAt: '2026-10-08T10:15:30' }, 'waiting-triage');

    expect(patient.chegadaAt?.getHours()).toBe(10);
    expect(patient.chegadaAt?.getMinutes()).toBe(15);
  });

  it('keeps a patient waiting for triage without color or attendance type', () => {
    const patient = mapBackendPatient({ id: 2, nome: 'João', risco: 'NAO_CLASSIFICADO', tipo: null }, 'waiting-triage');

    expect(patient.priority).toBeUndefined();
    expect(patient.attendanceType).toBeUndefined();
  });

  it('uses null for missing or invalid dates instead of inventing one', () => {
    const patient = mapBackendPatient({ id: 3, chegadaAt: undefined, classifiedAt: 'data-invalida' }, 'waiting-triage');

    expect(patient.chegadaAt).toBeNull();
    expect(patient.classifiedAt).toBeNull();
  });
});
