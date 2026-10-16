# Indicadores: dados, cards e estados

Rota `/indicators`, acessível no menu inicial. Estrutura equivalente a `public-panel`:
`types.ts`, `hooks/`, `utils/`, `components/` e `IndicatorsFeature.tsx`.

## Task 1: integração GERAL/SAMU

O frontend requer backend com a correção `cc3198a` ou posterior. O hook
`useIndicadores({ inicio, fim, escopo })` consulta ambos os escopos sem flag
adicional. Escopo omitido usa GERAL. A chave de cache inclui período e escopo,
a atualização ocorre a cada 30 segundos e as requisições usam AbortSignal.
Não há fallback para mock em produção.

`IndicadoresResponse` e `Detalhamento` espelham os records Java.
`contagensPorRisco` é `Record<Risco, number>`, incluindo NAO_CLASSIFICADO no
contrato; a interface apresenta as cinco cores. Médias sem amostras são null.

Datas são locais, sem offset: o helper `toLocalDateTime` usa componentes locais,
sem `toISOString()`. Datas do seletor cobrem de 00:00:00 a 23:59:59.999999999,
incluindo frações do último segundo do dia. O helper possui testes.

A URL usa a configuração existente: `window.APP_CONFIG.apiUrl`, depois
`VITE_API_URL`, com padrão http://localhost:1111.

## Mocks reais

- `mocks/geral.json`: Geral exclui SAMU e mantém pacientes sem tipo.
- `mocks/samu.json`: somente SAMU.

Capturados via HTTP em 16/10/2026, backend `cc3198a`, com os arquivos originais
`docs/indicadores/schema.sql` e `docs/indicadores/seed_teste_indicadores.sql`.
JSONs apenas formatados, sem alteração dos dados. O mock antigo que misturava
os escopos foi removido. Período de captura: 2026-09-01T00:00:00 até
2026-09-03T23:59:59. Backend local na porta 1112, PostgreSQL 16 temporário no
container pet-task1-indicators, banco indicators_test, porta 55439.
O banco de desenvolvimento não foi usado nem limpo.

| Campo | GERAL | SAMU |
|---|---:|---:|
| cadastrados | 19 | 2 |
| classificados | 17 | 2 |
| atendidos | 14 | 2 |
| percentualClassificados | 89.47 | 100.00 |
| percentualAtendidos | 73.68 | 100.00 |
| LARANJA | 5 | 2 |

Exemplo de captura contra backend isolado já populado:

```sh
curl --fail 'http://localhost:1112/indicadores?inicio=2026-09-01T00:00:00&fim=2026-09-03T23:59:59&escopo=GERAL'
curl --fail 'http://localhost:1112/indicadores?inicio=2026-09-01T00:00:00&fim=2026-09-03T23:59:59&escopo=SAMU'
```

## Visual provisório

A tela é provisória para visualizar e testar dados, não substitui o design
oficial. Utiliza Header, Card, Input, Button e Skeleton existentes e as cores
do projeto. Esta etapa apenas ativa os dados dos dois escopos e remove o aviso
de backend indisponível; não redesenha a interface.

Há cards de cadastrados, classificados e atendidos com percentuais recebidos
do backend, e cinco cards por cor. Desistências e ocultação de cards específicos
para SAMU (IND-10) não fazem parte desta entrega.

Skeleton em novas consultas, inclusive filtros em cache, erros HTTP/rede,
período vazio e última atualização. Números antigos são ocultados durante
carregamento e erros.

O commit `0752d6d` da develop remota introduziu outra estrutura visual da equipe.
Esta branch `feat/indicadores-dados-cards-provisorios` ainda precisa ser integrada
com ela, preservando o design e a estrutura aprovados. Não houve merge automático.

## Testes

```sh
TZ=America/Fortaleza npm test -- src/features/indicators
npm run build
npx eslint src/features/indicators src/pages/Indicators.tsx
# Integração real: iniciar backend isolado com seed, depois:
INDICADORES_LIVE=true VITE_API_URL=http://localhost:1112 TZ=America/Fortaleza npm test -- src/features/indicators
# Servidor temporário desligado:
INDICADORES_OFFLINE=true VITE_API_URL=http://localhost:1112 TZ=America/Fortaleza npm test -- src/features/indicators/hooks/useIndicadores.live.test.tsx
```

Testes live são opt-in, usam HTTP real e não fazem seed ou limpeza de banco.
Validam igualdade integral com os mocks reais de cada escopo, padrão GERAL,
troca GERAL/SAMU, período vazio e HTTP 400. Os testes de componentes usam o
mock real GERAL para os números de aceite.

Limitações preexistentes da suíte geral: falha em
`public-panel/components/PublicPanelScreen.test.tsx` (texto 3 não encontrado).
O TypeScript geral aponta erros em `new-consultorio/hooks/useNewConsultorio.ts`
e `public-panel/hooks/usePanelSpeech.test.tsx`, não alterados nesta entrega.

Validação de conclusão em 16/10/2026: 24 testes aprovados com o backend ativo
(17 locais + 7 HTTP reais), mais 1 teste aprovado com o backend desligado.
Build e lint da feature aprovados. A checagem TypeScript geral continua limitada
pelos erros preexistentes citados acima; não apontou erros novos nesta feature.
