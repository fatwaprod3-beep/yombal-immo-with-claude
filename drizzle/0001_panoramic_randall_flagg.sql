CREATE TABLE `yombal_directories` (
	`user_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `yombal_invoice_links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`space_id` text NOT NULL,
	`lease_id` text NOT NULL,
	`period` text NOT NULL,
	`token` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `yombal_invoice_links_token_unique` ON `yombal_invoice_links` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `yombal_invoice_bill` ON `yombal_invoice_links` (`user_id`,`space_id`,`lease_id`,`period`);--> statement-breakpoint
CREATE TABLE `yombal_support_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`email` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL
);
