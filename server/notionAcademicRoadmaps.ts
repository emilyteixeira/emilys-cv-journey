type NotionFetchPayload = {
  title: string;
  url: string;
  text: string;
};

export type AcademicRoadmapSyncRecord = {
  notionPageId: string;
  title: string;
  institution: string | null;
  programType: string | null;
  formatLabel: string | null;
  durationText: string | null;
  workloadText: string | null;
  summary: string;
  curriculumText: string | null;
  audienceText: string | null;
  sourceUrl: string;
  tags: string[];
  status: "draft" | "published";
  sortOrder: number;
};

function cleanup(value: string) {
  return value
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/\*\*/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/[_`>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function extractPageId(url: string) {
  const match = url.match(/([a-f0-9]{32})/i);
  return match?.[1] ?? slugify(url).slice(0, 32);
}

function extractPropertiesBlock(text: string) {
  const match = text.match(/<properties>\s*([\s\S]*?)\s*<\/properties>/i);
  if (!match) return null;

  try {
    return JSON.parse(match[1]) as Record<string, string | number | boolean | null>;
  } catch {
    return null;
  }
}

function extractSection(content: string, sectionTitle: string) {
  const escaped = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`##\\s*\\*\\*${escaped}\\*\\*[\\r\\n]+([\\s\\S]*?)(?=\\n---\\n|\\n##\\s*\\*\\*|$)`, "i");
  const match = content.match(regex);
  return match ? cleanup(match[1]) : null;
}

function extractContentBlock(text: string) {
  const match = text.match(/<content>\s*([\s\S]*?)\s*<\/content>/i);
  return match ? match[1] : "";
}

function firstMeaningfulParagraph(text: string) {
  const paragraphs = text
    .split(/\n+/)
    .map(line => cleanup(line))
    .filter(line => line.length > 80 && !line.startsWith("- "));

  return paragraphs[0] ?? cleanup(text).slice(0, 500);
}

function inferProgramType(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("especialização")) return "Especialização";
  if (normalized.includes("pós-graduação") || normalized.includes("pos-graduacao")) return "Pós-graduação";
  if (normalized.includes("mba")) return "MBA";
  if (normalized.includes("mestrado")) return "Mestrado";
  return "Roadmap acadêmico";
}

function inferInstitution(payload: NotionFetchPayload) {
  const combined = `${payload.title}\n${payload.text}`;
  if (/puc-rio/i.test(combined) || /ccec\.puc-rio\.br/i.test(combined)) return "PUC-Rio";
  if (/usp/i.test(combined)) return "USP";
  if (/unicamp/i.test(combined)) return "UNICAMP";
  if (/ufpa/i.test(combined)) return "UFPA";
  return null;
}

function inferFormatLabel(content: string) {
  if (/online \(s[ií]ncrona\)/i.test(content)) return "Online síncrono com aulas ao vivo";
  if (/aulas online/i.test(content) || /oficinas pr[aá]ticas ao vivo/i.test(content)) return "Online com aulas ao vivo e oficinas práticas";
  if (/presencial/i.test(content)) return "Presencial";
  return null;
}

function collectTags(payload: NotionFetchPayload, programType: string | null) {
  const tags = new Set<string>(["notion", "roadmap-academico", "visao-computacional"]);
  const normalized = `${payload.title} ${payload.text}`.toLowerCase();

  if (programType) tags.add(programType.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"));
  if (/deep learning/i.test(normalized) || /aprendizado profundo/i.test(normalized)) tags.add("deep-learning");
  if (/vision transformers/i.test(normalized) || /vit/i.test(normalized)) tags.add("vision-transformers");
  if (/llm|multimodais|vlm/i.test(normalized)) tags.add("ia-moderna");
  if (/produ[cç][aã]o|deployment/i.test(normalized)) tags.add("ml-engineering");

  return Array.from(tags).slice(0, 12);
}

export function parseAcademicRoadmapFromNotion(payload: NotionFetchPayload, sortOrder = 0): AcademicRoadmapSyncRecord {
  const properties = extractPropertiesBlock(payload.text);
  const content = extractContentBlock(payload.text);
  const title = cleanup(payload.title);
  const programType = inferProgramType(title);
  const introduction = extractSection(content, "Introdução") ?? cleanup(content);
  const objective = extractSection(content, "Objetivo");
  const audience = extractSection(content, "Público-Alvo");
  const methodology = extractSection(content, "Metodologia");
  const disciplines = extractSection(content, "Disciplinas");
  const summaryBase = [firstMeaningfulParagraph(introduction), objective].filter(Boolean).join(" ");

  return {
    notionPageId: extractPageId(payload.url),
    title,
    institution: inferInstitution(payload),
    programType,
    formatLabel: inferFormatLabel(methodology ?? introduction),
    durationText: title.toLowerCase().includes("24 meses") ? "24 meses" : (introduction.match(/ao longo de\s+(\d+\s+meses)/i)?.[1] ?? null),
    workloadText: typeof properties?.["Carga estimada"] === "string" && cleanup(properties["Carga estimada"] as string)
      ? cleanup(properties["Carga estimada"] as string)
      : null,
    summary: cleanup(summaryBase || introduction).slice(0, 2200),
    curriculumText: disciplines ? cleanup(disciplines).slice(0, 14000) : null,
    audienceText: audience ? cleanup(audience).slice(0, 5800) : null,
    sourceUrl: payload.url,
    tags: collectTags(payload, programType),
    status: "published",
    sortOrder,
  };
}
