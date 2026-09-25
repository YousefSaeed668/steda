ALTER TABLE `AppSettings` ADD `quietHoursEnabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `AppSettings` ADD `quietHoursStartMinutes` integer DEFAULT 1320 NOT NULL;--> statement-breakpoint
ALTER TABLE `AppSettings` ADD `quietHoursEndMinutes` integer DEFAULT 420 NOT NULL;--> statement-breakpoint
ALTER TABLE `AppSettings` ADD `soundEnabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `AppSettings` ADD `hapticsEnabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `AppSettings` ADD `soundProfile` text DEFAULT 'SUBTLE_CHIME' NOT NULL;