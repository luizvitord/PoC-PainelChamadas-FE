import { Patient } from '@/types/patient';

import { riscoParaPrioridade } from './riscoParaPrioridade';
import { tipoParaAtendimento } from './tipoParaAtendimento';

// Paciente como o back devolve: as datas são LocalDateTime em texto, sem fuso ("2026-10-08T10:15:30").
export interface BackendPatient {
  id: number | string;
  nome?: string | null;
  cpf?: string | null;
  triageNotes?: string | null;
  risco?: string | null;
  tipo?: string | null;
  chegadaAt?: string | null;
  classifiedAt?: string | null;
  chamadaTriagemAt?: string | null;
  chamadaConsultorioAt?: string | null;
  atendimentoFinalizadoAt?: string | null;
  prazoAtendimentoAt?: string | null;
}

// Único ponto em que o paciente do back vira Patient: as telas já recebem as datas como Date.
export function mapBackendPatient(patient: BackendPatient, status: Patient['status']): Patient {
  return {
    id: String(patient.id),
    fullName: patient.nome ?? '',
    cpf: patient.cpf ?? '',
    // O back ainda não persiste a senha do paciente.
    ticketNumber: '',
    status,
    priority: riscoParaPrioridade(patient.risco ?? '') ?? undefined,
    attendanceType: tipoParaAtendimento(patient.tipo ?? '') ?? undefined,
    triageNotes: patient.triageNotes ?? undefined,
    chegadaAt: toDate(patient.chegadaAt),
    classifiedAt: toDate(patient.classifiedAt),
    chamadaTriagemAt: toDate(patient.chamadaTriagemAt),
    chamadaConsultorioAt: toDate(patient.chamadaConsultorioAt),
    atendimentoFinalizadoAt: toDate(patient.atendimentoFinalizadoAt),
    prazoAtendimentoAt: toDate(patient.prazoAtendimentoAt),
  };
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}
