CREATE TABLE `AppSettings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`theme` text DEFAULT 'SYSTEM' NOT NULL,
	`weekStartsOn` integer DEFAULT 1 NOT NULL,
	`notificationsEnabled` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Habit` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`color` text,
	`category` text,
	`frequency` text DEFAULT 'DAILY' NOT NULL,
	`timesPerWeek` integer,
	`targetValue` real,
	`targetUnit` text,
	`position` integer DEFAULT 0 NOT NULL,
	`archivedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `HabitEntry` (
	`id` text PRIMARY KEY NOT NULL,
	`habitId` text NOT NULL,
	`dateKey` text NOT NULL,
	`value` real DEFAULT 0 NOT NULL,
	`completedAt` integer,
	`note` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`habitId`) REFERENCES `Habit`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `HabitEntry_habitId_dateKey_key` ON `HabitEntry` (`habitId`,`dateKey`);--> statement-breakpoint
CREATE INDEX `HabitEntry_dateKey_idx` ON `HabitEntry` (`dateKey`);--> statement-breakpoint
CREATE TABLE `HabitReminder` (
	`id` text PRIMARY KEY NOT NULL,
	`habitId` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`timeMinutes` integer NOT NULL,
	`notificationId` text,
	FOREIGN KEY (`habitId`) REFERENCES `Habit`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `HabitScheduleDay` (
	`habitId` text NOT NULL,
	`weekday` integer NOT NULL,
	PRIMARY KEY(`habitId`, `weekday`),
	FOREIGN KEY (`habitId`) REFERENCES `Habit`(`id`) ON UPDATE no action ON DELETE cascade
);
