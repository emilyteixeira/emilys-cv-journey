import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createDiaryEntryRecord,
  createGoalRecord,
  createPortfolioProjectRecord,
  createRecommendationRecord,
  createUploadedAssetRecord,
  getOwnerPlatformData,
  getPublicPlatformData,
  seedPlatformData,
  updateDiaryEntryRecord,
  updateGoalRecord,
  upsertAcademicRoadmapRecord,
  upsertRoadmapProgressRecord,
  upsertSiteProfileRecord,
} from "./db";
import { storagePut } from "./storage";

const platformSectionEnum = z.enum(["roadmap", "diary", "goals", "recommendations", "portfolio", "general"]);

const academicRoadmapInputSchema = z.object({
  notionPageId: z.string().min(8).max(64),
  title: z.string().min(3).max(255),
  institution: z.string().max(255).optional().nullable(),
  programType: z.string().max(120).optional().nullable(),
  formatLabel: z.string().max(120).optional().nullable(),
  durationText: z.string().max(120).optional().nullable(),
  workloadText: z.string().max(120).optional().nullable(),
  summary: z.string().min(20),
  curriculumText: z.string().max(15000).optional().nullable(),
  audienceText: z.string().max(6000).optional().nullable(),
  sourceUrl: z.string().url(),
  tags: z.array(z.string().min(1).max(40)).max(12).default([]),
  status: z.enum(["draft", "published"]).default("published"),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

const uploadedFileInputSchema = z
  .object({
    fileName: z.string().min(1).max(255),
    mimeType: z.string().min(3).max(120),
    base64: z.string().min(20),
    sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
    altText: z.string().max(255).optional().nullable(),
  })
  .optional()
  .nullable();

function nowUtc() {
  return Date.now();
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

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function decodeBase64Payload(base64: string) {
  const cleaned = base64.includes(",") ? base64.split(",").pop() ?? "" : base64;
  return Buffer.from(cleaned, "base64");
}

const platformRouter = router({
  publicData: publicProcedure.query(async () => {
    return getPublicPlatformData();
  }),

  ownerData: protectedProcedure.query(async ({ ctx }) => {
    return getOwnerPlatformData(ctx.user.id);
  }),

  bootstrap: protectedProcedure.mutation(async ({ ctx }) => {
    return seedPlatformData(ctx.user.id);
  }),

  upsertSiteProfile: protectedProcedure
    .input(
      z.object({
        heroTitle: z.string().min(3).max(255),
        heroDescription: z.string().min(10),
        emphasis: z.string().max(120).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timestamp = nowUtc();
      return upsertSiteProfileRecord({
        userId: ctx.user.id,
        heroTitle: input.heroTitle,
        heroDescription: input.heroDescription,
        emphasis: input.emphasis ?? null,
        createdAtUtc: timestamp,
        updatedAtUtc: timestamp,
      });
    }),

  upsertRoadmapProgress: protectedProcedure
    .input(
      z.object({
        completedWeeks: z.array(z.number().int().min(1).max(24)).max(24),
        fieldNotes: z.string().max(10000).optional().nullable(),
        currentFocus: z.string().max(255).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timestamp = nowUtc();
      return upsertRoadmapProgressRecord({
        userId: ctx.user.id,
        completedWeeksJson: JSON.stringify(Array.from(new Set(input.completedWeeks)).sort((a, b) => a - b)),
        fieldNotes: input.fieldNotes ?? null,
        currentFocus: input.currentFocus ?? null,
        createdAtUtc: timestamp,
        updatedAtUtc: timestamp,
      });
    }),

  createDiaryEntry: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        summary: z.string().max(1000).optional().nullable(),
        content: z.string().min(10),
        coverImageUrl: z.string().url().optional().nullable(),
        status: z.enum(["draft", "published"]).default("draft"),
        tags: z.array(z.string().min(1).max(40)).max(8).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timestamp = nowUtc();
      const slug = `${slugify(input.title)}-${timestamp}`;
      return createDiaryEntryRecord({
        userId: ctx.user.id,
        title: input.title,
        slug,
        summary: input.summary ?? null,
        content: input.content,
        coverImageUrl: input.coverImageUrl ?? null,
        status: input.status,
        tagsJson: JSON.stringify(input.tags),
        createdAtUtc: timestamp,
        updatedAtUtc: timestamp,
        publishedAtUtc: input.status === "published" ? timestamp : null,
      });
    }),

  updateDiaryEntry: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        title: z.string().min(3).max(255).optional(),
        summary: z.string().max(1000).optional().nullable(),
        content: z.string().min(10).optional(),
        coverImageUrl: z.string().url().optional().nullable(),
        status: z.enum(["draft", "published"]).optional(),
        tags: z.array(z.string().min(1).max(40)).max(8).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timestamp = nowUtc();
      const nextTitle = input.title;
      return updateDiaryEntryRecord(ctx.user.id, input.id, {
        title: nextTitle,
        slug: nextTitle ? `${slugify(nextTitle)}-${input.id}` : undefined,
        summary: input.summary,
        content: input.content,
        coverImageUrl: input.coverImageUrl,
        status: input.status,
        tagsJson: input.tags ? JSON.stringify(input.tags) : undefined,
        updatedAtUtc: timestamp,
        publishedAtUtc: input.status === "published" ? timestamp : undefined,
      });
    }),

  createGoal: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        description: z.string().max(1000).optional().nullable(),
        cadence: z.enum(["daily", "weekly"]),
        status: z.enum(["todo", "in_progress", "done"]).default("todo"),
        targetDateUtc: z.number().int().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timestamp = nowUtc();
      return createGoalRecord({
        userId: ctx.user.id,
        title: input.title,
        description: input.description ?? null,
        cadence: input.cadence,
        status: input.status,
        targetDateUtc: input.targetDateUtc ?? null,
        completedAtUtc: input.status === "done" ? timestamp : null,
        createdAtUtc: timestamp,
        updatedAtUtc: timestamp,
      });
    }),

  updateGoalStatus: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["todo", "in_progress", "done"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timestamp = nowUtc();
      return updateGoalRecord(ctx.user.id, input.id, {
        status: input.status,
        updatedAtUtc: timestamp,
        completedAtUtc: input.status === "done" ? timestamp : null,
      });
    }),

  createRecommendation: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        category: z.string().min(2).max(120),
        description: z.string().min(10),
        url: z.string().url().optional().nullable(),
        authorNote: z.string().max(1000).optional().nullable(),
        assetUrl: z.string().url().optional().nullable(),
        upload: uploadedFileInputSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timestamp = nowUtc();

      let uploadedAsset:
        | {
            key: string;
            url: string;
            fileName: string;
            mimeType: string;
            sizeBytes: number;
            altText: string | null;
          }
        | null = null;

      if (input.upload) {
        const safeName = sanitizeFileName(input.upload.fileName);
        const storageKey = `${ctx.user.id}/recommendations/${timestamp}-${safeName}`;
        const uploaded = await storagePut(storageKey, decodeBase64Payload(input.upload.base64), input.upload.mimeType);

        uploadedAsset = {
          key: uploaded.key,
          url: uploaded.url,
          fileName: safeName,
          mimeType: input.upload.mimeType,
          sizeBytes: input.upload.sizeBytes,
          altText: input.upload.altText ?? null,
        };
      }

      const recommendation = await createRecommendationRecord({
        userId: ctx.user.id,
        title: input.title,
        category: input.category,
        description: input.description,
        url: input.url ?? null,
        authorNote: input.authorNote ?? null,
        assetUrl: uploadedAsset?.url ?? input.assetUrl ?? null,
        createdAtUtc: timestamp,
        updatedAtUtc: timestamp,
      });

      if (uploadedAsset) {
        await createUploadedAssetRecord({
          userId: ctx.user.id,
          section: "recommendations",
          fileName: uploadedAsset.fileName,
          mimeType: uploadedAsset.mimeType,
          fileKey: uploadedAsset.key,
          url: uploadedAsset.url,
          sizeBytes: uploadedAsset.sizeBytes,
          altText: uploadedAsset.altText,
          relatedEntityId: recommendation.id,
          createdAtUtc: timestamp,
        });
      }

      return recommendation;
    }),

  syncAcademicRoadmaps: protectedProcedure
    .input(
      z.object({
        items: z.array(academicRoadmapInputSchema).min(1).max(20),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timestamp = nowUtc();

      const syncedItems = await Promise.all(
        input.items.map((item, index) =>
          upsertAcademicRoadmapRecord({
            userId: ctx.user.id,
            notionPageId: item.notionPageId,
            slug: `${slugify(item.title)}-${item.notionPageId.slice(0, 8)}`,
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
            tagsJson: JSON.stringify(item.tags),
            status: item.status,
            sortOrder: item.sortOrder ?? index,
            createdAtUtc: timestamp,
            updatedAtUtc: timestamp,
          }),
        ),
      );

      return {
        syncedCount: syncedItems.length,
        items: syncedItems,
      };
    }),

  createPortfolioProject: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        subtitle: z.string().max(255).optional().nullable(),
        summary: z.string().min(10),
        stack: z.string().max(1000).optional().nullable(),
        repositoryUrl: z.string().url().optional().nullable(),
        demoUrl: z.string().url().optional().nullable(),
        coverImageUrl: z.string().url().optional().nullable(),
        highlights: z.array(z.string().min(3).max(160)).max(8).default([]),
        status: z.enum(["planned", "building", "published"]).default("planned"),
        upload: uploadedFileInputSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timestamp = nowUtc();

      let uploadedAsset:
        | {
            key: string;
            url: string;
            fileName: string;
            mimeType: string;
            sizeBytes: number;
            altText: string | null;
          }
        | null = null;

      if (input.upload) {
        const safeName = sanitizeFileName(input.upload.fileName);
        const storageKey = `${ctx.user.id}/portfolio/${timestamp}-${safeName}`;
        const uploaded = await storagePut(storageKey, decodeBase64Payload(input.upload.base64), input.upload.mimeType);

        uploadedAsset = {
          key: uploaded.key,
          url: uploaded.url,
          fileName: safeName,
          mimeType: input.upload.mimeType,
          sizeBytes: input.upload.sizeBytes,
          altText: input.upload.altText ?? null,
        };
      }

      const project = await createPortfolioProjectRecord({
        userId: ctx.user.id,
        title: input.title,
        subtitle: input.subtitle ?? null,
        summary: input.summary,
        stack: input.stack ?? null,
        repositoryUrl: input.repositoryUrl ?? null,
        demoUrl: input.demoUrl ?? null,
        coverImageUrl: uploadedAsset?.url ?? input.coverImageUrl ?? null,
        highlightsJson: JSON.stringify(input.highlights),
        status: input.status,
        createdAtUtc: timestamp,
        updatedAtUtc: timestamp,
      });

      if (uploadedAsset) {
        await createUploadedAssetRecord({
          userId: ctx.user.id,
          section: "portfolio",
          fileName: uploadedAsset.fileName,
          mimeType: uploadedAsset.mimeType,
          fileKey: uploadedAsset.key,
          url: uploadedAsset.url,
          sizeBytes: uploadedAsset.sizeBytes,
          altText: uploadedAsset.altText,
          relatedEntityId: project.id,
          createdAtUtc: timestamp,
        });
      }

      return project;
    }),
});

const uploadsRouter = router({
  uploadAsset: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(3).max(120),
        base64: z.string().min(20),
        sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
        section: platformSectionEnum.default("general"),
        altText: z.string().max(255).optional().nullable(),
        relatedEntityId: z.number().int().positive().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = decodeBase64Payload(input.base64);
      const timestamp = nowUtc();
      const safeName = sanitizeFileName(input.fileName);
      const storageKey = `${ctx.user.id}/${input.section}/${timestamp}-${safeName}`;
      const uploaded = await storagePut(storageKey, buffer, input.mimeType);

      return createUploadedAssetRecord({
        userId: ctx.user.id,
        section: input.section,
        fileName: safeName,
        mimeType: input.mimeType,
        fileKey: uploaded.key,
        url: uploaded.url,
        sizeBytes: input.sizeBytes,
        altText: input.altText ?? null,
        relatedEntityId: input.relatedEntityId ?? null,
        createdAtUtc: timestamp,
      });
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  platform: platformRouter,
  uploads: uploadsRouter,
});

export type AppRouter = typeof appRouter;
