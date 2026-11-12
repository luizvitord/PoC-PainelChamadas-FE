export interface Consultorio {
  id: number | string;
  numero?: number | string | null;
}

/**
 * O painel público exibe o NÚMERO do consultório (backend: formatarDestinoConsultorio),
 * enquanto a chamada envia o ID. Exibimos sempre o número para que o médico veja
 * exatamente o que o paciente verá no painel.
 */
export function formatConsultorioLabel(consultorio: Consultorio | undefined | null) {
  if (!consultorio) return '';
  return `Consultório ${consultorio.numero ?? consultorio.id}`;
}
