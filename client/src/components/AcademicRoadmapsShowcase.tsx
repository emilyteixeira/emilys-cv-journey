import React from "react";
import { ArrowRight } from "lucide-react";
import { mapAcademicRoadmapToCardView, type AcademicRoadmapRecord } from "@/lib/academicRoadmaps";

type AcademicRoadmapsShowcaseProps = {
  roadmaps: AcademicRoadmapRecord[];
};

export default function AcademicRoadmapsShowcase({ roadmaps }: AcademicRoadmapsShowcaseProps) {
  if (!roadmaps.length) return null;

  return (
    <div className="mb-8 grid gap-5 lg:grid-cols-2" data-testid="academic-roadmaps-showcase">
      {roadmaps.map(roadmap => {
        const card = mapAcademicRoadmapToCardView(roadmap);
        return (
          <article key={card.id} className="glass-panel overflow-hidden p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>{card.eyebrow}</span>
              <span>•</span>
              <span>{card.institutionLabel}</span>
            </div>
            <h4 className="mt-3 text-2xl font-semibold text-foreground">{card.title}</h4>
            <p className="mt-4 leading-7 text-[color:var(--foreground-soft)]">{card.summary}</p>
            <div className="mt-5 grid gap-3 text-sm text-[color:var(--foreground-soft)] sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Formato</p>
                <p className="mt-2 text-foreground">{card.formatLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Duração e carga</p>
                <p className="mt-2 text-foreground">{card.durationAndWorkload}</p>
              </div>
            </div>
            {card.curriculumExcerpt ? (
              <blockquote className="mt-5 border-l-2 border-[color:var(--accent-1)] pl-4 text-sm leading-7 text-muted-foreground">
                {card.curriculumExcerpt}
              </blockquote>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {card.visibleTags.map(tag => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <a href={card.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[color:var(--accent-1)] hover:underline">
                Abrir roadmap sincronizado no Notion
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
