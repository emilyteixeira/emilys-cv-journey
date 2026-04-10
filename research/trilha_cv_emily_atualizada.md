# Trilha Atualizada de Visão Computacional para Emily

## 1. Diagnóstico resumido do perfil

Emily já se encontra em um ponto diferente do perfil iniciante tradicional. A base em **Python**, a familiaridade prática com **OpenCV, PyTorch, CUDA e TensorRT** e o contexto profissional em desenvolvimento e engenharia de Machine Learning indicam que a trilha não deve recomeçar do zero. O ajuste mais adequado é transformar o plano anterior em uma jornada de **Visão Computacional com sustentação mais forte em dados, machine learning clássico, estatística aplicada e engenharia de sistemas**, preservando a profundidade em modelos visuais e ampliando a camada de fundamentação que sustenta decisões arquiteturais.

Com aproximadamente **1 hora por dia**, a estratégia mais saudável continua sendo uma trilha **padrão com inclinação para AI Engineering**, mas agora reorganizada em ciclos que combinam **fundamentos de dados**, **machine learning tradicional**, **deep learning para visão** e **engenharia de ML**. Isso mantém aderência com a skill de mentoria e também incorpora a lógica curricular observada no caminho **Data Scientist: Machine Learning Specialist** da Codecademy, cuja progressão passa por literacia de dados, SQL, Python, EDA, estatística, visualização, machine learning supervisionado e não supervisionado, feature engineering, deep learning e projeto de portfólio [1] [2].

## 2. Princípio pedagógico da atualização

A atualização não substitui sua trilha anterior; ela a **reancora**. Em vez de começar diretamente em classificação avançada, benchmarking, detecção e ViTs, o novo desenho introduz uma camada explícita de **fundamentos de ciência de dados e ML** antes e durante as fases de visão computacional. Essa mudança é pedagogicamente valiosa porque fortalece a leitura de métricas, a análise de variáveis, a experimentação controlada e a capacidade de justificar escolhas técnicas em contextos reais [1] [3] [4].

> A ideia central é simples: sua trilha deixa de ser apenas “aprender modelos de visão” e passa a ser “aprender a construir, avaliar, comparar e operacionalizar sistemas de visão com maturidade de cientista de dados e engenheira de ML”.

## 3. Estrutura geral da nova trilha

A trilha atualizada foi reorganizada em **oito macrofases**, distribuídas em uma progressão de aproximadamente **32 semanas**, mantendo a lógica modular da skill e incorporando a espinha dorsal da ementa da Codecademy como camada de suporte.

| Fase | Semanas | Eixo principal | Integração com a Codecademy | Entregável central |
| --- | --- | --- | --- | --- |
| 1 | 1–4 | Literacia de dados, Python para dados e organização | Data literacy, SQL, Python Fundamentals | Caderno técnico com pipeline simples de dados + checklist de estudo |
| 2 | 5–8 | EDA, visualização, Pandas e estatística aplicada | Pandas, EDA, Statistics, Data Visualization | Notebook analítico com visualizações e interpretação estatística |
| 3 | 9–12 | Machine learning fundamental e feature engineering | ML Fundamentals, Supervised Learning, Feature Engineering | Benchmark entre modelos clássicos com relatório de avaliação |
| 4 | 13–16 | PyTorch, treino reprodutível e CNNs | Deep Learning bridge | Pipeline reprodutível de classificação com análise de erros |
| 5 | 17–20 | Transfer learning, fine-tuning e benchmarking | Portfolio/project mindset | Tabela comparativa entre backbones e estratégias de ajuste fino |
| 6 | 21–24 | Detecção, segmentação e interpretabilidade | Portfolio + advanced practice | Experimento aplicado com visualização, métricas e Grad-CAM |
| 7 | 25–28 | Vision Transformers, comparação arquitetural e visão moderna | Deep learning extension | Benchmark entre CNNs e ViTs com nota técnica de decisão |
| 8 | 29–32 | ML Engineering, system design, portfólio e operação | ML portfolio orientation | Repositório estruturado, blueprint de arquitetura e caso de portfólio |

## 4. Roadmap detalhado por fase

### Fase 1 — Literacia de dados, SQL e Python para dados

Nesta fase, a meta não é reaprender Python do zero, mas consolidar os blocos que fortalecem sua leitura como profissional de dados: qualidade de dados, noções de análise responsável, consultas em SQL, manipulação de tabelas e organização de experimentos. A utilidade disso para visão computacional é direta, porque problemas reais de visão quase sempre começam em **organização de datasets, metadados, rotulagem, splits e auditoria de erros** [1] [4].

O foco prático deve ser construir um pequeno fluxo de trabalho que carregue metadados de um dataset, faça contagens, identifique desequilíbrios e documente critérios de divisão entre treino, validação e teste. O objetivo é iniciar a trilha com clareza metodológica.

### Fase 2 — EDA, visualização e estatística aplicada

A segunda fase incorpora explicitamente os blocos de **exploratory data analysis**, visualização e estatística que aparecem na progressão da Codecademy. Para você, isso deve ser adaptado ao contexto de visão: distribuição de classes, resolução de imagens, variabilidade por origem, análise de inconsistências, métricas descritivas e leitura visual de padrões [1] [5] [6].

O entregável ideal é um notebook que una tabelas e imagens, com gráficos, sumários e uma interpretação escrita sobre qualidade do dado. Esse tipo de trabalho fortalece muito a capacidade de decidir se um problema está no modelo, no dado ou no protocolo experimental.

### Fase 3 — Machine learning clássico e feature engineering

Antes de aprofundar novamente em deep learning, a trilha passa por uma fase explícita de **machine learning fundamental**. A justificativa é didática e estratégica: regressão, classificação, árvores, ensemble methods, clustering e engenharia de atributos ajudam a desenvolver intuição sobre validação, viés, variância, métricas, overfitting e comparação de abordagens [2] [7] [8].

Mesmo em visão computacional, esse repertório é útil porque você passa a enxergar melhor o papel de embeddings, features extraídas, baselines tabulares e análise de experimentos. O projeto desta fase pode usar features simples extraídas de imagens ou um dataset tabular complementar para consolidar essa camada.

### Fase 4 — PyTorch reprodutível, treino e CNNs

Aqui a trilha reencontra com mais força o eixo central de visão computacional. A diferença é que agora você retorna às CNNs com uma base analítica mais sólida. O foco principal é transformar treino em processo reprodutível: configuração, loaders, transforms, checkpoints, curvas de loss, métricas e análise de erros [3] [9] [10].

O critério de sucesso não é apenas treinar uma CNN, mas **explicar o pipeline**, justificar as escolhas e localizar falhas de forma sistemática. Esta fase deve gerar um pipeline de classificação reaproveitável no restante da jornada.

### Fase 5 — Transfer learning e benchmarking controlado

A quinta fase retoma uma das partes mais importantes do plano anterior. Aqui você compara diferentes estratégias de fine-tuning, congelamento de camadas, uso de pesos pré-treinados e impacto de data augmentation. A contribuição da trilha atualizada é que esse benchmarking deve ser feito com maior disciplina experimental, inspirada na formação mais ampla de data scientist [3] [11] [12].

O entregável é uma comparação curta, mas tecnicamente clara, mostrando desempenho, tempo, custo e observações qualitativas. Esse material já se torna um bom insumo para portfólio.

### Fase 6 — Detecção, segmentação e interpretabilidade

Nesta etapa, o plano volta ao coração mais avançado da visão computacional. O estudo deve cobrir bounding boxes, IoU, mAP, formatos de anotação, losses para segmentação, inspeção de máscaras e ferramentas de interpretabilidade como Grad-CAM. A orientação continua sendo aplicada: menos volume de teoria abstrata e mais leitura crítica de comportamento do modelo [10] [13] [14].

O valor dessa fase é mostrar que você consegue migrar de classificação para tarefas visuais mais ricas sem perder o rigor analítico construído nas fases anteriores.

### Fase 7 — Vision Transformers e comparação arquitetural

Agora a trilha aprofunda visão moderna e comparação entre famílias de modelos. Vision Transformers entram não como modismo, mas como objeto de decisão de arquitetura. Você deve comparar CNNs e ViTs considerando custo computacional, volume de dados, estabilidade, memória, desempenho e adequação ao problema [12] [15].

A produção principal aqui deve ser uma nota técnica curta defendendo quando uma solução faz mais sentido do que a outra em contexto real.

### Fase 8 — ML Engineering, system design e portfólio

A fase final converte conhecimento técnico em capacidade de desenhar um sistema robusto. O foco passa para organização do repositório, documentação, tracking de experimentos, inferência, observabilidade, API, MLOps introdutório e blueprint de arquitetura para produção [3] [16] [17].

Essa etapa fecha o ciclo entre estudo, prática e posicionamento profissional. O ideal é concluir com um caso de portfólio em que você mostre problema, solução, trade-offs, métricas, limitações e próximos passos.

## 5. Planner mensal inicial sugerido

Para manter o ritmo sustentável, os quatro primeiros meses podem ser organizados desta forma.

| Mês | Tema do mês | Objetivo do ciclo | Entregável | Risco principal | Recuperação |
| --- | --- | --- | --- | --- | --- |
| Mês 1 | Dados, SQL e Python para dados | Consolidar organização analítica do estudo e dos datasets | Notebook de inspeção e checklist de qualidade de dados | Ficar só na teoria | Reduzir leituras e produzir uma análise prática de um dataset real |
| Mês 2 | EDA, estatística e visualização | Aprender a ler melhor dados, distribuições e sinais de erro | Relatório curto com gráficos e interpretações | Acumular gráficos sem interpretação | Escrever sempre um parágrafo de conclusão por análise |
| Mês 3 | ML fundamental e feature engineering | Criar repertório de comparação entre modelos clássicos | Benchmark com regressão, árvores ou ensemble | Querer correr para deep learning cedo demais | Limitar escopo a poucos modelos bem analisados |
| Mês 4 | PyTorch, treino e CNNs | Consolidar pipeline reprodutível de classificação | Projeto com train/eval/config + análise de erros | Travar na organização do código | Começar por um pipeline mínimo e evoluir gradualmente |

## 6. Planner semanal inicial

A semana padrão deve continuar leve, mas com maior intenção pedagógica. Como você já trabalha e estuda, a distribuição mais sustentável continua sendo de **5 a 7 blocos curtos**, com um dia de revisão e recuperação.

| Dia | Bloco sugerido | Duração | Função didática |
| --- | --- | --- | --- |
| Domingo | Leitura guiada + anotações | 1h | Construir repertório conceitual |
| Segunda | Exercício curto ou notebook | 1h | Transformar conceito em prática |
| Terça | Tutorial oficial reproduzido parcialmente | 1h | Aprender padrão correto |
| Quarta | Experimento próprio | 1h | Desenvolver autonomia |
| Quinta | Avaliação e análise de erros | 1h | Aprender a interpretar resultados |
| Sexta | Documentação ou benchmark curto | 1h | Consolidar pensamento de engenharia |
| Sábado | Revisão leve, descanso ou recuperação | 30–60 min | Preservar continuidade sem sobrecarga |

## 7. Exemplo de sessão diária

| Campo | Exemplo preenchido |
| --- | --- |
| Objetivo do dia | Verificar se o desequilíbrio entre classes está afetando a validação |
| Bloco principal | EDA aplicada ao dataset |
| Duração prevista | 1h |
| Atividade concreta | Gerar gráfico de distribuição de classes e revisar 20 exemplos por classe |
| Dúvida aberta | O desequilíbrio é real ou foi criado pelo split? |
| Resultado produzido | Notebook com gráfico e observações |
| Energia percebida | Média |
| Pequena vitória do dia | Identifiquei duas classes com rótulo inconsistente |
| Próxima ação mínima | Revisar os critérios de split antes de treinar novamente |

## 8. Materiais recomendados para a fase atual

Como você já está em nível intermediário, a curadoria deve ser mais enxuta e orientada por aplicação.

| Papel | Recurso | Por que agora | Mini entregável |
| --- | --- | --- | --- |
| Fonte principal | [PyTorch Tutorials](https://pytorch.org/tutorials/) | Mantém proximidade com seu contexto atual e serve de base para treino reprodutível [3] | Reescrever um pipeline curto com train/eval separados |
| Apoio visual | [freeCodeCamp – PyTorch for Deep Learning & Machine Learning](https://www.youtube.com/watch?v=V_xro1bcAuA) | Bom para revisar a mecânica do treino sem atrito excessivo [3] | Replicar um trecho e comentar o que mudou no seu entendimento |
| Leitura complementar | [Introduction to Statistical Learning](https://www.statlearning.com/) | Reforça avaliação, validação e raciocínio comparativo entre modelos [8] | Resumir três critérios de avaliação que você quer levar para seus experimentos |
| Exercício prático | Dataset audit + benchmark baseline | Conecta data literacy, EDA e visão aplicada | Criar um benchmark simples com baseline + análise de qualidade do dado |

## 9. Projeto prático atualizado

O projeto mais forte continua sendo um **repositório autoral de visão computacional orientado por arquitetura**, mas agora com uma estrutura em camadas mais clara.

| Etapa do projeto | O que construir |
| --- | --- |
| Camada 1 | Auditoria de dataset, metadados e critérios de split |
| Camada 2 | Baseline de ML ou análise de features para fortalecer comparação |
| Camada 3 | Pipeline de classificação em PyTorch com análise de erros |
| Camada 4 | Benchmark entre treino do zero e fine-tuning |
| Camada 5 | Extensão para detecção ou segmentação |
| Camada 6 | Aplicação de interpretabilidade |
| Camada 7 | Comparação entre CNN e ViT |
| Camada 8 | Organização do sistema com README técnico e blueprint arquitetural |

## 10. O que deve entrar no Notion a partir desta atualização

A base já existente no Notion comporta muito bem esta nova versão da trilha. A atualização deve priorizar quatro grupos de registros: **módulos do roadmap**, **planners**, **recursos selecionados** e **artefatos/evidências**.

| Tipo de entrada | Exemplos a criar ou atualizar | Campos críticos |
| --- | --- | --- |
| Módulo | Fase 1 a Fase 8 da trilha atualizada | Título, Categoria, Fase, Tema, Resumo, Próximo passo |
| Planner Mensal | Mês 1 a Mês 4 inicialmente | Janela, Carga estimada, Obstáculo principal, Plano de recuperação |
| Planner Semanal | Semana atual e próxima semana | Janela, Resumo, Próximo passo, Evidência |
| Recurso | PyTorch Tutorials, ISL, CS231n, D2L, Hugging Face ViT | Tipo de material, userDefined:URL, Resumo |
| Projeto | Repositório autoral e benchmarks | Evidência, Status, Próximo passo |
| Checkpoint/Revisão | Revisão mensal e decisão de avançar ou revisar | Confiança, Obstáculo principal, Plano de recuperação |

## 11. Próximo passo recomendado

O próximo movimento mais produtivo é iniciar formalmente a **Fase 1 revisada**, mas sem ficar tempo demais em conteúdo introdutório. Em termos práticos, isso significa escolher um dataset real do seu contexto de estudo ou trabalho, montar um pequeno documento de auditoria de dados, registrar o ciclo atual no Notion e já planejar a transição para EDA e estatística aplicada.

> Se você quiser aplicar isso de modo didático e acessível, pense sempre em cada semana como uma pergunta concreta: “o que preciso entender melhor no meu dado, no meu modelo ou na minha decisão técnica?”. Essa pergunta deve guiar a prática e o registro das evidências.

## References

[1]: https://www.codecademy.com/learn/paths/data-science "Codecademy — Data Scientist: Machine Learning Specialist"
[2]: https://www.skillsoft.com/journey/data-scientist-machine-learning-ec124151-3477-44a5-b819-914e25079c6f "Skillsoft mirror — Data Scientist: Machine Learning Specialist"
[3]: https://pytorch.org/tutorials/ "PyTorch Tutorials"
[4]: https://docs.python.org/3/tutorial/ "Python Tutorial"
[5]: https://pandas.pydata.org/docs/user_guide/index.html "Pandas User Guide"
[6]: https://matplotlib.org/stable/tutorials/index.html "Matplotlib Tutorials"
[7]: https://scikit-learn.org/stable/user_guide.html "scikit-learn User Guide"
[8]: https://www.statlearning.com/ "Introduction to Statistical Learning"
[9]: https://cs231n.stanford.edu/ "CS231n"
[10]: https://d2l.ai/chapter_computer-vision/index.html "Dive into Deep Learning — Computer Vision"
[11]: https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html "PyTorch Transfer Learning Tutorial"
[12]: https://huggingface.co/docs/transformers/model_doc/vit "Hugging Face ViT Documentation"
[13]: https://docs.pytorch.org/vision/stable/models.html#object-detection-instance-segmentation-and-person-keypoint-detection "Torchvision Detection and Segmentation Models"
[14]: https://arxiv.org/abs/1610.02391 "Grad-CAM"
[15]: https://arxiv.org/abs/2010.11929 "An Image is Worth 16x16 Words"
[16]: https://fullstackdeeplearning.com/ "Full Stack Deep Learning"
[17]: https://arxiv.org/abs/2205.02302 "MLOps: Overview, Definition, and Architecture"
