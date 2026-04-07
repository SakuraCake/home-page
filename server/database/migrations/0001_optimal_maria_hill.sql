CREATE TABLE `captcha_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`enabled` integer DEFAULT true,
	`provider` text DEFAULT 'geetest',
	`site_key` text,
	`secret_key` text,
	`login_enabled` integer DEFAULT true,
	`register_enabled` integer DEFAULT true,
	`comment_enabled` integer DEFAULT true,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_name` text DEFAULT 'My Blog',
	`site_description` text,
	`site_keywords` text,
	`site_url` text,
	`logo` text,
	`favicon` text,
	`footer_text` text,
	`icp` text,
	`analytics_code` text,
	`posts_per_page` integer DEFAULT 10,
	`allow_register` integer DEFAULT true,
	`allow_comment` integer DEFAULT true,
	`comment_need_review` integer DEFAULT false,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `comments` ADD `guest_name` text;--> statement-breakpoint
ALTER TABLE `comments` ADD `guest_email` text;--> statement-breakpoint
ALTER TABLE `comments` ADD `status` text DEFAULT 'approved';--> statement-breakpoint
CREATE INDEX `comments_article_idx` ON `comments` (`article_id`);--> statement-breakpoint
CREATE INDEX `comments_user_idx` ON `comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `comments_status_idx` ON `comments` (`status`);--> statement-breakpoint
CREATE INDEX `comments_parent_idx` ON `comments` (`parent_id`);--> statement-breakpoint
ALTER TABLE `comments` DROP COLUMN `nickname`;--> statement-breakpoint
CREATE INDEX `articles_status_idx` ON `articles` (`status`);--> statement-breakpoint
CREATE INDEX `articles_created_at_idx` ON `articles` (`created_at`);--> statement-breakpoint
CREATE INDEX `articles_author_idx` ON `articles` (`author_id`);--> statement-breakpoint
CREATE INDEX `articles_category_idx` ON `articles` (`category_id`);