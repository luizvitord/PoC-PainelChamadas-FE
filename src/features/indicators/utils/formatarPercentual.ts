const formatador = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

/** Percentual de 0 a 100 (como o back envia) no formato pt-BR. */
export function formatarPercentual(valor: number): string {
  return `${formatador.format(valor)}%`;
}
