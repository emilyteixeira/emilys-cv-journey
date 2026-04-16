import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema.ts";
import { getDb, upsertAcademicRoadmapRecord } from "../server/db.ts";
import { parseAcademicRoadmapFromNotion } from "../server/notionAcademicRoadmaps.ts";

const execFileAsync = promisify(execFile);
const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID;
const DEFAULT_DATABASE_ID = "81d79aa254ac4a6392bc5ccfb6d294b0";
const DEFAULT_VIEW_URL = "https://www.notion.so/81d79aa254ac4a6392bc5ccfb6d294b0?v=2e85edcd45864ea58a4c2a26112fb285";

if (!OWNER_OPEN_ID) {
  throw new Error("OWNER_OPEN_ID não está disponível no ambiente.");
}

async function callNotionTool(toolName, input) {
  const { stdout } = await execFileAsync("manus-mcp-cli", [
    "tool",
    "call",
    toolName,
    "--server",
    "notion",
    "--input",
    JSON.stringify(input),
  ]);

  const lines = stdout.trim().split("\n");
  const markerIndex = lines.findIndex(line => line.startsWith("Tool execution result:"));
  const jsonText = markerIndex >= 0 ? lines.slice(markerIndex + 1).join("\n").trim() : lines[lines.length - 1];
  return JSON.parse(jsonText);
}

function isAcademicRoadmapRow(row) {
  const title = String(row?.Título ?? row?.title ?? "");
  const category = String(row?.Categoria ?? "");
  const materialType = String(row?.["Tipo de material"] ?? "");

  return (
    /especializa[cç][aã]o|p[oó]s[- ]?gradua[cç][aã]o|mestrado|mba/i.test(title) ||
    (/roadmap/i.test(title) && /curso|especializa[cç][aã]o|p[oó]s/i.test(title)) ||
    (category === "Recurso" && materialType === "Curso" && /vis[aã]o computacional/i.test(title))
  );
}

async function main() {
  const db = await getDb();
  if (!db) {
    throw new Error("Banco de dados indisponível para sincronização.");
  }

  const ownerRows = await db.select().from(users).where(eq(users.openId, OWNER_OPEN_ID)).limit(1);
  const owner = ownerRows[0];
  if (!owner) {
    throw new Error("Usuária proprietária ainda não encontrada no banco. Faça login ao menos uma vez antes de sincronizar.");
  }

  const databaseId = process.argv[2] || DEFAULT_DATABASE_ID;
  const viewUrl = process.argv[3] || DEFAULT_VIEW_URL;

  const database = await callNotionTool("notion-fetch", { id: databaseId });
  const rowsResponse = await callNotionTool("notion-query-database-view", { view_url: viewUrl });
  const candidateRows = Array.isArray(rowsResponse.results) ? rowsResponse.results.filter(isAcademicRoadmapRow) : [];

  const synced = [];
  for (const [index, row] of candidateRows.entries()) {
    const pageUrl = row.url;
    if (!pageUrl) continue;

    const page = await callNotionTool("notion-fetch", { id: pageUrl });
    const parsed = parseAcademicRoadmapFromNotion(
      {
        title: page.title,
        url: page.url,
        text: page.text,
      },
      index,
    );

    const saved = await upsertAcademicRoadmapRecord({
      userId: owner.id,
      notionPageId: parsed.notionPageId,
      slug: `${parsed.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80)}-${parsed.notionPageId.slice(0, 8)}`,
      title: parsed.title,
      institution: parsed.institution,
      programType: parsed.programType,
      formatLabel: parsed.formatLabel,
      durationText: parsed.durationText,
      workloadText: parsed.workloadText,
      summary: parsed.summary,
      curriculumText: parsed.curriculumText,
      audienceText: parsed.audienceText,
      sourceUrl: parsed.sourceUrl,
      tagsJson: JSON.stringify(parsed.tags),
      status: parsed.status,
      sortOrder: parsed.sortOrder,
      createdAtUtc: Date.now(),
      updatedAtUtc: Date.now(),
    });

    synced.push({
      id: saved?.id ?? null,
      title: parsed.title,
      sourceUrl: parsed.sourceUrl,
      institution: parsed.institution,
      databaseTitle: database.title,
    });
  }

  console.log(JSON.stringify({
    databaseTitle: database.title,
    candidateCount: candidateRows.length,
    syncedCount: synced.length,
    synced,
  }, null, 2));
}

await main();
