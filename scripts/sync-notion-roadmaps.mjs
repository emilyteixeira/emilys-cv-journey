import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema.ts";
import { getDb, upsertAcademicRoadmapRecord } from "../server/db.ts";

const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID;

if (!OWNER_OPEN_ID) {
  throw new Error("OWNER_OPEN_ID não está disponível no ambiente.");
}

const db = await getDb();

if (!db) {
  throw new Error("Banco de dados indisponível para sincronização.");
}

const ownerRows = await db.select().from(users).where(eq(users.openId, OWNER_OPEN_ID)).limit(1);
const owner = ownerRows[0];

if (!owner) {
  throw new Error("Usuária proprietária ainda não encontrada no banco. Faça login ao menos uma vez antes de sincronizar.");
}

const now = Date.now();

const roadmapSnapshots = [
  {
    notionPageId: "3411c6633ba9808db32dfd36f81a0289",
    title: "[Especialização] Visão Computacional: Interpretando o Mundo Através de Imagens - Computer Vision Master",
    institution: "PUC-Rio",
    programType: "Especialização",
    formatLabel: "Online com aulas ao vivo e oficinas práticas",
    durationText: "24 meses",
    workloadText: "360 horas",
    summary:
      "Programa de pós-graduação lato sensu voltado a profissionais que desejam estruturar soluções reais em visão computacional e inteligência artificial, conectando fundamentos, aplicações setoriais e desenho de sistemas para o mercado.",
    curriculumText:
      "Inclui fundamentos de visão computacional, processamento digital de imagens, extração de atributos, classificação, aprendizagem profunda, aplicações com Vision Transformers e módulos voltados a projetos e aplicações de mercado.",
    audienceText:
      "Indicado para profissionais, preferencialmente da área de exatas, que pretendem atuar técnica ou gerencialmente em contextos onde interpretação de imagens e vídeos seja estratégica para o negócio.",
    sourceUrl: "https://www.notion.so/3411c6633ba9808db32dfd36f81a0289",
    tags: ["pos-graduacao", "especializacao", "visao-computacional", "roadmap-academico", "notion"],
    status: "published",
    sortOrder: 100,
  },
];

const synced = [];
for (const item of roadmapSnapshots) {
  const row = await upsertAcademicRoadmapRecord({
    userId: owner.id,
    notionPageId: item.notionPageId,
    slug: `${item.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80)}-${item.notionPageId.slice(0, 8)}`,
    title: item.title,
    institution: item.institution,
    programType: item.programType,
    formatLabel: item.formatLabel,
    durationText: item.durationText,
    workloadText: item.workloadText,
    summary: item.summary,
    curriculumText: item.curriculumText,
    audienceText: item.audienceText,
    sourceUrl: item.sourceUrl,
    tagsJson: JSON.stringify(item.tags),
    status: item.status,
    sortOrder: item.sortOrder,
    createdAtUtc: now,
    updatedAtUtc: now,
  });

  synced.push({ id: row?.id ?? null, title: row?.title ?? item.title, sourceUrl: item.sourceUrl });
}

console.log(JSON.stringify({ syncedCount: synced.length, synced }, null, 2));
