ALTER TABLE "yombal_users" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "yombal_users" ADD COLUMN IF NOT EXISTS "last_seen_at" text;--> statement-breakpoint
ALTER TABLE "yombal_users" ADD COLUMN IF NOT EXISTS "last_login_at" text;--> statement-breakpoint
ALTER TABLE "yombal_users" ADD COLUMN IF NOT EXISTS "sessions_after" bigint NOT NULL DEFAULT 0;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_security_events" ("id" text PRIMARY KEY, "kind" text NOT NULL, "email" text, "user_id" text, "ip" text, "user_agent" text, "detail" text, "created_at" text NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yombal_security_created" ON "yombal_security_events" ("created_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_app_settings" ("key" text PRIMARY KEY, "value" text NOT NULL, "updated_at" text NOT NULL);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_ai_conversations" ("id" text PRIMARY KEY, "user_id" text NOT NULL, "title" text NOT NULL, "flagged" integer NOT NULL DEFAULT 0, "flag_reason" text, "message_count" integer NOT NULL DEFAULT 0, "created_at" text NOT NULL, "updated_at" text NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yombal_ai_conv_user" ON "yombal_ai_conversations" ("user_id","updated_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_ai_messages" ("id" text PRIMARY KEY, "conversation_id" text NOT NULL, "user_id" text NOT NULL, "role" text NOT NULL, "content" text NOT NULL, "flagged" integer NOT NULL DEFAULT 0, "created_at" text NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yombal_ai_msg_conv" ON "yombal_ai_messages" ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yombal_ai_msg_user" ON "yombal_ai_messages" ("user_id","created_at");
