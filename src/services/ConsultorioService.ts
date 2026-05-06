const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:1111'}/consultorios`;

export interface Consultorio {
  id: string | number;
  numero?: string | number;
}

export interface ConsultorioErrorResponse {
  error: string;
}

function normalizeConsultorioNumero(consultorio: Consultorio) {
  return String(consultorio.numero ?? consultorio.id).trim();
}

export function validateConsultorioNumero(numero: string, consultorios: Consultorio[] = []) {
  const normalizedNumero = String(numero).trim();

  if (!normalizedNumero || normalizedNumero.length !== 1) {
    return { error: 'O consultório deve ter exatamente 1 dígito.' };
  }

  const n = Number(normalizedNumero);

  if (Number.isNaN(n)) {
    return { error: 'Insira um número válido para o consultório.' };
  }

  if (n < 1 || n > 9) {
    return { error: 'Insira um número entre 1 e 9 para o consultório.' };
  }

  if (consultorios.some((consultorio) => normalizeConsultorioNumero(consultorio) === String(n))) {
    return { error: `O consultório nº ${n} já existe.` };
  }

  return { value: n };
}

export async function addConsultorio(numero: string, consultorios: Consultorio[] = []) {
  const validation = validateConsultorioNumero(numero, consultorios);

  if (validation.error) {
    return { error: validation.error };
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numero: validation.value }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    return { error: data?.message || 'Erro ao cadastrar consultório' };
  }

  return { success: true };
}

export function isConsultorioErrorResponse(
  response: Consultorio[] | ConsultorioErrorResponse,
): response is ConsultorioErrorResponse {
  return 'error' in response;
}

export async function getConsultorios() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    return { error: data?.message || 'GET Error' };
  }

  const data = await response.json();
  return data as Consultorio[];
}
