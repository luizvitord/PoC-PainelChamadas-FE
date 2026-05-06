import { describe, expect, it, vi } from 'vitest';

import { mapBackendPanelCall } from './mapBackendPanelCall';

describe('mapBackendPanelCall', () => {
  it('maps doctor calls using consultorioNumero as the display room', () => {
    const call = mapBackendPanelCall({
      id: 12,
      patientName: 'Maria Silva',
      ticketNumber: 'P-0012',
      type: 'doctor',
      destination: 'Consultorio 3',
      consultorioId: 99,
      consultorioNumero: 3,
      priority: 'yellow',
      createdAt: '2026-04-28T10:15:30',
    }, true);

    expect(call).toEqual({
      callId: '12',
      ticketNumber: 'P-0012',
      patientName: 'Maria Silva',
      type: 'doctor',
      room: '3',
      priority: 'yellow',
      timestamp: new Date('2026-04-28T10:15:30'),
      shouldAnnounce: true,
    });
  });

  it('falls back to consultorioId and destination for doctor room mapping', () => {
    expect(mapBackendPanelCall({
      id: 1,
      type: 'doctor',
      consultorioId: 7,
      consultorioNumero: null,
    }).room).toBe('7');

    expect(mapBackendPanelCall({
      id: 2,
      type: 'doctor',
      destination: 'Consultorio externo',
      consultorioId: null,
      consultorioNumero: null,
    }).room).toBe('Consultorio externo');
  });

  it('maps triage calls to the triage destination by default', () => {
    expect(mapBackendPanelCall({
      id: 'triage-1',
      type: 'triage',
    })).toMatchObject({
      callId: 'triage-1',
      type: 'triage',
      room: 'Triagem',
      shouldAnnounce: false,
    });
  });

  it('defaults unknown call types to triage', () => {
    expect(mapBackendPanelCall({
      id: 3,
      type: 'unknown',
      destination: 'Acolhimento',
    })).toMatchObject({
      type: 'triage',
      room: 'Acolhimento',
    });
  });

  it('drops unsupported priorities', () => {
    expect(mapBackendPanelCall({
      id: 4,
      priority: 'purple',
    }).priority).toBeUndefined();

    expect(mapBackendPanelCall({
      id: 5,
      priority: null,
    }).priority).toBeUndefined();
  });

  it('uses empty strings for missing optional text fields', () => {
    expect(mapBackendPanelCall({ id: 6 })).toMatchObject({
      ticketNumber: '',
      patientName: '',
    });
  });

  it('uses the current date when createdAt is missing', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T12:00:00'));

    expect(mapBackendPanelCall({ id: 7 }).timestamp).toEqual(new Date('2026-04-28T12:00:00'));

    vi.useRealTimers();
  });

  it('uses the Unix epoch when createdAt is invalid', () => {
    expect(mapBackendPanelCall({
      id: 8,
      createdAt: 'not-a-date',
    }).timestamp).toEqual(new Date(0));
  });
});
