export const SuicidalBehaviorLabel = {
  none: 'Sem ideação ou tentativa',
  ideation: 'Ideação suicida',
  attempt: 'Tentativa de suicídio',
} as const;

export type SuicidalBehavior = keyof typeof SuicidalBehaviorLabel;

// Ordem de exibição: da ausência para a maior gravidade, como nas escalas de avaliação de risco.
export const SUICIDAL_BEHAVIOR_OPTIONS: { value: SuicidalBehavior; description: string }[] = [
  { value: 'none', description: 'Paciente SEM ideação suicida e SEM histórico de tentativa de suicídio recente.' },
  { value: 'ideation', description: 'Considerar pacientes SEM histórico de tentativa de suicídio recente, mas COM ideação suicida que motivou a procura do atendimento da emergência.' },
  { value: 'attempt', description: 'Considerar paciente COM histórico de tentativa de suicídio recente que motivou a procura do atendimento da emergência.' },
];
