import { API_BASE_URL } from '@/lib/appConfig';
import { riscoParaPrioridade } from '@/lib/utils/riscoParaPrioridade';
import { tipoParaAtendimento } from '@/lib/utils/tipoParaAtendimento';
import { ProtocoloTempo } from '@/types/protocolo';

export interface BackendProtocoloTempo {
  risco: string;
  tipo: string;
  tempoMaximoMinutos: number;
}

// Descarta combinações com risco ou tipo que o front não conhece.
export function mapBackendProtocolos(protocolos: BackendProtocoloTempo[]): ProtocoloTempo[] {
  return protocolos.flatMap(({ risco, tipo, tempoMaximoMinutos }) => {
    const priority = riscoParaPrioridade(risco);
    const attendanceType = tipoParaAtendimento(tipo);
    return priority && attendanceType ? [{ priority, attendanceType, tempoMaximoMinutos }] : [];
  });
}

export async function getProtocolos(): Promise<ProtocoloTempo[]> {
  const response = await fetch(`${API_BASE_URL}/protocolos`);

  if (!response.ok) {
    throw new Error(`Falha ao carregar o protocolo (HTTP ${response.status})`);
  }

  return mapBackendProtocolos(await response.json());
}
