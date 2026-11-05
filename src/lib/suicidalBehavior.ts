export const SuicidalBehaviorLabel = {
  none: 'Sem ideação ou tentativa',
  ideation: 'Ideação suicida',
  attempt: 'Tentativa de suicídio',
} as const;

export type SuicidalBehavior = keyof typeof SuicidalBehaviorLabel;

// Ordem de exibição: da ausência para a maior gravidade, como nas escalas de avaliação de risco.
export const SUICIDAL_BEHAVIOR_OPTIONS: { value: SuicidalBehavior; description: string }[] = [
  { value: 'none', description: 'Não relata pensamentos nem tentativas de tirar a própria vida.' },
  { value: 'ideation', description: 'Pensa ou já pensou em tirar a própria vida.' },
  { value: 'attempt', description: 'Já tentou tirar a própria vida. Marque esta opção mesmo que também haja ideação.' },
];
