import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  academicRoadmaps,
  diaryEntries,
  goals,
  InsertAcademicRoadmap,
  InsertDiaryEntry,
  InsertGoal,
  InsertPortfolioProject,
  InsertRecommendation,
  InsertRoadmapProgress,
  InsertSiteProfile,
  InsertUploadedAsset,
  InsertUser,
  portfolioProjects,
  recommendations,
  roadmapProgress,
  siteProfile,
  uploadedAssets,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseJsonNumberArray(value: string | null | undefined): number[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter(item => typeof item === "number")
      : [];
  } catch {
    return [];
  }
}

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Banco de dados indisponível no ambiente atual.");
  }
  return db;
}

export async function getPublicPlatformData() {
  const db = await requireDb();

  const [profileRows, diaryRows, goalRows, recommendationRows, projectRows, progressRows, assetRows, academicRoadmapRows] =
    await Promise.all([
      db.select().from(siteProfile).orderBy(desc(siteProfile.updatedAtUtc)).limit(1),
      db.select().from(diaryEntries).where(eq(diaryEntries.status, "published")).orderBy(desc(diaryEntries.publishedAtUtc), desc(diaryEntries.updatedAtUtc)).limit(6),
      db.select().from(goals).orderBy(desc(goals.updatedAtUtc)).limit(8),
      db.select().from(recommendations).orderBy(desc(recommendations.updatedAtUtc)).limit(8),
      db.select().from(portfolioProjects).orderBy(desc(portfolioProjects.updatedAtUtc)).limit(6),
      db.select().from(roadmapProgress).orderBy(desc(roadmapProgress.updatedAtUtc)).limit(1),
      db.select().from(uploadedAssets).orderBy(desc(uploadedAssets.createdAtUtc)).limit(12),
      db.select().from(academicRoadmaps).where(eq(academicRoadmaps.status, "published")).orderBy(desc(academicRoadmaps.sortOrder), desc(academicRoadmaps.updatedAtUtc)).limit(12),
    ]);

  const profile = profileRows[0] ?? null;
  const progress = progressRows[0]
    ? {
        ...progressRows[0],
        completedWeeks: parseJsonNumberArray(progressRows[0].completedWeeksJson),
      }
    : null;

  return {
    profile,
    diaryEntries: diaryRows.map(entry => ({ ...entry, tags: parseJsonArray(entry.tagsJson) })),
    goals: goalRows,
    recommendations: recommendationRows,
    portfolioProjects: projectRows.map(project => ({
      ...project,
      highlights: parseJsonArray(project.highlightsJson),
    })),
    roadmapProgress: progress,
    uploadedAssets: assetRows,
    academicRoadmaps: academicRoadmapRows.map(roadmap => ({
      ...roadmap,
      tags: parseJsonArray(roadmap.tagsJson),
    })),
  };
}

export async function getOwnerPlatformData(userId: number) {
  const db = await requireDb();

  const [profileRows, diaryRows, goalRows, recommendationRows, projectRows, progressRows, assetRows, academicRoadmapRows] =
    await Promise.all([
      db.select().from(siteProfile).where(eq(siteProfile.userId, userId)).orderBy(desc(siteProfile.updatedAtUtc)).limit(1),
      db.select().from(diaryEntries).where(eq(diaryEntries.userId, userId)).orderBy(desc(diaryEntries.updatedAtUtc)),
      db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.updatedAtUtc)),
      db.select().from(recommendations).where(eq(recommendations.userId, userId)).orderBy(desc(recommendations.updatedAtUtc)),
      db.select().from(portfolioProjects).where(eq(portfolioProjects.userId, userId)).orderBy(desc(portfolioProjects.updatedAtUtc)),
      db.select().from(roadmapProgress).where(eq(roadmapProgress.userId, userId)).orderBy(desc(roadmapProgress.updatedAtUtc)).limit(1),
      db.select().from(uploadedAssets).where(eq(uploadedAssets.userId, userId)).orderBy(desc(uploadedAssets.createdAtUtc)),
      db.select().from(academicRoadmaps).where(eq(academicRoadmaps.userId, userId)).orderBy(desc(academicRoadmaps.sortOrder), desc(academicRoadmaps.updatedAtUtc)),
    ]);

  return {
    profile: profileRows[0] ?? null,
    diaryEntries: diaryRows.map(entry => ({ ...entry, tags: parseJsonArray(entry.tagsJson) })),
    goals: goalRows,
    recommendations: recommendationRows,
    portfolioProjects: projectRows.map(project => ({ ...project, highlights: parseJsonArray(project.highlightsJson) })),
    roadmapProgress: progressRows[0]
      ? {
          ...progressRows[0],
          completedWeeks: parseJsonNumberArray(progressRows[0].completedWeeksJson),
        }
      : null,
    uploadedAssets: assetRows,
    academicRoadmaps: academicRoadmapRows.map(roadmap => ({
      ...roadmap,
      tags: parseJsonArray(roadmap.tagsJson),
    })),
  };
}

export async function upsertSiteProfileRecord(input: InsertSiteProfile) {
  const db = await requireDb();
  const existing = await db.select().from(siteProfile).where(eq(siteProfile.userId, input.userId!)).limit(1);

  if (existing[0]) {
    await db
      .update(siteProfile)
      .set({
        heroTitle: input.heroTitle!,
        heroDescription: input.heroDescription!,
        emphasis: input.emphasis ?? null,
        updatedAtUtc: input.updatedAtUtc!,
      })
      .where(eq(siteProfile.id, existing[0].id));

    const rows = await db.select().from(siteProfile).where(eq(siteProfile.id, existing[0].id)).limit(1);
    return rows[0];
  }

  await db.insert(siteProfile).values(input);
  const rows = await db.select().from(siteProfile).where(eq(siteProfile.userId, input.userId!)).orderBy(desc(siteProfile.updatedAtUtc)).limit(1);
  return rows[0];
}

export async function upsertRoadmapProgressRecord(input: InsertRoadmapProgress) {
  const db = await requireDb();
  const existing = await db.select().from(roadmapProgress).where(eq(roadmapProgress.userId, input.userId!)).limit(1);

  if (existing[0]) {
    await db
      .update(roadmapProgress)
      .set({
        completedWeeksJson: input.completedWeeksJson!,
        fieldNotes: input.fieldNotes ?? null,
        currentFocus: input.currentFocus ?? null,
        updatedAtUtc: input.updatedAtUtc!,
      })
      .where(eq(roadmapProgress.id, existing[0].id));

    const rows = await db.select().from(roadmapProgress).where(eq(roadmapProgress.id, existing[0].id)).limit(1);
    return rows[0];
  }

  await db.insert(roadmapProgress).values(input);
  const rows = await db.select().from(roadmapProgress).where(eq(roadmapProgress.userId, input.userId!)).orderBy(desc(roadmapProgress.updatedAtUtc)).limit(1);
  return rows[0];
}

export async function createDiaryEntryRecord(input: InsertDiaryEntry) {
  const db = await requireDb();
  await db.insert(diaryEntries).values(input);
  const rows = await db.select().from(diaryEntries).where(eq(diaryEntries.slug, input.slug!)).limit(1);
  return rows[0];
}

export async function updateDiaryEntryRecord(userId: number, entryId: number, input: Partial<InsertDiaryEntry>) {
  const db = await requireDb();
  await db
    .update(diaryEntries)
    .set(input)
    .where(and(eq(diaryEntries.id, entryId), eq(diaryEntries.userId, userId)));

  const rows = await db
    .select()
    .from(diaryEntries)
    .where(and(eq(diaryEntries.id, entryId), eq(diaryEntries.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createGoalRecord(input: InsertGoal) {
  const db = await requireDb();
  await db.insert(goals).values(input);
  const rows = await db.select().from(goals).where(eq(goals.userId, input.userId!)).orderBy(desc(goals.createdAtUtc)).limit(1);
  return rows[0];
}

export async function updateGoalRecord(userId: number, goalId: number, input: Partial<InsertGoal>) {
  const db = await requireDb();
  await db.update(goals).set(input).where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  const rows = await db.select().from(goals).where(and(eq(goals.id, goalId), eq(goals.userId, userId))).limit(1);
  return rows[0] ?? null;
}

export async function createRecommendationRecord(input: InsertRecommendation) {
  const db = await requireDb();
  await db.insert(recommendations).values(input);
  const rows = await db.select().from(recommendations).where(eq(recommendations.userId, input.userId!)).orderBy(desc(recommendations.createdAtUtc)).limit(1);
  return rows[0];
}

export async function createPortfolioProjectRecord(input: InsertPortfolioProject) {
  const db = await requireDb();
  await db.insert(portfolioProjects).values(input);
  const rows = await db.select().from(portfolioProjects).where(eq(portfolioProjects.userId, input.userId!)).orderBy(desc(portfolioProjects.createdAtUtc)).limit(1);
  return rows[0];
}

export async function createUploadedAssetRecord(input: InsertUploadedAsset) {
  const db = await requireDb();
  await db.insert(uploadedAssets).values(input);
  const rows = await db.select().from(uploadedAssets).where(eq(uploadedAssets.userId, input.userId!)).orderBy(desc(uploadedAssets.createdAtUtc)).limit(1);
  return rows[0];
}

export async function upsertAcademicRoadmapRecord(input: InsertAcademicRoadmap) {
  const db = await requireDb();
  const existing = await db
    .select()
    .from(academicRoadmaps)
    .where(eq(academicRoadmaps.notionPageId, input.notionPageId!))
    .limit(1);

  if (existing[0]) {
    await db
      .update(academicRoadmaps)
      .set({
        userId: input.userId!,
        slug: input.slug!,
        title: input.title!,
        institution: input.institution ?? null,
        programType: input.programType ?? null,
        formatLabel: input.formatLabel ?? null,
        durationText: input.durationText ?? null,
        workloadText: input.workloadText ?? null,
        summary: input.summary!,
        curriculumText: input.curriculumText ?? null,
        audienceText: input.audienceText ?? null,
        sourceUrl: input.sourceUrl!,
        tagsJson: input.tagsJson!,
        status: input.status ?? "published",
        sortOrder: input.sortOrder ?? 0,
        updatedAtUtc: input.updatedAtUtc!,
      })
      .where(eq(academicRoadmaps.id, existing[0].id));

    const rows = await db.select().from(academicRoadmaps).where(eq(academicRoadmaps.id, existing[0].id)).limit(1);
    return rows[0];
  }

  await db.insert(academicRoadmaps).values(input);
  const rows = await db
    .select()
    .from(academicRoadmaps)
    .where(eq(academicRoadmaps.notionPageId, input.notionPageId!))
    .limit(1);
  return rows[0];
}

export async function seedPlatformData(userId: number) {
  const db = await requireDb();
  const now = Date.now();

  const [existingProfile] = await db.select().from(siteProfile).where(eq(siteProfile.userId, userId)).limit(1);
  if (existingProfile) {
    return getOwnerPlatformData(userId);
  }

  await db.insert(siteProfile).values({
    userId,
    heroTitle: "Trilha editorial de Visão Computacional",
    heroDescription:
      "Uma plataforma pessoal para registrar aprendizado aplicado em arquitetura, design e engenharia de ML com foco em visão computacional.",
    emphasis: "Modernismo diagramático",
    createdAtUtc: now,
    updatedAtUtc: now,
  });

  await db.insert(roadmapProgress).values({
    userId,
    completedWeeksJson: JSON.stringify([1, 2, 3, 4]),
    fieldNotes:
      "Pipeline base consolidado com foco em análise de erros, validação e leitura crítica das métricas.",
    currentFocus: "Fase 2 · Transfer learning e benchmarking",
    createdAtUtc: now,
    updatedAtUtc: now,
  });

  await db.insert(diaryEntries).values([
    {
      userId,
      title: "Fechando o primeiro ciclo de análise de erros",
      slug: `primeiro-ciclo-analise-erros-${now}`,
      summary: "Comparação entre falsos positivos recorrentes e impacto das transforms no conjunto de validação.",
      content:
        "Hoje consolidei a leitura das matrizes de confusão e organizei exemplos visuais dos erros mais frequentes. A principal lição foi perceber como pequenas mudanças no pré-processamento alteram recall e estabilidade.",
      status: "published",
      tagsJson: JSON.stringify(["classificação", "análise de erros", "pipeline"]),
      createdAtUtc: now - 86400000,
      updatedAtUtc: now - 86400000,
      publishedAtUtc: now - 86400000,
    },
    {
      userId,
      title: "Benchmarks que realmente ajudam a decidir",
      slug: `benchmarks-que-ajudam-${now}`,
      summary: "Reflexão sobre custo, latência e ganho real de fine-tuning no contexto profissional.",
      content:
        "Em vez de comparar apenas acurácia, comecei a registrar tempo de treino, consumo de memória e esforço de manutenção. Isso deixou a análise mais próxima de uma decisão de arquitetura.",
      status: "published",
      tagsJson: JSON.stringify(["benchmark", "transfer learning", "arquitetura"]),
      createdAtUtc: now - 3600000,
      updatedAtUtc: now - 3600000,
      publishedAtUtc: now - 3600000,
    },
  ]);

  await db.insert(goals).values([
    {
      userId,
      title: "Revisar métricas de detecção e IoU",
      description: "Fechar um resumo técnico curto com exemplos de erro de localização.",
      cadence: "weekly",
      status: "in_progress",
      targetDateUtc: now + 3 * 86400000,
      createdAtUtc: now,
      updatedAtUtc: now,
    },
    {
      userId,
      title: "Documentar uma hipótese por sessão de estudo",
      description: "Registrar em poucas linhas o que foi testado, o que falhou e o próximo passo.",
      cadence: "daily",
      status: "todo",
      targetDateUtc: now + 86400000,
      createdAtUtc: now,
      updatedAtUtc: now,
    },
  ]);

  await db.insert(recommendations).values([
    {
      userId,
      title: "CS231n + notas próprias de revisão",
      category: "Fundamentos",
      description: "Excelente para consolidar visão arquitetural das CNNs e revisar decisões de treino.",
      url: "https://cs231n.stanford.edu/",
      authorNote: "Use como base conceitual e transforme cada aula em um resumo aplicado ao seu contexto profissional.",
      createdAtUtc: now,
      updatedAtUtc: now,
    },
    {
      userId,
      title: "Full Stack Deep Learning",
      category: "Engenharia de ML",
      description: "Ajuda a ligar experimento, produto e operação com uma visão mais sistêmica.",
      url: "https://fullstackdeeplearning.com/",
      authorNote: "Ótimo para transformar estudo em decisões de sistema e não só em notebooks isolados.",
      createdAtUtc: now,
      updatedAtUtc: now,
    },
  ]);

  await db.insert(portfolioProjects).values([
    {
      userId,
      title: "Benchmark entre CNN e ViT para classificação industrial",
      subtitle: "Projeto orientado a decisão arquitetural",
      summary: "Comparação entre famílias de modelos com foco em latência, memória e estabilidade de inferência.",
      stack: "PyTorch, CUDA, TensorRT, Weights & Biases",
      repositoryUrl: "https://github.com/",
      demoUrl: "https://github.com/",
      highlightsJson: JSON.stringify([
        "Critério de escolha baseado em custo e desempenho",
        "Registro de erros visuais para auditoria",
        "Blueprint para evolução em produção",
      ]),
      status: "building",
      createdAtUtc: now,
      updatedAtUtc: now,
    },
  ]);

  return getOwnerPlatformData(userId);
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

