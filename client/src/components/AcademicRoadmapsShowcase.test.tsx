// @vitest-environment jsdom

import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AcademicRoadmapsShowcase from "./AcademicRoadmapsShowcase";

describe("AcademicRoadmapsShowcase", () => {
  it("renderiza cards com metadados e link de origem para roadmaps sincronizados do Notion", () => {
    render(
      <AcademicRoadmapsShowcase
        roadmaps={[
          {
            id: 1,
            title: "[Especialização] Visão Computacional: Interpretando o Mundo Através de Imagens - Computer Vision Master",
            institution: "PUC-Rio",
            programType: "Especialização",
            formatLabel: "Online síncrono com aulas ao vivo",
            durationText: "24 meses",
            workloadText: "360 horas",
            summary: "Programa voltado a aplicações reais de visão computacional, aprendizagem profunda e desenho de soluções para o mercado.",
            curriculumText: "Fundamentos de visão computacional, processamento digital de imagens, aprendizagem profunda e Vision Transformers.",
            audienceText: "Profissionais de exatas e pessoas interessadas em aplicar visão computacional.",
            sourceUrl: "https://www.notion.so/3411c6633ba9808db32dfd36f81a0289",
            tags: ["notion", "roadmap-academico", "visao-computacional"],
          },
        ]}
      />,
    );

    expect(screen.getByTestId("academic-roadmaps-showcase")).toBeInTheDocument();
    expect(screen.getByText("PUC-Rio")).toBeInTheDocument();
    expect(screen.getByText("Online síncrono com aulas ao vivo")).toBeInTheDocument();
    expect(screen.getByText("24 meses · 360 horas")).toBeInTheDocument();
    expect(screen.getByText(/fundamentos de visão computacional/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir roadmap sincronizado no notion/i })).toHaveAttribute(
      "href",
      "https://www.notion.so/3411c6633ba9808db32dfd36f81a0289",
    );
  });

  it("não renderiza vitrine quando a coleção está vazia", () => {
    const { container } = render(<AcademicRoadmapsShowcase roadmaps={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
