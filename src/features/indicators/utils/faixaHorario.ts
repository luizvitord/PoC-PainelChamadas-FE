/** HH:MM de um LocalDateTime do back, sem passar por Date (que aplicaria fuso). */
export function horaDe(dataHora: string): string {
  return dataHora.slice(11, 16);
}

/** DD/MM HH:MM de um LocalDateTime do back. */
export function diaEHoraDe(dataHora: string): string {
  return `${dataHora.slice(8, 10)}/${dataHora.slice(5, 7)} ${horaDe(dataHora)}`;
}

/**
 * Faixa de hora inclusiva (HH:MM). Vazio não limita aquele lado; início depois do fim
 * cruza a meia-noite (ex.: plantão 22:00 → 06:00). Sem horário só passa sem filtro.
 */
export function dentroDaFaixa(dataHora: string | null, horaInicio: string, horaFim: string): boolean {
  if (!horaInicio && !horaFim) return true;
  if (!dataHora) return false;

  const hora = horaDe(dataHora);
  if (!horaInicio) return hora <= horaFim;
  if (!horaFim) return hora >= horaInicio;
  if (horaInicio <= horaFim) return hora >= horaInicio && hora <= horaFim;
  return hora >= horaInicio || hora <= horaFim;
}
