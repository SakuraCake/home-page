ALTER TABLE `articles` ADD `visibility` text DEFAULT 'public';--> statement-breakpoint
ALTER TABLE `articles` ADD `password` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `publish_at` integer;--> statement-breakpoint
CREATE INDEX `articles_visibility_idx` ON `articles` (`visibility`);--> statement-breakpoint
CREATE INDEX `articles_publish_at_idx` ON `articles` (`publish_at`);