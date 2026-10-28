/** Escopo do GET /indicadores: GERAL (padrão, exclui SAMU) ou SAMU. */
export type Escopo = 'GERAL' | 'SAMU';

export const ESCOPOS: { id: Escopo; label: string }[] = [
  { id: 'GERAL', label: 'Geral' },
  { id: 'SAMU', label: 'SAMU' },
];

// O tipo SAMU só é definido na triagem: no SAMU cadastrados é sempre igual a classificados,
// então esses números não dizem nada e ficam escondidos (IND-10).
export const OCULTOS_NO_SAMU = ['cadastrados', 'percentualClassificados', 'desistenciaAcolhimentoClassificacao'] as const;

export type IndicadorOcultoNoSamu = (typeof OCULTOS_NO_SAMU)[number];

/** Usado pelas abas para decidir se um indicador aparece no escopo ativo. */
export function visivelNoEscopo(indicador: string, escopo: Escopo): boolean {
  return escopo !== 'SAMU' || !(OCULTOS_NO_SAMU as readonly string[]).includes(indicador);
}
