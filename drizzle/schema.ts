import {
  bigint,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const roadmapProgress = mysqlTable("roadmapProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  completedWeeksJson: text("completedWeeksJson").notNull(),
  fieldNotes: text("fieldNotes"),
  currentFocus: varchar("currentFocus", { length: 255 }),
  updatedAtUtc: bigint("updatedAtUtc", { mode: "number" }).notNull(),
  createdAtUtc: bigint("createdAtUtc", { mode: "number" }).notNull(),
});

export const diaryEntries = mysqlTable("diaryEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary"),
  content: text("content").notNull(),
  coverImageUrl: text("coverImageUrl"),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  tagsJson: text("tagsJson").notNull(),
  publishedAtUtc: bigint("publishedAtUtc", { mode: "number" }),
  createdAtUtc: bigint("createdAtUtc", { mode: "number" }).notNull(),
  updatedAtUtc: bigint("updatedAtUtc", { mode: "number" }).notNull(),
});

export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  cadence: mysqlEnum("cadence", ["daily", "weekly"]).notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "done"]).default("todo").notNull(),
  targetDateUtc: bigint("targetDateUtc", { mode: "number" }),
  completedAtUtc: bigint("completedAtUtc", { mode: "number" }),
  createdAtUtc: bigint("createdAtUtc", { mode: "number" }).notNull(),
  updatedAtUtc: bigint("updatedAtUtc", { mode: "number" }).notNull(),
});

export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  description: text("description").notNull(),
  url: text("url"),
  authorNote: text("authorNote"),
  assetUrl: text("assetUrl"),
  createdAtUtc: bigint("createdAtUtc", { mode: "number" }).notNull(),
  updatedAtUtc: bigint("updatedAtUtc", { mode: "number" }).notNull(),
});

export const portfolioProjects = mysqlTable("portfolioProjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  summary: text("summary").notNull(),
  stack: text("stack"),
  repositoryUrl: text("repositoryUrl"),
  demoUrl: text("demoUrl"),
  coverImageUrl: text("coverImageUrl"),
  highlightsJson: text("highlightsJson").notNull(),
  status: mysqlEnum("status", ["planned", "building", "published"]).default("planned").notNull(),
  createdAtUtc: bigint("createdAtUtc", { mode: "number" }).notNull(),
  updatedAtUtc: bigint("updatedAtUtc", { mode: "number" }).notNull(),
});

export const uploadedAssets = mysqlTable("uploadedAssets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  section: mysqlEnum("section", ["roadmap", "diary", "goals", "recommendations", "portfolio", "general"]).default("general").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  fileKey: text("fileKey").notNull(),
  url: text("url").notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  altText: varchar("altText", { length: 255 }),
  relatedEntityId: int("relatedEntityId"),
  createdAtUtc: bigint("createdAtUtc", { mode: "number" }).notNull(),
});

export const siteProfile = mysqlTable("siteProfile", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  heroTitle: varchar("heroTitle", { length: 255 }).notNull(),
  heroDescription: text("heroDescription").notNull(),
  emphasis: varchar("emphasis", { length: 120 }),
  updatedAtUtc: bigint("updatedAtUtc", { mode: "number" }).notNull(),
  createdAtUtc: bigint("createdAtUtc", { mode: "number" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type RoadmapProgress = typeof roadmapProgress.$inferSelect;
export type InsertRoadmapProgress = typeof roadmapProgress.$inferInsert;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type InsertDiaryEntry = typeof diaryEntries.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;
export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type InsertPortfolioProject = typeof portfolioProjects.$inferInsert;
export type UploadedAsset = typeof uploadedAssets.$inferSelect;
export type InsertUploadedAsset = typeof uploadedAssets.$inferInsert;
export type SiteProfile = typeof siteProfile.$inferSelect;
export type InsertSiteProfile = typeof siteProfile.$inferInsert;
