CREATE TABLE IF NOT EXISTS "yombal_workspaces" (
	"user_id" text PRIMARY KEY NOT NULL,
	"data" text NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_directories" (
	"user_id" text PRIMARY KEY NOT NULL,
	"data" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_invoice_links" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"space_id" text NOT NULL,
	"lease_id" text NOT NULL,
	"period" text NOT NULL,
	"token" text NOT NULL UNIQUE,
	"data" text NOT NULL,
	"created_at" text NOT NULL,
	"publication" text DEFAULT 'legacy' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "yombal_invoice_bill" ON "yombal_invoice_links" ("user_id","space_id","lease_id","period");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_support_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_subscriptions" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"status" text NOT NULL,
	"expires_at" text,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_subscription_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"amount" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_admin_attempts" (
	"user_id" text PRIMARY KEY NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"window_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_payment_config" (
	"provider" text PRIMARY KEY NOT NULL,
	"api_key" text NOT NULL,
	"webhook_secret" text NOT NULL,
	"mode" text NOT NULL,
	"verified_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"last_webhook_at" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_billing_checkouts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"mode" text NOT NULL,
	"status" text NOT NULL,
	"active_slot" text UNIQUE,
	"provider_session_id" text UNIQUE,
	"provider_payment_id" text UNIQUE,
	"checkout_url" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"expires_at" text NOT NULL,
	"last_checked_at" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yombal_billing_user_status" ON "yombal_billing_checkouts" ("user_id","status");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_billing_payments" (
	"provider_payment_id" text PRIMARY KEY NOT NULL,
	"checkout_id" text NOT NULL UNIQUE,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"created_at" text NOT NULL,
	"applied" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"password_salt" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
-- Les données passent uniquement par le serveur Yombal : on bloque l’accès direct via l’API publique Supabase.
ALTER TABLE "yombal_workspaces" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_directories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_invoice_links" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_support_requests" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_subscriptions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_subscription_requests" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_admin_attempts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_payment_config" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_billing_checkouts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_billing_payments" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "yombal_users" ENABLE ROW LEVEL SECURITY;
