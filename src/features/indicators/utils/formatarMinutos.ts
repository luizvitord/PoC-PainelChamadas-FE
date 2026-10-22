const SEM_VALOR = '--:--:--';

/** Minutos (com fração) em HH:MM:SS, arredondando ao segundo; as horas podem passar de 24. */
export function formatarMinutos(minutos: number | null): string {
  if (minutos === null || !Number.isFinite(minutos)) return SEM_VALOR;

  const totalSegundos = Math.round(minutos * 60);
  const horas = Math.floor(totalSegundos / 3600);
  const min = Math.floor((totalSegundos % 3600) / 60);
  const seg = totalSegundos % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${pad(horas)}:${pad(min)}:${pad(seg)}`;
}
