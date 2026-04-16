import { describe, expect, it } from "vitest";
import { mapAcademicRoadmapToCardView } from "./academicRoadmaps";

describe("mapAcademicRoadmapToCardView", () => {
  it("normaliza o roadmap acadêmico para a apresentação usada na Home", () => {
    const card = mapAcademicRoadmapToCardView({
      id: 1,
      title: "Especialização em Visão Computacional",
      institution: "PUC-Rio",
      programType: "Especialização",
      formatLabel: "Online",
      durationText: "24 meses",
      workloadText: "360 horas",
      summary:
        "Programa voltado a aplicações reais de visão computacional, combinando fundamentos, deep learning e desenho de soluções para contextos profissionais complexos.",
      curriculumText:
        "Módulos com processamento digital de imagens, classificação, detecção, segmentação, transformers e aplicações setoriais.",
      audienceText: "Profissionais de exatas e tecnologia.",
      sourceUrl: "https://www.notion.so/roadmap",
      tags: ["pos-graduacao", "visao-computacional", "deep-learning", "python", "cv", "extra"],
    });

    expect(card).toMatchObject({
      id: 1,
      eyebrow: "Especialização",
      institutionLabel: "PUC-Rio",
      title: "Especialização em Visão Computacional",
      formatLabel: "Online",
      durationAndWorkload: "24 meses · 360 horas",
      sourceUrl: "https://www.notion.so/roadmap",
    });
    expect(card.visibleTags).toEqual([
      "pos-graduacao",
      "visao-computacional",
      "deep-learning",
      "python",
      "cv",
    ]);
    expect(card.summary.length).toBeGreaterThan(40);
    expect(card.curriculumExcerpt).toContain("processamento digital de imagens");
  });

  it("aplica valores de fallback quando o roadmap vem incompleto do catálogo sincronizado", () => {
    const card = mapAcademicRoadmapToCardView({
      id: 2,
      title: "Roadmap acadêmico sem metadados",
      institution: null,
      programType: null,
      formatLabel: null,
      durationText: null,
      workloadText: null,
      summary: "Resumo sucinto, porém suficiente para publicação.",
      curriculumText: null,
      audienceText: null,
      sourceUrl: "https://www.notion.so/roadmap-2",
      tags: [],
    });

    expect(card.eyebrow).toBe("Roadmap acadêmico");
    expect(card.institutionLabel).toBe("Origem sincronizada do Notion");
    expect(card.formatLabel).toBe("A confirmar");
    expect(card.durationAndWorkload).toBe("Snapshot importado do Notion");
    expect(card.curriculumExcerpt).toBeNull();
    expect(card.visibleTags).toEqual([]);
  });
});
