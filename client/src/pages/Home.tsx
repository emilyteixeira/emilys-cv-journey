/*
Design reminder — Modernismo diagramático:
- Navegação em trilha, leitura editorial e sensação de blueprint técnico.
- Evitar centralização excessiva; priorizar assimetria, painéis translúcidos e hierarquia forte.
- Misturar linguagem de roadmap, dashboard e caderno técnico.
*/
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Binary,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Circle,
  Cpu,
  Eye,
  Layers3,
  NotebookPen,
  Radar,
  Route,
  Settings2,
  Sparkles,
  Target,
} from "lucide-react";

const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663197740678/NefRHgYDEVvMbKUKEHjzb7/cv-hero-blueprint-mB4zCJSGVQGfeCaT9SaXFd.webp";
const ROADMAP_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663197740678/NefRHgYDEVvMbKUKEHjzb7/cv-roadmap-nodes-VkeJNXV95vo2AdoDBSi9cq.webp";
const ARCHITECTURE_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663197740678/NefRHgYDEVvMbKUKEHjzb7/cv-architecture-panel-YhdggE94wDcZH2f5bDCTa4.webp";
const CHECKPOINT_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663197740678/NefRHgYDEVvMbKUKEHjzb7/cv-checkpoint-texture-Qe2ET6fsXeYuGyWMK4jxbW.webp";
const STORAGE_KEY = "cv-emily-roadmap-progress";

const phases = [
  {
    id: 1,
    weeks: "1–4",
    title: "Pipelines robustos e análise de erros",
    focus:
      "Consolidar treino, validação, métricas e leitura crítica de resultados em classificação.",
    deliverable: "Pipeline reprodutível com matriz de confusão, falsos positivos e falsos negativos.",
    icon: Target,
  },
  {
    id: 2,
    weeks: "5–8",
    title: "Transfer learning e benchmarking",
    focus:
      "Comparar fine-tuning, congelamento de camadas e trade-offs entre custo e desempenho.",
    deliverable: "Relatório comparativo entre modelos treinados do zero e modelos pré-treinados.",
    icon: Layers3,
  },
  {
    id: 3,
    weeks: "9–12",
    title: "Detecção de objetos aplicada",
    focus:
      "Dominar bounding boxes, IoU, mAP, visualização de inferência e adaptação de datasets.",
    deliverable: "Detector ajustado a um conjunto pequeno com análise de erros de localização.",
    icon: Eye,
  },
  {
    id: 4,
    weeks: "13–16",
    title: "Segmentação e interpretabilidade",
    focus:
      "Aprofundar visão espacial e usar Grad-CAM como ferramenta de inspeção crítica.",
    deliverable: "Experimento com máscaras, comparação qualitativa e auditoria visual do modelo.",
    icon: Radar,
  },
  {
    id: 5,
    weeks: "17–20",
    title: "Vision Transformers com comparação arquitetural",
    focus:
      "Comparar CNNs e ViTs em custo, memória, desempenho e adequação ao problema.",
    deliverable: "Benchmark técnico orientado à tomada de decisão no trabalho.",
    icon: BrainCircuit,
  },
  {
    id: 6,
    weeks: "21–24",
    title: "Engenharia de ML e system design",
    focus:
      "Converter experimentos em sistema: configs, reprodutibilidade, inferência e monitoramento.",
    deliverable: "Repositório estruturado com blueprint de arquitetura para produção.",
    icon: Settings2,
  },
] as const;

const firstWeeks = [
  {
    span: "Semanas 1–2",
    goal:
      "Revisar o pipeline ponta a ponta com foco em splits, transforms, métricas e análise de erros.",
    output:
      "Notebook comentado com matriz de confusão e exemplos de erros relevantes.",
  },
  {
    span: "Semanas 3–4",
    goal:
      "Separar treino, avaliação e configuração em uma estrutura mínima reutilizável.",
    output:
      "Projeto com configs, scripts e README técnico curto.",
  },
  {
    span: "Semanas 5–6",
    goal:
      "Comparar backbone treinado do zero com fine-tuning em dataset simples ou anonimizado.",
    output:
      "Tabela com métricas, tempo, memória e observações qualitativas.",
  },
  {
    span: "Semanas 7–8",
    goal:
      "Formalizar critério de decisão arquitetural para classificação em contexto profissional.",
    output:
      "Nota técnica com recomendação e justificativa orientada a trade-offs.",
  },
] as const;

const weeklyRhythm = [
  "Leitura técnica guiada com anotações focadas em decisões de arquitetura.",
  "Implementação curta ou refatoração de parte do pipeline.",
  "Reprodução controlada de tutorial oficial ou experimento de referência.",
  "Teste próprio com hipótese explícita e comparação objetiva.",
  "Avaliação, debugging e análise de erros com exemplos reais.",
  "Documentação, benchmark ou nota técnica curta.",
  "Revisão leve, fechamento da semana e planejamento da próxima.",
] as const;

const resources = [
  {
    title: "CS231n + D2L",
    category: "Classificação e CNNs",
    reason:
      "Fortalece fundamentos conceituais sem perder conexão com implementação prática.",
  },
  {
    title: "PyTorch Tutorials + Torchvision",
    category: "Treino, fine-tuning e modelos prontos",
    reason:
      "Funciona como referência oficial para padrões corretos de pipeline e experimentação.",
  },
  {
    title: "Ultralytics + docs de detecção/segmentação",
    category: "Prototipagem aplicada",
    reason:
      "Ajuda a acelerar validações no trabalho enquanto você aprofunda métricas e análise crítica.",
  },
  {
    title: "Grad-CAM + Full Stack Deep Learning",
    category: "Interpretabilidade e engenharia",
    reason:
      "Une inspeção do comportamento do modelo com visão de produto e produção.",
  },
  {
    title: "Hugging Face ViT + Designing ML Systems",
    category: "Modelos modernos e arquitetura",
    reason:
      "Amplia repertório para justificar tecnicamente escolhas entre famílias de modelos.",
  },
] as const;

const reviews = [
  "Mês 1 — consigo treinar, validar e explicar meus resultados?",
  "Mês 2 — sei comparar estratégias sem misturar variáveis demais?",
  "Mês 3 — entendo claramente métricas e erros de detecção?",
  "Mês 4 — consigo interpretar máscaras e mapas de ativação?",
  "Mês 5 — sei defender quando usar CNN e quando usar ViT?",
  "Mês 6 — sou capaz de desenhar um pipeline de produção com trade-offs claros?",
] as const;

const metrics = [
  { label: "Duração", value: "24 semanas" },
  { label: "Ritmo", value: "1 hora por dia" },
  { label: "Foco", value: "Arquitetura + engenharia" },
] as const;

export default function Home() {
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { completedWeeks?: number[]; notes?: string };
      setCompletedWeeks(parsed.completedWeeks ?? []);
      setNotes(parsed.notes ?? "");
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completedWeeks, notes }),
    );
  }, [completedWeeks, notes]);

  const completionRate = useMemo(() => {
    return Math.round((completedWeeks.length / 24) * 100);
  }, [completedWeeks]);

  const nextWeek = useMemo(() => {
    for (let week = 1; week <= 24; week += 1) {
      if (!completedWeeks.includes(week)) return week;
    }
    return null;
  }, [completedWeeks]);

  const toggleWeek = (week: number) => {
    setCompletedWeeks((current) =>
      current.includes(week)
        ? current.filter((value) => value !== week)
        : [...current, week].sort((a, b) => a - b),
    );
  };

  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      <div className="diagram-noise pointer-events-none fixed inset-0 opacity-40" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:var(--background-soft)]/85 backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--card-strong)] shadow-[0_0_40px_rgba(198,239,224,0.08)]">
              <Binary className="h-5 w-5 text-[color:var(--accent-2)]" />
            </div>
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-muted-foreground">
                Emily roadmap
              </p>
              <h1 className="font-display text-lg text-foreground">Trilha de Visão Computacional</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
            <a href="#trilha" className="transition-colors hover:text-foreground">Trilha</a>
            <a href="#ritmo" className="transition-colors hover:text-foreground">Ritmo</a>
            <a href="#progresso" className="transition-colors hover:text-foreground">Progresso</a>
            <a href="#arquitetura" className="transition-colors hover:text-foreground">Arquitetura</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            <img
              src={HERO_IMAGE}
              alt="Mapa visual da jornada de estudos em visão computacional"
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(10,22,35,0.35),transparent_45%),linear-gradient(90deg,rgba(7,14,24,0.95)_0%,rgba(7,14,24,0.82)_46%,rgba(7,14,24,0.55)_100%)]" />
          </div>

          <div className="container relative grid min-h-[86vh] items-end gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[color:var(--line)] bg-[rgba(236,240,245,0.06)] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Sparkles className="h-4 w-4 text-[color:var(--accent-1)]" />
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-[color:var(--accent-3)]">
                  Modernismo diagramático para estudo aplicado
                </span>
              </div>

              <p className="mb-6 font-mono text-xs uppercase tracking-[0.34em] text-muted-foreground">
                6 meses para ampliar arquitetura, design e engenharia de ML em Visão Computacional
              </p>

              <h2 className="max-w-4xl font-display text-5xl leading-[0.96] text-balance text-foreground sm:text-6xl lg:text-7xl">
                Um plano técnico que sai do notebook e vira <span className="text-[color:var(--accent-1)]">sistema</span>.
              </h2>

              <p className="mt-8 max-w-2xl font-serif text-lg leading-8 text-[color:var(--foreground-soft)] sm:text-xl">
                Este site transforma o plano de estudos da Emily em uma jornada navegável: fases, entregáveis, ritmo semanal,
                benchmarks e um acompanhamento de progresso que pode ser usado no dia a dia de trabalho.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#progresso" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent-1)] bg-[color:var(--accent-1)] px-6 py-3 text-sm font-medium text-[color:var(--background)] transition-transform duration-300 hover:-translate-y-0.5">
                  Acompanhar progresso
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#trilha" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[rgba(255,255,255,0.02)] px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[rgba(255,255,255,0.05)]">
                  Explorar trilha
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="grid gap-4 lg:justify-self-end"
            >
              <div className="glass-panel max-w-md p-6">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[color:var(--accent-3)]">
                  Diagnóstico resumido
                </p>
                <p className="mt-4 font-serif text-lg leading-8 text-[color:var(--foreground-soft)]">
                  Python intermediário, boa base matemática, uso real de OpenCV, PyTorch, CUDA e TensorRT, com foco em elevar repertório de arquitetura e engenharia aplicadas ao trabalho.
                </p>
              </div>

              <div className="glass-panel grid gap-4 p-6">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[color:var(--accent-3)]">
                    Leitura rápida
                  </p>
                  <Route className="h-4 w-4 text-[color:var(--accent-2)]" />
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {metrics.map((item) => (
                    <div key={item.label} className="rounded-[1.4rem] border border-white/8 bg-[rgba(255,255,255,0.02)] p-4">
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-3 text-lg font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>
        </section>

        <section className="border-b border-white/8 py-18 lg:py-24">
          <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="section-intro">
              <p className="section-kicker">Visão geral</p>
              <h3 className="section-title">A trilha foi desenhada para aprofundar julgamento técnico.</h3>
              <p className="section-copy">
                A lógica do percurso não é acumular ferramentas, mas melhorar a qualidade das decisões: como medir melhor, comparar melhor, justificar melhor e estruturar melhor um sistema de visão computacional.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                "Avançar de treino funcional para pipeline explicável e reprodutível.",
                "Transformar comparação de modelos em benchmarking útil para o trabalho.",
                "Estudar detecção e segmentação sem perder rigor em métricas e visualização.",
                "Usar interpretabilidade para depuração, não como ornamento visual.",
                "Comparar CNNs e Vision Transformers com critérios de negócio e engenharia.",
                "Fechar a trilha com um blueprint de produção, e não apenas com um notebook final.",
              ].map((text, index) => (
                <motion.article
                  key={text}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="glass-panel p-5"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line)] bg-[rgba(198,239,224,0.05)] font-mono text-sm text-[color:var(--accent-2)]">
                    0{index + 1}
                  </div>
                  <p className="font-serif text-lg leading-7 text-[color:var(--foreground-soft)]">{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="trilha" className="border-b border-white/8 py-18 lg:py-24">
          <div className="container grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="section-intro xl:sticky xl:top-28 xl:self-start">
              <p className="section-kicker">Roadmap principal</p>
              <h3 className="section-title">Seis fases para transformar conhecimento em capacidade de sistema.</h3>
              <p className="section-copy">
                O percurso mantém uma ordem pedagógica clara: primeiro consolidar análise e treino; depois ampliar para problemas mais ricos; por fim, fechar o ciclo com arquitetura, deploy e documentação.
              </p>
              <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10">
                <img src={ROADMAP_IMAGE} alt="Visual abstrato da trilha de 24 semanas" className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="grid gap-5">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                return (
                  <motion.article
                    key={phase.id}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.22 }}
                    transition={{ duration: 0.55, delay: index * 0.06 }}
                    className="phase-card"
                  >
                    <div className="phase-rail" />
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-2xl">
                        <div className="mb-5 flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--line)] bg-[rgba(255,255,255,0.03)] text-[color:var(--accent-1)] shadow-[0_0_36px_rgba(255,158,127,0.08)]">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[color:var(--accent-3)]">
                              Fase {phase.id} · semanas {phase.weeks}
                            </p>
                            <h4 className="mt-2 font-display text-2xl text-foreground">{phase.title}</h4>
                          </div>
                        </div>
                        <p className="font-serif text-lg leading-8 text-[color:var(--foreground-soft)]">{phase.focus}</p>
                      </div>

                      <div className="max-w-sm rounded-[1.6rem] border border-white/8 bg-[rgba(255,255,255,0.025)] p-5 lg:min-w-[18rem]">
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Entregável</p>
                        <p className="mt-3 text-base leading-7 text-[color:var(--foreground-soft)]">{phase.deliverable}</p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="ritmo" className="border-b border-white/8 py-18 lg:py-24">
          <div className="container grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="section-intro">
              <p className="section-kicker">Ritmo semanal</p>
              <h3 className="section-title">Uma hora por dia, com alternância entre teoria, código e revisão.</h3>
              <p className="section-copy">
                O plano evita depender de motivação perfeita. A proposta é construir consistência com sessões curtas, objetivos claros e entregas verificáveis.
              </p>
            </div>

            <div className="glass-panel overflow-hidden p-4 sm:p-6">
              <div className="grid gap-3">
                {weeklyRhythm.map((item, index) => (
                  <div key={item} className="weekly-row">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[rgba(198,239,224,0.04)] font-mono text-sm text-[color:var(--accent-2)]">
                      0{index + 1}
                    </div>
                    <p className="text-base leading-7 text-[color:var(--foreground-soft)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 py-18 lg:py-24">
          <div className="container grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-5">
              <div className="section-intro">
                <p className="section-kicker">Primeiro sprint</p>
                <h3 className="section-title">As oito primeiras semanas já estão traduzidas em ações concretas.</h3>
                <p className="section-copy">
                  Em vez de começar com uma lista dispersa de conteúdos, o site organiza o começo da jornada em blocos executáveis com meta e entregável.
                </p>
              </div>

              <div className="grid gap-4">
                {firstWeeks.map((item, index) => (
                  <motion.article
                    key={item.span}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.28 }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className="glass-panel p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[color:var(--accent-3)]">{item.span}</p>
                      <NotebookPen className="h-4 w-4 text-[color:var(--accent-1)]" />
                    </div>
                    <p className="mt-5 font-serif text-xl leading-8 text-foreground">{item.goal}</p>
                    <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-[rgba(255,255,255,0.02)] p-4">
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Entregável</p>
                      <p className="mt-2 text-base leading-7 text-[color:var(--foreground-soft)]">{item.output}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="glass-panel overflow-hidden p-3">
              <img src={ARCHITECTURE_IMAGE} alt="Ilustração abstrata de arquitetura de engenharia de ML" className="w-full rounded-[1.8rem] object-cover" />
              <div className="p-5 sm:p-6">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[color:var(--accent-3)]">Projeto sugerido</p>
                <h4 className="mt-4 font-display text-3xl text-foreground">Um repositório vivo orientado a arquitetura.</h4>
                <p className="mt-4 font-serif text-lg leading-8 text-[color:var(--foreground-soft)]">
                  O projeto principal evolui em camadas: classificação reproduzível, benchmark com fine-tuning, extensão para detecção ou segmentação, interpretabilidade, comparação entre CNN e ViT, e fechamento com blueprint de produção.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="progresso" className="border-b border-white/8 py-18 lg:py-24">
          <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="section-intro lg:sticky lg:top-28 lg:self-start">
              <p className="section-kicker">Acompanhamento</p>
              <h3 className="section-title">Use este painel para acompanhar a jornada no ritmo do trabalho.</h3>
              <p className="section-copy">
                O progresso fica salvo localmente no navegador. É um modo leve de transformar o plano em rotina real sem precisar de infraestrutura adicional.
              </p>

              <div className="glass-panel mt-8 overflow-hidden p-0">
                <img src={CHECKPOINT_IMAGE} alt="Plano de fundo visual de checkpoints e progresso" className="h-56 w-full object-cover opacity-80" />
                <div className="p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Conclusão</p>
                      <p className="mt-2 font-display text-5xl text-foreground">{completionRate}%</p>
                    </div>
                    <div className="rounded-full border border-[color:var(--line)] bg-[rgba(198,239,224,0.04)] px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[color:var(--accent-2)]">
                      {completedWeeks.length}/24 semanas
                    </div>
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-1),var(--accent-2))] transition-all duration-500" style={{ width: `${completionRate}%` }} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {nextWeek ? `Próxima semana sugerida: ${nextWeek}.` : "Todas as semanas foram marcadas como concluídas."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="glass-panel p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[color:var(--accent-3)]">Mapa semanal</p>
                    <h4 className="mt-2 font-display text-2xl text-foreground">Marque o que já foi consolidado.</h4>
                  </div>
                  <BookOpen className="h-5 w-5 text-[color:var(--accent-1)]" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 24 }, (_, index) => index + 1).map((week) => {
                    const active = completedWeeks.includes(week);
                    return (
                      <button
                        key={week}
                        type="button"
                        onClick={() => toggleWeek(week)}
                        className={`week-node ${active ? "week-node-active" : "week-node-idle"}`}
                        aria-pressed={active}
                      >
                        <span className="flex items-center gap-2">
                          {active ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          Semana {week}
                        </span>
                        <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] opacity-70">
                          {Math.ceil(week / 4)}º bloco
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[color:var(--accent-3)]">Notas de campo</p>
                    <h4 className="mt-2 font-display text-2xl text-foreground">Registre hipóteses, gargalos e decisões.</h4>
                  </div>
                  <Cpu className="h-5 w-5 text-[color:var(--accent-2)]" />
                </div>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Exemplo: backbone X melhorou recall, mas aumentou latência; revisar split do dataset e comparar com ViT pequeno."
                  className="mt-6 min-h-44 w-full rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-4 text-base leading-7 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[color:var(--accent-2)]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 py-18 lg:py-24">
          <div className="container grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="section-intro">
              <p className="section-kicker">Curadoria</p>
              <h3 className="section-title">Poucos materiais, escolhidos para evitar dispersão.</h3>
              <p className="section-copy">
                A curadoria privilegia fontes oficiais, fundamentos sólidos e leituras que ajudem a converter estudo em decisão técnica, sem paralisar por excesso de conteúdo.
              </p>
            </div>
            <div className="grid gap-4">
              {resources.map((resource) => (
                <article key={resource.title} className="glass-panel p-5">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[color:var(--accent-3)]">{resource.category}</p>
                  <h4 className="mt-3 font-display text-2xl text-foreground">{resource.title}</h4>
                  <p className="mt-3 text-base leading-7 text-[color:var(--foreground-soft)]">{resource.reason}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="arquitetura" className="py-18 lg:py-24">
          <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="section-intro">
              <p className="section-kicker">Checklist mensal</p>
              <h3 className="section-title">Fechar cada mês com perguntas certas acelera maturidade técnica.</h3>
              <p className="section-copy">
                O objetivo final não é apenas aprender mais modelos. É chegar ao ponto de defender tecnicamente uma solução de visão computacional como produto, com trade-offs claros e organização sustentável.
              </p>
            </div>

            <div className="grid gap-4">
              {reviews.map((item, index) => (
                <div key={item} className="review-row">
                  <div className="review-index">0{index + 1}</div>
                  <p className="text-base leading-7 text-[color:var(--foreground-soft)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
