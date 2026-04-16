export type AcademicRoadmapRecord = {
  id: number;
  title: string;
  institution: string | null;
  programType: string | null;
  formatLabel: string | null;
  durationText: string | null;
  workloadText: string | null;
  summary: string;
  curriculumText: string | null;
  audienceText?: string | null;
  sourceUrl: string;
  tags: string[];
};

export type AcademicRoadmapCardView = {
  id: number;
  eyebrow: string;
  institutionLabel: string;
  title: string;
  summary: string;
  formatLabel: string;
  durationAndWorkload: string;
  curriculumExcerpt: string | null;
  visibleTags: string[];
  sourceUrl: string;
};

export function excerpt(value?: string | null, max = 180) {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
}

export function mapAcademicRoadmapToCardView(roadmap: AcademicRoadmapRecord): AcademicRoadmapCardView {
  return {
    id: roadmap.id,
    eyebrow: roadmap.programType ?? "Roadmap acadêmico",
    institutionLabel: roadmap.institution ?? "Origem sincronizada do Notion",
    title: roadmap.title,
    summary: excerpt(roadmap.summary, 260),
    formatLabel: roadmap.formatLabel ?? "A confirmar",
    durationAndWorkload:
      [roadmap.durationText, roadmap.workloadText].filter(Boolean).join(" · ") || "Snapshot importado do Notion",
    curriculumExcerpt: roadmap.curriculumText ? excerpt(roadmap.curriculumText, 320) : null,
    visibleTags: roadmap.tags.slice(0, 5),
    sourceUrl: roadmap.sourceUrl,
  };
}
