ALTER TABLE `site_config` ADD `home_title` text;--> statement-breakpoint
ALTER TABLE `site_config` ADD `home_subtitle` text;--> statement-breakpoint
ALTER TABLE `site_config` ADD `home_avatar` text;--> statement-breakpoint
ALTER TABLE `site_config` ADD `home_description` text;--> statement-breakpoint
ALTER TABLE `site_config` ADD `home_show_articles` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `site_config` ADD `social_links` text;--> statement-breakpoint
ALTER TABLE `site_config` ADD `bangumi_username` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `website` text;--> statement-breakpoint
ALTER TABLE `users` ADD `github` text;--> statement-breakpoint
ALTER TABLE `users` ADD `twitter` text;--> statement-breakpoint
ALTER TABLE `users` ADD `weibo` text;