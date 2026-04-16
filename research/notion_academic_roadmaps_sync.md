# Sincronização de roadmaps acadêmicos do Notion

Este documento registra a evolução da integração entre o workspace do **Notion** e a plataforma/blog de estudos em Visão Computacional. Nesta etapa, a solução deixou de depender apenas de snapshots embutidos em código e passou a contar com um **fluxo operacional ao vivo**, capaz de consultar a base do Notion via MCP, transformar páginas acadêmicas em dados estruturados e persisti-las no banco da plataforma.

## Objetivo da integração

A integração foi desenhada para transformar páginas do Notion sobre **pós-graduação, especialização e formações acadêmicas em Visão Computacional** em dados estruturados consumíveis pelo site. Em vez de deixar esses roadmaps apenas como páginas isoladas no workspace, a plataforma agora consegue sustentar um fluxo mais coerente entre curadoria, armazenamento e publicação.

| Camada | Responsabilidade | Situação atual |
| --- | --- | --- |
| Banco de dados | Persistir roadmaps acadêmicos sincronizados | Implementado |
| Backend da plataforma | Expor os roadmaps para área pública e área autenticada | Implementado |
| Interface Home | Renderizar os cards importados na seção de recomendações | Implementado |
| Parser acadêmico | Transformar conteúdo bruto do Notion em payload persistível | Implementado |
| Importação operacional ao vivo | Ler a base do Notion via MCP e gravar no banco | Implementado |
| Sincronização automática em runtime do app publicado | Consultar Notion diretamente dentro do runtime web | Pendente |

## Origem atualmente mapeada

Até o momento, o mapeamento direto do Notion confirmou a base `👁️ Trilha de Visão Computacional` e identificou pelo menos um roadmap acadêmico claramente elegível para sincronização pública.

| Campo | Valor |
| --- | --- |
| Database do Notion | `81d79aa254ac4a6392bc5ccfb6d294b0` |
| Data source | `collection://4934f4a4-2787-42ec-83d6-31dc9e2162fb` |
| View usada na leitura | `view://2e85edcd-4586-4ea5-8a4c-2a26112fb285` |
| Página acadêmica sincronizada | `3411c6633ba9808db32dfd36f81a0289` |
| Título | `[Especialização] Visão Computacional: Interpretando o Mundo Através de Imagens - Computer Vision Master` |
| Instituição inferida | `PUC-Rio` |
| URL de origem | `https://www.notion.so/3411c6633ba9808db32dfd36f81a0289` |

## Modelagem persistida

A tabela `academicRoadmaps` em `drizzle/schema.ts` continua sendo a base persistida da solução. Ela foi mantida compatível com o estágio anterior, mas agora é alimentada por um parser que lê conteúdo vivo do Notion e produz um payload normalizado.

| Campo persistido | Finalidade |
| --- | --- |
| `notionPageId` | Identificador estável da página no Notion |
| `slug` | Identificador amigável para interface e rotas futuras |
| `title` | Nome principal do roadmap/programa |
| `institution` | Instituição ofertante |
| `programType` | Tipo do programa, como especialização ou pós-graduação |
| `formatLabel` | Modalidade do curso |
| `durationText` | Duração informada ou inferida |
| `workloadText` | Carga horária informada |
| `summary` | Resumo editorial extraído do conteúdo |
| `curriculumText` | Ementa/conteúdo programático consolidado |
| `audienceText` | Público-alvo |
| `sourceUrl` | Link da página original no Notion |
| `tagsJson` | Tags estruturadas para filtros e organização |
| `status` | Estado editorial (`draft` ou `published`) |
| `sortOrder` | Ordem de exibição na interface |

## Camadas atualizadas no código

A integração atual está distribuída entre normalização, importação operacional e publicação na interface.

| Arquivo | Papel na integração |
| --- | --- |
| `drizzle/schema.ts` | Define a tabela `academicRoadmaps` |
| `server/db.ts` | Faz leitura pública/privada e upsert idempotente por `notionPageId` |
| `server/routers.ts` | Mantém exposição dos dados sincronizados para a interface |
| `server/notionAcademicRoadmaps.ts` | Normaliza payload bruto do Notion em registro persistível |
| `scripts/sync-notion-roadmaps-live.mjs` | Consulta Notion via MCP, filtra páginas acadêmicas e grava no banco |
| `client/src/pages/Home.tsx` | Renderiza os roadmaps importados na Home |
| `server/notionAcademicRoadmaps.test.ts` | Valida a extração dos campos acadêmicos a partir do conteúdo do Notion |

## Fluxo operacional atual

O fluxo agora é **operacional ao vivo**, ainda dependente do ambiente de trabalho com MCP habilitado, mas sem necessidade de manter o conteúdo acadêmico hardcoded dentro do script.

| Etapa | Descrição |
| --- | --- |
| 1 | O script consulta a database e a view do Notion via MCP |
| 2 | As linhas retornadas são filtradas por heurísticas de roadmap acadêmico |
| 3 | Cada página candidata é buscada diretamente na origem |
| 4 | O parser extrai `summary`, `curriculumText`, `audienceText`, instituição, modalidade e tags |
| 5 | O script localiza a proprietária pelo `OWNER_OPEN_ID` |
| 6 | O backend faz `upsert` por `notionPageId`, evitando duplicações |
| 7 | A Home passa a refletir os roadmaps persistidos no payload público |

### Comando principal de execução

```bash
cd /home/ubuntu/cv-emily-roadmap
pnpm exec tsx scripts/sync-notion-roadmaps-live.mjs
```

### Parâmetros opcionais

O script aceita, opcionalmente, o `databaseId` e a `viewUrl` como argumentos para reaproveitamento futuro.

```bash
pnpm exec tsx scripts/sync-notion-roadmaps-live.mjs <databaseId> <viewUrl>
```

## Estratégia de integridade

A consistência da solução atual foi tratada com decisões simples, mas importantes para reduzir duplicidade e fragilidade editorial.

| Medida | Justificativa |
| --- | --- |
| `upsert` por `notionPageId` | Evita duplicar a mesma página a cada nova sincronização |
| Parser isolado em módulo próprio | Permite testar a transformação sem depender do MCP durante os testes |
| Filtro por heurísticas de título/categoria | Reduz importação indevida de páginas que não são roadmaps acadêmicos |
| `sortOrder` persistido | Mantém previsibilidade de exibição na Home |
| Tags derivadas do conteúdo | Prepara filtros futuros por modalidade, tema e perfil de formação |

## Validação realizada

A atualização foi validada em múltiplos níveis, incluindo a etapa de importação ao vivo da origem.

| Tipo de validação | Resultado |
| --- | --- |
| Migração do banco com `pnpm db:push` | OK |
| Testes automatizados com `pnpm test` | OK |
| Parser de roadmaps acadêmicos | OK |
| Importação ao vivo com `scripts/sync-notion-roadmaps-live.mjs` | OK |
| Persistência no banco e renderização existente da Home | OK |

## Limitações atuais

Apesar do avanço, ainda existe uma distinção importante entre **sincronização operacional ao vivo** e **sincronização automática dentro do runtime do app publicado**.

> Atualmente, a plataforma já consegue consultar o Notion diretamente durante a operação de sincronização no ambiente de trabalho, mas o app publicado ainda não executa essa consulta sozinho em produção.

Isso acontece porque a leitura da origem está sendo realizada por um script operacional mediado pelo MCP no ambiente de desenvolvimento/automação. Assim, a solução já é muito mais direta do que a abordagem por snapshot manual, mas ainda não é um job autônomo interno ao runtime web.

## Próximos passos recomendados

| Prioridade | Evolução sugerida |
| --- | --- |
| Alta | Criar rotina interna agendada ou acionável por admin para re-sincronização sem depender de execução manual no terminal |
| Alta | Refinar as heurísticas para capturar mais de um tipo de programa acadêmico com menos falsos positivos |
| Média | Adicionar teste explícito de payload público/autenticado cobrindo `academicRoadmaps` |
| Média | Adicionar teste de renderização da Home para os cards acadêmicos sincronizados |
| Média | Criar filtros visuais na Home por instituição, modalidade e status editorial |

## Observação pedagógica

Para a Emily, esta arquitetura é especialmente útil porque separa de forma didática duas camadas de trabalho. A **curadoria pedagógica** continua acontecendo no Notion, onde é confortável registrar programas, ementas e comparações. Já a **publicação estruturada** acontece na plataforma, permitindo transformar essa pesquisa em cards navegáveis, comparáveis e reutilizáveis no portfólio acadêmico e profissional.
