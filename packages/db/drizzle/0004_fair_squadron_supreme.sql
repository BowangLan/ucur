CREATE TABLE IF NOT EXISTS `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL DEFAULT '',
	`working_directory` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `projects` (`id`, `name`, `description`, `working_directory`, `created_at`, `updated_at`)
VALUES ('default-project', 'Default Project', 'Auto-created project for existing screens', NULL, CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER))
ON CONFLICT(`id`) DO NOTHING;
--> statement-breakpoint
CREATE TABLE `__new_saved_screens` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`notes` text NOT NULL DEFAULT '',
	`preview_url` text,
	`analysis` text,
	`analysis_status` text NOT NULL DEFAULT 'idle',
	`analysis_error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_saved_screens` (`id`, `project_id`, `name`, `notes`, `preview_url`, `analysis`, `analysis_status`, `analysis_error`, `created_at`, `updated_at`)
SELECT `id`, 'default-project', `name`, `notes`, `preview_url`, `analysis`, `analysis_status`, `analysis_error`, `created_at`, `updated_at`
FROM `saved_screens`;
--> statement-breakpoint
DROP TABLE `saved_screens`;
--> statement-breakpoint
ALTER TABLE `__new_saved_screens` RENAME TO `saved_screens`;
