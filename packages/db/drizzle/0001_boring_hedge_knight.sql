ALTER TABLE `conversations` ADD `claude_session_id` text;--> statement-breakpoint
ALTER TABLE `settings` DROP COLUMN `api_key`;