CREATE TABLE `yombal_admin_attempts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`window_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `yombal_invoice_links` ADD `publication` text DEFAULT 'legacy' NOT NULL;