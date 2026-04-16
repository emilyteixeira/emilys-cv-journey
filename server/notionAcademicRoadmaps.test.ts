import { describe, expect, it } from "vitest";
import { parseAcademicRoadmapFromNotion } from "./notionAcademicRoadmaps";

describe("parseAcademicRoadmapFromNotion", () => {
  it("extrai campos persistíveis a partir de uma página acadêmica do Notion", () => {
    const parsed = parseAcademicRoadmapFromNotion(
      {
        title: "[Especialização] Visão Computacional: Interpretando o Mundo Através de Imagens - Computer Vision Master",
        url: "https://www.notion.so/3411c6633ba9808db32dfd36f81a0289",
        text: `<properties>{"Carga estimada":"360 horas"}</properties>
<content>
## **Introdução**
Visão Computacional: Interpretando o Mundo através de Imagens é um curso de pós-graduação lato sensu, ao longo de 24 meses, com aulas e oficinas ao vivo, focado na aplicação de ferramentas modernas de visão computacional.
---
## **Objetivo**
O objetivo do curso é o desenvolvimento de conhecimentos e habilidades para a solução de problemas usando técnicas do estado da arte.
---
## **Público-Alvo**
O curso é destinado a profissionais, preferencialmente com formação na área de exatas.
---
## **Metodologia**
A metodologia de ensino é online (síncrona) com aulas e oficinas ao vivo.
---
## **Disciplinas**
Fundamentos de Visão Computacional, Processamento Digital de Imagens, Aprendizado Profundo e Vision Transformers.
</content>`,
      },
      3,
    );

    expect(parsed).toMatchObject({
      notionPageId: "3411c6633ba9808db32dfd36f81a0289",
      programType: "Especialização",
      formatLabel: "Online síncrono com aulas ao vivo",
      durationText: "24 meses",
      workloadText: "360 horas",
      sourceUrl: "https://www.notion.so/3411c6633ba9808db32dfd36f81a0289",
      sortOrder: 3,
      status: "published",
    });
    expect(parsed.summary).toContain("pós-graduação lato sensu");
    expect(parsed.curriculumText).toContain("Vision Transformers");
    expect(parsed.audienceText).toContain("profissionais");
    expect(parsed.tags).toContain("visao-computacional");
  });
});
