import { afterEach, describe, expect, it, vi } from 'vitest';

import { getProtocolos, mapBackendProtocolos } from './ProtocoloService';

describe('mapBackendProtocolos', () => {
  it('maps the backend risk and type to the front vocabulary', () => {
    expect(mapBackendProtocolos([
      { risco: 'LARANJA', tipo: 'CLINICO', tempoMaximoMinutos: 10 },
      { risco: 'AZUL', tipo: 'PSIQUIATRICO', tempoMaximoMinutos: 240 },
    ])).toEqual([
      { priority: 'orange', attendanceType: 'clinical', tempoMaximoMinutos: 10 },
      { priority: 'blue', attendanceType: 'psychiatric', tempoMaximoMinutos: 240 },
    ]);
  });

  it('drops combinations with an unknown risk or type', () => {
    expect(mapBackendProtocolos([
      { risco: 'NAO_CLASSIFICADO', tipo: 'CLINICO', tempoMaximoMinutos: 0 },
      { risco: 'LARANJA', tipo: 'ODONTO', tempoMaximoMinutos: 10 },
    ])).toEqual([]);
  });
});

describe('getProtocolos', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads GET /protocolos', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ risco: 'LARANJA', tipo: 'SAMU', tempoMaximoMinutos: 10 }],
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getProtocolos()).resolves.toEqual([
      { priority: 'orange', attendanceType: 'samu', tempoMaximoMinutos: 10 },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/protocolos$/));
  });

  it('fails when the backend answers with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(getProtocolos()).rejects.toThrow('HTTP 500');
  });
});
