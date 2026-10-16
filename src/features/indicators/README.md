# Indicadores: dados, cards e estados

Rota `/indicators`, acessível no menu inicial. Estrutura equivalente a `public-panel`:
`types.ts`, `hooks/`, `utils/`, `components/` e `IndicatorsFeature.tsx`.

## Contrato e comportamento

- `IndicadoresResponse` e `Detalhamento` espelham os records Java do backend em `8d6e8b4`.
- `contagensPorRisco` é `Record<Risco, number>`, incluindo NAO_CLASSIFICADO no contrato; a tela exibe as cinco cores.
- Hook `useIndicadores({ inicio, fim, escopo })`, padrão GERAL; chave inclui os três filtros, intervalo de 30 segundos e cancelamento por AbortSignal.
- Usa a URL de API já configurada no projeto (`window.APP_CONFIG.apiUrl`, depois `VITE_API_URL`).
- Datas locais sem offset: `toLocalDateTime` usa componentes locais. O seletor de datas envia início às 00:00:00 e fim às 23:59:59.999999999, incluindo todo o último dia. Não usa `toISOString()`.
- Cards próprios para cadastrados, classificados, atendidos e componente reutilizado para cada cor. Os percentuais vêm do backend e são formatados em pt-BR, sem recalcular ou excluir SAMU no frontend.
- Skeleton em toda consulta, inclusive ao voltar a um filtro em cache. Dados antigos são ocultados durante a atualização e em erros. Nenhum `keepPreviousData`.
- Erro de rede, HTTP 400/outros erros, botão para repetir, período vazio e horário da última resposta bem-sucedida.
- Sem desistências (dependência de indicadores BE-02). Não implementa a ocultação de cards SAMU de IND-10.

## Bloqueio real do backend (conferido em 16/10/2026)

Foi feito fetch e inspecionadas todas as branches remotas. `IndicadorController`,
`IndicadorService`, `IndicadorRepository` e DTO são idênticos nas branches
`feat/be-2-historico-chamadas`, `feat/be-3-prazo-manchester`,
`feat/be-4-anonimizar-chamadas`, `fix/isolate-integration-tests` e
`feat/postgresql-migration`. Nenhuma implementa o parâmetro escopo.
A branch BE-04 disponível trata de anonimização, não do filtro dos indicadores.

GET com GERAL e SAMU retorna o mesmo conteúdo. O backend ignora o parâmetro extra.
Por isso o frontend exibe um aviso explícito e impede a consulta exclusiva SAMU;
não mostra dados combinados com rótulo SAMU. Quando a implementação correta entrar,
configurar `VITE_INDICADORES_ESCOPOS_SUPORTADOS=true` no build e validar novamente.
Essa opção NÃO implementa o filtro e não deve ser ligada contra o backend atual.

| Campo | Resposta real atual | Aceite solicitado para GERAL |
|---|---:|---:|
| cadastrados | 21 | 19 |
| classificados | 19 | 17 |
| percentualClassificados | 90,48 | 89,47 |
| atendidos | 16 | 14 |
| percentualAtendidos | 76,19 | 73,68 |
| LARANJA | 7 | 5 |

Os valores da task correspondem à exclusão dos dois pacientes SAMU do seed.
O frontend não subtrai esses valores nem altera o seed para aparentar conclusão.
As verificações UI com 19/17/14 são fixtures sintéticas explícitas dentro dos testes;
não são respostas reais nem mocks de API por escopo.

## Mock real e reprodução

`mocks/backend-atual-geral-inclui-samu.json` é a resposta HTTP real capturada em
16/10/2026 do backend `8d6e8b4`, com schema e seed originais, sem edição do conteúdo.
Período: inicio=2026-09-01T00:00:00, fim=2026-09-03T23:59:59, escopo=GERAL.
Executado em PostgreSQL 16 temporário no container `pet-indicators-fixtures`,
banco `indicators_test`, porta local 55439, backend na porta 1112.
O banco de desenvolvimento não foi usado nem limpo.
A resposta solicitada com SAMU foi comparada byte a byte e é idêntica; não foi
salva como mock SAMU, pois isso documentaria um filtro inexistente.

Pendentes: mocks reais GERAL sem SAMU e SAMU exclusivo, e aceite integrado dos
dois escopos. Depois do BE-04 correto, recapturar os JSONs e ajustar o teste live.

## Validação

```sh
TZ=America/Fortaleza npm test -- src/features/indicators
npm run build
npx eslint src/features/indicators src/pages/Indicators.tsx
# Backend temporário com o seed deve estar rodando nesta URL:
INDICADORES_LIVE=true VITE_API_URL=http://localhost:1112 TZ=America/Fortaleza npm test -- src/features/indicators/hooks/useIndicadores.live.test.tsx
# Depois de desligar o backend temporário:
INDICADORES_OFFLINE=true VITE_API_URL=http://localhost:1112 TZ=America/Fortaleza npm test -- src/features/indicators/hooks/useIndicadores.live.test.tsx
```

17 testes locais dos indicadores e 3 live aprovados; offline verificado separadamente.
Os testes live são opt-in e não fazem seed, escrita ou limpeza de banco.
Build e lint dos arquivos novos aprovados. A suíte geral apresentou falha em
`public-panel/components/PublicPanelScreen.test.tsx` (texto `3` não encontrado).
`tsc --noEmit -p tsconfig.app.json` aponta erros preexistentes em
`new-consultorio/hooks/useNewConsultorio.ts` e `public-panel/hooks/usePanelSpeech.test.tsx`.
Esses arquivos não foram alterados nesta entrega.
