CREATE TABLE IF NOT EXISTS "yombal_user_events" ("id" text PRIMARY KEY, "user_id" text NOT NULL, "kind" text NOT NULL, "detail" text, "created_at" text NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yombal_user_events_user" ON "yombal_user_events" ("user_id","kind","created_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_push_subscriptions" ("id" text PRIMARY KEY, "user_id" text NOT NULL, "endpoint" text NOT NULL UNIQUE, "p256dh" text NOT NULL, "auth" text NOT NULL, "user_agent" text, "created_at" text NOT NULL, "last_sent_at" text, "failures" integer NOT NULL DEFAULT 0);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yombal_push_user" ON "yombal_push_subscriptions" ("user_id");--> statement-breakpoint
ALTER TABLE "yombal_users" ADD COLUMN IF NOT EXISTS "tester" integer NOT NULL DEFAULT 0;
