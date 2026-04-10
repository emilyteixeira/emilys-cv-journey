CREATE TABLE `diaryEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`summary` text,
	`content` text NOT NULL,
	`coverImageUrl` text,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`tagsJson` text NOT NULL,
	`publishedAtUtc` bigint,
	`createdAtUtc` bigint NOT NULL,
	`updatedAtUtc` bigint NOT NULL,
	CONSTRAINT `diaryEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `diaryEntries_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`cadence` enum('daily','weekly') NOT NULL,
	`status` enum('todo','in_progress','done') NOT NULL DEFAULT 'todo',
	`targetDateUtc` bigint,
	`completedAtUtc` bigint,
	`createdAtUtc` bigint NOT NULL,
	`updatedAtUtc` bigint NOT NULL,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`summary` text NOT NULL,
	`stack` text,
	`repositoryUrl` text,
	`demoUrl` text,
	`coverImageUrl` text,
	`highlightsJson` text NOT NULL,
	`status` enum('planned','building','published') NOT NULL DEFAULT 'planned',
	`createdAtUtc` bigint NOT NULL,
	`updatedAtUtc` bigint NOT NULL,
	CONSTRAINT `portfolioProjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`url` text,
	`authorNote` text,
	`assetUrl` text,
	`createdAtUtc` bigint NOT NULL,
	`updatedAtUtc` bigint NOT NULL,
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmapProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`completedWeeksJson` text NOT NULL,
	`fieldNotes` text,
	`currentFocus` varchar(255),
	`updatedAtUtc` bigint NOT NULL,
	`createdAtUtc` bigint NOT NULL,
	CONSTRAINT `roadmapProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteProfile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`heroTitle` varchar(255) NOT NULL,
	`heroDescription` text NOT NULL,
	`emphasis` varchar(120),
	`updatedAtUtc` bigint NOT NULL,
	`createdAtUtc` bigint NOT NULL,
	CONSTRAINT `siteProfile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploadedAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`section` enum('roadmap','diary','goals','recommendations','portfolio','general') NOT NULL DEFAULT 'general',
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`fileKey` text NOT NULL,
	`url` text NOT NULL,
	`sizeBytes` int NOT NULL,
	`altText` varchar(255),
	`relatedEntityId` int,
	`createdAtUtc` bigint NOT NULL,
	CONSTRAINT `uploadedAssets_id` PRIMARY KEY(`id`)
);
