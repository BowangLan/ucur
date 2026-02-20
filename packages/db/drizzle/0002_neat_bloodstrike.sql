CREATE TABLE `screens` (
	`id` text PRIMARY KEY NOT NULL,
	`image_mime_type` text NOT NULL,
	`image_sha256` text NOT NULL,
	`description` text NOT NULL,
	`model` text NOT NULL,
	`created_at` integer NOT NULL
);
