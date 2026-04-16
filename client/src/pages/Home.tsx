import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import AcademicRoadmapsShowcase from "@/components/AcademicRoadmapsShowcase";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  Loader2,
  NotebookPen,
  Radar,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "roadmap", label: "Roadmap" },
  { id: "diario", label: "Diário" },
  { id: "metas", label: "Metas" },
  { id: "recomendacoes", label: "Recomendações" },
  { id: "portfolio", label: "Portfólio" },
] as const;

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

type UploadedFilePayload = {
  fileName: string;
  mimeType: string;
  base64: string;
  sizeBytes: number;
  altText: string | null;
};

type RecommendationFormState = {
  title: string;
  category: string;
  description: string;
  url: string;
  authorNote: string;
  assetAltText: string;
};

type PortfolioFormState = {
  title: string;
  subtitle: string;
  summary: string;
  stack: string;
  repositoryUrl: string;
  demoUrl: string;
  highlights: string;
  status: "planned" | "building" | "published";
  coverAltText: string;
};

const initialRecommendationForm: RecommendationFormState = {
  title: "",
  category: "",
  description: "",
  url: "",
  authorNote: "",
  assetAltText: "",
};

const initialPortfolioForm: PortfolioFormState = {
  title: "",
  subtitle: "",
  summary: "",
  stack: "",
  repositoryUrl: "",
  demoUrl: "",
  highlights: "",
  status: "building",
  coverAltText: "",
};

function formatDate(value?: number | null) {
  if (!value) return "Sem data registrada";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function excerpt(value?: string | null, max = 180) {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
}

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo selecionado."));
    reader.readAsDataURL(file);
  });
}

function buildHighlights(value: string) {
  return value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const publicData = trpc.platform.publicData.useQuery();
  const ownerData = trpc.platform.ownerData.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const bootstrapMutation = trpc.platform.bootstrap.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.platform.publicData.invalidate(), utils.platform.ownerData.invalidate()]);
    },
  });

  const saveProgressMutation = trpc.platform.upsertRoadmapProgress.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.platform.publicData.invalidate(), utils.platform.ownerData.invalidate()]);
    },
  });

  const createRecommendationMutation = trpc.platform.createRecommendation.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.platform.publicData.invalidate(), utils.platform.ownerData.invalidate()]);
      setRecommendationForm(initialRecommendationForm);
      setRecommendationFile(null);
      setRecommendationError("");
    },
  });

  const createPortfolioProjectMutation = trpc.platform.createPortfolioProject.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.platform.publicData.invalidate(), utils.platform.ownerData.invalidate()]);
      setPortfolioForm(initialPortfolioForm);
      setPortfolioFile(null);
      setPortfolioError("");
    },
  });

  const activeData = ownerData.data ?? publicData.data;
  const profile = activeData?.profile ?? null;
  const roadmapProgress = activeData?.roadmapProgress ?? null;
  const diaryEntries = activeData?.diaryEntries ?? [];
  const goals = activeData?.goals ?? [];
  const recommendations = activeData?.recommendations ?? [];
  const academicRoadmaps = activeData?.academicRoadmaps ?? [];
  const portfolioProjects = activeData?.portfolioProjects ?? [];
  const uploadedAssets = activeData?.uploadedAssets ?? [];

  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
  const [fieldNotes, setFieldNotes] = useState("");
  const [currentFocus, setCurrentFocus] = useState("");
  const [recommendationForm, setRecommendationForm] = useState<RecommendationFormState>(initialRecommendationForm);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioFormState>(initialPortfolioForm);
  const [recommendationFile, setRecommendationFile] = useState<File | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [recommendationError, setRecommendationError] = useState("");
  const [portfolioError, setPortfolioError] = useState("");

  useEffect(() => {
    setSelectedWeeks(roadmapProgress?.completedWeeks ?? []);
    setFieldNotes(roadmapProgress?.fieldNotes ?? "");
    setCurrentFocus(roadmapProgress?.currentFocus ?? "");
  }, [roadmapProgress?.completedWeeksJson, roadmapProgress?.fieldNotes, roadmapProgress?.currentFocus, roadmapProgress?.completedWeeks]);

  const completionRate = useMemo(() => Math.round((selectedWeeks.length / 24) * 100), [selectedWeeks]);

  const nextWeek = useMemo(() => {
    for (let week = 1; week <= 24; week += 1) {
      if (!selectedWeeks.includes(week)) return week;
    }
    return null;
  }, [selectedWeeks]);

  const recommendationAssetMap = useMemo(() => {
    return new Map(
      uploadedAssets
        .filter(asset => asset.section === "recommendations" && asset.relatedEntityId)
        .map(asset => [asset.relatedEntityId as number, asset]),
    );
  }, [uploadedAssets]);

  const portfolioAssetMap = useMemo(() => {
    return new Map(
      uploadedAssets
        .filter(asset => asset.section === "portfolio" && asset.relatedEntityId)
        .map(asset => [asset.relatedEntityId as number, asset]),
    );
  }, [uploadedAssets]);

  const isInitialLoading = publicData.isLoading || (isAuthenticated && ownerData.isLoading) || authLoading;
  const hasOwnerWorkspace = Boolean(
    ownerData.data?.profile || ownerData.data?.roadmapProgress || ownerData.data?.diaryEntries?.length,
  );

  const toggleWeek = (week: number) => {
    setSelectedWeeks(current =>
      current.includes(week)
        ? current.filter(value => value !== week)
        : [...current, week].sort((a, b) => a - b),
    );
  };

  const handleSaveProgress = async () => {
    await saveProgressMutation.mutateAsync({
      completedWeeks: selectedWeeks,
      fieldNotes: fieldNotes || null,
      currentFocus: currentFocus || null,
    });
  };

  const handleFileSelection = (
    event: ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void,
    setError: (message: string) => void,
  ) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setter(null);
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setter(null);
      setError("O arquivo precisa ter no máximo 10 MB.");
      event.target.value = "";
      return;
    }
    setError("");
    setter(file);
  };

  const buildUploadPayload = async (file: File | null, altText: string): Promise<UploadedFilePayload | null> => {
    if (!file) return null;
    const base64 = await fileToBase64(file);
    return {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      base64,
      sizeBytes: file.size,
      altText: altText.trim() || null,
    };
  };

  const handleRecommendationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecommendationError("");

    try {
      const upload = await buildUploadPayload(recommendationFile, recommendationForm.assetAltText);
      await createRecommendationMutation.mutateAsync({
        title: recommendationForm.title,
        category: recommendationForm.category,
        description: recommendationForm.description,
        url: recommendationForm.url.trim() || null,
        authorNote: recommendationForm.authorNote.trim() || null,
        assetUrl: null,
        upload,
      });
    } catch (error) {
      setRecommendationError(error instanceof Error ? error.message : "Não foi possível salvar a recomendação.");
    }
  };

  const handlePortfolioSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPortfolioError("");

    try {
      const upload = await buildUploadPayload(portfolioFile, portfolioForm.coverAltText);
      await createPortfolioProjectMutation.mutateAsync({
        title: portfolioForm.title,
        subtitle: portfolioForm.subtitle.trim() || null,
        summary: portfolioForm.summary,
        stack: portfolioForm.stack.trim() || null,
        repositoryUrl: portfolioForm.repositoryUrl.trim() || null,
        demoUrl: portfolioForm.demoUrl.trim() || null,
        coverImageUrl: null,
        highlights: buildHighlights(portfolioForm.highlights),
        status: portfolioForm.status,
        upload,
      });
    } catch (error) {
      setPortfolioError(error instanceof Error ? error.message : "Não foi possível salvar o projeto de portfólio.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(7,14,24,0.88)] backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-4 py-4">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-[color:var(--accent-3)]">
              Emily's Computer Vision Journey
            </p>
            <h1 className="font-display text-lg text-foreground">Plataforma editorial de Visão Computacional</h1>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_ITEMS.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="hidden text-right sm:block">
                <p className="text-sm text-foreground">{user?.name ?? "Emily"}</p>
                <p className="text-xs text-muted-foreground">Espaço autenticado para persistência e uploads</p>
              </div>
            ) : (
              <Button
                variant="outline"
                className="border-[color:var(--line)] text-foreground"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
              >
                Entrar para editar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-white/10">
          <div className="container grid gap-8 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/5 px-4 py-2">
                <Sparkles className="h-4 w-4 text-[color:var(--accent-1)]" />
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-[color:var(--accent-3)]">
                  Menubar superior + rolagem contínua + dados persistidos
                </span>
              </div>

              <div className="space-y-4">
                <p className="font-mono text-xs uppercase tracking-[0.32em] text-muted-foreground">
                  Arquitetura prática da jornada de estudo
                </p>
                <h2 className="max-w-4xl font-display text-5xl leading-[0.95] text-balance text-foreground sm:text-6xl">
                  Uma home contínua para estudar, registrar e transformar progresso em <span className="text-[color:var(--accent-1)]">portfólio vivo</span>.
                </h2>
                <p className="max-w-2xl font-serif text-lg leading-8 text-[color:var(--foreground-soft)]">
                  A página opera como base full-stack: as cinco seções da navegação estão conectadas a uma camada persistente capaz de armazenar progresso, anotações, metas, recomendações e projetos, inclusive com anexos enviados para armazenamento remoto e roadmaps acadêmicos sincronizados diretamente do Notion.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#roadmap"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent-1)] bg-[color:var(--accent-1)] px-6 py-3 text-sm font-medium text-[color:var(--background)] transition-transform hover:-translate-y-0.5"
                >
                  Explorar as seções
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#portfolio"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/5 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
                >
                  Ver produção aplicada
                </a>
              </div>
            </div>

            <aside className="grid gap-4">
              <div className="glass-panel p-6">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[color:var(--accent-3)]">
                  Estado da aplicação
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Seções</p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">5</p>
                    <p className="mt-2 text-sm text-[color:var(--foreground-soft)]">Roadmap, diário, metas, recomendações e portfólio.</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Persistência</p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">DB + S3</p>
                    <p className="mt-2 text-sm text-[color:var(--foreground-soft)]">Leitura, escrita e uploads vinculados às entidades da trilha.</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[color:var(--accent-3)]">
                  Perfil editorial
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-foreground">
                  {profile?.heroTitle ?? "Trilha de Visão Computacional da Emily"}
                </h3>
                <p className="mt-3 leading-7 text-[color:var(--foreground-soft)]">
                  {profile?.heroDescription ?? "Ao autenticar, você poderá inicializar os dados do seu espaço, salvar progresso, registrar materiais e anexar evidências à jornada."}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <Database className="h-4 w-4" />
                  {profile?.emphasis ?? "Base pronta para persistência e mídia"}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {isInitialLoading ? (
          <section className="container py-20">
            <div className="glass-panel flex items-center gap-3 p-6 text-[color:var(--foreground-soft)]">
              <Loader2 className="h-5 w-5 animate-spin text-[color:var(--accent-1)]" />
              Carregando a estrutura persistida da plataforma.
            </div>
          </section>
        ) : null}

        {!isInitialLoading && publicData.error ? (
          <section className="container py-12">
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
              Não foi possível carregar os dados persistidos da plataforma neste momento. Verifique a integração do backend e do banco antes de seguir para as próximas telas.
            </div>
          </section>
        ) : null}

        {isAuthenticated && !hasOwnerWorkspace ? (
          <section className="container py-12">
            <div className="glass-panel flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[color:var(--accent-3)]">
                  Inicialização do workspace
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-foreground">Preparar a base inicial da plataforma</h3>
                <p className="mt-3 max-w-2xl leading-7 text-[color:var(--foreground-soft)]">
                  Seu ambiente autenticado ainda não possui conteúdo semeado. Use a ação abaixo para criar o perfil inicial, o progresso da trilha e exemplos persistidos no banco.
                </p>
              </div>
              <Button
                onClick={() => bootstrapMutation.mutate()}
                disabled={bootstrapMutation.isPending}
                className="min-w-[220px]"
              >
                {bootstrapMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Inicializar dados persistidos
              </Button>
            </div>
          </section>
        ) : null}

        <section id="roadmap" className="border-t border-white/5 scroll-mt-28">
          <div className="container grid gap-8 py-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-3 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <Radar className="h-4 w-4 text-[color:var(--accent-1)]" />
                seção 1 · roadmap
              </div>
              <h3 className="text-4xl font-semibold text-foreground">Planejamento persistente da jornada</h3>
              <p className="leading-8 text-[color:var(--foreground-soft)]">
                Esta seção concentra o estado global da trilha: semanas concluídas, foco atual e observações de campo. Em vez de depender do navegador, o progresso agora pode ser salvo diretamente na camada de dados autenticada.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Conclusão</p>
                  <p className="mt-3 text-4xl font-semibold text-foreground">{completionRate}%</p>
                  <p className="mt-2 text-sm text-[color:var(--foreground-soft)]">{selectedWeeks.length} de 24 semanas registradas.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Próxima semana</p>
                  <p className="mt-3 text-4xl font-semibold text-foreground">{nextWeek ?? "✓"}</p>
                  <p className="mt-2 text-sm text-[color:var(--foreground-soft)]">{nextWeek ? `Próximo marco sugerido: semana ${nextWeek}.` : "Todas as semanas já foram marcadas."}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[color:var(--accent-3)]">Painel de progresso</p>
                  <p className="mt-3 leading-7 text-[color:var(--foreground-soft)]">
                    {roadmapProgress?.fieldNotes ?? "Nenhuma anotação persistida ainda. Após autenticar, você pode salvar notas e atualizar o foco atual da trilha."}
                  </p>
                </div>

                <div>
                  <p className="mb-3 text-sm uppercase tracking-[0.18em] text-muted-foreground">Semanas concluídas</p>
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                    {Array.from({ length: 24 }, (_, index) => index + 1).map(week => {
                      const selected = selectedWeeks.includes(week);
                      return (
                        <button
                          key={week}
                          type="button"
                          onClick={() => toggleWeek(week)}
                          disabled={!isAuthenticated}
                          className={`rounded-2xl border px-3 py-3 text-sm transition ${selected ? "border-[color:var(--accent-1)] bg-[color:var(--accent-1)]/20 text-foreground" : "border-white/10 bg-white/5 text-muted-foreground"} ${!isAuthenticated ? "cursor-not-allowed opacity-70" : "hover:border-[color:var(--accent-1)]/60 hover:text-foreground"}`}
                        >
                          {week}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Foco atual
                    <input
                      value={currentFocus}
                      onChange={event => setCurrentFocus(event.target.value)}
                      disabled={!isAuthenticated}
                      placeholder="Ex.: Fase 2 · Transfer learning e benchmarking"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none transition focus:border-[color:var(--accent-1)]"
                    />
                  </label>

                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Notas de campo
                    <textarea
                      value={fieldNotes}
                      onChange={event => setFieldNotes(event.target.value)}
                      disabled={!isAuthenticated}
                      rows={5}
                      placeholder="Registre aqui observações sobre experimentos, dificuldades, debugging e aprendizados aplicados."
                      className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none transition focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleSaveProgress} disabled={!isAuthenticated || saveProgressMutation.isPending}>
                    {saveProgressMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar progresso no banco
                  </Button>
                  {!isAuthenticated ? (
                    <p className="text-sm text-muted-foreground">Entre na conta para transformar este painel em uma área editável e persistente.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="diario" className="border-t border-white/5 scroll-mt-28">
          <div className="container py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-3 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <NotebookPen className="h-4 w-4 text-[color:var(--accent-1)]" />
                  seção 2 · diário
                </div>
                <h3 className="mt-4 text-4xl font-semibold text-foreground">Registro contínuo dos aprendizados</h3>
                <p className="mt-3 max-w-3xl leading-8 text-[color:var(--foreground-soft)]">
                  O diário conecta estudo, experimento e reflexão crítica. Cada entrada publicada nasce do backend persistido, o que facilita evoluir esta home para futuras páginas internas de edição, filtros e histórico detalhado.
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {diaryEntries.length ? (
                diaryEntries.map(entry => (
                  <article key={entry.id} className="glass-panel flex h-full flex-col p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{formatDate(entry.publishedAtUtc ?? entry.updatedAtUtc)}</p>
                    <h4 className="mt-3 text-2xl font-semibold text-foreground">{entry.title}</h4>
                    <p className="mt-3 leading-7 text-[color:var(--foreground-soft)]">{excerpt(entry.summary || entry.content, 190)}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(entry.tags ?? []).map(tag => (
                        <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="glass-panel p-6 text-[color:var(--foreground-soft)] lg:col-span-2 xl:col-span-3">
                  Ainda não há entradas publicadas no diário. A estrutura já está preparada para receber esse conteúdo via backend.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="metas" className="border-t border-white/5 scroll-mt-28">
          <div className="container py-16">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-3 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <Target className="h-4 w-4 text-[color:var(--accent-1)]" />
                seção 3 · metas
              </div>
              <h3 className="mt-4 text-4xl font-semibold text-foreground">Metas operacionais e checkpoints</h3>
              <p className="mt-3 max-w-3xl leading-8 text-[color:var(--foreground-soft)]">
                Aqui a interface começa a funcionar como sistema de gestão do aprendizado. As metas vindas do banco permitem organizar entregas diárias e semanais, além de preparar o terreno para filtros por status, calendário e automações futuras.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {goals.length ? (
                goals.map(goal => {
                  const done = goal.status === "done";
                  return (
                    <article key={goal.id} className="glass-panel p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{goal.cadence === "daily" ? "Meta diária" : "Meta semanal"}</p>
                          <h4 className="mt-3 text-2xl font-semibold text-foreground">{goal.title}</h4>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs ${done ? "bg-emerald-500/15 text-emerald-200" : goal.status === "in_progress" ? "bg-amber-500/15 text-amber-100" : "bg-white/10 text-muted-foreground"}`}>
                          {goal.status === "done" ? "Concluída" : goal.status === "in_progress" ? "Em andamento" : "A fazer"}
                        </span>
                      </div>
                      <p className="mt-4 leading-7 text-[color:var(--foreground-soft)]">{goal.description ?? "Meta sem descrição adicional no momento."}</p>
                      <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Prazo: {formatDate(goal.targetDateUtc)}</span>
                        {done ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : null}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="glass-panel p-6 text-[color:var(--foreground-soft)] lg:col-span-3">
                  Nenhuma meta persistida foi encontrada ainda. A estrutura do banco já suporta criação, atualização de status e acompanhamento de conclusão.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="recomendacoes" className="border-t border-white/5 scroll-mt-28">
          <div className="container py-16">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-3 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <BookOpen className="h-4 w-4 text-[color:var(--accent-1)]" />
                seção 4 · recomendações
              </div>
              <h3 className="mt-4 text-4xl font-semibold text-foreground">Biblioteca curada de estudo e implementação</h3>
              <p className="mt-3 max-w-3xl leading-8 text-[color:var(--foreground-soft)]">
                A área de recomendações recebe materiais didáticos, referências técnicas e recursos aplicados. Agora ela também aceita anexos persistidos, o que permite ligar PDFs, imagens e capturas diretamente ao registro salvo no backend.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-[color:var(--accent-1)]" />
                Sincronização acadêmica ao vivo disponível operacionalmente via Notion + MCP
              </div>
            </div>

            {isAuthenticated ? (
              <form onSubmit={handleRecommendationSubmit} className="glass-panel mb-8 grid gap-4 p-6 lg:grid-cols-2">
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Título
                    <input
                      required
                      value={recommendationForm.title}
                      onChange={event => setRecommendationForm(current => ({ ...current, title: event.target.value }))}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Categoria
                    <input
                      required
                      value={recommendationForm.category}
                      onChange={event => setRecommendationForm(current => ({ ...current, category: event.target.value }))}
                      placeholder="Ex.: Curso, Paper, Dataset"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    URL de referência
                    <input
                      type="url"
                      value={recommendationForm.url}
                      onChange={event => setRecommendationForm(current => ({ ...current, url: event.target.value }))}
                      placeholder="https://..."
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Arquivo de apoio (opcional)
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={event => handleFileSelection(event, setRecommendationFile, setRecommendationError)}
                      className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-muted-foreground"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Texto alternativo do anexo
                    <input
                      value={recommendationForm.assetAltText}
                      onChange={event => setRecommendationForm(current => ({ ...current, assetAltText: event.target.value }))}
                      placeholder="Descreva o arquivo para acessibilidade"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Descrição
                    <textarea
                      required
                      rows={5}
                      value={recommendationForm.description}
                      onChange={event => setRecommendationForm(current => ({ ...current, description: event.target.value }))}
                      className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Nota autoral
                    <textarea
                      rows={4}
                      value={recommendationForm.authorNote}
                      onChange={event => setRecommendationForm(current => ({ ...current, authorNote: event.target.value }))}
                      placeholder="Explique por que este material é útil para a sua trilha."
                      className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-[color:var(--foreground-soft)]">
                    <p className="font-medium text-foreground">Fluxo didático sugerido</p>
                    <p className="mt-2">Anexe materiais que realmente ajudem a revisar uma decisão arquitetural, um benchmark ou um experimento. Isso torna o registro mais útil como memória de estudo e evidência de implementação.</p>
                  </div>
                  {recommendationError ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {recommendationError}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" disabled={createRecommendationMutation.isPending}>
                      {createRecommendationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Salvar recomendação
                    </Button>
                    {recommendationFile ? <span className="text-sm text-muted-foreground">Arquivo selecionado: {recommendationFile.name}</span> : null}
                  </div>
                </div>
              </form>
            ) : null}

            <AcademicRoadmapsShowcase roadmaps={academicRoadmaps} />

            <div className="grid gap-5 lg:grid-cols-2">
              {recommendations.length ? (
                recommendations.map(item => {
                  const attachment = recommendationAssetMap.get(item.id);
                  const assetPreviewUrl = attachment?.url ?? item.assetUrl ?? null;
                  return (
                    <article key={item.id} className="glass-panel overflow-hidden p-6">
                      {assetPreviewUrl ? (
                        <div className="mb-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                          <img
                            src={assetPreviewUrl}
                            alt={attachment?.altText ?? item.title}
                            className="h-56 w-full object-cover"
                          />
                        </div>
                      ) : null}
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.category}</p>
                      <h4 className="mt-3 text-2xl font-semibold text-foreground">{item.title}</h4>
                      <p className="mt-4 leading-7 text-[color:var(--foreground-soft)]">{excerpt(item.description, 220)}</p>
                      {item.authorNote ? (
                        <blockquote className="mt-5 border-l-2 border-[color:var(--accent-1)] pl-4 text-sm leading-7 text-muted-foreground">
                          {item.authorNote}
                        </blockquote>
                      ) : null}
                      <div className="mt-5 flex flex-wrap gap-4 text-sm">
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[color:var(--accent-1)] hover:underline">
                            Abrir referência
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        ) : null}
                        {assetPreviewUrl ? (
                          <a href={assetPreviewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[color:var(--accent-1)] hover:underline">
                            Abrir anexo persistido
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="glass-panel p-6 text-[color:var(--foreground-soft)] lg:col-span-2">
                  Ainda não há recomendações registradas manualmente, mas a coleção já está integrada ao backend para receber novos materiais, anexos persistidos e roadmaps acadêmicos sincronizados diretamente do Notion.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="portfolio" className="border-y border-white/5 scroll-mt-28">
          <div className="container py-16">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-3 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <Database className="h-4 w-4 text-[color:var(--accent-1)]" />
                seção 5 · portfólio
              </div>
              <h3 className="mt-4 text-4xl font-semibold text-foreground">Tradução da aprendizagem em entregáveis</h3>
              <p className="mt-3 max-w-3xl leading-8 text-[color:var(--foreground-soft)]">
                O portfólio encerra a rolagem contínua mostrando como a trilha sai do estudo e vira projeto. Agora você pode criar cards autenticados com capa persistida, links e destaques que funcionam como evidências de execução.
              </p>
            </div>

            {isAuthenticated ? (
              <form onSubmit={handlePortfolioSubmit} className="glass-panel mb-8 grid gap-4 p-6 lg:grid-cols-2">
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Título do projeto
                    <input
                      required
                      value={portfolioForm.title}
                      onChange={event => setPortfolioForm(current => ({ ...current, title: event.target.value }))}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Subtítulo
                    <input
                      value={portfolioForm.subtitle}
                      onChange={event => setPortfolioForm(current => ({ ...current, subtitle: event.target.value }))}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Stack
                    <input
                      value={portfolioForm.stack}
                      onChange={event => setPortfolioForm(current => ({ ...current, stack: event.target.value }))}
                      placeholder="PyTorch, OpenCV, FastAPI, React"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Repositório
                    <input
                      type="url"
                      value={portfolioForm.repositoryUrl}
                      onChange={event => setPortfolioForm(current => ({ ...current, repositoryUrl: event.target.value }))}
                      placeholder="https://github.com/..."
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Demo
                    <input
                      type="url"
                      value={portfolioForm.demoUrl}
                      onChange={event => setPortfolioForm(current => ({ ...current, demoUrl: event.target.value }))}
                      placeholder="https://..."
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Capa ou evidência visual (opcional)
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={event => handleFileSelection(event, setPortfolioFile, setPortfolioError)}
                      className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-muted-foreground"
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Resumo
                    <textarea
                      required
                      rows={5}
                      value={portfolioForm.summary}
                      onChange={event => setPortfolioForm(current => ({ ...current, summary: event.target.value }))}
                      className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Destaques (um por linha)
                    <textarea
                      rows={4}
                      value={portfolioForm.highlights}
                      onChange={event => setPortfolioForm(current => ({ ...current, highlights: event.target.value }))}
                      placeholder="Benchmark com baseline\nAnálise de erro visual\nDeploy de demo"
                      className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Status
                    <select
                      value={portfolioForm.status}
                      onChange={event => setPortfolioForm(current => ({ ...current, status: event.target.value as PortfolioFormState["status"] }))}
                      className="rounded-2xl border border-white/10 bg-[color:rgb(11,18,28)] px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    >
                      <option value="planned">Planejado</option>
                      <option value="building">Em construção</option>
                      <option value="published">Publicado</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm text-[color:var(--foreground-soft)]">
                    Texto alternativo da capa
                    <input
                      value={portfolioForm.coverAltText}
                      onChange={event => setPortfolioForm(current => ({ ...current, coverAltText: event.target.value }))}
                      placeholder="Descreva a imagem ou o PDF anexado"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-foreground outline-none focus:border-[color:var(--accent-1)]"
                    />
                  </label>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-[color:var(--foreground-soft)]">
                    <p className="font-medium text-foreground">Dica de implementação</p>
                    <p className="mt-2">Use esta área para registrar projetos que nascem de estudos replicáveis. Um bom card de portfólio combina problema, escolha arquitetural, métrica, análise de erro e link para evidência ou código.</p>
                  </div>
                  {portfolioError ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {portfolioError}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" disabled={createPortfolioProjectMutation.isPending}>
                      {createPortfolioProjectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Salvar projeto
                    </Button>
                    {portfolioFile ? <span className="text-sm text-muted-foreground">Arquivo selecionado: {portfolioFile.name}</span> : null}
                  </div>
                </div>
              </form>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {portfolioProjects.length ? (
                portfolioProjects.map(project => {
                  const attachment = portfolioAssetMap.get(project.id);
                  const coverUrl = attachment?.url ?? project.coverImageUrl ?? null;
                  return (
                    <article key={project.id} className="glass-panel flex h-full flex-col overflow-hidden p-6">
                      {coverUrl ? (
                        <div className="mb-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                          <img src={coverUrl} alt={attachment?.altText ?? project.title} className="h-52 w-full object-cover" />
                        </div>
                      ) : null}
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{project.status}</p>
                      <h4 className="mt-3 text-2xl font-semibold text-foreground">{project.title}</h4>
                      {project.subtitle ? <p className="mt-2 text-sm text-muted-foreground">{project.subtitle}</p> : null}
                      <p className="mt-4 leading-7 text-[color:var(--foreground-soft)]">{excerpt(project.summary, 220)}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {(project.highlights ?? []).map(highlight => (
                          <span key={highlight} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                            {highlight}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3 text-sm">
                        {project.repositoryUrl ? (
                          <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="text-[color:var(--accent-1)] hover:underline">
                            Repositório
                          </a>
                        ) : null}
                        {project.demoUrl ? (
                          <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-[color:var(--accent-1)] hover:underline">
                            Demo
                          </a>
                        ) : null}
                        {coverUrl ? (
                          <a href={coverUrl} target="_blank" rel="noreferrer" className="text-[color:var(--accent-1)] hover:underline">
                            Evidência visual
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="glass-panel p-6 text-[color:var(--foreground-soft)] lg:col-span-2 xl:col-span-3">
                  Ainda não existem projetos persistidos no portfólio. A coleção já está pronta para receber cards com links, stack, destaques e anexos de evidência.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
