CREATE TABLE `yombal_billing_checkouts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`mode` text NOT NULL,
	`status` text NOT NULL,
	`active_slot` text,
	`provider_session_id` text,
	`provider_payment_id` text,
	`checkout_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`last_checked_at` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `yombal_billing_checkouts_active_slot_unique` ON `yombal_billing_checkouts` (`active_slot`);--> statement-breakpoint
CREATE UNIQUE INDEX `yombal_billing_checkouts_provider_session_id_unique` ON `yombal_billing_checkouts` (`provider_session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `yombal_billing_checkouts_provider_payment_id_unique` ON `yombal_billing_checkouts` (`provider_payment_id`);--> statement-breakpoint
CREATE INDEX `yombal_billing_user_status` ON `yombal_billing_checkouts` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `yombal_billing_payments` (
	`provider_payment_id` text PRIMARY KEY NOT NULL,
	`checkout_id` text NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`created_at` text NOT NULL,
	`applied` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `yombal_billing_payments_checkout_id_unique` ON `yombal_billing_payments` (`checkout_id`);--> statement-breakpoint
CREATE TABLE `yombal_payment_config` (
	`provider` text PRIMARY KEY NOT NULL,
	`api_key` text NOT NULL,
	`webhook_secret` text NOT NULL,
	`mode` text NOT NULL,
	`verified_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_webhook_at` text
);
