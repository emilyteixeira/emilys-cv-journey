# Sincronização de roadmaps acadêmicos do Notion

Este documento registra a primeira integração entre o workspace do **Notion** e a plataforma/blog de estudos em Visão Computacional. O objetivo desta etapa foi criar uma base persistida para roadmaps de pós-graduação, disponibilizar esses dados na interface pública da Home e estabelecer um fluxo operacional simples para importar snapshots já mapeados no workspace.

## Objetivo da integração

A integração foi desenhada para transformar páginas do Notion sobre **pós-graduação, especialização e formações acadêmicas em Visão Computacional** em dados estruturados consumíveis pelo site. Em vez de deixar esses roadmaps apenas como páginas isoladas no workspace, a plataforma agora consegue:

| Camada | Responsabilidade | Situação atual |
| --- | --- | --- |
| Banco de dados | Persistir roadmaps acadêmicos sincronizados | Implementado |
| Backend tRPC | Expor os roadmaps para área pública e área autenticada | Implementado |
| Interface Home | Renderizar os cards importados na seção de recomendações | Implementado |
| Importação operacional | Inserir snapshots mapeados do Notion no banco | Implementado |
| Sincronização automática/live | Ler Notion dinamicamente sem snapshot manual | Pendente |

## Origem atualmente mapeada

Até o momento, a importação inicial foi estruturada a partir de um roadmap acadêmico identificado no Notion da Emily.

| Campo | Valor |
| --- | --- |
| Tipo | Especialização |
| Instituição | PUC-Rio |
| Página do Notion | `3411c6633ba9808db32dfd36f81a0289` |
| Título | `[Especialização] Visão Computacional: Interpretando o Mundo Através de Imagens - Computer Vision Master` |
| URL de origem | `https://www.notion.so/3411c6633ba9808db32dfd36f81a0289` |

## Modelagem persistida

Foi criada a tabela `academicRoadmaps` em `drizzle/schema.ts` para armazenar os roadmaps acadêmicos sincronizados. A coleção foi pensada para suportar tanto a importação inicial por snapshot quanto uma futura sincronização mais robusta com o Notion.

| Campo persistido | Finalidade |
| --- | --- |
| `notionPageId` | Identificador estável da página no Notion |
| `slug` | Identificador amigável para interface e rotas futuras |
| `title` | Nome principal do roadmap/programa |
| `institution` | Instituição ofertante |
| `programType` | Tipo do programa, como especialização ou pós-graduação |
| `formatLabel` | Modalidade do curso |
| `durationText` | Duração informada |
| `workloadText` | Carga horária informada |
| `summary` | Resumo editorial do roadmap |
| `curriculumText` | Ementa/conteúdo programático consolidado |
| `audienceText` | Público-alvo |
| `sourceUrl` | Link da página original no Notion |
| `tagsJson` | Tags estruturadas para filtros e organização |
| `status` | Estado editorial (`draft` ou `published`) |
| `sortOrder` | Ordem de exibição na interface |

## Camadas atualizadas no código

A integração foi distribuída em quatro pontos principais da aplicação.

| Arquivo | Papel na integração |
| --- | --- |
| `drizzle/schema.ts` | Define a tabela `academicRoadmaps` |
| `server/db.ts` | Faz leitura pública/privada e upsert idempotente por `notionPageId` |
| `server/routers.ts` | Expõe a mutação protegida `syncAcademicRoadmaps` |
| `client/src/pages/Home.tsx` | Renderiza os roadmaps importados na Home |
| `scripts/sync-notion-roadmaps.mjs` | Importa snapshots mapeados para o banco |

## Fluxo operacional atual

A sincronização implementada nesta etapa é **operacional/manual**, porém já persistida e reutilizável. O fluxo é o seguinte:

1. Mapear a página relevante no Notion.
2. Consolidar os campos editoriais que a plataforma precisa exibir.
3. Registrar o snapshot no script `scripts/sync-notion-roadmaps.mjs`.
4. Executar o comando de importação.
5. O script localiza a usuária proprietária pelo `OWNER_OPEN_ID`.
6. O backend faz `upsert` por `notionPageId`, evitando duplicação do mesmo roadmap.
7. A Home passa a exibir o roadmap sincronizado na coleção pública.

### Comando de execução

```bash
cd /home/ubuntu/cv-emily-roadmap
pnpm exec tsx scripts/sync-notion-roadmaps.mjs
```

## Estratégia de integridade

A consistência atual da importação foi tratada com três decisões principais.

| Medida | Justificativa |
| --- | --- |
| `upsert` por `notionPageId` | Evita duplicar uma mesma página quando o script é executado novamente |
| `sortOrder` persistido | Permite destacar formações prioritárias na Home |
| `tagsJson` estruturado | Prepara futuros filtros por tipo de formação, modalidade e tema |

## Validação realizada

A integração foi validada em três níveis.

| Tipo de validação | Resultado |
| --- | --- |
| Migração do banco com `pnpm db:push` | OK |
| Testes de backend com `pnpm test` | OK |
| Importação inicial com `scripts/sync-notion-roadmaps.mjs` | OK |

Além disso, a Home foi ajustada para exibir os roadmaps acadêmicos sincronizados sem interromper a experiência de navegação com cinco seções e rolagem contínua.

## Limitações atuais

A etapa concluída ainda **não representa uma sincronização automática/live** com o Notion. O estado atual é de importação estruturada a partir de snapshots mapeados manualmente.

> Em termos práticos, a plataforma já consegue **persistir e publicar** roadmaps do Notion, mas ainda depende de um passo operacional para transformar novas páginas em payload estruturado.

## Próximos passos recomendados

| Prioridade | Evolução sugerida |
| --- | --- |
| Alta | Ler o conteúdo do Notion dinamicamente no backend via integração autenticada |
| Alta | Generalizar o parser para múltiplos roadmaps acadêmicos sem hardcode no script |
| Média | Criar seção ou filtro dedicado a pós-graduação na Home |
| Média | Acrescentar testes cobrindo explicitamente `academicRoadmaps` no payload da interface |
| Média | Permitir re-sincronização seletiva por página do Notion |

## Observação pedagógica

Para a Emily, esta abordagem é útil porque separa duas camadas de trabalho: a camada de **curadoria pedagógica** continua confortável no Notion, enquanto a camada de **publicação estruturada** passa a acontecer no site. Isso facilita comparar programas, transformar pesquisa acadêmica em conteúdo público e manter um histórico reutilizável dentro da própria plataforma.
