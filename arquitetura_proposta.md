# Proposta de arquitetura para a plataforma pessoal de estudo da Emily

A evolução mais adequada para este projeto é tratá-lo não apenas como um site de apresentação, mas como um **sistema editorial pessoal de aprendizado em Visão Computacional**. Isso significa que a página atual deixa de ser somente uma vitrine da trilha e passa a funcionar como um ambiente com dupla natureza: por um lado, ela comunica sua jornada para outras pessoas; por outro, ela organiza seu próprio processo de estudo, reflexão e produção técnica.

A melhor decisão arquitetural, neste momento, é construir o produto em torno de **quatro domínios centrais de conteúdo** — diário, metas, recomendações e portfólio — mantendo a trilha atual como a camada-mãe de contexto. Em vez de criar seções isoladas, o ideal é que as quatro áreas conversem entre si. Assim, uma meta semanal pode gerar uma entrada de diário; uma entrada de diário pode originar uma recomendação autoral; e uma sequência de aprendizados pode amadurecer até virar item de portfólio.

## Princípio estrutural do produto

A arquitetura mais forte para o seu caso é um modelo de **hub narrativo + workspace pessoal**. O site deve combinar leitura pública, acompanhamento de progresso e curadoria autoral em uma única experiência. A página inicial continua sendo o ponto de entrada editorial, mas ela passa a encaminhar o visitante — e você mesma — para módulos mais específicos.

| Camada | Função principal | Público dominante | Papel no sistema |
|---|---|---|---|
| Trilha | Apresentar a jornada macro de 24 semanas | Público externo e você | Dar contexto, direção e posicionamento técnico |
| Diário / Blog | Registrar o que está sendo aprendido agora | Você e leitores recorrentes | Tornar visível o processo de aprendizagem |
| Metas | Organizar execução diária e semanal | Principalmente você | Converter plano em rotina prática |
| Recomendações | Compartilhar sua curadoria e suas dicas | Público externo | Consolidar sua voz autoral |
| Portfólio | Exibir projetos, benchmarks e artefatos | Recrutadores, pares e você | Provar capacidade aplicada |

## Arquitetura de informação recomendada

A navegação ideal deve ser simples, mas sem parecer genérica. Em vez de um site com páginas soltas, a estrutura deve sugerir uma progressão intelectual. O visitante precisa entender rapidamente onde está o plano, onde estão os registros atuais e onde estão suas evidências práticas.

A estrutura recomendada é a seguinte.

| Rota / seção | Objetivo | Conteúdo principal | Relação com as demais |
|---|---|---|---|
| `/` | Página-manifesto | Hero, resumo da trilha, status atual, destaques recentes | Direciona para todas as áreas |
| `/trilha` | Roadmap completo | Fases, semanas, entregáveis, marcos | É a espinha dorsal do sistema |
| `/diario` | Diário/blog de aprendizado | Entradas por data, tema, fase da trilha, lições aprendidas | Alimenta recomendações e portfólio |
| `/metas` | Painel operacional | Metas diárias, semanais, status, prioridades | Sustenta consistência do estudo |
| `/recomendacoes` | Curadoria autoral | Recursos, dicas práticas, observações pessoais | Nasce da experiência do diário |
| `/portfolio` | Vitrine aplicada | Projetos, estudos de caso, benchmarks, demos | Mostra o resultado do percurso |
| `/sobre` | Posicionamento pessoal | Bio curta, foco atual, contexto profissional | Reforça autoria e coerência |

## Papel de cada uma das quatro seções

### 1. Diário / blog de aprendizado

Essa deve ser a seção mais viva do projeto. Em vez de um blog genérico, recomendo um **diário técnico orientado por contexto**. Cada entrada não precisa ser longa; ela precisa ser útil. O ideal é que cada post responda a perguntas como: o que foi estudado, qual hipótese foi testada, que decisão técnica foi tomada, o que falhou, o que mudou na sua compreensão e qual próximo passo foi aberto.

A unidade de conteúdo mais adequada é um **entry card** com metadados claros. Cada entrada deve ter título, data, fase da trilha, tema técnico, tempo investido, aprendizados-chave e ligação opcional com um recurso ou experimento. Isso cria continuidade intelectual e evita que o diário vire apenas um registro solto.

| Campo sugerido | Finalidade |
|---|---|
| Título | Identificar a entrada com clareza |
| Data | Organizar cronologicamente |
| Fase da trilha | Conectar o aprendizado ao roadmap principal |
| Tema | Ex.: classificação, detecção, ViT, Grad-CAM |
| Tempo investido | Dar noção realista de esforço |
| Aprendizado principal | Sintetizar ganho concreto |
| Dificuldade encontrada | Registrar gargalos úteis |
| Próximo passo | Abrir continuidade para o estudo seguinte |

### 2. Metas diárias e semanais

Essa seção precisa funcionar mais como um **painel de execução** do que como um simples checklist. A ideia é traduzir a trilha longa em objetivos menores e visíveis. Como você dispõe de aproximadamente uma hora por dia, a arquitetura deve favorecer sessões curtas, com início e fim claros.

A recomendação é trabalhar com três níveis de meta: **meta do dia**, **meta da semana** e **foco do ciclo atual**. A meta diária deve ser pequena e verificável; a semanal deve refletir um entregável; e o foco do ciclo deve mostrar em que parte da jornada você está. Isso evita o sentimento de dispersão e ainda cria uma narrativa pública do seu progresso.

| Nível | Escala | Exemplo |
|---|---|---|
| Meta diária | 20 a 60 minutos | Revisar matrizes de confusão e documentar dois erros relevantes |
| Meta semanal | 5 a 7 dias | Fechar benchmark entre fine-tuning e treino do zero |
| Foco do ciclo | 2 a 4 semanas | Consolidar pipeline reprodutível de classificação |

### 3. Recomendações e dicas autorais

Essa seção deve diferenciar o seu site de um simples roadmap pessoal. O objetivo aqui não é repetir listas de recursos da internet, mas construir uma **camada autoral de curadoria**. Em outras palavras, você compartilha não só o que estudou, mas **como recomenda estudar**, quando um material vale a pena, em que contexto uma biblioteca ajuda e quais erros conceituais ou de implementação aparecem com frequência.

Essa área pode ser organizada por tipo de recomendação. Algumas serão recursos externos; outras, decisões práticas suas; outras ainda, atalhos mentais para aprender melhor ou para trabalhar com mais critério. O valor dessa seção está na interpretação pessoal, não no volume.

| Tipo de recomendação | Conteúdo esperado |
|---|---|
| Recurso técnico | Livro, documentação, curso, paper, tutorial |
| Dica prática | Estratégia de estudo, benchmark, debug, organização |
| Opinião autoral | Quando usar uma técnica, quando evitar, o que observar |
| Curadoria de trabalho | Ferramentas e referências que realmente ajudaram no ambiente profissional |

### 4. Portfólio

O portfólio deve ser o lugar onde aprendizado e evidência se encontram. Em vez de listar somente projetos “acabados”, recomendo uma arquitetura de **casos aplicados**. Isso significa que cada item do portfólio deve mostrar problema, contexto, abordagem, métrica, trade-offs e lições. Mesmo quando um projeto for pequeno, ele pode ser muito forte se estiver bem explicado.

Esse formato é especialmente adequado ao seu objetivo de aprofundar arquitetura, design e engenharia de ML. Ele permite que você demonstre não apenas implementação, mas julgamento técnico. Projetos de benchmark, estudos comparativos, testes com detecção ou segmentação e diagramas de pipeline entram muito bem aqui.

| Campo do item de portfólio | Função |
|---|---|
| Título do projeto | Identificação objetiva |
| Problema / contexto | Mostrar a motivação real |
| Stack usada | Indicar ferramentas e arquitetura |
| Decisão técnica central | Explicar o raciocínio principal |
| Métricas / resultados | Tornar o trabalho verificável |
| Limitações | Demonstrar maturidade crítica |
| Próximos passos | Mostrar continuidade e visão |

## Relação entre as seções

O diferencial dessa arquitetura está nas conexões. O site fica muito mais forte se o conteúdo circular internamente. Uma entrada no diário deve poder apontar para a meta daquela semana. Uma recomendação deve poder surgir a partir de um aprendizado consolidado. Um item de portfólio deve referenciar entradas do diário que documentaram a evolução do projeto. Assim, o site deixa de ser estático e passa a expressar uma trajetória consistente.

Abaixo está o fluxo conceitual recomendado.

| Origem | Gera | Resultado arquitetural |
|---|---|---|
| Trilha | Metas | O plano vira execução concreta |
| Metas | Diário | A execução vira reflexão documentada |
| Diário | Recomendações | A reflexão vira curadoria autoral |
| Diário + metas + projetos | Portfólio | O processo vira evidência pública |

## Modelo técnico recomendado por fases

Do ponto de vista de engenharia, a melhor estratégia é evoluir em duas etapas claras, sem pular complexidade cedo demais.

### Fase A — consolidação estática bem estruturada

No curto prazo, a arquitetura mais adequada é manter o projeto como **frontend estático bem modelado**, com conteúdo organizado em estruturas de dados e persistência local no navegador apenas para progresso e metas temporárias. Essa abordagem é suficiente para validar UX, taxonomia e fluxo editorial sem aumentar complexidade desnecessária.

Nessa fase, o ideal é que diário, recomendações e portfólio sejam abastecidos por arquivos estruturados no código, enquanto metas e progresso usem persistência local. É o melhor caminho para amadurecer a interface e o modelo de conteúdo.

### Fase B — evolução para plataforma com persistência real

Quando você quiser publicar entradas com mais frequência, editar conteúdo sem tocar no código e manter histórico mais robusto, aí sim fará sentido migrar para uma arquitetura com persistência real. Nesse momento, a evolução natural do projeto é adicionar backend, autenticação e banco para transformar o site em uma plataforma editorial pessoal.

Essa segunda fase permitirá criar entradas do diário, metas, recomendações e itens de portfólio a partir de formulários internos, com possibilidade futura de rascunhos, tags, filtros, séries de conteúdo e painéis de edição.

| Fase | Stack mais adequada | Benefício principal |
|---|---|---|
| A. Estrutura estática inteligente | Frontend atual + dados em arquivo + armazenamento local para progresso | Rapidez, baixo atrito, validação da experiência |
| B. Plataforma persistente | Frontend + backend + banco + autenticação | Edição real, escalabilidade editorial e histórico confiável |

## Componentização recomendada

Para o projeto ficar sustentável, a interface não deve crescer por páginas independentes e repetitivas. O ideal é separar o sistema em blocos reutilizáveis. Isso reduz retrabalho e mantém consistência visual.

| Componente | Uso previsto |
|---|---|
| `SectionHero` | Hero e aberturas de seção |
| `TimelineRail` | Linha narrativa da trilha e do diário |
| `ProgressPanel` | Metas, barras, status e indicadores |
| `EntryCard` | Entradas do diário |
| `RecommendationCard` | Dicas e curadorias |
| `CaseStudyCard` | Projetos do portfólio |
| `SectionHeader` | Cabeçalhos consistentes entre áreas |
| `TagCluster` | Tags de tema, stack, fase e dificuldade |

## Navegação recomendada

A navegação ideal deve refletir a dualidade entre **jornada** e **produção**. Por isso, recomendo que o menu principal tenha no máximo seis pontos: Trilha, Diário, Metas, Recomendações, Portfólio e Sobre. Na página inicial, o bloco de destaque superior deve mostrar seu foco atual, a meta da semana e o último aprendizado publicado. Esse detalhe ajuda o site a parecer vivo desde a primeira dobra.

Também é recomendável que cada seção tenha um pequeno bloco lateral ou superior chamado **“estado atual”**, mostrando em que fase da trilha você está, quantas metas foram concluídas na semana e qual foi a última publicação. Isso costura toda a experiência.

## Recomendação final de arquitetura

A proposta mais adequada para você é transformar o projeto em uma **plataforma pessoal de aprendizagem aplicada**, com a trilha como estrutura central e as quatro novas áreas como extensões naturais do seu processo real. Em termos de prioridade, eu recomendo a seguinte ordem de implementação: primeiro **metas + diário**, porque essas seções ativam uso contínuo; depois **recomendações**, porque consolidam sua voz autoral; e, por fim, **portfólio**, porque ele ficará ainda mais forte quando puder reaproveitar material já produzido nas outras áreas.

Essa ordem é a mais eficiente porque respeita seu ritmo de estudo, reduz esforço editorial e cria um ciclo virtuoso entre aprender, registrar, refletir e demonstrar.

## Próxima implementação recomendada

Se você quiser seguir de forma prática, a próxima iteração do site deveria incluir uma nova navegação com múltiplas rotas, uma página de diário com entradas estruturadas, uma página de metas com painel semanal e persistência local, além de um modelo unificado de dados para que recomendações e portfólio sejam adicionados depois sem retrabalho.
