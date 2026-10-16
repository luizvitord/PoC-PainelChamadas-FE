/** Usa os componentes locais; nunca converte a data selecionada para UTC. */
export function toLocalDateTime(date: Date): string {
  if (Number.isNaN(date.getTime())) throw new Error('Data inválida.');
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Datas do input type=date são civis: não usar new Date('YYYY-MM-DD'). */
export function dataParaLocalDateTime(value: string, limite: 'inicio' | 'fim'): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Informe uma data válida.');
  const [ano, mes, dia] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(ano, mes - 1, dia);
  date.setHours(0, 0, 0, 0);
  if (date.getFullYear() !== ano || date.getMonth() !== mes - 1 || date.getDate() !== dia) {
    throw new Error('Informe uma data válida.');
  }
  return `${value}T${limite === 'inicio' ? '00:00:00' : '23:59:59.999999999'}`;
}
