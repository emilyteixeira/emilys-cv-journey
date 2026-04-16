import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultCatalogPath = path.resolve(__dirname, "../research/notion_academic_roadmaps.json");
const catalogPath = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : defaultCatalogPath;

const rawCatalog = await readFile(catalogPath, "utf8");
const roadmapSnapshots = JSON.parse(rawCatalog);

if (!Array.isArray(roadmapSnapshots) || roadmapSnapshots.length === 0) {
  throw new Error(`Catálogo inválido ou vazio: ${catalogPath}`);
}

const now = Date.now();

const slugify = value =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

const synced = [];
for (const [index, item] of roadmapSnapshots.entries()) {
  const row = await upsertAcademicRoadmapRecord({
    userId: owner.id,
    notionPageId: item.notionPageId,
    slug: `${slugify(item.title)}-${String(item.notionPageId).slice(0, 8)}`,
    title: item.title,
    institution: item.institution ?? null,
    programType: item.programType ?? null,
    formatLabel: item.formatLabel ?? null,
    durationText: item.durationText ?? null,
    workloadText: item.workloadText ?? null,
    summary: item.summary,
    curriculumText: item.curriculumText ?? null,
    audienceText: item.audienceText ?? null,
    sourceUrl: item.sourceUrl,
    tagsJson: JSON.stringify(Array.isArray(item.tags) ? item.tags : []),
    status: item.status ?? "published",
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index,
    createdAtUtc: now,
    updatedAtUtc: now,
  });

  synced.push({
    id: row?.id ?? null,
    title: row?.title ?? item.title,
    sourceUrl: item.sourceUrl,
    catalogPath,
  });
}

console.log(JSON.stringify({ syncedCount: synced.length, synced }, null, 2));
