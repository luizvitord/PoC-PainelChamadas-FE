export const INDICADORES_REFETCH_INTERVAL = 30_000;
export const CORES = [
  { risco: 'VERMELHO', nome: 'Vermelho', classe: 'border-t-red-600', ponto: 'bg-red-600' },
  { risco: 'LARANJA', nome: 'Laranja', classe: 'border-t-orange-500', ponto: 'bg-orange-500' },
  { risco: 'AMARELO', nome: 'Amarelo', classe: 'border-t-yellow-400', ponto: 'bg-yellow-400' },
  { risco: 'VERDE', nome: 'Verde', classe: 'border-t-green-600', ponto: 'bg-green-600' },
  { risco: 'AZUL', nome: 'Azul', classe: 'border-t-blue-600', ponto: 'bg-blue-600' },
] as const;
