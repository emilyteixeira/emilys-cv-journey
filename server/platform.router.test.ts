import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import {
  createPortfolioProjectRecord,
  createRecommendationRecord,
  createUploadedAssetRecord,
  getOwnerPlatformData,
  getPublicPlatformData,
  seedPlatformData,
  upsertRoadmapProgressRecord,
} from "./db";
import { storagePut } from "./storage";

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");

  return {
    ...actual,
    createPortfolioProjectRecord: vi.fn(),
    createRecommendationRecord: vi.fn(),
    createUploadedAssetRecord: vi.fn(),
    getPublicPlatformData: vi.fn(),
    getOwnerPlatformData: vi.fn(),
    seedPlatformData: vi.fn(),
    upsertRoadmapProgressRecord: vi.fn(),
  };
});

vi.mock("./storage", () => ({
  storagePut: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(authenticated = true): TrpcContext {
  const user: AuthenticatedUser = {
    id: 7,
    openId: "emily-open-id",
    email: "emily@example.com",
    name: "Emily",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: authenticated ? user : null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("platform router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns persisted public data for the landing page", async () => {
    const expectedPayload = {
      profile: {
        heroTitle: "Trilha de Visão Computacional da Emily",
      },
      roadmapProgress: null,
      diaryEntries: [],
      goals: [],
      recommendations: [],
      portfolioProjects: [],
    };

    vi.mocked(getPublicPlatformData).mockResolvedValue(expectedPayload as never);

    const caller = appRouter.createCaller(createContext(false));
    const result = await caller.platform.publicData();

    expect(getPublicPlatformData).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedPayload);
  });

  it("returns owner-scoped data for authenticated editing", async () => {
    const expectedPayload = {
      profile: { heroTitle: "Workspace autenticado" },
      roadmapProgress: null,
      diaryEntries: [],
      goals: [],
      recommendations: [],
      portfolioProjects: [],
    };

    vi.mocked(getOwnerPlatformData).mockResolvedValue(expectedPayload as never);

    const caller = appRouter.createCaller(createContext(true));
    const result = await caller.platform.ownerData();

    expect(getOwnerPlatformData).toHaveBeenCalledWith(7);
    expect(result).toEqual(expectedPayload);
  });

  it("seeds the platform for the authenticated owner", async () => {
    vi.mocked(seedPlatformData).mockResolvedValue({ ok: true } as never);

    const caller = appRouter.createCaller(createContext(true));
    const result = await caller.platform.bootstrap();

    expect(seedPlatformData).toHaveBeenCalledWith(7);
    expect(result).toEqual({ ok: true });
  });

  it("stores roadmap progress as sorted unique weeks", async () => {
    vi.mocked(upsertRoadmapProgressRecord).mockResolvedValue({ id: 1 } as never);

    const caller = appRouter.createCaller(createContext(true));

    await caller.platform.upsertRoadmapProgress({
      completedWeeks: [4, 2, 2, 1],
      fieldNotes: "Revisar métricas e debugging.",
      currentFocus: "Transfer learning",
    });

    expect(upsertRoadmapProgressRecord).toHaveBeenCalledTimes(1);
    expect(upsertRoadmapProgressRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        completedWeeksJson: JSON.stringify([1, 2, 4]),
        fieldNotes: "Revisar métricas e debugging.",
        currentFocus: "Transfer learning",
      }),
    );
  });

  it("creates recommendation with persisted attachment metadata when upload is provided", async () => {
    vi.mocked(storagePut).mockResolvedValue({
      key: "7/recommendations/1234-paper.png",
      url: "https://cdn.example.com/paper.png",
    });
    vi.mocked(createRecommendationRecord).mockResolvedValue({ id: 91 } as never);
    vi.mocked(createUploadedAssetRecord).mockResolvedValue({ id: 301 } as never);

    const caller = appRouter.createCaller(createContext(true));

    await caller.platform.createRecommendation({
      title: "Paper sobre ViTs eficientes",
      category: "Paper",
      description: "Resumo do material e de como ele ajuda a comparar arquiteturas.",
      url: "https://example.com/vit-paper",
      authorNote: "Usar este artigo para discutir custo computacional versus desempenho.",
      assetUrl: null,
      upload: {
        fileName: "paper figure.png",
        mimeType: "image/png",
        base64: "data:image/png;base64,ZmFrZQ==",
        sizeBytes: 2048,
        altText: "Figura com comparação entre CNN e ViT",
      },
    });

    expect(storagePut).toHaveBeenCalledTimes(1);
    expect(createRecommendationRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        assetUrl: "https://cdn.example.com/paper.png",
      }),
    );
    expect(createUploadedAssetRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        section: "recommendations",
        relatedEntityId: 91,
        url: "https://cdn.example.com/paper.png",
      }),
    );
  });

  it("creates portfolio project with persisted cover metadata when upload is provided", async () => {
    vi.mocked(storagePut).mockResolvedValue({
      key: "7/portfolio/5678-demo-cover.png",
      url: "https://cdn.example.com/demo-cover.png",
    });
    vi.mocked(createPortfolioProjectRecord).mockResolvedValue({ id: 77 } as never);
    vi.mocked(createUploadedAssetRecord).mockResolvedValue({ id: 302 } as never);

    const caller = appRouter.createCaller(createContext(true));

    await caller.platform.createPortfolioProject({
      title: "Detector de defeitos em linha de produção",
      subtitle: "Benchmark com YOLO e RT-DETR",
      summary: "Projeto aplicado com foco em latência, mAP e análise visual de erro.",
      stack: "PyTorch, OpenCV, FastAPI",
      repositoryUrl: "https://github.com/emily/project",
      demoUrl: "https://example.com/demo",
      coverImageUrl: null,
      highlights: ["benchmark", "latência", "erro visual"],
      status: "building",
      upload: {
        fileName: "demo cover.png",
        mimeType: "image/png",
        base64: "data:image/png;base64,ZmFrZQ==",
        sizeBytes: 4096,
        altText: "Tela com resultados do detector em imagens industriais",
      },
    });

    expect(storagePut).toHaveBeenCalledTimes(1);
    expect(createPortfolioProjectRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        coverImageUrl: "https://cdn.example.com/demo-cover.png",
        highlightsJson: JSON.stringify(["benchmark", "latência", "erro visual"]),
      }),
    );
    expect(createUploadedAssetRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        section: "portfolio",
        relatedEntityId: 77,
        url: "https://cdn.example.com/demo-cover.png",
      }),
    );
  });
});
