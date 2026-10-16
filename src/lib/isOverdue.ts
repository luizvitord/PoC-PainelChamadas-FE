import { Patient } from '@/types/patient';

// Atrasado = já passou do prazo do protocolo Manchester calculado pelo back.
// Sem prazo (combinação risco × tipo fora do protocolo) nunca é considerado atrasado.
export function isOverdue(patient: Pick<Patient, 'prazoAtendimentoAt'>, now: number): boolean {
  if (!patient.prazoAtendimentoAt) return false;
  return now > patient.prazoAtendimentoAt.getTime();
}
